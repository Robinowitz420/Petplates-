import { NextRequest, NextResponse } from 'next/server';
import type { Recipe } from '@/lib/types';
import { getIngredientsForSpecies } from '@/lib/data/ingredients';
import { HEALTH_CONTRAINDICATIONS, normalizeConcernKey } from '@/lib/data/healthBenefitMap';
import { generateRecipesJsonWithFallback } from '@/lib/services/geminiRecipeService';

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
    const { species = 'dogs', count = 50, petProfile } = body;

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

    const { payload, modelUsed } = await generateRecipesJsonWithFallback({
      species,
      count: requestedCount,
      petProfile,
      allowedIngredientNames,
    });
    console.info(`[API] Gemini generation completed using model: ${modelUsed}`);

    const generatedRecipes = validateAndNormalizeRecipes({
      species,
      petProfile,
      payload,
    }).slice(0, requestedCount);

    if (generatedRecipes.length === 0) {
      return NextResponse.json(
        {
          error: 'Gemini returned no valid recipes after validation',
          species,
          attemptedCount: requestedCount,
          diagnostics: {
            requestedCount,
            rawRecipeCount: Array.isArray(payload?.recipes) ? payload.recipes.length : 0,
            validRecipeCount: generatedRecipes.length,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      recipes: generatedRecipes,
      stats: {
        total: generatedRecipes.length,
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
