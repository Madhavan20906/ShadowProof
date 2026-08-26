import React from 'react';
import { Consequence } from '../types/shadowproof';
import { AlertTriangle, ChevronRight, XCircle, ShieldCheck } from 'lucide-react';

interface ConsequenceAlertsProps {
  consequences: Consequence[];
  riskScore: number;
}

export const ConsequenceAlerts: React.FC<ConsequenceAlertsProps> = ({
  consequences,
  riskScore
}) => {
  if (consequences.length === 0) {
    return (
      <div className="bg-[#131823] border border-emerald-800/60 rounded-lg p-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-emerald-300">
              No Downstream Failures Discovered
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Rehearsal simulation confirms zero broken workflows or orphaned resources.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#131823] border border-red-900/50 rounded-lg p-5 mb-6">
      {/* Consequence Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            Discovered Downstream Impact (Direct Plan A)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Graph propagation analysis discovered {consequences.length} potential cascade failures under unmitigated direct execution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Direct Execution Risk:</span>
          <span className="text-xs font-semibold text-red-400 bg-red-950/60 px-2.5 py-1 rounded border border-red-800/60">
            {riskScore}% Severity Index
          </span>
        </div>
      </div>

      {/* List of Consequences */}
      <div className="space-y-3">
        {consequences.map((cons) => (
          <div 
            key={cons.id}
            className="p-4 rounded-md border border-red-950 bg-[#0B0E14] space-y-2"
          >
            {/* Title & Severity */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                <h4 className="text-xs font-semibold text-red-200">
                  {cons.title}
                </h4>
              </div>
              <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-900/40">
                {cons.severity}
              </span>
            </div>

            {/* Human Readable Description */}
            <p className="text-xs text-slate-300 leading-relaxed">
              {cons.description}
            </p>

            {/* Root Cause Dependency Chain */}
            <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px]">
              <div className="text-[10px] text-slate-400 font-medium mb-1">
                Root Cause Chain:
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-slate-200 font-mono">
                {cons.rootCauseChain.map((nodeName, index) => (
                  <React.Fragment key={index}>
                    <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                      {nodeName}
                    </span>
                    {index < cons.rootCauseChain.length - 1 && (
                      <ChevronRight className="w-3 h-3 text-slate-600" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Business Impact & Technical Risk */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800 text-slate-300">
                <span className="text-slate-400 block text-[10px] font-medium">Business Impact:</span>
                {cons.businessImpact}
              </div>
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800 text-slate-300">
                <span className="text-slate-400 block text-[10px] font-medium">Technical Risk:</span>
                {cons.technicalRisk}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
