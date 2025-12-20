// lib/data/micronutrientDefaults.ts
// PHASE 2: Class-based defaults for copper and iodine
// Conservative estimates for micronutrient toxicity prevention
// Principle: Overestimate for safety, measured values override

export interface MicronutrientDefaults {
  copper_mg_per_100g: number;
  iodine_mcg_per_100g: number;
  micronutrientConfidence: 'measured' | 'estimated' | 'assumed_high' | 'assumed_low';
}

// Ingredient class detection
type IngredientClass = 
  | 'liver'
  | 'organ_meat'
  | 'shellfish'
  | 'seeds'
  | 'whole_grains'
  | 'muscle_meat'
  | 'fish'
  | 'vegetables'
  | 'fruits'
  | 'oils_fats'
  | 'supplements'
  | 'dairy'
  | 'eggs'
  | 'seaweed';

function detectIngredientClass(name: string, feedingRole?: string): IngredientClass {
  const lower = name.toLowerCase();

  // Liver (highest copper)
  if (lower.includes('liver')) return 'liver';

  // Other organs
  if (lower.match(/\b(kidney|heart|brain|tongue|tripe)\b/)) return 'organ_meat';

  // Shellfish (high copper + iodine)
  if (lower.match(/\b(oyster|clam|mussel|shrimp|crab|lobster)\b/)) return 'shellfish';

  // Seeds (high copper)
  if (lower.match(/\b(pumpkin|sunflower|sesame|flax|chia|hemp)\b/)) return 'seeds';

  // Whole grains
  if (lower.match(/\b(oat|barley|quinoa|millet|amaranth|buckwheat|teff)\b/)) return 'whole_grains';

  // Muscle meat (land animals)
  if (lower.match(/\b(chicken|turkey|beef|lamb|pork|duck|venison|rabbit|quail)\b/) && !lower.includes('liver')) {
    return 'muscle_meat';
  }

  // Fish (non-shellfish)
  if (lower.match(/\b(salmon|cod|mackerel|sardine|herring|tuna|trout|halibut|anchovy)\b/)) return 'fish';

  // Seaweed / kelp (very high iodine)
  if (lower.match(/\b(kelp|seaweed|nori|dulse|kombu)\b/)) return 'seaweed';

  // Eggs
  if (lower.match(/\b(egg)\b/)) return 'eggs';

  // Dairy
  if (lower.match(/\b(milk|cheese|yogurt|cottage|whey)\b/)) return 'dairy';

  // Vegetables
  if (lower.match(/\b(carrot|broccoli|spinach|kale|lettuce|pepper|squash|green|collard|mustard|turnip|dandelion|arugula|endive|escarole|bok|cabbage|celery|asparagus|fennel|parsley|zucchini|cucumber|eggplant|leek|shallot|radicchio|frisee|mache|watercress|purslane|swiss|chard|beet|pumpkin)\b/)) {
    return 'vegetables';
  }

  // Fruits
  if (lower.match(/\b(apple|berry|mango|papaya|banana|fruit|grape|melon|cantaloupe|honeydew|watermelon|pineapple|kiwi|raspberry|blackberry|cranberry|cherry|pear|peach|plum|apricot|fig|date|raisin|currant|goji|mulberry|elderberry|strawberry|blueberry)\b/)) {
    return 'fruits';
  }

  // Oils / fats
  if (lower.match(/\b(oil|fat|butter|lard|ghee|tallow)\b/)) return 'oils_fats';

  // Supplements (eggshell powder, calcium carbonate, etc.)
  if (lower.match(/\b(powder|supplement|premix|vitamin|mineral|calcium|phosphorus|eggshell)\b/)) {
    return 'supplements';
  }

  return 'vegetables'; // Safe default
}

// Class-based defaults (conservative, biased toward safety)
const COPPER_DEFAULTS: Record<IngredientClass, number> = {
  liver: 5.0,           // measured-ish: highest copper source
  organ_meat: 2.0,      // estimated: kidneys, hearts have moderate copper
  shellfish: 3.0,       // estimated: oysters, clams high in copper
  seeds: 1.5,           // estimated: pumpkin/sunflower seeds
  whole_grains: 0.4,    // assumed_high: conservative for grains
  muscle_meat: 0.1,     // assumed_high: very low in muscle meat
  fish: 0.1,            // assumed_high: low in fish
  vegetables: 0.05,     // assumed_high: low in vegetables
  fruits: 0.03,         // assumed_high: very low in fruits
  oils_fats: 0.0,       // assumed_low: no copper in pure fats
  supplements: 0.0,     // measured: eggshell, calcium carbonate have no copper
  dairy: 0.02,          // assumed_high: low in dairy
  eggs: 0.08,           // assumed_high: moderate in eggs
  seaweed: 0.5,         // estimated: kelp has moderate copper
};

const IODINE_DEFAULTS: Record<IngredientClass, number> = {
  seaweed: 500,         // PHASE 2: Conservative for recipe context (kelp is high but dangerous)
  shellfish: 25,        // PHASE 2: Conservative estimate for recipe
  fish: 20,             // PHASE 2: Conservative estimate for recipe (marine fish moderate iodine)
  dairy: 10,            // PHASE 2: Conservative estimate for recipe
  eggs: 8,              // PHASE 2: Conservative estimate for recipe
  muscle_meat: 2,       // assumed_high: land animal meat low iodine
  vegetables: 1,        // assumed_high: depends on soil iodine
  whole_grains: 1.5,    // assumed_high: depends on soil iodine
  fruits: 0.5,          // assumed_high: low iodine
  organ_meat: 3,        // estimated: organs have more iodine than muscle
  liver: 4,             // estimated: liver accumulates iodine
  seeds: 0.3,           // assumed_high: seeds low in iodine
  oils_fats: 0,         // assumed_low: no iodine in pure fats
  supplements: 0,       // measured: non-iodized supplements
};

export function getMicronutrientDefaults(ingredientName: string, feedingRole?: string): MicronutrientDefaults {
  const ingredientClass = detectIngredientClass(ingredientName, feedingRole);

  return {
    copper_mg_per_100g: COPPER_DEFAULTS[ingredientClass],
    iodine_mcg_per_100g: IODINE_DEFAULTS[ingredientClass],
    micronutrientConfidence: 'estimated', // Default confidence for class-based values
  };
}

// Measured overrides (high-priority ingredients with actual data)
export const MEASURED_MICRONUTRIENTS: Record<string, MicronutrientDefaults> = {
  // Liver (USDA FDC data)
  'beef_liver': {
    copper_mg_per_100g: 4.6,
    iodine_mcg_per_100g: 8,
    micronutrientConfidence: 'measured',
  },
  'chicken_liver': {
    copper_mg_per_100g: 5.4,
    iodine_mcg_per_100g: 11,
    micronutrientConfidence: 'measured',
  },
  'lamb_liver': {
    copper_mg_per_100g: 4.8,
    iodine_mcg_per_100g: 9,
    micronutrientConfidence: 'measured',
  },
  'turkey_liver': {
    copper_mg_per_100g: 5.2,
    iodine_mcg_per_100g: 10,
    micronutrientConfidence: 'measured',
  },

  // Fish (USDA FDC data)
  'salmon_atlantic': {
    copper_mg_per_100g: 0.12,
    iodine_mcg_per_100g: 80,
    micronutrientConfidence: 'measured',
  },
  'cod_atlantic': {
    copper_mg_per_100g: 0.08,
    iodine_mcg_per_100g: 130,
    micronutrientConfidence: 'measured',
  },
  'mackerel_atlantic': {
    copper_mg_per_100g: 0.11,
    iodine_mcg_per_100g: 100,
    micronutrientConfidence: 'measured',
  },
  'sardines_water': {
    copper_mg_per_100g: 0.13,
    iodine_mcg_per_100g: 120,
    micronutrientConfidence: 'measured',
  },
  'herring_canned': {
    copper_mg_per_100g: 0.10,
    iodine_mcg_per_100g: 110,
    micronutrientConfidence: 'estimated',
  },
  'tuna_canned': {
    copper_mg_per_100g: 0.09,
    iodine_mcg_per_100g: 65,
    micronutrientConfidence: 'estimated',
  },

  // Seeds (USDA FDC data)
  'pumpkin_seed': {
    copper_mg_per_100g: 1.7,
    iodine_mcg_per_100g: 3,
    micronutrientConfidence: 'measured',
  },
  'sunflower_seed': {
    copper_mg_per_100g: 1.8,
    iodine_mcg_per_100g: 2,
    micronutrientConfidence: 'measured',
  },

  // Seaweed (USDA FDC data)
  'kelp': {
    copper_mg_per_100g: 0.6,
    iodine_mcg_per_100g: 2000, // ⚠️ VERY HIGH - conservative estimate
    micronutrientConfidence: 'measured',
  },

  // Eggs (USDA FDC data)
  'egg': {
    copper_mg_per_100g: 0.08,
    iodine_mcg_per_100g: 26,
    micronutrientConfidence: 'measured',
  },
};

export function getMicronutrients(ingredientName: string, feedingRole?: string): MicronutrientDefaults {
  const normalized = ingredientName.toLowerCase().replace(/\s+/g, '_');

  // Check for measured override first
  if (MEASURED_MICRONUTRIENTS[normalized]) {
    return MEASURED_MICRONUTRIENTS[normalized];
  }

  // Fall back to class-based defaults
  return getMicronutrientDefaults(ingredientName, feedingRole);
}
