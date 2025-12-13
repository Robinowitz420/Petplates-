import type { CustomMeal, Recipe } from '@/lib/types';

/**
 * Converts a CustomMeal to Recipe format for display in recipe detail pages
 */
export function convertCustomMealToRecipe(customMeal: CustomMeal): Recipe {
  return {
    id: customMeal.id,
    name: customMeal.name,
    category: 'custom' as any,
    ageGroup: ['adult'],
    healthConcerns: [],
    description: `Custom meal created on ${customMeal.createdAt ? new Date(customMeal.createdAt).toLocaleDateString() : 'unknown date'}`,
    ingredients: customMeal.ingredients.map((ing, idx) => ({
      id: `${idx + 1}`,
      name: ing.key.replace(/_/g, ' '),
      amount: `${ing.grams}g`,
    })),
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

