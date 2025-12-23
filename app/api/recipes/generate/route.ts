import { NextRequest, NextResponse } from 'next/server';
import type { Recipe } from '@/lib/types';
import { getIngredientsForSpecies } from '@/lib/data/ingredients';
import { HEALTH_CONTRAINDICATIONS, normalizeConcernKey } from '@/lib/data/healthBenefitMap';
import {
  buildRevisionPromptText,
  generateRecipesJsonWithFallback,
  generateRecipesJsonWithFallbackAndPrompt,
} from '@/lib/services/geminiRecipeService';
import {
  calculateEnhancedCompatibility,
  calculateRecipeNutrition,
  type Pet as CompatibilityPet,
} from '@/lib/utils/enhancedCompatibilityScoring';
import { normalizeSpecies as normalizeSpeciesKey } from '@/lib/utils/ingredientCompatibility';
import { getTargetScoreThresholdForSpecies } from '@/lib/services/speciesMealGeneration';

export const runtime = 'nodejs';

interface RecipeRequest {
  species?: string;
  count?: number;
  petProfile?: {
    name?: string;
    weight?: string;
    weightKg?: number;
    age?: string;
    allergies?: string[];
    healthConcerns?: string[];
    bannedIngredients?: string[];
  };
}

const MIN_COMPATIBILITY_SCORE = 65;
const COMPATIBILITY_SPECIES: CompatibilityPet['type'][] = ['dog', 'cat', 'bird', 'reptile', 'pocket-pet'];

function parseNumericValue(value?: string | number | null): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const match = value.match(/[\d.]+/);
    if (match) {
      const parsed = parseFloat(match[0]);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return undefined;
}

function buildCompatibilityPet(species: string, petProfile?: RecipeRequest['petProfile']): CompatibilityPet {
  const normalizedSpecies = normalizeSpeciesKey(species);
  const type = COMPATIBILITY_SPECIES.includes(normalizedSpecies as CompatibilityPet['type'])
    ? (normalizedSpecies as CompatibilityPet['type'])
    : 'dog';

  const name = petProfile?.name?.trim() || 'Pet';
  const age = parseNumericValue(petProfile?.age) ?? 3;
  const weight =
    (typeof petProfile?.weightKg === 'number' && Number.isFinite(petProfile.weightKg)
      ? petProfile.weightKg
      : parseNumericValue(petProfile?.weight)) ?? 10;

  const healthConcerns = petProfile?.healthConcerns?.filter(Boolean) ?? [];
  const allergies = petProfile?.allergies?.filter(Boolean) ?? [];
  const banned = petProfile?.bannedIngredients?.filter(Boolean) ?? [];
  const dietaryRestrictionsFromProfile = Array.isArray((petProfile as any)?.dietaryRestrictions)
    ? ((petProfile as any).dietaryRestrictions as string[]).filter(Boolean)
    : [];
  const dietaryRestrictions = [...dietaryRestrictionsFromProfile, ...banned, ...allergies];

  return {
    id: `pet-profile-${type}`,
    name,
    type,
    breed: type,
    age,
    weight,
    activityLevel: 'moderate',
    healthConcerns,
    dietaryRestrictions,
    allergies,
    dislikes: [],
    savedRecipes: [],
    names: name ? [name] : [],
    weightKg: weight,
  };
}

function extractTopIssues(scored: ReturnType<typeof calculateEnhancedCompatibility>): string[] {
  const issueLists: Array<string[] | undefined> = [
    scored.factors?.nutritionalAdequacy?.issues,
    scored.factors?.ingredientSafety?.issues,
    scored.factors?.allergenSafety?.issues,
    scored.factors?.healthAlignment?.issues,
  ];
  const out: string[] = [];
  const seen = new Set<string>();

  for (const list of issueLists) {
    if (!Array.isArray(list)) continue;
    for (const raw of list) {
      const s = String(raw || '').trim();
      if (!s) continue;
      const key = s.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(s);
      if (out.length >= 3) return out;
    }
    if (out.length >= 3) return out;
  }

  return out;
}

const normalizeTerm = (value: string): string =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const includesAnyTerm = (haystack: string, terms: string[]): boolean => {
  if (!terms.length) return false;
  const h = normalizeTerm(haystack);
  return terms.some((t) => {
    const term = normalizeTerm(t);
    if (!term) return false;
    return h.includes(term);
  });
};

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

function normalizeRequestSpecies(speciesRaw?: string): string {
  const s = String(speciesRaw || '').trim().toLowerCase();
  if (!s) return 'dogs';
  if (s === 'dog' || s === 'dogs') return 'dogs';
  if (s === 'cat' || s === 'cats') return 'cats';
  if (s === 'bird' || s === 'birds') return 'birds';
  if (s === 'reptile' || s === 'reptiles') return 'reptiles';
  if (s === 'pocket-pet' || s === 'pocket-pets' || s === 'pocket pet' || s === 'pocket pets') return 'pocket-pets';
  return s;
}

function validateAndNormalizeRecipes(params: {
  species: string;
  petProfile: RecipeRequest['petProfile'];
  payload: GeminiRecipePayload;
}): Array<Recipe & { estimatedCostPerMeal?: number }> {
  const { species, petProfile, payload } = params;
  const allergies = (petProfile?.allergies || []).filter(Boolean);
  const bannedIngredients = (petProfile?.bannedIngredients || []).filter(Boolean);
  const healthConcerns = (petProfile?.healthConcerns || []).filter(Boolean);
  const contraindications = healthConcerns.flatMap((c) => {
    const key = normalizeConcernKey(c);
    return HEALTH_CONTRAINDICATIONS[key] || HEALTH_CONTRAINDICATIONS[c] || [];
  });

  const allowed = new Set(getIngredientsForSpecies(species as any).map((i) => normalizeTerm(i.name)));
  const now = Date.now();

  const results: Array<Recipe & { estimatedCostPerMeal?: number }> = [];

  for (let idx = 0; idx < payload.recipes.length; idx++) {
    const r = payload.recipes[idx];
    if (!r || typeof r.name !== 'string' || !Array.isArray(r.ingredients) || r.ingredients.length === 0) {
      continue;
    }

    // Enforce vocabulary + hard blockers
    const ingredientNames = r.ingredients.map((i) => String(i?.name || '')).filter(Boolean);
    const combined = ingredientNames.join(' | ');

    const hasBlocked =
      includesAnyTerm(combined, allergies) ||
      includesAnyTerm(combined, bannedIngredients) ||
      includesAnyTerm(combined, contraindications);
    if (hasBlocked) continue;

    const vocabOk = ingredientNames.every((n) => allowed.has(normalizeTerm(n)));
    if (!vocabOk) continue;

    const recipe: Recipe & { estimatedCostPerMeal?: number } = {
      id: `gemini-${species}-${now}-${idx}`,
      name: r.name,
      category: species,
      ageGroup: [String(petProfile?.age || 'adult')],
      healthConcerns: healthConcerns.map(normalizeConcernKey),
      description: r.description || `Generated meal for ${petProfile?.name || 'your pet'}`,
      servings: typeof r.servings === 'number' && r.servings > 0 ? r.servings : 1,
      ingredients: r.ingredients.map((ing, j) => ({
        id: `gemini-${species}-${now}-${idx}-ing-${j}`,
        name: String(ing?.name || ''),
        amount: String(ing?.amount || ''),
      })),
      instructions: Array.isArray(r.instructions) && r.instructions.length > 0 ? r.instructions : ['Mix and serve.'],
      tags: ['Generated'],
    };

    if (typeof r.estimatedCostPerMeal === 'number' && Number.isFinite(r.estimatedCostPerMeal)) {
      recipe.estimatedCostPerMeal = r.estimatedCostPerMeal;
    }

    results.push(recipe);
  }

  return results;
}

/**
 * Generate recipes dynamically based on pet species
 * POST /api/recipes/generate
 * Body: { species: 'dogs' | 'cats' | 'birds' | 'reptiles' | 'pocket-pets', count?: number, petProfile?: {...} }
 */
export async function POST(request: NextRequest) {
  try {
    const body: RecipeRequest = await request.json();
    const species = normalizeRequestSpecies(body.species);
    const { petProfile } = body;

    const debug = request.nextUrl.searchParams.get('debug') === '1';

    const requestedCount = 10;

    console.log('[API] Generating Gemini recipes for pet:', {
      name: petProfile?.name,
      species,
      requestedCount,
      healthConcerns: petProfile?.healthConcerns || [],
      allergies: petProfile?.allergies || [],
      bannedIngredients: petProfile?.bannedIngredients || [],
    });

    const allowedIngredientNames = getIngredientsForSpecies(species as any)
      .map((i) => i.name)
      .filter(Boolean);

    const healthConcerns = (petProfile?.healthConcerns || []).filter(Boolean);
    const allergies = (petProfile?.allergies || []).filter(Boolean);
    const bannedIngredients = (petProfile?.bannedIngredients || []).filter(Boolean);
    const dietaryRestrictionsFromProfile = Array.isArray((petProfile as any)?.dietaryRestrictions)
      ? ((petProfile as any).dietaryRestrictions as string[]).filter(Boolean)
      : [];

    const perfectPet =
      healthConcerns.length === 0 &&
      allergies.length === 0 &&
      bannedIngredients.length === 0 &&
      dietaryRestrictionsFromProfile.length === 0;

    const threshold = Math.max(
      MIN_COMPATIBILITY_SCORE,
      getTargetScoreThresholdForSpecies(species, perfectPet)
    );

    const compatibilityPet = buildCompatibilityPet(species, petProfile);

    const allAttemptCandidates: Array<{ attempt: number; recipe: Recipe; score: number; topIssues: string[] }> = [];

    let lastPayload: GeminiRecipePayload | null = null;
    let lastModelUsed: string | null = null;
    let bestScore = -1;
    let bestAttemptRecipes: Recipe[] = [];
    let attemptsUsed = 0;

    for (let attempt = 1; attempt <= 3; attempt++) {
      attemptsUsed = attempt;
      const generationResult =
        attempt === 1
          ? await generateRecipesJsonWithFallback({
              species,
              count: requestedCount,
              petProfile,
              allowedIngredientNames,
            })
          : await generateRecipesJsonWithFallbackAndPrompt({
              species,
              count: requestedCount,
              petProfile,
              allowedIngredientNames,
              promptText: buildRevisionPromptText({
                species,
                petProfile,
                failingCandidates: bestAttemptRecipes.map((r) => ({
                  name: r.name,
                  ingredients: (r.ingredients || []).map((i: any) => ({
                    name: String(i?.name || ''),
                    amount: String(i?.amount || ''),
                  })),
                })),
                topIssuesByCandidate: allAttemptCandidates
                  .filter((c) => c.attempt === attempt - 1)
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 5)
                  .map((c) => ({
                    name: c.recipe.name,
                    score: c.score,
                    topIssues: c.topIssues,
                  })),
              }),
            });

      const { payload, modelUsed } = generationResult;
      lastPayload = payload;
      lastModelUsed = modelUsed;
      console.info(`[API] Gemini generation completed using model: ${modelUsed} (attempt ${attempt}/3)`);

      const generatedRecipes = validateAndNormalizeRecipes({
        species,
        petProfile,
        payload,
      }).slice(0, requestedCount);

      if (generatedRecipes.length === 0) {
        bestAttemptRecipes = [];
        continue;
      }

      const scored = generatedRecipes
        .map((recipe) => {
          try {
            const score = calculateEnhancedCompatibility(recipe, compatibilityPet);
            const topIssues = extractTopIssues(score);
            const nutrition = debug ? calculateRecipeNutrition(recipe, { includeBreakdown: true }) : null;
            const ca = nutrition?.calcium ?? null;
            const p = nutrition?.phosphorus ?? null;
            const caPRatio = ca !== null && p !== null && p > 0 ? ca / p : null;
            return {
              recipe,
              score: score.overallScore,
              topIssues,
              ...(debug
                ? {
                    debugNutrition: {
                      calcium: ca,
                      phosphorus: p,
                      caPRatio,
                      nutritionBreakdown: nutrition?.breakdown ?? null,
                    },
                  }
                : {}),
            };
          } catch (error) {
            console.error('[API] Compatibility scoring failed', { recipeId: recipe.id, error });
            return { recipe, score: 0, topIssues: ['Compatibility scoring failed'] };
          }
        })
        .sort((a, b) => b.score - a.score);

      for (const s of scored) {
        allAttemptCandidates.push({ attempt, recipe: s.recipe, score: s.score, topIssues: s.topIssues });
      }

      const attemptBest = scored[0]?.score ?? -1;
      if (attemptBest > bestScore) {
        bestScore = attemptBest;
        bestAttemptRecipes = scored.map((s) => s.recipe);
      } else {
        bestAttemptRecipes = scored.map((s) => s.recipe);
      }

      if (attemptBest >= threshold) {
        bestScore = attemptBest;
        bestAttemptRecipes = scored.map((s) => s.recipe);
        break;
      }
    }

    if (!bestAttemptRecipes || bestAttemptRecipes.length === 0) {
      return NextResponse.json(
        {
          error: 'Gemini returned no valid recipes after validation',
          species,
          attemptedCount: requestedCount,
          diagnostics: {
            requestedCount,
            rawRecipeCount: Array.isArray(lastPayload?.recipes) ? lastPayload?.recipes.length : 0,
            validRecipeCount: 0,
          },
        },
        { status: 500 }
      );
    }

    const top5 = allAttemptCandidates
      .slice()
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((c) => {
        const nutrition = debug ? calculateRecipeNutrition(c.recipe, { includeBreakdown: true }) : null;
        const ca = nutrition?.calcium ?? null;
        const p = nutrition?.phosphorus ?? null;
        const caPRatio = ca !== null && p !== null && p > 0 ? ca / p : null;
        return {
          name: c.recipe.name,
          score: c.score,
          topIssues: c.topIssues,
          ...(debug
            ? {
                nutrition: {
                  calcium: ca,
                  phosphorus: p,
                  caPRatio,
                  nutritionBreakdown: nutrition?.breakdown ?? null,
                },
              }
            : {}),
        };
      });

    return NextResponse.json({
      success: true,
      recipes: bestAttemptRecipes,
      stats: {
        total: bestAttemptRecipes.length,
        attemptCount: attemptsUsed,
        modelUsed: lastModelUsed,
        threshold,
        bestScore,
        ...(debug ? { topCandidates: top5 } : {}),
      },
    });
  } catch (error) {
    console.error('Recipe generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate recipes',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
