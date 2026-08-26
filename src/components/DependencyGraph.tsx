import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SystemState, SystemNode, DependencyLink } from '../types/shadowproof';
import { 
  User, Users, FileCode, HardDrive, Bot, Key, ShieldCheck, Layers,
  Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw, Move, Search, Filter,
  Sparkles, X, ChevronDown, ChevronUp, Eye, Target, RefreshCw, ArrowRight, ArrowLeft
} from 'lucide-react';

interface DependencyGraphProps {
  systemState: SystemState;
  activePlanId: string; 
  onSelectNode?: (node: SystemNode) => void;
}

export const DependencyGraph: React.FC<DependencyGraphProps> = ({
  systemState,
  activePlanId,
  onSelectNode
}) => {
  
  const [heightMode, setHeightMode] = useState<'compact' | 'expanded'>('compact');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [customPositions, setCustomPositions] = useState<Record<string, { x: number; y: number }>>({});

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<SystemNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<SystemNode | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [nodeDragStart, setNodeDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLDivElement>(null);
  const modalCanvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialPos: Record<string, { x: number; y: number }> = {};
    systemState.nodes.forEach(node => {
      initialPos[node.id] = {
        x: node.x ?? 100,
        y: node.y ?? 100
      };
    });
    setCustomPositions(initialPos);
  }, [systemState]);

  const getNodePos = useCallback((node: SystemNode) => {
    return customPositions[node.id] || { x: node.x ?? 100, y: node.y ?? 100 };
  }, [customPositions]);

  const autoFitCanvas = useCallback((isModalView = false) => {
    const targetRef = isModalView ? modalCanvasRef : canvasRef;
    if (!targetRef.current || systemState.nodes.length === 0) return;

    const rect = targetRef.current.getBoundingClientRect();
    const width = rect.width || 600;
    const height = rect.height || 450;

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    systemState.nodes.forEach(node => {
      const pos = getNodePos(node);
      minX = Math.min(minX, pos.x);
      maxX = Math.max(maxX, pos.x + 180);
      minY = Math.min(minY, pos.y);
      maxY = Math.max(maxY, pos.y + 70);
    });

    const contentW = maxX - minX + 80;
    const contentH = maxY - minY + 80;

    const scaleX = width / contentW;
    const scaleY = height / contentH;

    const calculatedZoom = Math.min(Math.max(Math.min(scaleX, scaleY) * 0.9, 0.4), 1.6);
    const calculatedPanX = (width - (minX + maxX) * calculatedZoom) / 2;
    const calculatedPanY = (height - (minY + maxY) * calculatedZoom) / 2;

    setZoom(calculatedZoom);
    setPan({ x: calculatedPanX, y: calculatedPanY });
  }, [systemState.nodes, getNodePos]);

  useEffect(() => {
    const timer = setTimeout(() => {
      autoFitCanvas(isFullscreen);
    }, 100);
    return () => clearTimeout(timer);
  }, [isFullscreen, heightMode, autoFitCanvas]);

  const handleAutoArrange = () => {
    const newPositions: Record<string, { x: number; y: number }> = {};
    const tier0: SystemNode[] = []; 
    const tier1: SystemNode[] = []; 
    const tier2: SystemNode[] = []; 

    systemState.nodes.forEach(node => {
      if (node.type === 'user') {
        tier0.push(node);
      } else if (node.type === 'team' || node.type === 'role' || node.type === 'credential') {
        tier1.push(node);
      } else {
        tier2.push(node);
      }
    });

    const calculateColumnY = (index: number, total: number, step = 110) => {
      const startY = Math.max(40, (480 - total * step) / 2);
      return startY + index * step;
    };

    tier0.forEach((node, i) => {
      newPositions[node.id] = { x: 70, y: calculateColumnY(i, tier0.length) };
    });

    tier1.forEach((node, i) => {
      newPositions[node.id] = { x: 330, y: calculateColumnY(i, tier1.length) };
    });

    tier2.forEach((node, i) => {
      newPositions[node.id] = { x: 590, y: calculateColumnY(i, tier2.length) };
    });

    setCustomPositions(newPositions);
    setTimeout(() => autoFitCanvas(isFullscreen), 50);
  };

  const handleCenterOnNode = (node: SystemNode, isModal = isFullscreen) => {
    const targetRef = isModal ? modalCanvasRef : canvasRef;
    if (!targetRef.current) return;
    const rect = targetRef.current.getBoundingClientRect();
    const pos = getNodePos(node);
    const targetZoom = 1.2;
    const targetPanX = rect.width / 2 - (pos.x + 80) * targetZoom;
    const targetPanY = rect.height / 2 - (pos.y + 24) * targetZoom;
    setZoom(targetZoom);
    setPan({ x: targetPanX, y: targetPanY });
    setSelectedNode(node);
  };

  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    if (draggingNodeId) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMoveCanvas = (e: React.MouseEvent) => {
    if (draggingNodeId) {
      const dx = (e.clientX - nodeDragStart.x) / zoom;
      const dy = (e.clientY - nodeDragStart.y) / zoom;
      setCustomPositions(prev => ({
        ...prev,
        [draggingNodeId]: {
          x: (prev[draggingNodeId]?.x || 0) + dx,
          y: (prev[draggingNodeId]?.y || 0) + dy
        }
      }));
      setNodeDragStart({ x: e.clientX, y: e.clientY });
      return;
    }

    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handleMouseUpCanvas = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  const handleWheelCanvas = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom(prev => Math.min(Math.max(prev * zoomFactor, 0.35), 2.5));
  };

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
        bg: 'bg-red-950/60',
        border: 'border-red-800/80 shadow-red-950/50 shadow-md',
        text: 'text-red-200'
      };
    }
    if (node.status === 'deprovisioned') {
      return {
        bg: 'bg-slate-900/80',
        border: 'border-slate-800 opacity-60',
        text: 'text-slate-500'
      };
    }
    if (node.status === 'reassigned') {
      return {
        bg: 'bg-indigo-950/60',
        border: 'border-indigo-800/80 shadow-indigo-950/50 shadow-md',
        text: 'text-indigo-200'
      };
    }
    return {
      bg: 'bg-[#0E131F]',
      border: 'border-slate-800 hover:border-slate-700',
      text: 'text-slate-200'
    };
  };

  const getLinkStyle = (link: DependencyLink) => {
    if (link.status === 'severed') {
      return {
        stroke: '#EF4444',
        strokeDasharray: '4,4',
        strokeWidth: 1.8,
      };
    }
    if (link.status === 'rerouted') {
      return {
        stroke: '#6366F1',
        strokeDasharray: 'none',
        strokeWidth: 2.2,
      };
    }
    return {
      stroke: '#3B82F6',
      strokeDasharray: 'none',
      strokeWidth: 1.5,
    };
  };

  const filteredNodes = systemState.nodes.filter(node => {
    const matchesSearch = searchQuery === '' || 
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = !selectedTypeFilter || selectedTypeFilter === 'all' || node.type === selectedTypeFilter;
    
    return matchesSearch && matchesType;
  });

  const nodeTypes = ['all', 'user', 'team', 'workflow', 'resource', 'automation', 'credential', 'role'];

  const renderCanvasContent = (isModal: boolean) => {
    const containerRef = isModal ? modalCanvasRef : canvasRef;

    return (
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDownCanvas}
        onMouseMove={handleMouseMoveCanvas}
        onMouseUp={handleMouseUpCanvas}
        onMouseLeave={handleMouseUpCanvas}
        onWheel={handleWheelCanvas}
        className={`relative flex-1 bg-[#0B0E14] rounded-md border border-slate-800/80 overflow-hidden cursor-${isPanning ? 'grabbing' : 'grab'} select-none`}
      >
        {}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)`,
            backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`
          }}
        />

        {}
        <div 
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            width: '100%',
            height: '100%',
            position: 'absolute',
            inset: 0
          }}
        >
          <svg className="absolute inset-0 w-[5000px] h-[5000px] pointer-events-none overflow-visible">
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

            {}
            {systemState.links.map((link) => {
              const sourceNode = systemState.nodes.find(n => n.id === link.source);
              const targetNode = systemState.nodes.find(n => n.id === link.target);

              if (!sourceNode || !targetNode) return null;

              const sourcePos = getNodePos(sourceNode);
              const targetPos = getNodePos(targetNode);

              const x1 = sourcePos.x + 85;
              const y1 = sourcePos.y + 24;
              const x2 = targetPos.x + 85;
              const y2 = targetPos.y + 24;

              const style = getLinkStyle(link);
              const markerId = link.status === 'severed' ? 'arrow-red' : link.status === 'rerouted' ? 'arrow-indigo' : 'arrow-blue';

              const isHighlighted = hoveredNode?.id === sourceNode.id || hoveredNode?.id === targetNode.id ||
                selectedNode?.id === sourceNode.id || selectedNode?.id === targetNode.id;

              return (
                <g key={link.id} className={isHighlighted ? 'opacity-100 z-10' : 'opacity-70'}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={style.stroke}
                    strokeWidth={isHighlighted ? style.strokeWidth + 1 : style.strokeWidth}
                    strokeDasharray={style.strokeDasharray}
                    markerEnd={`url(#${markerId})`}
                  />
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 - 6}
                    fill={link.status === 'severed' ? '#F87171' : link.status === 'rerouted' ? '#818CF8' : '#94A3B8'}
                    fontSize="9"
                    fontWeight="600"
                    fontFamily="Inter, sans-serif"
                    textAnchor="middle"
                    className="bg-slate-900/90 px-1 rounded pointer-events-none select-none"
                  >
                    {link.type}
                  </text>
                </g>
              );
            })}
          </svg>

          {}
          {systemState.nodes.map((node) => {
            const pos = getNodePos(node);
            const colors = getNodeColor(node);
            const isHovered = hoveredNode?.id === node.id;
            const isSelected = selectedNode?.id === node.id;
            const isMatch = filteredNodes.some(n => n.id === node.id);

            return (
              <div
                key={node.id}
                style={{
                  position: 'absolute',
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  width: '170px'
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setDraggingNodeId(node.id);
                  setNodeDragStart({ x: e.clientX, y: e.clientY });
                }}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNode(node);
                  if (onSelectNode) onSelectNode(node);
                }}
                className={`p-2.5 rounded-md border transition-all cursor-pointer ${colors.bg} ${colors.border} ${
                  !isMatch ? 'opacity-25 grayscale' : 'opacity-100'
                } ${
                  isSelected ? 'ring-2 ring-blue-500 z-30 shadow-lg shadow-blue-500/20' : 
                  isHovered ? 'ring-1 ring-slate-400 z-20 scale-[1.02]' : ''
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="p-1 rounded bg-slate-900/90 border border-slate-800 shrink-0">
                    {getNodeIcon(node.type, node.status)}
                  </div>
                  <span className={`text-xs font-semibold truncate ${colors.text}`}>
                    {node.name}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] mt-1 text-slate-400">
                  <span className="capitalize text-slate-400 font-mono text-[9px]">
                    {node.type}
                  </span>
                  <span className={`font-semibold capitalize px-1 py-0.5 rounded text-[9px] ${
                    node.status === 'failed' || node.status === 'orphaned' ? 'bg-red-950/80 text-red-300 border border-red-800/50' :
                    node.status === 'deprovisioned' ? 'bg-slate-800 text-slate-400' :
                    node.status === 'reassigned' ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/50' : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
                  }`}>
                    {node.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {}
        <div className="absolute bottom-3 left-3 z-30 flex items-center gap-1 bg-[#131823]/90 backdrop-blur-md p-1.5 rounded-lg border border-slate-800 text-xs shadow-xl">
          <button
            onClick={() => setZoom(z => Math.max(z - 0.15, 0.4))}
            title="Zoom Out"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          
          <span className="px-2 font-mono text-[11px] text-slate-300 w-12 text-center select-none">
            {Math.round(zoom * 100)}%
          </span>

          <button
            onClick={() => setZoom(z => Math.min(z + 0.15, 2.5))}
            title="Zoom In"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-slate-800 mx-1" />

          <button
            onClick={() => autoFitCanvas(isModal)}
            title="Auto Fit All Nodes"
            className="px-2 py-1 flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 hover:bg-blue-950/40 rounded transition-colors font-medium"
          >
            <Target className="w-3.5 h-3.5" />
            Fit All
          </button>

          <button
            onClick={handleAutoArrange}
            title="Auto-Arrange Structured Layout"
            className="px-2 py-1 flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/40 rounded transition-colors font-medium"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Auto Layout
          </button>

          <button
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            title="Reset Zoom & Pan"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {}
        {hoveredNode && !selectedNode && (
          <div className="absolute bottom-3 right-3 max-w-xs bg-[#131823]/95 backdrop-blur-md p-3 rounded-lg border border-slate-700 z-30 text-xs shadow-xl pointer-events-none">
            <div className="flex items-center justify-between mb-1 pb-1 border-b border-slate-800">
              <span className="font-semibold text-white truncate max-w-[180px]">{hoveredNode.name}</span>
              <span className="text-[10px] text-slate-400 capitalize font-mono">{hoveredNode.type}</span>
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

        {}
        {selectedNode && (
          <div className="absolute top-3 right-3 w-80 bg-[#131823]/95 backdrop-blur-md p-4 rounded-lg border border-slate-700 z-40 text-xs shadow-2xl space-y-3 max-h-[calc(100%-24px)] overflow-y-auto">
            <div className="flex items-start justify-between pb-2 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-1.5">
                  {getNodeIcon(selectedNode.type, selectedNode.status)}
                  <h4 className="font-bold text-white text-sm truncate max-w-[180px]">
                    {selectedNode.name}
                  </h4>
                </div>
                <span className="text-[10px] text-slate-400 font-mono uppercase block mt-0.5">
                  ID: {selectedNode.id}
                </span>
              </div>
              <button 
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed">
              {selectedNode.description}
            </p>

            {}
            <div className="bg-[#0B0E14] p-2.5 rounded border border-slate-800/80 space-y-1.5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Metadata & State:
              </span>
              {Object.entries(selectedNode.meta).map(([k, v]) => (
                <div key={k} className="flex justify-between text-[11px] gap-2">
                  <span className="text-slate-400 capitalize">{k}:</span>
                  <span className="text-slate-200 font-mono truncate max-w-[160px]">{String(v)}</span>
                </div>
              ))}
            </div>

            {}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Direct Graph Connections:
              </span>

              {}
              <div>
                <span className="text-[10px] text-slate-400 block mb-1 flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3 text-blue-400" /> Incoming Dependents:
                </span>
                <div className="space-y-1">
                  {systemState.links
                    .filter(l => l.target === selectedNode.id)
                    .map(l => {
                      const src = systemState.nodes.find(n => n.id === l.source);
                      if (!src) return null;
                      return (
                        <div 
                          key={l.id}
                          onClick={() => handleCenterOnNode(src, isModal)}
                          className="flex items-center justify-between p-1.5 rounded bg-slate-900/80 hover:bg-slate-800 border border-slate-800 cursor-pointer text-[11px]"
                        >
                          <span className="text-slate-200 truncate">{src.name}</span>
                          <span className="text-[9px] text-blue-400 font-mono font-medium">{l.type}</span>
                        </div>
                      );
                    })}
                  {systemState.links.filter(l => l.target === selectedNode.id).length === 0 && (
                    <span className="text-[11px] text-slate-500 italic">None (Root Node)</span>
                  )}
                </div>
              </div>

              {}
              <div>
                <span className="text-[10px] text-slate-400 block mb-1 flex items-center gap-1">
                  <ArrowRight className="w-3 h-3 text-emerald-400" /> Outgoing Dependencies:
                </span>
                <div className="space-y-1">
                  {systemState.links
                    .filter(l => l.source === selectedNode.id)
                    .map(l => {
                      const tgt = systemState.nodes.find(n => n.id === l.target);
                      if (!tgt) return null;
                      return (
                        <div 
                          key={l.id}
                          onClick={() => handleCenterOnNode(tgt, isModal)}
                          className="flex items-center justify-between p-1.5 rounded bg-slate-900/80 hover:bg-slate-800 border border-slate-800 cursor-pointer text-[11px]"
                        >
                          <span className="text-slate-200 truncate">{tgt.name}</span>
                          <span className="text-[9px] text-emerald-400 font-mono font-medium">{l.type}</span>
                        </div>
                      );
                    })}
                  {systemState.links.filter(l => l.source === selectedNode.id).length === 0 && (
                    <span className="text-[11px] text-slate-500 italic">None (Leaf Node)</span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => handleCenterOnNode(selectedNode, isModal)}
                className="flex-1 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-medium transition-colors flex items-center justify-center gap-1"
              >
                <Target className="w-3.5 h-3.5" /> Center View
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {}
      <div className={`bg-[#131823] border border-slate-800 rounded-lg p-4 flex flex-col transition-all duration-300 ${
        heightMode === 'expanded' ? 'h-[760px]' : 'h-[530px]'
      }`}>
        {}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">
                Dependency Graph Topology
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-blue-950/80 border border-blue-800/60 text-blue-400 text-[10px] font-mono">
                {systemState.nodes.length} Nodes • {systemState.links.length} Links
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {activePlanId === 'real' && 'Live Production Topology State'}
              {activePlanId === 'direct_plan_a' && 'Plan A Simulation — Direct Deprovision Failure Cascade'}
              {activePlanId === 'shadowproof_plan_b' && 'Plan B Rehearsal — Safe Re-routed State'}
            </p>
          </div>

          {}
          <div className="flex items-center gap-2">
            {}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter nodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1 bg-[#0B0E14] border border-slate-800 rounded text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 w-36 md:w-44"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1.5 rounded border text-xs flex items-center gap-1 transition-colors ${
                selectedTypeFilter || showFilters ? 'bg-blue-950/80 text-blue-300 border-blue-800' : 'bg-[#0B0E14] text-slate-400 border-slate-800 hover:text-white'
              }`}
              title="Filter by Node Type"
            >
              <Filter className="w-3.5 h-3.5" />
            </button>

            {}
            <button
              onClick={() => setHeightMode(m => m === 'compact' ? 'expanded' : 'compact')}
              className="px-2.5 py-1 rounded bg-[#0B0E14] border border-slate-800 text-xs text-slate-300 hover:text-white hover:border-slate-700 transition-colors flex items-center gap-1 font-medium"
              title={heightMode === 'compact' ? 'Expand Graph Canvas Height' : 'Collapse Canvas Height'}
            >
              {heightMode === 'compact' ? (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-blue-400" />
                  Expand Height
                </>
              ) : (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-indigo-400" />
                  Compact Height
                </>
              )}
            </button>

            {}
            <button
              onClick={() => setIsFullscreen(true)}
              className="p-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              title="Maximize / Fullscreen View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {}
        {showFilters && (
          <div className="flex flex-wrap items-center gap-1.5 mb-3 pb-2 border-b border-slate-800/60 text-xs">
            <span className="text-[10px] text-slate-400 uppercase font-semibold mr-1">Filter Type:</span>
            {nodeTypes.map(t => (
              <button
                key={t}
                onClick={() => setSelectedTypeFilter(selectedTypeFilter === t ? null : t)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize transition-colors ${
                  (selectedTypeFilter === t || (t === 'all' && !selectedTypeFilter))
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#0B0E14] text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {}
        {renderCanvasContent(false)}
      </div>

      {}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-[#0B0E14]/95 backdrop-blur-lg flex flex-col p-4 md:p-6 overflow-hidden animate-in fade-in duration-200">
          {}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-400" />
                  Full Topology Dependency Visualizer
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-950 border border-blue-800 text-blue-400 text-xs font-mono font-medium">
                  {systemState.nodes.length} Nodes • {systemState.links.length} Links
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Interactive Extendable Canvas — Drag to Pan, Scroll to Zoom, Drag Nodes to Reposition
              </p>
            </div>

            <div className="flex items-center gap-3">
              {}
              <div className="hidden md:flex items-center gap-1.5 bg-[#131823] p-1 rounded-lg border border-slate-800 text-xs">
                {nodeTypes.map(t => (
                  <button
                    key={t}
                    onClick={() => setSelectedTypeFilter(selectedTypeFilter === t ? null : t)}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium capitalize transition-colors ${
                      (selectedTypeFilter === t || (t === 'all' && !selectedTypeFilter))
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search full graph..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-[#131823] border border-slate-700 rounded-md text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 w-48 md:w-64"
                />
              </div>

              {}
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1 text-xs font-medium"
              >
                <Minimize2 className="w-4 h-4" />
                Exit Fullscreen
              </button>
            </div>
          </div>

          {}
          {renderCanvasContent(true)}
        </div>
      )}
    </>
  );
};
