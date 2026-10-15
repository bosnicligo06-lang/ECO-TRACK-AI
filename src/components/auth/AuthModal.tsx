import React, { useState } from 'react';
import { User } from '../../types';
import { 
  Recycle, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Building2,
  KeyRound,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface AuthModalProps {
  users: User[];
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  users,
  onLoginSuccess
}) => {
  const [identifier, setIdentifier] = useState('admin@chennaiwaste.gov.in');
  const [password, setPassword] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const matched = users.find(u => 
      u.email.toLowerCase() === identifier.trim().toLowerCase() ||
      u.username.toLowerCase() === identifier.trim().toLowerCase()
    );

    if (!matched) {
      setErrorMsg('Invalid municipal credentials. Please check your username/email.');
      return;
    }

    const expectedPass = matched.password || 'admin123';
    if (password.trim() !== expectedPass) {
      setErrorMsg('Incorrect municipal password. Please check your credentials or reset password.');
      return;
    }

    onLoginSuccess(matched);
  };

  const fillCredentials = (email: string, pass: string) => {
    setIdentifier(email);
    setPassword(pass);
    setErrorMsg('');
  };

  const handlePasswordRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setResetSuccess(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setResetSuccess(false);
      setForgotEmail('');
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden">
        {/* Top Decorative Header */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600" />

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-600/20">
            <Recycle className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            EcoTrack AI
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Smart Waste Collection & IoT Fleet Management Portal
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Municipal Email / Username</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. admin@chennaiwaste.gov.in"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-emerald-500 font-medium text-slate-900"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-slate-700">Password</label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-emerald-500 font-medium text-slate-900"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs mt-2"
          >
            <span>Authenticate Securely</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Credentials Filler for Demonstration */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2.5">
            Registered Municipal Accounts
          </p>
          {(() => {
            const adminUser = users.find(u => u.role === 'ADMIN');
            const driver500 = users.find(u => u.assignedTruckId === 'TRUCK-500');
            const driver1000 = users.find(u => u.assignedTruckId === 'TRUCK-1000');
            const driverAuto1 = users.find(u => u.assignedTruckId === 'AUTO-100-1');
            const driverAuto2 = users.find(u => u.assignedTruckId === 'AUTO-100-2');
            const segUser = users.find(u => u.role === 'SEGREGATION_USER');

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => fillCredentials(adminUser?.email || 'admin@chennaiwaste.gov.in', adminUser?.password || 'admin123')}
                  className="p-2 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 text-left transition-all"
                >
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>Administrator</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-bold">ADMIN</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono truncate">{adminUser?.email || 'admin@chennaiwaste.gov.in'}</p>
                </button>

                <button
                  type="button"
                  onClick={() => fillCredentials(driver500?.email || 'murugan.driver@chennaiwaste.gov.in', driver500?.password || 'driver123')}
                  className="p-2 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-left transition-all"
                >
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>Driver (TRUCK-500)</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">500 KG</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono truncate">{driver500?.email || 'murugan.driver'}</p>
                </button>

                <button
                  type="button"
                  onClick={() => fillCredentials(driver1000?.email || 'selvam.driver@chennaiwaste.gov.in', driver1000?.password || 'driver123')}
                  className="p-2 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-left transition-all"
                >
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>Driver (TRUCK-1000)</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">1000 KG</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono truncate">{driver1000?.email || 'selvam.driver'}</p>
                </button>

                <button
                  type="button"
                  onClick={() => fillCredentials(driverAuto1?.email || 'ramesh.auto@chennaiwaste.gov.in', driverAuto1?.password || 'auto123')}
                  className="p-2 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 text-left transition-all"
                >
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>Driver (Eco Auto 01)</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">🛺 100 KG</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono truncate">{driverAuto1?.email || 'ramesh.auto'}</p>
                </button>

                <button
                  type="button"
                  onClick={() => fillCredentials(driverAuto2?.email || 'vijay.auto@chennaiwaste.gov.in', driverAuto2?.password || 'auto123')}
                  className="p-2 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 text-left transition-all"
                >
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>Driver (Eco Auto 02)</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">🛺 200 KG</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono truncate">{driverAuto2?.email || 'vijay.auto'}</p>
                </button>

                <button
                  type="button"
                  onClick={() => fillCredentials(segUser?.email || 'kavitha.segregation@chennaiwaste.gov.in', segUser?.password || 'seg123')}
                  className="p-2 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition-all"
                >
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>Segregation Officer</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">OFFICER</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono truncate">{segUser?.email || 'kavitha.segregation'}</p>
                </button>
              </div>
            );
          })()}
        </div>

        {/* Password Recovery Modal */}
        {showForgotModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-emerald-600" /> Municipal Password Recovery
                </h3>
                <button onClick={() => setShowForgotModal(false)} className="text-slate-400 font-bold">✕</button>
              </div>

              {resetSuccess ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Password recovery link dispatched to municipal administrator email.</span>
                </div>
              ) : (
                <form onSubmit={handlePasswordRecovery} className="space-y-3 text-xs">
                  <p className="text-slate-600">
                    Enter your registered EcoTrack AI email address to receive secure OTP reset instructions.
                  </p>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@chennaiwaste.gov.in"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    required
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-emerald-700 text-white font-bold rounded-lg"
                    >
                      Dispatch OTP
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
