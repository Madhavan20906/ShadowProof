import React, { useState } from 'react';
import { ActionPlan } from '../types/shadowproof';
import { ShieldCheck, Lock, AlertTriangle, CheckSquare, X, ArrowRight, FileCheck, CheckCircle2 } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel max-w-2xl w-full p-6 border-cyan-500/50 bg-slate-950 shadow-2xl relative">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded bg-slate-900 border border-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800">
          <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-400">
            <Lock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-wide">
                EXPLICIT HUMAN APPROVAL GATEKEEPER
              </h2>
              <span className="cyber-badge badge-amber">CRITICAL STEP 11</span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Real System Mutation Prevention — No changes applied until explicit human authorization.
            </p>
          </div>
        </div>

        {/* Selected Plan Summary Banner */}
        <div className={`p-4 rounded-xl border mb-5 font-mono text-xs ${
          isPlanBSafe ? 'bg-cyan-950/20 border-cyan-500/40 text-cyan-200' : 'bg-rose-950/20 border-rose-500/40 text-rose-200'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold uppercase">Selected Execution Plan:</span>
            <span className="font-extrabold">{selectedPlan.name}</span>
          </div>
          <p className="text-[11px] text-slate-300 font-sans">{selectedPlan.summary}</p>
        </div>

        {/* Safety Verification Checklist */}
        <div className="space-y-2 mb-5 font-sans text-xs">
          <span className="text-[11px] font-mono text-slate-400 uppercase font-bold tracking-wider block">
            Pre-Execution Safety Verification Checklist:
          </span>

          <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:bg-slate-850">
            <input 
              type="checkbox" 
              checked={checks.reviewedDiff}
              onChange={e => setChecks({...checks, reviewedDiff: e.target.checked})}
              className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-cyan-500"
            />
            <span className="text-slate-300">Reviewed Shadow Simulation graph diff & dependency re-routes</span>
          </label>

          <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:bg-slate-850">
            <input 
              type="checkbox" 
              checked={checks.confirmedKms}
              onChange={e => setChecks({...checks, confirmedKms: e.target.checked})}
              className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-cyan-500"
            />
            <span className="text-slate-300">Confirmed AWS S3 KMS vault ownership transfer to Elena Rostova</span>
          </label>

          <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:bg-slate-850">
            <input 
              type="checkbox" 
              checked={checks.confirmedApprover}
              onChange={e => setChecks({...checks, confirmedApprover: e.target.checked})}
              className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-cyan-500"
            />
            <span className="text-slate-300">Verified PO Approval workflow re-assigned without un-signoff gap</span>
          </label>

          <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:bg-slate-850">
            <input 
              type="checkbox" 
              checked={checks.acknowledgedRealMutation}
              onChange={e => setChecks({...checks, acknowledgedRealMutation: e.target.checked})}
              className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-cyan-500"
            />
            <span className="text-slate-300 text-amber-300 font-semibold">
              Authorize final mutation against Real Enterprise System APIs
            </span>
          </label>
        </div>

        {/* Digital Signature & Approval Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-3 border-t border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                AUTHORIZING ADMINISTRATOR:
              </label>
              <input
                type="text"
                value={approverName}
                onChange={e => setApproverName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-cyan-400 outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                TYPE <span className="text-cyan-400 font-bold">'APPROVE'</span> TO CONFIRM:
              </label>
              <input
                type="text"
                value={signatureText}
                onChange={e => setSignatureText(e.target.value)}
                placeholder="APPROVE"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-cyan-300 font-mono font-bold focus:border-cyan-400 outline-none uppercase"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition-all"
            >
              Cancel & Re-simulate
            </button>

            <button
              type="submit"
              disabled={!canApprove}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                canApprove
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 hover:opacity-95 shadow-lg shadow-emerald-500/25 active:scale-95'
                  : 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              AUTHORIZE REAL SYSTEM EXECUTION
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
