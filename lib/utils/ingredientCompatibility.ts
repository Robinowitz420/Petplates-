// lib/utils/ingredientCompatibility.ts
// Utility functions for checking ingredient compatibility with species

import { INGREDIENT_COMPOSITIONS, type SpeciesCompatibility, type FeedingRole } from '@/lib/data/ingredientCompositions';
import { getIngredientComposition } from '@/lib/data/ingredientCompositions';

export type Species = 'dog' | 'cat' | 'bird' | 'reptile' | 'pocket-pet';

/**
 * Normalize species string to standard format
 */
export function normalizeSpecies(species: string): Species | string {
  const s = (species || '').toLowerCase();
  if (s.includes('dog')) return 'dog';
  if (s.includes('cat')) return 'cat';
  if (s.includes('bird') || s.includes('parrot') || s.includes('finch')) return 'bird';
  if (s.includes('reptile') || s.includes('lizard') || s.includes('bearded') || s.includes('dragon')) return 'reptile';
  if (s.includes('pocket') || s.includes('rabbit') || s.includes('guinea') || s.includes('hamster') || s.includes('gerbil')) return 'pocket-pet';
  return s;
}

/**
 * Get species compatibility for an ingredient
 */
export function getSpeciesCompatibility(ingredientKey: string, species: string): SpeciesCompatibility | null {
  const normalizedSpecies = normalizeSpecies(species);
  const composition = getIngredientComposition(ingredientKey);
  
  if (!composition?.speciesCompatibility) return null;
  
  return composition.speciesCompatibility[normalizedSpecies as keyof typeof composition.speciesCompatibility] || null;
}

/**
 * Get max inclusion percentage for an ingredient by species
 */
export function getMaxInclusionPercent(ingredientKey: string, species: string): number | null {
  const normalizedSpecies = normalizeSpecies(species);
  const composition = getIngredientComposition(ingredientKey);
  
  if (!composition?.maxInclusionPercentBySpecies) return null;
  
  return composition.maxInclusionPercentBySpecies[normalizedSpecies as keyof typeof composition.maxInclusionPercentBySpecies] || null;
}

/**
 * Get species-specific notes for an ingredient
 */
export function getSpeciesNotes(ingredientKey: string, species: string): string | null {
  const normalizedSpecies = normalizeSpecies(species);
  const composition = getIngredientComposition(ingredientKey);
  
  if (!composition?.notesBySpecies) return null;
  
  return composition.notesBySpecies[normalizedSpecies as keyof typeof composition.notesBySpecies] || null;
}

/**
 * Get feeding role for an ingredient
 */
export function getFeedingRole(ingredientKey: string): FeedingRole | null {
  const composition = getIngredientComposition(ingredientKey);
  return composition?.feedingRole || null;
}

/**
 * Check if ingredient is compatible with species
 */
export function isCompatible(ingredientKey: string, species: string): boolean {
  const compat = getSpeciesCompatibility(ingredientKey, species);
  return compat === 'ok' || compat === 'limit' || compat === 'caution';
}

/**
 * Check if ingredient should be avoided for species
 */
export function shouldAvoid(ingredientKey: string, species: string): boolean {
  const compat = getSpeciesCompatibility(ingredientKey, species);
  return compat === 'avoid';
}

/**
 * Check if ingredient should be limited for species
 */
export function shouldLimit(ingredientKey: string, species: string): boolean {
  const compat = getSpeciesCompatibility(ingredientKey, species);
  return compat === 'limit' || compat === 'caution';
}

