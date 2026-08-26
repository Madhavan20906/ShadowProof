import React from 'react';
import { ActionPlan } from '../types/shadowproof';
import { ShieldCheck, AlertTriangle, CheckCircle2, XCircle, ArrowRight, Zap, Award, Layers, Clock } from 'lucide-react';

interface EvidenceMatrixProps {
  planA: ActionPlan;
  planB: ActionPlan;
  selectedPlanId: string;
  onSelectPlan: (planId: 'direct_plan_a' | 'shadowproof_plan_b') => void;
}

export const EvidenceMatrix: React.FC<EvidenceMatrixProps> = ({
  planA,
  planB,
  selectedPlanId,
  onSelectPlan
}) => {
  return (
    <div className="glass-panel p-5 mb-6 border-cyan-500/30">
      {/* Evidence Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-400" />
            SIDE-BY-SIDE SIMULATED EVIDENCE MATRIX
          </h3>
          <p className="text-xs text-slate-400">
            Compare shadow rehearsal outcomes to determine the safest execution pathway before applying changes.
          </p>
        </div>

        <span className="cyber-badge badge-emerald flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          EVIDENCE PROVEN
        </span>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Plan A Card (Naive Direct) */}
        <div 
          onClick={() => onSelectPlan('direct_plan_a')}
          className={`p-5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
            selectedPlanId === 'direct_plan_a'
              ? 'bg-rose-950/30 border-rose-500 shadow-xl shadow-rose-500/10 ring-2 ring-rose-500/40'
              : 'bg-slate-900/50 border-slate-800 hover:border-rose-500/40 hover:bg-slate-900/80'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="cyber-badge badge-rose mb-1 inline-block">PLAN A: NAIVE DIRECT</span>
              <h4 className="text-sm font-bold text-white">Direct Deprovisioning</h4>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-mono">RISK SCORE</span>
              <span className="text-2xl font-black font-mono text-rose-400">{planA.riskScore}%</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 mb-4 leading-relaxed font-sans">
            {planA.summary}
          </p>

          {/* Metric Badges */}
          <div className="grid grid-cols-2 gap-2 mb-4 font-mono text-xs">
            <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between items-center text-rose-400">
              <span className="text-slate-400 text-[11px]">Broken Workflows:</span>
              <span className="font-bold">{planA.brokenWorkflowsCount} STALLED</span>
            </div>

            <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between items-center text-rose-400">
              <span className="text-slate-400 text-[11px]">Orphaned KMS:</span>
              <span className="font-bold">{planA.orphanedResourcesCount} LOST</span>
            </div>

            <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between items-center text-rose-400">
              <span className="text-slate-400 text-[11px]">Crashed Bots:</span>
              <span className="font-bold">{planA.crashedAutomationsCount} CRASHED</span>
            </div>

            <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between items-center text-rose-400">
              <span className="text-slate-400 text-[11px]">Est. Outage:</span>
              <span className="font-bold">24+ HOURS</span>
            </div>
          </div>

          {/* Plan A Sequence */}
          <div className="space-y-1.5 font-mono text-xs">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Execution Sequence:</span>
            {planA.steps.map((step, idx) => (
              <div key={step.id} className="p-2 rounded bg-rose-950/20 border border-rose-900/40 text-rose-300 flex items-center justify-between text-[11px]">
                <span>{idx + 1}. {step.title}</span>
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Plan B Card (ShadowProof Rehearsed) */}
        <div 
          onClick={() => onSelectPlan('shadowproof_plan_b')}
          className={`p-5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
            selectedPlanId === 'shadowproof_plan_b'
              ? 'bg-cyan-950/30 border-cyan-400 shadow-xl shadow-cyan-500/20 ring-2 ring-cyan-400'
              : 'bg-slate-900/50 border-slate-800 hover:border-cyan-400/60 hover:bg-slate-900/80'
          }`}
        >
          {/* Winner Ribbon */}
          <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-500 to-cyan-500 text-slate-950 px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-bl-xl shadow-md">
            RECOMMENDED SAFER PATH
          </div>

          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="cyber-badge badge-emerald mb-1 inline-block">PLAN B: SHADOWPROOF</span>
              <h4 className="text-sm font-bold text-white">Re-routed Dependency Sequence</h4>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-mono">RISK SCORE</span>
              <span className="text-2xl font-black font-mono text-emerald-400">{planB.riskScore}%</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 mb-4 leading-relaxed font-sans">
            {planB.summary}
          </p>

          {/* Metric Badges */}
          <div className="grid grid-cols-2 gap-2 mb-4 font-mono text-xs">
            <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between items-center text-emerald-400">
              <span className="text-slate-400 text-[11px]">Broken Workflows:</span>
              <span className="font-bold">0 BROKEN</span>
            </div>

            <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between items-center text-emerald-400">
              <span className="text-slate-400 text-[11px]">Orphaned KMS:</span>
              <span className="font-bold">0 LOST</span>
            </div>

            <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between items-center text-emerald-400">
              <span className="text-slate-400 text-[11px]">Crashed Bots:</span>
              <span className="font-bold">0 CRASHED</span>
            </div>

            <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between items-center text-emerald-400">
              <span className="text-slate-400 text-[11px]">Est. Outage:</span>
              <span className="font-bold">0 SECONDS</span>
            </div>
          </div>

          {/* Plan B Sequence */}
          <div className="space-y-1.5 font-mono text-xs">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Re-routed Safety Sequence:</span>
            {planB.steps.map((step, idx) => (
              <div key={step.id} className="p-2 rounded bg-cyan-950/30 border border-cyan-800/40 text-cyan-200 flex items-center justify-between text-[11px]">
                <span>{idx + 1}. {step.title}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
