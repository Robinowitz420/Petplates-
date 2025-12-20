// lib/utils/enhancedCompatibilityScoring.ts
// Enhanced compatibility scoring system with ingredient-level analysis
// and multi-factor evaluation

import type { Recipe } from '@/lib/types';
import { getIngredientComposition, INGREDIENT_COMPOSITIONS } from '@/lib/data/ingredientCompositions';
import { getSpeciesCompatibility, shouldAvoid, shouldLimit, normalizeSpecies } from './ingredientCompatibility';
import { AAFCO_NUTRIENT_PROFILES, validateCriticalNutrients } from '@/lib/data/aafco-standards';
import { getAvianStandards, AVIAN_NUTRITION_STANDARDS } from '@/lib/data/avian-nutrition-standards';
import { getReptileStandards, validateReptileNutrition } from '@/lib/data/reptile-nutrition';
import { getFallbackNutrition } from './nutritionFallbacks';
import { nutritionalGuidelines } from '@/lib/data/nutritional-guidelines';
import {
  getHealthConcernBenefits,
  normalizeHealthConcern,
  isBeneficialIngredient,
  isAvoidIngredient,
  checkMacroAlignment,
} from './healthConcernMatching';
import { calculateIngredientQualityScore } from '@/lib/data/ingredientTiers';
import { matchesSpecies } from './recipeRecommendations';

export interface Pet {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'reptile' | 'pocket-pet';
  breed: string;
  age: number;
  weight: number;
  activityLevel?: 'sedentary' | 'moderate' | 'active' | 'very-active';
  healthConcerns: string[];
  dietaryRestrictions: string[];
  allergies?: string[];
  dislikes?: string[];
  savedRecipes?: string[];
  names?: string[];
  weightKg?: number;
}

export interface EnhancedCompatibilityScore {
  overallScore: number; // 0-100
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  usesFallbackNutrition?: boolean; // True if any ingredient used fallback nutrition
  fallbackIngredients?: string[]; // List of ingredients that used fallback nutrition
  factors: {
    ingredientSafety: FactorScore;
    nutritionalAdequacy: FactorScore;
    healthAlignment: FactorScore;
    lifeStageFit: FactorScore;
    activityFit: FactorScore;
    allergenSafety: FactorScore;
    ingredientQuality: FactorScore;
  };
  detailedBreakdown: {
    ingredientAnalysis: IngredientAnalysis[];
    nutritionalGaps: string[];
    nutritionalStrengths: string[];
    healthBenefits: string[];
    warnings: string[];
    recommendations: string[];
  };
}

interface FactorScore {
  score: number; // 0-100
  weight: number; // 0-1, how much this factor contributes
  reasoning: string;
  issues: string[];
  strengths: string[];
}

interface IngredientAnalysis {
  ingredient: string;
  compatibility: 'excellent' | 'good' | 'caution' | 'avoid';
  speciesCompat: 'ok' | 'avoid' | 'limit' | 'caution' | null;
  healthImpact: 'positive' | 'neutral' | 'negative';
  notes: string[];
}

/**
 * Enhanced compatibility scoring with ingredient-level analysis
 * 
 * This system provides:
 * 1. Deep ingredient-by-ingredient compatibility checking
 * 2. Real nutritional analysis using USDA data
 * 3. Multi-factor weighted scoring
 * 4. Detailed breakdown for transparency
 */
export function calculateEnhancedCompatibility(
  recipe: Recipe,
  pet: Pet
): EnhancedCompatibilityScore {
  // All recipes go through full scoring pipeline - no short-circuits
  const normalizedSpecies = normalizeSpecies(pet.type);
  const factors = {
    ingredientSafety: calculateIngredientSafety(recipe, pet, normalizedSpecies),
    nutritionalAdequacy: calculateNutritionalAdequacy(recipe, pet, normalizedSpecies),
    healthAlignment: calculateHealthAlignment(recipe, pet),
    lifeStageFit: calculateLifeStageFit(recipe, pet),
    activityFit: calculateActivityFit(recipe, pet),
    allergenSafety: calculateAllergenSafety(recipe, pet),
    ingredientQuality: calculateIngredientQuality(recipe),
  };

  // Calculate safety score (gate) - used to prevent unsafe recipes from scoring high
  const safetyScore = calculateSafetyScore(recipe, pet, normalizedSpecies);
  
  // Calculate optimality score (quality) - considers quality, ideal ranges, health alignment
  const optimalityScore = calculateOptimalityScore(recipe, pet, normalizedSpecies, factors);
  
  // Safety gates the overall score: if safety < 60, cap at 30-40
  // This prevents unsafe recipes from scoring high regardless of other factors
  let gatedScore: number;
  if (safetyScore < 60) {
    // Unsafe recipes: cap at 30-40 based on safety level
    // Still allow some differentiation based on optimality, but heavily penalized
    gatedScore = Math.min(40, safetyScore * 0.5 + optimalityScore * 0.1);
  } else {
    // Safe recipes: combine safety and optimality, but safety doesn't dominate
    // Use 70% optimality + 30% safety for safe recipes
    gatedScore = optimalityScore * 0.70 + safetyScore * 0.30;
  }
  
  // Add bonus points for perfect matches (reduced generosity)
  const bonuses = calculateBonuses(recipe, pet);
  
  // Perfect match bonus: adds 2-5 points if recipe meets strict perfect match criteria
  // This is a bonus, not an override - all recipes go through full scoring
  const perfectMatchBonus = isPerfectMatch(recipe, pet) ? 3 : 0; // 3 points for perfect match
  
  // Ingredient quality is a bonus, not a requirement (0-2% bonus, reduced to prevent clustering)
  const qualityBonus = factors.ingredientQuality.score * 0.02;
  
  // Calculate final score with bonuses, capped at 100
  // Use maximum precision before rounding
  const scoreWithBonuses = gatedScore + bonuses + qualityBonus + perfectMatchBonus;
  
  let finalScore = scoreWithBonuses;
  
  // Add small deterministic variation (±1-2 points) based on recipe ID to break ties
  // This prevents identical recipes from getting identical scores
  function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
  const variation = (hashString(recipe.id) % 5) - 2; // -2 to +2 (as specified in plan)
  
  const overallScore = Math.round(Math.max(0, Math.min(100, finalScore + variation)));

  // Calculate grade
  const grade = getGrade(overallScore);

  // Detailed breakdown
  const ingredientAnalysis = analyzeIngredients(recipe, pet, normalizedSpecies);
  const nutritionalAnalysis = analyzeNutrition(recipe, pet, normalizedSpecies);
  
  // Check for fallback nutrition usage
  const nutrition = calculateRecipeNutrition(recipe);
  const usesFallback = nutrition.usesFallbackNutrition || false;
  const fallbackIngs = nutrition.fallbackIngredients || [];
  
  const healthBenefits: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  // Add warning if fallback nutrition is used
  if (usesFallback && fallbackIngs.length > 0) {
    warnings.push(`Recipe uses estimated nutrition data for: ${fallbackIngs.join(', ')}. Recipe should be marked as needsReview.`);
  }

  // Collect health benefits
  if (factors.healthAlignment.strengths.length > 0) {
    healthBenefits.push(...factors.healthAlignment.strengths);
  }

  // Collect warnings
  Object.values(factors).forEach(factor => {
    if (factor.issues.length > 0) {
      warnings.push(...factor.issues);
    }
  });

  // Generate recommendations
  if (factors.nutritionalAdequacy.score < 70) {
    recommendations.push('Consider adding supplements to meet nutritional requirements');
  }
  if (factors.healthAlignment.score < 60 && pet.healthConcerns.length > 0) {
    recommendations.push('This recipe may not address your pet\'s specific health concerns');
  }
  if (factors.activityFit.score < 70 && pet.activityLevel === 'very-active') {
    recommendations.push('This recipe may need additional calories for very active pets');
  }
  if (factors.ingredientQuality.score < 50) {
    recommendations.push('Consider recipes with higher-quality, less processed ingredients');
  }

  return {
    overallScore: Math.max(0, Math.min(100, overallScore)),
    grade,
    factors,
    usesFallbackNutrition: usesFallback,
    fallbackIngredients: fallbackIngs,
    detailedBreakdown: {
      ingredientAnalysis,
      nutritionalGaps: nutritionalAnalysis.gaps,
      nutritionalStrengths: nutritionalAnalysis.strengths,
      healthBenefits,
      warnings: [...new Set(warnings)], // Remove duplicates
      recommendations: [...new Set(recommendations)],
    },
  };
}

/**
 * Factor 1: Ingredient Safety (Weight: 0.25)
 * Checks each ingredient for species compatibility
 */
function calculateIngredientSafety(
  recipe: Recipe,
  pet: Pet,
  normalizedSpecies: string
): FactorScore {
  const ingredients = recipe.ingredients || [];
  let safeCount = 0;
  let cautionCount = 0;
  let avoidCount = 0;
  const issues: string[] = [];
  const strengths: string[] = [];

  // Check for banned ingredients
  const bannedIngredients = (pet as any).bannedIngredients || [];
  const bannedLower = bannedIngredients.map((b: string) => b.toLowerCase());

  for (const ing of ingredients) {
    const ingName = typeof ing === 'string' ? ing : ing.name;
    const ingKey = ingName.toLowerCase().replace(/\s+/g, '_');
    const ingNameLower = ingName.toLowerCase();
    
    // Check if ingredient is banned by user
    const isBanned = bannedLower.some((banned: string) => 
      ingNameLower.includes(banned) || banned.includes(ingNameLower) || ingKey.includes(banned.toLowerCase())
    );
    
    if (isBanned) {
      avoidCount++;
      issues.push(`${ingName} is banned for this pet`);
      continue; // Skip other checks for banned ingredients
    }
    
    // Check species compatibility
    const compat = getSpeciesCompatibility(ingKey, normalizedSpecies);
    
    if (compat === 'avoid') {
      avoidCount++;
      issues.push(`${ingName} should be avoided for ${pet.type}s`);
    } else if (compat === 'limit' || compat === 'caution') {
      cautionCount++;
      issues.push(`${ingName} should be used with caution for ${pet.type}s`);
    } else if (compat === 'ok') {
      safeCount++;
    } else {
      // Unknown ingredient - assume safe but note
      safeCount++;
    }
  }

  // Calculate score with gradual, proportional penalties for better granularity
  const totalIngredients = ingredients.length || 1;
  let score = 100;
  
  // Avoid ingredients: -20 per avoid (reduced from -30), scaled by proportion for gradual penalties
  // This allows recipes with many safe ingredients + one avoid to score better than recipes with mostly avoids
  const avoidRatio = avoidCount / totalIngredients;
  const avoidPenalty = avoidCount * 20 * (1 + avoidRatio); // More gradual
  score -= Math.min(avoidPenalty, 60); // Max -60 for avoids (reduced from -70)
  
  // Caution ingredients: -5 per caution (reduced from -10), scaled by proportion
  const cautionRatio = cautionCount / totalIngredients;
  const cautionPenalty = cautionCount * 5 * (1 + cautionRatio); // More gradual
  score -= Math.min(cautionPenalty, 30); // Max -30 for cautions (reduced from -40)
  
  score = Math.max(0, score);

  if (avoidCount > 0) {
    // Cap at 50 if any avoids (increased from 40 to allow more differentiation)
    score = Math.min(score, 50);
  }

  if (safeCount === ingredients.length && ingredients.length > 0) {
    strengths.push('All ingredients are safe for this species');
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    weight: 0.25, // Weight already correct
    reasoning: avoidCount > 0
      ? `${avoidCount} ingredient(s) should be avoided`
      : cautionCount > 0
      ? `${cautionCount} ingredient(s) need caution`
      : 'All ingredients are species-appropriate',
    issues,
    strengths,
  };
}

/**
 * Calculate continuous score for a nutrient based on distance from ideal range
 * Returns score from 0-100, where 100 = at ideal midpoint, lower = further from ideal
 */
function calculateNutrientScore(
  actual: number,
  min: number,
  max: number
): { score: number; bonus: number } {
  if (max <= min) return { score: 50, bonus: 0 }; // Invalid range
  
  const ideal = (min + max) / 2;
  const range = max - min;
  
  // Calculate distance from ideal (normalized to 0-1)
  const distance = Math.abs(actual - ideal) / range;
  
  // Score: 100 at ideal, decreases linearly with distance
  // Cap at 0 for values way outside range
  let score = Math.max(0, 100 - (distance * 100));
  
  // Bonus for exceeding minimums (up to +8 points, reduced from +15)
  let bonus = 0;
  if (min > 0 && actual > min) {
    const excessPercent = ((actual - min) / min) * 100;
    // +2 points per 5% over minimum, capped at +8 (reduced to prevent over-scoring)
    bonus = Math.min(8, Math.floor(excessPercent / 5) * 2);
  }
  
  return { score, bonus };
}

/**
 * Calculate ingredient diversity bonus (Phase 2.3)
 * Rewards recipes with varied ingredient categories
 */
function calculateIngredientDiversity(recipe: Recipe): number {
  const ingredients = (recipe.ingredients || []).map(ing => {
    const name = typeof ing === 'string' ? ing : ing.name;
    return name.toLowerCase();
  });
  
  if (ingredients.length === 0) return 0;
  
  // Categorize ingredients
  const categories = new Set<string>();
  ingredients.forEach(ing => {
    if (ing.includes('chicken') || ing.includes('turkey') || ing.includes('beef') || 
        ing.includes('fish') || ing.includes('salmon') || ing.includes('lamb') ||
        ing.includes('pork') || ing.includes('duck') || ing.includes('egg')) {
      categories.add('protein');
    } else if (ing.includes('rice') || ing.includes('quinoa') || ing.includes('oats') ||
               ing.includes('barley') || ing.includes('wheat') || ing.includes('corn')) {
      categories.add('grain');
    } else if (ing.includes('carrot') || ing.includes('broccoli') || ing.includes('spinach') ||
               ing.includes('kale') || ing.includes('peas') || ing.includes('green-bean') ||
               ing.includes('sweet-potato') || ing.includes('pumpkin')) {
      categories.add('vegetable');
    } else if (ing.includes('apple') || ing.includes('blueberry') || ing.includes('banana') ||
               ing.includes('cranberry')) {
      categories.add('fruit');
    } else if (ing.includes('oil') || ing.includes('fat')) {
      categories.add('fat');
    } else if (ing.includes('supplement') || ing.includes('vitamin') || ing.includes('mineral')) {
      categories.add('supplement');
    }
  });
  
  // Bonus: +1 point per unique category (max +10)
  const diversityBonus = Math.min(10, categories.size);
  
  return diversityBonus;
}

/**
 * Factor 2: Nutritional Adequacy (Weight: 0.30)
 * Continuous scoring based on distance from ideal nutritional ranges
 */
function calculateNutritionalAdequacy(
  recipe: Recipe,
  pet: Pet,
  normalizedSpecies: string
): FactorScore {
  const issues: string[] = [];
  const strengths: string[] = [];
  
  // Calculate recipe nutrition from ingredients
  const nutrition = calculateRecipeNutrition(recipe);
  
  // Get pet's age group for nutritional guidelines
  let ageGroup: 'puppy' | 'adult' | 'senior' = 'adult';
  if (normalizedSpecies === 'dog' || normalizedSpecies === 'cat') {
    if (pet.age < 1) ageGroup = 'puppy';
    else if (pet.age >= 7) ageGroup = 'senior';
  }
  
  // Map normalized species to PetCategory
  const speciesMap: Record<string, keyof typeof nutritionalGuidelines> = {
    'dog': 'dogs',
    'cat': 'cats',
    'bird': 'birds',
    'reptile': 'reptiles',
    'pocket-pet': 'pocket-pets',
  };
  
  const petCategory = speciesMap[normalizedSpecies];
  let requirements = petCategory ? nutritionalGuidelines[petCategory]?.[ageGroup] : null;
  
  // Fallback to adult if specific age group not available
  if (!requirements && petCategory) {
    requirements = nutritionalGuidelines[petCategory]?.adult;
  }
  
  // Initialize nutrient scores
  const nutrientScores: { name: string; score: number; bonus: number }[] = [];
  let totalScore = 0;
  let totalWeight = 0;
  
  if (requirements) {
    // Protein scoring (weight: 0.30)
    if (requirements.protein) {
      const { score, bonus } = calculateNutrientScore(
        nutrition.protein,
        requirements.protein.min,
        requirements.protein.max
      );
      nutrientScores.push({ name: 'protein', score, bonus });
      totalScore += score * 0.30;
      totalWeight += 0.30;
      
      if (nutrition.protein < requirements.protein.min) {
        issues.push(`Protein (${nutrition.protein.toFixed(1)}%) below minimum (${requirements.protein.min}%)`);
      } else if (nutrition.protein > requirements.protein.max) {
        issues.push(`Protein (${nutrition.protein.toFixed(1)}%) above maximum (${requirements.protein.max}%)`);
      } else {
        strengths.push(`Protein (${nutrition.protein.toFixed(1)}%) within ideal range`);
      }
    }
    
    // Fat scoring (weight: 0.25)
    if (requirements.fat) {
      const { score, bonus } = calculateNutrientScore(
        nutrition.fat,
        requirements.fat.min,
        requirements.fat.max
      );
      nutrientScores.push({ name: 'fat', score, bonus });
      totalScore += score * 0.25;
      totalWeight += 0.25;
      
      if (nutrition.fat < requirements.fat.min) {
        issues.push(`Fat (${nutrition.fat.toFixed(1)}%) below minimum (${requirements.fat.min}%)`);
      } else if (nutrition.fat > requirements.fat.max) {
        issues.push(`Fat (${nutrition.fat.toFixed(1)}%) above maximum (${requirements.fat.max}%)`);
      }
    }
    
    // Fiber scoring (weight: 0.15)
    if (requirements.fiber) {
      const { score, bonus } = calculateNutrientScore(
        nutrition.fiber,
        requirements.fiber.min,
        requirements.fiber.max
      );
      nutrientScores.push({ name: 'fiber', score, bonus });
      totalScore += score * 0.15;
      totalWeight += 0.15;
    }
    
    // Calcium scoring (weight: 0.15)
    if (requirements.calcium) {
      const { score, bonus } = calculateNutrientScore(
        nutrition.calcium,
        requirements.calcium.min,
        requirements.calcium.max
      );
      nutrientScores.push({ name: 'calcium', score, bonus });
      totalScore += score * 0.15;
      totalWeight += 0.15;
    }
    
    // Phosphorus scoring (weight: 0.15)
    if (requirements.phosphorus) {
      const { score, bonus } = calculateNutrientScore(
        nutrition.phosphorus,
        requirements.phosphorus.min,
        requirements.phosphorus.max
      );
      nutrientScores.push({ name: 'phosphorus', score, bonus });
      totalScore += score * 0.15;
      totalWeight += 0.15;
    }
    
    // Ca:P ratio precision scoring (Phase 2.2)
    if (nutrition.calcium && nutrition.phosphorus && requirements.calcium && requirements.phosphorus) {
      const caPRatio = nutrition.calcium / nutrition.phosphorus;
      // Ideal Ca:P ratio varies by species, but generally 1.2:1 to 2:1
      const idealCaP = petCategory === 'dogs' || petCategory === 'cats' ? 1.5 : 1.8;
      const minCaP = 1.2;
      const maxCaP = 2.0;
      
      if (caPRatio >= minCaP && caPRatio <= maxCaP) {
        // Calculate distance from ideal
        const distance = Math.abs(caPRatio - idealCaP) / (maxCaP - minCaP);
        const ratioScore = 100 - (distance * 50); // Max penalty -50
        totalScore += ratioScore * 0.10; // 10% weight for ratio
        totalWeight += 0.10;
        
        if (distance < 0.1) {
          strengths.push(`Optimal Ca:P ratio (${caPRatio.toFixed(2)})`);
        } else if (distance < 0.3) {
          strengths.push(`Good Ca:P ratio (${caPRatio.toFixed(2)})`);
        } else {
          issues.push(`Ca:P ratio (${caPRatio.toFixed(2)}) could be closer to ideal (${idealCaP})`);
        }
      } else {
        // Outside ideal range - elastic thresholds with diminishing returns
        const safeMin = 0.8; // Animals tolerate broader ranges
        const safeMax = 3.0;
        
        if (caPRatio >= safeMin && caPRatio < minCaP) {
          // Slightly low - small penalty
          const deviation = minCaP - caPRatio;
          const penalty = Math.min(deviation * 5, 10); // Reduced penalty
          totalScore -= penalty * 0.10;
          totalWeight += 0.10;
          issues.push(`Ca:P ratio (${caPRatio.toFixed(2)}) slightly below ideal range`);
        } else if (caPRatio > maxCaP && caPRatio <= safeMax) {
          // Slightly high - small penalty
          const deviation = caPRatio - maxCaP;
          const penalty = Math.min(deviation * 5, 10); // Reduced penalty
          totalScore -= penalty * 0.10;
          totalWeight += 0.10;
          issues.push(`Ca:P ratio (${caPRatio.toFixed(2)}) slightly above ideal range`);
        } else {
          // Outside safe range - larger penalty
          const penalty = caPRatio < safeMin ? (safeMin - caPRatio) * 20 : (caPRatio - safeMax) * 20;
          totalScore -= Math.min(penalty, 50) * 0.10;
          totalWeight += 0.10;
          issues.push(`Ca:P ratio (${caPRatio.toFixed(2)}) outside safe range (${safeMin}-${safeMax})`);
        }
      }
    }
  }
  
  // Calculate weighted average score
  let finalScore = totalWeight > 0 ? totalScore / totalWeight : 50;
  
  // Add bonuses for exceeding minimums (average across nutrients)
  const avgBonus = nutrientScores.length > 0
    ? nutrientScores.reduce((sum, n) => sum + n.bonus, 0) / nutrientScores.length
    : 0;
  finalScore += avgBonus;
  
  // Add ingredient diversity bonus (Phase 2.3)
  const diversityBonus = calculateIngredientDiversity(recipe);
  finalScore += diversityBonus;
  
  // Safety validation check (still important for critical failures)
  if (normalizedSpecies === 'dog' || normalizedSpecies === 'cat') {
    const lifeStage = pet.age < 1 ? 'growth' : 'adult';
    const validation = validateCriticalNutrients(
      recipe,
      normalizedSpecies as 'dog' | 'cat',
      lifeStage
    );
    
    if (!validation.isValid) {
      // Critical violations reduce score gradually using distance-based penalty
      // Penalty = violations^2 * scalingFactor for better granularity
      const violationPenalty = Math.min(30, validation.violations.length * validation.violations.length * 2);
      finalScore -= violationPenalty;
      validation.violations.forEach(v => {
        issues.push(`Critical nutritional gap: ${v}`);
      });
    }
  } else if (normalizedSpecies === 'bird') {
    const standards = getAvianStandards(pet.breed) || AVIAN_NUTRITION_STANDARDS.psittacines;
    if (nutrition.protein < (standards.protein?.min || 12)) {
      // Gradual penalty based on how far below minimum
      const deviation = (standards.protein?.min || 12) - nutrition.protein;
      const penalty = Math.min(20, deviation * deviation * 2); // Quadratic penalty
      finalScore -= penalty;
      issues.push('Protein critically low for birds');
    }
  } else if (normalizedSpecies === 'reptile') {
    const standards = getReptileStandards(pet.breed);
    if (standards) {
      const validation = validateReptileNutrition(recipe, pet.breed || 'unknown');
      if (!validation.isValid) {
        finalScore -= validation.violations.length * 5; // Reduced from -10 to -5
        validation.violations.forEach(v => {
          issues.push(`Reptile nutrition gap: ${v}`);
        });
      }
    }
  } else if (normalizedSpecies === 'pocket-pet') {
    const breed = (pet.breed || '').toLowerCase();
    const isLowFiber = ['sugar', 'glider', 'hamster', 'rat', 'mouse', 'ferret'].some(b => breed.includes(b));
    const isHayEater = ['rabbit', 'guinea', 'chinchilla'].some(b => breed.includes(b));
    
    if (isLowFiber && nutrition.protein < 12) {
      // Gradual penalty based on deviation
      const deviation = 12 - nutrition.protein;
      const penalty = Math.min(20, deviation * deviation * 2);
      finalScore -= penalty;
      issues.push('Protein critically low for this pocket-pet type');
    }
    if (isHayEater && nutrition.fiber < 15) {
      // Gradual penalty based on deviation
      const deviation = 15 - nutrition.fiber;
      const penalty = Math.min(20, deviation * deviation * 2);
      finalScore -= penalty;
      issues.push('Fiber critically low for hay-eating pocket-pets');
    }
    if (breed.includes('ferret') && nutrition.protein < 30) {
      // Gradual penalty based on deviation
      const deviation = 30 - nutrition.protein;
      const penalty = Math.min(25, deviation * deviation * 1.5);
      finalScore -= penalty;
      issues.push('Ferrets require high protein (30%+) as obligate carnivores');
    }
  }
  
  // Add missing data penalty - FIXED: Only penalize for pets with health concerns requiring precise nutrition
  // Use gradual penalty: (100 - coverage) / 10 instead of binary thresholds
  if (nutrition.usesFallbackNutrition && nutrition.fallbackIngredients && pet.healthConcerns.length > 0) {
    const totalIngredients = (recipe.ingredients || []).length;
    const missingPercentage = totalIngredients > 0 
      ? nutrition.fallbackIngredients.length / totalIngredients 
      : 0;
    const coverage = (1 - missingPercentage) * 100;
    const penalty = Math.min(15, (100 - coverage) / 10); // Gradual: -1 per 10% missing
    finalScore -= penalty;
    
    if (penalty > 0) {
      issues.push(`Uses estimated nutrition data for ${nutrition.fallbackIngredients.length} ingredient(s) (${Math.round(missingPercentage * 100)}%)`);
    }
  }
  // For perfect pets, fallback data is acceptable and doesn't penalize
  
  // Add strength messages for good scores
  if (finalScore >= 85) {
    strengths.push('Excellent nutritional profile');
  } else if (finalScore >= 75) {
    strengths.push('Good nutritional profile');
  } else if (finalScore >= 65) {
    strengths.push('Adequate nutritional profile');
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(finalScore))),
    weight: 0.35, // Updated weight to match new distribution
    reasoning: issues.length === 0
      ? `Nutritional score: ${Math.round(finalScore)}% (${strengths[0] || 'within acceptable ranges'})`
      : `${issues.length} nutritional concern(s) identified`,
    issues,
    strengths,
  };
}

/**
 * Factor 3: Health Alignment (Weight: 0.20)
 * Tiered scoring based on precision of health concern matching
 */
function calculateHealthAlignment(
  recipe: Recipe,
  pet: Pet
): FactorScore {
  const issues: string[] = [];
  const strengths: string[] = [];

  if (pet.healthConcerns.length === 0) {
    return {
      score: 100,
      weight: 0.15, // Updated weight to match new distribution
      reasoning: 'No specific health concerns to evaluate',
      issues: [],
      strengths: ['Recipe suitable for healthy pets'],
    };
  }

  // Calculate recipe nutrition for macro alignment checks
  const nutrition = calculateRecipeNutrition(recipe);
  
  // Get recipe ingredients
  const recipeIngredients = (recipe.ingredients || []).map(ing => {
    const name = typeof ing === 'string' ? ing : ing.name;
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  });
  
  const recipeConcerns = (recipe.healthConcerns || []).map(c => normalizeHealthConcern(c));
  const recipeNotSuitable = (recipe.notSuitableFor || []).map(c => normalizeHealthConcern(c));
  
  const petConcerns = pet.healthConcerns.map(c => normalizeHealthConcern(c));
  
  // Calculate tiered scores for each concern
  const concernScores: number[] = [];
  const concernWeights: number[] = [];
  
  for (let i = 0; i < petConcerns.length; i++) {
    const concern = petConcerns[i];
    const concernData = getHealthConcernBenefits(concern);
    
    // Weight: Primary concern (first) gets full weight, others get 0.7x
    const weight = i === 0 ? 1.0 : 0.7;
    
    // Check if recipe explicitly says it's not suitable
    const notSuitable = recipeNotSuitable.some(ns => 
      ns.includes(concern) || concern.includes(ns)
    );
    
    if (notSuitable) {
      // Tier 5: Negative match - contains problematic elements
      concernScores.push(20);
      concernWeights.push(weight);
      issues.push(`Recipe is not suitable for ${concern.replace(/-/g, ' ')}`);
      continue;
    }
    
    // Check if recipe explicitly targets this concern
    const explicitlyTargets = recipeConcerns.some(rc => 
      rc.includes(concern) || concern.includes(rc)
    );
    
    if (concernData) {
      // Check for beneficial ingredients
      const beneficialCount = recipeIngredients.filter(ing => 
        isBeneficialIngredient(ing, concernData.beneficialIngredients)
      ).length;
      
      // Check for avoid ingredients
      const avoidCount = recipeIngredients.filter(ing => 
        isAvoidIngredient(ing, concernData.avoidIngredients, pet.allergies)
      ).length;
      
      // Check macro alignment
      const macroAlignment = checkMacroAlignment(nutrition, concernData.targetMacros);
      
      // Tier 1: Perfect match - explicitly targets + has beneficial + avoids problematic + good macros
      if (explicitlyTargets && beneficialCount > 0 && avoidCount === 0 && macroAlignment >= 25) {
        concernScores.push(100);
        concernWeights.push(weight);
        strengths.push(`Perfect match for ${concern.replace(/-/g, ' ')}: targets concern with beneficial ingredients`);
      }
      // Tier 2: Strong match - explicitly targets + has some beneficial ingredients
      else if (explicitlyTargets && beneficialCount > 0) {
        const tier2Score = 70 + Math.min(beneficialCount * 5, 15) + (avoidCount === 0 ? 10 : -avoidCount * 5);
        concernScores.push(Math.min(100, tier2Score));
        concernWeights.push(weight);
        strengths.push(`Strong match for ${concern.replace(/-/g, ' ')}: targets concern with ${beneficialCount} beneficial ingredient(s)`);
      }
      // Tier 3: Supportive match - has beneficial ingredients but doesn't explicitly target
      else if (beneficialCount > 0 && avoidCount === 0) {
        const tier3Score = 50 + Math.min(beneficialCount * 5, 20) + (macroAlignment >= 25 ? 10 : 0);
        concernScores.push(Math.min(100, tier3Score));
        concernWeights.push(weight);
        strengths.push(`Supportive for ${concern.replace(/-/g, ' ')}: contains ${beneficialCount} beneficial ingredient(s)`);
      }
      // Tier 4: Neutral - no alignment but no conflicts
      else if (avoidCount === 0) {
        concernScores.push(50);
        concernWeights.push(weight);
      }
      // Tier 5: Negative - contains problematic ingredients
      else {
        const tier5Score = Math.max(0, 30 - (avoidCount * 10));
        concernScores.push(tier5Score);
        concernWeights.push(weight);
        issues.push(`Contains ${avoidCount} problematic ingredient(s) for ${concern.replace(/-/g, ' ')}`);
      }
    } else {
      // No specific data for this concern - use basic tag matching
      if (explicitlyTargets) {
        concernScores.push(85);
        concernWeights.push(weight);
        strengths.push(`Recipe targets ${concern.replace(/-/g, ' ')}`);
      } else {
        concernScores.push(50);
        concernWeights.push(weight);
      }
    }
  }
  
  // Calculate weighted average across all concerns
  let totalScore = 0;
  let totalWeight = 0;
  for (let i = 0; i < concernScores.length; i++) {
    totalScore += concernScores[i] * concernWeights[i];
    totalWeight += concernWeights[i];
  }
  
  const finalScore = totalWeight > 0 ? totalScore / totalWeight : 50;

  return {
    score: Math.max(0, Math.min(100, Math.round(finalScore))),
    weight: 0.15, // Updated weight to match new distribution
    reasoning: concernScores.length > 0
      ? `Health alignment: ${Math.round(finalScore)}% (${strengths.length > 0 ? strengths[0] : 'neutral'})`
      : 'Neutral health alignment',
    issues,
    strengths,
  };
}

/**
 * Factor 4: Life Stage Fit (Weight: 0.10)
 * Checks if recipe is appropriate for pet's age
 */
function calculateLifeStageFit(
  recipe: Recipe,
  pet: Pet
): FactorScore {
  const issues: string[] = [];
  const strengths: string[] = [];
  
  const petAgeGroup = pet.age < 1 ? 'baby' : pet.age < 2 ? 'young' : pet.age < 7 ? 'adult' : 'senior';
  const recipeAgeGroups = recipe.ageGroup || [];
  
  const isMatch = recipeAgeGroups.includes(petAgeGroup) || 
                  recipeAgeGroups.includes('all') ||
                  recipeAgeGroups.length === 0;

  if (isMatch) {
    strengths.push(`Appropriate for ${petAgeGroup} pets`);
  } else {
    issues.push(`Recipe designed for ${recipeAgeGroups.join(', ')}, but pet is ${petAgeGroup}`);
  }

  return {
    score: isMatch ? 100 : 60,
    weight: 0.10, // Weight already correct
    reasoning: isMatch
      ? `Recipe is appropriate for ${petAgeGroup} pets`
      : `Age group mismatch`,
    issues,
    strengths,
  };
}

/**
 * Factor 5: Activity Fit (Weight: 0.05)
 * Checks if calorie content matches activity level
 */
function calculateActivityFit(
  recipe: Recipe,
  pet: Pet
): FactorScore {
  const issues: string[] = [];
  const strengths: string[] = [];
  
  if (!pet.activityLevel) {
    return {
      score: 100,
      weight: 0.05,
      reasoning: 'Activity level not specified',
      issues: [],
      strengths: [],
    };
  }

  const nutrition = calculateRecipeNutrition(recipe);
  const calories = nutrition.calories || 150; // Default estimate

  // Rough calorie needs by activity (kcal per kg body weight per day)
  const activityMultipliers = {
    'sedentary': 80,
    'moderate': 100,
    'active': 120,
    'very-active': 150,
  };

  const estimatedNeeds = (activityMultipliers[pet.activityLevel] || 100) * pet.weight;
  const recipeCalories = calories * (pet.weight / 10); // Rough estimate for portion

  if (pet.activityLevel === 'very-active' && recipeCalories < estimatedNeeds * 0.8) {
    issues.push('Recipe may be too low in calories for very active pets');
  } else if (pet.activityLevel === 'sedentary' && recipeCalories > estimatedNeeds * 1.2) {
    issues.push('Recipe may be too high in calories for sedentary pets');
  } else {
    strengths.push(`Calorie content appropriate for ${pet.activityLevel} activity level`);
  }

  return {
    score: issues.length > 0 ? 70 : 100,
    weight: 0.05,
    reasoning: issues.length > 0
      ? 'Calorie content may not match activity level'
      : 'Calorie content matches activity level',
    issues,
    strengths,
  };
}

/**
 * Factor 6.5: Ingredient Quality (Weight: 0.10)
 * Scores based on ingredient sophistication and quality
 */
function calculateIngredientQuality(
  recipe: Recipe
): FactorScore {
  const issues: string[] = [];
  const strengths: string[] = [];
  
  const ingredients = (recipe.ingredients || []).map(ing => 
    typeof ing === 'string' ? { name: ing } : ing
  );
  
  const qualityResult = calculateIngredientQualityScore(ingredients);
  
  if (qualityResult.premiumCount > 0) {
    strengths.push(`${qualityResult.premiumCount} premium ingredient(s)`);
  }
  
  if (qualityResult.basicCount > 0) {
    issues.push(`${qualityResult.basicCount} processed/basic ingredient(s)`);
  }
  
  if (qualityResult.freshRatio > 0.5) {
    strengths.push('High proportion of fresh ingredients');
  }
  
  return {
    score: qualityResult.score,
    weight: 0.00, // FIXED: Quality is now a bonus, not part of base weight
    reasoning: qualityResult.score >= 70
      ? `High-quality ingredients (${qualityResult.premiumCount} premium)`
      : qualityResult.score >= 50
      ? 'Standard ingredient quality'
      : 'Contains processed/basic ingredients',
    issues,
    strengths,
  };
}

/**
 * Factor 6: Allergen Safety (Weight: 0.10)
 * Critical safety check for allergies
 */
function calculateAllergenSafety(
  recipe: Recipe,
  pet: Pet
): FactorScore {
  const issues: string[] = [];
  const strengths: string[] = [];
  
  const allAllergens = [
    ...(pet.allergies || []),
    ...pet.dietaryRestrictions.filter(r => 
      ['chicken', 'beef', 'dairy', 'wheat', 'egg', 'fish', 'pork'].some(a => 
        r.toLowerCase().includes(a)
      )
    ),
  ];

  if (allAllergens.length === 0) {
    return {
      score: 100,
      weight: 0.10,
      reasoning: 'No known allergies or restrictions',
      issues: [],
      strengths: ['No allergen concerns'],
    };
  }

  const ingredients = (recipe.ingredients || []).map(i => 
    (typeof i === 'string' ? i : i.name).toLowerCase()
  ).join(' ');

  let hasAllergen = false;
  for (const allergen of allAllergens) {
    if (ingredients.includes(allergen.toLowerCase())) {
      hasAllergen = true;
      issues.push(`Contains ${allergen} - AVOID`);
    }
  }

  if (!hasAllergen) {
    strengths.push('Recipe avoids all known allergens');
  }

  return {
    score: hasAllergen ? 0 : 100, // Zero if allergen present
    weight: 0.10, // Weight already correct
    reasoning: hasAllergen
      ? 'Contains known allergens - NOT SAFE'
      : 'No allergens detected',
    issues,
    strengths,
  };
}

/**
 * Calculate safety score (0-100) - only considers hard safety requirements
 * This is used as a gate to prevent unsafe recipes from scoring high
 */
function calculateSafetyScore(
  recipe: Recipe,
  pet: Pet,
  normalizedSpecies: string
): number {
  const ingredients = recipe.ingredients || [];
  let hasAvoid = false;
  let hasAllergen = false;
  
  // Check for banned ingredients
  const bannedIngredients = (pet as any).bannedIngredients || [];
  const bannedLower = bannedIngredients.map((b: string) => b.toLowerCase());
  
  for (const ing of ingredients) {
    const ingName = typeof ing === 'string' ? ing : ing.name;
    const ingKey = ingName.toLowerCase().replace(/\s+/g, '_');
    const ingNameLower = ingName.toLowerCase();
    
    // Check if ingredient is banned
    const isBanned = bannedLower.some((banned: string) => 
      ingNameLower.includes(banned) || banned.includes(ingNameLower) || ingKey.includes(banned.toLowerCase())
    );
    
    if (isBanned) {
      hasAvoid = true;
      continue;
    }
    
    // Check species compatibility
    const compat = getSpeciesCompatibility(ingKey, normalizedSpecies);
    if (compat === 'avoid') {
      hasAvoid = true;
    }
  }
  
  // Check for allergens
  const allergies = pet.allergies || [];
  const dietaryRestrictions = pet.dietaryRestrictions || [];
  const allAllergens = [...allergies, ...dietaryRestrictions];
  
  if (allAllergens.length > 0) {
    const recipeIngNames = ingredients.map(ing => 
      (typeof ing === 'string' ? ing : ing.name).toLowerCase()
    ).join(' ');
    
    hasAllergen = allAllergens.some(a => 
      recipeIngNames.includes(a.toLowerCase())
    );
  }
  
  // Safety score: 0 if unsafe, 100 if completely safe
  if (hasAvoid || hasAllergen) {
    return 0; // Unsafe - will gate overall score
  }
  
  // Check hard nutritional minimums (meets core species standards)
  const nutrition = calculateRecipeNutrition(recipe);
  const petCategory = normalizedSpecies === 'dog' ? 'dogs' : 
                      normalizedSpecies === 'cat' ? 'cats' :
                      normalizedSpecies === 'bird' ? 'birds' :
                      normalizedSpecies === 'reptile' ? 'reptiles' : 'pocket-pets';
  const ageGroup = pet.age < 1 ? 'puppy' : pet.age >= 7 ? 'senior' : 'adult';
  const requirements = nutritionalGuidelines[petCategory]?.[ageGroup] || nutritionalGuidelines[petCategory]?.adult;
  
  if (requirements) {
    // Check critical minimums
    if (requirements.protein && nutrition.protein < requirements.protein.min * 0.8) {
      return 30; // Critically low protein
    }
    if (requirements.fat && nutrition.fat < requirements.fat.min * 0.8) {
      return 40; // Critically low fat
    }
  }
  
  // All safety checks passed
  return 100;
}

/**
 * Calculate optimality score (0-100) - considers quality, ideal ranges, health alignment
 * This is the "how good is it" score, separate from safety
 */
function calculateOptimalityScore(
  recipe: Recipe,
  pet: Pet,
  normalizedSpecies: string,
  factors: {
    ingredientSafety: FactorScore;
    nutritionalAdequacy: FactorScore;
    healthAlignment: FactorScore;
    lifeStageFit: FactorScore;
    activityFit: FactorScore;
    allergenSafety: FactorScore;
    ingredientQuality: FactorScore;
  }
): number {
  // Optimality weights (different from safety)
  const optimalityWeights = {
    nutritionalAdequacy: 0.40, // How close to ideal nutrient bands
    healthAlignment: 0.20, // Health concern matching
    lifeStageFit: 0.15, // Age appropriateness
    activityFit: 0.10, // Activity level matching
    ingredientQuality: 0.15, // Quality of ingredients
  };
  
  // Calculate weighted optimality score
  const optimalityScore = 
    factors.nutritionalAdequacy.score * optimalityWeights.nutritionalAdequacy +
    factors.healthAlignment.score * optimalityWeights.healthAlignment +
    factors.lifeStageFit.score * optimalityWeights.lifeStageFit +
    factors.activityFit.score * optimalityWeights.activityFit +
    factors.ingredientQuality.score * optimalityWeights.ingredientQuality;
  
  return Math.max(0, Math.min(100, optimalityScore));
}

/**
 * Analyze each ingredient individually
 */
function analyzeIngredients(
  recipe: Recipe,
  pet: Pet,
  normalizedSpecies: string
): IngredientAnalysis[] {
  const ingredients = recipe.ingredients || [];
  const analysis: IngredientAnalysis[] = [];

  for (const ing of ingredients) {
    const ingName = typeof ing === 'string' ? ing : ing.name;
    const ingKey = ingName.toLowerCase().replace(/\s+/g, '_');
    
    const compat = getSpeciesCompatibility(ingKey, normalizedSpecies);
    const composition = getIngredientComposition(ingKey);
    
    let compatibility: 'excellent' | 'good' | 'caution' | 'avoid';
    let healthImpact: 'positive' | 'neutral' | 'negative' = 'neutral';
    const notes: string[] = [];

    if (compat === 'avoid') {
      compatibility = 'avoid';
      healthImpact = 'negative';
      notes.push('Should be avoided for this species');
    } else if (compat === 'limit' || compat === 'caution') {
      compatibility = 'caution';
      notes.push('Use with caution');
    } else if (compat === 'ok') {
      compatibility = 'good';
    } else {
      compatibility = 'good'; // Unknown, assume safe
    }

    // Check health concerns
    const recipeConcerns = (recipe.healthConcerns || []).map(c => c.toLowerCase());
    const petConcerns = pet.healthConcerns.map(c => c.toLowerCase());
    
    // Check if ingredient benefits health concerns
    if (composition) {
      if (composition.omega3 && petConcerns.some(c => c.includes('joint') || c.includes('skin'))) {
        healthImpact = 'positive';
        notes.push('Rich in omega-3, beneficial for joint/skin health');
      }
      if (composition.taurine && pet.type === 'cat') {
        healthImpact = 'positive';
        notes.push('Contains taurine, essential for cats');
      }
    }

    analysis.push({
      ingredient: ingName,
      compatibility,
      speciesCompat: compat,
      healthImpact,
      notes,
    });
  }

  return analysis;
}

/**
 * Analyze nutritional profile
 */
function analyzeNutrition(
  recipe: Recipe,
  pet: Pet,
  normalizedSpecies: string
): { gaps: string[]; strengths: string[] } {
  const gaps: string[] = [];
  const strengths: string[] = [];
  
  const nutrition = calculateRecipeNutrition(recipe);
  
  if (normalizedSpecies === 'dog' || normalizedSpecies === 'cat') {
    if (nutrition.protein < 18) {
      gaps.push('Protein content may be below optimal');
    } else {
      strengths.push('Adequate protein content');
    }
    
    if (nutrition.calcium && nutrition.phosphorus) {
      const caPRatio = nutrition.calcium / nutrition.phosphorus;
      if (caPRatio < 1.0 || caPRatio > 2.0) {
        gaps.push(`Ca:P ratio (${caPRatio.toFixed(2)}) outside ideal range`);
      } else {
        strengths.push('Ideal Ca:P ratio');
      }
    }
  }

  if (nutrition.source === 'real') {
    strengths.push('Nutritional data based on USDA values');
  }

  return { gaps, strengths };
}

/**
 * Calculate recipe nutrition from ingredients
 * Returns nutrition values as percentages (dry matter basis)
 */
export function calculateRecipeNutrition(recipe: Recipe): {
  protein: number;
  fat: number;
  fiber: number;
  calcium: number;
  phosphorus: number;
  calories: number;
  source: 'real' | 'estimated';
  usesFallbackNutrition?: boolean;
  fallbackIngredients?: string[];
} {
  // Check if recipe has pre-calculated nutritional data (from custom meal analysis)
  const nutritionalCalc = (recipe as any).nutritionalCalculation;
  if (nutritionalCalc) {
    const totalGrams = nutritionalCalc.totalGrams || 100;
    // Convert from grams to percentages
    return {
      protein: totalGrams > 0 ? ((nutritionalCalc.protein_g || 0) / totalGrams) * 100 : 0,
      fat: totalGrams > 0 ? ((nutritionalCalc.fat_g || 0) / totalGrams) * 100 : 0,
      fiber: totalGrams > 0 ? ((nutritionalCalc.fiber_g || 0) / totalGrams) * 100 : 0,
      calcium: totalGrams > 0 ? ((nutritionalCalc.ca_mg || 0) / totalGrams) * 100 : 0,
      phosphorus: totalGrams > 0 ? ((nutritionalCalc.p_mg || 0) / totalGrams) * 100 : 0,
      calories: totalGrams > 0 ? ((nutritionalCalc.calories_kcal || nutritionalCalc.kcal || 0) / totalGrams) * 100 : 0,
      source: 'real',
    };
  }

  const ingredients = recipe.ingredients || [];
  const supplements = (recipe as any).supplements || [];
  
  let totalProtein = 0;
  let totalFat = 0;
  let totalFiber = 0;
  let totalCalcium = 0;
  let totalPhosphorus = 0;
  let totalCalories = 0;
  let totalWeight = 0;
  let realDataCount = 0;
  const fallbackIngredients: string[] = [];

  // Helper function to map supplement names to ingredient composition keys
  const mapSupplementToCompositionKey = (supplementName: string): string | null => {
    const lower = supplementName.toLowerCase();
    // Map common supplement names to ingredient composition keys
    if (lower.includes('taurine')) return 'taurine_powder';
    if (lower.includes('calcium') && (lower.includes('carbonate') || lower.includes('supplement'))) return 'calcium_carbonate';
    if (lower.includes('omega') || lower.includes('fish oil') || lower.includes('krill') || lower.includes('salmon oil')) return 'fish_oil';
    // Note: psyllium, probiotics, vitamins don't have composition data yet
    // They can still be added but won't contribute to macro calculations
    return null;
  };

  // Process ingredients
  for (const ingredient of ingredients) {
    const name = typeof ingredient === 'string' ? ingredient : ingredient.name;
    const amount = typeof ingredient === 'string' ? 100 : (ingredient.amount ? parseFloat(String(ingredient.amount).replace(/[^0-9.]/g, '')) : 100);

    const ingKey = name.toLowerCase().replace(/\s+/g, '_');
    const composition = getIngredientComposition(ingKey);
    
    if (composition && composition.protein !== undefined) {
      // Check if composition uses fallback (has needsReview and source is estimated_fallback)
      const usesFallback = (composition as any).needsReview === true && 
                          (composition.source === 'estimated_fallback' || composition.source?.includes('fallback'));
      
      if (usesFallback) {
        fallbackIngredients.push(name);
      }
      
      totalProtein += (composition.protein || 0) * (amount / 100);
      totalFat += (composition.fat || 0) * (amount / 100);
      totalFiber += (composition.fiber || 0) * (amount / 100);
      totalCalcium += (composition.calcium || 0) * (amount / 100);
      totalPhosphorus += (composition.phosphorus || 0) * (amount / 100);
      totalCalories += (composition.kcal || 0) * (amount / 100);
      totalWeight += amount;
      realDataCount++;
    } else {
      // Try fallback nutrition
      const fallback = getFallbackNutrition(name);
      if (fallback) {
        fallbackIngredients.push(name);
        totalProtein += (fallback.protein || 0) * (amount / 100);
        totalFat += (fallback.fat || 0) * (amount / 100);
        totalFiber += (fallback.fiber || 0) * (amount / 100);
        totalCalcium += (fallback.calcium || 0) * (amount / 100);
        totalPhosphorus += (fallback.phosphorus || 0) * (amount / 100);
        totalCalories += (fallback.kcal || 0) * (amount / 100);
        totalWeight += amount;
        realDataCount++;
      }
    }
  }

  // Process supplements - add their nutritional contributions
  for (const supplement of supplements) {
    const name = supplement.name || supplement.productName || '';
    if (!name) continue;
    
    // Map supplement name to ingredient composition key
    const compositionKey = mapSupplementToCompositionKey(name);
    if (!compositionKey) continue;
    
    // Get composition data
    const composition = getIngredientComposition(compositionKey);
    if (!composition) continue;
    
    // Supplements are typically added in small amounts (mg or grams)
    // Parse amount from supplement.amount (e.g., "250mg", "1g", "As directed")
    let supplementAmount = 0;
    const amountStr = supplement.amount || supplement.defaultAmount || '';
    if (amountStr) {
      // Extract numeric value
      const numericMatch = amountStr.match(/([\d.]+)/);
      if (numericMatch) {
        supplementAmount = parseFloat(numericMatch[1]);
        // Convert mg to grams if needed
        if (amountStr.toLowerCase().includes('mg')) {
          supplementAmount = supplementAmount / 1000;
        }
      } else {
        // Default supplement amount (typically 1-5g for powders)
        supplementAmount = 2; // 2g default
      }
    } else {
      supplementAmount = 2; // 2g default
    }
    
    // Add supplement nutrition to totals
    // Supplements contribute nutrients but typically don't add significant weight to the meal
    // We'll add them proportionally to the existing meal weight
    if (totalWeight > 0) {
      // Add supplement nutrients as if they were part of the meal
      totalCalcium += (composition.calcium || 0) * (supplementAmount / 100);
      totalPhosphorus += (composition.phosphorus || 0) * (supplementAmount / 100);
      totalProtein += (composition.protein || 0) * (supplementAmount / 100);
      totalFat += (composition.fat || 0) * (supplementAmount / 100);
      totalFiber += (composition.fiber || 0) * (supplementAmount / 100);
      totalCalories += (composition.kcal || 0) * (supplementAmount / 100);
      // Add supplement weight to total (small contribution)
      totalWeight += supplementAmount;
      realDataCount++;
    }
  }

  if (realDataCount > 0 && totalWeight > 0) {
    return {
      protein: (totalProtein / totalWeight) * 100,
      fat: (totalFat / totalWeight) * 100,
      fiber: (totalFiber / totalWeight) * 100,
      calcium: (totalCalcium / totalWeight) * 100,
      phosphorus: (totalPhosphorus / totalWeight) * 100,
      calories: (totalCalories / totalWeight) * 100,
      source: fallbackIngredients.length > 0 ? 'estimated' : 'real',
      usesFallbackNutrition: fallbackIngredients.length > 0,
      fallbackIngredients: fallbackIngredients.length > 0 ? fallbackIngredients : undefined,
    };
  }

  // Fallback estimates
  return {
    protein: 25,
    fat: 15,
    fiber: 3,
    calcium: 0.8,
    phosphorus: 0.6,
    calories: 150,
    source: 'estimated',
  };
}

/**
 * Perfect path short-circuit: Check if recipe is a perfect match for a perfect pet
 */
function isPerfectMatch(recipe: Recipe, pet: Pet): boolean {
  // Pet must have no health concerns and no allergies
  if (pet.healthConcerns.length > 0) return false;
  if ((pet.allergies?.length ?? 0) > 0) return false;
  if (pet.dietaryRestrictions.length > 0) return false;
  
  // Recipe must match species
  if (!matchesSpecies(recipe, pet)) return false;
  
  // Recipe must match age group
  const petAgeGroup = pet.age < 1 ? 'baby' : pet.age < 2 ? 'young' : pet.age < 7 ? 'adult' : 'senior';
  if (!recipe.ageGroup || !recipe.ageGroup.includes(petAgeGroup)) {
    if (!recipe.ageGroup?.includes('all') && recipe.ageGroup && recipe.ageGroup.length > 0) {
      return false;
    }
  }
  
  // All ingredients must be safe for species
  const normalizedSpecies = normalizeSpecies(pet.type);
  const ingredients = recipe.ingredients || [];
  for (const ing of ingredients) {
    const ingName = typeof ing === 'string' ? ing : ing.name;
    const ingKey = ingName.toLowerCase().replace(/\s+/g, '_');
    const compat = getSpeciesCompatibility(ingKey, normalizedSpecies);
    if (compat === 'avoid') return false;
  }
  
  // Check for banned ingredients
  const bannedIngredients = (pet as any).bannedIngredients || [];
  if (bannedIngredients.length > 0) {
    const recipeIngNames = ingredients.map(ing => 
      (typeof ing === 'string' ? ing : ing.name).toLowerCase()
    );
    for (const banned of bannedIngredients) {
      if (recipeIngNames.some(name => name.includes(banned.toLowerCase()) || banned.toLowerCase().includes(name))) {
        return false;
      }
    }
  }
  
  // Recipe must meet OPTIMAL nutrient requirements (not just minimums)
  const nutrition = calculateRecipeNutrition(recipe);
  const petCategory = normalizedSpecies === 'dog' ? 'dogs' : 
                      normalizedSpecies === 'cat' ? 'cats' :
                      normalizedSpecies === 'bird' ? 'birds' :
                      normalizedSpecies === 'reptile' ? 'reptiles' : 'pocket-pets';
  const ageGroup = pet.age < 1 ? 'puppy' : pet.age >= 7 ? 'senior' : 'adult';
  const requirements = nutritionalGuidelines[petCategory]?.[ageGroup] || nutritionalGuidelines[petCategory]?.adult;
  
  if (requirements) {
    // Require nutrition to be in IDEAL range (middle 30% of min-max range - very strict for perfect match)
    if (requirements.protein) {
      const range = requirements.protein.max - requirements.protein.min;
      const idealMin = requirements.protein.min + (range * 0.35); // Middle 30% of range
      const idealMax = requirements.protein.max - (range * 0.35);
      if (nutrition.protein < idealMin || nutrition.protein > idealMax) {
        return false;
      }
    }
    if (requirements.fat) {
      const range = requirements.fat.max - requirements.fat.min;
      const idealMin = requirements.fat.min + (range * 0.35);
      const idealMax = requirements.fat.max - (range * 0.35);
      if (nutrition.fat < idealMin || nutrition.fat > idealMax) {
        return false;
      }
    }
    
    // Require Ca:P ratio to be in OPTIMAL range (1.4-1.7, very tight for perfect match)
    if (nutrition.calcium && nutrition.phosphorus && requirements.calcium && requirements.phosphorus) {
      const ratio = nutrition.calcium / nutrition.phosphorus;
      if (ratio < 1.4 || ratio > 1.7) {
        return false;
      }
    }
  }
  
  // Require NO fallback nutrition (100% data coverage required for perfect match)
  if (nutrition.usesFallbackNutrition) {
    return false; // Perfect matches must have complete nutritional data
  }
  
  // Require data coverage > 95% (not just "no fallback")
  const totalIngredients = ingredients.length;
  if (nutrition.fallbackIngredients && nutrition.fallbackIngredients.length > 0) {
    const coverage = ((totalIngredients - nutrition.fallbackIngredients.length) / totalIngredients) * 100;
    if (coverage < 95) {
      return false; // Must have >95% data coverage
    }
  }
  
  // Require all core nutrients in ideal bands (not just protein/fat)
  if (requirements) {
    // Check fiber if required
    if (requirements.fiber) {
      const range = requirements.fiber.max - requirements.fiber.min;
      const idealMin = requirements.fiber.min + (range * 0.35);
      const idealMax = requirements.fiber.max - (range * 0.35);
      if (nutrition.fiber < idealMin || nutrition.fiber > idealMax) {
        return false;
      }
    }
    // Check calcium if required
    if (requirements.calcium) {
      const range = requirements.calcium.max - requirements.calcium.min;
      const idealMin = requirements.calcium.min + (range * 0.35);
      const idealMax = requirements.calcium.max - (range * 0.35);
      if (nutrition.calcium < idealMin || nutrition.calcium > idealMax) {
        return false;
      }
    }
    // Check phosphorus if required
    if (requirements.phosphorus) {
      const range = requirements.phosphorus.max - requirements.phosphorus.min;
      const idealMin = requirements.phosphorus.min + (range * 0.35);
      const idealMax = requirements.phosphorus.max - (range * 0.35);
      if (nutrition.phosphorus < idealMin || nutrition.phosphorus > idealMax) {
        return false;
      }
    }
  }
  
  // Require ingredient quality to be above threshold (at least 85% - very strict for perfect match)
  const qualityScore = calculateIngredientQualityScore(recipe.ingredients || []);
  if (qualityScore.score < 85) {
    return false;
  }
  
  // Require sufficient ingredient diversity (at least 3 different ingredient types)
  const ingredientTypes = new Set<string>();
  for (const ing of ingredients) {
    const ingName = typeof ing === 'string' ? ing : ing.name;
    const ingKey = ingName.toLowerCase().replace(/\s+/g, '_');
    const compat = getSpeciesCompatibility(ingKey, normalizedSpecies);
    if (compat === 'ok') {
      // Categorize ingredient type
      if (ingKey.includes('chicken') || ingKey.includes('turkey') || ingKey.includes('beef') || 
          ingKey.includes('lamb') || ingKey.includes('fish') || ingKey.includes('salmon') ||
          ingKey.includes('pork') || ingKey.includes('duck') || ingKey.includes('organ') ||
          ingKey.includes('heart') || ingKey.includes('liver') || ingKey.includes('egg')) {
        ingredientTypes.add('protein');
      } else if (ingKey.includes('rice') || ingKey.includes('potato') || ingKey.includes('oats') ||
                 ingKey.includes('quinoa') || ingKey.includes('barley') || ingKey.includes('grain')) {
        ingredientTypes.add('carb');
      } else if (ingKey.includes('carrot') || ingKey.includes('broccoli') || ingKey.includes('spinach') ||
                 ingKey.includes('kale') || ingKey.includes('vegetable') || ingKey.includes('green')) {
        ingredientTypes.add('vegetable');
      } else if (ingKey.includes('blueberry') || ingKey.includes('apple') || ingKey.includes('fruit')) {
        ingredientTypes.add('fruit');
      } else if (ingKey.includes('oil') || ingKey.includes('fat') || ingKey.includes('supplement')) {
        ingredientTypes.add('supplement');
      }
    }
  }
  if (ingredientTypes.size < 3) {
    return false; // Need at least 3 different ingredient types
  }
  
  return true;
}

/**
 * Calculate bonus points for perfect matches
 */
export function calculateBonuses(recipe: Recipe, pet: Pet): number {
  let bonus = 0;
  
  // Exact species fit (reduced from 2 to 1)
  if (matchesSpecies(recipe, pet)) {
    bonus += 1;
  }
  
  // Exact life stage match (reduced from 2 to 1)
  const petAgeGroup = pet.age < 1 ? 'baby' : pet.age < 2 ? 'young' : pet.age < 7 ? 'adult' : 'senior';
  if (recipe.ageGroup?.includes(petAgeGroup) || recipe.ageGroup?.includes('all')) {
    bonus += 1;
  }
  
  // No allergens (reduced from 2 to 1)
  if ((pet.allergies?.length ?? 0) === 0 && pet.dietaryRestrictions.length === 0) {
    bonus += 1;
  } else {
    // Check if recipe avoids allergens
    const allAllergens = [...(pet.allergies || []), ...pet.dietaryRestrictions];
    const recipeIngNames = (recipe.ingredients || []).map(ing => 
      (typeof ing === 'string' ? ing : ing.name).toLowerCase()
    ).join(' ');
    const hasAllergen = allAllergens.some(a => recipeIngNames.includes(a.toLowerCase()));
    if (!hasAllergen) {
      bonus += 1;
    }
  }
  
  // No fallback nutritional data (reduced from 2 to 1)
  const nutrition = calculateRecipeNutrition(recipe);
  if (!nutrition.usesFallbackNutrition) {
    bonus += 1;
  }
  
  // Ideal nutrient ratios (reduced from 2 to 1)
  if (nutrition.calcium && nutrition.phosphorus) {
    const ratio = nutrition.calcium / nutrition.phosphorus;
    if (ratio >= 1.2 && ratio <= 2.0) {
      bonus += 1;
    }
  }
  
  // Complete ingredient data (check coverage) (reduced from 2 to 1)
  const totalIngredients = (recipe.ingredients || []).length;
  if (nutrition.fallbackIngredients) {
    const coverage = totalIngredients > 0 
      ? 1 - (nutrition.fallbackIngredients.length / totalIngredients)
      : 0;
    if (coverage >= 0.9) {
      bonus += 1;
    }
  } else if (totalIngredients > 0) {
    bonus += 1; // All ingredients have data
  }
  
  return Math.min(2, bonus); // Cap at 2% bonus (further reduced to prevent clustering at 100%)
}

/**
 * Convert score to letter grade
 */
export function getGrade(score: number): 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'B+';
  if (score >= 80) return 'B';
  if (score >= 75) return 'C+';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Scoring tier system for better UX
 */
export type ScoreTier = 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';

export function getScoreTier(score: number): ScoreTier {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'B+';
  if (score >= 80) return 'B';
  if (score >= 75) return 'C+';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Check if recipe is gold-standard for a simple pet (perfect match criteria)
 */
export function isGoldStandardForSimplePet(recipe: Recipe, pet: Pet): boolean {
  // Species & age correct
  if (!matchesSpecies(recipe, pet)) return false;
  
  const petAgeGroup = pet.age < 1 ? 'baby' : pet.age < 2 ? 'young' : pet.age < 7 ? 'adult' : 'senior';
  if (!recipe.ageGroup || !recipe.ageGroup.includes(petAgeGroup)) {
    if (!recipe.ageGroup?.includes('all') && recipe.ageGroup && recipe.ageGroup.length > 0) {
      return false;
    }
  }
  
  // No allergens/never-feed ingredients
  const allAllergens = [...(pet.allergies || []), ...pet.dietaryRestrictions];
  if (allAllergens.length > 0) {
    const recipeIngNames = (recipe.ingredients || []).map(ing => 
      (typeof ing === 'string' ? ing : ing.name).toLowerCase()
    ).join(' ');
    const hasAllergen = allAllergens.some(a => recipeIngNames.includes(a.toLowerCase()));
    if (hasAllergen) return false;
  }
  
  // Check for banned ingredients
  const bannedIngredients = (pet as any).bannedIngredients || [];
  if (bannedIngredients.length > 0) {
    const recipeIngNames = (recipe.ingredients || []).map(ing => 
      (typeof ing === 'string' ? ing : ing.name).toLowerCase()
    );
    for (const banned of bannedIngredients) {
      if (recipeIngNames.some(name => name.includes(banned.toLowerCase()) || banned.toLowerCase().includes(name))) {
        return false;
      }
    }
  }
  
  // No health concerns OR recipe is neutral/beneficial
  if (pet.healthConcerns.length > 0) {
    const recipeNotSuitable = (recipe.notSuitableFor || []).map(c => normalizeHealthConcern(c));
    const petConcerns = pet.healthConcerns.map(c => normalizeHealthConcern(c));
    const hasConflict = recipeNotSuitable.some(ns => 
      petConcerns.some(pc => ns.includes(pc) || pc.includes(ns))
    );
    if (hasConflict) return false;
  }
  
  // Core nutrients within ideal bands
  const nutrition = calculateRecipeNutrition(recipe);
  const normalizedSpecies = normalizeSpecies(pet.type);
  const petCategory = normalizedSpecies === 'dog' ? 'dogs' : 
                      normalizedSpecies === 'cat' ? 'cats' :
                      normalizedSpecies === 'bird' ? 'birds' :
                      normalizedSpecies === 'reptile' ? 'reptiles' : 'pocket-pets';
  const ageGroup = pet.age < 1 ? 'puppy' : pet.age >= 7 ? 'senior' : 'adult';
  const requirements = nutritionalGuidelines[petCategory]?.[ageGroup] || nutritionalGuidelines[petCategory]?.adult;
  
  if (requirements) {
    if (requirements.protein) {
      if (nutrition.protein < requirements.protein.min || nutrition.protein > requirements.protein.max) {
        return false;
      }
    }
    if (requirements.fat) {
      if (nutrition.fat < requirements.fat.min || nutrition.fat > requirements.fat.max) {
        return false;
      }
    }
    
    // Ca:P ratio in safe range
    if (nutrition.calcium && nutrition.phosphorus && requirements.calcium && requirements.phosphorus) {
      const ratio = nutrition.calcium / nutrition.phosphorus;
      if (ratio < 1.0 || ratio > 2.5) return false;
    }
  }
  
  // No fallback nutrition (or confidence threshold met)
  if (nutrition.usesFallbackNutrition && nutrition.fallbackIngredients) {
    const totalIngredients = (recipe.ingredients || []).length;
    const confidence = totalIngredients > 0 
      ? 1 - (nutrition.fallbackIngredients.length / totalIngredients)
      : 0;
    if (confidence < 0.8) return false; // Require 80% data coverage
  }
  
  return true;
}

/**
 * Per-pet calibration: Rescale scores so best gold-standard recipe becomes 100%
 */
/**
 * Calibrate scores for a pet across multiple recipes
 * Rescales scores so the best perfect match becomes 95-100, or caps at 90-95 if no perfect matches
 * Preserves ranking while improving distribution
 */
export function calibrateScoresForPet(
  recipes: Recipe[],
  pet: Pet
): Map<string, number> {
  // Score all recipes
  const scored = recipes.map(recipe => ({
    recipe,
    rawScore: calculateEnhancedCompatibility(recipe, pet).overallScore,
    isPerfectMatch: isPerfectMatch(recipe, pet)
  }));
  
  // Find best perfect match recipe
  const perfectMatchRecipes = scored.filter(s => s.isPerfectMatch);
  const bestPerfectMatch = perfectMatchRecipes.length > 0
    ? perfectMatchRecipes.reduce((best, current) => 
        current.rawScore > best.rawScore ? current : best
      )
    : null;
  
  // If we have a perfect match recipe, rescale so it becomes 95-100
  if (bestPerfectMatch && bestPerfectMatch.rawScore > 0) {
    // Target: best perfect match should be 98 (allows room for variation)
    const targetScore = 98;
    const scaleFactor = targetScore / bestPerfectMatch.rawScore;
    const calibrated = new Map<string, number>();
    
    // Calculate mean and std dev for monotonic transform
    const scores = scored.map(s => s.rawScore);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    
    scored.forEach(({ recipe, rawScore, isPerfectMatch }) => {
      // Rescale proportionally
      let calibratedScore = rawScore * scaleFactor;
      
      // Perfect matches can reach 100, others capped at 95
      if (isPerfectMatch) {
        calibratedScore = Math.min(100, calibratedScore);
      } else {
        calibratedScore = Math.min(95, calibratedScore);
      }
      
      calibrated.set(recipe.id, Math.max(0, Math.min(100, Math.round(calibratedScore))));
    });
    
    return calibrated;
  }
  
  // No perfect match found - cap top score at 90-95 to honestly reflect "no perfect match"
  const maxRawScore = Math.max(...scored.map(s => s.rawScore));
  const calibrated = new Map<string, number>();
  
  if (maxRawScore > 0) {
    // Rescale so max becomes 92 (honest "no perfect match" ceiling)
    const scaleFactor = 92 / maxRawScore;
    
    scored.forEach(({ recipe, rawScore }) => {
      const calibratedScore = rawScore * scaleFactor;
      calibrated.set(recipe.id, Math.max(0, Math.min(92, Math.round(calibratedScore))));
    });
  } else {
    // All scores are 0 - return as-is
    scored.forEach(({ recipe, rawScore }) => {
      calibrated.set(recipe.id, rawScore);
    });
  }
  
  return calibrated;
}

/**
 * Calculate enhanced compatibility with per-pet calibration applied
 * This is a convenience function that scores a single recipe but applies calibration
 * if a recipe set is provided. For batch operations, use calibrateScoresForPet() directly.
 */
export function calculateEnhancedCompatibilityWithCalibration(
  recipe: Recipe,
  pet: Pet,
  allRecipes?: Recipe[]
): EnhancedCompatibilityScore {
  const rawScore = calculateEnhancedCompatibility(recipe, pet);
  
  // If all recipes provided, apply calibration
  if (allRecipes && allRecipes.length > 1) {
    const calibratedScores = calibrateScoresForPet(allRecipes, pet);
    const calibratedScore = calibratedScores.get(recipe.id);
    
    if (calibratedScore !== undefined) {
      // Return score with calibrated overallScore
      return {
        ...rawScore,
        overallScore: calibratedScore,
        grade: getGrade(calibratedScore),
      };
    }
  }
  
  return rawScore;
}
