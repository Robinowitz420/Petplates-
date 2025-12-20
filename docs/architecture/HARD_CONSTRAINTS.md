# Hard Constraints - Recipe Generation

**Last Updated:** December 17, 2025

These are **non-negotiable rules** that recipes MUST satisfy. If a constraint is violated, the recipe is invalid and cannot be served.

---

## Universal Hard Constraints (All Species)

### UC1: Toxicity Exclusions
**Rule:** No ingredients toxic to the target species
**Enforcement:** Pre-filter ingredients before selection
**Examples:**
- Dogs/Cats: No chocolate, grapes, raisins, onions, garlic, xylitol, macadamia nuts
- Birds: No avocado, chocolate, salt, caffeine, alcohol
- Reptiles: No avocado, rhubarb
- Pocket-pets: No chocolate, avocado, raw beans

### UC2: Allergen Exclusions
**Rule:** No ingredients matching user-specified allergies
**Enforcement:** Filter by `constraints.allergies` array
**Example:** If user specifies "chicken", exclude all chicken-based ingredients

### UC3: Banned Ingredients
**Rule:** No ingredients matching user-specified bans
**Enforcement:** Filter by `constraints.bannedIngredients` array
**Example:** User preference to exclude beef

### UC4: Meal Size Bounds
**Rule:** Total meal size must be within safe bounds for pet weight
**Formula:** `petWeightKg * mealMultiplier ± 20%`
**Enforcement:** Validate total grams after portion calculation

---

## Dogs/Cats Hard Constraints

### DC1: Primary Protein Requirement (S1 Gate)
**Rule:** Exactly 1 primary protein ingredient
**Enforcement:** Filter for `proteinRole='primary'` AND `category='protein'`
**Why:** AAFCO standards require consistent, high-quality protein source
**Valid Primary Proteins:** chicken breast, quail, salmon atlantic

### DC2: Minimum Protein (AAFCO)
**Rule:** 
- Dogs: ≥18% protein by dry matter
- Cats: ≥26% protein by dry matter (relaxed to 23% for diverse sources)
**Enforcement:** Calculate total protein percentage after portioning
**Tolerance:** ±2% acceptable due to ingredient variance

### DC3: Vitamin A Ceiling (T1 Gate)
**Rule:** Total Vitamin A ≤ species-specific ceiling
**Enforcement:** Sum `vitaminA_IU` across all ingredients
**Why:** Hypervitaminosis A is toxic
**Data Requirement:** All protein/organ ingredients must have Vitamin A data

### DC4: Copper Ceiling (T2 Gate)
**Rule:** Total Copper ≤ species-specific ceiling
**Enforcement:** Sum `copper_mg_per_100g` across all ingredients
**Why:** Copper toxicity risk, especially in certain breeds
**Data Requirement:** All ingredients should have copper data

### DC5: Calorie Target
**Rule:** Total calories within ±15% of target
**Formula:** `targetCalories = petWeightKg * caloriesPerKg[lifeStage]`
**Enforcement:** Calculate from macronutrients (protein, fat, carbs)
**Why:** Critical for weight management

### DC6: Minimum Ingredient Count
**Rule:** At least 3 ingredients per recipe
**Why:** Ensures nutritional diversity and proper meal prep (not just "2 things in a bowl")
**Enforcement:** Validate selected ingredients count ≥ 3

---

## Exotic Pets Hard Constraints (Birds, Reptiles, Pocket-Pets)

### EC1: Species-Appropriate Protein Sources
**Birds:**
- No mammalian proteins (except eggs)
- Primary proteins: seeds, nuts, insects (for some species)

**Reptiles:**
- No grains (carnivorous/insectivorous)
- Primary proteins: insects, some fish

**Pocket-Pets:**
- No meat proteins (except eggs, mealworms for omnivores)
- Primary proteins: hay, seeds, vegetables

### EC2: Minimum Protein (Species-Specific Ranges)
**Rule:** Protein within acceptable range (not a fixed point)
- Birds: 13-17% (target 15%)
- Reptiles: 13-17% (target 15%)
- Pocket-pets: 12-16% (target 14%)

**Why:** Natural diets fluctuate; ranges are more realistic than fixed targets

### EC3: Toxicity Exclusions (Species-Specific)
**Enforcement:** Pre-filter by species compatibility in `INGREDIENT_COMPOSITIONS`

---

## What Is NOT a Hard Constraint

These are **soft objectives** (scoring only, never block recipes):

❌ Ingredient diversity beyond minimum 3
❌ Palatability preferences
❌ Quality scores
❌ Budget tier
❌ Brand preferences
❌ Cost optimization
❌ Variety across multiple meals
❌ User ratings (future feature)

---

## Validation Order

1. **Pre-Generation Filters** (UC1, UC2, UC3, EC1)
   - Remove toxic ingredients
   - Remove allergens
   - Remove banned ingredients
   - Filter by species compatibility

2. **Selection Constraints** (DC1, DC6)
   - Enforce primary protein requirement
   - Ensure minimum ingredient count

3. **Post-Generation Validation** (DC2-DC5, EC2)
   - Check protein percentage
   - Check micronutrient ceilings
   - Check calorie target
   - Check meal size bounds

4. **Fallback Strategy** (if validation fails)
   - See SOFT_OBJECTIVES.md for relaxation order

---

## Enforcement Philosophy

**Hard constraints are SAFETY and NUTRITION.**

If a rule can be relaxed without compromising pet health, it belongs in SOFT_OBJECTIVES.md, not here.

When in doubt: **Can a pet safely eat this recipe?** 
- Yes → Soft objective
- No → Hard constraint

---

## Regional Considerations

**Hard constraints are UNIVERSAL** - they apply regardless of:
- User location
- Retail availability
- Amazon ASINs
- Prices
- Shipping

**Retail data NEVER influences hard constraints.**

---

## Future Additions

When adding new hard constraints, ask:
1. Is this a safety issue? (toxicity, overdose)
2. Is this an AAFCO/nutritional minimum?
3. Would violating this harm the pet?

If no to all three → it's a soft objective, not a hard constraint.
