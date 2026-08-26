import React from 'react';
import { BlastRadius } from '../types/shadowproof';
import { Layers, Globe, ShieldCheck, Zap } from 'lucide-react';

interface BlastRadiusGaugeProps {
  blastRadius: BlastRadius;
  planARisk: number;
  planBRisk: number;
  selectedPlanId: 'direct_plan_a' | 'shadowproof_plan_b';
}

export function BlastRadiusGauge({ blastRadius, planARisk, planBRisk, selectedPlanId }: BlastRadiusGaugeProps) {
  return (
    <div className="glass-panel p-5 space-y-4 border-slate-800 bg-slate-950/60">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <Globe className="w-5 h-5 text-purple-400" />
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
              Counterfactual World Comparison & Blast Radius
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Objective comparison of potential execution outcomes across parallel simulated worlds
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-purple-400 bg-purple-950/60 px-2.5 py-1 rounded-full border border-purple-500/30">
          Multi-World Simulator
        </span>
      </div>

      {/* 3-World Counterfactual Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* World A: Baseline Status Quo */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400">WORLD A: BASELINE</span>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-800 text-slate-300">0% Risk</span>
          </div>
          <h4 className="text-xs font-bold text-white">Status Quo (No Action)</h4>
          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
            All system nodes remain in initial state. Zero immediate risk, but administrative offboarding request unfulfilled.
          </p>
        </div>

        {/* World B: Naive Direct Execution */}
        <div className={`p-3.5 rounded-xl border text-rose-200 space-y-2 transition-all ${
          selectedPlanId === 'direct_plan_a' ? 'bg-rose-950/40 border-rose-500 ring-1 ring-rose-500' : 'bg-rose-950/20 border-rose-500/30'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-rose-400">WORLD B: DIRECT</span>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
              {planARisk}% Critical Risk
            </span>
          </div>
          <h4 className="text-xs font-bold text-white">Plan A (Direct Execution)</h4>
          <p className="text-[11px] text-rose-300/80 font-sans leading-relaxed">
            Directly revokes access without re-routing. Severed links trigger immediate cascade failures & approval stalls.
          </p>
        </div>

        {/* World C: ShadowProof Rehearsed */}
        <div className={`p-3.5 rounded-xl border text-emerald-200 space-y-2 transition-all ${
          selectedPlanId === 'shadowproof_plan_b' ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500' : 'bg-emerald-950/20 border-emerald-500/30'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-emerald-400">WORLD C: REHEARSED</span>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              {planBRisk}% Low Risk
            </span>
          </div>
          <h4 className="text-xs font-bold text-white">Plan B (ShadowProof Rehearsed)</h4>
          <p className="text-[11px] text-emerald-300/80 font-sans leading-relaxed">
            Pre-execution re-routes approval sign-offs, transfers encryption custody & rotates credentials before offboarding.
          </p>
        </div>
      </div>

      {/* Blast Radius Metrics Bar */}
      <div className="pt-2 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 font-mono uppercase block">Direct Node Impact</span>
          <span className="text-sm font-bold text-white font-mono">{blastRadius.directNodesCount} Node</span>
        </div>
        <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 font-mono uppercase block">Indirect Cascade</span>
          <span className="text-sm font-bold text-amber-400 font-mono">{blastRadius.indirectNodesCount} Nodes</span>
        </div>
        <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 font-mono uppercase block">Critical Failures</span>
          <span className="text-sm font-bold text-rose-400 font-mono">{blastRadius.criticalFailuresCount} Critical</span>
        </div>
        <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 font-mono uppercase block">Affected Teams</span>
          <span className="text-sm font-bold text-cyan-400 font-mono">{blastRadius.impactedDepartments.length} Teams</span>
        </div>
      </div>
    </div>
  );
}
