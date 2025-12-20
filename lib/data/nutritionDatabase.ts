// Comprehensive nutrition database for all pet food ingredients
// Data from USDA, veterinary sources, and ingredient suppliers

export interface NutritionData {
  protein?: number;      // % or g per 100g
  fat?: number;          // % or g per 100g
  fiber?: number;        // % or g per 100g
  carbs?: number;        // % or g per 100g
  moisture?: number;     // % or g per 100g
  calcium?: number;      // mg per 100g
  phosphorus?: number;   // mg per 100g
  ca_p_ratio?: string;   // e.g., "2.5:1"
  kcal?: number;         // calories per 100g
  omega3?: number;       // g per 100g
  taurine?: number;      // mg per 100g (critical for cats)
}

export const NUTRITION_DATABASE: Record<string, NutritionData> = {
  // PROTEINS - Meat & Fish
  "chicken_breast": { protein: 31, fat: 3.6, calcium: 11, phosphorus: 196, kcal: 165, ca_p_ratio: "0.06:1" },
  "chicken_thigh": { protein: 26, fat: 10.9, kcal: 209 },
  "ground_chicken": { protein: 26, fat: 9, kcal: 165 },
  "ground_beef": { protein: 26, fat: 15, kcal: 217 },
  "ground_turkey": { protein: 29, fat: 1, kcal: 135 },
  "salmon": { protein: 20, fat: 13, omega3: 2.3, kcal: 208 },
  "egg_whole": { protein: 13, fat: 11, kcal: 155 },
  "beef_liver": { protein: 20, fat: 3.6, kcal: 135 },
  "chicken_liver": { protein: 24, fat: 6.5, kcal: 167 },
  "turkey_ground": { protein: 27, fat: 7, kcal: 170 },
  "adult_mouse": { protein: 18.5, fat: 8, moisture: 66, ca_p_ratio: "1.2:1" },
  "adult_rat": { protein: 20, fat: 9.5, moisture: 64, ca_p_ratio: "1.1:1" },
  "day_old_chick": { protein: 16, fat: 6, moisture: 74, ca_p_ratio: "1.8:1" },

  // INSECTS
  "cricket": { protein: 15.4, fat: 3.3, fiber: 2.2, moisture: 77.1, ca_p_ratio: "0.14:1" },
  "mealworm": { protein: 18.7, fat: 13.4, fiber: 2.5, moisture: 61.9, ca_p_ratio: "0.06:1" },
  "dubia_roach": { protein: 21.4, fat: 6.1, fiber: 2.6, moisture: 65.6, ca_p_ratio: "0.3:1" },
  "black_soldier_fly": { protein: 15.5, fat: 9.4, fiber: 2.8, moisture: 66.8, ca_p_ratio: "1.5:1" },
  "waxworm": { protein: 14.1, fat: 24.9, fiber: 3.4, moisture: 58.5, ca_p_ratio: "0.07:1" },

  // GRAINS - Cooked
  "brown_rice_cooked": { protein: 2.6, fat: 0.9, fiber: 1.8, carbs: 23, moisture: 70, kcal: 111 },
  "white_rice_cooked": { protein: 2.7, fat: 0.3, fiber: 0.4, carbs: 28.2, moisture: 68.4, kcal: 130 },
  "oatmeal_cooked": { protein: 2.5, fat: 1.4, fiber: 1.7, carbs: 12, moisture: 84, kcal: 68 },
  "quinoa_cooked": { protein: 4.4, fat: 1.9, fiber: 2.8, carbs: 21.3, moisture: 71.6, kcal: 120 },
  "barley_cooked": { protein: 2.3, fat: 0.4, fiber: 3.8, carbs: 28.2, moisture: 68, kcal: 123 },
  "millet_cooked": { protein: 3.5, fat: 1, fiber: 1.3, carbs: 23.7, moisture: 71, kcal: 119 },

  // VEGETABLES - Cooked
  "sweet_potato_cooked": { protein: 2, fat: 0.1, fiber: 3.3, carbs: 20.7, moisture: 73, kcal: 86 },
  "pumpkin_cooked": { protein: 1, fat: 0.2, fiber: 2.9, carbs: 6.5, moisture: 90, kcal: 26 },
  "carrots_cooked": { protein: 0.9, fat: 0.2, fiber: 2.8, carbs: 8.2, moisture: 87, kcal: 35 },
  "broccoli_cooked": { protein: 3.7, fat: 0.4, fiber: 2.4, carbs: 7.2, moisture: 89, kcal: 34 },
  "spinach_cooked": { protein: 3.6, fat: 0.4, fiber: 2.2, carbs: 3.6, moisture: 91, kcal: 23 },
  "green_beans_cooked": { protein: 1.9, fat: 0.1, fiber: 2.7, carbs: 7, moisture: 90, kcal: 31 },
  "squash_cooked": { protein: 0.9, fat: 0.4, fiber: 2.8, carbs: 8, moisture: 89, kcal: 36 },

  // VEGETABLES - Raw
  "dandelion_greens": { protein: 2.7, fiber: 3.5, ca_p_ratio: "2.8:1" },
  "collard_greens": { protein: 2.5, fiber: 3.6, ca_p_ratio: "1.8:1" },
  "kale": { protein: 2.9, fiber: 2, ca_p_ratio: "2.4:1" },
  "bell_pepper": { protein: 0.9, fiber: 1.7, ca_p_ratio: "0.5:1" },

  // FRUITS
  "apple": { protein: 0.3, fat: 0.2, fiber: 2.4, carbs: 10.4, kcal: 52, ca_p_ratio: "0.5:1" },
  "banana": { protein: 1.1, fat: 0.3, fiber: 2.6, carbs: 12.2, kcal: 89, ca_p_ratio: "0.2:1" },
  "blueberries": { protein: 0.7, fat: 0.3, fiber: 2.4, carbs: 10, kcal: 57, ca_p_ratio: "0.5:1" },
  "papaya": { protein: 0.5, fat: 0.3, fiber: 1.7, carbs: 7.8, kcal: 43, ca_p_ratio: "4.8:1" },
  "fig": { protein: 0.8, fat: 0.3, fiber: 2.9, carbs: 16, kcal: 74, ca_p_ratio: "2.5:1" },

  // SEEDS & NUTS - Raw
  "pumpkin_seeds": { protein: 30.2, fat: 49.1, fiber: 6, carbs: 10.7, kcal: 559 },
  "sunflower_seeds": { protein: 20.8, fat: 51.5, fiber: 8.6, carbs: 20, kcal: 584 },
  "hemp_seeds": { protein: 31.6, fat: 48.8, fiber: 4, carbs: 8.7, kcal: 553 },
  "flaxseed": { protein: 18.3, fat: 42.2, fiber: 27.3, carbs: 28.9, kcal: 534 },
  "chia_seeds": { protein: 16.5, fat: 30.7, fiber: 34.4, carbs: 42.1, kcal: 486 },
  "walnut": { protein: 15.2, fat: 65.2, fiber: 6.7, carbs: 13.7, kcal: 654 },
  "almond": { protein: 21.2, fat: 49.9, fiber: 12.5, carbs: 21.6, kcal: 579 },

  // OILS & FATS
  "salmon_oil": { fat: 100, omega3: 18, kcal: 900 },
  "fish_oil": { fat: 100, omega3: 18, kcal: 900 },
  "coconut_oil": { fat: 100, kcal: 892 },
  "olive_oil": { fat: 100, kcal: 884 },
  "flaxseed_oil": { fat: 100, omega3: 53, kcal: 884 },

  // HAYS
  "timothy_hay": { protein: 7, fat: 1.5, fiber: 32, calcium: 0.4, kcal: 250 },
  "alfalfa_hay": { protein: 17, fat: 1.5, fiber: 24, calcium: 1.3, kcal: 280 },

  // LEGUMES - Cooked
  "lentils_cooked": { protein: 9, fat: 0.4, fiber: 7.9, carbs: 20.1, moisture: 69.7, kcal: 116 },
  "chickpeas_cooked": { protein: 8.9, fat: 2.6, fiber: 7.6, carbs: 27.4, moisture: 60, kcal: 164 },
  "black_beans_cooked": { protein: 8.9, fat: 0.5, fiber: 8.7, carbs: 23.7, moisture: 66, kcal: 132 },
};

// Pet nutritional requirements (daily targets per kg of body weight)
export const PET_NUTRITIONAL_TARGETS: Record<string, Record<string, { min: number; max: number }>> = {
  dogs: {
    protein: { min: 18, max: 35 },      // % of calories
    fat: { min: 5, max: 20 },           // % of calories
    fiber: { min: 1, max: 5 },          // %
    calcium: { min: 0.5, max: 1.5 },    // g per 100g of food
    phosphorus: { min: 0.4, max: 1.0 }, // g per 100g of food
  },
  cats: {
    protein: { min: 30, max: 50 },      // % of calories (obligate carnivore)
    fat: { min: 10, max: 30 },          // % of calories
    fiber: { min: 0, max: 3 },          // %
    calcium: { min: 0.4, max: 1.2 },    // g per 100g of food
    phosphorus: { min: 0.3, max: 0.9 }, // g per 100g of food
    taurine: { min: 400, max: 5000 },   // mg per kg of food
  },
  birds: {
    protein: { min: 12, max: 25 },      // %
    fat: { min: 5, max: 20 },           // %
    fiber: { min: 2, max: 8 },          // %
    calcium: { min: 0.6, max: 2.0 },    // g per 100g of food
  },
  reptiles: {
    protein: { min: 15, max: 50 },      // % (varies by species)
    fat: { min: 3, max: 15 },           // %
    fiber: { min: 1, max: 8 },          // %
    calcium: { min: 0.5, max: 2.0 },    // g per 100g of food
    ca_p_ratio: { min: 1, max: 5 },     // Ca:P ratio (higher is better)
  },
  'pocket-pets': {
    protein: { min: 12, max: 25 },      // %
    fat: { min: 3, max: 10 },           // %
    fiber: { min: 10, max: 30 },        // % (high fiber for digestion)
    calcium: { min: 0.5, max: 1.5 },    // g per 100g of food
  },
};

/**
 * Get nutrition data for an ingredient
 */
export function getNutritionData(ingredientId: string): NutritionData | undefined {
  return NUTRITION_DATABASE[ingredientId.toLowerCase().replace(/\s+/g, '_')];
}

/**
 * Calculate total nutrition for a recipe
 */
export function calculateRecipeNutrition(
  ingredients: Array<{ id: string; amount: number }> // amount in grams
): {
  protein: number;
  fat: number;
  fiber: number;
  carbs: number;
  calcium: number;
  phosphorus: number;
  kcal: number;
  totalWeight: number;
} {
  let protein = 0;
  let fat = 0;
  let fiber = 0;
  let carbs = 0;
  let calcium = 0;
  let phosphorus = 0;
  let kcal = 0;
  let totalWeight = 0;

  for (const ing of ingredients) {
    const nutrition = getNutritionData(ing.id);
    if (!nutrition) continue;

    const grams = ing.amount;
    totalWeight += grams;

    // Convert percentages to grams (assuming % means per 100g)
    protein += ((nutrition.protein || 0) * grams) / 100;
    fat += ((nutrition.fat || 0) * grams) / 100;
    fiber += ((nutrition.fiber || 0) * grams) / 100;
    carbs += ((nutrition.carbs || 0) * grams) / 100;
    calcium += ((nutrition.calcium || 0) * grams) / 100;
    phosphorus += ((nutrition.phosphorus || 0) * grams) / 100;
    kcal += ((nutrition.kcal || 0) * grams) / 100;
  }

  return {
    protein,
    fat,
    fiber,
    carbs,
    calcium,
    phosphorus,
    kcal,
    totalWeight,
  };
}

/**
 * Check if recipe meets nutritional targets for a pet
 */
export function meetsNutritionalTargets(
  nutrition: ReturnType<typeof calculateRecipeNutrition>,
  petType: string,
  petWeightKg: number
): { meets: boolean; gaps: string[] } {
  const targets = PET_NUTRITIONAL_TARGETS[petType];
  if (!targets) return { meets: true, gaps: [] };

  const gaps: string[] = [];
  const proteinPercent = (nutrition.protein / nutrition.kcal) * 100 * 4; // 4 kcal per gram protein
  const fatPercent = (nutrition.fat / nutrition.kcal) * 100 * 9; // 9 kcal per gram fat

  if (targets.protein && (proteinPercent < targets.protein.min || proteinPercent > targets.protein.max)) {
    gaps.push(`Protein: ${proteinPercent.toFixed(1)}% (target: ${targets.protein.min}-${targets.protein.max}%)`);
  }

  if (targets.fat && (fatPercent < targets.fat.min || fatPercent > targets.fat.max)) {
    gaps.push(`Fat: ${fatPercent.toFixed(1)}% (target: ${targets.fat.min}-${targets.fat.max}%)`);
  }

  if (targets.fiber && (nutrition.fiber < targets.fiber.min || nutrition.fiber > targets.fiber.max)) {
    gaps.push(`Fiber: ${nutrition.fiber.toFixed(1)}g (target: ${targets.fiber.min}-${targets.fiber.max}g)`);
  }

  return {
    meets: gaps.length === 0,
    gaps,
  };
}
