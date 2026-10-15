import React, { useState } from 'react';
import { WardComplaint, Truck, TruckId, ChennaiZone } from '../../types';
import { ChennaiMap } from '../common/ChennaiMap';
import { 
  X, 
  Truck as TruckIcon, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  User as UserIcon, 
  Phone, 
  Mail, 
  Scale, 
  Navigation,
  FileText,
  AlertOctagon
} from 'lucide-react';

interface ComplaintAllocationModalProps {
  complaint: WardComplaint;
  trucks: Truck[];
  onClose: () => void;
  onDispatch: (complaintId: string, truckId: TruckId, driverId: string, remarks?: string) => void;
  onUpdateStatus: (complaintId: string, status: any, notes?: string) => void;
}

export const ComplaintAllocationModal: React.FC<ComplaintAllocationModalProps> = ({
  complaint,
  trucks,
  onClose,
  onDispatch,
  onUpdateStatus
}) => {
  const estimatedLoad = complaint.quantityEstimateKg || 50;

  // Auto-select the best candidate truck
  const [selectedTruckId, setSelectedTruckId] = useState<TruckId>(() => {
    const bestFitAvailable = trucks
      .filter(t => t.status === 'AVAILABLE' && t.remainingCapacityKg >= estimatedLoad)
      .sort((a, b) => a.maxPayloadKg - b.maxPayloadKg)[0];
    if (bestFitAvailable) return bestFitAvailable.id;

    return trucks[0]?.id || 'AUTO-100-1';
  });

  const selectedTruck = trucks.find(t => t.id === selectedTruckId) || trucks[0];
  const [selectedDriverId, setSelectedDriverId] = useState<string>(selectedTruck?.driverId || '');
  const [dispatchRemarks, setDispatchRemarks] = useState('');
  const [escalateReason, setEscalateReason] = useState('');
  const [showEscalateInput, setShowEscalateInput] = useState(false);

  // Sync driver when truck selection changes
  const handleTruckChange = (truckId: TruckId) => {
    setSelectedTruckId(truckId);
    const tr = trucks.find(t => t.id === truckId);
    if (tr) setSelectedDriverId(tr.driverId);
  };

  // Validation Checks
  const isAuto = selectedTruck.vehicleType === 'AUTO_RICKSHAW' || selectedTruck.id.startsWith('AUTO-');
  const exceedsMaxVehicleCapacity = estimatedLoad > selectedTruck.maxPayloadKg;
  const exceedsRemainingCapacity = estimatedLoad > selectedTruck.remainingCapacityKg;
  const isTruckUnavailable = selectedTruck.status === 'MAINTENANCE' || selectedTruck.status === 'OUT_OF_SERVICE';
  
  const canDispatch = !exceedsMaxVehicleCapacity && !exceedsRemainingCapacity && !isTruckUnavailable;

  const handleConfirmDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canDispatch) return;
    onDispatch(complaint.id, selectedTruckId, selectedDriverId, dispatchRemarks.trim());
    onClose();
  };

  const handleEscalateOrReject = (action: 'REJECTED' | 'UNDER_REVIEW') => {
    if (!escalateReason.trim()) return;
    onUpdateStatus(complaint.id, action, escalateReason.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-extrabold text-sm">
              {complaint.source === 'EMAIL' ? '✉️' : '📞'}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">Manual Truck Allocation</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 font-mono">
                  {complaint.id}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                  complaint.urgency === 'CRITICAL' ? 'bg-red-500 text-white' :
                  complaint.urgency === 'HIGH' ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white'
                }`}>
                  {complaint.urgency} Urgency
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Received via {complaint.source} • Reported by <strong>{complaint.citizenName}</strong> ({complaint.phone || complaint.senderEmail})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
          {/* Left Column: Complaint Details & Map */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="font-extrabold text-slate-900 block text-sm flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" /> Complaint Breakdown
              </span>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Citizen Reporter:</span>
                  <span className="font-bold text-slate-900">{complaint.citizenName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Contact Number:</span>
                  <span className="font-mono text-slate-800">{complaint.phone}</span>
                </div>
                {complaint.senderEmail && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sender Email:</span>
                    <span className="font-mono text-blue-700">{complaint.senderEmail}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Operational Zone:</span>
                  <span className="font-bold text-slate-900">{complaint.zone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Street Address:</span>
                  <span className="font-bold text-slate-800 text-right max-w-[200px] truncate">{complaint.streetAddress}</span>
                </div>
                {complaint.landmark && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Landmark:</span>
                    <span className="text-slate-700">{complaint.landmark}</span>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-semibold">Reported Waste Type:</span>
                  <span className="font-bold text-emerald-800">{complaint.wasteCategory || 'Mixed Refuse'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 font-bold">Estimated Quantity:</span>
                  <span className="font-extrabold text-slate-900 text-base">{estimatedLoad} kg</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 leading-relaxed bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block mb-0.5">Citizen Remarks:</span>
                {complaint.description}
              </div>
            </div>

            {/* Interactive Location Preview */}
            <div className="space-y-1.5">
              <span className="font-extrabold text-slate-900 flex items-center gap-1.5 text-xs">
                <MapPin className="w-3.5 h-3.5 text-red-600" /> Reported Location & Nearby Fleet
              </span>
              <div className="rounded-2xl overflow-hidden border border-slate-200 h-44 shadow-2xs">
                <ChennaiMap
                  bins={[]}
                  trucks={trucks}
                  complaints={[complaint]}
                  selectedComplaintId={complaint.id}
                  selectedZone={complaint.zone}
                />
              </div>
              <p className="text-[10px] text-slate-400 italic">
                Interactive Leaflet map showing complaint pickup coordinate [{complaint.latitude?.toFixed(4)}, {complaint.longitude?.toFixed(4)}]
              </p>
            </div>
          </div>

          {/* Right Column: Fleet Selection & Capacity Enforcement */}
          <div className="lg:col-span-7 space-y-4">
            <form onSubmit={handleConfirmDispatch} className="space-y-4">
              {/* Vehicle Selection Cards */}
              <div>
                <label className="font-extrabold text-slate-900 block mb-2 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <TruckIcon className="w-4 h-4 text-blue-600" /> Select Municipal Collection Vehicle
                  </span>
                  <span className="text-[10px] font-normal text-slate-500">
                    4 Fleet Assets (including 100kg and 200kg Eco Autos)
                  </span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {trucks.map(truck => {
                    const isSelected = truck.id === selectedTruckId;
                    const truckIsAuto = truck.vehicleType === 'AUTO_RICKSHAW' || truck.id.startsWith('AUTO-');
                    const cannotAccommodate = estimatedLoad > truck.remainingCapacityKg;
                    const isMaint = truck.status === 'MAINTENANCE' || truck.status === 'OUT_OF_SERVICE';

                    return (
                      <button
                        key={truck.id}
                        type="button"
                        onClick={() => handleTruckChange(truck.id)}
                        className={`p-3 rounded-2xl border text-left transition-all relative ${
                          isSelected 
                            ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20' 
                            : cannotAccommodate
                            ? 'border-red-200 bg-red-50/30 hover:border-red-300'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">{truckIsAuto ? '🛺' : truck.id === 'TRUCK-500' ? '🚛' : '🚚'}</span>
                            <div>
                              <span className="font-extrabold text-xs text-slate-900 block leading-tight">{truck.name}</span>
                              <span className="text-[10px] font-mono text-slate-500">{truck.registrationNumber}</span>
                            </div>
                          </div>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            truckIsAuto ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
                          }`}>
                            {truck.maxPayloadKg} kg Cap
                          </span>
                        </div>

                        {/* Capacity Stats Bar */}
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-slate-500">Remaining Safe:</span>
                            <span className={`font-bold ${truck.remainingCapacityKg < estimatedLoad ? 'text-red-600' : 'text-emerald-700'}`}>
                              {truck.remainingCapacityKg} kg
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${truck.payloadPercentage > 85 ? 'bg-red-500' : 'bg-emerald-600'}`}
                              style={{ width: `${Math.min(100, truck.payloadPercentage)}%` }}
                            />
                          </div>
                        </div>

                        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                          <span>Sector: <strong>{truck.currentZone}</strong></span>
                          <span className={`font-bold ${
                            truck.status === 'AVAILABLE' ? 'text-emerald-700' : 'text-amber-700'
                          }`}>
                            {truck.status}
                          </span>
                        </div>

                        {cannotAccommodate && (
                          <div className="mt-1.5 text-[9px] font-bold text-red-700 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 shrink-0" /> Exceeds vehicle payload cap
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Capacity Warning / Interlock Box */}
              {exceedsMaxVehicleCapacity ? (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Safety Interlock Triggered: Vehicle Payload Limit Exceeded</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    The reported load (<strong>{estimatedLoad} kg</strong>) exceeds the maximum capacity of <strong>{selectedTruck.name}</strong> ({selectedTruck.maxPayloadKg} kg rating).
                    Please select a larger vehicle (e.g. <strong>TRUCK-500</strong> or <strong>TRUCK-1000</strong>) to prevent structural overload.
                  </p>
                </div>
              ) : exceedsRemainingCapacity ? (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Insufficient Remaining Capacity</span>
                  </div>
                  <p className="text-[11px]">
                    {selectedTruck.name} only has <strong>{selectedTruck.remainingCapacityKg} kg</strong> available payload remaining, which is less than the required <strong>{estimatedLoad} kg</strong>.
                  </p>
                </div>
              ) : isTruckUnavailable ? (
                <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700">
                  ⚠️ This vehicle is currently flagged as <strong>{selectedTruck.status}</strong>. Please select another operational asset.
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold">Capacity Fit Confirmed:</span>
                    <span>{estimatedLoad} kg safely fits within {selectedTruck.name} (leaves {selectedTruck.remainingCapacityKg - estimatedLoad} kg).</span>
                  </div>
                </div>
              )}

              {/* Driver & Route Destination Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Commercial Driver</label>
                  <select
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-emerald-500"
                  >
                    <option value={selectedTruck.driverId}>
                      {selectedTruck.driverName} ({selectedTruck.driverPhone})
                    </option>
                    {trucks.filter(t => t.id !== selectedTruck.id).map(t => (
                      <option key={t.driverId} value={t.driverId}>
                        {t.driverName} (Authorized Reserve Driver)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Disposal / Transfer Destination</label>
                  <input
                    type="text"
                    readOnly
                    value="Perungudi Solid Waste Transfer & Processing Facility"
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold truncate"
                  />
                </div>
              </div>

              {/* Special Instructions for Driver */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dispatch Remarks & Route Instructions</label>
                <textarea
                  rows={2}
                  value={dispatchRemarks}
                  onChange={(e) => setDispatchRemarks(e.target.value)}
                  placeholder="e.g. Narrow residential lane; driver to contact citizen upon arrival at landmark."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-emerald-500 placeholder:text-slate-400"
                />
              </div>

              {/* Dispatch Action Bar */}
              <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEscalateInput(!showEscalateInput)}
                    className="text-xs text-slate-500 hover:text-slate-800 font-bold underline"
                  >
                    {showEscalateInput ? 'Hide Rejection / Escalation Options' : 'Reject or Escalate Complaint'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!canDispatch}
                    className={`px-5 py-2 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2 ${
                      canDispatch 
                        ? 'bg-emerald-700 hover:bg-emerald-800 cursor-pointer' 
                        : 'bg-slate-400 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Confirm & Dispatch Assignment</span>
                  </button>
                </div>
              </div>

              {/* Escalation / Rejection Drawer */}
              {showEscalateInput && (
                <div className="p-4 rounded-2xl bg-red-50/50 border border-red-200 space-y-3">
                  <span className="font-bold text-red-900 block">Cancel, Reject or Escalate Grievance</span>
                  <input
                    type="text"
                    value={escalateReason}
                    onChange={(e) => setEscalateReason(e.target.value)}
                    placeholder="Enter official reason (e.g. Duplicate report, invalid address, outside municipal limits)"
                    className="w-full px-3 py-2 bg-white border border-red-200 rounded-xl text-xs"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleEscalateOrReject('UNDER_REVIEW')}
                      disabled={!escalateReason.trim()}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl disabled:opacity-50"
                    >
                      Mark Under Review
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEscalateOrReject('REJECTED')}
                      disabled={!escalateReason.trim()}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl disabled:opacity-50"
                    >
                      Reject Complaint
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
