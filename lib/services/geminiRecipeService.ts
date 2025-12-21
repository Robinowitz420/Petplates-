import { HEALTH_CONTRAINDICATIONS, normalizeConcernKey } from '@/lib/data/healthBenefitMap';

export const MODEL_FALLBACK_LIST = [
  'gemini-3-flash-preview',
  'gemini-1.5-flash-lite',
  'gemini-1.5-flash',
  'gemini-2.0-flash',
] as const;

type GeminiRecipePayload = {
  recipes: Array<{
    name: string;
    description?: string;
    servings?: number;
    ingredients: Array<{ name: string; amount: string }>;
    instructions?: string[];
    estimatedCostPerMeal?: number;
  }>;
};

const normalizeTerm = (value: string): string =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function cleanJSON(text: string): string {
  if (!text) return '';

  let t = String(text).trim();

  // Strip fenced code blocks like ```json ... ``` or ``` ... ```
  t = t.replace(/^```(?:json)?\s*/i, '');
  t = t.replace(/\s*```\s*$/i, '');

  // If model returned extra prose, try to extract the first JSON object
  const jsonStart = t.indexOf('{');
  const jsonEnd = t.lastIndexOf('}');
  if (jsonStart >= 0 && jsonEnd > jsonStart) {
    t = t.slice(jsonStart, jsonEnd + 1);
  }

  return t.trim();
}

export async function generateRecipesJsonWithFallback(params: {
  species: string;
  count: number;
  petProfile?: {
    name?: string;
    weightKg?: number;
    age?: string;
    allergies?: string[];
    healthConcerns?: string[];
    bannedIngredients?: string[];
  };
  allowedIngredientNames: string[];
}): Promise<{ payload: GeminiRecipePayload; modelUsed: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY');

  const preferred = (process.env.GEMINI_API_MODEL || '').trim();
  const models = [preferred, ...MODEL_FALLBACK_LIST].filter(Boolean);

  const { species, count, petProfile, allowedIngredientNames } = params;
  const desiredCount = 10;
  const requestedCount = desiredCount; // Super-request engine is always exactly 10

  const age = petProfile?.age || 'adult';
  const weightKg = petProfile?.weightKg;
  const allergies = (petProfile?.allergies || []).filter(Boolean);
  const bannedIngredients = (petProfile?.bannedIngredients || []).filter(Boolean);
  const healthConcerns = (petProfile?.healthConcerns || []).filter(Boolean);

  const allowedIngredientList = allowedIngredientNames.filter(Boolean).slice(0, 350);

  const contraindications = healthConcerns.flatMap((c) => {
    const key = normalizeConcernKey(c);
    return HEALTH_CONTRAINDICATIONS[key] || HEALTH_CONTRAINDICATIONS[c] || [];
  });

  const systemPrefix =
    'ACT AS A PHD VETERINARY NUTRITIONIST. ' +
    'YOU MUST RETURN ONLY VALID JSON. ' +
    'DO NOT INCLUDE MARKDOWN BACKTICKS OR EXPLANATIONS.';

  const schemaRequirement = {
    recipes: [
      {
        name: 'string',
        description: 'string (optional)',
        servings: 'number (optional, default 1)',
        ingredients: [{ name: 'string', amount: 'string (e.g., "100g")' }],
        instructions: ['string (optional)'],
        estimatedCostPerMeal: 'number (optional)',
      },
    ],
  };

  const userPromptObject = {
    task: 'Generate species-appropriate pet recipes as meal formulations.',
    output_format: schemaRequirement,
    hard_constraints: {
      max_recipes: requestedCount,
      species,
      pet_profile: {
        name: petProfile?.name || 'Pet',
        age,
        weightKg: typeof weightKg === 'number' ? weightKg : undefined,
        healthConcerns,
        allergies,
        bannedIngredients,
      },
      zero_tolerance: {
        allergies,
        bannedIngredients,
        contraindications,
      },
      ingredient_vocabulary: {
        rule: 'Every ingredient.name MUST be chosen from allowed_names EXACTLY (case-insensitive match ok).',
        allowed_names: allowedIngredientList,
      },
      safety: {
        forbid: ['onion', 'garlic', 'grape', 'raisins', 'xylitol', 'chocolate', 'macadamia', 'alcohol', 'caffeine'],
      },
    },
    guidance: {
      style: 'practical, simple, grocery-available ingredients',
      portions: 'Amounts should be plausible per meal',
      diversity: 'Try to vary primary protein and vegetables across recipes',
    },
  };

  const finalPromptText =
    `${systemPrefix}\n\n` +
    `CRITICAL: Output MUST include exactly ${requestedCount} recipes in the recipes array.\n\n` +
    `OUTPUT JSON SCHEMA (must match exactly, with no extra keys at top-level):\n` +
    `${JSON.stringify(schemaRequirement, null, 2)}\n\n` +
    `REQUEST:\n${JSON.stringify(userPromptObject)}`;

  let lastErr: Error | null = null;

  for (const model of models) {
    console.info(`[Gemini] Attempting generation with model: ${model}`);

    const url = `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(model)}:generateContent`;

    const backoffMs = [0, 2000, 4000];

    let resp: Response | null = null;
    let errorText = '';

    for (let attempt = 0; attempt < backoffMs.length; attempt++) {
      if (attempt > 0) {
        console.info(`[Gemini] Retrying after ${backoffMs[attempt]}ms (attempt ${attempt + 1}/${backoffMs.length})`);
        await sleep(backoffMs[attempt]);
      }

      resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: finalPromptText }] }],
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 8192,
          },
        }),
      });

      if (resp.ok) break;

      errorText = await resp.text().catch(() => '');

      // Only retry quota/rate-limit; other statuses handled below.
      if (resp.status === 429) {
        continue;
      }

      break;
    }

    if (!resp) {
      lastErr = new Error(`Gemini request failed [model=${model}]: no response`);
      continue;
    }

    if (!resp.ok) {
      if (resp.status === 404) {
        console.info(`[Gemini] Model not found/supported (${model}). Trying fallback...`);
        lastErr = new Error(`Gemini model not available (${model}): ${errorText}`);
        continue;
      }

      if (resp.status === 429) {
        // If quota is truly 0, retrying won't help. Surface a clear message.
        const quotaZero = /limit:\s*0/i.test(errorText) || /free_tier_requests,\s*limit:\s*0/i.test(errorText);
        if (quotaZero) {
          throw new Error(
            `Gemini quota is not enabled for this project (limit=0). Enable billing/upgrade plan. [model=${model}]\n${errorText}`
          );
        }
      }

      throw new Error(`Gemini request failed (${resp.status}) [model=${model}]: ${errorText}`);
    }

    const data: any = await resp.json();
    const parts: any[] = data?.candidates?.[0]?.content?.parts || [];

    const thoughtParts = parts.filter((p) => p?.thought === true && typeof p?.text === 'string');
    if (thoughtParts.length > 0) {
      console.info(
        `[Gemini] Thought parts received (ignored for JSON parsing):\n${thoughtParts
          .map((p) => String(p.text))
          .join('\n---\n')}`
      );
    }

    const text = parts
      .filter((p) => p?.thought !== true)
      .map((p: any) => (typeof p?.text === 'string' ? p.text : ''))
      .join('');

    if (!text) {
      lastErr = new Error(`Gemini returned empty response [model=${model}]`);
      continue;
    }

    let parsed: GeminiRecipePayload;
    try {
      parsed = JSON.parse(cleanJSON(text));
    } catch {
      lastErr = new Error(`Gemini response was not valid JSON [model=${model}]`);
      continue;
    }

    if (!parsed || !Array.isArray(parsed.recipes)) {
      lastErr = new Error(`Gemini JSON missing recipes array [model=${model}]`);
      continue;
    }

    if (parsed.recipes.length !== requestedCount) {
      lastErr = new Error(
        `Gemini returned ${parsed.recipes.length} recipes; expected exactly ${requestedCount} [model=${model}]`
      );
      continue;
    }

    console.info(`[Gemini] ✅ Generation successful with model: ${model}`);
    return { payload: parsed, modelUsed: model };
  }

  throw lastErr || new Error('All Gemini models failed. Please check API key and model availability.');
}

export function getModelFallbackListForDebug(): string[] {
  const preferred = (process.env.GEMINI_API_MODEL || '').trim();
  const models = [preferred, ...MODEL_FALLBACK_LIST].filter(Boolean);
  // De-dupe (preserve order)
  const seen = new Set<string>();
  return models.filter((m) => {
    const key = normalizeTerm(m);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
