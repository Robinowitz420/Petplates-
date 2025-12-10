import type { Recipe } from '@/lib/types';

export interface DailyNutrition {
  day: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber?: number;
}

export interface NutritionTargets {
  calories?: number;
  proteinRange?: [number, number];
  fatRange?: [number, number];
  carbsRange?: [number, number];
  fiberRange?: [number, number];
}

const safeNumber = (value: any, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const extractRecipeNutrition = (recipe: Recipe) => {
  // Prefer nutritionalCalculation if present (for custom meals)
  const calc = (recipe as any).nutritionalCalculation || (recipe as any).nutrition;
  if (calc) {
    return {
      calories: safeNumber(calc.calories),
      protein: safeNumber(calc.protein),
      fat: safeNumber(calc.fat),
      carbs: safeNumber(calc.carbs),
      fiber: safeNumber(calc.fiber),
    };
  }

  // Extract from nutritionalInfo (recipes-complete.ts format)
  const info = recipe.nutritionalInfo || {};
  
  // Calories are stored as absolute kcal values
  const calories = safeNumber(
    info.calories?.min || info.calories?.max || 
    parseFloat((recipe.nutritionInfo?.calories || '').replace(/[^0-9.]/g, '')) || 
    300
  );

  // Protein, fat, carbs, fiber are stored as percentages
  // Estimate serving size from calories (rough: ~4 kcal per gram average)
  // Then convert percentages to grams
  const estimatedServingGrams = calories / 3.5; // ~3.5 kcal/g average for pet food
  
  const proteinPercent = safeNumber(info.protein?.min || info.protein?.max || 0);
  const fatPercent = safeNumber(info.fat?.min || info.fat?.max || 0);
  const fiberPercent = safeNumber(info.fiber?.min || info.fiber?.max || 0);
  
  // Estimate carbs as remainder (100% - protein% - fat% - fiber% - water/ash ~70%)
  // Or use a conservative estimate
  const carbsPercent = Math.max(0, 100 - proteinPercent - fatPercent - fiberPercent - 70);
  
  return {
    calories,
    protein: (proteinPercent / 100) * estimatedServingGrams,
    fat: (fatPercent / 100) * estimatedServingGrams,
    carbs: (carbsPercent / 100) * estimatedServingGrams,
    fiber: (fiberPercent / 100) * estimatedServingGrams,
  };
};

export function calculateDailyNutrition(plan: { day: string; meals: Recipe[] }[]): DailyNutrition[] {
  return plan.map(({ day, meals }) => {
    const totals = meals.reduce(
      (acc, meal) => {
        const n = extractRecipeNutrition(meal);
        acc.calories += n.calories;
        acc.protein += n.protein;
        acc.fat += n.fat;
        acc.carbs += n.carbs;
        acc.fiber += n.fiber || 0;
        return acc;
      },
      { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 }
    );
    return {
      day,
      calories: Math.round(totals.calories),
      protein: Number(totals.protein.toFixed(1)),
      fat: Number(totals.fat.toFixed(1)),
      carbs: Number(totals.carbs.toFixed(1)),
      fiber: Number(totals.fiber.toFixed(1)),
    };
  });
}

export function getNutritionTargets(species?: string): NutritionTargets {
  const key = (species || '').toLowerCase();
  if (key.includes('cat')) {
    return { proteinRange: [28, 45], fatRange: [9, 20], calories: undefined };
  }
  if (key.includes('bird')) {
    return { proteinRange: [12, 22], fatRange: [4, 12] };
  }
  if (key.includes('reptile')) {
    return { proteinRange: [15, 28], fatRange: [4, 12] };
  }
  if (key.includes('pocket')) {
    return { proteinRange: [12, 20], fatRange: [2, 8], fiberRange: [15, 30] };
  }
  // Default dog
  return { proteinRange: [18, 35], fatRange: [8, 22] };
}