# Guide for AI Collaboration on Pet Plates Recipe System

## Quick Reference

**Verified Facts:**
- **Recipe Count**: 170 recipes (not 200) - stored in `lib/data/recipes-complete.ts`
- **Recipe Loading**: Static imports at build time (`import { recipes } from '@/lib/data/recipes-complete'`)
- **Scoring**: Client-side in React `useMemo` hooks, recalculates when pet data changes
- **Generation**: Offline batch process via `scripts/generate-recipes.ts` (not user-facing)
- **Ingredients**: 31 entries in `ingredientCompositions.ts`, most missing `carbs` field (0/31 have it), few have `fiber` (3/31)
- **Data Storage**: TypeScript files for recipes, localStorage for pets, Firebase available but not actively used

**Key Files:**
- Recipe generation: `scripts/generate-recipes.ts`, `lib/utils/completeRecipeSystem.ts`
- Client scoring: `app/profile/pet/[id]/page.tsx` (lines 253-294), `lib/utils/improvedCompatibilityScoring.ts`
- Data sources: `lib/data/recipes-complete.ts`, `lib/data/ingredientCompositions.ts`, `lib/data/vetted-species-map.ts`

---

## Context Other AIs Need (But Haven't Asked)

### 1. **Current Architecture & Scale**

**Tech Stack:**
- Next.js 16 (React 18) with TypeScript
- Client-side recipe scoring and filtering
- Server-side recipe generation (Node.js scripts, runs offline)
- Data storage: TypeScript files for recipes, localStorage for pets (Firebase optional)
- Deployment: Vercel (serverless functions available)
- No database currently (recipes are static TypeScript exports loaded at build time)

**Current Scale:**
- **Recipes**: 170 recipes total (verified from `lib/data/recipes-complete.ts` header)
- **Users**: Designed for 10k concurrent, but currently likely < 100 active
- **Performance**: Recipe generation script runs offline (not user-facing)
- **Data size**: `recipes-complete.ts` is a large TypeScript file (~19,500 lines), bundled at build time

**Critical Constraint:**
- Recipes are **pre-generated** and stored as static TypeScript exports
- Generation happens **offline** via `scripts/generate-recipes.ts`
- Users never trigger generation - they only filter/score existing recipes
- Recipes are imported statically: `import { recipes } from '@/lib/data/recipes-complete'` (build-time bundling)
- This means generation performance is less critical than data quality

**Code Evidence:**
```typescript
// app/profile/pet/[id]/page.tsx (line 8)
import { recipes as baseRecipes } from '@/lib/data/recipes-complete';

// This is a static import, so recipes are bundled at build time
// Not fetched at runtime
```

### 2. **Data Flow & User Journey**

```
User Flow:
1. User creates pet profile (stored in localStorage via getPets/savePet)
2. User navigates to "Find Meals" page (app/profile/pet/[id]/page.tsx)
3. App imports all 170 recipes at build time (static import)
4. Client-side scoring algorithm filters/scores recipes for that pet (useMemo hooks)
5. User sees top matches, can click "Buy" to open Amazon affiliate links
6. User can create custom meals via wizard (ingredients stored in localStorage)
```

**Key Insight:** Recipe generation is NOT real-time. It's a batch process that runs offline. The real performance concern is:
- Client-side recipe scoring (happens in `useMemo` when pet data changes)
- Recipe filtering and sorting
- UI responsiveness during scoring

**Code Evidence:**
```typescript
// app/profile/pet/[id]/page.tsx (lines 253-294)
const tieredRecommendations = useMemo(() => {
  if (!pet) return [];
  const { getRecommendedRecipes } = require('@/lib/utils/recipeRecommendations');
  const combinedRecipes = getCombinedRecipes(); // Gets all 170 recipes
  return getRecommendedRecipes(pet, 20, true, combinedRecipes);
}, [pet?.id, pet?.type, pet?.breed, pet?.age, tieredHealthConcernsKey, pet?.weightKg, tieredAllergiesKey]);

// Scoring happens here - all recipes scored when dependencies change
const mealsWithScores = mealsWithKeys.map((item) => ({
  ...item,
  score: calculateEnhancedCompatibility(meal.recipe, enhancedPet).overallScore
}));
```

### 3. **Business Model & Constraints**

**Revenue Model:**
- Amazon affiliate commissions (primary)
- Ads (future)
- Merch (future)

**Implications:**
- Need to maximize "Buy" button clicks
- Recipe quality directly impacts user trust and conversions
- Invalid recipes = lost revenue
- Multi-pet households = higher LTV (3x affiliate commission)

**Technical Constraints:**
- Must work offline (localStorage fallback)
- Must be fast on mobile (most affiliate clicks are mobile)
- Must handle exotic pets (birds, reptiles, pocket-pets) - underserved market

### 4. **Current Performance Bottlenecks**

**Known Issues:**
1. **Client-side scoring**: All 170 recipes scored when pet data changes
   - Location: `app/profile/pet/[id]/page.tsx` (lines 253-294, 332-336)
   - Uses: `calculateEnhancedCompatibility` and `rateRecipeForPet`
   - Impact: Recalculates on every pet data change, especially on mobile
   - Solution needed: Better memoization, lazy loading, or server-side scoring

2. **Recipe data size**: Large TypeScript file (~19,500 lines) bundled at build time
   - Impact: Larger initial bundle size
   - Solution needed: Code splitting, lazy loading, or database migration

3. **Ingredient lookup**: Multiple data sources with name mismatches
   - Impact: Some ingredients not found, fallback system used
   - Solution needed: Unified ingredient registry (Phase 4 of plan)

4. **No caching layer**: Recipes re-scored when pet data changes
   - Impact: Unnecessary computation if pet data hasn't actually changed
   - Solution needed: Better memoization or caching strategy

**Code Evidence:**
```typescript
// app/profile/pet/[id]/page.tsx (lines 332-336)
const enhanced = calculateEnhancedCompatibility(meal.recipe, enhancedPet);
return Number(enhanced.overallScore);
// This runs for every recipe, every time pet data changes
```

### 5. **Data Quality Issues**

**Current State:**
- **Ingredient nutrition data**: 31 entries in `lib/data/ingredientCompositions.ts`
  - **Missing carbs**: 0/31 entries have `carbs` field (100% missing)
  - **Missing fiber**: 28/31 entries missing `fiber` field (~90% missing)
  - Most entries have protein, fat, calcium, phosphorus, but lack carbs/fiber
- Name mismatches between data sources (`"chicken breast"` vs `"chicken_breast"`)
- No versioning system (can't track outdated recipes)
- Fallback system exists (`lib/utils/nutritionFallbacks.ts`) but ingredients still marked `needsReview: true`

**Impact:**
- Recipes marked `needsReview: true` (reduces user trust)
- Some recipes may be nutritionally invalid
- Hard to identify which recipes need regeneration
- Missing carbs/fiber data affects recipe validation accuracy

**Code Evidence:**
```typescript
// lib/data/ingredientCompositions.ts
export const INGREDIENT_COMPOSITIONS: Record<string, IngredientComposition> = {
  "chicken_breast": {
    protein: 31.0,
    fat: 3.6,
    calcium: 11,
    phosphorus: 196,
    // carbs: missing
    // fiber: missing
    // ...
  }
  // Only 3 entries have fiber field, 0 have carbs field
};
```

### 6. **Testing & Validation Gaps**

**Current State:**
- Basic test suite exists (`tests/recipe-generation.test.ts`)
- No E2E tests
- No performance benchmarks
- No validation of generated recipes against real AAFCO standards

**What's Needed:**
- Performance benchmarks for recipe generation
- Validation that all generated recipes meet minimum standards
- Tests for edge cases (missing ingredients, invalid combinations)
- Load testing for client-side scoring

## Questions to Ask Other AIs

### Category 1: Performance Optimization

**Question 1: Client-Side Recipe Scoring Performance**
```
We have 170 recipes that need to be scored when pet data changes using 
calculateEnhancedCompatibility and rateRecipeForPet. The scoring involves:
- Nutritional adequacy checks (AAFCO standards)
- Digestibility calculations
- Health concern matching
- Allergen checking

Current: All recipes scored in useMemo hooks when pet dependencies change
Location: app/profile/pet/[id]/page.tsx (lines 253-294, 332-336)
Problem: Recalculates on every pet data change, especially slow on mobile

What's the best strategy?
- Server-side scoring with API route?
- Lazy loading with pagination?
- Web Workers for parallel scoring?
- Better memoization strategy?
- Something else?

Constraints:
- Must work offline (localStorage fallback)
- Must be fast on mobile
- Scoring logic is complex (can't simplify much)
- Recipes are statically imported (can't lazy load the import itself)
```

**Question 2: Recipe Data Loading Strategy**
```
We load 170 recipes as a static TypeScript export at build time.
This gets bundled into the Next.js app (~19,500 lines of code).

Current: Static import - all recipes in bundle, loaded at build time
Location: import { recipes } from '@/lib/data/recipes-complete'
Problem: Large bundle size, all recipes in memory even if not needed

Options:
- Keep static import but lazy load the scoring?
- Migrate to database (Firebase/Postgres)?
- Code splitting by species?
- Server-side API with pagination?
- Dynamic import() for recipes?

Constraints:
- Must work with static site generation (Vercel)
- Need fast filtering/search
- Recipes rarely change (regenerated weekly)
- Currently using static imports everywhere
```

### Category 2: Architecture & Scalability

**Question 3: Database Migration Strategy**
```
We're currently using TypeScript files for recipes and localStorage for pets.
We have Firebase available but not actively used.

Current:
- Recipes: Static TypeScript export (170 recipes, ~19,500 lines)
- Pets: localStorage (client-side only, via getPets/savePet)
- Custom meals: localStorage

Future needs:
- Multi-user support (currently single-user)
- Recipe versioning
- Analytics tracking
- User-generated recipes

Should we:
- Migrate to Firebase Firestore?
- Use Postgres (Vercel Postgres)?
- Hybrid approach (recipes in TS, user data in DB)?
- Keep current but add sync layer?

Constraints:
- Must maintain offline support
- Must be cost-effective (affiliate revenue model)
- Must scale to 10k users
- Currently 11 files import recipes statically
```

**Question 4: Unified Ingredient Registry Architecture**
```
We have 3 separate data sources:
1. VETTED_SPECIES_MAP (species safety) - lib/data/vetted-species-map.ts
2. INGREDIENT_COMPOSITIONS (nutrition data) - lib/data/ingredientCompositions.ts (31 entries)
3. allIngredients (UI ingredient lists) - lib/utils/allIngredients.ts

Problem: Name mismatches, duplicate data, hard to maintain
- INGREDIENT_COMPOSITIONS uses snake_case: "chicken_breast"
- UI might use spaces: "chicken breast"
- VETTED_SPECIES_MAP uses different keys

Proposed solution: Unified registry that merges all 3

Questions:
- Should this be a build-time process (generate unified file)?
- Or runtime service (merge on-the-fly)?
- How to handle migrations without breaking existing code?
- What's the best data structure for fast lookups?
- How to handle versioning of ingredient data?

Constraints:
- Must be backward compatible
- Must be fast (used in recipe generation)
- Must support fuzzy matching for name variations
- 31 ingredients currently, but will grow
```

### Category 3: Data Quality & Validation

**Question 5: Recipe Validation Strategy**
```
We generate 170 recipes offline, but need to ensure they're all valid.

Current validation:
- AAFCO standards check (dogs/cats) - lib/data/aafco-standards.ts
- Species-specific heuristics (birds, reptiles, pocket-pets)
- Health concern matching
- Allergen checking

Problems:
- Some recipes still invalid (low scores)
- No automated validation of final output
- Can't easily identify which recipes need regeneration
- Missing carbs/fiber data affects validation accuracy

What's the best approach?
- Pre-generation validation (reject invalid attempts)?
- Post-generation audit script?
- Continuous validation in CI/CD?
- User feedback loop (flag invalid recipes)?

Also: How to validate recipes for exotic pets where AAFCO doesn't apply?
```

**Question 6: Missing Nutrition Data Strategy**
```
31 ingredients in ingredientCompositions.ts:
- 0/31 have carbs field (100% missing)
- 28/31 missing fiber field (~90% missing)
- Most have protein, fat, calcium, phosphorus

Current fallback system:
- Category-based estimates (poultry, red_meat, etc.) - lib/utils/nutritionFallbacks.ts
- Marked with needsReview: true

Questions:
- Should we prioritize filling real data or improve fallbacks?
- What's the minimum data needed for valid recipes?
- How to source nutrition data for exotic ingredients (mealworms, crickets)?
- Should we use USDA data, research papers, or both?
- Is 100% missing carbs acceptable for recipe validation?

Constraints:
- Limited time/resources for manual data entry
- Need to maintain accuracy
- Some ingredients have no reliable sources
- Carbs/fiber critical for some species (pocket-pets need high fiber)
```

### Category 4: Monitoring & Observability

**Question 7: Production Monitoring Strategy**
```
We need to track:
- Recipe generation success rates (scripts/generate-recipes.ts)
- Missing ingredient frequency
- Recipe validation scores
- User engagement (which recipes are viewed/clicked)

Current: Console logs only

What's the best approach?
- Structured logging to file?
- Analytics service (Vercel Analytics, PostHog)?
- Custom dashboard?
- Error tracking (Sentry)?

Constraints:
- Must be cost-effective
- Must work with static site generation
- Need to track both server-side (generation) and client-side (usage)
- Currently no monitoring infrastructure
```

**Question 8: Failure Analysis & Debugging**
```
When recipe generation fails, we currently just log and continue.

Proposed: Structured failure logging (see Phase 3 of RECIPE_SYSTEM_IMPROVEMENTS_PLAN.md)

Questions:
- What's the best format for failure logs (JSON, CSV, database)?
- How to analyze failures programmatically?
- Should we create a dashboard or just scripts?
- How to prioritize which failures to fix first?

Constraints:
- Must be easy to analyze (not just raw logs)
- Must identify patterns (common missing ingredients, etc.)
- Should integrate with data quality improvements
- Generation runs offline, so can't use real-time monitoring
```

### Category 5: Testing & Quality Assurance

**Question 9: Testing Strategy for Nutrition Calculations**
```
We have complex nutrition calculations:
- Dry matter basis conversion (lib/utils/completeRecipeSystem.ts)
- AAFCO validation (lib/data/aafco-standards.ts)
- Ca:P ratio calculations
- Macro percentage calculations

Current: Basic unit tests exist (tests/recipe-generation.test.ts)

Questions:
- What's the best way to test nutrition calculations?
- Should we use real USDA data as test fixtures?
- How to test edge cases (missing data, invalid inputs)?
- Should we test against known-good recipes?
- How to test with missing carbs/fiber data?

Also: How to ensure calculations match veterinary standards?
```

**Question 10: Recipe Quality Assurance**
```
We generate 170 recipes, but need to ensure quality.

Questions:
- How to automatically detect invalid recipes?
- What metrics define "quality" (validation score, completeness, etc.)?
- Should we have a manual review process?
- How to track recipe quality over time?
- How to handle recipes with missing nutrition data?

Constraints:
- Can't manually review 170 recipes
- Need automated quality gates
- Must catch issues before users see them
- Some recipes will have needsReview: true due to missing data
```

## What NOT to Ask (Already Covered)

❌ **Don't ask about:**
- Basic recipe generation logic (we have `lib/utils/completeRecipeSystem.ts`)
- AAFCO standards (we have `lib/data/aafco-standards.ts`)
- Ingredient safety (we have `lib/data/vetted-species-map.ts`)
- Fallback nutrition system (we have `lib/utils/nutritionFallbacks.ts`)
- Name normalization (we have enhanced normalization in `completeRecipeSystem.ts`)
- Missing ingredient tracking (we have this implemented)

✅ **Do ask about:**
- Performance optimization strategies
- Architecture decisions (database vs TypeScript files, caching, etc.)
- Monitoring and observability
- Testing strategies
- Data quality improvement processes
- Scalability patterns
- Handling missing nutrition data (carbs/fiber)

## Key Files to Reference

**Core Recipe System:**
- `lib/utils/completeRecipeSystem.ts` - Main generation logic
- `scripts/generate-recipes.ts` - Batch generator script (generates 170 recipes)
- `lib/utils/nutritionFallbacks.ts` - Fallback nutrition data
- `lib/data/aafco-standards.ts` - Nutritional standards

**Data Sources:**
- `lib/data/recipes-complete.ts` - 170 recipes (static export, ~19,500 lines)
- `lib/data/ingredientCompositions.ts` - Nutrition data (31 entries, 0 with carbs, 3 with fiber)
- `lib/data/vetted-species-map.ts` - Species safety
- `lib/data/vetted-products.ts` - Amazon product links
- `lib/utils/allIngredients.ts` - UI ingredient lists

**Scoring & Validation:**
- `app/profile/pet/[id]/page.tsx` - Client-side scoring (lines 253-294, 332-336)
- `lib/utils/improvedCompatibilityScoring.ts` - Client-side scoring algorithm
- `lib/utils/enhancedCompatibilityScoring.ts` - Alternative scoring
- `lib/utils/recipeScoring.ts` - Legacy scoring

**Current Plan:**
- `RECIPE_SYSTEM_IMPROVEMENTS_PLAN.md` - Full improvement plan
- `tests/recipe-generation.test.ts` - Test suite

## Code Examples

### Recipe Loading (Static Import)
```typescript
// app/profile/pet/[id]/page.tsx (line 8)
import { recipes as baseRecipes } from '@/lib/data/recipes-complete';

// This is a static import - recipes are bundled at build time
// All 170 recipes are in memory when the page loads
```

### Client-Side Scoring
```typescript
// app/profile/pet/[id]/page.tsx (lines 253-294)
const tieredRecommendations = useMemo(() => {
  if (!pet) return [];
  const { getRecommendedRecipes } = require('@/lib/utils/recipeRecommendations');
  const combinedRecipes = getCombinedRecipes(); // Gets all 170 recipes
  return getRecommendedRecipes(pet, 20, true, combinedRecipes);
}, [pet?.id, pet?.type, pet?.breed, pet?.age, tieredHealthConcernsKey, pet?.weightKg, tieredAllergiesKey]);

// Scoring happens here - recalculates when any dependency changes
const mealsWithScores = mealsWithKeys.map((item) => ({
  ...item,
  score: calculateEnhancedCompatibility(meal.recipe, enhancedPet).overallScore
}));
```

### Missing Nutrition Data
```typescript
// lib/data/ingredientCompositions.ts
export const INGREDIENT_COMPOSITIONS: Record<string, IngredientComposition> = {
  "chicken_breast": {
    protein: 31.0,
    fat: 3.6,
    calcium: 11,
    phosphorus: 196,
    // carbs: missing (0/31 entries have this)
    // fiber: missing (only 3/31 entries have this)
    moisture: 65,
    kcal: 165,
    source: "USDA FDC ID: 171116",
  }
  // ... 30 more entries, most missing carbs/fiber
};
```

## Success Criteria for AI Help

**Good AI responses should:**
1. Address the specific question with concrete solutions
2. Consider our constraints (offline support, mobile performance, cost)
3. Provide code examples or architectural diagrams
4. Suggest trade-offs and alternatives
5. Reference our existing code structure
6. Account for missing nutrition data (carbs/fiber)

**Bad AI responses:**
1. Suggest complete rewrites without considering migration path
2. Ignore our constraints (e.g., "just use a database" without migration plan)
3. Provide generic advice without code examples
4. Don't consider our business model (affiliate revenue, cost-sensitive)
5. Assume all nutrition data is available

## How to Use This Guide

1. **Copy relevant section** when asking an AI for help
2. **Include file paths and line numbers** to relevant code
3. **Specify constraints** (e.g., "must work offline", "must handle missing carbs data")
4. **Ask for alternatives** if the first solution doesn't fit
5. **Request code examples** for complex solutions
6. **Mention verified facts** (170 recipes, 31 ingredients, missing carbs/fiber)

## Next Steps After Getting AI Help

1. **Evaluate solutions** against our constraints
2. **Create implementation plan** (like `RECIPE_SYSTEM_IMPROVEMENTS_PLAN.md`)
3. **Test with small subset** before full implementation
4. **Measure impact** (performance, quality, etc.)
5. **Iterate** based on results
