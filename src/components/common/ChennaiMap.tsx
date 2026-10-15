import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { Dustbin, Truck, StreetCamera, WardComplaint } from '../../types';
import { 
  MapPin, 
  Truck as TruckIcon, 
  Camera, 
  AlertTriangle, 
  Navigation, 
  Grid,
  Layers,
  ZoomIn,
  RefreshCw,
  Info,
  AlertCircle
} from 'lucide-react';

interface ChennaiMapProps {
  bins: Dustbin[];
  trucks: Truck[];
  cameras?: StreetCamera[];
  complaints?: WardComplaint[];
  selectedBinId?: string;
  selectedComplaintId?: string;
  onSelectBin?: (binId: string) => void;
  onSelectComplaint?: (complaintId: string) => void;
  selectedZone?: string;
  activeRoute?: { points: [number, number][]; label?: string };
}

// Verified Chennai Metropolitan Operational Coordinates (Tamil Nadu, India)
export const CHENNAI_ZONE_CENTERS: Record<string, [number, number]> = {
  'T. Nagar': [13.0418, 80.2341],
  'Adyar': [13.0012, 80.2565],
  'Velachery': [12.9815, 80.2180],
  'Anna Nagar': [13.0850, 80.2101],
  'Mylapore': [13.0368, 80.2676],
  'Tambaram': [12.9249, 80.1000],
  'Perungudi': [12.9566, 80.2415],
  'Ambattur': [13.1143, 80.1548],
  'Guindy': [13.0067, 80.2025],
  'Sholinganallur': [12.8996, 80.2279],
};

const CHENNAI_CENTER: [number, number] = [13.0418, 80.2341];

export const ChennaiMap: React.FC<ChennaiMapProps> = ({
  bins,
  trucks,
  cameras = [],
  complaints = [],
  selectedBinId,
  selectedComplaintId,
  onSelectBin,
  onSelectComplaint,
  selectedZone,
  activeRoute
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  
  const [filterLayer, setFilterLayer] = useState<'ALL' | 'HIGH_FILL' | 'TRUCKS' | 'COMPLAINTS' | 'CAMERAS' | 'FAULTS'>('ALL');
  const [activeZone, setActiveZone] = useState<string>(selectedZone || 'ALL');
  const [viewMode, setViewMode] = useState<'MAP' | 'WARD_GRID'>('MAP');
  const [mapStatus, setMapStatus] = useState<'INITIALIZING' | 'READY' | 'ERROR'>('INITIALIZING');

  // Initialize Leaflet Map once when container is mounted in MAP mode
  useEffect(() => {
    if (viewMode !== 'MAP') return;
    const container = mapContainerRef.current;
    if (!container) return;

    // Safety: clear any stale Leaflet ID to prevent "Map container is already initialized" error
    if ((container as any)._leaflet_id) {
      delete (container as any)._leaflet_id;
    }

    let map = mapInstanceRef.current;
    if (!map) {
      try {
        map = L.map(container, {
          center: CHENNAI_CENTER,
          zoom: 12,
          minZoom: 10,
          maxZoom: 18,
          scrollWheelZoom: true,
          zoomControl: true,
        });

        // Use CartoDB Positron / OSM tiles for clear, high-contrast municipal GIS view
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors | EcoTrack AI GIS Portal',
        }).addTo(map);

        const markersGroup = L.layerGroup().addTo(map);
        markersLayerRef.current = markersGroup;
        mapInstanceRef.current = map;
        setMapStatus('READY');

        // Ensure proper dimensions after container render
        setTimeout(() => {
          if (map) map.invalidateSize();
        }, 150);
        setTimeout(() => {
          if (map) map.invalidateSize();
        }, 500);
      } catch (err) {
        console.error('Failed to initialize Leaflet map container:', err);
        setMapStatus('ERROR');
      }
    }

    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {
          // ignore cleanup errors
        }
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
        routeLayerRef.current = null;
      }
    };
  }, [viewMode]);

  // Handle marker plotting and dynamic updates without recreating the map
  useEffect(() => {
    if (viewMode !== 'MAP') return;
    const markersLayer = markersLayerRef.current;
    const map = mapInstanceRef.current;
    if (!markersLayer || !map) return;

    markersLayer.clearLayers();
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    // 0. Active Route Polyline if present
    if (activeRoute && activeRoute.points && activeRoute.points.length > 1) {
      const poly = L.polyline(activeRoute.points, {
        color: '#2563EB',
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.85
      }).addTo(map);
      routeLayerRef.current = poly;
    }

    // 1. Street Dustbins & Level/Smell/Weight Sensor Pins
    if (filterLayer !== 'TRUCKS' && filterLayer !== 'COMPLAINTS' && filterLayer !== 'CAMERAS') {
      bins.forEach(bin => {
        if (filterLayer === 'HIGH_FILL' && bin.latestFillPercentage < 75) return;
        if (filterLayer === 'FAULTS' && bin.equipmentHealth === 'NORMAL') return;
        if (activeZone !== 'ALL' && bin.zone !== activeZone) return;

        let pinBg = '#10B981'; // Green: Normal / Low
        if (bin.latestFillPercentage >= 90) pinBg = '#EF4444'; // Red: Critical
        else if (bin.latestFillPercentage >= 75) pinBg = '#F59E0B'; // Amber: Nearly Full
        else if (bin.latestFillPercentage >= 40) pinBg = '#3B82F6'; // Blue: Medium

        if (bin.equipmentHealth === 'FAULT' || bin.equipmentHealth === 'OFFLINE') {
          pinBg = '#8B5CF6'; // Purple: Malfunction alert
        }

        const isSelected = selectedBinId === bin.id;

        const binMarkerIcon = L.divIcon({
          className: 'custom-bin-pin',
          html: `
            <div style="background-color: ${pinBg}; width: ${isSelected ? '34px' : '28px'}; height: ${isSelected ? '34px' : '28px'}; border-radius: 50%; border: ${isSelected ? '3.5px solid #000' : '2.5px solid white'}; box-shadow: 0 4px 10px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: ${isSelected ? '11px' : '10px'}; transition: transform 0.2s;">
              ${bin.latestFillPercentage}%
            </div>
          `,
          iconSize: isSelected ? [34, 34] : [28, 28],
          iconAnchor: isSelected ? [17, 17] : [14, 14]
        });

        const marker = L.marker([bin.latitude, bin.longitude], { icon: binMarkerIcon });
        
        const popupHtml = `
          <div style="font-family: inherit; font-size: 12px; min-width: 220px; line-height: 1.4;">
            <div style="font-weight: 800; color: #0F172A; font-size: 13px;">${bin.id}</div>
            <div style="color: #64748B; font-size: 11px; margin-bottom: 6px;">${bin.streetAddress} (${bin.zone})</div>
            
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 6px; margin-bottom: 6px;">
              <div style="display: flex; justify-content: space-between; font-weight: bold; color: ${pinBg};">
                <span>Fill Level:</span> <span>${bin.latestFillPercentage}%</span>
              </div>
              <div style="display: flex; justify-content: space-between; color: #334155; font-size: 11px;">
                <span>Net Garbage Weight:</span> <span>${bin.currentWeightKg ?? 'N/A'} kg</span>
              </div>
              ${bin.smellIndexPpm ? `
                <div style="display: flex; justify-content: space-between; color: #334155; font-size: 11px;">
                  <span>Smell Sensor:</span> <span>${bin.smellIndexPpm} ppm</span>
                </div>
              ` : ''}
            </div>

            <div style="font-size: 11px; color: #475569; space-y: 2px;">
              <div>Priority: <strong style="color: ${(bin.pickupPriority === 'OVERFLOW_CRITICAL' || bin.pickupPriority === 'HIGH_URGENT') ? '#DC2626' : bin.pickupPriority === 'NEARLY_FULL' ? '#D97706' : '#2563EB'}">${bin.pickupPriority}</strong></div>
              <div>Equipment Health: <strong>${bin.equipmentHealth}</strong></div>
              <div>Assigned Truck: <strong>${bin.assignedTruckId || 'None (Unassigned)'}</strong></div>
              <div>Bin Type: <strong>${bin.binType || 'Standard Municipal'}</strong></div>
            </div>
          </div>
        `;

        marker.bindPopup(popupHtml);
        marker.on('click', () => {
          if (onSelectBin) onSelectBin(bin.id);
        });
        marker.addTo(markersLayer);
      });
    }

    // 2. Municipal Fleet Trucks (TRUCK-500, TRUCK-1000, Eco Auto 01 & 02)
    if (filterLayer !== 'CAMERAS' && filterLayer !== 'COMPLAINTS') {
      trucks.forEach(truck => {
        if (filterLayer === 'FAULTS' && !truck.safetyRestricted && truck.weightSensorHealth === 'HEALTHY') return;

        const isAuto = truck.maxPayloadKg <= 100 || truck.id.startsWith('AUTO');
        const isTruck500 = truck.id === 'TRUCK-500';
        const truckEmoji = isAuto ? '🛺' : isTruck500 ? '🚛' : '🚚';
        const truckBadgeColor = isAuto ? '#D97706' : isTruck500 ? '#059669' : '#2563EB';

        const truckMarkerIcon = L.divIcon({
          className: 'custom-truck-pin',
          html: `
            <div style="background-color: ${truckBadgeColor}; color: white; border: 2.5px solid white; border-radius: 8px; padding: 3px 8px; font-weight: 800; font-size: 11px; display: flex; align-items: center; gap: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.35); white-space: nowrap;">
              <span>${truckEmoji}</span>
              <span>${truck.name}</span>
              <span style="font-size: 9px; opacity: 0.9;">(${truck.maxPayloadKg}kg • ${truck.payloadPercentage}%)</span>
            </div>
          `,
          iconSize: [140, 28],
          iconAnchor: [70, 14]
        });

        const truckMarker = L.marker([truck.currentLatitude, truck.currentLongitude], { icon: truckMarkerIcon });
        
        const truckPopup = `
          <div style="font-family: inherit; font-size: 12px; min-width: 240px; line-height: 1.4;">
            <div style="font-weight: 800; color: #0F172A; font-size: 13px;">${truck.name} (${truck.registrationNumber})</div>
            <div style="color: #64748B; font-size: 11px; margin-bottom: 6px;">Driver: ${truck.driverName} (${truck.driverPhone})</div>
            
            <div style="background: #F1F5F9; border-radius: 8px; padding: 6px; margin-bottom: 6px;">
              <div style="display: flex; justify-content: space-between; font-weight: bold; color: #0F172A;">
                <span>Vehicle Type:</span> <span>${truck.vehicleType || (isAuto ? 'Waste Collection Auto' : 'Municipal Truck')}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-weight: bold; color: #0F172A;">
                <span>Max Payload Limit:</span> <span>${truck.maxPayloadKg} kg</span>
              </div>
              <div style="display: flex; justify-content: space-between; color: #0F172A;">
                <span>Verified Net Payload:</span> <span>${truck.verifiedCurrentPayloadKg} kg (${truck.payloadPercentage}%)</span>
              </div>
              <div style="display: flex; justify-content: space-between; color: #059669; font-weight: bold;">
                <span>Remaining Capacity:</span> <span>${truck.remainingCapacityKg} kg</span>
              </div>
            </div>

            <div style="font-size: 11px; color: #475569;">
              <div>Status: <strong>${truck.status}</strong></div>
              <div>Current Sector: <strong>${truck.currentZone}</strong></div>
              <div>GPS Tracking: <strong>${truck.isGpsOnline ? '🛰️ Live Telemetry Active' : 'Stale/Offline'}</strong></div>
              <div>Powertrain: <strong>${truck.fuelOrBattery}</strong></div>
            </div>
          </div>
        `;

        truckMarker.bindPopup(truckPopup);
        truckMarker.addTo(markersLayer);
      });
    }

    // 3. Citizen Complaints Pins (🚨 / ⚠️)
    if (filterLayer === 'ALL' || filterLayer === 'COMPLAINTS') {
      complaints.forEach(cmp => {
        if (!cmp.latitude || !cmp.longitude) return;
        if (activeZone !== 'ALL' && cmp.zone !== activeZone) return;

        const isSelected = selectedComplaintId === cmp.id;
        const isResolved = cmp.status === 'RESOLVED';
        const isAssigned = cmp.status === 'ASSIGNED' || cmp.status === 'IN_PROGRESS';
        
        let cmpColor = '#EF4444'; // Red for new / unassigned
        if (isResolved) cmpColor = '#10B981'; // Green resolved
        else if (isAssigned) cmpColor = '#3B82F6'; // Blue assigned

        const cmpMarkerIcon = L.divIcon({
          className: 'custom-complaint-pin',
          html: `
            <div style="background-color: ${cmpColor}; color: white; border: ${isSelected ? '3px solid #000' : '2px solid white'}; border-radius: 8px; padding: 3px 6px; font-weight: 800; font-size: 10px; display: flex; align-items: center; gap: 3px; box-shadow: 0 4px 10px rgba(0,0,0,0.35); white-space: nowrap;">
              <span>${isResolved ? '✅' : cmp.source === 'EMAIL' ? '✉️' : '📞'}</span>
              <span>${cmp.id}</span>
              <span>(${cmp.quantityEstimateKg || 50}kg)</span>
            </div>
          `,
          iconSize: [110, 26],
          iconAnchor: [55, 13]
        });

        const cmpMarker = L.marker([cmp.latitude, cmp.longitude], { icon: cmpMarkerIcon });
        
        const cmpPopup = `
          <div style="font-family: inherit; font-size: 12px; min-width: 220px; line-height: 1.4;">
            <div style="font-weight: 800; color: #0F172A; font-size: 13px;">${cmp.id} • ${cmp.citizenName}</div>
            <div style="color: #64748B; font-size: 11px; margin-bottom: 4px;">Source: <strong>${cmp.source}</strong> (${cmp.phone || cmp.senderEmail || 'Citizen'})</div>
            <div style="background: #FEF2F2; border: 1px solid #FEE2E2; border-radius: 6px; padding: 5px; margin-bottom: 6px;">
              <div style="font-weight: bold; color: #991B1B;">Waste: ${cmp.wasteCategory || 'Mixed Street Waste'} (~${cmp.quantityEstimateKg || 50} kg)</div>
              <div style="font-size: 11px; color: #7F1D1D;">Urgency: <strong>${cmp.urgency}</strong> • Status: <strong>${cmp.status}</strong></div>
            </div>
            <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">
              Address: <strong>${cmp.streetAddress}</strong> (${cmp.zone})
            </div>
            ${cmp.assignedTruckId ? `<div style="font-size: 11px; color: #2563EB; font-weight: bold;">Dispatched to: ${cmp.assignedTruckId}</div>` : ''}
          </div>
        `;

        cmpMarker.bindPopup(cmpPopup);
        cmpMarker.on('click', () => {
          if (onSelectComplaint) onSelectComplaint(cmp.id);
        });
        cmpMarker.addTo(markersLayer);
      });
    }

    // 4. Street-level Dustbin Cameras
    if (filterLayer === 'ALL' || filterLayer === 'CAMERAS' || filterLayer === 'FAULTS') {
      cameras.forEach(cam => {
        const isFaulty = cam.status !== 'ACTIVE';
        if (filterLayer === 'FAULTS' && !isFaulty) return;
        if (activeZone !== 'ALL' && cam.zone !== activeZone) return;

        const monitoredBin = bins.find(b => b.id === cam.binId);
        const camLat = monitoredBin ? monitoredBin.latitude + 0.0003 : 13.0418;
        const camLng = monitoredBin ? monitoredBin.longitude + 0.0003 : 80.2341;
        const camColor = isFaulty ? '#DC2626' : '#4F46E5';

        const camMarkerIcon = L.divIcon({
          className: 'custom-camera-pin',
          html: `
            <div style="background-color: ${camColor}; width: 26px; height: 26px; border-radius: 6px; border: 2px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 12px;">
              📷
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });

        const camMarker = L.marker([camLat, camLng], { icon: camMarkerIcon });

        const camPopup = `
          <div style="font-family: inherit; font-size: 12px; min-width: 200px;">
            <div style="font-weight: 800; color: #0F172A;">Camera: ${cam.id}</div>
            <div style="color: #64748B; font-size: 11px; margin-bottom: 4px;">Ward: ${cam.zone} (Monitors Bin ${cam.binId})</div>
            <div style="padding: 4px 6px; border-radius: 6px; background: ${isFaulty ? '#FEE2E2' : '#EEF2FF'}; color: ${isFaulty ? '#991B1B' : '#3730A3'}; font-weight: bold; font-size: 11px; margin-bottom: 4px;">
              Status: ${cam.status} ${isFaulty ? '(Fault Detected)' : '(Live Stream Active)'}
            </div>
            <div style="font-size: 10px; color: #64748B;">
              Location: ${cam.locationName}
            </div>
          </div>
        `;

        camMarker.bindPopup(camPopup);
        camMarker.addTo(markersLayer);
      });
    }

  }, [bins, trucks, cameras, complaints, activeRoute, filterLayer, activeZone, selectedBinId, selectedComplaintId, onSelectBin, onSelectComplaint, viewMode]);

  // Center Map on Selected Zone
  const handleJumpToZone = useCallback((zone: string) => {
    setActiveZone(zone);
    if (!mapInstanceRef.current) return;

    if (zone === 'ALL') {
      mapInstanceRef.current.setView(CHENNAI_CENTER, 12);
    } else if (CHENNAI_ZONE_CENTERS[zone]) {
      mapInstanceRef.current.setView(CHENNAI_ZONE_CENTERS[zone], 14);
    }
    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 100);
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Map Control Bar */}
      <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <Navigation className="w-4 h-4 text-emerald-600" /> Chennai Municipal GIS:
          </span>
          <select
            value={activeZone}
            onChange={(e) => handleJumpToZone(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-semibold text-slate-800 focus:outline-emerald-500 shadow-2xs text-xs"
          >
            <option value="ALL">Entire Chennai Metropolitan Area (10 Wards)</option>
            {Object.keys(CHENNAI_ZONE_CENTERS).map(z => (
              <option key={z} value={z}>{z} Operational Ward</option>
            ))}
          </select>
        </div>

        {/* Filter Layers & View Mode */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setFilterLayer('ALL')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${filterLayer === 'ALL' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              All Assets
            </button>
            <button
              onClick={() => setFilterLayer('HIGH_FILL')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${filterLayer === 'HIGH_FILL' ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              High Fill (≥75%)
            </button>
            <button
              onClick={() => setFilterLayer('TRUCKS')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${filterLayer === 'TRUCKS' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Fleet & Autos
            </button>
            <button
              onClick={() => setFilterLayer('COMPLAINTS')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${filterLayer === 'COMPLAINTS' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Complaints ({complaints.length})
            </button>
            <button
              onClick={() => setFilterLayer('CAMERAS')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${filterLayer === 'CAMERAS' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Cameras
            </button>
            <button
              onClick={() => setFilterLayer('FAULTS')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${filterLayer === 'FAULTS' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Faults Only
            </button>
          </div>

          {/* Toggle between Leaflet Map and Ward Grid */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('MAP')}
              className={`px-2 py-1 rounded-lg font-semibold flex items-center gap-1 ${viewMode === 'MAP' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              title="Interactive Map View"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Map</span>
            </button>
            <button
              onClick={() => setViewMode('WARD_GRID')}
              className={`px-2 py-1 rounded-lg font-semibold flex items-center gap-1 ${viewMode === 'WARD_GRID' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              title="Ward Asset Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ward Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area: Leaflet Map or Ward Asset Grid */}
      {viewMode === 'MAP' ? (
        <div className="relative w-full h-[520px] bg-slate-100">
          <div 
            ref={mapContainerRef} 
            className="w-full h-full z-10"
          />
          {mapStatus === 'INITIALIZING' && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 z-20">
              <div className="flex items-center gap-2 text-slate-600 font-semibold text-xs">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                Initializing Chennai GIS Cartography...
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 bg-slate-50 min-h-[500px] max-h-[550px] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.keys(CHENNAI_ZONE_CENTERS)
              .filter(zone => activeZone === 'ALL' || activeZone === zone)
              .map(zone => {
                const zoneBins = bins.filter(b => b.zone === zone);
                const zoneTrucks = trucks.filter(t => t.currentZone === zone);
                const zoneCameras = cameras.filter(c => c.zone === zone);
                const highFillCount = zoneBins.filter(b => b.latestFillPercentage >= 75).length;
                const faultCount = zoneBins.filter(b => b.equipmentHealth !== 'NORMAL').length +
                  zoneCameras.filter(c => c.status !== 'ACTIVE').length;

                return (
                  <div key={zone} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <h4 className="font-extrabold text-sm text-slate-900">{zone} Ward</h4>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600">
                        {zoneBins.length} Bins
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-slate-50 rounded-lg">
                        <span className="text-slate-500 text-[10px]">High Fill Bins</span>
                        <p className={`font-bold text-sm ${highFillCount > 0 ? 'text-red-600' : 'text-slate-700'}`}>
                          {highFillCount}
                        </p>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-lg">
                        <span className="text-slate-500 text-[10px]">Equipment Faults</span>
                        <p className={`font-bold text-sm ${faultCount > 0 ? 'text-purple-600' : 'text-emerald-600'}`}>
                          {faultCount}
                        </p>
                      </div>
                    </div>

                    {zoneTrucks.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs text-blue-800 font-semibold">
                        <TruckIcon className="w-3.5 h-3.5" />
                        <span>Active Truck: {zoneTrucks.map(t => `${t.id} (${t.payloadPercentage}%)`).join(', ')}</span>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dustbins</span>
                      {zoneBins.slice(0, 3).map(b => (
                        <div 
                          key={b.id} 
                          onClick={() => onSelectBin && onSelectBin(b.id)}
                          className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 cursor-pointer transition-colors"
                        >
                          <span className="font-medium text-slate-700 truncate max-w-[160px]">{b.streetAddress}</span>
                          <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                            b.latestFillPercentage >= 75 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {b.latestFillPercentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Bottom Map Legend */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-600">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            <span>Low (&lt;40%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
            <span>Normal (40-74%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
            <span>Nearly Full (75-89%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
            <span>Critical (≥90%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
            <span>Sensor Fault</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-indigo-600 inline-block" />
            <span>Camera Node</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold text-[9px]">TRUCK-500</span>
            <span>500 kg Cap</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-bold text-[9px]">TRUCK-1000</span>
            <span>1000 kg Cap</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 italic">
          EcoTrack AI Solid Waste Mgmt GIS • WGS 84 Datum
        </div>
      </div>
    </div>
  );
};
