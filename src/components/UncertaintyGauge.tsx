import React from 'react';
import { UncertaintyMetric } from '../types/shadowproof';
import { HelpCircle, AlertCircle, CheckCircle2, Shield, Info } from 'lucide-react';

interface UncertaintyGaugeProps {
  uncertainties: UncertaintyMetric[];
}

export const UncertaintyGauge: React.FC<UncertaintyGaugeProps> = ({
  uncertainties
}) => {
  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20';
    if (score >= 75) return 'text-amber-400 border-amber-500/40 bg-amber-950/20';
    return 'text-rose-400 border-rose-500/40 bg-rose-950/20';
  };

  return (
    <div className="glass-panel p-5 mb-6 border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-purple-400" />
            HONEST UNCERTAINTY & CONFIDENCE CALIBRATION
          </h3>
          <p className="text-xs text-slate-400">
            ShadowProof explicitly identifies un-mocked external variables and never fabricates 100% certainty.
          </p>
        </div>
        <span className="cyber-badge badge-purple">AI Calibration Policy</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {uncertainties.map((item, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl border font-mono text-xs space-y-2 ${getConfidenceColor(item.confidenceScore)}`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 font-sans text-xs">
                {item.aspect}
              </span>
              <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                {item.confidenceScore}% CONFIDENCE
              </span>
            </div>

            <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
              {item.reasoning}
            </p>

            <div className="pt-2 border-t border-slate-800/60 text-[10px]">
              <span className="text-slate-500 uppercase tracking-wider block font-bold mb-1">
                Untested External Variables:
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                {item.untestedVariables.map((v, i) => (
                  <li key={i}>{v}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
