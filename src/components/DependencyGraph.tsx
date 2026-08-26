import React, { useState } from 'react';
import { SystemState, SystemNode, DependencyLink } from '../types/shadowproof';
import { User, Users, FileCode, HardDrive, Bot, Key, ShieldCheck, AlertCircle, RefreshCw, Layers } from 'lucide-react';

interface DependencyGraphProps {
  systemState: SystemState;
  activePlanId: string; // 'real' | 'direct_plan_a' | 'shadowproof_plan_b'
  onSelectNode?: (node: SystemNode) => void;
}

export const DependencyGraph: React.FC<DependencyGraphProps> = ({
  systemState,
  activePlanId,
  onSelectNode
}) => {
  const [hoveredNode, setHoveredNode] = useState<SystemNode | null>(null);

  const getNodeIcon = (type: string, status: string) => {
    const isFailed = status === 'failed' || status === 'orphaned';
    const colorClass = isFailed ? 'text-rose-400' : 'text-cyan-400';

    switch (type) {
      case 'user': return <User className={`w-4 h-4 ${colorClass}`} />;
      case 'team': return <Users className={`w-4 h-4 text-blue-400`} />;
      case 'workflow': return <FileCode className={`w-4 h-4 ${isFailed ? 'text-rose-400' : 'text-purple-400'}`} />;
      case 'resource': return <HardDrive className={`w-4 h-4 ${isFailed ? 'text-rose-400' : 'text-amber-400'}`} />;
      case 'automation': return <Bot className={`w-4 h-4 ${isFailed ? 'text-rose-400 animate-bounce' : 'text-emerald-400'}`} />;
      case 'credential': return <Key className={`w-4 h-4 ${isFailed ? 'text-rose-400' : 'text-rose-300'}`} />;
      case 'role': return <ShieldCheck className={`w-4 h-4 text-cyan-300`} />;
      default: return <Layers className="w-4 h-4 text-slate-400" />;
    }
  };

  const getNodeColor = (node: SystemNode) => {
    if (node.status === 'failed' || node.status === 'orphaned') {
      return {
        bg: 'bg-rose-950/80',
        border: 'border-rose-500',
        shadow: 'shadow-rose-500/30',
        text: 'text-rose-200'
      };
    }
    if (node.status === 'deprovisioned') {
      return {
        bg: 'bg-slate-900/60',
        border: 'border-slate-700',
        shadow: 'shadow-none',
        text: 'text-slate-500'
      };
    }
    if (node.status === 'reassigned') {
      return {
        bg: 'bg-purple-950/80',
        border: 'border-purple-400',
        shadow: 'shadow-purple-500/20',
        text: 'text-purple-200'
      };
    }
    return {
      bg: 'bg-slate-900/90',
      border: 'border-cyan-500/50',
      shadow: 'shadow-cyan-500/10',
      text: 'text-slate-100'
    };
  };

  const getLinkStyle = (link: DependencyLink) => {
    if (link.status === 'severed') {
      return {
        stroke: '#EF4444',
        strokeDasharray: '6,6',
        strokeWidth: 2,
        className: 'animate-pulse'
      };
    }
    if (link.status === 'rerouted') {
      return {
        stroke: '#8B5CF6',
        strokeDasharray: 'none',
        strokeWidth: 2.5,
        className: 'animate-pulse-glow'
      };
    }
    return {
      stroke: '#00F2FE',
      strokeDasharray: 'none',
      strokeWidth: 1.5,
      className: ''
    };
  };

  return (
    <div className="glass-panel p-5 relative overflow-hidden flex flex-col h-[520px]">
      {/* Graph Toolbar Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            DEPENDENCY GRAPH TOPOLOGY
          </h3>
          <p className="text-[11px] text-slate-400">
            {activePlanId === 'real' && 'Real System Active State — Live Links & Custodians'}
            {activePlanId === 'direct_plan_a' && 'Plan A Simulation — Direct Deprovisioning Failure Cascade'}
            {activePlanId === 'shadowproof_plan_b' && 'Plan B Rehearsal — Re-routed Safety Graph'}
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400" /> Healthy Link
          </span>
          <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-rose-300">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" /> Severed / Failed
          </span>
          <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-purple-300">
            <span className="w-2 h-2 rounded-full bg-purple-400" /> Re-routed (Plan B)
          </span>
        </div>
      </div>

      {/* SVG Canvas & Interactive Node Layer */}
      <div className="relative flex-1 bg-slate-950/80 rounded-xl border border-slate-800/80 overflow-hidden">
        {/* Background Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />

        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <marker
              id="arrow-cyan"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#00F2FE" />
            </marker>
            <marker
              id="arrow-rose"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#EF4444" />
            </marker>
            <marker
              id="arrow-purple"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#8B5CF6" />
            </marker>
          </defs>

          {/* Render Link Lines */}
          {systemState.links.map((link) => {
            const sourceNode = systemState.nodes.find(n => n.id === link.source);
            const targetNode = systemState.nodes.find(n => n.id === link.target);

            if (!sourceNode || !targetNode || sourceNode.x === undefined || targetNode.x === undefined) {
              return null;
            }

            const x1 = sourceNode.x + 80;
            const y1 = sourceNode.y + 24;
            const x2 = targetNode.x + 80;
            const y2 = targetNode.y + 24;

            const style = getLinkStyle(link);
            const markerId = link.status === 'severed' ? 'arrow-rose' : link.status === 'rerouted' ? 'arrow-purple' : 'arrow-cyan';

            return (
              <g key={link.id}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={style.stroke}
                  strokeWidth={style.strokeWidth}
                  strokeDasharray={style.strokeDasharray}
                  markerEnd={`url(#${markerId})`}
                  className={style.className}
                />
                {/* Link label badge on line mid-point */}
                <text
                  x={(x1 + x2) / 2}
                  y={(y1 + y2) / 2 - 6}
                  fill={link.status === 'severed' ? '#FCA5A5' : link.status === 'rerouted' ? '#C084FC' : '#94A3B8'}
                  fontSize="9"
                  fontFamily="JetBrains Mono"
                  textAnchor="middle"
                  className="bg-slate-900 px-1"
                >
                  {link.type}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Render Node Cards */}
        {systemState.nodes.map((node) => {
          const colors = getNodeColor(node);
          const isSelected = hoveredNode?.id === node.id;

          return (
            <div
              key={node.id}
              style={{
                position: 'absolute',
                left: `${node.x}px`,
                top: `${node.y}px`,
                width: '180px'
              }}
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => onSelectNode && onSelectNode(node)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-lg ${colors.bg} ${colors.border} ${colors.shadow} ${
                isSelected ? 'scale-105 z-20 ring-2 ring-cyan-400' : 'hover:scale-102'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5">
                  <div className="p-1 rounded bg-slate-950 border border-slate-800">
                    {getNodeIcon(node.type, node.status)}
                  </div>
                  <span className={`text-xs font-bold truncate ${colors.text}`}>
                    {node.name}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono mt-1 text-slate-400">
                <span className="uppercase text-[9px] px-1.5 py-0.5 rounded bg-slate-950/80 border border-slate-800">
                  {node.type}
                </span>
                <span className={`font-semibold capitalize ${
                  node.status === 'failed' || node.status === 'orphaned' ? 'text-rose-400 animate-pulse' :
                  node.status === 'deprovisioned' ? 'text-slate-500' :
                  node.status === 'reassigned' ? 'text-purple-300' : 'text-emerald-400'
                }`}>
                  {node.status}
                </span>
              </div>
            </div>
          );
        })}

        {/* Hover Inspector Tooltip Overlay */}
        {hoveredNode && (
          <div className="absolute bottom-3 right-3 max-w-xs glass-panel p-3 border-cyan-500/40 bg-slate-950/95 z-30 shadow-xl font-mono text-xs">
            <div className="flex items-center justify-between mb-1 pb-1 border-b border-slate-800">
              <span className="font-bold text-cyan-300">{hoveredNode.name}</span>
              <span className="text-[10px] text-slate-400 uppercase">{hoveredNode.type}</span>
            </div>
            <p className="text-[11px] text-slate-300 mb-2">{hoveredNode.description}</p>
            <div className="space-y-1 text-[10px] text-slate-400">
              {Object.entries(hoveredNode.meta).map(([key, val]) => (
                <div key={key} className="flex justify-between gap-2">
                  <span className="text-slate-500">{key}:</span>
                  <span className="text-cyan-200 truncate">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
