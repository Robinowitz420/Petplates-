import type { Recipe, ModifiedRecipeResult, PetNutritionProfile, PortionPlan, ShoppingListItem, WeeklyPlanEntry, AppliedModifierSummary } from './types';
import { recipes } from './data/recipes-complete';
import { dogModifiers } from './data/nutrition-dog-modifiers';
import { catModifiers } from './data/nutrition-cat-modifiers';
import { scoreRecipe } from './scoreRecipe';
import { getPortionPlan } from './portionCalc';
import { scaleAmount } from './portionCalc';
import { getVettedProduct, getAllAffiliateLinks } from './data/vetted-products'; // <--- UPDATED to use expanded vetted products with commission optimization

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

export function applyModifiers(recipe: Recipe, pet: any): ApplyModifiersResult & { conflictCount: number; hasHydrationSupport: boolean } {
  const modifiers = pet.type === 'dogs' ? dogModifiers : pet.type === 'cats' ? catModifiers : {};
  const modifiedRecipe: Recipe = JSON.parse(JSON.stringify(recipe)); // Deep clone to modify

  let addedIngredients: ApplyModifiersResult['addedIngredients'] = [];
  let conflictCount = 0;
  let hasHydrationSupport = false;

  // 1. Apply Health Concern Modifiers (Supplements/Additions)
  for (const concern of pet.healthConcerns || []) {
    const modKey = concernToModifierKey[concern.toLowerCase()];
    if (modKey && (modifiers as any)[modKey]) {
      const modifier = (modifiers as any)[modKey];

      // Add supplements required by the modifier
      for (const supplement of modifier.add) {
        // Check if there's a vetted product for this supplement
        const vettedProduct = getVettedProduct(supplement.name);
        addedIngredients.push({
          name: vettedProduct?.productName || supplement.name,
          benefit: supplement.benefit,
          amazon: vettedProduct?.amazonLink || supplement.amazon, // Use vetted link if available
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
    const vettedProduct = getVettedProduct(ing.name);
    if (vettedProduct) {
        // Overwrite the generic ingredient details with the Vetted Product details
        return {
            ...ing,
            name: vettedProduct.productName, // Use the specific product name
            productName: vettedProduct.productName, // Set the specific product name
            amazonLink: vettedProduct.amazonLink, // Use the specific affiliate link
            notes: ing.notes ? `${ing.notes} | VET NOTE: ${vettedProduct.vetNote}` : `VET NOTE: ${vettedProduct.vetNote}`,
        };
    }
    // If no vetted product, remove amazonLink to ensure only vetted products have buy links
    return {
      ...ing,
      amazonLink: undefined,
    };
  });

  // 3. Map Supplements to Vetted Products (ensure all buy links are vetted)
  if (modifiedRecipe.supplements) {
    modifiedRecipe.supplements = modifiedRecipe.supplements.map(supplement => {
      const vettedProduct = getVettedProduct(supplement.name);
      if (vettedProduct) {
        return {
          ...supplement,
          name: vettedProduct.productName,
          productName: vettedProduct.productName,
          amazonLink: vettedProduct.amazonLink,
          notes: supplement.notes ? `${supplement.notes} | VET NOTE: ${vettedProduct.vetNote}` : `VET NOTE: ${vettedProduct.vetNote}`,
        };
      }
      // If no vetted product, remove amazonLink to ensure only vetted products have buy links
      return {
        ...supplement,
        amazonLink: undefined,
      };
    });
  }

  return {
    modifiedRecipe,
    addedIngredients,
    conflictCount,
    hasHydrationSupport,
  };
}

export function generateModifiedRecommendations({ profile, recipeIds, limit }: { profile: PetNutritionProfile, recipeIds: string[], limit: number }): ModifiedRecipeResult[] {
    // NOTE: 'recipes' is imported from './data/recipes-complete'
    const allRecipesForCategory = recipes.filter(r => r.category === profile.species);
    const targetRecipes = recipeIds.length > 0
        ? allRecipesForCategory.filter(r => recipeIds.includes(r.id))
        : allRecipesForCategory.slice(0, 50); // Use a subset if no IDs provided

    // 1. Score all recipes
    const scoredRecipes = targetRecipes.map(recipe => {
        const petRating = scoreRecipe(recipe, profile);
        return { recipe, petRating };
    });

    // 2. Sort by score and take the top N
    const topScored = scoredRecipes
        .sort((a, b) => b.petRating.matchScore - a.petRating.matchScore)
        .slice(0, limit);

    // 3. Apply modifiers to the top N recipes
    const results = topScored.map(({ recipe, petRating }) => {
        // Apply modifiers, which now performs the ingredient vetting lookup (Step 2 in applyModifiers)
        const { modifiedRecipe, addedIngredients, conflictCount, hasHydrationSupport } = applyModifiers(recipe, profile);

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
                    amazonLink: bestLink?.url || ing.amazonLink, // Use best commission link
                    notes: ing.notes,
                    category: ing.category,
                };
            }),
            // 2. Added supplements/modifiers
            ...addedIngredients.map(add => ({
                name: add.name,
                amount: '1 dose/day', // Default amount for a supplement
                amazonLink: add.amazon,
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
            explanation: 'Recipe modified for pet profile',
            weeklyPlan: [], // TODO: implement weekly plan
            score: petRating.matchScore,
        };
    });

    return results;
}
