# 🐾 Pet Recipe Scraper

Professional-grade scraper for pet nutrition recipes across all species: cats, dogs, reptiles, birds, and pocket pets.

## 🎯 Features

- **Multi-Species Support**: Cats, dogs, reptiles, birds, pocket pets
- **Tiered Sources**: Veterinary, academic, brand, and community sources
- **Safety Validation**: Built-in toxic ingredient database with species-specific checks
- **Rate Limiting**: Respects robots.txt and implements intelligent delays
- **Structured Output**: JSON exports organized by species and source tier
- **Comprehensive Coverage**: 20+ authoritative sources

## 📦 Installation

```bash
cd pet-recipe-scraper
npm install
```

## 🚀 Usage

### Quick Start

```bash
# Scrape all sources
npm run scrape:all

# Scrape specific species
npm run scrape:cats
npm run scrape:dogs
npm run scrape:reptiles
npm run scrape:birds
npm run scrape:pocket-pets

# Scrape only veterinary/academic sources
npm run scrape:vet
```

### Advanced Usage

```bash
# Custom species combination
npm run dev -- --species cats,dogs

# Specific source tiers
npm run dev -- --tiers veterinary,academic

# Specific sources by ID
npm run dev -- --sources tufts-vet-nutrition,balance-it

# Custom output directory
npm run dev -- --output ./my-data
```

## 📊 Data Sources

### Tier 1: Veterinary & Academic (Highest Authority)
- **Tufts Veterinary Nutrition** - Board-certified nutritionists
- **BalanceIT** - Vet-formulated custom recipes
- **PetDiets** - Dr. Remillard's clinical nutrition

### Tier 2: Species Specialists
- **The Tortoise Table** - Reptile plant safety database (1000+ entries)
- **ReptiFiles** - Science-based reptile care
- **Guinea Lynx** - Guinea pig nutrition charts
- **Cockatiel Cottage** - Avian safe foods database
- **Rabbit House Society** - Rabbit diet guides

### Tier 3: Premium Brands
- **Oxbow Animal Health** - Exotic pet nutrition leader
- **Mazuri** - Zoo-quality exotic formulas
- **Royal Canin** - Breed-specific recipes
- **Hill's Pet Nutrition** - Veterinary diets

### Tier 4: Community & Aggregators
- **Chewy** - Recipe blog with multi-species coverage
- **Allrecipes** - Pet food section
- **Avian Avenue** - Bird owner forums

## 📁 Output Structure

```
output/
├── recipes-2024-12-18T11-42-00.json          # All recipes
├── results-2024-12-18T11-42-00.json          # Scraping results
├── cats-2024-12-18T11-42-00.json             # Cat recipes only
├── dogs-2024-12-18T11-42-00.json             # Dog recipes only
├── reptiles-2024-12-18T11-42-00.json         # Reptile recipes
├── birds-2024-12-18T11-42-00.json            # Bird recipes
└── pocket-pets-2024-12-18T11-42-00.json      # Pocket pet recipes
```

## 🛡️ Safety Features

### Built-in Toxic Ingredient Database
- **Universal toxins**: Chocolate, xylitol, caffeine
- **Species-specific**: Onions/garlic (cats/dogs), avocado (birds), grapes (dogs)
- **Caution items**: Spinach (reptiles), salt (birds), iceberg lettuce (pocket pets)

### Validation Pipeline
1. Ingredient safety check per species
2. Minimum ingredient count validation
3. Nutritional completeness warnings
4. Source tier verification

## 🔧 Architecture

```
pet-recipe-scraper/
├── src/
│   ├── types/
│   │   └── index.ts                    # TypeScript definitions
│   ├── config/
│   │   ├── sources.ts                  # Source registry (20+ sources)
│   │   └── safety-database.ts          # Toxic/safe ingredients
│   ├── scrapers/
│   │   ├── BaseRecipeScraper.ts        # Foundation class
│   │   ├── VeterinaryRecipeScraper.ts  # Vet/academic sites
│   │   └── ReptileScraper.ts           # Reptile specialists
│   └── index.ts                        # Main runner
├── package.json
├── tsconfig.json
└── README.md
```

## 📝 Recipe Data Schema

```typescript
{
  id: string;
  name: string;
  species: ['cats' | 'dogs' | 'reptiles' | 'birds' | 'pocket-pets'];
  ingredients: [
    {
      name: string;
      amount?: string;
      unit?: string;
      notes?: string;
      safetyStatus?: 'safe' | 'caution' | 'toxic';
    }
  ];
  instructions?: string[];
  nutritionalInfo?: {
    protein?: number;
    fat?: number;
    calcium?: number;
    calciumPhosphorusRatio?: number;
  };
  warnings?: string[];
  sourceUrl: string;
  sourceName: string;
  sourceTier: 'veterinary' | 'academic' | 'brand' | 'community';
  vetApproved?: boolean;
  scrapedAt: Date;
}
```

## ⚙️ Configuration

### Adding New Sources

Edit `src/config/sources.ts`:

```typescript
{
  id: 'my-source',
  name: 'My Pet Nutrition Site',
  baseUrl: 'https://example.com',
  tier: 'community',
  species: ['cats', 'dogs'],
  active: true,
  respectRobotsTxt: true,
  rateLimit: 2000,
  selectors: {
    recipeList: '.recipe-card',
    recipeTitle: 'h2.title',
    ingredients: '.ingredients li',
  },
}
```

### Adding Toxic Ingredients

Edit `src/config/safety-database.ts`:

```typescript
{
  ingredient: 'new-toxic-food',
  safeFor: [],
  toxicFor: ['cats', 'dogs'],
  cautionFor: ['birds'],
  notes: 'Causes XYZ toxicity',
}
```

## 🚨 Important Notes

### Legal & Ethical
- **Respects robots.txt** by default
- **Rate limiting** prevents server overload
- **Educational use** - always cite sources
- **User agent** identifies as research bot

### Data Quality
- Recipes from **community sources** require manual review
- **Veterinary sources** are prioritized and flagged as `vetApproved: true`
- Safety validation is **conservative** - flags potential issues
- Always **consult a veterinarian** before using scraped recipes

## 🔄 Development

```bash
# Build TypeScript
npm run build

# Run in development mode
npm run dev

# Run compiled version
npm start
```

## 📈 Roadmap

- [ ] Reddit API integration for r/rawpetfood, r/reptiles
- [ ] NLP for unstructured recipe extraction
- [ ] Nutritional analysis API integration (USDA FoodData Central)
- [ ] Image scraping for visual recipe database
- [ ] Automated ASIN lookup for ingredients
- [ ] Price tracking for recipe cost estimation

## 🤝 Contributing

When adding new sources:
1. Verify the source is reputable (vet-backed preferred)
2. Test selectors thoroughly
3. Add to appropriate tier
4. Update safety database if new ingredients found
5. Document any special handling needed

## ⚠️ Disclaimer

This scraper is for **educational and research purposes**. Scraped recipes should be:
- Reviewed by a veterinary nutritionist
- Validated for species appropriateness
- Checked for ingredient safety
- Used as inspiration, not gospel

**Never feed your pet a recipe without professional veterinary guidance.**

## 📄 License

MIT License - See LICENSE file for details

---

Built with ❤️ for pet nutrition research
