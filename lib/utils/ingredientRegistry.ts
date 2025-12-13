// lib/utils/ingredientRegistry.ts
// Utility functions for accessing the unified ingredient registry
// Provides convenient accessors and normalization functions

import {
  getIngredientById,
  getIngredientByName,
  normalizeIngredientName,
  getIngredientsForSpecies,
  getIngredientsByCategory,
  getAllIngredients,
  searchIngredients,
  type UnifiedIngredient,
  type Species,
  type IngredientCategory,
} from '../data/unifiedIngredientRegistry';

// Re-export types and functions for convenience
export {
  getIngredientById,
  getIngredientByName,
  normalizeIngredientName,
  getIngredientsForSpecies,
  getIngredientsByCategory,
  getAllIngredients,
  searchIngredients,
  type UnifiedIngredient,
  type Species,
  type IngredientCategory,
};

/**
 * Convert between different ingredient name formats
 */
export function convertIngredientName(
  name: string,
  targetFormat: 'id' | 'display' | 'normalized'
): string {
  const ingredient = getIngredientByName(name);
  
  if (!ingredient) {
    // If not found, return normalized version
    if (targetFormat === 'id' || targetFormat === 'normalized') {
      return normalizeIngredientName(name);
    }
    return name; // Return original for display
  }
  
  switch (targetFormat) {
    case 'id':
      return ingredient.id;
    case 'display':
      return ingredient.primaryDisplayName;
    case 'normalized':
      return ingredient.id;
    default:
      return name;
  }
}

/**
 * Check if an ingredient name matches any known ingredient (fuzzy)
 */
export function isKnownIngredient(name: string): boolean {
  return getIngredientByName(name) !== null;
}

/**
 * Get all display name variations for an ingredient
 */
export function getIngredientNameVariations(name: string): string[] {
  const ingredient = getIngredientByName(name);
  return ingredient?.displayNames || [name];
}

/**
 * Find best matching ingredient name from a list of candidates
 */
export function findBestMatch(
  query: string,
  candidates: string[]
): string | null {
  const normalizedQuery = normalizeIngredientName(query);
  const queryIngredient = getIngredientByName(query);
  
  if (!queryIngredient) {
    return null;
  }
  
  // Find candidate that matches the same ingredient
  for (const candidate of candidates) {
    const candidateIngredient = getIngredientByName(candidate);
    if (candidateIngredient && candidateIngredient.id === queryIngredient.id) {
      return candidate;
    }
  }
  
  return null;
}

/**
 * Get nutrition data for an ingredient (with fallback)
 */
export function getIngredientNutrition(name: string) {
  const ingredient = getIngredientByName(name);
  return ingredient?.nutrition || null;
}

/**
 * Check if ingredient is compatible with species
 */
export function isIngredientCompatibleWithSpecies(
  name: string,
  species: Species
): boolean {
  const ingredient = getIngredientByName(name);
  if (!ingredient) return false;
  
  const compat = ingredient.speciesCompatibility[species];
  return compat === 'ok' || compat === 'limit' || compat === 'caution';
}

/**
 * Check if ingredient should be avoided for species
 */
export function shouldAvoidIngredient(name: string, species: Species): boolean {
  const ingredient = getIngredientByName(name);
  if (!ingredient) return false;
  
  const compat = ingredient.speciesCompatibility[species];
  return compat === 'avoid';
}

/**
 * Get vetted products for an ingredient
 */
export function getIngredientVettedProducts(name: string) {
  const ingredient = getIngredientByName(name);
  return ingredient?.vettedProducts || [];
}

