import React, { useState } from 'react';
import { ActionPlan } from '../types/shadowproof';
import { Lock, X, CheckCircle2 } from 'lucide-react';

interface HumanApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: ActionPlan;
  onConfirmApproval: (approverName: string) => void;
}

export const HumanApprovalModal: React.FC<HumanApprovalModalProps> = ({
  isOpen,
  onClose,
  selectedPlan,
  onConfirmApproval
}) => {
  const [approverName, setApproverName] = useState('Elena Rostova (SecOps Lead)');
  const [signatureText, setSignatureText] = useState('');
  const [checks, setChecks] = useState({
    reviewedDiff: true,
    confirmedKms: true,
    confirmedApprover: true,
    acknowledgedRealMutation: true
  });

  if (!isOpen) return null;

  const isPlanBSafe = selectedPlan.id === 'shadowproof_plan_b';
  const canApprove = signatureText.trim().toUpperCase() === 'APPROVE' && Object.values(checks).every(Boolean);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canApprove) return;
    onConfirmApproval(approverName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80">
      <div className="bg-[#131823] max-w-xl w-full p-6 border border-slate-800 rounded-lg shadow-xl relative">
        {}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded bg-slate-900 border border-slate-800"
        >
          <X className="w-4 h-4" />
        </button>

        {}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800">
          <div className="p-2.5 rounded bg-blue-950/40 border border-blue-900/40 text-blue-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">
              Human Approval Authorization Gate
            </h2>
            <p className="text-xs text-slate-400">
              Confirm plan verification before applying changes to target systems.
            </p>
          </div>
        </div>

        {}
        <div className={`p-3.5 rounded-md border mb-4 text-xs ${
          isPlanBSafe ? 'bg-blue-950/20 border-blue-900/40 text-slate-300' : 'bg-red-950/20 border-red-900/40 text-slate-300'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-400">Selected Execution Plan:</span>
            <span className="font-semibold text-white">{selectedPlan.name}</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">{selectedPlan.summary}</p>
        </div>

        {}
        <div className="space-y-2 mb-4 text-xs">
          <span className="text-xs font-semibold text-white block">
            Pre-Execution Safety Verification Checklist:
          </span>

          <label className="flex items-center gap-2.5 p-2 rounded bg-[#0B0E14] border border-slate-800 cursor-pointer">
            <input 
              type="checkbox" 
              checked={checks.reviewedDiff}
              onChange={e => setChecks({...checks, reviewedDiff: e.target.checked})}
              className="rounded bg-slate-900 border-slate-700 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-slate-300">Reviewed Shadow simulation graph diff & dependency re-routes</span>
          </label>

          <label className="flex items-center gap-2.5 p-2 rounded bg-[#0B0E14] border border-slate-800 cursor-pointer">
            <input 
              type="checkbox" 
              checked={checks.confirmedKms}
              onChange={e => setChecks({...checks, confirmedKms: e.target.checked})}
              className="rounded bg-slate-950 border-slate-700 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-slate-300">Confirmed AWS S3 KMS vault ownership transfer</span>
          </label>

          <label className="flex items-center gap-2.5 p-2 rounded bg-[#0B0E14] border border-slate-800 cursor-pointer">
            <input 
              type="checkbox" 
              checked={checks.confirmedApprover}
              onChange={e => setChecks({...checks, confirmedApprover: e.target.checked})}
              className="rounded bg-slate-950 border-slate-700 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-slate-300">Verified PO approval workflow assigned to active signatory</span>
          </label>

          <label className="flex items-center gap-2.5 p-2 rounded bg-[#0B0E14] border border-slate-800 cursor-pointer">
            <input 
              type="checkbox" 
              checked={checks.acknowledgedRealMutation}
              onChange={e => setChecks({...checks, acknowledgedRealMutation: e.target.checked})}
              className="rounded bg-slate-950 border-slate-700 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-amber-300 font-medium">
              Authorize final execution against target system APIs
            </span>
          </label>
        </div>

        {}
        <form onSubmit={handleSubmit} className="space-y-4 pt-3 border-t border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1 font-medium">
                Authorizing Administrator:
              </label>
              <input
                type="text"
                value={approverName}
                onChange={e => setApproverName(e.target.value)}
                className="w-full bg-[#0B0E14] border border-slate-700/80 rounded-md px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-medium">
                Type 'APPROVE' to confirm:
              </label>
              <input
                type="text"
                value={signatureText}
                onChange={e => setSignatureText(e.target.value)}
                placeholder="APPROVE"
                className="w-full bg-[#0B0E14] border border-slate-700/80 rounded-md px-3 py-2 text-xs text-white font-mono focus:border-blue-500 outline-none uppercase"
              />
            </div>
          </div>

          {}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-md border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!canApprove}
              className={`px-4 py-2 rounded-md text-xs font-medium flex items-center gap-2 transition-colors ${
                canApprove
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Authorize Execution
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
