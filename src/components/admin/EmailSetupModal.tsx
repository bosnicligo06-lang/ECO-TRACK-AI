import React, { useState } from 'react';
import { EMAIL_SETUP_INSTRUCTIONS, OFFICIAL_COMPLAINT_EMAIL } from '../../services/complaintService';
import { 
  X, 
  Mail, 
  CheckCircle2, 
  Copy, 
  ShieldCheck, 
  KeyRound, 
  Server, 
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface EmailSetupModalProps {
  onClose: () => void;
  onTriggerSync: () => void;
}

export const EmailSetupModal: React.FC<EmailSetupModalProps> = ({
  onClose,
  onTriggerSync
}) => {
  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(OFFICIAL_COMPLAINT_EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      onTriggerSync();
      setIsSyncing(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">Citizen Email Inbox Integration</h2>
              <p className="text-xs text-slate-400">
                Official Gmail address: <strong>{OFFICIAL_COMPLAINT_EMAIL}</strong>
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

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* Active Mailbox Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 uppercase">
                Active Operational Mailbox
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-base font-extrabold font-mono text-slate-900">{OFFICIAL_COMPLAINT_EMAIL}</span>
                <button
                  onClick={handleCopyEmail}
                  className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-white"
                  title="Copy email address"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Public address displayed on GCC citizen boards, street signages, and digital portals.
              </p>
            </div>

            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-sm flex items-center gap-1.5 shrink-0 self-start sm:self-center"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Checking Mailbox...' : 'Poll ecotrackai123@gmail.com'}</span>
            </button>
          </div>

          {/* Configuration Protocol Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-blue-600" /> Inbound IMAP Server
              </span>
              <p className="font-mono text-slate-900">Host: <strong>imap.gmail.com</strong></p>
              <p className="font-mono text-slate-600">Port: <strong>993 (SSL/TLS required)</strong></p>
              <span className="text-[10px] text-slate-400 block pt-1">Automated unread email parser</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-emerald-600" /> Authentication & Security
              </span>
              <p className="text-slate-900">Method: <strong>Google App Passwords or OAuth2</strong></p>
              <p className="text-slate-600">Scopes: <code>https://mail.google.com/</code></p>
              <span className="text-[10px] text-slate-400 block pt-1">Never expose tokens in browser bundle</span>
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-3">
            <span className="font-extrabold text-slate-900 text-sm block flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Production Connection Steps
            </span>

            <ol className="space-y-2 list-decimal list-inside text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
              {EMAIL_SETUP_INSTRUCTIONS.steps.map((step, idx) => (
                <li key={idx} className="pl-1">
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Duplicate Detection Note */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] leading-relaxed">
            <strong>Duplicate Prevention Guarantee:</strong> Each incoming email is fingerprinted using message IDs and sender address hashes. If the same email arrives multiple times or the inbox is re-polled, EcoTrack AI prevents duplicate ticket generation.
          </div>

          {/* Action */}
          <div className="pt-2 border-t border-slate-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl"
            >
              Close Setup Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
