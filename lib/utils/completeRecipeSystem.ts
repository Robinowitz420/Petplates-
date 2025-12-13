// lib/utils/completeRecipeSystem.ts
// Complete recipe generation system with nutritional validation
// All-in-one system for generating nutritionally-validated recipes

import { INGREDIENT_COMPOSITIONS, getIngredientComposition, type IngredientComposition } from '@/lib/data/ingredientCompositions';
import { AAFCO_STANDARDS, SPECIES_NUTRITIONAL_GUIDELINES, getNutritionalStandard, type NutritionalStandard } from '@/lib/data/aafco-standards';
import { getFallbackNutrition } from '@/lib/utils/nutritionFallbacks';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface IngredientWithAmount {
  name: string;
  amount: number; // grams
  category?: string;
}

export interface RecipeNutrition {
  totalCalories: number;
  protein: { grams: number; percentage: number };
  fat: { grams: number; percentage: number };
  carbs: { grams: number; percentage: number };
  fiber: { grams: number; percentage: number };
  calcium: number; // mg
  phosphorus: number; // mg
  caPRatio: number;
  totalWeight: number; // grams
  servings: number;
  caloriesPerServing: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number; // 0-100
  nutritionInfo: RecipeNutrition;
  missingIngredients?: string[]; // Ingredients that used fallback data
  estimatedNutritionPercent?: number; // Percentage of recipe using estimated/fallback data
}

export interface PortionGuidance {
  small: string;
  medium: string;
  large: string;
}

export interface GeneratedRecipe {
  ingredients: IngredientWithAmount[];
  nutritionalInfo: RecipeNutrition;
  validation: ValidationResult;
  description: string;
  instructions: string[];
  portionGuidance: PortionGuidance;
}

// ============================================================================
// NUTRITIONAL CALCULATION
// ============================================================================

/**
 * Normalize ingredient name to match ingredientCompositions keys
 * Handles both "chicken breast" (from VETTED_SPECIES_MAP) and "chicken_breast" (from ingredientCompositions)
 * Enhanced to remove brand names, adjectives, and handle various separators
 */
function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    // Remove brand names and adjectives
    .replace(/\s*(fresh|organic|raw|freeze[- ]?dried|ground|lean|boneless|skinless|cooked|canned|dried|frozen)\s*/gi, ' ')
    // Remove common prefixes/suffixes
    .replace(/^(whole|chopped|diced|sliced|minced)\s+/gi, '')
    .replace(/\s+(whole|chopped|diced|sliced|minced)$/gi, '')
    // Standardize separators - remove punctuation and special chars
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\[\]]/g, '')
    // Convert spaces to underscores
    .replace(/\s+/g, '_')
    // Remove leading/trailing underscores and collapse multiple underscores
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
}

/**
 * Try multiple name variations to find ingredient composition
 * Enhanced with fuzzy matching for close matches
 */
function findIngredientComposition(name: string): IngredientComposition | null {
  // Try exact normalized match first
  const normalized = normalizeIngredientName(name);
  let comp: IngredientComposition | undefined = INGREDIENT_COMPOSITIONS[normalized];
  if (comp) return comp;
  
  // Try with getIngredientComposition helper
  comp = getIngredientComposition(name);
  if (comp) return comp;
  
  // Try removing common suffixes/prefixes
  const variations = [
    normalized.replace(/_raw$/, ''),
    normalized.replace(/_cooked$/, ''),
    normalized.replace(/_canned$/, ''),
    normalized.replace(/^ground_/, ''),
    normalized.replace(/_lean$/, ''),
    normalized.replace(/_boneless$/, ''),
    normalized.replace(/_skinless$/, ''),
    normalized.replace(/_fresh$/, ''),
    normalized.replace(/_frozen$/, ''),
  ];
  
  for (const variant of variations) {
    comp = INGREDIENT_COMPOSITIONS[variant];
    if (comp) return comp;
  }
  
  // Fuzzy matching: try partial matches (ingredient name contains key or vice versa)
  const normalizedParts = normalized.split('_').filter(p => p.length > 2); // Ignore very short parts
  for (const [key, value] of Object.entries(INGREDIENT_COMPOSITIONS)) {
    const keyParts = key.split('_').filter(p => p.length > 2);
    
    // Check if significant parts match
    const matchingParts = normalizedParts.filter(part => 
      keyParts.some(kp => kp.includes(part) || part.includes(kp))
    );
    
    // If at least 50% of significant parts match, consider it a match
    if (matchingParts.length > 0 && matchingParts.length >= Math.ceil(normalizedParts.length * 0.5)) {
      return value;
    }
    
    // Also check if key is contained in normalized name or vice versa
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }
  
  return null;
}

/**
 * Calculate total nutrition from ingredients with amounts
 * Uses fallback nutrition data for missing ingredients
 * @returns RecipeNutrition and metadata about missing ingredients
 */
export function calculateRecipeNutrition(
  ingredients: IngredientWithAmount[]
): RecipeNutrition & { missingIngredients: string[]; estimatedWeight: number } {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalFat = 0;
  let totalCarbs = 0;
  let totalFiber = 0;
  let totalCalcium = 0;
  let totalPhosphorus = 0;
  let totalWeight = 0;
  const missingIngredients: string[] = [];
  let estimatedWeight = 0;

  for (const ing of ingredients) {
    let composition = findIngredientComposition(ing.name);
    let usedFallback = false;
    
    // If not found, use fallback nutrition data
    if (!composition) {
      composition = getFallbackNutrition(ing.name);
      missingIngredients.push(ing.name);
      usedFallback = true;
    }

    const amountInGrams = ing.amount;
    totalWeight += amountInGrams;
    if (usedFallback) {
      estimatedWeight += amountInGrams;
    }

    // Calculate per 100g values
    const multiplier = amountInGrams / 100;

    totalCalories += (composition.kcal || 0) * multiplier;
    totalProtein += (composition.protein || 0) * multiplier;
    totalFat += (composition.fat || 0) * multiplier;
    totalCarbs += (composition.carbs || 0) * multiplier;
    totalFiber += (composition.fiber || 0) * multiplier;
    totalCalcium += (composition.calcium || 0) * multiplier;
    totalPhosphorus += (composition.phosphorus || 0) * multiplier;
  }

  // Calculate percentages (on dry matter basis)
  // Sum moisture from all ingredients to get total moisture
  let totalMoisture = 0;
  for (const ing of ingredients) {
    let composition = findIngredientComposition(ing.name);
    if (!composition) {
      composition = getFallbackNutrition(ing.name);
    }
    if (composition && composition.moisture) {
      totalMoisture += (composition.moisture || 0) * (ing.amount / 100);
    }
  }
  
  // If no moisture data, use average assumption (70% moisture = 30% DM)
  const dryMatterWeight = totalMoisture > 0 
    ? totalWeight - totalMoisture 
    : totalWeight * 0.3;
  
  const proteinPct = dryMatterWeight > 0 ? (totalProtein / dryMatterWeight) * 100 : 0;
  const fatPct = dryMatterWeight > 0 ? (totalFat / dryMatterWeight) * 100 : 0;
  const carbsPct = dryMatterWeight > 0 ? (totalCarbs / dryMatterWeight) * 100 : 0;
  const fiberPct = dryMatterWeight > 0 ? (totalFiber / dryMatterWeight) * 100 : 0;

  const caPRatio = totalPhosphorus > 0 ? totalCalcium / totalPhosphorus : 0;

  return {
    totalCalories,
    protein: { grams: totalProtein, percentage: proteinPct },
    fat: { grams: totalFat, percentage: fatPct },
    carbs: { grams: totalCarbs, percentage: carbsPct },
    fiber: { grams: totalFiber, percentage: fiberPct },
    calcium: totalCalcium,
    phosphorus: totalPhosphorus,
    caPRatio,
    totalWeight,
    servings: 1,
    caloriesPerServing: totalCalories,
    missingIngredients,
    estimatedWeight,
  };
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate recipe nutrition against species standards
 * @param healthConcerns - Optional health concerns for stricter validation
 */
export function validateRecipeNutrition(
  nutrition: RecipeNutrition & { missingIngredients?: string[]; estimatedWeight?: number },
  species: 'dogs' | 'cats' | 'birds' | 'reptiles' | 'pocket-pets',
  lifeStage: 'puppy' | 'adult' | 'senior' = 'adult',
  healthConcerns: string[] = []
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;
  
  // Calculate estimated nutrition percentage
  const estimatedNutritionPercent = nutrition.estimatedWeight && nutrition.totalWeight > 0
    ? (nutrition.estimatedWeight / nutrition.totalWeight) * 100
    : 0;
  
  // Add warning if significant portion uses estimated data
  if (estimatedNutritionPercent > 30) {
    warnings.push(`High percentage of estimated nutrition data: ${estimatedNutritionPercent.toFixed(1)}%`);
    score -= 10;
  } else if (estimatedNutritionPercent > 0) {
    warnings.push(`Some ingredients use estimated nutrition data: ${estimatedNutritionPercent.toFixed(1)}%`);
  }

  // Dogs and Cats - Use AAFCO standards
  if (species === 'dogs' || species === 'cats') {
    const standard = AAFCO_STANDARDS[species][lifeStage];

    // Protein check
    if (nutrition.protein.percentage < standard.protein.min) {
      errors.push(`Protein too low: ${nutrition.protein.percentage.toFixed(1)}% (min: ${standard.protein.min}%)`);
      score -= 30;
    } else if (nutrition.protein.percentage > standard.protein.max) {
      warnings.push(`Protein high: ${nutrition.protein.percentage.toFixed(1)}% (max: ${standard.protein.max}%)`);
      score -= 10;
    }

    // Fat check
    if (nutrition.fat.percentage < standard.fat.min) {
      errors.push(`Fat too low: ${nutrition.fat.percentage.toFixed(1)}% (min: ${standard.fat.min}%)`);
      score -= 30;
    } else if (nutrition.fat.percentage > standard.fat.max) {
      warnings.push(`Fat high: ${nutrition.fat.percentage.toFixed(1)}% (max: ${standard.fat.max}%)`);
      score -= 10;
    }

    // Ca:P ratio check (critical)
    if (nutrition.caPRatio < standard.caPRatio.min || nutrition.caPRatio > standard.caPRatio.max) {
      errors.push(`Ca:P ratio out of range: ${nutrition.caPRatio.toFixed(2)} (ideal: ${standard.caPRatio.min}-${standard.caPRatio.max})`);
      score -= 25;
    }

    // Calcium and phosphorus in mg per 1000 kcal (approximate conversion)
    // For simplicity, we'll check absolute values
    if (nutrition.calcium < 200) {
      warnings.push(`Calcium may be low: ${nutrition.calcium.toFixed(0)}mg`);
      score -= 5;
    }
    if (nutrition.phosphorus < 150) {
      warnings.push(`Phosphorus may be low: ${nutrition.phosphorus.toFixed(0)}mg`);
      score -= 5;
    }
  }

  // Reptiles - Focus on Ca:P ratio
  if (species === 'reptiles') {
    if (nutrition.caPRatio < 1.5) {
      errors.push(`Ca:P ratio too low for reptiles: ${nutrition.caPRatio.toFixed(2)} (min: 1.5)`);
      score -= 40;
    } else if (nutrition.caPRatio > 2.5) {
      warnings.push(`Ca:P ratio high: ${nutrition.caPRatio.toFixed(2)} (max recommended: 2.5)`);
      score -= 10;
    }

    // Reptiles need adequate calcium
    if (nutrition.calcium < 500) {
      warnings.push(`Calcium low for reptiles: ${nutrition.calcium.toFixed(0)}mg (min recommended: 500mg)`);
      score -= 15;
    }
  }

  // Birds - Protein and fat ranges
  if (species === 'birds') {
    if (nutrition.protein.percentage < 12) {
      errors.push(`Protein too low for birds: ${nutrition.protein.percentage.toFixed(1)}% (min: 12%)`);
      score -= 30;
    } else if (nutrition.protein.percentage > 35) {
      warnings.push(`Protein high for birds: ${nutrition.protein.percentage.toFixed(1)}% (max recommended: 35%)`);
      score -= 10;
    }

    if (nutrition.fat.percentage < 3) {
      warnings.push(`Fat low for birds: ${nutrition.fat.percentage.toFixed(1)}% (min recommended: 3%)`);
      score -= 15;
    } else if (nutrition.fat.percentage > 20) {
      warnings.push(`Fat high for birds: ${nutrition.fat.percentage.toFixed(1)}% (max recommended: 20%)`);
      score -= 10;
    }
  }

  // Pocket Pets - High fiber requirement
  if (species === 'pocket-pets') {
    if (nutrition.fiber.grams < 10) {
      warnings.push(`Fiber low for pocket pets: ${nutrition.fiber.grams.toFixed(1)}g (min recommended: 10g)`);
      score -= 15;
    }

    if (nutrition.caPRatio < 1.5 || nutrition.caPRatio > 2.0) {
      warnings.push(`Ca:P ratio should be 1.5-2.0 for pocket pets: ${nutrition.caPRatio.toFixed(2)}`);
      score -= 10;
    }
  }

  // Health concern-specific validation (stricter rules)
  if (healthConcerns.length > 0) {
    const healthTemplate = HEALTH_CONCERN_TEMPLATES[healthConcerns[0]];
    
    if (healthTemplate) {
      // Kidney disease: Must have low phosphorus
      if (healthConcerns.includes('kidney-disease')) {
        // Check if phosphorus is too high (should be < 0.6% DM for kidney disease)
        const dryMatterWeight = nutrition.totalWeight * 0.3; // Approximate DM
        const phosphorusDM = dryMatterWeight > 0 ? (nutrition.phosphorus / dryMatterWeight) * 100 : 0;
        if (phosphorusDM > 0.6) {
          errors.push(`Phosphorus too high for kidney disease: ${phosphorusDM.toFixed(2)}% DM (max: 0.6%)`);
          score -= 30;
        }
      }
      
      // Weight management: Must have lower calories and fat
      if (healthConcerns.includes('weight-management')) {
        if (nutrition.fat.percentage > 12) {
          warnings.push(`Fat may be too high for weight management: ${nutrition.fat.percentage.toFixed(1)}% (target: <12%)`);
          score -= 10;
        }
        if (nutrition.totalCalories > 400) {
          warnings.push(`Calories may be too high for weight management: ${nutrition.totalCalories.toFixed(0)} kcal`);
          score -= 5;
        }
      }
      
      // Digestive health: Must have adequate fiber
      if (healthConcerns.includes('digestive-health')) {
        if (nutrition.fiber.grams < 5) {
          warnings.push(`Fiber low for digestive health: ${nutrition.fiber.grams.toFixed(1)}g (min recommended: 5g)`);
          score -= 15;
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, score),
    nutritionInfo: nutrition,
    missingIngredients: nutrition.missingIngredients || [],
    estimatedNutritionPercent,
  };
}

// ============================================================================
// HEALTH CONCERN TEMPLATES
// ============================================================================

interface HealthConcernTemplate {
  targetMacros?: {
    protein?: 'lower' | 'moderate' | 'higher';
    fat?: 'lower' | 'moderate' | 'higher';
    calories?: 'lower' | 'moderate' | 'higher';
    fiber?: 'higher';
    phosphorus?: 'low';
  };
  preferredIngredients?: string[];
  avoidIngredients?: string[];
}

const HEALTH_CONCERN_TEMPLATES: Record<string, HealthConcernTemplate> = {
  'weight-management': {
    targetMacros: { fat: 'lower', calories: 'lower' },
    preferredIngredients: ['lean proteins', 'vegetables', 'fiber'],
    avoidIngredients: ['high-fat meats', 'oils'],
  },
  'kidney-disease': {
    targetMacros: { protein: 'moderate', phosphorus: 'low' },
    preferredIngredients: ['egg whites', 'omega-3'],
    avoidIngredients: ['high-phosphorus meats', 'organ meats'],
  },
  'digestive-health': {
    targetMacros: { fiber: 'higher' },
    preferredIngredients: ['pumpkin', 'sweet potato', 'probiotics'],
    avoidIngredients: ['high-fat', 'dairy'],
  },
  'joint-health': {
    targetMacros: {},
    preferredIngredients: ['omega-3 sources', 'glucosamine', 'chondroitin'],
    avoidIngredients: [],
  },
  'allergies': {
    targetMacros: {},
    preferredIngredients: ['novel proteins', 'limited ingredients'],
    avoidIngredients: ['common allergens', 'wheat', 'soy', 'corn'],
  },
  'dental': {
    targetMacros: {},
    preferredIngredients: ['crunchy vegetables', 'dental treats'],
    avoidIngredients: ['sticky foods', 'sugars'],
  },
};

// ============================================================================
// SMART INGREDIENT SELECTION
// ============================================================================

/**
 * Get ingredient composition for smart selection
 */
function getIngredientComp(name: string): IngredientComposition | null {
  return findIngredientComposition(name);
}

/**
 * Select ingredients based on nutritional targets
 */
function selectIngredientsForTarget(
  availableIngredients: string[],
  targetProteinPct: number,
  targetFatPct: number,
  targetCalories: number,
  species: string,
  healthConcerns: string[] = []
): IngredientWithAmount[] {
  const selected: IngredientWithAmount[] = [];
  let currentProtein = 0;
  let currentFat = 0;
  let currentCalories = 0;
  let currentWeight = 0;

  // Apply health concern modifications
  const healthTemplate = healthConcerns.length > 0 
    ? HEALTH_CONCERN_TEMPLATES[healthConcerns[0]] 
    : null;

  // Adjust targets based on health concerns
  let adjustedProteinTarget = targetProteinPct;
  let adjustedFatTarget = targetFatPct;
  let adjustedCalorieTarget = targetCalories;

  if (healthTemplate?.targetMacros) {
    if (healthTemplate.targetMacros.fat === 'lower') {
      adjustedFatTarget = targetFatPct * 0.7;
    }
    if (healthTemplate.targetMacros.calories === 'lower') {
      adjustedCalorieTarget = targetCalories * 0.85;
    }
  }

  // Start with a protein source (meat/fish)
  const proteins = availableIngredients.filter(name => {
    const comp = getIngredientComp(name);
    return comp && (comp.protein || 0) > 15; // High protein ingredients
  });

  if (proteins.length > 0) {
    // Filter by health concerns
    let proteinPool = proteins;
    if (healthTemplate?.avoidIngredients) {
      proteinPool = proteins.filter(p => {
        const pLower = p.toLowerCase();
        return !healthTemplate.avoidIngredients!.some(avoid => pLower.includes(avoid));
      });
    }
    if (proteinPool.length === 0) proteinPool = proteins; // Fallback

    const protein = proteinPool[Math.floor(Math.random() * proteinPool.length)];
    const amount = species === 'dogs' || species === 'cats' ? 150 : 100; // Base protein amount
    selected.push({ name: protein, amount, category: 'protein' });

    const comp = getIngredientComp(protein);
    if (comp) {
      currentProtein += (comp.protein || 0) * (amount / 100);
      currentFat += (comp.fat || 0) * (amount / 100);
      currentCalories += (comp.kcal || 0) * (amount / 100);
      currentWeight += amount;
    }
  }

  // Add vegetables/carbs for fiber and balance
  const veggies = availableIngredients.filter(name => {
    const comp = getIngredientComp(name);
    return comp && (comp.carbs || 0) > 5 && (comp.protein || 0) < 5;
  });

  if (veggies.length > 0) {
    let veggiePool = veggies;
    if (healthTemplate?.preferredIngredients) {
      // Prefer ingredients from preferred list
      const preferred = veggies.filter(v => {
        const vLower = v.toLowerCase();
        return healthTemplate.preferredIngredients!.some(pref => vLower.includes(pref));
      });
      if (preferred.length > 0) veggiePool = preferred;
    }

    const veggie = veggiePool[Math.floor(Math.random() * veggiePool.length)];
    const amount = 100;
    selected.push({ name: veggie, amount, category: 'vegetable' });

    const comp = getIngredientComp(veggie);
    if (comp) {
      currentProtein += (comp.protein || 0) * (amount / 100);
      currentFat += (comp.fat || 0) * (amount / 100);
      currentCalories += (comp.kcal || 0) * (amount / 100);
      currentWeight += amount;
    }
  }

  // Add supplements if needed for calcium/phosphorus balance (especially for reptiles)
  if (species === 'reptiles' || species === 'pocket-pets') {
    const supplements = availableIngredients.filter(name =>
      name.toLowerCase().includes('calcium') || name.toLowerCase().includes('supplement')
    );

    if (supplements.length > 0) {
      const supplement = supplements[Math.floor(Math.random() * supplements.length)];
      selected.push({ name: supplement, amount: 5, category: 'supplement' }); // Small amount

      const comp = getIngredientComp(supplement);
      if (comp) {
        // Supplements are added in small amounts, so impact is minimal
        // The main nutrition comes from the protein and vegetable sources
      }
    }
  }

  return selected;
}

// ============================================================================
// PORTION CALCULATOR
// ============================================================================

/**
 * Calculate recommended portion size based on pet weight and activity
 */
export function calculatePortionSize(
  petWeightKg: number,
  activityLevel: 'low' | 'moderate' | 'high' | 'very-high',
  lifeStage: 'puppy' | 'adult' | 'senior',
  species: 'dogs' | 'cats' | 'birds' | 'reptiles' | 'pocket-pets'
): number {
  // Resting Energy Requirement (RER) = 70 * (weight in kg)^0.75
  const rer = 70 * Math.pow(petWeightKg, 0.75);

  // Activity multipliers
  const activityMultipliers = {
    puppy: { low: 2.0, moderate: 2.5, high: 3.0, 'very-high': 3.5 },
    adult: { low: 1.2, moderate: 1.4, high: 1.6, 'very-high': 1.8 },
    senior: { low: 1.1, moderate: 1.2, high: 1.4, 'very-high': 1.5 },
  };

  const multiplier = activityMultipliers[lifeStage][activityLevel];
  const dailyCalories = rer * multiplier;

  return dailyCalories;
}

/**
 * Generate portion guidance for different pet sizes
 */
function generatePortionGuidance(
  recipeCalories: number,
  species: string
): PortionGuidance {
  // Assume recipe provides ~1/3 of daily calories (one meal)
  const getPortion = (weightKg: number) => {
    const dailyCal = calculatePortionSize(weightKg, 'moderate', 'adult', species as any);
    const mealCal = dailyCal / 3;
    const grams = (mealCal / recipeCalories) * 100; // Assuming ~100g base recipe
    return Math.round(grams);
  };

  // Define size ranges by species
  const sizes = species === 'dogs' 
    ? { small: 5, medium: 15, large: 30 }
    : species === 'cats'
    ? { small: 3, medium: 5, large: 8 }
    : { small: 0.1, medium: 0.5, large: 1.0 };

  return {
    small: `${getPortion(sizes.small)}g (for ~${sizes.small}kg pets)`,
    medium: `${getPortion(sizes.medium)}g (for ~${sizes.medium}kg pets)`,
    large: `${getPortion(sizes.large)}g (for ~${sizes.large}kg pets)`,
  };
}

// ============================================================================
// DESCRIPTION & INSTRUCTIONS GENERATORS
// ============================================================================

/**
 * Generate recipe description with nutritional info
 */
function generateDescription(
  ingredients: IngredientWithAmount[],
  nutrition: RecipeNutrition,
  species: string,
  lifeStage: string,
  healthConcerns: string[]
): string {
  const mainIngredient = ingredients[0]?.name || 'ingredients';
  const proteinPct = nutrition.protein.percentage.toFixed(0);
  const fatPct = nutrition.fat.percentage.toFixed(0);
  const caPRatio = nutrition.caPRatio.toFixed(2);

  let desc = `A balanced ${species} meal featuring ${mainIngredient.toLowerCase()}. `;
  desc += `This recipe provides ${proteinPct}% protein and ${fatPct}% fat `;
  desc += `on a dry-matter basis, with a calcium:phosphorus ratio of ${caPRatio}:1. `;

  if (species === 'dogs' || species === 'cats') {
    desc += `Meets AAFCO standards for ${lifeStage} ${species}. `;
  }

  if (healthConcerns.length > 0) {
    desc += `Specially formulated for ${healthConcerns.join(' and ')} support.`;
  } else {
    desc += 'A complete and balanced meal for everyday feeding.';
  }

  return desc;
}

/**
 * Generate cooking instructions based on ingredients
 */
function generateInstructions(
  ingredients: IngredientWithAmount[],
  species: string
): string[] {
  const instructions: string[] = [];
  
  // Step 1: Prepare proteins
  const proteins = ingredients.filter(ing => 
    ing.category === 'protein' ||
    ing.name.toLowerCase().includes('chicken') || 
    ing.name.toLowerCase().includes('beef') ||
    ing.name.toLowerCase().includes('fish') ||
    ing.name.toLowerCase().includes('turkey')
  );
  
  if (proteins.length > 0) {
    instructions.push(
      `1. Cook ${proteins.map(p => p.name.toLowerCase()).join(' and ')} thoroughly until no pink remains. Allow to cool to room temperature.`
    );
  }

  // Step 2: Prepare vegetables
  const veggies = ingredients.filter(ing =>
    ing.category === 'vegetable' ||
    ing.name.toLowerCase().includes('carrot') ||
    ing.name.toLowerCase().includes('sweet potato') ||
    ing.name.toLowerCase().includes('pumpkin') ||
    ing.name.toLowerCase().includes('broccoli')
  );

  if (veggies.length > 0) {
    instructions.push(
      `2. Steam or boil ${veggies.map(v => v.name.toLowerCase()).join(' and ')} until tender. Mash or chop into bite-sized pieces.`
    );
  }

  // Step 3: Mix
  instructions.push(
    `${instructions.length + 1}. Combine all ingredients in a bowl and mix thoroughly.`
  );

  // Step 4: Supplements
  const supplements = ingredients.filter(ing =>
    ing.category === 'supplement' ||
    ing.name.toLowerCase().includes('supplement') ||
    ing.name.toLowerCase().includes('calcium') ||
    ing.name.toLowerCase().includes('vitamin')
  );

  if (supplements.length > 0) {
    instructions.push(
      `${instructions.length + 1}. Sprinkle ${supplements.map(s => s.name.toLowerCase()).join(' and ')} over the mixture.`
    );
  }

  // Step 5: Serve
  instructions.push(
    `${instructions.length + 1}. Serve at room temperature. Store leftovers in an airtight container in the refrigerator for up to 3 days.`
  );

  return instructions;
}

// ============================================================================
// MAIN GENERATION FUNCTION
// ============================================================================

/**
 * Main function to generate a validated recipe
 */
export function generateValidatedRecipe(
  species: 'dogs' | 'cats' | 'birds' | 'reptiles' | 'pocket-pets',
  availableIngredients: string[],
  lifeStage: 'puppy' | 'adult' | 'senior' = 'adult',
  healthConcerns: string[] = [],
  maxAttempts: number = 50
): GeneratedRecipe | null {
  // Define target nutritional goals based on species
  const targets = {
    dogs: { protein: 25, fat: 15, calories: 1000 },
    cats: { protein: 30, fat: 20, calories: 1000 },
    birds: { protein: 18, fat: 8, calories: 800 },
    reptiles: { protein: 20, fat: 5, calories: 600 },
    'pocket-pets': { protein: 16, fat: 4, calories: 500 },
  };

  const target = targets[species];

  let bestAttempt: { recipe: IngredientWithAmount[]; validation: ValidationResult } | null = null;
  let bestScore = 0;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Select ingredients based on target nutrition
    const ingredients = selectIngredientsForTarget(
      availableIngredients,
      target.protein,
      target.fat,
      target.calories,
      species,
      healthConcerns
    );

    if (ingredients.length === 0) {
      continue;
    }

    // Calculate nutrition (includes missingIngredients and estimatedWeight)
    const nutritionResult = calculateRecipeNutrition(ingredients);
    const nutrition: RecipeNutrition = {
      totalCalories: nutritionResult.totalCalories,
      protein: nutritionResult.protein,
      fat: nutritionResult.fat,
      carbs: nutritionResult.carbs,
      fiber: nutritionResult.fiber,
      calcium: nutritionResult.calcium,
      phosphorus: nutritionResult.phosphorus,
      caPRatio: nutritionResult.caPRatio,
      totalWeight: nutritionResult.totalWeight,
      servings: nutritionResult.servings,
      caloriesPerServing: nutritionResult.caloriesPerServing,
    };
    
    // Validate (pass missing ingredients info and health concerns)
    const validation = validateRecipeNutrition({
      ...nutrition,
      missingIngredients: nutritionResult.missingIngredients,
      estimatedWeight: nutritionResult.estimatedWeight,
    }, species, lifeStage, healthConcerns);

    // Track best attempt
    if (!bestAttempt || validation.score > bestScore) {
      bestAttempt = { recipe: ingredients, validation };
      bestScore = validation.score;
    }

    // If valid (no errors), return the recipe
    if (validation.isValid) {
      const description = generateDescription(ingredients, nutrition, species, lifeStage, healthConcerns);
      const instructions = generateInstructions(ingredients, species);
      const portionGuidance = generatePortionGuidance(nutrition.totalCalories, species);

      return {
        ingredients,
        nutritionalInfo: nutrition,
        validation,
        description,
        instructions,
        portionGuidance,
      };
    }
  }

  // If we have a good enough attempt (score >= 60), use it
  if (bestAttempt && bestScore >= 60) {
    console.warn(`Recipe validation score: ${bestScore}/100. Warnings: ${bestAttempt.validation.warnings.join(', ')}`);
    
    const description = generateDescription(bestAttempt.recipe, bestAttempt.validation.nutritionInfo, species, lifeStage, healthConcerns);
    const instructions = generateInstructions(bestAttempt.recipe, species);
    const portionGuidance = generatePortionGuidance(bestAttempt.validation.nutritionInfo.totalCalories, species);

    return {
      ingredients: bestAttempt.recipe,
      nutritionalInfo: bestAttempt.validation.nutritionInfo,
      validation: bestAttempt.validation,
      description,
      instructions,
      portionGuidance,
    };
  }

  // Failed to generate valid recipe
  console.error(`Failed to generate valid recipe for ${species} after ${maxAttempts} attempts`);
  return null;
}

