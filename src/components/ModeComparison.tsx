import React from 'react';
import { AlertTriangle, ShieldCheck, ArrowRight, XCircle, CheckCircle2, Cpu, Zap, Lock } from 'lucide-react';

export const ModeComparison: React.FC = () => {
  return (
    <div className="glass-panel p-6 mb-6 border-purple-500/30 bg-gradient-to-br from-purple-950/20 via-slate-900/80 to-slate-950">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" />
            Core Architectural Paradigm: Why Pre-Execution Rehearsal Matters
          </h2>
          <p className="text-xs text-slate-400">
            Compare how traditional AI agents handle digital actions versus ShadowProof's safety rehearsal engine.
          </p>
        </div>
        <span className="cyber-badge badge-purple">Paradigm Shift</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Normal Automation Flow (Catastrophic) */}
        <div className="glass-panel p-4 border-rose-500/30 bg-rose-950/10 hover:border-rose-500/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="cyber-badge badge-rose flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" />
              NORMAL AUTOMATION (UNSAFE)
            </span>
            <span className="text-[11px] font-mono text-rose-400">Direct Execution Risk</span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800 flex items-center justify-between text-slate-300">
              <span>1. User Natural Request</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </div>

            <div className="p-2.5 rounded bg-rose-950/40 border border-rose-800/40 flex items-center justify-between text-rose-300">
              <span className="font-semibold">2. AI Instantly Executes on Real API</span>
              <ArrowRight className="w-3.5 h-3.5 text-rose-500" />
            </div>

            <div className="p-2.5 rounded bg-rose-950/60 border border-rose-800 flex items-center justify-between text-rose-200">
              <span className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                3. REAL SYSTEM MUTATED & BROKEN
              </span>
              <XCircle className="w-4 h-4 text-rose-400" />
            </div>

            <div className="p-2.5 rounded bg-slate-900 border border-rose-900/50 text-[11px] text-slate-400">
              💥 Consequences Discovered <strong className="text-rose-400">AFTER</strong> system breakage: Payroll bot crashes, $142k purchase orders stall, S3 KMS encryption keys orphaned.
            </div>
          </div>
        </div>

        {/* ShadowProof Engine Flow (Safe & Proven) */}
        <div className="glass-panel p-4 border-cyan-500/40 bg-cyan-950/10 hover:border-cyan-500/60 transition-all glass-panel-glow">
          <div className="flex items-center justify-between mb-3">
            <span className="cyber-badge badge-cyan flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              SHADOWPROOF ENGINE (SAFE)
            </span>
            <span className="text-[11px] font-mono text-cyan-400">Pre-Execution Rehearsal</span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="p-2 rounded bg-slate-950/70 border border-slate-800 flex items-center justify-between text-slate-300">
              <span>1. Intent → Parse Structured Plan</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-500" />
            </div>

            <div className="p-2 rounded bg-cyan-950/40 border border-cyan-800/40 flex items-center justify-between text-cyan-300">
              <span className="font-semibold flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                2. Rehearse in Shadow Sandbox Graph
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-500" />
            </div>

            <div className="p-2 rounded bg-purple-950/40 border border-purple-800/40 flex items-center justify-between text-purple-300">
              <span>3. Discover Failures → Synthesize Safer Plan B</span>
              <ArrowRight className="w-3.5 h-3.5 text-purple-500" />
            </div>

            <div className="p-2 rounded bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-between text-emerald-300">
              <span className="font-bold flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                4. Human Approval → Apply & Verify
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
