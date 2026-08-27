import { SimulationResult, SystemState } from '../types/shadowproof';

export interface PlanBStepAI {
  op: string;
  targetNodeId: string;
  rationale: string;
}

export interface AIRiskReasoning {
  targetNodeId?: string;
  action?: 'deprovision' | 'delete' | 'revoke';
  constraints?: string[];
  structuralSummary: string;
  keyVulnerabilities: string[];
  complianceImpact: string;
  planB_steps?: PlanBStepAI[];
  recommendedActionRationale: string;
  confidenceScore: number;
  parsedByLLM?: boolean;
}

let cachedReasoningModel: string | null = null;

export async function analyzeSimulationWithAI(
  arg1: string | SimulationResult,
  arg2: SystemState | SimulationResult | null,
  arg3: SimulationResult | SystemState,
  arg4?: SimulationResult | null | string
): Promise<AIRiskReasoning> {
  let intentText: string = '';
  let systemState: SystemState;
  let planAResult: SimulationResult;
  let planBResult: SimulationResult | null = null;

  if (typeof arg1 === 'string') {
    intentText = arg1;
    systemState = arg2 as SystemState;
    planAResult = arg3 as SimulationResult;
    planBResult = (arg4 as SimulationResult) || null;
  } else {
    planAResult = arg1 as SimulationResult;
    planBResult = arg2 as SimulationResult | null;
    systemState = arg3 as SystemState;
    intentText = typeof arg4 === 'string' ? arg4 : 'Deprovision target user and access credentials';
  }

  const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as unknown as { env?: Record<string, string> }).env : undefined;
  const apiKey = metaEnv?.VITE_GEMINI_API_KEY || 
                 (typeof localStorage !== 'undefined' && (localStorage.getItem('gemini_api_key') || localStorage.getItem('groq_api_key'))) || 
                 '';

  const criticalCount = planAResult.consequences.filter(c => c.severity === 'critical').length;
  const violatedInvariants = planAResult.invariants.filter(i => i.status === 'violated');
  const targetNode = systemState.nodes.find(n => intentText.toLowerCase().includes(n.name.toLowerCase()) || intentText.toLowerCase().includes(n.id.toLowerCase())) || systemState.nodes[0];

  const fallbackResult: AIRiskReasoning = {
    targetNodeId: targetNode?.id || '',
    action: intentText.toLowerCase().includes('delete') ? 'delete' : intentText.toLowerCase().includes('revoke') ? 'revoke' : 'deprovision',
    constraints: ['Preserve continuous execution of automated background jobs and key custody.'],
    structuralSummary: `Symbolic engine identified ${planAResult.consequences.length} cascading breaking failure(s) (${criticalCount} Critical) across graph fanout depth of ${planAResult.blastRadius.indirectNodesCount} node(s).`,
    keyVulnerabilities: planAResult.consequences.map(c => `${c.title}: ${c.businessImpact}`),
    complianceImpact: violatedInvariants.length > 0 
      ? `Violates ${violatedInvariants.length} core graph invariant(s): ${violatedInvariants.map(i => i.code).join(', ')}. Audit trigger level: HIGH.` 
      : 'Zero core graph invariant violations detected. Audit trigger level: NOMINAL.',
    planB_steps: planBResult ? planBResult.shadowState.nodes
      .filter(n => n.status === 'reassigned' || n.status === 'active')
      .slice(0, 3)
      .map(n => ({
        op: 'reroute_dependency',
        targetNodeId: n.id,
        rationale: `Re-routed dependency around target ${targetNode?.name || 'node'} to preserve graph invariants.`
      })) : [],
    recommendedActionRationale: planBResult 
      ? `Execute Rehearsed Plan B: Mitigates ${planAResult.consequences.length} potential outage(s) by pre-routing dependencies with 0 invariant breaches.` 
      : 'Proceed with extreme caution; direct execution incurs high breaking outage probability.',
    confidenceScore: planAResult.coverage.overallConfidence,
    parsedByLLM: false
  };

  if (!apiKey) {
    return fallbackResult;
  }

  const cleanKey = apiKey.trim().replace(/^["']|["']$/g, '');
  const PREFERRED_MODELS = cachedReasoningModel 
    ? [cachedReasoningModel, 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-pro']
    : ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-pro'];

  const promptText = `You are ShadowProof's Safety Reasoning Engine. You are given an operational intent, the current system topology graph, and the result of a deterministic blast-radius simulation for the direct (Plan A) execution path.

INTENT: "${intentText}"

SYSTEM GRAPH:
${JSON.stringify(systemState.nodes)}

PLAN A SIMULATION RESULT (direct execution):
${JSON.stringify(planAResult)}

VIOLATED INVARIANTS:
${JSON.stringify(violatedInvariants)}

Your job has three parts:

1. PARSE: Identify the target node, action type ("deprovision"|"delete"|"revoke"), and any implicit safety constraints in the intent text (e.g. "without disrupting payroll" → preserve automation principals).

2. REASON: Given the blast radius and violated invariants, explain in plain language what will actually break, why, and how severe it is — as if briefing a human approver who has 30 seconds to decide.

3. PROPOSE: Generate a concrete Plan B — a non-destructive alternative sequence of graph operations (e.g. custody transfer, staged revocation, dependency rerouting) that achieves the same underlying goal as the intent while resolving the violated invariants. Do not just describe the goal — output the actual ordered steps against real node IDs from the graph.

Return ONLY valid JSON matching this schema:
{
  "targetNodeId": string,
  "action": "deprovision"|"delete"|"revoke",
  "constraints": string[],
  "structuralSummary": string,
  "keyVulnerabilities": string[],
  "complianceImpact": string,
  "planB_steps": [{"op": string, "targetNodeId": string, "rationale": string}],
  "recommendedActionRationale": string,
  "confidenceScore": number
}`;

  for (const targetModel of PREFERRED_MODELS) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${cleanKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: promptText }]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json'
          }
        })
      });

      if (response.ok) {
        cachedReasoningModel = targetModel;
        const data = await response.json();
        const contentStr = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        const jsonMatch = contentStr.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : contentStr);

        let parsedTargetId = parsed.targetNodeId || targetNode?.id || systemState.nodes[0]?.id || '';
        if (!systemState.nodes.some(n => n.id === parsedTargetId)) {
          const matched = systemState.nodes.find(n => n.name.toLowerCase().includes(parsedTargetId.toLowerCase()));
          if (matched) parsedTargetId = matched.id;
        }

        let parsedAction: 'deprovision' | 'delete' | 'revoke' = 'deprovision';
        if (parsed.action === 'delete' || parsed.action === 'revoke') {
          parsedAction = parsed.action;
        }

        const rawScore = typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : planAResult.coverage.overallConfidence;
        const confidenceScore = rawScore > 1 ? rawScore / 100 : rawScore;

        return {
          targetNodeId: parsedTargetId,
          action: parsedAction,
          constraints: Array.isArray(parsed.constraints) ? parsed.constraints : fallbackResult.constraints,
          structuralSummary: parsed.structuralSummary || fallbackResult.structuralSummary,
          keyVulnerabilities: Array.isArray(parsed.keyVulnerabilities) ? parsed.keyVulnerabilities : fallbackResult.keyVulnerabilities,
          complianceImpact: parsed.complianceImpact || fallbackResult.complianceImpact,
          planB_steps: Array.isArray(parsed.planB_steps) ? parsed.planB_steps : fallbackResult.planB_steps,
          recommendedActionRationale: parsed.recommendedActionRationale || fallbackResult.recommendedActionRationale,
          confidenceScore,
          parsedByLLM: true
        };
      } else if (response.status === 429) {
        console.warn(`Gemini API rate limit reached on model ${targetModel}, using deterministic reasoning fallback.`);
        break;
      }
    } catch (err) {
      console.warn(`Gemini API reasoning error with model ${targetModel}:`, err);
    }
  }

  return fallbackResult;
}
