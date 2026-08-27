import React, { useState } from 'react';
import { Header } from './components/Header';
import { ModeComparison } from './components/ModeComparison';
import { IntentInput } from './components/IntentInput';
import { DependencyGraph } from './components/DependencyGraph';
import { ConsequenceAlerts } from './components/ConsequenceAlerts';
import { EvidenceMatrix } from './components/EvidenceMatrix';
import { UncertaintyGauge } from './components/UncertaintyGauge';
import { PolicyCheckPanel } from './components/PolicyCheckPanel';
import { TemporalTimeline } from './components/TemporalTimeline';
import { BlastRadiusGauge } from './components/BlastRadiusGauge';
import { HumanApprovalModal } from './components/HumanApprovalModal';
import { RealExecutionConsole } from './components/RealExecutionConsole';
import { PostVerification } from './components/PostVerification';
import { AuditTrailModal } from './components/AuditTrailModal';
import { CustomScenarioModal } from './components/CustomScenarioModal';
import { GeminiSettingsModal } from './components/GeminiSettingsModal';
import { AIRiskCard } from './components/AIRiskCard';

import { INITIAL_REAL_SYSTEM_STATE, PRESET_SCENARIOS, getInitialStateForPreset } from './mock/scenarioData';
import { SystemState, ActionPlan, ActionStep, AuditLog, UncertaintyMetric, SimulationResult, ParsedIntent } from './types/shadowproof';
import { ShieldCheck, Play, ArrowRight, CheckCircle2, Lock, Cpu, Eye, AlertTriangle } from 'lucide-react';

import { simulateDirectPlanA, simulateSaferPlanB } from './engine/shadowEngine';
import { generateGenericComparisonPlans } from './engine/genericPlanner';
import { parseUserIntent, parseUserIntentAsync } from './engine/intentParser';
import { analyzeSimulationWithAI, AIRiskReasoning } from './engine/aiReasoningEngine';

export function App() {
  
  const [selectedPresetId, setSelectedPresetId] = useState<string>('alex-finance-offboard');

  const [realSystemState, setRealSystemState] = useState<SystemState>(() => getInitialStateForPreset('alex-finance-offboard'));
  
  const [appStage, setAppStage] = useState<'intent' | 'shadow_rehearsed' | 'execution_running' | 'verified'>('intent');
  
  const [currentIntent, setCurrentIntent] = useState<string>(PRESET_SCENARIOS[0].prompt);
  
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [plans, setPlans] = useState<{ planA: ActionPlan; planB: ActionPlan; uncertainties: UncertaintyMetric[] } | null>(null);
  const [simResults, setSimResults] = useState<{ simA: SimulationResult; simB: SimulationResult } | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<'direct_plan_a' | 'shadowproof_plan_b'>('shadowproof_plan_b');

  const [activeGraphMode, setActiveGraphMode] = useState<'real' | 'direct_plan_a' | 'shadowproof_plan_b'>('real');

  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [showApprovalModal, setShowApprovalModal] = useState<boolean>(false);
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [showGeminiModal, setShowGeminiModal] = useState<boolean>(false);

  const [approverName, setApproverName] = useState<string>('');
  const [auditLog, setAuditLog] = useState<AuditLog | null>(() => {
    try {
      const saved = localStorage.getItem('shadowproof_audit_log');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [parsedIntent, setParsedIntent] = useState<ParsedIntent | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIRiskReasoning | null>(null);

  const handlePresetSelect = (presetId: string) => {
    setSelectedPresetId(presetId);
    const newState = getInitialStateForPreset(presetId);
    setRealSystemState(newState);
    setPlans(null);
    setSimResults(null);
    setParsedIntent(null);
    setAiAnalysis(null);
    setAppStage('intent');
    setActiveGraphMode('real');
  };

  const handleSimulate = async (intentText: string) => {
    setIsSimulating(true);
    setAppStage('intent');

    await new Promise(r => setTimeout(r, 600));

    const parsed = await parseUserIntentAsync(intentText, realSystemState);
    setParsedIntent(parsed);

    const genericRes = generateGenericComparisonPlans(realSystemState, parsed.targetNodeId);

    setPlans({
      planA: genericRes.planA,
      planB: genericRes.planB,
      uncertainties: genericRes.uncertainties
    });

    setSimResults({
      simA: genericRes.simResultA,
      simB: genericRes.simResultB
    });

    const reasoning = await analyzeSimulationWithAI(intentText, realSystemState, genericRes.simResultA, genericRes.simResultB);
    setAiAnalysis(reasoning);

    if (reasoning.parsedByLLM) {
      const activeTargetId = reasoning.targetNodeId || parsed.targetNodeId;
      const targetNode = realSystemState.nodes.find(n => n.id === activeTargetId);

      setParsedIntent({
        action: reasoning.action || parsed.action,
        targetNodeId: activeTargetId,
        targetNodeName: targetNode?.name || parsed.targetNodeName,
        targetNodeType: targetNode?.type || parsed.targetNodeType,
        constraints: reasoning.constraints && reasoning.constraints.length > 0 ? reasoning.constraints : parsed.constraints,
        rawIntent: intentText,
        aiExplanation: `Gemini Safety Reasoning Engine parsed target '${targetNode?.name || activeTargetId}' (${reasoning.action?.toUpperCase()}) with ${reasoning.constraints?.length || 0} active graph safety constraint(s).`,
        parsedByLLM: true
      });

      if (reasoning.planB_steps && reasoning.planB_steps.length > 0) {
        const aiSteps: ActionStep[] = reasoning.planB_steps.map((step, idx) => {
          const tNode = realSystemState.nodes.find(n => n.id === step.targetNodeId || n.name.toLowerCase().includes(step.targetNodeId.toLowerCase())) || { name: step.targetNodeId };
          let stepType: ActionStep['type'] = 'update_permission';
          const opLower = step.op.toLowerCase();
          if (opLower.includes('reassign')) stepType = 'reassign_approver';
          else if (opLower.includes('transfer')) stepType = 'transfer_ownership';
          else if (opLower.includes('rotate')) stepType = 'rotate_credential';
          else if (opLower.includes('deprovision') || opLower.includes('delete') || opLower.includes('revoke')) stepType = 'deprovision';

          return {
            id: `step-ai-${idx + 1}`,
            title: `${step.op.replace(/_/g, ' ').toUpperCase()}: ${tNode.name}`,
            type: stepType,
            targetId: step.targetNodeId,
            targetName: tNode.name,
            details: step.rationale,
            status: 'completed' as const
          };
        });

        genericRes.planB.steps = aiSteps;
      }
    }

    const bestPlanId = genericRes.planA.riskScore <= genericRes.planB.riskScore ? 'direct_plan_a' : 'shadowproof_plan_b';

    setIsSimulating(false);
    setAppStage('shadow_rehearsed');
    setSelectedPlanId(bestPlanId);
    setActiveGraphMode(bestPlanId);
  };

  const handleInitiateApproval = () => {
    setShowApprovalModal(true);
  };

  const handleConfirmApproval = (name: string) => {
    setApproverName(name);
    setShowApprovalModal(false);
    setAppStage('execution_running');
  };

  const handleExecutionComplete = () => {
    if (!plans) return;
    const chosenPlan = selectedPlanId === 'shadowproof_plan_b' ? plans.planB : plans.planA;

    let verificationChecklist: { id: string; label: string; status: 'passed' | 'failed' | 'pending'; detail: string; }[] = [
      { id: '1', label: 'Deprovisioned target user from directory', status: 'passed', detail: 'IAM User disabled' },
      { id: '2', label: 'PO Approval Tier-2 Signatory active', status: 'passed', detail: 'Backup signatory assigned' },
      { id: '3', label: 'AWS S3 Vault KMS Key custodian policy active', status: 'passed', detail: 'KMS access policy confirmed' },
      { id: '4', label: 'Daily Payroll Sync Bot bearer token active', status: 'passed', detail: 'Service account token validated' }
    ];

    const newAuditLog: AuditLog = {
      id: `AUD-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toLocaleString(),
      userIntent: currentIntent,
      planA: plans.planA,
      planB: plans.planB,
      selectedPlanId,
      approvedBy: approverName,
      approvalTimestamp: new Date().toLocaleTimeString(),
      executionLogs: chosenPlan.simulatedLogs,
      verificationChecklist,
      diffSummary: {
        nodesAdded: 0,
        nodesRemoved: 1,
        nodesModified: chosenPlan.steps.length,
        linksRerouted: chosenPlan.steps.filter(s => s.type !== 'deprovision').length
      }
    };

    setAuditLog(newAuditLog);
    try {
      localStorage.setItem('shadowproof_audit_log', JSON.stringify(newAuditLog));
    } catch (e) {
      console.warn('Could not persist audit log to localStorage:', e);
    }
    setAppStage('verified');
    setActiveGraphMode(selectedPlanId);
  };

  const handleReset = () => {
    setAppStage('intent');
    setPlans(null);
    setSimResults(null);
    setActiveGraphMode('real');
    setRealSystemState(getInitialStateForPreset(selectedPresetId));
  };

  const getActiveGraphState = (): SystemState => {
    if (activeGraphMode === 'direct_plan_a' && simResults) {
      return simResults.simA.shadowState;
    }
    if (activeGraphMode === 'shadowproof_plan_b' && simResults) {
      return simResults.simB.shadowState;
    }
    return realSystemState;
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {}
      <Header
        currentStep={appStage}
        isShadowActive={appStage === 'shadow_rehearsed' || appStage === 'execution_running'}
        onOpenAudit={() => setShowAuditModal(true)}
        onOpenScenarioModal={() => setShowCustomModal(true)}
        onOpenGeminiModal={() => setShowGeminiModal(true)}
        showComparison={showComparison}
        setShowComparison={setShowComparison}
      />

      {}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 space-y-6">
        {}
        {showComparison && <ModeComparison />}

        {}
        <IntentInput
          currentIntent={currentIntent}
          setCurrentIntent={setCurrentIntent}
          onSimulate={handleSimulate}
          isSimulating={isSimulating}
          selectedPresetId={selectedPresetId}
          setSelectedPresetId={handlePresetSelect}
        />

        {}
        {plans && (
          <AIRiskCard
            parsedIntent={parsedIntent}
            aiAnalysis={aiAnalysis}
          />
        )}

        {}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {}
          <div className="lg:col-span-6 flex flex-col space-y-3">
            {}
            <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-[#131823] border border-slate-800 text-xs">
              <span className="text-slate-400 font-medium">Topology View:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveGraphMode('real')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    activeGraphMode === 'real' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Live System State
                </button>
                {plans && (
                  <>
                    <button
                      onClick={() => setActiveGraphMode('direct_plan_a')}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                        activeGraphMode === 'direct_plan_a' ? 'bg-red-950/60 text-red-400 border border-red-900/40' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Plan A (Direct)
                    </button>
                    <button
                      onClick={() => setActiveGraphMode('shadowproof_plan_b')}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                        activeGraphMode === 'shadowproof_plan_b' ? 'bg-blue-950/60 text-blue-400 border border-blue-900/40' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Plan B (Re-routed)
                    </button>
                  </>
                )}
              </div>
            </div>

            {}
            <DependencyGraph
              systemState={getActiveGraphState()}
              activePlanId={activeGraphMode}
            />
          </div>

          {}
          <div className="lg:col-span-6 flex flex-col space-y-4">
            {appStage === 'intent' && !plans && (
              <div className="bg-[#131823] border border-slate-800 rounded-lg p-6 h-full flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 rounded bg-blue-950/40 border border-blue-900/40 flex items-center justify-center text-blue-400">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">
                    Safety Rehearsal Engine Ready
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                    Click <strong className="text-slate-200">"Run Safety Rehearsal"</strong> to discover downstream graph failures & compute non-destructive Plan B sequences.
                  </p>
                </div>
              </div>
            )}

            {plans && (
              <>
                {}
                <ConsequenceAlerts
                  consequences={plans.planA.consequences}
                  riskScore={plans.planA.riskScore}
                />

                {}
                <div className="bg-[#131823] border border-emerald-900/50 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-emerald-400 font-medium uppercase block">
                      Selected Plan
                    </span>
                    <h4 className="text-xs font-semibold text-white">
                      {selectedPlanId === 'shadowproof_plan_b' ? 'Plan B (ShadowProof Rehearsed)' : 'Plan A (Direct Execution)'}
                    </h4>
                  </div>

                  {appStage === 'shadow_rehearsed' && (
                    <button
                      onClick={handleInitiateApproval}
                      className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-2 transition-colors"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Proceed to Approval
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {}
        {plans && simResults && appStage !== 'execution_running' && appStage !== 'verified' && (
          <div className="space-y-6 pt-2">
            {}
            <PolicyCheckPanel
              invariants={simResults.simA.invariants}
              planType={selectedPlanId}
            />

            {}
            <BlastRadiusGauge
              blastRadius={simResults.simA.blastRadius}
              planARisk={plans.planA.riskScore}
              planBRisk={plans.planB.riskScore}
              selectedPlanId={selectedPlanId}
            />

            {}
            <EvidenceMatrix
              planA={plans.planA}
              planB={plans.planB}
              selectedPlanId={selectedPlanId}
              onSelectPlan={(id) => {
                setSelectedPlanId(id);
                setActiveGraphMode(id);
              }}
            />

            {}
            <TemporalTimeline
              timeline={simResults.simA.temporalConsequences}
              planType={selectedPlanId}
            />

            {}
            <UncertaintyGauge
              uncertainties={plans.uncertainties}
            />
          </div>
        )}

        {}
        {appStage === 'execution_running' && plans && (
          <RealExecutionConsole
            plan={selectedPlanId === 'shadowproof_plan_b' ? plans.planB : plans.planA}
            approverName={approverName}
            onExecutionComplete={handleExecutionComplete}
          />
        )}

        {}
        {appStage === 'verified' && (
          <PostVerification
            onReset={handleReset}
            onOpenAudit={() => setShowAuditModal(true)}
            presetId={selectedPresetId}
          />
        )}
      </main>

      {}
      {plans && (
        <HumanApprovalModal
          isOpen={showApprovalModal}
          onClose={() => setShowApprovalModal(false)}
          selectedPlan={selectedPlanId === 'shadowproof_plan_b' ? plans.planB : plans.planA}
          onConfirmApproval={handleConfirmApproval}
        />
      )}

      {}
      <AuditTrailModal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        auditLog={auditLog}
      />

      {}
      <CustomScenarioModal
        isOpen={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        systemState={realSystemState}
        onUpdateState={(newState) => {
          setRealSystemState(newState);
          if (plans) {
            
            const parsed = parseUserIntent(currentIntent, newState);
            const genericRes = generateGenericComparisonPlans(newState, parsed.targetNodeId);
            setPlans({
              planA: genericRes.planA,
              planB: genericRes.planB,
              uncertainties: genericRes.uncertainties
            });
            setSimResults({
              simA: genericRes.simResultA,
              simB: genericRes.simResultB
            });
          }
        }}
      />

      {}
      <GeminiSettingsModal
        isOpen={showGeminiModal}
        onClose={() => setShowGeminiModal(false)}
      />
    </div>
  );
}
