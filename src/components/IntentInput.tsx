import React, { useState } from 'react';
import { Play, Sparkles, UserMinus, ShieldAlert, Database, Terminal, ArrowRight } from 'lucide-react';
import { PRESET_SCENARIOS } from '../mock/scenarioData';
import { PresetScenario } from '../types/shadowproof';

interface IntentInputProps {
  currentIntent: string;
  setCurrentIntent: (intent: string) => void;
  onSimulate: (intentText: string) => void;
  isSimulating: boolean;
  selectedPresetId: string;
  setSelectedPresetId: (id: string) => void;
}

export const IntentInput: React.FC<IntentInputProps> = ({
  currentIntent,
  setCurrentIntent,
  onSimulate,
  isSimulating,
  selectedPresetId,
  setSelectedPresetId
}) => {
  const [customText, setCustomText] = useState(currentIntent);

  const handleSelectPreset = (scenario: PresetScenario) => {
    setSelectedPresetId(scenario.id);
    setCurrentIntent(scenario.prompt);
    setCustomText(scenario.prompt);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    setCurrentIntent(customText);
    onSimulate(customText);
  };

  const getIcon = (name: string) => {
    switch (name) {
      case 'UserMinus': return <UserMinus className="w-5 h-5 text-amber-400" />;
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5 text-rose-400" />;
      case 'Database': return <Database className="w-5 h-5 text-purple-400" />;
      default: return <Terminal className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="glass-panel p-6 mb-6 relative overflow-hidden border-cyan-500/20">
      {/* Background Accent Gradient */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Label */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
          <h2 className="text-base font-bold text-white tracking-wide">
            STEP 1: DEFINE ADMINISTRATIVE INTENT
          </h2>
        </div>
        <span className="cyber-badge badge-cyan">NATURAL LANGUAGE ENGINE</span>
      </div>

      {/* Preset Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        {PRESET_SCENARIOS.map((scenario) => {
          const isSelected = selectedPresetId === scenario.id;
          return (
            <button
              key={scenario.id}
              onClick={() => handleSelectPreset(scenario)}
              className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden group ${
                isSelected
                  ? 'bg-slate-900/90 border-cyan-400 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
                  {getIcon(scenario.iconName)}
                </div>
                {isSelected && (
                  <span className="cyber-badge badge-cyan text-[9px]">ACTIVE</span>
                )}
              </div>
              <h3 className="text-xs font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                {scenario.title}
              </h3>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {scenario.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Natural Language Prompt Input Bar */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="relative flex-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-cyan-400">
            <Terminal className="w-5 h-5" />
            <span className="font-mono text-xs text-slate-500">$</span>
          </div>
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Type administrative intent... e.g. 'Remove Alex Morgan from Finance team'"
            className="w-full bg-slate-950/90 border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner"
          />
        </div>

        <button
          type="submit"
          disabled={isSimulating || !customText.trim()}
          className={`ml-3 px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2.5 transition-all shadow-lg ${
            isSimulating
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white hover:opacity-95 hover:shadow-cyan-500/25 active:scale-95'
          }`}
        >
          {isSimulating ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              <span>REHEARSING...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 text-cyan-200 fill-current" />
              <span>RUN SHADOW REHEARSAL</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
