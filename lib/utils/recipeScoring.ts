// lib/utils/recipeScoring.ts
// Scoring system that ranks recipes 0-100 based on pet profile matching

import type { Recipe } from '@/lib/types';

export interface Pet {
  species: 'dogs' | 'cats' | 'birds' | 'reptiles' | 'pocket-pets';
  breed: string;
  ageGroup: 'baby' | 'young' | 'adult' | 'senior';
  weightStatus?: 'overweight' | 'underweight' | 'ideal';
  healthConcerns: string[];
  savedRecipes?: string[];
  names?: string[];
  weightKg?: number;
  weight?: number | string;
  dietaryRestrictions?: string[];
  allergies?: string[];
  dislikes?: string[];
}

export interface ScoreResult {
  compatibilityScore: number; // 0-100 (formerly matchScore)
  matchScore: number; // 0-100 (deprecated - use compatibilityScore)
  stars: number; // 1-5
  reasoning: {
    goodMatches: string[];
    conflicts: string[];
  };
}

// Common allergens to check
const ALLERGEN_KEYWORDS: Record<string, string[]> = {
  chicken: ['chicken', 'poultry', 'hen'],
  beef: ['beef', 'cow'],
  dairy: ['dairy', 'milk', 'cheese', 'yogurt'],
  grain: ['wheat', 'grain', 'corn', 'barley', 'oats'],
  egg: ['egg'],
};

function hasAllergen(recipe: Recipe, allergen: string): boolean {
  const keywords = ALLERGEN_KEYWORDS[allergen.toLowerCase()] || [allergen.toLowerCase()];
  const allText = `${recipe.name} ${recipe.description} ${recipe.ingredients.map(i => i.name).join(' ')}`.toLowerCase();
  return keywords.some(kw => allText.includes(kw));
}

function isLowCalorie(recipe: Recipe): boolean {
  const name = recipe.name.toLowerCase();
  const desc = (recipe.description || '').toLowerCase();
  return name.includes('low-fat') || name.includes('lean') || name.includes('slim') ||
         desc.includes('low-calorie') || desc.includes('weight') || desc.includes('diet');
}

function isInAAFCORange(recipe: Recipe, species: 'dogs' | 'cats'): boolean {
  if (!recipe.nutritionalInfo) return false;
  
  const protein = recipe.nutritionalInfo.protein?.min || 0;
  const fat = recipe.nutritionalInfo.fat?.min || 0;
  
  if (species === 'dogs') {
    return protein >= 18 && protein <= 30 && fat >= 5 && fat <= 20;
  } else { // cats
    return protein >= 26 && protein <= 40 && fat >= 9 && fat <= 25;
  }
}

export function scoreRecipe(recipe: Recipe, pet: Pet): ScoreResult {
  let score = 0;
  const goodMatches: string[] = [];
  const conflicts: string[] = [];

  // 1. Species Match (Required Gate - 0 if wrong species)
  if (recipe.category !== pet.species) {
    return {
      compatibilityScore: 0,
      matchScore: 0,
      stars: 1,
      reasoning: {
        goodMatches: [],
        conflicts: [`Recipe is for ${recipe.category}, but pet is ${pet.species}`]
      }
    };
  }

  // 2. Age Group Match (+20)
  if (recipe.ageGroup.includes(pet.ageGroup)) {
    score += 20;
    goodMatches.push('Age group match');
  } else {
    conflicts.push('Age group mismatch');
  }

  // 3. Breed Relevance (+10)
  if (recipe.breed) {
    const breeds = Array.isArray(recipe.breed) ? recipe.breed : [recipe.breed];
    const breedMatch = breeds.some(b =>
      b && b.toLowerCase().replace(/-/g, ' ') === pet.breed.toLowerCase().replace(/-/g, ' ')
    );
    if (breedMatch) {
      score += 10;
      goodMatches.push('Breed-specific recipe');
    }
  }

  // 4. Health Concern Overlap (+10 per match, max +40)
  if (pet.healthConcerns.length > 0 && recipe.healthConcerns.length > 0) {
    const matches = pet.healthConcerns.filter(hc => 
      recipe.healthConcerns.some(rc => 
        rc.toLowerCase().includes(hc.toLowerCase()) || 
        hc.toLowerCase().includes(rc.toLowerCase())
      )
    );
    const healthScore = Math.min(matches.length * 10, 40);
    score += healthScore;
    if (matches.length > 0) {
      goodMatches.push(`${matches.length} health concern${matches.length > 1 ? 's' : ''} addressed`);
    }
  }

  // 5. Weight Control Fit (+10)
  if (pet.weightStatus === 'overweight' && isLowCalorie(recipe)) {
    score += 10;
    goodMatches.push('Low-calorie option for weight management');
  }

  // 6. Allergy Safety (-40 penalty if allergen present)
  if (pet.healthConcerns.includes('allergies')) {
    const hasAllergy = pet.healthConcerns.some(concern => {
      const allergen = concern.toLowerCase();
      return Object.keys(ALLERGEN_KEYWORDS).some(key => 
        allergen.includes(key) && hasAllergen(recipe, key)
      );
    });
    if (hasAllergy) {
      score = Math.max(0, score - 40);
      conflicts.push('Contains common allergen');
    }
  }

  // 7. Nutrient Fit (+20 if in AAFCO range for dogs/cats)
  if ((pet.species === 'dogs' || pet.species === 'cats') && isInAAFCORange(recipe, pet.species)) {
    score += 20;
    goodMatches.push('Meets AAFCO nutritional standards');
  } else if (pet.species === 'dogs' || pet.species === 'cats') {
    // Small penalty if not in range
    score = Math.max(0, score - 5);
  }

  // Cap at 100
  score = Math.min(100, Math.max(0, score));

  // Map to stars
  let stars: number;
  if (score >= 90) stars = 5;
  else if (score >= 75) stars = 4;
  else if (score >= 50) stars = 3;
  else if (score >= 25) stars = 2;
  else stars = 1;

  return {
    compatibilityScore: score,
    matchScore: score, // Keep for backward compatibility
    stars,
    reasoning: {
      goodMatches,
      conflicts
    }
  };
}

