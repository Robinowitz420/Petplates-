# Debug: Meal Calculation Issue

## User Report
- **Estimated Meals:** 1
- **Total Cost:** $52.72
- **Cost Per Meal:** $52.72/meal

This indicates the calculation is returning 1 meal when it should be much higher.

## Expected Behavior
If a recipe uses 200g of chicken and a package is 1000g, it should make 5 meals, not 1.

## Possible Causes

### 1. Recipe amounts not being parsed correctly
- Recipe format: `"200g"` 
- Parser regex: `/(\d+(?:\.\d+)?)\s*(.*)/i`
- Should match: `["200g", "200", "g"]`
- If this fails, `parseAmountToGrams` returns 0

### 2. Package sizes are wrong
- Package sizes come from `product-prices.json` or `packageSizes.ts`
- If package size is 0 or very small, calculation will be wrong

### 3. Calculation logic issue
- Formula: `mealsFromPackage = packageSizeGrams / recipeGrams`
- If `recipeGrams` is very large or `packageSizeGrams` is very small, result will be < 1
- Then `Math.floor(estimatedMeals)` ensures at least 1 meal

## Debug Steps

### Check Console Logs
The calculation has extensive logging. Check browser console for:
```
[parseAmountToGrams] Input - amount: ...
[parseAmountToGrams] Parsed - numAmount: ... unitStr: ...
[calculateMealsFromGroceryList] Recipe grams parsed: ...
[calculateMealsFromGroceryList] Meals from package: ... / ... = ...
```

### Check Breakdown Data
The `estimate.breakdown` array shows per-ingredient calculations:
```typescript
{
  ingredient: "chicken",
  recipeAmount: 200,  // Should be > 0
  packageSize: 1000,  // Should be > 0
  mealsFromPackage: 5, // Should be packageSize / recipeAmount
  packageCost: 10.99
}
```

### Manual Test
1. Open browser console
2. Generate a recipe
3. Look for the calculation logs
4. Check if `recipeAmount` and `packageSize` are correct

## Likely Issue

Based on the $52.72 cost for 1 meal, this suggests:
- Either ALL ingredients are returning very low meal counts (< 1 each)
- OR the recipe amounts are being parsed as 0 or very small values
- OR the package sizes are being retrieved as 0 or very small values

The fact that it's exactly 1 meal suggests the `Math.max(1, Math.floor(estimatedMeals))` safety check is kicking in, meaning the actual calculation is returning < 1.

## Next Steps

1. Check browser console logs to see actual values
2. If `recipeGrams` is 0 or very small → parsing issue
3. If `packageSizeGrams` is 0 or very small → package size retrieval issue
4. If both are correct but result is still wrong → calculation logic issue
