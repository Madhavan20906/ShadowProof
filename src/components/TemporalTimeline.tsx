import React from 'react';
import { TemporalConsequence } from '../types/shadowproof';
import { Clock, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

interface TemporalTimelineProps {
  timeline: TemporalConsequence[];
  planType: 'direct_plan_a' | 'shadowproof_plan_b';
}

export function TemporalTimeline({ timeline, planType }: TemporalTimelineProps) {
  const isPlanB = planType === 'shadowproof_plan_b';

  return (
    <div className="glass-panel p-5 space-y-4 border-slate-800 bg-slate-950/60">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <Clock className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
              Temporal Consequence Timeline (T+0 to T+24h)
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Simulated time-step progression of downstream effects across execution horizons
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-500/30">
          Delayed Impact Simulation
        </span>
      </div>

      <div className="relative border-l-2 border-slate-800 ml-3 pl-6 space-y-4">
        {timeline.map((item, idx) => {
          const isCritical = !isPlanB && item.severity === 'critical';
          const isHigh = !isPlanB && item.severity === 'high';

          return (
            <div key={idx} className="relative group">
              {/* Timeline Marker Dot */}
              <div className={`absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full border-2 transition-all ${
                isCritical 
                  ? 'bg-rose-500 border-rose-950 animate-ping' 
                  : isHigh 
                  ? 'bg-amber-500 border-amber-950' 
                  : 'bg-cyan-500 border-slate-950'
              }`} />

              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[11px] font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/20">
                    {item.timeframe}
                  </span>
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                    isPlanB
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : isCritical
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {isPlanB ? 'RE-ROUTED SAFE' : item.severity}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white mt-2">{item.title}</h4>
                <p className="text-[11px] text-slate-400 font-sans mt-1 leading-relaxed">
                  {isPlanB ? `Pre-execution re-routing verified. No downstream failure at ${item.timeframe}.` : item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
