import React from 'react';
import { Shield, Activity, Sliders, FileText, Cpu } from 'lucide-react';

interface HeaderProps {
  currentStep: string;
  isShadowActive: boolean;
  onOpenAudit: () => void;
  onOpenScenarioModal: () => void;
  onOpenGeminiModal: () => void;
  showComparison: boolean;
  setShowComparison: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  isShadowActive,
  onOpenAudit,
  onOpenScenarioModal,
  onOpenGeminiModal,
  showComparison,
  setShowComparison
}) => {
  const hasApiKey = typeof localStorage !== 'undefined' && !!(localStorage.getItem('gemini_api_key') || localStorage.getItem('groq_api_key'));

  return (
    <header className="bg-[#131823] border-b border-slate-800/80 px-6 py-3.5 sticky top-0 z-40">
      <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-base font-semibold text-white tracking-tight">
                ShadowProof
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Pre-execution reasoning & dependency rehearsal
            </p>
          </div>
        </div>

        {/* System Status Indicators */}
        <div className="flex items-center gap-3 text-xs">
          {/* AI Engine Status */}
          <button
            onClick={onOpenGeminiModal}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md border transition-all cursor-pointer ${
              hasApiKey 
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/40' 
                : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            <span className="text-slate-400">AI Engine:</span>
            <span className="font-medium text-slate-200">
              {hasApiKey ? 'Gemini 2.0 Flash Active' : 'Deterministic Fallback'}
            </span>
          </button>

          {/* Target System Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-900/90 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-400">Target System:</span>
            <span className="text-slate-200 font-medium">Connected</span>
          </div>

          {/* Sandbox Status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border transition-all ${
            isShadowActive 
              ? 'bg-blue-950/30 border-blue-500/40 text-blue-300' 
              : 'bg-slate-900/90 border-slate-800 text-slate-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isShadowActive ? 'bg-blue-400' : 'bg-slate-500'}`} />
            <span className="text-slate-400">Sandbox:</span>
            <span className="font-medium text-slate-200">
              {isShadowActive ? 'Rehearsal Active' : 'Idle'}
            </span>
          </div>
        </div>

        {/* Navigation / Configuration Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenGeminiModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800/80 border border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            Gemini AI Config
          </button>

          <button
            onClick={() => setShowComparison(!showComparison)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
              showComparison 
                ? 'bg-slate-800 border-slate-600 text-white' 
                : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            {showComparison ? 'Hide Architecture' : 'Architecture Overview'}
          </button>

          <button
            onClick={onOpenScenarioModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800/80 border border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            Graph Scenarios
          </button>

          <button
            onClick={onOpenAudit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800/80 border border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            Audit Logs
          </button>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="max-w-7xl mx-auto mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <span>Isolated sandbox active. Executions simulate state changes without modifying live production services.</span>
        </div>
        <span className="text-[11px] font-mono text-slate-500">
          Engine v0.4.2 (Generic Invariants)
        </span>
      </div>
    </header>
  );
};
