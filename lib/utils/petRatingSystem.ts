// lib/utils/petRatingSystem.ts
import type { Recipe as BaseRecipe } from '@/lib/types';
import { INGREDIENT_COMPOSITIONS, getIngredientComposition } from '@/lib/data/ingredientCompositions';
import { AVIAN_NUTRITION_STANDARDS, getAvianStandards } from '@/lib/data/avian-nutrition-standards';
import { AAFCO_NUTRIENT_PROFILES, getAAFCOStandards, validateCriticalNutrients } from '@/lib/data/aafco-standards';
import { REPTILE_NUTRITION_STANDARDS, getReptileStandards, validateReptileNutrition } from '@/lib/data/reptile-nutrition';
import { BALANCEIT_ANALYSIS } from '@/lib/competitors/balanceit-analysis';

export interface Pet {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'reptile' | 'pocket-pet';
  breed: string;
  age: number;
  weight: number;
  activityLevel: 'sedentary' | 'moderate' | 'active' | 'very-active';
  healthConcerns: string[];
  dietaryRestrictions: string[];
  allergies?: string[];
  dislikes?: string[];
}

// Helper to detect if data is just the auto-generated placeholder
function isGenericNutrition(n: any): boolean {
  if (!n) return true;
  // Checks for the specific ranges found in your recipes-complete.ts
  return n.protein?.min === 25 && n.fat?.min === 10 && n.fiber?.min === 2;
}

function extractNutrition(recipe: any): {
  protein: number;
  fat: number;
  fiber: number;
  calories: number;
  phosphorus: number;
  isGeneric: boolean;
} | null {
  // Check for nutritionalInfo object
  if (recipe.nutritionalInfo) {
    const isGeneric = isGenericNutrition(recipe.nutritionalInfo);
    return {
      protein: recipe.nutritionalInfo.protein?.min || 0,
      fat: recipe.nutritionalInfo.fat?.min || 0,
      fiber: recipe.nutritionalInfo.fiber?.min || 0,
      calories: recipe.nutritionalInfo.calories?.min || 0,
      phosphorus: recipe.nutritionalInfo.phosphorus?.min || 0,
      isGeneric
    };
  }
  return null;
}

function enrichRecipeFromIngredients(recipe: any): {
  estimatedProtein: number;
  estimatedFat: number;
  estimatedPhosphorus: 'low' | 'moderate' | 'high';
  healthBenefits: string[];
  allergens: string[];
} {
  const name = recipe.name?.toLowerCase() || '';
  const ingredients = recipe.ingredients
    ?.map((i: any) => (typeof i === 'string' ? i : i.name).toLowerCase())
    .join(' ') || '';

  const allText = `${name} ${ingredients}`;

  // Create variation based on protein source
  let estimatedProtein = 25;
  if (allText.includes('venison')) estimatedProtein = 34; // Leaner, high protein
  else if (allText.includes('rabbit')) estimatedProtein = 33;
  else if (allText.includes('salmon') || allText.includes('fish')) estimatedProtein = 32;
  else if (allText.includes('chicken')) estimatedProtein = 30;
  else if (allText.includes('turkey')) estimatedProtein = 29;
  else if (allText.includes('beef')) estimatedProtein = 28;
  else if (allText.includes('pork')) estimatedProtein = 27;

  // Fat estimation
  let estimatedFat = 15;
  if (allText.includes('salmon') || allText.includes('duck')) estimatedFat = 18;
  else if (allText.includes('lean') || allText.includes('turkey')) estimatedFat = 10;
  else if (allText.includes('pork') || allText.includes('lamb')) estimatedFat = 16;

  // Phosphorus estimation
  let estimatedPhosphorus: 'low' | 'moderate' | 'high' = 'moderate';
  if (allText.includes('liver') || allText.includes('kidney') || allText.includes('organ')) {
    estimatedPhosphorus = 'high';
  } else if (allText.includes('egg whites') || allText.includes('rice')) {
    estimatedPhosphorus = 'low';
  }

  // Auto-detect Health benefits if tags are missing
  const healthBenefits: string[] = [];
  if (allText.includes('salmon') || allText.includes('fish oil') || allText.includes('flaxseed')) {
    healthBenefits.push('joint-health', 'skin-conditions');
  }
  if (allText.includes('pumpkin') || allText.includes('rice')) {
    healthBenefits.push('digestive-issues');
  }
  if (allText.includes('lean') || allText.includes('turkey') || allText.includes('white fish')) {
    healthBenefits.push('weight-management', 'pancreatitis');
  }
  if (allText.includes('liver') || allText.includes('organ')) {
    // Often good for general vitality but bad for kidney
    healthBenefits.push('recovery');
  }

  // Allergens
  const allergens: string[] = [];
  if (allText.includes('chicken')) allergens.push('chicken');
  if (allText.includes('beef')) allergens.push('beef');
  if (allText.includes('dairy') || allText.includes('milk')) allergens.push('dairy');
  if (allText.includes('wheat') || allText.includes('grain')) allergens.push('grain');
  if (allText.includes('egg')) allergens.push('egg');

  return {
    estimatedProtein,
    estimatedFat,
    estimatedPhosphorus,
    healthBenefits,
    allergens
  };
}

// Enhanced nutrition calculation using real USDA data
function calculateRecipeNutrition(recipe: any): {
  protein: number;
  fat: number;
  calcium: number;
  phosphorus: number;
  calories: number;
  omega3?: number;
  vitaminA?: number;
  vitaminC?: number;
  source: 'real' | 'estimated';
} {
  const ingredients = recipe.ingredients || [];
  let totalProtein = 0;
  let totalFat = 0;
  let totalCalcium = 0;
  let totalPhosphorus = 0;
  let totalCalories = 0;
  let totalOmega3 = 0;
  let totalVitaminA = 0;
  let totalVitaminC = 0;
  let totalWeight = 0;

  // Try to get real nutritional data
  for (const ingredient of ingredients) {
    const name = typeof ingredient === 'string' ? ingredient : ingredient.name;
    const amount = typeof ingredient === 'string' ? 100 : (ingredient.amount || 100); // Assume 100g if not specified

    const composition = getIngredientComposition(name);
    if (composition) {
      totalProtein += (composition.protein || 0) * (amount / 100);
      totalFat += (composition.fat || 0) * (amount / 100);
      totalCalcium += (composition.calcium || 0) * (amount / 100);
      totalPhosphorus += (composition.phosphorus || 0) * (amount / 100);
      totalCalories += (composition.kcal || 0) * (amount / 100);
      totalOmega3 += (composition.omega3 || 0) * (amount / 100);
      totalVitaminA += (composition.vitaminA || 0) * (amount / 100);
      totalVitaminC += (composition.vitaminC || 0) * (amount / 100);
      totalWeight += amount;
    }
  }

  // If we have real data for at least 50% of ingredients, use it
  const realDataRatio = totalWeight / (ingredients.length * 100);
  if (realDataRatio >= 0.5) {
    return {
      protein: totalProtein / totalWeight * 100,
      fat: totalFat / totalWeight * 100,
      calcium: totalCalcium / totalWeight * 100,
      phosphorus: totalPhosphorus / totalWeight * 100,
      calories: totalCalories / totalWeight * 100,
      omega3: totalOmega3 > 0 ? totalOmega3 / totalWeight * 100 : undefined,
      vitaminA: totalVitaminA > 0 ? totalVitaminA / totalWeight * 100 : undefined,
      vitaminC: totalVitaminC > 0 ? totalVitaminC / totalWeight * 100 : undefined,
      source: 'real'
    };
  }

  // Fall back to estimated values
  const enriched = enrichRecipeFromIngredients(recipe);
  return {
    protein: enriched.estimatedProtein,
    fat: enriched.estimatedFat,
    calcium: 0.8, // Estimated
    phosphorus: enriched.estimatedPhosphorus === 'high' ? 0.8 : enriched.estimatedPhosphorus === 'low' ? 0.3 : 0.5,
    calories: 150, // Estimated
    source: 'estimated'
  };
}

// Species-specific compatibility scoring
function calculateAvianCompatibility(recipe: any, pet: Pet): number {
  const standards = getAvianStandards(pet.breed) || AVIAN_NUTRITION_STANDARDS.psittacines;
  const nutrition = calculateRecipeNutrition(recipe);

  let score = 100;

  // Check Ca:P ratio (most critical for birds)
  const caPRatio = nutrition.calcium / nutrition.phosphorus;
  const caPMin = standards.CaP_ratio?.min || 1.5;
  const caPMax = standards.CaP_ratio?.max || 2.5;
  const caPIdeal = (standards.CaP_ratio as any)?.ideal || 2.0;

  if (caPRatio < caPMin || caPRatio > caPMax) {
    score -= 40; // Major penalty for improper ratio
  } else if (Math.abs(caPRatio - caPIdeal) < 0.5) {
    score += 10; // Bonus for ideal ratio
  }

  // Check protein levels
  const proteinMin = standards.protein?.min || 12;
  const proteinMax = standards.protein?.max || 18;
  if (nutrition.protein < proteinMin || nutrition.protein > proteinMax) {
    score -= 20;
  }

  // Check fat levels
  const fatMin = standards.fat?.min || 4;
  const fatMax = standards.fat?.max || 10;
  if (nutrition.fat < fatMin || nutrition.fat > fatMax) {
    score -= 15;
  }

  return Math.max(0, Math.min(100, score));
}

function calculateReptileCompatibility(recipe: any, pet: Pet): number {
  const standards = getReptileStandards(pet.breed);
  if (!standards) return 75; // Default score if species not found

  const nutrition = calculateRecipeNutrition(recipe);
  let score = 100;

  // Check Ca:P ratio (critical for reptiles)
  const caPRatio = nutrition.calcium / nutrition.phosphorus;
  if (caPRatio < standards.CaP_ratio.min || caPRatio > standards.CaP_ratio.max) {
    score -= 50; // Severe penalty for improper ratio
  } else if (Math.abs(caPRatio - standards.CaP_ratio.ideal) < 0.5) {
    score += 15; // Bonus for ideal ratio
  }

  // Check calcium levels
  if (nutrition.calcium < standards.calcium.min) {
    score -= 30;
  }

  // Check protein levels
  if (nutrition.protein < standards.protein.min || nutrition.protein > standards.protein.max) {
    score -= 20;
  }

  return Math.max(0, Math.min(100, score));
}

function calculateSpeciesSpecificScore(recipe: any, pet: Pet): number {
  switch (pet.type) {
    case 'bird':
      return calculateAvianCompatibility(recipe, pet);
    case 'reptile':
      return calculateReptileCompatibility(recipe, pet);
    case 'dog':
    case 'cat':
      // Use AAFCO validation for mammals
      const lifeStage = pet.age < 1 ? 'growth' : 'adult';
      const validation = validateCriticalNutrients(recipe, pet.type as 'dog' | 'cat', lifeStage);
      return validation.isValid ? 95 : Math.max(60, 95 - (validation.violations.length * 15));
    default:
      return 85; // Default score for pocket pets
  }
}

interface RatingFactor {
  score: number;
  weight: number;
  reason: string;
}

export interface CompatibilityRating {
  overallScore: number;
  compatibility: 'excellent' | 'good' | 'fair' | 'poor';
  breakdown: Record<string, RatingFactor>;
  warnings: string[];
  strengths: string[];
  recommendations: string[];
}

// Helper to normalize health concern keys
function normalizeHealthConcernKey(concern: string): string {
  const normalized = concern.toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  // Map variations to standard keys
  const mapping: Record<string, string> = {
    'pancreatitis': 'pancreatitis',
    'pancreatic': 'pancreatitis',
    'heart-disease': 'heart-disease',
    'heart disease': 'heart-disease',
    'heart': 'heart-disease',
    'diabetes': 'diabetes',
    'diabetic': 'diabetes',
    'skin-conditions': 'skin-conditions',
    'skin conditions': 'skin-conditions',
    'skin condition': 'skin-conditions',
    'skin-coat': 'skin-conditions',
    'allergies': 'allergies',
    'allergy': 'allergies',
    'skin-issues': 'allergies',
    'skin issues': 'allergies',
    'kidney-disease': 'kidney-disease',
    'kidney disease': 'kidney-disease',
    'kidney': 'kidney-disease',
    'digestive-issues': 'digestive-issues',
    'digestive issues': 'digestive-issues',
    'digestive': 'digestive-issues',
    'joint-health': 'joint-health',
    'joint health': 'joint-health',
    'arthritis': 'joint-health',
    'joint pain': 'joint-health',
    'weight-management': 'weight-management',
    'weight management': 'weight-management',
    'obesity': 'weight-management',
    'dental-issues': 'dental-issues',
    'dental issues': 'dental-issues',
    'dental': 'dental-issues'
  };
  
  return mapping[normalized] || normalized;
}

const HEALTH_CONCERNS: Record<string, { maxPhosphorus?: number; maxFat?: number; maxProtein?: number; minProtein?: number; restrictions: string[]; requires?: string[] }> = {
  'kidney-disease': { maxPhosphorus: 200, restrictions: ['liver', 'kidney', 'organ'], requires: ['low-phosphorus', 'high-quality-protein'] },
  'pancreatitis': { maxFat: 12, restrictions: ['high-fat', 'pork', 'lamb', 'duck', 'fried', 'greasy'], requires: ['low-fat', 'easily-digestible'] },
  'obesity': { maxFat: 12, maxProtein: 30, restrictions: ['high-calorie', 'treats'], requires: ['low-calorie', 'high-fiber'] },
  'digestive-issues': { restrictions: ['spicy', 'raw', 'high-fiber', 'dairy'], requires: ['easily-digestible', 'bland'] },
  'allergies': { restrictions: ['chicken', 'beef', 'dairy', 'wheat', 'corn', 'soy', 'eggs'], requires: ['novel-protein', 'hypoallergenic'] },
  'joint-health': { restrictions: [], requires: ['omega-3', 'glucosamine', 'chondroitin'] },
  'skin-conditions': { restrictions: ['artificial-colors', 'preservatives'], requires: ['omega-3', 'quality-protein', 'vitamin-e'] },
  'heart-disease': { maxFat: 15, restrictions: ['high-sodium', 'processed'], requires: ['taurine', 'omega-3', 'low-sodium'] },
  'diabetes': { maxFat: 15, restrictions: ['high-sugar', 'simple-carbs', 'corn-syrup'], requires: ['complex-carbs', 'high-fiber', 'low-glycemic'] }
};

/**
 * Calculates compatibility rating between a recipe and a pet profile.
 * 
 * @param recipe - Recipe object from recipes-complete.ts
 * @param pet - Pet profile with type, age, weight, health concerns, etc.
 * @returns CompatibilityRating with overall score (0-100), breakdown, warnings, and recommendations
 * 
 * @example
 * ```ts
 * const rating = rateRecipeForPet(recipe, pet);
 * console.log(rating.overallScore); // 85
 * console.log(rating.compatibility); // 'excellent'
 * ```
 * 
 * @contract
 * - Input: Recipe from lib/data/recipes-complete.ts, Pet from localStorage/backend
 * - Output: CompatibilityRating with standardized structure
 * - Side effects: None (pure function)
 * - Migration: Compatible with Firebase/Supabase (receives Pet object, not storage)
 */
export function rateRecipeForPet(recipe: any, pet: Pet): CompatibilityRating {
  // Normalize array-like fields to avoid runtime errors
  const safePet: Pet = {
    ...pet,
    dietaryRestrictions: Array.isArray((pet as any).dietaryRestrictions) ? (pet as any).dietaryRestrictions : [],
    allergies: Array.isArray(pet.allergies) ? pet.allergies : [],
    healthConcerns: Array.isArray(pet.healthConcerns) ? pet.healthConcerns : [],
    dislikes: Array.isArray((pet as any).dislikes) ? (pet as any).dislikes : [],
  };

  const warnings: string[] = [];
  const strengths: string[] = [];
  const recommendations: string[] = [];

  const nutrition = extractNutrition(recipe);
  const enriched = enrichRecipeFromIngredients(recipe);
  const realNutrition = calculateRecipeNutrition(recipe);

  // 1. Pet Type Match (20%)
  const petTypeMatch = (recipe.category === safePet.type || recipe.category === `${safePet.type}s`) ? 100 : 0;

  // 2. Age Appropriate (15%)
  const petAgeGroup = safePet.age < 1 ? 'baby' : safePet.age < 2 ? 'young' : safePet.age < 7 ? 'adult' : 'senior';
  const ageMatch = (recipe.ageGroup || []).includes(petAgeGroup) || (recipe.ageGroup || []).includes('all');
  const ageScore = ageMatch ? 100 : 70;

  // 3. Species-Specific Nutritional Fit (30%)
  const speciesScore = calculateSpeciesSpecificScore(recipe, safePet);

  // 4. Health Compatibility (25%)
  let healthScore = 90;

  // Use recipe tags if available, otherwise fallback to ingredient inference
  const effectiveHealthTags = (recipe.healthConcerns && recipe.healthConcerns.length > 0)
    ? recipe.healthConcerns
    : enriched.healthBenefits;

  if (safePet.healthConcerns.length > 0) {
    healthScore = 70; // Start lower

    for (const concern of safePet.healthConcerns) {
      // Bonus for matching benefits
      if (effectiveHealthTags.some((tag: string) => tag.includes(concern) || concern.includes(tag))) {
        healthScore += 20;
        strengths.push(`Great for ${concern}`);
      }

      // Penalties for contradictions
      const normalizedConcern = normalizeHealthConcernKey(concern);
      const rules = HEALTH_CONCERNS[normalizedConcern];
      if (rules) {
        // Check Fat cap
        const fatVal = (nutrition && !nutrition.isGeneric) ? nutrition.fat : enriched.estimatedFat;
        if (rules.maxFat && fatVal > rules.maxFat) {
          healthScore -= 25;
          warnings.push(`Fat content slightly high for ${concern}`);
        }

        // Check ingredient restrictions
        const hasRestricted = rules.restrictions.some(r => enriched.allergens.includes(r));
        if (hasRestricted) {
           healthScore -= 30;
        }
      }
    }
  }

  // 5. Allergen Safety (10%)
  let allergenScore = 100;
  const allRestrictions = [...(safePet.dietaryRestrictions || []), ...(safePet.healthConcerns?.includes('allergies') ? safePet.allergies || [] : [])];

  for (const restriction of allRestrictions) {
    const rLower = restriction.toLowerCase();
    // Check against inferred allergens from ingredients
    if (enriched.allergens.some(a => rLower.includes(a) || a.includes(rLower))) {
      allergenScore = 0;
      warnings.push(`Contains ${restriction}`);
    }
  }

  // 6. Picky Eater Check (5% penalty for disliked ingredients)
  let pickyEaterPenalty = 0;
  if (pet.dislikes && pet.dislikes.length > 0) {
    for (const dislike of pet.dislikes) {
      const dLower = dislike.toLowerCase();
      // Check if recipe contains disliked ingredients
      if (enriched.allergens.some(a => dLower.includes(a) || a.includes(dLower))) {
        pickyEaterPenalty = 5; // Small penalty
        warnings.push(`Contains ${dislike} (pet may not like)`);
        break; // Only penalize once
      }
    }
  }

  // Calculate Overall
  const overallScore = Math.max(0, Math.min(100, Math.round(
    (petTypeMatch * 0.20) +
    (ageScore * 0.15) +
    (speciesScore * 0.30) +
    (healthScore * 0.25) +
    (allergenScore * 0.10)
  ) - pickyEaterPenalty));

  let compatibility: 'excellent' | 'good' | 'fair' | 'poor';
  if (overallScore >= 85) compatibility = 'excellent';
  else if (overallScore >= 70) compatibility = 'good';
  else if (overallScore >= 50) compatibility = 'fair';
  else compatibility = 'poor';

  return {
    overallScore,
    compatibility,
    breakdown: {
      petTypeMatch: {
        score: petTypeMatch,
        weight: 25,
        reason: petTypeMatch === 100
          ? `Recipe is specifically designed for ${pet.type}s`
          : `Recipe is designed for ${recipe.category}, but your pet is a ${pet.type}`
      },
      ageAppropriate: {
        score: ageScore,
        weight: 15,
        reason: ageMatch
          ? `Recipe is suitable for ${petAgeGroup} ${pet.type}s`
          : `Recipe is designed for ${recipe.ageGroup?.join(', ') || 'different age groups'}, but your pet is ${petAgeGroup}`
      },
      nutritionalFit: {
        score: speciesScore,
        weight: 30,
        reason: realNutrition.source === 'real'
          ? `Recipe uses real USDA nutritional data and meets ${pet.type} nutritional standards`
          : `Recipe meets estimated nutritional requirements for ${pet.type}s`
      },
      healthCompatibility: {
        score: healthScore,
        weight: 25,
        reason: pet.healthConcerns.length === 0
          ? 'No specific health concerns to evaluate'
          : `${effectiveHealthTags.length > 0 ? 'Recipe contains ingredients beneficial for' : 'Recipe may not address'} your pet's health concerns: ${pet.healthConcerns.join(', ')}`
      },
      allergenSafety: {
        score: allergenScore,
        weight: 10,
        reason: allRestrictions.length === 0
          ? 'No dietary restrictions or allergies specified'
          : allergenScore === 100
            ? 'Recipe avoids all known allergens and restrictions'
            : `Recipe contains ingredients that may conflict with restrictions: ${allRestrictions.join(', ')}`
      }
    },
    warnings,
    strengths,
    recommendations
  };
}

// Utility functions for pet profile management
export function savePetProfile(pet: Pet): void {
  if (typeof window === 'undefined') return;

  const pets = getUserPets();
  const existingIndex = pets.findIndex(p => p.id === pet.id);

  if (existingIndex >= 0) {
    pets[existingIndex] = pet;
  } else {
    pets.push(pet);
  }

  localStorage.setItem('userPets', JSON.stringify(pets));
}

export function getUserPets(): Pet[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem('userPets');
  return stored ? JSON.parse(stored) : [];
}

export function deletePetProfile(petId: string): void {
  if (typeof window === 'undefined') return;

  const pets = getUserPets().filter(p => p.id !== petId);
  localStorage.setItem('userPets', JSON.stringify(pets));
}

export const healthConcernOptions = [
  { value: 'kidney-disease', label: 'Kidney Disease' },
  { value: 'heart-disease', label: 'Heart Disease' },
  { value: 'diabetes', label: 'Diabetes' },
  { value: 'allergies', label: 'Food Allergies' },
  { value: 'obesity', label: 'Weight Management/Obesity' },
  { value: 'pancreatitis', label: 'Pancreatitis' },
  { value: 'digestive-issues', label: 'Digestive Issues' },
  { value: 'joint-health', label: 'Joint Problems/Arthritis' },
  { value: 'dental-issues', label: 'Dental Issues' },
  { value: 'hip-dysplasia', label: 'Hip Dysplasia' },
  { value: 'skin-conditions', label: 'Skin Conditions' }
];

export const dietaryRestrictionOptions = [
  { value: 'grain-free', label: 'Grain-Free' },
  { value: 'no-chicken', label: 'No Chicken' },
  { value: 'no-beef', label: 'No Beef' },
  { value: 'no-dairy', label: 'No Dairy' },
  { value: 'low-sodium', label: 'Low Sodium' },
  { value: 'low-phosphorus', label: 'Low Phosphorus' },
  { value: 'low-fat', label: 'Low Fat' },
  { value: 'soft-food', label: 'Soft Food Only' },
  { value: 'hypoallergenic', label: 'Hypoallergenic' }
];

export const activityLevels = [
  {
    value: 'sedentary' as const,
    label: 'Sedentary',
    description: 'Mostly inactive, minimal exercise'
  },
  {
    value: 'moderate' as const,
    label: 'Moderate',
    description: 'Regular walks, some playtime'
  },
  {
    value: 'active' as const,
    label: 'Active',
    description: 'Daily exercise, lots of playtime'
  },
  {
    value: 'very-active' as const,
    label: 'Very Active',
    description: 'Working dog, intensive daily exercise'
  }
];