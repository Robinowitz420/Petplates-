# RECIPE BUILDER TEST SUITE GUIDE

## Overview

Comprehensive test suite that validates **biological invariants**, not scoring hacks.

**Key Insight:** If these tests pass, the system can never generate unsafe recipes like "salmon + beef liver + rapeseed" again.

---

## Test File

**Location:** `lib/generator/RecipeBuilder.integration.test.ts`

**Run with:**
```bash
npm test -- RecipeBuilder.integration.test.ts
```

---

## Test Categories

### 1. Golden-Path Tests (System Succeeds)

**Purpose:** Verify system can still generate high-quality recipes on perfect inputs.

| Test | Input | Assert |
|------|-------|--------|
| Perfect dog | Adult, no allergies, no health issues | Score ≥95, has protein+carb+veg, passes validation |
| Perfect cat | Adult, no issues | Score ≥90, high protein, low/no carb |

**Why:** Ensures the safety gates don't break normal recipe generation.

---

### 2. Rejection Tests (Safety Gates Work)

**Purpose:** Confirm hard gates reject unsafe combinations before scoring.

| Test | Scenario | Assert |
|------|----------|--------|
| Multiple primary proteins | chicken + salmon | Rejected (S1 rule) |
| Missing carb (dog) | beef + carrots + oil | Rejected (S4 rule) |

**Why:** Proves safety gates are active and working.

---

### 3. Nutrient Ceiling Tests

**Purpose:** Verify micronutrient caps are enforced.

| Test | Scenario | Assert |
|------|----------|--------|
| Vitamin A ceiling | Liver in recipe | Total IU ≤ 5000 (dogs) |
| Ca:P ratio | Any recipe | Ratio 1.2-2.0 (dogs) |

**Why:** Prevents toxicity from "healthy" ingredients.

---

### 4. Allergen & Derivative Tests

**Purpose:** Confirm allergen flags propagate across derivatives.

| Test | Scenario | Assert |
|------|----------|--------|
| Hidden allergen | Chicken-allergic pet gets chicken fat | Rejected (T5 rule) |

**Why:** Prevents allergic reactions from ingredient derivatives.

---

### 5. Distribution Tests (Catch Clustering)

**Purpose:** Verify recipes vary, not cluster around same scores.

**Test:** Generate 50 recipes, measure:
- Max score ≥ 95
- Min score ≥ 60
- Std deviation > 6
- No single score appears >20%

**Why:** Proves weighted random selection works (prevents "always salmon").

---

### 6. Regression Tests (Never Break Again)

**Purpose:** Lock in critical biological invariants.

| Test | Assertion | Runs |
|------|-----------|------|
| Salmon + liver never appears | Should never co-occur | 50 recipes |
| Organ meat ≤ 10% | Always within cap | 50 recipes |
| Exactly 1 primary protein | Never 0, never 2+ | 50 recipes |

**Why:** Catches regressions immediately if safety rules break.

---

### 7. Property-Based Fuzzer (1000 Random Recipes)

**Purpose:** Find edge cases humans miss.

| Test | Assertion |
|------|-----------|
| No unsafe recipe reaches scoring | All 1000 pass validation |
| No nutrient ceiling violations survive | All 1000 pass T rules |

**Why:** High-value, low-effort way to catch edge cases.

---

## Expected Results

### ✅ All Tests Pass

```
📋 Golden-Path Tests (System Succeeds)
  ✅ Perfect dog: scores ≥95, safe composition
  ✅ Perfect cat: high protein, low carb, ≥90 score

📋 Rejection Tests (Safety Gates Work)
  ✅ Multiple primary proteins rejected (S1 rule)
  ✅ Missing carb for dog rejected (S4 rule)

📋 Nutrient Ceiling Tests
  ✅ Vitamin A ceiling enforced (T1 rule)
  ✅ Calcium-phosphorus ratio in range (T6 rule)

📋 Allergen & Derivative Tests
  ✅ Allergen derivatives rejected (T5 rule)

📋 Distribution Tests (No Clustering)
  ✅ Score spread: 50 recipes have variance

📋 Regression Tests (Biological Invariants)
  ✅ Salmon + liver never appears
  ✅ Organ meat never exceeds 10%
  ✅ Exactly one primary protein per recipe

📋 Property-Based Fuzzer (1000 Random Recipes)
  ✅ No unsafe recipe reaches scoring (all 1000 pass validation)
  ✅ No nutrient ceiling violations survive (all 1000 pass T rules)

========================================================================
TEST SUMMARY
========================================================================

✅ Passed: 14
❌ Failed: 0
📊 Total: 14

🎉 All tests passed!
```

---

## What Each Test Proves

| Test | Proves |
|------|--------|
| Golden-Path | System still works on normal inputs |
| Rejection | Safety gates are active |
| Nutrient Ceiling | Micronutrient toxicity prevented |
| Allergen/Derivative | Cross-source safety works |
| Distribution | Randomization prevents clustering |
| Regression | Critical invariants locked in |
| Fuzzer | Edge cases handled |

---

## Critical Mindset Shift

**Old thinking:** "Does the scoring work?"  
**New thinking:** "Can the system ever generate an unsafe recipe?"

If all tests pass: **Salmon + liver can never happen again.**

---

## Running Tests

### Quick Check (5 min)
```bash
npm test -- RecipeBuilder.integration.test.ts
```

### Continuous Monitoring
```bash
npm test -- RecipeBuilder.integration.test.ts --watch
```

### With Coverage
```bash
npm test -- RecipeBuilder.integration.test.ts --coverage
```

---

## Test Structure

Each test:
1. Creates constraints (species, life stage, allergies, etc.)
2. Generates recipe(s)
3. Asserts biological invariants
4. Fails fast with clear error message

Example:
```typescript
test('Organ meat never exceeds 10%', () => {
  for (let i = 0; i < 50; i++) {
    const recipe = builder.generate();
    const organPercent = (organMeatGrams / recipe.totalGrams) * 100;
    assert(organPercent <= 10, `Got ${organPercent}%`);
  }
});
```

---

## Failure Interpretation

### If a test fails:

1. **Golden-Path fails** → Safety gates broke normal generation
2. **Rejection test fails** → A hard gate is not working
3. **Nutrient Ceiling fails** → Micronutrient cap not enforced
4. **Allergen test fails** → Derivative detection broken
5. **Distribution fails** → Randomization not working
6. **Regression fails** → A critical invariant was violated
7. **Fuzzer fails** → Edge case found (debug specific recipe)

---

## Next Steps

1. **Run the test suite** to verify all tests pass
2. **Monitor for regressions** as you make changes
3. **Add new tests** if you discover new edge cases
4. **Use fuzzer output** to debug any failures

---

## Key Files

| File | Purpose |
|------|---------|
| `lib/generator/RecipeBuilder.integration.test.ts` | Main test suite |
| `lib/generator/RecipeConstraintRules.ts` | Validation rules |
| `lib/generator/RecipeBuilder.ts` | Recipe generation (with validation) |
| `RECIPE_ENGINE_HANDOFF.md` | Architecture + rules matrix |

---

## Summary

This test suite proves the system is **biologically sound**:
- ✅ No unsafe recipes reach scoring
- ✅ All nutrient ceilings enforced
- ✅ All safety gates active
- ✅ Recipes vary (no clustering)
- ✅ Critical invariants locked in
- ✅ Edge cases caught

**If all tests pass, the system is production-ready.**
