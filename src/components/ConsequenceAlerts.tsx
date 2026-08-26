import React from 'react';
import { Consequence } from '../types/shadowproof';
import { AlertTriangle, ChevronRight, XCircle, ShieldAlert, Cpu, Lock, FileX } from 'lucide-react';

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
      <div className="glass-panel p-5 border-emerald-500/40 bg-emerald-950/10 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-emerald-300">
              ZERO DISCOVERED DOWNSTREAM FAILURES
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Shadow Proof simulation confirms zero broken workflows, orphaned KMS keys, or crashed cron automations.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-5 border-rose-500/30 bg-gradient-to-b from-rose-950/20 via-slate-900/80 to-slate-950 mb-6">
      {/* Consequence Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
            DISCOVERED DOWNSTREAM CONSEQUENCES (DIRECT PLAN A)
          </h3>
          <p className="text-xs text-slate-400">
            Automated impact graph analysis discovered {consequences.length} critical cascade failures in the shadow environment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Calculated Risk Score:</span>
          <span className="cyber-badge badge-rose text-sm font-bold animate-pulse-danger">
            {riskScore}% CRITICAL RISK
          </span>
        </div>
      </div>

      {/* List of Consequences */}
      <div className="space-y-3">
        {consequences.map((cons) => (
          <div 
            key={cons.id}
            className="p-4 rounded-xl border border-rose-500/30 bg-slate-900/90 hover:border-rose-500/50 transition-all space-y-2.5"
          >
            {/* Title & Severity */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-rose-950 border border-rose-800 text-rose-400">
                  <XCircle className="w-4 h-4" />
                </span>
                <h4 className="text-xs font-bold text-rose-200">
                  {cons.title}
                </h4>
              </div>
              <span className="cyber-badge badge-rose text-[10px] uppercase">
                {cons.severity}
              </span>
            </div>

            {/* Human Readable Description */}
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {cons.description}
            </p>

            {/* Root Cause Dependency Chain */}
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px]">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Cpu className="w-3 h-3 text-cyan-400" />
                Root-Cause Dependency Chain:
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-rose-300">
                {cons.rootCauseChain.map((nodeName, index) => (
                  <React.Fragment key={index}>
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-semibold text-slate-200">
                      {nodeName}
                    </span>
                    {index < cons.rootCauseChain.length - 1 && (
                      <ChevronRight className="w-3.5 h-3.5 text-rose-500" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Business Impact & Technical Risk */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2 rounded bg-rose-950/20 border border-rose-900/30 text-rose-300">
                <span className="text-slate-400 block font-sans text-[10px] uppercase font-bold">Business Impact:</span>
                {cons.businessImpact}
              </div>
              <div className="p-2 rounded bg-amber-950/20 border border-amber-900/30 text-amber-300">
                <span className="text-slate-400 block font-sans text-[10px] uppercase font-bold">Technical Risk:</span>
                {cons.technicalRisk}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
