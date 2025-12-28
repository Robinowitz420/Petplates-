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
import { getRecommendationsForRecipe } from '@/lib/utils/nutritionalRecommendations';

export const runtime = 'nodejs';

interface RecipeRequest {
  species?: string;
  count?: number;
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

  const breed = typeof petProfile?.breed === 'string' && petProfile.breed.trim() ? petProfile.breed.trim() : type;
  const activityLevelRaw = typeof (petProfile as any)?.activityLevel === 'string' ? String((petProfile as any).activityLevel) : undefined;
  const activityLevel =
    activityLevelRaw === 'sedentary' ||
    activityLevelRaw === 'moderate' ||
    activityLevelRaw === 'active' ||
    activityLevelRaw === 'very-active'
      ? (activityLevelRaw as CompatibilityPet['activityLevel'])
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

const SUPPLEMENT_KEYWORDS = [
  'vitamin',
  'mineral',
  'supplement',
  'probiotic',
  'enzyme',
  'omega',
  'fish oil',
  'salmon oil',
  'anchovy oil',
  'sardine oil',
  'mackerel oil',
  'krill oil',
  'algae oil',
  'herring oil',
  'oil',
  'calcium',
  'carbonate',
  'eggshell',
  'taurine',
  'psyllium',
  'glucosamine',
  'chondroitin',
  'sam-e',
  's-adenosyl',
  'quercetin',
  'curcumin',
  'l-carnitine',
  'd-mannose',
  'fructooligosaccharides',
  'fos',
  'inulin',
  'mannanoligosaccharides',
  'mos',
  'beta-glucan',
  'hyaluronic',
  'b complex',
];

function isSupplementLikeName(name: any) {
  const n = normalizeSplitKey(name);
  if (!n) return false;
  for (const kw of SUPPLEMENT_KEYWORDS) {
    if (n.includes(kw)) return true;
  }
  return false;
}

function splitSupplementsFromIngredients(recipe: Recipe): Recipe {
  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  const supplements = Array.isArray((recipe as any).supplements) ? ((recipe as any).supplements as any[]) : [];

  const supplementKeySet = new Set<string>(supplements.map((s: any) => normalizeSplitKey(s?.name)));
  const movedSupplements: any[] = [];
  const keptIngredients: any[] = [];

  for (const ing of ingredients) {
    const name = (ing as any)?.name || (ing as any)?.productName;
    if (isSupplementLikeName(name)) {
      const key = normalizeSplitKey(name);
      if (key && !supplementKeySet.has(key)) {
        movedSupplements.push({ ...ing, name: String(name) });
        supplementKeySet.add(key);
      }
    } else {
      keptIngredients.push(ing);
    }
  }

  return {
    ...recipe,
    ingredients: keptIngredients as any,
    supplements: [...supplements, ...movedSupplements] as any,
  };
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

  const allowedIngredientObjs = getIngredientsForSpecies(species as any);
  const allowedById = new Map<string, string>();
  const allowedByNormalizedName = new Map<string, string>();
  for (const ing of allowedIngredientObjs) {
    const id = String((ing as any)?.id || '').trim();
    const displayName = String((ing as any)?.name || '').trim();
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
        name: canonicalizedNames[j] || String(ing?.name || ''),
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

function normalizeCalciumSupplementIngredientKey(nameRaw: string): 'calcium_carbonate' | null {
  const name = String(nameRaw || '').toLowerCase();
  if (!name) return null;
  if (name.includes('calcium carbonate')) return 'calcium_carbonate';
  if (name.includes('calcium_carbonate')) return 'calcium_carbonate';
  if (name.includes('eggshell') || name.includes('egg shell') || name.includes('egg shells') || name.includes('egg-shell')) {
    return 'calcium_carbonate';
  }
  return null;
}

function normalizeCalciumSupplement(
  recipe: Recipe,
  species: string,
  petProfile?: RecipeRequest['petProfile']
): Recipe {
  if (!(species === 'dogs' || species === 'cats')) return recipe;

  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  if (ingredients.length === 0) return recipe;

  const supplements = Array.isArray((recipe as any).supplements) ? ((recipe as any).supplements as any[]) : [];

  const calciumSuppIdxs: number[] = [];
  for (let i = 0; i < ingredients.length; i++) {
    const ing = ingredients[i] as any;
    const key = normalizeCalciumSupplementIngredientKey(ing?.name);
    if (key === 'calcium_carbonate') calciumSuppIdxs.push(i);
  }

  const supplementsToRemove = new Set<string>();
  for (const s of supplements) {
    const key = normalizeCalciumSupplementIngredientKey((s as any)?.name);
    if (key === 'calcium_carbonate') supplementsToRemove.add(normalizeSplitKey((s as any)?.name));
  }

  const ageRaw = String(petProfile?.age || '').toLowerCase();
  const isPuppy = /puppy|growth|kitten/.test(ageRaw);
  const targetRatio = isPuppy ? 1.6 : 1.8;

  const baseRecipe: Recipe = {
    ...recipe,
    ingredients: ingredients.filter((_, idx) => !calciumSuppIdxs.includes(idx)) as any,
  };

  const baseNutrition = calculateRecipeNutrition(baseRecipe, { includeBreakdown: true });
  const breakdown = baseNutrition?.breakdown || [];
  const baseCaMg = breakdown.reduce((sum, r) => sum + (Number(r?.calciumMg) || 0), 0);
  const basePMg = breakdown.reduce((sum, r) => sum + (Number(r?.phosphorusMg) || 0), 0);

  const desiredTotalCaMg = basePMg * targetRatio;
  const supplementCaMgNeeded = Math.max(0, desiredTotalCaMg - baseCaMg);

  // Calcium carbonate is ~40% elemental Ca => 400mg Ca per gram.
  let grams = supplementCaMgNeeded / 400;

  // Clamp to a sane range so models can't produce extreme values.
  const minG = 0.5;
  const maxG = 3.0;
  if (supplementCaMgNeeded > 0) {
    grams = Math.max(minG, Math.min(maxG, grams));
  } else {
    grams = 0;
  }

  // Strip any existing calcium carbonate/eggshell entries (defensive) and always add a single
  // canonical calcium carbonate ingredient post-processing.
  const updatedIngredients = ingredients
    .filter((_, idx) => !calciumSuppIdxs.includes(idx))
    .map((ing: any) => ing);

  const updatedSupplements = supplements
    .filter((s: any) => !supplementsToRemove.has(normalizeSplitKey(s?.name)))
    .map((s: any) => s);

  if (grams > 0) {
    updatedSupplements.push({
      id: `${recipe.id || 'recipe'}-supp-calcium-carbonate`,
      name: 'calcium carbonate',
      amount: `${grams.toFixed(1)}g`,
    });
  }

  return {
    ...recipe,
    ingredients: updatedIngredients as any,
    supplements: updatedSupplements as any,
  };
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

    const requestedByClient =
      typeof body.count === 'number' && Number.isFinite(body.count) && body.count > 0
        ? Math.floor(body.count)
        : 9;
    const targetCount = Math.max(9, requestedByClient);
    const requestedCount = Math.max(12, targetCount * 2);
    const maxAttempts = 6;

    console.log('[API] Generating Gemini recipes for pet:', {
      name: petProfile?.name,
      species,
      requestedCount,
      healthConcerns: petProfile?.healthConcerns || [],
      allergies: petProfile?.allergies || [],
      bannedIngredients: petProfile?.bannedIngredients || [],
    });

    const allowedIngredientIds = getIngredientsForSpecies(species as any)
      .filter((i: any) => {
        const category = String(i?.category || '').toLowerCase();
        // Supplements are handled separately by the app; Gemini should output whole-food meals only.
        if (category === 'supplement') return false;
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
      console.info(`[API] Gemini generation completed using model: ${modelUsed} (attempt ${attempt}/3)`);

      const generatedRecipesRaw = validateAndNormalizeRecipes({
        species,
        petProfile,
        payload,
      }).slice(0, requestedCount);

      const generatedRecipes = generatedRecipesRaw.map((r) => splitSupplementsFromIngredients(r));

      if (generatedRecipes.length === 0) {
        bestAttemptRecipes = [];
        continue;
      }

      const scored = generatedRecipes
        .map((recipe) => {
          try {
            const score = calculateEnhancedCompatibility(recipe, compatibilityPet);
            const topIssues = extractTopIssues(score);
            const supplementRecommendations = getRecommendationsForRecipe(
              (score as any)?.detailedBreakdown?.nutritionalGaps || [],
              compatibilityPet.type,
              healthConcerns
            );

            (recipe as any).supplementRecommendations = supplementRecommendations;

            const nutrition = debug ? calculateRecipeNutrition(recipe, { includeBreakdown: true }) : null;
            const ca = nutrition?.calcium ?? null;
            const p = nutrition?.phosphorus ?? null;
            const caPRatio = ca !== null && p !== null && p > 0 ? ca / p : null;
            return {
              recipe,
              score: score.overallScore,
              topIssues,
              supplementRecommendations,
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

    const outputRecipes = collected.slice(0, targetCount);

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
      supplementRecommendations,
      diagnostics: {
        threshold,
        bestScore,
        noneMetThreshold: bestScore < threshold,
        acceptedCount: bestAttemptAcceptedCount,
        requestedCount,
        targetCount,
        returnedCount: outputRecipes.length,
      },
      stats: {
        total: outputRecipes.length,
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
