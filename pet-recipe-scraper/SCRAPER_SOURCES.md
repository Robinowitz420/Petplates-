# Pet Recipe Scraper - Source Documentation

Complete guide to all scraping sources, organized by species and data type.

## 📊 Overview

**Total Sources:** 20+ specialized nutrition sites  
**Species Coverage:** Cats, Dogs, Birds, Reptiles, Pocket Pets  
**Data Types:** Recipes, Safety Lists, Nutrient Tables, Ca:P Ratios, Vitamin Content

---

## 🔬 Scraping Modes

### 1. Standard Mode (`npm run scrape:all`)
Scrapes traditional recipes from veterinary and brand sites.
- Ingredients lists
- Instructions
- Nutrition tables
- Warnings

### 2. Blog Discovery Mode (`npm run scrape:blogs`)
Discovers recipes via sitemap crawling and JSON-LD extraction.
- Finds 100s-1000s of recipe URLs
- Extracts structured schema.org Recipe data
- Falls back to heuristic parsing
- **Best for:** Cats, Dogs (most blog content)

### 3. Reddit Mode (`npm run scrape:reddit`)
Scrapes community recipes from 25+ pet subreddits.
- Searches for recipe-related posts
- Extracts ingredients and instructions from post text
- Species-specific subreddits
- **Best for:** All species, community-tested recipes

### 4. Nutrient Table Mode (`npm run scrape:nutrients`) ⭐ NEW
Scrapes specialized nutrient data tables.
- **Tortoise Table:** Color-coded plant safety (Red/Amber/Green)
- **Guinea Lynx:** Vitamin C, Calcium, Phosphorus content
- **ReptiFiles:** Ca:P ratios for reptile foods
- **Best for:** Reptiles, Pocket Pets (safety and nutrient data)

---

## 🦎 Reptile Sources

### The Tortoise Table ⭐ CRITICAL
**URL:** https://www.thetortoisetable.org.uk  
**Tier:** Academic  
**Data Type:** Plant safety database  

**What it provides:**
- Color-coded safety ratings (Red = Toxic, Amber = Caution, Green = Safe)
- 1000+ plant entries
- Species-specific safety info
- Oxalate content warnings

**Scraping strategy:**
```bash
npm run scrape:nutrients  # Uses NutrientTableScraper
```

**Output format:**
```json
{
  "name": "Dandelion - Safety Data",
  "species": ["reptiles"],
  "ingredients": [{"name": "Dandelion", "amount": "100", "unit": "g"}],
  "tags": ["safety-list", "tortoise-table", "safe"]
}
```

---

### ReptiFiles
**URL:** https://reptifiles.com  
**Tier:** Academic  
**Data Type:** Species-specific feeding guides  

**What it provides:**
- Ca:P ratios for common feeder insects and vegetables
- Bearded Dragon, Blue Tongue Skink, Leopard Gecko diets
- Dusting recommendations
- Toxic food warnings

**Key pages:**
- `/bearded-dragon-care/bearded-dragon-diet-nutrition/`
- `/blue-tongue-skink-care/blue-tongue-skink-diet-nutrition/`
- `/leopard-gecko-care/leopard-gecko-diet-nutrition/`

**Scraping strategy:**
```bash
npm run scrape:nutrients  # Extracts Ca:P ratios
npm run scrape:blogs      # Gets full feeding guides
```

---

### TortoiseForum.org
**URL:** https://www.tortoiseforum.org  
**Tier:** Community  
**Data Type:** User-generated seed mixes and weed lists  

**What it provides:**
- "Diet and Nutrition" sub-forum posts
- Seasonal weed identification
- Seed mix recipes for tortoises
- User experiences with different plants

**Scraping strategy:**
```bash
npm run scrape:reddit  # Similar forum structure to Reddit
```

---

## 🦜 Bird Sources

### Cockatiel Cottage
**URL:** https://www.cockatielcottage.net  
**Tier:** Community  
**Data Type:** Safe/toxic food lists  

**What it provides:**
- Legendary "Safe Table Foods" list
- Toxic food warnings
- Portion guidelines
- Species-specific notes (cockatiels, parrots)

**Scraping strategy:**
```bash
npm run scrape:all --species birds
```

---

### Kiwi's New Life Bird Rescue ⭐ NEW
**URL:** https://www.kiwisbirds.com  
**Tier:** Community  
**Data Type:** "Chop" recipes  

**What it provides:**
- Detailed chop recipes (fresh veggie mixes)
- Ingredient breakdowns
- Preparation instructions
- Seasonal variations

**Key page:**
- `/chop-recipes`

**Scraping strategy:**
```bash
npm run scrape:blogs  # Has structured recipe pages
```

---

### Avian Avenue Forum
**URL:** https://www.avianavenue.com  
**Tier:** Community  
**Data Type:** User-generated chop recipes  

**What it provides:**
- "Feathered Food Court" sub-forum
- Community-tested chop recipes
- Ingredient substitutions
- Feeding schedules

**Scraping strategy:**
```bash
npm run scrape:reddit  # Forum structure
```

---

## 🐹 Pocket Pet Sources

### Guinea Lynx ⭐ CRITICAL
**URL:** https://www.guinealynx.info  
**Tier:** Academic  
**Data Type:** Vegetable nutrient chart  

**What it provides:**
- **Vitamin C content** (critical for guinea pigs)
- Calcium and Phosphorus values
- Ca:P ratios
- Feeding frequency recommendations

**Key page:**
- `/diet_veggie.html`

**Scraping strategy:**
```bash
npm run scrape:nutrients  # Uses NutrientTableScraper for vitamin data
```

**Output format:**
```json
{
  "name": "Bell Pepper - Nutrient Data",
  "species": ["pocket-pets"],
  "ingredients": [{"name": "Bell Pepper", "amount": "100", "unit": "g"}],
  "warnings": ["High Vitamin C (127mg/100g) - excellent for guinea pigs"],
  "tags": ["nutrient-data", "guinea-lynx", "vitamin-c"]
}
```

---

### Rabbit House Society ⭐ NEW
**URL:** https://rabbit.org  
**Tier:** Community  
**Data Type:** Vegetable and fruit lists  

**What it provides:**
- Suggested vegetables for rabbits
- Portion sizes
- Frequency guidelines
- High-fiber food lists

**Key page:**
- `/suggested-vegetables-and-fruits-for-a-rabbit-diet/`

**Scraping strategy:**
```bash
npm run scrape:all --species pocket-pets
```

---

### Is It Safe For My Rat ⭐ NEW
**URL:** https://www.isafeformyrat.com  
**Tier:** Community  
**Data Type:** Food safety database  

**What it provides:**
- Massive database of rat-safe foods
- "Shunamite Diet" proportions
- Toxic food warnings
- Portion recommendations

**Scraping strategy:**
```bash
npm run scrape:all --species pocket-pets
```

---

## 🔬 Reference Data Sources

### USDA FoodData Central ⭐ NEW
**URL:** https://fdc.nal.usda.gov  
**Tier:** Academic  
**Data Type:** Precise nutrient values  

**What it provides:**
- Exact protein, fat, carb content per 100g
- Vitamin and mineral breakdowns
- Ca:P ratios for any ingredient
- **The source of truth for all nutrient data**

**Use case:**
- Validate scraped nutrient data
- Fill in missing nutrient values
- Cross-reference community claims

**Scraping strategy:**
```bash
# Manual lookup for now - API integration coming soon
```

---

## 📋 Data Type Summary

### Safety Lists
**Sources:** Tortoise Table, Cockatiel Cottage, Is It Safe For My Rat  
**Output:** Safe/Caution/Toxic ratings  
**Use in training:** Negative pattern detection (toxic ingredients)

### Nutrient Tables
**Sources:** Guinea Lynx, USDA FoodData Central  
**Output:** Ca, P, Vitamin C, Vitamin A values  
**Use in training:** Category ratio priors, nutrient completeness checks

### Ca:P Ratios
**Sources:** ReptiFiles, Guinea Lynx  
**Output:** Calcium-to-Phosphorus ratios  
**Use in training:** Reptile/pocket pet recipe validation

### Recipes
**Sources:** All blog/Reddit sources  
**Output:** Ingredient lists, instructions  
**Use in training:** Co-occurrence patterns, ingredient counts

---

## 🎯 Recommended Scraping Workflow

### For Cats & Dogs
```bash
npm run scrape:blogs    # Get 100s of blog recipes
npm run scrape:reddit   # Get community recipes
```

### For Reptiles
```bash
npm run scrape:nutrients  # Get safety lists and Ca:P ratios (CRITICAL)
npm run scrape:blogs      # Get feeding guides
```

### For Birds
```bash
npm run scrape:blogs    # Get chop recipes
npm run scrape:reddit   # Get community chop variations
```

### For Pocket Pets
```bash
npm run scrape:nutrients  # Get Vitamin C and Ca:P data (CRITICAL)
npm run scrape:all        # Get vegetable lists
npm run scrape:reddit     # Get community recipes
```

---

## 🔄 Integration with Training Pipeline

After scraping, run the training pipeline:

```bash
cd scripts/training
./run-training-pipeline.sh
```

This will:
1. **Canonicalize** scraped data → map to ingredient registry
2. **Label** with LLM → classify meal type, detect warnings
3. **Extract patterns** → compute co-occurrence, ratios
4. **Generate** `recipePriors.json` → used by RecipeBuilder

---

## 📊 Expected Results by Species

### Cats & Dogs
- **300-500 recipes** from blogs
- **50-100 recipes** from Reddit
- **Co-occurrence patterns:** chicken+rice, beef+sweet_potato
- **Category ratios:** 40% protein, 30% veg, 15% fat

### Reptiles
- **500+ plant safety entries** from Tortoise Table
- **50+ Ca:P ratios** from ReptiFiles
- **Safety patterns:** toxic plants, low Ca:P warnings
- **Category ratios:** 30% protein, 50% veg (herbivores)

### Birds
- **100+ chop recipes** from Kiwi's and Avian Avenue
- **Co-occurrence patterns:** kale+carrot+broccoli, pellet+chop
- **Category ratios:** 30% protein, 40% veg, 20% carb

### Pocket Pets
- **200+ vegetable entries** with Vitamin C data
- **100+ Ca:P ratios** for common foods
- **Safety patterns:** high-calcium foods, vitamin C sources
- **Category ratios:** 20% protein, 40% veg, 30% carb (high fiber)

---

## 🚨 Important Notes

### Respect robots.txt
All scrapers check `robots.txt` before scraping. If blocked, the scraper will skip that source.

### Rate Limiting
- Standard sources: 2000ms delay
- Forums: 3000ms delay
- USDA: 1000ms delay (API-friendly)

### Data Quality
- **Tier 1 (Veterinary/Academic):** Highest trust, use for validation
- **Tier 2 (Community):** Good for patterns, verify against Tier 1
- **Tier 3 (Brand):** Commercial bias, use for ingredient ideas only

### Legal & Ethical
- All scrapers identify as educational research bots
- Respect copyright - don't republish scraped content
- Use scraped data for pattern learning only
- Always cite original sources in generated recipes

---

**Questions?** See the main README or check the scraper source code in `src/scrapers/`.
