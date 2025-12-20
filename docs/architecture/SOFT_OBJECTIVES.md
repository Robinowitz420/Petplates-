# Soft Objectives - Recipe Scoring

**Last Updated:** December 17, 2025

These are **preferences and optimizations** that improve recipe quality but never block generation. Recipes score lower if they don't meet these objectives, but remain valid.

---

## Scoring Philosophy

**Soft objectives influence RANKING, not VALIDITY.**

- A recipe with low soft objective scores is still safe and nutritious
- Users get the best available recipe, even if it's not perfect
- Scoring helps choose between multiple valid candidates

---

## SO1: Ingredient Diversity

**Goal:** Prefer recipes with more ingredients (within reason)

**Scoring:**
- 4+ ingredients: +0 penalty (ideal)
- 3 ingredients: -10 points (acceptable, minimum met)
- 2 ingredients: -30 points (should trigger fallback to add more)

**Why:** More ingredients = better micronutrient coverage and meal variety

**Never blocks:** Minimum 3 ingredients is a HARD constraint, but preferring 4+ is soft

---

## SO2: Palatability Tiers

**Goal:** Prefer ingredients pets naturally enjoy

**Tiers (NOT precise scores):**
```typescript
enum PalatabilityTier {
  High = 3,    // Organ meats, fats, fish oils, bone broth
  Medium = 2,  // Muscle meats, eggs, grains, some vegetables
  Low = 1      // Fibrous vegetables, supplements, hay
}
```

**Scoring:**
- High tier ingredient: +3 points per ingredient
- Medium tier ingredient: +2 points per ingredient
- Low tier ingredient: +1 point per ingredient

**Usage:** Tie-breaker only when nutritional scores are equal

**Why Tiers?**
- Honest about uncertainty (we don't have precise palatability data)
- Easy to maintain
- Prevents "fake precision theater"

**Examples:**
- **High:** Chicken liver, salmon oil, beef heart, sardines
- **Medium:** Chicken breast, eggs, rice, sweet potato, carrots
- **Low:** Kale, spinach, psyllium husk, alfalfa hay

---

## SO3: Health Concern Alignment

**Goal:** Prefer ingredients beneficial for pet's health concerns

**Scoring:**
- Beneficial ingredient: +20 points
- Neutral ingredient: 0 points
- Contraindicated ingredient: HARD FILTER (not scoring)

**Priority:** If multiple health concerns, weight by severity
- Critical (kidney disease, diabetes): 2x weight
- Moderate (allergies, weight management): 1.5x weight
- Minor (coat health, digestion): 1x weight

**Example:**
- Pet has kidney disease (critical) + coat health (minor)
- Low-phosphorus ingredient: +40 points (20 × 2)
- Omega-3 rich ingredient: +20 points (20 × 1)

---

## SO4: Budget Tier Filtering

**Goal:** Match ingredient selection to user's budget preference

**Tiers:**
```typescript
enum BudgetTier {
  Premium = 'premium',   // qualityScore >= 7
  Standard = 'standard', // qualityScore >= 5
  Budget = 'budget'      // all ingredients allowed
}
```

**Implementation:** Filter ingredient pool BEFORE scoring
- Premium: Only ingredients with qualityScore ≥ 7
- Standard: Only ingredients with qualityScore ≥ 5
- Budget: All ingredients available

**CRITICAL:** Budget tier affects WHICH ingredients are available, NEVER portion sizes

**Why:** Ensures users get appropriate quality level without compromising nutrition

---

## SO5: Quality Score

**Goal:** Prefer higher-quality ingredient sources

**Scoring:**
- Quality score 1-10 maps to 0-100 points
- Formula: `qualityScore * 10`

**Never blocks:** Even quality score 1 ingredients are valid if they meet nutrition requirements

**Examples:**
- Organic, grass-fed chicken breast: 9-10
- Standard grocery store chicken: 7-8
- Generic bulk chicken: 5-6
- Lowest-grade chicken: 3-4

---

## SO6: Cost Optimization (Future)

**Goal:** Minimize meal cost while meeting nutrition

**Scoring:** TBD (not implemented yet)

**Constraints:**
- Never compromise nutrition for cost
- Budget tier filtering happens first
- Cost optimization only chooses between equivalent options

---

## SO7: Variety Across Meals (Future)

**Goal:** Avoid serving same ingredients repeatedly

**Scoring:** TBD (requires meal history tracking)

**Implementation:**
- Track last N meals per pet
- Penalize ingredients used in recent meals
- Never block ingredients entirely (rotation is preference, not requirement)

---

## Scoring Weights

**Current weights in RecipeBuilder:**

### General Ingredients:
- Health alignment: 35%
- Nutritional value: 30%
- Palatability: 20%
- Quality: 15%

### Protein Category (Dogs/Cats):
- Health alignment: 20%
- Nutritional value: 70% (protein density dominates)
- Palatability: 8%
- Quality: 2%

**Why protein is different:** Protein density is critical for meeting AAFCO standards, so nutritional scoring dominates.

---

## Fallback Ladder (When Strict Rules Fail)

If no recipe passes all soft objectives, relax in this order:

### Level 1: Strict (Try First)
- All hard constraints ✅
- All soft objectives optimized ✅
- 4+ ingredients preferred
- High palatability preferred
- Budget tier respected

### Level 2: Relaxed Soft Objectives
- All hard constraints ✅
- Ignore palatability scoring
- Ignore quality scoring
- Accept 3 ingredients (minimum)
- Budget tier still respected

### Level 3: Minimal Viable
- All hard constraints ✅
- Ignore all soft objectives
- Accept 3 ingredients (minimum)
- Ignore budget tier (use any quality)

### Level 4: Closest Safe Solution
- All hard constraints ✅
- Return best attempt with warning
- Document which objectives failed
- Never return null

**Example warning:**
```
"Could not meet all preferences. Showing closest safe option.
Relaxed: ingredient variety, palatability preferences"
```

---

## What Soft Objectives Are NOT

❌ **Not safety rules** - Those are hard constraints
❌ **Not AAFCO minimums** - Those are hard constraints
❌ **Not toxicity filters** - Those are hard constraints
❌ **Not gates** - Recipes don't fail for low soft objective scores

---

## Adding New Soft Objectives

When adding a new objective, ask:
1. Does this improve quality without affecting safety? → Soft objective
2. Is this a user preference? → Soft objective
3. Can we rank recipes by this metric? → Soft objective
4. Would violating this harm the pet? → Hard constraint (wrong category)

---

## Regional Considerations

**Soft objectives are UNIVERSAL** - they apply regardless of:
- User location
- Retail availability
- Amazon ASINs
- Prices

**Exception:** Cost optimization (future) may vary by region, but never affects nutrition.

---

## Relationship to Retail Data

**Retail data (Amazon links, prices, brands) is POST-GENERATION ONLY.**

Soft objectives may reference quality or cost, but:
- Quality = ingredient source quality (organic, grass-fed, etc.)
- Cost = estimated ingredient cost (not real-time pricing)
- Never dependent on ASIN availability
- Never dependent on Amazon inventory

**Recipe generation must work without any retail data.**

---

## Testing Soft Objectives

To verify soft objectives are working correctly:

1. Generate recipe with all objectives optimized
2. Artificially constrain ingredient pool (remove high-scoring options)
3. System should still return valid recipe (lower score, but valid)
4. Never return null or error

**If system fails to generate → you've made a soft objective into a hard constraint by accident.**
