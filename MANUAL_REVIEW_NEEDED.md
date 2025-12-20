# Manual Review Needed: Amazon Buy Links

**Generated:** December 17, 2025  
**Issue:** Duplicate ASINs and potential incorrect product mappings

---

## Summary

The automated audit found **38 duplicate ASINs** - the same Amazon product linked to multiple different ingredients. This likely means:

1. **Wrong product mapping** - The ASIN points to a multi-pack or variety pack, not the specific ingredient
2. **Legitimate duplicates** - Same product works for multiple ingredients (e.g., "romaine lettuce" and "lettuce (romaine)")
3. **Lazy data entry** - Someone copied the same ASIN for similar ingredients

**Impact:** Users clicking "Buy" might get the wrong product or a variety pack when they only need one ingredient.

---

## Duplicate ASINs Found (38 total)

### High Priority (Likely Wrong Products)

#### 1. **B00027ZVG4** - Used for 6 ingredients
- canary seed
- flaxseeds
- rapeseed
- sunflower seeds (small amounts)
- pumpkin seeds
- cuttlebone

**Issue:** This is almost certainly a bird seed variety pack, not individual ingredients.  
**Action:** Find individual ASINs for each seed type.

---

#### 2. **B086211R4H** - Used for 6 ingredients
- niger seed
- oat groats
- hemp seeds
- sesame seeds
- chia seeds
- pellets (fortified)

**Issue:** Another variety pack or multi-ingredient product.  
**Action:** Find individual ASINs for each ingredient.

---

#### 3. **B003ULL1NQ** - Used for 4 ingredients
- joint supplement
- chondroitin sulfate
- glucosamine sulfate
- joint health supplement

**Issue:** This is a combined supplement, not individual ingredients.  
**Action:** Decide if you want to sell the combo or find individual ASINs.

---

#### 4. **B01FUWYO2M** - Used for 3 ingredients
- sardines (canned in water)
- herring (canned)
- sardines (in water)

**Issue:** "sardines (canned in water)" and "sardines (in water)" are duplicates.  
**Action:** Merge these ingredients in your database, keep one ASIN.

---

### Medium Priority (Verify Correctness)

#### 5. **B0BXZVFN6G** - Used for 2 ingredients
- ground chicken
- chicken giblets

**Action:** Verify this product contains both ground chicken AND giblets, or find separate ASINs.

---

#### 6. **B07VHR2WNZ** - Used for 2 ingredients
- ground beef (lean)
- venison

**Action:** This is likely wrong - beef and venison are different meats. Find separate ASINs.

---

#### 7. **B0082C00P8** - Used for 2 ingredients
- ground lamb
- rabbit meat

**Action:** Lamb and rabbit are different. Find separate ASINs.

---

#### 8. **B0BXZ3JJL9** - Used for 2 ingredients
- chicken hearts
- turkey giblets

**Action:** Chicken hearts ≠ turkey giblets. Find separate ASINs.

---

#### 9. **B09RYYWHH1** - Used for 2 ingredients
- salmon oil
- omega-3 oil

**Action:** If this is specifically salmon oil, rename "omega-3 oil" to "salmon oil" or find a generic omega-3 ASIN.

---

#### 10. **B00CBY93XS** - Used for 2 ingredients
- fish oil
- herring oil

**Action:** If this is specifically herring oil, update "fish oil" or find a generic fish oil ASIN.

---

### Low Priority (Likely Legitimate Duplicates)

#### 11. **B0F3YTY4XQ** - Used for 2 ingredients
- lettuce (romaine)
- romaine lettuce

**Action:** These are the same ingredient. Merge in your database, keep one entry.

---

#### 12. **B072JNNB33** - Used for 2 ingredients
- brown rice
- rice (hulled)

**Action:** Verify if "rice (hulled)" is the same as brown rice. If yes, merge. If no, find separate ASIN.

---

#### 13. **B01INRFW0E** - Used for 2 ingredients
- b-complex
- vitamin b complex

**Action:** Same ingredient. Merge in database.

---

#### 14. **B07DFNP37Y** - Used for 2 ingredients
- chicken broth
- bone broth (low sodium)

**Action:** Verify if this product is both chicken broth AND bone broth, or find separate ASINs.

---

## How to Fix

### Step 1: Verify Each ASIN
For each duplicate ASIN, go to Amazon and check:
```
https://www.amazon.com/dp/[ASIN]
```

Ask yourself:
- Is this the correct product for ALL ingredients listed?
- Is this a variety pack or multi-ingredient product?
- Should I merge some ingredients in my database?

### Step 2: Find Correct ASINs
For wrong mappings:
1. Search Amazon for the specific ingredient + brand
2. Copy the ASIN from the URL (10-character code after `/dp/`)
3. Update `vetted-products.ts` with the correct ASIN

### Step 3: Merge Duplicate Ingredients
For legitimate duplicates (e.g., "romaine lettuce" and "lettuce (romaine)"):
1. Pick one canonical name
2. Update `ingredientCompositions.ts` to use that name
3. Remove the duplicate from `vetted-products.ts`

### Step 4: Re-run Audit
After fixing:
```bash
npx tsx lib/generator/AmazonLinkAudit.ts
```

Goal: **0 duplicate ASINs** (unless legitimately the same product)

---

## Launch Threshold

**Recommended:** Fix at least the **High Priority** duplicates before launch.

**Why:** These are likely variety packs or wrong products. Users will be confused or get the wrong items.

**Medium/Low Priority:** Can be fixed post-launch based on user feedback.

---

## Automated vs Manual

### ✅ What Auto-Fix Handles
- Missing affiliate tags → **DONE** (100% have tags)
- URL format normalization → **DONE**
- Invalid URLs → **DONE** (0 invalid)

### ❌ What Requires Manual Review
- Duplicate ASINs → **YOU** (38 to review)
- Wrong product mappings → **YOU**
- Broken/discontinued products → **YOU** (check post-launch)

---

## Testing After Fixes

1. **Spot check 10 random links** - Click them, verify they go to correct products
2. **Test a recipe end-to-end** - Generate recipe, click all buy links, verify products match ingredients
3. **Check affiliate tracking** - Ensure `tag=robinfrench-20` is in all URLs

---

## Bottom Line

**Current state:**
- ✅ 100% of links have affiliate tags
- ✅ 100% of links have valid ASINs
- ⚠️ 38 duplicate ASINs need manual review

**To ship:**
- Fix high-priority duplicates (variety packs, wrong products)
- Spot-test 10 links to verify they work
- Accept that some medium/low priority duplicates can be fixed post-launch

**Estimated time:** 1-2 hours to review and fix high-priority duplicates.
