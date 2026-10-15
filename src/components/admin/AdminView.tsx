import React, { useState } from 'react';
import { 
  Dustbin, 
  Truck, 
  PickupTask, 
  LevelSensor, 
  WeightSensor, 
  SmellSensor, 
  StreetCamera, 
  DeviceAlert, 
  WardComplaint, 
  AuditLog, 
  ChennaiZone, 
  User,
  TruckId,
  ComplaintStatus
} from '../../types';
import { ChennaiMap } from '../common/ChennaiMap';
import { ChennaiAllocationEngine, MultiBinRouteCandidate } from '../../services/allocationEngine';
import { AdminProfileView } from './AdminProfileView';
import { ComplaintAllocationModal } from './ComplaintAllocationModal';
import { PhoneComplaintModal } from './PhoneComplaintModal';
import { EmailSetupModal } from './EmailSetupModal';
import { ManualAllocationView } from './ManualAllocationView';
import { OFFICIAL_COMPLAINT_EMAIL } from '../../services/complaintService';
import { 
  BarChart3, 
  Truck as TruckIcon, 
  MapPin, 
  AlertTriangle, 
  Camera, 
  Cpu, 
  Wind, 
  Scale, 
  CheckCircle2, 
  Plus, 
  Download, 
  FileSpreadsheet, 
  ShieldCheck, 
  Zap, 
  Users, 
  Navigation, 
  Clock,
  Radio,
  Sliders,
  Sparkles,
  Phone,
  Mail,
  Search,
  Filter,
  RefreshCw,
  PhoneCall,
  RotateCcw,
  Eye,
  Info
} from 'lucide-react';

interface AdminViewProps {
  currentUser: User;
  activeNav: string;
  onNavigate: (nav: string) => void;
  bins: Dustbin[];
  trucks: Truck[];
  tasks: PickupTask[];
  levelSensors: LevelSensor[];
  weightSensors: WeightSensor[];
  smellSensors: SmellSensor[];
  cameras: StreetCamera[];
  alerts: DeviceAlert[];
  complaints: WardComplaint[];
  auditLogs: AuditLog[];
  onTriggerAllocation: (binId: string) => void;
  onAcknowledgeAlert: (alertId: string) => void;
  onAddBin: (bin: Partial<Dustbin>) => void;
  onUpdateTruckStatus: (truckId: TruckId, status: any) => void;
  onManualOverrideTask: (taskId: string, newTruckId: TruckId) => void;
  onManualAllocateComplaint?: (
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
  ) => void;
  onUpdateComplaintStatus?: (complaintId: string, status: ComplaintStatus, notes?: string) => void;
  onRegisterPhoneComplaint?: (data: any) => void;
  onSyncIncomingEmails?: () => void;
  onCancelTask?: (taskId: string, reason: string) => void;
  onUpdateUser?: (user: User) => void;
  onLogout?: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  currentUser,
  activeNav,
  onNavigate,
  bins,
  trucks,
  tasks,
  levelSensors,
  weightSensors,
  smellSensors,
  cameras,
  alerts,
  complaints,
  auditLogs,
  onTriggerAllocation,
  onAcknowledgeAlert,
  onAddBin,
  onUpdateTruckStatus,
  onManualOverrideTask,
  onManualAllocateComplaint,
  onUpdateComplaintStatus,
  onRegisterPhoneComplaint,
  onSyncIncomingEmails,
  onCancelTask,
  onUpdateUser,
  onLogout
}) => {
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>('ALL');
  const [showAddBinModal, setShowAddBinModal] = useState(false);

  // Citizen Complaint Management States
  const [allocatingComplaint, setAllocatingComplaint] = useState<WardComplaint | null>(null);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showEmailSetupModal, setShowEmailSetupModal] = useState(false);
  const [complaintFilter, setComplaintFilter] = useState<'ALL' | 'NEW' | 'UNDER_REVIEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED'>('ALL');
  const [complaintSearch, setComplaintSearch] = useState('');
  const [isSyncingEmail, setIsSyncingEmail] = useState(false);

  // New bin form state
  const [newBinAddress, setNewBinAddress] = useState('');
  const [newBinZone, setNewBinZone] = useState<ChennaiZone>('T. Nagar');
  const [newBinType, setNewBinType] = useState<any>('COMMERCIAL_MIXED');
  const [newBinCapacity, setNewBinCapacity] = useState('250');

  // Multi-bin route candidate evaluation
  const multiBinRoutes = ChennaiAllocationEngine.evaluateMultiBinRoutes(bins, trucks);

  // Export report to CSV
  const handleExportCsv = (type: 'BINS' | 'TASKS' | 'ALERTS' | 'AUDIT') => {
    let headers: string[] = [];
    let rows: any[][] = [];
    let filename = '';

    if (type === 'BINS') {
      headers = ['Bin ID', 'Street Address', 'Zone', 'Fill %', 'Weight kg', 'Smell ppm', 'Status', 'Equipment Health'];
      rows = bins.map(b => [b.id, `"${b.streetAddress}"`, b.zone, b.latestFillPercentage, b.currentWeightKg || 'N/A', b.smellIndexPpm || 'N/A', b.collectionStatus, b.equipmentHealth]);
      filename = `Chennai_Dustbins_Registry_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (type === 'TASKS') {
      headers = ['Task ID', 'Bin ID', 'Zone', 'Estimated Weight kg', 'Assigned Truck', 'Driver', 'Status', 'Allocation Reason'];
      rows = tasks.map(t => [t.id, t.binId, t.zone, t.estimatedWeightKg, t.assignedTruckId, t.assignedDriverName, t.status, `"${t.allocationReason}"`]);
      filename = `Chennai_Pickups_Report_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (type === 'ALERTS') {
      headers = ['Alert ID', 'Device Type', 'Device ID', 'Zone', 'Severity', 'Message', 'Timestamp', 'Acknowledged'];
      rows = alerts.map(a => [a.id, a.deviceType, a.deviceId, a.zone || 'N/A', a.severity, `"${a.message}"`, a.timestamp, a.acknowledged]);
      filename = `Chennai_Sensor_Alerts_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      headers = ['Audit ID', 'Actor', 'Action', 'Entity', 'Record ID', 'Details', 'Timestamp'];
      rows = auditLogs.map(l => [l.id, l.actorName, l.action, l.entity, l.recordId, `"${l.details}"`, l.timestamp]);
      filename = `Chennai_System_Audit_${new Date().toISOString().split('T')[0]}.csv`;
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateBin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBinAddress.trim()) return;

    onAddBin({
      id: `BIN-CHN-${newBinZone.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-2)}`,
      streetAddress: newBinAddress.trim(),
      zone: newBinZone,
      latitude: 13.0418 + (Math.random() - 0.5) * 0.05,
      longitude: 80.2341 + (Math.random() - 0.5) * 0.05,
      binType: newBinType,
      maxPhysicalCapacityKg: parseInt(newBinCapacity, 10) || 200,
      levelSensorId: `LS-${Date.now().toString().slice(-4)}`,
      latestFillPercentage: 20,
      equipmentHealth: 'NORMAL',
      collectionStatus: 'NORMAL',
      pickupPriority: 'NORMAL',
      fillRatePerHour: 3.5,
      lastSensorUpdate: new Date().toISOString()
    });

    setShowAddBinModal(false);
    setNewBinAddress('');
  };

  // Helper Stats
  const criticalBins = bins.filter(b => b.latestFillPercentage >= 90).length;
  const nearlyFullBins = bins.filter(b => b.latestFillPercentage >= 75 && b.latestFillPercentage < 90).length;
  const activeAlertsCount = alerts.filter(a => !a.acknowledged).length;
  const activePickupCount = tasks.filter(t => t.status === 'ASSIGNED' || t.status === 'EN_ROUTE' || t.status === 'COLLECTING').length;

  const truck500 = trucks.find(t => t.id === 'TRUCK-500') || trucks[0];
  const truck1000 = trucks.find(t => t.id === 'TRUCK-1000') || trucks[1];

  return (
    <div className="space-y-6">
      {/* 1. OVERVIEW SECTION */}
      {activeNav === 'overview' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-emerald-900/60 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Chennai Smart Operations Center
                </span>
                <span className="text-xs text-slate-300">EcoTrack AI</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Chennai Municipal Waste Command
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Supervising street-level dustbins, level/weight/smell sensors, AI cameras, and capacity-aware fleet allocation across 10 Chennai operational zones.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onNavigate('map')}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <Navigation className="w-4 h-4" /> Live Chennai GIS Map
              </button>
              <button
                onClick={() => onNavigate('allocation')}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-1.5"
              >
                <Zap className="w-4 h-4 text-emerald-400" /> Auto Allocation Engine
              </button>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block">Total Chennai Bins</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{bins.length}</p>
              <span className="text-[10px] text-slate-400 mt-0.5 block">10 Wards Monitored</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-red-600 block">Urgent Overflow (≥90%)</span>
              <p className="text-2xl font-extrabold text-red-700 mt-1">{criticalBins}</p>
              <span className="text-[10px] text-red-600 mt-0.5 block">Immediate collection</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-amber-600 block">Nearly Full (≥75%)</span>
              <p className="text-2xl font-extrabold text-amber-700 mt-1">{nearlyFullBins}</p>
              <span className="text-[10px] text-amber-600 mt-0.5 block">Pre-allocation active</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-blue-600 block">Active Pickups</span>
              <p className="text-2xl font-extrabold text-blue-700 mt-1">{activePickupCount}</p>
              <span className="text-[10px] text-blue-600 mt-0.5 block">En route or collecting</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-purple-600 block">Sensor/Camera Alerts</span>
              <p className="text-2xl font-extrabold text-purple-700 mt-1">{activeAlertsCount}</p>
              <span className="text-[10px] text-purple-600 mt-0.5 block">Unacknowledged</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block">Active Cameras</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{cameras.length}</p>
              <span className="text-[10px] text-emerald-600 mt-0.5 block">Optical AI edge feeds</span>
            </div>
          </div>

          {/* Dedicated Fleet Section (TRUCK-500 vs TRUCK-1000) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <TruckIcon className="w-5 h-5 text-emerald-700" /> Initial Fleet Registry (Two Distinct Payload Capacities)
                </h2>
                <p className="text-xs text-slate-500">Configured maximum garbage payload capacities — safe remaining load calculated from verified weight</p>
              </div>
              <button
                onClick={() => onNavigate('trucks')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
              >
                Inspect Fleet Details →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* TRUCK-500 Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-slate-50 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                      Truck ID: TRUCK-500
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 mt-1">{truck500.name}</h3>
                    <p className="text-xs text-slate-500 font-mono">{truck500.registrationNumber} • {truck500.model}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${truck500.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-blue-100 text-blue-800 border-blue-300'}`}>
                    {truck500.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>Verified Current Payload:</span>
                    <span>{truck500.verifiedCurrentPayloadKg} kg / 500 kg ({truck500.payloadPercentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${truck500.payloadPercentage > 85 ? 'bg-red-500' : 'bg-emerald-600'}`}
                      style={{ width: `${Math.min(100, truck500.payloadPercentage)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] pt-1">
                    <span className="text-emerald-700 font-extrabold">
                      Remaining Safe Capacity: <strong>{truck500.remainingCapacityKg} kg</strong>
                    </span>
                    <span className="text-slate-500">Sector: <strong>{truck500.currentZone}</strong></span>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-100 flex items-center justify-between text-xs text-slate-600">
                  <span>Driver: <strong>{truck500.driverName}</strong> ({truck500.driverPhone})</span>
                  <span>Sensor: <strong className="text-emerald-700">{truck500.weightSensorHealth}</strong></span>
                </div>
              </div>

              {/* TRUCK-1000 Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/50 to-slate-50 border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-blue-200 text-blue-900">
                      Truck ID: TRUCK-1000
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 mt-1">{truck1000.name}</h3>
                    <p className="text-xs text-slate-500 font-mono">{truck1000.registrationNumber} • {truck1000.model}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${truck1000.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-blue-100 text-blue-800 border-blue-300'}`}>
                    {truck1000.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>Verified Current Payload:</span>
                    <span>{truck1000.verifiedCurrentPayloadKg} kg / 1,000 kg ({truck1000.payloadPercentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${truck1000.payloadPercentage > 85 ? 'bg-red-500' : 'bg-blue-600'}`}
                      style={{ width: `${Math.min(100, truck1000.payloadPercentage)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] pt-1">
                    <span className="text-blue-700 font-extrabold">
                      Remaining Safe Capacity: <strong>{truck1000.remainingCapacityKg} kg</strong>
                    </span>
                    <span className="text-slate-500">Sector: <strong>{truck1000.currentZone}</strong></span>
                  </div>
                </div>

                <div className="pt-2 border-t border-blue-100 flex items-center justify-between text-xs text-slate-600">
                  <span>Driver: <strong>{truck1000.driverName}</strong> ({truck1000.driverPhone})</span>
                  <span>Sensor: <strong className="text-emerald-700">{truck1000.weightSensorHealth}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Embedded Map Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-600" /> Live Chennai Metropolitan Map Telemetry
              </h3>
              <button onClick={() => onNavigate('map')} className="text-xs font-bold text-emerald-700">
                Open Fullscreen GIS View →
              </button>
            </div>
            <ChennaiMap 
              bins={bins} 
              trucks={trucks} 
              cameras={cameras} 
              complaints={complaints}
              onSelectComplaint={(id) => {
                const cmp = complaints.find(c => c.id === id);
                if (cmp) setAllocatingComplaint(cmp);
              }}
            />
          </div>
        </div>
      )}

      {/* 2. LIVE CHENNAI MAP SECTION */}
      {activeNav === 'map' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Live Chennai GIS Operations Map</h1>
              <p className="text-xs text-slate-500">Real-time GPS positions of municipal fleet trucks and 100kg and 200kg Eco Autos, citizen grievances, street dustbins, and IoT equipment</p>
            </div>
          </div>
          <ChennaiMap 
            bins={bins} 
            trucks={trucks} 
            cameras={cameras} 
            complaints={complaints}
            onSelectComplaint={(id) => {
              const cmp = complaints.find(c => c.id === id);
              if (cmp) setAllocatingComplaint(cmp);
            }}
          />
        </div>
      )}

      {/* 3. AUTOMATIC TRUCK ALLOCATION ENGINE SECTION */}
      {activeNav === 'allocation' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500 fill-amber-500" /> Intelligent Automatic Truck Allocation Engine
                </h1>
                <p className="text-xs text-slate-500">
                  Autonomous capacity-aware evaluation matching high-fill dustbins with TRUCK-500 (500kg) or TRUCK-1000 (1,000kg)
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Engine Active & Monitoring
              </span>
            </div>

            {/* Candidate Multi-Bin Route Clusters */}
            <div className="space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Multi-Bin Candidate Route Clusters (Section 11)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {multiBinRoutes.map((cluster, i) => (
                  <div key={i} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">{cluster.routeZone} Zone Cluster</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cluster.fitsCapacity ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {cluster.fitsCapacity ? 'Capacity Compliant' : 'Partition Required'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{cluster.explanation}</p>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200 text-slate-500">
                      <span>Total Combined Load: <strong>{cluster.totalEstimatedWeightKg} kg</strong></span>
                      <span>Assigned: <strong className="text-emerald-700">{cluster.recommendedTruckId}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Eligible Bins Awaiting or Ready for Dispatch */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Eligible High-Fill Bins Ready for Automated / Manual Dispatch
              </h3>
              <div className="space-y-3">
                {bins.filter(b => b.latestFillPercentage >= 75).map(bin => {
                  const evalResult = ChennaiAllocationEngine.evaluateAndAllocate(bin, trucks, tasks);
                  const isAssigned = tasks.some(t => t.binId === bin.id && t.status !== 'COMPLETED');

                  return (
                    <div key={bin.id} className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 bg-white shadow-2xs space-y-2 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                            {bin.id}
                          </span>
                          <span className="font-bold text-sm text-slate-900">{bin.streetAddress}</span>
                          <span className="text-xs text-slate-500 font-semibold">({bin.zone})</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${bin.latestFillPercentage >= 90 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                            Fill: {bin.latestFillPercentage}% ({bin.currentWeightKg || 'N/A'} kg)
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isAssigned ? (
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold rounded-xl flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Task Dispatched
                            </span>
                          ) : (
                            <button
                              onClick={() => onTriggerAllocation(bin.id)}
                              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center gap-1.5"
                            >
                              <Zap className="w-3.5 h-3.5" /> Execute Auto Allocation
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-600 flex items-start gap-2">
                        <span className="font-bold text-slate-800 shrink-0">Engine Decision:</span>
                        <span className="leading-relaxed">{evalResult.reason}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. PICKUPS SECTION */}
      {activeNav === 'pickups' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">Municipal Pickup Tasks & Verification</h1>
              <p className="text-xs text-slate-500">Live collection tasks dispatched across TRUCK-500 and TRUCK-1000</p>
            </div>
            <button
              onClick={() => handleExportCsv('TASKS')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export Tasks CSV
            </button>
          </div>

          <div className="space-y-3">
            {tasks.map(task => (
              <div key={task.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{task.id}</span>
                      <span className="font-extrabold text-sm text-slate-900">{task.binAddress}</span>
                      <span className="text-xs text-slate-500 font-medium">({task.zone})</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Estimated Weight: <strong>{task.estimatedWeightKg} kg</strong> • Priority: <strong>{task.priority}</strong>
                      {task.actualWeightKg !== undefined && <> • Driver Verified: <strong>{task.actualWeightKg} kg</strong></>}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Assigned to: <strong>{task.assignedDriverName}</strong> ({task.assignedTruckId})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                      {task.status}
                    </span>

                    {/* Manual override controls (Section 10.5) */}
                    {task.status !== 'COMPLETED' && (
                      <select
                        value={task.assignedTruckId}
                        onChange={(e) => onManualOverrideTask(task.id, e.target.value as any)}
                        className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-semibold"
                        title="Authorized Administrative Reassignment"
                      >
                        <option value="TRUCK-500">Reassign to TRUCK-500</option>
                        <option value="TRUCK-1000">Reassign to TRUCK-1000</option>
                      </select>
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl">
                  <strong>Allocation Trail:</strong> {task.allocationReason}
                </div>
                {(task.driverRemarks || task.rejectionReason || task.completionPhotoUrl || task.activityHistory?.length) && (
                  <div className="space-y-2 rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-xs">
                    <strong className="text-slate-800">Driver Updates</strong>
                    {task.driverRemarks && (
                      <p className="text-slate-700"><strong>Remarks:</strong> {task.driverRemarks}</p>
                    )}
                    {task.rejectionReason && (
                      <p className="text-red-700"><strong>Rejection reason:</strong> {task.rejectionReason}</p>
                    )}
                    {task.completionPhotoUrl && (
                      <a
                        href={task.completionPhotoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex font-bold text-blue-700 hover:text-blue-900 underline"
                      >
                        View driver verification photo
                      </a>
                    )}
                    {task.activityHistory && task.activityHistory.length > 0 && (
                      <ol className="space-y-1 border-t border-blue-100 pt-2">
                        {task.activityHistory.map((entry, index) => (
                          <li key={`${entry.timestamp}-${entry.status}-${index}`} className="text-slate-600">
                            <span className="font-bold text-slate-800">{entry.status.replace(/_/g, ' ')}</span>
                            {' · '}{entry.actor}{' · '}
                            {new Date(entry.timestamp).toLocaleString()}
                            {entry.note && <div className="pl-2 text-slate-500">{entry.note}</div>}
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TRUCKS SECTION */}
      {activeNav === 'trucks' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="pb-3 border-b border-slate-100">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">Chennai Fleet Registry & Payload Weight Sensors</h1>
            <p className="text-xs text-slate-500">Initial fleet of two commercial garbage vehicles with distinct maximum payload limits</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trucks.map(truck => (
              <div key={truck.id} className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-xs px-2.5 py-1 rounded-md bg-slate-200 text-slate-800">
                      {truck.id}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-2">{truck.name}</h3>
                    <p className="text-xs text-slate-500">{truck.registrationNumber} • {truck.model}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-500 block">Status</span>
                    <select
                      value={truck.status}
                      onChange={(e) => onUpdateTruckStatus(truck.id, e.target.value as any)}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                    >
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="ASSIGNED">ASSIGNED</option>
                      <option value="EN_ROUTE">EN_ROUTE</option>
                      <option value="COLLECTING">COLLECTING</option>
                      <option value="MAINTENANCE">MAINTENANCE</option>
                      <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
                    </select>
                  </div>
                </div>

                {/* Verified Weight Telemetry */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between font-bold">
                    <span>Configured Garbage Payload Limit:</span>
                    <span>{truck.maxPayloadKg} kg</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Verified Current Payload:</span>
                    <span className="font-bold">{truck.verifiedCurrentPayloadKg} kg ({truck.payloadPercentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${Math.min(100, truck.payloadPercentage)}%` }}
                    />
                  </div>
                  <div className="flex justify-between pt-1 font-bold text-emerald-800">
                    <span>Remaining Safe Capacity:</span>
                    <span>{truck.remainingCapacityKg} kg</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <div>Assigned Driver: <strong>{truck.driverName}</strong> ({truck.driverPhone})</div>
                  <div>Current Operational Ward: <strong>{truck.currentZone}</strong></div>
                  <div>Telemetry: <strong>{truck.isGpsOnline ? 'Live Satellite Signal' : 'Stale'}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. DUSTBINS SECTION */}
      {activeNav === 'dustbins' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">Street-Level Dustbin Registry (Chennai)</h1>
              <p className="text-xs text-slate-500">Registered dustbins across T. Nagar, Adyar, Velachery, Anna Nagar, Mylapore, etc.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportCsv('BINS')}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Export Bins CSV
              </button>
              <button
                onClick={() => setShowAddBinModal(true)}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-4 h-4" /> Register New Bin
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="pb-3 px-2">Bin ID</th>
                  <th className="pb-3 px-2">Street Address & Ward</th>
                  <th className="pb-3 px-2">Type</th>
                  <th className="pb-3 px-2 text-right">Fill Level</th>
                  <th className="pb-3 px-2 text-right">Weight</th>
                  <th className="pb-3 px-2 text-right">Smell PPM</th>
                  <th className="pb-3 px-2">Equipment</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bins.map(bin => (
                  <tr key={bin.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-2 font-mono font-bold text-slate-800">{bin.id}</td>
                    <td className="py-3 px-2">
                      <div className="font-bold text-slate-900">{bin.streetAddress}</div>
                      <div className="text-[11px] text-slate-500 font-semibold">{bin.zone}</div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {bin.binType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span className={`font-extrabold ${bin.latestFillPercentage >= 90 ? 'text-red-700' : bin.latestFillPercentage >= 75 ? 'text-amber-700' : 'text-emerald-700'}`}>
                        {bin.latestFillPercentage}%
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right font-medium text-slate-700">
                      {bin.currentWeightKg ? `${bin.currentWeightKg} kg` : 'N/A'}
                    </td>
                    <td className="py-3 px-2 text-right font-medium text-slate-700">
                      {bin.smellIndexPpm ? `${bin.smellIndexPpm} ppm` : 'N/A'}
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-[10px] font-bold text-slate-600">
                        {bin.equipmentHealth}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {bin.collectionStatus}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      {bin.latestFillPercentage >= 75 && (
                        <button
                          onClick={() => onTriggerAllocation(bin.id)}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[10px] font-bold"
                        >
                          Auto Allocate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. SENSORS SECTION (Level, Weight, Smell) */}
      {activeNav === 'sensors' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">IoT Sensors Telemetry (Level, Weight & Smell)</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-xs text-emerald-900">
                  <span className="flex items-center gap-1.5"><Radio className="w-4 h-4" /> Ultrasonic Level Sensors</span>
                  <span>{levelSensors.length} Deployed</span>
                </div>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  LoRaWAN ultrasonic distance gauges monitoring bin fill volume and rates of filling.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-xs text-blue-900">
                  <span className="flex items-center gap-1.5"><Scale className="w-4 h-4" /> Strain Gauge Weight Sensors</span>
                  <span>{weightSensors.length} Deployed</span>
                </div>
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  Calibrated net garbage weighing on both truck chassis and select heavy street bins.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-xs text-amber-900">
                  <span className="flex items-center gap-1.5"><Wind className="w-4 h-4" /> Gas & Smell Sensors (H2S / NH3)</span>
                  <span>{smellSensors.length} Deployed</span>
                </div>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Electrochemical sensors monitoring fermentation gases and offensive organic decomposition.
                </p>
              </div>
            </div>

            {/* Smell Sensor Table */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900 mb-2">Smell Sensor Live Readings</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                      <th className="pb-2">Sensor ID</th>
                      <th className="pb-2">Associated Bin</th>
                      <th className="pb-2">Measured Gas</th>
                      <th className="pb-2 text-right">Reading PPM</th>
                      <th className="pb-2 text-right">Threshold</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {smellSensors.map(s => (
                      <tr key={s.id}>
                        <td className="py-2.5 font-mono font-bold text-slate-700">{s.id}</td>
                        <td className="py-2.5 font-medium text-slate-800">{s.binId}</td>
                        <td className="py-2.5 font-bold text-slate-900">{s.measuredGas}</td>
                        <td className={`py-2.5 text-right font-extrabold ${s.status === 'CRITICAL_EXCEEDED' ? 'text-red-700' : 'text-slate-800'}`}>
                          {s.readingPpm} ppm
                        </td>
                        <td className="py-2.5 text-right text-slate-500">{s.thresholdPpm} ppm</td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.status === 'CRITICAL_EXCEEDED' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. STREET CAMERAS SECTION */}
      {activeNav === 'cameras' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">Street-Level Dustbin Camera Feeds & AI Vision</h1>
              <p className="text-xs text-slate-500">Edge optical cameras verifying physical overflow and lens health</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cameras.map(cam => (
              <div key={cam.id} className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 flex flex-col justify-between">
                <div className="relative h-44 bg-slate-900">
                  <img 
                    src={cam.snapshotUrl} 
                    alt={cam.locationName} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white font-mono text-[10px] font-bold backdrop-blur-xs">
                    {cam.id}
                  </div>
                  <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold ${cam.status === 'ACTIVE' ? 'bg-emerald-500 text-white' : 'bg-red-600 text-white'}`}>
                    {cam.status}
                  </div>
                </div>

                <div className="p-3.5 space-y-1.5 text-xs">
                  <h4 className="font-bold text-slate-900 truncate">{cam.locationName}</h4>
                  <p className="text-[11px] text-slate-500">Zone: <strong>{cam.zone}</strong></p>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-200">
                    <span>Optical Fill: <strong>{cam.opticalFillEstimatePct}%</strong></span>
                    <span>Overflow: <strong className={cam.detectedOverflowVisual ? 'text-red-600' : 'text-emerald-600'}>{cam.detectedOverflowVisual ? 'Detected' : 'Clear'}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. SENSOR AND CAMERA ALERTS SECTION */}
      {activeNav === 'alerts' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">Equipment, Sensor & Camera Malfunction Alerts</h1>
              <p className="text-xs text-slate-500">Persistent fault notifications requiring operator acknowledgement</p>
            </div>
            <button
              onClick={() => handleExportCsv('ALERTS')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export Alerts CSV
            </button>
          </div>

          <div className="space-y-3">
            {alerts.map(alert => (
              <div 
                key={alert.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  alert.severity === 'CRITICAL' ? 'bg-red-50/60 border-red-200' :
                  alert.severity === 'FAULT' ? 'bg-purple-50/60 border-purple-200' :
                  'bg-amber-50/60 border-amber-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-700">{alert.id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-slate-300">
                      {alert.deviceType}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">Device ID: {alert.deviceId}</span>
                  </div>
                  <p className="text-xs text-slate-800 font-medium leading-relaxed">{alert.message}</p>
                  <p className="text-[10px] text-slate-400">{new Date(alert.timestamp).toLocaleString()}</p>
                </div>

                <div className="shrink-0">
                  {alert.acknowledged ? (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Acknowledged
                    </span>
                  ) : (
                    <button
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 10. MANUAL ALLOCATION SECTION */}
      {(activeNav === 'manual-allocation' || activeNav === 'complaints') && (
        <ManualAllocationView
          currentUser={currentUser}
          complaints={complaints}
          trucks={trucks}
          tasks={tasks}
          onManualAllocate={(complaintId, truckId, driverId, remarks, customData) => {
            if (onManualAllocateComplaint) {
              onManualAllocateComplaint(complaintId, truckId, driverId, remarks, customData);
            }
          }}
          onUpdateComplaintStatus={(complaintId, status, notes) => {
            if (onUpdateComplaintStatus) {
              onUpdateComplaintStatus(complaintId, status, notes);
            }
          }}
          onRegisterCallRequest={(data) => {
            if (onRegisterPhoneComplaint) {
              onRegisterPhoneComplaint(data);
            }
          }}
          onSyncEmails={() => {
            if (onSyncIncomingEmails) {
              onSyncIncomingEmails();
            }
          }}
          onCancelTask={onCancelTask}
          onSelectTab={onNavigate}
        />
      )}

      {/* 11. AUDIT LOGS SECTION */}
      {activeNav === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">Immutable Municipal Audit Trail</h1>
              <p className="text-xs text-slate-500">Recorded system allocations, overrides, fleet actions, and telemetry logs</p>
            </div>
            <button
              onClick={() => handleExportCsv('AUDIT')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export Audit CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                  <th className="pb-2 px-2">ID</th>
                  <th className="pb-2 px-2">Actor</th>
                  <th className="pb-2 px-2">Action</th>
                  <th className="pb-2 px-2">Entity</th>
                  <th className="pb-2 px-2">Details</th>
                  <th className="pb-2 px-2">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-2 font-mono text-slate-500">{log.id}</td>
                    <td className="py-2.5 px-2 font-bold text-slate-900">{log.actorName}</td>
                    <td className="py-2.5 px-2 font-semibold text-emerald-800">{log.action}</td>
                    <td className="py-2.5 px-2 text-slate-600">{log.entity}</td>
                    <td className="py-2.5 px-2 text-slate-700 max-w-sm truncate">{log.details}</td>
                    <td className="py-2.5 px-2 text-slate-400 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DRIVERS SECTION */}
      {activeNav === 'drivers' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">Municipal Driver Registry (Chennai Wards)</h1>
              <p className="text-xs text-slate-500">Authorized commercial vehicle operators assigned to Heavy Vehicles and Eco Autos (100kg and 200kg)</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              4 Drivers Active on Duty
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Driver 1: Murugan (TRUCK-500) */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white font-extrabold flex items-center justify-center text-xl">
                  M
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Murugan K.</h3>
                  <p className="text-xs text-slate-500 font-mono">DL: TN0120180004921 • ID: USR-DRIVER-500</p>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    On Duty • Assigned TRUCK-500
                  </span>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Vehicle:</span>
                  <span className="font-bold text-slate-900">TRUCK-500 (Tata Ace EV 500kg Tipper)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Contact Number:</span>
                  <span className="font-bold text-slate-800 font-mono">+91 94441 23451</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Operational Sector:</span>
                  <span className="font-bold text-slate-800">T. Nagar / Guindy Ward</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Performance Rating:</span>
                  <span className="font-bold text-emerald-700">★ 4.9 (184 Collections)</span>
                </div>
              </div>

              <div className="flex gap-2">
                <a 
                  href="tel:+919444123451"
                  className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Driver
                </a>
              </div>
            </div>

            {/* Driver 2: Selvam (TRUCK-1000) */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-700 text-white font-extrabold flex items-center justify-center text-xl">
                  S
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Selvam R.</h3>
                  <p className="text-xs text-slate-500 font-mono">DL: TN0920170009182 • ID: USR-DRIVER-1000</p>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                    En Route • Assigned TRUCK-1000
                  </span>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Vehicle:</span>
                  <span className="font-bold text-slate-900">TRUCK-1000 (Ashok Leyland 1000kg Compactor)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Contact Number:</span>
                  <span className="font-bold text-slate-800 font-mono">+91 94442 67892</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Operational Sector:</span>
                  <span className="font-bold text-slate-800">Adyar / Mylapore Ward</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Performance Rating:</span>
                  <span className="font-bold text-blue-700">★ 4.8 (216 Collections)</span>
                </div>
              </div>

              <div className="flex gap-2">
                <a 
                  href="tel:+919444267892"
                  className="flex-1 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Driver
                </a>
              </div>
            </div>

            {/* Driver 3: Ramesh P. (Eco Auto 01 - 100 kg) */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-600 text-white font-extrabold flex items-center justify-center text-xl">
                  R
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Ramesh P.</h3>
                  <p className="text-xs text-slate-500 font-mono">DL: TN0220200003194 • ID: USR-DRIVER-AUTO1</p>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                    On Duty • Assigned Eco Auto 01 (100 kg)
                  </span>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Vehicle:</span>
                  <span className="font-bold text-slate-900">AUTO-100-1 (Eco Auto 01 • 100kg Electric Auto)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Contact Number:</span>
                  <span className="font-bold text-slate-800 font-mono">+91 94443 11223</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Operational Sector:</span>
                  <span className="font-bold text-slate-800">Anna Nagar / Kilpauk Ward</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Specialization:</span>
                  <span className="font-bold text-amber-800">Narrow Residential Streets & Rapid Response</span>
                </div>
              </div>

              <div className="flex gap-2">
                <a 
                  href="tel:+919444311223"
                  className="flex-1 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Driver
                </a>
              </div>
            </div>

            {/* Driver 4: Vijay S. (Eco Auto 02 - 200 kg) */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-teal-700 text-white font-extrabold flex items-center justify-center text-xl">
                  V
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Vijay S.</h3>
                  <p className="text-xs text-slate-500 font-mono">DL: TN0420210007812 • ID: USR-DRIVER-AUTO2</p>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-900">
                    On Duty • Assigned Eco Auto 02 (200 kg)
                  </span>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Vehicle:</span>
                  <span className="font-bold text-slate-900">AUTO-100-2 (Eco Auto 02 • 200kg Electric Auto)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Contact Number:</span>
                  <span className="font-bold text-slate-800 font-mono">+91 94444 33445</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Operational Sector:</span>
                  <span className="font-bold text-slate-800">Mylapore / Triplicane Ward</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Specialization:</span>
                  <span className="font-bold text-teal-800">Temple Bazaar Lanes & Citizen Grievance Dispatches</span>
                </div>
              </div>

              <div className="flex gap-2">
                <a 
                  href="tel:+919444433445"
                  className="flex-1 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Driver
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ROUTES SECTION */}
      {activeNav === 'routes' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">Chennai Ward Collection Routes & Waypoints</h1>
              <p className="text-xs text-slate-500">Optimized multi-stop municipal collection circuits</p>
            </div>
            <button onClick={() => onNavigate('map')} className="text-xs font-bold text-emerald-700 hover:underline">
              Inspect on Live Map →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">ROUTE-TN-01</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">TRUCK-500 Assigned</span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900">T. Nagar Commercial Circuit</h3>
              <p className="text-xs text-slate-600">Total Distance: <strong>4.2 km</strong> • Estimated Duration: <strong>45 mins</strong></p>
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="font-bold text-slate-800">Waypoints:</div>
                <div className="text-slate-600">1. Usman Road Panagal Park Jct (BIN-CHN-TN-01)</div>
                <div className="text-slate-600">2. Ranganathan Street Corner (BIN-CHN-TN-02)</div>
                <div className="text-slate-600">3. South Usman Road Flyover approach</div>
                <div className="text-slate-600">4. T. Nagar Municipal Transfer Bay</div>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">ROUTE-ADY-02</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">TRUCK-1000 Assigned</span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Adyar - Besant Nagar Coastal Line</h3>
              <p className="text-xs text-slate-600">Total Distance: <strong>6.8 km</strong> • Estimated Duration: <strong>1 hr 10 mins</strong></p>
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="font-bold text-slate-800">Waypoints:</div>
                <div className="text-slate-600">1. L.B. Road Adyar Signal (BIN-CHN-ADY-01)</div>
                <div className="text-slate-600">2. Gandhi Nagar 2nd Main Road (BIN-CHN-ADY-02)</div>
                <div className="text-slate-600">3. Besant Avenue Road</div>
                <div className="text-slate-600">4. Perungudi Dump Yard Transit Bay</div>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded">ROUTE-MYL-03</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">Scheduled Routine</span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Mylapore Heritage Corridor</h3>
              <p className="text-xs text-slate-600">Total Distance: <strong>5.4 km</strong> • Estimated Duration: <strong>55 mins</strong></p>
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="font-bold text-slate-800">Waypoints:</div>
                <div className="text-slate-600">1. Luz Church Road Jct (BIN-CHN-MYL-01)</div>
                <div className="text-slate-600">2. Kapaleeshwarar South Mada Street</div>
                <div className="text-slate-600">3. Kutchery Road Sanitary Depot</div>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">ROUTE-VEL-04</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">Scheduled Routine</span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Velachery Express Transit</h3>
              <p className="text-xs text-slate-600">Total Distance: <strong>8.1 km</strong> • Estimated Duration: <strong>1 hr 20 mins</strong></p>
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="font-bold text-slate-800">Waypoints:</div>
                <div className="text-slate-600">1. 100 Feet Bypass Road Vijaya Nagar (BIN-CHN-VEL-01)</div>
                <div className="text-slate-600">2. Dhandeeswaram Main Road</div>
                <div className="text-slate-600">3. Taramani Link Road MRF Hub</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS SECTION */}
      {activeNav === 'notifications' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">Municipal Notifications & Operational Broadcasts</h1>
              <p className="text-xs text-slate-500">Persistent alerts, broadcast updates, and dispatch acknowledgements</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 flex items-start gap-3">
              <Radio className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">Automated Route Dispatch Active</span>
                <p className="text-slate-600 mt-0.5">TRUCK-500 assigned to Usman Road Bin #01 (165 kg load). Driver Murugan K. notified via in-vehicle mobile unit.</p>
                <span className="text-[10px] text-slate-400 mt-1 block">12 minutes ago • Automated Allocation System</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">Critical Smell Threshold Exceeded at Adyar Signal</span>
                <p className="text-slate-600 mt-0.5">Electrochemical smell sensor SS-ADY-01 detected H2S spike of 32.8 ppm. Emergency clearance task TASK-CHN-101 generated.</p>
                <span className="text-[10px] text-slate-400 mt-1 block">25 minutes ago • IoT Sensor Telemetry</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 flex items-start gap-3">
              <Camera className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">Optical Camera Malfunction at Mylapore Luz Mast #03</span>
                <p className="text-slate-600 mt-0.5">Camera lens obscured by physical obstruction. Inspection task flagged for zone engineering crew.</p>
                <span className="text-[10px] text-slate-400 mt-1 block">40 minutes ago • AI Vision Diagnostic Unit</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REPORTS SECTION */}
      {activeNav === 'reports' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">Municipal Waste Analytics & Authorized Exports</h1>
              <p className="text-xs text-slate-500">Official collection reporting for EcoTrack AI</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleExportCsv('BINS')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Bins CSV
              </button>
              <button
                onClick={() => handleExportCsv('TASKS')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Tasks CSV
              </button>
              <button
                onClick={() => handleExportCsv('ALERTS')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Alerts CSV
              </button>
              <button
                onClick={() => handleExportCsv('AUDIT')}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Full Audit CSV
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <span className="text-slate-500 font-semibold">Total Solid Waste Lifted</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">2.45 Tons</p>
              <span className="text-[10px] text-emerald-700 font-medium">Daily Target: 3.50 Tons</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <span className="text-slate-500 font-semibold">Average Fill Across Chennai</span>
              <p className="text-2xl font-extrabold text-amber-700 mt-1">73.6%</p>
              <span className="text-[10px] text-slate-500">10 Municipal Wards</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <span className="text-slate-500 font-semibold">Fleet Utilization Rate</span>
              <p className="text-2xl font-extrabold text-blue-700 mt-1">82.0%</p>
              <span className="text-[10px] text-blue-700 font-medium">TRUCK-500 & 1000</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <span className="text-slate-500 font-semibold">IoT Sensor Reliability</span>
              <p className="text-2xl font-extrabold text-emerald-700 mt-1">98.4%</p>
              <span className="text-[10px] text-emerald-700 font-medium">Uptime across LoRaWAN</span>
            </div>
          </div>
        </div>
      )}

      {/* 12. SETTINGS SECTION */}
      {activeNav === 'settings' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4 max-w-2xl">
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">Municipal Thresholds & Fleet Allocation Configuration</h1>
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 block">Level Sensor Thresholds</span>
              <p className="text-slate-500">Low: &lt;40% | Normal: 40-74% | Nearly Full: 75-89% | High Urgent: ≥90%</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 block">Weight Allocation Safety Margin</span>
              <p className="text-slate-500">Configured safety margin: <strong>1.10x (10% overhead)</strong> for uncompacted density variance</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 block">Smell & Odor Thresholds</span>
              <p className="text-slate-500">H2S Limit: 20.0 ppm | NH3 Limit: 25.0 ppm | VOC Limit: 30.0 ppm</p>
            </div>
          </div>
        </div>
      )}

      {/* 13. ADMIN PROFILE & ACCOUNT CREDENTIALS */}
      {activeNav === 'profile' && (
        <AdminProfileView
          currentUser={currentUser}
          onUpdateUser={onUpdateUser}
          onLogout={onLogout}
        />
      )}

      {/* Add Bin Modal */}
      {showAddBinModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Register New Chennai Dustbin</h3>
              <button onClick={() => setShowAddBinModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateBin} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Street Address *</label>
                <input
                  type="text"
                  value={newBinAddress}
                  onChange={(e) => setNewBinAddress(e.target.value)}
                  placeholder="e.g. Usman Road, T. Nagar"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Chennai Zone *</label>
                  <select
                    value={newBinZone}
                    onChange={(e) => setNewBinZone(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="T. Nagar">T. Nagar</option>
                    <option value="Adyar">Adyar</option>
                    <option value="Velachery">Velachery</option>
                    <option value="Anna Nagar">Anna Nagar</option>
                    <option value="Mylapore">Mylapore</option>
                    <option value="Tambaram">Tambaram</option>
                    <option value="Perungudi">Perungudi</option>
                    <option value="Ambattur">Ambattur</option>
                    <option value="Guindy">Guindy</option>
                    <option value="Sholinganallur">Sholinganallur</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Capacity (kg)</label>
                  <input
                    type="number"
                    value={newBinCapacity}
                    onChange={(e) => setNewBinCapacity(e.target.value)}
                    placeholder="250"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddBinModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 text-white font-bold rounded-xl"
                >
                  Register Bin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complaint Allocation Modal */}
      {allocatingComplaint && (
        <ComplaintAllocationModal
          complaint={allocatingComplaint}
          trucks={trucks}
          onClose={() => setAllocatingComplaint(null)}
          onDispatch={(complaintId, truckId, driverId, remarks) => {
            if (onManualAllocateComplaint) {
              onManualAllocateComplaint(complaintId, truckId, driverId, remarks);
            }
          }}
          onUpdateStatus={(complaintId, status, notes) => {
            if (onUpdateComplaintStatus) {
              onUpdateComplaintStatus(complaintId, status, notes);
            }
          }}
        />
      )}

      {/* Phone Complaint Registration (1913 Helpline) Modal */}
      {showPhoneModal && (
        <PhoneComplaintModal
          onClose={() => setShowPhoneModal(false)}
          onSubmit={(data) => {
            if (onRegisterPhoneComplaint) {
              onRegisterPhoneComplaint(data);
            }
          }}
          currentAdminName={currentUser.fullName}
        />
      )}

      {/* Official Gmail Integration & Technical Guide Modal */}
      {showEmailSetupModal && (
        <EmailSetupModal
          onClose={() => setShowEmailSetupModal(false)}
          onTriggerSync={() => {
            if (onSyncIncomingEmails) {
              onSyncIncomingEmails();
            }
          }}
        />
      )}
    </div>
  );
};
