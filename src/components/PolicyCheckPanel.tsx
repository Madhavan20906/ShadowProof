import React from 'react';
import { InvariantCheck } from '../types/shadowproof';
import { ShieldCheck, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface PolicyCheckPanelProps {
  invariants: InvariantCheck[];
  planType: 'direct_plan_a' | 'shadowproof_plan_b';
}

export function PolicyCheckPanel({ invariants, planType }: PolicyCheckPanelProps) {
  const isPlanB = planType === 'shadowproof_plan_b';

  return (
    <div className="bg-[#131823] border border-slate-800 rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className={`w-5 h-5 ${isPlanB ? 'text-emerald-400' : 'text-amber-400'}`} />
          <div>
            <h3 className="text-sm font-semibold text-white">
              Policy & Invariant Rule Evaluation
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Constraint validation for {isPlanB ? 'Plan B (Rehearsed)' : 'Plan A (Direct Execution)'}
            </p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded text-xs font-medium ${
          isPlanB ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/40' : 'bg-red-950/60 text-red-400 border border-red-900/40'
        }`}>
          {isPlanB ? 'All Rules Passed' : 'Rule Violations Detected'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {invariants.map((inv) => {
          const status = isPlanB ? 'passed' : inv.status;
          return (
            <div
              key={inv.id}
              className={`p-3.5 rounded-md border text-xs ${
                status === 'passed'
                  ? 'bg-[#0B0E14] border-slate-800 text-slate-300'
                  : status === 'violated'
                  ? 'bg-red-950/20 border-red-900/40 text-red-200'
                  : 'bg-amber-950/20 border-amber-900/40 text-amber-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    {inv.code}
                  </span>
                  <h4 className="text-xs font-semibold text-white">{inv.name}</h4>
                </div>
                {status === 'passed' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : status === 'violated' ? (
                  <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                {inv.description}
              </p>
              {status !== 'passed' && inv.remediation && (
                <div className="mt-2 pt-2 border-t border-red-900/30 text-[11px] text-red-300">
                  <strong className="text-red-400 font-medium">Remediation:</strong> {inv.remediation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
