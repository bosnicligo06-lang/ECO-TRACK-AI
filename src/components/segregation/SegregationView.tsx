import React, { useState } from 'react';
import { 
  User, 
  WasteDataEntry 
} from '../../types';
import { 
  Recycle, 
  Plus, 
  CheckCircle2, 
  BookOpen, 
  FileText,
  User as UserIcon,
  Phone,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';

interface SegregationViewProps {
  currentUser: User;
  activeNav: string;
  onNavigate: (nav: string) => void;
  wasteEntries?: WasteDataEntry[];
  onAddWasteEntry?: (entry: WasteDataEntry) => void;
  onLogout: () => void;
  // Backward compatibility props
  requests?: any[];
  complaints?: any[];
  onRequestPickup?: (req: any) => void;
  onSubmitComplaint?: (cmp: any) => void;
}

const INITIAL_DEMO_ENTRIES: WasteDataEntry[] = [
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
    remarks: 'Commercial complex market area collection; high recyclables separated.',
    enteredBy: 'Kavitha Sundaram',
    createdAt: '2026-10-14T11:15:00Z'
  }
];

export const SegregationView: React.FC<SegregationViewProps> = ({
  currentUser,
  activeNav,
  onNavigate,
  wasteEntries: externalEntries,
  onAddWasteEntry,
  onLogout
}) => {
  // Local state initialized with demo entries if no external entries provided
  const [internalEntries, setInternalEntries] = useState<WasteDataEntry[]>(INITIAL_DEMO_ENTRIES);
  const entries = externalEntries && externalEntries.length > 0 ? externalEntries : internalEntries;

  // Form states for "Enter Waste Data"
  const todayStr = new Date().toISOString().split('T')[0];
  const [entryDate, setEntryDate] = useState<string>(todayStr);
  const [entryLocation, setEntryLocation] = useState<string>('Mylapore - Ward 173');
  const [wetKgInput, setWetKgInput] = useState<string>('');
  const [dryKgInput, setDryKgInput] = useState<string>('');
  const [hazardousKgInput, setHazardousKgInput] = useState<string>('');
  const [entryRemarks, setEntryRemarks] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);
  const [lastSavedId, setLastSavedId] = useState<string>('');

  // Auto-calculated total
  const wetVal = parseFloat(wetKgInput) || 0;
  const dryVal = parseFloat(dryKgInput) || 0;
  const hazVal = parseFloat(hazardousKgInput) || 0;
  const calculatedTotal = wetVal + dryVal + hazVal;

  // Live aggregated dashboard metrics
  const totalWet = entries.reduce((sum, e) => sum + e.wetKg, 0);
  const totalDry = entries.reduce((sum, e) => sum + e.dryKg, 0);
  const totalHazardous = entries.reduce((sum, e) => sum + e.hazardousKg, 0);
  const grandTotal = entries.reduce((sum, e) => sum + e.totalKg, 0);

  const wetPercentage = grandTotal > 0 ? ((totalWet / grandTotal) * 100).toFixed(1) : '0';
  const dryPercentage = grandTotal > 0 ? ((totalDry / grandTotal) * 100).toFixed(1) : '0';
  const hazardousPercentage = grandTotal > 0 ? ((totalHazardous / grandTotal) * 100).toFixed(1) : '0';

  const handleSaveWasteData = (e: React.FormEvent) => {
    e.preventDefault();
    if (calculatedTotal <= 0) return;

    const newId = `WST-2026-${String(entries.length + 1).padStart(3, '0')}`;
    const newEntry: WasteDataEntry = {
      id: newId,
      date: entryDate || todayStr,
      location: entryLocation.trim() || 'Mylapore Ward',
      wetKg: wetVal,
      dryKg: dryVal,
      hazardousKg: hazVal,
      totalKg: calculatedTotal,
      remarks: entryRemarks.trim(),
      enteredBy: currentUser.fullName,
      createdAt: new Date().toISOString()
    };

    if (onAddWasteEntry) {
      onAddWasteEntry(newEntry);
    }
    setInternalEntries(prev => [newEntry, ...prev]);

    // Show success feedback
    setLastSavedId(newId);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4500);

    // Clear numeric inputs and remarks
    setWetKgInput('');
    setDryKgInput('');
    setHazardousKgInput('');
    setEntryRemarks('');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900/95 text-white border border-emerald-500 p-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-in slide-in-from-top-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-300">Waste data saved successfully</h4>
            <p className="text-[11px] text-slate-300">
              Entry <span className="font-mono font-bold text-white">{lastSavedId}</span> has updated the live ward collection metrics.
            </p>
          </div>
          <button 
            onClick={() => onNavigate('dashboard')}
            className="ml-3 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold cursor-pointer"
          >
            View Dashboard
          </button>
        </div>
      )}

      {/* 1. DASHBOARD – OVERALL VIEW */}
      {(activeNav === 'dashboard' || activeNav === 'overview') && (
        <div className="space-y-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-lg border border-teal-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Ward Segregation & Collection Portal
                </span>
                <span className="text-xs text-slate-300">Ward: {currentUser.assignedZone || 'Mylapore Ward 173'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome, {currentUser.fullName}
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Daily source-segregated solid waste tally and monitoring dashboard • Tamil Nadu Urban Local Bodies Compliance
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => onNavigate('enter-waste')}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Enter Waste Data</span>
              </button>
              <button
                onClick={() => onNavigate('guide')}
                className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Segregation Guide</span>
              </button>
            </div>
          </div>

          {/* 4 TOP METRIC CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Total Waste Received */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Waste Received</span>
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {grandTotal.toLocaleString()}
                </span>
                <span className="text-sm font-bold text-slate-500">kg</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Today’s total collection
              </p>
            </div>

            {/* 2. Wet Waste (Organic) - Green Accent */}
            <div className="bg-white p-5 rounded-3xl border-2 border-emerald-500/30 bg-emerald-50/20 shadow-sm space-y-2 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Wet Waste (Organic)</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  🟢
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-700 tracking-tight">
                  {totalWet.toLocaleString()}
                </span>
                <span className="text-sm font-bold text-emerald-600">kg</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 ml-auto">
                  {wetPercentage}%
                </span>
              </div>
              <p className="text-xs text-emerald-700 font-medium">
                Compostable food & garden waste
              </p>
            </div>

            {/* 3. Dry Waste (Recyclable) - Blue Accent */}
            <div className="bg-white p-5 rounded-3xl border-2 border-blue-500/30 bg-blue-50/20 shadow-sm space-y-2 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Dry Waste (Recyclable)</span>
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  🔵
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-blue-700 tracking-tight">
                  {totalDry.toLocaleString()}
                </span>
                <span className="text-sm font-bold text-blue-600">kg</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 ml-auto">
                  {dryPercentage}%
                </span>
              </div>
              <p className="text-xs text-blue-700 font-medium">
                Plastics, paper, carton & metal scrap
              </p>
            </div>

            {/* 4. Hazardous Waste (Sanitary) - Orange/Red Accent */}
            <div className="bg-white p-5 rounded-3xl border-2 border-red-500/30 bg-red-50/20 shadow-sm space-y-2 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-800 uppercase tracking-wider">Hazardous Waste (Sanitary)</span>
                <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">
                  🔴
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-red-700 tracking-tight">
                  {totalHazardous.toLocaleString()}
                </span>
                <span className="text-sm font-bold text-red-600">kg</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 ml-auto">
                  {hazardousPercentage}%
                </span>
              </div>
              <p className="text-xs text-red-700 font-medium">
                Sanitary, domestic medical & hazardous
              </p>
            </div>
          </div>

          {/* RECENT ENTRIES TABLE */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-700" />
                  Recent Waste Collection Entries
                </h2>
                <p className="text-xs text-slate-500">
                  Ward-level manual records logged by segregation officers today
                </p>
              </div>
              <button
                onClick={() => onNavigate('enter-waste')}
                className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Entry</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/80">
                    <th className="py-3 px-3 rounded-l-xl">Date</th>
                    <th className="py-3 px-3">Location / Ward</th>
                    <th className="py-3 px-3 text-emerald-800">Wet (kg)</th>
                    <th className="py-3 px-3 text-blue-800">Dry (kg)</th>
                    <th className="py-3 px-3 text-red-800">Hazardous (kg)</th>
                    <th className="py-3 px-3 text-slate-900 font-extrabold">Total (kg)</th>
                    <th className="py-3 px-3 rounded-r-xl">Entered By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {entries.map(entry => (
                    <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-semibold text-slate-600 whitespace-nowrap">
                        {entry.date}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{entry.location}</div>
                        {entry.remarks && (
                          <div className="text-[11px] text-slate-400 italic max-w-xs truncate">
                            {entry.remarks}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 font-bold text-emerald-700">
                        {entry.wetKg} kg
                      </td>
                      <td className="py-3 px-3 font-bold text-blue-700">
                        {entry.dryKg} kg
                      </td>
                      <td className="py-3 px-3 font-bold text-red-700">
                        {entry.hazardousKg} kg
                      </td>
                      <td className="py-3 px-3 font-extrabold text-slate-900">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-mono">
                          {entry.totalKg} kg
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {entry.enteredBy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. NEW PAGE: "ENTER WASTE DATA" */}
      {activeNav === 'enter-waste' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900">Enter Waste Data</h1>
                  <p className="text-xs text-slate-500">Record daily door-to-door or ward segregated waste receipts</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Back to Dashboard
              </button>
            </div>

            <form onSubmit={handleSaveWasteData} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Field: Date (default today) */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Collection Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-emerald-500 bg-white font-medium"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Default set to today's date</span>
                </div>

                {/* Field: Ward / Location */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Ward / Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={entryLocation}
                    onChange={(e) => setEntryLocation(e.target.value)}
                    placeholder="e.g. Mylapore - Ward 173, Luz Church Road"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-emerald-500 bg-white font-medium"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Specify ward number or street name</span>
                </div>
              </div>

              {/* 3 Stream Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                {/* Wet Waste (Organic) – kg */}
                <div className="p-4 rounded-2xl border-2 border-emerald-500/20 bg-emerald-50/30 space-y-1.5">
                  <label className="block font-bold text-emerald-900">
                    🟢 Wet Waste (Organic) – kg <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      required
                      value={wetKgInput}
                      onChange={(e) => setWetKgInput(e.target.value)}
                      placeholder="e.g. 680"
                      className="w-full px-3.5 py-2.5 border border-emerald-200 rounded-xl focus:outline-emerald-500 bg-white font-extrabold text-base text-emerald-950 pr-8"
                    />
                    <span className="absolute right-3 top-3 font-bold text-slate-400 text-xs">kg</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 block">Food, peels, vegetable residue</span>
                </div>

                {/* Dry Waste (Recyclable) – kg */}
                <div className="p-4 rounded-2xl border-2 border-blue-500/20 bg-blue-50/30 space-y-1.5">
                  <label className="block font-bold text-blue-900">
                    🔵 Dry Waste (Recyclable) – kg <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      required
                      value={dryKgInput}
                      onChange={(e) => setDryKgInput(e.target.value)}
                      placeholder="e.g. 420"
                      className="w-full px-3.5 py-2.5 border border-blue-200 rounded-xl focus:outline-blue-500 bg-white font-extrabold text-base text-blue-950 pr-8"
                    />
                    <span className="absolute right-3 top-3 font-bold text-slate-400 text-xs">kg</span>
                  </div>
                  <span className="text-[10px] text-blue-700 block">Plastics, cartons, paper, cans</span>
                </div>

                {/* Hazardous Waste (Sanitary) – kg */}
                <div className="p-4 rounded-2xl border-2 border-red-500/20 bg-red-50/30 space-y-1.5">
                  <label className="block font-bold text-red-900">
                    🔴 Hazardous Waste (Sanitary) – kg <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      required
                      value={hazardousKgInput}
                      onChange={(e) => setHazardousKgInput(e.target.value)}
                      placeholder="e.g. 145"
                      className="w-full px-3.5 py-2.5 border border-red-200 rounded-xl focus:outline-red-500 bg-white font-extrabold text-base text-red-950 pr-8"
                    />
                    <span className="absolute right-3 top-3 font-bold text-slate-400 text-xs">kg</span>
                  </div>
                  <span className="text-[10px] text-red-700 block">Sanitary, biomedical, diapers</span>
                </div>
              </div>

              {/* Total Waste (auto-calculated) */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Total Waste (Auto-calculated)
                  </span>
                  <span className="text-xs text-slate-300">
                    Formula: Wet ({wetVal} kg) + Dry ({dryVal} kg) + Hazardous ({hazVal} kg)
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-emerald-400 tracking-tight">
                    {calculatedTotal.toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-slate-300">kg</span>
                </div>
              </div>

              {/* Remarks / Notes (optional) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Remarks / Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={entryRemarks}
                  onChange={(e) => setEntryRemarks(e.target.value)}
                  placeholder="e.g. High segregation compliance observed in residential apartment complexes. No contamination found."
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-emerald-500 bg-white placeholder:text-slate-400 resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Officer: <strong>{currentUser.fullName}</strong> • ID: <strong>{currentUser.employeeId || 'SEGR-CHN-001'}</strong>
                </span>
                <button
                  type="submit"
                  disabled={calculatedTotal <= 0}
                  className={`px-6 py-3 rounded-xl font-extrabold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer ${
                    calculatedTotal > 0
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>Save Waste Data</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. SEGREGATION GUIDE */}
      {activeNav === 'guide' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 max-w-4xl mx-auto">
          <div className="pb-4 border-b border-slate-100">
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-700" /> EcoTrack AI Segregation Protocol
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Statutory 3-way waste segregation guidelines aligned with Tamil Nadu Urban Local Bodies Solid Waste Management Rules
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center text-xs shadow-sm">
                GREEN
              </div>
              <h3 className="font-extrabold text-sm text-emerald-950">Wet Organic Waste</h3>
              <ul className="text-xs text-emerald-900 space-y-1.5 list-disc list-inside leading-relaxed">
                <li>Vegetable & fruit peels</li>
                <li>Cooked food residue & tea leaves</li>
                <li>Garden leaves & temple flower waste</li>
                <li>Eggshells & coconut husks</li>
                <li>Transported to micro-composting centers</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 space-y-3">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-xs shadow-sm">
                BLUE
              </div>
              <h3 className="font-extrabold text-sm text-blue-950">Dry Recyclable Waste</h3>
              <ul className="text-xs text-blue-900 space-y-1.5 list-disc list-inside leading-relaxed">
                <li>Cardboard & corrugated cartons</li>
                <li>PET plastic beverage bottles & jars</li>
                <li>Newspapers & stationery papers</li>
                <li>Metal cans & glass containers</li>
                <li>Sent to Material Recovery Facilities (MRF)</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-red-50 border border-red-200 space-y-3">
              <div className="w-9 h-9 rounded-full bg-red-600 text-white font-extrabold flex items-center justify-center text-xs shadow-sm">
                RED
              </div>
              <h3 className="font-extrabold text-sm text-red-950">Sanitary & Hazardous Waste</h3>
              <ul className="text-xs text-red-900 space-y-1.5 list-disc list-inside leading-relaxed">
                <li>Diapers & sanitary napkins (wrapped)</li>
                <li>Medical syringes & expired medicines</li>
                <li>Batteries, e-waste & broken glass</li>
                <li>Fluorescent tube lamps & aerosol cans</li>
                <li>Dispatched to specialized biomedical incinerators</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 4. PROFILE */}
      {activeNav === 'profile' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 max-w-lg mx-auto">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white font-bold flex items-center justify-center text-xl shadow-md">
              {currentUser.fullName[0]}
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">{currentUser.fullName}</h2>
              <p className="text-xs text-slate-500">{currentUser.email}</p>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 mt-1 inline-block border border-teal-200">
                Ward Segregation Officer / Resident
              </span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-50">
              <span className="text-slate-500">Assigned Chennai Ward:</span>
              <span className="font-bold text-slate-800">{currentUser.assignedZone || 'Mylapore Ward 173'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-50">
              <span className="text-slate-500">Official Mobile:</span>
              <span className="font-bold text-slate-800">{currentUser.phone}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-50">
              <span className="text-slate-500">Account Authorization:</span>
              <span className="font-bold text-emerald-700">Active Municipal Profile</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <button
              onClick={onLogout}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
            >
              Sign Out from Segregation Portal
            </button>
            <p className="text-[10px] text-center text-slate-400">
              To switch roles, sign out and sign in with the target credentials.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
