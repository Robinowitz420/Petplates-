# Phase 2: PA-API Integration Architecture

## Overview

Phase 1 (Option A) proved the spec-based validation concept. Phase 2 adds automated metadata fetching, caching, and continuous validation.

---

## Core Principle

**Retail data is a convenience layer, not a dependency.**

```
Recipe Generation (biology) → NEVER depends on → Amazon availability
                            ↓
                    Optional enhancement
                            ↓
                    Retail sourcing (convenience)
```

---

## Architecture Components

### 1. Amazon PA-API Client

```typescript
// lib/retail/amazonClient.ts
interface AmazonPAClient {
  // Fetch product metadata by ASIN
  getProduct(asin: string): Promise<ProductMetadata>;
  
  // Search for products by keyword
  searchProducts(query: string, filters?: SearchFilters): Promise<ProductMetadata[]>;
  
  // Batch fetch (up to 10 ASINs per request)
  getProducts(asins: string[]): Promise<Map<string, ProductMetadata>>;
}
```

**Implementation options:**
1. **Amazon PA-API 5.0** (official, requires approval)
   - Pros: Official, reliable, legal
   - Cons: Requires Associates account, request limits
   - Cost: Free with affiliate account

2. **Third-party APIs** (fallback)
   - Rainforest API ($50-200/month)
   - SerpAPI ($50-150/month)
   - DataForSEO ($30-100/month)

**Recommendation:** Start with PA-API, add third-party as fallback

---

### 2. Metadata Cache Layer

```typescript
// lib/retail/metadataCache.ts
interface CachedMetadata {
  asin: string;
  metadata: ProductMetadata;
  fetchedAt: Date;
  validUntil: Date;  // TTL: 30 days
  confidence: 'high' | 'medium' | 'low';
  validationStatus: 'valid' | 'invalid' | 'stale';
}

class MetadataCache {
  // Get from cache or fetch if stale
  async get(asin: string): Promise<ProductMetadata>;
  
  // Batch get with automatic fetching
  async getBatch(asins: string[]): Promise<Map<string, ProductMetadata>>;
  
  // Mark as stale (triggers re-validation)
  markStale(asin: string): void;
  
  // Cleanup expired entries
  cleanup(): void;
}
```

**Storage:** JSON file or SQLite (simple, no external DB needed)

**TTL Strategy:**
- Fresh: 0-7 days (high confidence)
- Aging: 7-30 days (medium confidence)
- Stale: >30 days (needs re-validation)
- Dead: HTTP 404/405 (mark as invalid)

---

### 3. Validation Pipeline

```typescript
// lib/retail/validationPipeline.ts
class ValidationPipeline {
  async validateIngredient(
    ingredientName: string,
    asin: string,
    spec: IngredientRetailSpec
  ): Promise<ValidationResult> {
    // 1. Get metadata (cached or fetch)
    const metadata = await this.cache.get(asin);
    
    // 2. Validate against spec
    const result = this.validator.validate(metadata, spec);
    
    // 3. Update cache with confidence
    await this.cache.update(asin, {
      validationStatus: result.status,
      confidence: result.confidence,
    });
    
    return result;
  }
  
  async validateAll(): Promise<ValidationReport> {
    // Batch validate all ingredients
    // Returns summary + flagged items
  }
  
  async revalidateStale(): Promise<void> {
    // Find stale entries (>30 days)
    // Re-fetch and re-validate
  }
}
```

---

### 4. Confidence Scoring

```typescript
interface ConfidenceFactors {
  specMatch: number;        // 0-1: How well product matches spec
  availability: number;     // 0-1: In stock vs out of stock
  recency: number;          // 0-1: How recently validated
  priceStability: number;   // 0-1: Price hasn't changed drastically
}

function calculateConfidence(factors: ConfidenceFactors): 'high' | 'medium' | 'low' {
  const score = (
    factors.specMatch * 0.5 +
    factors.availability * 0.2 +
    factors.recency * 0.2 +
    factors.priceStability * 0.1
  );
  
  if (score >= 0.8) return 'high';
  if (score >= 0.5) return 'medium';
  return 'low';
}
```

**Usage:**
- High confidence → Show price, enable "Buy" button
- Medium confidence → Show "Price may vary", enable button
- Low confidence → Show "Check availability", link to search

---

### 5. Fallback Strategy

**Critical rule:** Recipe generation NEVER fails on retail data.

```typescript
// In RecipeBuilder or wherever recipes are generated
function generateRecipe(constraints: GenerationConstraints): Recipe {
  // 1. Generate recipe (biology only)
  const recipe = this.buildRecipe(constraints);
  
  // 2. Enhance with retail data (optional)
  try {
    const retailData = await this.retailEnhancer.enhance(recipe);
    recipe.ingredients = recipe.ingredients.map(ing => ({
      ...ing,
      buyLink: retailData.get(ing.name)?.link,
      estimatedPrice: retailData.get(ing.name)?.price,
      confidence: retailData.get(ing.name)?.confidence,
    }));
  } catch (error) {
    // Retail enhancement failed - that's OK
    console.warn('Retail data unavailable:', error);
    // Recipe still works without it
  }
  
  return recipe;
}
```

**UI Handling:**
```typescript
// In frontend
if (ingredient.confidence === 'high' && ingredient.buyLink) {
  return <BuyButton link={ingredient.buyLink} price={ingredient.estimatedPrice} />;
} else if (ingredient.buyLink) {
  return <CheckAvailabilityButton link={ingredient.buyLink} />;
} else {
  return <SearchButton query={ingredient.name} />;
}
```

---

## Implementation Roadmap

### Week 1: Foundation
- [ ] Set up Amazon PA-API credentials
- [ ] Build `AmazonPAClient` wrapper
- [ ] Create `MetadataCache` with JSON storage
- [ ] Add TTL and staleness tracking

### Week 2: Integration
- [ ] Integrate cache with existing validator
- [ ] Build `ValidationPipeline`
- [ ] Add confidence scoring
- [ ] Create re-validation cron job

### Week 3: Enhancement
- [ ] Add price extraction and normalization
- [ ] Add package size parsing
- [ ] Build retail data enhancer for recipes
- [ ] Update recipe generation to use enhancer

### Week 4: Polish
- [ ] Add third-party API fallback
- [ ] Build admin dashboard for monitoring
- [ ] Add alerts for dead/stale links
- [ ] Documentation and testing

---

## Data Model Updates

### Enhanced VettedProduct

```typescript
interface VettedProductV2 {
  // Existing
  productName: string;
  asinLink: string;
  
  // New - Validation
  retailSpec?: IngredientRetailSpec;
  validationStatus: 'validated' | 'pending' | 'flagged' | 'failed';
  confidence: 'high' | 'medium' | 'low';
  lastVerified: Date;
  
  // New - Metadata (cached)
  cachedMetadata?: {
    title: string;
    brand?: string;
    price?: { amount: number; currency: string };
    packageSize?: { amount: number; unit: string };
    availability: 'in-stock' | 'out-of-stock' | 'unknown';
    lastFetched: Date;
  };
  
  // New - Tracking
  validationHistory?: Array<{
    date: Date;
    status: 'valid' | 'invalid';
    issues: string[];
  }>;
}
```

---

## Monitoring & Alerts

### Daily Cron Job
```typescript
// Run daily at 2 AM
async function dailyValidationCheck() {
  // 1. Find stale entries (>30 days)
  const stale = await cache.findStale();
  
  // 2. Re-validate
  const results = await pipeline.revalidateBatch(stale);
  
  // 3. Alert on failures
  const failures = results.filter(r => r.status === 'invalid');
  if (failures.length > 0) {
    await sendAlert({
      type: 'retail-validation-failures',
      count: failures.length,
      items: failures.map(f => f.ingredient),
    });
  }
  
  // 4. Log summary
  console.log(`Validated ${stale.length} stale items, ${failures.length} failures`);
}
```

### Admin Dashboard
- Total products: 292
- Valid: 280 (95.9%)
- Flagged: 10 (3.4%)
- Failed: 2 (0.7%)
- Stale (>30 days): 15 (5.1%)

**Actions:**
- [Re-validate all stale]
- [Export flagged items CSV]
- [View validation history]

---

## Cost Estimate

### PA-API (Free tier)
- 8,640 requests/day
- 1 request per product validation
- 292 products × 1 validation/month = ~10 requests/month
- **Cost: $0**

### Third-party fallback (optional)
- Rainforest API: $50/month (10,000 requests)
- Only used if PA-API fails
- **Cost: $0-50/month**

### Storage
- JSON cache file: ~1-5 MB
- **Cost: $0**

**Total: $0-50/month** (only if PA-API unavailable)

---

## Success Metrics

### Phase 2 Goals
1. ✅ 95%+ products with valid metadata
2. ✅ <5% stale products at any time
3. ✅ 0 recipe generation failures due to retail data
4. ✅ Automatic detection of dead links within 24 hours
5. ✅ <10 manual reviews per month

### Long-term Vision
- Automatic ASIN replacement suggestions
- Price tracking and alerts
- Multi-region support (amazon.ca, amazon.co.uk)
- Nutritional data extraction from labels (OCR)

---

## Next Steps

1. **Get PA-API credentials** (requires Amazon Associates account)
2. **Build `AmazonPAClient`** (Week 1)
3. **Test with 10-20 products** (proof of concept)
4. **Roll out to all 292 products** (Week 2-3)
5. **Monitor and refine** (Week 4+)

---

## Questions to Answer

1. **Do you have Amazon Associates account?** (needed for PA-API)
2. **Preferred storage?** (JSON file vs SQLite vs other)
3. **Re-validation frequency?** (daily, weekly, monthly)
4. **Alert method?** (email, Slack, dashboard only)

Ready to start Week 1?
