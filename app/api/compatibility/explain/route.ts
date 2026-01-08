import { NextResponse } from 'next/server';
import { calculateRecipeNutrition } from '@/lib/utils/recipeNutrition';
import { validateSpeciesLanguageDetailed } from '@/lib/utils/speciesValidation';

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

function normalizeSpeciesForCopy(value: string | undefined | null): string {
  const raw = String(value || '').toLowerCase().trim();
  if (raw === 'dogs' || raw === 'dog') return 'dog';
  if (raw === 'cats' || raw === 'cat') return 'cat';
  if (raw === 'birds' || raw === 'bird') return 'bird';
  if (raw === 'reptiles' || raw === 'reptile') return 'reptile';
  if (raw === 'pocket pets' || raw === 'pocket-pets' || raw === 'pocket pet' || raw === 'pocket-pet') return 'pocket-pet';
  return raw || 'pet';
}

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
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(params.model)}:generateContent`;
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

  const nutrition = calculateRecipeNutrition(
    {
      id: recipe?.id || 'recipe',
      name: recipe?.name || 'Recipe',
      ingredients: Array.isArray(recipe.ingredients)
        ? recipe.ingredients.map((i) => ({ name: i?.name || '', amount: i?.amount || '' }))
        : [],
    } as any,
    { includeBreakdown: false }
  );

  const nutritionalBreakdown = {
    calories: nutrition.calories,
    protein: nutrition.protein,
    fat: nutrition.fat,
    fiber: nutrition.fiber,
    calcium: nutrition.calcium,
    phosphorus: nutrition.phosphorus,
    source: nutrition.source,
  };

  const models = [
    (process.env.GEMINI_API_MODEL || '').trim(),
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-flash-lite',
  ].filter(Boolean);

  const species = normalizeSpeciesForCopy(pet.type);
  const petName = String(pet?.name || 'Pet');
  const age = String(pet?.age ?? '');
  const weight = String(pet?.weightKg ?? pet?.weight ?? '');
  const breed = String(pet?.breed || '');
  const activityLevel = String(pet?.activityLevel || '');
  const healthConcerns = Array.isArray(pet?.healthConcerns) ? pet!.healthConcerns!.map((c) => String(c || '')).filter(Boolean) : [];
  const dietaryRestrictions = Array.isArray(pet?.dietaryRestrictions)
    ? pet!.dietaryRestrictions!.map((d) => String(d || '')).filter(Boolean)
    : [];
  const allergies = Array.isArray(pet?.allergies) ? pet!.allergies!.map((a) => String(a || '')).filter(Boolean) : [];

  const ingredientList = Array.isArray(recipe.ingredients)
    ? recipe.ingredients
        .map((i) => {
          const name = String(i?.name || '').trim();
          const amount = String(i?.amount || '').trim();
          return name ? `${name}${amount ? ` ${amount}` : ''}` : '';
        })
        .filter(Boolean)
        .join(', ')
    : '';

  const prompt =
    'You are a positive, encouraging pet nutrition advisor. Your job is to explain how this specific recipe supports the pet\'s individual health profile.\n' +
    'Return ONLY valid JSON. Do NOT wrap in markdown backticks. Do NOT add extra keys.\n\n' +
    'CONTEXT:\n' +
    `- Pet Name: ${petName}\n` +
    `- Species: ${species}\n` +
    `- Type/Breed: ${breed}\n` +
    `- Age: ${age}\n` +
    `- Weight: ${weight}\n` +
    `- Activity Level: ${activityLevel}\n` +
    `- Health Concerns: ${(healthConcerns || []).join(', ')}\n` +
    `- Dietary Restrictions: ${(dietaryRestrictions || []).join(', ')}\n` +
    `- Allergies: ${(allergies || []).join(', ')}\n\n` +
    'RECIPE:\n' +
    `${String(recipe?.name || 'Recipe')}\n` +
    `Ingredients: ${ingredientList}\n` +
    `Nutritional Profile: ${JSON.stringify(nutritionalBreakdown)}\n\n` +
    'INSTRUCTIONS:\n' +
    `Write a positive, personalized health analysis that shows how this recipe supports ${petName}\'s specific needs. ` +
    'For EACH health concern, age consideration, and weight goal, identify 2-3 ingredients or nutrients that actively support that aspect of health, and explain the benefit in simple, species-appropriate terms.\n\n' +
    'FORMAT REQUIREMENTS (write content as plain text using these headings; emojis only in the headings):\n' +
    `- summary: MUST be a markdown-style section starting with: "## 🎯 Why This Recipe Works for ${petName}" and include upbeat tone. Use ${petName} 8-10 times across the entire response.\n` +
    '- healthConcernNotes: For EACH item in pet.healthConcerns, return one entry where:\n' +
    '  - concern: exactly the provided string\n' +
    '  - note: a section beginning with "### ✨ <that concern>" and 2-3 bullet points with bold ingredient names and benefits.\n' +
    '- age: MUST be a section beginning with "### 🎂 Perfect for <petName>\'s Life Stage" and include 2-3 bullets.\n' +
    '- weight: MUST be a section beginning with "### ⚖️ Ideal for Maintaining <weight>" and include 2-3 bullets.\n\n' +
    'TONE:\n' +
    '- Enthusiastic and encouraging\n' +
    '- Focus on benefits, not deficiencies\n' +
    '- Explain science simply\n' +
    '- NEVER mention specific nutrient ratios (like Ca:P)\n' +
    '- NEVER use these words: "appears to be", "may be", "should", "must", "monitor", "insufficient", "concern", "risk", "deficient"\n' +
    '- Do not add warnings or caveats\n' +
    '- If something could be better, phrase it as: "could be enhanced with <supplement>"\n\n' +
    'Species language guidelines:\n' +
    '- DOGS: paws, coat, joints, mobility, active, playful; walks, fetch\n' +
    '- CATS: coat, whiskers, agility, hunting instincts; climbing, jumping\n' +
    '- BIRDS: feathers, plumage, beak, flight muscles; perching, singing\n' +
    '- REPTILES: scales, shell (turtles), basking, shedding, metabolism\n' +
    '- POCKET PETS: fur, teeth (always growing), whiskers, burrowing, foraging\n\n' +
    'Output JSON schema:\n' +
    JSON.stringify(
      {
        summary: 'string',
        healthConcernNotes: [{ concern: 'string', note: 'string' }],
        weight: 'string',
        age: 'string',
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
    for (let attempt = 0; attempt < 3; attempt++) {
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

        const combinedText = [
          response.summary,
          response.age,
          response.weight,
          ...response.healthConcernNotes.map((n) => `${n.concern}: ${n.note}`),
        ]
          .filter(Boolean)
          .join('\n');

        const validation = validateSpeciesLanguageDetailed(combinedText, species);
        if (!validation.isValid) {
          const err = new Error(`Species-language validation failed: ${validation.errors.join('; ')}`);
          lastErr = err;
          if (attempt < 2) {
            continue;
          }
        }

        return NextResponse.json(response);
      } catch (err) {
        lastErr = err instanceof Error ? err : new Error(String(err));
        if (attempt < 2) {
          continue;
        }
      }
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
