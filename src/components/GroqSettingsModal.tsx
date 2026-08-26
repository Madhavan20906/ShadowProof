import React, { useState, useEffect } from 'react';
import { Key, Cpu, CheckCircle2, AlertCircle, X, ExternalLink } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4">
      <div className="bg-[#131823] max-w-md w-full p-6 border border-slate-800 rounded-lg shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded bg-slate-900 border border-slate-800"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded bg-indigo-950/40 border border-indigo-900/40 flex items-center justify-center text-indigo-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">
              AI Reasoning Engine Configuration
            </h3>
            <p className="text-xs text-slate-400">
              Configure Groq API key for LLM intent parsing & explanation generation.
            </p>
          </div>
        </div>

        <div className="space-y-4 my-4 text-xs">
          <div>
            <label className="block text-xs text-slate-300 mb-1.5 font-medium">
              Groq API Key (Optional)
            </label>
            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="gsk_..."
                className="w-full bg-[#0B0E14] border border-slate-700/80 rounded-md px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
              />
              <Key className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 flex items-center justify-between">
              <span>Uses deterministic graph engine if omitted.</span>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:underline flex items-center gap-1 font-mono text-[10px]"
              >
                Get Groq Key <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          <div className="p-3 rounded-md bg-[#0B0E14] border border-slate-800 text-xs flex items-center gap-2.5">
            {savedStatus ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-emerald-300">
                  Groq API Key set. Intent parsing powered by Groq Llama 3.3.
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-400">
                  No API Key. Operating in local deterministic parsing mode.
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
