import type { Recipe } from './types';
import { dogModifiers } from './data/nutrition-dog-modifiers';
import { catModifiers } from './data/nutrition-cat-modifiers';

export interface ScoreReasoning {
  goodMatches: string[];
  conflicts: string[];
}

export interface ScoreResult {
  matchScore: number; // 0-100
  stars: number; // 1-5
  reasoning: ScoreReasoning;
  conflictCount: number; // number of avoid rule conflicts
  hasHydrationSupport: boolean; // for kidney/urinary
}

const commonAllergens = [
  'chicken',
  'beef',
  'pork',
  'fish',
  'soy',
  'dairy',
  'egg',
  'wheat',
  'peanut',
  'lamb',
];

function toLower(s?: string) {
  return (s || '').toLowerCase();
}

function containsAllergen(recipe: Recipe, allergies: string[] = []) {
  const ingredientText = (recipe.ingredients || []).map((i) => toLower(i.name)).join(' ');
  // if user specified allergies explicitly, check those first
  for (const a of allergies) {
    const aLow = toLower(a);
    if (!aLow) continue;
    if (ingredientText.includes(aLow)) return aLow;
    // check substring matches for common names
  }
  // fallback: check against commonAllergens
  for (const allergen of commonAllergens) {
    if (ingredientText.includes(allergen)) return allergen;
  }
  return null;
}

function mapScoreToStars(score: number) {
  if (score >= 90) return 5;
  if (score >= 75) return 4;
  if (score >= 55) return 3;
  if (score >= 30) return 2;
  return 1;
}

const concernToModifierKey: Record<string, string> = {
  allergies: 'allergies',
  'joint-health': 'joint_issues',
  'weight-management': 'weight_management',
  digestive: 'gi_issues',
  'gi-issues': 'gi_issues',
  'kidney': 'kidney_support',
  'kidney/urinary-support': 'kidney_support',
  'urinary-health': 'urinary_health',
  diabetes: 'diabetes',
  'skin-coat': 'allergies', // approximate
};

export function scoreRecipe(recipe: Recipe, pet: any): ScoreResult {
  const reasoning: ScoreReasoning = { goodMatches: [], conflicts: [] };
  let conflictCount = 0;
  let hasHydrationSupport = false;

  // Species gate: exact match required
  if (!recipe.category || recipe.category !== pet.type) {
    reasoning.conflicts.push('Different species - not suitable');
    return { matchScore: 0, stars: 1, reasoning, conflictCount: 1, hasHydrationSupport };
  }

  // Base score components - start with higher base
  let score = 50; // Base score for species/age match
  let possible = 100; // total possible when nutrition present

  // Age match +15
  if (recipe.ageGroup && recipe.ageGroup.includes(pet.age)) {
    score += 15;
    reasoning.goodMatches.push('Age group match');
  } else {
    score -= 10; // Penalty for age mismatch
  }

  // Breed relevance +10
  if (recipe.breed && pet.breed && recipe.breed.includes(pet.breed)) {
    score += 10;
    reasoning.goodMatches.push('Breed-specific match');
  }

  // Health concerns overlap: +15 each up to +60
  const concerns: string[] = (pet.healthConcerns || []).map((c: string) => String(c).toLowerCase());
  let healthMatches = 0;
  if (concerns.length > 0 && recipe.healthConcerns) {
    for (const rc of recipe.healthConcerns) {
      if (concerns.includes(rc.toLowerCase())) {
        healthMatches += 1;
        reasoning.goodMatches.push(`Supports ${rc}`);
        if (healthMatches >= 4) break;
      }
    }
  }
  score += Math.min(4, healthMatches) * 15; // up to +60

  // Weight control fit: +10 if pet overweight and recipe flags low-calorie
  const weightFlag = ((recipe.tags || []).map((t) => t.toLowerCase()).includes('low-calorie')) || false;
  if (pet.weightKg && (pet as any).weightStatus === 'overweight') {
    if (weightFlag) {
      score += 10;
      reasoning.goodMatches.push('Low-calorie fit for weight control');
    }
  }

  // Allergy detection: if pet has 'allergy' in concerns or explicit allergies, penalize heavily
  const allergyConcerns = concerns.filter((c) => c.includes('allerg') || c.includes('allergy') || c.includes('allergies'));
  const explicitAllergies: string[] = (pet && pet.allergies) || [];
  const allergyTrigger = containsAllergen(recipe, explicitAllergies.length ? explicitAllergies : allergyConcerns);
  if (allergyTrigger) {
    reasoning.conflicts.push(`Contains potential allergen: ${allergyTrigger}`);
    conflictCount += 1;
    // allergy override: near-zero
    return { matchScore: 0, stars: 1, reasoning, conflictCount, hasHydrationSupport };
  }

  // Nutrient fit: +15 if nutritional info present and assumed within AAFCO range
  const hasNutrition = !!recipe.nutritionalInfo || !!recipe.nutritionInfo;
  if (hasNutrition) {
    // Simple heuristic: if nutritionalInfo exists, grant full nutrient fit
    score += 15;
    reasoning.goodMatches.push('Nutritional profile fits AAFCO ranges');
  } else {
    // If nutrition missing, lower max possible to 80
    possible = 80;
  }

  // Apply modifiers if applicable
  const modifiers = pet.type === 'dogs' ? dogModifiers : pet.type === 'cats' ? catModifiers : null;
  if (modifiers) {
    const concerns: string[] = (pet.healthConcerns || []).map((c: string) => String(c).toLowerCase());
    const recipeConcerns = (recipe.healthConcerns || []).map((c) => c.toLowerCase());
    for (const concern of concerns) {
      const modKey = concernToModifierKey[concern];
      if (modKey && (modifiers as any)[modKey]) {
        const modifier = (modifiers as any)[modKey];
        // If recipe supports the concern, add boost
        if (recipeConcerns.includes(concern)) {
          score += modifier.scoreBoost;
          reasoning.goodMatches.push(`+${modifier.scoreBoost} for ${concern} support`);
        }
        // Check for avoid ingredients
        const ingredientText = (recipe.ingredients || []).map((i) => toLower(i.name)).join(' ');
        for (const avoid of modifier.avoid) {
          if (ingredientText.includes(avoid.toLowerCase())) {
            score -= 5;
            conflictCount += 1;
            reasoning.conflicts.push(`-5 for containing ${avoid} (${concern})`);
          }
        }
        // Check if this modifier provides hydration support
        if (concern === 'kidney' || concern === 'kidney/urinary-support' || concern === 'urinary-health') {
          hasHydrationSupport = true;
        }
      }
    }
  }

  // Normalize final score to 0..100 given 'possible'
  // But first, ensure negative conflicts do not drop below 0 (we handled allergies above)

  // Cap score to possible (shouldn't exceed)
  if (score > possible) score = possible;
  if (score < 0) score = 0;

  // Map into 0..100 proportionally
  const matchScore = Math.round((score / possible) * 100);
  const stars = mapScoreToStars(matchScore);

  return { matchScore, stars, reasoning, conflictCount, hasHydrationSupport };
}
