# Recipe Generation System Refactor - Migration Guide

## Overview

The recipe generation system has been refactored to follow **Single Responsibility Principle** with clean separation of concerns. This eliminates duplicate generators, consolidates ingredient data, and provides a clear, testable architecture.

## What Changed

### Old Architecture (Problems)
- **3 competing generators**: `recipe-generator.ts`, `constraintRecipeGenerator.ts`, `completeRecipeSystem.ts`
- **Data scattered**: Ingredients in 4+ places (INGREDIENT_TEMPLATES, allIngredients.ts, ingredientCompositions.ts, baseRecipes.ts)
- **Scoring mixed with generation**: `computeFinalGenerationScore()` mixed with generation logic
- **Duplicate logic**: Ingredient selection, portion calculation, nutrition validation repeated

### New Architecture (Solutions)
```
Data Layer (Read-only)
  ↓
lib/data/ingredients.ts (single source of truth)
  ↓
Generation Layer
  ├─ lib/generator/RecipeBuilder.ts (pure generation)
  └─ lib/generator/nutrition.ts (stateless utilities)
  ↓
Scoring Layer
  └─ lib/scoring/RecipeScorer.ts (separate from generation)
  ↓
Public API
  └─ lib/recipe-generator-v2.ts (clean interface)
```

## New Files Created

| File | Purpose |
|------|---------|
| `lib/data/ingredients.ts` | Unified ingredient database (~70 ingredients) |
| `lib/generator/RecipeBuilder.ts` | Pure generation logic with quality tiers |
| `lib/generator/nutrition.ts` | Nutrition calculations & validation |
| `lib/scoring/RecipeScorer.ts` | Recipe scoring (separate from generation) |
| `lib/recipe-generator-v2.ts` | Clean public API |
| `lib/__tests__/recipe-generator-v2.test.ts` | Integration tests |

## Migration Steps

### Step 1: Update Imports

**Old:**
```typescript
import { generateBestRecipeForPet, generateRecipe } from '@/lib/recipe-generator';
```

**New:**
```typescript
import { generateRecipe, generateBestRecipe, generateRecipes } from '@/lib/recipe-generator-v2';
```

### Step 2: Update Function Calls

**Old:**
```typescript
const recipe = generateBestRecipeForPet(templates, pet, seed);
```

**New:**
```typescript
const recipe = generateBestRecipe({ pet, budgetPerMeal: 4.0, targetCalories: 500 });
```

### Step 3: Update Response Handling

**Old:**
```typescript
recipe.nutritionalCalculation.protein
recipe.ingredientBreakdown
```

**New:**
```typescript
recipe.nutrition.protein
recipe.ingredients // Already formatted with amounts
```

## API Changes

### generateRecipe(options)
Generates a single recipe with full scoring and validation.

```typescript
interface GenerateRecipeOptions {
  pet: Pet;
  budgetPerMeal?: number;      // Default: 4.0
  targetCalories?: number;     // Default: 500
  avoidRecentIngredients?: boolean; // Default: true
}

// Returns
interface GeneratedRecipe {
  id: string;
  name: string;
  description: string;
  ingredients: Array<{ name: string; amount: string }>;
  instructions: string[];
  nutrition: {
    protein: number;
    fat: number;
    carbs: number;
    fiber: number;
    calcium: number;
    phosphorus: number;
    kcal: number;
    caPRatio: number;
  };
  validation: {
    isValid: boolean;
    score: number;
    warnings: string[];
    errors: string[];
  };
  score: number; // 0-100
  scoreBreakdown: {
    nutrition: number;    // 35% weight
    health: number;       // 25% weight
    cost: number;         // 20% weight
    variety: number;      // 10% weight
    quality: number;      // 10% weight
  };
  explanation: string[]; // Human-readable scoring explanation
  estimatedCost: number;
  portionGuidance: {
    servingSize: string;
    servingsPerDay: string;
    dailyCalories: string;
  };
}
```

### generateBestRecipe(options)
Generates 5 recipes and returns the highest scoring one.

```typescript
const recipe = generateBestRecipe({ pet, budgetPerMeal: 4.0 });
```

### generateRecipes(options, count)
Generates multiple diverse recipes.

```typescript
const recipes = generateRecipes({ pet }, 3);
```

## Key Features

### 1. Quality Tiers
Recipes are generated with different quality profiles:
- **Premium**: High-quality ingredients (score ≥8), 2 proteins for variety
- **Standard**: Medium-quality ingredients (score ≥6), 1 protein
- **Budget**: All quality levels, 1 protein, cost-optimized

### 2. Diversity
- Random selection from top 3 candidates (not always best)
- ±15% portion variation
- Ingredient rotation across multiple calls
- Tracks recent ingredients to avoid repetition

### 3. Scoring (0-100)
- **Nutrition (35%)**: AAFCO standard compliance
- **Health (25%)**: Alignment with pet's health concerns
- **Cost (20%)**: Budget efficiency
- **Variety (10%)**: Ingredient diversity
- **Quality (10%)**: Ingredient quality scores

### 4. Validation
- AAFCO nutritional standard checks
- Calcium/Phosphorus ratio validation (optimal: 1.0-2.0)
- Protein, fat, fiber range validation
- Warnings for suboptimal nutrition

## Files to Remove (After Migration)

Once all imports are updated, these files can be removed:
- `lib/utils/constraintRecipeGenerator.ts` (replaced by RecipeBuilder)
- Old functions in `lib/recipe-generator.ts` (keep only if needed for backward compatibility)
- `lib/utils/completeRecipeSystem.ts` (replaced by nutrition.ts)

## Testing

Run integration tests:
```bash
npm test -- recipe-generator-v2.test.ts
```

Tests cover:
- Recipe generation for all species
- Budget constraints
- Calorie targets
- Health concern alignment
- Nutrition validation
- Scoring breakdown
- Diversity across multiple calls
- Edge cases (allergies, health concerns, low budget)

## Rollback Plan

If issues arise:
1. Keep old files for 1 sprint
2. Maintain both imports in parallel
3. Feature flag to switch between old/new
4. Gradual migration of endpoints

## Benefits

✅ **Eliminated duplication** - Single generator, single ingredient source
✅ **Improved testability** - Each component independently testable
✅ **Better maintainability** - Clear responsibilities
✅ **Enhanced diversity** - Quality tiers + randomization
✅ **Transparent scoring** - Detailed breakdown + explanations
✅ **Easier debugging** - Isolated concerns make issues easier to trace

## Questions?

Refer to:
- `lib/recipe-generator-v2.ts` - Public API documentation
- `lib/generator/RecipeBuilder.ts` - Generation logic
- `lib/scoring/RecipeScorer.ts` - Scoring logic
- `lib/__tests__/recipe-generator-v2.test.ts` - Usage examples
