// lib/data/globalIngredients.ts
// Global ingredient pool - all ingredients regardless of species
// Each ingredient has speciesCompatibility mapping
// This allows ingredients to be discovered once and mapped to multiple species

import type { IngredientComposition } from './ingredientCompositions';

export interface GlobalIngredient {
  id: string; // e.g., "carrot_raw"
  displayName: string; // e.g., "Carrot (raw)"
  category: 'protein' | 'vegetable' | 'fruit' | 'grain' | 'supplement' | 'insect' | 'hay' | 'other';
  compositionKey?: string; // Reference to INGREDIENT_COMPOSITIONS key
  composition?: IngredientComposition; // Optional: full composition data
  commonNames?: string[]; // Alternative names found in scrapes
  confidenceLevel?: 'high' | 'medium' | 'low'; // Data quality
  lastScraped?: string; // ISO date
  sources?: string[]; // URLs where this was found
  scrapedCount?: number; // How many times found in scrapes
}

// This will be populated from scraped data + manual curation
// Structure: { [ingredientId]: GlobalIngredient }
export const GLOBAL_INGREDIENTS: Record<string, GlobalIngredient> = {
  // Will be populated by processing scraped results
  // For now, we'll seed with existing INGREDIENT_COMPOSITIONS
};

/**
 * Get global ingredient by ID
 */
export function getGlobalIngredient(id: string): GlobalIngredient | undefined {
  return GLOBAL_INGREDIENTS[id];
}

/**
 * Get all global ingredients
 */
export function getAllGlobalIngredients(): GlobalIngredient[] {
  return Object.values(GLOBAL_INGREDIENTS);
}

/**
 * Get global ingredients by category
 */
export function getGlobalIngredientsByCategory(category: GlobalIngredient['category']): GlobalIngredient[] {
  return Object.values(GLOBAL_INGREDIENTS).filter(ing => ing.category === category);
}

/**
 * Search global ingredients by name
 */
export function searchGlobalIngredients(query: string): GlobalIngredient[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(GLOBAL_INGREDIENTS).filter(ing => 
    ing.displayName.toLowerCase().includes(lowerQuery) ||
    ing.id.toLowerCase().includes(lowerQuery) ||
    ing.commonNames?.some(name => name.toLowerCase().includes(lowerQuery))
  );
}

