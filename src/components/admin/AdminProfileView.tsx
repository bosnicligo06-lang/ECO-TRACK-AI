import React, { useState } from 'react';
import { User, ChennaiZone } from '../../types';
import { 
  User as UserIcon, 
  Lock, 
  Key, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  RefreshCw, 
  LogOut, 
  Mail, 
  Phone, 
  Building2, 
  Award, 
  MapPin, 
  Fingerprint, 
  ExternalLink,
  ShieldAlert,
  Server,
  Smartphone,
  Save
} from 'lucide-react';

interface AdminProfileViewProps {
  currentUser: User;
  onUpdateUser?: (updated: User) => void;
  onLogout?: () => void;
}

export const AdminProfileView: React.FC<AdminProfileViewProps> = ({
  currentUser,
  onUpdateUser,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'credentials' | 'apikeys' | 'sessions'>('profile');

  // Profile Form State
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone);
  const [designation, setDesignation] = useState(currentUser.designation || 'Zonal Commissioner & Executive Officer (IAS)');
  const [employeeId, setEmployeeId] = useState(currentUser.employeeId || 'ECO-ADM-2026-9042');
  const [department, setDepartment] = useState(currentUser.department || 'Solid Waste Management & Smart City Mission');
  const [assignedZone, setAssignedZone] = useState<ChennaiZone>((currentUser.assignedZone as ChennaiZone) || 'T. Nagar');
  const [officeLocation, setOfficeLocation] = useState('Ripon Building, EVR Periyar Salai, Chennai 600003');

  // Credentials Form State
  const [username, setUsername] = useState(currentUser.username);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // 2FA & API Key States
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(currentUser.twoFactorEnabled ?? true);
  const [twoFactorMethod, setTwoFactorMethod] = useState<'totp' | 'sms'>('totp');
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [apiKey, setApiKey] = useState(currentUser.apiKey || 'ecotrack_live_chennai_99a8f27b401e9c20a1');
  const [showApiKey, setShowApiKey] = useState(false);

  // Status & Feedback States
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedRecovery, setCopiedRecovery] = useState(false);

  const recoveryCodes = [
    'ECO-9481-2291',
    'ECO-4820-1193',
    'ECO-7731-0944',
    'ECO-6284-5510',
    'ECO-3391-8842',
    'ECO-1052-6729',
    'ECO-8849-3105',
    'ECO-5527-4491'
  ];

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Password Strength Calculation
  const calculatePasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass)) score += 25;
    if (/[^A-Za-z0-9]/.test(pass)) score += 25;

    if (score <= 25) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score <= 50) return { score, label: 'Moderate', color: 'bg-amber-500' };
    if (score <= 75) return { score, label: 'Strong', color: 'bg-emerald-500' };
    return { score: 100, label: 'Very Strong', color: 'bg-emerald-600' };
  };

  const passStrength = calculatePasswordStrength(newPassword);

  // Handle Profile Update
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      showToast('Please fill in required fields (Name and Email).', 'error');
      return;
    }

    const updated: User = {
      ...currentUser,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      designation: designation.trim(),
      employeeId: employeeId.trim(),
      department: department.trim(),
      assignedZone,
      twoFactorEnabled,
      apiKey
    };

    if (onUpdateUser) {
      onUpdateUser(updated);
    }
    showToast('Admin official profile updated and persisted successfully!');
  };

  // Handle Credentials & Password Change
  const handleUpdateCredentials = (e: React.FormEvent) => {
    e.preventDefault();

    // Check username
    if (!username.trim()) {
      showToast('Username cannot be empty.', 'error');
      return;
    }

    // Check if user is attempting to change password
    if (newPassword || confirmPassword || currentPassword) {
      const activePass = currentUser.password || 'admin123';
      if (currentPassword !== activePass) {
        showToast('Current password does not match recorded municipal credentials.', 'error');
        return;
      }

      if (newPassword.length < 6) {
        showToast('New password must contain at least 6 characters.', 'error');
        return;
      }

      if (newPassword !== confirmPassword) {
        showToast('New password and confirmation password do not match.', 'error');
        return;
      }
    }

    const updated: User = {
      ...currentUser,
      username: username.trim(),
      password: newPassword ? newPassword.trim() : (currentUser.password || 'admin123'),
      twoFactorEnabled
    };

    if (onUpdateUser) {
      onUpdateUser(updated);
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('Municipal account credentials and password updated successfully!');
  };

  // Regenerate API Key
  const handleRegenerateApiKey = () => {
    const chars = 'abcdef0123456789';
    let rand = '';
    for (let i = 0; i < 20; i++) {
      rand += chars[Math.floor(Math.random() * chars.length)];
    }
    const newKey = `ecotrack_live_chennai_${rand}`;
    setApiKey(newKey);

    const updated: User = {
      ...currentUser,
      apiKey: newKey
    };
    if (onUpdateUser) {
      onUpdateUser(updated);
    }
    showToast('LoRaWAN & IoT Telemetry API Key regenerated and saved!');
  };

  const copyToClipboard = (text: string, isRecovery = false) => {
    navigator.clipboard.writeText(text);
    if (isRecovery) {
      setCopiedRecovery(true);
      setTimeout(() => setCopiedRecovery(false), 2000);
    } else {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-2 text-xs font-bold transition-all transform animate-in fade-in slide-in-from-bottom-2 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700 shadow-emerald-900/30'
              : 'bg-red-900 text-white border-red-700 shadow-red-900/30'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Profile Hero Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-700/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-extrabold flex items-center justify-center text-2xl sm:text-3xl shadow-lg border-2 border-emerald-400/30">
                {currentUser.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center" title="Online Verified Official">
                <Check className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  {currentUser.fullName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                  Admin Authority
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  {twoFactorEnabled ? '2FA Enforced' : 'Standard Auth'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                {designation}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  Badge: <strong className="text-slate-200">{employeeId}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-400" />
                  Jurisdiction: <strong className="text-slate-200">{assignedZone} Ward</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-slate-200 font-mono text-[11px]">{currentUser.email}</span>
                </span>
              </div>
            </div>
          </div>

          {onLogout && (
            <div className="shrink-0 flex items-center gap-2">
              <button
                onClick={onLogout}
                className="px-4 py-2.5 bg-red-600/90 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 border border-red-500/30"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800 text-xs">
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <span className="text-slate-400 block text-[10px] font-medium">Platform Role</span>
            <span className="font-extrabold text-white text-sm">Super Admin</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <span className="text-slate-400 block text-[10px] font-medium">System Username</span>
            <span className="font-mono text-emerald-300 text-sm font-bold">@{currentUser.username}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <span className="text-slate-400 block text-[10px] font-medium">Primary Division</span>
            <span className="font-bold text-slate-200 text-xs truncate block" title={department}>
              {department}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <span className="text-slate-400 block text-[10px] font-medium">Access Tier</span>
            <span className="font-bold text-teal-300 text-xs flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Root Municipal Clearance
            </span>
          </div>
        </div>
      </div>

      {/* Profile Section Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1 text-xs font-bold">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Admin Profile Details</span>
        </button>

        <button
          onClick={() => setActiveTab('credentials')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'credentials'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Account Credentials & Password</span>
        </button>

        <button
          onClick={() => setActiveTab('apikeys')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'apikeys'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>IoT Telemetry & API Keys</span>
        </button>

        <button
          onClick={() => setActiveTab('sessions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'sessions'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Fingerprint className="w-4 h-4" />
          <span>Active Sessions & Permissions</span>
        </button>
      </div>

      {/* TAB 1: PROFILE DETAILS */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Official Municipal Officer Profile</h2>
              <p className="text-xs text-slate-500">Update your officer identity, departmental posting, and public contact information.</p>
            </div>
            <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
              EcoTrack AI Admin Registry
            </span>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Legal & Official Name *</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. S. Rajendran, IAS"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-emerald-600 font-medium text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Municipal Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@chennaiwaste.gov.in"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-emerald-600 font-medium text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Contact Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 94440 01122"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-emerald-600 font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Officer Designation / Cadre</label>
                <div className="relative">
                  <Award className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="Zonal Commissioner & Executive Officer (IAS)"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-emerald-600 font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Municipal Employee ID / Badge #</label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="ECO-ADM-2026-9042"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-emerald-600 font-medium text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Command Zone Jurisdiction</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <select
                    value={assignedZone}
                    onChange={(e) => setAssignedZone(e.target.value as ChennaiZone)}
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-emerald-600 font-medium text-slate-800 bg-white"
                  >
                    <option value="T. Nagar">T. Nagar Ward</option>
                    <option value="Adyar">Adyar Ward</option>
                    <option value="Velachery">Velachery Ward</option>
                    <option value="Anna Nagar">Anna Nagar Ward</option>
                    <option value="Mylapore">Mylapore Ward</option>
                    <option value="Tambaram">Tambaram Ward</option>
                    <option value="Perungudi">Perungudi Ward</option>
                    <option value="Ambattur">Ambattur Ward</option>
                    <option value="Guindy">Guindy Ward</option>
                    <option value="Sholinganallur">Sholinganallur Ward</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Department / Operations Wing</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Solid Waste Management & Smart City Mission"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-emerald-600 font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Headquarters / Physical Office Address</label>
                <input
                  type="text"
                  value={officeLocation}
                  onChange={(e) => setOfficeLocation(e.target.value)}
                  placeholder="Ripon Building, EVR Periyar Salai, Chennai 600003"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-emerald-600 font-medium text-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 text-xs"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: ACCOUNT CREDENTIALS & SECURITY */}
      {activeTab === 'credentials' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="pb-4 border-b border-slate-100">
              <h2 className="text-lg font-extrabold text-slate-900">Municipal Account Credentials & Security</h2>
              <p className="text-xs text-slate-500">Manage your login username, password credentials, and authentication protection.</p>
            </div>

            <form onSubmit={handleUpdateCredentials} className="space-y-5 text-xs">
              {/* Username Field */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="block font-bold text-slate-800">
                  Municipal System Username
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin"
                      className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl font-mono text-slate-900 bg-white"
                      required
                    />
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Used for password login & CLI access
                  </span>
                </div>
              </div>

              {/* Password Section */}
              <div className="space-y-4 pt-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  Update Account Password
                </h3>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Current Password *</label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password (default: admin123)"
                      className="w-full px-3 py-2.5 pr-10 border border-slate-200 rounded-xl focus:outline-emerald-600 font-medium text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Default demo administrative password: <code>admin123</code></p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3 py-2.5 pr-10 border border-slate-200 rounded-xl focus:outline-emerald-600 font-medium text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPass ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3 py-2.5 pr-10 border border-slate-200 rounded-xl focus:outline-emerald-600 font-medium text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password Strength Meter */}
                {newPassword && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-semibold text-slate-600">Password Security Strength:</span>
                      <span className="font-bold text-slate-800">{passStrength.label}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${passStrength.color}`}
                        style={{ width: `${passStrength.score}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Recommendation: Mix uppercase, lowercase, numbers, and symbols for high municipal resilience.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 text-xs"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Update Account Credentials</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: 2FA & Quick Credential Reference */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4 text-xs">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Two-Factor Authentication (2FA)
              </h3>
              <p className="text-slate-500 leading-relaxed">
                Mandatory for high-level municipal officers issuing waste fleet dispatches. Protects against credential stuffing.
              </p>

              <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-950 block">2FA Status</span>
                  <span className="text-[10px] text-emerald-700">
                    {twoFactorEnabled ? 'Active (Strict Enforcement)' : 'Disabled (Standard)'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newState = !twoFactorEnabled;
                    setTwoFactorEnabled(newState);
                    if (onUpdateUser) {
                      onUpdateUser({ ...currentUser, twoFactorEnabled: newState });
                    }
                    showToast(`Two-factor authentication is now ${newState ? 'enabled' : 'disabled'}.`);
                  }}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    twoFactorEnabled ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md transform" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">Verification Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTwoFactorMethod('totp')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      twoFactorMethod === 'totp'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-xs font-bold">Authenticator App</span>
                    <span className="text-[10px] text-slate-500">TOTP (Google/Authy)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTwoFactorMethod('sms')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      twoFactorMethod === 'sms'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-xs font-bold">Government SMS</span>
                    <span className="text-[10px] text-slate-500">NIC Gateway OTP</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowRecoveryModal(true)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-center text-xs flex items-center justify-center gap-1.5"
              >
                <Key className="w-3.5 h-3.5" />
                <span>View Emergency Backup Codes</span>
              </button>
            </div>

            {/* Quick Demo Credentials Reminder */}
            <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-3 text-xs border border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                EcoTrack AI Live Credentials
              </span>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-1 border-b border-slate-800">
                  <span className="text-slate-400">Current Login Email:</span>
                  <span className="font-mono text-slate-200">{currentUser.email}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800">
                  <span className="text-slate-400">Current Username:</span>
                  <span className="font-mono text-emerald-400">@{currentUser.username}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800">
                  <span className="text-slate-400">Recorded Password:</span>
                  <span className="font-mono text-slate-200">
                    {currentUser.password ? '••••••••••' : 'admin123'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Session ID:</span>
                  <span className="font-mono text-slate-400 text-[10px]">sess_adm_9941a82f</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: API & DEVELOPER KEYS */}
      {activeTab === 'apikeys' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Municipal IoT Telemetry & API Keys</h2>
              <p className="text-xs text-slate-500">
                Credentials used by Chennai smart dustbin LoRaWAN gateways, GIS GPS units, and command dashboards.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 text-[10px] font-extrabold border border-blue-200">
              v2.4 Telemetry Gateway
            </span>
          </div>

          <div className="space-y-5 text-xs">
            {/* Master Telemetry API Key */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-bold text-slate-900 flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-600" />
                  Master LoRaWAN & Dustbin Sensor API Key
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="text-slate-500 hover:text-slate-700 text-xs font-semibold flex items-center gap-1"
                  >
                    {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showApiKey ? 'Hide' : 'Reveal'}</span>
                  </button>
                  <button
                    onClick={() => copyToClipboard(apiKey)}
                    className="text-emerald-700 hover:text-emerald-800 text-xs font-bold flex items-center gap-1"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  readOnly
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl font-mono text-slate-800 text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <p className="text-[10px] text-slate-400">
                  Transmits fill levels, smell VOC indices, and load cell weights directly to central processing.
                </p>
                <button
                  type="button"
                  onClick={handleRegenerateApiKey}
                  className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg text-[10px] flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Regenerate Key</span>
                </button>
              </div>
            </div>

            {/* GIS Fleet Tracking Webhook URL */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-bold text-slate-900 flex items-center gap-2">
                  <Server className="w-4 h-4 text-blue-600" />
                  GIS Fleet Telemetry Ingestion Webhook
                </label>
                <button
                  onClick={() => copyToClipboard('https://api.chennaiwaste.gov.in/v1/telemetry/webhook')}
                  className="text-blue-700 hover:text-blue-800 text-xs font-bold flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Webhook URL</span>
                </button>
              </div>
              <input
                type="text"
                value="https://api.chennaiwaste.gov.in/v1/telemetry/webhook"
                readOnly
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-slate-800 text-xs"
              />
              <p className="text-[10px] text-slate-400">
                Payload format: JSON with HMAC-SHA256 signature verification.
              </p>
            </div>

            {/* Sensor Gateway Radio Configuration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">LoRaWAN Gateway Network ID</span>
                <span className="font-mono text-slate-700 text-xs block">ECO-GW-CHENNAI-868MHZ</span>
                <span className="text-[10px] text-emerald-700 font-semibold mt-1 inline-block">Status: Synchronized (Band IN865)</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">CCTV Computer Vision Stream Token</span>
                <span className="font-mono text-slate-700 text-xs block">rtsp://cv.chennaiwaste.gov.in:554/live</span>
                <span className="text-[10px] text-blue-700 font-semibold mt-1 inline-block">6 Operational Highway Feeds</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ACTIVE SESSIONS & PERMISSIONS */}
      {activeTab === 'sessions' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-lg font-extrabold text-slate-900">Active Sessions & Security Clearances</h2>
            <p className="text-xs text-slate-500">Monitor active administrator sessions and verify role permissions.</p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Current Session */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">Current Browser Session (Active Now)</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-bold">This Device</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Chrome / WebKit on Linux / Dev Container • IP: 103.117.156.4 (Chennai, Tamil Nadu)
                </p>
              </div>
              <span className="text-emerald-700 font-mono text-[11px] font-bold">TLS 1.3 Encrypted</span>
            </div>

            {/* Municipal Permissions Matrix */}
            <div className="space-y-3 pt-2">
              <h3 className="font-bold text-slate-900 text-sm">Administrative Authority Privileges</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block">Fleet Dispatch & Driver Override</span>
                    <span className="text-[10px] text-slate-500">Full capability to assign, reroute, and cancel truck tasks.</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block">Sensor Threshold & Logic Override</span>
                    <span className="text-[10px] text-slate-500">Adjust high-fill trigger levels (40-90%) and smell thresholds.</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block">Citizen Grievance Resolution</span>
                    <span className="text-[10px] text-slate-500">Approve, close, and respond to ward overflow complaints.</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block">Audit Log Cryptographic Inspection</span>
                    <span className="text-[10px] text-slate-500">Review all immutable administrative audit trails across 10 wards.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Recovery Codes Modal */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Emergency 2FA Recovery Codes
              </h3>
              <button
                onClick={() => setShowRecoveryModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Store these single-use emergency backup codes in a secure location. They allow access if you lose your phone or 2FA token.
            </p>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 font-mono text-xs text-slate-800 grid grid-cols-2 gap-2">
              {recoveryCodes.map((code, idx) => (
                <div key={idx} className="p-1.5 bg-white rounded border border-slate-200 text-center font-bold">
                  {code}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => copyToClipboard(recoveryCodes.join('\n'), true)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-700 font-bold text-xs flex items-center gap-1.5"
              >
                {copiedRecovery ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedRecovery ? 'Codes Copied' : 'Copy All Codes'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowRecoveryModal(false)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
