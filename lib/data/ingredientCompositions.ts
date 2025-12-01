// lib/data/ingredientCompositions.ts
// USDA nutrition data for common pet food ingredients
// All values per 100g raw edible portion unless otherwise noted

export interface IngredientComposition {
  protein?: number;     // g per 100g (optional for supplements)
  fat?: number;         // g per 100g (optional for supplements)
  calcium?: number;     // mg per 100g
  phosphorus?: number;  // mg per 100g
  moisture?: number;    // g per 100g
  kcal?: number;        // calories per 100g
  omega3?: number;      // g EPA+DHA per 100g
  CaP_ratio?: number;   // calcium to phosphorus ratio
  vitaminA?: number;    // IU per 100g
  vitaminC?: number;    // mg per 100g
  source?: string;      // data source citation
}

export const INGREDIENT_COMPOSITIONS: Record<string, IngredientComposition> = {
  // Poultry
  "chicken_breast": {
    protein: 31.0,
    fat: 3.6,
    calcium: 11,
    phosphorus: 196,
    moisture: 65,
    kcal: 165,
    source: "USDA FDC ID: 171116"
  },
  "ground_turkey": {
    protein: 28.6,
    fat: 10.4,
    calcium: 14,
    phosphorus: 206,
    kcal: 189,
    source: "USDA FDC ID: 174036"
  },
  "chicken_thighs": {
    protein: 20.6,
    fat: 14.1,
    calcium: 9,
    phosphorus: 170,
    kcal: 209,
    source: "USDA FDC ID: 171450"
  },
  "turkey_breast": {
    protein: 30.1,
    fat: 1.0,
    calcium: 6,
    phosphorus: 223,
    moisture: 70,
    kcal: 135,
    source: "USDA FDC ID: 171479"
  },
  "chicken_liver": {
    protein: 16.9,
    fat: 4.8,
    calcium: 8,
    phosphorus: 241,
    kcal: 119,
    source: "USDA FDC ID: 171060"
  },
  "chicken_hearts": {
    protein: 15.9,
    fat: 9.3,
    calcium: 7,
    phosphorus: 204,
    kcal: 153,
    source: "USDA FDC ID: 171059"
  },

  // Fish
  "salmon_atlantic": {
    protein: 20.4,
    fat: 13.4,
    omega3: 2.26,
    calcium: 12,
    phosphorus: 200,
    kcal: 208,
    source: "USDA FDC ID: 175168"
  },
  "sardines_water": {
    protein: 24.6,
    fat: 13.9,
    omega3: 1.48,
    calcium: 382,
    phosphorus: 490,
    kcal: 208,
    source: "USDA FDC ID: 175139"
  },
  "tuna_water": {
    protein: 25.5,
    fat: 1.0,
    calcium: 11,
    phosphorus: 208,
    kcal: 86,
    source: "USDA FDC ID: 175160"
  },

  // Beef
  "ground_beef_lean": {
    protein: 25.6,
    fat: 16.0,
    calcium: 6,
    phosphorus: 179,
    kcal: 230,
    source: "USDA FDC ID: 23547"
  },
  "beef_liver": {
    protein: 20.4,
    fat: 3.6,
    calcium: 6,
    phosphorus: 387,
    kcal: 135,
    source: "USDA FDC ID: 169451"
  },

  // Eggs
  "eggs_whole": {
    protein: 12.6,
    fat: 9.5,
    calcium: 56,
    phosphorus: 198,
    kcal: 143,
    source: "USDA FDC ID: 173424"
  },

  // Vegetables for Herbivores
  "kale_raw": {
    protein: 2.9,
    fat: 0.4,
    calcium: 254,
    phosphorus: 55,
    CaP_ratio: 4.6,
    vitaminA: 9990,
    vitaminC: 93.4,
    kcal: 35,
    source: "USDA FDC ID: 168421"
  },
  "spinach_raw": {
    protein: 2.9,
    fat: 0.4,
    calcium: 99,
    phosphorus: 49,
    vitaminA: 9377,
    vitaminC: 28.1,
    kcal: 23,
    source: "USDA FDC ID: 168462"
  },
  "carrots_raw": {
    protein: 0.9,
    fat: 0.2,
    calcium: 33,
    phosphorus: 35,
    vitaminA: 16706,
    vitaminC: 5.9,
    kcal: 41,
    source: "USDA FDC ID: 170393"
  },
  "sweet_potato": {
    protein: 1.6,
    fat: 0.1,
    calcium: 30,
    phosphorus: 47,
    vitaminA: 14187,
    vitaminC: 2.4,
    kcal: 86,
    source: "USDA FDC ID: 168482"
  },
  "broccoli_raw": {
    protein: 2.8,
    fat: 0.4,
    calcium: 47,
    phosphorus: 66,
    vitaminA: 623,
    vitaminC: 89.2,
    kcal: 34,
    source: "USDA FDC ID: 170379"
  },
  "celery_raw": {
    protein: 0.7,
    fat: 0.2,
    calcium: 40,
    phosphorus: 24,
    vitaminA: 449,
    vitaminC: 3.1,
    kcal: 16,
    source: "USDA FDC ID: 169988"
  },

  // Fruits
  "blueberries_raw": {
    protein: 0.7,
    fat: 0.3,
    calcium: 6,
    phosphorus: 12,
    vitaminA: 54,
    vitaminC: 9.7,
    kcal: 57,
    source: "USDA FDC ID: 171711"
  },
  "bananas_raw": {
    protein: 1.1,
    fat: 0.3,
    calcium: 5,
    phosphorus: 22,
    vitaminA: 64,
    vitaminC: 8.7,
    kcal: 89,
    source: "USDA FDC ID: 173944"
  },

  // Grains/Carbs
  "brown_rice_cooked": {
    protein: 2.7,
    fat: 0.9,
    calcium: 10,
    phosphorus: 83,
    kcal: 123,
    source: "USDA FDC ID: 20040"
  },
  "oats": {
    protein: 16.9,
    fat: 6.9,
    calcium: 54,
    phosphorus: 523,
    kcal: 379,
    source: "USDA FDC ID: 169705"
  },
  "quinoa_cooked": {
    protein: 4.4,
    fat: 1.9,
    calcium: 17,
    phosphorus: 152,
    kcal: 120,
    source: "USDA FDC ID: 20137"
  },

  // Supplements
  "calcium_carbonate": {
    calcium: 40000, // 40% calcium by weight
    phosphorus: 0,
    CaP_ratio: 999, // effectively infinite
    source: "Supplement standard"
  },
  "fish_oil": {
    protein: 0,
    fat: 100,
    omega3: 30, // concentrated EPA+DHA
    kcal: 902,
    source: "Supplement standard"
  },
  "taurine_powder": {
    protein: 0, // pure amino acid
    source: "Supplement standard"
  }
};

/**
 * Get nutritional composition for an ingredient
 * @param ingredientName - The ingredient name (normalized)
 * @returns IngredientComposition or undefined if not found
 */
export function getIngredientComposition(ingredientName: string): IngredientComposition | undefined {
  // Normalize the name for lookup
  const normalized = ingredientName.toLowerCase().trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');

  return INGREDIENT_COMPOSITIONS[normalized];
}

/**
 * Calculate calcium to phosphorus ratio
 * @param calcium - calcium amount
 * @param phosphorus - phosphorus amount
 * @returns Ca:P ratio or undefined if phosphorus is 0
 */
export function calculateCaPRatio(calcium: number, phosphorus: number): number | undefined {
  return phosphorus > 0 ? calcium / phosphorus : undefined;
}