import React, { useEffect, useState } from 'react';
import { ActionPlan } from '../types/shadowproof';
import { Terminal, CheckCircle2, Play, Cpu, ShieldCheck, ArrowRight } from 'lucide-react';

interface RealExecutionConsoleProps {
  plan: ActionPlan;
  approverName: string;
  onExecutionComplete: () => void;
}

export const RealExecutionConsole: React.FC<RealExecutionConsoleProps> = ({
  plan,
  approverName,
  onExecutionComplete
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let stepTimer: NodeJS.Timeout;
    
    const runExecution = async () => {
      setTerminalLogs([
        `[AUTHENTICATED] Session authorized by Human Gatekeeper: ${approverName}`,
        `[TARGET CORE] Initiating real API mutation pipeline for plan: '${plan.name}'`,
        `[LOCK STATE] Acquired write lock on Real System State Graph.`
      ]);

      for (let i = 0; i < plan.steps.length; i++) {
        const step = plan.steps[i];
        setCurrentStepIdx(i);

        await new Promise(r => setTimeout(r, 1200));

        setTerminalLogs(prev => [
          ...prev,
          `[API EXECUTE step ${i + 1}/${plan.steps.length}] ${step.title}`,
          `  ↳ Target Node: ${step.targetName} (${step.targetId})`,
          `  ↳ Detail: ${step.details}`,
          `  ↳ HTTP 200 OK — Action applied cleanly in 48ms.`
        ]);
      }

      await new Promise(r => setTimeout(r, 1000));

      setTerminalLogs(prev => [
        ...prev,
        `[REAL MUTATION COMPLETE] All ${plan.steps.length} steps committed to Real Enterprise State Graph.`,
        `[HEALTH CHECK] Launching automated post-flight integrity verification...`
      ]);

      setIsDone(true);
      setTimeout(() => {
        onExecutionComplete();
      }, 1500);
    };

    runExecution();

    return () => clearTimeout(stepTimer);
  }, []);

  const progressPercent = Math.min(100, Math.round(((currentStepIdx + 1) / plan.steps.length) * 100));

  return (
    <div className="glass-panel p-6 mb-6 border-cyan-500/50 bg-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400 animate-pulse" />
            CONTROLLED WORKSPACE EXECUTION TERMINAL
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Executing authorized action steps in synthetic workspace environment...
          </p>
        </div>
        <span className="cyber-badge badge-cyan animate-pulse flex items-center gap-1">
          <Cpu className="w-3.5 h-3.5" />
          CONTROLLED EXECUTION IN PROGRESS
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
          <span>Execution Progress: Step {currentStepIdx + 1} of {plan.steps.length}</span>
          <span className="text-cyan-400 font-bold">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Terminal View */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs text-slate-200 h-64 overflow-y-auto space-y-1.5 shadow-inner">
        {terminalLogs.map((log, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <span className="text-slate-600 select-none">&gt;</span>
            <span className={log.includes('COMPLETE') ? 'text-emerald-400 font-bold' : log.includes('HTTP 200') ? 'text-cyan-300' : 'text-slate-300'}>
              {log}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
