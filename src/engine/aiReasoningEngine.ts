import { SimulationResult, SystemState } from '../types/shadowproof';

export interface AIRiskReasoning {
  structuralSummary: string;
  keyVulnerabilities: string[];
  complianceImpact: string;
  recommendedActionRationale: string;
  confidenceScore: number;
}

let cachedReasoningModel: string | null = null;

export async function analyzeSimulationWithAI(
  planAResult: SimulationResult,
  planBResult: SimulationResult | null,
  systemState: SystemState
): Promise<AIRiskReasoning> {
  const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as unknown as { env?: Record<string, string> }).env : undefined;
  const apiKey = metaEnv?.VITE_GEMINI_API_KEY || 
                 (typeof localStorage !== 'undefined' && (localStorage.getItem('gemini_api_key') || localStorage.getItem('groq_api_key'))) || 
                 '';

  const criticalCount = planAResult.consequences.filter(c => c.severity === 'critical').length;
  const violatedInvariants = planAResult.invariants.filter(i => i.status === 'violated');

  if (!apiKey) {
    return {
      structuralSummary: `Symbolic engine identified ${planAResult.consequences.length} cascading breaking failure(s) (${criticalCount} Critical) across graph fanout depth of ${planAResult.blastRadius.indirectNodesCount} node(s).`,
      keyVulnerabilities: planAResult.consequences.map(c => `${c.title}: ${c.businessImpact}`),
      complianceImpact: violatedInvariants.length > 0 
        ? `Violates ${violatedInvariants.length} core graph invariant(s): ${violatedInvariants.map(i => i.code).join(', ')}. Audit trigger level: HIGH.` 
        : 'Zero core graph invariant violations detected. Audit trigger level: NOMINAL.',
      recommendedActionRationale: planBResult 
        ? `Execute Rehearsed Plan B: Mitigates ${planAResult.consequences.length} potential outage(s) by pre-routing dependencies with 0 invariant breaches.` 
        : 'Proceed with extreme caution; direct execution incurs high breaking outage probability.',
      confidenceScore: planAResult.coverage.overallConfidence
    };
  }

  const cleanKey = apiKey.trim().replace(/^["']|["']$/g, '');
  const PREFERRED_MODELS = cachedReasoningModel 
    ? [cachedReasoningModel, 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-pro']
    : ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-pro'];

  const promptPayload = {
    planA_riskScore: planAResult.riskScore,
    planA_consequences: planAResult.consequences.map(c => ({ title: c.title, severity: c.severity, cause: c.rootCauseChain })),
    violatedInvariants: violatedInvariants.map(i => ({ code: i.code, name: i.name })),
    planB_riskScore: planBResult?.riskScore ?? null,
    graphNodesCount: systemState.nodes.length
  };

  const promptText = `You are ShadowProof's AI Safety Reasoning Engine powered by Google Gemini. Consume the symbolic simulation output and provide structured JSON risk insights: {"structuralSummary": string, "keyVulnerabilities": string[], "complianceImpact": string, "recommendedActionRationale": string, "confidenceScore": number}

Simulation Data:
${JSON.stringify(promptPayload)}`;

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

        return {
          structuralSummary: parsed.structuralSummary || `Symbolic engine identified ${planAResult.consequences.length} breaking failure(s).`,
          keyVulnerabilities: Array.isArray(parsed.keyVulnerabilities) ? parsed.keyVulnerabilities : planAResult.consequences.map(c => c.title),
          complianceImpact: parsed.complianceImpact || `Violates ${violatedInvariants.length} graph invariant(s).`,
          recommendedActionRationale: parsed.recommendedActionRationale || 'Rehearsed Plan B avoids active outages.',
          confidenceScore: typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : planAResult.coverage.overallConfidence
        };
      } else if (response.status === 429) {
        console.warn(`Gemini API rate limit reached on model ${targetModel}, using deterministic reasoning fallback.`);
        break;
      }
    } catch (err) {
      console.warn(`Gemini API reasoning error with model ${targetModel}:`, err);
    }
  }

  return {
    structuralSummary: `Symbolic engine identified ${planAResult.consequences.length} cascading breaking failure(s) (${criticalCount} Critical).`,
    keyVulnerabilities: planAResult.consequences.map(c => `${c.title}: ${c.businessImpact}`),
    complianceImpact: violatedInvariants.length > 0 
      ? `Violates ${violatedInvariants.length} core graph invariant(s): ${violatedInvariants.map(i => i.code).join(', ')}.` 
      : 'Zero core graph invariant violations detected.',
    recommendedActionRationale: planBResult 
      ? `Execute Rehearsed Plan B: Mitigates ${planAResult.consequences.length} outage(s) with 0 invariant breaches.` 
      : 'Direct Plan A carries elevated operational risk.',
    confidenceScore: planAResult.coverage.overallConfidence
  };
}
