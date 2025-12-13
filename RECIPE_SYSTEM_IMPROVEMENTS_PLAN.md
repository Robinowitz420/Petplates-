# Recipe Generation System Improvements - Complete Plan

## Current Status
✅ **Completed:**
- Nutrition fallback system created (`lib/utils/nutritionFallbacks.ts`)
- Enhanced name normalization with fuzzy matching
- Missing ingredient tracking in validation
- Review flags added to Recipe interface
- Enhanced generator script with logging
- Test suite created
- Ingredient button visibility fixed
- Nutritional highlights added to ingredient buttons

## Remaining Critical Improvements

### Phase 1: Nutritional Physics Engine (Shared Service Layer)

**Problem:** Calculation logic (dry matter conversion, AAFCO checks, macro summation) is scattered in `completeRecipeSystem.ts`.

**Solution:** Create dedicated `lib/utils/nutritionalPhysics.ts` service.

**Tasks:**
1. **Create `lib/utils/nutritionalPhysics.ts`**
   - Centralize all nutrition calculations
   - `convertToDryMatter(nutrition, moisture)`: Convert as-fed to dry matter basis
   - `calculateMacros(ingredients)`: Sum protein, fat, carbs, fiber, etc.
   - `validateAgainstAAFCO(nutrition, species, lifeStage)`: Return standardized ValidationResult
   - `calculateCaPRatio(calcium, phosphorus)`: Calculate and validate ratio
   - All functions return standardized interfaces

2. **Update `completeRecipeSystem.ts`**
   - Replace inline calculations with calls to `nutritionalPhysics`
   - Keep recipe generation logic separate from calculation logic
   - Import and use the service layer

3. **Benefits:**
   - Single source of truth for formulas
   - Easy to update AAFCO standards without touching generator
   - Testable calculation logic
   - Reusable across components

### Phase 2: Mandatory Recipe and Data Versioning

**Problem:** No way to track which recipes use outdated nutrition standards or data.

**Solution:** Implement dual versioning system.

**Tasks:**
1. **Add Version Fields to Recipe Interface** (`lib/types.ts`)
   ```typescript
   generationInfo?: {
     version: string; // Schema version (e.g., '2.0')
     dataVersion: string; // AAFCO/standards version (e.g., 'AAFCO-2023')
     ingredientDataVersion: string; // Ingredient composition data version
     attempts?: number;
     confidence?: number;
   }
   ```

2. **Create Version Constants** (`lib/data/versions.ts`)
   - `CURRENT_SCHEMA_VERSION = '2.0'`
   - `CURRENT_DATA_VERSION = 'AAFCO-2023'`
   - `CURRENT_INGREDIENT_VERSION = '2024-01'`

3. **Update Generator** (`scripts/generate-recipes.ts`)
   - Set `dataVersion` from constants
   - Set `ingredientDataVersion` from constants
   - Include version in all generated recipes

4. **Add Version Check Utility** (`lib/utils/versionCheck.ts`)
   - `isRecipeOutdated(recipe)`: Check if recipe uses old standards
   - `getVersionStatus(recipe)`: Return version comparison
   - Used by UI to show warnings

### Phase 3: Structured Failure Logging and Monitoring

**Problem:** Failed recipe generation attempts are discarded silently, making it impossible to fix data issues.

**Solution:** Transform failures into structured, analyzable data.

**Tasks:**
1. **Create Failure Log Interface** (`lib/types.ts`)
   ```typescript
   interface RecipeGenerationFailure {
     timestamp: string;
     species: string;
     attempt: number;
     targetMacros: { protein: number; fat: number; calories: number };
     healthConcerns: string[];
     availableIngredients: string[];
     validationErrors: string[];
     validationWarnings: string[];
     selectedIngredients: string[];
     nutritionResult?: RecipeNutrition;
   }
   ```

2. **Update Generator** (`scripts/generate-recipes.ts`)
   - Instead of returning `null`, write failure to `lib/data/recipe-failures.json`
   - Include all context: targets, ingredients, errors
   - Append to log file (don't overwrite)

3. **Create Failure Analysis Script** (`scripts/analyze-failures.ts`)
   - Read failure log
   - Group by error type
   - Identify most common missing ingredients
   - Generate report: "X failures due to missing ingredient Y"

4. **Add Monitoring Dashboard** (Optional - Future)
   - Visualize failure rates
   - Track improvement over time
   - Alert on high failure rates

### Phase 4: Unified Ingredient Registry

**Problem:** Three separate ingredient data sources (VETTED_SPECIES_MAP, INGREDIENT_COMPOSITIONS, allIngredients) with mismatched IDs.

**Solution:** Create single canonical ingredient registry.

**Tasks:**
1. **Create Unified Registry** (`lib/data/unifiedIngredientRegistry.ts`)
   ```typescript
   interface UnifiedIngredient {
     id: string; // Canonical ID (e.g., 'chicken_breast')
     displayName: string; // User-friendly name (e.g., 'Chicken Breast')
     normalizedName: string; // Normalized for lookup
     nutrition: IngredientComposition | null; // From INGREDIENT_COMPOSITIONS or fallback
     speciesSafety: SafeSpecies[]; // From VETTED_SPECIES_MAP
     vettedProduct?: VettedProduct; // From VETTED_PRODUCTS
     category: string; // 'protein', 'vegetable', etc.
     needsReview: boolean; // True if using fallback nutrition
   }
   ```

2. **Build Registry Function**
   - Merge all three data sources
   - Create canonical ID mapping
   - Handle name variations
   - Flag ingredients needing review

3. **Update All Consumers**
   - Replace direct imports of VETTED_SPECIES_MAP, INGREDIENT_COMPOSITIONS
   - Use unified registry instead
   - Single `getIngredient(id)` function

4. **Migration Strategy**
   - Keep old files for backward compatibility
   - Gradually migrate components
   - Add deprecation warnings

### Phase 5: Enhanced Data Quality

**Tasks:**
1. **Add Missing Carbs/Fiber to Existing Ingredients**
   - Audit all 31 entries in `ingredientCompositions.ts`
   - Add estimated values where missing
   - Mark with `needsReview: true` if estimated

2. **Fill Critical Nutrition Gaps**
   - Prioritize: mealworms, crickets, duck breast, rabbit meat, venison
   - Use USDA data where available
   - Add to `ingredientCompositions.ts` with proper source attribution

3. **Create Data Validation Script**
   - Check all ingredients in VETTED_SPECIES_MAP have nutrition data
   - Verify all nutrition data has required fields
   - Generate report of gaps

## Implementation Priority

### Week 1: Foundation
1. ✅ Nutrition fallback system (DONE)
2. ✅ Name normalization (DONE)
3. ✅ Missing ingredient tracking (DONE)
4. Create Nutritional Physics Engine
5. Add version constants

### Week 2: Versioning & Logging
1. Implement recipe versioning
2. Add failure logging
3. Create failure analysis script
4. Update generator to use versions

### Week 3: Unified Registry
1. Create unified ingredient registry
2. Build migration utilities
3. Update generator to use registry
4. Test with one component

### Week 4: Data Quality & Polish
1. Fill missing carbs/fiber
2. Add critical missing ingredients
3. Create data validation script
4. Performance optimization

## Success Metrics

- **Coverage**: 100% of vetted ingredients have nutrition data (real or fallback) ✅
- **Validation**: All recipes validated on dry matter basis ✅
- **Quality**: < 5% of recipes need review (target: < 2%)
- **Performance**: Full regeneration < 60 seconds
- **Testing**: 100% of critical paths covered by tests
- **Versioning**: All recipes tagged with data version
- **Monitoring**: Failure log analyzed weekly

## Files to Create/Modify

**New Files:**
- `lib/utils/nutritionalPhysics.ts` - Centralized calculation service
- `lib/data/versions.ts` - Version constants
- `lib/utils/versionCheck.ts` - Version comparison utilities
- `lib/data/unifiedIngredientRegistry.ts` - Unified ingredient data
- `lib/data/recipe-failures.json` - Failure log (auto-generated)
- `scripts/analyze-failures.ts` - Failure analysis tool
- `lib/types/failures.ts` - Failure log types

**Modified Files:**
- `lib/utils/completeRecipeSystem.ts` - Use nutritionalPhysics service
- `lib/types.ts` - Add version fields, failure types
- `scripts/generate-recipes.ts` - Add versioning, failure logging
- `lib/data/ingredientCompositions.ts` - Add missing carbs/fiber

## Risk Mitigation

1. **Backward Compatibility**: All new fields optional, old recipes still work
2. **Gradual Migration**: Unified registry can coexist with old system
3. **Data Safety**: Failure logging doesn't break generation
4. **Performance**: Service layer adds minimal overhead

