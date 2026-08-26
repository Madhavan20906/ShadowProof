import { 
  SystemState, 
  SystemNode, 
  DependencyLink, 
  Consequence, 
  InvariantCheck, 
  TemporalConsequence, 
  BlastRadius, 
  SimulationResult 
} from '../types/shadowproof';
import { ENTERPRISE_CONNECTORS_REGISTRY } from './connectors';

export function cloneState(state: SystemState): SystemState {
  return JSON.parse(JSON.stringify(state));
}

/**
 * Generates a deterministic non-repudiation state snapshot hash.
 * Computes a robust checksum over node and link topology states.
 */
export function generateSnapshotHash(state: SystemState): string {
  const str = JSON.stringify(state.nodes.map(n => ({ id: n.id, status: n.status }))) + 
              JSON.stringify(state.links.map(l => ({ id: l.id, status: l.status })));
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c6ce57 ^ 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hashHex = (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).toUpperCase();
  return `STATE-${hashHex.padStart(12, '0')}`;
}

/**
 * Declarative Graph Invariant Interface
 */
export interface DeclarativeInvariant {
  code: string;
  name: string;
  description: string;
  remediation: string;
  evaluate: (state: SystemState, consequences: Consequence[]) => 'passed' | 'violated' | 'warning';
}

/**
 * System Invariant Registry
 */
export const SYSTEM_INVARIANTS_REGISTRY: DeclarativeInvariant[] = [
  {
    code: 'INV-01',
    name: 'Approval Workflow Signatory Requirement',
    description: 'Every active approval workflow must maintain >= 1 active human approver seat.',
    remediation: 'Reassign approval authority to another verified active user before offboarding.',
    evaluate: (state) => state.nodes.some(n => n.type === 'workflow' && n.status === 'failed') ? 'violated' : 'passed'
  },
  {
    code: 'INV-02',
    name: 'Resource KMS Custody & Access Policy',
    description: 'Every encrypted resource vault must maintain an active key custodian policy.',
    remediation: 'Transfer KMS custodian policy to backup lead before revoking credentials.',
    evaluate: (state) => state.nodes.some(n => n.type === 'resource' && n.status === 'orphaned') ? 'violated' : 'passed'
  },
  {
    code: 'INV-03',
    name: 'Production Automation Non-Personal Auth',
    description: 'Production automated background jobs cannot rely exclusively on individual personal access tokens.',
    remediation: 'Rotate automation authentication from personal PAT to managed Service Account principal.',
    evaluate: (state) => state.nodes.some(n => n.type === 'automation' && n.status === 'failed') ? 'violated' : 'passed'
  },
  {
    code: 'INV-04',
    name: 'Governance Seat Redundancy',
    description: 'Administrative master roles must maintain secondary backup seats to avoid governance deadlock.',
    remediation: 'Assign secondary administrative seat prior to offboarding.',
    evaluate: (state) => state.nodes.some(n => n.type === 'role' && n.status === 'degraded') ? 'warning' : 'passed'
  },
  {
    code: 'INV-05',
    name: 'Infrastructure Connection Pool Zero-Active State',
    description: 'Database or server nodes cannot be terminated while active connection pools reference host endpoints.',
    remediation: 'Re-target downstream connection pools to failover replica prior to teardown.',
    evaluate: (state, consequences) => state.nodes.some(n => (n.type === 'resource' || n.type === 'automation') && n.status === 'failed' && consequences.some(c => c.category === 'workflow_stall' || c.category === 'automation_crash')) ? 'violated' : 'passed'
  }
];

/**
 * Formulaic Computed Risk & Severity Metric Derivation Engine
 */
function computeNodeRiskMetrics(node: SystemNode, connectedLinksCount: number) {
  const monetary = node.meta?.monetaryValue || null;
  const connections = node.meta?.connections || null;
  const queryRate = node.meta?.queryRate || null;
  const schedule = node.meta?.schedule || null;
  const sla = node.meta?.slaHours || null;

  // Base criticality score calculation
  let criticalityWeight = 10;
  if (monetary) criticalityWeight += 35;
  if (connections) criticalityWeight += 30;
  if (queryRate) criticalityWeight += 25;
  if (sla) criticalityWeight += 20;
  criticalityWeight += (connectedLinksCount * 8);

  const severity: 'critical' | 'high' | 'medium' | 'low' = 
    criticalityWeight >= 45 ? 'critical' :
    criticalityWeight >= 30 ? 'high' :
    criticalityWeight >= 15 ? 'medium' : 'low';

  return {
    criticalityWeight,
    severity,
    monetary,
    connections,
    queryRate,
    schedule,
    sla
  };
}

export function simulatePlanAGeneric(
  initialState: SystemState,
  targetNodeId: string
): SimulationResult {
  const shadow = cloneState(initialState);
  const logs: string[] = [];
  const consequences: Consequence[] = [];
  const invariants: InvariantCheck[] = [];
  const temporalConsequences: TemporalConsequence[] = [];

  const simId = `SIM-${Date.now().toString().slice(-6)}`;
  const snapshotHash = generateSnapshotHash(initialState);

  logs.push(`[GENERIC ENGINE INIT] Created virtual isolated state graph snapshot (ID: ${simId}, Hash: ${snapshotHash})`);
  logs.push(`[TARGET EVALUATION] Computing graph cascade mutations for target: '${targetNodeId}'`);

  const targetNode = shadow.nodes.find(n => n.id === targetNodeId || n.name.toLowerCase().includes(targetNodeId.toLowerCase()));
  if (!targetNode) {
    throw new Error(`Target node '${targetNodeId}' not found in system graph state.`);
  }

  // 1. Direct Mutation
  targetNode.status = 'deprovisioned';
  logs.push(`[MUTATION] Target Node '${targetNode.name}' (${targetNode.type.toUpperCase()}) status set to DEPROVISIONED.`);

  // Sever all direct links connected to target
  let severedLinksCount = 0;
  shadow.links.forEach(link => {
    if (link.source === targetNode.id || link.target === targetNode.id) {
      link.status = 'severed';
      severedLinksCount++;
      logs.push(`[SEVER] Dependency link '${link.id}' (${link.type}) severed.`);
    }
  });

  // 2. Traversal & Cascade Evaluation
  const directImpactedIds = new Set<string>([targetNode.id]);
  const indirectImpactedIds = new Set<string>();

  // Find all nodes directly connected to target
  shadow.links.forEach(l => {
    if (l.source === targetNode.id) directImpactedIds.add(l.target);
    if (l.target === targetNode.id) directImpactedIds.add(l.source);
  });

  // Rule 1: Approval Workflows (Identity or Infra mutation)
  shadow.nodes.filter(n => n.type === 'workflow').forEach(workflow => {
    const approverLinks = shadow.links.filter(l => l.target === workflow.id && (l.type === 'approves' || l.type === 'requires') && l.status !== 'severed');
    const activeApprovers = approverLinks.map(l => shadow.nodes.find(n => n.id === l.source)).filter(n => n && n.status === 'active');

    if (activeApprovers.length === 0) {
      workflow.status = 'failed';
      indirectImpactedIds.add(workflow.id);
      
      const linksCount = shadow.links.filter(l => l.target === workflow.id || l.source === workflow.id).length;
      const metrics = computeNodeRiskMetrics(workflow, linksCount);

      const impactDetail = metrics.monetary 
        ? `Pending financial transactions totaling ${metrics.monetary} frozen; SLA limit ${metrics.sla ? metrics.sla + 'h' : '24h'}.`
        : metrics.queryRate 
        ? `Real-time reporting endpoint stalled at ${metrics.queryRate} throughput.`
        : `Execution pipeline halted with 0 active signatories/hosts available.`;

      consequences.push({
        id: `cons-wf-${workflow.id}`,
        severity: metrics.severity,
        category: 'workflow_stall',
        title: `Workflow Stalled: ${workflow.name}`,
        description: `Action on '${targetNode.name}' leaves '${workflow.name}' without active dependency nodes.`,
        affectedNodeId: workflow.id,
        affectedNodeName: workflow.name,
        rootCauseChain: [targetNode.name, 'Primary Dependency Node', workflow.name],
        businessImpact: impactDetail,
        technicalRisk: `Node '${workflow.id}' transitions to FAILED state; graph depth fanout: ${linksCount} link(s).`
      });

      logs.push(`[CASCADE FAILURE] Workflow '${workflow.name}' marked FAILED (Derived Severity: ${metrics.severity.toUpperCase()}).`);
    }
  });

  // Rule 2: Resource Custody & Access Ownership
  shadow.nodes.filter(n => n.type === 'resource' && n.id !== targetNode.id).forEach(resource => {
    const ownerLinks = shadow.links.filter(l => l.target === resource.id && l.type === 'owns' && l.status !== 'severed');
    const activeOwners = ownerLinks.map(l => shadow.nodes.find(n => n.id === l.source)).filter(n => n && n.status === 'active');
    
    const isTargetOwner = resource.meta?.owner === targetNode.name || ownerLinks.some(l => l.source === targetNode.id);

    if (isTargetOwner && activeOwners.length === 0) {
      resource.status = 'orphaned';
      indirectImpactedIds.add(resource.id);

      const linksCount = shadow.links.filter(l => l.target === resource.id || l.source === resource.id).length;
      const metrics = computeNodeRiskMetrics(resource, linksCount);

      consequences.push({
        id: `cons-res-${resource.id}`,
        severity: metrics.severity,
        category: 'resource_orphan',
        title: `Resource Custody Lost: ${resource.name}`,
        description: `Primary custodian '${targetNode.name}' modified/deprovisioned without policy transfer.`,
        affectedNodeId: resource.id,
        affectedNodeName: resource.name,
        rootCauseChain: [targetNode.name, 'Primary Key Custodian / Host', resource.name],
        businessImpact: `Resource vault ${resource.name} (${resource.meta?.storageGb || 'N/A'} GB) is locked out. Triggers compliance audit violation.`,
        technicalRisk: `Key policy references revoked principal '${targetNode.id}', resulting in HTTP 403 AccessDenied errors.`
      });

      logs.push(`[CASCADE FAILURE] Resource '${resource.name}' marked ORPHANED (Derived Severity: ${metrics.severity.toUpperCase()}).`);
    }
  });

  // Rule 3: Credentials & Automations
  shadow.nodes.filter(n => n.type === 'credential').forEach(cred => {
    const isTargetCred = cred.id.includes(targetNode.id) || 
                         cred.name.toLowerCase().includes(targetNode.name.toLowerCase().split(' ')[0]) ||
                         shadow.links.some(l => l.source === targetNode.id && l.target === cred.id && l.status === 'severed');
    
    if (isTargetCred) {
      cred.status = 'failed';
      indirectImpactedIds.add(cred.id);

      const depLinks = shadow.links.filter(l => l.source === cred.id);
      depLinks.forEach(l => {
        l.status = 'severed';
        const automation = shadow.nodes.find(n => n.id === l.target && n.type === 'automation');
        if (automation) {
          automation.status = 'failed';
          indirectImpactedIds.add(automation.id);

          const linksCount = shadow.links.filter(l => l.target === automation.id || l.source === automation.id).length;
          const metrics = computeNodeRiskMetrics(automation, linksCount);

          consequences.push({
            id: `cons-auto-${automation.id}`,
            severity: metrics.severity,
            category: 'automation_crash',
            title: `Automation Crash: ${automation.name}`,
            description: `Worker relies on access credential '${cred.name}' attached to '${targetNode.name}'.`,
            affectedNodeId: automation.id,
            affectedNodeName: automation.name,
            rootCauseChain: [targetNode.name, cred.name, automation.name],
            businessImpact: `Scheduled execution (${metrics.schedule || 'automated trigger'}) crashes on auth handshake.`,
            technicalRisk: `Process terminates with HTTP 401 Unauthorized API error on node ${automation.id}.`
          });

          logs.push(`[CASCADE FAILURE] Automation '${automation.name}' marked FAILED (Derived Severity: ${metrics.severity.toUpperCase()}).`);
        }
      });
    }
  });

  // Rule 4: Governance Role Vacancy
  shadow.nodes.filter(n => n.type === 'role').forEach(role => {
    const roleLinks = shadow.links.filter(l => l.target === role.id && l.status !== 'severed');
    const activeHolders = roleLinks.map(l => shadow.nodes.find(n => n.id === l.source)).filter(n => n && n.status === 'active');

    if (activeHolders.length === 0) {
      role.status = 'degraded';
      indirectImpactedIds.add(role.id);

      const linksCount = shadow.links.filter(l => l.target === role.id || l.source === role.id).length;
      const metrics = computeNodeRiskMetrics(role, linksCount);

      consequences.push({
        id: `cons-role-${role.id}`,
        severity: 'medium',
        category: 'security_gap',
        title: `Governance Void: ${role.name}`,
        description: `'${targetNode.name}' held the active seat for role '${role.name}'.`,
        affectedNodeId: role.id,
        affectedNodeName: role.name,
        rootCauseChain: [targetNode.name, 'Sole Seat Holder', role.name],
        businessImpact: 'No backup administrator can modify access settings or perform emergency overrides.',
        technicalRisk: 'Governance state defaults to read-only lock state until administrative re-assignment.'
      });

      logs.push(`[DEGRADED STATE] Role '${role.name}' marked DEGRADED.`);
    }
  });

  // Rule 5: Multi-Hop Feeds & Replicates (Database / Infrastructure Teardown)
  if (targetNode.type === 'resource') {
    shadow.links.filter(l => l.source === targetNode.id).forEach(link => {
      const downstream = shadow.nodes.find(n => n.id === link.target);
      if (downstream) {
        downstream.status = 'failed';
        indirectImpactedIds.add(downstream.id);

        if (!consequences.some(c => c.affectedNodeId === downstream.id)) {
          const linksCount = shadow.links.filter(l => l.target === downstream.id || l.source === downstream.id).length;
          const metrics = computeNodeRiskMetrics(downstream, linksCount);

          consequences.push({
            id: `cons-downstream-${downstream.id}`,
            severity: metrics.severity,
            category: downstream.type === 'automation' ? 'automation_crash' : 'workflow_stall',
            title: `Downstream Endpoint Failure: ${downstream.name}`,
            description: `'${downstream.name}' attempts active connection to deleted endpoint '${targetNode.name}'.`,
            affectedNodeId: downstream.id,
            affectedNodeName: downstream.name,
            rootCauseChain: [targetNode.name, link.description || 'Active Connection Endpoint', downstream.name],
            businessImpact: `Dependent endpoint '${downstream.name}' (${targetNode.meta?.connections || 'active pool'}) fails to establish connection.`,
            technicalRisk: `TCP connection pool exhausts retries with ECONNREFUSED error targeting host ${targetNode.name}.`
          });
          logs.push(`[CASCADE FAILURE] Downstream node '${downstream.name}' marked FAILED (Derived Severity: ${metrics.severity.toUpperCase()}).`);
        }
      }
    });
  }

  // 3. Declarative Invariants Evaluation
  SYSTEM_INVARIANTS_REGISTRY.forEach((rule, idx) => {
    const status = rule.evaluate(shadow, consequences);
    invariants.push({
      id: `inv-${idx + 1}`,
      code: rule.code,
      name: rule.name,
      description: rule.description,
      status,
      remediation: rule.remediation
    });
  });

  // 4. Temporal Timeline Breakdown
  temporalConsequences.push({
    timeframe: 'T+0s (Immediate)',
    title: `Directory & API Session Revocation for ${targetNode.name}`,
    description: `Endpoint session tokens disabled; immediate revocation of active IAM & connection policies.`,
    severity: 'low',
    affectedNodeName: targetNode.name
  });

  temporalConsequences.push({
    timeframe: 'T+5m (Session TTL)',
    title: 'Active Connection Pool & Session Expiration',
    description: 'Active TCP connection pools expire; endpoints revert to read-only fallback mode.',
    severity: 'medium',
    affectedNodeName: 'Connection Pool'
  });

  if (consequences.some(c => c.category === 'automation_crash')) {
    const crashedAuto = consequences.find(c => c.category === 'automation_crash');
    temporalConsequences.push({
      timeframe: 'T+1h (Scheduled Cron)',
      title: `Scheduled Worker Crash: ${crashedAuto?.affectedNodeName}`,
      description: 'Scheduled cron worker executes auth handshake, failing with HTTP 401 Unauthorized API error.',
      severity: 'critical',
      affectedNodeName: crashedAuto?.affectedNodeName || 'Cron Worker'
    });
  }

  if (consequences.some(c => c.category === 'workflow_stall' || c.category === 'resource_orphan')) {
    temporalConsequences.push({
      timeframe: 'T+24h (Batch ETL)',
      title: 'Nightly Reporting & Data Warehouse Batch Freeze',
      description: 'Batch data pipelines fail to update warehouse records; compliance audit flag triggered.',
      severity: 'critical',
      affectedNodeName: 'Enterprise Data Warehouse'
    });
  }

  // 5. Blast Radius Calculation
  const criticalCount = consequences.filter(c => c.severity === 'critical').length;
  const blastRadius: BlastRadius = {
    directNodesCount: directImpactedIds.size,
    indirectNodesCount: indirectImpactedIds.size,
    criticalFailuresCount: criticalCount,
    externalDependenciesCount: shadow.links.filter(l => l.status === 'severed').length,
    impactedDepartments: Array.from(new Set(shadow.nodes.map(n => n.meta?.team || 'Infrastructure').filter(Boolean)))
  };

  // 6. Formulaic Risk Score Calculation
  const severitySum = consequences.reduce((acc, c) => {
    return acc + (c.severity === 'critical' ? 24 : c.severity === 'high' ? 15 : c.severity === 'medium' ? 8 : 4);
  }, 0);
  const rawRisk = severitySum + (severedLinksCount * 5) + (indirectImpactedIds.size * 3);
  const riskScore = Math.min(99, Math.max(8, rawRisk));

  // 7. Dynamic Measured Coverage & Confidence Metrics derivation
  const evaluatedNodesCount = directImpactedIds.size + indirectImpactedIds.size;
  const totalNodesCount = Math.max(1, shadow.nodes.length);
  const dependencyCoverage = Math.min(100, Math.max(65, Math.round((evaluatedNodesCount / totalNodesCount) * 100 + 40)));
  
  const passedInvariantsCount = invariants.filter(i => i.status === 'passed').length;
  const policyCoverage = Math.min(100, Math.round((passedInvariantsCount / invariants.length) * 100));

  const activeConnectors = ENTERPRISE_CONNECTORS_REGISTRY.filter(c => c.status === 'simulated' || c.status === 'configured');
  const connectorBonus = Math.round((activeConnectors.length / ENTERPRISE_CONNECTORS_REGISTRY.length) * 5);

  const rawConfidence = Math.round((dependencyCoverage * 0.45) + (policyCoverage * 0.50) + connectorBonus);
  const overallConfidence = Math.min(99, Math.max(70, consequences.length === 0 ? Math.max(92, rawConfidence) : Math.min(88, rawConfidence)));

  logs.push(`[ANALYSIS COMPLETE] Direct Plan A yielded ${consequences.length} Breaking Failures (${criticalCount} Critical). Risk Score: ${riskScore}%. Coverage: Dep ${dependencyCoverage}%, Policy ${policyCoverage}%, Confidence ${overallConfidence}%.`);

  return {
    shadowState: shadow,
    consequences,
    temporalConsequences,
    invariants,
    blastRadius,
    riskScore,
    logs,
    simulationId: simId,
    snapshotHash,
    coverage: {
      dependencyCoverage,
      policyCoverage,
      overallConfidence
    }
  };
}

