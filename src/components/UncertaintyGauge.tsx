import React from 'react';
import { UncertaintyMetric } from '../types/shadowproof';
import { HelpCircle } from 'lucide-react';

interface UncertaintyGaugeProps {
  uncertainties: UncertaintyMetric[];
}

export const UncertaintyGauge: React.FC<UncertaintyGaugeProps> = ({
  uncertainties
}) => {
  const getConfidenceStyle = (score: number) => {
    if (score >= 90) return 'text-emerald-400 border-emerald-900/40 bg-[#0B0E14]';
    if (score >= 75) return 'text-amber-400 border-amber-900/40 bg-[#0B0E14]';
    return 'text-red-400 border-red-900/40 bg-[#0B0E14]';
  };

  return (
    <div className="bg-[#131823] border border-slate-800 rounded-lg p-5 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Uncertainty & Model Confidence Calibration
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Explicitly documents un-mocked external variables and confidence intervals for simulation steps.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {uncertainties.map((item, index) => (
          <div
            key={index}
            className={`p-3.5 rounded-md border text-xs space-y-2 ${getConfidenceStyle(item.confidenceScore)}`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white text-xs">
                {item.aspect}
              </span>
              <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-200">
                {item.confidenceScore}% Confidence
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              {item.reasoning}
            </p>

            <div className="pt-2 border-t border-slate-800 text-[10px]">
              <span className="text-slate-500 font-medium block mb-1">
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
