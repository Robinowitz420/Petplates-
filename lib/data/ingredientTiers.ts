// lib/data/ingredientTiers.ts
// Ingredient quality classification for scoring differentiation

export type IngredientTier = 'premium' | 'standard' | 'basic';

/**
 * Premium ingredients: High-quality, fresh, whole foods
 */
export const PREMIUM_INGREDIENTS: string[] = [
  // Premium proteins
  'fresh-salmon', 'wild-caught-fish', 'organic-chicken', 'grass-fed-beef',
  'quail-eggs', 'duck', 'turkey-breast', 'lamb', 'venison', 'bison',
  'goat-milk', 'fresh-eggs', 'whole-fish',
  
  // Premium vegetables/fruits
  'blueberries', 'kale', 'spinach', 'broccoli', 'pumpkin-seeds',
  'sweet-potato', 'carrots', 'green-beans', 'peas', 'asparagus',
  'cranberries', 'apples', 'bananas',
  
  // Premium supplements
  'fish-oil', 'coconut-oil', 'flaxseed', 'chia-seeds',
];

/**
 * Basic/processed ingredients: Lower quality, processed, byproducts
 */
export const BASIC_INGREDIENTS: string[] = [
  // Processed proteins
  'chicken-byproduct', 'meal', 'byproduct-meal', 'animal-fat',
  'meat-meal', 'poultry-byproduct', 'rendered-fat',
  
  // Processed grains/fillers
  'corn-gluten-meal', 'wheat-gluten', 'soybean-meal', 'brewers-rice',
  'corn-syrup', 'artificial-flavors', 'preservatives',
  
  // Low-quality fillers
  'cellulose', 'glycerin', 'carrageenan', 'xanthan-gum',
];

/**
 * Classify an ingredient into a tier
 */
export function classifyIngredientTier(ingredientName: string): IngredientTier {
  const normalized = ingredientName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  // Check if premium
  if (PREMIUM_INGREDIENTS.some(premium => 
    normalized.includes(premium) || premium.includes(normalized)
  )) {
    return 'premium';
  }
  
  // Check if basic/processed
  if (BASIC_INGREDIENTS.some(basic => 
    normalized.includes(basic) || basic.includes(normalized)
  )) {
    return 'basic';
  }
  
  // Default to standard
  return 'standard';
}

/**
 * Check if ingredient is fresh (not dried/powdered/processed)
 */
export function isFreshIngredient(ingredientName: string): boolean {
  const normalized = ingredientName.toLowerCase();
  const processedIndicators = ['dried', 'powder', 'meal', 'flour', 'canned', 'processed', 'dehydrated'];
  return !processedIndicators.some(indicator => normalized.includes(indicator));
}

/**
 * Calculate ingredient quality score for a recipe
 */
export function calculateIngredientQualityScore(ingredients: Array<{ name: string } | string>): {
  score: number;
  premiumCount: number;
  basicCount: number;
  freshRatio: number;
} {
  let premiumCount = 0;
  let basicCount = 0;
  let freshCount = 0;
  const totalIngredients = ingredients.length;
  
  if (totalIngredients === 0) {
    return { score: 50, premiumCount: 0, basicCount: 0, freshRatio: 0 };
  }
  
  ingredients.forEach(ing => {
    const name = typeof ing === 'string' ? ing : ing.name;
    const tier = classifyIngredientTier(name);
    
    if (tier === 'premium') premiumCount++;
    else if (tier === 'basic') basicCount++;
    
    if (isFreshIngredient(name)) freshCount++;
  });
  
  const premiumRatio = premiumCount / totalIngredients;
  const basicRatio = basicCount / totalIngredients;
  const freshRatio = freshCount / totalIngredients;
  
  // Calculate score (base 50, bonuses/penalties)
  let score = 50;
  
  // Premium ingredient bonus
  if (premiumRatio > 0.5) score += 20;
  else if (premiumRatio > 0.3) score += 10;
  else if (premiumRatio > 0.1) score += 5;
  
  // Basic ingredient penalty
  if (basicRatio > 0.3) score -= 15;
  else if (basicRatio > 0.2) score -= 10;
  else if (basicRatio > 0.1) score -= 5;
  
  // Fresh ingredient bonus
  if (freshRatio > 0.5) score += 2;
  
  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    premiumCount,
    basicCount,
    freshRatio,
  };
}

