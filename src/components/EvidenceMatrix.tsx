import React from 'react';
import { ActionPlan } from '../types/shadowproof';
import { CheckCircle2, XCircle } from 'lucide-react';

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
    <div className="bg-[#131823] border border-slate-800 rounded-lg p-5 mb-6">
      {/* Evidence Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Execution Plan Comparison Matrix
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare direct execution vs rehearsed dependency sequence before confirming changes.
          </p>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Plan A Card (Direct Execution) */}
        <div 
          onClick={() => onSelectPlan('direct_plan_a')}
          className={`p-4 rounded-md border transition-all cursor-pointer relative ${
            selectedPlanId === 'direct_plan_a'
              ? 'bg-red-950/20 border-red-500'
              : 'bg-[#0B0E14] border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-900/40 inline-block mb-1">
                Plan A: Direct
              </span>
              <h4 className="text-xs font-semibold text-white">Direct Deprovisioning</h4>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-mono">RISK</span>
              <span className="text-lg font-bold font-mono text-red-400">{planA.riskScore}%</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 mb-3 leading-relaxed">
            {planA.summary}
          </p>

          {/* Metric Badges */}
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs font-mono">
            <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between items-center text-red-400">
              <span className="text-slate-400 text-[11px]">Broken Workflows:</span>
              <span className="font-semibold">{planA.brokenWorkflowsCount} Stalled</span>
            </div>

            <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between items-center text-red-400">
              <span className="text-slate-400 text-[11px]">Orphaned KMS:</span>
              <span className="font-semibold">{planA.orphanedResourcesCount} Lost</span>
            </div>
          </div>

          {/* Plan A Step Sequence */}
          <div className="space-y-1.5 text-xs">
            <span className="text-[10px] text-slate-400 font-medium block">Sequence Steps:</span>
            {planA.steps.map((step, idx) => (
              <div key={step.id} className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-between text-[11px]">
                <span>{idx + 1}. {step.title}</span>
                <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Plan B Card (Rehearsed Plan) */}
        <div 
          onClick={() => onSelectPlan('shadowproof_plan_b')}
          className={`p-4 rounded-md border transition-all cursor-pointer relative ${
            selectedPlanId === 'shadowproof_plan_b'
              ? 'bg-blue-950/20 border-blue-500'
              : 'bg-[#0B0E14] border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded bg-blue-950/60 text-blue-400 border border-blue-900/40 inline-block mb-1">
                Plan B: ShadowProof
              </span>
              <h4 className="text-xs font-semibold text-white">Re-routed Dependency Sequence</h4>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-mono">RISK</span>
              <span className="text-lg font-bold font-mono text-emerald-400">{planB.riskScore}%</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 mb-3 leading-relaxed">
            {planB.summary}
          </p>

          {/* Metric Badges */}
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs font-mono">
            <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between items-center text-emerald-400">
              <span className="text-slate-400 text-[11px]">Broken Workflows:</span>
              <span className="font-semibold">0 Stalled</span>
            </div>

            <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between items-center text-emerald-400">
              <span className="text-slate-400 text-[11px]">Orphaned KMS:</span>
              <span className="font-semibold">0 Lost</span>
            </div>
          </div>

          {/* Plan B Step Sequence */}
          <div className="space-y-1.5 text-xs">
            <span className="text-[10px] text-slate-400 font-medium block">Re-routed Safety Sequence:</span>
            {planB.steps.map((step, idx) => (
              <div key={step.id} className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-200 flex items-center justify-between text-[11px]">
                <span>{idx + 1}. {step.title}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
