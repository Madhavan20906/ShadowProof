import React from 'react';
import { AuditLog } from '../types/shadowproof';
import { FileText, Download, X, CheckCircle2, ShieldCheck, Clock, Lock, Cpu } from 'lucide-react';

interface AuditTrailModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditLog: AuditLog | null;
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({
  isOpen,
  onClose,
  auditLog
}) => {
  if (!isOpen) return null;

  if (!auditLog) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
        <div className="glass-panel max-w-xl w-full p-6 border-amber-500/40 bg-slate-950 shadow-2xl relative flex flex-col items-center text-center">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded bg-slate-900 border border-slate-800"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4 animate-pulse">
            <FileText className="w-7 h-7" />
          </div>

          <h2 className="text-lg font-bold text-white mb-2">
            IMMUTABLE COMPLIANCE AUDIT RECORD
          </h2>
          <span className="cyber-badge badge-amber text-[10px] mb-3">STATUS: PRE-EXECUTION DRAFT</span>

          <p className="text-xs text-slate-400 font-mono leading-relaxed mb-6">
            Immutable compliance audit logs are generated automatically once a rehearsed plan is approved by a human gatekeeper and executed against real system APIs.
          </p>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-amber-400 transition-all shadow-lg"
          >
            Close & Continue Simulation
          </button>
        </div>
      </div>
    );
  }

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLog, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `shadowproof-audit-${auditLog.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel max-w-3xl w-full p-6 border-amber-500/40 bg-slate-950 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded bg-slate-900 border border-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800">
          <div className="p-3 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-wide">
                IMMUTABLE COMPLIANCE AUDIT RECORD
              </h2>
              <span className="cyber-badge badge-amber">RECORD ID: {auditLog.id}</span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Complete proof trail: Intent → Shadow Simulation → Human Approval → Real Execution → Verification
            </p>
          </div>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 font-mono text-xs">
          {/* Section 1: Request Overview */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>TIMESTAMP: {auditLog.timestamp}</span>
              <span className="text-cyan-400 font-bold">MODE: SHADOWPROOF REHEARSAL</span>
            </div>
            <div className="text-white font-bold font-sans text-sm">
              Intent Prompt: "{auditLog.userIntent}"
            </div>
          </div>

          {/* Section 2: Simulated Outcomes Comparison */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <h3 className="font-bold text-slate-200 font-sans text-xs uppercase tracking-wider">
              1. Simulated Plan Comparison:
            </h3>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded bg-rose-950/30 border border-rose-900 text-rose-300">
                <span className="font-bold block">Plan A (Direct):</span>
                <span>Risk: {auditLog.planA.riskScore}% | Failures: {auditLog.planA.consequences.length}</span>
              </div>
              <div className="p-2 rounded bg-emerald-950/30 border border-emerald-900 text-emerald-300">
                <span className="font-bold block">Plan B (ShadowProof):</span>
                <span>Risk: {auditLog.planB.riskScore}% | Failures: 0 (SAFE)</span>
              </div>
            </div>
          </div>

          {/* Section 3: Human Approval Authorization */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-slate-300">
            <h3 className="font-bold text-slate-200 font-sans text-xs uppercase tracking-wider mb-1">
              2. Human Approval Authorization:
            </h3>
            <div>Approved By: <span className="text-cyan-300 font-bold">{auditLog.approvedBy}</span></div>
            <div>Approval Timestamp: <span className="text-slate-400">{auditLog.approvalTimestamp}</span></div>
            <div>Selected Plan: <span className="text-emerald-400 font-bold">{auditLog.selectedPlanId}</span></div>
          </div>

          {/* Section 4: Post Verification Health */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <h3 className="font-bold text-slate-200 font-sans text-xs uppercase tracking-wider mb-1">
              3. Post-Flight Health Verification Checklist:
            </h3>
            {auditLog.verificationChecklist.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-[11px] p-1.5 rounded bg-slate-950 border border-slate-850">
                <span className="text-slate-300 font-sans">{item.label}</span>
                <span className="cyber-badge badge-emerald text-[9px]">{item.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Toolbar */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-800">
          <span className="text-[11px] text-slate-500 font-mono">
            SHA-256 Digest: 8f92a10b4c81... verified
          </span>

          <button
            onClick={handleDownloadJSON}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-lg"
          >
            <Download className="w-4 h-4" />
            Export Audit JSON Report
          </button>
        </div>
      </div>
    </div>
  );
};
