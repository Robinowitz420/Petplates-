# ASIN Correction System - Web Scraper Version

## Overview

This automated system searches Amazon for better product matches when your current ASINs are invalid, unavailable, or don't match the ingredients they claim to represent.

## How It Works

### Step 1: Parse Your Data
- Reads `lib/data/vetted-products.txt`
- Extracts ingredient names, current ASINs, and product details

### Step 2: Verify Current ASINs
- Checks if current ASINs are still available on Amazon
- Validates that products exist and are in stock

### Step 3: Intelligent Search
- Searches Amazon using multiple search terms focused on raw ingredients:
  - `raw {ingredient} for dogs`
  - `freeze dried {ingredient} dog food`
  - `{ingredient} dog food ingredient raw`
  - `{ingredient} bulk pet food`

### Step 4: Smart Matching
- Scores products based on relevance to ingredients
- **Rewards:** Raw, freeze-dried, human-grade, organic
- **Penalizes:** Canned food, dry kibble, treats, toys, supplements

### Step 5: Generate Corrections
- Creates corrected `vetted-products-CORRECTED.txt`
- Generates detailed `ASIN-CORRECTION-REPORT.md`

## Usage

### Test Mode (First N Products)
```bash
npm run correct-asins-scraper -- 5
```

### Full Run (All Products)
```bash
npm run correct-asins-scraper
```

## Algorithm Details

### Matching Score (0-100)
- **Exact ingredient match:** +80 points
- **Partial word matches:** +40 points (proportional)
- **Pet-specific terms:** +15 points
- **Quality indicators:** +3-5 points each
- **Penalties:** -20 to -50 points for wrong product types

### Confidence Levels
- **High (75+):** Strong match, likely correct
- **Medium (60-74):** Decent match, review recommended
- **Low (<60):** Weak match, manual verification required

## Current Issues & Improvements Needed

### Problems Found
1. **Many current ASINs are invalid/unavailable**
2. **Search finds processed dog food instead of raw ingredients**
3. **Need better search terms for bulk/raw products**

### Planned Improvements
1. **Better search terms** targeting wholesale/raw suppliers
2. **Category-specific searches** (pet-supplies vs grocery)
3. **Brand filtering** (focus on known raw food brands)
4. **Price filtering** (bulk products vs individual portions)

## Files Generated

### vetted-products-CORRECTED.txt
- Updated product entries with new ASINs
- Preserves all existing fields
- Adds correction notes

### ASIN-CORRECTION-REPORT.md
- Summary statistics
- Detailed corrections by confidence level
- Direct Amazon links for verification

## Rate Limiting & Ethics

- **3-second delay** between searches
- **3-second delay** between ASIN verifications
- **Respects robots.txt** and Amazon's terms
- **Only scrapes public search results**

## Troubleshooting

### No Results Found
- Check internet connection
- Amazon may be blocking requests
- Try different search terms

### Invalid ASINs Not Detected
- Amazon's product pages may have changed
- Try different user agents

### Poor Matches
- Algorithm may need tuning for specific ingredient types
- Manual review required for low-confidence matches

## Integration with Manual Tool

This automated system works alongside your manual verification tool:

1. **Run automated corrections** to fix obvious issues
2. **Use manual tool** (`/asin-verification`) for remaining items
3. **Review reports** and verify corrections
4. **Apply updates** to your data files

---

**Status:** Working prototype - needs refinement for better ingredient matching.
