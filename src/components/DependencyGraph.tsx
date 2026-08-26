import React, { useState } from 'react';
import { SystemState, SystemNode, DependencyLink } from '../types/shadowproof';
import { User, Users, FileCode, HardDrive, Bot, Key, ShieldCheck, Layers } from 'lucide-react';

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
    const colorClass = isFailed ? 'text-red-400' : 'text-blue-400';

    switch (type) {
      case 'user': return <User className={`w-3.5 h-3.5 ${colorClass}`} />;
      case 'team': return <Users className="w-3.5 h-3.5 text-slate-400" />;
      case 'workflow': return <FileCode className={`w-3.5 h-3.5 ${isFailed ? 'text-red-400' : 'text-indigo-400'}`} />;
      case 'resource': return <HardDrive className={`w-3.5 h-3.5 ${isFailed ? 'text-red-400' : 'text-amber-400'}`} />;
      case 'automation': return <Bot className={`w-3.5 h-3.5 ${isFailed ? 'text-red-400' : 'text-emerald-400'}`} />;
      case 'credential': return <Key className={`w-3.5 h-3.5 ${isFailed ? 'text-red-400' : 'text-slate-400'}`} />;
      case 'role': return <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />;
      default: return <Layers className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getNodeColor = (node: SystemNode) => {
    if (node.status === 'failed' || node.status === 'orphaned') {
      return {
        bg: 'bg-red-950/40',
        border: 'border-red-800/60',
        text: 'text-red-200'
      };
    }
    if (node.status === 'deprovisioned') {
      return {
        bg: 'bg-slate-900/60',
        border: 'border-slate-800',
        text: 'text-slate-500'
      };
    }
    if (node.status === 'reassigned') {
      return {
        bg: 'bg-indigo-950/40',
        border: 'border-indigo-800/60',
        text: 'text-indigo-200'
      };
    }
    return {
      bg: 'bg-[#0B0E14]',
      border: 'border-slate-800',
      text: 'text-slate-200'
    };
  };

  const getLinkStyle = (link: DependencyLink) => {
    if (link.status === 'severed') {
      return {
        stroke: '#EF4444',
        strokeDasharray: '4,4',
        strokeWidth: 1.5,
      };
    }
    if (link.status === 'rerouted') {
      return {
        stroke: '#6366F1',
        strokeDasharray: 'none',
        strokeWidth: 2,
      };
    }
    return {
      stroke: '#3B82F6',
      strokeDasharray: 'none',
      strokeWidth: 1.5,
    };
  };

  return (
    <div className="bg-[#131823] border border-slate-800 rounded-lg p-5 flex flex-col h-[520px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Dependency Graph Topology
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {activePlanId === 'real' && 'Live Production Topology State'}
            {activePlanId === 'direct_plan_a' && 'Plan A Simulation — Direct Deprovision Failure Cascade'}
            {activePlanId === 'shadowproof_plan_b' && 'Plan B Rehearsal — Safe Re-routed State'}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> Healthy Link
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" /> Severed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500" /> Re-routed
          </span>
        </div>
      </div>

      {/* SVG Canvas & Node Layer */}
      <div className="relative flex-1 bg-[#0B0E14] rounded-md border border-slate-800/80 overflow-hidden">
        {/* Subtle Background Grid */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />

        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <marker
              id="arrow-blue"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#3B82F6" />
            </marker>
            <marker
              id="arrow-red"
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
              id="arrow-indigo"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366F1" />
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
            const markerId = link.status === 'severed' ? 'arrow-red' : link.status === 'rerouted' ? 'arrow-indigo' : 'arrow-blue';

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
                />
                <text
                  x={(x1 + x2) / 2}
                  y={(y1 + y2) / 2 - 6}
                  fill={link.status === 'severed' ? '#F87171' : link.status === 'rerouted' ? '#818CF8' : '#64748B'}
                  fontSize="9"
                  fontFamily="Inter, sans-serif"
                  textAnchor="middle"
                  className="bg-slate-900 px-1 font-medium"
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
                width: '170px'
              }}
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => onSelectNode && onSelectNode(node)}
              className={`p-2.5 rounded-md border transition-all cursor-pointer ${colors.bg} ${colors.border} ${
                isSelected ? 'ring-1 ring-blue-500 z-20' : ''
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <div className="p-1 rounded bg-slate-900 border border-slate-800">
                  {getNodeIcon(node.type, node.status)}
                </div>
                <span className={`text-xs font-semibold truncate ${colors.text}`}>
                  {node.name}
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] mt-1 text-slate-400">
                <span className="capitalize text-slate-500">
                  {node.type}
                </span>
                <span className={`font-medium capitalize ${
                  node.status === 'failed' || node.status === 'orphaned' ? 'text-red-400' :
                  node.status === 'deprovisioned' ? 'text-slate-500' :
                  node.status === 'reassigned' ? 'text-indigo-400' : 'text-emerald-400'
                }`}>
                  {node.status}
                </span>
              </div>
            </div>
          );
        })}

        {/* Node Hover Inspector */}
        {hoveredNode && (
          <div className="absolute bottom-3 right-3 max-w-xs bg-[#131823] p-3 rounded-md border border-slate-700 z-30 text-xs shadow-lg">
            <div className="flex items-center justify-between mb-1 pb-1 border-b border-slate-800">
              <span className="font-semibold text-white">{hoveredNode.name}</span>
              <span className="text-[10px] text-slate-400 capitalize">{hoveredNode.type}</span>
            </div>
            <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">{hoveredNode.description}</p>
            <div className="space-y-1 text-[10px]">
              {Object.entries(hoveredNode.meta).map(([key, val]) => (
                <div key={key} className="flex justify-between gap-2">
                  <span className="text-slate-400">{key}:</span>
                  <span className="text-slate-200 font-mono truncate">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
