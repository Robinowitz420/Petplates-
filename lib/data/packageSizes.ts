/**
 * Package Size Database
 * Typical Amazon package sizes for common pet food ingredients
 * Used to calculate realistic meal counts from shopping lists
 */

export interface PackageSize {
  category: string;
  typicalSize: number; // in grams
  typicalUnit: string;
  estimatedCost: number; // USD
  notes?: string;
}

export const PACKAGE_SIZES: Record<string, PackageSize> = {
  // SEEDS & GRAINS
  'canary-seed': { 
    category: 'seed', 
    typicalSize: 907, // 2 lb
    typicalUnit: 'lb',
    estimatedCost: 8,
    notes: '2 lb bag typical for bird seed'
  },
  'canary_seed': { 
    category: 'seed', 
    typicalSize: 907, 
    typicalUnit: 'lb',
    estimatedCost: 8
  },
  'millet': { 
    category: 'seed', 
    typicalSize: 907, 
    typicalUnit: 'lb',
    estimatedCost: 6
  },
  'quinoa': { 
    category: 'grain', 
    typicalSize: 680, // 1.5 lb
    typicalUnit: 'lb',
    estimatedCost: 12
  },
  'brown-rice': { 
    category: 'grain', 
    typicalSize: 907, // 2 lb
    typicalUnit: 'lb',
    estimatedCost: 4
  },
  'rice': { 
    category: 'grain', 
    typicalSize: 907, // 2 lb
    typicalUnit: 'lb',
    estimatedCost: 4
  },
  'oats': { 
    category: 'grain', 
    typicalSize: 1361, // 3 lb
    typicalUnit: 'lb',
    estimatedCost: 8
  },
  'oatmeal': { 
    category: 'grain', 
    typicalSize: 1361, 
    typicalUnit: 'lb',
    estimatedCost: 8
  },
  
  // PROTEINS
  'chicken-breast': { 
    category: 'protein', 
    typicalSize: 1361, // 3 lb package
    typicalUnit: 'lb',
    estimatedCost: 18,
    notes: 'Frozen chicken breast packs'
  },
  'ground-turkey': { 
    category: 'protein', 
    typicalSize: 454, // 1 lb
    typicalUnit: 'lb',
    estimatedCost: 6
  },
  'ground-beef': { 
    category: 'protein', 
    typicalSize: 454, // 1 lb
    typicalUnit: 'lb',
    estimatedCost: 8
  },
  'salmon': { 
    category: 'protein', 
    typicalSize: 680, // 1.5 lb
    typicalUnit: 'lb',
    estimatedCost: 15
  },
  'eggs': { 
    category: 'protein', 
    typicalSize: 660, // ~12 eggs
    typicalUnit: 'dozen',
    estimatedCost: 5
  },
  'egg': { 
    category: 'protein', 
    typicalSize: 660, 
    typicalUnit: 'dozen',
    estimatedCost: 5
  },
  
  // VEGETABLES (fresh/frozen)
  'carrots': { 
    category: 'vegetable', 
    typicalSize: 907, // 2 lb bag
    typicalUnit: 'lb',
    estimatedCost: 4
  },
  'carrot': { 
    category: 'vegetable', 
    typicalSize: 907, 
    typicalUnit: 'lb',
    estimatedCost: 4
  },
  'broccoli': { 
    category: 'vegetable', 
    typicalSize: 454, // 1 lb
    typicalUnit: 'lb',
    estimatedCost: 3
  },
  'spinach': { 
    category: 'vegetable', 
    typicalSize: 284, // 10 oz container
    typicalUnit: 'oz',
    estimatedCost: 4
  },
  'sweet-potato': { 
    category: 'vegetable', 
    typicalSize: 1361, // 3 lb bag
    typicalUnit: 'lb',
    estimatedCost: 5
  },
  'sweet_potato': { 
    category: 'vegetable', 
    typicalSize: 1361, 
    typicalUnit: 'lb',
    estimatedCost: 5
  },
  'bell-pepper': { 
    category: 'vegetable', 
    typicalSize: 680, // ~4 peppers
    typicalUnit: 'lb',
    estimatedCost: 6
  },
  'bell_pepper': { 
    category: 'vegetable', 
    typicalSize: 680, 
    typicalUnit: 'lb',
    estimatedCost: 6
  },
  'green-beans': { 
    category: 'vegetable', 
    typicalSize: 454, // 1 lb
    typicalUnit: 'lb',
    estimatedCost: 3
  },
  'peas': { 
    category: 'vegetable', 
    typicalSize: 454, // 1 lb frozen
    typicalUnit: 'lb',
    estimatedCost: 3
  },
  
  // SUPPLEMENTS/POWDERS
  'calcium-powder': { 
    category: 'supplement', 
    typicalSize: 227, // 8 oz
    typicalUnit: 'oz',
    estimatedCost: 12,
    notes: 'Supplement containers'
  },
  'calcium': { 
    category: 'supplement', 
    typicalSize: 227, 
    typicalUnit: 'oz',
    estimatedCost: 12
  },
  'vitamin-powder': { 
    category: 'supplement', 
    typicalSize: 113, // 4 oz
    typicalUnit: 'oz',
    estimatedCost: 15
  },
  'vitamin': { 
    category: 'supplement', 
    typicalSize: 113, 
    typicalUnit: 'oz',
    estimatedCost: 15
  },
  'joint-health': { 
    category: 'supplement', 
    typicalSize: 227, // 8 oz
    typicalUnit: 'oz',
    estimatedCost: 20
  },
  'dasuquin': { 
    category: 'supplement', 
    typicalSize: 227, 
    typicalUnit: 'oz',
    estimatedCost: 43
  },
  
  // OILS
  'olive-oil': { 
    category: 'oil', 
    typicalSize: 500, // 500ml
    typicalUnit: 'ml',
    estimatedCost: 10
  },
  'fish-oil': { 
    category: 'oil', 
    typicalSize: 240, // 8 oz bottle
    typicalUnit: 'oz',
    estimatedCost: 18
  },
  'coconut-oil': { 
    category: 'oil', 
    typicalSize: 454, // 16 oz
    typicalUnit: 'oz',
    estimatedCost: 12
  },
};

// Category defaults for items not in database
export const CATEGORY_DEFAULTS: Record<string, PackageSize> = {
  'seed': { 
    category: 'seed', 
    typicalSize: 907, // 2 lb
    typicalUnit: 'lb',
    estimatedCost: 8
  },
  'grain': { 
    category: 'grain', 
    typicalSize: 907, 
    typicalUnit: 'lb',
    estimatedCost: 6
  },
  'protein': { 
    category: 'protein', 
    typicalSize: 1361, // 3 lb
    typicalUnit: 'lb',
    estimatedCost: 15
  },
  'vegetable': { 
    category: 'vegetable', 
    typicalSize: 454, // 1 lb
    typicalUnit: 'lb',
    estimatedCost: 4
  },
  'fruit': { 
    category: 'fruit', 
    typicalSize: 454, 
    typicalUnit: 'lb',
    estimatedCost: 5
  },
  'supplement': { 
    category: 'supplement', 
    typicalSize: 227, // 8 oz
    typicalUnit: 'oz',
    estimatedCost: 12
  },
  'oil': { 
    category: 'oil', 
    typicalSize: 500, // 500ml
    typicalUnit: 'ml',
    estimatedCost: 10
  },
  'default': { 
    category: 'other', 
    typicalSize: 454, // 1 lb default
    typicalUnit: 'lb',
    estimatedCost: 8
  }
};

/**
 * Get package size information for an ingredient
 * @param ingredientName - The name of the ingredient
 * @returns PackageSize with typical package size and cost
 */
export function getPackageSize(ingredientName: string, category?: string): PackageSize {
  console.log('[getPackageSize] Input - ingredientName:', ingredientName, 'category:', category);
  
  if (!ingredientName) {
    console.log('[getPackageSize] ❌ No ingredient name provided, returning default');
    return CATEGORY_DEFAULTS.default;
  }
  
  // Normalize ingredient name
  const normalized = ingredientName.toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-');
  console.log('[getPackageSize] Normalized name:', normalized);
  
  // Check exact match
  if (PACKAGE_SIZES[normalized]) {
    console.log('[getPackageSize] ✅ Exact match found:', PACKAGE_SIZES[normalized]);
    return PACKAGE_SIZES[normalized];
  }
  
  // Check partial matches (key contains name or name contains key)
  for (const [key, value] of Object.entries(PACKAGE_SIZES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      console.log('[getPackageSize] ✅ Partial match found:', key, value);
      return value;
    }
  }
  
  // If category provided, use category default
  if (category) {
    const categoryLower = category.toLowerCase();
    if (CATEGORY_DEFAULTS[categoryLower]) {
      console.log('[getPackageSize] ✅ Using category default:', categoryLower, CATEGORY_DEFAULTS[categoryLower]);
      return CATEGORY_DEFAULTS[categoryLower];
    }
  }
  
  // Try to guess category from name
  if (normalized.includes('seed')) {
    console.log('[getPackageSize] ✅ Guessed category: seed');
    return CATEGORY_DEFAULTS.seed;
  }
  if (normalized.includes('rice') || normalized.includes('oat') || normalized.includes('grain') || normalized.includes('quinoa')) {
    console.log('[getPackageSize] ✅ Guessed category: grain');
    return CATEGORY_DEFAULTS.grain;
  }
  if (normalized.includes('chicken') || normalized.includes('turkey') || normalized.includes('meat') || normalized.includes('beef') || normalized.includes('salmon') || normalized.includes('fish') || normalized.includes('egg')) {
    console.log('[getPackageSize] ✅ Guessed category: protein');
    return CATEGORY_DEFAULTS.protein;
  }
  if (normalized.includes('carrot') || normalized.includes('broccoli') || normalized.includes('vegetable') || normalized.includes('pepper') || normalized.includes('bean') || normalized.includes('pea') || normalized.includes('spinach')) {
    console.log('[getPackageSize] ✅ Guessed category: vegetable');
    return CATEGORY_DEFAULTS.vegetable;
  }
  if (normalized.includes('oil') || normalized.includes('fat')) {
    console.log('[getPackageSize] ✅ Guessed category: oil');
    return CATEGORY_DEFAULTS.oil;
  }
  if (normalized.includes('powder') || normalized.includes('supplement') || normalized.includes('vitamin') || normalized.includes('calcium') || normalized.includes('joint')) {
    console.log('[getPackageSize] ✅ Guessed category: supplement');
    return CATEGORY_DEFAULTS.supplement;
  }
  
  // Default fallback
  console.log('[getPackageSize] ⚠️ No match found, using default fallback');
  return CATEGORY_DEFAULTS.default;
}

