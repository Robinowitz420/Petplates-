// lib/utils/improvedCompatibilityScoring.ts
// Improved compatibility scoring with more accuracy and score variation.

import type { Recipe } from '@/lib/types';
import { getIngredientComposition } from '@/lib/data/ingredientCompositions';
import {
  normalizeSpecies,
  getSpeciesCompatibility,
  getMaxInclusionPercent,
} from './ingredientCompatibility';
import { validateCriticalNutrients } from '@/lib/data/aafco-standards';

// -------- Config for quick tuning -------- //
const SCORE_CONFIG = {
  weights: {
    ingredientSafety: 0.20,
    nutritionalAdequacy: 0.26,
    healthAlignment: 0.14,
    lifeStageFit: 0.10,
    allergenSafety: 0.10,
    digestibility: 0.08,
    variety: 0.12,
  },
  safeFloor: 65, // applied if ingredientSafety >= 60 && allergenSafety >= 60
  jitter: {
    low: 0.4,
    mid: 0.3,
    high: 0.2,
  },
  normalize: {
    topKeep: 95,
    topBand: 85,
    midBand: 70,
    lift50: 1.02,
    lift30: 1.05,
    liftLow: 1.08,
  },
  debug: process.env.NEXT_PUBLIC_SCORE_DEBUG === 'true',
};

export interface ImprovedPet {
  id: string;
  name: string;
  type: string; // accepts dogs/cats/birds/reptiles/pocket-pets
  breed?: string;
  age?: string | number;
  weight?: number;
  activityLevel?: 'sedentary' | 'moderate' | 'active' | 'very-active';
  healthConcerns: string[];
  dietaryRestrictions?: string[];
  allergies?: string[];
}

export interface ImprovedScore {
  overallScore: number; // 0-100
  stars: number; // 1-5
  recommendation?: 'excellent' | 'good' | 'acceptable' | 'caution' | 'avoid';
  summaryReasoning?: string;
  factors: {
    ingredientSafety: number;
    nutritionalAdequacy: number;
    healthAlignment: number;
    lifeStageFit: number;
    allergenSafety: number;
    digestibility: number;
    variety: number;
  };
  reasoning: {
    strengths: string[];
    warnings: string[];
    recommendations: string[];
  };
}

/**
 * Entry point: calculate improved compatibility score with better distribution.
 */
export function calculateImprovedCompatibility(
  recipe: Recipe,
  pet: ImprovedPet
): ImprovedScore {
  const species = normalizeSpecies(pet.type);
  const ageNum = typeof pet.age === 'string' ? parseFloat(pet.age) || 0 : pet.age || 0;

  const ingredientSafety = scoreIngredientSafety(recipe, species);
  const nutritionalAdequacy = scoreNutritionalAdequacy(recipe, pet, species, ageNum);
  const healthAlignment = scoreHealthAlignment(recipe, pet);
  const lifeStageFit = scoreLifeStageFit(recipe, ageNum);
  const allergenSafety = scoreAllergenSafety(recipe, pet);
  const digestibility = scoreDigestibility(recipe, species);
  const variety = scoreIngredientVariety(recipe);

  const weighted =
    ingredientSafety * SCORE_CONFIG.weights.ingredientSafety +
    nutritionalAdequacy * SCORE_CONFIG.weights.nutritionalAdequacy +
    healthAlignment * SCORE_CONFIG.weights.healthAlignment +
    lifeStageFit * SCORE_CONFIG.weights.lifeStageFit +
    allergenSafety * SCORE_CONFIG.weights.allergenSafety +
    digestibility * SCORE_CONFIG.weights.digestibility +
    variety * SCORE_CONFIG.weights.variety;

  const normalized = normalizeScore(weighted);
  const variation = applyControlledVariation(normalized);
  const safeFloor =
    ingredientSafety >= 60 && allergenSafety >= 60 ? SCORE_CONFIG.safeFloor : 0; // keep safe recipes from tanking
  const finalScore = clamp(
    Number(Math.max(normalized + variation, safeFloor).toFixed(1)),
    0,
    100
  );

  const strengths: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  if (ingredientSafety >= 90) strengths.push('All ingredients are species-safe');
  if (nutritionalAdequacy < 60) {
    warnings.push('Recipe has nutritional gaps');
    recommendations.push('Add supplements or adjust ingredients for balance');
  }
  if (healthAlignment >= 80) strengths.push('Supports key health concerns');
  if (allergenSafety < 100) warnings.push('Contains known allergens');

  const { stars, recommendation, summaryReasoning } = mapScoreToStarsWithReasoning(finalScore, {
    ingredientSafety,
    nutritionalAdequacy,
    healthAlignment,
    lifeStageFit,
    allergenSafety,
    digestibility,
  });

  if (SCORE_CONFIG.debug) {
    console.log('[ScoreDebug]', {
      recipe: recipe.name,
      finalScore,
      normalized,
      variation,
      safeFloor,
      factors: {
        ingredientSafety,
        nutritionalAdequacy,
        healthAlignment,
        lifeStageFit,
        allergenSafety,
        digestibility,
        variety,
      },
    });
  }

  return {
    overallScore: finalScore,
    stars,
    recommendation,
    summaryReasoning,
    factors: {
      ingredientSafety,
      nutritionalAdequacy,
      healthAlignment,
      lifeStageFit,
      allergenSafety,
      digestibility,
      variety,
    },
    reasoning: { strengths, warnings, recommendations },
  };
}

// ------------------ Factor Calculations ------------------ //

function scoreIngredientSafety(recipe: Recipe, species: string): number {
  const ingredients = recipe.ingredients || [];
  if (!ingredients.length) return 85;

  let score = 85;
  let avoidCount = 0;
  let unknownCount = 0;

  for (const ing of ingredients) {
    const name = typeof ing === 'string' ? ing : ing.name;
    const amount = typeof ing === 'string'
      ? 100
      : ing.amount
      ? parseFloat(String(ing.amount).replace(/[^0-9.]/g, '')) || 0
      : 0;

    const key = name.toLowerCase().replace(/\s+/g, '_');
    const compat = getSpeciesCompatibility(key, species);

    if (compat === 'avoid') {
      avoidCount++;
      score -= 25;
    } else if (compat === 'limit' || compat === 'caution') {
      const maxInclusion = getMaxInclusionPercent(key, species);
      if (maxInclusion && amount / 100 > maxInclusion) {
        score -= 18;
      } else {
        score -= 12;
      }
    } else if (compat === 'ok') {
      // mildly reward clear safe ingredients
      score += 1.5;
    } else {
      // Unknown ingredient: minor uncertainty
      unknownCount++;
      score -= 3;
    }
  }

  if (avoidCount > 1) {
    score -= avoidCount * 6; // gentle compounding
  }

  const unknownRatio = ingredients.length ? unknownCount / ingredients.length : 0;
  if (unknownRatio > 0.5) {
    score -= 10;
  }

  if (avoidCount > 0) {
    score = Math.min(score, 40); // still keep avoids meaningful
  } else if (unknownCount === 0) {
    // Safety floor for clean recipes
    score = Math.max(score, 80);
  }

  return clamp(score, 0, 100);
}

function scoreNutritionalAdequacy(
  recipe: Recipe,
  pet: ImprovedPet,
  species: string,
  ageNum: number
): number {
  let score = 90;
  const nutrition = calcNutrition(recipe);

  if (species === 'dog' || species === 'cat') {
    const lifeStage = ageNum < 1 ? 'growth' : 'adult';
    const validation = validateCriticalNutrients(
      recipe,
      species as 'dog' | 'cat',
      lifeStage
    );
    if (!validation.isValid) {
      const basePenalty = Math.min(validation.violations.length * 8, 40);
      const severe = validation.violations.some(v =>
        v.toLowerCase().includes('critical') || v.toLowerCase().includes('essential')
      );
      score -= basePenalty * (severe ? 1.3 : 1);
    }

    const minProtein = lifeStage === 'growth' ? 22 : 18;
    if (nutrition.protein < minProtein) {
      const deficit = minProtein - nutrition.protein;
      const proteinPenalty = Math.min(Math.pow(deficit, 1.3) * 1.5, 30);
      score -= proteinPenalty;
    }

    if (nutrition.calcium && nutrition.phosphorus) {
      const ratio = nutrition.calcium / nutrition.phosphorus;
      if (ratio < 1.0 || ratio > 2.5) {
        const deviation = ratio < 1.0 ? 1.0 - ratio : ratio - 2.5;
        score -= Math.min(deviation * 15, 20);
      }
    }
  } else {
    // Heuristics for non-dog/cat species
    switch (species) {
      case 'bird': {
        if (nutrition.calcium && nutrition.phosphorus) {
          const ratio = nutrition.calcium / nutrition.phosphorus;
          if (ratio < 1.5 || ratio > 2.5) {
            const deviation = ratio < 1.5 ? 1.5 - ratio : ratio - 2.5;
            score -= Math.min(deviation * 25, 30);
          }
        }
        
        const breed = (pet.breed || '').toLowerCase();
        // Macaws and African Greys need higher fat (nuts)
        const highFatNeeds = ['macaw', 'grey', 'african grey'].some(b => breed.includes(b));
        
        if (highFatNeeds) {
           if (nutrition.fat < 10) score -= 10; // Penalty for low fat in large parrots
        } else {
           // Small birds (parakeets)
           if (nutrition.fat > 12) score -= 5; // Penalty for too much fat
        }

        if ((recipe.ingredients || []).length < 3) {
          score -= 5;
        }
        break;
      }
      case 'reptile': {
        if (nutrition.calcium && nutrition.phosphorus) {
          const ratio = nutrition.calcium / nutrition.phosphorus;
          if (ratio < 1.5) {
            const deviation = 1.5 - ratio;
            score -= Math.min(deviation * 25, 30);
          }
        }
        // Expanded Herbivore/carnivore heuristic
        const breed = (pet.breed || '').toLowerCase();
        const herbivore = ['iguana', 'tortoise', 'uromastyx'].some(b => breed.includes(b));
        // Add 'boa', 'python', 'king' for snakes
        const carnivore = ['snake', 'monitor', 'tegu', 'boa', 'python', 'king'].some(b => breed.includes(b));
        
        if (herbivore && nutrition.protein > 25) score -= 12;
        // Carnivores need HIGH protein
        if (carnivore) {
            if (nutrition.protein < 30) score -= 15;
            if (nutrition.fat < 10) score -= 5;
        } 
        break;
      }
      case 'pocket-pet': {
        const breed = (pet.breed || '').toLowerCase();
        // Sugar gliders & omnivores need less fiber than rabbits
        const isLowFiber = ['sugar', 'glider', 'hamster', 'rat', 'mouse', 'ferret'].some(b => breed.includes(b));
        
        if (isLowFiber) {
            // They need protein/fruit, not hay
            if (nutrition.fiber > 10) score -= 5; // gentle penalty
            if (nutrition.protein < 12) score -= 10;
        } else {
            // Rabbits/Guinea Pigs (Hay eaters)
            if (nutrition.fiber < 15) {
              score -= Math.min((15 - nutrition.fiber) * 2, 20);
            }
            if (nutrition.protein > 20) {
              score -= Math.min((nutrition.protein - 20) * 1.5, 18);
            }
        }
        break;
      }
      default:
        break;
    }
  }

  // Data quality penalty for limited nutrition info (softer)
  if (!nutrition.hasData) {
    score -= 15;
  } else if (nutrition.dataPoints !== undefined && nutrition.totalIngredients !== undefined) {
    const coverage = nutrition.totalIngredients
      ? (nutrition.dataPoints / nutrition.totalIngredients) * 100
      : 0;
    if (coverage < 30) {
      score -= 20;
    } else if (coverage < 50) {
      score -= 12;
    } else if (coverage < 70) {
      score -= 5;
    }
  }

  return clamp(score, 0, 100);
}

function scoreHealthAlignment(recipe: Recipe, pet: ImprovedPet): number {
  const petConcernsArr = pet.healthConcerns || [];
  if (!petConcernsArr.length) return 90;

  const recipeConcerns = (recipe.healthConcerns || []).map(c => c.toLowerCase());
  const notSuitable = (recipe.notSuitableFor || []).map(c => c.toLowerCase());
  const petConcerns = petConcernsArr.map(c => c.toLowerCase().replace(/\s+/g, '-'));

  const critical = ['kidney-disease', 'diabetes', 'heart-disease', 'pancreatitis'];
  const important = ['allergies', 'digestive-issues', 'urinary-health'];

  let weighted = 0;
  const maxScore = petConcerns.length * 20 || 1;

  for (const concern of petConcerns) {
    const isCritical = critical.some(c => concern.includes(c));
    const isImportant = important.some(c => concern.includes(c));

    const blocked = notSuitable.some(ns => ns.includes(concern) || concern.includes(ns));
    if (blocked) {
      weighted -= isCritical ? 25 : 15;
      continue;
    }

    const supports = recipeConcerns.some(rc => rc.includes(concern) || concern.includes(rc));
    if (supports) {
      weighted += isCritical ? 15 : isImportant ? 12 : 10;
    } else {
      weighted -= isImportant ? 5 : 3;
    }
  }

  const base = 75;
  const score = base + (weighted / maxScore) * 25;
  return clamp(score, 0, 100);
}

function scoreLifeStageFit(recipe: Recipe, ageNum: number): number {
  const petAgeGroup = ageNum < 1 ? 'baby' : ageNum < 2 ? 'young' : ageNum < 7 ? 'adult' : 'senior';
  const groups = recipe.ageGroup || [];
  if (groups.length === 0 || groups.includes('all')) return 100;
  if (groups.includes(petAgeGroup)) return 100;

  const order = ['baby', 'young', 'adult', 'senior'];
  const petIdx = order.indexOf(petAgeGroup);
  const recipeIdxs = groups.map(g => order.indexOf(g)).filter(i => i >= 0);
  if (!recipeIdxs.length) return 60;
  const distance = Math.min(...recipeIdxs.map(i => Math.abs(petIdx - i)));
  if (distance === 1) return 75;
  if (distance === 2) return 60;
  return 45;
}

function scoreAllergenSafety(recipe: Recipe, pet: ImprovedPet): number {
  const allergens = [
    ...((pet.allergies || []) as string[]),
    ...((pet.dietaryRestrictions || []) as string[]).filter(r =>
      ['chicken', 'beef', 'dairy', 'wheat', 'egg', 'fish', 'pork', 'soy', 'corn', 'lamb'].some(a =>
        r.toLowerCase().includes(a)
      )
    ),
  ];
  if (!allergens.length) return 100;

  const ingredientText = (recipe.ingredients || [])
    .map(i => (typeof i === 'string' ? i : i.name).toLowerCase())
    .join(' ');

  const hits = allergens.filter(a => ingredientText.includes(a.toLowerCase()));
  if (!hits.length) return 100;

  const penalty = hits.length === 1 ? 15 : hits.length === 2 ? 30 : hits.length === 3 ? 50 : 70;
  return Math.max(0, 100 - penalty);
}

function scoreDigestibility(recipe: Recipe, species: string): number {
  const ingredients = recipe.ingredients || [];
  if (!ingredients.length) return 50;

  let total = 0;
  let count = 0;

  for (const ing of ingredients) {
    const name = typeof ing === 'string' ? ing : ing.name;
    const key = name.toLowerCase().replace(/\s+/g, '_');
    const comp = getIngredientComposition(key);

    if (comp) {
      if (comp.protein && comp.protein > 15) total += 20;
      if (comp.fiber !== undefined) {
        if ((species === 'dog' || species === 'cat') && comp.fiber >= 2 && comp.fiber <= 5) {
          total += 15;
        } else if (comp.fiber > 10) {
          total -= 10;
        }
      }
      if (comp.fat && comp.fat > 0) {
        total += comp.fat > 10 ? 5 : 10;
      }
    } else {
      total += 5; // unknown = modest neutral
    }
    count++;
  }

  return clamp((total / Math.max(1, count)) * 5, 0, 100);
}

function scoreIngredientVariety(recipe: Recipe): number {
  const ingredients = recipe.ingredients || [];
  if (!ingredients.length) return 50;

  const categories = {
    protein: ['chicken', 'beef', 'fish', 'turkey', 'egg', 'meat', 'lamb', 'pork'],
    vegetable: ['carrot', 'spinach', 'kale', 'broccoli', 'pumpkin', 'squash', 'zucchini'],
    fruit: ['apple', 'berry', 'banana', 'melon', 'pear'],
    grain: ['rice', 'oat', 'quinoa', 'barley', 'corn', 'wheat'],
    fat: ['oil', 'butter', 'tallow', 'lard', 'flax', 'omega'],
    supplement: ['vitamin', 'mineral', 'calcium', 'taurine', 'supplement'],
  };

  const found = new Set<string>();
  for (const ing of ingredients) {
    const name = (typeof ing === 'string' ? ing : ing.name).toLowerCase();
    for (const [cat, terms] of Object.entries(categories)) {
      if (terms.some(t => name.includes(t))) {
        found.add(cat);
      }
    }
  }

  const categoriesUsed = found.size;
  let score = 30 + categoriesUsed * 12; // 3 cats => 66, 5 => 90
  if (ingredients.length < 4) {
    score -= 15;
  } else if (ingredients.length > 10) {
    score += 5;
  }
  return clamp(score, 0, 100);
}

// ------------------ Helpers ------------------ //

function calcNutrition(recipe: Recipe) {
  const ingredients = recipe.ingredients || [];
  let totalProtein = 0;
  let totalFat = 0;
  let totalCa = 0;
  let totalP = 0;
  let totalFiber = 0;
  let totalWeight = 0;
  let realData = 0;

  for (const ing of ingredients) {
    const name = typeof ing === 'string' ? ing : ing.name;
    const amount = typeof ing === 'string'
      ? 100
      : ing.amount
      ? parseFloat(String(ing.amount).replace(/[^0-9.]/g, '')) || 0
      : 0;
    const comp = getIngredientComposition(name.toLowerCase().replace(/\s+/g, '_'));
    if (comp && comp.protein !== undefined) {
      totalProtein += (comp.protein || 0) * (amount / 100);
      totalFat += (comp.fat || 0) * (amount / 100);
      totalCa += (comp.calcium || 0) * (amount / 100);
      totalP += (comp.phosphorus || 0) * (amount / 100);
      totalFiber += (comp.fiber || 0) * (amount / 100);
      totalWeight += amount;
      realData++;
    }
  }

  return {
    protein: totalWeight ? (totalProtein / totalWeight) * 100 : 25,
    fat: totalWeight ? (totalFat / totalWeight) * 100 : 15,
    calcium: totalWeight ? (totalCa / totalWeight) * 100 : 0.8,
    phosphorus: totalWeight ? (totalP / totalWeight) * 100 : 0.6,
    fiber: totalWeight ? (totalFiber / totalWeight) * 100 : 2,
    hasData: realData > 0 && totalWeight > 0,
    dataPoints: realData,
    totalIngredients: ingredients.length,
  };
}

function normalizeScore(raw: number): number {
  const n = SCORE_CONFIG.normalize;
  if (raw >= n.topKeep) return raw; // leave excellent scores alone
  if (raw >= n.topBand) return 90 + (raw - n.topBand) * 0.8; // light compression at top
  if (raw >= n.midBand) return raw; // keep solid recipes intact
  if (raw >= 50) return raw * n.lift50; // small lift to mid-low
  if (raw >= 30) return raw * n.lift30; // gentle boost to lows
  return raw * n.liftLow; // slightly more help for very low
}

function applyControlledVariation(score: number): number {
  // deterministic-ish tiny jitter: ±0.4 max
  const { high, mid, low } = SCORE_CONFIG.jitter;
  const range = score > 90 || score < 30 ? high : score > 70 ? mid : low;
  return (Math.random() - 0.5) * 2 * range;
}

function mapScoreToStarsWithReasoning(
  score: number,
  factors: {
    ingredientSafety: number;
    nutritionalAdequacy: number;
    healthAlignment: number;
    lifeStageFit: number;
    allergenSafety: number;
    digestibility: number;
  }
): { stars: number; recommendation: ImprovedScore['recommendation']; summaryReasoning: string } {
  // Safety overrides
  if (factors.allergenSafety < 50) {
    return {
      stars: 1,
      recommendation: 'avoid',
      summaryReasoning: 'Contains allergens for this pet',
    };
  }
  if (factors.ingredientSafety < 40) {
    return {
      stars: 1,
      recommendation: 'avoid',
      summaryReasoning: 'Unsafe ingredients detected for this species',
    };
  }

  let recommendation: ImprovedScore['recommendation'] = 'acceptable';
  if (score >= 90) recommendation = 'excellent';
  else if (score >= 80) recommendation = 'good';
  else if (score >= 70) recommendation = 'acceptable';
  else if (score >= 60) recommendation = 'caution';
  else recommendation = 'avoid';

  let summaryReasoning = 'Well-rounded recipe';
  if (score < 60) summaryReasoning = 'Significant concerns detected';
  else if (factors.nutritionalAdequacy < 65) summaryReasoning = 'Not balanced for this pet';
  else if (factors.ingredientSafety < 70) summaryReasoning = 'Ingredient safety concerns';
  else if (factors.allergenSafety < 80) summaryReasoning = 'Possible allergens detected';

  return {
    stars: mapScoreToStars(score),
    recommendation,
    summaryReasoning,
  };
}

function mapScoreToStars(score: number): number {
  if (score >= 90) return 5;
  if (score >= 75) return 4;
  if (score >= 55) return 3;
  if (score >= 30) return 2;
  return 1;
}

function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(min, val));
}