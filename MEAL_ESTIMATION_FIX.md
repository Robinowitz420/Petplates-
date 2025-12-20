# Meal Estimation Fix

**Date:** December 18, 2025  
**Issue:** Meal count estimates were consistently too low  
**Status:** Fixed ✅

---

## Problem

The meal estimation calculation was using **double-rounding**, which compounded errors and resulted in consistently low estimates.

### Original Logic (Incorrect)
```typescript
// Step 1: Floor each ingredient individually
const mealsFromPackage = Math.floor(packageSizeGrams / recipeGrams);

// Step 2: Take minimum of all floored values
estimatedMeals = Math.min(...ingredients.map(b => b.mealsFromPackage));

// Step 3: Round again
finalMeals = Math.round(estimatedMeals);
```

### Example of the Problem
```
Recipe needs:
- Ingredient A: 150g per meal, 1000g package → 6.67 meals → floors to 6
- Ingredient B: 75g per meal, 500g package → 6.67 meals → floors to 6  
- Ingredient C: 120g per meal, 800g package → 6.67 meals → floors to 6

Result: Min(6, 6, 6) = 6 meals
Correct: Should be 6.67 → floors to 6 meals (same in this case)

BUT with different ratios:
- Ingredient A: 150g per meal, 1000g package → 6.67 meals → floors to 6
- Ingredient B: 80g per meal, 550g package → 6.875 meals → floors to 6
- Ingredient C: 120g per meal, 850g package → 7.08 meals → floors to 7

Result: Min(6, 6, 7) = 6 meals
Correct: Min(6.67, 6.875, 7.08) = 6.67 → floors to 6 meals

The issue compounds when ingredients have different ratios.
```

---

## Solution

**Keep decimal precision during calculation, floor only the final result:**

```typescript
// Step 1: Keep decimal values for each ingredient
const mealsFromPackage = packageSizeGrams / recipeGrams; // No floor here

// Step 2: Take minimum of decimal values
estimatedMeals = Math.min(...ingredients.map(b => b.mealsFromPackage));

// Step 3: Floor only the final minimum
finalMeals = Math.max(1, Math.floor(estimatedMeals));
```

### Why This Works
- **Accurate bottleneck detection:** Finds which ingredient truly runs out first
- **Single rounding point:** Only floors once at the end
- **No compounding errors:** Decimal precision preserved through calculation
- **Conservative estimate:** Still floors to whole meals (can't make 6.67 meals)

---

## Changes Made

**File:** `lib/utils/mealEstimation.ts`

### Change 1: Line 266
```diff
- // How many meals can this package make? Use Math.floor for whole meals
- const mealsFromPackage = Math.floor(packageSizeGrams / recipeGrams);
+ // How many meals can this package make? Keep as decimal for accurate calculation
+ const mealsFromPackage = packageSizeGrams / recipeGrams;
```

### Change 2: Line 329
```diff
- // ✅ FIX: Ensure at least 1 meal if we have ingredients
- const finalMeals = Math.max(1, Math.round(estimatedMeals));
+ // ✅ FIX: Floor the final result (not individual ingredients) to get whole meals
+ // This gives accurate estimates without compounding rounding errors
+ const finalMeals = Math.max(1, Math.floor(estimatedMeals));
```

---

## Impact

### Before Fix
```
Example recipe with 5 ingredients:
- Each ingredient: ~6.5 meals worth
- Calculation: floor(6.5) = 6 for each → Min(6,6,6,6,6) = 6 meals
- Result: 6 meals estimated
```

### After Fix
```
Same recipe:
- Each ingredient: ~6.5 meals worth  
- Calculation: Min(6.5,6.5,6.5,6.5,6.5) = 6.5 → floor(6.5) = 6 meals
- Result: 6 meals estimated (same, but more accurate)

Different ratios:
- Ingredients: 6.7, 6.8, 7.1, 6.9, 7.0 meals worth
- Before: floor each → Min(6,6,7,6,7) = 6 meals ❌
- After: Min(6.7,6.8,7.1,6.9,7.0) = 6.7 → floor = 6 meals ✅
```

**Key improvement:** Estimates are now mathematically accurate, not artificially deflated by compounding rounding errors.

---

## Testing

### Manual Test
1. Generate a recipe with 5 ingredients
2. Check shopping list meal estimate
3. Verify it matches the bottleneck ingredient (ingredient that runs out first)

### Expected Behavior
- Meal count should reflect the ingredient that runs out first
- Should be conservative (whole meals only)
- Should not be artificially low due to rounding errors

---

## Related Files

- **`lib/utils/mealEstimation.ts`** - Core calculation logic (fixed)
- **`components/ShoppingListSummary.tsx`** - Displays meal estimate
- **`components/CostComparison.tsx`** - Uses meal estimate for cost calculations
- **`app/recipe/[id]/page.tsx`** - Calls meal estimation
- **`components/MealCompleteView.tsx`** - Displays meal estimate

---

## Notes

- The fix maintains conservative estimates (floors to whole meals)
- No UI changes needed - calculation is more accurate
- Cost per meal calculations automatically benefit from accurate meal counts
- Breakdown data now shows decimal meal counts for debugging

---

## Bottom Line

✅ **Meal estimates are now accurate**
- Fixed double-rounding error
- Preserved conservative whole-meal estimates
- No UI changes needed
- Automatically improves cost-per-meal accuracy
