// lib/utils/scoringTransparency.ts
// Scoring transparency debug tool

import type { Recipe } from '@/lib/types';
import { calculateEnhancedCompatibility, type Pet, calculateBonuses, calculateRecipeNutrition } from './enhancedCompatibilityScoring';

export interface ScoringReport {
  factors: Record<string, {
    score: number;
    weight: number;
    contribution: number;
    canBe100: boolean;
    explanation: string;
    issues: string[];
  }>;
  currentScore: number;
  maxPossibleScore: number;
  canReach100: boolean;
  barriersTo100: string[];
  bonuses: number;
  penalties: number;
}

/**
 * Generate a detailed scoring report for debugging
 */
export function generateScoringReport(
  recipe: Recipe,
  pet: Pet
): ScoringReport {
  const result = calculateEnhancedCompatibility(recipe, pet);
  const bonuses = calculateBonuses(recipe, pet);
  
  const factors: ScoringReport['factors'] = {};
  let maxPossible = 0;
  const barriers: string[] = [];
  
  Object.entries(result.factors).forEach(([key, factor]) => {
    const weight = factor.weight || 0;
    const contribution = factor.score * weight;
    const canBe100 = checkIfFactorCanBe100(key, recipe, pet);
    
    if (!canBe100 && factor.score < 100) {
      barriers.push(`${key}: ${factor.reasoning}`);
    }
    
    maxPossible += canBe100 ? 100 * weight : factor.score * weight;
    
    factors[key] = {
      score: factor.score,
      weight,
      contribution,
      canBe100,
      explanation: factor.reasoning,
      issues: factor.issues
    };
  });
  
  return {
    factors,
    currentScore: result.overallScore,
    maxPossibleScore: maxPossible + bonuses,
    canReach100: maxPossible + bonuses >= 99.5,
    barriersTo100: barriers,
    bonuses,
    penalties: result.detailedBreakdown.warnings.length
  };
}

/**
 * Check if a factor can theoretically reach 100% for this recipe+pet combination
 */
function checkIfFactorCanBe100(factorName: string, recipe: Recipe, pet: Pet): boolean {
  switch (factorName) {
    case 'ingredientSafety':
      // Can be 100 if all ingredients are safe
      return true;
    case 'nutritionalAdequacy':
      // Can be 100 if nutrition is perfect and no fallback data (or pet has no concerns)
      const nutrition = calculateRecipeNutrition(recipe);
      if (pet.healthConcerns.length === 0) {
        // Perfect pets don't penalize fallback data
        return true;
      }
      return !nutrition.usesFallbackNutrition;
    case 'healthAlignment':
      // Can be 100 if pet has no health concerns
      return pet.healthConcerns.length === 0;
    case 'lifeStageFit':
      // Can be 100 if age matches
      return true;
    case 'activityFit':
      // Can be 100 if activity level not specified or matches
      return true;
    case 'allergenSafety':
      // Can be 100 if no allergens
      return (pet.allergies?.length ?? 0) === 0 && pet.dietaryRestrictions.length === 0;
    case 'ingredientQuality':
      // Can be 100 if all ingredients are premium (but this is now a bonus, not requirement)
      return true;
    default:
      return true;
  }
}


