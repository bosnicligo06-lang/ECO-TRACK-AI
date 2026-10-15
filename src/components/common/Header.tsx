import React, { useState } from 'react';
import { User, UserRole, DeviceAlert } from '../../types';
import { 
  Recycle, 
  Bell, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X, 
  AlertTriangle, 
  ChevronDown,
  ShieldCheck,
  Truck,
  Building2,
  Phone
} from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  activeNav: string;
  onNavigate: (navId: string) => void;
  onLogout: () => void;
  alerts: DeviceAlert[];
  onOpenAlerts?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeNav,
  onNavigate,
  onLogout,
  alerts,
  onOpenAlerts
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadAlerts = alerts.filter(a => !a.acknowledged);

  // Role-specific navigation links as specified in prompt section 4
  // 1. Admin / Command Center Portal (8 items)
  const adminNavLinks = [
    { id: 'overview', label: 'Overview' },
    { id: 'map', label: 'Live Chennai Map' },
    { id: 'allocation', label: 'Auto Allocation' },
    { id: 'manual-allocation', label: 'Manual Allocation' },
    { id: 'pickups', label: 'Pickups' },
    { id: 'trucks', label: 'Trucks' },
    { id: 'alerts', label: 'Alerts' },
    { id: 'reports', label: 'Reports' },
  ];

  // 2. Driver Portal (5 items)
  const driverNavLinks = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'my-truck', label: 'My Truck' },
    { id: 'my-route', label: 'My Route' },
    { id: 'my-pickups', label: 'My Pickups' },
    { id: 'profile', label: 'Profile' },
  ];

  // 3. Segregation / Community Portal (4 items)
  const segregationNavLinks = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'enter-waste', label: 'Enter Waste Data' },
    { id: 'guide', label: 'Segregation Guide' },
    { id: 'profile', label: 'Profile' },
  ];

  const navLinks = 
    currentUser.role === 'ADMIN' 
      ? adminNavLinks 
      : currentUser.role === 'DRIVER' 
        ? driverNavLinks 
        : segregationNavLinks;

  const roleLabel = 
    currentUser.role === 'ADMIN' 
      ? 'Administrator' 
      : currentUser.role === 'DRIVER' 
        ? 'Municipal Driver' 
        : 'Segregation User';

  const roleBadgeColor = 
    currentUser.role === 'ADMIN' 
      ? 'bg-purple-100 text-purple-800 border-purple-200' 
      : currentUser.role === 'DRIVER' 
        ? 'bg-blue-100 text-blue-800 border-blue-200' 
        : 'bg-emerald-100 text-emerald-800 border-emerald-200';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Recycle className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900">
                  EcoTrack <span className="text-emerald-600">AI</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 hidden sm:inline-block">
                  EcoTrack Operations
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                EcoTrack AI • Smart IoT & Fleet Management
              </p>
            </div>
          </div>

          {/* Right Header Section: Helpline, Alerts, Profile Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* EcoTrack Helpline */}
            <a 
              href="tel:1913" 
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
              title="EcoTrack AI Citizen Waste Helpline"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Helpline: <strong>1913</strong></span>
            </a>

            {/* Device Alert Bell */}
            <button
              onClick={() => onNavigate('alerts')}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Device & Sensor Alerts"
            >
              <Bell className="w-5 h-5" />
              {unreadAlerts.length > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white animate-pulse">
                  {unreadAlerts.length}
                </span>
              )}
            </button>

            {/* Profile Dropdown with EXCLUSIVE Logout button */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-bold flex items-center justify-center text-xs">
                  {currentUser.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div className="hidden sm:block text-left text-xs">
                  <div className="font-bold text-slate-900 leading-tight max-w-[140px] truncate">{currentUser.fullName}</div>
                  <div className="text-[10px] text-slate-500 font-medium capitalize">{roleLabel}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Menu Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50">
                  <div className="px-4 pb-3 border-b border-slate-100">
                    <p className="font-extrabold text-sm text-slate-900">{currentUser.fullName}</p>
                    <p className="text-xs text-slate-500">{currentUser.email}</p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${roleBadgeColor}`}>
                        {roleLabel}
                      </span>
                      {currentUser.assignedTruckId && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                          {currentUser.assignedTruckId}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-2 space-y-1 text-xs">
                    <button
                      onClick={() => { onNavigate('profile'); setShowProfileMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>Account Credentials & Profile</span>
                    </button>
                    {currentUser.role === 'ADMIN' && (
                      <button
                        onClick={() => { onNavigate('settings'); setShowProfileMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-slate-400" />
                        <span>Municipal Policy & Sensor Limits</span>
                      </button>
                    )}
                  </div>

                  {/* EXCLUSIVE LOGOUT OPTION */}
                  <div className="p-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 font-bold text-xs transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Sign Out from EcoTrack AI</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-2 -mb-px overflow-x-auto py-1 scrollbar-none" aria-label="Main Navigation">
          {navLinks.map(link => {
            const isActive = activeNav === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'border-emerald-600 text-emerald-800 bg-emerald-50/70 font-bold shadow-2xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 py-3 space-y-1 max-h-[70vh] overflow-y-auto">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium ${
                  activeNav === link.id
                    ? 'bg-emerald-50 text-emerald-800 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};
