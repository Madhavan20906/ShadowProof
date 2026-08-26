import { SystemState, ParsedIntent, SystemNode } from '../types/shadowproof';

export function parseUserIntent(intentText: string, systemState: SystemState): ParsedIntent {
  const text = intentText.toLowerCase();

  let action: 'deprovision' | 'delete' | 'revoke' = 'deprovision';
  if (text.includes('delete') || text.includes('teardown') || text.includes('terminate') || text.includes('drop') || text.includes('destroy') || text.includes('remove cluster')) {
    action = 'delete';
  } else if (text.includes('revoke') || text.includes('disable') || text.includes('strip') || text.includes('rotate')) {
    action = 'revoke';
  }

  let matchedNode: SystemNode | undefined = undefined;

  for (const node of systemState.nodes) {
    const nodeNameLower = node.name.toLowerCase();
    const nameTokens = nodeNameLower.split(/[\s-_]+/);
    
    const isFullMatch = text.includes(nodeNameLower);
    const isIdMatch = text.includes(node.id.toLowerCase());
    const isTokenMatch = nameTokens.some(token => token.length > 2 && text.includes(token));

    if (isFullMatch || isIdMatch || isTokenMatch) {
      matchedNode = node;
      break;
    }
  }

  if (!matchedNode) {
    matchedNode = systemState.nodes.find(n => n.type === 'user' || n.type === 'resource') || systemState.nodes[0];
  }

  const constraints: string[] = [];

  if (text.includes('payroll') || text.includes('don\'t disrupt') || text.includes('without outage') || text.includes('zero downtime') || text.includes('no downtime')) {
    constraints.push('Preserve continuous execution of automated background jobs and connection pools.');
  }

  const activeLeadUsers = systemState.nodes.filter(n => n.type === 'user' && n.status === 'active' && n.id !== matchedNode?.id);
  if (activeLeadUsers.length > 0) {
    const leadNames = activeLeadUsers.slice(0, 2).map(u => u.name).join(' / ');
    constraints.push(`Prefer least-privilege custody transfer to verified domain leads (${leadNames}).`);
  }

  if (constraints.length === 0) {
    constraints.push('Ensure 0 critical breaking failures on active workflows and encryption keys.');
  }

  return {
    action,
    targetNodeId: matchedNode.id,
    targetNodeName: matchedNode.name,
    targetNodeType: matchedNode.type,
    constraints,
    rawIntent: intentText,
    aiExplanation: `Parsed target entity '${matchedNode.name}' (${matchedNode.type.toUpperCase()}) with ${constraints.length} active graph safety constraint(s).`,
    parsedByLLM: false
  };
}

let cachedWorkingModel: string | null = null;

export async function parseUserIntentAsync(intentText: string, systemState: SystemState): Promise<ParsedIntent> {
  const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as unknown as { env?: Record<string, string> }).env : undefined;
  const apiKey = metaEnv?.VITE_GEMINI_API_KEY || 
                 (typeof localStorage !== 'undefined' && (localStorage.getItem('gemini_api_key') || localStorage.getItem('groq_api_key'))) || 
                 '';

  if (!apiKey) {
    return parseUserIntent(intentText, systemState);
  }

  const cleanKey = apiKey.trim().replace(/^["']|["']$/g, '');
  const availableNodes = systemState.nodes.map(n => ({ id: n.id, name: n.name, type: n.type }));

  const PREFERRED_MODELS = cachedWorkingModel 
    ? [cachedWorkingModel, 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-pro']
    : ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-pro'];

  for (const targetModel of PREFERRED_MODELS) {
    try {
      const promptText = `You are ShadowProof's Operational Intent Parser. Standardize operational intent requests against system graph nodes: ${JSON.stringify(availableNodes)}.
Input user intent text: "${intentText}"

Return ONLY a valid JSON object matching this schema:
{"targetNodeId": string, "action": "deprovision"|"delete"|"revoke", "constraints": string[], "aiExplanation": string}`;

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
            temperature: 0.1,
            responseMimeType: 'application/json'
          }
        })
      });

      if (response.ok) {
        cachedWorkingModel = targetModel;
        const data = await response.json();
        const contentStr = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        const jsonMatch = contentStr.match(/\{[\s\S]*\}/);
        const parsedObj = JSON.parse(jsonMatch ? jsonMatch[0] : contentStr);

        const matchedNode = systemState.nodes.find(n => n.id === parsedObj.targetNodeId) || 
                            systemState.nodes.find(n => n.name.toLowerCase().includes(String(parsedObj.targetNodeId).toLowerCase())) ||
                            systemState.nodes[0];

        return {
          action: parsedObj.action || 'deprovision',
          targetNodeId: matchedNode.id,
          targetNodeName: matchedNode.name,
          targetNodeType: matchedNode.type,
          constraints: parsedObj.constraints || ['Ensure 0 critical breaking failures.'],
          rawIntent: intentText,
          aiExplanation: parsedObj.aiExplanation || `Gemini LLM (${targetModel}) parsed target '${matchedNode.name}' with active graph safety constraints.`,
          parsedByLLM: true
        };
      } else if (response.status === 429) {
        console.warn(`Gemini API rate limit reached on model ${targetModel}, using deterministic parser fallback.`);
        break;
      }
    } catch (err) {
      console.warn(`Gemini API parse error with model ${targetModel}:`, err);
    }
  }

  console.warn('Falling back to deterministic parser.');
  return parseUserIntent(intentText, systemState);
}
