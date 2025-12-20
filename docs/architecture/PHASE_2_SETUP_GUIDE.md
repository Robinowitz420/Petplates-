# Phase 2: PA-API Integration Setup Guide

## Overview

Phase 2 adds automated Amazon Product Advertising API integration for:
- Automated metadata fetching (title, brand, price, size)
- Availability checking (in-stock vs discontinued)
- Automatic re-validation of stale links
- Price tracking over time

**⚠️ Cannot be implemented autonomously** - Requires external credentials and setup.

---

## Prerequisites

### 1. Amazon Associates Account

**Required:** Active Amazon Associates account

**How to get:**
1. Go to https://affiliate-program.amazon.com/
2. Sign up for Amazon Associates
3. Complete account verification
4. Wait for approval (usually 1-3 days)

**Requirements:**
- Valid website or app (can use your pet plates platform)
- Tax information
- Payment details

**Status:** ⬜ Not started | ⬜ In progress | ⬜ Complete

---

### 2. PA-API 5.0 Access Keys

**Required:** Product Advertising API credentials

**How to get:**
1. Log into Amazon Associates Central
2. Go to Tools → Product Advertising API
3. Request PA-API access
4. Generate access keys:
   - Access Key ID
   - Secret Access Key
   - Associate Tag (e.g., `robinfrench-20`)

**Wait time:** Instant if Associates account is approved

**Status:** ⬜ Not started | ⬜ In progress | ⬜ Complete

---

### 3. Environment Variables

**Create `.env.local` file:**

```bash
# Amazon PA-API Credentials
AMAZON_ACCESS_KEY_ID=your_access_key_here
AMAZON_SECRET_ACCESS_KEY=your_secret_key_here
AMAZON_ASSOCIATE_TAG=robinfrench-20
AMAZON_REGION=us-east-1

# Optional: Third-party API fallback
RAINFOREST_API_KEY=your_rainforest_key_here  # Optional
SERPAPI_KEY=your_serpapi_key_here            # Optional
```

**Security:**
- ✅ `.env.local` is already in `.gitignore`
- ✅ Never commit credentials to git
- ✅ Use environment variables only

**Status:** ⬜ Not started | ⬜ In progress | ⬜ Complete

---

## Implementation Steps

### Step 1: Install PA-API SDK

```bash
npm install amazon-paapi --save
```

**Already installed:** Check `package.json` - `amazon-paapi` may already be present.

---

### Step 2: Create PA-API Client

**File:** `lib/retail/amazonPAClient.ts`

```typescript
import ProductAdvertisingAPIv1 from 'amazon-paapi';

export class AmazonPAClient {
  private client: any;
  
  constructor() {
    this.client = new ProductAdvertisingAPIv1.DefaultApi();
    this.client.accessKey = process.env.AMAZON_ACCESS_KEY_ID;
    this.client.secretKey = process.env.AMAZON_SECRET_ACCESS_KEY;
    this.client.host = 'webservices.amazon.com';
    this.client.region = process.env.AMAZON_REGION || 'us-east-1';
  }
  
  async getProduct(asin: string): Promise<ProductMetadata> {
    const request = {
      PartnerTag: process.env.AMAZON_ASSOCIATE_TAG,
      PartnerType: 'Associates',
      ItemIds: [asin],
      Resources: [
        'ItemInfo.Title',
        'ItemInfo.ByLineInfo',
        'ItemInfo.ProductInfo',
        'Offers.Listings.Price',
        'Offers.Listings.Availability',
      ],
    };
    
    const response = await this.client.getItems(request);
    return this.parseResponse(response);
  }
  
  async getProducts(asins: string[]): Promise<Map<string, ProductMetadata>> {
    // Batch fetch up to 10 ASINs at once
    const results = new Map();
    
    for (let i = 0; i < asins.length; i += 10) {
      const batch = asins.slice(i, i + 10);
      const request = {
        PartnerTag: process.env.AMAZON_ASSOCIATE_TAG,
        PartnerType: 'Associates',
        ItemIds: batch,
        Resources: [
          'ItemInfo.Title',
          'ItemInfo.ByLineInfo',
          'Offers.Listings.Price',
        ],
      };
      
      const response = await this.client.getItems(request);
      // Parse and store results
    }
    
    return results;
  }
  
  private parseResponse(response: any): ProductMetadata {
    // Extract title, brand, price, availability
    // Return structured metadata
  }
}
```

---

### Step 3: Create Metadata Cache

**File:** `lib/retail/metadataCache.ts`

```typescript
import * as fs from 'fs';
import * as path from 'path';

interface CachedMetadata {
  asin: string;
  metadata: ProductMetadata;
  fetchedAt: Date;
  validUntil: Date;  // TTL: 30 days
  confidence: 'high' | 'medium' | 'low';
}

export class MetadataCache {
  private cachePath = '.retail-cache.json';
  private cache: Map<string, CachedMetadata>;
  
  constructor() {
    this.load();
  }
  
  async get(asin: string): Promise<ProductMetadata | null> {
    const cached = this.cache.get(asin);
    
    if (!cached) return null;
    
    // Check if stale
    if (new Date() > cached.validUntil) {
      return null; // Trigger re-fetch
    }
    
    return cached.metadata;
  }
  
  async set(asin: string, metadata: ProductMetadata): Promise<void> {
    const now = new Date();
    const validUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    this.cache.set(asin, {
      asin,
      metadata,
      fetchedAt: now,
      validUntil,
      confidence: 'high',
    });
    
    this.save();
  }
  
  private load(): void {
    if (fs.existsSync(this.cachePath)) {
      const data = fs.readFileSync(this.cachePath, 'utf-8');
      this.cache = new Map(JSON.parse(data));
    } else {
      this.cache = new Map();
    }
  }
  
  private save(): void {
    const data = JSON.stringify(Array.from(this.cache.entries()));
    fs.writeFileSync(this.cachePath, data, 'utf-8');
  }
}
```

---

### Step 4: Integrate with Validation Pipeline

**File:** `lib/retail/validationPipeline.ts`

```typescript
import { AmazonPAClient } from './amazonPAClient';
import { MetadataCache } from './metadataCache';
import { EnhancedRetailValidator } from '../validation/enhancedRetailValidator';

export class ValidationPipeline {
  private paClient: AmazonPAClient;
  private cache: MetadataCache;
  private validator: EnhancedRetailValidator;
  
  constructor() {
    this.paClient = new AmazonPAClient();
    this.cache = new MetadataCache();
    this.validator = new EnhancedRetailValidator();
  }
  
  async validateIngredient(
    ingredientName: string,
    asin: string,
    spec: IngredientRetailSpec
  ): Promise<ValidationResult> {
    // 1. Try cache first
    let metadata = await this.cache.get(asin);
    
    // 2. Fetch from PA-API if not cached
    if (!metadata) {
      metadata = await this.paClient.getProduct(asin);
      await this.cache.set(asin, metadata);
    }
    
    // 3. Validate using metadata
    const result = this.validator.validateProductTitle(
      metadata.title,
      spec,
      asin,
      ingredientName
    );
    
    return result;
  }
  
  async validateAll(): Promise<ValidationReport> {
    // Batch validate all ingredients
    // Use cache where possible
    // Fetch missing metadata
    // Generate report
  }
}
```

---

### Step 5: Add NPM Scripts

**Update `package.json`:**

```json
{
  "scripts": {
    "fetch:amazon-metadata": "tsx lib/retail/fetchMetadata.ts",
    "validate:retail:full": "tsx lib/retail/validateWithPAAPI.ts",
    "cache:clean": "rm .retail-cache.json"
  }
}
```

---

### Step 6: Update .gitignore

**Add to `.gitignore`:**

```
# PA-API cache
.retail-cache.json

# Environment variables (already present)
.env.local
.env
```

---

## Rate Limits & Costs

### PA-API Limits

**Free tier:**
- 8,640 requests per day
- 1 request per second
- Up to 10 ASINs per request

**Our usage:**
- 292 products ÷ 10 per request = 30 requests
- Re-validation: 1x per month = 30 requests/month
- **Well within limits** ✅

### Third-Party API Costs (Optional Fallback)

**Rainforest API:**
- $50/month for 10,000 requests
- Use only if PA-API fails

**SerpAPI:**
- $50/month for 5,000 requests
- Use only if PA-API fails

**Recommendation:** Start with PA-API only, add fallback if needed

---

## Testing

### Test PA-API Connection

**File:** `lib/retail/testPAAPI.ts`

```typescript
import { AmazonPAClient } from './amazonPAClient';

async function testConnection() {
  const client = new AmazonPAClient();
  
  try {
    // Test with a known ASIN
    const metadata = await client.getProduct('B0BXZVFN6G');
    console.log('✅ PA-API connection successful');
    console.log('Product:', metadata.title);
    console.log('Price:', metadata.price);
  } catch (error) {
    console.error('❌ PA-API connection failed:', error);
  }
}

testConnection();
```

**Run:**
```bash
npx tsx lib/retail/testPAAPI.ts
```

---

## Deployment Checklist

### Before Going Live

- [ ] Amazon Associates account approved
- [ ] PA-API access keys generated
- [ ] Environment variables configured
- [ ] PA-API client implemented
- [ ] Metadata cache implemented
- [ ] Validation pipeline integrated
- [ ] Connection tested successfully
- [ ] Rate limiting implemented
- [ ] Error handling added
- [ ] Logging configured

### Security Checklist

- [ ] Credentials in `.env.local` only
- [ ] `.env.local` in `.gitignore`
- [ ] No credentials in code
- [ ] No credentials in git history
- [ ] Environment variables validated on startup

### Monitoring Checklist

- [ ] Daily re-validation cron job
- [ ] Alert on validation failures
- [ ] Track API usage (stay under limits)
- [ ] Monitor cache hit rate
- [ ] Log dead links detected

---

## Troubleshooting

### "Access Denied" Error

**Cause:** Invalid credentials or PA-API not approved

**Fix:**
1. Verify credentials in `.env.local`
2. Check PA-API access in Associates Central
3. Ensure Associate Tag matches your account

### "Throttling" Error

**Cause:** Exceeded rate limit (1 request/second)

**Fix:**
1. Add delay between requests: `await sleep(1000)`
2. Use batch requests (10 ASINs at once)
3. Implement exponential backoff

### "ASIN Not Found" Error

**Cause:** Product discontinued or invalid ASIN

**Fix:**
1. Mark as dead link
2. Flag for manual review
3. Update vetted-products.ts with new ASIN

---

## Timeline Estimate

**With credentials ready:**
- Step 1-2: PA-API client implementation - 2 hours
- Step 3: Metadata cache - 1 hour
- Step 4: Integration - 2 hours
- Step 5-6: Configuration - 30 minutes
- Testing & debugging - 2 hours

**Total:** 1 day of development

**Without credentials:**
- Amazon Associates signup - 1-3 days (approval wait)
- PA-API access - Instant after approval
- Implementation - 1 day

**Total:** 2-4 days

---

## What You Need to Provide

1. **Amazon Associates Account**
   - Sign up at https://affiliate-program.amazon.com/
   - Wait for approval

2. **PA-API Credentials**
   - Access Key ID
   - Secret Access Key
   - Associate Tag (should be `robinfrench-20`)

3. **Confirmation**
   - Let me know when credentials are ready
   - I'll implement the full PA-API integration

---

## Alternative: Manual Verification First

**If PA-API setup is delayed:**

1. Use current Phase 1.6 system (47 items need review)
2. Manually verify those 47 items (~20-30 minutes)
3. Update vetted-products.ts with corrections
4. Implement PA-API later for ongoing automation

**Benefit:** Get immediate value while PA-API is being set up

---

## Next Steps

**Choose one:**

**Option A:** Set up PA-API now
- Follow this guide
- Provide credentials
- I'll implement full integration

**Option B:** Manual review first, PA-API later
- Review 47 flagged items manually
- Fix dead links and conflicts
- Set up PA-API when ready

**Option C:** Both in parallel
- Start PA-API setup process
- Do manual review while waiting for approval
- Integrate PA-API when ready

**Recommendation:** Option C - Don't block on PA-API approval, do manual review now.
