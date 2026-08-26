import { SystemState, ParsedIntent, SystemNode } from '../types/shadowproof';

export function parseUserIntent(intentText: string, systemState: SystemState): ParsedIntent {
  const text = intentText.toLowerCase();

  // 1. Detect Action Type
  let action: 'deprovision' | 'delete' | 'revoke' = 'deprovision';
  if (text.includes('delete') || text.includes('teardown') || text.includes('terminate') || text.includes('drop')) {
    action = 'delete';
  } else if (text.includes('revoke') || text.includes('disable') || text.includes('strip')) {
    action = 'revoke';
  }

  // 2. Find target node in systemState
  let matchedNode: SystemNode | undefined = undefined;

  for (const node of systemState.nodes) {
    const nodeNameLower = node.name.toLowerCase();
    const firstName = nodeNameLower.split(' ')[0];
    if (text.includes(nodeNameLower) || (firstName.length > 2 && text.includes(firstName)) || text.includes(node.id.toLowerCase())) {
      matchedNode = node;
      break;
    }
  }

  if (!matchedNode) {
    matchedNode = systemState.nodes.find(n => n.type === 'user' || n.type === 'resource') || systemState.nodes[0];
  }

  // 3. Extract Natural Language Constraints
  const constraints: string[] = [];
  if (text.includes('payroll') || text.includes('don\'t disrupt') || text.includes('without outage')) {
    constraints.push('Preserve continuous execution of automated background jobs.');
  }
  if (text.includes('priya') || text.includes('elena') || text.includes('maya')) {
    constraints.push('Prefer least-privilege transfer to domain lead.');
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
    aiExplanation: `Extracted intent target '${matchedNode.name}' (${matchedNode.type.toUpperCase()}) with ${constraints.length} operational constraint(s).`,
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
