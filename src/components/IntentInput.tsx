import React, { useState } from 'react';
import { Play, UserMinus, ShieldAlert, Database, Terminal, ArrowRight, Search, Sparkles, Cpu } from 'lucide-react';
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
  const hasApiKey = typeof localStorage !== 'undefined' && !!(localStorage.getItem('gemini_api_key') || localStorage.getItem('groq_api_key'));

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
      case 'UserMinus': return <UserMinus className="w-4 h-4 text-amber-400" />;
      case 'ShieldAlert': return <ShieldAlert className="w-4 h-4 text-indigo-400" />;
      case 'Database': return <Database className="w-4 h-4 text-indigo-400" />;
      default: return <Terminal className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="bg-[#131823] border border-slate-800 rounded-lg p-5 mb-6">
      {}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white">
            1. Define Execution Intent
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select a target workflow or specify custom natural language administrative instructions.
          </p>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {PRESET_SCENARIOS.map((scenario) => {
          const isSelected = selectedPresetId === scenario.id;
          return (
            <button
              key={scenario.id}
              onClick={() => handleSelectPreset(scenario)}
              className={`p-3 rounded-md border text-left transition-all relative ${
                isSelected
                  ? 'bg-blue-950/20 border-blue-500/60 text-white'
                  : 'bg-[#0B0E14] border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                  {getIcon(scenario.iconName)}
                </div>
                {isSelected && (
                  <span className="text-[10px] font-medium text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-900/40">
                    Active Preset
                  </span>
                )}
              </div>
              <h3 className="text-xs font-semibold text-white mb-1">
                {scenario.title}
              </h3>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-snug">
                {scenario.description}
              </p>
            </button>
          );
        })}
      </div>

      {}
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Natural Language Execution Intent:
        </span>
        {hasApiKey ? (
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/60 flex items-center gap-1 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            ✨ Gemini 3.6 Flash Active
          </span>
        ) : (
          <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">
            <Cpu className="w-3 h-3 text-slate-500" />
            Deterministic Fallback (No Key)
          </span>
        )}
      </div>

      {}
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Specify intent e.g. 'Offboard Alex Morgan from Finance and re-assign signatory roles'"
            className="w-full bg-[#0B0E14] border border-slate-700/80 rounded-md pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={isSimulating || !customText.trim()}
          className={`px-4 py-2.5 rounded-md font-medium text-xs flex items-center gap-2 transition-colors whitespace-nowrap ${
            isSimulating
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
        >
          {isSimulating ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              <span>Simulating...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Safety Rehearsal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
