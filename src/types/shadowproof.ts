export type NodeType = 
  | 'user' 
  | 'team' 
  | 'workflow' 
  | 'resource' 
  | 'automation' 
  | 'credential' 
  | 'role';

export type NodeStatus = 'active' | 'degraded' | 'failed' | 'orphaned' | 'deprovisioned' | 'reassigned';

export type LinkType = 
  | 'owns' 
  | 'approves' 
  | 'authenticates_with' 
  | 'belongs_to' 
  | 'triggers' 
  | 'requires';

export type LinkStatus = 'healthy' | 'severed' | 'rerouted';

export interface SystemNode {
  id: string;
  name: string;
  type: NodeType;
  description: string;
  status: NodeStatus;
  meta: {
    email?: string;
    roleName?: string;
    team?: string;
    monetaryValue?: string;
    schedule?: string;
    sigCount?: number;
    kmsKeyId?: string;
    lastActive?: string;
    [key: string]: string | number | boolean | string[] | undefined;
  };
  x?: number;
  y?: number;
}

export interface DependencyLink {
  id: string;
  source: string; 
  target: string; 
  type: LinkType;
  description: string;
  status: LinkStatus;
}

export interface SystemState {
  nodes: SystemNode[];
  links: DependencyLink[];
  updatedAt: string;
  name: string;
}

export type ConsequenceCategory = 
  | 'workflow_stall' 
  | 'resource_orphan' 
  | 'automation_crash' 
  | 'security_gap';

export interface Consequence {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: ConsequenceCategory;
  title: string;
  description: string;
  affectedNodeId: string;
  affectedNodeName: string;
  rootCauseChain: string[]; 
  businessImpact: string;
  technicalRisk: string;
}

export interface ActionStep {
  id: string;
  title: string;
  type: 'deprovision' | 'reassign_approver' | 'transfer_ownership' | 'rotate_credential' | 'update_permission';
  targetId: string;
  targetName: string;
  details: string;
  status: 'pending' | 'simulating' | 'simulated' | 'executing' | 'completed';
}

export interface ActionPlan {
  id: string;
  name: string;
  type: 'direct_plan_a' | 'shadowproof_plan_b';
  summary: string;
  steps: ActionStep[];
  riskScore: number; 
  brokenWorkflowsCount: number;
  orphanedResourcesCount: number;
  crashedAutomationsCount: number;
  consequences: Consequence[];
  simulatedLogs: string[];
  executionTimeMs: number;
}

export interface UncertaintyMetric {
  aspect: string;
  confidenceScore: number; 
  reasoning: string;
  untestedVariables: string[];
  knownFacts?: string[];
  inferredConclusions?: string[];
  unknownVariables?: string[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userIntent: string;
  planA: ActionPlan;
  planB: ActionPlan;
  selectedPlanId: 'direct_plan_a' | 'shadowproof_plan_b';
  approvedBy: string;
  approvalTimestamp: string;
  executionLogs: string[];
  verificationChecklist: {
    id: string;
    label: string;
    status: 'passed' | 'failed' | 'pending';
    detail: string;
  }[];
  diffSummary: {
    nodesAdded: number;
    nodesRemoved: number;
    nodesModified: number;
    linksRerouted: number;
  };
}

export interface InvariantCheck {
  id: string;
  code: string;
  name: string;
  description: string;
  status: 'passed' | 'violated' | 'warning';
  violatingNodeId?: string;
  violatingNodeName?: string;
  remediation?: string;
}

export interface TemporalConsequence {
  timeframe: 'T+0s (Immediate)' | 'T+5m (Session TTL)' | 'T+1h (Scheduled Cron)' | 'T+24h (Batch ETL)';
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  affectedNodeName: string;
}

export interface BlastRadius {
  directNodesCount: number;
  indirectNodesCount: number;
  criticalFailuresCount: number;
  externalDependenciesCount: number;
  impactedDepartments: string[];
}

export interface ParsedIntent {
  action: 'deprovision' | 'delete' | 'revoke';
  targetNodeId: string;
  targetNodeName: string;
  targetNodeType: NodeType;
  constraints: string[];
  rawIntent: string;
  aiExplanation?: string;
  parsedByLLM?: boolean;
}

export interface SimulationResult {
  shadowState: SystemState;
  consequences: Consequence[];
  temporalConsequences: TemporalConsequence[];
  invariants: InvariantCheck[];
  blastRadius: BlastRadius;
  riskScore: number;
  logs: string[];
  simulationId: string;
  snapshotHash: string;
  coverage: {
    dependencyCoverage: number;
    policyCoverage: number;
    overallConfidence: number;
  };
}

export interface PresetScenario {
  id: string;
  title: string;
  prompt: string;
  description: string;
  targetUser: string;
  iconName: string;
  accentColor: string;
}
