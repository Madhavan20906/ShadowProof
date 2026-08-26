import { SystemState, ParsedIntent, SystemNode } from '../types/shadowproof';

export function parseUserIntent(intentText: string, systemState: SystemState): ParsedIntent {
  const text = intentText.toLowerCase();

  // 1. Detect Action Type dynamically across offboarding, infrastructure teardown, key rotation, and migration
  let action: 'deprovision' | 'delete' | 'revoke' = 'deprovision';
  if (text.includes('delete') || text.includes('teardown') || text.includes('terminate') || text.includes('drop') || text.includes('destroy') || text.includes('remove cluster')) {
    action = 'delete';
  } else if (text.includes('revoke') || text.includes('disable') || text.includes('strip') || text.includes('rotate')) {
    action = 'revoke';
  }

  // 2. Dynamically match target node from active system graph state
  let matchedNode: SystemNode | undefined = undefined;

  // Search by exact node ID, full node name, or tokenized name matches
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

  // Generic fallback if no specific token matched in string
  if (!matchedNode) {
    matchedNode = systemState.nodes.find(n => n.type === 'user' || n.type === 'resource') || systemState.nodes[0];
  }

  // 3. Extract Natural Language Operational Constraints dynamically
  const constraints: string[] = [];

  // Check for continuous execution constraints
  if (text.includes('payroll') || text.includes('don\'t disrupt') || text.includes('without outage') || text.includes('zero downtime') || text.includes('no downtime')) {
    constraints.push('Preserve continuous execution of automated background jobs and connection pools.');
  }

  // Dynamically find active lead users in the graph to serve as transfer candidates
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

export async function parseUserIntentAsync(intentText: string, systemState: SystemState): Promise<ParsedIntent> {
  const apiKey = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) || 
                 (typeof localStorage !== 'undefined' && (localStorage.getItem('gemini_api_key') || localStorage.getItem('groq_api_key'))) || 
                 '';

  if (!apiKey) {
    return parseUserIntent(intentText, systemState);
  }

  const cleanKey = apiKey.trim().replace(/^["']|["']$/g, '');
  const availableNodes = systemState.nodes.map(n => ({ id: n.id, name: n.name, type: n.type }));
  
  const EXCLUDED_PATTERNS = ['tts', 'embed', 'audio', 'imagen', 'realtime', 'bison', 'gecko', 'gemini-2.5-flash'];
  const PREFERRED_MODELS = ['gemini-3.6-flash', 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
  let candidateModels = PREFERRED_MODELS;

  try {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`);
    if (listRes.ok) {
      const listData = await listRes.json();
      const fetchedModels: string[] = (listData.models || [])
        .filter((m: any) => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
        .map((m: any) => m.name.replace(/^models\//, ''))
        .filter((name: string) => !EXCLUDED_PATTERNS.some(p => name.toLowerCase().includes(p)));

      if (fetchedModels.length > 0) {
        const flash36 = fetchedModels.filter(m => m.includes('3.6') || m.includes('flash'));
        const otherModels = fetchedModels.filter(m => !m.includes('3.6') && !m.includes('flash'));
        candidateModels = Array.from(new Set([...PREFERRED_MODELS, ...flash36, ...otherModels]));
      }
    }
  } catch (e) {
    console.warn('Could not fetch Gemini models list, using static candidate list.');
  }

  for (const targetModel of candidateModels) {
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
      } else {
        const errorMsg = await response.text();
        console.warn(`Gemini API model ${targetModel} status ${response.status}:`, errorMsg);
      }
    } catch (err) {
      console.warn(`Gemini API parse error with model ${targetModel}:`, err);
    }
  }

  console.warn('All Gemini API models returned errors, falling back to deterministic parser.');
  return parseUserIntent(intentText, systemState);
}
