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
  const apiKey = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GROQ_API_KEY) || 
                 (typeof localStorage !== 'undefined' && localStorage.getItem('groq_api_key')) || 
                 '';

  if (!apiKey) {
    return parseUserIntent(intentText, systemState);
  }

  try {
    const availableNodes = systemState.nodes.map(n => ({ id: n.id, name: n.name, type: n.type }));
    
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
            content: `You are ShadowProof's Operational Intent Parser. Standardize operational intent requests against system graph nodes: ${JSON.stringify(availableNodes)}. Return ONLY JSON matching: {"targetNodeId": string, "action": "deprovision"|"delete"|"revoke", "constraints": string[], "aiExplanation": string}`
          },
          {
            role: 'user',
            content: intentText
          }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      console.warn('Groq API request returned status:', response.status, 'Falling back to deterministic parser.');
      return parseUserIntent(intentText, systemState);
    }

    const data = await response.json();
    const parsedObj = JSON.parse(data.choices[0].message.content);

    const matchedNode = systemState.nodes.find(n => n.id === parsedObj.targetNodeId) || 
                        systemState.nodes.find(n => n.name.toLowerCase().includes(parsedObj.targetNodeId?.toLowerCase())) ||
                        systemState.nodes[0];

    return {
      action: parsedObj.action || 'deprovision',
      targetNodeId: matchedNode.id,
      targetNodeName: matchedNode.name,
      targetNodeType: matchedNode.type,
      constraints: parsedObj.constraints || ['Ensure 0 critical breaking failures.'],
      rawIntent: intentText,
      aiExplanation: parsedObj.aiExplanation || `Groq LLM parsed target '${matchedNode.name}' with active graph safety constraints.`,
      parsedByLLM: true
    };
  } catch (err) {
    console.warn('Groq API parsing failed, using deterministic fallback:', err);
    return parseUserIntent(intentText, systemState);
  }
}
