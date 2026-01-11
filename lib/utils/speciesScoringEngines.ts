import type { Recipe } from '@/lib/types';

import { normalizePetType, type PetType } from './petType';
import { calculateRecipeNutrition } from './recipeNutrition';
import { AAFCO_STANDARDS } from '@/lib/data/aafco-standards';

import { getBirdStandards } from '@/lib/data/birdNutritionRules';
import { getPocketPetRequirements } from '@/lib/data/pocketPetRequirements';
import { findBirdToxicIngredients, getPelletPercentage, getHayPercentage, hasVitaminCSource, isCalciumSupportIngredient } from './ingredientTags';

type SpeciesScoringWeights = {
  safety: number;
  nutrition: number;
  health: number;
  quality: number;
};

export type SpeciesFactorScores = {
  safety: number;
  nutrition: number;
  health: number;
  quality: number;
};

export type SpeciesScoreResult = {
  species: PetType;
  overallScore: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  factors: SpeciesFactorScores;
  criticalViolations: string[];
  warnings: string[];
  strengths: string[];
  raw: {
    overallScore: number;
    grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
    factors: Record<string, { score: number; weight: number; reasoning: string; issues: string[]; strengths: string[] }>;
    detailedBreakdown: {
      warnings: string[];
      healthBenefits: string[];
      nutritionalStrengths: string[];
      nutritionalGaps: string[];
      recommendations: string[];
    };
  };
};

export interface SpeciesScoringEngine {
  readonly species: PetType;
  getWeights(): SpeciesScoringWeights;
  score(recipe: Recipe, pet: SpeciesScoringPet): SpeciesScoreResult;
}

export type SpeciesScoringPet = {
  id?: string;
  name?: string;
  type: string;
  breed?: string;
  age?: number | string;
  weight?: number | string;
  activityLevel?: 'sedentary' | 'moderate' | 'active' | 'very-active' | string;
  healthConcerns?: string[];
  dietaryRestrictions?: string[];
  allergies?: string[];
};

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, n));
}

function getGrade(overallScore: number): SpeciesScoreResult['grade'] {
  const s = clampScore(overallScore);
  if (s >= 97) return 'A+';
  if (s >= 93) return 'A';
  if (s >= 89) return 'B+';
  if (s >= 83) return 'B';
  if (s >= 77) return 'C+';
  if (s >= 70) return 'C';
  if (s >= 60) return 'D';
  return 'F';
}

function smoothPenalty(
  deficit01: number,
  maxPenalty: number,
  k: number
): number {
  const d = clamp01(deficit01);
  if (d <= 0) return 0;
  const scaled = 1 - Math.exp(-k * d);
  return scaled * maxPenalty;
}

function penaltyFromMin(value: number, min: number, maxPenalty: number, k = 4): number {
  if (!Number.isFinite(value) || !Number.isFinite(min) || min <= 0) return 0;
  if (value >= min) return 0;
  const deficit01 = (min - value) / min;
  return smoothPenalty(deficit01, maxPenalty, k);
}

function normalizeAgeYears(age: SpeciesScoringPet['age']): number {
  if (typeof age === 'number' && Number.isFinite(age)) return age;
  if (typeof age === 'string') {
    const n = parseFloat(age);
    if (Number.isFinite(n)) return n;
    const s = age.toLowerCase();
    if (s === 'baby' || s === 'puppy' || s === 'kitten') return 0.5;
    if (s === 'young') return 2;
    if (s === 'adult') return 5;
    if (s === 'senior') return 10;
  }
  return 5;
}

function toTextList(recipe: Recipe): string {
  const ingredients = (recipe.ingredients || []).map((i: any) => (typeof i === 'string' ? i : i?.name || '')).filter(Boolean);
  const supplements = ((recipe as any).supplements || []).map((s: any) => String(s?.name || s?.productName || '')).filter(Boolean);
  return (ingredients.join(' ') + ' ' + supplements.join(' ')).toLowerCase();
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function getSupplementNamesForBoost(recipe: Recipe): string[] {
  const fromIngredients = (recipe.ingredients || [])
    .map((i: any) => {
      if (!i || typeof i !== 'object') return null;
      const id = typeof i?.id === 'string' ? i.id : '';
      const category = typeof i?.category === 'string' ? i.category : '';
      const name = typeof i?.name === 'string' ? i.name : '';
      const looksLikeSupplement =
        (id && id.toLowerCase().startsWith('supplement-')) ||
        (category && category.toLowerCase() === 'supplement');
      if (!looksLikeSupplement) return null;
      return name || null;
    })
    .filter(Boolean) as string[];

  return Array.from(new Set(fromIngredients.map((s) => s.trim()).filter(Boolean)));
}

function getSupplementScoreBoost(recipe: Recipe): number {
  const supplementNames = getSupplementNamesForBoost(recipe);
  if (supplementNames.length === 0) return 0;

  const seed = `${String((recipe as any)?.id || '')}|${supplementNames.join('|').toLowerCase()}`;
  return 2 + (hashString(seed) % 7);
}

function computeBaselineFactors(params: { recipe: Recipe; pet: SpeciesScoringPet; species: PetType }): {
  factors: SpeciesFactorScores;
  warnings: string[];
  strengths: string[];
  criticalViolations: string[];
  nutritionalGaps: string[];
  nutritionalStrengths: string[];
} {
  const { recipe, pet, species } = params;
  const warnings: string[] = [];
  const strengths: string[] = [];
  const criticalViolations: string[] = [];
  const nutritionalGaps: string[] = [];
  const nutritionalStrengths: string[] = [];

  const nutritionDebug =
    process.env.NEXT_PUBLIC_NUTRITION_DEBUG === 'true' ||
    process.env.NEXT_PUBLIC_SCORE_DEBUG === 'true';

  const nutrition = calculateRecipeNutrition(recipe);
  const joined = toTextList(recipe);
  const ageYears = normalizeAgeYears(pet.age);

  if (nutritionDebug) {
    console.log('[NutritionDebug]', {
      recipe: recipe?.name,
      species,
      ageYears,
      nutrition,
      ingredients: (recipe.ingredients || []).map((i: any) => ({
        name: typeof i === 'string' ? i : i?.name,
        amount: typeof i === 'string' ? undefined : i?.amount,
        amountG: typeof i === 'string' ? 0 : (typeof i?.amount === 'string' || typeof i?.amount === 'number' ? i.amount : undefined),
      })),
    });
  }

  // Safety: basic allergy/restriction string matching.
  let safety = 100;
  const avoidList = [...(pet.allergies || []), ...(pet.dietaryRestrictions || [])].map((s) => String(s || '').toLowerCase()).filter(Boolean);
  for (const avoid of avoidList) {
    if (avoid && joined.includes(avoid)) {
      safety = clampScore(safety - 40);
      warnings.push(`Contains restricted ingredient: ${avoid}`);
      criticalViolations.push(`Restricted ingredient present: ${avoid}`);
      break;
    }
  }

  // Nutrition: simple heuristics based on existing app assumptions.
  let nutritionScore = 100;

  const proteinMin = species === 'cat' ? 26 : species === 'dog' ? 18 : 0;
  if (proteinMin > 0 && nutrition.protein < proteinMin) {
    const deficit01 = (proteinMin - nutrition.protein) / proteinMin;
    const penalty = smoothPenalty(deficit01, 30, 2.5);
    nutritionScore = clampScore(nutritionScore - penalty);
    warnings.push(`Protein below target (${nutrition.protein.toFixed(1)}% vs min ${proteinMin}%)`);
    nutritionalGaps.push('protein');
    if (deficit01 > 0.5) criticalViolations.push('Low protein');
  } else if (proteinMin > 0) {
    nutritionalStrengths.push('Protein meets target');
  }

  const fiberMin = species === 'dog' || species === 'cat' ? 2 : 0;
  if (fiberMin > 0 && nutrition.fiber < fiberMin) {
    const deficit01 = (fiberMin - nutrition.fiber) / fiberMin;
    const penalty = smoothPenalty(deficit01, 12, 2.5);
    nutritionScore = clampScore(nutritionScore - penalty);
    warnings.push(`Fiber below target (${nutrition.fiber.toFixed(1)}% vs min ${fiberMin}%)`);
    nutritionalGaps.push('fiber');
  }

  if (nutrition.calcium > 0 && nutrition.phosphorus > 0) {
    const ratio = nutrition.calcium / nutrition.phosphorus;
    const min = species === 'reptile' || species === 'pocket-pet' ? 1.5 : 1.0;
    const max = species === 'reptile' || species === 'pocket-pet' ? 2.5 : 2.0;
    if (ratio < min || ratio > max) {
      const deficit01 = ratio < min ? (min - ratio) / min : (ratio - max) / max;
      const penalty = smoothPenalty(deficit01, 30, 4);
      nutritionScore = clampScore(nutritionScore - penalty);
      warnings.push(`Calcium:Phosphorus ratio out of range (${ratio.toFixed(2)} vs ${min}-${max})`);
      nutritionalGaps.push('ca:p');
    } else {
      nutritionalStrengths.push('Calcium:Phosphorus ratio in range');
    }
  } else {
    if (nutrition.calcium <= 0) nutritionalGaps.push('calcium');
    if (nutrition.phosphorus <= 0) nutritionalGaps.push('phosphorus');
    warnings.push('Calcium/Phosphorus data missing or zero');
  }

  // Health factor: light penalty for relevant missing supports.
  let health = 100;
  const concerns = (pet.healthConcerns || []).map((c) => String(c || '').toLowerCase());
  if (concerns.length === 0) strengths.push('No health concerns specified');

  // Quality: baseline, can evolve later.
  let quality = 90;
  if (ageYears >= 8 && species === 'dog') {
    // Use existing senior AAFCO as an indicator (no hard penalties here, just a nudge)
    void AAFCO_STANDARDS;
    quality = 88;
  }

  return {
    factors: { safety, nutrition: nutritionScore, health, quality },
    warnings,
    strengths,
    criticalViolations,
    nutritionalGaps: Array.from(new Set(nutritionalGaps)),
    nutritionalStrengths: Array.from(new Set(nutritionalStrengths)),
  };
}

abstract class NativeSpeciesEngine implements SpeciesScoringEngine {
  public abstract readonly species: PetType;

  public getWeights(): SpeciesScoringWeights {
    return {
      safety: 0.30,
      nutrition: 0.40,
      health: 0.20,
      quality: 0.10,
    };
  }

  public score(recipe: Recipe, pet: SpeciesScoringPet): SpeciesScoreResult {
    const baseline = computeBaselineFactors({ recipe, pet, species: this.species });
    const factors = baseline.factors;
    const warnings = baseline.warnings;
    const strengths = baseline.strengths;
    const criticalViolations = baseline.criticalViolations;
    const nutritionalGaps = baseline.nutritionalGaps;
    const nutritionalStrengths = baseline.nutritionalStrengths;

    this.applySpeciesAdjustments(recipe, pet, factors, warnings, strengths, criticalViolations, nutritionalGaps, nutritionalStrengths);

    const weights = this.getWeights();
    const totalWeight = weights.safety + weights.nutrition + weights.health + weights.quality;
    const overallScore =
      totalWeight > 0
        ? clampScore(
            (factors.safety * weights.safety +
              factors.nutrition * weights.nutrition +
              factors.health * weights.health +
              factors.quality * weights.quality) /
              totalWeight
          )
        : clampScore((factors.safety + factors.nutrition + factors.health + factors.quality) / 4);

    const supplementBoost = getSupplementScoreBoost(recipe);
    const boostedOverallScore = clampScore(overallScore + supplementBoost);

    return {
      species: this.species,
      overallScore: boostedOverallScore,
      grade: getGrade(boostedOverallScore),
      factors: {
        safety: clampScore(factors.safety),
        nutrition: clampScore(factors.nutrition),
        health: clampScore(factors.health),
        quality: clampScore(factors.quality),
      },
      criticalViolations: [...new Set(criticalViolations)],
      warnings: [...new Set(warnings)],
      strengths: [...new Set(strengths)],
      raw: {
        overallScore: boostedOverallScore,
        grade: getGrade(boostedOverallScore),
        factors: {
          ingredientSafety: { score: clampScore(factors.safety), weight: 0.3, reasoning: '', issues: [], strengths: [] },
          nutritionalAdequacy: { score: clampScore(factors.nutrition), weight: 0.4, reasoning: '', issues: [], strengths: [] },
          healthAlignment: { score: clampScore(factors.health), weight: 0.2, reasoning: '', issues: [], strengths: [] },
          ingredientQuality: { score: clampScore(factors.quality), weight: 0.1, reasoning: '', issues: [], strengths: [] },
          lifeStageFit: { score: 0, weight: 0, reasoning: '', issues: [], strengths: [] },
          activityFit: { score: 0, weight: 0, reasoning: '', issues: [], strengths: [] },
          allergenSafety: { score: clampScore(factors.safety), weight: 0, reasoning: '', issues: [], strengths: [] },
        },
        detailedBreakdown: {
          warnings: [...new Set(warnings)],
          healthBenefits: [...new Set(strengths)],
          nutritionalStrengths: [...new Set(nutritionalStrengths)],
          nutritionalGaps: [...new Set(nutritionalGaps)],
          recommendations: [],
        },
      },
    };
  }

  protected applySpeciesAdjustments(
    recipe: Recipe,
    pet: SpeciesScoringPet,
    factors: SpeciesFactorScores,
    warnings: string[],
    _strengths: string[],
    criticalViolations: string[],
    _nutritionalGaps: string[],
    _nutritionalStrengths: string[]
  ): void {
    void recipe;
    void pet;
    void factors;
    void warnings;
    void criticalViolations;
  }
}

class DogScoringEngine extends NativeSpeciesEngine {
  public readonly species: PetType = 'dog';

  public getWeights(): SpeciesScoringWeights {
    return {
      safety: 0.30,
      nutrition: 0.45,
      health: 0.15,
      quality: 0.10,
    };
  }
}

class CatScoringEngine extends NativeSpeciesEngine {
  public readonly species: PetType = 'cat';

  public getWeights(): SpeciesScoringWeights {
    return {
      safety: 0.30,
      nutrition: 0.50,
      health: 0.10,
      quality: 0.10,
    };
  }

  protected applySpeciesAdjustments(
    recipe: Recipe,
    pet: SpeciesScoringPet,
    factors: SpeciesFactorScores,
    warnings: string[],
    _strengths: string[],
    criticalViolations: string[],
    _nutritionalGaps: string[],
    _nutritionalStrengths: string[]
  ): void {
    const ingredients = (recipe.ingredients || []).map((i: any) => (typeof i === 'string' ? i : i?.name || '')).filter(Boolean);
    const supplements = ((recipe as any).supplements || []).map((s: any) => String(s?.name || s?.productName || '')).filter(Boolean);
    const joined = (ingredients.join(' ') + ' ' + supplements.join(' ')).toLowerCase();

    const taurineSupportKeywords = [
      'taurine',
      'taurine_powder',
      'heart',
      'organ',
      'liver',
      'kidney',
      'chicken',
      'turkey',
      'beef',
      'pork',
      'lamb',
      'venison',
      'rabbit',
      'duck',
      'meat',
      'sardine',
      'anchovy',
      'mackerel',
      'herring',
      'tuna',
      'salmon',
      'trout',
      'fish',
    ];
    const hasTaurine = taurineSupportKeywords.some((k) => joined.includes(k));

    if (!hasTaurine) {
      const penalty = smoothPenalty(1, 40, 4);
      factors.nutrition = clampScore(factors.nutrition - penalty);
      warnings.push('Taurine support is missing (critical for cats)');
      criticalViolations.push('Taurine support missing (cat)');
    }
  }
}

class BirdScoringEngine extends NativeSpeciesEngine {
  public readonly species: PetType = 'bird';

  public getWeights(): SpeciesScoringWeights {
    return {
      safety: 0.35,
      nutrition: 0.40,
      health: 0.15,
      quality: 0.10,
    };
  }

  protected applySpeciesAdjustments(
    recipe: Recipe,
    pet: SpeciesScoringPet,
    factors: SpeciesFactorScores,
    warnings: string[],
    _strengths: string[],
    criticalViolations: string[],
    _nutritionalGaps: string[],
    _nutritionalStrengths: string[]
  ): void {
    const nutritionDebug =
      process.env.NEXT_PUBLIC_NUTRITION_DEBUG === 'true' ||
      process.env.NEXT_PUBLIC_SCORE_DEBUG === 'true';

    const toxic = findBirdToxicIngredients(recipe);
    if (toxic.length > 0) {
      factors.safety = 0;
      toxic.forEach((t) => {
        warnings.push(`Contains bird-toxic ingredient: ${t}`);
        criticalViolations.push(`Bird-toxic ingredient: ${t}`);
      });
      return;
    }

    const standards = getBirdStandards(pet.breed || '');
    const pelletPct = getPelletPercentage(recipe);
    // Many generated bird recipes are "seed/veg" mixes and may not include pellets.
    // If we can't detect any pellet content, skip the pellet penalty rather than tanking the score.
    if (pelletPct > 0) {
      const pelletPenalty = penaltyFromMin(pelletPct, standards.pelletPercentage.min, 35, 4);
      if (pelletPenalty > 0) {
        factors.nutrition = clampScore(factors.nutrition - pelletPenalty);
        warnings.push(`Pellet percentage below target (${pelletPct.toFixed(0)}% vs min ${standards.pelletPercentage.min}%)`);
      }
      if (nutritionDebug) {
        console.log('[NutritionDebug][BirdPellets]', {
          recipe: recipe?.name,
          breed: pet.breed,
          pelletPct,
          pelletMin: standards.pelletPercentage.min,
          pelletIdeal: standards.pelletPercentage.ideal,
          nutritionScoreAfter: factors.nutrition,
        });
      }
    } else if (nutritionDebug) {
      console.log('[NutritionDebug][BirdPellets]', {
        recipe: recipe?.name,
        breed: pet.breed,
        pelletPct,
        pelletMin: standards.pelletPercentage.min,
        skipped: true,
      });
    }

    const nutrition = calculateRecipeNutrition(recipe);
    if (nutrition.phosphorus > 0 && nutrition.calcium > 0) {
      const caP = nutrition.calcium / nutrition.phosphorus;
      const min = standards.idealCaPRatio.min;
      const max = standards.idealCaPRatio.max;
      if (Number.isFinite(caP) && caP > 0 && (caP < min || caP > max)) {
        const deficit01 = caP < min ? (min - caP) / min : (caP - max) / max;
        const penalty = smoothPenalty(deficit01, 25, 4);
        factors.nutrition = clampScore(factors.nutrition - penalty);
      }

      if (nutritionDebug) {
        console.log('[NutritionDebug][BirdCaP]', {
          recipe: recipe?.name,
          breed: pet.breed,
          calcium: nutrition.calcium,
          phosphorus: nutrition.phosphorus,
          caP,
          min,
          max,
          nutritionScoreAfter: factors.nutrition,
        });
      }
    }
  }
}

class ReptileScoringEngine extends NativeSpeciesEngine {
  public readonly species: PetType = 'reptile';

  public getWeights(): SpeciesScoringWeights {
    return {
      safety: 0.25,
      nutrition: 0.55,
      health: 0.10,
      quality: 0.10,
    };
  }

  protected applySpeciesAdjustments(
    recipe: Recipe,
    pet: SpeciesScoringPet,
    factors: SpeciesFactorScores,
    warnings: string[],
    _strengths: string[],
    criticalViolations: string[],
    _nutritionalGaps: string[],
    _nutritionalStrengths: string[]
  ): void {
    const ingredients = (recipe.ingredients || []).map((i: any) => (typeof i === 'string' ? i : i?.name || '')).filter(Boolean);
    const supplements = ((recipe as any).supplements || []).map((s: any) => String(s?.name || s?.productName || '')).filter(Boolean);
    const calciumSupport = ingredients.some(isCalciumSupportIngredient) || supplements.some(isCalciumSupportIngredient);
    if (!calciumSupport) {
      const penalty = smoothPenalty(1, 45, 4);
      factors.nutrition = clampScore(factors.nutrition - penalty);
      warnings.push('Calcium support is missing (critical for reptiles)');
      criticalViolations.push('Calcium support missing (reptile)');
    }

    void pet;
  }
}

class PocketPetScoringEngine extends NativeSpeciesEngine {
  public readonly species: PetType = 'pocket-pet';

  public getWeights(): SpeciesScoringWeights {
    return {
      safety: 0.25,
      nutrition: 0.55,
      health: 0.10,
      quality: 0.10,
    };
  }

  protected applySpeciesAdjustments(
    recipe: Recipe,
    pet: SpeciesScoringPet,
    factors: SpeciesFactorScores,
    warnings: string[],
    _strengths: string[],
    criticalViolations: string[],
    _nutritionalGaps: string[],
    _nutritionalStrengths: string[]
  ): void {
    const req = getPocketPetRequirements(pet.breed || '');

    const hayPct = getHayPercentage(recipe);
    const hayPenalty = penaltyFromMin(hayPct, req.hayPercentage.min, 45, 4);
    if (hayPenalty > 0) {
      factors.nutrition = clampScore(factors.nutrition - hayPenalty);
      warnings.push(`Hay percentage below target (${hayPct.toFixed(0)}% vs min ${req.hayPercentage.min}%)`);
      if (req.hayPercentage.min >= 70) {
        criticalViolations.push('Hay-based diet requirement not met');
      }
    }

    if (req.vitaminC?.critical) {
      const hasC = hasVitaminCSource(recipe);
      if (!hasC) {
        const penalty = smoothPenalty(1, 40, 4);
        factors.nutrition = clampScore(factors.nutrition - penalty);
        warnings.push('Vitamin C source is missing (critical for guinea pigs)');
        criticalViolations.push('Vitamin C support missing (guinea pig)');
      }
    }
  }
}

export function getSpeciesScoringEngine(pet: SpeciesScoringPet): SpeciesScoringEngine {
  const species = normalizePetType(pet.type, 'getSpeciesScoringEngine');
  switch (species) {
    case 'dog':
      return new DogScoringEngine();
    case 'cat':
      return new CatScoringEngine();
    case 'bird':
      return new BirdScoringEngine();
    case 'reptile':
      return new ReptileScoringEngine();
    case 'pocket-pet':
      return new PocketPetScoringEngine();
    default:
      return new DogScoringEngine();
  }
}

export function scoreWithSpeciesEngine(recipe: Recipe, pet: SpeciesScoringPet): SpeciesScoreResult {
  return getSpeciesScoringEngine(pet).score(recipe, pet);
}
