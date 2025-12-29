// lib/utils/scoringTransparency.ts
// Scoring transparency debug tool

import type { Recipe } from '@/lib/types';
import { calculateRecipeNutrition } from './recipeNutrition';
import { scoreWithSpeciesEngine, type SpeciesScoringPet } from './speciesScoringEngines';

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
  pet: SpeciesScoringPet
): ScoringReport {
  const result = scoreWithSpeciesEngine(recipe, pet);
  const bonuses = 0;
  
  const factors: ScoringReport['factors'] = {};
  let maxPossible = 0;
  const barriers: string[] = [];

  const weights = { safety: 0.30, nutrition: 0.40, health: 0.20, quality: 0.10 };
  (Object.keys(weights) as Array<keyof typeof weights>).forEach((key) => {
    const weight = weights[key];
    const score = (result.factors as any)[key] ?? 0;
    const contribution = score * weight;
    const canBe100 = checkIfFactorCanBe100(key, recipe, pet);

    if (!canBe100 && score < 100) {
      barriers.push(`${key}: ${result.warnings.slice(0, 3).join('; ')}`);
    }

    maxPossible += canBe100 ? 100 * weight : score * weight;

    factors[key] = {
      score,
      weight,
      contribution,
      canBe100,
      explanation: '',
      issues: result.warnings,
    };
  });
  
  return {
    factors,
    currentScore: result.overallScore,
    maxPossibleScore: maxPossible + bonuses,
    canReach100: maxPossible + bonuses >= 99.5,
    barriersTo100: barriers,
    bonuses,
    penalties: result.warnings.length
  };
}

/**
 * Check if a factor can theoretically reach 100% for this recipe+pet combination
 */
function checkIfFactorCanBe100(factorName: string, recipe: Recipe, pet: SpeciesScoringPet): boolean {
  switch (factorName) {
    case 'safety':
      // Can be 100 if all ingredients are safe
      return true;
    case 'nutrition':
      // Can be 100 if nutrition is perfect and no fallback data (or pet has no concerns)
      const nutrition = calculateRecipeNutrition(recipe);
      if ((pet.healthConcerns?.length ?? 0) === 0) {
        // Perfect pets don't penalize fallback data
        return true;
      }
      return !nutrition.usesFallbackNutrition;
    case 'health':
      // Can be 100 if pet has no health concerns
      return (pet.healthConcerns?.length ?? 0) === 0;
    case 'quality':
      // Can be 100 if all ingredients are premium (but this is now a bonus, not requirement)
      return true;
    default:
      return true;
  }
}


