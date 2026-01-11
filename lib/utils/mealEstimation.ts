/**
 * Meal Estimation Utilities
 * Calculate realistic meal counts based on actual package sizes
 */

import { getPackageSize } from '@/lib/data/packageSizes';
import { getIngredientDisplayPricing } from '@/lib/data/product-prices';

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

// Maximum cost per meal threshold (matched to commercial pet food pricing)
// Dog: $0.50-$3.50/meal, Cat: $0.75-$4.00/meal, Bird: $0.10-$0.50/meal, Reptile: $1.00-$3.00/meal
// Using $4.00 to allow better ingredient variety and quality
export const MAX_COST_PER_MEAL = 4.00;

export interface ShoppingListItem {
  id: string;
  name: string;
  amount: string; // Recipe amount (e.g., "200g", "2 tbsp", "1 tsp")
  asinLink?: string;
  category?: string;
}

function normalizeShoppingIngredientName(name: string): string {
  return String(name || '')
    .toLowerCase()
    .replace(/freeze[- ]dried/gi, '')
    .replace(/fresh is best/gi, '')
    .replace(/organic/gi, '')
    .replace(/premium/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Convert Amazon quantity strings to grams
 * Examples: "2 lbs", "24 oz", "18 count", "500 count", "32 oz", "1 head", "2 lbs"
 */
export function quantityToGrams(quantity: string): number {
  if (!quantity) return 0;
  
  const q = quantity.toLowerCase().trim();
  
  // Weight conversions
  const lbMatch = q.match(/(\d+(?:\.\d+)?)\s*(?:lb|lbs|pound|pounds)/);
  if (lbMatch) {
    return parseFloat(lbMatch[1]) * 453.592; // 1 lb = 453.592g
  }
  
  const ozMatch = q.match(/(\d+(?:\.\d+)?)\s*(?:oz|ounce|fl oz|fluid ounce)/);
  if (ozMatch) {
    return parseFloat(ozMatch[1]) * 28.3495; // 1 oz = 28.3495g
  }
  
  const kgMatch = q.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilogram)/);
  if (kgMatch) {
    return parseFloat(kgMatch[1]) * 1000;
  }
  
  const gMatch = q.match(/(\d+(?:\.\d+)?)\s*(?:g|gram)/);
  if (gMatch) {
    return parseFloat(gMatch[1]);
  }
  
  // Count-based items (assume average weights)
  const countMatch = q.match(/(\d+)\s*(?:count|egg|eggs|piece|pieces|can|cans|jar|jars|box|boxes|bag|bags|head|heads|bunch|bunches)/);
  if (countMatch) {
    const count = parseInt(countMatch[1]);
    const unit = countMatch[0].toLowerCase();
    
    // Estimate weights based on common items
    if (unit.includes('egg') || unit.includes('count')) {
      // Eggs: ~50g each
      if (q.includes('egg')) return count * 50;
      // Generic count: assume 100g per unit
      return count * 100;
    }
    if (unit.includes('can')) return count * 400; // Average can ~400g
    if (unit.includes('jar')) return count * 500; // Average jar ~500g
    if (unit.includes('box')) return count * 300; // Average box ~300g
    if (unit.includes('bag')) return count * 500; // Average bag ~500g
    if (unit.includes('head')) return count * 500; // Lettuce head ~500g
    if (unit.includes('bunch')) return count * 200; // Bunch of herbs ~200g
    
    return count * 100; // Default 100g per unit
  }
  
  return 0;
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
  if (unitStr === 'mg' || unitStr === 'milligram' || unitStr === 'milligrams') {
    const result = numAmount / 1000;
    console.log('[parseAmountToGrams] ✅ Weight (mg) conversion:', result);
    return result;
  }
  if (unitStr === 'mcg' || unitStr === 'μg' || unitStr === 'ug' || unitStr === 'microgram' || unitStr === 'micrograms') {
    const result = numAmount / 1_000_000;
    console.log('[parseAmountToGrams] ✅ Weight (mcg) conversion:', result);
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
  preferBudget: boolean = true, // Default to true for cost calculations - prefer budget-tier products
  recipeServings?: number // Optional: if ingredient amounts are per-recipe batch, divide by servings to get per-meal
): MealEstimate {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/0b2cb572-34bf-468c-9297-dd079c8c4c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mealEstimation.ts:136',message:'calculateMealsFromGroceryList entry',data:{preferBudget},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  console.log('[calculateMealsFromGroceryList] ========== Starting calculation ==========');
  console.log('[calculateMealsFromGroceryList] Input shoppingList:', shoppingList);
  console.log('[calculateMealsFromGroceryList] shoppingList.length:', shoppingList?.length);
  console.log('[calculateMealsFromGroceryList] preferBudget:', preferBudget);
  
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

    const ingredientNameNormalized = normalizeShoppingIngredientName(item.name);
    
    let packageSizeGrams = 0;
    let itemCost = 0;
    let priceSource = 'package-estimate';

    const pricing = getIngredientDisplayPricing(ingredientNameNormalized);
    const packagePrice = Number(pricing?.packagePrice);
    if (Number.isFinite(packagePrice) && packagePrice > 0) {
      itemCost = packagePrice;
      priceSource = pricing?.priceSource || 'package-estimate';
      console.log(`[calculateMealsFromGroceryList]   ✅ Using display pricing (${priceSource}) price: $${itemCost}`);
    }

    const quantity = pricing?.quantity;
    if (quantity) {
      const gramsFromQuantity = quantityToGrams(quantity);
      if (gramsFromQuantity > 0) {
        packageSizeGrams = gramsFromQuantity;
        console.log(`[calculateMealsFromGroceryList]   ✅ Using display pricing quantity: "${quantity}" = ${packageSizeGrams}g`);
      }
    }
    
    // Fall back to package size estimates if no product data
    if (packageSizeGrams === 0) {
      const packageInfo = getPackageSize(item.name, item.category);
      packageSizeGrams = packageInfo.typicalSize;
      if (!itemCost) {
        itemCost = packageInfo.estimatedCost;
      }
      console.log(`[calculateMealsFromGroceryList]   ⚠️ Using package estimate: ${packageSizeGrams}g, $${itemCost}`);
    }

    if (packageSizeGrams <= 0) {
      console.log(`[calculateMealsFromGroceryList]   ❌ Skipping - invalid packageSizeGrams:`, packageSizeGrams);
      notes.push(`⚠️ Could not determine package size for ${item.name}`);
      continue;
    }
    
    // Parse recipe amount to grams
    const parsedBatchGrams = parseAmountToGrams(item.amount);
    const servingsRaw = typeof recipeServings === 'number' ? recipeServings : NaN;
    const servings = Number.isFinite(servingsRaw) && servingsRaw > 0 ? servingsRaw : 1;
    const recipeGrams = parsedBatchGrams / servings;
    console.log(`[calculateMealsFromGroceryList]   Recipe amount input: "${item.amount}" (type: ${typeof item.amount})`);
    console.log(`[calculateMealsFromGroceryList]   Recipe grams parsed (batch):`, parsedBatchGrams);
    console.log(`[calculateMealsFromGroceryList]   Recipe servings:`, servings);
    console.log(`[calculateMealsFromGroceryList]   Recipe grams per meal (derived):`, recipeGrams);
    
    if (recipeGrams <= 0) {
      console.log(`[calculateMealsFromGroceryList]   ❌ Skipping - invalid recipeGrams:`, recipeGrams);
      notes.push(`⚠️ Could not parse amount for ${item.name}: "${item.amount}"`);
      continue;
    }
    
    // How many meals can this package make? Keep as decimal for accurate calculation
    const mealsFromPackage = packageSizeGrams / recipeGrams;
    console.log(`[calculateMealsFromGroceryList]   Meals from package: ${packageSizeGrams} / ${recipeGrams} = ${mealsFromPackage}`);
    
    const breakdownItem = {
      ingredient: item.name,
      recipeAmount: recipeGrams,
      packageSize: packageSizeGrams,
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
  
  // ✅ FIX: Floor the final result (not individual ingredients) to get whole meals
  // This gives accurate estimates without compounding rounding errors
  const finalMeals = Math.max(1, Math.floor(estimatedMeals));
  const amortizedCostPerMealRaw = breakdown.reduce((sum, b) => {
    const denom = typeof b.mealsFromPackage === 'number' && Number.isFinite(b.mealsFromPackage) && b.mealsFromPackage > 0 ? b.mealsFromPackage : 0;
    if (denom <= 0) return sum;
    const perMeal = b.packageCost / denom;
    return sum + (Number.isFinite(perMeal) && perMeal > 0 ? perMeal : 0);
  }, 0);
  const costPerMeal = amortizedCostPerMealRaw;
  console.log('[calculateMealsFromGroceryList] Final meals after rounding:', finalMeals);
  console.log('[calculateMealsFromGroceryList] Cost per meal (amortized):', costPerMeal);
  
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

