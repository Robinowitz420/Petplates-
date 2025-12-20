# Recipe Generation Pipeline Architecture

**Last Updated:** December 17, 2025

This document defines the stable, deterministic pipeline for recipe generation. No recursive chaos, no retry roulette.

---

## Pipeline Overview

```
User Request
    ↓
[1] Filter Ingredients (Hard Constraints)
    ↓
[2] Score Ingredients (Soft Objectives)
    ↓
[3] Select Ingredients (Category-Based)
    ↓
[4] Calculate Portions (Nutrient-Targeted)
    ↓
[5] Validate Recipe (Hard Constraints)
    ↓
[6] Score Recipe (Soft Objectives)
    ↓
[7] Return or Fallback
```

---

## Stage 1: Filter Ingredients (Hard Constraints)

**Input:** All ingredients + user constraints
**Output:** Filtered ingredient pool
**Duration:** ~5ms

### Filters Applied (in order):

1. **Species Compatibility**
   - Dogs/Cats: All categories available
   - Birds: No mammalian proteins (except eggs)
   - Reptiles: No grains
   - Pocket-pets: No meat proteins (except eggs/insects)

2. **Toxicity Exclusions**
   - Remove species-specific toxic ingredients
   - Examples: chocolate, grapes, onions, avocado (varies by species)

3. **Allergen Exclusions**
   - Remove ingredients matching `constraints.allergies[]`
   - Case-insensitive substring match

4. **Banned Ingredients**
   - Remove ingredients matching `constraints.bannedIngredients[]`
   - User preferences (e.g., "no beef")

5. **Health Contraindications**
   - Remove ingredients contraindicated for health concerns
   - Example: High-phosphorus foods for kidney disease

6. **Budget Tier Filtering**
   - Premium: qualityScore >= 7
   - Standard: qualityScore >= 5
   - Budget: all ingredients

**Result:** Candidate ingredient pool (typically 100-200 ingredients)

---

## Stage 2: Score Ingredients (Soft Objectives)

**Input:** Filtered ingredient pool
**Output:** Scored ingredients (sorted by total score)
**Duration:** ~10ms

### Scoring Components:

#### For General Ingredients:
```typescript
totalScore = 
  (healthScore * 0.35) +
  (nutritionalScore * 0.30) +
  (palatabilityScore * 0.20) +
  (qualityScore * 0.15)
```

#### For Protein Category (Dogs/Cats):
```typescript
totalScore = 
  (healthScore * 0.20) +
  (nutritionalScore * 0.70) +  // Protein density dominates
  (palatabilityScore * 0.08) +
  (qualityScore * 0.02)
```

### Scoring Methods:

**Health Score (0-100):**
- Beneficial for health concerns: 80-100
- Neutral: 40-60
- Slightly negative: 20-40

**Nutritional Score (0-100):**
- Protein density: 0-60 points (tiered: 30%+=60, 25%+=50, 20%+=35, etc.)
- Omega-3 content: 0-20 points
- Fiber content: 0-10 points
- Micronutrients: 0-10 points

**Palatability Score (0-100):**
- High tier: 100 points
- Medium tier: 67 points
- Low tier: 33 points

**Quality Score (0-100):**
- Direct mapping: qualityScore * 10

---

## Stage 3: Select Ingredients (Category-Based)

**Input:** Scored ingredients (sorted)
**Output:** Selected ingredients (4-6 typically)
**Duration:** ~5ms

### Selection Strategy:

1. **Get Required Categories** (species-specific)
   - Dogs: protein, carb, vegetable, fat
   - Cats: protein, vegetable (×2), fat
   - Birds: seed (×2), nut (×2), fruit, vegetable
   - Reptiles: insect (×2), vegetable, fruit
   - Pocket-pets: hay, vegetable (×2), fruit, seed

2. **For Each Category:**
   - Filter scored ingredients by category
   - For dogs/cats protein: ONLY primary proteins
   - Determine pool size based on diversity mode
   - Use weighted random selection from top N
   - Remove selected to avoid duplicates

3. **Minimum Ingredient Validation:**
   - If selected.length < 3, add more from top-scored
   - Ensures proper meal prep (not just "2 things in a bowl")

**Result:** 3-6 ingredients selected

---

## Stage 4: Calculate Portions (Nutrient-Targeted)

**Input:** Selected ingredients
**Output:** Portioned ingredients (grams per ingredient)
**Duration:** ~5ms

### Portion Calculation:

#### Step 4.1: Calculate Meal Size
```typescript
// Dogs/Cats
totalMealGrams = petWeightKg * mealMultiplier
// mealMultiplier: premium=80, standard=65, budget=50

// Exotic Pets
totalMealGrams = petWeightKg * speciesMultiplier
// birds=40, reptiles=30, pocket-pets=100
```

#### Step 4.2: Calculate Nutrient Targets
```typescript
targetProteinGrams = totalMealGrams * proteinPercent
targetFatGrams = totalMealGrams * fatPercent

// Protein targets:
// Dogs: 20%, Cats: 23%, Birds: 15%, Reptiles: 15%, Pocket-pets: 14%
```

#### Step 4.3: Allocate Portions

**For Dogs/Cats:**
1. Find primary protein ingredient
2. Calculate grams needed: `targetProteinGrams / proteinDensity`
3. Cap at max protein percent (dogs: 85%, cats: 90%)
4. Cap at max-inclusion constraint
5. Distribute remaining grams to other ingredients

**For Exotic Pets:**
1. Distribute with protein bias:
   - 70% equal distribution
   - 30% protein-density-weighted
2. Apply max-inclusion constraints
3. Add random variation (±15%)

#### Step 4.4: Architectural Rules
- **Never override max-inclusion constraints** (even to hit protein target)
- **Accept below-target** rather than violate safety limits
- **Respect species-specific caps** (cats 90%, dogs 85%)

**Result:** Array of `{ingredient, grams}` pairs

---

## Stage 5: Validate Recipe (Hard Constraints)

**Input:** Portioned recipe
**Output:** Validation result (pass/fail + details)
**Duration:** ~5ms

### Validation Checks:

1. **S1 Gate (Dogs/Cats Only):**
   - Exactly 1 primary protein present
   - FAIL if violated

2. **Protein Minimum:**
   - Dogs: ≥18%, Cats: ≥23% (with ±2% tolerance)
   - Exotic pets: Within range (not hard point)
   - FAIL if below minimum (dogs/cats), WARN if outside range (exotic)

3. **T1 Gate (Dogs/Cats Only):**
   - Vitamin A ≤ ceiling
   - FAIL if exceeded and data complete

4. **T2 Gate (Dogs/Cats Only):**
   - Copper ≤ ceiling
   - FAIL if exceeded and data complete

5. **Calorie Target:**
   - Within ±15% of target
   - FAIL if outside bounds

6. **Meal Size:**
   - Within safe bounds for pet weight
   - FAIL if too large or too small

**Result:** `{ isValid: boolean, failedRules: string[], warnings: string[] }`

---

## Stage 6: Score Recipe (Soft Objectives)

**Input:** Valid recipe
**Output:** Recipe with quality score
**Duration:** ~2ms

### Soft Penalties:

- **Q1:** Ingredient diversity penalty (-30 if <3 ingredients)
- **Q2:** Palatability penalty (if all low-tier)
- **Q3:** Quality penalty (if average quality <5)
- **Q4:** Cost penalty (if over budget - future)
- **Q5:** Variety penalty (if repeated ingredients - future)

**Total Penalty:** Sum of all soft penalties (informational only, doesn't block)

---

## Stage 7: Return or Fallback

**Input:** Validation result + scored recipe
**Output:** Final recipe or fallback attempt
**Duration:** Variable

### Decision Tree:

```typescript
if (recipe.isValid && recipe.totalPenalty < 50) {
  return recipe; // Success!
}

if (recipe.isValid && recipe.totalPenalty >= 50) {
  return { ...recipe, warning: "Recipe has quality penalties" };
}

if (!recipe.isValid) {
  // Enter fallback ladder
  return attemptFallback();
}
```

### Fallback Ladder:

**Level 1: Relax Soft Objectives**
- Ignore palatability scoring
- Ignore quality scoring
- Accept 3 ingredients minimum
- Retry generation

**Level 2: Relax Diversity**
- Allow 2-3 ingredients (still enforce minimum 3 via validation)
- Ignore budget tier
- Retry generation

**Level 3: Minimal Viable**
- Only enforce hard constraints
- Accept any valid combination
- Return with warning

**Level 4: Closest Safe Solution**
- Return best attempt that passes safety checks
- Document which constraints failed
- Never return null

---

## Performance Targets

| Stage | Target Duration | Max Duration |
|-------|----------------|--------------|
| Filter | 5ms | 20ms |
| Score | 10ms | 50ms |
| Select | 5ms | 20ms |
| Portion | 5ms | 20ms |
| Validate | 5ms | 20ms |
| Score Recipe | 2ms | 10ms |
| **Total** | **32ms** | **140ms** |

---

## Error Handling

### Never Return Null

The system MUST always return something:
- Valid recipe (ideal)
- Valid recipe with warnings (acceptable)
- Closest safe solution with explicit warnings (fallback)

### Error Types:

**Hard Errors (prevent generation):**
- No ingredients available after filtering
- Pet weight invalid or missing
- Species not recognized

**Soft Errors (trigger fallback):**
- No recipe passes all hard constraints
- Protein target unreachable
- Ingredient count too low

**Warnings (informational):**
- Soft objectives not met
- Protein slightly below target
- Micronutrient data incomplete (exotic pets)

---

## Testing Strategy

### Unit Tests:
- Each stage independently
- Hard constraint validation
- Soft objective scoring
- Portion calculation accuracy

### Integration Tests:
- Full pipeline for each species
- Fallback ladder triggers correctly
- Edge cases (allergies, health concerns)

### Regression Tests:
- Known good recipes still generate
- Performance stays within targets
- No null returns under any condition

---

## Future Enhancements

### Phase 2:
- Meal history tracking (variety across meals)
- User rating feedback loop
- Cost optimization scoring

### Phase 3:
- Multi-meal planning (weekly menus)
- Seasonal ingredient preferences
- Regional ingredient availability

---

## Invariants (Never Violate)

1. **Retail data never influences generation**
2. **Hard constraints always enforced**
3. **Soft objectives never block recipes**
4. **Portion logic respects max-inclusion**
5. **System always returns something (never null)**
6. **Nutrition always wins over preferences**
7. **Budget affects ingredient pool, never portions**

---

## Debugging Checklist

If recipes fail to generate:

1. Check filtered ingredient count (Stage 1)
   - Should be 50+ after filtering
   - If <10, constraints too strict

2. Check selected ingredient count (Stage 3)
   - Should be 3-6 ingredients
   - If <3, selection logic broken

3. Check validation failures (Stage 5)
   - Which hard constraint failed?
   - Is it actually a hard constraint or soft objective?

4. Check fallback ladder (Stage 7)
   - Did it trigger?
   - Which level reached?
   - Why didn't it return a recipe?

**If system returns null → architectural violation. Fix immediately.**
