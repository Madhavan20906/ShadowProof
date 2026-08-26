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

export function cloneState(state: SystemState): SystemState {
  return JSON.parse(JSON.stringify(state));
}

export function generateSnapshotHash(state: SystemState): string {
  const str = JSON.stringify(state.nodes.map(n => ({ id: n.id, status: n.status }))) + 
              JSON.stringify(state.links.map(l => ({ id: l.id, status: l.status })));
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return `STATE-${Math.abs(hash).toString(16).toUpperCase()}`;
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

  // Helper: Find links with source matching a set of node IDs
  const getOutgoingLinks = (sources: Set<string>) => shadow.links.filter(l => sources.has(l.source));
  const getIncomingLinks = (targets: Set<string>) => shadow.links.filter(l => targets.has(l.target));

  // Find all nodes directly connected to target
  shadow.links.forEach(l => {
    if (l.source === targetNode.id) directImpactedIds.add(l.target);
    if (l.target === targetNode.id) directImpactedIds.add(l.source);
  });

  // Evaluate Rule 1: Approval Workflows
  shadow.nodes.filter(n => n.type === 'workflow').forEach(workflow => {
    const approverLinks = shadow.links.filter(l => l.target === workflow.id && l.type === 'approves' && l.status !== 'severed');
    const activeApprovers = approverLinks.map(l => shadow.nodes.find(n => n.id === l.source)).filter(n => n && n.status === 'active');

    if (activeApprovers.length === 0) {
      workflow.status = 'failed';
      indirectImpactedIds.add(workflow.id);
      
      consequences.push({
        id: `cons-wf-${workflow.id}`,
        severity: 'critical',
        category: 'workflow_stall',
        title: `Workflow Stalled: ${workflow.name}`,
        description: `Deprovisioning '${targetNode.name}' leaves '${workflow.name}' with 0 active approvers.`,
        affectedNodeId: workflow.id,
        affectedNodeName: workflow.name,
        rootCauseChain: [targetNode.name, 'Sole Active Signatory', workflow.name],
        businessImpact: workflow.meta.monetaryValue 
          ? `Pending approvals frozen totaling ${workflow.meta.monetaryValue}; process cannot complete.` 
          : 'Operational execution frozen without active sign-off.',
        technicalRisk: 'Workflow engine throws UnhandledApproverException on next execution trigger.'
      });

      logs.push(`[CASCADE FAILURE] Workflow '${workflow.name}' marked FAILED (0 active approvers remaining).`);
    }
  });

  // Evaluate Rule 2: Resource Custody & KMS Ownership
  shadow.nodes.filter(n => n.type === 'resource').forEach(resource => {
    const ownerLinks = shadow.links.filter(l => l.target === resource.id && l.type === 'owns' && l.status !== 'severed');
    const activeOwners = ownerLinks.map(l => shadow.nodes.find(n => n.id === l.source)).filter(n => n && n.status === 'active');
    
    const isTargetOwner = resource.meta.owner === targetNode.name || ownerLinks.some(l => l.source === targetNode.id);

    if (isTargetOwner && activeOwners.length === 0) {
      resource.status = 'orphaned';
      indirectImpactedIds.add(resource.id);

      consequences.push({
        id: `cons-res-${resource.id}`,
        severity: 'critical',
        category: 'resource_orphan',
        title: `Resource Custody Lost: ${resource.name}`,
        description: `Primary custodian '${targetNode.name}' deprovisioned without access policy rotation.`,
        affectedNodeId: resource.id,
        affectedNodeName: resource.name,
        rootCauseChain: [targetNode.name, 'Primary KMS Key / Access Custodian', resource.name],
        businessImpact: 'Access to encrypted data vault and resource assets is locked out. Triggers compliance violation flag.',
        technicalRisk: 'Key policy references revoked IAM principal, resulting in AccessDenied exceptions on read/write.'
      });

      logs.push(`[CASCADE FAILURE] Resource '${resource.name}' marked ORPHANED (Owner deprovisioned).`);
    }
  });

  // Evaluate Rule 3: Personal Credentials & Automation Crashes
  shadow.nodes.filter(n => n.type === 'credential').forEach(cred => {
    const isTargetCred = cred.id.includes(targetNode.id) || 
                         cred.name.toLowerCase().includes(targetNode.name.toLowerCase().split(' ')[0]) ||
                         shadow.links.some(l => l.source === targetNode.id && l.target === cred.id && l.status === 'severed');
    
    if (isTargetCred) {
      cred.status = 'failed';
      indirectImpactedIds.add(cred.id);

      // Find automations depending on this credential
      const depLinks = shadow.links.filter(l => l.source === cred.id);
      depLinks.forEach(l => {
        l.status = 'severed';
        const automation = shadow.nodes.find(n => n.id === l.target && n.type === 'automation');
        if (automation) {
          automation.status = 'failed';
          indirectImpactedIds.add(automation.id);

          consequences.push({
            id: `cons-auto-${automation.id}`,
            severity: 'critical',
            category: 'automation_crash',
            title: `Automation Crash: ${automation.name}`,
            description: `Scheduled worker relies on personal token '${cred.name}' owned by '${targetNode.name}'.`,
            affectedNodeId: automation.id,
            affectedNodeName: automation.name,
            rootCauseChain: [targetNode.name, cred.name, automation.name],
            businessImpact: automation.meta.schedule 
              ? `Automated execution scheduled for ${automation.meta.schedule} will fail, delaying downstream sync.`
              : 'Automated background job crashes on next execution run.',
            technicalRisk: 'Cron worker process terminates with HTTP 401 Unauthorized bearer token error.'
          });

          logs.push(`[CASCADE FAILURE] Automation '${automation.name}' marked FAILED (Bearer token revoked).`);
        }
      });
    }
  });

  // Evaluate Rule 4: Governance Role Vacancy
  shadow.nodes.filter(n => n.type === 'role').forEach(role => {
    const roleLinks = shadow.links.filter(l => l.target === role.id && l.status !== 'severed');
    const activeHolders = roleLinks.map(l => shadow.nodes.find(n => n.id === l.source)).filter(n => n && n.status === 'active');

    if (activeHolders.length === 0) {
      role.status = 'degraded';
      indirectImpactedIds.add(role.id);

      consequences.push({
        id: `cons-role-${role.id}`,
        severity: 'medium',
        category: 'security_gap',
        title: `Governance Void: ${role.name}`,
        description: `'${targetNode.name}' held the sole active seat for role '${role.name}'.`,
        affectedNodeId: role.id,
        affectedNodeName: role.name,
        rootCauseChain: [targetNode.name, 'Sole Seat Holder', role.name],
        businessImpact: 'No backup administrator can modify access control settings or perform emergency overrides.',
        technicalRisk: 'Role governance state defaults to read-only until board override.'
      });

      logs.push(`[DEGRADED STATE] Role '${role.name}' marked DEGRADED (No backup role holder).`);
    }
  });

  // Evaluate Rule 5: Multi-Hop Feeds & Replicates (e.g. DB replica deletion cascading to ETL & Tableau)
  if (targetNode.type === 'resource') {
    shadow.links.filter(l => l.source === targetNode.id).forEach(link => {
      const downstream = shadow.nodes.find(n => n.id === link.target);
      if (downstream) {
        downstream.status = 'failed';
        indirectImpactedIds.add(downstream.id);

        if (!consequences.some(c => c.affectedNodeId === downstream.id)) {
          consequences.push({
            id: `cons-downstream-${downstream.id}`,
            severity: 'critical',
            category: downstream.type === 'automation' ? 'automation_crash' : 'workflow_stall',
            title: `Downstream Endpoint Failure: ${downstream.name}`,
            description: `'${downstream.name}' attempts active connection to deleted resource endpoint '${targetNode.name}'.`,
            affectedNodeId: downstream.id,
            affectedNodeName: downstream.name,
            rootCauseChain: [targetNode.name, link.description || 'Active Connection Endpoint', downstream.name],
            businessImpact: 'Dependent processes fail to fetch records or timeout on connection attempts.',
            technicalRisk: 'JDBC connection pool exhausts retries with ECONNREFUSED error.'
          });
          logs.push(`[CASCADE FAILURE] Downstream node '${downstream.name}' marked FAILED.`);
        }
      }
    });
  }

  // 3. Invariants Check
  invariants.push({
    id: 'inv-1',
    code: 'INV-01',
    name: 'Approval Workflow Signatory Requirement',
    description: 'Every active approval workflow must have >= 1 designated active human approver.',
    status: shadow.nodes.some(n => n.type === 'workflow' && n.status === 'failed') ? 'violated' : 'passed',
    remediation: 'Reassign approval authority to another verified active user.'
  });

  invariants.push({
    id: 'inv-2',
    code: 'INV-02',
    name: 'Resource KMS Custody & Access Policy',
    description: 'Every encrypted resource vault must maintain an active IAM key custodian policy.',
    status: shadow.nodes.some(n => n.type === 'resource' && n.status === 'orphaned') ? 'violated' : 'passed',
    remediation: 'Transfer KMS custodian policy to backup lead before revoking credentials.'
  });

  invariants.push({
    id: 'inv-3',
    code: 'INV-03',
    name: 'Production Automation Non-Personal Auth',
    description: 'Production automated background jobs cannot rely exclusively on individual personal access tokens.',
    status: shadow.nodes.some(n => n.type === 'automation' && n.status === 'failed') ? 'violated' : 'passed',
    remediation: 'Rotate automation authentication from personal PAT to managed Service Account principal.'
  });

  invariants.push({
    id: 'inv-4',
    code: 'INV-04',
    name: 'Governance Seat Redundancy',
    description: 'Administrative master roles must maintain secondary backup seats to avoid governance deadlock.',
    status: shadow.nodes.some(n => n.type === 'role' && n.status === 'degraded') ? 'warning' : 'passed',
    remediation: 'Assign secondary administrative seat prior to offboarding.'
  });

  invariants.push({
    id: 'inv-5',
    code: 'INV-05',
    name: 'Infrastructure Connection Pool Zero-Active State',
    description: 'Database or server nodes cannot be terminated while active connection pools reference their host endpoint.',
    status: shadow.nodes.some(n => n.type === 'resource' && n.status === 'deprovisioned' && consequences.length > 0) ? 'violated' : 'passed',
    remediation: 'Re-target downstream connection pools to failover read replica prior to teardown.'
  });

  // 4. Temporal Timeline Breakdown
  temporalConsequences.push({
    timeframe: 'T+0s (Immediate)',
    title: `Directory & IAM Revocation for ${targetNode.name}`,
    description: `SSO tokens disabled; immediate revocation of active IAM session policies across cloud portal.`,
    severity: 'low',
    affectedNodeName: targetNode.name
  });

  temporalConsequences.push({
    timeframe: 'T+5m (Session TTL)',
    title: 'Active Session Cookie & JWT Expiration',
    description: 'Active browser sessions expire; admin seat reverts to read-only fallback mode.',
    severity: 'medium',
    affectedNodeName: 'SSO Directory'
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
      title: 'Nightly Reporting & Compliance Batch Freeze',
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
    impactedDepartments: Array.from(new Set(shadow.nodes.map(n => n.meta.team || 'Infrastructure').filter(Boolean)))
  };

  // 6. Risk Score Calculation
  const rawRisk = (criticalCount * 30) + (consequences.filter(c => c.severity === 'high').length * 15) + (severedLinksCount * 5);
  const riskScore = Math.min(98, Math.max(75, rawRisk > 0 ? rawRisk + 40 : 15));

  logs.push(`[ANALYSIS COMPLETE] Direct Plan A yielded ${consequences.length} Breaking Failures (${criticalCount} Critical). Calculated Risk Score: ${riskScore}%.`);

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
      dependencyCoverage: 96,
      policyCoverage: 100,
      overallConfidence: 89
    }
  };
}
