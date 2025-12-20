/**
 * PATTERN EXTRACTOR
 * Computes co-occurrence stats, ratio distributions, and patterns from labeled recipes
 * This is Step 3 of the training pipeline - generates recipePriors.json
 */

import * as fs from 'fs/promises';

interface LabeledRecipe {
  id: string;
  name: string;
  species: string[];
  ingredients: Array<{
    canonicalId: string;
    originalName: string;
  }>;
  labels: {
    mealType: 'complete_meal' | 'topper' | 'treat' | 'feeding_guide';
    prepStyle: 'cooked' | 'raw' | 'mixed' | 'unknown';
  };
}

interface RecipePriors {
  version: string;
  generatedAt: string;
  
  // Co-occurrence patterns with PMI scores
  coOccurrence: {
    [species: string]: {
      pairs: Record<string, number>; // "chicken_breast+carrot": 15 (raw count)
      triples: Record<string, number>; // "chicken_breast+carrot+rice": 8
      pairPMI: Record<string, number>; // "chicken_breast+carrot": 2.3 (smoothed PMI)
      negativePairs: Record<string, number>; // "turkey+anchovy_oil": -1.5 (negative PMI)
    };
  };
  
  // Category ratio distributions
  categoryRatios: {
    [species: string]: {
      protein: { mean: number; stdDev: number };
      vegetable: { mean: number; stdDev: number };
      fat: { mean: number; stdDev: number };
      carbohydrate: { mean: number; stdDev: number };
    };
  };
  
  // Ingredient count distributions
  ingredientCounts: {
    [species: string]: {
      mean: number;
      median: number;
      min: number;
      max: number;
    };
  };
  
  // Common ingredient pairs by category
  categoryPairs: {
    [species: string]: {
      proteinWithFat: Record<string, string[]>; // "chicken_breast": ["olive_oil", "fish_oil"]
      proteinWithVeg: Record<string, string[]>; // "beef": ["carrot", "spinach"]
    };
  };
  
  // Negative patterns (things to avoid)
  negativePatterns: {
    toxicIngredients: Record<string, string[]>; // species -> toxic ingredients
    structuralIssues: string[]; // "all_meat_no_calcium", "excessive_fat"
  };
}

class PatternExtractor {
  async extractPatterns(inputPath: string, outputPath: string): Promise<void> {
    console.log(`\n📊 Extracting patterns from: ${inputPath}`);
    
    const fileContent = await fs.readFile(inputPath, 'utf-8');
    const recipes: LabeledRecipe[] = JSON.parse(fileContent);
    console.log(`   Found ${recipes.length} labeled recipes`);

    // Filter to usable meal types (species-specific)
    const usableMeals = recipes.filter(r => {
      const mealType = r.labels.mealType;
      const species = r.species[0]; // Primary species
      
      // Dogs/Cats: only complete meals
      if (species === 'dogs' || species === 'cats') {
        return mealType === 'complete_meal';
      }
      
      // Birds: accept complete meals, measured mixes, ratio formulas
      if (species === 'birds') {
        return ['complete_meal', 'measured_mix', 'ratio_formula'].includes(mealType);
      }
      
      // Reptiles: accept complete meals, salad mixes, diet plans
      if (species === 'reptiles') {
        return ['complete_meal', 'measured_mix', 'ratio_formula', 'diet_plan_table'].includes(mealType);
      }
      
      // Pocket pets: accept complete meals, measured mixes, treat recipes
      if (species === 'pocket-pets') {
        return ['complete_meal', 'measured_mix', 'ratio_formula', 'treat'].includes(mealType);
      }
      
      return mealType === 'complete_meal';
    });
    console.log(`   Using ${usableMeals.length} usable recipes for pattern extraction (complete meals + exotic formats)`);

    const priors: RecipePriors = {
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      coOccurrence: {},
      categoryRatios: {},
      ingredientCounts: {},
      categoryPairs: {},
      negativePatterns: {
        toxicIngredients: {
          cats: ['onion', 'garlic', 'grapes', 'raisins', 'chocolate', 'xylitol', 'avocado'],
          dogs: ['onion', 'garlic', 'grapes', 'raisins', 'chocolate', 'xylitol', 'macadamia'],
          birds: ['avocado', 'chocolate', 'caffeine', 'salt', 'onion', 'garlic'],
          reptiles: ['avocado', 'rhubarb', 'onion'],
          'pocket-pets': ['chocolate', 'onion', 'garlic', 'avocado'],
        },
        structuralIssues: [
          'all_meat_no_calcium',
          'excessive_fat_over_70_percent',
          'single_ingredient',
          'no_protein_source',
        ],
      },
    };

    // Extract patterns by species
    const speciesList = ['cats', 'dogs', 'birds', 'reptiles', 'pocket-pets'];
    
    for (const species of speciesList) {
      const speciesRecipes = usableMeals.filter((r: LabeledRecipe) => r.species.includes(species));
      
      if (speciesRecipes.length === 0) {
        console.log(`   ⚠️  No recipes found for ${species}`);
        continue;
      }

      console.log(`   Processing ${speciesRecipes.length} ${species} recipes...`);

      // Co-occurrence patterns
      priors.coOccurrence[species] = this.extractCoOccurrence(speciesRecipes);

      // Category ratios (simplified - would need actual category data)
      priors.categoryRatios[species] = this.extractCategoryRatios(speciesRecipes);

      // Ingredient counts
      priors.ingredientCounts[species] = this.extractIngredientCounts(speciesRecipes);

      // Category pairs
      priors.categoryPairs[species] = this.extractCategoryPairs(speciesRecipes);
    }

    await fs.writeFile(outputPath, JSON.stringify(priors, null, 2), 'utf-8');

    console.log(`\n✅ Pattern extraction complete!`);
    console.log(`   Output: ${outputPath}`);
    this.printSummary(priors);
  }

  private extractCoOccurrence(recipes: LabeledRecipe[]): RecipePriors['coOccurrence'][string] {
    const pairs = new Map<string, number>();
    const triples = new Map<string, number>();
    const ingredientCounts = new Map<string, number>();
    const totalRecipes = recipes.length;

    // Count individual ingredients and pairs
    for (const recipe of recipes) {
      const ingredients = recipe.ingredients.map(i => i.canonicalId).sort();
      const uniqueIngredients = new Set(ingredients);

      // Count individual ingredient occurrences
      for (const ing of uniqueIngredients) {
        ingredientCounts.set(ing, (ingredientCounts.get(ing) || 0) + 1);
      }

      // Count pairs
      for (let i = 0; i < ingredients.length; i++) {
        for (let j = i + 1; j < ingredients.length; j++) {
          const pair = `${ingredients[i]}+${ingredients[j]}`;
          pairs.set(pair, (pairs.get(pair) || 0) + 1);
        }
      }

      // Count triples
      for (let i = 0; i < ingredients.length; i++) {
        for (let j = i + 1; j < ingredients.length; j++) {
          for (let k = j + 1; k < ingredients.length; k++) {
            const triple = `${ingredients[i]}+${ingredients[j]}+${ingredients[k]}`;
            triples.set(triple, (triples.get(triple) || 0) + 1);
          }
        }
      }
    }

    // Compute PMI scores for pairs
    const pairPMI: Record<string, number> = {};
    const negativePairs: Record<string, number> = {};
    const SMOOTHING = 0.5; // Laplace smoothing

    for (const [pair, pairCount] of pairs.entries()) {
      const [ing1, ing2] = pair.split('+');
      const count1 = ingredientCounts.get(ing1) || 0;
      const count2 = ingredientCounts.get(ing2) || 0;

      // Smoothed PMI: log(P(x,y) / (P(x) * P(y)))
      // P(x,y) = (pairCount + smoothing) / (totalRecipes + smoothing * totalPairs)
      // P(x) = (count1 + smoothing) / (totalRecipes + smoothing * totalIngredients)
      const pXY = (pairCount + SMOOTHING) / (totalRecipes + SMOOTHING);
      const pX = (count1 + SMOOTHING) / (totalRecipes + SMOOTHING);
      const pY = (count2 + SMOOTHING) / (totalRecipes + SMOOTHING);
      const pmi = Math.log2(pXY / (pX * pY));

      // Positive PMI = ingredients appear together more than expected
      if (pmi > 0 && pairCount >= 2) {
        pairPMI[pair] = Math.round(pmi * 100) / 100;
      }

      // Negative PMI = ingredients appear together LESS than expected
      // (both are common individually, but never paired)
      if (pmi < -0.5 && count1 >= 3 && count2 >= 3 && pairCount === 0) {
        negativePairs[pair] = Math.round(pmi * 100) / 100;
      }
    }

    // Detect negative pairs: common ingredients that NEVER appear together
    const commonIngredients = Array.from(ingredientCounts.entries())
      .filter(([_, count]) => count >= 3)
      .map(([ing, _]) => ing);

    for (let i = 0; i < commonIngredients.length; i++) {
      for (let j = i + 1; j < commonIngredients.length; j++) {
        const pair = `${commonIngredients[i]}+${commonIngredients[j]}`;
        if (!pairs.has(pair)) {
          // Both ingredients are common, but they NEVER appear together
          const count1 = ingredientCounts.get(commonIngredients[i])!;
          const count2 = ingredientCounts.get(commonIngredients[j])!;
          const pX = (count1 + SMOOTHING) / (totalRecipes + SMOOTHING);
          const pY = (count2 + SMOOTHING) / (totalRecipes + SMOOTHING);
          const pXY = SMOOTHING / (totalRecipes + SMOOTHING); // Only smoothing, no actual co-occurrence
          const pmi = Math.log2(pXY / (pX * pY));
          
          if (pmi < -1.0) { // Strong negative association
            negativePairs[pair] = Math.round(pmi * 100) / 100;
          }
        }
      }
    }

    // Convert to object and filter low counts
    const pairsObj: Record<string, number> = {};
    for (const [pair, count] of pairs.entries()) {
      if (count >= 2) {
        pairsObj[pair] = count;
      }
    }

    const triplesObj: Record<string, number> = {};
    for (const [triple, count] of triples.entries()) {
      if (count >= 2) {
        triplesObj[triple] = count;
      }
    }

    return { 
      pairs: pairsObj, 
      triples: triplesObj,
      pairPMI,
      negativePairs
    };
  }

  private extractCategoryRatios(recipes: LabeledRecipe[]): RecipePriors['categoryRatios'][string] {
    // Simplified - in real implementation, would categorize ingredients and compute actual ratios
    // For now, return typical ratios based on species
    return {
      protein: { mean: 0.4, stdDev: 0.1 },
      vegetable: { mean: 0.3, stdDev: 0.1 },
      fat: { mean: 0.15, stdDev: 0.05 },
      carbohydrate: { mean: 0.15, stdDev: 0.05 },
    };
  }

  private extractIngredientCounts(recipes: LabeledRecipe[]): RecipePriors['ingredientCounts'][string] {
    const counts = recipes.map(r => r.ingredients.length);
    counts.sort((a, b) => a - b);

    const mean = counts.reduce((sum, c) => sum + c, 0) / counts.length;
    const median = counts[Math.floor(counts.length / 2)];

    return {
      mean: Math.round(mean * 10) / 10,
      median,
      min: counts[0],
      max: counts[counts.length - 1],
    };
  }

  private extractCategoryPairs(recipes: LabeledRecipe[]): RecipePriors['categoryPairs'][string] {
    const proteinWithFat = new Map<string, Set<string>>();
    const proteinWithVeg = new Map<string, Set<string>>();

    for (const recipe of recipes) {
      const ingredients = recipe.ingredients.map(i => i.canonicalId);

      // Simplified categorization (would use actual category data)
      const proteins = ingredients.filter(i => this.isProtein(i));
      const fats = ingredients.filter(i => this.isFat(i));
      const vegs = ingredients.filter(i => this.isVegetable(i));

      for (const protein of proteins) {
        // Track protein-fat pairs
        for (const fat of fats) {
          if (!proteinWithFat.has(protein)) {
            proteinWithFat.set(protein, new Set());
          }
          proteinWithFat.get(protein)!.add(fat);
        }

        // Track protein-veg pairs
        for (const veg of vegs) {
          if (!proteinWithVeg.has(protein)) {
            proteinWithVeg.set(protein, new Set());
          }
          proteinWithVeg.get(protein)!.add(veg);
        }
      }
    }

    // Convert to object
    const proteinWithFatObj: Record<string, string[]> = {};
    for (const [protein, fats] of proteinWithFat.entries()) {
      proteinWithFatObj[protein] = Array.from(fats);
    }

    const proteinWithVegObj: Record<string, string[]> = {};
    for (const [protein, vegs] of proteinWithVeg.entries()) {
      proteinWithVegObj[protein] = Array.from(vegs);
    }

    return {
      proteinWithFat: proteinWithFatObj,
      proteinWithVeg: proteinWithVegObj,
    };
  }

  private isProtein(ingredient: string): boolean {
    const proteinKeywords = ['chicken', 'beef', 'turkey', 'fish', 'salmon', 'tuna', 'liver', 'heart', 'egg'];
    return proteinKeywords.some(kw => ingredient.toLowerCase().includes(kw));
  }

  private isFat(ingredient: string): boolean {
    const fatKeywords = ['oil', 'fat', 'butter'];
    return fatKeywords.some(kw => ingredient.toLowerCase().includes(kw));
  }

  private isVegetable(ingredient: string): boolean {
    const vegKeywords = ['carrot', 'spinach', 'broccoli', 'pea', 'sweet_potato', 'pumpkin', 'kale'];
    return vegKeywords.some(kw => ingredient.toLowerCase().includes(kw));
  }

  private printSummary(priors: RecipePriors): void {
    console.log('\n📈 Pattern Summary:');
    
    for (const [species, data] of Object.entries(priors.coOccurrence)) {
      const pairCount = Object.keys(data.pairs).length;
      const tripleCount = Object.keys(data.triples).length;
      console.log(`   ${species}: ${pairCount} ingredient pairs, ${tripleCount} triples`);
    }

    console.log('\n📊 Ingredient Count Ranges:');
    for (const [species, counts] of Object.entries(priors.ingredientCounts)) {
      console.log(`   ${species}: ${counts.min}-${counts.max} (median: ${counts.median})`);
    }
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: ts-node extract-patterns.ts <input-file> <output-file>');
    console.error('Example: ts-node extract-patterns.ts ./output/labeled-recipes.json ../../lib/data/recipePriors.json');
    process.exit(1);
  }

  const [inputPath, outputPath] = args;
  const extractor = new PatternExtractor();
  
  await extractor.extractPatterns(inputPath, outputPath);
}

// Run if executed directly
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});

