# Recipe Training Pipeline

This pipeline converts scraped recipes from blogs and Reddit into training data that improves the RecipeBuilder's variety and realism.

## 🎯 What This Does

Instead of "prompt-training" the generator, this pipeline:
1. **Canonicalizes** scraped recipes → maps ingredients to your registry
2. **Labels** recipes with LLM → classifies meal type, prep style, warnings
3. **Extracts patterns** → computes co-occurrence stats and ratio distributions
4. **Integrates** patterns → RecipeBuilder uses them as soft scoring boosts

## 📊 The 4 Artifacts

### 1. Canonical Recipe Dataset (`canonical-recipes.json`)
Clean JSON with:
- Species
- Canonical ingredient IDs from your registry
- Grams estimates (when possible)
- Flags: cooked/raw, meal/topper/treat, complete/partial
- Provenance: URL + source tier

**Success criteria:** >60% ingredient mapping rate

### 2. Labeled Recipe Dataset (`labeled-recipes.json`)
Enriched with LLM labels:
- `speciesGuess` - Confirmed species
- `mealType` - complete_meal | topper | treat | feeding_guide
- `prepStyle` - cooked | raw | mixed | unknown
- `warnings` - Missing nutrients, toxic ingredients, structural issues
- `confidence` - 0-1 scale

### 3. Recipe Priors (`recipePriors.json`)
Computed patterns:
- **Co-occurrence** - Which ingredients appear together
- **Category ratios** - Typical protein:veg:fat distributions
- **Ingredient counts** - Typical recipe sizes by species
- **Category pairs** - Common protein+fat and protein+veg combinations
- **Negative patterns** - Toxic ingredients and structural issues to avoid

### 4. Scoring Integration (`RecipePriorScoring.ts`)
Soft boosts in RecipeBuilder:
- **Co-occurrence boost** - Prefer ingredients that commonly appear together
- **Protein pairing boost** - Prefer fats/veggies that pair with selected protein
- **Category ratio penalty** - Penalize unusual protein:veg:fat ratios
- **Ingredient count penalty** - Penalize unusually small/large recipes

## 🚀 Usage

### Quick Start (Automated)

```bash
cd scripts/training
chmod +x run-training-pipeline.sh
./run-training-pipeline.sh
```

This will:
1. Find the most recent scraped recipe file
2. Run all 3 pipeline steps
3. Generate `recipePriors.json` in `lib/data/`

### Manual Steps

```bash
# Step 1: Canonicalize
npx ts-node canonicalize-recipes.ts \
  ../../pet-recipe-scraper/output/blog-recipes-*.json \
  ./output/canonical-recipes.json

# Step 2: Label (requires LLM API - see below)
npx ts-node llm-label-recipes.ts \
  ./output/canonical-recipes.json \
  ./output/labeled-recipes.json

# Step 3: Extract patterns
npx ts-node extract-patterns.ts \
  ./output/labeled-recipes.json \
  ../../lib/data/recipePriors.json
```

## 🤖 LLM Labeling Setup

The labeling step uses an LLM to classify recipes. You need to:

1. **Choose an LLM provider:**
   - OpenAI GPT-4
   - Anthropic Claude
   - Local LLM (Ollama, LM Studio)

2. **Add API credentials:**
   ```bash
   export OPENAI_API_KEY="sk-..."
   # or
   export ANTHROPIC_API_KEY="sk-ant-..."
   ```

3. **Implement the API call in `llm-label-recipes.ts`:**
   ```typescript
   async labelRecipe(recipe: CanonicalizedRecipe): Promise<LabeledRecipe> {
     const prompt = this.buildPrompt(recipe);
     
     // OpenAI example:
     const response = await openai.chat.completions.create({
       model: "gpt-4",
       messages: [{ role: "user", content: prompt }],
       temperature: 0.3,
     });
     
     const labels = JSON.parse(response.choices[0].message.content);
     return { ...recipe, labels };
   }
   ```

**Fallback:** The script includes heuristic labeling if no LLM is configured.

## 📈 How Patterns Improve RecipeBuilder

### Before (No Priors)
- Random ingredient selection within constraints
- No awareness of common pairings
- Unusual ingredient counts
- Generic recipes

### After (With Priors)
- **Co-occurrence boost:** "Chicken + carrots" scores higher because they commonly appear together
- **Protein pairing:** If chicken is selected, olive oil and spinach get boosted (common pairings)
- **Ratio guidance:** Recipes stay close to typical 40% protein, 30% veg, 15% fat distributions
- **Count guidance:** Recipes have 5-6 ingredients (typical for cats) instead of 3 or 12

**Result:** More realistic, varied recipes that mirror real pet food recipes.

## 🔧 Integration with RecipeBuilder

The priors are automatically loaded in `RecipePriorScoring.ts` and used in RecipeBuilder's scoring:

```typescript
import { applyPriorScoring } from './RecipePriorScoring';

// In RecipeBuilder.scoreIngredients():
const baseScore = this.calculateBaseScore(ingredient);

// Apply prior-based boosts
const adjustedScore = applyPriorScoring(
  ingredient,
  baseScore,
  this.selectedIngredients,
  this.constraints.species,
  {
    coOccurrenceWeight: 0.15,  // 15% boost for common pairings
    proteinPairingWeight: 0.1, // 10% boost for protein pairings
  }
);
```

These are **soft boosts** - they don't override nutrition constraints, just break ties and improve variety.

## 📊 Expected Results

After running the pipeline with 100+ scraped recipes:

**Co-occurrence patterns:**
- 200+ ingredient pairs discovered
- 50+ ingredient triples discovered

**Category ratios:**
- Cats: 45% protein, 25% veg, 20% fat, 10% carb
- Dogs: 40% protein, 30% veg, 15% fat, 15% carb

**Ingredient counts:**
- Cats: 3-12 ingredients (median 5)
- Dogs: 3-15 ingredients (median 6)

**Common pairings:**
- Chicken + olive_oil, fish_oil
- Chicken + carrot, spinach, broccoli
- Beef + sweet_potato, peas
- Salmon + coconut_oil, flaxseed

## 🔄 Updating Patterns

Re-run the pipeline whenever you:
- Scrape new recipes (more data = better patterns)
- Add new ingredients to your registry
- Want to refresh patterns for a specific species

The pipeline is **incremental** - it won't break existing recipes, just improve future ones.

## 🐛 Troubleshooting

**Low mapping rate (<60%)**
- Check ingredient name variations in `canonicalize-recipes.ts`
- Add more synonyms to `generateVariations()`
- Review unmapped ingredients and add them to your registry

**LLM labeling errors**
- Check API credentials
- Reduce batch size if hitting rate limits
- Use heuristic fallback for testing

**Pattern extraction fails**
- Ensure you have >10 recipes per species
- Check that labeled recipes have valid `mealType` field
- Review console output for specific errors

## 📚 Files

- `canonicalize-recipes.ts` - Step 1: Map ingredients to registry
- `llm-label-recipes.ts` - Step 2: Classify recipes with LLM
- `extract-patterns.ts` - Step 3: Compute co-occurrence and ratios
- `run-training-pipeline.sh` - Automated pipeline runner
- `output/` - Generated training data (gitignored)

## 🎓 Learn More

- **Why not prompt-train?** Prompts are brittle and hard to debug. Data-driven patterns are measurable and tunable.
- **Why soft boosts?** Hard rules break edge cases. Soft boosts guide without constraining.
- **Why co-occurrence?** Real recipes have ingredient synergies. Co-occurrence captures this naturally.

---

**Questions?** Check the main project README or the RecipeBuilder documentation.
