import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type ExplainRequestBody = {
  recipe: {
    id?: string;
    name?: string;
    category?: string;
    description?: string;
    ingredients?: Array<{ name?: string; amount?: string }>;
  };
  pet: {
    id?: string;
    name?: string;
    type?: string;
    breed?: string;
    age?: string | number;
    weight?: string | number;
    weightKg?: number;
    activityLevel?: string;
    healthConcerns?: string[];
    allergies?: string[];
    dietaryRestrictions?: string[];
  };
  score?: {
    overallScore?: number;
    warnings?: string[];
    strengths?: string[];
  };
};

type ExplainResponse = {
  summary: string;
  healthConcernNotes: Array<{ concern: string; note: string }>;
  weight: string;
  age: string;
  modelUsed: string;
};

function cleanJSON(text: string): string {
  if (!text) return '';
  let t = String(text).trim();
  t = t.replace(/^```(?:json)?\s*/i, '');
  t = t.replace(/\s*```\s*$/i, '');
  const jsonStart = t.indexOf('{');
  const jsonEnd = t.lastIndexOf('}');
  if (jsonStart >= 0 && jsonEnd > jsonStart) {
    t = t.slice(jsonStart, jsonEnd + 1);
  }
  return t.trim();
}

async function generateWithModel(params: { apiKey: string; model: string; prompt: string }): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(params.model)}:generateContent`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': params.apiKey,
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: params.prompt }] }],
      generationConfig: {
        temperature: 0.4,
        topP: 0.9,
        maxOutputTokens: 768,
      },
    }),
  });

  const raw = await resp.text().catch(() => '');
  if (!resp.ok) {
    throw new Error(`Gemini request failed (${resp.status}) [model=${params.model}]: ${raw}`);
  }

  const data = raw ? JSON.parse(raw) : null;
  const parts: any[] = data?.candidates?.[0]?.content?.parts || [];
  const text = parts
    .filter((p) => p?.thought !== true)
    .map((p: any) => (typeof p?.text === 'string' ? p.text : ''))
    .join('');

  if (!text) {
    throw new Error(`Gemini returned empty response [model=${params.model}]`);
  }

  return text;
}

export async function POST(req: Request): Promise<NextResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 });
  }

  let body: ExplainRequestBody | null = null;
  try {
    body = (await req.json()) as ExplainRequestBody;
  } catch {
    body = null;
  }

  const recipe = body?.recipe;
  const pet = body?.pet;
  if (!recipe || !pet) {
    return NextResponse.json({ error: 'Missing recipe or pet' }, { status: 400 });
  }

  const models = [
    (process.env.GEMINI_API_MODEL || '').trim(),
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-flash-lite',
  ].filter(Boolean);

  const prompt =
    'You are a veterinary nutritionist. Return ONLY valid JSON. No markdown. No extra keys.\n\n' +
    'Task: Explain why this recipe is or is not a good fit for this specific pet.\n' +
    'You MUST address: (1) health concerns fit, (2) weight appropriateness, (3) age suitability.\n\n' +
    'Use all available inputs, including pet allergies/dietaryRestrictions and score.warnings/score.strengths, to ground your reasoning.\n\n' +
    'Important: For EVERY item in pet.healthConcerns, you must return one note in healthConcernNotes.\n' +
    'If a concern cannot be evaluated from the provided data, say that explicitly and provide a safe, practical suggestion.\n\n' +
    'Output JSON schema:\n' +
    JSON.stringify(
      {
        summary: 'string (1-2 sentences)',
        healthConcernNotes: [
          {
            concern: 'string (exactly as provided in pet.healthConcerns)',
            note: 'string (1-3 sentences, specific to this concern)',
          },
        ],
        weight: 'string (2-4 sentences)',
        age: 'string (2-4 sentences)',
      },
      null,
      2
    ) +
    '\n\nINPUT:\n' +
    JSON.stringify(
      {
        pet,
        recipe,
        score: body?.score || {},
      },
      null,
      2
    );

  let lastErr: Error | null = null;
  for (const model of models) {
    try {
      const text = await generateWithModel({ apiKey, model, prompt });
      const parsed = JSON.parse(cleanJSON(text));

      const petConcerns = Array.isArray(pet.healthConcerns)
        ? pet.healthConcerns.map((c) => String(c || '').trim()).filter(Boolean)
        : [];

      const rawNotes = Array.isArray(parsed?.healthConcernNotes) ? parsed.healthConcernNotes : [];
      const normalizedNotes = rawNotes
        .map((item: any) => {
          const concern = String(item?.concern || '').trim();
          const note = String(item?.note || '').trim();
          return concern && note ? { concern, note } : null;
        })
        .filter(Boolean) as Array<{ concern: string; note: string }>;

      const fallbackHealthConcernsText = String(parsed?.healthConcerns || '').trim();
      const healthConcernNotes: Array<{ concern: string; note: string }> = petConcerns.map((concern) => {
        const existing = normalizedNotes.find((n) => n.concern.toLowerCase() === concern.toLowerCase());
        if (existing) return existing;
        if (fallbackHealthConcernsText) {
          return { concern, note: fallbackHealthConcernsText };
        }
        return {
          concern,
          note: 'No specific note available for this concern based on the current data. Consider confirming with your veterinarian.',
        };
      });

      const response: ExplainResponse = {
        summary: String(parsed?.summary || ''),
        healthConcernNotes,
        weight: String(parsed?.weight || ''),
        age: String(parsed?.age || ''),
        modelUsed: model,
      };

      return NextResponse.json(response);
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));
      continue;
    }
  }

  return NextResponse.json(
    {
      error: 'Failed to generate explanation',
      details: lastErr?.message || 'Unknown error',
    },
    { status: 500 }
  );
}
