# Auto-Classification Report

## Summary

**Total items processed:** 292

- ✅ **Auto-valid:** 6 (2.1%)
- ❌ **Auto-invalid:** 5 (1.7%)
- ⚠️ **Needs review:** 83 (28.4%)
- 📋 **No spec:** 198 (67.8%)

**Manual review reduced:** 94 → 88 items (6% reduction)

---

## Auto-Invalid Items (5)

These items failed validation and need replacement ASINs:

### ground beef (lean)
- **Product:** US Wellness Meats Pet Burger
- **ASIN:** B07VHR2WNZ
- **Issues:** CRITICAL: Missing required tokens: beef, ground, CRITICAL: Contains forbidden tokens: burger, WARNING: No acceptable form found. Expected one of: raw, frozen, fresh, lean
- **Action:** Find correct product on Amazon
- **Link:** https://www.amazon.com/dp/B07VHR2WNZ?tag=robinfrench-20

### ground lamb
- **Product:** Raw Paws Lamb Recipe Rolls
- **ASIN:** B0082C00P8
- **Issues:** Dead link (HTTP 405)
- **Action:** Find correct product on Amazon
- **Link:** https://www.amazon.com/dp/B0082C00P8?tag=robinfrench-20

### venison
- **Product:** Fresh Is Best Freeze Dried Venison Bites
- **ASIN:** B07VHR2WNZ
- **Issues:** CRITICAL: Missing required tokens: deer
- **Action:** Find correct product on Amazon
- **Link:** https://www.amazon.com/dp/B07VHR2WNZ?tag=robinfrench-20

### rabbit meat
- **Product:** Evanger's Rabbit Grain Free Cans
- **ASIN:** B0082C00P8
- **Issues:** Dead link (HTTP 405)
- **Action:** Find correct product on Amazon
- **Link:** https://www.amazon.com/dp/B0082C00P8?tag=robinfrench-20

### endive
- **Product:** Organic Endive Greens
- **ASIN:** B0006L2XNK
- **Issues:** Dead link (HTTP 405)
- **Action:** Find correct product on Amazon
- **Link:** https://www.amazon.com/dp/B0006L2XNK?tag=robinfrench-20


---

## Needs Review (83)

These items are ambiguous and need human verification:

### ground chicken
- **Product:** Fresh Is Best Freeze Dried Chicken Breast
- **ASIN:** B0BXZVFN6G
- **Issues:** Duplicate ASIN shared with: chicken giblets
- **Action:** Verify if product is correct
- **Link:** https://www.amazon.com/dp/B0BXZVFN6G?tag=robinfrench-20

### chicken hearts
- **Product:** Vital Essentials Freeze Dried Chicken Hearts
- **ASIN:** B0BXZ3JJL9
- **Issues:** WARNING: No acceptable form found. Expected one of: raw, frozen, fresh
- **Action:** Verify if product is correct
- **Link:** https://www.amazon.com/dp/B0BXZ3JJL9?tag=robinfrench-20

### sardines (canned in water)
- **Product:** Wild Planet Sardines in Water No Salt
- **ASIN:** B01FUWYO2M
- **Issues:** WARNING: No acceptable form found. Expected one of: canned, water packed
- **Action:** Verify if product is correct
- **Link:** https://www.amazon.com/dp/B01FUWYO2M?tag=robinfrench-20

### turkey giblets
- **Product:** Vital Essentials Freeze Dried Turkey Giblets
- **ASIN:** B0BXZ3JJL9
- **Issues:** WARNING: No acceptable form found. Expected one of: raw, frozen, fresh
- **Action:** Verify if product is correct
- **Link:** https://www.amazon.com/dp/B0BXZ3JJL9?tag=robinfrench-20

### chicken giblets
- **Product:** Fresh Is Best Freeze Dried Chicken Giblets
- **ASIN:** B0BXZVFN6G
- **Issues:** Duplicate ASIN shared with: ground chicken
- **Action:** Verify if product is correct
- **Link:** https://www.amazon.com/dp/B0BXZVFN6G?tag=robinfrench-20

### brown rice
- **Product:** Lundberg Family Farms Organic Brown Rice
- **ASIN:** B072JNNB33
- **Issues:** WARNING: No acceptable form found. Expected one of: whole grain, long grain, short grain
- **Action:** Verify if product is correct
- **Link:** https://www.amazon.com/dp/B072JNNB33?tag=robinfrench-20

### kale
- **Product:** Earthbound Farm Organic Kale
- **ASIN:** B09VKDGT39
- **Issues:** Duplicate ASIN shared with: celery
- **Action:** Verify if product is correct
- **Link:** https://www.amazon.com/dp/B09VKDGT39?tag=robinfrench-20

### celery
- **Product:** Earthbound Farm Organic Celery
- **ASIN:** B09VKDGT39
- **Issues:** Duplicate ASIN shared with: kale
- **Action:** Verify if product is correct
- **Link:** https://www.amazon.com/dp/B09VKDGT39?tag=robinfrench-20

### lettuce (romaine)
- **Product:** Organic Girl Romaine Lettuce
- **ASIN:** B0F3YTY4XQ
- **Issues:** Duplicate ASIN shared with: romaine lettuce
- **Action:** Verify if product is correct
- **Link:** https://www.amazon.com/dp/B0F3YTY4XQ?tag=robinfrench-20

### salmon oil
- **Product:** Grizzly Salmon Plus Omega-3 Oil
- **ASIN:** B09RYYWHH1
- **Issues:** Duplicate ASIN shared with: omega-3 oil
- **Action:** Verify if product is correct
- **Link:** https://www.amazon.com/dp/B09RYYWHH1?tag=robinfrench-20



... and 73 more (see CSV)


---

## Auto-Valid Items (6)

These items passed all validation checks and are assumed correct.

---

## Next Steps

1. **Review the 88 flagged items** in MANUAL_REVIEW_REQUIRED.csv
2. **Find replacement ASINs** for auto-invalid items
3. **Verify ambiguous items** by clicking links
4. **Update vetted-products.ts** with corrections

---

## Phase 2: PA-API Integration

After manual review is complete, we'll implement:
- Automated metadata fetching from Amazon PA-API
- Price and availability tracking
- Automatic re-validation of stale links
- Confidence scoring and caching
