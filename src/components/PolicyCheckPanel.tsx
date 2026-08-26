import React from 'react';
import { InvariantCheck } from '../types/shadowproof';
import { ShieldAlert, ShieldCheck, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface PolicyCheckPanelProps {
  invariants: InvariantCheck[];
  planType: 'direct_plan_a' | 'shadowproof_plan_b';
}

export function PolicyCheckPanel({ invariants, planType }: PolicyCheckPanelProps) {
  const isPlanB = planType === 'shadowproof_plan_b';

  return (
    <div className="glass-panel p-5 space-y-4 border-slate-800 bg-slate-950/60">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          {isPlanB ? (
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-rose-400" />
          )}
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
              Organizational Policy & Invariant Engine Check
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Rule evaluation on graph invariant constraints for {isPlanB ? 'Plan B (Rehearsed)' : 'Plan A (Direct)'}
            </p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
          isPlanB ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
        }`}>
          {isPlanB ? 'All Policies Satisfied' : 'Policy Violations Detected'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {invariants.map((inv) => {
          const status = isPlanB ? 'passed' : inv.status;
          return (
            <div
              key={inv.id}
              className={`p-3.5 rounded-xl border transition-all ${
                status === 'passed'
                  ? 'bg-slate-900/40 border-slate-800/80 text-slate-300'
                  : status === 'violated'
                  ? 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                  : 'bg-amber-950/20 border-amber-500/40 text-amber-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">
                    {inv.code}
                  </span>
                  <h4 className="text-xs font-bold text-slate-100">{inv.name}</h4>
                </div>
                {status === 'passed' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : status === 'violated' ? (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 font-sans leading-relaxed">
                {inv.description}
              </p>
              {status !== 'passed' && inv.remediation && (
                <div className="mt-2 pt-2 border-t border-rose-500/20 text-[10px] font-mono text-rose-300">
                  <strong className="text-rose-400 uppercase">Required Action:</strong> {inv.remediation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
