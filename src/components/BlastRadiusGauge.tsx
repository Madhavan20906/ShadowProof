import React from 'react';
import { BlastRadius } from '../types/shadowproof';

interface BlastRadiusGaugeProps {
  blastRadius: BlastRadius;
  planARisk: number;
  planBRisk: number;
  selectedPlanId: 'direct_plan_a' | 'shadowproof_plan_b';
}

export function BlastRadiusGauge({ blastRadius, planARisk, planBRisk, selectedPlanId }: BlastRadiusGaugeProps) {
  return (
    <div className="bg-[#131823] border border-slate-800 rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Execution Risk & Impact Comparison
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Comparative analysis of baseline status quo against direct execution and rehearsed plan.
          </p>
        </div>
      </div>

      {/* 3 State Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Baseline Status Quo */}
        <div className="p-3.5 rounded-md bg-[#0B0E14] border border-slate-800 text-slate-300 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Baseline State</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">0% Risk</span>
          </div>
          <h4 className="text-xs font-semibold text-white">Status Quo (No Change)</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            System nodes remain untouched. Zero immediate risk, but administrative intent unfulfilled.
          </p>
        </div>

        {/* Direct Execution */}
        <div className={`p-3.5 rounded-md border text-red-200 space-y-1.5 transition-all ${
          selectedPlanId === 'direct_plan_a' ? 'bg-red-950/30 border-red-500' : 'bg-[#0B0E14] border-red-950/60'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-red-400">Direct Execution</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-red-950/60 text-red-400 border border-red-900/40">
              {planARisk}% Risk
            </span>
          </div>
          <h4 className="text-xs font-semibold text-white">Plan A (Direct)</h4>
          <p className="text-[11px] text-red-300/80 leading-relaxed">
            Directly revokes access without re-routing. Severed links trigger downstream cascade failures.
          </p>
        </div>

        {/* ShadowProof Rehearsed */}
        <div className={`p-3.5 rounded-md border text-emerald-200 space-y-1.5 transition-all ${
          selectedPlanId === 'shadowproof_plan_b' ? 'bg-emerald-950/30 border-emerald-500' : 'bg-[#0B0E14] border-emerald-950/60'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-emerald-400">Rehearsed Plan</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-900/40">
              {planBRisk}% Risk
            </span>
          </div>
          <h4 className="text-xs font-semibold text-white">Plan B (ShadowProof)</h4>
          <p className="text-[11px] text-emerald-300/80 leading-relaxed">
            Re-routes sign-offs, transfers encryption custody & rotates credentials prior to offboarding.
          </p>
        </div>
      </div>

      {/* Impact Radius Metrics */}
      <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
        <div className="bg-[#0B0E14] p-2.5 rounded-md border border-slate-800">
          <span className="text-[10px] text-slate-400 block">Direct Nodes</span>
          <span className="text-xs font-semibold text-white mt-0.5 block">{blastRadius.directNodesCount} Node</span>
        </div>
        <div className="bg-[#0B0E14] p-2.5 rounded-md border border-slate-800">
          <span className="text-[10px] text-slate-400 block">Indirect Impact</span>
          <span className="text-xs font-semibold text-amber-400 mt-0.5 block">{blastRadius.indirectNodesCount} Nodes</span>
        </div>
        <div className="bg-[#0B0E14] p-2.5 rounded-md border border-slate-800">
          <span className="text-[10px] text-slate-400 block">Critical Failures</span>
          <span className="text-xs font-semibold text-red-400 mt-0.5 block">{blastRadius.criticalFailuresCount} Critical</span>
        </div>
        <div className="bg-[#0B0E14] p-2.5 rounded-md border border-slate-800">
          <span className="text-[10px] text-slate-400 block">Impacted Teams</span>
          <span className="text-xs font-semibold text-blue-400 mt-0.5 block">{blastRadius.impactedDepartments.length} Teams</span>
        </div>
      </div>
    </div>
  );
}
