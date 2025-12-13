// lib/utils/healthConcernMatching.ts
// Health concern matching system for tiered scoring

export interface HealthConcernBenefits {
  beneficialIngredients: string[];
  avoidIngredients: string[];
  targetMacros?: {
    protein?: 'low' | 'moderate' | 'high';
    fat?: 'low' | 'moderate' | 'high' | 'very-low';
    fiber?: 'low' | 'moderate' | 'high';
    phosphorus?: 'low' | 'moderate' | 'high';
  };
  targetRatios?: {
    caP?: { min: number; max: number };
  };
}

export const HEALTH_CONCERN_BENEFITS: Record<string, HealthConcernBenefits> = {
  'kidney-disease': {
    beneficialIngredients: ['egg-whites', 'white-rice', 'fish-oil', 'low-phosphorus-vegetables', 'sweet-potato'],
    avoidIngredients: ['organ-meats', 'high-phosphorus-foods', 'excess-sodium', 'red-meat'],
    targetMacros: {
      protein: 'low',
      phosphorus: 'low',
      fat: 'moderate',
    },
  },
  'pancreatitis': {
    beneficialIngredients: ['lean-turkey', 'white-fish', 'sweet-potato', 'pumpkin', 'low-fat-protein'],
    avoidIngredients: ['high-fat-meats', 'oils', 'fried-foods', 'fatty-fish', 'pork'],
    targetMacros: {
      fat: 'very-low',
      fiber: 'high',
      protein: 'moderate',
    },
  },
  'allergies': {
    beneficialIngredients: ['novel-proteins', 'fish-oil', 'anti-inflammatory-foods'],
    avoidIngredients: ['common-allergens'], // Will be replaced with pet-specific allergens
    targetMacros: {
      protein: 'moderate',
    },
  },
  'weight-management': {
    beneficialIngredients: ['lean-protein', 'high-fiber-vegetables', 'pumpkin', 'green-beans'],
    avoidIngredients: ['high-calorie-foods', 'excess-fat'],
    targetMacros: {
      fat: 'low',
      fiber: 'high',
      protein: 'moderate',
    },
  },
  'digestive-health': {
    beneficialIngredients: ['pumpkin', 'sweet-potato', 'probiotic-foods', 'fiber-rich-vegetables'],
    avoidIngredients: ['irritating-foods', 'high-fat'],
    targetMacros: {
      fiber: 'high',
      fat: 'moderate',
    },
  },
  'joint-mobility': {
    beneficialIngredients: ['fish-oil', 'omega-3-sources', 'glucosamine-sources', 'anti-inflammatory-foods'],
    avoidIngredients: ['high-purine-foods'],
    targetMacros: {
      fat: 'moderate',
    },
  },
  'skin-coat': {
    beneficialIngredients: ['fish-oil', 'omega-3-sources', 'vitamin-e-sources', 'healthy-fats'],
    avoidIngredients: ['low-quality-fats'],
    targetMacros: {
      fat: 'moderate',
    },
  },
  'dental-health': {
    beneficialIngredients: ['crunchy-vegetables', 'dental-chews', 'raw-bones'],
    avoidIngredients: ['sticky-foods', 'sugary-foods'],
    targetMacros: {},
  },
  'urinary-support': {
    beneficialIngredients: ['moisture-rich-foods', 'low-magnesium-foods', 'cranberry'],
    avoidIngredients: ['high-magnesium-foods', 'excess-minerals'],
    targetMacros: {
      protein: 'moderate',
    },
  },
  'diabetes': {
    beneficialIngredients: ['low-glycemic-vegetables', 'high-fiber-foods', 'lean-protein'],
    avoidIngredients: ['high-sugar-foods', 'simple-carbohydrates'],
    targetMacros: {
      fiber: 'high',
      fat: 'moderate',
      protein: 'moderate',
    },
  },
  'heart-disease': {
    beneficialIngredients: ['omega-3-sources', 'low-sodium-foods', 'lean-protein'],
    avoidIngredients: ['high-sodium-foods', 'excess-fat'],
    targetMacros: {
      fat: 'low',
      protein: 'moderate',
    },
  },
};

/**
 * Normalize health concern name for matching
 */
export function normalizeHealthConcern(concern: string): string {
  return concern
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Get health concern benefits data
 */
export function getHealthConcernBenefits(concern: string): HealthConcernBenefits | null {
  const normalized = normalizeHealthConcern(concern);
  return HEALTH_CONCERN_BENEFITS[normalized] || null;
}

/**
 * Check if an ingredient name matches a beneficial ingredient
 */
export function isBeneficialIngredient(ingredientName: string, beneficialList: string[]): boolean {
  const normalized = ingredientName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return beneficialList.some(beneficial => {
    const normalizedBeneficial = beneficial.toLowerCase().replace(/\s+/g, '-');
    return normalized.includes(normalizedBeneficial) || normalizedBeneficial.includes(normalized);
  });
}

/**
 * Check if an ingredient name matches an avoid ingredient
 */
export function isAvoidIngredient(ingredientName: string, avoidList: string[], petAllergies?: string[]): boolean {
  const normalized = ingredientName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  // Check against avoid list
  const matchesAvoid = avoidList.some(avoid => {
    if (avoid === 'common-allergens' && petAllergies) {
      // Check against pet's specific allergies
      return petAllergies.some(allergy => 
        normalized.includes(allergy.toLowerCase()) || 
        allergy.toLowerCase().includes(normalized)
      );
    }
    const normalizedAvoid = avoid.toLowerCase().replace(/\s+/g, '-');
    return normalized.includes(normalizedAvoid) || normalizedAvoid.includes(normalized);
  });
  
  return matchesAvoid;
}

/**
 * Check macro alignment with target macros
 */
export function checkMacroAlignment(
  nutrition: { protein: number; fat: number; fiber: number; phosphorus?: number },
  targetMacros?: HealthConcernBenefits['targetMacros']
): number {
  if (!targetMacros) return 50; // Neutral if no targets
  
  let alignmentScore = 0;
  let factors = 0;
  
  if (targetMacros.protein) {
    factors++;
    if (targetMacros.protein === 'low' && nutrition.protein < 20) alignmentScore += 30;
    else if (targetMacros.protein === 'moderate' && nutrition.protein >= 20 && nutrition.protein <= 30) alignmentScore += 30;
    else if (targetMacros.protein === 'high' && nutrition.protein > 30) alignmentScore += 30;
    else alignmentScore += 10; // Partial alignment
  }
  
  if (targetMacros.fat) {
    factors++;
    if (targetMacros.fat === 'very-low' && nutrition.fat < 8) alignmentScore += 30;
    else if (targetMacros.fat === 'low' && nutrition.fat < 12) alignmentScore += 30;
    else if (targetMacros.fat === 'moderate' && nutrition.fat >= 12 && nutrition.fat <= 18) alignmentScore += 30;
    else if (targetMacros.fat === 'high' && nutrition.fat > 18) alignmentScore += 30;
    else alignmentScore += 10;
  }
  
  if (targetMacros.fiber) {
    factors++;
    if (targetMacros.fiber === 'low' && nutrition.fiber < 5) alignmentScore += 30;
    else if (targetMacros.fiber === 'moderate' && nutrition.fiber >= 5 && nutrition.fiber <= 10) alignmentScore += 30;
    else if (targetMacros.fiber === 'high' && nutrition.fiber > 10) alignmentScore += 30;
    else alignmentScore += 10;
  }
  
  if (targetMacros.phosphorus && nutrition.phosphorus !== undefined) {
    factors++;
    if (targetMacros.phosphorus === 'low' && nutrition.phosphorus < 0.6) alignmentScore += 30;
    else if (targetMacros.phosphorus === 'moderate' && nutrition.phosphorus >= 0.6 && nutrition.phosphorus <= 1.0) alignmentScore += 30;
    else if (targetMacros.phosphorus === 'high' && nutrition.phosphorus > 1.0) alignmentScore += 30;
    else alignmentScore += 10;
  }
  
  return factors > 0 ? alignmentScore / factors : 50;
}

