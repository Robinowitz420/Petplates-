/**
 * PMI-BASED PAIRING INTELLIGENCE
 * Uses learned statistical priors from BOTH recipe scraping AND commercial products
 * NOT hardcoded rules - behavior changes when recipePriors.json changes
 */

import type { Ingredient } from '@/lib/data/ingredients';
import priors from '@/lib/data/recipePriors.json';

interface PairingScore {
  score: number;
  reason: string;
  pmiValue?: number;
  source?: 'recipe' | 'commercial' | 'both';
}

/**
 * Calculate PMI-based pairing score for an ingredient given already-selected ingredients
 * Combines recipe priors AND commercial priors for stronger signal
 * Returns both the score and an explanation
 */
export function calculatePairingScore(
  ingredient: Ingredient,
  selectedIngredients: Ingredient[],
  species: string
): PairingScore {
  if (selectedIngredients.length === 0) {
    return { score: 0, reason: 'No selected ingredients' };
  }

  const ingName = ingredient.name;
  let totalPMI = 0;
  let pairCount = 0;
  let negativePenalty = 0;
  const reasons: string[] = [];
  let hasRecipePriors = false;
  let hasCommercialPriors = false;

  // Check recipe priors (homemade recipes)
  const recipePriors = priors.coOccurrence?.[species];
  if (recipePriors) {
    for (const selected of selectedIngredients) {
      const selName = selected.name;
      const pair = [ingName, selName].sort().join('+');
      
      const pmi = recipePriors.pairPMI?.[pair];
      if (pmi !== undefined && pmi > 0) {
        totalPMI += pmi;
        pairCount++;
        hasRecipePriors = true;
        reasons.push(`+${pmi.toFixed(2)} recipe PMI with ${selName}`);
      }
      
      const negativePMI = recipePriors.negativePairs?.[pair];
      if (negativePMI !== undefined) {
        negativePenalty += Math.abs(negativePMI) * 10;
        hasRecipePriors = true;
        reasons.push(`-${Math.abs(negativePMI).toFixed(2)} NEGATIVE recipe pair with ${selName}`);
      }
    }
  }

  // Check commercial priors (pet food products)
  const commercialPriors = (priors as any).commercial?.[species];
  if (commercialPriors) {
    for (const selected of selectedIngredients) {
      const selName = selected.name;
      const pair = [ingName, selName].sort().join('|'); // Commercial uses | separator
      
      const pmi = commercialPriors.pairPMI?.[pair];
      if (pmi !== undefined && pmi > 0) {
        totalPMI += pmi * 1.2; // Boost commercial data slightly (more products = stronger signal)
        pairCount++;
        hasCommercialPriors = true;
        reasons.push(`+${pmi.toFixed(2)} commercial PMI with ${selName}`);
      }
      
      const rarePMI = commercialPriors.rarePairs?.[pair];
      if (rarePMI !== undefined) {
        negativePenalty += Math.abs(rarePMI) * 15; // Strong penalty for commercial rare pairs
        hasCommercialPriors = true;
        reasons.push(`-${Math.abs(rarePMI).toFixed(2)} RARE commercial pair with ${selName}`);
      }
    }
  }

  // Average PMI across all pairs
  const avgPMI = pairCount > 0 ? totalPMI / pairCount : 0;
  const finalScore = avgPMI - negativePenalty;

  const source = hasRecipePriors && hasCommercialPriors ? 'both' 
    : hasCommercialPriors ? 'commercial' 
    : hasRecipePriors ? 'recipe' 
    : undefined;

  const reason = reasons.length > 0 
    ? reasons.join(', ')
    : 'No learned pairings';

  return {
    score: finalScore,
    reason,
    pmiValue: avgPMI,
    source
  };
}

/**
 * Check if a fat is compatible with selected proteins based on PMI
 * Checks BOTH recipe and commercial priors for hard blocks
 * Returns true if fat should be ALLOWED
 */
export function isFatCompatibleWithProteins(
  fat: Ingredient,
  proteins: Ingredient[],
  species: string
): { compatible: boolean; reason: string; pmiScore?: number } {
  if (proteins.length === 0) {
    return { compatible: true, reason: 'No proteins selected yet' };
  }

  const fatName = fat.name;
  let totalPMI = 0;
  let pmiCount = 0;
  let hasNegativePair = false;
  let negativePairWith = '';
  let negativeSource = '';

  // Check recipe priors
  const recipePriors = priors.coOccurrence?.[species];
  if (recipePriors) {
    for (const protein of proteins) {
      const proteinName = protein.name;
      const pair = [fatName, proteinName].sort().join('+');
      
      const negativePMI = recipePriors.negativePairs?.[pair];
      if (negativePMI !== undefined && negativePMI < -1.0) {
        hasNegativePair = true;
        negativePairWith = proteinName;
        negativeSource = 'recipes';
        break;
      }
      
      const pmi = recipePriors.pairPMI?.[pair];
      if (pmi !== undefined) {
        totalPMI += pmi;
        pmiCount++;
      }
    }
  }

  // Check commercial priors (stronger signal)
  const commercialPriors = (priors as any).commercial?.[species];
  if (commercialPriors && !hasNegativePair) {
    for (const protein of proteins) {
      const proteinName = protein.name;
      const pair = [fatName, proteinName].sort().join('|');
      
      const rarePMI = commercialPriors.rarePairs?.[pair];
      if (rarePMI !== undefined && rarePMI < -1.5) {
        hasNegativePair = true;
        negativePairWith = proteinName;
        negativeSource = 'commercial products';
        break;
      }
      
      const pmi = commercialPriors.pairPMI?.[pair];
      if (pmi !== undefined) {
        totalPMI += pmi * 1.2; // Weight commercial data higher
        pmiCount++;
      }
    }
  }

  // Hard block if negative pairing detected
  if (hasNegativePair) {
    return {
      compatible: false,
      reason: `Negative pairing with ${negativePairWith} (learned from ${negativeSource})`,
      pmiScore: undefined
    };
  }

  // Allow if positive PMI or no learned relationship
  const avgPMI = pmiCount > 0 ? totalPMI / pmiCount : 0;
  
  if (avgPMI > 0.3) {
    return {
      compatible: true,
      reason: `Strong positive pairing (PMI: ${avgPMI.toFixed(2)})`,
      pmiScore: avgPMI
    };
  } else if (avgPMI > 0) {
    return {
      compatible: true,
      reason: `Weak positive pairing (PMI: ${avgPMI.toFixed(2)})`,
      pmiScore: avgPMI
    };
  } else {
    // No learned relationship - allow by default (species-appropriate fats)
    return {
      compatible: true,
      reason: 'No learned pairing (species-default allowed)',
      pmiScore: 0
    };
  }
}

/**
 * Get top-N fats that pair well with selected proteins
 * Uses PMI to rank fats, not hardcoded rules
 */
export function getTopPairedFats(
  availableFats: Ingredient[],
  proteins: Ingredient[],
  species: string,
  topN: number = 5
): Array<{ fat: Ingredient; pmiScore: number; reason: string }> {
  const scored = availableFats.map(fat => {
    const compat = isFatCompatibleWithProteins(fat, proteins, species);
    return {
      fat,
      pmiScore: compat.pmiScore || 0,
      reason: compat.reason,
      compatible: compat.compatible
    };
  });

  // Filter to compatible only, then sort by PMI
  return scored
    .filter(s => s.compatible)
    .sort((a, b) => b.pmiScore - a.pmiScore)
    .slice(0, topN);
}

/**
 * Log pairing decision for debugging
 */
export function logPairingDecision(
  ingredient: Ingredient,
  selectedIngredients: Ingredient[],
  species: string,
  action: 'selected' | 'rejected'
): void {
  const pairingScore = calculatePairingScore(ingredient, selectedIngredients, species);
  const prefix = action === 'selected' ? '✓' : '✗';
  console.log(
    `[PMI ${prefix}] ${ingredient.name}: score=${pairingScore.score.toFixed(2)} | ${pairingScore.reason}`
  );
}
