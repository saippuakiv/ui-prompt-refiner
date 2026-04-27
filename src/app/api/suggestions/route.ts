import { NextRequest, NextResponse } from 'next/server';
import { ratelimit } from '@/lib/ratelimit';

const USE_MOCK = process.env.USE_MOCK === 'true';

function getMockSuggestions(input: string) {
  const all = [
    {
      label: `A responsive ${input} with glassmorphism styling and smooth hover transitions`,
    },
    {
      label: `An animated ${input} using spring-based enter/exit with backdrop blur`,
    },
    {
      label: `A mobile-first ${input} with touch gestures and haptic feedback`,
    },
    {
      label: `A ${input} component with dark mode, design tokens, and accessibility support`,
    },
    { label: `A minimal ${input} with micro-interactions and subtle shadows` },
    {
      label: `A ${input} with fluid layout, responsive grid, and CSS custom properties`,
    },
  ];
  const count = 3 + Math.floor(Math.random() * 4); // 3-6 items
  return { suggestions: all.slice(0, count) };
}

export async function POST(req: NextRequest) {
  const limited = ratelimit();
  if (limited) return limited;

  const { input } = await req.json();

  if (!input?.trim()) {
    return NextResponse.json({ error: 'No input' }, { status: 400 });
  }

  if (USE_MOCK) {
    console.log(`[MOCK] Returning mock suggestions for: "${input.trim()}"`);
    await new Promise((r) => setTimeout(r, 800));
    return NextResponse.json(getMockSuggestions(input.trim()));
  }

  const MAX_RETRIES = 3;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    console.log(
      `[API] Attempt ${attempt}/${MAX_RETRIES} for: "${input.trim()}"`,
    );

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: `You are a UI/web prompt refinement assistant.

            The user gives you a description of a UI component, interaction, or webpage they want to build.

            Analyze the input and determine its specificity level:

            Level 1 — Very vague (e.g. "a button", "login page"):
            Return 4-5 broad dimension suggestions like visual style, animation, layout, interaction behavior. Each should be a single clear direction, not a list of options.
            Example: "Refine the visual style", "Add entrance animation", "Define hover interaction"

            Level 2 — Has a direction but lacks detail (e.g. "a button — I want to refine the visual style"):
            Return 4-5 specific, concrete choices within that direction. Each should be one decisve option the user can pick.
            Example: "Glassmorphism with frosted blur", "Minimal with clean lines", "Brutalist with bold borders"

            Level 3 — Already specific (e.g. "a glassmorphism button with frosted glass effect"):
            Return 3-4 refined prompt variations ready for an AI code generator.

            Prioritize visual style and animation/motion suggestions.
            Keep each label short and scannable.
            Respond ONLY with a valid JSON array. No markdown, no explanation.
            Format: [{"label": "..."}, ...]`,
        messages: [{ role: 'user', content: input }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(
        `[API] Attempt ${attempt} failed (${response.status}):`,
        err,
      );
      if (attempt < MAX_RETRIES) {
        const delay = attempt * 1000;
        console.log(`[API] Retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      return NextResponse.json(
        { error: 'Anthropic API error', status: response.status },
        { status: 500 },
      );
    }

    const data = await response.json();

    try {
      const text = data.content?.[0]?.text?.trim();
      console.log(`[API] Raw response:`, text);
      if (!text) throw new Error('Empty response');
      const cleaned = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
      const suggestions = JSON.parse(cleaned);
      return NextResponse.json({ suggestions });
    } catch (e) {
      console.error(
        `[API] Attempt ${attempt} parse failed:`,
        e,
        'data:',
        JSON.stringify(data),
      );
      if (attempt < MAX_RETRIES) continue;
      return NextResponse.json(
        { error: 'Failed to parse response' },
        { status: 500 },
      );
    }
  }
}
