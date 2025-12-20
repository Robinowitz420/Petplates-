# Recipe Generation Issues - Complete History & Architecture

## 🚨 Current Critical Issue

**Problem:** Recipe generator is producing 2-ingredient recipes like "lettuce and chicken" or "chicken and arugula" despite code designed to prevent this.

**Root Cause:** The exotic protein filter I just added is likely filtering out too many protein ingredients, leaving only 1-2 proteins available. Combined with cats getting 0 carbs (by design), this results in:
- 1 protein (chicken)
- 0 carbs (cats don't need carbs)
- 1-2 vegetables (lettuce, arugula)
- **Total: 2-3 ingredients** (below the quality threshold)

---

## 📊 Complete Issue History

### Issue 1: Meal Count Always Showing "1 Meal"
**Timeline:** Previous sessions
**Problem:** Meal estimation consistently showed 1 meal regardless of package sizes
**Root Cause:** Double-rounding error + small package sizes
- Individual ingredients were floored: `Math.floor(453/241) = 1`
- Then minimum was taken: `Min(1, 1, 1) = 1`
- This compounded rounding errors

**Fix Applied:**
```typescript
// BEFORE (wrong):
const mealsFromPackage = Math.floor(packageSizeGrams / recipeGrams);

// AFTER (correct):
const mealsFromPackage = packageSizeGrams / recipeGrams; // Keep decimal
const finalMeals = Math.floor(Math.min(...mealsFromPackage)); // Floor only final result
```

**Status:** ✅ Fixed in `lib/utils/mealEstimation.ts`

---

### Issue 2: Unrealistic Package Sizes
**Timeline:** Today (Dec 18, 2025)
**Problem:** Many ingredients had tiny package sizes (0.5 oz) causing bottlenecks
**Examples:**
- Parsley: 0.5 oz (14g) - recipe needs 26g = 0.52 meals
- Sage, basil, fennel, ginger, turmeric, rosemary, mint: all 0.5 oz
- Chicken/turkey sausage: 0.5 oz (should be 12 oz)

**Fix Applied:**
Updated `data/product-prices.json`:
- Herbs/spices: 0.5 oz → 2 oz
- Sausages: 0.5 oz → 12 oz
- Parsley: 0.5 oz → 16 oz
- Supplements: 1 oz → 2-4 oz

**Status:** ✅ Fixed - 12 package sizes corrected

---

### Issue 3: Expensive Exotic Proteins
**Timeline:** Today (Dec 18, 2025)
**Problem:** Recipes using quail, venison, elk causing $20-30/meal costs
**Example:**
- Quail recipe: $26.44/meal, only 1 meal from 1 lb package
- Recipe needs 293g, package is 453g = 1.54 meals → floors to 1

**Fix Applied:**
Created exotic protein filter in `lib/generator/RecipeBuilder.ts`:
```typescript
if (ing.category === 'protein' && isExoticProtein(ing.name)) {
  console.log(`[RecipeBuilder] ❌ Excluding exotic protein: ${ing.name}`);
  return false;
}
```

Excluded proteins: quail, venison, goat, elk, bison, ostrich, pheasant, duck, rabbit, kangaroo, alligator, wild boar, emu, reindeer, buffalo

**Status:** ⚠️ CAUSED NEW ISSUE - Now producing 2-ingredient recipes

---

### Issue 4: 2-Ingredient Recipes (CURRENT)
**Timeline:** Today (Dec 18, 2025) - Just introduced
**Problem:** Recipes like "lettuce and chicken" with only 2 ingredients
**Root Cause:** Exotic protein filter is too aggressive + cats get 0 carbs

**Why this happens:**
1. Exotic filter removes: quail, duck, rabbit, venison, etc.
2. Remaining proteins: chicken, turkey, beef, pork, lamb, fish
3. For cats:
   - 1 protein selected (chicken)
   - 0 carbs (cats are obligate carnivores - by design)
   - 1-2 vegetables (lettuce, arugula)
   - 1 fat (oil)
   - **Total: 3-4 ingredients** but validation may be failing

**Code has safeguards:**
```typescript
// Line 603-623: Minimum 3 ingredients enforcement
const MIN_INGREDIENTS = 3;
if (selected.length < MIN_INGREDIENTS) {
  // Add more ingredients from highest-scoring categories
  const remainingNeeded = MIN_INGREDIENTS - selected.length;
  // ... adds more ingredients
}
```

**Hypothesis:** The safeguard is working (3+ ingredients selected), but something in validation or portion calculation is removing ingredients.

**Status:** 🔴 ACTIVE BUG - Needs investigation

---

## 🏗️ Recipe Generation Architecture

### High-Level Flow

```
User Request
    ↓
RecipeBuilder.generate()
    ↓
1. getCandidateIngredients() - HARD FILTERS
    ↓
2. scoreIngredients() - MULTI-FACTOR SCORING
    ↓
3. selectIngredients() - CATEGORY-BASED SELECTION
    ↓
4. calculatePortions() - NUTRIENT-TARGETED ALLOCATION
    ↓
5. validateRecipeComprehensive() - VALIDATION
    ↓
Return Recipe or Retry (max 3 attempts)
```

---

### Step 1: Hard Filters (`getCandidateIngredients`)

**Purpose:** Remove ingredients that absolutely cannot be used

**Filters Applied (in order):**
1. **Exotic proteins** (NEW) - Remove quail, venison, etc.
2. **Allergies** - Remove allergens
3. **Banned ingredients** - User blacklist
4. **Health contraindications** - Ingredients harmful for specific conditions
5. **Budget constraint** - Remove ingredients > 3x budget
6. **Quality tier** - Premium (7+), Standard (5+), Budget (all)

**Code Location:** `lib/generator/RecipeBuilder.ts:234-294`

**Output:** Filtered list of safe ingredients for this pet

---

### Step 2: Scoring (`scoreIngredients`)

**Purpose:** Rank ingredients by multiple factors

**Scoring Factors:**
1. **Health Score (35% weight)** - Does it help with pet's health concerns?
2. **Nutritional Score (30% weight)** - Protein density, omega-3, fiber, micronutrients
3. **Palatability Score (20% weight)** - Will the pet eat it? (high/medium/low tier)
4. **Quality Score (15% weight)** - Ingredient quality rating (1-10)

**Special Case - Protein Category:**
For proteins, weights shift to prioritize nutrition:
- Nutritional: 70% (was 30%)
- Health: 20% (was 35%)
- Palatability: 8% (was 20%)
- Quality: 2% (was 15%)

**Nutritional Scoring Breakdown:**
- Protein density: 60 points max (was 30)
  - ≥30% protein: 60 points (chicken breast, turkey breast)
  - ≥25% protein: 50 points (ground turkey, ground chicken)
  - ≥20% protein: 35 points (salmon, duck)
  - ≥15% protein: 20 points (eggs, some fish)
- Omega-3: 20 points max
- Fiber: 10 points max
- Micronutrients: 10 points max

**Code Location:** `lib/generator/RecipeBuilder.ts:301-422`

**Output:** Sorted list of ingredients by total score (highest first)

---

### Step 3: Selection (`selectIngredients`)

**Purpose:** Pick best ingredients from each required category

**Category Requirements by Species:**

**Cats:**
- 1 protein (primary only)
- 0 carbs (obligate carnivores)
- 2 vegetables (for variety)
- 1 fat
- **Total: 4 ingredients**

**Dogs:**
- 1 protein (primary only)
- 1 carb
- 1 vegetable
- 1 fat
- **Total: 4 ingredients**

**Birds:**
- 2 seeds/nuts
- 1 fruit
- 1 vegetable
- **Total: 4 ingredients**

**Reptiles:**
- 2 insects
- 1 vegetable
- 1 fruit
- **Total: 4 ingredients**

**Pocket Pets:**
- 1 hay
- 2 vegetables
- 1 fruit
- 1 seed
- **Total: 5 ingredients**

**Selection Method:**
- For each category, get top-scored ingredients
- Use weighted random selection from top N (diversity mode):
  - High diversity: top 8
  - Medium diversity: top 5
  - Low diversity: top 3
  - None: top 1 (deterministic)
- Higher scores = higher probability of selection

**Minimum Ingredient Enforcement:**
```typescript
const MIN_INGREDIENTS = 3;
if (selected.length < MIN_INGREDIENTS) {
  // Add more ingredients from highest-scoring categories
  // to reach minimum of 3
}
```

**Code Location:** `lib/generator/RecipeBuilder.ts:531-632`

**Output:** Array of selected ingredients (should be 3-5 for most species)

---

### Step 4: Portion Calculation (`calculatePortions`)

**Purpose:** Determine how many grams of each ingredient

**Strategy:** Nutrient-targeted allocation (not category weights)

**Process:**
1. Calculate total meal size based on pet weight and species
   - Dogs/Cats: `petWeightKg * (50-80)` depending on quality tier
   - Birds: `petWeightKg * 40`
   - Reptiles: `petWeightKg * 30`
   - Pocket Pets: `petWeightKg * 100`

2. Get nutritional targets (AAFCO-based)
   - Cats: 23% protein, 10% fat
   - Dogs: 20% protein, 8% fat
   - Birds: 15% protein, 8% fat
   - Reptiles: 15% protein, 7% fat
   - Pocket Pets: 14% protein, 6% fat

3. Calculate required nutrient grams
   - `targetProteinGrams = totalMealGrams * proteinPercent`
   - `targetFatGrams = totalMealGrams * fatPercent`

4. **For Dogs/Cats:**
   - Find primary protein ingredient
   - Calculate portion needed to hit protein target
   - Cap at 85-90% of total meal (prevent crowding out micronutrients)
   - Distribute remaining grams to other ingredients

5. **For Exotic Pets:**
   - Distribute with bias toward higher-protein items
   - 70% equal distribution + 30% protein-density-weighted

6. Adjust if below protein target (boost high-protein portions by 20%)

**Code Location:** `lib/generator/RecipeBuilder.ts:667-878`

**Output:** Array of `{ingredient, grams}` pairs

---

### Step 5: Validation (`validateRecipeComprehensive`)

**Purpose:** Ensure recipe meets safety and quality standards

**Hard Gates (must pass or recipe is rejected):**
- **S1:** Exactly 1 primary protein for dogs/cats
- **S2:** No organ meat as primary protein
- **S3:** Protein ≥ 18% (dogs), ≥ 26% (cats)
- **S4:** Fat ≥ 5.5%
- **S5:** Ca:P ratio in safe range (0.8-3.0)
- **S6:** No allergens present
- **S7:** Budget constraint met

**Soft Gates (penalties but not rejection):**
- Diversity penalties
- Micronutrient gaps
- Palatability concerns

**Retry Logic:**
- If validation fails, retry up to 3 times
- Track failed ingredients to exclude in next attempt
- If all 3 attempts fail, return null (no recipe)

**Code Location:** `lib/generator/RecipeConstraintRules.ts`

**Output:** Validation result with pass/fail and penalties

---

## 🐛 Why 2-Ingredient Recipes Are Happening

### Hypothesis 1: Exotic Filter Too Aggressive ❌
**Theory:** Filter removes too many proteins, leaving insufficient candidates

**Evidence Against:**
- Core proteins list includes: chicken, turkey, beef, pork, lamb, salmon, sardines, mackerel, herring, eggs
- That's 10+ protein options, plenty for variety
- Code logs show: `console.log('[RecipeBuilder] ❌ Excluding exotic protein: ${ing.name}')`
- If this was the issue, we'd see these logs for common proteins (we shouldn't)

### Hypothesis 2: Category Mismatch ⚠️
**Theory:** Exotic filter checks `ing.category === 'protein'` but some proteins have different categories

**Evidence:**
- Fish might be categorized as 'fish' not 'protein'
- Eggs might be 'egg' not 'protein'
- This would cause filter to miss them, but wouldn't reduce count

### Hypothesis 3: Validation Removing Ingredients ✅ LIKELY
**Theory:** Recipe selects 3-4 ingredients, but validation fails and removes some

**Evidence:**
- Code has retry logic (3 attempts)
- If validation fails, it retries with different random selections
- If all 3 attempts fail with 3+ ingredients, it might fall back to minimal recipe
- **This is the most likely cause**

### Hypothesis 4: Portion Calculation Zeroing Out ✅ POSSIBLE
**Theory:** Some ingredients get 0 grams allocated, effectively removing them

**Evidence:**
- Portion calculation has max-inclusion constraints
- If ingredient exceeds max, it gets capped
- If capped to 0, it's effectively removed
- Code: `grams = Math.min(grams, maxGrams);`

---

## 🔧 Immediate Fix Needed

### Option 1: Relax Exotic Protein Filter
Make filter more permissive - only exclude truly exotic meats:

```typescript
const TRULY_EXOTIC = ['quail', 'venison', 'elk', 'bison', 'ostrich', 'kangaroo', 'alligator'];
// Keep: duck, rabbit (more common/affordable)
```

### Option 2: Fix Category Check
Ensure filter only applies to actual protein category:

```typescript
// Check if ingredient is in protein category AND is exotic
if (ing.category === 'protein' && ing.proteinRole === 'primary' && isExoticProtein(ing.name)) {
  return false;
}
```

### Option 3: Add Debug Logging
See exactly what's happening:

```typescript
console.log(`[RecipeBuilder] Candidates after filters: ${candidates.length}`);
console.log(`[RecipeBuilder] Selected ingredients: ${selected.map(i => i.name).join(', ')}`);
console.log(`[RecipeBuilder] Portioned ingredients: ${portioned.map(p => `${p.ingredient.name}: ${p.grams}g`).join(', ')}`);
```

### Option 4: Remove Exotic Filter Temporarily
Test if this is really the cause:

```typescript
// TEMPORARILY COMMENT OUT:
// if (ing.category === 'protein' && isExoticProtein(ing.name)) {
//   return false;
// }
```

---

## 📋 Action Plan

1. **Add debug logging** to see what's being selected and portioned
2. **Check ingredient categories** - verify proteins are actually categorized as 'protein'
3. **Review validation failures** - see if recipes are failing validation
4. **Test without exotic filter** - confirm this is the cause
5. **Refine filter logic** - make it more targeted (only truly exotic meats)

---

## 🎯 Expected Behavior

**For a cat recipe, we should see:**
- 1 primary protein (chicken, turkey, beef, or fish)
- 2 vegetables (variety for micronutrients)
- 1 fat source (oil, fish oil)
- **Total: 4 ingredients minimum**

**Example good recipe:**
- Chicken breast: 240g
- Spinach: 30g
- Carrots: 30g
- Fish oil: 5g
- **Total: 305g, 4 ingredients**

**Example bad recipe (current bug):**
- Chicken: 280g
- Lettuce: 25g
- **Total: 305g, 2 ingredients** ❌

---

## 🔍 Next Steps

1. User should check browser console for logs
2. Look for: `[RecipeBuilder]` logs showing selection process
3. Share what ingredients are being selected vs what's in final recipe
4. I'll add debug logging to trace the issue
