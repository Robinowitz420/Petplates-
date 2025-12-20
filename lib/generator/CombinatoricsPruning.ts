/**
 * COMBINATORICS PRUNING
 * Pre-validation filtering to prevent micronutrient-toxic pairings
 * 
 * This runs BEFORE validation, teaching the generator what NOT to produce
 * instead of just rejecting finished recipes.
 */

import type { Ingredient } from '@/lib/data/ingredients';

// ============================================================================
// TOXIC PAIRINGS (Disallow these combinations)
// ============================================================================

interface ToxicPairing {
  ingredients: string[]; // ingredient names (lowercase, partial match)
  reason: string;
  maxAllowed?: number; // max of this pairing allowed (0 = never)
}

const TOXIC_PAIRINGS: ToxicPairing[] = [
  // Liver + high-iodine fish = vitamin A + iodine overload
  {
    ingredients: ['liver', 'salmon'],
    reason: 'Liver + salmon = vitamin A + iodine spike',
    maxAllowed: 0,
  },
  {
    ingredients: ['liver', 'cod'],
    reason: 'Liver + cod = vitamin A + iodine overload',
    maxAllowed: 0,
  },
  {
    ingredients: ['liver', 'sardine'],
    reason: 'Liver + sardine = vitamin A + iodine spike',
    maxAllowed: 0,
  },
  {
    ingredients: ['liver', 'mackerel'],
    reason: 'Liver + mackerel = vitamin A + iodine overload',
    maxAllowed: 0,
  },
  {
    ingredients: ['liver', 'herring'],
    reason: 'Liver + herring = vitamin A + iodine spike',
    maxAllowed: 0,
  },

  // Liver + high-iodine supplements = iodine bomb
  {
    ingredients: ['liver', 'kelp'],
    reason: 'Liver + kelp = iodine bomb',
    maxAllowed: 0,
  },
  {
    ingredients: ['liver', 'seaweed'],
    reason: 'Liver + seaweed = iodine overload',
    maxAllowed: 0,
  },

  // Multiple organ meats = mineral overload
  {
    ingredients: ['liver', 'kidney'],
    reason: 'Multiple organ meats = copper/mineral toxicity',
    maxAllowed: 0,
  },
  {
    ingredients: ['liver', 'heart'],
    reason: 'Multiple organ meats = mineral imbalance',
    maxAllowed: 0,
  },

  // High-copper sources together
  {
    ingredients: ['liver', 'sunflower_seed'],
    reason: 'Liver + sunflower seeds = copper overload',
    maxAllowed: 0,
  },
  {
    ingredients: ['liver', 'pumpkin_seed'],
    reason: 'Liver + pumpkin seeds = copper spike',
    maxAllowed: 0,
  },

  // Oxalate + calcium = absorption issues
  {
    ingredients: ['spinach', 'eggshell_powder'],
    reason: 'Spinach oxalates + calcium supplement = poor absorption',
    maxAllowed: 0,
  },
];

// ============================================================================
// INGREDIENT MICRONUTRIENT DENSITY PROFILE
// ============================================================================

interface MicronutrientProfile {
  vitaminA?: 'high' | 'medium' | 'low';
  copper?: 'high' | 'medium' | 'low';
  iodine?: 'high' | 'medium' | 'low';
  oxalates?: 'high' | 'medium' | 'low';
}

const MICRONUTRIENT_PROFILES: Record<string, MicronutrientProfile> = {
  // Organ meats (high in multiple micronutrients)
  liver: { vitaminA: 'high', copper: 'high', iodine: 'medium' },
  kidney: { copper: 'high', iodine: 'medium' },
  heart: { copper: 'medium' },

  // Fish (iodine-rich)
  salmon: { iodine: 'high', vitaminA: 'medium' },
  cod: { iodine: 'high' },
  sardine: { iodine: 'high' },
  mackerel: { iodine: 'high' },
  herring: { iodine: 'high' },

  // Supplements (concentrated)
  kelp: { iodine: 'high' },
  seaweed: { iodine: 'high' },
  fish_oil: { vitaminA: 'high' },
  cod_liver_oil: { vitaminA: 'high', iodine: 'high' },

  // Seeds (copper-rich)
  sunflower_seed: { copper: 'high' },
  pumpkin_seed: { copper: 'high' },
  sesame_seed: { copper: 'high' },

  // Vegetables (oxalate-rich)
  spinach: { oxalates: 'high' },
  beet_greens: { oxalates: 'high' },
  chard: { oxalates: 'high' },
};

// ============================================================================
// PRUNING FUNCTIONS
// ============================================================================

/**
 * Check if a pairing violates toxic combination rules
 */
export function hasToxicPairing(ingredients: Ingredient[]): boolean {
  const names = ingredients.map(ing => ing.name.toLowerCase());

  for (const pairing of TOXIC_PAIRINGS) {
    const matches = pairing.ingredients.filter(required =>
      names.some(name => name.includes(required))
    );

    if (matches.length === pairing.ingredients.length) {
      // All ingredients in this toxic pairing are present
      if (pairing.maxAllowed === 0) {
        return true; // Disallowed
      }
    }
  }

  return false;
}

/**
 * Get micronutrient density profile for an ingredient
 */
export function getMicronutrientProfile(ingredient: Ingredient): MicronutrientProfile {
  const name = ingredient.name.toLowerCase();

  for (const [key, profile] of Object.entries(MICRONUTRIENT_PROFILES)) {
    if (name.includes(key)) {
      return profile;
    }
  }

  return {}; // Unknown ingredient, assume low density
}

/**
 * Calculate cumulative micronutrient risk for a recipe
 * Returns a risk score (0-100) where 100 = definitely toxic
 * 
 * NOTE: This is SOFT pruning. Only flag truly dangerous combos.
 * Fish + liver is OK. Fish + fish oil + liver is risky.
 */
export function calculateMicronutrientRisk(ingredients: Ingredient[]): number {
  let risk = 0;

  // Check for specific dangerous combos
  const vitaminAHighCount = ingredients.filter(ing => {
    const profile = getMicronutrientProfile(ing);
    return profile.vitaminA === 'high';
  }).length;

  const iodineHighCount = ingredients.filter(ing => {
    const profile = getMicronutrientProfile(ing);
    return profile.iodine === 'high';
  }).length;

  const copperHighCount = ingredients.filter(ing => {
    const profile = getMicronutrientProfile(ing);
    return profile.copper === 'high';
  }).length;

  // Only flag if we have MULTIPLE high sources of the SAME nutrient
  // (not just any high-density ingredient)
  
  // Multiple vitamin A sources (e.g., liver + fish oil)
  if (vitaminAHighCount >= 2) risk += 50;

  // Multiple iodine sources (e.g., kelp + fish + fish oil)
  if (iodineHighCount >= 3) risk += 50;
  else if (iodineHighCount >= 2) risk += 20; // Mild risk for 2 iodine sources

  // Multiple copper sources (e.g., liver + seeds)
  if (copperHighCount >= 2) risk += 40;

  return Math.min(100, risk);
}

/**
 * Prune candidates that are likely to fail T6 (nutrient ceiling)
 * Returns true if candidate should be rejected
 */
export function shouldPruneCandidateForMicronutrients(ingredients: Ingredient[]): boolean {
  // Hard reject: toxic pairings
  if (hasToxicPairing(ingredients)) {
    return true;
  }

  // Soft reject: high micronutrient risk
  const risk = calculateMicronutrientRisk(ingredients);
  if (risk > 70) {
    return true; // Likely to fail T6
  }

  return false;
}

/**
 * Get a human-readable reason why a candidate was pruned
 */
export function getPruningReason(ingredients: Ingredient[]): string {
  if (hasToxicPairing(ingredients)) {
    const names = ingredients.map(ing => ing.name.toLowerCase());
    for (const pairing of TOXIC_PAIRINGS) {
      const matches = pairing.ingredients.filter(required =>
        names.some(name => name.includes(required))
      );
      if (matches.length === pairing.ingredients.length) {
        return pairing.reason;
      }
    }
  }

  const risk = calculateMicronutrientRisk(ingredients);
  if (risk > 70) {
    return `High micronutrient risk (${Math.round(risk)}/100)`;
  }

  return 'Unknown';
}
