import React from 'react';
import { ShieldCheck, Activity, Eye, FileText, Cpu, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  currentStep: string;
  isShadowActive: boolean;
  onOpenAudit: () => void;
  onOpenScenarioModal: () => void;
  onOpenGroqModal: () => void;
  showComparison: boolean;
  setShowComparison: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  isShadowActive,
  onOpenAudit,
  onOpenScenarioModal,
  onOpenGroqModal,
  showComparison,
  setShowComparison
}) => {
  return (
    <header className="glass-panel border-b border-subtle px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40">
      {/* Brand Logo & Tagline */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 p-[1px] flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <div className="w-full h-full bg-[#0D111A] rounded-[11px] flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-300 bg-clip-text text-transparent">
              SHADOWPROOF
            </h1>
            <span className="cyber-badge badge-cyan text-[10px]">PROTOTYPE V1.0</span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Don't let the real system be your testing environment.
          </p>
        </div>
      </div>

      {/* System Status Indicators */}
      <div className="flex items-center gap-3">
        {/* Real System Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-400">REAL SYSTEM:</span>
          <span className="font-mono text-emerald-400 font-semibold">PROTECTED & UNTOUCHED</span>
        </div>

        {/* Shadow Sandbox Status */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all ${
          isShadowActive 
            ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300 animate-pulse-glow' 
            : 'bg-slate-900/80 border-slate-800 text-slate-400'
        }`}>
          <Cpu className={`w-3.5 h-3.5 ${isShadowActive ? 'text-cyan-400 animate-spin' : 'text-slate-500'}`} />
          <span className="text-slate-400">SHADOW REHEARSAL:</span>
          <span className="font-mono font-bold">
            {isShadowActive ? 'ISOLATED SIMULATION ACTIVE' : 'IDLE'}
          </span>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenGroqModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-950/50 border border-purple-500/40 text-purple-300 hover:bg-purple-900/60 transition-all shadow-sm shadow-purple-500/10"
        >
          <Cpu className="w-3.5 h-3.5 text-purple-400" />
          Groq AI Config
        </button>

        <button
          onClick={() => setShowComparison(!showComparison)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
            showComparison 
              ? 'bg-purple-900/40 border-purple-500/50 text-purple-300 shadow-md shadow-purple-500/20' 
              : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-purple-400" />
          {showComparison ? 'Hide Architecture Contrast' : 'Normal vs ShadowProof'}
        </button>

        <button
          onClick={onOpenScenarioModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/60 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600 transition-all"
        >
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          Scenario Config
        </button>

        <button
          onClick={onOpenAudit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/60 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600 transition-all"
        >
          <FileText className="w-3.5 h-3.5 text-amber-400" />
          Audit Logs
        </button>
      </div>

      {/* Safety Notice Banner */}
      <div className="w-full bg-cyan-950/40 border-t border-cyan-500/20 py-1 px-4 flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-2 text-cyan-300">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <strong className="uppercase">SHADOW ENVIRONMENT:</strong>
          <span>VIRTUAL ISOLATED SNAPSHOT — NO REAL SYSTEM MUTATION</span>
        </div>
        <span className="text-slate-400 text-[10px]">
          ENGINE VERSION: <strong className="text-slate-200">v0.4.2 (GENERIC INVARIANT & PROP ENGINE)</strong>
        </span>
      </div>
    </header>
  );
};

