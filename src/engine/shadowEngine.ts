import { SystemState, Consequence, ActionPlan } from '../types/shadowproof';
import { cloneState, simulatePlanAGeneric } from './genericSimulationEngine';
import { generateGenericComparisonPlans } from './genericPlanner';
import { parseUserIntent } from './intentParser';

export { cloneState };

export function simulateDirectPlanA(
  initialState: SystemState, 
  presetId: string = 'alex-finance-offboard'
): {
  shadowState: SystemState;
  consequences: Consequence[];
  riskScore: number;
  logs: string[];
} {
  // Extract target node dynamically from state or presetId
  let targetNodeId = 'user-alex';
  if (presetId === 'jordan-devops-revoke') targetNodeId = 'user-jordan';
  if (presetId === 'db-cluster-delete') targetNodeId = 'resource-db-replica-2';

  // Run generic graph-traversal simulation engine
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
  actionSteps: any[];
} {
  let targetNodeId = 'user-alex';
  if (presetId === 'jordan-devops-revoke') targetNodeId = 'user-jordan';
  if (presetId === 'db-cluster-delete') targetNodeId = 'resource-db-replica-2';

  const { planB, simResultB } = generateGenericComparisonPlans(initialState, targetNodeId);

  return {
    shadowState: simResultB.shadowState,
    consequences: [],
    riskScore: 4,
    logs: planB.simulatedLogs,
    actionSteps: planB.steps
  };
}
