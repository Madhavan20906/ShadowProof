import React, { useState, useEffect } from 'react';
import { Key, Cpu, CheckCircle2, AlertCircle, X, ExternalLink, RefreshCw } from 'lucide-react';

interface GeminiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GeminiSettingsModal: React.FC<GeminiSettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [savedStatus, setSavedStatus] = useState(false);
  const [testState, setTestState] = useState<{ testing: boolean; message: string; success: boolean | null }>({
    testing: false,
    message: '',
    success: null
  });

  useEffect(() => {
    if (isOpen) {
      const existing = localStorage.getItem('gemini_api_key') || localStorage.getItem('groq_api_key') || '';
      setApiKey(existing);
      setSavedStatus(!!existing);
      setTestState({ testing: false, message: '', success: null });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const testConnection = async () => {
    const clean = apiKey.trim().replace(/^["']|["']$/g, '');
    if (!clean) {
      setTestState({ testing: false, message: 'Please enter a Gemini API Key starting with AIzaSy...', success: false });
      return;
    }

    setTestState({ testing: true, message: 'Testing Google Gemini API key authorization...', success: null });

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${clean}`);

      if (res.ok) {
        const data = await res.json();
        const count = data.models?.length || 0;
        setTestState({
          testing: false,
          message: `✅ API Key Verified! Connected to Google Gemini engine (${count} models available).`,
          success: true
        });
      } else {
        const errText = await res.text();
        let parsed = 'Invalid API key';
        try { parsed = JSON.parse(errText).error?.message || errText; } catch (_) {}
        setTestState({
          testing: false,
          message: `❌ Gemini Error (${res.status}): ${parsed}`,
          success: false
        });
      }
    } catch (err: any) {
      setTestState({
        testing: false,
        message: `❌ Network Error: ${err.message || 'Failed to reach Gemini endpoint.'}`,
        success: false
      });
    }
  };

  const handleSave = () => {
    const clean = apiKey.trim().replace(/^["']|["']$/g, '');
    if (clean) {
      localStorage.setItem('gemini_api_key', clean);
      setSavedStatus(true);
    } else {
      localStorage.removeItem('gemini_api_key');
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
              Google Gemini AI Engine Configuration
            </h3>
            <p className="text-xs text-slate-400">
              Configure Google Gemini API key for LLM intent parsing & risk reasoning.
            </p>
          </div>
        </div>

        <div className="space-y-4 my-4 text-xs">
          <div>
            <label className="block text-xs text-slate-300 mb-1.5 font-medium">
              Gemini API Key (Optional)
            </label>
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-[#0B0E14] border border-slate-700/80 rounded-md px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono pr-8"
                />
                <Key className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5" />
              </div>
              <button
                type="button"
                onClick={testConnection}
                disabled={testState.testing || !apiKey.trim()}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 rounded-md text-[11px] font-medium flex items-center gap-1.5 shrink-0"
              >
                {testState.testing ? (
                  <RefreshCw className="w-3 h-3 animate-spin text-blue-400" />
                ) : (
                  <span>Test Key</span>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 flex items-center justify-between">
              <span>Uses deterministic symbolic engine if omitted.</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:underline flex items-center gap-1 font-mono text-[10px]"
              >
                Get Gemini Key <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          {testState.message && (
            <div className={`p-2.5 rounded-md border text-xs font-mono ${
              testState.success === true 
                ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300' 
                : testState.success === false 
                ? 'bg-rose-950/30 border-rose-800/60 text-rose-300' 
                : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}>
              {testState.message}
            </div>
          )}

          <div className="p-3 rounded-md bg-[#0B0E14] border border-slate-800 text-xs flex items-center gap-2.5">
            {savedStatus ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-emerald-300">
                  Gemini API Key saved. Engine active for live LLM reasoning (Gemini 2.5 Flash).
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-400">
                  No API Key. Operating in local deterministic graph parsing mode.
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
