import type { Pet } from '@/lib/types';
import {
  generateRecipeForPet,
  generateRecipesForPet,
  type GeneratedRecipe as GeneratedRecipeV3,
} from '@/lib/recipe-generator-v3';

export type RecipeV2 = {
  id: string;
  name: string;
  ingredients: Array<{ name: string; amount: string }>;
  nutrition: {
    protein: number;
    fat: number;
    fiber: number;
    kcal: number;
    caPRatio?: number;
  };
  score: number;
  scoreBreakdown: {
    nutrition: number;
    health: number;
    cost: number;
    variety: number;
    quality: number;
  };
  estimatedCost: number;
  instructions: string[];
  portionGuidance: {
    servingSize: string;
    servingsPerDay: number;
    dailyCalories: number;
  };
  explanation: string;
  validation: {
    isValid: boolean;
    score: number;
    errors: string[];
    warnings: string[];
  };
};

export type GenerateRecipeV2Options = {
  pet: Pet;
  budgetPerMeal?: number;
  targetCalories?: number;
};

function clamp0to100(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function v3ToV2(recipe: GeneratedRecipeV3, opts: GenerateRecipeV2Options): RecipeV2 {
  const score = clamp0to100(recipe.scores.overall);

  return {
    id: recipe.id,
    name: recipe.name,
    ingredients: recipe.ingredients,
    nutrition: {
      protein: recipe.nutrition.protein,
      fat: recipe.nutrition.fat,
      fiber: recipe.nutrition.fiber,
      kcal: recipe.nutrition.kcal,
      caPRatio: 1.5,
    },
    score,
    scoreBreakdown: {
      nutrition: clamp0to100(recipe.scores.nutrition),
      health: clamp0to100(recipe.scores.health),
      cost: clamp0to100(recipe.scores.cost),
      variety: 70,
      quality: clamp0to100(recipe.scores.quality),
    },
    estimatedCost: typeof opts.budgetPerMeal === 'number' ? opts.budgetPerMeal : 4.0,
    instructions: [
      'Prep ingredients and measure portions.',
      'Cook or combine components using safe handling practices.',
      'Cool, portion, and store appropriately.',
    ],
    portionGuidance: {
      servingSize: '1 serving',
      servingsPerDay: 2,
      dailyCalories: typeof opts.targetCalories === 'number' ? opts.targetCalories : recipe.nutrition.kcal,
    },
    explanation: 'Generated using Pet Plates recipe planning logic. Use this as educational guidance and consult a qualified animal health professional for medical conditions.',
    validation: {
      isValid: true,
      score,
      errors: [],
      warnings: [],
    },
  };
}

export function generateRecipe(options: GenerateRecipeV2Options): RecipeV2 | null {
  const raw = generateRecipeForPet({
    pet: options.pet,
    budgetPerMeal: options.budgetPerMeal,
    targetCalories: options.targetCalories,
  });

  if (!raw) return null;
  return v3ToV2(raw, options);
}

export function generateRecipes(options: GenerateRecipeV2Options, count: number = 3): RecipeV2[] {
  const raws = generateRecipesForPet(
    {
      pet: options.pet,
      budgetPerMeal: options.budgetPerMeal,
      targetCalories: options.targetCalories,
    },
    count
  );

  return raws.map((r) => v3ToV2(r, options));
}

export function generateBestRecipe(options: GenerateRecipeV2Options): RecipeV2 | null {
  const recipes = generateRecipes(options, 5);
  if (recipes.length === 0) return null;

  return recipes.reduce((best, cur) => (cur.score > best.score ? cur : best), recipes[0]);
}
