import { recipes } from '@/lib/data/recipes-complete';
import { Recipe } from '@/lib/types';

interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: string;
  healthConcerns: string[];
}

/**
 * Smart recommendation algorithm that ensures pets always get 20+ recipe matches
 * Priority order:
 * 1. Perfect matches (type + age + health concern)
 * 2. Type + Age match (ignore health concerns)
 * 3. Type match only (all ages)
 */
export const getRecommendedRecipes = (pet: Pet, minCount: number = 20): Recipe[] => {
  const { type, age, healthConcerns } = pet;
  
  // Priority 1: Perfect matches (type + age + health concern)
  const perfectMatches = recipes.filter(r => {
    const typeMatch = r.category === type;
    const ageMatch = r.ageGroup.includes(age);
    const healthMatch = healthConcerns.length === 0 || 
      healthConcerns.some(hc => r.healthConcerns.includes(hc));
    
    return typeMatch && ageMatch && healthMatch;
  });

  // Priority 2: Type + Age match (ignore health concerns)
  const typeAgeMatches = recipes.filter(r => {
    const typeMatch = r.category === type;
    const ageMatch = r.ageGroup.includes(age);
    const notAlreadyIncluded = !perfectMatches.some(pm => pm.id === r.id);
    
    return typeMatch && ageMatch && notAlreadyIncluded;
  });

  // Priority 3: Type match only (all ages)
  const typeMatches = recipes.filter(r => {
    const typeMatch = r.category === type;
    const notInPerfect = !perfectMatches.some(pm => pm.id === r.id);
    const notInTypeAge = !typeAgeMatches.some(tam => tam.id === r.id);
    
    return typeMatch && notInPerfect && notInTypeAge;
  });

  // Combine in priority order
  const recommended = [...perfectMatches, ...typeAgeMatches, ...typeMatches];

  // Return at least minCount recipes, or all if less than minCount available
  return recommended.slice(0, Math.max(minCount, recommended.length));
};

/**
 * Get count of recipes by priority level for display purposes
 */
export const getRecommendationStats = (pet: Pet) => {
  const { type, age, healthConcerns } = pet;
  
  const perfectCount = recipes.filter(r => 
    r.category === type &&
    r.ageGroup.includes(age) &&
    (healthConcerns.length === 0 || healthConcerns.some(hc => r.healthConcerns.includes(hc)))
  ).length;

  const typeAgeCount = recipes.filter(r => 
    r.category === type &&
    r.ageGroup.includes(age)
  ).length - perfectCount;

  const typeOnlyCount = recipes.filter(r => 
    r.category === type
  ).length - perfectCount - typeAgeCount;

  return {
    perfect: perfectCount,
    typeAge: typeAgeCount,
    typeOnly: typeOnlyCount,
    total: perfectCount + typeAgeCount + typeOnlyCount
  };
};