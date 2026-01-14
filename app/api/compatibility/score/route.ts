import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { calculateRecipeNutrition } from '@/lib/utils/recipeNutrition';
import { scoreWithSpeciesEngine } from '@/lib/utils/speciesScoringEngines';
import { normalizePetType, type PetType } from '@/lib/utils/petType';
import { jsonError } from '@/lib/utils/apiResponse';

export const runtime = 'nodejs';

type ScoreRequestBody = {
  recipe: {
    id?: string;
    name?: string;
    category?: string;
    description?: string;
    ingredients?: Array<{ id?: string; name?: string; amount?: string; category?: string }>;
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
};

type RecipeScoreSummary = {
  overallScore: number;
  compatibility: string;
  summaryReasoning: string;
  explainRecommendations: any[];
  nutritionalGaps: string[];
  supplementRecommendations: any[];
  breakdown: Record<string, { score: number; weightedContribution?: number; weight: number; reason?: string; recommendations?: any[] }>;
  warnings: string[];
  strengths: string[];
  recommendations: any[];
  usesFallbackNutrition: boolean;
};

type CachedValue = { ts: number; value: { source: 'gemini' | 'fallback'; modelUsed?: string; score: RecipeScoreSummary } };

const CACHE_TTL_MS = 1000 * 60 * 30;

function getCache(): Map<string, CachedValue> {
  const g = globalThis as any;
  if (!g.__petplatesCompatibilityScoreCache) {
    g.__petplatesCompatibilityScoreCache = new Map<string, CachedValue>();
  }
  return g.__petplatesCompatibilityScoreCache as Map<string, CachedValue>;
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

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, n));
}

function getGrade(overallScore: number): 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' {
  const s = clampScore(overallScore);
  if (s >= 97) return 'A+';
  if (s >= 93) return 'A';
  if (s >= 89) return 'B+';
  if (s >= 83) return 'B';
  if (s >= 77) return 'C+';
  if (s >= 70) return 'C';
  if (s >= 60) return 'D';
  return 'F';
}

function gradeToCompatibility(grade: string): string {
  return grade === 'A+' || grade === 'A'
    ? 'excellent'
    : grade === 'B+' || grade === 'B'
      ? 'good'
      : grade === 'C+' || grade === 'C'
        ? 'fair'
        : 'poor';
}

function getWeightsForSpecies(type: PetType): { safety: number; nutrition: number; health: number; quality: number } {
  if (type === 'dog') return { safety: 0.3, nutrition: 0.45, health: 0.15, quality: 0.1 };
  if (type === 'cat') return { safety: 0.3, nutrition: 0.5, health: 0.1, quality: 0.1 };
  return { safety: 0.3, nutrition: 0.4, health: 0.2, quality: 0.1 };
}

function normalizeStringList(list: unknown): string[] {
  return Array.isArray(list) ? list.map((v) => String(v || '').trim()).filter(Boolean) : [];
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function getSupplementBoostDebug(recipe: any): {
  boost: number;
  detectedSupplements: Array<{ id: string; name: string; source: 'supplements' | 'ingredients' }>;
} {
  const detectedSupplements: Array<{ id: string; name: string; source: 'supplements' | 'ingredients' }> = [];

  const supplements = Array.isArray(recipe?.supplements) ? recipe.supplements : [];
  for (const supp of supplements) {
    detectedSupplements.push({
      id: String((supp as any)?.id || ''),
      name: String((supp as any)?.name || (supp as any)?.productName || (supp as any)?.id || ''),
      source: 'supplements',
    });
  }

  const ingredients = Array.isArray(recipe?.ingredients) ? recipe.ingredients : [];
  for (const ing of ingredients) {
    const category = String((ing as any)?.category || '').toLowerCase();
    const id = String((ing as any)?.id || '').toLowerCase();
    const isSupplementCategory = category === 'supplement';
    const isSupplementId = id.startsWith('supplement-');
    if (!isSupplementCategory && !isSupplementId) continue;

    detectedSupplements.push({
      id: String((ing as any)?.id || ''),
      name: String((ing as any)?.name || (ing as any)?.productName || (ing as any)?.id || ''),
      source: 'ingredients',
    });
  }

  const combinedNames = detectedSupplements
    .map((s) => {
      const id = String(s?.id || '').toLowerCase().trim();
      const name = String(s?.name || '').toLowerCase().trim();
      return `${id}:${name}`.trim();
    })
    .filter(Boolean)
    .join('|');

  if (!combinedNames) {
    return { boost: 0, detectedSupplements };
  }

  const seed = `${String(recipe?.id || 'recipe')}|${combinedNames}`;
  const boost = 2 + (hashString(seed) % 7); // keep existing behavior
  return { boost, detectedSupplements };
}

function getSupplementBoost(recipe: any): number {
  return getSupplementBoostDebug(recipe).boost;
}

function toHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return String(Math.abs(hash));
}

function buildCacheKey(body: ScoreRequestBody): string {
  const pet = body?.pet || {};
  const recipe = body?.recipe || {};
  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  const parts = [
    `pet:${String(pet.id || '')}`,
    `type:${String(pet.type || '')}`,
    `breed:${String(pet.breed || '')}`,
    `age:${String(pet.age ?? '')}`,
    `weight:${String(pet.weightKg ?? pet.weight ?? '')}`,
    `health:${normalizeStringList(pet.healthConcerns).join('|')}`,
    `allergies:${normalizeStringList(pet.allergies).join('|')}`,
    `diet:${normalizeStringList(pet.dietaryRestrictions).join('|')}`,
    `recipe:${String(recipe.id || recipe.name || '')}`,
    ...ingredients.map((i) => `${String(i?.id || i?.name || '')}:${String(i?.amount || '')}`),
  ];
  return toHash(parts.join('||'));
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
        temperature: 0.2,
        topP: 0.9,
        maxOutputTokens: 2048,
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

function buildLocalSummary(params: {
  scored: ReturnType<typeof scoreWithSpeciesEngine>;
  petType: PetType;
  usesFallbackNutrition: boolean;
}): RecipeScoreSummary {
  const { scored, usesFallbackNutrition } = params;
  const weights = getWeightsForSpecies(params.petType);

  const breakdown = Object.entries(scored.raw.factors).reduce(
    (acc, [key, factor]) => {
      const f = factor as { score: number; weight: number; reasoning: string; issues: string[]; strengths: string[] };
      const score = typeof f.score === 'number' && Number.isFinite(f.score) ? f.score : 0;
      const weight = typeof weights[key as keyof typeof weights] === 'number' ? (weights as any)[key] : f.weight;
      acc[key] = {
        score,
        weightedContribution: Math.round(score * (weight || 0)),
        weight,
        reason: f.reasoning || (Array.isArray(f.issues) && f.issues.length > 0 ? f.issues.join('; ') : (f.strengths || []).join('; ')),
        recommendations: key === 'nutrition' ? (scored.raw.detailedBreakdown?.recommendations as any[] | undefined) : undefined,
      };
      return acc;
    },
    {} as Record<string, { score: number; weightedContribution?: number; weight: number; reason?: string; recommendations?: any[] }>
  );

  const summaryReasoning =
    Array.isArray(scored.warnings) && scored.warnings.length > 0
      ? scored.warnings.slice(0, 3).join('. ')
      : Array.isArray(scored.strengths) && scored.strengths.length > 0
        ? scored.strengths.slice(0, 3).join('. ')
        : 'Recipe evaluated for compatibility with your pet.';

  return {
    overallScore: scored.overallScore,
    compatibility: gradeToCompatibility(scored.grade),
    summaryReasoning,
    explainRecommendations: [],
    nutritionalGaps: Array.isArray(scored.raw.detailedBreakdown?.nutritionalGaps) ? scored.raw.detailedBreakdown.nutritionalGaps : [],
    supplementRecommendations: Array.isArray(scored.raw.detailedBreakdown?.recommendations) ? scored.raw.detailedBreakdown.recommendations : [],
    breakdown,
    warnings: Array.isArray(scored.warnings) ? scored.warnings : [],
    strengths: Array.isArray(scored.strengths) ? scored.strengths : [],
    recommendations: [],
    usesFallbackNutrition,
  };
}

export async function POST(req: Request): Promise<NextResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return jsonError({ code: 'INTERNAL_ERROR', message: 'Missing GEMINI_API_KEY', status: 500 });
  }

  const { userId } = await auth();
  if (!userId) {
    return jsonError({ code: 'UNAUTHORIZED', message: 'Please sign in to score meals.', status: 401 });
  }

  let body: ScoreRequestBody | null = null;
  try {
    body = (await req.json()) as ScoreRequestBody;
  } catch {
    body = null;
  }

  const recipeIn = body?.recipe;
  const petIn = body?.pet;
  if (!recipeIn || !petIn) {
    return jsonError({ code: 'INVALID_REQUEST', message: 'Missing recipe or pet', status: 400 });
  }

  const supplementDebug = getSupplementBoostDebug(recipeIn);
  const supplementBoost = supplementDebug.boost;
  const debugEnabled = process.env.NODE_ENV === 'development';

  const cache = getCache();
  const cacheKey = buildCacheKey(body as any);
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    // Check if cached score has breakdown data
    const hasBreakdown = cached.value.score && typeof cached.value.score.breakdown === 'object' && cached.value.score.breakdown && Object.keys(cached.value.score.breakdown).length > 0;
    if (hasBreakdown) {
      // Apply supplement boost to cached scores too
      const boostedCached = { ...cached };
      const baseScoreBeforeBoost = boostedCached.value.score.overallScore;
      boostedCached.value.score.overallScore = clampScore(baseScoreBeforeBoost + supplementBoost);
      return NextResponse.json({
        ok: true,
        ...boostedCached.value,
        ...(debugEnabled
          ? {
              _debug: {
                supplementBoostApplied: supplementBoost,
                detectedSupplementCount: supplementDebug.detectedSupplements.length,
                detectedSupplements: supplementDebug.detectedSupplements,
                baseScoreBeforeBoost,
                recipeHadSupplementsArray: Array.isArray((recipeIn as any)?.supplements) && (recipeIn as any).supplements.length > 0,
                recipeIngredientCount: Array.isArray((recipeIn as any)?.ingredients) ? (recipeIn as any).ingredients.length : 0,
                sampleIngredients: Array.isArray((recipeIn as any)?.ingredients)
                  ? (recipeIn as any).ingredients.slice(0, 3).map((ing: any) => ({ id: ing?.id, name: ing?.name, category: ing?.category }))
                  : [],
              },
            }
          : {}),
      });
    }
    // Cached score is missing breakdown, recalculate
    console.log('API cache has score without breakdown, recalculating');
  }

  const petType = normalizePetType(petIn.type, 'api/compatibility/score');
  const scoringPet = {
    id: String(petIn.id || 'pet'),
    name: String(petIn.name || 'Pet'),
    type: petType,
    breed: typeof petIn.breed === 'string' ? petIn.breed : undefined,
    age: typeof petIn.age === 'number' ? petIn.age : typeof petIn.age === 'string' ? parseFloat(petIn.age) || 1 : 1,
    weight:
      typeof petIn.weightKg === 'number' && Number.isFinite(petIn.weightKg)
        ? petIn.weightKg
        : typeof petIn.weight === 'number'
          ? petIn.weight
          : typeof petIn.weight === 'string'
            ? parseFloat(petIn.weight) || 10
            : 10,
    activityLevel: typeof petIn.activityLevel === 'string' ? petIn.activityLevel : undefined,
    healthConcerns: normalizeStringList(petIn.healthConcerns),
    dietaryRestrictions: normalizeStringList(petIn.dietaryRestrictions),
    allergies: normalizeStringList(petIn.allergies),
  } as any;

  const baseIngredients = Array.isArray(recipeIn.ingredients)
    ? recipeIn.ingredients.filter((i: any) => {
        const category = String(i?.category || '').toLowerCase();
        const id = String(i?.id || '').toLowerCase();
        const isSupplementCategory = category === 'supplement';
        const isSupplementId = id.startsWith('supplement-');
        return !isSupplementCategory && !isSupplementId;
      })
    : [];

  const recipeForNutrition = {
    id: String(recipeIn.id || 'recipe'),
    name: String(recipeIn.name || 'Recipe'),
    category: String(recipeIn.category || ''),
    ingredients: baseIngredients.map((i: any) => ({
      id: String(i?.id || ''),
      name: String(i?.name || ''),
      amount: String(i?.amount || ''),
      category: String(i?.category || ''),
    })),
  } as any;

  const nutrition = calculateRecipeNutrition(recipeForNutrition as any, { includeBreakdown: false });
  const usesFallbackNutrition = Boolean((nutrition as any)?.usesFallbackNutrition);

  const ingredientCount = Array.isArray(recipeForNutrition.ingredients)
    ? recipeForNutrition.ingredients.filter((i: any) => String(i?.name || i?.id || '').trim()).length
    : 0;
  if (ingredientCount === 0) {
    const minimal: RecipeScoreSummary = {
      overallScore: 0,
      compatibility: 'poor',
      summaryReasoning: 'No ingredients to evaluate.',
      explainRecommendations: [],
      nutritionalGaps: ['protein', 'fiber', 'calcium', 'phosphorus'],
      supplementRecommendations: [],
      breakdown: {
        safety: { score: 0, weight: getWeightsForSpecies(petType).safety, weightedContribution: 0, reason: 'No ingredients.' },
        nutrition: { score: 0, weight: getWeightsForSpecies(petType).nutrition, weightedContribution: 0, reason: 'No ingredients.' },
        health: { score: 0, weight: getWeightsForSpecies(petType).health, weightedContribution: 0, reason: 'No ingredients.' },
        quality: { score: 0, weight: getWeightsForSpecies(petType).quality, weightedContribution: 0, reason: 'No ingredients.' },
      },
      warnings: ['No ingredients to evaluate'],
      strengths: [],
      recommendations: [],
      usesFallbackNutrition,
    };
    const value = { source: 'fallback' as const, score: minimal };
    cache.set(cacheKey, { ts: Date.now(), value });
    return NextResponse.json({
      ok: true,
      ...value,
      ...(debugEnabled
        ? {
            _debug: {
              supplementBoostApplied: supplementBoost,
              detectedSupplementCount: supplementDebug.detectedSupplements.length,
              detectedSupplements: supplementDebug.detectedSupplements,
              baseScoreBeforeBoost: 0,
              recipeHadSupplementsArray: Array.isArray((recipeIn as any)?.supplements) && (recipeIn as any).supplements.length > 0,
              recipeIngredientCount: Array.isArray((recipeIn as any)?.ingredients) ? (recipeIn as any).ingredients.length : 0,
              sampleIngredients: Array.isArray((recipeIn as any)?.ingredients)
                ? (recipeIn as any).ingredients.slice(0, 3).map((ing: any) => ({ id: ing?.id, name: ing?.name, category: ing?.category }))
                : [],
            },
          }
        : {}),
    });
  }

  let localScored: ReturnType<typeof scoreWithSpeciesEngine> | null = null;
  try {
    localScored = scoreWithSpeciesEngine(recipeForNutrition as any, scoringPet);
  } catch {
    localScored = null;
  }

  const localSummary = localScored ? buildLocalSummary({ scored: localScored, petType, usesFallbackNutrition }) : null;

  const schema = {
    overallScore: 'number (0-100)',
    factors: {
      safety: { score: 'number (0-100)', reasoning: 'string', issues: ['string'], strengths: ['string'] },
      nutrition: { score: 'number (0-100)', reasoning: 'string', issues: ['string'], strengths: ['string'] },
      health: { score: 'number (0-100)', reasoning: 'string', issues: ['string'], strengths: ['string'] },
      quality: { score: 'number (0-100)', reasoning: 'string', issues: ['string'], strengths: ['string'] },
    },
    warnings: ['string'],
    strengths: ['string'],
    nutritionalGaps: ['string'],
    recommendations: ['string'],
  };

  const systemPrefix =
    'ACT AS A PHD-LEVEL PET NUTRITION EXPERT. ' +
    'YOU MUST RETURN ONLY VALID JSON. ' +
    'DO NOT INCLUDE MARKDOWN BACKTICKS OR EXPLANATIONS.';

  const userPromptObject = {
    task: 'Score compatibility of a specific pet meal recipe for this pet profile.',
    scoring_factors: ['safety', 'nutrition', 'health', 'quality'],
    pet_profile: {
      name: scoringPet.name,
      species: scoringPet.type,
      breed: scoringPet.breed,
      age: scoringPet.age,
      weight: scoringPet.weight,
      activityLevel: scoringPet.activityLevel,
      healthConcerns: scoringPet.healthConcerns,
      allergies: scoringPet.allergies,
      dietaryRestrictions: scoringPet.dietaryRestrictions,
    },
    recipe: {
      name: recipeIn.name,
      category: recipeIn.category,
      ingredients: baseIngredients.map((i: any) => ({ name: i?.name, amount: i?.amount })),
    },
    nutrition_breakdown: {
      calories: nutrition.calories,
      protein: nutrition.protein,
      fat: nutrition.fat,
      fiber: nutrition.fiber,
      calcium: nutrition.calcium,
      phosphorus: nutrition.phosphorus,
      source: nutrition.source,
      usesFallbackNutrition,
      fallbackIngredients: (nutrition as any)?.fallbackIngredients || [],
    },
    local_scoring_reference: localSummary
      ? {
          overallScore: localSummary.overallScore,
          factors: Object.fromEntries(
            Object.entries(localSummary.breakdown || {}).map(([k, v]) => [k, { score: (v as any)?.score, reason: (v as any)?.reason }])
          ),
          warnings: localSummary.warnings,
          strengths: localSummary.strengths,
        }
      : null,
    output_format: schema,
    hard_rules: [
      'If the recipe has no ingredients, overallScore must be 0.',
      'If the recipe has fewer than 2 meaningful ingredients, overallScore must be <= 10.',
      'If nutrition source is estimated or fallback nutrition is used heavily, reduce confidence and score.',
      'Do not award high scores to incomplete meals.',
    ],
  };

  const finalPromptText =
    `${systemPrefix}\n\n` +
    `OUTPUT JSON SCHEMA (must match exactly, with no extra keys at top-level):\n` +
    `${JSON.stringify(schema, null, 2)}\n\n` +
    `REQUEST:\n${JSON.stringify(userPromptObject)}`;

  const models = (process.env.GEMINI_MODEL_OVERRIDE
    ? process.env.GEMINI_MODEL_OVERRIDE.split(',').map((m) => m.trim()).filter(Boolean)
    : ['gemini-2.0-flash', 'gemini-1.5-flash']);

  let lastErr: Error | null = null;

  for (const model of models) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const text = await generateWithModel({ apiKey, model, prompt: finalPromptText });
        const parsed = JSON.parse(cleanJSON(text));

        const overallScoreRaw = typeof parsed?.overallScore === 'number' ? parsed.overallScore : NaN;
        if (!Number.isFinite(overallScoreRaw)) {
          throw new Error('Invalid overallScore');
        }

        let overallScore = clampScore(Math.round(overallScoreRaw));
        if (ingredientCount < 2) {
          overallScore = Math.min(overallScore, 10);
        }
        const grade = getGrade(overallScore);
        const weights = getWeightsForSpecies(petType);

        const factorObj = parsed?.factors && typeof parsed.factors === 'object' ? parsed.factors : {};
        const getFactor = (k: 'safety' | 'nutrition' | 'health' | 'quality') => {
          const f = (factorObj as any)?.[k] || {};
          return {
            score: clampScore(typeof f?.score === 'number' ? f.score : 0),
            reasoning: String(f?.reasoning || ''),
            issues: normalizeStringList(f?.issues),
            strengths: normalizeStringList(f?.strengths),
          };
        };

        const safety = getFactor('safety');
        const nutritionF = getFactor('nutrition');
        const health = getFactor('health');
        const quality = getFactor('quality');

        const breakdown: RecipeScoreSummary['breakdown'] = {
          safety: {
            score: safety.score,
            weight: weights.safety,
            weightedContribution: Math.round(safety.score * weights.safety),
            reason: safety.reasoning || (safety.issues.length > 0 ? safety.issues.join('; ') : safety.strengths.join('; ')),
          },
          nutrition: {
            score: nutritionF.score,
            weight: weights.nutrition,
            weightedContribution: Math.round(nutritionF.score * weights.nutrition),
            reason: nutritionF.reasoning || (nutritionF.issues.length > 0 ? nutritionF.issues.join('; ') : nutritionF.strengths.join('; ')),
          },
          health: {
            score: health.score,
            weight: weights.health,
            weightedContribution: Math.round(health.score * weights.health),
            reason: health.reasoning || (health.issues.length > 0 ? health.issues.join('; ') : health.strengths.join('; ')),
          },
          quality: {
            score: quality.score,
            weight: weights.quality,
            weightedContribution: Math.round(quality.score * weights.quality),
            reason: quality.reasoning || (quality.issues.length > 0 ? quality.issues.join('; ') : quality.strengths.join('; ')),
          },
        };

        const warnings = normalizeStringList(parsed?.warnings);
        const strengths = normalizeStringList(parsed?.strengths);
        const nutritionalGaps = normalizeStringList(parsed?.nutritionalGaps);

        const summaryReasoning =
          warnings.length > 0
            ? warnings.slice(0, 3).join('. ')
            : strengths.length > 0
              ? strengths.slice(0, 3).join('. ')
              : 'Recipe evaluated for compatibility with your pet.';

        const baseScoreBeforeBoost = overallScore;
        const score: RecipeScoreSummary = {
          overallScore: clampScore(baseScoreBeforeBoost + supplementBoost),
          compatibility: gradeToCompatibility(grade),
          summaryReasoning,
          explainRecommendations: [],
          nutritionalGaps,
          supplementRecommendations: [],
          breakdown,
          warnings,
          strengths,
          recommendations: normalizeStringList(parsed?.recommendations),
          usesFallbackNutrition,
        };

        const value = { source: 'gemini' as const, modelUsed: model, score };
        cache.set(cacheKey, { ts: Date.now(), value });
        return NextResponse.json({
          ok: true,
          ...value,
          ...(debugEnabled
            ? {
                _debug: {
                  supplementBoostApplied: supplementBoost,
                  detectedSupplementCount: supplementDebug.detectedSupplements.length,
                  detectedSupplements: supplementDebug.detectedSupplements,
                  baseScoreBeforeBoost,
                  recipeHadSupplementsArray: Array.isArray((recipeIn as any)?.supplements) && (recipeIn as any).supplements.length > 0,
                  recipeIngredientCount: Array.isArray((recipeIn as any)?.ingredients) ? (recipeIn as any).ingredients.length : 0,
                  sampleIngredients: Array.isArray((recipeIn as any)?.ingredients)
                    ? (recipeIn as any).ingredients.slice(0, 3).map((ing: any) => ({ id: ing?.id, name: ing?.name, category: ing?.category }))
                    : [],
                },
              }
            : {}),
        });
      } catch (err) {
        lastErr = err instanceof Error ? err : new Error(String(err));
      }
    }
  }

  if (localScored) {
    const score = buildLocalSummary({ scored: localScored, petType, usesFallbackNutrition });
    // Apply supplement boost to fallback scoring too
    const baseScoreBeforeBoost = score.overallScore;
    score.overallScore = clampScore(baseScoreBeforeBoost + supplementBoost);
    const value = { source: 'fallback' as const, score };
    cache.set(cacheKey, { ts: Date.now(), value });
    return NextResponse.json({
      ok: true,
      ...value,
      ...(debugEnabled
        ? {
            _debug: {
              supplementBoostApplied: supplementBoost,
              detectedSupplementCount: supplementDebug.detectedSupplements.length,
              detectedSupplements: supplementDebug.detectedSupplements,
              baseScoreBeforeBoost,
              recipeHadSupplementsArray: Array.isArray((recipeIn as any)?.supplements) && (recipeIn as any).supplements.length > 0,
              recipeIngredientCount: Array.isArray((recipeIn as any)?.ingredients) ? (recipeIn as any).ingredients.length : 0,
              sampleIngredients: Array.isArray((recipeIn as any)?.ingredients)
                ? (recipeIn as any).ingredients.slice(0, 3).map((ing: any) => ({ id: ing?.id, name: ing?.name, category: ing?.category }))
                : [],
            },
          }
        : {}),
    });
  }

  return jsonError({
    code: 'INTERNAL_ERROR',
    message: lastErr?.message || 'Failed to score recipe',
    status: 500,
  });
}
