/**
 * Utility functions for calculating how many meals a shopping list will provide
 */

/**
 * Parse an amount string (e.g., "200g", "1 cup", "500g") and return grams
 * Assumes "g" means grams, otherwise returns 0 if unable to parse
 */
export function parseAmountToGrams(amount: string): number {
  if (!amount) return 0;
  
  // Try to extract number from string like "200g", "500g", etc.
  const match = amount.match(/(\d+(?:\.\d+)?)\s*g/i);
  if (match) {
    return parseFloat(match[1]);
  }
  
  // Try to extract just a number if it's only a number
  const numberMatch = amount.match(/(\d+(?:\.\d+)?)/);
  if (numberMatch) {
    return parseFloat(numberMatch[1]);
  }
  
  return 0;
}

/**
 * Calculate how many meals a shopping list will provide based on recommended servings
 * @param ingredients - Shopping list ingredients with amounts
 * @param selectedIngredients - Original ingredient selections with grams
 * @param totalGrams - Total grams in the recipe
 * @param recommendedServingGrams - Recommended serving size in grams for the entire meal
 * @returns Number of meals the shopping list will provide (minimum across all ingredients)
 */
export function calculateMealsFromShoppingList(
  ingredients: Array<{ id: string; name: string; amount: string }>,
  selectedIngredients: Array<{ key: string; grams: number }>,
  totalGrams: number,
  recommendedServingGrams: number
): number {
  console.log('[calculateMealsFromShoppingList] Starting calculation with:', {
    ingredientsCount: ingredients.length,
    selectedIngredientsCount: selectedIngredients.length,
    totalGrams,
    recommendedServingGrams
  });

  if (!ingredients.length || !selectedIngredients.length || totalGrams === 0 || recommendedServingGrams === 0) {
    console.log('[calculateMealsFromShoppingList] Early return - invalid inputs');
    return 0;
  }

  // Create a map of ingredient key to grams per meal
  const ingredientGramsMap = new Map<string, number>();
  selectedIngredients.forEach(ing => {
    const gramsPerMeal = (ing.grams / totalGrams) * recommendedServingGrams;
    ingredientGramsMap.set(ing.key, gramsPerMeal);
    console.log(`[calculateMealsFromShoppingList] Mapped ${ing.key} -> ${gramsPerMeal.toFixed(2)}g per meal`);
  });

  // Calculate meals for each ingredient
  const mealsPerIngredient: number[] = [];

  ingredients.forEach(ing => {
    const purchasedGrams = parseAmountToGrams(ing.amount);
    console.log(`[calculateMealsFromShoppingList] Processing ingredient: ${ing.name} (id: ${ing.id}), purchased: ${purchasedGrams}g`);
    
    // Try to find by id first
    let gramsPerMeal = ingredientGramsMap.get(ing.id);
    
    // Fallback: try to match by name (for cases where id doesn't match key exactly)
    if (!gramsPerMeal) {
      console.log(`[calculateMealsFromShoppingList] No match by id ${ing.id}, trying name matching...`);
      // Try to find a matching selected ingredient by comparing normalized names
      const normalizedIngName = ing.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      for (const [key, grams] of ingredientGramsMap.entries()) {
        const normalizedKey = key.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        if (normalizedKey === normalizedIngName || normalizedIngName.includes(normalizedKey) || normalizedKey.includes(normalizedIngName)) {
          gramsPerMeal = grams;
          console.log(`[calculateMealsFromShoppingList] Found match by name: ${key} -> ${gramsPerMeal.toFixed(2)}g per meal`);
          break;
        }
      }
    } else {
      console.log(`[calculateMealsFromShoppingList] Found match by id: ${ing.id} -> ${gramsPerMeal.toFixed(2)}g per meal`);
    }
    
    if (purchasedGrams > 0 && gramsPerMeal && gramsPerMeal > 0) {
      const meals = purchasedGrams / gramsPerMeal;
      console.log(`[calculateMealsFromShoppingList] ${ing.name}: ${purchasedGrams}g / ${gramsPerMeal.toFixed(2)}g = ${meals.toFixed(2)} meals`);
      mealsPerIngredient.push(meals);
    } else {
      console.log(`[calculateMealsFromShoppingList] Skipping ${ing.name}: purchasedGrams=${purchasedGrams}, gramsPerMeal=${gramsPerMeal}`);
    }
  });

  if (mealsPerIngredient.length === 0) {
    console.log('[calculateMealsFromShoppingList] No valid meal calculations found');
    return 0;
  }

  // Return the minimum (bottleneck ingredient)
  const minMeals = Math.floor(Math.min(...mealsPerIngredient));
  console.log(`[calculateMealsFromShoppingList] Final result: ${minMeals} meals (from ${mealsPerIngredient.map(m => m.toFixed(2)).join(', ')})`);
  return minMeals;
}

