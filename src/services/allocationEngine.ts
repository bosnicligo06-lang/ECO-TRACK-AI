import { 
  Truck, 
  Dustbin, 
  PickupTask, 
  WardComplaint,
  TruckId 
} from '../types';

export interface AllocationCandidateResult {
  eligible: boolean;
  selectedTruck: Truck | null;
  reason: string;
  expectedLoadKg: number;
  remainingCapacityAfterKg: number;
  warnings: string[];
}

export interface MultiBinRouteCandidate {
  routeZone: string;
  binIds: string[];
  totalEstimatedWeightKg: number;
  recommendedTruckId: TruckId;
  fitsCapacity: boolean;
  explanation: string;
}

export class ChennaiAllocationEngine {
  /**
   * Evaluates an individual bin for the best-fit Eco Auto, TRUCK-500, or TRUCK-1000
   * Enforces each vehicle's configured max payload.
   */
  public static evaluateAndAllocate(
    bin: Dustbin,
    fleet: Truck[],
    activeTasks: PickupTask[]
  ): AllocationCandidateResult {
    const estimatedLoad = bin.currentWeightKg || Math.round((bin.latestFillPercentage / 100) * bin.maxPhysicalCapacityKg);
    const safetyMarginMultiplier = 1.10; // 10% safety margin for uncompacted density variation
    const safeExpectedLoad = Math.round(estimatedLoad * safetyMarginMultiplier);

    return this.evaluateForLocationAndLoad(
      bin.id,
      bin.streetAddress,
      bin.zone,
      bin.latitude,
      bin.longitude,
      safeExpectedLoad,
      bin.binType,
      fleet,
      activeTasks
    );
  }

  /**
   * Evaluates citizen complaint for allocation to the available fleet.
   */
  public static evaluateComplaintAllocation(
    complaint: WardComplaint,
    fleet: Truck[],
    activeTasks: PickupTask[]
  ): AllocationCandidateResult {
    const rawLoad = complaint.quantityEstimateKg || 50;
    const safeExpectedLoad = Math.round(rawLoad * 1.05); // 5% margin for loose waste

    return this.evaluateForLocationAndLoad(
      complaint.id,
      complaint.streetAddress,
      complaint.zone,
      complaint.latitude || 13.0418,
      complaint.longitude || 80.2341,
      safeExpectedLoad,
      complaint.wasteCategory,
      fleet,
      activeTasks,
      true // isComplaint
    );
  }

  private static evaluateForLocationAndLoad(
    targetId: string,
    address: string,
    zone: string,
    latitude: number,
    longitude: number,
    safeExpectedLoad: number,
    wasteType: string | undefined,
    fleet: Truck[],
    activeTasks: PickupTask[],
    isComplaint: boolean = false
  ): AllocationCandidateResult {
    const warnings: string[] = [];
    const eligibleTrucks: { truck: Truck; remainingCap: number; score: number; scoreReason: string }[] = [];

    for (const truck of fleet) {
      // Exclude out-of-service, offline, or safety-restricted trucks
      if (truck.status === 'OUT_OF_SERVICE' || truck.status === 'MAINTENANCE' || truck.status === 'OFFLINE' || truck.safetyRestricted) {
        warnings.push(`${truck.id} (${truck.name}): Excluded due to status '${truck.status}' or safety interlock.`);
        continue;
      }

      // Calculate committed weight from active pending/assigned tasks for this truck
      const committedWeight = activeTasks
        .filter(t => t.assignedTruckId === truck.id && (t.status === 'ASSIGNED' || t.status === 'ACCEPTED' || t.status === 'DRIVER_ACCEPTED' || t.status === 'EN_ROUTE' || t.status === 'EN_ROUTE_PICKUP' || t.status === 'COLLECTING'))
        .reduce((sum, t) => sum + t.estimatedWeightKg, 0);

      const effectiveRemainingCap = truck.maxPayloadKg - (truck.verifiedCurrentPayloadKg + committedWeight);

      // HARD CONSTRAINT: Load must strictly not exceed remaining capacity
      if (effectiveRemainingCap < safeExpectedLoad) {
        warnings.push(`${truck.id} (${truck.name}): Excluded due to insufficient capacity (${effectiveRemainingCap} kg remaining vs ${safeExpectedLoad} kg required load).`);
        continue;
      }

      const isAuto = truck.vehicleType === 'AUTO_RICKSHAW' || truck.id.startsWith('AUTO-');
      if (isAuto && safeExpectedLoad > truck.maxPayloadKg) {
        warnings.push(`${truck.id} (${truck.name}): Excluded because required load (${safeExpectedLoad} kg) exceeds vehicle max rating (${truck.maxPayloadKg} kg).`);
        continue;
      }

      // Distance / Zone proximity heuristic
      let proximityScore = 30;
      if (truck.currentZone === zone) {
        proximityScore = 50; // Same Chennai operational zone
      } else {
        const distDeg = Math.hypot(truck.currentLatitude - latitude, truck.currentLongitude - longitude);
        if (distDeg < 0.04) proximityScore = 40; // ~4.5 km radius
      }

      // Prefer the smallest suitable auto first, then keep larger trucks free for heavier loads.
      let capacityFitScore = 30;
      if (isAuto && truck.maxPayloadKg <= 100) {
        if (safeExpectedLoad <= 85) {
          capacityFitScore = 60; // Highly optimal small vehicle utilization (Auto Rickshaw)
        } else if (safeExpectedLoad <= 100) {
          capacityFitScore = 45; // Fits within 100kg cap
        } else {
          continue;
        }
      } else if (isAuto && truck.maxPayloadKg <= 200) {
        if (safeExpectedLoad <= 200) {
          capacityFitScore = 55;
        } else {
          continue;
        }
      } else if (truck.id === 'TRUCK-500') {
        if (safeExpectedLoad <= 80) {
          capacityFitScore = 35; // Better to use Auto, but acceptable fallback
        } else if (safeExpectedLoad <= 250) {
          capacityFitScore = 50; // Optimal 500kg tipper utilization
        } else if (safeExpectedLoad <= 450) {
          capacityFitScore = 40;
        }
      } else if (truck.id === 'TRUCK-1000') {
        if (safeExpectedLoad > 250) {
          capacityFitScore = 55; // Optimal heavy vehicle allocation
        } else if (safeExpectedLoad <= 80) {
          capacityFitScore = 15; // Wasteful to use heavy compactor for <80kg load
        } else {
          capacityFitScore = 30;
        }
      }

      // Status availability bonus
      let statusBonus = truck.status === 'AVAILABLE' ? 25 : 10;

      // Autos are well suited to narrow-lane citizen requests.
      let agilityBonus = (isComplaint && isAuto) ? 15 : 0;

      const totalScore = proximityScore + capacityFitScore + statusBonus + agilityBonus;
      const scoreReason = `${truck.id}: Proximity in ${truck.currentZone} (${proximityScore}pts), Capacity match for ${safeExpectedLoad}kg (${capacityFitScore}pts), Status ${truck.status} (${statusBonus}pts)${agilityBonus ? ', Citizen Grievance Agility (+15pts)' : ''}.`;

      eligibleTrucks.push({
        truck,
        remainingCap: effectiveRemainingCap,
        score: totalScore,
        scoreReason
      });
    }

    if (eligibleTrucks.length === 0) {
      return {
        eligible: false,
        selectedTruck: null,
        reason: `Capacity Blocked: No vehicle in the fleet has sufficient safe remaining payload capacity for ${safeExpectedLoad} kg load. Retained as Pending Allocation.`,
        expectedLoadKg: safeExpectedLoad,
        remainingCapacityAfterKg: 0,
        warnings
      };
    }

    // Sort descending by calculated score
    eligibleTrucks.sort((a, b) => b.score - a.score);
    const chosen = eligibleTrucks[0];
    const postRemaining = chosen.remainingCap - safeExpectedLoad;

    return {
      eligible: true,
      selectedTruck: chosen.truck,
      reason: `Allocated to ${chosen.truck.id} (${chosen.truck.driverName}): ${chosen.scoreReason} Remaining safe payload after collection: ${postRemaining} kg of ${chosen.truck.maxPayloadKg} kg limit.`,
      expectedLoadKg: safeExpectedLoad,
      remainingCapacityAfterKg: postRemaining,
      warnings
    };
  }

  /**
   * Multi-bin candidate route evaluator for Chennai zones
   */
  public static evaluateMultiBinRoutes(
    bins: Dustbin[],
    fleet: Truck[]
  ): MultiBinRouteCandidate[] {
    const highBins = bins.filter(b => b.latestFillPercentage >= 75 && b.collectionStatus !== 'ASSIGNED' && b.collectionStatus !== 'COLLECTING');
    
    // Group by zone
    const zoneMap: Record<string, Dustbin[]> = {};
    highBins.forEach(b => {
      if (!zoneMap[b.zone]) zoneMap[b.zone] = [];
      zoneMap[b.zone].push(b);
    });

    const routeCandidates: MultiBinRouteCandidate[] = [];

    Object.entries(zoneMap).forEach(([zone, zoneBins]) => {
      const totalWeight = zoneBins.reduce((sum, b) => sum + (b.currentWeightKg || Math.round((b.latestFillPercentage / 100) * b.maxPhysicalCapacityKg)), 0);
      const safeTotalWeight = Math.round(totalWeight * 1.10);

      let recommendedTruckId: TruckId = 'TRUCK-1000';
      let fits = false;
      let explanation = '';

      if (safeTotalWeight <= 90) {
        recommendedTruckId = 'AUTO-100-1';
        fits = true;
        explanation = `Zone multi-bin cluster fits in 100kg Eco Auto (${safeTotalWeight} kg total load across ${zoneBins.length} bins in ${zone}).`;
      } else if (safeTotalWeight <= 180) {
        recommendedTruckId = 'AUTO-100-2';
        fits = true;
        explanation = `Zone multi-bin route fits in 200kg Eco Auto (${safeTotalWeight} kg total load across ${zoneBins.length} bins in ${zone}).`;
      } else if (safeTotalWeight <= 450) {
        recommendedTruckId = 'TRUCK-500';
        fits = true;
        explanation = `Zone multi-bin route fits in TRUCK-500 (${safeTotalWeight} kg total load across ${zoneBins.length} bins in ${zone}).`;
      } else if (safeTotalWeight <= 950) {
        recommendedTruckId = 'TRUCK-1000';
        fits = true;
        explanation = `Zone multi-bin route allocated to TRUCK-1000 (${safeTotalWeight} kg total load across ${zoneBins.length} bins in ${zone}; exceeds 500kg tipper limit).`;
      } else {
        recommendedTruckId = 'TRUCK-1000';
        fits = false;
        explanation = `Combined load (${safeTotalWeight} kg) exceeds single-trip maximum of 1,000 kg. Cluster must be partitioned into 2 sequential runs.`;
      }

      routeCandidates.push({
        routeZone: zone,
        binIds: zoneBins.map(b => b.id),
        totalEstimatedWeightKg: safeTotalWeight,
        recommendedTruckId,
        fitsCapacity: fits,
        explanation
      });
    });

    return routeCandidates;
  }
}
