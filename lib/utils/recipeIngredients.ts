// lib/utils/recipeIngredients.ts
// Utility to extract and map ingredients from recipes to ingredient composition keys

import { recipes } from '@/lib/data/recipes-complete';
import { INGREDIENT_COMPOSITIONS } from '@/lib/data/ingredientCompositions';

/**
 * Extract all unique ingredient names from all recipes
 */
export function getAllRecipeIngredients(): string[] {
  const ingredientNames = new Set<string>();
  
  recipes.forEach(recipe => {
    recipe.ingredients?.forEach(ing => {
      if (ing.name) {
        ingredientNames.add(ing.name);
      }
    });
  });
  
  return Array.from(ingredientNames).sort();
}

/**
 * Map recipe ingredient name to ingredient composition key
 * Handles variations and common naming patterns
 */
export function mapIngredientNameToKey(ingredientName: string): string | null {
  // Normalize the name
  const normalized = ingredientName
    .toLowerCase()
    .trim()
    .replace(/\s*\([^)]*\)/g, '') // Remove parentheses and contents
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
  
  // Direct lookup
  if (INGREDIENT_COMPOSITIONS[normalized]) {
    return normalized;
  }
  
  // Common mappings
  const mappings: Record<string, string | null> = {
    'ground_chicken': 'ground_turkey', // Use turkey as closest match
    'chicken_breast': 'chicken_breast',
    'chicken_liver': 'chicken_liver',
    'chicken_hearts': 'chicken_hearts',
    'beef_liver': 'beef_liver',
    'ground_beef': 'ground_beef_lean',
    'ground_turkey': 'ground_turkey',
    'turkey_breast': 'turkey_breast',
    'salmon_fillet': 'salmon_atlantic',
    'salmon': 'salmon_atlantic',
    'tuna': 'tuna_water',
    'sardines': 'sardines_water',
    'white_rice': 'brown_rice_cooked', // Use brown rice as closest match
    'brown_rice': 'brown_rice_cooked',
    'quinoa': 'quinoa_cooked',
    'sweet_potato': 'sweet_potato',
    'pumpkin': 'sweet_potato', // Use sweet potato as closest match
    'carrots': 'carrots_raw',
    'carrot': 'carrots_raw',
    'green_beans': 'broccoli_raw', // Use broccoli as closest match
    'bok_choy': 'kale_raw', // Use kale as closest match
    'broccoli': 'broccoli_raw',
    'spinach': 'spinach_raw',
    'kale': 'kale_raw',
    'celery': 'celery_raw',
    'blueberries': 'blueberries_raw',
    'bananas': 'bananas_raw',
    'eggs': 'eggs_whole',
    'fish_oil': 'fish_oil',
    'herring_oil': 'fish_oil', // Use fish oil as closest match
    'olive_oil': 'fish_oil', // Use fish oil as closest match
    'coconut_oil': 'fish_oil', // Use fish oil as closest match
    'chicken_broth': null, // No composition data
    'navy_beans': null, // No composition data
    'oats': 'oats',
    'taurine': 'taurine_powder',
    'calcium': 'calcium_carbonate',
  };
  
  // Check mappings
  if (mappings[normalized]) {
    return mappings[normalized];
  }
  
  // Try partial matches
  for (const key in INGREDIENT_COMPOSITIONS) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return key;
    }
  }
  
  return null;
}

/**
 * Get all ingredients that can be used in the recipe builder
 * Returns both ingredients from recipes and existing composition ingredients
 */
export function getAvailableIngredientsForBuilder(): string[] {
  const recipeIngredients = getAllRecipeIngredients();
  const compositionKeys = Object.keys(INGREDIENT_COMPOSITIONS);
  
  // Map recipe ingredients to composition keys
  const mappedKeys = new Set<string>();
  
  recipeIngredients.forEach(name => {
    const key = mapIngredientNameToKey(name);
    if (key) {
      mappedKeys.add(key);
    }
  });
  
  // Also include all composition keys
  compositionKeys.forEach(key => mappedKeys.add(key));
  
  return Array.from(mappedKeys).sort();
}

