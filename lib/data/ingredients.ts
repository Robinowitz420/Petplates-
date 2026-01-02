/**
 * UNIFIED INGREDIENTS LAYER
 * Re-exports from unifiedIngredientRegistry.ts which consolidates all 300+ ingredients
 * from: ingredientCompositions, allIngredients, vetted-products, vetted-species-map
 */

import {
  getAllIngredients,
  getIngredientsForSpecies as getUnifiedIngredientsForSpecies,
  type UnifiedIngredient,
  type Species as RegistrySpecies,
  type IngredientCategory as RegistryCategory,
} from './unifiedIngredientRegistry';
import { getMicronutrients } from './micronutrientDefaults';

export type Species = 'dogs' | 'cats' | 'birds' | 'reptiles' | 'pocket-pets';
export type IngredientCategory = 'protein' | 'carb' | 'grain' | 'vegetable' | 'fruit' | 'fat' | 'supplement' | 'seed' | 'nut' | 'insect' | 'hay' | 'pellet';
export type CompatibilityLevel = 'ok' | 'limit' | 'avoid' | 'caution';

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  palatability?: Partial<Record<Species, number>>;
  
  // Protein hierarchy (only for proteins)
  proteinRole?: 'primary' | 'secondary';  // PHASE 1.7: Explicit protein role
  
  // Nutritional data (per 100g)
  composition: {
    protein?: number;
    fat?: number;
    carbs?: number;
    fiber?: number;
    calcium?: number;
    phosphorus?: number;
    kcal?: number;
    vitaminA?: number;
    vitaminC?: number;
    omega3?: number;
    taurine?: number;
    moisture?: number;
    CaP_ratio?: number;
    copper_mg_per_100g?: number;  // PHASE 2: Micronutrient toxicity
    iodine_mcg_per_100g?: number; // PHASE 2: Micronutrient toxicity

    // --- TIER 1 (Critical) micronutrients ---
    omega6_g_100g?: number;
    vitaminD_mcg_100g?: number;
    vitaminE_mg_100g?: number;
    vitaminB12_mcg_100g?: number;
    zinc_mg_100g?: number;
    iron_mg_100g?: number;

    // --- TIER 2 (Medium) micronutrients ---
    magnesium_mg_100g?: number;
    potassium_mg_100g?: number;
    selenium_mcg_100g?: number;
    folate_mcg_100g?: number;
    vitaminB6_mg_100g?: number;
    niacin_mg_100g?: number;

    // --- TIER 3 (Lower) micronutrients ---
    manganese_mg_100g?: number;
    vitaminK_mcg_100g?: number;
    sodium_mg_100g?: number;
    chloride_mg_100g?: number;
  };
  
  // Species compatibility
  compatibility: Record<Species, CompatibilityLevel>;
  
  // Feeding guidelines
  feedingRole: 'staple' | 'secondary' | 'supplement' | 'treat' | 'forage';
  maxInclusionPercent: Record<Species, number>;
  
  // Cost & quality
  pricePerLb?: number;
  qualityScore: number; // 1-10
  
  // Metadata
  source?: string;
}

/**
 * Convert UnifiedIngredient to our Ingredient format
 */
function convertUnifiedToIngredient(unified: UnifiedIngredient): Ingredient {
  // Map registry species to our species format
  const speciesMap: Record<RegistrySpecies, Species> = {
    dog: 'dogs',
    cat: 'cats',
    bird: 'birds',
    reptile: 'reptiles',
    'pocket-pet': 'pocket-pets',
  };

  // Map compatibility
  const compatibility: Record<Species, CompatibilityLevel> = {
    dogs: (unified.speciesCompatibility.dog as CompatibilityLevel) || 'ok',
    cats: (unified.speciesCompatibility.cat as CompatibilityLevel) || 'ok',
    birds: (unified.speciesCompatibility.bird as CompatibilityLevel) || 'ok',
    reptiles: (unified.speciesCompatibility.reptile as CompatibilityLevel) || 'ok',
    'pocket-pets': (unified.speciesCompatibility['pocket-pet'] as CompatibilityLevel) || 'ok',
  };

  // Map max inclusion (default to 0.3 if not specified)
  const maxInclusionPercent: Record<Species, number> = {
    dogs: 0.3,
    cats: 0.3,
    birds: 0.3,
    reptiles: 0.3,
    'pocket-pets': 0.3,
  };

  // Get nutrition data first
  const nutrition = unified.nutrition;

  // Infer category
  let category: IngredientCategory = 'supplement';
  const regCategory = unified.category as string;
  
  if (regCategory === 'protein') category = 'protein';
  else if (regCategory === 'grain') category = 'carb';  // Map 'grain' from registry to 'carb'
  else if (regCategory === 'vegetable') category = 'vegetable';
  else if (regCategory === 'fruit') category = 'fruit';
  else if (regCategory === 'fat') category = 'fat';
  else if (regCategory === 'seed') category = 'seed';
  else if (regCategory === 'nut') category = 'nut';
  else if (regCategory === 'insect') category = 'insect';
  else if (regCategory === 'hay') category = 'hay';
  else if (regCategory === 'pellet') category = 'pellet';
  else if (regCategory === 'supplement') category = 'supplement';

  // PHASE 1.7: Get proteinRole directly from composition data
  let proteinRole: 'primary' | 'secondary' | undefined;
  if (category === 'protein') {
    // Read proteinRole directly from the composition object
    proteinRole = (nutrition as any).proteinRole;
    // PHASE 2.4: Default to 'secondary' if not explicitly set
    if (!proteinRole) {
      proteinRole = 'secondary';
    }
  }

  // PHASE 2: Get micronutrient defaults (copper, iodine)
  const micronutrients = getMicronutrients(unified.primaryDisplayName, (nutrition as any).feedingRole);

  // Estimate quality score (1-10)
  let qualityScore = 5;
  if (nutrition.protein && nutrition.protein > 20) qualityScore += 2;
  if (nutrition.omega3 && nutrition.omega3 > 0.5) qualityScore += 1;
  if (nutrition.fiber && nutrition.fiber > 3) qualityScore += 1;
  if (nutrition.calcium && nutrition.phosphorus) {
    const ratio = nutrition.calcium / nutrition.phosphorus;
    if (ratio >= 1.0 && ratio <= 2.0) qualityScore += 1;
  }
  qualityScore = Math.min(10, Math.max(1, qualityScore));

  return {
    id: unified.id,
    name: unified.primaryDisplayName,
    category,
    palatability: (unified as any).palatability,
    proteinRole,  // PHASE 1.7: Explicit protein role
    composition: {
      protein: nutrition.protein,
      fat: nutrition.fat,
      carbs: nutrition.carbs,
      fiber: nutrition.fiber,
      calcium: nutrition.calcium,
      phosphorus: nutrition.phosphorus,
      kcal: nutrition.kcal,
      vitaminA: nutrition.vitaminA,
      vitaminC: nutrition.vitaminC,
      omega3: nutrition.omega3,
      taurine: nutrition.taurine,
      moisture: nutrition.moisture,
      CaP_ratio: nutrition.CaP_ratio,
      copper_mg_per_100g: (nutrition as any).copper_mg_per_100g || micronutrients.copper_mg_per_100g,
      iodine_mcg_per_100g: (nutrition as any).iodine_mcg_per_100g || micronutrients.iodine_mcg_per_100g,

      // --- TIER 1 ---
      omega6_g_100g: (nutrition as any).omega6_g_100g,
      vitaminD_mcg_100g: (nutrition as any).vitaminD_mcg_100g,
      vitaminE_mg_100g: (nutrition as any).vitaminE_mg_100g,
      vitaminB12_mcg_100g: (nutrition as any).vitaminB12_mcg_100g,
      zinc_mg_100g: (nutrition as any).zinc_mg_100g,
      iron_mg_100g: (nutrition as any).iron_mg_100g,

      // --- TIER 2 ---
      magnesium_mg_100g: (nutrition as any).magnesium_mg_100g,
      potassium_mg_100g: (nutrition as any).potassium_mg_100g,
      selenium_mcg_100g: (nutrition as any).selenium_mcg_100g,
      folate_mcg_100g: (nutrition as any).folate_mcg_100g,
      vitaminB6_mg_100g: (nutrition as any).vitaminB6_mg_100g,
      niacin_mg_100g: (nutrition as any).niacin_mg_100g,

      // --- TIER 3 ---
      manganese_mg_100g: (nutrition as any).manganese_mg_100g,
      vitaminK_mcg_100g: (nutrition as any).vitaminK_mcg_100g,
      sodium_mg_100g: (nutrition as any).sodium_mg_100g,
      chloride_mg_100g: (nutrition as any).chloride_mg_100g,
    },
    compatibility,
    feedingRole: (nutrition.feedingRole as any) || 'staple',
    maxInclusionPercent,
    qualityScore,
    source: nutrition.source,
  };
}

/**
 * UNIFIED INGREDIENTS DATABASE
 * Converts all UnifiedIngredients (300+) to our format
 */
export const INGREDIENTS: Record<string, Ingredient> = (() => {
  const result: Record<string, Ingredient> = {};
  
  const allUnified = getAllIngredients();
  for (const unified of allUnified) {
    try {
      result[unified.id] = convertUnifiedToIngredient(unified);
    } catch (error) {
      console.warn(`Failed to convert ingredient ${unified.id}:`, error);
    }
  }
  
  return result;
})();

/**
 * Get all ingredients for a specific species
 * CRITICAL FIX: Species-specific category filtering
 */
export function getIngredientsForSpecies(species: Species): Ingredient[] {
  return Object.values(INGREDIENTS).filter(ing => {
    // Filter by species compatibility
    if (ing.compatibility[species] === 'avoid') return false;
    
    // Species-specific category filtering
    if (species === 'birds') {
      // Birds need: seeds, nuts, fruits, veggies (NOT mammalian proteins)
      if (ing.category === 'protein') {
        // Allow eggs only
        return ing.name.toLowerCase().includes('egg');
      }
      return ['seed', 'nut', 'fruit', 'vegetable', 'supplement'].includes(ing.category);
    }
    
    if (species === 'reptiles') {
      // Reptiles need: insects, veggies, fruits (NO grains/carbs)
      if (ing.category === 'carb') {
        return false; // No grains for reptiles
      }
      return ['insect', 'protein', 'vegetable', 'fruit', 'supplement'].includes(ing.category);
    }
    
    if (species === 'pocket-pets') {
      // Pocket-pets need: hay, veggies, fruits, seeds (NO meat proteins except eggs/insects)
      if (ing.category === 'protein') {
        const name = ing.name.toLowerCase();
        return name.includes('egg') || name.includes('mealworm');
      }
      return ['hay', 'vegetable', 'fruit', 'seed', 'supplement'].includes(ing.category);
    }
    
    // Dogs and cats: accept all categories
    return true;
  });
}

/**
 * Get ingredients by category
 */
export function getIngredientsByCategory(category: IngredientCategory): Ingredient[] {
  return Object.values(INGREDIENTS).filter(ing => ing.category === category);
}

/**
 * Get ingredient by ID
 */
export function getIngredient(id: string): Ingredient | undefined {
  return INGREDIENTS[id];
}

/**
 * Get ingredient by name (case-insensitive)
 */
export function getIngredientByName(name: string): Ingredient | undefined {
  const normalized = name.toLowerCase().trim();
  return Object.values(INGREDIENTS).find(ing => ing.name.toLowerCase() === normalized);
}

/**
 * Get total ingredient count
 */
export function getIngredientCount(): number {
  return Object.keys(INGREDIENTS).length;
}
