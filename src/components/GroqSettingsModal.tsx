import React, { useState, useEffect } from 'react';
import { Key, Sparkles, CheckCircle2, AlertCircle, X, ExternalLink } from 'lucide-react';

interface GroqSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GroqSettingsModal: React.FC<GroqSettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [savedStatus, setSavedStatus] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const existing = localStorage.getItem('groq_api_key') || '';
      setApiKey(existing);
      setSavedStatus(!!existing);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('groq_api_key', apiKey.trim());
      setSavedStatus(true);
    } else {
      localStorage.removeItem('groq_api_key');
      setSavedStatus(false);
    }
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel max-w-lg w-full p-6 border-purple-500/40 bg-slate-900 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Groq AI Reasoning Engine Config
            </h3>
            <p className="text-xs text-slate-400">
              Power natural-language intent parsing & explanation generation with Groq Llama 3.3 70B
            </p>
          </div>
        </div>

        <div className="space-y-4 my-4">
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5 font-bold uppercase">
              Groq API Key (Optional)
            </label>
            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="gsk_..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 font-mono"
              />
              <Key className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 flex items-center justify-between">
              <span>If unprovided, ShadowProof uses built-in deterministic graph parsing.</span>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="text-purple-400 hover:underline flex items-center gap-1 font-mono text-[10px]"
              >
                Get Free Groq Key <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center gap-2.5">
            {savedStatus ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-emerald-300 font-mono">
                  Groq LLM Active: Intent analysis & explanations live-powered by Llama 3.3 70B.
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-slate-400 font-mono">
                  No Groq Key: Operating in fast, deterministic graph NLP mode (Zero external pings).
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-xs font-bold hover:opacity-90 transition-all shadow-lg shadow-purple-500/20"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
