# Commercial Pet Food Training Pipeline

This pipeline scrapes ingredient panels from commercial pet foods, canonicalizes them to the unified ingredient registry, and computes statistical priors for recipe generation.

## Overview

The pipeline consists of 3 scripts that run in sequence:

1. **scrape-commercial.ts** - Fetches products from Open Pet Food Facts API
2. **canonicalize-commercial.ts** - Maps ingredient fragments to canonical IDs
3. **extract-commercial-patterns.ts** - Computes PMI-based pairing statistics

## Quick Start

### Run the full pipeline (Windows):

```powershell
cd scripts/training
.\run-commercial-training.ps1
```

### Run individual steps:

```bash
# Step 1: Scrape products
npx tsx scrape-commercial.ts

# Step 2: Canonicalize (replace with actual filename)
npx tsx canonicalize-commercial.ts ./output/commercial-products-2025-12-19.json ./output

# Step 3: Extract patterns (replace with actual filename)
npx tsx extract-commercial-patterns.ts ./output/canonical-commercial-2025-12-19.json ../../lib/data/recipePriors.json
```

## Data Sources

### Tier 1: Open Pet Food Facts (Primary)
- **URL:** https://world.openpetfoodfacts.org/
- **API:** https://world.openpetfoodfacts.org/cgi/search.pl
- **Coverage:** Dogs, cats, birds, reptiles, pocket pets
- **Quality:** Structured ingredient panels, many products

### Tier 2: Brand Pages (Exotic Pets)
Brand pages are used as fallback for species with sparse OPFF coverage:

**Birds:**
- https://www.lafeber.com/pet-birds/
- https://www.zupreem.com/products/
- https://roudybush.com/
- https://topsparrotfood.com/
- https://www.kaytee.com/all-products/pet-bird

**Pocket Pets:**
- https://oxbowanimalhealth.com/product-category/essentials-food/
- https://supremepetfoods.com/products/
- https://sherwoodpethealth.com/
- https://www.kaytee.com/all-products/small-animal

**Reptiles:**
- https://www.zoo-med.com/product-category/food/
- https://www.flukerfarms.com/reptile-products/
- https://www.exo-terra.com/en/products/food/
- https://www.mazuri.com/products
- https://www.pangeareptile.com/collections/crested-gecko-diet
- https://repashy.com/collections/repashy-superfoods

## Output Files

### Commercial Products
- `commercial-products-<timestamp>.json` - Raw scraped products
- Format: `{ source, brand, productName, speciesHint, productType, ingredientsList, ... }`

### Canonicalized Products
- `canonical-commercial-<timestamp>.json` - Products with ≥50% mapping success
- `canonical-commercial-all-<timestamp>.json` - All products (including low mapping)
- `unmapped-commercial-<timestamp>.json` - Unique unmapped ingredient fragments

### Recipe Priors
- `../../lib/data/recipePriors.json` - Updated with commercial patterns
- Structure:
  ```json
  {
    "commercial": {
      "dogs": {
        "coOccurrencePairs": { "chicken|rice": 150 },
        "pairPMI": { "chicken|rice": 2.3 },
        "rarePairs": { "turkey|anchovy_oil": -2.1 },
        "ingredientFrequency": { "chicken": 300 },
        "ingredientCount": { "min": 5, "max": 40, "median": 15 }
      }
    }
  }
  ```

## How It Works

### 1. Scraping
- Fetches products from OPFF search API (paginated)
- Categories: dog-foods, cat-foods, bird-foods, small-pet-foods, reptile-foods
- Extracts: brand, product name, ingredients list, product type
- Rate limited: 1-2 seconds between requests

### 2. Canonicalization
- Maps ingredient fragments to `unifiedIngredientRegistry` IDs
- Aggressive cleaning:
  - Removes: "minced", "chopped", "dehydrated", "meal", "powder", "extract"
  - Handles: "chicken meal" → "chicken", "fish oil" → "fish_oil"
  - Ignores: water, vitamins, minerals, preservatives (not counted for pairing)
- Threshold: ≥50% mapping success for inclusion

### 3. Pattern Extraction
- Computes **PMI (Pointwise Mutual Information)** for ingredient pairs
- Formula: `PMI(x,y) = log2(P(x,y) / (P(x) * P(y)))`
- Positive PMI = ingredients appear together MORE than expected
- Negative PMI = ingredients appear together LESS than expected (rare/never)
- Detects "never-seen pairs": common ingredients that never co-occur

### 4. Recipe Generation Integration
- `RecipeBuilder` uses commercial priors for ingredient scoring
- **Soft boosts:** Frequent pairs get score boost
- **Hard penalties:** Rare pairs (PMI < -1.5) get strong penalty
- **Hard blocks:** Never-seen pairs are blocked entirely
- Commercial data weighted 1.2x higher than recipe data (larger sample size)

## Adding New Sources

### To add a new brand page:

1. Add URL to `scrape-commercial.ts`:
```typescript
private async scrapeNewBrand(): Promise<void> {
  console.log('📦 Scraping NewBrand...');
  const url = 'https://newbrand.com/products/';
  // Implement scraping logic
}
```

2. Call in `scrapeBrandPages()`:
```typescript
await this.scrapeNewBrand();
```

3. Re-run pipeline:
```powershell
.\run-commercial-training.ps1
```

## Validation

The pipeline outputs a summary showing:
- Top 50 pairs per species (by PMI)
- Top 50 rare pairs per species (negative PMI)
- Ingredient coverage: % mapped, top unmapped fragments
- Products by species and source

### Example Output:
```
📈 Commercial Pattern Summary:
   Total products: 1,234
   
   By species:
   dogs: 800 products, 450 pairs, 23 rare pairs
   cats: 350 products, 320 pairs, 15 rare pairs
   
   Top 10 dog food pairs (by PMI):
   chicken + rice: PMI=2.45, count=450
   beef + potato: PMI=2.12, count=320
   salmon + sweet_potato: PMI=1.98, count=280
   
   Top 10 rare/never-seen dog pairs (negative PMI):
   turkey + anchovy_oil: PMI=-2.34 (RARE)
   chicken + fish_oil: PMI=-1.87 (RARE)
```

## Testing

To verify the pipeline prevents bad pairings:

1. Check if "turkey + anchovy_oil" exists in commercial data:
```bash
grep -r "turkey.*anchovy" lib/data/recipePriors.json
```

2. If it's in `rarePairs` with negative PMI, RecipeBuilder will penalize/block it

3. Generate a recipe and check logs:
```
[PMI Filter] anchovy_oil: Negative pairing with turkey_breast (learned from commercial products)
[PMI Filter] Removed 3 incompatible fats based on learned priors
```

## Troubleshooting

### "No products found"
- Check OPFF API is accessible: https://world.openpetfoodfacts.org/
- Verify category names are correct
- Check rate limiting (increase sleep times)

### "Low mapping success rate"
- Add more aliases to `canonicalize-commercial.ts`
- Check `unmapped-commercial.json` for common fragments
- Update `unifiedIngredientRegistry` with missing ingredients

### "No rare pairs detected"
- Need more products (at least 100+ per species)
- Adjust `RARE_PAIR_THRESHOLD` in `extract-commercial-patterns.ts`
- Check that ingredients have sufficient frequency (≥5 occurrences)

## Performance

- **Scraping:** ~5-10 minutes for 1,000 products
- **Canonicalization:** ~1-2 seconds for 1,000 products
- **Pattern Extraction:** ~2-5 seconds for 1,000 products
- **Total:** ~10-15 minutes for full pipeline

## Next Steps

1. Run the pipeline to collect initial commercial data
2. Review unmapped ingredients and add aliases
3. Verify RecipeBuilder uses commercial priors correctly
4. Test that bad pairings (turkey + anchovy oil) are prevented
5. Add more brand pages for exotic pets (birds, reptiles)
