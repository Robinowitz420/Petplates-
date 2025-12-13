# Debugging: Shopping Summary Components Not Displaying

## Problem Summary
`ShoppingListSummary` and `CostComparison` components are not displaying in the sidebar of `MealCompleteView`, despite having ingredients with ASIN links and extensive debugging/logging in place.

## What We're Trying to Achieve
We want to display:
1. **ShoppingListSummary** - Shows estimated meals, total cost, cost per meal from a shopping list
2. **CostComparison** - Compares homemade meal costs vs commercial pet food

These components should appear in the right sidebar when a user has created a custom meal with ingredients that have purchase links.

## Current Implementation

### Component Location
The components should render in the sidebar section of `MealCompleteView.tsx`:

```tsx
{/* Sidebar */}
<aside className="lg:col-span-1 space-y-6">
  {/* TEST: Verify sidebar is rendering */}
  <div className="bg-red-500 p-4 text-white rounded-lg mb-4">
    <div className="font-bold">🔍 SIDEBAR DEBUG</div>
    <div>ingredientsWithASINs.length: {ingredientsWithASINs.length}</div>
    <div>selectedIngredients.length: {selectedIngredients.length}</div>
    <div>Sidebar condition check: {ingredientsWithASINs.length > 0 ? 'TRUE ✅' : 'FALSE ❌'}</div>
  </div>
  
  {/* Shopping Summary */}
  {ingredientsWithASINs.length > 0 && (
    <>
      <ShoppingListSummary shoppingList={ingredientsWithASINs.map(ing => ({
        id: ing.id,
        name: ing.name,
        amount: ing.amount
      }))} />
      {mealEstimateForCost && mealEstimateForCost.costPerMeal > 0 && (
        <CostComparison 
          costPerMeal={mealEstimateForCost.costPerMeal}
          totalCost={mealEstimateForCost.totalCost}
          estimatedMeals={mealEstimateForCost.estimatedMeals}
        />
      )}
    </>
  )}
</aside>
```

### Data Flow

#### 1. Ingredients with ASINs Calculation
`ingredientsWithASINs` is calculated from `selectedIngredients`:

```tsx
const ingredientsWithASINs = useMemo(() => {
  console.log('[MealCompleteView] ========== ingredientsWithASINs Calculation ==========');
  console.log('[MealCompleteView] selectedIngredients:', selectedIngredients);
  
  const result = selectedIngredients
    .map((ing, index) => {
      const displayName = getIngredientDisplayName(ing.key);
      const ingredientName = displayName.toLowerCase();
      const vettedProduct = getVettedProduct(ingredientName);
      const link = vettedProduct?.asinLink || vettedProduct?.purchaseLink;
      
      if (link) {
        return {
          id: ing.key,
          name: vettedProduct?.productName || displayName,
          amount: `${ing.grams}g`,
          asinLink: ensureSellerId(link)
        };
      }
      return null;
    })
    .filter(Boolean) as Array<{ id: string; name: string; amount: string; asinLink: string }>;
  
  return result;
}, [selectedIngredients, getIngredientDisplayName]);
```

**Note**: In `recipe-builder/page.tsx`, `getIngredientDisplayName` is passed as:
```tsx
getIngredientDisplayName={(key) => key}
```
This might be causing issues if ingredient keys don't match vetted product names.

#### 2. ShoppingListSummary Component
The component calculates meals internally:

```tsx
export function ShoppingListSummary({ shoppingList, className = '' }: ShoppingListSummaryProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  
  const estimate = useMemo(() => {
    if (!shoppingList || shoppingList.length === 0) {
      console.log('[ShoppingListSummary] No shopping list provided');
      return null;
    }
    
    try {
      const result = calculateMealsFromGroceryList(shoppingList);
      console.log('[ShoppingListSummary] Estimate calculated:', result);
      return result;
    } catch (error) {
      console.error('[ShoppingListSummary] Error calculating meals:', error);
      return null;
    }
  }, [shoppingList]);
  
  // Don't show if no estimate or invalid
  if (!estimate || estimate.estimatedMeals === 0) {
    // Returns fallback message instead of null
    return (
      <div className="bg-yellow-900/20 border-2 border-yellow-700/50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-yellow-200 mb-2">Shopping Summary</h3>
        <p className="text-yellow-300">⚠️ Unable to calculate meal estimate</p>
        <p className="text-sm text-yellow-400 mt-2">
          Estimate: {estimate ? JSON.stringify(estimate, null, 2) : 'null'}
        </p>
      </div>
    );
  }
  
  // ... rest of component JSX
}
```

#### 3. Meal Calculation Logic
`calculateMealsFromGroceryList` in `lib/utils/mealEstimation.ts`:

```tsx
export function calculateMealsFromGroceryList(
  shoppingList: ShoppingListItem[],
  recipeGramsPerMeal?: number
): MealEstimate {
  // ... extensive logging ...
  
  for (const item of shoppingList) {
    const packageInfo = getPackageSize(item.name, item.category);
    const recipeGrams = parseAmountToGrams(item.amount);
    
    if (recipeGrams <= 0) {
      continue; // Skip if can't parse
    }
    
    const mealsFromPackage = packageInfo.typicalSize / recipeGrams;
    breakdown.push({ /* ... */ });
  }
  
  // Filter out staples (>100 meals)
  const substantialIngredients = breakdown.filter(b => b.mealsFromPackage < 100);
  
  // Find minimum (limiting ingredient)
  const estimatedMeals = substantialIngredients.length > 0
    ? Math.min(...substantialIngredients.map(b => b.mealsFromPackage))
    : Math.min(...breakdown.map(b => b.mealsFromPackage));
  
  return {
    estimatedMeals: Math.max(1, Math.round(estimatedMeals)),
    // ... rest
  };
}
```

## What We've Tried

### 1. Moved Components to Sidebar
- Originally components were inside `ShoppingList` component
- Moved them to sidebar in `MealCompleteView`
- Updated render conditions

### 2. Memoized Calculations
- Wrapped `ingredientsWithASINs` in `useMemo`
- Wrapped `mealEstimateForCost` in `useMemo`
- Wrapped estimate calculation in `ShoppingListSummary` with `useMemo`

### 3. Simplified Render Conditions
- Changed from `mealEstimate && mealEstimate.estimatedMeals > 0` 
- To just `ingredientsWithASINs.length > 0`
- Let components handle their own null checks

### 4. Added Error Handling
- Try-catch blocks around calculations
- Null checks everywhere
- Defensive checks for `estimate.notes` and `estimate.breakdown`

### 5. Added Extensive Logging
- Console logs at every step of data flow
- Logs in `parseAmountToGrams`
- Logs in `getPackageSize`
- Logs in `calculateMealsFromGroceryList`
- Logs in component render

### 6. Added Fallback Display
- Changed `ShoppingListSummary` to show yellow warning box instead of returning null
- Should see something even if calculation fails

### 7. Added Test Debug Component
- Red debug box in sidebar to verify rendering
- Shows counts and condition checks

## Potential Issues Identified

### Issue 1: getIngredientDisplayName Mismatch
The function is passed as `(key) => key`, which means ingredient keys might not match vetted product lookup keys. Vetted products are looked up by ingredient name (e.g., "chicken breast"), but keys might be normalized (e.g., "chicken_breast").

### Issue 2: Amount Format
Amounts are formatted as `${ing.grams}g` (e.g., "200g"). The `parseAmountToGrams` function should handle this, but need to verify the regex is working.

### Issue 3: Package Size Lookup
Package sizes are looked up by ingredient name. If names don't match exactly, it falls back to category defaults. Need to verify names match.

### Issue 4: All Ingredients Filtered as Staples
If all ingredients last 100+ meals, they're filtered out, leaving empty array, which would cause `Math.min([])` to return `Infinity` or error.

### Issue 5: Component Not Being Called
Despite conditions being met, components might not be rendering due to React rendering issues or CSS hiding them.

## Questions for Help

1. **Is the sidebar rendering at all?** - The red debug box should be visible. Is it?

2. **What do console logs show?**
   - Does `ingredientsWithASINs` have items?
   - Does `calculateMealsFromGroceryList` return a valid estimate?
   - What is `estimatedMeals` value in the estimate?

3. **Are components being called but returning null?**
   - Check if `ShoppingListSummary` is being invoked
   - Check if the fallback yellow box appears

4. **Data flow issue?**
   - Are vetted products being found?
   - Are amounts parsing correctly?
   - Are package sizes being found?

5. **React rendering issue?**
   - Could this be a hydration mismatch?
   - Could CSS be hiding the components?
   - Could there be a z-index or positioning issue?

## Relevant Code Files

1. `components/MealCompleteView.tsx` - Main component with sidebar
2. `components/ShoppingListSummary.tsx` - Summary component
3. `components/CostComparison.tsx` - Comparison component
4. `lib/utils/mealEstimation.ts` - Calculation logic
5. `lib/data/packageSizes.ts` - Package size data
6. `lib/data/vetted-products.ts` - Product lookup data
7. `app/profile/pet/[id]/recipe-builder/page.tsx` - How MealCompleteView is called

## What Worked Before

Originally, `ShoppingListSummary` and `CostComparison` were displayed **inside** the `ShoppingList` component, and they worked correctly. The `ShoppingList` component had its own `mealEstimate` calculation:

```tsx
// In ShoppingList.tsx (working version)
const mealEstimate = useMemo(() => {
  if (!ingredients || ingredients.length === 0) return null;
  const shoppingListItems = ingredients.map(ing => {
    let product = getVettedProduct(ing.name.toLowerCase());
    if (!product) {
      product = getVettedProductByAnyIdentifier(ing.name);
    }
    return {
      id: ing.id,
      name: ing.name,
      amount: ing.amount,
      category: product?.category
    };
  });
  return calculateMealsFromGroceryList(shoppingListItems);
}, [ingredients]);

// Then displayed:
{mealEstimate && mealEstimate.estimatedMeals > 0 && (
  <div className="mb-6">
    <ShoppingListSummary shoppingList={ingredients.map(...)} />
    <CostComparison costPerMeal={mealEstimate.costPerMeal} />
  </div>
)}
```

**Key Difference**: In `ShoppingList`, the `ingredients` prop already contains the correct format (with `name`, `amount`, etc.). In `MealCompleteView`, we're building `ingredientsWithASINs` from `selectedIngredients` which has a different structure (`{key, grams}`).

## Current Status

Despite all the debugging added:
- Extensive console logging at every step
- Test debug component in sidebar
- Fallback displays
- Error handling
- Memoization

**The components still do not display.** We need help identifying:
1. Where in the data flow things are breaking
2. Why components aren't rendering even with fallbacks
3. What we're missing in our investigation

## Critical Questions

1. **Do you see the red debug box?** If yes, what values does it show?
2. **What do the console logs show?** Please share:
   - `ingredientsWithASINs.length` value
   - Whether vetted products are being found
   - What `calculateMealsFromGroceryList` returns
   - Any errors in the console

3. **Do you see the yellow fallback box?** If `ShoppingListSummary` is being called but calculation fails, you should see a yellow warning box.

4. **Is the sidebar visible at all?** Check if the `aside` element is rendering (inspect in browser DevTools).

## Next Steps Requested

Please help diagnose:
- Review the code snippets above
- Identify potential issues we haven't considered
- Suggest additional debugging approaches
- Check if there's a React rendering/hydration issue
- Verify if CSS could be hiding components
- Look for any async/timing issues

Thank you!

