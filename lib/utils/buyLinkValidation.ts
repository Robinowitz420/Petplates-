// Intent-based buy link validation
// Validates Amazon links point to correct product TYPE, not exact title match

export type BuyLinkIntent =
  | 'produce'        // Fresh fruits/vegetables
  | 'pantry'         // Rice, oats, canned goods, grains
  | 'oil'            // Cooking oils, fish oils, supplements
  | 'supplement'     // Vitamins, minerals, health supplements
  | 'pet-feed'       // Hay, pellets, pet-specific foods
  | 'insect'         // Live/dried insects for reptiles/birds
  | 'meat'           // Fresh/frozen meat, organs
  | 'other';         // Catch-all

export interface IngredientRetailValidation {
  intent: BuyLinkIntent;
  required?: string[];   // Tokens that MUST appear in title (case-insensitive)
  forbidden?: string[];  // Tokens that must NOT appear (indicates wrong product)
  optional?: string[];   // Bonus tokens (not enforced, but good to have)
}

export type ValidationResult = 'PASS' | 'WARN' | 'FAIL';

export interface ValidationReport {
  result: ValidationResult;
  reason?: string;
  matchedRequired?: string[];
  foundForbidden?: string[];
  suggestions?: string[];
}

/**
 * Validates an Amazon product title against ingredient expectations.
 * Uses intent + token matching instead of string similarity.
 */
export function validateProductTitle(
  productTitle: string,
  validation: IngredientRetailValidation
): ValidationReport {
  const normalizedTitle = productTitle.toLowerCase();
  const tokens = normalizedTitle.split(/\s+/);
  
  // Check forbidden tokens (immediate fail)
  if (validation.forbidden) {
    const foundForbidden = validation.forbidden.filter(token => 
      normalizedTitle.includes(token.toLowerCase())
    );
    
    if (foundForbidden.length > 0) {
      return {
        result: 'FAIL',
        reason: `Contains forbidden tokens: ${foundForbidden.join(', ')}`,
        foundForbidden,
        suggestions: ['Find product without these terms', 'Check if this is cosmetic/non-food grade'],
      };
    }
  }
  
  // Check required tokens
  if (validation.required && validation.required.length > 0) {
    const matchedRequired = validation.required.filter(token =>
      normalizedTitle.includes(token.toLowerCase())
    );
    
    if (matchedRequired.length === 0) {
      return {
        result: 'FAIL',
        reason: `Missing all required tokens: ${validation.required.join(', ')}`,
        suggestions: ['Verify ASIN points to correct product type', 'Search for product with required terms'],
      };
    }
    
    if (matchedRequired.length < validation.required.length) {
      return {
        result: 'WARN',
        reason: `Missing some required tokens: ${validation.required.filter(t => !matchedRequired.includes(t)).join(', ')}`,
        matchedRequired,
        suggestions: ['Review if partial match is acceptable'],
      };
    }
    
    return {
      result: 'PASS',
      matchedRequired,
    };
  }
  
  // No required tokens - just check intent is reasonable
  return {
    result: 'PASS',
    reason: 'No specific validation rules, assuming correct',
  };
}

/**
 * Infers validation rules from ingredient name and category.
 * This provides sensible defaults when explicit rules aren't defined.
 */
export function inferValidationRules(
  ingredientName: string,
  category: string
): IngredientRetailValidation {
  const name = ingredientName.toLowerCase();
  
  // Oils - require "oil" and forbid cosmetic terms
  if (category === 'Oil' || name.includes('oil')) {
    const oilType = name.replace(/\s*oil.*/, '').trim();
    return {
      intent: 'oil',
      required: ['oil'],
      forbidden: ['massage', 'hair', 'skin', 'cosmetic', 'beauty', 'lotion', 'aromatherapy'],
      optional: [oilType, 'food', 'grade', 'culinary'],
    };
  }
  
  // Supplements - require supplement-related terms
  if (category === 'Supplement' || name.includes('supplement') || name.includes('vitamin')) {
    return {
      intent: 'supplement',
      forbidden: ['dog', 'cat', 'pet', 'chew', 'treat'], // Avoid pet-specific supplements
    };
  }
  
  // Meat - require meat type, forbid treats/jerky
  if (category === 'Meat') {
    return {
      intent: 'meat',
      forbidden: ['treat', 'jerky', 'chew', 'toy', 'dog', 'cat'],
      optional: ['fresh', 'frozen', 'raw'],
    };
  }
  
  // Insects - require insect type
  if (category === 'Insect') {
    return {
      intent: 'insect',
      forbidden: ['food', 'mix', 'blend'], // Avoid mixes, want pure insects
    };
  }
  
  // Hay/Pellets - pet-specific is OK
  if (category === 'Hay' || category === 'Pellet') {
    return {
      intent: 'pet-feed',
    };
  }
  
  // Vegetables/Fruits - produce
  if (category === 'Vegetable' || category === 'Fruit') {
    return {
      intent: 'produce',
      forbidden: ['juice', 'powder', 'extract'], // Want whole produce
    };
  }
  
  // Grains/Carbs - pantry items
  if (category === 'Carb' || category === 'Grain') {
    return {
      intent: 'pantry',
      forbidden: ['flour', 'bread', 'cereal'], // Want whole grains
    };
  }
  
  // Seeds
  if (category === 'Seed') {
    return {
      intent: 'pantry',
      forbidden: ['mix', 'blend', 'food'], // Want pure seeds
    };
  }
  
  return {
    intent: 'other',
  };
}

/**
 * Generates a suggested Amazon search query for manual ASIN lookup.
 */
export function generateSearchQuery(
  ingredientName: string,
  validation: IngredientRetailValidation
): string {
  const terms = [ingredientName];
  
  // Add intent-specific qualifiers
  if (validation.intent === 'oil') {
    terms.push('food grade', 'culinary');
  } else if (validation.intent === 'supplement') {
    terms.push('dietary supplement');
  } else if (validation.intent === 'meat') {
    terms.push('fresh', 'raw');
  } else if (validation.intent === 'produce') {
    terms.push('organic', 'fresh');
  }
  
  // Add required tokens if specified
  if (validation.required) {
    terms.push(...validation.required);
  }
  
  return terms.join(' ');
}

/**
 * Creates an Amazon search URL with affiliate tag.
 */
export function generateSearchUrl(searchQuery: string): string {
  const encoded = encodeURIComponent(searchQuery);
  return `https://www.amazon.com/s?k=${encoded}&tag=robinfrench-20`;
}
