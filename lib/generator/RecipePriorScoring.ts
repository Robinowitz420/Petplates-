/**
 * RECIPE PRIOR SCORING
 * Soft scoring boosts based on learned patterns from scraped recipes
 * Integrates with RecipeBuilder to improve realism and variety
 */

import recipePriors from '../data/recipePriors.json';
import { Ingredient } from '../data/ingredients';

interface RecipePriors {
  coOccurrence: {
    [species: string]: {
      pairs: Record<string, number>;
      triples: Record<string, number>;
    };
  };
  categoryRatios: {
    [species: string]: {
      protein: { mean: number; stdDev: number };
      vegetable: { mean: number; stdDev: number };
      fat: { mean: number; stdDev: number };
      carbohydrate: { mean: number; stdDev: number };
    };
  };
  ingredientCounts: {
    [species: string]: {
      mean: number;
      median: number;
      min: number;
      max: number;
    };
  };
}

const priors = recipePriors as RecipePriors;

/**
 * Calculate co-occurrence boost for an ingredient based on already-selected ingredients
 * Returns a score boost (0-1) based on how often this ingredient appears with the selected ones
 */
export function calculateCoOccurrenceBoost(
  candidateIngredient: Ingredient,
  selectedIngredients: Ingredient[],
  species: string
): number {
  if (selectedIngredients.length === 0) return 0;
  
  const speciesPriors = priors.coOccurrence[species];
  if (!speciesPriors) return 0;

  let totalBoost = 0;
  let pairCount = 0;

  // Check pairs with each selected ingredient
  for (const selected of selectedIngredients) {
    const pair1 = `${candidateIngredient.name}+${selected.name}`;
    const pair2 = `${selected.name}+${candidateIngredient.name}`;
    
    const count = speciesPriors.pairs[pair1] || speciesPriors.pairs[pair2] || 0;
    if (count > 0) {
      totalBoost += Math.log(count + 1) / 10; // Logarithmic scaling
      pairCount++;
    }
  }

  // Check triples if we have 2+ selected ingredients
  if (selectedIngredients.length >= 2) {
    for (let i = 0; i < selectedIngredients.length - 1; i++) {
      for (let j = i + 1; j < selectedIngredients.length; j++) {
        const ingredients = [
          candidateIngredient.name,
          selectedIngredients[i].name,
          selectedIngredients[j].name,
        ].sort();
        
        const triple = ingredients.join('+');
        const count = speciesPriors.triples[triple] || 0;
        
        if (count > 0) {
          totalBoost += Math.log(count + 1) / 5; // Higher weight for triples
        }
      }
    }
  }

  // Normalize to 0-1 range
  return Math.min(totalBoost, 1.0);
}

/**
 * Calculate category ratio penalty based on deviation from learned distributions
 * Returns a penalty (0-1) where 0 = perfect match, 1 = very far from typical
 */
export function calculateCategoryRatioPenalty(
  categoryRatios: Record<string, number>,
  species: string
): number {
  const speciesPriors = priors.categoryRatios[species];
  if (!speciesPriors) return 0;

  let totalDeviation = 0;
  let categoryCount = 0;

  for (const [category, ratio] of Object.entries(categoryRatios)) {
    const prior = speciesPriors[category as keyof typeof speciesPriors];
    if (!prior) continue;

    // Calculate z-score (how many standard deviations away)
    const zScore = Math.abs(ratio - prior.mean) / prior.stdDev;
    
    // Convert to penalty (0-1)
    // z-score of 0 = 0 penalty, z-score of 3+ = 1 penalty
    const penalty = Math.min(zScore / 3, 1.0);
    
    totalDeviation += penalty;
    categoryCount++;
  }

  return categoryCount > 0 ? totalDeviation / categoryCount : 0;
}

/**
 * Calculate ingredient count penalty based on deviation from typical recipe sizes
 * Returns a penalty (0-1) where 0 = typical count, 1 = very unusual count
 */
export function calculateIngredientCountPenalty(
  ingredientCount: number,
  species: string
): number {
  const speciesPriors = priors.ingredientCounts[species];
  if (!speciesPriors) return 0;

  const { mean, min, max } = speciesPriors;

  // Within typical range = no penalty
  if (ingredientCount >= min && ingredientCount <= max) {
    // Small penalty for being far from mean
    const deviation = Math.abs(ingredientCount - mean);
    return Math.min(deviation / (max - min), 0.3);
  }

  // Outside typical range = higher penalty
  if (ingredientCount < min) {
    const deficit = min - ingredientCount;
    return Math.min(0.5 + (deficit / min) * 0.5, 1.0);
  }

  // Too many ingredients
  const excess = ingredientCount - max;
  return Math.min(0.5 + (excess / max) * 0.5, 1.0);
}

/**
 * Get typical ingredient count range for a species
 */
export function getTypicalIngredientCount(species: string): { min: number; max: number; median: number } {
  const speciesPriors = priors.ingredientCounts[species];
  if (!speciesPriors) {
    return { min: 3, max: 10, median: 6 };
  }
  return {
    min: speciesPriors.min,
    max: speciesPriors.max,
    median: speciesPriors.median,
  };
}

/**
 * Check if an ingredient is commonly paired with a protein for this species
 * Used to boost vegetables/fats that commonly appear with the selected protein
 */
export function isCommonProteinPairing(
  ingredient: Ingredient,
  protein: Ingredient,
  species: string,
  pairingType: 'fat' | 'vegetable'
): boolean {
  const speciesPriors = priors.categoryPairs?.[species];
  if (!speciesPriors) return false;

  const pairings = pairingType === 'fat' 
    ? speciesPriors.proteinWithFat 
    : speciesPriors.proteinWithVeg;

  const commonPairs = pairings?.[protein.name] || [];
  return commonPairs.includes(ingredient.name);
}

/**
 * Apply all prior-based scoring adjustments to a base score
 * This is the main integration point for RecipeBuilder
 */
export function applyPriorScoring(
  ingredient: Ingredient,
  baseScore: number,
  selectedIngredients: Ingredient[],
  species: string,
  options: {
    coOccurrenceWeight?: number;
    proteinPairingWeight?: number;
  } = {}
): number {
  const {
    coOccurrenceWeight = 0.15,
    proteinPairingWeight = 0.1,
  } = options;

  let adjustedScore = baseScore;

  // 1. Co-occurrence boost
  const coOccurrenceBoost = calculateCoOccurrenceBoost(
    ingredient,
    selectedIngredients,
    species
  );
  adjustedScore += coOccurrenceBoost * coOccurrenceWeight;

  // 2. Protein pairing boost
  const selectedProtein = selectedIngredients.find(i => i.category === 'protein');
  if (selectedProtein) {
    if (ingredient.category === 'fat') {
      const isCommon = isCommonProteinPairing(ingredient, selectedProtein, species, 'fat');
      if (isCommon) {
        adjustedScore += proteinPairingWeight;
      }
    } else if (ingredient.category === 'vegetable') {
      const isCommon = isCommonProteinPairing(ingredient, selectedProtein, species, 'vegetable');
      if (isCommon) {
        adjustedScore += proteinPairingWeight;
      }
    }
  }

  return adjustedScore;
}
