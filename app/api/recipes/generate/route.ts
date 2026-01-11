import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import type { Recipe } from '@/lib/types';
import { getIngredientsForSpecies } from '@/lib/data/ingredients';
import { HEALTH_CONTRAINDICATIONS, normalizeConcernKey } from '@/lib/data/healthBenefitMap';
import {
  buildRevisionPromptText,
  generateRecipesJsonWithFallback,
  generateRecipesJsonWithFallbackAndPrompt,
} from '@/lib/services/geminiRecipeService';
import { FieldValue } from 'firebase-admin/firestore';
import { calculateRecipeNutrition } from '@/lib/utils/recipeNutrition';
import { scoreWithSpeciesEngine } from '@/lib/utils/speciesScoringEngines';
import { normalizeSpecies as normalizeSpeciesKey } from '@/lib/utils/ingredientCompatibility';
import { getTargetScoreThresholdForSpecies } from '@/lib/services/speciesMealGeneration';
import { getRecommendationsForRecipe } from '@/lib/utils/nutritionalRecommendations';
import { getFirebaseAdminDb, getGeneratedRecipesCollectionPath } from '@/lib/services/firebaseAdmin';
import { type PetType } from '@/lib/utils/petType';
import { jsonError } from '@/lib/utils/apiResponse';
import {
  enforceRecipeGenerationRateLimit,
} from '@/lib/utils/recipeGenerationGuards';

export const runtime = 'nodejs';

function isSupplementLikeIngredient(ing: any): boolean {
  if (!ing) return false;
  const id = String(ing?.id || '').toLowerCase();
  const name = String(ing?.name || '').toLowerCase();
  const category = String(ing?.category || '').toLowerCase();
  const feedingRole = String(ing?.feedingRole || '').toLowerCase();

  if (category === 'supplement') return true;
  if (feedingRole === 'supplement') return true;

  const haystack = `${id} ${name}`;
  const keywords = [
    'supplement',
    'vitamin',
    'mineral',
    'capsule',
    'tablet',
    'softgel',
    'drops',
    'powder',
    'extract',
    'taurine',
    'calcium_carbonate',
    'calcium carbonate',
    'cuttlebone',
    'eggshell',
    'omega',
    'fish_oil',
    'fish oil',
    'salmon_oil',
    'salmon oil',
    'krill',
    'algae oil',
    'kelp',
    'spirulina',
    'probiotic',
    'psyllium',
    'enzyme',
    'glucosamine',
    'chondroitin',
    'msm',
    'l-carnitine',
    'quercetin',
    'curcumin',
  ];

  return keywords.some((kw) => haystack.includes(kw));
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function stripUndefinedDeep<T>(value: T): T {
  if (value === undefined) return value;
  if (Array.isArray(value)) {
    return value
      .map((v) => stripUndefinedDeep(v))
      .filter((v) => v !== undefined) as any;
  }
  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      const cleaned = stripUndefinedDeep(v as any);
      if (cleaned !== undefined) out[k] = cleaned;
    }
    return out as any;
  }
  return value;
}

interface RecipeRequest {
  petId?: string;
  species?: string;
  count?: number;
  userId?: string;
  petProfile?: {
    name?: string;
    breed?: string;
    weight?: string;
    weightKg?: number;
    age?: string;
    activityLevel?: 'sedentary' | 'moderate' | 'active' | 'very-active' | string;
    allergies?: string[];
    allergiesSeverity?: Record<string, 'low' | 'medium' | 'high'>;
    healthConcerns?: string[];
    dietaryRestrictions?: string[];
    dislikes?: string[];
    notes?: string;
    bannedIngredients?: string[];
  };
}

const MIN_COMPATIBILITY_SCORE = 60;
const COMPATIBILITY_SPECIES: PetType[] = ['dog', 'cat', 'bird', 'reptile', 'pocket-pet'];

type ScoringPet = {
  id: string;
  name: string;
  type: PetType;
  breed: string;
  age: number;
  weight: number;
  activityLevel?: 'sedentary' | 'moderate' | 'active' | 'very-active';
  healthConcerns: string[];
  dietaryRestrictions: string[];
  allergies?: string[];
  dislikes?: string[];
  savedRecipes?: any[];
  names?: string[];
  weightKg?: number;
};

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

function buildCompatibilityPet(species: string, petProfile?: RecipeRequest['petProfile']): ScoringPet {
  const normalizedSpecies = normalizeSpeciesKey(species);
  const type = COMPATIBILITY_SPECIES.includes(normalizedSpecies as PetType)
    ? (normalizedSpecies as PetType)
    : 'dog';

  const name = petProfile?.name?.trim() || 'Pet';
  const ageRaw = String(petProfile?.age || '').trim().toLowerCase();
  const age =
    ageRaw === 'baby'
      ? 0.5
      : ageRaw === 'young'
      ? 2
      : ageRaw === 'adult'
      ? 5
      : ageRaw === 'senior'
      ? 10
      : parseNumericValue(petProfile?.age) ?? 3;
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

  const breed = typeof petProfile?.breed === 'string' && petProfile.breed.trim() ? petProfile.breed.trim() : type;
  const activityLevelRaw = typeof (petProfile as any)?.activityLevel === 'string' ? String((petProfile as any).activityLevel) : undefined;
  const activityLevel =
    activityLevelRaw === 'sedentary' ||
    activityLevelRaw === 'moderate' ||
    activityLevelRaw === 'active' ||
    activityLevelRaw === 'very-active'
      ? (activityLevelRaw as ScoringPet['activityLevel'])
      : 'moderate';
  const dislikes = Array.isArray((petProfile as any)?.dislikes) ? ((petProfile as any).dislikes as string[]).filter(Boolean) : [];

  return {
    id: `pet-profile-${type}`,
    name,
    type,
    breed,
    age,
    weight,
    activityLevel,
    healthConcerns,
    dietaryRestrictions,
    allergies,
    dislikes,
    savedRecipes: [],
    names: name ? [name] : [],
    weightKg: weight,
  };
}

function extractTopIssues(scored: { warnings?: string[]; criticalViolations?: string[] }): string[] {
  const issues: string[] = [];
  const critical = Array.isArray(scored?.criticalViolations) ? scored.criticalViolations : [];
  const warnings = Array.isArray(scored?.warnings) ? scored.warnings : [];
  issues.push(...critical.slice(0, 2));
  issues.push(...warnings.slice(0, Math.max(0, 3 - issues.length)));
  return issues;
}

function inferNutritionalGapsFromScoring(params: {
  warnings: string[];
  criticalViolations: string[];
}): string[] {
  const all = [...(params.criticalViolations || []), ...(params.warnings || [])]
    .map((s) => String(s || '').toLowerCase())
    .filter(Boolean);

  const gaps = new Set<string>();
  const addIf = (needle: string, gap: string) => {
    if (all.some((w) => w.includes(needle))) gaps.add(gap);
  };

  addIf('taurine', 'taurine');
  addIf('calcium', 'calcium');
  addIf('phosphorus', 'phosphorus');
  addIf('ca:p', 'ca:p');
  addIf('calcium:phosphorus', 'ca:p');
  addIf('fiber', 'fiber');
  addIf('omega', 'omega');
  addIf('fatty acid', 'omega');
  addIf('protein', 'protein');
  addIf('vitamin', 'vitamin');

  return Array.from(gaps);
}

const normalizeTerm = (value: string): string =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const normalizeIngredientNameForVocab = (value: string): string => {
  let s = String(value || '').trim();
  if (!s) return '';
  // Strip parentheticals like "(cooked)" / "(raw)" / "(boneless)" etc.
  s = s.replace(/\([^)]*\)/g, ' ');
  // Strip common preparation descriptors that models like to append.
  s = s
    .replace(/\b(cooked|raw|boneless|skinless|chopped|diced|minced|ground|sliced|steamed|baked|boiled|roasted)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return normalizeTerm(s);
};

const includesAnyTerm = (haystack: string, terms: string[]): boolean => {
  if (!terms.length) return false;
  const h = normalizeTerm(haystack);
  return terms.some((t) => {
    const term = normalizeTerm(t);
    if (!term) return false;
    return h.includes(term);
  });
};

const normalizeSplitKey = (value: any) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ');

 const ORGAN_KEYWORDS = [
   'liver',
   'heart',
   'kidney',
   'giblet',
   'gizzard',
   'tripe',
   'offal',
   'organ',
   'spleen',
   'pancreas',
   'lung',
   'brain',
 ];

 const BANNED_MEAT_KEYWORDS = ['duck', 'rabbit'];

 function isOrganIngredient(i: any): boolean {
   const id = String(i?.id || '').toLowerCase();
   const name = String(i?.name || '').toLowerCase();
   const haystack = `${id} ${name}`.trim();
   if (!haystack) return false;
   return ORGAN_KEYWORDS.some((kw) => haystack.includes(kw));
 }

 function isBannedMeatIngredient(i: any): boolean {
   const category = String(i?.category || '').toLowerCase();
   if (category !== 'protein') return false;

   const id = String(i?.id || '').toLowerCase();
   const name = String(i?.name || '').toLowerCase();
   const haystack = `${id} ${name}`.trim();
   if (!haystack) return false;

   // Keep eggs (duck egg / duck eggs) if present
   if (haystack.includes('egg')) return false;

   return BANNED_MEAT_KEYWORDS.some((kw) => haystack.includes(kw));
 }

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

  const allowedIngredientObjs = getIngredientsForSpecies(species as any).filter((i: any) => !isSupplementLikeIngredient(i));
  const allowedById = new Map<string, string>();
  const allowedByNormalizedName = new Map<string, string>();
  for (const ing of allowedIngredientObjs) {
    const id = String(ing?.id || '').trim();
    const displayName = String(ing?.name || '').trim();
    if (id) allowedById.set(id.toLowerCase(), displayName || id);
    if (displayName) {
      const key = normalizeTerm(displayName);
      if (key && !allowedByNormalizedName.has(key)) allowedByNormalizedName.set(key, displayName);
    }
  }
  const now = Date.now();

  const results: Array<Recipe & { estimatedCostPerMeal?: number }> = [];

  for (let idx = 0; idx < payload.recipes.length; idx++) {
    const r = payload.recipes[idx];
    if (!r || typeof r.name !== 'string' || !Array.isArray(r.ingredients) || r.ingredients.length === 0) {
      continue;
    }

    // Enforce vocabulary + hard blockers
    const rawIngredientNames = r.ingredients.map((i) => String(i?.name || ''));
    const ingredientNamesForChecks = rawIngredientNames.filter(Boolean);
    const combined = ingredientNamesForChecks.join(' | ');

    const hasBlocked =
      includesAnyTerm(combined, allergies) ||
      includesAnyTerm(combined, bannedIngredients) ||
      includesAnyTerm(combined, contraindications);
    if (hasBlocked) continue;

    // Canonicalize ingredient identifiers from Gemini.
    // Primary contract: ingredient.name is a snake_case ingredient id.
    // Fallback: if Gemini returns display names, attempt normalization to map to the canonical display name.
    const canonicalizedNames: string[] = [];
    let vocabOk = true;
    for (const rawName of rawIngredientNames) {
      if (!String(rawName || '').trim()) {
        vocabOk = false;
        break;
      }
      const asId = String(rawName || '').trim().toLowerCase();
      const directIdMatch = allowedById.get(asId);
      if (directIdMatch) {
        canonicalizedNames.push(directIdMatch);
        continue;
      }
      const directNameMatch = allowedByNormalizedName.get(normalizeTerm(rawName));
      if (directNameMatch) {
        canonicalizedNames.push(directNameMatch);
        continue;
      }
      const relaxedNameMatch = allowedByNormalizedName.get(normalizeIngredientNameForVocab(rawName));
      if (relaxedNameMatch) {
        canonicalizedNames.push(relaxedNameMatch);
        continue;
      }
      vocabOk = false;
      break;
    }
    if (!vocabOk) continue;

    const recipe: Recipe = {
      id: `gemini-${species}-${now}-${idx}`,
      name: r.name,
      category: species,
      ageGroup: [String(petProfile?.age || 'adult')],
      healthConcerns: healthConcerns.map(normalizeConcernKey),
      description: r.description || '',
      servings: typeof r.servings === 'number' && r.servings > 0 ? r.servings : 1,
      ingredients: r.ingredients.map((ing, j) => ({
        id: `gemini-${species}-${now}-${idx}-ing-${j}`,
        name: canonicalizedNames[j] || String(ing?.name || ''),
        amount: String(ing?.amount || ''),
      })),
      instructions: Array.isArray(r.instructions) && r.instructions.length > 0 ? r.instructions : ['Mix and serve.'],
      tags: [],
    };

    if (typeof r.estimatedCostPerMeal === 'number' && Number.isFinite(r.estimatedCostPerMeal)) {
      (recipe as any).estimatedCostPerMeal = r.estimatedCostPerMeal;
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
    const { userId: authedUserId } = await auth();
    if (!authedUserId) {
      return jsonError({ code: 'UNAUTHORIZED', message: 'Please sign in to generate meals.', status: 401 });
    }

    let reqJson: RecipeRequest | null = null;
    try {
      reqJson = (await request.json()) as any;
    } catch {
      return jsonError({ code: 'INVALID_REQUEST', message: 'Invalid JSON', status: 400 });
    }
    if (!reqJson || typeof reqJson !== 'object') {
      return jsonError({ code: 'INVALID_REQUEST', message: 'Invalid request', status: 400 });
    }

    const body: RecipeRequest = reqJson as RecipeRequest;
    const petId = typeof body.petId === 'string' ? body.petId.trim() : '';
    if (!petId) {
      return jsonError({ code: 'INVALID_REQUEST', message: 'petId is required', status: 400 });
    }

    const species = normalizeRequestSpecies(body.species);
    const { petProfile } = body;
    const userId = authedUserId;

    const db = getFirebaseAdminDb();
    const nowMs = Date.now();

    const rl = await enforceRecipeGenerationRateLimit(db as any, userId, nowMs);
    if (rl.ok === false) {
      return jsonError({ code: 'RATE_LIMITED', message: rl.message, status: rl.status });
    }

    const debug = request.nextUrl.searchParams.get('debug') === '1';
    const debugEnabled =
      debug ||
      process.env.NODE_ENV !== 'production' ||
      ['true', '1'].includes(String(process.env.NEXT_PUBLIC_ENABLE_DEBUG ?? '').toLowerCase());

    const requestedByClient =
      typeof body.count === 'number' && Number.isFinite(body.count) && body.count > 0
        ? Math.floor(body.count)
        : 18;
    const targetCount = requestedByClient;
    const requestedCount = Math.max(24, targetCount * 2);
    const maxAttempts = 6;

    if (debugEnabled) {
      console.log('[API] Generating Gemini recipes for pet:', {
        name: petProfile?.name,
        species,
        userId,
        requestedCount,
        healthConcerns: petProfile?.healthConcerns || [],
        allergies: petProfile?.allergies || [],
        bannedIngredients: petProfile?.bannedIngredients || [],
      });
    }

    const allowedIngredientIds = getIngredientsForSpecies(species as any)
      .filter((i: any) => {
        // Supplements are handled separately by the app; Gemini should output whole-food meals only.
        if (isSupplementLikeIngredient(i)) return false;
        // Hard block organ meats entirely.
        if (isOrganIngredient(i)) return false;
        // Hard block duck and rabbit meats.
        if (isBannedMeatIngredient(i)) return false;
        return true;
      })
      .map((i) => String((i as any)?.id || ''))
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

    const threshold = MIN_COMPATIBILITY_SCORE;

    const compatibilityPet = buildCompatibilityPet(species, petProfile);

    const allAttemptCandidates: Array<{ attempt: number; recipe: Recipe; score: number; topIssues: string[] }> = [];

    let lastPayload: GeminiRecipePayload | null = null;
    let lastModelUsed: string | null = null;
    let bestScore = -1;
    let bestAttemptRecipes: Recipe[] = [];
    let bestAttemptAcceptedCount = 0;
    let attemptsUsed = 0;

    const collected: Recipe[] = [];
    const seenRecipeKeys = new Set<string>();
    const hasMinIngredients = (recipe: Recipe): boolean => {
      const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
      return ingredients.length >= 3;
    };

    const pushUnique = (recipe: Recipe) => {
      const key = `${String(recipe.name || '').toLowerCase()}|${String(recipe.category || '').toLowerCase()}`;
      if (!key || seenRecipeKeys.has(key)) return;
      seenRecipeKeys.add(key);
      collected.push(recipe);
    };

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      attemptsUsed = attempt;
      const generationResult =
        attempt === 1
          ? await generateRecipesJsonWithFallback({
              species,
              count: requestedCount,
              petProfile,
              allowedIngredientIds,
            })
          : await generateRecipesJsonWithFallbackAndPrompt({
              species,
              count: requestedCount,
              petProfile,
              allowedIngredientIds,
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
      if (debugEnabled) {
        console.info(`[API] Gemini generation completed using model: ${modelUsed} (attempt ${attempt}/3)`);
      }

      const generatedRecipesRaw = validateAndNormalizeRecipes({
        species,
        petProfile,
        payload,
      }).slice(0, requestedCount);

      const generatedRecipes = generatedRecipesRaw;

      if (generatedRecipes.length === 0) {
        bestAttemptRecipes = [];
        continue;
      }

      const scored = generatedRecipes
        .map((recipe) => {
          try {
            const speciesScore = scoreWithSpeciesEngine(recipe, compatibilityPet);
            const topIssues = extractTopIssues(speciesScore);

            const nutrition = calculateRecipeNutrition(recipe, { includeBreakdown: debug });
            const inferredGaps = inferNutritionalGapsFromScoring({
              warnings: speciesScore.warnings || [],
              criticalViolations: speciesScore.criticalViolations || [],
            });

            const supplementRecommendations = getRecommendationsForRecipe(
              inferredGaps,
              compatibilityPet.type,
              healthConcerns
            );

            (recipe as any).supplementRecommendations = supplementRecommendations;

            const ca = nutrition?.calcium ?? null;
            const p = nutrition?.phosphorus ?? null;
            const caPRatio = ca !== null && p !== null && p > 0 ? ca / p : null;
            return {
              recipe,
              score: speciesScore.overallScore,
              topIssues,
              supplementRecommendations,
              ...(debug
                ? {
                    debugNutrition: {
                      calcium: ca,
                      phosphorus: p,
                      caPRatio,
                      nutritionBreakdown: (nutrition as any)?.breakdown ?? null,
                    },
                  }
                : {}),
            };
          } catch (error) {
            console.error('[API] Compatibility scoring failed', { recipeId: recipe.id, error });
            return { recipe, score: 0, topIssues: ['Compatibility scoring failed'], supplementRecommendations: [] };
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
        bestAttemptAcceptedCount = scored.filter((s) => s.score >= threshold).length;
      } else {
        bestAttemptRecipes = scored.map((s) => s.recipe);
      }

      const acceptedThisAttempt = scored
        .filter((s) => s.score >= threshold)
        .map((s) => s.recipe)
        .filter(hasMinIngredients);

      for (const r of acceptedThisAttempt) {
        pushUnique(r);
        if (collected.length >= targetCount) break;
      }

      if (collected.length >= targetCount) {
        break;
      }

      if (attemptBest >= threshold) {
        bestScore = attemptBest;
        bestAttemptRecipes = scored.map((s) => s.recipe);
        bestAttemptAcceptedCount = scored.filter((s) => s.score >= threshold).length;
      }
    }

    if (collected.length < targetCount && bestAttemptRecipes.length > 0) {
      const fallback = bestAttemptRecipes.filter(hasMinIngredients);
      for (const r of fallback) {
        pushUnique(r);
        if (collected.length >= targetCount) break;
      }
    }

    let outputRecipes = collected.slice(0, targetCount);
    let fallbackUsed = false;
    let fallbackReason: string | undefined;

    if (outputRecipes.length === 0 && bestAttemptRecipes.length > 0) {
      outputRecipes = bestAttemptRecipes.slice(0, targetCount);
      fallbackUsed = true;
      fallbackReason = collected.length === 0 ? 'no recipes passed validation' : 'insufficient accepted recipes';
    }

    let persistFailed = false;
    try {
      const collectionRef = db.collection(getGeneratedRecipesCollectionPath());

      const persisted = await Promise.all(
        outputRecipes.map(async (recipe) => {
          const docRef = collectionRef.doc();
          const persistedRecipe = { ...(recipe as any), id: docRef.id };

          const payload = stripUndefinedDeep({
            userId,
            species,
            recipe: persistedRecipe,
            petProfile: petProfile || null,
            createdAt: FieldValue.serverTimestamp(),
          });

          await docRef.set(payload as any);

          return persistedRecipe as Recipe;
        })
      );

      outputRecipes = persisted as any;
    } catch (error) {
      console.error('[API] Failed to persist generated recipes to Firestore', error);
      persistFailed = true;
    }

    const supplementRecommendations = (() => {
      const all = outputRecipes
        .flatMap((r: any) => (Array.isArray(r?.supplementRecommendations) ? r.supplementRecommendations : []))
        .filter(Boolean);

      const seen = new Set<string>();
      const unique = [] as any[];
      for (const rec of all) {
        const key = String(rec?.name || '').trim().toLowerCase();
        if (!key || seen.has(key)) continue;
        seen.add(key);
        unique.push(rec);
      }
      return unique;
    })();

    if (!outputRecipes || outputRecipes.length === 0) {
      return NextResponse.json(
        {
          error: 'Gemini returned no valid recipes after validation',
          species,
          attemptedCount: requestedCount,
          diagnostics: {
            requestedCount,
            targetCount,
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
      recipes: outputRecipes,
      recipeIds: outputRecipes.map((r) => r.id),
      supplementRecommendations,
      diagnostics: {
        threshold,
        bestScore,
        noneMetThreshold: bestScore < threshold,
        acceptedCount: bestAttemptAcceptedCount,
        requestedCount,
        targetCount,
        returnedCount: outputRecipes.length,
        fallbackUsed,
        fallbackReason,
        ...(debug ? { persistFailed } : {}),
      },
      stats: {
        total: outputRecipes.length,
        attemptCount: attemptsUsed,
        modelUsed: lastModelUsed,
        threshold,
      },
      topCandidates: debug ? top5 : undefined,
      attempts: debug
        ? allAttemptCandidates.map((c) => ({
            name: c.recipe.name,
            score: c.score,
            topIssues: c.topIssues,
          }))
        : undefined,
    });
  } catch (error) {
    console.error('Recipe generation error:', error);
    const details =
      error instanceof Error
        ? String(error.message || error.stack || '')
        : String(error);
    return NextResponse.json(
      {
        error: 'Failed to generate recipes',
        details,
      },
      { status: 500 }
    );
  }
}
