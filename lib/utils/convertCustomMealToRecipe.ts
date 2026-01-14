import type { CustomMeal, Recipe } from '@/lib/types';

/**
 * Converts a CustomMeal to Recipe format for display in recipe detail pages
 */
export function convertCustomMealToRecipe(customMeal: CustomMeal): Recipe {
  // Helper function to identify supplements (same logic as in recipeNutrition.ts)
  const mapSupplementToCompositionKey = (ingredientName: string): string | null => {
    const lower = ingredientName.toLowerCase();
    if (lower.includes('taurine')) return 'taurine_powder';
    if (lower.includes('eggshell') || lower.includes('egg shell') || lower.includes('egg shells')) return 'calcium_carbonate';
    if (lower.includes('calcium') && (lower.includes('carbonate') || lower.includes('supplement'))) return 'calcium_carbonate';
    if (lower.includes('omega') || lower.includes('fish oil') || lower.includes('krill') || lower.includes('salmon oil')) return 'fish_oil';
    return null;
  };

  // Separate ingredients and supplements
  const regularIngredients: { id: string; name: string; amount: string }[] = [];
  const supplements: { id: string; name: string; amount: string }[] = [];

  customMeal.ingredients.forEach((ing, idx) => {
    const displayName = ing.key.replace(/_/g, ' ');
    const ingredient = {
      id: `${idx + 1}`,
      name: displayName,
      amount: `${ing.grams}g`,
    };

    // Check if this is a supplement
    if (mapSupplementToCompositionKey(displayName) !== null) {
      supplements.push(ingredient);
    } else {
      regularIngredients.push(ingredient);
    }
  });

  return {
    id: customMeal.id,
    name: customMeal.name,
    category: 'custom' as any,
    ageGroup: ['adult'],
    healthConcerns: [],
    description: `Custom meal created on ${customMeal.createdAt ? new Date(customMeal.createdAt).toLocaleDateString() : 'unknown date'}`,
    ingredients: regularIngredients,
    supplements: supplements.length > 0 ? supplements : undefined,
    instructions: [
      'Mix all ingredients according to saved recipe',
      'Serve at recommended portion size',
      `Recommended serving: ${customMeal.analysis.recommendedServingGrams}g`,
    ],
    nutritionalInfo: {
      protein: {
        min: (customMeal.analysis.nutrients.protein_g || 0) / (customMeal.analysis.totalRecipeGrams / 100),
        max: (customMeal.analysis.nutrients.protein_g || 0) / (customMeal.analysis.totalRecipeGrams / 100),
        unit: '%',
      },
      fat: {
        min: (customMeal.analysis.nutrients.fat_g || 0) / (customMeal.analysis.totalRecipeGrams / 100),
        max: (customMeal.analysis.nutrients.fat_g || 0) / (customMeal.analysis.totalRecipeGrams / 100),
        unit: '%',
      },
      calories: {
        min: customMeal.analysis.nutrients.kcal || customMeal.analysis.nutrients.calories_kcal || 0,
        max: customMeal.analysis.nutrients.kcal || customMeal.analysis.nutrients.calories_kcal || 0,
        unit: 'kcal',
      },
    },
    rating: 0,
    reviews: 0,
    tags: ['custom', 'user-created'],
  };
}

