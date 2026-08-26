import React from 'react';
import { TemporalConsequence } from '../types/shadowproof';
import { Clock } from 'lucide-react';

interface TemporalTimelineProps {
  timeline: TemporalConsequence[];
  planType: 'direct_plan_a' | 'shadowproof_plan_b';
}

export function TemporalTimeline({ timeline, planType }: TemporalTimelineProps) {
  const isPlanB = planType === 'shadowproof_plan_b';

  return (
    <div className="bg-[#131823] border border-slate-800 rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <Clock className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="text-sm font-semibold text-white">
              Temporal Consequence Timeline
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Time-horizon progression of downstream state changes for {isPlanB ? 'Plan B' : 'Plan A'}
            </p>
          </div>
        </div>
      </div>

      <div className="relative border-l border-slate-800 ml-2.5 pl-5 space-y-3">
        {timeline.map((item, idx) => {
          const isCritical = !isPlanB && item.severity === 'critical';
          const isHigh = !isPlanB && item.severity === 'high';

          return (
            <div key={idx} className="relative">
              {/* Marker Dot */}
              <div className={`absolute -left-[25px] top-1.5 w-2.5 h-2.5 rounded-full ${
                isCritical 
                  ? 'bg-red-500' 
                  : isHigh 
                  ? 'bg-amber-500' 
                  : 'bg-blue-500'
              }`} />

              <div className="bg-[#0B0E14] p-3 rounded-md border border-slate-800 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-900/40">
                    {item.timeframe}
                  </span>
                  <span className={`text-[10px] uppercase font-medium px-2 py-0.5 rounded ${
                    isPlanB
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/40'
                      : isCritical
                      ? 'bg-red-950/60 text-red-400 border border-red-900/40'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {isPlanB ? 'Re-routed Safe' : item.severity}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-white mt-1.5">{item.title}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  {isPlanB ? `Pre-execution mitigation confirmed. No failure at ${item.timeframe}.` : item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
