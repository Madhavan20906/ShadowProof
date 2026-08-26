import React from 'react';
import { Sparkles, Cpu, CheckCircle2, ShieldAlert, FileText, Zap } from 'lucide-react';
import { AIRiskReasoning } from '../engine/aiReasoningEngine';
import { ParsedIntent } from '../types/shadowproof';

interface AIRiskCardProps {
  parsedIntent: ParsedIntent | null;
  aiAnalysis: AIRiskReasoning | null;
}

export const AIRiskCard: React.FC<AIRiskCardProps> = ({ parsedIntent, aiAnalysis }) => {
  if (!parsedIntent && !aiAnalysis) return null;

  const isLLM = parsedIntent?.parsedByLLM ?? false;

  return (
    <div className="bg-[#131823] border border-indigo-900/60 rounded-lg p-5 mb-6 relative overflow-hidden shadow-lg">
      {}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

      {}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-4 h-4 animate-pulse text-indigo-300" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              Google Gemini AI Risk Reasoning
            </h3>
            <p className="text-xs text-slate-400">
              Live generative risk analysis & entity parsing synthesis
            </p>
          </div>
        </div>

        {}
        <div className="flex items-center gap-2">
          {isLLM ? (
            <span className="px-3 py-1 rounded-full text-[11px] font-mono font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              ✨ Gemini 3.6 Flash Active
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-[11px] font-mono font-medium bg-slate-900 text-slate-300 border border-slate-700 flex items-center gap-1.5">
              <Cpu className="w-3 h-3 text-slate-400" />
              Deterministic Graph Parser
            </span>
          )}
        </div>
      </div>

      {}
      {parsedIntent?.aiExplanation && (
        <div className="mb-4 p-3 rounded-md bg-[#0B0E14] border border-indigo-950 flex items-start gap-2.5 text-xs text-indigo-200 font-mono">
          <Zap className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] uppercase text-indigo-400 font-semibold block mb-0.5">
              Intent Parsing Result
            </span>
            {parsedIntent.aiExplanation}
          </div>
        </div>
      )}

      {}
      {aiAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {}
          <div className="p-3.5 rounded-md bg-[#0B0E14] border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-medium uppercase block">
              Structural Failure Summary
            </span>
            <p className="text-slate-200 leading-relaxed font-sans">
              {aiAnalysis.structuralSummary}
            </p>
          </div>

          {}
          <div className="p-3.5 rounded-md bg-[#0B0E14] border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-medium uppercase block">
              Compliance & Audit Impact
            </span>
            <p className="text-slate-200 leading-relaxed font-sans">
              {aiAnalysis.complianceImpact}
            </p>
          </div>

          {}
          <div className="p-3.5 rounded-md bg-[#0B0E14] border border-slate-800 space-y-1 md:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-medium uppercase block">
                AI Recommendation Rationale
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/60">
                {(aiAnalysis.confidenceScore * 100).toFixed(1)}% Engine Confidence
              </span>
            </div>
            <p className="text-slate-200 leading-relaxed font-sans">
              {aiAnalysis.recommendedActionRationale}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
