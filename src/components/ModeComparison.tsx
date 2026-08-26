import React from 'react';
import { ArrowRight, AlertTriangle, CheckCircle2, ShieldAlert, ShieldCheck } from 'lucide-react';

export const ModeComparison: React.FC = () => {
  return (
    <div className="bg-[#131823] border border-slate-800 rounded-lg p-5 mb-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <h2 className="text-sm font-semibold text-white">
            Architecture Comparison: Execution Models
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            How traditional agentic workflows compare to pre-execution safety rehearsal.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Direct Execution Flow */}
        <div className="bg-[#0B0E14] border border-red-950/60 rounded-md p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-400 bg-red-950/40 px-2.5 py-1 rounded border border-red-900/40">
              <ShieldAlert className="w-3.5 h-3.5" />
              Direct Execution (Default Agent Model)
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between text-slate-300">
              <span>1. User submits intent</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
            </div>

            <div className="p-2.5 rounded bg-red-950/30 border border-red-900/30 flex items-center justify-between text-red-300">
              <span className="font-medium">2. Agent invokes production APIs directly</span>
              <ArrowRight className="w-3.5 h-3.5 text-red-500" />
            </div>

            <div className="p-2.5 rounded bg-red-950/50 border border-red-800/50 flex items-center justify-between text-red-200">
              <span className="font-medium flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                3. System state mutated with hidden dependency breaks
              </span>
            </div>

            <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800 text-slate-400 text-[11px]">
              Downstream impact discovered post-mutation: orphaned credentials, broken approval workflows, and failed cron sync tasks.
            </div>
          </div>
        </div>

        {/* ShadowProof Rehearsed Flow */}
        <div className="bg-[#0B0E14] border border-blue-950/60 rounded-md p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 bg-blue-950/40 px-2.5 py-1 rounded border border-blue-900/40">
              <ShieldCheck className="w-3.5 h-3.5" />
              ShadowProof Safety Rehearsal
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between text-slate-300">
              <span>1. Parse structured plan from intent</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
            </div>

            <div className="p-2.5 rounded bg-blue-950/30 border border-blue-900/30 flex items-center justify-between text-blue-300">
              <span className="font-medium">2. Rehearse plan in isolated dependency graph</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
            </div>

            <div className="p-2.5 rounded bg-indigo-950/30 border border-indigo-900/30 flex items-center justify-between text-indigo-300">
              <span>3. Detect invariants & synthesize non-destructive remediation</span>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
            </div>

            <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-900/30 flex items-center justify-between text-emerald-300">
              <span className="font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                4. Human approval → Execute validated remediation plan
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
