import React, { useState } from 'react';
import { ChennaiZone } from '../../types';
import { CHENNAI_ZONE_CENTERS } from '../common/ChennaiMap';
import { 
  X, 
  PhoneCall, 
  MapPin, 
  User as UserIcon, 
  Phone, 
  Scale, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  Layers
} from 'lucide-react';

interface PhoneComplaintModalProps {
  onClose: () => void;
  onSubmit: (data: {
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
  }) => void;
  currentAdminName: string;
}

export const PhoneComplaintModal: React.FC<PhoneComplaintModalProps> = ({
  onClose,
  onSubmit,
  currentAdminName
}) => {
  const [citizenName, setCitizenName] = useState('');
  const [phone, setPhone] = useState('');
  const [zone, setZone] = useState<ChennaiZone>('T. Nagar');
  const [streetAddress, setStreetAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [wasteCategory, setWasteCategory] = useState('Commercial Mixed & Street Litter');
  const [quantityKg, setQuantityKg] = useState('50');
  const [urgency, setUrgency] = useState<'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL'>('NORMAL');
  const [description, setDescription] = useState('');
  const [isNarrowStreet, setIsNarrowStreet] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenName.trim() || !phone.trim() || !streetAddress.trim()) return;

    const coords = CHENNAI_ZONE_CENTERS[zone] || [13.0418, 80.2341];

    onSubmit({
      citizenName: citizenName.trim(),
      phone: phone.trim(),
      description: `${description.trim()}${isNarrowStreet ? ' [NOTE: Citizen highlighted narrow residential street; recommended for 100kg Eco Auto].' : ''}`,
      wasteCategory,
      quantityEstimateKg: parseInt(quantityKg, 10) || 50,
      zone,
      streetAddress: streetAddress.trim(),
      landmark: landmark.trim() || undefined,
      latitude: coords[0] + (Math.random() - 0.5) * 0.005,
      longitude: coords[1] + (Math.random() - 0.5) * 0.005,
      urgency,
      operatorName: currentAdminName
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">Citizen Helpline (1913) Call Registration</h2>
              <p className="text-xs text-slate-400">
                Register citizen telephone grievance for immediate dispatch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {/* Caller Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Citizen Caller Name *</label>
              <input
                type="text"
                required
                value={citizenName}
                onChange={(e) => setCitizenName(e.target.value)}
                placeholder="e.g. S. Meenakshi"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Citizen Contact Number *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9xxxx xxxxx"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Location & Zone */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Chennai Operational Ward *</label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value as ChennaiZone)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-emerald-500 font-bold"
              >
                {Object.keys(CHENNAI_ZONE_CENTERS).map(z => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Street Address / Point of Dump *</label>
              <input
                type="text"
                required
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                placeholder="e.g. 14th Cross St, Shastri Nagar"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Landmark / Navigational Cue</label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g. Opposite Adyar Bakery or near Government School Bus Stop"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-emerald-500"
            />
          </div>

          {/* Waste Category & Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Reported Waste Category</label>
              <select
                value={wasteCategory}
                onChange={(e) => setWasteCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-emerald-500"
              >
                <option value="Commercial Mixed & Street Litter">Commercial Mixed & Street Litter</option>
                <option value="Organic Wet Food Waste">Organic Wet Food Waste</option>
                <option value="Temple Flower & Coconut Shells">Temple Flower & Coconut Shells</option>
                <option value="Dry Recyclable Packaging & Plastic">Dry Recyclable Packaging & Plastic</option>
                <option value="Sanitary & Bio-Medical">Sanitary & Bio-Medical</option>
                <option value="Debris & Garden Prunings">Debris & Garden Prunings</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Estimated Load (kg)</label>
              <input
                type="number"
                min="5"
                max="1000"
                value={quantityKg}
                onChange={(e) => setQuantityKg(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-emerald-500 font-bold"
              />
            </div>
          </div>

          {/* Urgency & Narrow Street Flag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Grievance Urgency</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold focus:outline-emerald-500"
              >
                <option value="LOW">Low (Standard 24-hr schedule)</option>
                <option value="NORMAL">Normal (Standard daytime pickup)</option>
                <option value="HIGH">High (Within 2-4 hours)</option>
                <option value="CRITICAL">Critical (Immediate dispatch)</option>
              </select>
            </div>

            <div className="pt-4 sm:pt-6">
              <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border border-amber-200 bg-amber-50/70">
                <input
                  type="checkbox"
                  checked={isNarrowStreet}
                  onChange={(e) => setIsNarrowStreet(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span className="text-[11px] font-bold text-amber-950">
                  Narrow Street / Lane (Recommends 100kg Eco Auto)
                </span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Caller Complaint Details</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Record details of what the citizen observed, foul smell intensity, blockage of roadway..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-emerald-500 placeholder:text-slate-400"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-[11px] text-slate-600">
            <span>Logged By: <strong>{currentAdminName}</strong></span>
            <span>Channel: <strong>Helpline 1913 (Inbound Voice)</strong></span>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl shadow-md flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save & Register Grievance</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
