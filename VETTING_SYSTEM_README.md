# Vetting System Documentation

## Overview

This vetting system combines **brand analysis** and **Amazon scraping** to automatically suggest vetted products for recipe ingredients.

## Architecture

### Components

1. **Brand-Based Vetter** (`lib/services/brandBasedVetter.ts`)
   - Uses brand database from `analyze-brands.js`
   - Matches ingredients to known quality brands
   - Generates product suggestions with confidence scores

2. **Amazon Scraper** (`scripts/run-amazon-scraper.ts`)
   - Scrapes Amazon for actual products
   - Scores products based on rating, reviews, and relevance
   - Extracts ASINs for direct product links

3. **Unified Vetting Service** (`lib/services/unifiedVettingService.ts`)
   - Combines brand suggestions + Amazon results
   - Provides single interface for vetting status
   - Calculates overall confidence scores

4. **Recipe Vetter** (`scripts/vet-all-recipes.ts`)
   - Processes all recipes
   - Applies vetted products to ingredients
   - Generates statistics and reports

## Usage

### Step 1: Generate Brand Suggestions

```bash
npm run vet:brands
```

This will:
- Analyze all ingredients needing vetting
- Match them to quality brands
- Generate high-confidence suggestions
- Create `data/brand-vetted-high-confidence.ts` for review

**Output:**
- `data/brand-suggestions.json` - All suggestions
- `data/brand-vetted-high-confidence.ts` - Ready-to-use code
- `data/brand-vetted-medium-confidence.ts` - Medium confidence products

### Step 2: Run Amazon Scraper (Optional)

```bash
npm run vet:amazon
```

This will:
- Scrape Amazon for top 30 priority ingredients
- Score products (rating, reviews, relevance)
- Generate vetted product suggestions
- Create `data/amazon-vetted-products.json`

**Note:** This takes time (5+ seconds per ingredient) and requires puppeteer.

**Output:**
- `pet-ingredient-scraper/results/amazon-products-*.json` - Full results
- `data/amazon-vetted-products.json` - High-quality products
- `data/amazon-vetted-script.ts` - Ready-to-use code

### Step 3: Review and Add to Vetted Products

1. Review `data/brand-vetted-high-confidence.ts`
2. Review `data/amazon-vetted-script.ts` (if you ran Amazon scraper)
3. Copy approved products to `lib/data/vetted-products.ts`
4. Update the ingredient keys to match your naming convention

### Step 4: Apply Vetting to Recipes

```bash
npm run vet:recipes
```

This will:
- Process all 170 recipes
- Apply vetted products where available
- Remove generic search links
- Generate statistics

**Output:**
- `lib/data/recipes-complete.backup.ts` - Backup
- `lib/data/recipes-complete.vetted.ts` - Updated recipes
- `data/ingredients-needing-vetting.json` - Remaining ingredients

## Workflow

```
1. Run vet:brands → Get brand suggestions
2. (Optional) Run vet:amazon → Get Amazon products
3. Review generated scripts → Add to vetted-products.ts
4. Run vet:recipes → Apply to all recipes
5. Review recipes-complete.vetted.ts → Replace original if good
```

## Current Status

- ✅ **Brand-based vetting**: Working (15 high-confidence matches)
- ✅ **Amazon scraper**: Ready (requires puppeteer)
- ✅ **Unified service**: Complete
- ✅ **Recipe vetting**: Working

## Brand Database

The brand database includes:
- **Fresh Is Best** (9.2/10) - Freeze-dried, single-ingredient
- **Vital Essentials** (9.0/10) - Organ meats, supplements
- **US Wellness Meats** (9.1/10) - Raw, grass-fed
- **Raw Paws** (8.9/10) - Novel proteins
- **Grizzly Salmon Oil** (9.3/10) - Supplements

## Ingredient Matching

The system matches ingredients to brands based on:
- Direct ingredient-to-brand mapping
- Brand specialties (e.g., "organ meats" → Vital Essentials)
- Keyword matching
- Quality scores

## Confidence Scoring

- **≥80%**: High confidence, ready to use
- **60-80%**: Medium confidence, review recommended
- **<60%**: Low confidence, manual vetting needed

## Next Steps

1. Review `data/brand-vetted-high-confidence.ts` and add to `vetted-products.ts`
2. Run Amazon scraper for remaining ingredients
3. Manually vet top-priority ingredients (organs, oils, supplements)
4. Re-run `vet:recipes` after adding new vetted products

