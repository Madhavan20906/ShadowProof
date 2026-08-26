import { SystemState, Consequence, ActionStep } from '../types/shadowproof';
import { cloneState, simulatePlanAGeneric } from './genericSimulationEngine';
import { generateGenericComparisonPlans } from './genericPlanner';

export { cloneState };

function getTargetNodeIdFromState(initialState: SystemState, presetId: string): string {
  const match = initialState.nodes.find(n => 
    n.id === presetId || 
    n.id.toLowerCase().includes(presetId.toLowerCase()) || 
    n.name.toLowerCase().includes(presetId.toLowerCase())
  );
  if (match) return match.id;

  // Generic fallback based on node types in system state
  const defaultTarget = initialState.nodes.find(n => n.type === 'user' || n.type === 'resource') || initialState.nodes[0];
  return defaultTarget ? defaultTarget.id : 'user-alex';
}

export function simulateDirectPlanA(
  initialState: SystemState, 
  presetId: string = 'alex-finance-offboard'
): {
  shadowState: SystemState;
  consequences: Consequence[];
  riskScore: number;
  logs: string[];
} {
  const targetNodeId = getTargetNodeIdFromState(initialState, presetId);
  const sim = simulatePlanAGeneric(initialState, targetNodeId);

  return {
    shadowState: sim.shadowState,
    consequences: sim.consequences,
    riskScore: sim.riskScore,
    logs: sim.logs
  };
}

export function simulateSaferPlanB(
  initialState: SystemState,
  presetId: string = 'alex-finance-offboard'
): {
  shadowState: SystemState;
  consequences: Consequence[];
  riskScore: number;
  logs: string[];
  actionSteps: ActionStep[];
} {
  const targetNodeId = getTargetNodeIdFromState(initialState, presetId);
  const { planB, simResultB } = generateGenericComparisonPlans(initialState, targetNodeId);

  return {
    shadowState: simResultB.shadowState,
    consequences: simResultB.consequences,
    riskScore: simResultB.riskScore,
    logs: planB.simulatedLogs,
    actionSteps: planB.steps
  };
}

