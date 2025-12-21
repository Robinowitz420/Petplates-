/**
 * PRAGMATIC RECIPE GENERATOR V3
 * Enhanced with health-aware ingredient selection
 * 
 * Flow:
 * 1. RecipeBuilder filters hard constraints (species, allergies, contraindications)
 * 2. RecipeBuilder scores ingredients (health 40%, nutrition 50%, quality 10%)
 * 3. RecipeBuilder selects top ingredients by category
 * 4. RecipeBuilder calculates portions and costs
 */

import type { Pet } from '@/lib/types';
import { RecipeBuilder, type GenerationConstraints, type GeneratedRecipeRaw, type DiversityMode } from '@/lib/generator/RecipeBuilder';
import type { IngredientCategory } from '@/lib/data/ingredients';

/**
 * Normalize ingredient category strings to canonical values.
 * Handles variations like 'fish', 'seafood', 'meat', 'poultry' → 'protein'
 */
function canonicalCategory(cat: any): IngredientCategory | 'unknown' {
  const c = String(cat ?? '').toLowerCase().trim();

  // PROTEIN family (fish, meat, poultry, seafood, eggs)
  if (
    c === 'protein' ||
    c.includes('protein') ||
    c.includes('meat') ||
    c.includes('poultry') ||
    c.includes('fish') ||
    c.includes('seafood') ||
    c.includes('egg')
  ) return 'protein';

  // VEGETABLE family
  if (c === 'vegetable' || c.includes('veg')) return 'vegetable';

  // FAT family (oils)
  if (c === 'fat' || c.includes('oil')) return 'fat';

  // CARB family (grains, starches)
  if (c === 'carb' || c.includes('grain') || c.includes('starch')) return 'carb';

  // Keep specialized categories as-is
  if (['seed', 'nut', 'fruit', 'insect', 'hay', 'pellet', 'supplement'].includes(c)) {
    return c as IngredientCategory;
  }

  return 'unknown';
}

export interface GenerateRecipeOptions {
  pet: Pet;
  budgetPerMeal?: number;
  targetCalories?: number;
  diversityMode?: DiversityMode;
  recentIngredients?: string[]; // Track recently used ingredients for variety
}

export interface GeneratedRecipe {
  id: string;
  name: string;
  ingredients: Array<{ name: string; amount: string }>;
  nutrition: {
    protein: number;
    fat: number;
    fiber: number;
    kcal: number;
  };
  scores: {
    health: number;
    nutrition: number;
    cost: number;
    quality: number;
    overall: number;
  };
  debugInfo?: {
    candidateCount: number;
    topScores: Array<{ name: string; score: number; breakdown: any }>;
  };
}

/**
 * Generate a recipe for a pet using enhanced pragmatic approach
 */
export function generateRecipeForPet(options: GenerateRecipeOptions): GeneratedRecipe | null {
  const { pet, budgetPerMeal = 4.0, targetCalories = 500, diversityMode = 'medium', recentIngredients = [] } = options;

  console.log(`\n🔧 Generating recipe for ${pet.name}...`);

  try {
    // Build constraints from pet profile
    const constraints: GenerationConstraints = {
      species: pet.type as any,
      lifeStage: 'adult', // TODO: derive from pet.age
      healthConcerns: pet.healthConcerns,
      budgetPerMeal,
      targetCalories,
      allergies: pet.allergies?.map(a => a.toLowerCase()),
      bannedIngredients: pet.bannedIngredients?.map(b => b.toLowerCase()),
      recentIngredients, // Pass to builder for diversity penalties
    };

    // Generate with different quality tiers
    const candidates: GeneratedRecipe[] = [];

    for (let tier = 0; tier < 3; tier++) {
      const tierName = ['premium', 'standard', 'budget'][tier] as 'premium' | 'standard' | 'budget';
      const builder = new RecipeBuilder(constraints, tierName, diversityMode);
      const raw = builder.generate();

      if (!raw) continue;

      // Convert to GeneratedRecipe
      const recipe = assembleRecipe(raw, pet);
      if (recipe) {
        candidates.push(recipe);
      }
    }

    if (candidates.length === 0) {
      console.warn(`Failed to generate any recipes for ${pet.name}`);
      return null;
    }

    // Return highest scoring recipe
    const best = candidates.sort((a, b) => b.scores.overall - a.scores.overall)[0];

    console.log(`✨ Generated: ${best.name}`);
    console.log(
      `   Scores: Health=${best.scores.health} Quality=${best.scores.quality} Overall=${best.scores.overall}`
    );

    return best;
  } catch (error) {
    console.error(`Error generating recipe for ${pet.name}:`, error);
    return null;
  }
}

/**
 * Generate multiple recipes for a pet with ingredient tracking for variety
 */
export function generateRecipesForPet(
  options: GenerateRecipeOptions,
  count: number = 3
): GeneratedRecipe[] {
  const recipes: GeneratedRecipe[] = [];
  const recentIngredients: string[] = []; // Track last 10 ingredients used
  const TRACKING_WINDOW = 10; // Remember last 10 ingredients

  for (let i = 0; i < count; i++) {
    try {
      // Pass recent ingredients to enforce variety
      const recipe = generateRecipeForPet({
        ...options,
        recentIngredients: [...recentIngredients], // Pass copy
      });
      
      if (recipe) {
        recipes.push(recipe);
        
        // Track ingredients from this recipe
        recipe.ingredients.forEach(ing => {
          recentIngredients.push(ing.name.toLowerCase());
        });
        
        // Keep only last N ingredients
        if (recentIngredients.length > TRACKING_WINDOW) {
          recentIngredients.splice(0, recentIngredients.length - TRACKING_WINDOW);
        }
        
        if ((i + 1) % 10 === 0) {
          console.log(`Generated ${i + 1}/${count} recipes. Recent ingredients: ${recentIngredients.slice(-5).join(', ')}`);
        }
      }
    } catch (error) {
      console.error(`Failed to generate recipe ${i + 1}:`, error);
    }
  }

  return recipes;
}

/**
 * Assemble GeneratedRecipe from raw builder output
 */
function assembleRecipe(raw: GeneratedRecipeRaw, pet: Pet): GeneratedRecipe | null {
  if (!raw.ingredients || raw.ingredients.length === 0) {
    return null;
  }

  // Calculate nutrition totals
  let totalProtein = 0,
    totalFat = 0,
    totalFiber = 0,
    totalKcal = 0;

  for (const p of raw.ingredients) {
    const comp = p.ingredient.composition;
    const ratio = p.grams / 100;
    totalProtein += (comp.protein || 0) * ratio;
    totalFat += (comp.fat || 0) * ratio;
    totalFiber += (comp.fiber || 0) * ratio;
    totalKcal += (comp.kcal || 100) * ratio;
  }

  // Generate recipe name using canonicalCategory
  const proteinNames = raw.ingredients
    .filter(p => canonicalCategory(p.ingredient.category) === 'protein')
    .map(p => p.ingredient.name);
  const name = proteinNames.length > 0 
    ? `${pet.name}'s ${proteinNames.join(' & ')} Bowl`
    : `${pet.name}'s Custom Bowl`;

  // Calculate average scores from debug info
  let avgHealth = 50,
    avgPalatability = 50,
    avgQuality = 50,
    avgNutrition = 50;

  if (raw.debugInfo?.topScores && raw.debugInfo.topScores.length > 0) {
    const topBreakdowns = raw.debugInfo.topScores.slice(0, raw.ingredients.length);
    avgHealth =
      topBreakdowns.reduce((sum, s) => sum + s.breakdown.health, 0) / topBreakdowns.length;
    avgPalatability =
      topBreakdowns.reduce((sum, s) => sum + s.breakdown.taste, 0) / topBreakdowns.length;
    avgQuality =
      topBreakdowns.reduce((sum, s) => sum + s.breakdown.quality, 0) / topBreakdowns.length;
    avgNutrition =
      topBreakdowns.reduce((sum, s) => sum + s.breakdown.nutrition, 0) / topBreakdowns.length;
  }

  const costScore = raw.estimatedCost < 4.0 ? 90 : raw.estimatedCost < 6.0 ? 70 : 50;
  const overall = Math.round(
    (avgHealth * 0.4 + avgPalatability * 0.3 + avgQuality * 0.2 + avgNutrition * 0.1) * 0.7 +
      costScore * 0.3
  );

  return {
    id: `generated-${Date.now()}`,
    name,
    ingredients: raw.ingredients.map(p => ({
      name: p.ingredient.name,
      amount: `${p.grams}g`,
    })),
    nutrition: {
      protein: Math.round(totalProtein * 10) / 10,
      fat: Math.round(totalFat * 10) / 10,
      fiber: Math.round(totalFiber * 10) / 10,
      kcal: Math.round(totalKcal),
    },
    scores: {
      health: Math.round(avgHealth),
      nutrition: Math.round(avgNutrition),
      cost: costScore,
      quality: Math.round(avgQuality),
      overall,
    },
    debugInfo: raw.debugInfo,
  };
}
