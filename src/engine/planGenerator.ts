import { ActionPlan, SystemState, UncertaintyMetric } from '../types/shadowproof';
import { generateGenericComparisonPlans } from './genericPlanner';

export function generateComparisonPlans(
  initialState: SystemState,
  presetId: string = 'alex-finance-offboard'
): {
  planA: ActionPlan;
  planB: ActionPlan;
  uncertainties: UncertaintyMetric[];
} {
  let targetNodeId = 'user-alex';
  if (presetId === 'jordan-devops-revoke') targetNodeId = 'user-jordan';
  if (presetId === 'db-cluster-delete') targetNodeId = 'resource-db-replica-2';

  // Delegate to generic planner
  const { planA, planB, uncertainties } = generateGenericComparisonPlans(initialState, targetNodeId);

  return { planA, planB, uncertainties };
}
