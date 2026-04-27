import { NextRequest, NextResponse } from 'next/server';
import { ratelimit } from '@/lib/ratelimit';

const USE_MOCK = process.env.USE_MOCK === 'true';

function getMockMerge(original: string, selected: string) {
  return `${selected} — based on the original idea of "${original}", with refined details and clear implementation direction.`;
}

export async function POST(req: NextRequest) {
  const limited = ratelimit();
  if (limited) return limited;

  const { original, selected } = await req.json();

  if (!original?.trim() || !selected?.trim()) {
    return NextResponse.json({ error: 'Missing input' }, { status: 400 });
  }

  if (USE_MOCK) {
    console.log(
      `[MOCK] Returning mock merge for: "${original.trim()}" + "${selected.trim()}"`,
    );
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({
      merged: getMockMerge(original.trim(), selected.trim()),
    });
  }

  const MAX_RETRIES = 3;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        system: `You are a prompt merger for UI descriptions.
          You receive the user's original description and a suggestion they selected.

          Rules:
          - If the selected suggestion is a broad direction (like "Refine the visual style"), append the direction to the original naturally. The result should signal that this area needs further refinement.
          - If the selected suggestion is a specific choice (like "Glassmorphism with frosted blur"), merge it into the original as a concrete design decision.
          - Keep the result concise, one or two sentences max.
          - Write as a UI description, not a question.

          Return ONLY the merged text, nothing else.`,
        messages: [
          {
            role: 'user',
            content: `Original: ${original}\nSelected suggestion: ${selected}`,
          },
        ],
      }),
    });

    if (response.status === 529 && attempt < MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, 1000));
      continue;
    }

    if (!response.ok) {
      const err = await response.text();
      console.error(
        `[merge] Attempt ${attempt} failed (${response.status}):`,
        err,
      );
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }
      return NextResponse.json(
        { error: 'Anthropic API error', status: response.status },
        { status: 500 },
      );
    }

    const data = await response.json();
    const text = data.content?.[0]?.text?.trim();

    if (!text) {
      if (attempt < MAX_RETRIES) continue;
      return NextResponse.json({ error: 'Empty response' }, { status: 500 });
    }

    return NextResponse.json({ merged: text });
  }
}
