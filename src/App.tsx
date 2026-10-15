import React, { useState, useEffect } from 'react';
import { 
  User, 
  Truck, 
  Dustbin, 
  LevelSensor, 
  WeightSensor, 
  SmellSensor, 
  StreetCamera, 
  DeviceAlert, 
  PickupTask, 
  SegregationRequest, 
  WardComplaint, 
  AuditLog,
  ChennaiZone,
  TruckId,
  TaskStatus,
  ComplaintStatus,
  WasteDataEntry
} from './types';
import { 
  CHENNAI_USERS, 
  INITIAL_CHENNAI_TRUCKS, 
  INITIAL_CHENNAI_BINS, 
  INITIAL_LEVEL_SENSORS, 
  INITIAL_WEIGHT_SENSORS, 
  INITIAL_SMELL_SENSORS, 
  INITIAL_STREET_CAMERAS, 
  INITIAL_DEVICE_ALERTS, 
  INITIAL_PICKUP_TASKS, 
  INITIAL_SEGREGATION_REQUESTS, 
  INITIAL_WARD_COMPLAINTS, 
  INITIAL_AUDIT_LOGS 
} from './data/chennaiData';
import { Header } from './components/common/Header';
import { AdminView } from './components/admin/AdminView';
import { DriverView } from './components/driver/DriverView';
import { SegregationView } from './components/segregation/SegregationView';
import { AuthModal } from './components/auth/AuthModal';
import { ChennaiAllocationEngine } from './services/allocationEngine';
import { fetchSimulatedOrRealIncomingEmails, OFFICIAL_COMPLAINT_EMAIL } from './services/complaintService';
import { Bell, CheckCircle2, AlertTriangle, Info, ArrowRight, X } from 'lucide-react';

const STORAGE_KEY_PREFIX = 'chennai_smart_waste_';

interface InAppToast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info' | 'alert';
  complaintId?: string;
  taskId?: string;
}

export default function App() {
  // Authentication State
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}users`);
    if (saved) {
      try {
        const parsed: User[] = JSON.parse(saved);
        const missing = CHENNAI_USERS.filter(cu => !parsed.some(p => p.id === cu.id));
        return [...parsed, ...missing];
      } catch { return CHENNAI_USERS; }
    }
    return CHENNAI_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}user`);
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null; // When application starts, the FIRST page shown must be the LOGIN page
  });

  const [activeNav, setActiveNav] = useState<string>('overview');

  // Application Data States (Persisted with LocalStorage fallback)
  const [trucks, setTrucks] = useState<Truck[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}trucks`);
    if (saved) {
      try {
        const parsed: Truck[] = JSON.parse(saved);
        // Apply updated fleet specifications to saved records while retaining live vehicle state.
        const updated = parsed.map(truck => {
          const initial = INITIAL_CHENNAI_TRUCKS.find(it => it.id === truck.id);
          if (!initial || truck.id !== 'AUTO-100-2') return truck;

          const maxPayloadKg = initial.maxPayloadKg;
          return {
            ...truck,
            name: initial.name,
            model: initial.model,
            vehicleType: initial.vehicleType,
            maxPayloadKg,
            remainingCapacityKg: maxPayloadKg - truck.verifiedCurrentPayloadKg,
            payloadPercentage: Math.round((truck.verifiedCurrentPayloadKg / maxPayloadKg) * 100),
            isOverloaded: truck.verifiedCurrentPayloadKg > maxPayloadKg
          };
        });
        const missing = INITIAL_CHENNAI_TRUCKS.filter(it => !updated.some(p => p.id === it.id));
        return [...updated, ...missing];
      } catch { return INITIAL_CHENNAI_TRUCKS; }
    }
    return INITIAL_CHENNAI_TRUCKS;
  });

  const [bins, setBins] = useState<Dustbin[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}bins`);
    if (saved) {
      try { return JSON.parse(saved); } catch { return INITIAL_CHENNAI_BINS; }
    }
    return INITIAL_CHENNAI_BINS;
  });

  const [tasks, setTasks] = useState<PickupTask[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}tasks`);
    if (saved) {
      try { return JSON.parse(saved); } catch { return INITIAL_PICKUP_TASKS; }
    }
    return INITIAL_PICKUP_TASKS;
  });

  const [levelSensors] = useState<LevelSensor[]>(INITIAL_LEVEL_SENSORS);
  const [weightSensors] = useState<WeightSensor[]>(INITIAL_WEIGHT_SENSORS);
  const [smellSensors] = useState<SmellSensor[]>(INITIAL_SMELL_SENSORS);
  const [cameras] = useState<StreetCamera[]>(INITIAL_STREET_CAMERAS);

  const [alerts, setAlerts] = useState<DeviceAlert[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}alerts`);
    if (saved) {
      try { return JSON.parse(saved); } catch { return INITIAL_DEVICE_ALERTS; }
    }
    return INITIAL_DEVICE_ALERTS;
  });

  const [segregationRequests, setSegregationRequests] = useState<SegregationRequest[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}requests`);
    if (saved) {
      try { return JSON.parse(saved); } catch { return INITIAL_SEGREGATION_REQUESTS; }
    }
    return INITIAL_SEGREGATION_REQUESTS;
  });

  const [complaints, setComplaints] = useState<WardComplaint[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}complaints`);
    if (saved) {
      try {
        const parsed: WardComplaint[] = JSON.parse(saved);
        const missing = INITIAL_WARD_COMPLAINTS.filter(ic => !parsed.some(p => p.id === ic.id));
        return [...parsed, ...missing];
      } catch { return INITIAL_WARD_COMPLAINTS; }
    }
    return INITIAL_WARD_COMPLAINTS;
  });

  const INITIAL_DEMO_WASTE_ENTRIES: WasteDataEntry[] = [
    {
      id: 'WST-2026-001',
      date: '2026-10-14',
      location: 'Mylapore - Ward 173',
      wetKg: 320,
      dryKg: 210,
      hazardousKg: 75,
      totalKg: 605,
      remarks: 'Morning source-segregated residential collection round completed.',
      enteredBy: 'Kavitha Sundaram',
      createdAt: '2026-10-14T08:30:00Z'
    },
    {
      id: 'WST-2026-002',
      date: '2026-10-14',
      location: 'T. Nagar - Ward 117',
      wetKg: 360,
      dryKg: 210,
      hazardousKg: 70,
      totalKg: 640,
      remarks: 'Commercial complex market area collection; high recyclables.',
      enteredBy: 'Kavitha Sundaram',
      createdAt: '2026-10-14T11:15:00Z'
    }
  ];

  const [wasteEntries, setWasteEntries] = useState<WasteDataEntry[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}waste_entries`);
    if (saved) {
      try {
        const parsed: WasteDataEntry[] = JSON.parse(saved);
        return parsed.length > 0 ? parsed : INITIAL_DEMO_WASTE_ENTRIES;
      } catch { return INITIAL_DEMO_WASTE_ENTRIES; }
    }
    return INITIAL_DEMO_WASTE_ENTRIES;
  });

  // Real-Time In-App Notifications
  const [toasts, setToasts] = useState<InAppToast[]>([]);

  const showInAppToast = (toast: Omit<InAppToast, 'id'>) => {
    const newToast: InAppToast = { ...toast, id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}` };
    setToasts(prev => [newToast, ...prev.slice(0, 3)]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 8000);
  };

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}audit`);
    if (saved) {
      try { return JSON.parse(saved); } catch { return INITIAL_AUDIT_LOGS; }
    }
    return INITIAL_AUDIT_LOGS;
  });

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}user`, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}user`);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}trucks`, JSON.stringify(trucks));
  }, [trucks]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}bins`, JSON.stringify(bins));
  }, [bins]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}tasks`, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}alerts`, JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}requests`, JSON.stringify(segregationRequests));
  }, [segregationRequests]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}complaints`, JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}waste_entries`, JSON.stringify(wasteEntries));
  }, [wasteEntries]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}audit`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (!event.key || event.newValue === null) return;

      try {
        switch (event.key) {
          case `${STORAGE_KEY_PREFIX}tasks`:
            setTasks(JSON.parse(event.newValue) as PickupTask[]);
            break;
          case `${STORAGE_KEY_PREFIX}trucks`:
            setTrucks(JSON.parse(event.newValue) as Truck[]);
            break;
          case `${STORAGE_KEY_PREFIX}bins`:
            setBins(JSON.parse(event.newValue) as Dustbin[]);
            break;
          case `${STORAGE_KEY_PREFIX}complaints`:
            setComplaints(JSON.parse(event.newValue) as WardComplaint[]);
            break;
          case `${STORAGE_KEY_PREFIX}audit`:
            setAuditLogs(JSON.parse(event.newValue) as AuditLog[]);
            break;
        }
      } catch (error) {
        console.error(`Unable to synchronize municipal dashboard data for ${event.key}.`, error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Append Audit Log Helper
  const logAction = (action: string, entity: string, recordId: string, details: string) => {
    const newLog: AuditLog = {
      id: `AUD-CHN-${Date.now().toString().slice(-4)}`,
      actorId: currentUser ? currentUser.id : 'SYSTEM',
      actorName: currentUser ? currentUser.fullName : 'Chennai Automated System',
      actorRole: currentUser ? currentUser.role : 'ADMIN',
      action,
      entity,
      recordId,
      details,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Sign In & Sign Out Handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'ADMIN') setActiveNav('overview');
    else if (user.role === 'DRIVER') setActiveNav('dashboard');
    else setActiveNav('dashboard');

    logAction('USER_AUTHENTICATION', 'User', user.id, `User ${user.fullName} authenticated successfully.`);
  };

  const handleLogout = () => {
    if (currentUser) {
      logAction('USER_LOGOUT', 'User', currentUser.id, `User ${currentUser.fullName} signed out.`);
    }
    setCurrentUser(null);
  };

  const handleUpdateCurrentUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    logAction('PROFILE_UPDATE', 'User', updatedUser.id, `Municipal official profile and account credentials updated for ${updatedUser.fullName}.`);
  };

  // 1. Automatic Allocation Execution Handler
  const handleTriggerAllocation = (binId: string) => {
    const targetBin = bins.find(b => b.id === binId);
    if (!targetBin) return;

    const result = ChennaiAllocationEngine.evaluateAndAllocate(targetBin, trucks, tasks);

    if (!result.eligible || !result.selectedTruck) {
      // Create pending task or alert
      const alertId = `ALT-CAP-${Date.now().toString().slice(-4)}`;
      const newAlert: DeviceAlert = {
        id: alertId,
        deviceType: 'OVERLOAD',
        deviceId: binId,
        zone: targetBin.zone,
        severity: 'CRITICAL',
        message: `Capacity Blocked: Bin ${binId} (${result.expectedLoadKg}kg) cannot be safely accommodated by TRUCK-500 or TRUCK-1000 remaining payload limits.`,
        timestamp: new Date().toISOString(),
        acknowledged: false,
        resolved: false
      };
      setAlerts(prev => [newAlert, ...prev]);
      logAction('ALLOCATION_BLOCKED', 'Dustbin', binId, result.reason);
      return;
    }

    const assignedTruck = result.selectedTruck;
    const taskId = `TASK-CHN-${Date.now().toString().slice(-4)}`;

    const newTask: PickupTask = {
      id: taskId,
      binId: targetBin.id,
      binAddress: targetBin.streetAddress,
      zone: targetBin.zone,
      latitude: targetBin.latitude,
      longitude: targetBin.longitude,
      binType: targetBin.binType,
      fillPercentage: targetBin.latestFillPercentage,
      estimatedWeightKg: result.expectedLoadKg,
      priority: targetBin.latestFillPercentage >= 90 ? 'URGENT' : 'HIGH',
      assignedTruckId: assignedTruck.id,
      assignedDriverId: assignedTruck.driverId,
      assignedDriverName: assignedTruck.driverName,
      status: 'ASSIGNED',
      allocatedRemainingCapacityUsed: result.expectedLoadKg,
      allocationReason: result.reason,
      allocationTimestamp: new Date().toISOString(),
      activityHistory: [{
        timestamp: new Date().toISOString(),
        status: 'ASSIGNED',
        note: result.reason,
        actor: 'Chennai Automated Allocation Engine'
      }],
      verifiedBy: 'Chennai Automated Allocation Engine'
    };

    // Update bin status
    setBins(prev => prev.map(b => b.id === binId ? { ...b, collectionStatus: 'ASSIGNED', assignedTruckId: assignedTruck.id } : b));
    
    // Append task
    setTasks(prev => [newTask, ...prev]);

    // Update truck committed weight
    setTrucks(prev => prev.map(t => {
      if (t.id === assignedTruck.id) {
        return {
          ...t,
          status: 'ASSIGNED',
          estimatedAdditionalCollectionKg: t.estimatedAdditionalCollectionKg + result.expectedLoadKg
        };
      }
      return t;
    }));

    logAction('AUTO_ALLOCATION', 'PickupTask', taskId, `Automated assignment: Bin ${targetBin.id} allocated to ${assignedTruck.id} (${assignedTruck.driverName}).`);
  };

  // 2. Start Pickup (Driver)
  const handleStartPickup = (taskId: string) => {
    const timestamp = new Date().toISOString();
    const task = tasks.find(t => t.id === taskId);
    setTasks(prev => prev.map(t => t.id === taskId ? {
      ...t,
      status: 'EN_ROUTE',
      startedTime: timestamp,
      activityHistory: [...(t.activityHistory || []), {
        timestamp,
        status: 'EN_ROUTE',
        note: 'Driver started the pickup route.',
        actor: task?.assignedDriverName || 'Assigned driver'
      }]
    } : t));

    if (task) {
      setTrucks(prev => prev.map(tr => tr.id === task.assignedTruckId ? { ...tr, status: 'EN_ROUTE' } : tr));
      setBins(prev => prev.map(b => b.id === task.binId ? { ...b, collectionStatus: 'COLLECTING' } : b));
      logAction('PICKUP_STARTED', 'PickupTask', taskId, `Driver started pickup route for task ${taskId} at ${task.binAddress}.`);
    }
  };

  // 3. Complete Pickup with Verified Weight (Driver)
  const handleCompletePickup = (taskId: string, actualWeightKg: number, photoUrl?: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const completedTimestamp = new Date().toISOString();

    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: 'COMPLETED',
          actualWeightKg,
          completedTime: completedTimestamp,
          completionPhotoUrl: photoUrl,
          activityHistory: [...(t.activityHistory || []), {
            timestamp: completedTimestamp,
            status: 'COMPLETED',
            note: `Driver verified ${actualWeightKg} kg and completed the pickup.${photoUrl ? ' Verification photo recorded.' : ''}`,
            actor: task.assignedDriverName
          }]
        };
      }
      return t;
    }));

    // Update truck payload and remaining capacity
    setTrucks(prev => prev.map(tr => {
      if (tr.id === task.assignedTruckId) {
        const newPayload = Math.min(tr.maxPayloadKg, tr.verifiedCurrentPayloadKg + actualWeightKg);
        const newRemaining = tr.maxPayloadKg - newPayload;
        const newPct = Math.round((newPayload / tr.maxPayloadKg) * 100);

        return {
          ...tr,
          verifiedCurrentPayloadKg: newPayload,
          remainingCapacityKg: newRemaining,
          payloadPercentage: newPct,
          status: newRemaining < 50 ? 'RETURNING' : 'AVAILABLE',
          isOverloaded: newPayload >= tr.maxPayloadKg
        };
      }
      return tr;
    }));

    // Reset Bin Fill Level
    setBins(prev => prev.map(b => {
      if (b.id === task.binId) {
        return {
          ...b,
          latestFillPercentage: 5,
          currentWeightKg: 10,
          collectionStatus: 'COMPLETED',
          lastPickupTime: completedTimestamp,
          pickupPriority: 'LOW'
        };
      }
      return b;
    }));

    logAction('PICKUP_COMPLETED', 'PickupTask', taskId, `Task ${taskId} completed at ${task.binAddress}. Verified weight: ${actualWeightKg} kg added to ${task.assignedTruckId}.`);
  };

  // 4. Alert Acknowledgement
  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
    logAction('ALERT_ACKNOWLEDGED', 'DeviceAlert', alertId, `Acknowledged equipment malfunction alert ${alertId}.`);
  };

  // 5. Add Dustbin
  const handleAddBin = (newBinData: Partial<Dustbin>) => {
    const newBin: Dustbin = {
      id: newBinData.id || `BIN-CHN-NEW-${Date.now().toString().slice(-2)}`,
      streetAddress: newBinData.streetAddress || 'Chennai Street',
      zone: newBinData.zone || 'T. Nagar',
      latitude: newBinData.latitude || 13.0418,
      longitude: newBinData.longitude || 80.2341,
      binType: newBinData.binType || 'COMMERCIAL_MIXED',
      maxPhysicalCapacityKg: newBinData.maxPhysicalCapacityKg || 250,
      levelSensorId: newBinData.levelSensorId || `LS-${Date.now().toString().slice(-4)}`,
      latestFillPercentage: newBinData.latestFillPercentage || 15,
      equipmentHealth: 'NORMAL',
      collectionStatus: 'NORMAL',
      pickupPriority: 'NORMAL',
      fillRatePerHour: 3.5,
      lastSensorUpdate: new Date().toISOString()
    };

    setBins(prev => [newBin, ...prev]);
    logAction('BIN_REGISTERED', 'Dustbin', newBin.id, `Registered new street dustbin at ${newBin.streetAddress} (${newBin.zone}).`);
  };

  // 6. Truck Status Update
  const handleUpdateTruckStatus = (truckId: TruckId, status: any) => {
    setTrucks(prev => prev.map(t => t.id === truckId ? { ...t, status } : t));
    logAction('TRUCK_STATUS_UPDATE', 'Truck', truckId, `Updated ${truckId} operational status to ${status}.`);
  };

  // 7. Manual Override Assignment (Admin)
  const handleManualOverrideTask = (taskId: string, newTruckId: TruckId) => {
    const truck = trucks.find(t => t.id === newTruckId);
    if (!truck) return;

    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          assignedTruckId: newTruckId,
          assignedDriverId: truck.driverId,
          assignedDriverName: truck.driverName,
          allocationReason: `Administrative manual override: Assigned to ${newTruckId} by ${currentUser?.fullName}.`
        };
      }
      return t;
    }));

    logAction('MANUAL_OVERRIDE', 'PickupTask', taskId, `Manually reassigned task ${taskId} to ${newTruckId}.`);
  };

  // 8. Citizen Complaint Manual Allocation (Admin)
  const handleManualAllocateComplaint = (
    complaintId: string, 
    truckId: TruckId, 
    driverId: string, 
    remarks?: string,
    customData?: {
      weightKg?: number;
      address?: string;
      wasteType?: string;
      priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
      timeWindow?: string;
    }
  ) => {
    const complaint = complaints.find(c => c.id === complaintId);
    const truck = trucks.find(t => t.id === truckId);
    if (!complaint || !truck) return;

    const estLoad = customData?.weightKg ?? (complaint.quantityEstimateKg || 50);

    // Safety interlocks
    if (estLoad > truck.remainingCapacityKg) {
      showInAppToast({
        title: 'Safety Interlock Blocked',
        message: `${truck.name} only has ${truck.remainingCapacityKg} kg remaining, which cannot take ${estLoad} kg.`,
        type: 'error'
      });
      return;
    }

    if (truck.status === 'MAINTENANCE' || truck.status === 'OUT_OF_SERVICE') {
      showInAppToast({
        title: 'Asset Unavailable',
        message: `${truck.name} is currently flagged as ${truck.status}. Please select an operational vehicle.`,
        type: 'warning'
      });
      return;
    }

    const taskId = `TASK-MANUAL-${Date.now().toString().slice(-4)}`;
    const assignedDriverName = truck.driverName;

    const pickupTask: PickupTask = {
      id: taskId,
      binId: complaint.binId || `BIN-CMP-${complaint.id}`,
      binAddress: customData?.address || complaint.streetAddress,
      zone: complaint.zone,
      latitude: complaint.latitude || 13.0418,
      longitude: complaint.longitude || 80.2341,
      estimatedWeightKg: estLoad,
      assignedTruckId: truck.id,
      assignedDriverId: driverId || truck.driverId,
      assignedDriverName: users.find(user => user.id === (driverId || truck.driverId))?.fullName || assignedDriverName,
      status: 'ASSIGNED',
      allocationReason: [
        `Manual Complaint Dispatch: Allocated to ${truck.name} (${truck.registrationNumber}).`,
        customData?.timeWindow ? `Time window: ${customData.timeWindow}.` : '',
        remarks ? `Dispatch instructions: ${remarks}` : ''
      ].filter(Boolean).join(' '),
      priority: customData?.priority || ((complaint.urgency === 'CRITICAL' || complaint.urgency === 'HIGH') ? 'HIGH' : 'NORMAL'),
      allocatedRemainingCapacityUsed: estLoad,
      allocationTimestamp: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      destinationName: 'Perungudi Solid Waste Transfer & Processing Facility',
      destinationLatitude: 12.9566,
      destinationLongitude: 80.2415,
      pickupType: 'CITIZEN_COMPLAINT',
      complaintId: complaint.id,
      wasteCategory: customData?.wasteType || complaint.wasteCategory || 'Mixed Refuse',
      driverPhone: users.find(user => user.id === (driverId || truck.driverId))?.phone || truck.driverPhone,
      assignedTime: new Date().toISOString(),
      activityHistory: [{
        timestamp: new Date().toISOString(),
        status: 'ASSIGNED',
        note: `Assigned by ${currentUser?.fullName || 'Admin'} to ${truck.name}. ${customData?.timeWindow ? `Time window: ${customData.timeWindow}.` : ''} ${remarks ? `Dispatch instructions: ${remarks}` : ''}`.trim(),
        actor: currentUser?.fullName || 'Admin'
      }]
    };

    setTasks(prev => [pickupTask, ...prev]);

    setComplaints(prev => prev.map(c => c.id === complaintId ? {
      ...c,
      status: 'ASSIGNED',
      assignedTruckId: truck.id,
      assignedTaskId: taskId,
      assignedAt: new Date().toISOString(),
      investigationNotes: remarks ? `${c.investigationNotes || ''}\n[Dispatch Note]: ${remarks}`.trim() : c.investigationNotes
    } : c));

    setTrucks(prev => prev.map(t => {
      if (t.id === truck.id) {
        return {
          ...t,
          status: 'ASSIGNED',
          estimatedAdditionalCollectionKg: t.estimatedAdditionalCollectionKg + estLoad
        };
      }
      return t;
    }));

    logAction('MANUAL_ALLOCATION', 'PickupTask', taskId, `Allocated ${truck.name} (${truck.id}) to citizen complaint ${complaint.id} (${estLoad} kg).`);

    showInAppToast({
      title: 'Task Assigned',
      message: `Task successfully assigned to ${truck.driverName} – ${truck.id}`,
      type: 'success',
      complaintId: complaint.id,
      taskId
    });
  };

  // Cancel Task (Admin)
  const handleCancelTask = (taskId: string, reason: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    setTasks(prev => prev.map(t => t.id === taskId ? {
      ...t,
      status: 'CANCELLED',
      cancellationReason: reason
    } : t));

    if (task.assignedTruckId) {
      setTrucks(prev => prev.map(tr => {
        if (tr.id === task.assignedTruckId) {
          const newAllocated = Math.max(0, tr.estimatedAdditionalCollectionKg - (task.allocatedRemainingCapacityUsed || task.estimatedWeightKg));
          return {
            ...tr,
            estimatedAdditionalCollectionKg: newAllocated,
            status: newAllocated === 0 && tr.verifiedCurrentPayloadKg === 0 ? 'AVAILABLE' : tr.status
          };
        }
        return tr;
      }));
    }

    if (task.complaintId) {
      setComplaints(prev => prev.map(c => c.id === task.complaintId ? {
        ...c,
        status: 'NEW',
        assignedTruckId: undefined,
        assignedTaskId: undefined
      } : c));
    }

    logAction('TASK_CANCELLED', 'PickupTask', taskId, `Task ${taskId} cancelled by ${currentUser?.fullName}. Reason: ${reason}`);
    showInAppToast({
      title: 'Task Cancelled',
      message: `Task ${taskId} cancelled and truck payload restored.`,
      type: 'info'
    });
  };

  // 9. Complaint Status Updater & Lifecycle Transitions
  const handleUpdateComplaintStatus = (complaintId: string, status: ComplaintStatus, notes?: string) => {
    setComplaints(prev => prev.map(c => {
      if (c.id === complaintId) {
        return {
          ...c,
          status,
          investigationNotes: notes ? `${c.investigationNotes || ''}\n${notes}`.trim() : c.investigationNotes,
          resolvedAt: status === 'RESOLVED' ? new Date().toISOString() : c.resolvedAt
        };
      }
      return c;
    }));

    if (status === 'REJECTED' || status === 'CANCELLED') {
      const cmp = complaints.find(c => c.id === complaintId);
      if (cmp && cmp.assignedTaskId) {
        setTasks(prev => prev.map(t => t.id === cmp.assignedTaskId ? { ...t, status: 'CANCELLED', rejectionReason: notes } : t));
        if (cmp.assignedTruckId) {
          setTrucks(prev => prev.map(tr => tr.id === cmp.assignedTruckId ? {
            ...tr,
            status: 'AVAILABLE',
            estimatedAdditionalCollectionKg: Math.max(0, tr.estimatedAdditionalCollectionKg - (cmp.quantityEstimateKg || 50))
          } : tr));
        }
      }
    }

    logAction('COMPLAINT_STATUS_UPDATE', 'WardComplaint', complaintId, `Status changed to ${status}.${notes ? ` Note: ${notes}` : ''}`);
    showInAppToast({
      title: 'Complaint Updated',
      message: `${complaintId} status changed to ${status.replace(/_/g, ' ')}.`,
      type: 'info',
      complaintId
    });
  };

  // 10. Register Phone Complaint (1913 Helpline)
  const handleRegisterPhoneComplaint = (data: {
    citizenName: string;
    phone: string;
    description: string;
    wasteCategory: string;
    quantityEstimateKg: number;
    zone: ChennaiZone;
    streetAddress: string;
    landmark?: string;
    latitude?: number;
    longitude?: number;
    urgency: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
    operatorName?: string;
  }) => {
    const newId = `CMP-PHN-2026-${(complaints.length + 101).toString()}`;
    const newComplaint: WardComplaint = {
      id: newId,
      citizenName: data.citizenName,
      phone: data.phone,
      source: 'PHONE',
      zone: data.zone,
      streetAddress: data.streetAddress,
      landmark: data.landmark,
      latitude: data.latitude,
      longitude: data.longitude,
      description: data.description,
      wasteCategory: data.wasteCategory,
      quantityEstimateKg: data.quantityEstimateKg,
      urgency: data.urgency,
      status: 'NEW',
      createdAt: new Date().toISOString(),
      operatorName: data.operatorName || currentUser?.fullName
    };

    setComplaints(prev => [newComplaint, ...prev]);
    logAction('PHONE_COMPLAINT_REGISTERED', 'WardComplaint', newId, `Registered helpline complaint from ${data.citizenName} at ${data.streetAddress} (${data.zone}).`);

    showInAppToast({
      title: '📞 Helpline Call Grievance Registered',
      message: `${newId} (${data.citizenName}) logged at ${data.streetAddress}. Ready for truck allocation.`,
      type: 'success',
      complaintId: newId
    });
  };

  // 11. Sync Incoming Emails from ecotrackai123@gmail.com
  const handleSyncIncomingEmails = () => {
    const newEmails = fetchSimulatedOrRealIncomingEmails(complaints);
    if (newEmails.length > 0) {
      setComplaints(prev => [...newEmails, ...prev]);
      newEmails.forEach(c => {
        logAction('EMAIL_COMPLAINT_INGESTED', 'WardComplaint', c.id, `Incoming citizen email ingested from ${c.senderEmail}: "${c.subject || c.description.slice(0, 40)}"`);
      });

      const first = newEmails[0];
      showInAppToast({
        title: '✉️ New Citizen Email Complaint Received!',
        message: `From: ${first.senderEmail} • ID: ${first.id} • ${first.streetAddress} (${first.quantityEstimateKg} kg).`,
        type: 'alert',
        complaintId: first.id
      });
    } else {
      showInAppToast({
        title: 'Inbox Checked (ecotrackai123@gmail.com)',
        message: 'No new unread email complaints detected. All inbox messages fingerprinted & processed.',
        type: 'info'
      });
    }
  };

  // 12. Driver Task Acceptance & GPS Activation
  const handleAcceptTask = (taskId: string) => {
    const timestamp = new Date().toISOString();
    const task = tasks.find(t => t.id === taskId);
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: 'ACCEPTED',
          driverAcceptedTime: timestamp,
          activityHistory: [...(t.activityHistory || []), {
            timestamp,
            status: 'ACCEPTED',
            note: 'Driver accepted the assignment.',
            actor: task?.assignedDriverName || 'Assigned driver'
          }]
        };
      }
      return t;
    }));

    if (task) {
      if (task.complaintId) {
        setComplaints(prev => prev.map(c => c.id === task.complaintId ? { ...c, status: 'IN_PROGRESS' } : c));
      }
      setTrucks(prev => prev.map(tr => tr.id === task.assignedTruckId ? { ...tr, status: 'ASSIGNED', isGpsOnline: true } : tr));
      logAction('TASK_ACCEPTED', 'PickupTask', taskId, `Driver accepted task ${taskId}. Live GPS satellite tracking activated.`);
      showInAppToast({
        title: 'Task Accepted by Driver',
        message: `Driver accepted task ${taskId}. Live GPS tracking is active.`,
        type: 'success',
        taskId
      });
    }
  };

  // 13. Driver Task Rejection with Reason
  const handleRejectTask = (taskId: string, reason: string) => {
    const timestamp = new Date().toISOString();
    const task = tasks.find(t => t.id === taskId);
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: 'REJECTED',
          rejectionReason: reason,
          driverRemarks: reason,
          activityHistory: [...(t.activityHistory || []), {
            timestamp,
            status: 'REJECTED',
            note: `Driver rejected the assignment: ${reason}`,
            actor: task?.assignedDriverName || 'Assigned driver'
          }]
        };
      }
      return t;
    }));

    if (task) {
      // Release truck back to available
      setTrucks(prev => prev.map(tr => tr.id === task.assignedTruckId ? {
        ...tr,
        status: 'AVAILABLE',
        estimatedAdditionalCollectionKg: Math.max(0, tr.estimatedAdditionalCollectionKg - task.estimatedWeightKg)
      } : tr));

      // Revert complaint to UNDER_REVIEW
      if (task.complaintId) {
        setComplaints(prev => prev.map(c => c.id === task.complaintId ? {
          ...c,
          status: 'UNDER_REVIEW',
          investigationNotes: `${c.investigationNotes || ''}\nDriver rejected assignment: ${reason}`.trim()
        } : c));
      }

      logAction('TASK_REJECTED', 'PickupTask', taskId, `Driver rejected task ${taskId}. Reason: "${reason}". Vehicle ${task.assignedTruckId} released.`);
      showInAppToast({
        title: '⚠️ Task Rejected by Driver',
        message: `Driver rejected ${taskId}: "${reason}". Asset released for admin reassignment.`,
        type: 'warning',
        taskId
      });
    }
  };

  // 14. Driver Detailed Workflow Progression
  const handleUpdateTaskStatus = (
    taskId: string, 
    newStatus: TaskStatus, 
    details?: { actualWeightKg?: number; photoUrl?: string; remarks?: string }
  ) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const timestamp = new Date().toISOString();
    const statusNotes: Partial<Record<TaskStatus, string>> = {
      EN_ROUTE_PICKUP: 'Driver started route to the pickup location.',
      ARRIVED_PICKUP: 'Driver arrived at the pickup location.',
      COLLECTING: 'Driver started waste collection.',
      WASTE_COLLECTED: 'Driver recorded the collected waste.',
      EN_ROUTE_DISPOSAL: 'Driver started route to the disposal facility.',
      COMPLETED: 'Driver completed collection and disposal.'
    };
    const activityNote = [
      statusNotes[newStatus] || `Driver updated task status to ${newStatus.replace(/_/g, ' ').toLowerCase()}.`,
      details?.actualWeightKg !== undefined ? `Verified weight: ${details.actualWeightKg} kg.` : '',
      details?.remarks?.trim() ? `Driver remarks: ${details.remarks.trim()}` : '',
      details?.photoUrl ? 'Verification photo recorded.' : ''
    ].filter(Boolean).join(' ');

    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: newStatus,
          actualWeightKg: details?.actualWeightKg ?? t.actualWeightKg,
          completionPhotoUrl: details?.photoUrl ?? t.completionPhotoUrl,
          driverRemarks: details?.remarks ?? t.driverRemarks,
          startedTime: (newStatus === 'EN_ROUTE_PICKUP' || newStatus === 'EN_ROUTE') ? timestamp : t.startedTime,
          arrivedPickupTime: newStatus === 'ARRIVED_PICKUP' ? timestamp : t.arrivedPickupTime,
          collectedTime: newStatus === 'WASTE_COLLECTED' ? timestamp : t.collectedTime,
          completedTime: newStatus === 'COMPLETED' ? timestamp : t.completedTime,
          activityHistory: [...(t.activityHistory || []), {
            timestamp,
            status: newStatus,
            note: activityNote,
            actor: task.assignedDriverName
          }]
        };
      }
      return t;
    }));

    // Handle vehicle state and payload adjustments
    if (newStatus === 'EN_ROUTE_PICKUP' || newStatus === 'EN_ROUTE') {
      setTrucks(prev => prev.map(tr => tr.id === task.assignedTruckId ? { ...tr, status: 'EN_ROUTE', isGpsOnline: true } : tr));
      if (task.binId && !task.complaintId) {
        setBins(prev => prev.map(b => b.id === task.binId ? { ...b, collectionStatus: 'COLLECTING' } : b));
      }
    } else if (newStatus === 'ARRIVED_PICKUP') {
      setTrucks(prev => prev.map(tr => tr.id === task.assignedTruckId ? { ...tr, status: 'COLLECTING' } : tr));
    } else if (newStatus === 'WASTE_COLLECTED') {
      const addedWeight = details?.actualWeightKg || task.estimatedWeightKg;
      setTrucks(prev => prev.map(tr => {
        if (tr.id === task.assignedTruckId) {
          const newPayload = Math.min(tr.maxPayloadKg, tr.verifiedCurrentPayloadKg + addedWeight);
          const newRemaining = Math.max(0, tr.maxPayloadKg - newPayload);
          const newPct = Math.round((newPayload / tr.maxPayloadKg) * 100);
          return {
            ...tr,
            verifiedCurrentPayloadKg: newPayload,
            remainingCapacityKg: newRemaining,
            payloadPercentage: newPct,
            isOverloaded: newPayload >= tr.maxPayloadKg
          };
        }
        return tr;
      }));
    } else if (newStatus === 'EN_ROUTE_DISPOSAL') {
      setTrucks(prev => prev.map(tr => tr.id === task.assignedTruckId ? { ...tr, status: 'RETURNING' } : tr));
    } else if (newStatus === 'COMPLETED') {
      const finalWeight = details?.actualWeightKg || task.actualWeightKg || task.estimatedWeightKg;
      if (task.complaintId) {
        setComplaints(prev => prev.map(c => c.id === task.complaintId ? {
          ...c,
          status: 'RESOLVED',
          resolvedAt: timestamp,
          investigationNotes: `${c.investigationNotes || ''}\nCompleted: ${finalWeight} kg lifted. ${details?.remarks || ''}`.trim()
        } : c));
      }
      if (task.binId && !task.complaintId) {
        setBins(prev => prev.map(b => b.id === task.binId ? {
          ...b,
          latestFillPercentage: 5,
          currentWeightKg: 10,
          collectionStatus: 'COMPLETED',
          lastPickupTime: timestamp,
          pickupPriority: 'LOW'
        } : b));
      }

      // Check remaining tasks for this vehicle
      const remainingTasks = tasks.filter(t => t.assignedTruckId === task.assignedTruckId && t.id !== taskId && t.status !== 'COMPLETED' && t.status !== 'CANCELLED' && t.status !== 'REJECTED');
      setTrucks(prev => prev.map(tr => {
        if (tr.id === task.assignedTruckId) {
          return {
            ...tr,
            status: remainingTasks.length > 0 ? 'EN_ROUTE' : 'AVAILABLE',
            estimatedAdditionalCollectionKg: Math.max(0, tr.estimatedAdditionalCollectionKg - task.estimatedWeightKg)
          };
        }
        return tr;
      }));
    }

    logAction('TASK_STATUS_UPDATE', 'PickupTask', taskId, `Task ${taskId} status transitioned to ${newStatus}.${details?.remarks ? ` Remarks: ${details.remarks}` : ''}`);
    showInAppToast({
      title: `Task Status: ${newStatus.replace(/_/g, ' ')}`,
      message: `Driver updated progress for ${task.binAddress}.`,
      type: 'info',
      taskId
    });
  };

  // 15. Driver Live GPS Telemetry Update
  const handleUpdateGpsLocation = (
    truckId: TruckId, 
    coords: { latitude: number; longitude: number; speedKmph?: number }
  ) => {
    setTrucks(prev => prev.map(tr => {
      if (tr.id === truckId) {
        return {
          ...tr,
          currentLatitude: coords.latitude,
          currentLongitude: coords.longitude,
          isGpsOnline: true,
          lastGpsSync: new Date().toISOString()
        };
      }
      return tr;
    }));
  };

  // 16. Segregation Requests & Complaints
  const handleRequestPickup = (req: Partial<SegregationRequest>) => {
    const newReq: SegregationRequest = req as SegregationRequest;
    setSegregationRequests(prev => [newReq, ...prev]);
    logAction('SEGREGATION_REQUEST', 'SegregationRequest', newReq.id, `Segregation pickup requested for ${newReq.streetAddress} (${newReq.estimatedWeightKg}kg ${newReq.wasteType}).`);
  };

  const handleSubmitComplaint = (cmp: Partial<WardComplaint>) => {
    const newCmp: WardComplaint = cmp as WardComplaint;
    setComplaints(prev => [newCmp, ...prev]);
    logAction('WARD_COMPLAINT', 'WardComplaint', newCmp.id, `Citizen grievance registered for ${newCmp.streetAddress}: ${newCmp.complaintType}.`);
  };

  const handleAddWasteEntry = (entry: WasteDataEntry) => {
    setWasteEntries(prev => [entry, ...prev]);
    logAction('WASTE_DATA_ENTRY', 'WasteDataEntry', entry.id, `Manual waste data recorded by ${entry.enteredBy} for ${entry.location}: ${entry.totalKg} kg total.`);
    showInAppToast({
      title: 'Waste Data Saved',
      message: `${entry.totalKg} kg recorded for ${entry.location} (${entry.wetKg}kg wet, ${entry.dryKg}kg dry, ${entry.hazardousKg}kg hazardous).`,
      type: 'success'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased relative">
      {/* Real-time In-App Floating Toast Notifications */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm w-full pointer-events-auto">
          {toasts.map(toast => (
            <div 
              key={toast.id}
              className={`p-4 rounded-2xl shadow-xl border flex items-start justify-between gap-3 backdrop-blur-md transition-all animate-in slide-in-from-top-2 ${
                toast.type === 'alert' ? 'bg-amber-950/95 border-amber-500 text-amber-100 shadow-amber-900/40' :
                toast.type === 'success' ? 'bg-slate-900/95 border-emerald-500 text-emerald-100 shadow-slate-900/40' :
                toast.type === 'warning' ? 'bg-red-950/95 border-red-500 text-red-100 shadow-red-900/40' :
                toast.type === 'error' ? 'bg-red-950/95 border-red-500 text-red-100 shadow-red-900/40' :
                'bg-slate-900/95 border-blue-500 text-blue-100 shadow-slate-900/40'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-extrabold text-xs">
                  {toast.type === 'alert' && <Bell className="w-4 h-4 text-amber-400 shrink-0" />}
                  {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />}
                  {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />}
                  {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
                  <span>{toast.title}</span>
                </div>
                <p className="text-[11px] opacity-90 leading-relaxed">{toast.message}</p>
                {toast.complaintId && currentUser?.role === 'ADMIN' && (
                  <button
                    onClick={() => {
                      setActiveNav('complaints');
                      setToasts(prev => prev.filter(t => t.id !== toast.id));
                    }}
                    className="text-[10px] font-bold text-amber-300 hover:text-white flex items-center gap-1 mt-1 underline"
                  >
                    <span>Open Complaint in Dashboard</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="opacity-60 hover:opacity-100 text-xs shrink-0 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Unauthenticated View: Auth Modal */}
      {!currentUser ? (
        <AuthModal 
          users={users}
          onLoginSuccess={handleLoginSuccess}
        />
      ) : (
        <>
          {/* Header Navigation with Profile-exclusive Logout */}
          <Header
            currentUser={currentUser}
            activeNav={activeNav}
            onNavigate={setActiveNav}
            onLogout={handleLogout}
            alerts={alerts}
          />

          {/* Main Workspace */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {currentUser.role === 'ADMIN' && (
              <AdminView
                currentUser={currentUser}
                activeNav={activeNav}
                onNavigate={setActiveNav}
                bins={bins}
                trucks={trucks}
                tasks={tasks}
                levelSensors={levelSensors}
                weightSensors={weightSensors}
                smellSensors={smellSensors}
                cameras={cameras}
                alerts={alerts}
                complaints={complaints}
                auditLogs={auditLogs}
                onTriggerAllocation={handleTriggerAllocation}
                onAcknowledgeAlert={handleAcknowledgeAlert}
                onAddBin={handleAddBin}
                onUpdateTruckStatus={handleUpdateTruckStatus}
                onManualOverrideTask={handleManualOverrideTask}
                onManualAllocateComplaint={handleManualAllocateComplaint}
                onUpdateComplaintStatus={handleUpdateComplaintStatus}
                onRegisterPhoneComplaint={handleRegisterPhoneComplaint}
                onSyncIncomingEmails={handleSyncIncomingEmails}
                onCancelTask={handleCancelTask}
                onUpdateUser={handleUpdateCurrentUser}
                onLogout={handleLogout}
              />
            )}

            {currentUser.role === 'DRIVER' && (
              <DriverView
                currentUser={currentUser}
                activeNav={activeNav}
                onNavigate={setActiveNav}
                trucks={trucks}
                tasks={tasks}
                bins={bins}
                alerts={alerts}
                onStartPickup={handleStartPickup}
                onCompletePickup={handleCompletePickup}
                onAcceptTask={handleAcceptTask}
                onRejectTask={handleRejectTask}
                onUpdateTaskStatus={handleUpdateTaskStatus}
                onUpdateGpsLocation={handleUpdateGpsLocation}
                onLogout={handleLogout}
              />
            )}

            {currentUser.role === 'SEGREGATION_USER' && (
              <SegregationView
                currentUser={currentUser}
                activeNav={activeNav}
                onNavigate={setActiveNav}
                wasteEntries={wasteEntries}
                onAddWasteEntry={handleAddWasteEntry}
                onLogout={handleLogout}
              />
            )}
          </main>

          {/* Clean Municipal Footer */}
          <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900">EcoTrack AI</span>
                <span>• Smart Solid Waste Collection System</span>
                <span className="text-emerald-700 font-semibold">• Tamil Nadu, India</span>
              </div>
              <div className="flex items-center gap-4 text-slate-400">
                <span>Citizen Helpline: <strong className="text-slate-700">1913</strong></span>
                <span>• Official Complaint Mailbox: <strong className="text-blue-700 font-mono">{OFFICIAL_COMPLAINT_EMAIL}</strong></span>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
