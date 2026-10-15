import React, { useState } from 'react';
import { 
  WardComplaint, 
  Truck, 
  TruckId, 
  PickupTask, 
  User, 
  ChennaiZone 
} from '../../types';
import { 
  PhoneCall, 
  Mail, 
  Truck as TruckIcon, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  MapPin, 
  Scale, 
  Plus, 
  RefreshCw, 
  Info, 
  X, 
  ChevronRight, 
  Eye, 
  RotateCcw,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import { OFFICIAL_COMPLAINT_EMAIL } from '../../services/complaintService';

interface ManualAllocationViewProps {
  currentUser: User;
  complaints: WardComplaint[];
  trucks: Truck[];
  tasks: PickupTask[];
  onManualAllocate: (
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
  onUpdateComplaintStatus: (complaintId: string, status: any, notes?: string) => void;
  onRegisterCallRequest: (data: any) => void;
  onSyncEmails: () => void;
  onCancelTask?: (taskId: string, reason: string) => void;
  onSelectTab?: (tab: string) => void;
}

export const ManualAllocationView: React.FC<ManualAllocationViewProps> = ({
  currentUser,
  complaints,
  trucks,
  tasks,
  onManualAllocate,
  onUpdateComplaintStatus,
  onRegisterCallRequest,
  onSyncEmails,
  onCancelTask,
  onSelectTab
}) => {
  // Currently selected complaint for assignment form
  const [selectedComplaint, setSelectedComplaint] = useState<WardComplaint | null>(null);

  // Form field states
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [selectedTruckId, setSelectedTruckId] = useState<TruckId>('');
  const [pickupLocation, setPickupLocation] = useState<string>('');
  const [wasteType, setWasteType] = useState<string>('Wet Organic');
  const [estimatedWeight, setEstimatedWeight] = useState<number>(100);
  const [priority, setPriority] = useState<'Normal' | 'High' | 'Urgent'>('High');
  const [timeWindow, setTimeWindow] = useState<string>('Immediate Dispatch (within 30 mins)');
  const [specialInstructions, setSpecialInstructions] = useState<string>('');

  // Modals
  const [showAddCallModal, setShowAddCallModal] = useState<boolean>(false);
  const [viewTaskDetails, setViewTaskDetails] = useState<PickupTask | null>(null);
  const [cancelTaskId, setCancelTaskId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Duplicate ticket / Resolved via alternate unit');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Filter / Search for requests
  const [requestSearch, setRequestSearch] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'EMAIL' | 'PHONE'>('ALL');

  // Filter pending requests (email & call requests awaiting allocation)
  const pendingRequests = complaints.filter(c => {
    const isPending = c.status === 'NEW' || c.status === 'OPEN' || c.status === 'UNDER_REVIEW';
    if (!isPending) return false;
    if (sourceFilter === 'EMAIL' && c.source !== 'EMAIL') return false;
    if (sourceFilter === 'PHONE' && c.source !== 'PHONE') return false;
    if (requestSearch.trim()) {
      const q = requestSearch.toLowerCase();
      return (
        c.id.toLowerCase().includes(q) ||
        c.streetAddress.toLowerCase().includes(q) ||
        c.zone.toLowerCase().includes(q) ||
        (c.wasteCategory && c.wasteCategory.toLowerCase().includes(q)) ||
        (c.citizenName && c.citizenName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Filter manually allocated tasks
  const manualTasks = tasks.filter(t => 
    t.pickupType === 'CITIZEN_COMPLAINT' || 
    t.id.startsWith('TASK-MANUAL') || 
    Boolean(t.complaintId)
  );

  // When clicking "Assign Manually" on a pending card
  const handleStartAssign = (cmp: WardComplaint) => {
    setSelectedComplaint(cmp);
    setPickupLocation(cmp.streetAddress);
    setWasteType(cmp.wasteCategory || 'Wet Organic');
    const estLoad = cmp.quantityEstimateKg || 100;
    setEstimatedWeight(estLoad);
    setPriority(cmp.urgency === 'CRITICAL' ? 'Urgent' : cmp.urgency === 'HIGH' ? 'High' : 'Normal');
    setSpecialInstructions(cmp.description ? `Ref: ${cmp.description}` : '');

    // Auto-select most appropriate available truck and driver
    const bestFitTruck = (candidates: Truck[]) => candidates
      .filter(t => t.remainingCapacityKg >= estLoad)
      .sort((a, b) => a.maxPayloadKg - b.maxPayloadKg)[0];
    const suitableTruck = bestFitTruck(trucks.filter(t => t.status === 'AVAILABLE'))
      || bestFitTruck(trucks)
      || trucks[0];

    if (suitableTruck) {
      setSelectedTruckId(suitableTruck.id);
      setSelectedDriverId(suitableTruck.driverId);
    }

    // Smooth scroll down to form
    const formElement = document.getElementById('manual-assignment-form-section');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // When selecting driver, auto-select their truck
  const handleDriverChange = (driverId: string) => {
    setSelectedDriverId(driverId);
    const truck = trucks.find(t => t.driverId === driverId);
    if (truck) {
      setSelectedTruckId(truck.id);
    }
  };

  // When selecting truck, auto-select that truck's driver
  const handleTruckChange = (truckId: TruckId) => {
    setSelectedTruckId(truckId);
    const truck = trucks.find(t => t.id === truckId);
    if (truck) {
      setSelectedDriverId(truck.driverId);
    }
  };

  const selectedTruck = trucks.find(t => t.id === selectedTruckId) || trucks[0];
  const selectedDriver = trucks.find(t => t.driverId === selectedDriverId) || selectedTruck;

  // Real-time capacity check
  const exceedsCapacity = selectedTruck ? estimatedWeight > selectedTruck.remainingCapacityKg : false;
  const isOutOfService = selectedTruck ? (selectedTruck.status === 'MAINTENANCE' || selectedTruck.status === 'OUT_OF_SERVICE') : false;
  const canConfirm = Boolean(selectedComplaint) && !exceedsCapacity && !isOutOfService && estimatedWeight > 0;

  // Confirm manual allocation
  const handleConfirmAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint || !canConfirm || !selectedTruck) return;

    onManualAllocate(
      selectedComplaint.id,
      selectedTruck.id,
      selectedDriver.driverId,
      specialInstructions.trim(),
      {
        weightKg: estimatedWeight,
        address: pickupLocation.trim(),
        wasteType,
        priority: priority === 'Urgent' ? 'URGENT' : priority === 'High' ? 'HIGH' : 'NORMAL',
        timeWindow
      }
    );

    // Clear form
    setSelectedComplaint(null);
  };

  // Sync emails trigger
  const handleTriggerEmailSync = () => {
    setIsSyncing(true);
    onSyncEmails();
    setTimeout(() => setIsSyncing(false), 900);
  };

  // Add Call Request Form state
  const [callerName, setCallerName] = useState('');
  const [callerPhone, setCallerPhone] = useState('');
  const [callZone, setCallZone] = useState<ChennaiZone>('T. Nagar');
  const [callAddress, setCallAddress] = useState('');
  const [callLandmark, setCallLandmark] = useState('');
  const [callWasteType, setCallWasteType] = useState('Mixed Waste');
  const [callWeightKg, setCallWeightKg] = useState('85');
  const [callUrgency, setCallUrgency] = useState<'NORMAL' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [callDesc, setCallDesc] = useState('');

  const handleCreateCallRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callerName.trim() || !callerPhone.trim() || !callAddress.trim()) return;

    const newId = `CMP-CALL-2026-${Date.now().toString().slice(-4)}`;
    const newComplaint: WardComplaint = {
      id: newId,
      citizenName: callerName.trim(),
      phone: callerPhone.trim(),
      source: 'PHONE',
      zone: callZone,
      streetAddress: callAddress.trim(),
      landmark: callLandmark.trim() || undefined,
      description: callDesc.trim() || 'Citizen reported waste accumulation via 1913 Helpline.',
      wasteCategory: callWasteType,
      quantityEstimateKg: parseInt(callWeightKg, 10) || 85,
      urgency: callUrgency === 'CRITICAL' ? 'CRITICAL' : callUrgency === 'HIGH' ? 'HIGH' : 'NORMAL',
      status: 'NEW',
      createdAt: new Date().toISOString(),
      operatorName: currentUser.fullName
    };

    onRegisterCallRequest({
      id: newId,
      citizenName: newComplaint.citizenName,
      phone: newComplaint.phone,
      description: newComplaint.description,
      wasteCategory: newComplaint.wasteCategory,
      quantityEstimateKg: newComplaint.quantityEstimateKg,
      zone: newComplaint.zone,
      streetAddress: newComplaint.streetAddress,
      landmark: newComplaint.landmark,
      urgency: newComplaint.urgency,
      operatorName: currentUser.fullName
    });

    setShowAddCallModal(false);
    setCallerName('');
    setCallerPhone('');
    setCallAddress('');
    setCallLandmark('');
    setCallDesc('');

    // Pre-fill and scroll to assignment form immediately
    handleStartAssign(newComplaint);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-lg border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <span>🎛️</span>
              <span>Command Center Dispatch</span>
            </span>
            <span className="text-xs text-slate-300">
              Official Mailbox: <strong className="text-blue-300 font-mono">{OFFICIAL_COMPLAINT_EMAIL}</strong> • Helpline: <strong>1913</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Manual Fleet Allocation & Citizen Dispatch
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Process unscheduled citizen grievances from incoming emails and telephone calls. Direct vehicle payload assignment, driver selection, and real-time fleet capacity enforcement.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowAddCallModal(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Call Request (1913)</span>
          </button>

          <button
            onClick={handleTriggerEmailSync}
            disabled={isSyncing}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
            title="Poll incoming emails from ecotrackai123@gmail.com"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Poll Inbox'}</span>
          </button>
        </div>
      </div>

      {/* SECTION A: INCOMING NOTIFICATIONS PANEL (TOP) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Incoming Requests – Email & Call
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                {pendingRequests.length} Pending
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live queue from ecotrackai123@gmail.com and Zonal Helpline (1913). Click "Assign Manually" to dispatch.
            </p>
          </div>

          {/* Search & Source Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-slate-100 rounded-xl p-1 text-xs">
              <button
                onClick={() => setSourceFilter('ALL')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  sourceFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({complaints.filter(c => c.status === 'NEW' || c.status === 'OPEN' || c.status === 'UNDER_REVIEW').length})
              </button>
              <button
                onClick={() => setSourceFilter('EMAIL')}
                className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  sourceFilter === 'EMAIL' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>✉️ Email</span>
              </button>
              <button
                onClick={() => setSourceFilter('PHONE')}
                className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  sourceFilter === 'PHONE' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>📞 Call</span>
              </button>
            </div>

            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={requestSearch}
                onChange={(e) => setRequestSearch(e.target.value)}
                placeholder="Search location, ward, ID..."
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Pending Request Cards Grid */}
        {pendingRequests.length === 0 ? (
          <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <h3 className="font-extrabold text-sm text-slate-800">All Incoming Citizen Requests Allocated!</h3>
            <p className="text-xs text-slate-500 mt-1">
              No pending grievances awaiting manual assignment. Click "+ Add Call Request" or "Poll Inbox" to add more.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((req) => {
              const isSelected = selectedComplaint?.id === req.id;
              const isEmail = req.source === 'EMAIL';
              const isUrgent = req.urgency === 'CRITICAL' || req.urgency === 'HIGH';

              return (
                <div
                  key={req.id}
                  className={`p-5 rounded-2xl border transition-all text-xs space-y-3 relative ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/30 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  {/* Top Bar: Source Badge, Priority & Timestamp */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-black uppercase flex items-center gap-1.5 ${
                        isEmail
                          ? 'bg-blue-100 text-blue-900 border border-blue-200'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                      }`}>
                        {isEmail ? <Mail className="w-3.5 h-3.5" /> : <PhoneCall className="w-3.5 h-3.5" />}
                        <span>{isEmail ? 'Email Complaint' : '1913 Call Complaint'}</span>
                      </span>

                      <span className="font-mono text-[11px] font-bold text-slate-600">
                        {req.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        req.urgency === 'CRITICAL'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : req.urgency === 'HIGH'
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {req.urgency === 'CRITICAL' ? 'Urgent' : req.urgency === 'HIGH' ? 'High Priority' : 'Normal Priority'}
                      </span>
                    </div>
                  </div>

                  {/* Main Details */}
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                        <span>{req.streetAddress}</span>
                      </div>
                      <span className="font-bold text-slate-500 text-xs shrink-0 bg-slate-100 px-2 py-0.5 rounded">
                        {req.zone} Ward
                      </span>
                    </div>

                    <div className="text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {req.description}
                    </div>

                    {req.landmark && (
                      <div className="text-[11px] text-slate-500">
                        Landmark: <strong>{req.landmark}</strong>
                      </div>
                    )}
                  </div>

                  {/* Specs & Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-[11px]">
                    <div className="p-2 rounded-xl bg-slate-50">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Waste Type</span>
                      <span className="font-bold text-slate-800">{req.wasteCategory || 'Mixed Waste'}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Estimated Load</span>
                      <span className="font-extrabold text-base text-slate-900">{req.quantityEstimateKg || 80} kg</span>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[10px] text-slate-500">
                        {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Status: <strong>Pending Manual Assignment</strong>
                      </span>
                    </div>

                    <button
                      onClick={() => handleStartAssign(req)}
                      className={`px-4 py-2 font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-emerald-700 text-white ring-2 ring-emerald-500/50' 
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      <TruckIcon className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isSelected ? 'Editing Assignment' : 'Assign Manually'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION B: MANUAL ASSIGNMENT FORM */}
      <div 
        id="manual-assignment-form-section" 
        className={`bg-white rounded-3xl border transition-all p-6 space-y-6 ${
          selectedComplaint ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg' : 'border-slate-200 shadow-sm opacity-90'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                2
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Manual Assignment Form
              </h2>
              {selectedComplaint && (
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-100 text-blue-900 border border-blue-200">
                  Target: {selectedComplaint.id}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Select eligible commercial driver and vehicle with live payload verification. Deducts remaining capacity upon dispatch.
            </p>
          </div>

          {selectedComplaint && (
            <button
              onClick={() => setSelectedComplaint(null)}
              className="text-xs text-slate-500 hover:text-slate-800 font-bold px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50"
            >
              Cancel Selection
            </button>
          )}
        </div>

        {!selectedComplaint ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
            <TruckIcon className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-extrabold text-sm text-slate-700">No Request Selected for Assignment</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Please click the <strong className="text-slate-800">"Assign Manually"</strong> button on any of the pending email or call requests above, or enter a new phone-call request to assign immediately.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowAddCallModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Call Request (1913)</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConfirmAssignment} className="space-y-6 text-xs">
            {/* Form Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Select Driver */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Select Commercial Driver *
                </label>
                <select
                  value={selectedDriverId}
                  onChange={(e) => handleDriverChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-emerald-500"
                >
                  {trucks.map(truck => (
                    <option key={truck.driverId} value={truck.driverId}>
                      {truck.driverName} — {truck.name} ({truck.remainingCapacityKg} kg safe capacity left)
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Drivers from active municipal fleet (Murugan K., Selvam R., Ramesh P., Suresh M.)
                </span>
              </div>

              {/* 2. Select Truck */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Select Municipal Collection Vehicle *
                </label>
                <select
                  value={selectedTruckId}
                  onChange={(e) => handleTruckChange(e.target.value as TruckId)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-emerald-500"
                >
                  {trucks.map(truck => (
                    <option key={truck.id} value={truck.id}>
                      {truck.name} ({truck.registrationNumber}) — {truck.maxPayloadKg}kg Rating ({truck.remainingCapacityKg}kg Remaining)
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Auto-fills based on driver selection; live remaining capacity enforced
                </span>
              </div>

              {/* 3. Pickup Location */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Pickup Location & Address *
                </label>
                <input
                  type="text"
                  required
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder="e.g. Luz Church Road, Mylapore"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-emerald-500 font-semibold"
                />
              </div>

              {/* 4. Waste Type */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Waste Type / Category *
                </label>
                <select
                  value={wasteType}
                  onChange={(e) => setWasteType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
                >
                  <option value="Wet Organic">Wet Organic Waste</option>
                  <option value="Dry Recyclable">Dry Recyclable Waste</option>
                  <option value="Sanitary Hazardous">Sanitary Hazardous Waste</option>
                  <option value="Mixed Waste">Mixed Commercial / Street Waste</option>
                </select>
              </div>

              {/* 5. Estimated Weight */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Estimated Garbage Weight (kg) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  required
                  value={estimatedWeight}
                  onChange={(e) => setEstimatedWeight(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-extrabold focus:outline-emerald-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Weight will be deducted from {selectedTruck.name}'s remaining safe capacity upon allocation
                </span>
              </div>

              {/* 6. Priority */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Dispatch Priority Level *
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
                >
                  <option value="Normal">Normal Priority</option>
                  <option value="High">High Priority</option>
                  <option value="Urgent">Urgent Priority</option>
                </select>
              </div>

              {/* 7. Preferred Time Window */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Preferred Time Window
                </label>
                <select
                  value={timeWindow}
                  onChange={(e) => setTimeWindow(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
                >
                  <option value="Immediate Dispatch (within 30 mins)">Immediate Dispatch (within 30 mins)</option>
                  <option value="Morning 10:00 AM – 12:00 PM">Morning 10:00 AM – 12:00 PM</option>
                  <option value="Afternoon 02:00 PM – 04:00 PM">Afternoon 02:00 PM – 04:00 PM</option>
                  <option value="Evening 05:00 PM – 07:00 PM">Evening 05:00 PM – 07:00 PM</option>
                </select>
              </div>

              {/* 8. Special Instructions (textarea) */}
              <div className="md:col-span-2">
                <label className="block font-bold text-slate-800 mb-1.5">
                  Special Instructions for Driver (textarea)
                </label>
                <textarea
                  rows={3}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Narrow residential lane; citizen requested phone call upon arrival; please collect from rear alley."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-emerald-500 resize-none font-medium"
                />
              </div>
            </div>

            {/* Real-Time Live Capacity Status Banner */}
            <div className="p-4 rounded-2xl border space-y-2 bg-slate-50 border-slate-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">
                  Selected Fleet Asset: <strong className="text-emerald-800">{selectedTruck.name}</strong> ({selectedTruck.registrationNumber})
                </span>
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                  exceedsCapacity ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {exceedsCapacity ? 'Capacity Interlock Triggered' : 'Payload Capacity Safe'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Rated Max Payload:</span>
                  <strong className="text-slate-800">{selectedTruck.maxPayloadKg} kg</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Current Net Payload:</span>
                  <strong className="text-slate-800">{selectedTruck.verifiedCurrentPayloadKg} kg</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Current Safe Remaining:</span>
                  <strong className="text-emerald-700">{selectedTruck.remainingCapacityKg} kg</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Remaining After Allocation:</span>
                  <strong className={selectedTruck.remainingCapacityKg - estimatedWeight < 0 ? 'text-red-600 font-black' : 'text-blue-700 font-bold'}>
                    {selectedTruck.remainingCapacityKg - estimatedWeight} kg
                  </strong>
                </div>
              </div>

              {exceedsCapacity && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                  <span>
                    Cannot assign: The requested load (<strong>{estimatedWeight} kg</strong>) exceeds the remaining safe payload capacity of {selectedTruck.name} ({selectedTruck.remainingCapacityKg} kg). Please select a higher-capacity vehicle (TRUCK-500 or TRUCK-1000).
                  </span>
                </div>
              )}
            </div>

            {/* Confirm & Dispatch Button */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="px-4 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canConfirm}
                className={`px-6 py-2.5 font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all ${
                  canConfirm
                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Manual Allocation</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* SECTION C: CURRENTLY ASSIGNED MANUAL TASKS (TABLE) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              Currently Assigned Manual Tasks
            </h2>
            <p className="text-xs text-slate-500">
              Tasks manually dispatched today to fleet drivers. Updates live as drivers accept, start route, or complete collection.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-900">
            {manualTasks.length} Dispatched Tasks
          </span>
        </div>

        {manualTasks.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Clock className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
            <h3 className="font-bold text-xs text-slate-700">No manual tasks assigned yet today</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Use the assignment form above to allocate pending requests.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                  <th className="pb-3 px-3">Task ID</th>
                  <th className="pb-3 px-3">Assigned Driver</th>
                  <th className="pb-3 px-3">Vehicle</th>
                  <th className="pb-3 px-3">Pickup Location</th>
                  <th className="pb-3 px-3">Waste Category</th>
                  <th className="pb-3 px-3">Weight</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3">Assigned By</th>
                  <th className="pb-3 px-3">Time</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {manualTasks.map((t) => {
                  const isCompleted = t.status === 'COMPLETED';
                  const isCancelled = t.status === 'CANCELLED';
                  const isEnRoute = t.status === 'EN_ROUTE' || t.status === 'EN_ROUTE_PICKUP' || t.status === 'COLLECTING';

                  return (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-700">
                        {t.id}
                        {t.complaintId && (
                          <span className="block text-[9px] text-slate-400">Ref: {t.complaintId}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {t.assignedDriverName}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-800">
                          {t.assignedTruckId}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700 max-w-xs truncate" title={t.binAddress}>
                        <div className="font-semibold text-slate-900">{t.binAddress}</div>
                        <div className="text-[10px] text-slate-400">{t.zone}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        {t.wasteCategory || 'Mixed Waste'}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {t.estimatedWeightKg} kg
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isCompleted ? 'bg-emerald-100 text-emerald-800' :
                          isCancelled ? 'bg-red-100 text-red-800' :
                          isEnRoute ? 'bg-blue-100 text-blue-800 animate-pulse' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {t.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {currentUser.fullName}
                      </td>
                      <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                        {t.assignedTime ? new Date(t.assignedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            onClick={() => setViewTaskDetails(t)}
                            className="px-2 py-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-[10px] font-bold flex items-center gap-1 border border-slate-200 cursor-pointer"
                            title="View task details"
                          >
                            <Eye className="w-3 h-3 text-slate-500" />
                            <span>View Details</span>
                          </button>

                          {!isCompleted && !isCancelled && (
                            <>
                              <button
                                onClick={() => {
                                  const cmp = complaints.find(c => c.id === t.complaintId) || {
                                    id: t.complaintId || `CMP-${t.id}`,
                                    citizenName: `Re-dispatch for ${t.id}`,
                                    phone: t.driverPhone || '+91 1913',
                                    source: 'PHONE' as const,
                                    zone: t.zone as any,
                                    streetAddress: t.binAddress,
                                    complaintType: 'STREET_HAZARD_OVERFLOW' as const,
                                    wasteCategory: t.wasteCategory || 'Mixed Waste',
                                    quantityEstimateKg: t.estimatedWeightKg,
                                    urgency: t.priority === 'HIGH' ? 'HIGH' : 'NORMAL',
                                    description: `Reassigning manual task ${t.id} to another driver or vehicle.`,
                                    status: 'OPEN' as const,
                                    createdAt: new Date().toISOString()
                                  };
                                  handleStartAssign(cmp);
                                }}
                                className="px-2 py-1 text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-lg text-[10px] font-bold flex items-center gap-1 border border-blue-200 cursor-pointer"
                                title="Re-assign task"
                              >
                                <RotateCcw className="w-3 h-3 text-blue-600" />
                                <span>Re-assign</span>
                              </button>

                              <button
                                onClick={() => setCancelTaskId(t.id)}
                                className="px-2 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg text-[10px] font-bold flex items-center gap-1 border border-red-200 cursor-pointer"
                                title="Cancel task"
                              >
                                <X className="w-3 h-3 text-red-500" />
                                <span>Cancel</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: ADD CALL REQUEST (1913 HELPLINE) */}
      {showAddCallModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight">Register 1913 Helpline Call Request</h3>
                  <p className="text-xs text-slate-400">Citizen telephone grievance registration</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddCallModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCallRequest} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Citizen Caller Name *</label>
                  <input
                    type="text"
                    required
                    value={callerName}
                    onChange={(e) => setCallerName(e.target.value)}
                    placeholder="e.g. S. Meenakshi"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={callerPhone}
                    onChange={(e) => setCallerPhone(e.target.value)}
                    placeholder="+91 9xxxx xxxxx"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chennai Ward / Sector *</label>
                  <select
                    value={callZone}
                    onChange={(e) => setCallZone(e.target.value as ChennaiZone)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-800"
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
                  <label className="block font-bold text-slate-700 mb-1">Waste Category *</label>
                  <select
                    value={callWasteType}
                    onChange={(e) => setCallWasteType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  >
                    <option value="Mixed Waste">Mixed Commercial / Street Waste</option>
                    <option value="Wet Organic">Wet Organic Waste</option>
                    <option value="Dry Recyclable">Dry Recyclable Waste</option>
                    <option value="Sanitary Hazardous">Sanitary Hazardous Waste</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Street Address / Dump Location *</label>
                <input
                  type="text"
                  required
                  value={callAddress}
                  onChange={(e) => setCallAddress(e.target.value)}
                  placeholder="e.g. Ranganathan Street Junction, T. Nagar"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estimated Load (kg) *</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    required
                    value={callWeightKg}
                    onChange={(e) => setCallWeightKg(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority Level *</label>
                  <select
                    value={callUrgency}
                    onChange={(e) => setCallUrgency(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  >
                    <option value="NORMAL">Normal Priority</option>
                    <option value="HIGH">High Priority</option>
                    <option value="CRITICAL">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Caller Grievance Description</label>
                <textarea
                  rows={2}
                  value={callDesc}
                  onChange={(e) => setCallDesc(e.target.value)}
                  placeholder="e.g. High accumulation blocking foot traffic; needs prompt collection."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCallModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl shadow-md"
                >
                  Save Call Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW TASK DETAILS */}
      {viewTaskDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <TruckIcon className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-base font-extrabold tracking-tight">Manual Task Details</h3>
                  <p className="text-xs text-slate-400 font-mono">{viewTaskDetails.id}</p>
                </div>
              </div>
              <button
                onClick={() => setViewTaskDetails(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Assigned Driver:</span>
                <span className="font-bold text-slate-900">{viewTaskDetails.assignedDriverName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Fleet Asset:</span>
                <span className="font-bold text-blue-700">{viewTaskDetails.assignedTruckId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Pickup Address:</span>
                <span className="font-bold text-slate-900 text-right max-w-[200px]">{viewTaskDetails.binAddress}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Sector Ward:</span>
                <span className="font-bold text-slate-800">{viewTaskDetails.zone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Estimated Weight:</span>
                <span className="font-extrabold text-slate-900">{viewTaskDetails.estimatedWeightKg} kg</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Current Task Status:</span>
                <span className="font-bold text-emerald-700">{viewTaskDetails.status.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Dispatch Reason:</span>
                <span className="text-slate-700 text-right max-w-[200px] truncate">{viewTaskDetails.allocationReason}</span>
              </div>
              {viewTaskDetails.destinationName && (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Destination:</span>
                  <span className="font-bold text-slate-800 text-right max-w-[200px]">{viewTaskDetails.destinationName}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setViewTaskDetails(null)}
                  className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CANCEL TASK MODAL */}
      {cancelTaskId && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden p-5 space-y-4 text-xs">
            <div className="flex items-center gap-2 text-red-600 font-extrabold text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Cancel Manual Assignment</span>
            </div>
            <p className="text-slate-600">
              Are you sure you want to cancel task <strong className="font-mono text-slate-900">{cancelTaskId}</strong>? The vehicle capacity will be automatically released back to the fleet.
            </p>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Reason for Cancellation</label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setCancelTaskId(null)}
                className="px-3 py-1.5 border border-slate-200 rounded-xl font-bold"
              >
                Keep Task
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onCancelTask) {
                    onCancelTask(cancelTaskId, cancelReason);
                  }
                  setCancelTaskId(null);
                }}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
