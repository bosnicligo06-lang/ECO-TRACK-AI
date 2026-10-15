import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Truck, 
  PickupTask, 
  Dustbin, 
  DeviceAlert,
  TaskStatus,
  TruckId
} from '../../types';
import { ChennaiMap } from '../common/ChennaiMap';
import { TaskRejectModal } from './TaskRejectModal';
import { 
  Truck as TruckIcon, 
  Navigation, 
  CheckCircle2, 
  AlertTriangle, 
  Scale, 
  Clock, 
  MapPin, 
  Radio, 
  Camera, 
  Phone, 
  FileText,
  User as UserIcon,
  Bell,
  History,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Compass,
  ArrowRight,
  ShieldAlert,
  Upload,
  Image as ImageIcon,
  Mail,
  Building2,
  Save,
  Award,
  LogOut,
  Key
} from 'lucide-react';

interface DriverViewProps {
  currentUser: User;
  activeNav: string;
  onNavigate: (nav: string) => void;
  trucks: Truck[];
  tasks: PickupTask[];
  bins: Dustbin[];
  alerts: DeviceAlert[];
  onStartPickup: (taskId: string) => void;
  onCompletePickup: (taskId: string, actualWeightKg: number, photoUrl?: string) => void;
  onAcceptTask?: (taskId: string) => void;
  onRejectTask?: (taskId: string, reason: string) => void;
  onUpdateTaskStatus?: (taskId: string, newStatus: TaskStatus, details?: { actualWeightKg?: number; photoUrl?: string; remarks?: string }) => void;
  onUpdateGpsLocation?: (truckId: TruckId, coords: { latitude: number; longitude: number; speedKmph?: number }) => void;
  onLogout: () => void;
}

export const DriverView: React.FC<DriverViewProps> = ({
  currentUser,
  activeNav,
  onNavigate,
  trucks,
  tasks,
  bins,
  alerts,
  onStartPickup,
  onCompletePickup,
  onAcceptTask,
  onRejectTask,
  onUpdateTaskStatus,
  onUpdateGpsLocation,
  onLogout
}) => {
  // Find the driver's assigned vehicle.
  const myTruck = trucks.find(t => 
    t.id === currentUser.assignedTruckId || 
    t.driverId === currentUser.id
  ) || trucks[0];

  const isAuto = myTruck.vehicleType === 'AUTO_RICKSHAW' || myTruck.id.startsWith('AUTO-');

  // Filter tasks assigned to this driver/truck
  const myTasks = tasks.filter(t => t.assignedTruckId === myTruck.id || t.assignedDriverId === currentUser.id);
  const newlyAssignedTasks = myTasks.filter(t => t.status === 'ASSIGNED');
  const activeTasks = myTasks.filter(t => 
    t.status !== 'COMPLETED' && 
    t.status !== 'CANCELLED' && 
    t.status !== 'REJECTED'
  );
  const completedTasks = myTasks.filter(t => t.status === 'COMPLETED');

  // Currently active task (first uncompleted task)
  const currentActiveTask = activeTasks[0] || null;

  // Modal States
  const [rejectingTask, setRejectingTask] = useState<PickupTask | null>(null);
  const [collectionModalTask, setCollectionModalTask] = useState<PickupTask | null>(null);
  const [verifiedWeightInput, setVerifiedWeightInput] = useState('');
  const [collectionRemarks, setCollectionRemarks] = useState('');
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string>('https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80');

  // Driver Profile Form States
  const [profilePhone, setProfilePhone] = useState(currentUser.phone);
  const [profileEmergencyPhone, setProfileEmergencyPhone] = useState('+91 98400 11913');
  const [profileDepot, setProfileDepot] = useState('Zone X Central Fleet Garage, Panagal Park Road, T. Nagar');
  const [profileNotes, setProfileNotes] = useState('Heavy Commercial Vehicle (HMV) Endorsed • Trained in Electric Auto (EV) Operation');
  const [profileSavedToast, setProfileSavedToast] = useState(false);

  const handleSaveDriverProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSavedToast(true);
    setTimeout(() => setProfileSavedToast(false), 3000);
  };

  // Live GPS tracking state
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [currentSpeed, setCurrentSpeed] = useState<number>(24);
  const [isSimulatingGps, setIsSimulatingGps] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  // Active road route points for map
  const routePoints: [number, number][] = currentActiveTask ? [
    [myTruck.currentLatitude, myTruck.currentLongitude],
    [
      (myTruck.currentLatitude + currentActiveTask.latitude) / 2 + 0.002, 
      (myTruck.currentLongitude + currentActiveTask.longitude) / 2 - 0.001
    ],
    [currentActiveTask.latitude, currentActiveTask.longitude],
    [12.9566, 80.2415] // Perungudi Transfer Facility
  ] : [];

  // Filter alerts relevant to driver's vehicle or operational zone
  const driverAlerts = alerts.filter(a =>
    a.deviceId === myTruck.id || 
    (a.zone && a.zone === myTruck.currentZone)
  );

  // Browser Geolocation integration
  const startLiveGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setIsGpsActive(true);
    setGpsError(null);

    try {
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, speed } = pos.coords;
          if (onUpdateGpsLocation) {
            onUpdateGpsLocation(myTruck.id, {
              latitude,
              longitude,
              speedKmph: speed ? Math.round(speed * 3.6) : 22
            });
          }
        },
        (err) => {
          console.warn('Geolocation warning (using simulated satellite coords):', err.message);
          setGpsError('Real GPS coordinates paused. Simulated municipal satellite fallback active.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 3000 }
      );
      watchIdRef.current = id;
    } catch (e) {
      console.warn('Geolocation watch exception:', e);
    }
  };

  const stopLiveGps = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsGpsActive(false);
    setIsSimulatingGps(false);
  };

  // Toggle GPS simulation to demonstrate moving vehicle along Chennai road network
  const toggleGpsSimulation = () => {
    if (!isSimulatingGps) {
      setIsSimulatingGps(true);
      setIsGpsActive(true);
      setGpsError(null);
    } else {
      setIsSimulatingGps(false);
    }
  };

  // Simulated GPS step advancement
  useEffect(() => {
    if (!isSimulatingGps) return;
    const interval = setInterval(() => {
      if (!currentActiveTask) return;
      // Step closer to current task coordinates
      const deltaLat = (currentActiveTask.latitude - myTruck.currentLatitude) * 0.15;
      const deltaLng = (currentActiveTask.longitude - myTruck.currentLongitude) * 0.15;

      if (onUpdateGpsLocation) {
        onUpdateGpsLocation(myTruck.id, {
          latitude: myTruck.currentLatitude + deltaLat,
          longitude: myTruck.currentLongitude + deltaLng,
          speedKmph: Math.floor(18 + Math.random() * 12)
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isSimulatingGps, currentActiveTask, myTruck, onUpdateGpsLocation]);

  // Clean up geolocation on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Handle Driver Action Steps
  const handleAcceptAssignment = (taskId: string) => {
    if (onAcceptTask) {
      onAcceptTask(taskId);
    } else if (onUpdateTaskStatus) {
      onUpdateTaskStatus(taskId, 'ACCEPTED');
    }
    startLiveGps();
  };

  const handleStartRoute = (taskId: string) => {
    if (onUpdateTaskStatus) {
      onUpdateTaskStatus(taskId, 'EN_ROUTE_PICKUP');
    } else {
      onStartPickup(taskId);
    }
    startLiveGps();
  };

  const handleMarkArrived = (taskId: string) => {
    if (onUpdateTaskStatus) {
      onUpdateTaskStatus(taskId, 'ARRIVED_PICKUP');
    }
  };

  const handleStartCollection = (taskId: string) => {
    if (onUpdateTaskStatus) {
      onUpdateTaskStatus(taskId, 'COLLECTING');
    }
  };

  const handleOpenCollectionModal = (task: PickupTask) => {
    setCollectionModalTask(task);
    setVerifiedWeightInput(task.estimatedWeightKg.toString());
    setCollectionRemarks('');
  };

  const handleSaveCollectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectionModalTask) return;
    const weight = parseInt(verifiedWeightInput, 10) || collectionModalTask.estimatedWeightKg;
    
    if (onUpdateTaskStatus) {
      onUpdateTaskStatus(collectionModalTask.id, 'WASTE_COLLECTED', {
        actualWeightKg: weight,
        photoUrl: photoPreviewUrl,
        remarks: collectionRemarks
      });
    }
    setCollectionModalTask(null);
  };

  const handleStartDisposalRoute = (taskId: string) => {
    if (onUpdateTaskStatus) {
      onUpdateTaskStatus(taskId, 'EN_ROUTE_DISPOSAL');
    }
  };

  const handleFinalCompletion = (taskId: string) => {
    const task = myTasks.find(t => t.id === taskId);
    const weight = task?.actualWeightKg || task?.estimatedWeightKg || 60;
    
    if (onUpdateTaskStatus) {
      onUpdateTaskStatus(taskId, 'COMPLETED', {
        actualWeightKg: weight,
        photoUrl: photoPreviewUrl,
        remarks: 'Collection & disposal completed successfully at Perungudi Facility.'
      });
    } else {
      onCompletePickup(taskId, weight, photoPreviewUrl);
    }
    stopLiveGps();
  };

  return (
    <div className="space-y-6">
      {/* 🚨 Immediate In-App New Assignment Notification Banner */}
      {newlyAssignedTasks.length > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white shadow-xl border border-amber-400 animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-white text-amber-900">
                  New Task Assigned by Dispatch
                </span>
                <h3 className="text-base sm:text-lg font-black mt-1">
                  Task {newlyAssignedTasks[0].id} {newlyAssignedTasks[0].complaintId ? `(Complaint ${newlyAssignedTasks[0].complaintId})` : ''}
                </h3>
                <p className="text-xs text-amber-100 mt-0.5">
                  Location: <strong>{newlyAssignedTasks[0].binAddress}</strong> • Est: <strong>{newlyAssignedTasks[0].estimatedWeightKg} kg</strong> ({newlyAssignedTasks[0].wasteCategory || 'Mixed'})
                </p>
                <p className="text-xs text-amber-100 mt-1">
                  Dispatch details: <strong>{newlyAssignedTasks[0].allocationReason}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                onClick={() => setRejectingTask(newlyAssignedTasks[0])}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                Reject Task
              </button>
              <button
                onClick={() => handleAcceptAssignment(newlyAssignedTasks[0].id)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Accept Task</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. DASHBOARD, MY ROUTE, OR MY PICKUPS */}
      {(activeNav === 'dashboard' || activeNav === 'overview' || activeNav === 'my-route' || activeNav === 'my-pickups') && (
        <div className="space-y-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 text-white shadow-lg border border-blue-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
                  <span>{isAuto ? '🛺' : '🚛'}</span>
                  <span>Chennai Municipal Fleet Driver</span>
                </span>
                <span className="text-xs text-slate-300">
                  Vehicle: <strong>{myTruck.name}</strong> ({myTruck.maxPayloadKg} kg Max Payload)
                </span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                Vanakkam, {currentUser.fullName}
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                Asset ID: <strong className="font-mono text-blue-300">{myTruck.id}</strong> ({myTruck.registrationNumber}) • Model: <strong>{myTruck.model}</strong> • Ward: <strong>{myTruck.currentZone}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <a 
                href="tel:1913" 
                className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Control Room: 1913</span>
              </a>

              <button
                onClick={toggleGpsSimulation}
                className={`px-3.5 py-2 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all ${
                  isSimulatingGps ? 'bg-amber-500 text-slate-900' : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
                title="Simulates real-time truck GPS coordinates along Chennai road grid"
              >
                <Compass className={`w-3.5 h-3.5 ${isSimulatingGps ? 'animate-spin' : ''}`} />
                <span>{isSimulatingGps ? 'GPS Simulation Active' : 'Test GPS Road Progress'}</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar - shown on dashboard, overview, and my-pickups */}
          {(activeNav === 'dashboard' || activeNav === 'overview' || activeNav === 'my-pickups') && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Payload Utilization</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-extrabold text-slate-900">{myTruck.verifiedCurrentPayloadKg} kg</span>
                <span className="text-xs font-bold text-blue-600">/ {myTruck.maxPayloadKg} kg</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                <div 
                  className={`h-full ${myTruck.payloadPercentage > 90 ? 'bg-red-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, myTruck.payloadPercentage)}%` }}
                />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Remaining Capacity</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-extrabold text-emerald-800">{myTruck.remainingCapacityKg} kg</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Safe payload margin</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Assigned Stops</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-extrabold text-blue-800">{activeTasks.length}</span>
                <span className="text-xs text-slate-500">Active queue</span>
              </div>
              <span className="text-[10px] text-blue-600 mt-1 block">{completedTasks.length} completed</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Live GPS Telemetry</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`w-2.5 h-2.5 rounded-full ${isGpsActive || myTruck.isGpsOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <span className="text-xs font-bold text-slate-900">
                  {isGpsActive || myTruck.isGpsOnline ? 'Satellite Active' : 'Standby'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 mt-1 block truncate">
                {myTruck.currentLatitude.toFixed(4)}°N, {myTruck.currentLongitude.toFixed(4)}°E
              </span>
            </div>
          </div>
        )}

          {/* Active Navigation & Step Progress Panel - shown on dashboard, overview, and my-route */}
          {(activeNav === 'dashboard' || activeNav === 'overview' || activeNav === 'my-route') && currentActiveTask && (
            <div className="bg-white rounded-3xl border border-blue-200 shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-blue-100 text-blue-900">
                      Current Active Route
                    </span>
                    <span className="font-mono text-xs text-slate-500">ID: {currentActiveTask.id}</span>
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900 mt-1">
                    {currentActiveTask.binAddress}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900">
                    Status: {currentActiveTask.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Step Flow Action Controls */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700 block">Workflow Action Step:</span>

                <div className="flex flex-wrap items-center gap-2">
                  {currentActiveTask.status === 'ASSIGNED' && (
                    <>
                      <button
                        onClick={() => handleAcceptAssignment(currentActiveTask.id)}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Accept Task</span>
                      </button>
                      <button
                        onClick={() => setRejectingTask(currentActiveTask)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm"
                      >
                        Reject Task
                      </button>
                    </>
                  )}

                  {currentActiveTask.status === 'ACCEPTED' && (
                    <button
                      onClick={() => handleStartRoute(currentActiveTask.id)}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>Start Route (En Route to Pickup)</span>
                    </button>
                  )}

                  {(currentActiveTask.status === 'EN_ROUTE_PICKUP' || currentActiveTask.status === 'EN_ROUTE') && (
                    <button
                      onClick={() => handleMarkArrived(currentActiveTask.id)}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Mark Arrived at Pickup Location</span>
                    </button>
                  )}

                  {currentActiveTask.status === 'ARRIVED_PICKUP' && (
                    <button
                      onClick={() => handleStartCollection(currentActiveTask.id)}
                      className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Start Waste Collection</span>
                    </button>
                  )}

                  {currentActiveTask.status === 'COLLECTING' && (
                    <button
                      onClick={() => handleOpenCollectionModal(currentActiveTask)}
                      className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2"
                    >
                      <Scale className="w-4 h-4" />
                      <span>Record Weight & Complete Collection</span>
                    </button>
                  )}

                  {currentActiveTask.status === 'WASTE_COLLECTED' && (
                    <button
                      onClick={() => handleStartDisposalRoute(currentActiveTask.id)}
                      className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>En Route to Disposal Destination (Perungudi)</span>
                    </button>
                  )}

                  {currentActiveTask.status === 'EN_ROUTE_DISPOSAL' && (
                    <button
                      onClick={() => handleFinalCompletion(currentActiveTask.id)}
                      className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Waste Unloaded & Finish Task</span>
                    </button>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 pt-1">
                  Destination: <strong>{currentActiveTask.destinationName || 'Perungudi Solid Waste Transfer Facility'}</strong> • Est: <strong>{currentActiveTask.estimatedWeightKg} kg</strong>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Map with Route Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Live Ward GPS Navigation & Route
              </h2>
              <span className="text-xs text-slate-500">
                Vehicle: <strong>{myTruck.name}</strong> • Sector: <strong>{myTruck.currentZone}</strong>
              </span>
            </div>
            <ChennaiMap 
              bins={bins.filter(b => b.zone === myTruck.currentZone || activeTasks.some(t => t.binId === b.id))}
              trucks={[myTruck]}
              activeRoute={{ points: routePoints, label: 'Driver Live Route' }}
            />
          </div>

          {/* Assigned Tasks Queue */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Today's Assigned Collection Stops</h3>
                <p className="text-xs text-slate-500">Field verification required at each point</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                {activeTasks.length} Pending
              </span>
            </div>

            {activeTasks.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <p className="font-bold text-sm text-slate-800">All assigned collections completed!</p>
                <p className="text-xs text-slate-500 mt-1">Check with central dispatch or head to zonal transfer station.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeTasks.map((task, idx) => (
                  <div key={task.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900">{task.binAddress}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                            {task.zone}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                            {task.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          ID: <strong className="font-mono">{task.id}</strong> {task.complaintId ? `• Complaint: ${task.complaintId}` : ''} • Est: <strong>{task.estimatedWeightKg} kg</strong>
                        </p>
                        <p className="text-[11px] text-blue-700 font-semibold mt-1">
                          Reason: {task.allocationReason}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {task.status === 'ASSIGNED' ? (
                        <>
                          <button
                            onClick={() => setRejectingTask(task)}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleAcceptAssignment(task.id)}
                            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl"
                          >
                            Accept
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleOpenCollectionModal(task)}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                        >
                          Update / Verify
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. MY TRUCK SECTION */}
      {activeNav === 'my-truck' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6 max-w-4xl mx-auto">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-blue-100 text-blue-900 uppercase">
                {myTruck.id} Fleet Asset
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900 mt-2">{myTruck.name}</h1>
              <p className="text-xs text-slate-500">Registration: {myTruck.registrationNumber} • Model: {myTruck.model}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              myTruck.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
            }`}>
              Status: {myTruck.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 font-semibold">Configured Payload Capacity</span>
              <p className="text-2xl font-extrabold text-slate-900">{myTruck.maxPayloadKg} kg</p>
              <span className="text-[10px] text-slate-400">
                {isAuto ? `${myTruck.maxPayloadKg}kg Electric Auto Rickshaw cap` : 'Fixed municipal payload limit'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 font-semibold">Verified Current Net Payload</span>
              <p className="text-2xl font-extrabold text-emerald-800">
                {myTruck.verifiedCurrentPayloadKg} kg ({myTruck.payloadPercentage}%)
              </p>
              <span className="text-[10px] text-emerald-600 font-medium">Remaining: {myTruck.remainingCapacityKg} kg</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 font-semibold">Vehicle Type & Specs</span>
              <p className="text-base font-extrabold text-slate-900">{myTruck.vehicleType || (isAuto ? 'Waste Collection Auto' : 'Heavy Vehicle')}</p>
              <span className="text-[10px] text-slate-400">Powertrain: {myTruck.fuelOrBattery}</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. DRIVER PROFILE SECTION */}
      {activeNav === 'profile' && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-blue-900/60 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 text-white font-extrabold flex items-center justify-center text-2xl sm:text-3xl shadow-lg border-2 border-white/20 shrink-0">
                {currentUser.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Municipal Sanitation Driver
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    On-Duty Shift
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  {currentUser.fullName}
                </h1>
                <p className="text-xs text-slate-300 flex items-center gap-2 flex-wrap">
                  <span>Badge ID: <strong className="font-mono text-white">{currentUser.employeeId || `DRV-CHN-${currentUser.id.slice(-4)}`}</strong></span>
                  <span>•</span>
                  <span>License: <strong className="text-white">TN-01-COMMERCIAL-HV</strong></span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <a
                href="tel:1913"
                className="px-3.5 py-2 bg-emerald-700/80 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 border border-emerald-500/30"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Control Room (1913)</span>
              </a>
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-red-600/90 hover:bg-red-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer border border-red-500/40"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Assigned Fleet Asset</span>
              <p className="text-lg font-extrabold text-blue-900 truncate">{myTruck.id}</p>
              <span className="text-[10px] text-slate-400 block truncate">{myTruck.name}</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Completed Stops</span>
              <p className="text-2xl font-extrabold text-emerald-700">{completedTasks.length}</p>
              <span className="text-[10px] text-slate-400 block">{activeTasks.length} pending today</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Waste Collected</span>
              <p className="text-2xl font-extrabold text-slate-900">
                {completedTasks.reduce((acc, t) => acc + (t.actualWeightKg || t.estimatedWeightKg || 0), 0) + myTruck.verifiedCurrentPayloadKg} kg
              </p>
              <span className="text-[10px] text-emerald-600 font-semibold block">Today's verified total</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Eco-Driver Score</span>
              <p className="text-2xl font-extrabold text-amber-600">4.9 <span className="text-xs text-slate-400">/ 5.0</span></p>
              <span className="text-[10px] text-slate-400 block">Clean route compliance</span>
            </div>
          </div>

          {/* Detailed Info Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personnel & Contact Details Form */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Driver Credentials & Contact</h3>
                  <p className="text-[11px] text-slate-500">Official Municipal Personnel Record</p>
                </div>
              </div>

              {profileSavedToast && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Profile contact information saved successfully.</span>
                </div>
              )}

              <form onSubmit={handleSaveDriverProfile} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Driver Name</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.fullName}
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-900 cursor-not-allowed"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Managed by Municipal Administrative Portal</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Employee Badge ID</label>
                    <input
                      type="text"
                      disabled
                      value={currentUser.employeeId || `DRV-CHN-${currentUser.id.slice(-4)}`}
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-800 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Commercial License</label>
                    <input
                      type="text"
                      disabled
                      value="TN-01-COMMERCIAL-HV"
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-800 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Official Mobile *</label>
                    <input
                      type="tel"
                      required
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-emerald-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Emergency Dispatch *</label>
                    <input
                      type="tel"
                      required
                      value={profileEmergencyPhone}
                      onChange={(e) => setProfileEmergencyPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-emerald-500 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Operational Fleet Base Station / Garage</label>
                  <input
                    type="text"
                    value={profileDepot}
                    onChange={(e) => setProfileDepot(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Driver Endorsements & Shift Notes</label>
                  <textarea
                    rows={2}
                    value={profileNotes}
                    onChange={(e) => setProfileNotes(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-emerald-500 resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Contact Changes</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Vehicle & Assignment Specs Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <TruckIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Assigned Fleet Vehicle</h3>
                  <p className="text-[11px] text-slate-500">Live Telemetry & Capacity Allocation</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Vehicle Asset ID:</span>
                  <span className="px-2 py-0.5 rounded font-mono font-black text-blue-900 bg-blue-50 border border-blue-200">
                    {myTruck.id}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Model & Name:</span>
                  <span className="font-bold text-slate-900">{myTruck.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Registration Number:</span>
                  <span className="font-mono font-bold text-slate-800">{myTruck.registrationNumber}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Rated Max Payload:</span>
                  <span className="font-black text-slate-900">{myTruck.maxPayloadKg} kg</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Current Net Payload:</span>
                  <span className="font-bold text-emerald-700">
                    {myTruck.verifiedCurrentPayloadKg} kg ({myTruck.payloadPercentage}%)
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Safe Remaining Margin:</span>
                  <span className="font-extrabold text-blue-700">{myTruck.remainingCapacityKg} kg</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">GPS Satellite Uplink:</span>
                  <span className="flex items-center gap-1 font-bold text-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Online ({myTruck.currentLatitude.toFixed(4)}°N, {myTruck.currentLongitude.toFixed(4)}°E)
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Equipment Health:</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {myTruck.weightSensorHealth === 'HEALTHY' ? 'HEALTHY & OPERATIONAL' : (myTruck.weightSensorHealth || 'HEALTHY')}
                  </span>
                </div>
              </div>

              {/* Quick Actions inside Vehicle Card */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate('my-truck')}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <TruckIcon className="w-3.5 h-3.5" />
                  <span>Full Truck Telemetry</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('my-route')}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>View Active Route</span>
                </button>
              </div>
            </div>
          </div>

          {/* Operational Shift & Protocol Notice Card */}
          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Municipal Collection Protocols & Safety Checklist</span>
            </div>
            <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
              <li>Always verify physical waste weight on calibrated vehicle scale before confirming collection in the app.</li>
              <li>Ensure clear photo snapshot is captured showing bin address and cleared state.</li>
              <li>If vehicle payload reaches 90% or more, initiate transfer route to Perungudi Processing Facility.</li>
              <li>Emergency breakdown or overflow assistance: Call Control Room at <strong>1913</strong> immediately.</li>
            </ul>
          </div>
        </div>
      )}

      {/* 3. REJECTION MODAL */}
      {rejectingTask && (
        <TaskRejectModal
          task={rejectingTask}
          onClose={() => setRejectingTask(null)}
          onConfirmReject={(taskId, reason) => {
            if (onRejectTask) onRejectTask(taskId, reason);
            setRejectingTask(null);
          }}
        />
      )}

      {/* 4. COLLECTION CONFIRMATION MODAL */}
      {collectionModalTask && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight">Record Collected Waste</h3>
                  <p className="text-xs text-slate-400">Task ID: {collectionModalTask.id}</p>
                </div>
              </div>
              <button
                onClick={() => setCollectionModalTask(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCollectionSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <span className="text-slate-500 block mb-0.5">Pickup Address:</span>
                <p className="font-extrabold text-slate-900">{collectionModalTask.binAddress} ({collectionModalTask.zone})</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Actual Measured Garbage Weight (kg) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={myTruck.maxPayloadKg}
                  value={verifiedWeightInput}
                  onChange={(e) => setVerifiedWeightInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-extrabold text-base focus:outline-emerald-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Maximum vehicle rating: {myTruck.maxPayloadKg} kg
                </span>
              </div>

              {/* Photo Proof Upload */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Collection Photo Proof / On-Site Snapshot</label>
                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50 flex items-center gap-3">
                  <img
                    src={photoPreviewUrl}
                    alt="Proof snapshot"
                    className="w-16 h-16 rounded-lg object-cover border border-slate-200"
                  />
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-800 block">Municipal Time-Stamped Photo</span>
                    <button
                      type="button"
                      onClick={() => setPhotoPreviewUrl('https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=600&q=80')}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-lg text-[10px] flex items-center gap-1"
                    >
                      <Camera className="w-3 h-3 text-emerald-600" />
                      <span>Take / Replace Snapshot</span>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Driver Field Remarks & Problem Notes</label>
                <textarea
                  rows={2}
                  value={collectionRemarks}
                  onChange={(e) => setCollectionRemarks(e.target.value)}
                  placeholder="e.g. Cleared all piled bags; street is clear; citizen verified pickup."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-emerald-500 placeholder:text-slate-400"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCollectionModalTask(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Waste Collected</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
