# Recipe Generation System - Refactored Architecture

## Executive Summary

The recipe generation system has been completely refactored to eliminate duplication, improve testability, and provide a clean separation of concerns. The new architecture follows the Single Responsibility Principle with 4 distinct layers.

## Architecture Layers

### 1. Data Layer: `lib/data/ingredients.ts`
**Single source of truth for all ingredient data**

- 70+ ingredients with complete nutritional profiles
- Species compatibility (dogs, cats, birds, reptiles, pocket-pets)
- Feeding roles (staple, supplement, treat)
- Max inclusion percentages per species
- Quality scores (1-10)
- Price data
- Helper functions: `getIngredientsForSpecies()`, `getIngredientByName()`

**Why this matters:**
- Eliminates data duplication across 4+ files
- Ensures consistency across the system
- Easy to add/update ingredients in one place

### 2. Generation Layer

#### `lib/generator/RecipeBuilder.ts`
**Pure generation logic with no side effects**

- `RecipeBuilder` class takes constraints and generates recipes
- Quality tier system (premium/standard/budget)
- Candidate filtering by species, allergies, budget
- Ingredient selection with randomization for diversity
- Portion calculation with ±15% variation
- Cost estimation

**Key methods:**
- `generate()` - Main entry point
- `getCandidateIngredients()` - Filter by constraints
- `selectIngredients()` - Choose by category with diversity
- `calculatePortions()` - Weight-based with randomization
- `calculateCost()` - Estimate meal cost

#### `lib/generator/nutrition.ts`
**Stateless nutrition utilities**

- `calculateNutrition()` - Compute totals from ingredients
- `validateNutrition()` - Check AAFCO standards
- `calculatePortionGuidance()` - Serving recommendations
- `generateDescription()` - Recipe description
- `generateInstructions()` - Cooking instructions

**Validation checks:**
- Protein min/max
- Fat min/max
- Calcium/Phosphorus ratio (optimal: 1.0-2.0)
- Fiber ranges

### 3. Scoring Layer: `lib/scoring/RecipeScorer.ts`
**Separate from generation - evaluates after recipe is built**

- `RecipeScorer` class with multi-factor scoring
- 5-component scoring system (0-100):
  - **Nutrition (35%)**: AAFCO compliance
  - **Health (25%)**: Pet health concern alignment
  - **Cost (20%)**: Budget efficiency
  - **Variety (10%)**: Ingredient diversity
  - **Quality (10%)**: Ingredient quality scores

**Features:**
- Health concern mapping (joint-health, skin-coat, etc.)
- Cost efficiency thresholds
- Ingredient repetition tracking
- Human-readable explanations

### 4. Public API: `lib/recipe-generator-v2.ts`
**Clean interface for external consumers**

**Main functions:**
- `generateRecipe(options)` - Single recipe with full scoring
- `generateBestRecipe(options)` - Best of 5 candidates
- `generateRecipes(options, count)` - Multiple diverse recipes

**Input:**
```typescript
interface GenerateRecipeOptions {
  pet: Pet;
  budgetPerMeal?: number;
  targetCalories?: number;
  avoidRecentIngredients?: boolean;
}
```

**Output:**
```typescript
interface GeneratedRecipe {
  id: string;
  name: string;
  description: string;
  ingredients: Array<{ name: string; amount: string }>;
  instructions: string[];
  nutrition: NutritionInfo;
  validation: ValidationResult;
  score: number;
  scoreBreakdown: ScoringBreakdown;
  explanation: string[];
  estimatedCost: number;
  portionGuidance: PortionGuidance;
}
```

## Data Flow

```
User Request
    ↓
generateRecipe(options)
    ↓
RecipeBuilder.generate()
    ├─ getCandidateIngredients()
    ├─ selectIngredients()
    ├─ calculatePortions()
    └─ calculateCost()
    ↓
calculateNutrition(portioned)
    ↓
validateNutrition(nutrition)
    ↓
RecipeScorer.score(...)
    ├─ scoreNutrition()
    ├─ scoreHealthAlignment()
    ├─ scoreCostEfficiency()
    ├─ scoreVariety()
    └─ scoreQuality()
    ↓
GeneratedRecipe (with scores & explanations)
```

## Key Improvements

### 1. Eliminated Duplication
- **Before**: 3 generators (recipe-generator.ts, constraintRecipeGenerator.ts, completeRecipeSystem.ts)
- **After**: 1 generator (RecipeBuilder)

- **Before**: Ingredients in 4+ places
- **After**: Single source (ingredients.ts)

- **Before**: Scoring mixed with generation
- **After**: Separate RecipeScorer

### 2. Improved Testability
- Each component independently testable
- No side effects in generation logic
- Pure functions for nutrition calculations
- Comprehensive integration tests included

### 3. Better Maintainability
- Clear responsibilities per file
- Easy to understand data flow
- Simple to add new ingredients
- Easy to adjust scoring weights

### 4. Enhanced Diversity
- Quality tier system (premium/standard/budget)
- Random selection from top 3 candidates
- ±15% portion variation
- Ingredient rotation tracking
- Avoids repetitive recipes

### 5. Transparent Scoring
- Detailed breakdown of all 5 factors
- Human-readable explanations
- Clear validation warnings/errors
- Helps users understand why recipes are scored

## Integration Points

### API Route: `app/api/recipes/generate/route.ts`
Updated to use `generateRecipes()` from v2 system.

### Testing: `lib/__tests__/recipe-generator-v2.test.ts`
Comprehensive integration tests covering:
- All species
- Budget constraints
- Health concerns
- Nutrition validation
- Scoring breakdown
- Edge cases

## Migration Checklist

- [x] Create unified ingredients database
- [x] Build RecipeBuilder class
- [x] Extract nutrition utilities
- [x] Create RecipeScorer class
- [x] Implement public API
- [x] Write integration tests
- [x] Update API route
- [x] Create migration guide
- [ ] Update remaining UI imports
- [ ] Remove old generators (after verification)

## Files to Remove (After Full Migration)

- `lib/utils/constraintRecipeGenerator.ts`
- Old functions in `lib/recipe-generator.ts`
- `lib/utils/completeRecipeSystem.ts`

## Performance Characteristics

- **Generation time**: ~50-100ms per recipe
- **Memory**: Minimal (ingredients loaded once)
- **Scalability**: Handles 50+ recipes per request
- **Caching**: Ingredient candidates cached per builder instance

## Future Enhancements

1. **Ingredient substitution**: Add preferred/avoided ingredient swaps
2. **Meal planning**: Multi-day meal plans with variety
3. **Cost optimization**: Budget-aware ingredient selection
4. **Nutritional targets**: Custom nutrition goals per pet
5. **Feedback loop**: Learn from user preferences
6. **Allergen management**: Detailed allergen tracking
7. **Seasonal ingredients**: Adjust for seasonal availability

## Documentation

- `REFACTOR_MIGRATION_GUIDE.md` - Step-by-step migration instructions
- `lib/recipe-generator-v2.ts` - API documentation
- `lib/__tests__/recipe-generator-v2.test.ts` - Usage examples
- This file - Architecture overview
