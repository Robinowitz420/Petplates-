import type { Recipe } from '@/lib/types';

import { normalizePetType, type PetType } from './petType';
import {
  calculateEnhancedCompatibility,
  type EnhancedCompatibilityScore,
  type Pet as EnhancedPet,
  getGrade,
  calculateRecipeNutrition,
} from './enhancedCompatibilityScoring';

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
  grade: EnhancedCompatibilityScore['grade'];
  factors: SpeciesFactorScores;
  criticalViolations: string[];
  warnings: string[];
  strengths: string[];
  raw: EnhancedCompatibilityScore;
};

export interface SpeciesScoringEngine {
  readonly species: PetType;
  getWeights(): SpeciesScoringWeights;
  score(recipe: Recipe, pet: EnhancedPet): SpeciesScoreResult;
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, n));
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

function extractCriticalViolations(enhanced: EnhancedCompatibilityScore): string[] {
  const warnings = enhanced.detailedBreakdown?.warnings || [];
  return warnings.filter((w) =>
    w.toLowerCase().includes('critical nutritional gap:') ||
    w.toLowerCase().includes(' - avoid') ||
    w.toLowerCase().includes('outside safe range')
  );
}

function extractWarnings(enhanced: EnhancedCompatibilityScore): string[] {
  return enhanced.detailedBreakdown?.warnings || [];
}

function extractStrengths(enhanced: EnhancedCompatibilityScore): string[] {
  const strengths: string[] = [];
  const s1 = enhanced.detailedBreakdown?.nutritionalStrengths || [];
  const s2 = enhanced.detailedBreakdown?.healthBenefits || [];
  strengths.push(...s1, ...s2);
  return strengths;
}

function mapFactors(enhanced: EnhancedCompatibilityScore): SpeciesFactorScores {
  const ingredientSafety = enhanced.factors.ingredientSafety?.score ?? 0;
  const allergenSafety = enhanced.factors.allergenSafety?.score ?? 0;
  const nutritionalAdequacy = enhanced.factors.nutritionalAdequacy?.score ?? 0;
  const healthAlignment = enhanced.factors.healthAlignment?.score ?? 0;
  const ingredientQuality = enhanced.factors.ingredientQuality?.score ?? 0;

  return {
    safety: Math.round((ingredientSafety * 0.7 + allergenSafety * 0.3) * 1000) / 1000,
    nutrition: nutritionalAdequacy,
    health: healthAlignment,
    quality: ingredientQuality,
  };
}

abstract class EnhancedCompatibilityBackedEngine implements SpeciesScoringEngine {
  public abstract readonly species: PetType;

  public getWeights(): SpeciesScoringWeights {
    return {
      safety: 0.30,
      nutrition: 0.40,
      health: 0.20,
      quality: 0.10,
    };
  }

  public score(recipe: Recipe, pet: EnhancedPet): SpeciesScoreResult {
    const enhanced = calculateEnhancedCompatibility(recipe, pet);
    const factors = mapFactors(enhanced);

    const warnings = extractWarnings(enhanced);
    const strengths = extractStrengths(enhanced);
    const criticalViolations = extractCriticalViolations(enhanced);

    this.applySpeciesAdjustments(recipe, pet, enhanced, factors, warnings, strengths, criticalViolations);

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

    return {
      species: this.species,
      overallScore,
      grade: getGrade(overallScore),
      factors: {
        safety: clampScore(factors.safety),
        nutrition: clampScore(factors.nutrition),
        health: clampScore(factors.health),
        quality: clampScore(factors.quality),
      },
      criticalViolations: [...new Set(criticalViolations)],
      warnings: [...new Set(warnings)],
      strengths: [...new Set(strengths)],
      raw: enhanced,
    };
  }

  protected applySpeciesAdjustments(
    recipe: Recipe,
    pet: EnhancedPet,
    enhanced: EnhancedCompatibilityScore,
    factors: SpeciesFactorScores,
    warnings: string[],
    _strengths: string[],
    criticalViolations: string[]
  ): void {
    void recipe;
    void pet;
    void enhanced;
    void factors;
    void warnings;
    void criticalViolations;
  }
}

class DogScoringEngine extends EnhancedCompatibilityBackedEngine {
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

class CatScoringEngine extends EnhancedCompatibilityBackedEngine {
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
    pet: EnhancedPet,
    _enhanced: EnhancedCompatibilityScore,
    factors: SpeciesFactorScores,
    warnings: string[],
    _strengths: string[],
    criticalViolations: string[]
  ): void {
    const ingredients = (recipe.ingredients || []).map((i: any) => (typeof i === 'string' ? i : i?.name || '')).filter(Boolean);
    const supplements = ((recipe as any).supplements || []).map((s: any) => String(s?.name || s?.productName || '')).filter(Boolean);
    const joined = (ingredients.join(' ') + ' ' + supplements.join(' ')).toLowerCase();
    const hasTaurine = joined.includes('taurine') || joined.includes('heart') || joined.includes('organ') || joined.includes('taurine_powder');

    if (!hasTaurine) {
      const penalty = smoothPenalty(1, 40, 4);
      factors.nutrition = clampScore(factors.nutrition - penalty);
      warnings.push('Taurine support is missing (critical for cats)');
      criticalViolations.push('Taurine support missing (cat)');
    }
  }
}

class BirdScoringEngine extends EnhancedCompatibilityBackedEngine {
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
    pet: EnhancedPet,
    _enhanced: EnhancedCompatibilityScore,
    factors: SpeciesFactorScores,
    warnings: string[],
    _strengths: string[],
    criticalViolations: string[]
  ): void {
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
    const pelletPenalty = penaltyFromMin(pelletPct, standards.pelletPercentage.min, 35, 4);
    if (pelletPenalty > 0) {
      factors.nutrition = clampScore(factors.nutrition - pelletPenalty);
      warnings.push(`Pellet percentage below target (${pelletPct.toFixed(0)}% vs min ${standards.pelletPercentage.min}%)`);
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
    }
  }
}

class ReptileScoringEngine extends EnhancedCompatibilityBackedEngine {
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
    pet: EnhancedPet,
    _enhanced: EnhancedCompatibilityScore,
    factors: SpeciesFactorScores,
    warnings: string[],
    _strengths: string[],
    criticalViolations: string[]
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

class PocketPetScoringEngine extends EnhancedCompatibilityBackedEngine {
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
    pet: EnhancedPet,
    _enhanced: EnhancedCompatibilityScore,
    factors: SpeciesFactorScores,
    warnings: string[],
    _strengths: string[],
    criticalViolations: string[]
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

export function getSpeciesScoringEngine(pet: EnhancedPet): SpeciesScoringEngine {
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

export function scoreWithSpeciesEngine(recipe: Recipe, pet: EnhancedPet): SpeciesScoreResult {
  return getSpeciesScoringEngine(pet).score(recipe, pet);
}
