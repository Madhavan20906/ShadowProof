import React, { useState } from 'react';
import { SystemState } from '../types/shadowproof';
import { X, Plus, Layers, Download, Upload, CheckCircle2, AlertCircle } from 'lucide-react';

interface CustomScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemState: SystemState;
  onUpdateState: (newState: SystemState) => void;
}

export const CustomScenarioModal: React.FC<CustomScenarioModalProps> = ({
  isOpen,
  onClose,
  systemState,
  onUpdateState
}) => {
  const [nodeName, setNodeName] = useState('');
  const [nodeType, setNodeType] = useState<'user' | 'workflow' | 'resource' | 'automation'>('user');
  const [description, setDescription] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showJsonImport, setShowJsonImport] = useState(false);

  if (!isOpen) return null;

  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nodeName.trim()) return;

    const newNode = {
      id: `custom-${Date.now()}`,
      name: nodeName,
      type: nodeType,
      description: description || `Custom ${nodeType} node created by admin`,
      status: 'active' as const,
      meta: {
        created: new Date().toLocaleTimeString()
      },
      x: 380,
      y: 300
    };

    onUpdateState({
      ...systemState,
      nodes: [...systemState.nodes, newNode]
    });

    setNodeName('');
    setDescription('');
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(systemState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `shadowproof-snapshot-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed.nodes || !parsed.links) {
        throw new Error('Invalid schema: Missing nodes or links array.');
      }
      onUpdateState(parsed);
      setImportStatus('Successfully loaded workspace snapshot JSON!');
      setTimeout(() => {
        setImportStatus(null);
        setShowJsonImport(false);
      }, 1200);
    } catch (err: any) {
      setImportStatus(`Import Error: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel max-w-xl w-full p-6 border-cyan-500/40 bg-slate-950 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded bg-slate-900 border border-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800">
          <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">
              SYSTEM GRAPH EDITOR & SNAPSHOT IMPORT
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Inspect entities, add nodes, or import custom workspace state JSON snapshots.
            </p>
          </div>
        </div>

        {/* Existing Entities Count */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 mb-4 flex justify-between items-center text-xs font-mono text-slate-300">
          <span>Active Graph Nodes: {systemState.nodes.length}</span>
          <span>Active Graph Links: {systemState.links.length}</span>
          <div className="flex gap-2">
            <button
              onClick={handleExportJson}
              className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-cyan-400 hover:text-white flex items-center gap-1 text-[11px]"
            >
              <Download className="w-3 h-3" />
              Export JSON
            </button>
            <button
              onClick={() => setShowJsonImport(!showJsonImport)}
              className="px-2.5 py-1 rounded bg-purple-950 border border-purple-500/40 text-purple-300 hover:text-white flex items-center gap-1 text-[11px]"
            >
              <Upload className="w-3 h-3" />
              Import JSON
            </button>
          </div>
        </div>

        {/* JSON Import Section */}
        {showJsonImport && (
          <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/40 mb-4 space-y-2 font-mono text-xs">
            <label className="text-purple-300 font-bold uppercase text-[11px]">
              Paste Custom Workspace JSON Snapshot:
            </label>
            <textarea
              rows={4}
              value={jsonText}
              onChange={e => setJsonText(e.target.value)}
              placeholder='{"nodes": [...], "links": [...]}'
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-purple-500"
            />
            {importStatus && (
              <p className={`text-[11px] flex items-center gap-1 ${importStatus.includes('Error') ? 'text-rose-400' : 'text-emerald-400'}`}>
                {importStatus.includes('Error') ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                {importStatus}
              </p>
            )}
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={handleImportJson}
                className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-bold text-xs"
              >
                Apply Custom JSON State
              </button>
            </div>
          </div>
        )}

        {/* Add Entity Form */}
        <form onSubmit={handleAddNode} className="space-y-3 mb-4 font-mono text-xs">
          <span className="font-bold text-cyan-300 block font-sans text-xs uppercase">
            Add Custom Entity to Graph:
          </span>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Entity Name (e.g. Finance Vault)"
              value={nodeName}
              onChange={e => setNodeName(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono outline-none focus:border-cyan-400"
            />

            <select
              value={nodeType}
              onChange={e => setNodeType(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 font-mono outline-none focus:border-cyan-400"
            >
              <option value="user">User / Identity</option>
              <option value="workflow">Approval Workflow</option>
              <option value="resource">Cloud Resource / KMS</option>
              <option value="automation">Cron / Automation Bot</option>
            </select>
          </div>

          <input
            type="text"
            placeholder="Entity description..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono outline-none focus:border-cyan-400"
          />

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            Add Entity to Graph
          </button>
        </form>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-800"
          >
            Close Config
          </button>
        </div>
      </div>
    </div>
  );
};
