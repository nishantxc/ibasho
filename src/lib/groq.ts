export type GroqMessage = { role: 'system'|'user'|'assistant'; content: string };

export async function groqChat(
  messages: GroqMessage[],
  {
    model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
    temperature = 0.3,
    max_tokens = 900,
  }: { model?: string; temperature?: number; max_tokens?: number } = {}
) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('Missing GROQ_API_KEY');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, messages, temperature, max_tokens })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Groq API error ${res.status}: ${text}`);
  }

  const json = await res.json();
  const content: string = json.choices?.[0]?.message?.content ?? '';
  return content;
}
