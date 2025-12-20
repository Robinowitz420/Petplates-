/**
 * RECIPE COMPOSITION VALIDATOR
 * Ensures recipes follow safe ingredient combination rules
 * Prevents unsafe combinations like multiple organ meats or unbalanced macros
 */

import type { Ingredient, Species } from '@/lib/data/ingredients';

// ============================================================================
// INGREDIENT ROLE DEFINITIONS
// ============================================================================

export const INGREDIENT_ROLES = {
  // Main proteins - can be primary ingredient (30-40% of recipe)
  mainProtein: [
    'chicken', 'turkey', 'beef', 'lamb', 'duck', 'venison',
    'salmon', 'whitefish', 'cod', 'sardine', 'tuna', 'egg'
  ],

  // Organ meats - MUST be limited to <10% of recipe
  organMeat: [
    'liver', 'kidney', 'heart', 'tripe', 'lung', 'spleen'
  ],

  // Carbohydrates - should be 30-40% of recipe
  carbs: [
    'rice', 'oats', 'quinoa', 'barley', 'potato', 'sweet potato',
    'pumpkin', 'squash', 'lentils', 'chickpeas', 'beans'
  ],

  // Vegetables - should be 10-20% of recipe
  vegetables: [
    'carrots', 'green beans', 'broccoli', 'spinach', 'kale',
    'zucchini', 'celery', 'peas', 'asparagus', 'lettuce'
  ],

  // Fats/oils - should be <5% of recipe
  fats: [
    'fish oil', 'coconut oil', 'olive oil', 'salmon oil', 'flaxseed', 'oil'
  ],
};

// ============================================================================
// UNSAFE COMBINATIONS
// ============================================================================

export const UNSAFE_COMBINATIONS = [
  {
    name: 'Multiple Organ Meats',
    ingredients: ['liver', 'kidney', 'heart'],
    maxCombined: 1, // Can only have 1 organ meat per recipe
    reason: 'Risk of vitamin A toxicity and mineral imbalance',
  },
  {
    name: 'High-Fat Proteins Together',
    ingredients: ['salmon', 'sardine', 'duck', 'lamb', 'mackerel'],
    maxCombined: 1, // Only 1 high-fat protein per recipe
    reason: 'Too much fat can cause pancreatitis',
  },
  {
    name: 'Multiple Fish Sources',
    ingredients: ['salmon', 'sardine', 'tuna', 'mackerel', 'whitefish', 'cod'],
    maxCombined: 1, // Only 1 fish per recipe
    reason: 'Risk of mercury accumulation and thiamine deficiency',
  },
];

// ============================================================================
// REQUIRED RECIPE STRUCTURE BY SPECIES
// ============================================================================

export const REQUIRED_RECIPE_STRUCTURE: Record<Species, {
  mustHave: string[];
  shouldHave: string[];
  optional: string[];
  minIngredients: number;
  maxIngredients: number;
}> = {
  dogs: {
    mustHave: ['mainProtein', 'carbs'], // REQUIRED
    shouldHave: ['vegetables'], // RECOMMENDED
    optional: ['fats', 'organMeat'], // OPTIONAL
    minIngredients: 3, // At least protein + carb + veggie
    maxIngredients: 6, // Don't overcomplicate
  },
  cats: {
    mustHave: ['mainProtein'], // Obligate carnivores - protein is essential
    shouldHave: ['fats'], // Cats need higher fat
    optional: ['carbs', 'vegetables'], // Cats don't need carbs, but tolerate some
    minIngredients: 2, // Can be simpler (protein + fat)
    maxIngredients: 5,
  },
  birds: {
    mustHave: ['vegetables', 'seed'], // Birds need seeds/veggies
    shouldHave: ['fruit'], // Birds love fruits
    optional: ['protein', 'carbs'],
    minIngredients: 2,
    maxIngredients: 5,
  },
  reptiles: {
    mustHave: ['protein'], // Carnivorous reptiles need protein
    shouldHave: ['vegetable'], // Some herbivorous/omnivorous reptiles
    optional: ['carbs', 'fruit'],
    minIngredients: 1,
    maxIngredients: 4,
  },
  'pocket-pets': {
    mustHave: ['hay', 'vegetable'], // Herbivores need hay and veggies
    shouldHave: ['fruit'], // Optional treats
    optional: ['carbs', 'seed'],
    minIngredients: 2,
    maxIngredients: 5,
  },
};

// ============================================================================
// VALIDATION RESULT
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  issues: string[];
  warnings: string[];
}

// ============================================================================
// MAIN VALIDATION FUNCTION
// ============================================================================

/**
 * Validate recipe composition for safety and balance
 */
export function validateRecipeComposition(
  selectedIngredients: Ingredient[],
  species: Species
): ValidationResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  const ingredientNames = selectedIngredients.map(ing => ing.name.toLowerCase());

  // ========================================================================
  // CHECK 1: Required structure
  // ========================================================================
  const structure = REQUIRED_RECIPE_STRUCTURE[species];
  if (structure) {
    // Check mustHave categories
    for (const category of structure.mustHave) {
      const hasCategory = ingredientNames.some(name =>
        INGREDIENT_ROLES[category as keyof typeof INGREDIENT_ROLES]?.some(role =>
          name.includes(role)
        )
      );
      if (!hasCategory) {
        issues.push(`Missing required ingredient type: ${category}`);
      }
    }

    // Check shouldHave categories
    for (const category of structure.shouldHave) {
      const hasCategory = ingredientNames.some(name =>
        INGREDIENT_ROLES[category as keyof typeof INGREDIENT_ROLES]?.some(role =>
          name.includes(role)
        )
      );
      if (!hasCategory) {
        warnings.push(`Recommended ingredient type missing: ${category}`);
      }
    }

    // Check ingredient count
    if (selectedIngredients.length < structure.minIngredients) {
      issues.push(
        `Too few ingredients (${selectedIngredients.length}, need ${structure.minIngredients}+)`
      );
    }
    if (selectedIngredients.length > structure.maxIngredients) {
      warnings.push(
        `Too many ingredients (${selectedIngredients.length}, recommended max ${structure.maxIngredients})`
      );
    }
  }

  // ========================================================================
  // CHECK 2: Unsafe combinations
  // ========================================================================
  for (const combo of UNSAFE_COMBINATIONS) {
    const matchedIngredients = ingredientNames.filter(name =>
      combo.ingredients.some(unsafe => name.includes(unsafe))
    );

    if (matchedIngredients.length > combo.maxCombined) {
      issues.push(
        `Unsafe combination: ${matchedIngredients.join(' + ')}. ` +
        `${combo.reason}. Max ${combo.maxCombined} allowed.`
      );
    }
  }

  // ========================================================================
  // CHECK 3: Organ meat percentage (if present)
  // ========================================================================
  const hasOrganMeat = ingredientNames.some(name =>
    INGREDIENT_ROLES.organMeat.some(organ => name.includes(organ))
  );

  if (hasOrganMeat) {
    const organMeats = selectedIngredients.filter(ing =>
      INGREDIENT_ROLES.organMeat.some(organ => ing.name.toLowerCase().includes(organ))
    );

    // Check if organ meat has proper role
    const organMeatRole = organMeats[0]?.feedingRole;
    if (organMeatRole === 'staple') {
      issues.push(
        `${organMeats[0].name} is marked as staple but should be supplement. ` +
        `Organ meats must be limited to <10% of recipe.`
      );
    }

    // If multiple ingredients, warn if organ meat portion is too large
    if (selectedIngredients.length <= 2 && hasOrganMeat) {
      issues.push(
        `Recipe has too few ingredients with organ meat present. ` +
        `Add carbs/vegetables to dilute organ meat concentration.`
      );
    }
  }

  // ========================================================================
  // CHECK 4: No double proteins without carbs (for dogs)
  // ========================================================================
  if (species === 'dogs') {
    const proteinCount = ingredientNames.filter(name =>
      INGREDIENT_ROLES.mainProtein.some(p => name.includes(p)) ||
      INGREDIENT_ROLES.organMeat.some(o => name.includes(o))
    ).length;

    const hasCarbs = ingredientNames.some(name =>
      INGREDIENT_ROLES.carbs.some(c => name.includes(c))
    );

    if (proteinCount >= 2 && !hasCarbs) {
      issues.push(
        `Recipe has ${proteinCount} protein sources but no carbohydrates. ` +
        `This is unbalanced and too protein-heavy.`
      );
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
  };
}

/**
 * Check if an ingredient should be categorized as a supplement (organ meat)
 */
export function isOrganMeat(ingredient: Ingredient): boolean {
  const name = ingredient.name.toLowerCase();
  return INGREDIENT_ROLES.organMeat.some(organ => name.includes(organ));
}

/**
 * Get ingredient category role
 */
export function getIngredientRole(ingredient: Ingredient): string {
  const name = ingredient.name.toLowerCase();

  if (INGREDIENT_ROLES.mainProtein.some(p => name.includes(p))) return 'mainProtein';
  if (INGREDIENT_ROLES.organMeat.some(o => name.includes(o))) return 'organMeat';
  if (INGREDIENT_ROLES.carbs.some(c => name.includes(c))) return 'carbs';
  if (INGREDIENT_ROLES.vegetables.some(v => name.includes(v))) return 'vegetables';
  if (INGREDIENT_ROLES.fats.some(f => name.includes(f))) return 'fats';

  return 'unknown';
}
