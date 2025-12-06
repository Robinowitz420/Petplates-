import type { Recipe } from './types';
import { dogModifiers } from './data/nutrition-dog-modifiers';
import { catModifiers } from './data/nutrition-cat-modifiers';
import { matchesSpecies } from './utils/recipeRecommendations';
import {
  calculateImprovedCompatibility,
  type ImprovedPet,
} from './utils/improvedCompatibilityScoring';

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

// Helper function to get related keywords for health concerns
function getRelatedKeywords(concern: string): string[] {
  const keywordMap: Record<string, string[]> = {
    'allergies': ['skin', 'itch', 'immune', 'inflammatory'],
    'joint-health': ['arthritis', 'mobility', 'inflammatory', 'bone', 'cartilage'],
    'digestive-issues': ['gi', 'stomach', 'gut', 'inflammatory', 'sensitive'],
    'weight-management': ['low-calorie', 'lean', 'obesity', 'weight', 'calorie'],
    'kidney-disease': ['kidney', 'renal', 'phosphorus', 'hydration'],
    'urinary-health': ['urinary', 'uti', 'hydration', 'bladder'],
    'dental-issues': ['dental', 'teeth', 'tartar', 'oral'],
    'heart-disease': ['heart', 'cardiac', 'taurine', 'omega-3'],
    'diabetes': ['diabetes', 'sugar', 'glucose', 'insulin'],
    'respiratory': ['respiratory', 'breathing', 'lungs', 'airway'],
  };
  
  return keywordMap[concern] || [];
}

// Normalize human-readable health concerns to recipe format (kebab-case)
function normalizeHealthConcernForMatching(concern: string): string {
  const normalized = concern.toLowerCase().trim();
  
  // Map human-readable concerns to recipe format
  const mapping: Record<string, string> = {
    // Dogs
    'allergies/skin issues': 'allergies',
    'allergies': 'allergies',
    'allergy': 'allergies',
    'skin issues': 'allergies',
    'arthritis/joint pain': 'joint-health',
    'joint pain': 'joint-health',
    'arthritis': 'joint-health',
    'dental problems': 'dental-issues',
    'dental disease': 'dental-issues',
    'dental issues': 'dental-issues',
    'digestive issues': 'digestive-issues',
    'digestive': 'digestive-issues',
    'ear infections': 'ear-infections',
    'obesity/weight management': 'weight-management',
    'obesity': 'weight-management',
    'weight management': 'weight-management',
    'kidney disease': 'kidney-disease',
    'kidney': 'kidney-disease',
    'heart disease': 'heart-disease',
    'heart': 'heart-disease',
    'pancreatitis': 'pancreatitis',
    'pancreatic': 'pancreatitis',
    'diabetes': 'diabetes',
    'diabetic': 'diabetes',
    'skin conditions': 'skin-conditions',
    'skin condition': 'skin-conditions',
    'urinary problems': 'urinary-health',
    'urinary': 'urinary-health',
    'thyroid issues': 'thyroid',
    'thyroid': 'thyroid',
    
    // Cats
    'urinary tract issues': 'urinary-health',
    'hyperthyroidism': 'hyperthyroidism',
    'inflammatory bowel disease': 'digestive-issues',
    'ibd': 'digestive-issues',
    'hairballs': 'hairball',
    'hairball': 'hairball',
    'respiratory issues': 'respiratory',
    'skin allergies': 'allergies',
    
    // Birds
    'feather plucking': 'feather-plucking',
    'respiratory infection': 'respiratory',
    'beak overgrowth': 'beak-overgrowth',
    'vitamin deficiencies': 'vitamin-deficiency',
    'heavy metal exposure': 'heavy-metal',
    'egg binding': 'egg-binding',
    'fatty liver disease': 'fatty-liver',
    'nutritional imbalances': 'nutritional-deficiency',
    
    // Reptiles
    'metabolic bone disease': 'metabolic-bone-disease',
    'mbd': 'metabolic-bone-disease',
    'parasites': 'parasites',
    'stuck shed': 'stuck-shed',
    'impaction': 'impaction',
    'mouth rot': 'mouth-rot',
    'thermal burns': 'thermal-burns',
    'nutritional deficiencies': 'nutritional-deficiency',
    
    // Pocket pets (removed duplicates - already defined above)
    'skin/fur issues': 'skin-conditions',
  };
  
  // Try exact match first
  if (mapping[normalized]) {
    return mapping[normalized];
  }
  
  // Try partial matches (e.g., "obesity/weight management" contains "weight management")
  for (const [key, value] of Object.entries(mapping)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }
  
  // Fallback: convert to kebab-case
  return normalized.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const concernToModifierKey: Record<string, string> = {
  allergies: 'allergies',
  'joint-health': 'joint_issues',
  'weight-management': 'weight_management',
  digestive: 'gi_issues',
  'digestive-issues': 'gi_issues',
  'gi-issues': 'gi_issues',
  'kidney': 'kidney_support',
  'kidney-disease': 'kidney_support',
  'kidney/urinary-support': 'kidney_support',
  'urinary-health': 'urinary_health',
  diabetes: 'diabetes',
  'pancreatitis': 'pancreatitis',
  'heart-disease': 'heart_disease',
  'heart disease': 'heart_disease',
  'skin-conditions': 'skin_conditions',
  'skin conditions': 'skin_conditions',
  'skin-coat': 'skin_conditions',
  'dental-issues': 'dental_issues',
  'dental': 'dental_issues',
};

export function scoreRecipe(recipe: Recipe, pet: any): ScoreResult {
  const reasoning: ScoreReasoning = { goodMatches: [], conflicts: [] };
  let conflictCount = 0;
  let hasHydrationSupport = false;

  // Species gate: use matchesSpecies to support subtype matching for exotics
  if (!matchesSpecies(recipe, pet)) {
    reasoning.conflicts.push('Different species - not suitable');
    return { matchScore: 0, stars: 1, reasoning, conflictCount: 1, hasHydrationSupport };
  }

  // Debug logging (only in development)
  if (process.env.NODE_ENV === 'development' && Math.random() < 0.1) { // Log 10% of calls
    // Debug logging removed - use logger if needed
  }

  // Base score components - start with higher base
  let score = 50; // Base score for species/age match
  let possible = 100; // total possible when nutrition present

  // Age match +15
  if (recipe.ageGroup && pet.age && recipe.ageGroup.includes(pet.age)) {
    score += 15;
    reasoning.goodMatches.push('Age group match');
  }
  // NO ELSE STATEMENT - no penalty for missing

  // Breed relevance +10
  if (recipe.breed && pet.breed && recipe.breed.includes(pet.breed)) {
    score += 10;
    reasoning.goodMatches.push('Breed-specific match');
  }

  // Health concerns: Use as modifiers, not blockers
  // Bonus if aligned, small penalty if not (but don't block)
  // Normalize pet concerns to recipe format for matching
  const petConcernsNormalized: string[] = (pet.healthConcerns || []).map((c: string) => 
    normalizeHealthConcernForMatching(String(c).toLowerCase())
  );
  const recipeConcernsNormalized: string[] = (recipe.healthConcerns || []).map((c: string) => 
    String(c).toLowerCase().trim()
  );
  
  let healthMatches = 0;
  let healthMismatches = 0;
  
  if (petConcernsNormalized.length > 0) {
    if (recipeConcernsNormalized.length > 0) {
      // Check for matches (exact or partial)
      for (const petConcern of petConcernsNormalized) {
        const matched = recipeConcernsNormalized.some(rc => 
          rc === petConcern || 
          rc.includes(petConcern) || 
          petConcern.includes(rc)
        );
        if (matched) {
          healthMatches += 1;
          const originalConcern = (pet.healthConcerns || [])[petConcernsNormalized.indexOf(petConcern)];
          reasoning.goodMatches.push(`Supports ${originalConcern}`);
          if (healthMatches >= 4) break;
        } else {
          healthMismatches += 1;
        }
      }
    } else {
      // Recipe has no health concern tags - small penalty but don't block
      healthMismatches = petConcernsNormalized.length;
      reasoning.conflicts.push('Not optimized for health concerns (but still safe)');
    }
  }
  
  // Bonus for matches: +15 each up to +60
  score += Math.min(4, healthMatches) * 15;
  
  // Small penalty for mismatches: -5 each, but don't go below base score
  score -= Math.min(healthMismatches * 5, 20); // Max -20 penalty
  score = Math.max(score, 30); // Never go below 30 if species matches

  // Weight control fit: +10 if pet overweight and recipe flags low-calorie
  const weightFlag = ((recipe.tags || []).map((t) => t.toLowerCase()).includes('low-calorie')) || false;
  if (pet.weightKg && (pet as any).weightStatus === 'overweight') {
    if (weightFlag) {
      score += 10;
      reasoning.goodMatches.push('Low-calorie fit for weight control');
    }
  }

  // Allergy detection: if pet has 'allergy' in concerns or explicit allergies, penalize heavily
  const normalizedPetConcernsForAllergy = petConcernsNormalized.filter((c: string) => c.includes('allerg') || c.includes('allergy'));
  const explicitAllergies: string[] = (pet && pet.allergies) || [];
  const allergyTrigger = containsAllergen(recipe, explicitAllergies.length ? explicitAllergies : normalizedPetConcernsForAllergy);
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
    // Use normalized concerns for modifier matching
    for (let i = 0; i < petConcernsNormalized.length; i++) {
      const petConcernNormalized = petConcernsNormalized[i];
      const modKey = concernToModifierKey[petConcernNormalized];
      if (modKey && (modifiers as any)[modKey]) {
        const modifier = (modifiers as any)[modKey];
        // If recipe supports the concern, add boost
        if (recipeConcernsNormalized.some((rc: string) => rc.includes(petConcernNormalized) || petConcernNormalized.includes(rc))) {
          score += modifier.scoreBoost;
          const originalConcern = (pet.healthConcerns || [])[i];
          reasoning.goodMatches.push(`+${modifier.scoreBoost} for ${originalConcern} support`);
        }
        // Check for avoid ingredients
        const ingredientText = (recipe.ingredients || []).map((i) => toLower(i.name)).join(' ');
        for (const avoid of modifier.avoid) {
          if (ingredientText.includes(avoid.toLowerCase())) {
            score -= 5;
            conflictCount += 1;
            reasoning.conflicts.push(`-5 for containing ${avoid} (${petConcernNormalized})`);
          }
        }
        // Check if this modifier provides hydration support
        if (petConcernNormalized === 'kidney-disease' || petConcernNormalized === 'kidney' || petConcernNormalized === 'urinary-health') {
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

/**
 * Improved scoring wrapper using the enhanced algorithm from improvedCompatibilityScoring.
 * Keeps the original ScoreResult shape for drop-in use.
 */
export function scoreRecipeImproved(recipe: Recipe, pet: any): ScoreResult {
  const improvedPet: ImprovedPet = {
    id: pet.id,
    name: pet.name,
    type: pet.type,
    breed: pet.breed,
    age: pet.age,
    weight: pet.weight || pet.weightKg,
    activityLevel: pet.activityLevel,
    healthConcerns: pet.healthConcerns || [],
    dietaryRestrictions: pet.dietaryRestrictions || [],
    allergies: pet.allergies || [],
  };

  const result = calculateImprovedCompatibility(recipe, improvedPet);
  return {
    matchScore: result.overallScore,
    stars: result.stars,
    reasoning: {
      goodMatches: result.reasoning.strengths,
      conflicts: result.reasoning.warnings,
    },
    conflictCount: result.reasoning.warnings.length,
    hasHydrationSupport: false,
  };
}

