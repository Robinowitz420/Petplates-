/**
 * Meal Estimation Utilities
 * Calculate realistic meal counts based on actual package sizes
 */

import { getPackageSize } from '@/lib/data/packageSizes';
import { getVettedProduct, getVettedProductByAnyIdentifier, getGenericIngredientName } from '@/lib/data/vetted-products';

export interface MealEstimate {
  estimatedMeals: number;
  totalCost: number;
  costPerMeal: number;
  breakdown: Array<{
    ingredient: string;
    recipeAmount: number; // grams needed per meal
    packageSize: number; // grams in package
    mealsFromPackage: number;
    packageCost: number;
  }>;
  notes: string[];
  exceedsBudget?: boolean; // True if costPerMeal > MAX_COST_PER_MEAL
}

// Maximum cost per meal threshold
export const MAX_COST_PER_MEAL = 4.50;

export interface ShoppingListItem {
  id: string;
  name: string;
  amount: string; // Recipe amount (e.g., "200g", "2 tbsp", "1 tsp")
  asinLink?: string;
  category?: string;
}

/**
 * Convert various units to grams
 */
export function parseAmountToGrams(amount: string | number, unit?: string): number {
  console.log('[parseAmountToGrams] Input - amount:', amount, 'unit:', unit);
  
  let numAmount: number;
  let unitStr: string;
  
  if (typeof amount === 'string') {
    // Try to parse amount and unit from string like "200g", "2 tbsp", etc.
    const match = amount.match(/(\d+(?:\.\d+)?)\s*(.*)/i);
    console.log('[parseAmountToGrams] Regex match result:', match);
    if (match) {
      numAmount = parseFloat(match[1]);
      unitStr = (match[2] || unit || 'g').trim().toLowerCase();
      console.log('[parseAmountToGrams] Parsed - numAmount:', numAmount, 'unitStr:', unitStr);
    } else {
      numAmount = parseFloat(amount) || 0;
      unitStr = (unit || 'g').toLowerCase();
      console.log('[parseAmountToGrams] No match, using parseFloat - numAmount:', numAmount, 'unitStr:', unitStr);
    }
  } else {
    numAmount = amount;
    unitStr = (unit || 'g').toLowerCase();
    console.log('[parseAmountToGrams] Number input - numAmount:', numAmount, 'unitStr:', unitStr);
  }
  
  if (!numAmount || isNaN(numAmount)) {
    console.log('[parseAmountToGrams] ❌ Invalid amount, returning 0');
    return 0;
  }
  
  // Weight conversions
  if (unitStr === 'g' || unitStr === 'gram' || unitStr === 'grams') {
    console.log('[parseAmountToGrams] ✅ Weight (g) conversion:', numAmount);
    return numAmount;
  }
  if (unitStr === 'kg' || unitStr === 'kilogram' || unitStr === 'kilograms') {
    const result = numAmount * 1000;
    console.log('[parseAmountToGrams] ✅ Weight (kg) conversion:', result);
    return result;
  }
  if (unitStr === 'lb' || unitStr === 'pound' || unitStr === 'pounds') {
    const result = numAmount * 453.592;
    console.log('[parseAmountToGrams] ✅ Weight (lb) conversion:', result);
    return result;
  }
  if (unitStr === 'oz' || unitStr === 'ounce' || unitStr === 'ounces') {
    const result = numAmount * 28.3495;
    console.log('[parseAmountToGrams] ✅ Weight (oz) conversion:', result);
    return result;
  }
  
  // Volume conversions (approximate, assuming water density for liquids)
  if (unitStr === 'ml' || unitStr === 'milliliter' || unitStr === 'milliliters') {
    console.log('[parseAmountToGrams] ✅ Volume (ml) conversion:', numAmount);
    return numAmount; // ~1:1 for water
  }
  if (unitStr === 'l' || unitStr === 'liter' || unitStr === 'liters') {
    const result = numAmount * 1000;
    console.log('[parseAmountToGrams] ✅ Volume (l) conversion:', result);
    return result;
  }
  if (unitStr === 'cup' || unitStr === 'cups') {
    const result = numAmount * 240;
    console.log('[parseAmountToGrams] ✅ Volume (cup) conversion:', result);
    return result; // ~240g for water
  }
  if (unitStr === 'tbsp' || unitStr === 'tablespoon' || unitStr === 'tablespoons') {
    const result = numAmount * 15;
    console.log('[parseAmountToGrams] ✅ Volume (tbsp) conversion:', result);
    return result; // ~15g for water
  }
  if (unitStr === 'tsp' || unitStr === 'teaspoon' || unitStr === 'teaspoons') {
    const result = numAmount * 5;
    console.log('[parseAmountToGrams] ✅ Volume (tsp) conversion:', result);
    return result; // ~5g for water
  }
  
  // Count conversions (rough estimates)
  if (unitStr === 'piece' || unitStr === 'pieces' || unitStr === 'whole' || unitStr === 'pinch' || unitStr === 'pinches') {
    const result = numAmount * 10;
    console.log('[parseAmountToGrams] ✅ Count conversion:', result);
    return result; // Assume 10g per piece/pinch (conservative estimate)
  }
  
  // Default: assume grams
  console.log('[parseAmountToGrams] ⚠️ Unknown unit, defaulting to grams:', numAmount);
  return numAmount;
}

/**
 * Calculate how many meals can be made from a shopping list
 * based on actual package sizes
 */
export function calculateMealsFromGroceryList(
  shoppingList: ShoppingListItem[],
  recipeGramsPerMeal?: number, // Optional: total recipe grams per meal
  species?: string, // Optional: species for species-aware product matching
  preferBudget: boolean = true // Default to true for cost calculations - prefer budget-tier products
): MealEstimate {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/0b2cb572-34bf-468c-9297-dd079c8c4c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mealEstimation.ts:136',message:'calculateMealsFromGroceryList entry',data:{hasGetGenericIngredientName:typeof getGenericIngredientName !== 'undefined',hasGetVettedProduct:typeof getVettedProduct !== 'undefined',preferBudget},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  console.log('[calculateMealsFromGroceryList] ========== Starting calculation ==========');
  console.log('[calculateMealsFromGroceryList] Input shoppingList:', shoppingList);
  console.log('[calculateMealsFromGroceryList] shoppingList.length:', shoppingList?.length);
  console.log('[calculateMealsFromGroceryList] getGenericIngredientName available:', typeof getGenericIngredientName !== 'undefined');
  
  const breakdown: MealEstimate['breakdown'] = [];
  const notes: string[] = [];
  let totalCost = 0;
  
  if (!shoppingList || shoppingList.length === 0) {
    console.log('[calculateMealsFromGroceryList] ❌ Empty shopping list, returning 0 meals');
    return {
      estimatedMeals: 0,
      totalCost: 0,
      costPerMeal: 0,
      breakdown: [],
      notes: ['No ingredients in shopping list']
    };
  }
  
  // Calculate for each ingredient
  for (let i = 0; i < shoppingList.length; i++) {
    const item = shoppingList[i];
    console.log(`[calculateMealsFromGroceryList] Processing item ${i + 1}/${shoppingList.length}:`, item);
    
    const packageInfo = getPackageSize(item.name, item.category);
    console.log(`[calculateMealsFromGroceryList]   Package info:`, packageInfo);
    
    // Try to get vetted product price (same source as ShoppingList uses)
    // For budget-aware lookups, try to get generic ingredient name from productName
    let itemCost = packageInfo.estimatedCost;
    let priceSource = 'package-estimate';
    const ingredientNameLower = item.name.toLowerCase();
    
    // Try to reverse-lookup generic ingredient name if we have a specific productName
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/0b2cb572-34bf-468c-9297-dd079c8c4c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mealEstimation.ts:171',message:'Before getGenericIngredientName call',data:{itemName:item.name,hasFunction:typeof getGenericIngredientName !== 'undefined'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    let genericIngredientName: string | undefined;
    if (typeof getGenericIngredientName !== 'undefined') {
      genericIngredientName = getGenericIngredientName(item.name);
    }
    const lookupName = genericIngredientName || ingredientNameLower;
    
    // Pass species for species-aware product matching (if provided), preferBudget for cost control
    let vettedProduct = getVettedProduct(lookupName, species, preferBudget);
    if (!vettedProduct) {
      // Fallback: try direct lookup by the item name
      vettedProduct = getVettedProduct(ingredientNameLower, species, preferBudget);
    }
    if (!vettedProduct) {
      vettedProduct = getVettedProductByAnyIdentifier(item.name, species, preferBudget);
    }
    
    if (vettedProduct?.price?.amount) {
      itemCost = vettedProduct.price.amount;
      priceSource = 'vetted-product';
      console.log(`[calculateMealsFromGroceryList]   ✅ Using vetted product price: $${itemCost} (from ${vettedProduct.productName})`);
    } else {
      console.log(`[calculateMealsFromGroceryList]   ⚠️ No vetted product price found, using package estimate: $${itemCost}`);
    }
    
    // Parse recipe amount to grams
    const recipeGrams = parseAmountToGrams(item.amount);
    console.log(`[calculateMealsFromGroceryList]   Recipe grams parsed:`, recipeGrams);
    
    if (recipeGrams <= 0) {
      console.log(`[calculateMealsFromGroceryList]   ❌ Skipping - invalid recipeGrams:`, recipeGrams);
      continue;
    }
    
    // How many meals can this package make? Use Math.floor for whole meals
    const mealsFromPackage = Math.floor(packageInfo.typicalSize / recipeGrams);
    console.log(`[calculateMealsFromGroceryList]   Meals from package: ${packageInfo.typicalSize} / ${recipeGrams} = ${mealsFromPackage}`);
    
    const breakdownItem = {
      ingredient: item.name,
      recipeAmount: recipeGrams,
      packageSize: packageInfo.typicalSize,
      mealsFromPackage: mealsFromPackage,
      packageCost: itemCost,
    };
    breakdown.push(breakdownItem);
    console.log(`[calculateMealsFromGroceryList]   ✅ Added to breakdown (price source: ${priceSource}):`, breakdownItem);
    
    totalCost += itemCost;
    
    // Add notes for very small or very large ratios
    if (mealsFromPackage > 100) {
      notes.push(`${item.name}: Package will last 100+ meals`);
    } else if (mealsFromPackage < 5) {
      notes.push(`${item.name}: Package only makes ${Math.round(mealsFromPackage)} meals - consider larger size`);
    }
  }
  
  console.log('[calculateMealsFromGroceryList] Breakdown array after processing:', breakdown);
  console.log('[calculateMealsFromGroceryList] breakdown.length:', breakdown.length);
  console.log('[calculateMealsFromGroceryList] Total cost so far:', totalCost);
  
  if (breakdown.length === 0) {
    console.log('[calculateMealsFromGroceryList] ❌ No valid breakdown items, returning 0 meals');
    return {
      estimatedMeals: 0,
      totalCost: 0,
      costPerMeal: 0,
      breakdown: [],
      notes: ['Could not parse ingredient amounts']
    };
  }
  
  // Filter out staples (ingredients lasting 100+ meals) - they shouldn't limit the calculation
  const substantialIngredients = breakdown.filter(b => b.mealsFromPackage < 100);
  console.log('[calculateMealsFromGroceryList] Substantial ingredients (< 100 meals):', substantialIngredients);
  console.log('[calculateMealsFromGroceryList] substantialIngredients.length:', substantialIngredients.length);
  
  // ✅ FIX: Handle empty array from Math.min - ensure we never pass empty array
  let estimatedMeals = 0;
  if (substantialIngredients.length > 0) {
    estimatedMeals = Math.min(...substantialIngredients.map(b => b.mealsFromPackage));
  } else if (breakdown.length > 0) {
    estimatedMeals = Math.min(...breakdown.map(b => b.mealsFromPackage));
  } else {
    console.error('[calculateMealsFromGroceryList] ❌ No valid ingredients in breakdown after processing');
    return {
      estimatedMeals: 0,
      totalCost: 0,
      costPerMeal: 0,
      breakdown: [],
      notes: ['Could not calculate meals from provided ingredients - no valid data after processing']
    };
  }
  console.log('[calculateMealsFromGroceryList] Estimated meals (before rounding):', estimatedMeals);
  
  // ✅ FIX: Ensure at least 1 meal if we have ingredients
  const finalMeals = Math.max(1, Math.round(estimatedMeals));
  const costPerMeal = finalMeals > 0 ? totalCost / finalMeals : 0;
  console.log('[calculateMealsFromGroceryList] Final meals after rounding:', finalMeals);
  console.log('[calculateMealsFromGroceryList] Cost per meal:', costPerMeal);
  
  // Check if cost exceeds budget threshold
  const finalCostPerMeal = Math.round(costPerMeal * 100) / 100;
  const exceedsBudget = finalCostPerMeal > MAX_COST_PER_MEAL;
  
  // Add general notes
  if (finalMeals < 5) {
    notes.push('⚠️ Some packages are small - consider buying larger sizes');
  } else if (finalMeals > 20) {
    notes.push('✓ Great value - ingredients will last many meals');
  }
  
  // Add budget warning if exceeded
  if (exceedsBudget) {
    notes.push(`⚠️ Cost per meal ($${finalCostPerMeal.toFixed(2)}) exceeds the $${MAX_COST_PER_MEAL} target. Consider choosing cheaper ingredient alternatives.`);
  }
  
  const finalResult = {
    estimatedMeals: finalMeals,
    totalCost: Math.round(totalCost * 100) / 100,
    costPerMeal: finalCostPerMeal,
    breakdown,
    notes: [...new Set(notes)], // Remove duplicates
    exceedsBudget,
  };
  
  console.log('[calculateMealsFromGroceryList] ✅ Final result:', finalResult);
  if (exceedsBudget) {
    console.log(`[calculateMealsFromGroceryList] ⚠️  WARNING: Cost per meal exceeds $${MAX_COST_PER_MEAL}`);
  }
  console.log('[calculateMealsFromGroceryList] ============================================');
  
  return finalResult;
}

