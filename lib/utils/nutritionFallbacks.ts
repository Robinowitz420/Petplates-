// lib/utils/nutritionFallbacks.ts
// Category-based nutrition fallback data for ingredients missing from INGREDIENT_COMPOSITIONS
// Used when ingredient lookup fails to ensure recipe generation can continue

import type { IngredientComposition } from '@/lib/data/ingredientCompositions';

/**
 * Category-based nutrition templates for fallback data
 * Based on USDA averages and research-based estimates for common ingredient categories
 */
export const CATEGORY_NUTRITION_FALLBACKS: Record<string, IngredientComposition> = {
  poultry: {
    protein: 20.0,
    fat: 8.0,
    carbs: 0,
    fiber: 0,
    moisture: 70,
    calcium: 10,
    phosphorus: 180,
    kcal: 145,
    source: 'estimated_fallback',
    needsReview: true,
  },
  red_meat: {
    protein: 22.0,
    fat: 12.0,
    carbs: 0,
    fiber: 0,
    moisture: 65,
    calcium: 12,
    phosphorus: 190,
    kcal: 180,
    source: 'estimated_fallback',
    needsReview: true,
  },
  fish: {
    protein: 19.0,
    fat: 6.0,
    carbs: 0,
    fiber: 0,
    moisture: 75,
    calcium: 25,
    phosphorus: 220,
    omega3: 1.5,
    kcal: 130,
    source: 'estimated_fallback',
    needsReview: true,
  },
  insect: {
    protein: 15.0,
    fat: 8.0,
    carbs: 5,
    fiber: 2,
    moisture: 70,
    calcium: 30,
    phosphorus: 200,
    kcal: 140,
    source: 'estimated_fallback',
    needsReview: true,
  },
  vegetable: {
    protein: 2.0,
    fat: 0.5,
    carbs: 12,
    fiber: 3,
    moisture: 85,
    calcium: 30,
    phosphorus: 40,
    kcal: 50,
    source: 'estimated_fallback',
    needsReview: true,
  },
  fruit: {
    protein: 1.0,
    fat: 0.3,
    carbs: 15,
    fiber: 2,
    moisture: 80,
    calcium: 10,
    phosphorus: 20,
    kcal: 60,
    source: 'estimated_fallback',
    needsReview: true,
  },
  supplement: {
    protein: 0,
    fat: 0,
    carbs: 0,
    fiber: 0,
    moisture: 5,
    calcium: 500, // High calcium for supplements
    phosphorus: 300,
    kcal: 0,
    source: 'estimated_fallback',
    needsReview: true,
  },
  grain: {
    protein: 8.0,
    fat: 2.0,
    carbs: 75,
    fiber: 5,
    moisture: 10,
    calcium: 20,
    phosphorus: 150,
    kcal: 350,
    source: 'estimated_fallback',
    needsReview: true,
  },
  seed: {
    protein: 15.0,
    fat: 10.0,
    carbs: 50,
    fiber: 8,
    moisture: 8,
    calcium: 50,
    phosphorus: 400,
    kcal: 500,
    source: 'estimated_fallback',
    needsReview: true,
  },
  hay: {
    protein: 8.0,
    fat: 2.0,
    carbs: 60,
    fiber: 30,
    moisture: 10,
    calcium: 40,
    phosphorus: 30,
    kcal: 200,
    source: 'estimated_fallback',
    needsReview: true,
  },
  // Enhanced categories
  leafy_green: {
    protein: 2.5,
    fat: 0.4,
    carbs: 3,
    fiber: 2.5,
    moisture: 92,
    calcium: 100,
    phosphorus: 50,
    kcal: 20,
    source: 'estimated_fallback',
    needsReview: true,
  },
  starchy_veg: {
    protein: 2.0,
    fat: 0.2,
    carbs: 20,
    fiber: 3,
    moisture: 75,
    calcium: 30,
    phosphorus: 50,
    kcal: 85,
    source: 'estimated_fallback',
    needsReview: true,
  },
  fatty_protein: {
    protein: 18.0,
    fat: 15.0,
    carbs: 0,
    fiber: 0,
    moisture: 65,
    calcium: 15,
    phosphorus: 200,
    kcal: 220,
    source: 'estimated_fallback',
    needsReview: true,
  },
  lean_protein: {
    protein: 28.0,
    fat: 3.0,
    carbs: 0,
    fiber: 0,
    moisture: 68,
    calcium: 10,
    phosphorus: 200,
    kcal: 140,
    source: 'estimated_fallback',
    needsReview: true,
  },
};

/**
 * Confidence levels for fallback categories
 */
export const FALLBACK_CONFIDENCE: Record<string, 'high' | 'medium' | 'low'> = {
  poultry: 'medium',
  red_meat: 'medium',
  fish: 'medium',
  insect: 'low',
  vegetable: 'medium',
  fruit: 'medium',
  supplement: 'low',
  grain: 'medium',
  seed: 'medium',
  hay: 'medium',
  leafy_green: 'medium',
  starchy_veg: 'medium',
  fatty_protein: 'medium',
  lean_protein: 'medium',
};

/**
 * Species-specific fallback adjustments
 */
export const SPECIES_FALLBACK_ADJUSTMENTS: Record<string, Partial<IngredientComposition>> = {
  // Cats need more protein and taurine
  cat: {
    // No direct adjustment, but recipes should be tagged
  },
  // Birds need more calcium
  bird: {
    // No direct adjustment, but recipes should be tagged
  },
  // Reptiles need specific Ca:P ratios
  reptile: {
    // No direct adjustment, but recipes should be tagged
  },
};

/**
 * Get fallback nutrition data for an ingredient based on its name patterns
 * @param ingredientName - The ingredient name to match
 * @returns IngredientComposition with estimated values, or default fallback
 */
export function getFallbackNutrition(ingredientName: string): IngredientComposition {
  const lowerName = ingredientName.toLowerCase().trim();
  
  // Lean protein patterns (breast, fillet)
  if ((lowerName.includes('chicken') || lowerName.includes('turkey')) && 
      (lowerName.includes('breast') || lowerName.includes('fillet'))) {
    return { ...CATEGORY_NUTRITION_FALLBACKS.lean_protein };
  }
  
  // Fatty protein patterns (thigh, dark meat, organ meats)
  if (lowerName.includes('thigh') || lowerName.includes('dark meat') ||
      lowerName.includes('liver') || lowerName.includes('heart') ||
      lowerName.includes('kidney') || lowerName.includes('giblet')) {
    return { ...CATEGORY_NUTRITION_FALLBACKS.fatty_protein };
  }
  
  // Poultry patterns (general)
  if (lowerName.includes('chicken') || lowerName.includes('turkey') || 
      lowerName.includes('duck') || lowerName.includes('quail') ||
      lowerName.includes('pheasant')) {
    return { ...CATEGORY_NUTRITION_FALLBACKS.poultry };
  }
  
  // Red meat patterns
  if (lowerName.includes('beef') || lowerName.includes('lamb') || 
      lowerName.includes('venison') || lowerName.includes('rabbit') ||
      lowerName.includes('bison') || lowerName.includes('elk') ||
      lowerName.includes('goat')) {
    return { ...CATEGORY_NUTRITION_FALLBACKS.red_meat };
  }
  
  // Fish patterns
  if (lowerName.includes('fish') || lowerName.includes('salmon') || 
      lowerName.includes('sardine') || lowerName.includes('tuna') ||
      lowerName.includes('mackerel') || lowerName.includes('herring') ||
      lowerName.includes('trout') || lowerName.includes('cod')) {
    return { ...CATEGORY_NUTRITION_FALLBACKS.fish };
  }
  
  // Insect patterns
  if (lowerName.includes('mealworm') || lowerName.includes('cricket') || 
      lowerName.includes('insect') || lowerName.includes('waxworm') ||
      lowerName.includes('superworm') || lowerName.includes('roach') ||
      lowerName.includes('locust')) {
    return { ...CATEGORY_NUTRITION_FALLBACKS.insect };
  }
  
  // Leafy green patterns (more specific)
  if (lowerName.includes('spinach') || lowerName.includes('kale') || 
      lowerName.includes('lettuce') || lowerName.includes('arugula') ||
      lowerName.includes('endive') || lowerName.includes('escarole') ||
      lowerName.includes('collard') || lowerName.includes('mustard') ||
      lowerName.includes('turnip') || lowerName.includes('dandelion') ||
      lowerName.includes('watercress') || lowerName.includes('mache') ||
      lowerName.includes('frisee') || lowerName.includes('radicchio') ||
      lowerName.includes('swiss chard') || lowerName.includes('beet green')) {
    return { ...CATEGORY_NUTRITION_FALLBACKS.leafy_green };
  }
  
  // Starchy vegetable patterns
  if (lowerName.includes('potato') || lowerName.includes('sweet potato') || 
      lowerName.includes('yam') || lowerName.includes('butternut') ||
      lowerName.includes('acorn squash') || lowerName.includes('pumpkin') ||
      lowerName.includes('winter squash') || lowerName.includes('kabocha')) {
    return { ...CATEGORY_NUTRITION_FALLBACKS.starchy_veg };
  }
  
  // Other vegetable patterns
  if (lowerName.includes('broccoli') || lowerName.includes('carrot') || 
      lowerName.includes('pea') || lowerName.includes('bean') ||
      lowerName.includes('cabbage') || lowerName.includes('celery') ||
      lowerName.includes('zucchini') || lowerName.includes('pepper') ||
      lowerName.includes('cucumber') || lowerName.includes('bok') ||
      lowerName.includes('radish') || lowerName.includes('asparagus') ||
      lowerName.includes('fennel') || lowerName.includes('leek')) {
    return { ...CATEGORY_NUTRITION_FALLBACKS.vegetable };
  }
  
  // Fruit patterns
  if (lowerName.includes('apple') || lowerName.includes('berry') || 
      lowerName.includes('banana') || lowerName.includes('melon') ||
      lowerName.includes('pear') || lowerName.includes('peach') ||
      lowerName.includes('plum') || lowerName.includes('cherry') ||
      lowerName.includes('grape') || lowerName.includes('mango') ||
      lowerName.includes('papaya') || lowerName.includes('fig')) {
    return { ...CATEGORY_NUTRITION_FALLBACKS.fruit };
  }
  
  // Supplement patterns
  if (lowerName.includes('supplement') || lowerName.includes('powder') || 
      lowerName.includes('vitamin') || lowerName.includes('mineral') ||
      lowerName.includes('calcium') || lowerName.includes('kelp') ||
      lowerName.includes('spirulina') || lowerName.includes('probiotic')) {
    return { ...CATEGORY_NUTRITION_FALLBACKS.supplement };
  }
  
  // Grain patterns
  if (lowerName.includes('rice') || lowerName.includes('oats') || 
      lowerName.includes('barley') || lowerName.includes('wheat') ||
      lowerName.includes('quinoa') || lowerName.includes('buckwheat') ||
      lowerName.includes('millet') || lowerName.includes('corn')) {
    return { ...CATEGORY_NUTRITION_FALLBACKS.grain };
  }
  
  // Seed patterns
  if (lowerName.includes('seed') || lowerName.includes('sunflower') || 
      lowerName.includes('pumpkin') || lowerName.includes('flax') ||
      lowerName.includes('chia') || lowerName.includes('hemp')) {
    return { ...CATEGORY_NUTRITION_FALLBACKS.seed };
  }
  
  // Hay patterns
  if (lowerName.includes('hay') || lowerName.includes('timothy') || 
      lowerName.includes('alfalfa') || lowerName.includes('orchard')) {
    return { ...CATEGORY_NUTRITION_FALLBACKS.hay };
  }
  
  // Default fallback (average of all categories)
  return {
    protein: 12.0,
    fat: 6.0,
    carbs: 6,
    fiber: 1.5,
    moisture: 70,
    calcium: 86,
    phosphorus: 150,
    kcal: 110,
    source: 'estimated_fallback',
    needsReview: true,
  };
}

