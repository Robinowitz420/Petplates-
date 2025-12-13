// lib/utils/mealNameGenerator.ts
// Enhanced meal naming system with semantic awareness, health context, and pet personalization

import { getIngredientById, getIngredientByName, type UnifiedIngredient, type IngredientCategory } from '../data/unifiedIngredientRegistry';
import type { Recipe } from '../types';

// =================================================================
// Phase 1: Foundation - Ingredient Display Name Integration
// =================================================================

/**
 * Get display name for an ingredient from unified registry
 */
function getIngredientDisplayName(ingredientKey: string): string {
  // Try to find ingredient by ID (snake_case)
  let ingredient: UnifiedIngredient | null = getIngredientById(ingredientKey);
  
  // If not found, try by name
  if (!ingredient) {
    ingredient = getIngredientByName(ingredientKey);
  }
  
  // If found, return primary display name
  if (ingredient) {
    return ingredient.primaryDisplayName;
  }
  
  // Fallback: format key to Title Case
  return ingredientKey
    .split(/[_\s-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Categorize ingredients by type using unified registry
 */
function categorizeIngredients(ingredientKeys: string[]): {
  proteins: string[];
  carbs: string[];
  vegetables: string[];
  fruits: string[];
  supplements: string[];
} {
  const categories = {
    proteins: [] as string[],
    carbs: [] as string[],
    vegetables: [] as string[],
    fruits: [] as string[],
    supplements: [] as string[],
  };
  
  for (const key of ingredientKeys) {
    let ingredient: UnifiedIngredient | null = getIngredientById(key);
    if (!ingredient) {
      ingredient = getIngredientByName(key);
    }
    
    if (ingredient) {
      const category = ingredient.category;
      const displayName = getIngredientDisplayName(key);
      
      switch (category) {
        case 'protein':
        case 'insect':
          categories.proteins.push(displayName);
          break;
        case 'grain':
          categories.carbs.push(displayName);
          break;
        case 'vegetable':
          categories.vegetables.push(displayName);
          break;
        case 'fruit':
          categories.fruits.push(displayName);
          break;
        case 'supplement':
          categories.supplements.push(displayName);
          break;
        default:
          // Try to infer from name
          const lower = key.toLowerCase();
          if (lower.match(/\b(chicken|turkey|beef|lamb|fish|salmon|tuna|meat|protein|pork|duck|organ|heart|liver|kidney|venison|rabbit|quail)\b/)) {
            categories.proteins.push(displayName);
          } else if (lower.match(/\b(rice|oats|quinoa|barley|wheat|grain|seed|millet|potato|sweet.*potato|pumpkin|squash)\b/)) {
            categories.carbs.push(displayName);
          } else if (lower.match(/\b(carrot|broccoli|spinach|kale|lettuce|pepper|vegetable|green)\b/)) {
            categories.vegetables.push(displayName);
          }
          break;
      }
    } else {
      // Fallback categorization by name
      const lower = key.toLowerCase();
      if (lower.match(/\b(chicken|turkey|beef|lamb|fish|salmon|tuna|meat|protein|pork|duck|organ|heart|liver|kidney|venison|rabbit|quail)\b/)) {
        categories.proteins.push(getIngredientDisplayName(key));
      } else if (lower.match(/\b(rice|oats|quinoa|barley|wheat|grain|seed|millet|potato|sweet.*potato|pumpkin|squash)\b/)) {
        categories.carbs.push(getIngredientDisplayName(key));
      } else if (lower.match(/\b(carrot|broccoli|spinach|kale|lettuce|pepper|vegetable|green)\b/)) {
        categories.vegetables.push(getIngredientDisplayName(key));
      }
    }
  }
  
  return categories;
}

// =================================================================
// Phase 2: Semantic Metadata Extraction
// =================================================================

interface MealSemantics {
  dominantProtein: string;
  dominantCarb: string;
  dominantVeg: string;
  nutritionalAngle: 'High Protein' | 'Low Fat' | 'High Fiber' | 'Balanced';
  cookingStyle: 'Slow-Cooked' | 'Oven-Baked' | 'Fresh' | 'Stewed' | 'Raw' | null;
  healthTags: string[];
}

/**
 * Extract semantic metadata from recipe/ingredients
 */
function extractMealSemantics(
  ingredientKeys: string[],
  options?: {
    nutritionalProfile?: {
      protein?: number;
      fat?: number;
      fiber?: number;
    };
    healthConcerns?: string[];
    recipe?: Recipe;
  }
): MealSemantics {
  const categorized = categorizeIngredients(ingredientKeys);
  
  // Determine dominant ingredients
  const dominantProtein = categorized.proteins[0] || '';
  const dominantCarb = categorized.carbs[0] || '';
  const dominantVeg = categorized.vegetables[0] || '';
  
  // Determine nutritional angle
  let nutritionalAngle: 'High Protein' | 'Low Fat' | 'High Fiber' | 'Balanced' = 'Balanced';
  if (options?.nutritionalProfile) {
    const { protein, fat, fiber } = options.nutritionalProfile;
    if (protein && protein > 30) {
      nutritionalAngle = 'High Protein';
    } else if (fat && fat < 10) {
      nutritionalAngle = 'Low Fat';
    } else if (fiber && fiber > 5) {
      nutritionalAngle = 'High Fiber';
    }
  }
  
  // Determine cooking style (from recipe metadata or infer)
  let cookingStyle: 'Slow-Cooked' | 'Oven-Baked' | 'Fresh' | 'Stewed' | 'Raw' | null = null;
  if (options?.recipe) {
    const recipe = options.recipe;
    const nameLower = recipe.name?.toLowerCase() || '';
    const descLower = recipe.description?.toLowerCase() || '';
    const instructions = (recipe.instructions || []).join(' ').toLowerCase();
    
    if (nameLower.includes('slow') || instructions.includes('slow cook')) {
      cookingStyle = 'Slow-Cooked';
    } else if (nameLower.includes('baked') || instructions.includes('bake') || instructions.includes('oven')) {
      cookingStyle = 'Oven-Baked';
    } else if (nameLower.includes('fresh') || descLower.includes('fresh')) {
      cookingStyle = 'Fresh';
    } else if (nameLower.includes('stew') || instructions.includes('stew')) {
      cookingStyle = 'Stewed';
    } else if (nameLower.includes('raw') || instructions.includes('raw')) {
      cookingStyle = 'Raw';
    }
  }
  
  // Map health concerns to naming tags
  const healthTags: string[] = [];
  if (options?.healthConcerns && options.healthConcerns.length > 0) {
    healthTags.push(...options.healthConcerns);
  }
  
  return {
    dominantProtein,
    dominantCarb,
    dominantVeg,
    nutritionalAngle,
    cookingStyle,
    healthTags,
  };
}

// =================================================================
// Phase 5: Health Concern Lexicon
// =================================================================

const HEALTH_CONCERN_NAMING_MAP: Record<string, string> = {
  'joint-health': 'Mobility',
  'joint health': 'Mobility',
  'kidney-disease': 'Renal Support',
  'kidney disease': 'Renal Support',
  'digestive-health': 'Digestive Ease',
  'digestive health': 'Digestive Ease',
  'weight-management': 'Weight Control',
  'weight management': 'Weight Control',
  'allergies': 'Hypoallergenic',
  'diabetes': 'Blood Sugar Balance',
  'dental-health': 'Dental Care',
  'dental health': 'Dental Care',
  'pancreatitis': 'Low-Fat',
  'urinary-health': 'Urinary Support',
  'urinary health': 'Urinary Support',
  'skin-health': 'Skin & Coat',
  'skin health': 'Skin & Coat',
  'heart-health': 'Heart Health',
  'heart health': 'Heart Health',
  'immune-support': 'Immune Support',
  'immune support': 'Immune Support',
  'senior-health': 'Senior Support',
  'senior health': 'Senior Support',
};

/**
 * Map health concern to naming-friendly tag
 */
function mapHealthConcernToTag(concern: string): string {
  const normalized = concern.toLowerCase().trim();
  return HEALTH_CONCERN_NAMING_MAP[normalized] || concern;
}

// =================================================================
// Phase 3: Naming Families (25+ Patterns)
// =================================================================

type NamingFamily = 'ingredient-driven' | 'health-focused' | 'pet-personalized' | 'nutritional-style' | 'creative';

interface NamingPattern {
  family: NamingFamily;
  pattern: string;
  requires?: {
    protein?: boolean;
    carb?: boolean;
    veggie?: boolean;
    healthTag?: boolean;
    petName?: boolean;
  };
}

const NAMING_PATTERNS: NamingPattern[] = [
  // Family 1: Ingredient-Driven (Classic)
  { family: 'ingredient-driven', pattern: '{protein} & {carb} Bowl', requires: { protein: true, carb: true } },
  { family: 'ingredient-driven', pattern: '{protein} with {veggie} Medley', requires: { protein: true, veggie: true } },
  { family: 'ingredient-driven', pattern: 'Fresh {protein} & {secondIngredient}', requires: { protein: true } },
  { family: 'ingredient-driven', pattern: '{protein} {carb} Harmony', requires: { protein: true, carb: true } },
  { family: 'ingredient-driven', pattern: '{protein} Garden Blend', requires: { protein: true } },
  
  // Family 2: Health-Focused
  { family: 'health-focused', pattern: '{healthFocus} {protein} Recipe', requires: { protein: true, healthTag: true } },
  { family: 'health-focused', pattern: 'Balanced {protein} & {carb} Plate', requires: { protein: true, carb: true } },
  { family: 'health-focused', pattern: '{protein} {healthTag} Formula', requires: { protein: true, healthTag: true } },
  { family: 'health-focused', pattern: 'Supportive {protein} Blend', requires: { protein: true, healthTag: true } },
  { family: 'health-focused', pattern: 'Gentle {protein} Medley', requires: { protein: true, healthTag: true } },
  
  // Family 3: Pet-Personalized (only for custom meals)
  { family: 'pet-personalized', pattern: "{petName}'s {protein} Dinner", requires: { protein: true, petName: true } },
  { family: 'pet-personalized', pattern: "{petName}'s Favorite {protein} Bowl", requires: { protein: true, petName: true } },
  { family: 'pet-personalized', pattern: 'Special {protein} for {petName}', requires: { protein: true, petName: true } },
  { family: 'pet-personalized', pattern: "{petName}'s {healthTag} {protein}", requires: { protein: true, petName: true, healthTag: true } },
  { family: 'pet-personalized', pattern: '{breed} {protein} Feast', requires: { protein: true } },
  
  // Family 4: Nutritional-Style
  { family: 'nutritional-style', pattern: 'High-Protein {protein} Power Bowl', requires: { protein: true } },
  { family: 'nutritional-style', pattern: 'Lean {protein} & {carb} Mix', requires: { protein: true, carb: true } },
  { family: 'nutritional-style', pattern: 'Nutrient-Rich {protein} Medley', requires: { protein: true } },
  { family: 'nutritional-style', pattern: 'Complete {protein} Formula', requires: { protein: true } },
  { family: 'nutritional-style', pattern: 'Premium {protein} Blend', requires: { protein: true } },
  
  // Family 5: Creative/Descriptive
  { family: 'creative', pattern: 'Rustic {protein} Farmhouse Bowl', requires: { protein: true } },
  { family: 'creative', pattern: 'Savory {protein} Kitchen Creation', requires: { protein: true } },
  { family: 'creative', pattern: 'Golden {protein} & {carb} Plate', requires: { protein: true, carb: true } },
  { family: 'creative', pattern: 'Ultimate {protein} Feast', requires: { protein: true } },
  { family: 'creative', pattern: "Chef's Choice {protein} Blend", requires: { protein: true } },
  { family: 'creative', pattern: 'Heritage {protein} & {veggie} Bowl', requires: { protein: true, veggie: true } },
  { family: 'creative', pattern: 'Wholesome {protein} Delight', requires: { protein: true } },
  { family: 'creative', pattern: 'Gourmet {protein} & {carb} Mix', requires: { protein: true, carb: true } },
  { family: 'creative', pattern: 'Premium {protein} Medley', requires: { protein: true } },
  { family: 'creative', pattern: 'Classic {protein} & {veggie} Recipe', requires: { protein: true, veggie: true } },
  
  // More ingredient-driven patterns for variety
  { family: 'ingredient-driven', pattern: '{protein} Power Bowl', requires: { protein: true } },
  { family: 'ingredient-driven', pattern: '{protein} & {veggie} Delight', requires: { protein: true, veggie: true } },
  { family: 'ingredient-driven', pattern: '{protein} {carb} Fusion', requires: { protein: true, carb: true } },
  
  // More nutritional-style patterns
  { family: 'nutritional-style', pattern: 'Vital {protein} Formula', requires: { protein: true } },
  { family: 'nutritional-style', pattern: 'Optimal {protein} & {carb} Blend', requires: { protein: true, carb: true } },
];

// =================================================================
// Phase 4: Pattern Selection Logic
// =================================================================

/**
 * Simple hash function for deterministic pattern selection
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Select naming family based on context
 */
function selectNamingFamily(
  semantics: MealSemantics,
  options?: {
    petName?: string;
    isCustomMeal?: boolean;
    recipeId?: string;
  }
): NamingFamily {
  // For custom meals, add randomness using timestamp + ingredients for variety
  const seed = options?.recipeId || 
    (options?.isCustomMeal ? `${Date.now()}-${semantics.dominantProtein}-${semantics.dominantCarb}` : '');
  
  if (seed) {
    const hash = hashString(seed);
    const families: NamingFamily[] = ['ingredient-driven', 'health-focused', 'nutritional-style', 'creative', 'pet-personalized'];
    return families[hash % families.length];
  }
  
  // Prioritize health-focused if health concerns present
  if (semantics.healthTags.length > 0) {
    return 'health-focused';
  }
  
  // Use pet-personalized for custom meals (30% chance to avoid repetition)
  if (options?.isCustomMeal && options?.petName) {
    const hash = hashString(options.petName + seed);
    if (hash % 10 < 3) { // 30% chance
      return 'pet-personalized';
    }
  }
  
  // Use nutritional-style if nutritional angle is strong
  if (semantics.nutritionalAngle !== 'Balanced') {
    return 'nutritional-style';
  }
  
  // Default to ingredient-driven
  return 'ingredient-driven';
}

/**
 * Select a pattern from the chosen family
 */
function selectPattern(
  family: NamingFamily,
  semantics: MealSemantics,
  options?: {
    petName?: string;
    petBreed?: string;
    recipeId?: string;
    isCustomMeal?: boolean;
  }
): NamingPattern {
  // Filter patterns by family and requirements
  const familyPatterns = NAMING_PATTERNS.filter(p => p.family === family);
  
  // Filter by requirements
  const availablePatterns = familyPatterns.filter(pattern => {
    if (pattern.requires) {
      if (pattern.requires.protein && !semantics.dominantProtein) return false;
      if (pattern.requires.carb && !semantics.dominantCarb) return false;
      if (pattern.requires.veggie && !semantics.dominantVeg) return false;
      if (pattern.requires.healthTag && semantics.healthTags.length === 0) return false;
      if (pattern.requires.petName && !options?.petName) return false;
    }
    return true;
  });
  
  if (availablePatterns.length === 0) {
    // Fallback to any pattern in family
    return familyPatterns[0] || NAMING_PATTERNS[0];
  }
  
  // For custom meals, add timestamp for more variety
  const seed = options?.recipeId || 
    (options?.isCustomMeal 
      ? `${Date.now()}-${semantics.dominantProtein}-${semantics.dominantCarb}-${semantics.dominantVeg}`
      : `${semantics.dominantProtein}-${semantics.dominantCarb}-${semantics.dominantVeg}`);
  const hash = hashString(seed);
  return availablePatterns[hash % availablePatterns.length];
}

/**
 * Clean breed/pet type by removing parenthetical content like "(budgie)"
 */
function cleanBreedOrSpecies(text: string | undefined): string | undefined {
  if (!text) return undefined;
  // Remove content in parentheses like "(budgie)" or "(common)"
  return text.replace(/\s*\([^)]*\)/g, '').trim();
}

/**
 * Fill pattern with actual values
 */
function fillPattern(
  pattern: NamingPattern,
  semantics: MealSemantics,
  options?: {
    petName?: string;
    petBreed?: string;
    secondIngredient?: string;
  }
): string {
  let result = pattern.pattern;
  
  // Replace placeholders
  result = result.replace(/{protein}/g, semantics.dominantProtein || 'Protein');
  result = result.replace(/{carb}/g, semantics.dominantCarb || 'Grain');
  result = result.replace(/{veggie}/g, semantics.dominantVeg || 'Vegetable');
  result = result.replace(/{secondIngredient}/g, options?.secondIngredient || semantics.dominantCarb || semantics.dominantVeg || 'Mix');
  
  // Health tags
  if (semantics.healthTags.length > 0) {
    const healthTag = mapHealthConcernToTag(semantics.healthTags[0]);
    result = result.replace(/{healthTag}/g, healthTag);
    result = result.replace(/{healthFocus}/g, healthTag);
  }
  
  // Pet context - clean breed to remove parentheses
  if (options?.petName) {
    result = result.replace(/{petName}/g, options.petName);
  }
  if (options?.petBreed) {
    const cleanedBreed = cleanBreedOrSpecies(options.petBreed);
    if (cleanedBreed) {
      result = result.replace(/{breed}/g, cleanedBreed);
    }
  }
  
  return result;
}

// =================================================================
// Phase 6: Collision Avoidance
// =================================================================

// In-memory collision map (per session)
const nameCollisionMap = new Map<string, number>();

/**
 * Ensure unique name by appending suffix if needed
 */
function ensureUniqueName(
  baseName: string,
  ingredientSignature: string
): string {
  // Check if we've seen this signature before
  const existingCount = nameCollisionMap.get(ingredientSignature);
  
  if (existingCount === undefined) {
    // First time seeing this signature - don't add any suffix
    nameCollisionMap.set(ingredientSignature, 1);
    return baseName;
  }
  
  // Collision detected - append numeric suffix (skip 0, start at 2)
  const suffix = existingCount + 1;
  nameCollisionMap.set(ingredientSignature, suffix);
  return `${baseName} ${suffix}`;
}

/**
 * Create ingredient signature for collision detection
 */
function createIngredientSignature(ingredientKeys: string[]): string {
  return ingredientKeys
    .map(k => k.toLowerCase().trim())
    .sort()
    .join('|');
}

// =================================================================
// Phase 7: Short Name Generation
// =================================================================

/**
 * Generate short name (max 20 characters)
 */
function generateShortName(semantics: MealSemantics): string {
  const parts: string[] = [];
  
  if (semantics.dominantProtein) {
    parts.push(semantics.dominantProtein);
  }
  
  if (semantics.dominantCarb) {
    parts.push(semantics.dominantCarb);
  } else if (semantics.dominantVeg) {
    parts.push(semantics.dominantVeg);
  }
  
  if (parts.length === 0) {
    return 'Custom Meal';
  }
  
  const shortName = parts.join(' & ');
  
  // Truncate if too long
  if (shortName.length > 20) {
    return shortName.substring(0, 17) + '...';
  }
  
  return shortName;
}

// =================================================================
// Phase 9: Quality Assurance
// =================================================================

/**
 * Validate and format meal name
 */
function validateMealName(name: string): string {
  // Remove underscores
  let cleaned = name.replace(/_/g, ' ');
  
  // Remove any trailing numbers or "0" that might have been added
  cleaned = cleaned.replace(/\s+0+\s*$/, '').trim();
  
  // Remove any parenthetical content that might have slipped through
  cleaned = cleaned.replace(/\s*\([^)]*\)\s*/g, ' ');
  
  // Fix spacing
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // Ensure proper capitalization (Title Case)
  cleaned = cleaned
    .split(' ')
    .map(word => {
      // Skip small words unless they're the first word
      const smallWords = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'if', 'in', 'of', 'on', 'or', 'the', 'to'];
      if (smallWords.includes(word.toLowerCase()) && cleaned.indexOf(word) > 0) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
  
  // Check for generic patterns and add descriptor if needed
  const genericPatterns = [
    /^Chicken Bowl$/i,
    /^Beef Mix$/i,
    /^Salmon Bowl$/i,
  ];
  
  for (const pattern of genericPatterns) {
    if (pattern.test(cleaned)) {
      cleaned = cleaned.replace(/Bowl|Mix/, 'Power Bowl');
    }
  }
  
  // Validate length
  if (cleaned.length < 10) {
    cleaned = cleaned + ' Meal';
  } else if (cleaned.length > 60) {
    cleaned = cleaned.substring(0, 57) + '...';
  }
  
  // Final cleanup - remove any trailing whitespace or special characters
  cleaned = cleaned.trim();
  
  return cleaned;
}

// =================================================================
// Main Export: generateMealName
// =================================================================

export interface MealNameOptions {
  petName?: string;
  petBreed?: string;
  petSpecies?: string;
  healthConcerns?: string[];
  nutritionalProfile?: {
    protein?: number;
    fat?: number;
    fiber?: number;
  };
  mealType?: 'complete' | 'treat' | 'supplement';
  recipeId?: string;
  recipe?: Recipe;
  isCustomMeal?: boolean;
}

export interface MealNameResult {
  fullName: string;
  shortName: string;
}

/**
 * Generate meal name with full context awareness
 */
export function generateMealName(
  ingredients: string[],
  options?: MealNameOptions
): MealNameResult {
  if (ingredients.length === 0) {
    return {
      fullName: 'Custom Meal',
      shortName: 'Custom Meal',
    };
  }
  
  // Extract semantics
  const semantics = extractMealSemantics(ingredients, {
    nutritionalProfile: options?.nutritionalProfile,
    healthConcerns: options?.healthConcerns,
    recipe: options?.recipe,
  });
  
  // Select naming family
  const family = selectNamingFamily(semantics, {
    petName: options?.petName,
    isCustomMeal: options?.isCustomMeal,
    recipeId: options?.recipeId,
  });
  
  // Clean petBreed to remove parenthetical content
  const cleanedBreed = options?.petBreed ? cleanBreedOrSpecies(options.petBreed) : undefined;
  
  // Select pattern
  const pattern = selectPattern(family, semantics, {
    petName: options?.petName,
    petBreed: cleanedBreed,
    recipeId: options?.recipeId,
    isCustomMeal: options?.isCustomMeal,
  });
  
  // Get second ingredient for patterns that need it
  const categorized = categorizeIngredients(ingredients);
  const secondIngredient = categorized.proteins[1] || categorized.carbs[0] || categorized.vegetables[0];
  
  // Fill pattern (use cleaned breed)
  let fullName = fillPattern(pattern, semantics, {
    petName: options?.petName,
    petBreed: cleanedBreed,
    secondIngredient,
  });
  
  // Clean up any remaining parenthetical content that might have been in the name
  fullName = fullName.replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Handle nutritional angle in name
  if (semantics.nutritionalAngle === 'High Protein' && !fullName.includes('High-Protein') && !fullName.includes('Power')) {
    fullName = fullName.replace(/{protein}/g, 'High-Protein ' + semantics.dominantProtein);
  }
  
  // Create ingredient signature for collision detection
  const ingredientSignature = createIngredientSignature(ingredients);
  
  // Ensure uniqueness
  fullName = ensureUniqueName(fullName, ingredientSignature);
  
  // Validate and format
  fullName = validateMealName(fullName);
  
  // Generate short name
  const shortName = generateShortName(semantics);
  
  return {
    fullName,
    shortName,
  };
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use generateMealName with options instead
 */
export function getShortMealName(ingredients: string[]): string {
  const result = generateMealName(ingredients);
  return result.shortName;
}
