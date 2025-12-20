# Commercial Priors - Reality Check

## ❌ Problem Identified

The current implementation has critical flaws:

### 1. **Data Quality Issue**
- OPFF data is too generic: "oils and fats", "viandes", "substances minérales"
- Only 3-5 ingredients per product, mostly category tokens
- **No specific oil variants** in the dataset (no anchovy_oil, salmon_oil, etc.)

### 2. **Over-Broad Blocking**
- Current: Blocks `turkey + fish` entirely
- **Reality:** Turkey + fish oil is COMMON (omega-3 supplementation)
- **Problem:** We're blocking legitimate combinations

### 3. **Original Goal Lost**
- **Goal:** Block turkey + anchovy_oil (rare, weird pairing)
- **What we have:** No anchovy_oil in dataset at all
- **What we're doing:** Blocking turkey + fish (wrong!)

## ✅ Realistic Solution

### What We CAN Learn From This Data

**Legitimate patterns from 374 products:**
1. **Chicken + peas** (51 products) - very common
2. **Corn + wheat** (48 products) - grain combinations
3. **Chicken + rice** (34 products) - classic pairing
4. **Duck + potato** (12 products, PMI=1.99) - specialty combo
5. **Beef rarely pairs with fish** (0 products) - might be real

### What We CANNOT Learn

1. **Specific oil variants** - data doesn't distinguish anchovy_oil vs salmon_oil vs fish_oil
2. **Rare exotic pairings** - sample size too small
3. **Supplement-level ingredients** - not in top 5 ingredients

## 🎯 Corrected Approach

### 1. Remove Over-Broad Blocks
- **DON'T block:** turkey + fish (legitimate combo)
- **DON'T block:** chicken + salmon (legitimate combo)
- **DO block:** Pairs that are genuinely never seen AND make sense (beef + fish might be real)

### 2. Focus on Positive Patterns
- **Boost common pairings:** chicken + peas, chicken + rice, duck + potato
- **Soft penalties for rare:** Only when both ingredients are common (count >= 20) and pair is very rare (count <= 2)

### 3. Conservative Hard Blocks
Only block if:
- Both ingredients appear in 30+ products (very common)
- Pair count = 0 (never seen)
- Makes logical sense (not just data artifact)

### 4. Add Oil Variants to Registry (Future-Proof)
Even though we don't have data now, add these IDs:
- `anchovy_oil`
- `sardine_oil`
- `salmon_oil`
- `cod_liver_oil`
- `fish_oil`

So IF we get better data later, we can distinguish them.

## 📊 Revised Thresholds

```typescript
MIN_ING_COUNT = 30  // Up from 20 (more conservative)
MIN_PAIR_COUNT = 5  // Keep at 5
MIN_COMMON_FOR_BLOCK = 40  // Up from 20 (very conservative)
RARE_PAIR_MAX = 2  // Keep at 2
```

## 🧪 Updated Test Strategy

**Don't test what we don't have:**
```typescript
// ❌ WRONG: We don't have anchovy_oil in data
it('should block turkey + anchovy_oil')

// ✅ RIGHT: Test what we actually learned
it('should boost chicken + peas (common pairing)')
it('should boost chicken + rice (common pairing)')
it('should NOT block turkey + fish (legitimate combo)')
it('should apply soft penalty to rare pairs with negative PMI')
```

## 🚀 Next Steps

1. **Recompute priors** with conservative thresholds
2. **Remove turkey + fish from hardBlockPairs** (it's wrong)
3. **Focus on positive boosts** for common pairings
4. **Update tests** to match reality
5. **Document limitations** clearly

## 📝 Honest Assessment

**What this pipeline IS good for:**
- Learning common ingredient combinations (chicken + peas, chicken + rice)
- Identifying popular protein-grain-vegetable patterns
- Soft boosting of proven combinations

**What this pipeline is NOT good for:**
- Blocking specific rare oils (no data granularity)
- Exotic pet foods (too few products)
- Supplement-level ingredients (not in top 5)

**Conclusion:** The pipeline works, but we need to be honest about data limitations and not over-claim what we've learned.
