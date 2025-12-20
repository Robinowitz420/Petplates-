/**
 * COMMERCIAL PRIOR ENFORCEMENT
 * 
 * Enforces learned commercial pairing rules:
 * - hardBlockPairs: Filter out candidates that never co-occur with selected ingredients
 * - strongPenaltyPairs: Apply harsh penalty (0.05x) to rare negative pairings
 * - Positive PMI: Apply soft boost (1.05-1.15x) to common pairings
 */

import recipePriors from '../data/recipePriors.json';
import type { Species } from '../types';

interface CommercialPriors {
  ingredientCounts: Record<string, number>;
  ingredientFreq: Record<string, number>;
  pairCounts: Record<string, number>;
  pairPMI: Record<string, number>;
  hardBlockPairs: string[];
  strongPenaltyPairs: string[];
}

/**
 * Normalize pair key to sorted format (a|b)
 */
function normalizePairKey(ing1: string, ing2: string): string {
  return [ing1, ing2].sort().join('|');
}

/**
 * Get commercial priors for a species
 */
function getCommercialPriors(species: Species): CommercialPriors | null {
  const priors = (recipePriors as any).commercialPriors;
  if (!priors) return null;
  
  // Map species to commercial priors key
  const speciesKey = species === 'dogs' || species === 'cats' ? species : null;
  if (!speciesKey) return null;
  
  return priors[speciesKey] as CommercialPriors;
}

/**
 * Check if a candidate ingredient is hard-blocked by any selected ingredient
 * Returns the blocking pair if found, null otherwise
 */
export function checkHardBlock(
  candidateId: string,
  selectedIngredientIds: string[],
  species: Species
): string | null {
  const priors = getCommercialPriors(species);
  if (!priors || !priors.hardBlockPairs) return null;
  
  const hardBlockSet = new Set(priors.hardBlockPairs);
  
  for (const selectedId of selectedIngredientIds) {
    const pairKey = normalizePairKey(candidateId, selectedId);
    if (hardBlockSet.has(pairKey)) {
      return pairKey;
    }
  }
  
  return null;
}

/**
 * Check if a candidate ingredient has strong penalty pairs with selected ingredients
 * Returns array of penalty pairs
 */
export function checkStrongPenalty(
  candidateId: string,
  selectedIngredientIds: string[],
  species: Species
): string[] {
  const priors = getCommercialPriors(species);
  if (!priors || !priors.strongPenaltyPairs) return [];
  
  const penaltySet = new Set(priors.strongPenaltyPairs);
  const penaltyPairs: string[] = [];
  
  for (const selectedId of selectedIngredientIds) {
    const pairKey = normalizePairKey(candidateId, selectedId);
    if (penaltySet.has(pairKey)) {
      penaltyPairs.push(pairKey);
    }
  }
  
  return penaltyPairs;
}

/**
 * Get PMI boost for a candidate ingredient paired with selected ingredients
 * Returns multiplier (1.0 = no change, >1.0 = boost, <1.0 = penalty)
 */
export function getPMIBoost(
  candidateId: string,
  selectedIngredientIds: string[],
  species: Species
): number {
  const priors = getCommercialPriors(species);
  if (!priors || !priors.pairPMI) return 1.0;
  
  let totalPMI = 0;
  let pairCount = 0;
  
  for (const selectedId of selectedIngredientIds) {
    const pairKey = normalizePairKey(candidateId, selectedId);
    const pmi = priors.pairPMI[pairKey];
    
    if (pmi !== undefined && pmi > 0) {
      totalPMI += pmi;
      pairCount++;
    }
  }
  
  if (pairCount === 0) return 1.0;
  
  // Average PMI across pairs
  const avgPMI = totalPMI / pairCount;
  
  // Convert to multiplier: PMI of 1.0 -> 1.05x boost, PMI of 2.0 -> 1.10x boost
  // Cap at 1.15x to avoid over-boosting
  const boost = 1.0 + Math.min(avgPMI * 0.05, 0.15);
  
  return boost;
}

/**
 * Filter candidates by commercial priors
 * Removes hard-blocked candidates and logs reasons
 */
export function filterCandidatesByCommercialPriors<T extends { id: string }>(
  candidates: T[],
  selectedIngredientIds: string[],
  species: Species,
  logPrefix: string = ''
): T[] {
  const priors = getCommercialPriors(species);
  if (!priors) return candidates;
  
  return candidates.filter(candidate => {
    const blockingPair = checkHardBlock(candidate.id, selectedIngredientIds, species);
    
    if (blockingPair) {
      const [ing1, ing2] = blockingPair.split('|');
      console.log(`${logPrefix}[PAIR BLOCK] ${candidate.id}: Never co-occurs with ${ing1 === candidate.id ? ing2 : ing1} (commercial data)`);
      return false;
    }
    
    return true;
  });
}

/**
 * Apply commercial prior scoring to a candidate
 * Returns modified score and logs reasons
 */
export function applyCommercialPriorScoring(
  candidateId: string,
  baseScore: number,
  selectedIngredientIds: string[],
  species: Species,
  logPrefix: string = ''
): number {
  const priors = getCommercialPriors(species);
  if (!priors) return baseScore;
  
  let score = baseScore;
  
  // Check for strong penalty pairs
  const penaltyPairs = checkStrongPenalty(candidateId, selectedIngredientIds, species);
  if (penaltyPairs.length > 0) {
    score *= 0.05; // Harsh penalty
    penaltyPairs.forEach(pair => {
      const [ing1, ing2] = pair.split('|');
      const otherIng = ing1 === candidateId ? ing2 : ing1;
      console.log(`${logPrefix}[PAIR PENALTY] ${candidateId}: Rare pairing with ${otherIng} (commercial data, PMI<-1.5)`);
    });
  }
  
  // Apply PMI boost for positive pairings
  const pmiBoost = getPMIBoost(candidateId, selectedIngredientIds, species);
  if (pmiBoost > 1.0) {
    score *= pmiBoost;
    console.log(`${logPrefix}[PMI BOOST] ${candidateId}: ${pmiBoost.toFixed(2)}x boost from commercial pairings`);
  }
  
  return score;
}

/**
 * Check if commercial priors are available for a species
 */
export function hasCommercialPriors(species: Species): boolean {
  return getCommercialPriors(species) !== null;
}
