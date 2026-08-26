import { ActionPlan, SimulationResult } from '../types/shadowproof';

export async function generateAICounterfactualExplanation(
  targetName: string,
  simA: SimulationResult,
  simB: SimulationResult
): Promise<string> {
  const apiKey = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GROQ_API_KEY) || 
                 (typeof localStorage !== 'undefined' && localStorage.getItem('groq_api_key')) || 
                 '';

  const criticalCountA = simA.consequences.filter(c => c.severity === 'critical').length;

  if (!apiKey) {
    return `Counterfactual Safety Analysis: Direct execution (Plan A) triggers ${criticalCountA} critical failure(s) across approval workflows, key custody, and background cron jobs. ShadowProof Plan B pre-emptively re-routes dependency links to designated backup leads and service accounts, reducing total risk score from ${simA.riskScore}% down to ${simB.riskScore}% (SAFE).`;
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are ShadowProof's Risk Reasoning Engine. Summarize counterfactual analysis in 2 concise, highly professional sentences contrasting Direct Plan A vs Rehearsed Plan B for target entity '${targetName}'.`
          },
          {
            role: 'user',
            content: `Plan A Risk Score: ${simA.riskScore}%, Failures: ${JSON.stringify(simA.consequences.map(c => c.title))}. Plan B Risk Score: ${simB.riskScore}%, Consequences: 0.`
          }
        ],
        temperature: 0.2,
        max_tokens: 150
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API returned ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (err) {
    console.warn('Groq AI reasoning explanation failed, fallback to deterministic summary:', err);
    return `Counterfactual Safety Analysis: Direct execution (Plan A) triggers ${criticalCountA} critical failure(s) across approval workflows, key custody, and background cron jobs. ShadowProof Plan B pre-emptively re-routes dependency links to designated backup leads and service accounts, reducing total risk score from ${simA.riskScore}% down to ${simB.riskScore}% (SAFE).`;
  }
}
