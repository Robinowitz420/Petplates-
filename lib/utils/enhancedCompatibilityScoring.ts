// lib/utils/enhancedCompatibilityScoring.ts
// Enhanced compatibility scoring system with ingredient-level analysis
// and multi-factor evaluation

import type { Recipe } from '@/lib/types';
import { getIngredientComposition, INGREDIENT_COMPOSITIONS } from '@/lib/data/ingredientCompositions';
import { getSpeciesCompatibility, shouldAvoid, shouldLimit, normalizeSpecies } from './ingredientCompatibility';
import { AAFCO_NUTRIENT_PROFILES, validateCriticalNutrients } from '@/lib/data/aafco-standards';
import { getAvianStandards, AVIAN_NUTRITION_STANDARDS } from '@/lib/data/avian-nutrition-standards';
import { getReptileStandards, validateReptileNutrition } from '@/lib/data/reptile-nutrition';

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
}

export interface EnhancedCompatibilityScore {
  overallScore: number; // 0-100
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  factors: {
    ingredientSafety: FactorScore;
    nutritionalAdequacy: FactorScore;
    healthAlignment: FactorScore;
    lifeStageFit: FactorScore;
    activityFit: FactorScore;
    allergenSafety: FactorScore;
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
  const normalizedSpecies = normalizeSpecies(pet.type);
  const factors = {
    ingredientSafety: calculateIngredientSafety(recipe, pet, normalizedSpecies),
    nutritionalAdequacy: calculateNutritionalAdequacy(recipe, pet, normalizedSpecies),
    healthAlignment: calculateHealthAlignment(recipe, pet),
    lifeStageFit: calculateLifeStageFit(recipe, pet),
    activityFit: calculateActivityFit(recipe, pet),
    allergenSafety: calculateAllergenSafety(recipe, pet),
  };

  // Weighted overall score
  const overallScore = Math.round(
    factors.ingredientSafety.score * factors.ingredientSafety.weight +
    factors.nutritionalAdequacy.score * factors.nutritionalAdequacy.weight +
    factors.healthAlignment.score * factors.healthAlignment.weight +
    factors.lifeStageFit.score * factors.lifeStageFit.weight +
    factors.activityFit.score * factors.activityFit.weight +
    factors.allergenSafety.score * factors.allergenSafety.weight
  );

  // Calculate grade
  const grade = getGrade(overallScore);

  // Detailed breakdown
  const ingredientAnalysis = analyzeIngredients(recipe, pet, normalizedSpecies);
  const nutritionalAnalysis = analyzeNutrition(recipe, pet, normalizedSpecies);
  
  const healthBenefits: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

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

  return {
    overallScore: Math.max(0, Math.min(100, overallScore)),
    grade,
    factors,
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

  for (const ing of ingredients) {
    const ingName = typeof ing === 'string' ? ing : ing.name;
    const ingKey = ingName.toLowerCase().replace(/\s+/g, '_');
    
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

  // Calculate score: avoid = -50, caution = -20, safe = +10
  let score = 100;
  score -= avoidCount * 50;
  score -= cautionCount * 20;
  score = Math.max(0, score);

  if (avoidCount > 0) {
    score = Math.min(score, 30); // Cap at 30 if any avoids
  }

  if (safeCount === ingredients.length && ingredients.length > 0) {
    strengths.push('All ingredients are safe for this species');
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    weight: 0.25,
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
 * Factor 2: Nutritional Adequacy (Weight: 0.30)
 * Validates against AAFCO/avian/reptile standards
 */
function calculateNutritionalAdequacy(
  recipe: Recipe,
  pet: Pet,
  normalizedSpecies: string
): FactorScore {
  const issues: string[] = [];
  const strengths: string[] = [];
  let score = 100;

  // Calculate recipe nutrition from ingredients
  const nutrition = calculateRecipeNutrition(recipe);
  
  if (normalizedSpecies === 'dog' || normalizedSpecies === 'cat') {
    const lifeStage = pet.age < 1 ? 'growth' : 'adult';
    const validation = validateCriticalNutrients(
      recipe,
      normalizedSpecies as 'dog' | 'cat',
      lifeStage
    );

    if (!validation.isValid) {
      score -= validation.violations.length * 15;
      validation.violations.forEach(v => {
        issues.push(`Nutritional gap: ${v}`);
      });
    } else {
      strengths.push('Meets AAFCO nutritional standards');
    }

    // Check protein levels for life stage
    if (lifeStage === 'growth' && nutrition.protein < 22) {
      score -= 20;
      issues.push('Protein may be too low for growing pets');
    }
  } else if (normalizedSpecies === 'bird') {
    const standards = getAvianStandards(pet.breed) || AVIAN_NUTRITION_STANDARDS.psittacines;
    const caPRatio = nutrition.calcium / (nutrition.phosphorus || 1);
    
    if (caPRatio < (standards.CaP_ratio?.min || 1.5) || caPRatio > (standards.CaP_ratio?.max || 2.5)) {
      score -= 40;
      issues.push(`Ca:P ratio (${caPRatio.toFixed(2)}) outside ideal range for birds`);
    } else {
      strengths.push('Ca:P ratio is ideal for birds');
    }

    if (nutrition.protein < (standards.protein?.min || 12)) {
      score -= 20;
      issues.push('Protein may be too low for birds');
    }
  } else if (normalizedSpecies === 'reptile') {
    const standards = getReptileStandards(pet.breed);
    if (standards) {
      const validation = validateReptileNutrition(recipe, standards);
      if (!validation.isValid) {
        score -= validation.violations.length * 20;
        validation.violations.forEach(v => {
          issues.push(`Reptile nutrition gap: ${v}`);
        });
      } else {
        strengths.push('Meets reptile nutritional standards');
      }
    }
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    weight: 0.30,
    reasoning: issues.length === 0
      ? 'Recipe meets nutritional requirements'
      : `${issues.length} nutritional concern(s) identified`,
    issues,
    strengths,
  };
}

/**
 * Factor 3: Health Alignment (Weight: 0.20)
 * Matches recipe benefits to pet's health concerns
 */
function calculateHealthAlignment(
  recipe: Recipe,
  pet: Pet
): FactorScore {
  const issues: string[] = [];
  const strengths: string[] = [];
  let score = 80; // Start neutral

  if (pet.healthConcerns.length === 0) {
    return {
      score: 100,
      weight: 0.20,
      reasoning: 'No specific health concerns to evaluate',
      issues: [],
      strengths: [],
    };
  }

  const recipeConcerns = (recipe.healthConcerns || []).map(c => c.toLowerCase());
  const recipeNotSuitable = (recipe.notSuitableFor || []).map(c => c.toLowerCase());
  
  const petConcerns = pet.healthConcerns.map(c => c.toLowerCase().replace(/\s+/g, '-'));

  // Check for matches
  let matches = 0;
  let conflicts = 0;

  for (const concern of petConcerns) {
    const normalized = concern.replace(/[^a-z0-9-]/g, '-');
    
    // Check if recipe supports this concern
    const supports = recipeConcerns.some(rc => 
      rc.includes(normalized) || normalized.includes(rc)
    );
    
    // Check if recipe is not suitable
    const notSuitable = recipeNotSuitable.some(ns => 
      ns.includes(normalized) || normalized.includes(ns)
    );

    if (notSuitable) {
      conflicts++;
      score -= 30;
      issues.push(`Recipe is not suitable for ${concern}`);
    } else if (supports) {
      matches++;
      score += 15;
      strengths.push(`Recipe supports ${concern}`);
    }
  }

  // Bonus for multiple matches
  if (matches >= 2) {
    score += 10;
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    weight: 0.20,
    reasoning: matches > 0
      ? `Supports ${matches} of ${petConcerns.length} health concern(s)`
      : conflicts > 0
      ? `Conflicts with ${conflicts} health concern(s)`
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
    weight: 0.10,
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
    weight: 0.10,
    reasoning: hasAllergen
      ? 'Contains known allergens - NOT SAFE'
      : 'No allergens detected',
    issues,
    strengths,
  };
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
 */
function calculateRecipeNutrition(recipe: Recipe): {
  protein: number;
  fat: number;
  calcium: number;
  phosphorus: number;
  calories: number;
  source: 'real' | 'estimated';
} {
  const ingredients = recipe.ingredients || [];
  let totalProtein = 0;
  let totalFat = 0;
  let totalCalcium = 0;
  let totalPhosphorus = 0;
  let totalCalories = 0;
  let totalWeight = 0;
  let realDataCount = 0;

  for (const ingredient of ingredients) {
    const name = typeof ingredient === 'string' ? ingredient : ingredient.name;
    const amount = typeof ingredient === 'string' ? 100 : (ingredient.amount ? parseFloat(String(ingredient.amount).replace(/[^0-9.]/g, '')) : 100);

    const composition = getIngredientComposition(name.toLowerCase().replace(/\s+/g, '_'));
    if (composition && composition.protein !== undefined) {
      totalProtein += (composition.protein || 0) * (amount / 100);
      totalFat += (composition.fat || 0) * (amount / 100);
      totalCalcium += (composition.calcium || 0) * (amount / 100);
      totalPhosphorus += (composition.phosphorus || 0) * (amount / 100);
      totalCalories += (composition.kcal || 0) * (amount / 100);
      totalWeight += amount;
      realDataCount++;
    }
  }

  if (realDataCount > 0 && totalWeight > 0) {
    return {
      protein: (totalProtein / totalWeight) * 100,
      fat: (totalFat / totalWeight) * 100,
      calcium: (totalCalcium / totalWeight) * 100,
      phosphorus: (totalPhosphorus / totalWeight) * 100,
      calories: (totalCalories / totalWeight) * 100,
      source: 'real',
    };
  }

  // Fallback estimates
  return {
    protein: 25,
    fat: 15,
    calcium: 0.8,
    phosphorus: 0.6,
    calories: 150,
    source: 'estimated',
  };
}

/**
 * Convert score to letter grade
 */
function getGrade(score: number): 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'B+';
  if (score >= 80) return 'B';
  if (score >= 75) return 'C+';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}
