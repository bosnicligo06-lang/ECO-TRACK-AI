import React, { useState } from 'react';
import { PickupTask } from '../../types';
import { 
  X, 
  AlertTriangle, 
  ShieldAlert, 
  RotateCcw, 
  CheckCircle2, 
  FileText 
} from 'lucide-react';

interface TaskRejectModalProps {
  task: PickupTask;
  onClose: () => void;
  onConfirmReject: (taskId: string, reason: string) => void;
}

const COMMON_REJECTION_REASONS = [
  'Road impassable / barricaded / narrow lane barrier',
  'Mechanical anomaly or hydraulic lifting malfunction',
  'Reported garbage quantity significantly exceeds vehicle payload capacity',
  'Waterlogged or severely damaged street infrastructure',
  'Hazardous / sharp industrial debris requiring specialized containment',
  'Other operational constraint'
];

export const TaskRejectModal: React.FC<TaskRejectModalProps> = ({
  task,
  onClose,
  onConfirmReject
}) => {
  const [selectedReason, setSelectedReason] = useState(COMMON_REJECTION_REASONS[0]);
  const [customRemarks, setCustomRemarks] = useState('');

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = selectedReason === 'Other operational constraint' && customRemarks.trim()
      ? customRemarks.trim()
      : selectedReason;

    onConfirmReject(task.id, finalReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-red-950 text-white flex items-center justify-between border-b border-red-900">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">Reject Municipal Task Assignment</h2>
              <p className="text-[11px] text-red-300">
                Task ID: <span className="font-mono">{task.id}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-red-900 hover:bg-red-800 text-red-200 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleRejectSubmit} className="p-5 space-y-4 text-xs">
          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-[11px] leading-relaxed">
            <strong>Mandatory Audit Requirement:</strong> Rejecting an assigned municipal collection task releases vehicle <strong>{task.assignedTruckId}</strong> back to central dispatch and immediately updates the administrator's dashboard to allow rapid reassignment.
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Official Rejection Reason *</label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-red-500"
            >
              {COMMON_REJECTION_REASONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Driver Remarks / Specific Details</label>
            <textarea
              rows={3}
              value={customRemarks}
              onChange={(e) => setCustomRemarks(e.target.value)}
              placeholder="Provide specific notes regarding why the vehicle or driver cannot perform this pickup..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-red-500 placeholder:text-slate-400"
            />
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl shadow-md flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Confirm & Release Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
