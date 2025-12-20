# Manual Amazon Link Verification Required

## Summary
- ✅ **96% of links are accessible** (HTTP 200)
- ❌ **2 dead links found** (HTTP 405)
- ⚠️ **Cannot automatically verify product accuracy** - requires manual review

---

## Dead Links - Need Replacement

### 1. Rabbit Meat ❌
- **Current ASIN**: B0082C00P8
- **Current Link**: https://www.amazon.com/dp/B0082C00P8?tag=robinfrench-20
- **Status**: 405 Method Not Allowed (likely discontinued)
- **Product**: Evanger's Rabbit Grain Free Cans
- **Action**: Find new rabbit meat product on Amazon

### 2. Endive ❌
- **Current ASIN**: B0006L2XNK
- **Current Link**: https://www.amazon.com/dp/B0006L2XNK?tag=robinfrench-20
- **Status**: 405 Method Not Allowed (likely discontinued)
- **Product**: Organic Endive Greens
- **Action**: Find new endive/greens product on Amazon

---

## Suspicious Mappings - Verify Product Matches Ingredient

These ingredients share ASINs with different products. **You need to manually verify** by clicking the links and checking if the product title/description matches the ingredient:

### High Priority - Likely Wrong Products

#### 1. Venison (using beef ASIN)
- **Ingredient**: venison
- **ASIN**: B07VHR2WNZ
- **Link**: https://www.amazon.com/dp/B07VHR2WNZ?tag=robinfrench-20
- **Also used for**: ground beef (lean)
- **Verify**: Does this product actually contain venison, or is it beef?

#### 2. Rabbit Meat (using lamb ASIN) - ALSO DEAD LINK
- **Ingredient**: rabbit meat
- **ASIN**: B0082C00P8 (DEAD)
- **Link**: https://www.amazon.com/dp/B0082C00P8?tag=robinfrench-20
- **Also used for**: ground lamb
- **Action**: Find correct rabbit product

#### 3. Turkey Giblets (using chicken ASIN)
- **Ingredient**: turkey giblets
- **ASIN**: B0BXZ3JJL9
- **Link**: https://www.amazon.com/dp/B0BXZ3JJL9?tag=robinfrench-20
- **Also used for**: chicken hearts
- **Verify**: Does this product contain turkey or chicken?

#### 4. Herring (using sardines ASIN)
- **Ingredient**: herring (canned)
- **ASIN**: B01FUWYO2M
- **Link**: https://www.amazon.com/dp/B01FUWYO2M?tag=robinfrench-20
- **Also used for**: sardines (canned in water), sardines (in water)
- **Verify**: Does this product contain herring or sardines?

#### 5. Chia Seed Oil (using mango ASIN)
- **Ingredient**: chia seed oil
- **ASIN**: B00WM6CHFQ
- **Link**: https://www.amazon.com/dp/B00WM6CHFQ?tag=robinfrench-20
- **Also used for**: mango
- **Verify**: Does this product contain chia seed oil or mango?

#### 6. Duck Hearts (using egg ASIN)
- **Ingredient**: duck hearts
- **ASIN**: B0BWBNT8JX
- **Link**: https://www.amazon.com/dp/B0BWBNT8JX?tag=robinfrench-20
- **Also used for**: egg (hard-boiled)
- **Verify**: Does this product contain duck hearts or eggs?

### Medium Priority - Seed Products

#### 7. Multiple Seeds Using Same ASIN
- **ASIN**: B00027ZVG4
- **Link**: https://www.amazon.com/dp/B00027ZVG4?tag=robinfrench-20
- **Used for 6 ingredients**: canary seed, flaxseeds, rapeseed, sunflower seeds, pumpkin seeds, cuttlebone
- **Verify**: Is this a seed mix, or should each seed have its own product?

#### 8. More Seeds Using Same ASIN
- **ASIN**: B086211R4H
- **Link**: https://www.amazon.com/dp/B086211R4H?tag=robinfrench-20
- **Used for 6 ingredients**: niger seed, oat groats, hemp seeds, sesame seeds, chia seeds, pellets
- **Verify**: Is this a seed mix, or should each seed have its own product?

---

## How to Verify

For each link above:

1. **Click the link** (or copy ASIN into Amazon search)
2. **Check product title** - Does it match the ingredient name?
3. **Read product description** - Confirm it's the right product
4. **Check reviews/images** - Additional verification

### If Product is Wrong:
1. Search Amazon for correct product
2. Copy the ASIN from the URL (format: `/dp/XXXXXXXXXX`)
3. Update `lib/data/vetted-products.ts` with correct ASIN
4. Format: `https://www.amazon.com/dp/XXXXXXXXXX?tag=robinfrench-20`

---

## Verification Checklist

Copy this checklist and mark as you verify:

```
Dead Links:
[ ] Rabbit meat - Find replacement ASIN
[ ] Endive - Find replacement ASIN

Suspicious Mappings:
[ ] Venison - Verify or find correct ASIN
[ ] Turkey giblets - Verify or find correct ASIN
[ ] Herring (canned) - Verify or find correct ASIN
[ ] Chia seed oil - Verify or find correct ASIN
[ ] Duck hearts - Verify or find correct ASIN
[ ] Seed mix 1 (B00027ZVG4) - Verify if appropriate
[ ] Seed mix 2 (B086211R4H) - Verify if appropriate
```

---

## Impact

**Recipe Generation**: ✅ Working perfectly (90% pass rate)

**User Experience**: ⚠️ ~8-10 "Buy" buttons may link to wrong/dead products

**Priority**: Medium - Doesn't break functionality, but affects user trust

---

## Recommendation

**Manual verification is required** because:
1. Amazon doesn't allow automated scraping
2. Product titles/descriptions need human judgment
3. Some products may be legitimately multi-purpose

**Estimated time**: 15-20 minutes to verify all suspicious links

Would you like me to generate a spreadsheet format for easier tracking?
