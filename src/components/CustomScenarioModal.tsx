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
      description: description || `Custom ${nodeType} node`,
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
      setImportStatus('Successfully loaded workspace snapshot!');
      setTimeout(() => {
        setImportStatus(null);
        setShowJsonImport(false);
      }, 1200);
    } catch (err: any) {
      setImportStatus(`Import Error: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80">
      <div className="bg-[#131823] max-w-xl w-full p-6 border border-slate-800 rounded-lg shadow-xl relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded bg-slate-900 border border-slate-800"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800">
          <div className="p-2.5 rounded bg-blue-950/40 border border-blue-900/40 text-blue-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">
              Graph Topology Editor & State Import
            </h2>
            <p className="text-xs text-slate-400">
              Inspect entities, add graph nodes, or import snapshot JSON files.
            </p>
          </div>
        </div>

        {/* Existing Entities Count */}
        <div className="p-3 rounded-md bg-[#0B0E14] border border-slate-800 mb-4 flex justify-between items-center text-xs text-slate-300">
          <span>Active Nodes: {systemState.nodes.length}</span>
          <span>Active Links: {systemState.links.length}</span>
          <div className="flex gap-2">
            <button
              onClick={handleExportJson}
              className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1 text-xs"
            >
              <Download className="w-3 h-3" />
              Export
            </button>
            <button
              onClick={() => setShowJsonImport(!showJsonImport)}
              className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1 text-xs"
            >
              <Upload className="w-3 h-3" />
              Import JSON
            </button>
          </div>
        </div>

        {/* JSON Import Section */}
        {showJsonImport && (
          <div className="p-3.5 rounded-md bg-[#0B0E14] border border-slate-800 mb-4 space-y-2 text-xs">
            <label className="text-slate-300 font-medium text-xs">
              Paste Custom Workspace JSON Snapshot:
            </label>
            <textarea
              rows={4}
              value={jsonText}
              onChange={e => setJsonText(e.target.value)}
              placeholder='{"nodes": [...], "links": [...]}'
              className="w-full bg-[#131823] border border-slate-700/80 rounded-md p-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-blue-500"
            />
            {importStatus && (
              <p className={`text-xs flex items-center gap-1 ${importStatus.includes('Error') ? 'text-red-400' : 'text-emerald-400'}`}>
                {importStatus.includes('Error') ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                {importStatus}
              </p>
            )}
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={handleImportJson}
                className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs"
              >
                Apply State
              </button>
            </div>
          </div>
        )}

        {/* Add Entity Form */}
        <form onSubmit={handleAddNode} className="space-y-3 mb-4 text-xs">
          <span className="font-semibold text-white block text-xs">
            Add Custom Entity Node:
          </span>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Entity Name (e.g. Finance Vault)"
              value={nodeName}
              onChange={e => setNodeName(e.target.value)}
              className="bg-[#0B0E14] border border-slate-700/80 rounded-md p-2 text-white outline-none focus:border-blue-500"
            />

            <select
              value={nodeType}
              onChange={e => setNodeType(e.target.value as any)}
              className="bg-[#0B0E14] border border-slate-700/80 rounded-md p-2 text-slate-300 outline-none focus:border-blue-500"
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
            className="w-full bg-[#0B0E14] border border-slate-700/80 rounded-md p-2 text-white outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            className="w-full py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Entity
          </button>
        </form>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
