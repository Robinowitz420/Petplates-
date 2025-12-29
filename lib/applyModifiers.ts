import type { Recipe, ModifiedRecipeResult, PetNutritionProfile, PortionPlan, ShoppingListItem, WeeklyPlanEntry, AppliedModifierSummary } from './types';
import { dogModifiers } from './data/nutrition-dog-modifiers';
import { catModifiers } from './data/nutrition-cat-modifiers';
import { scoreRecipeImproved } from './scoreRecipe';
import { getPortionPlan } from './portionCalc';
import { scaleAmount } from './portionCalc';
import { recipes } from './data/recipes-complete';
import { getVettedProduct, getAllAffiliateLinks, getGenericIngredientName } from './data/vetted-products'; // <--- UPDATED to use expanded vetted products with commission optimization
import { matchesSpecies } from './utils/recipeRecommendations';
import { normalizePetCategory } from './utils/petType';
import { calculateRecipeNutrition } from './utils/recipeNutrition';

interface ApplyModifiersResult {
  modifiedRecipe: Recipe;
  addedIngredients: Array<{
    name: string;
    benefit: string;
    amazon: string;
    forConcern: string;
  }>;
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

const formatIngredientNameForDisplay = (value: string): string => {
  return String(value)
    .trim()
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

export function applyModifiers(recipe: Recipe, pet: any): ApplyModifiersResult & { conflictCount: number; hasHydrationSupport: boolean } {
  const petCategory = normalizePetCategory(pet?.type, 'applyModifiers');
  const modifiers = petCategory === 'dogs' ? dogModifiers : petCategory === 'cats' ? catModifiers : {};
  const modifiedRecipe: Recipe = JSON.parse(JSON.stringify(recipe)); // Deep clone to modify

  let addedIngredients: ApplyModifiersResult['addedIngredients'] = [];
  let conflictCount = 0;
  let hasHydrationSupport = false;

  // 1. Apply Health Concern Modifiers (Supplements/Additions)
  // Import normalizeHealthConcernForMatching from scoreRecipe (or define locally)
  const normalizeConcern = (c: string): string => {
    const normalized = c.toLowerCase().trim();
    // Map human-readable to normalized format
    const mapping: Record<string, string> = {
      'arthritis/joint pain': 'joint-health',
      'joint pain': 'joint-health',
      'arthritis': 'joint-health',
      'obesity/weight management': 'weight-management',
      'obesity': 'weight-management',
      'weight management': 'weight-management',
      'kidney disease': 'kidney-disease',
      'kidney': 'kidney-disease',
      'urinary problems': 'urinary-health',
      'urinary tract issues': 'urinary-health',
      'dental problems': 'dental-issues',
      'dental disease': 'dental-issues',
      'digestive issues': 'digestive-issues',
      'allergies/skin issues': 'allergies',
      'skin issues': 'allergies',
    };
    return mapping[normalized] || normalized.replace(/[^a-z0-9]+/g, '-');
  };

  const recipeConcernsNormalized = (recipe.healthConcerns || []).map((c: any) => normalizeConcern(String(c || '')));

  for (const concern of pet.healthConcerns || []) {
    const normalizedConcern = normalizeConcern(concern);

    // Only recommend modifier additions when the recipe explicitly supports the concern.
    // This avoids silently injecting unrelated additions.
    if (!recipeConcernsNormalized.includes(normalizedConcern)) {
      continue;
    }

    const modKey = concernToModifierKey[normalizedConcern] || concernToModifierKey[concern.toLowerCase()];
    if (modKey && (modifiers as any)[modKey]) {
      const modifier = (modifiers as any)[modKey];

      // Add supplements required by the modifier
      for (const supplement of modifier.add) {
        // Check if there's a vetted product for this supplement (pass pet.type for species filtering, preferBudget=true for cost control)
        const vettedProduct = getVettedProduct(supplement.name, petCategory, true);
        addedIngredients.push({
          name: supplement.name,
          benefit: supplement.benefit,
          amazon: vettedProduct?.asinLink || supplement.amazon, // Use vetted ASIN link if available
          forConcern: concern,
        });
      }

      // Check for conflicts (already handled in scoreRecipe, but kept for full loop)
      const ingredientText = (recipe.ingredients || []).map((i) => i.name.toLowerCase()).join(' ');
      for (const avoid of modifier.avoid) {
          if (ingredientText.includes(avoid.toLowerCase())) {
            conflictCount += 1; // Track conflicts
          }
      }

      // Check for hydration support
      if (concern.includes('kidney') || concern.includes('urinary')) {
          hasHydrationSupport = true;
      }
    }
  }

  // 2. Map Ingredients to Vetted Products (The core fix)
  // This is the new logic that replaces generic ingredients with specific vetted products
  modifiedRecipe.ingredients = modifiedRecipe.ingredients.map(ing => {
    const genericKey = getGenericIngredientName(ing.name);
    const genericName = genericKey ? formatIngredientNameForDisplay(genericKey) : ing.name;
    // Pass pet.type for species-aware product matching, preferBudget=true for cost control
    const vettedProduct = getVettedProduct(genericName, petCategory, true);
    if (vettedProduct) {
        // Overwrite the generic ingredient details with the Vetted Product details
        return {
            ...ing,
            name: genericName,
            productName: vettedProduct.productName,
            asinLink: vettedProduct.asinLink,
            notes: (ing as any).notes ? `${(ing as any).notes} | VET NOTE: ${vettedProduct.vetNote}` : `VET NOTE: ${vettedProduct.vetNote}`,
        };
    }
    // If no vetted product, remove asinLink to ensure only vetted products have buy links
    return {
      ...ing,
      asinLink: undefined,
    };
  });

  // 3. Map Supplements to Vetted Products (ensure all buy links are vetted)
  if ((modifiedRecipe as any).supplements) {
    (modifiedRecipe as any).supplements = (modifiedRecipe as any).supplements.map((supplement: any) => {
      const genericKey = getGenericIngredientName(supplement.name);
      const genericName = genericKey ? formatIngredientNameForDisplay(genericKey) : supplement.name;
      // Pass pet.type for species-aware product matching, preferBudget=true for cost control
      const vettedProduct = getVettedProduct(genericName, petCategory, true);
      if (vettedProduct) {
        return {
          ...supplement,
          name: genericName,
          productName: vettedProduct.productName,
          asinLink: vettedProduct.asinLink,
          notes: supplement.notes ? `${supplement.notes} | VET NOTE: ${vettedProduct.vetNote}` : `VET NOTE: ${vettedProduct.vetNote}`,
        };
      }
      // If no vetted product, remove asinLink to ensure only vetted products have buy links
      return {
        ...supplement,
        asinLink: undefined,
      };
    });
  }

  if (petCategory === 'cats') {
    const allText = (
      (modifiedRecipe.ingredients || []).map((i: any) => String(i?.name || '')).join(' ') +
      ' ' +
      (((modifiedRecipe as any).supplements || []) as any[]).map((s: any) => String(s?.name || s?.productName || '')).join(' ')
    ).toLowerCase();

    const hasCalciumSource =
      allText.includes('eggshell') ||
      allText.includes('egg shell') ||
      allText.includes('calcium carbonate') ||
      allText.includes('bone meal') ||
      allText.includes('cuttlebone') ||
      allText.includes('neck') ||
      allText.includes('bone');

    if (!hasCalciumSource) {
      const nutrition = calculateRecipeNutrition(modifiedRecipe);
      const ca = nutrition.calcium;
      const p = nutrition.phosphorus;
      const ratio = ca > 0 && p > 0 ? ca / p : 0;

      const needsCalcium = ca <= 0 || p <= 0 || (ratio > 0 && (ratio < 1.0 || ratio > 2.0));
      if (needsCalcium) {
        const suppArr = (((modifiedRecipe as any).supplements || []) as any[]);
        (modifiedRecipe as any).supplements = suppArr;
        suppArr.push({
          name: 'Eggshell Powder',
          amount: '1/4 tsp',
          notes: 'Added automatically to support calcium balance (Ca:P) for cats.',
          category: 'supplement',
        });
        addedIngredients.push({
          name: 'Eggshell Powder',
          benefit: 'Supports calcium balance (Ca:P) for cats',
          amazon: '',
          forConcern: 'nutrition_balance',
        });
      }
    }
  }

  return {
    modifiedRecipe,
    addedIngredients,
    conflictCount,
    hasHydrationSupport,
  };
}

export function generateModifiedRecommendations({ profile, recipeIds, limit, minCompatibilityScore = 30 }: { profile: PetNutritionProfile, recipeIds: string[], limit: number, minCompatibilityScore?: number }): ModifiedRecipeResult[] {
    console.log('🔍 generateModifiedRecommendations called:', {
        species: profile.species,
        ageGroup: profile.ageGroup,
        healthConcerns: profile.healthConcerns,
        limit,
        minCompatibilityScore
    });
    
    // NOTE: 'recipes' is imported from './data/recipes-complete'
    // Use matchesSpecies instead of strict equality to support subtype matching
    const petForMatching = {
        id: '',
        name: '',
        type: profile.species,
        breed: profile.breed || '',
        age: profile.ageGroup,
        healthConcerns: profile.healthConcerns || []
    };
    
    // Use matchesSpecies for sophisticated matching (handles subtypes)
    let allRecipesForCategory = recipes.filter(r => matchesSpecies(r, petForMatching));
    console.log(`📊 Found ${allRecipesForCategory.length} recipes for species "${profile.species}"`);
    
    // Fallback: If no matches, try simple normalization (cat/cats, dog/dogs)
    if (allRecipesForCategory.length === 0) {
        const normalizeSpecies = (species: string) => species.toLowerCase().replace(/s$/, '');
        const normalizedPet = normalizeSpecies(profile.species);
        allRecipesForCategory = recipes.filter(r => {
            const normalizedRecipe = normalizeSpecies(r.category);
            return normalizedPet === normalizedRecipe;
        });
    }
    
    // Log for debugging
    if (allRecipesForCategory.length === 0) {
        console.warn(`No recipes found for species: ${profile.species}, breed: ${profile.breed}, age: ${profile.ageGroup}`);
        console.warn(`Total recipes available: ${recipes.length}`);
        console.warn(`Sample recipe categories: ${recipes.slice(0, 5).map(r => r.category).join(', ')}`);
    }
    
    const targetRecipes = recipeIds.length > 0
        ? allRecipesForCategory.filter(r => recipeIds.includes(r.id))
        : allRecipesForCategory.slice(0, 50); // Use a subset if no IDs provided

    // 1. Score all recipes
    console.log(`🎯 Scoring ${targetRecipes.length} recipes...`);
    const scoredRecipes = targetRecipes.map((recipe, idx) => {
        // Convert PetNutritionProfile to pet object format expected by scoreRecipeImproved
        const petForScoring = {
            id: '',
            name: profile.petName || '',
            type: profile.species,
            breed: profile.breed || '',
            age: profile.ageGroup,
            weight: profile.weightKg,
            weightKg: profile.weightKg,
            activityLevel: undefined,
            healthConcerns: profile.healthConcerns || [],
            dietaryRestrictions: profile.allergies || [],
            allergies: profile.allergies || [],
        };
        const petRating = scoreRecipeImproved(recipe, petForScoring);
        if (idx < 3) { // Log first 3 for debugging
            console.log(`  Recipe "${recipe.name}": ${petRating.compatibilityScore || petRating.matchScore}% (${petRating.reasoning.goodMatches.length} matches, ${petRating.reasoning.conflicts.length} conflicts)`);
        }
        return { recipe, petRating };
    });

    // 2. Filter by minimum compatibility threshold
    const filteredByThreshold = scoredRecipes.filter(({ petRating }) => {
        const score = petRating.compatibilityScore || petRating.matchScore;
        return score >= minCompatibilityScore;
    });
    
    console.log(`📊 Filtered ${scoredRecipes.length} recipes to ${filteredByThreshold.length} above threshold (${minCompatibilityScore}%)`);
    
    // 3. Sort by score and take the top N
    const topScored = filteredByThreshold
        .sort((a, b) => (b.petRating.compatibilityScore || b.petRating.matchScore) - (a.petRating.compatibilityScore || a.petRating.matchScore))
        .slice(0, limit);

    // 4. Apply modifiers to the top N recipes
    const results = topScored.map(({ recipe, petRating }) => {
        // Convert PetNutritionProfile to pet object format expected by applyModifiers
        const petForModifiers = {
            type: profile.species,
            age: profile.ageGroup,
            breed: profile.breed || '',
            healthConcerns: profile.healthConcerns || [],
            allergies: profile.allergies || [],
            weightKg: profile.weightKg,
        };
        // Apply modifiers, which now performs the ingredient vetting lookup (Step 2 in applyModifiers)
        const { modifiedRecipe, addedIngredients, conflictCount, hasHydrationSupport } = applyModifiers(recipe, petForModifiers);

        const portionPlan = getPortionPlan(recipe, profile);

        const shoppingList: ShoppingListItem[] = [
            // 1. Original recipe ingredients (NOW VETTED AND MODIFIED with commission optimization)
            ...modifiedRecipe.ingredients.map(ing => {
                // Find the best affiliate link for this ingredient (prioritizing commission)
                const allLinks = getAllAffiliateLinks(ing.name.toLowerCase());
                const bestLink = allLinks[0]; // Already sorted by commission descending

                // Use vetted product name if available, otherwise keep original
                const vettedProduct = getVettedProduct(ing.name.toLowerCase());

                return {
                    name: vettedProduct?.productName || ing.name,
                    amount: scaleAmount(ing.amount, portionPlan.multiplier) || ing.amount,
                    asinLink: bestLink?.url || ing.asinLink, // Use best commission link
                    notes: (ing as any).notes,
                    category: (ing as any).category,
                };
            }),
            // 2. Added supplements/modifiers
            ...addedIngredients.map(add => ({
                name: add.name,
                amount: '1 dose/day', // Default amount for a supplement
                asinLink: add.amazon,
                notes: `Added for ${add.forConcern} support. Benefit: ${add.benefit}`,
                category: 'Supplement',
            })),
        ];

        // Group the shopping list items by category or name for display... (not implemented here)

        return {
            recipe: modifiedRecipe,
            adjustedIngredients: modifiedRecipe.ingredients,
            appliedRules: [], // TODO: implement applied rules
            nutritionChanges: {}, // TODO: implement nutrition changes
            portionPlan,
            shoppingList,
            explanation: '', // avoid noisy banner text
            weeklyPlan: [], // TODO: implement weekly plan
            score: petRating.compatibilityScore || petRating.matchScore,
        };
    });

    return results;
}
