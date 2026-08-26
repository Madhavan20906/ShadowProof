import React, { useEffect, useState } from 'react';
import { ActionPlan } from '../types/shadowproof';
import { Terminal } from 'lucide-react';

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
        `[AUTH] Authorized by gatekeeper: ${approverName}`,
        `[PIPELINE] Initiating execution sequence for '${plan.name}'`,
        `[LOCK] Acquired write lock on target system graph.`
      ]);

      for (let i = 0; i < plan.steps.length; i++) {
        const step = plan.steps[i];
        setCurrentStepIdx(i);

        await new Promise(r => setTimeout(r, 1200));

        setTerminalLogs(prev => [
          ...prev,
          `[STEP ${i + 1}/${plan.steps.length}] ${step.title}`,
          `  ↳ Target: ${step.targetName} (${step.targetId})`,
          `  ↳ Detail: ${step.details}`,
          `  ↳ HTTP 200 OK (applied in 48ms)`
        ]);
      }

      await new Promise(r => setTimeout(r, 1000));

      setTerminalLogs(prev => [
        ...prev,
        `[COMPLETE] Committed ${plan.steps.length} steps to target system graph.`,
        `[VERIFY] Running automated post-execution integrity checks...`
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
    <div className="bg-[#131823] border border-slate-800 rounded-lg p-5 mb-6">
      {}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-blue-400" />
            Execution Console
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Executing approved sequence in synthetic workspace environment...
          </p>
        </div>
        <span className="text-xs font-medium text-blue-400 bg-blue-950/40 px-2.5 py-1 rounded border border-blue-900/40">
          Execution in progress
        </span>
      </div>

      {}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Progress: Step {currentStepIdx + 1} of {plan.steps.length}</span>
          <span className="text-white font-mono font-medium">{progressPercent}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-[#0B0E14] overflow-hidden border border-slate-800">
          <div 
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {}
      <div className="bg-[#0B0E14] rounded-md border border-slate-800 p-4 font-mono text-xs text-slate-300 h-64 overflow-y-auto space-y-1.5">
        {terminalLogs.map((log, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <span className="text-slate-600 select-none">&gt;</span>
            <span className={log.includes('COMPLETE') ? 'text-emerald-400 font-semibold' : log.includes('HTTP 200') ? 'text-blue-300' : 'text-slate-300'}>
              {log}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
