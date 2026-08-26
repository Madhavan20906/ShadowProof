import React from 'react';
import { AuditLog } from '../types/shadowproof';
import { FileText, Download, X } from 'lucide-react';

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80">
        <div className="bg-[#131823] max-w-md w-full p-6 border border-slate-800 rounded-lg shadow-xl relative flex flex-col items-center text-center">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded bg-slate-900 border border-slate-800"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 rounded bg-amber-950/40 border border-amber-900/40 flex items-center justify-center text-amber-400 mb-3">
            <FileText className="w-6 h-6" />
          </div>

          <h2 className="text-sm font-semibold text-white mb-1">
            Compliance Audit Log Empty
          </h2>

          <p className="text-xs text-slate-400 leading-relaxed mb-5">
            Audit log records are generated automatically upon approved plan execution.
          </p>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
          >
            Close
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80">
      <div className="bg-[#131823] max-w-2xl w-full p-6 border border-slate-800 rounded-lg shadow-xl relative max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded bg-slate-900 border border-slate-800"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800">
          <div className="p-2.5 rounded bg-amber-950/40 border border-amber-900/40 text-amber-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-white">
                Compliance Audit Trail
              </h2>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                {auditLog.id}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Audit log recording intent, simulation metrics, authorization, and verification state.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 text-xs">
          {/* Section 1: Overview */}
          <div className="p-3 rounded-md bg-[#0B0E14] border border-slate-800 space-y-1">
            <div className="flex justify-between text-slate-400 text-[11px] font-mono">
              <span>Timestamp: {auditLog.timestamp}</span>
              <span className="text-blue-400">Status: Executed</span>
            </div>
            <div className="text-white font-medium text-xs mt-1">
              Intent: "{auditLog.userIntent}"
            </div>
          </div>

          {/* Section 2: Comparison */}
          <div className="p-3 rounded-md bg-[#0B0E14] border border-slate-800 space-y-2">
            <h3 className="font-semibold text-white text-xs">
              Simulated Plan Comparison
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300">
                <span className="font-semibold block text-red-400">Plan A (Direct):</span>
                <span>Risk: {auditLog.planA.riskScore}% | Failures: {auditLog.planA.consequences.length}</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300">
                <span className="font-semibold block text-emerald-400">Plan B (ShadowProof):</span>
                <span>Risk: {auditLog.planB.riskScore}% | Failures: 0</span>
              </div>
            </div>
          </div>

          {/* Section 3: Approval */}
          <div className="p-3 rounded-md bg-[#0B0E14] border border-slate-800 space-y-1 text-slate-300">
            <h3 className="font-semibold text-white text-xs mb-1">
              Approval Authorization
            </h3>
            <div>Approved By: <span className="text-white font-medium">{auditLog.approvedBy}</span></div>
            <div>Timestamp: <span className="text-slate-400 font-mono">{auditLog.approvalTimestamp}</span></div>
            <div>Executed Plan: <span className="text-blue-400 font-mono">{auditLog.selectedPlanId}</span></div>
          </div>

          {/* Section 4: Post Verification */}
          <div className="p-3 rounded-md bg-[#0B0E14] border border-slate-800 space-y-1.5">
            <h3 className="font-semibold text-white text-xs mb-1">
              Post-Flight Verification Checklist
            </h3>
            {auditLog.verificationChecklist.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-[11px] p-1.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-300">{item.label}</span>
                <span className="text-emerald-400 font-medium text-[10px]">{item.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-800">
          <span className="text-[11px] text-slate-500 font-mono">
            SHA-256 Digest Verified
          </span>

          <button
            onClick={handleDownloadJSON}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export Audit JSON Log
          </button>
        </div>
      </div>
    </div>
  );
};
