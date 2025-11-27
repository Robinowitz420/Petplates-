// lib/utils/petRatingSystem.ts
import type { Recipe as BaseRecipe } from '@/lib/types';

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

export interface CompatibilityRating {
  overallScore: number;
  compatibility: 'excellent' | 'good' | 'fair' | 'poor';
  breakdown: any;
  warnings: string[];
  strengths: string[];
  recommendations: string[];
}

const HEALTH_CONCERNS: Record<string, { maxPhosphorus?: number; maxFat?: number; restrictions: string[] }> = {
  'kidney-disease': { maxPhosphorus: 200, restrictions: ['liver', 'kidney', 'organ'] },
  'pancreatitis': { maxFat: 12, restrictions: ['high-fat', 'pork', 'lamb', 'duck'] },
  'obesity': { maxFat: 12, restrictions: [] },
  'digestive-issues': { restrictions: ['spicy', 'raw'] },
  'allergies': { restrictions: ['chicken', 'beef', 'dairy', 'wheat', 'corn', 'soy'] },
  'joint-health': { restrictions: [] },
  'skin-conditions': { restrictions: [] }
};

export function rateRecipeForPet(recipe: any, pet: Pet): CompatibilityRating {
  const warnings: string[] = [];
  const strengths: string[] = [];
  const recommendations: string[] = [];

  const nutrition = extractNutrition(recipe);
  const enriched = enrichRecipeFromIngredients(recipe);

  // 1. Pet Type Match (25%)
  const petTypeMatch = (recipe.category === pet.type || recipe.category === `${pet.type}s`) ? 100 : 0;

  // 2. Age Appropriate (15%)
  const petAgeGroup = pet.age < 1 ? 'baby' : pet.age < 2 ? 'young' : pet.age < 7 ? 'adult' : 'senior';
  const ageMatch = (recipe.ageGroup || []).includes(petAgeGroup) || (recipe.ageGroup || []).includes('all');
  const ageScore = ageMatch ? 100 : 70;

  // 3. Nutritional Fit (25%)
  let nutritionScore = 85;

  // Use Estimated values if the data is generic/placeholder
  const proteinVal = (nutrition && !nutrition.isGeneric) ? nutrition.protein : enriched.estimatedProtein;
  const idealProtein = pet.type === 'cat' ? 35 : 28;
  const proteinDiff = Math.abs(proteinVal - idealProtein);
  nutritionScore -= (proteinDiff * 2); // Steeper penalty creates more score separation

  // 4. Health Compatibility (25%)
  let healthScore = 90;

  // Use recipe tags if available, otherwise fallback to ingredient inference
  const effectiveHealthTags = (recipe.healthConcerns && recipe.healthConcerns.length > 0)
    ? recipe.healthConcerns
    : enriched.healthBenefits;

  if (pet.healthConcerns.length > 0) {
    healthScore = 70; // Start lower

    for (const concern of pet.healthConcerns) {
      // Bonus for matching benefits
      if (effectiveHealthTags.some((tag: string) => tag.includes(concern) || concern.includes(tag))) {
        healthScore += 20;
        strengths.push(`Great for ${concern}`);
      }

      // Penalties for contradictions
      const rules = HEALTH_CONCERNS[concern];
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
  const allRestrictions = [...pet.dietaryRestrictions, ...(pet.healthConcerns.includes('allergies') ? pet.allergies || [] : [])];

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
    (petTypeMatch * 0.25) +
    (ageScore * 0.15) +
    (nutritionScore * 0.25) +
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
        score: nutritionScore,
        weight: 25,
        reason: `Protein content (${proteinVal}%) ${proteinDiff <= 5 ? 'matches' : proteinDiff <= 10 ? 'is close to' : 'differs from'} ideal levels for ${pet.type}s (${idealProtein}%)`
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