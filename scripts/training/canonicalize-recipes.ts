/**
 * RECIPE CANONICALIZER
 * Maps scraped recipes to internal schema with canonical ingredient IDs
 * This is Step 1 of the training pipeline
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { getIngredientByName } from '../../lib/data/unifiedIngredientRegistry';

type ScrapedRecipe = {
  id: string;
  name: string;
  species: string[];
  ingredients: Array<{
    name: string;
    amount?: string;
    unit?: string;
  }>;
  instructions?: string[];
  warnings?: string[];
  sourceUrl: string;
  sourceName: string;
  sourceTier: string;
  scrapedAt: Date | string;
  tags?: string[];
}

type CanonicalizedRecipe = {
  id: string;
  name: string;
  species: string[];
  ingredients: Array<{
    canonicalId: string;
    originalName: string;
    amount?: string;
    unit?: string;
    gramsEstimate?: number;
  }>;
  unmappedIngredients: string[];
  mappingSuccessRate: number;
  instructions?: string[];
  warnings?: string[];
  sourceUrl: string;
  sourceName: string;
  sourceTier: string;
  scrapedAt: string;
  tags?: string[];
  flags: {
    isComplete: boolean;
    prepStyle?: 'cooked' | 'raw' | 'mixed' | 'unknown';
    mealType?: 'meal' | 'topper' | 'treat' | 'guide';
  };
}

export class RecipeCanonicalizer {
  private ingredientCache = new Map<string, string | null>();
  private unmappedCounts: Record<string, number> = {};

  // Alias layer for common ingredient name variations
  private alias: Record<string, string> = {
    // English variations
    'brown rice': 'brown_rice',
    'white rice': 'white_rice',
    'ground beef': 'beef_ground',
    'lean ground beef': 'beef_ground',
    'ground turkey': 'turkey_ground',
    'ground chicken': 'chicken_ground',
    'baby spinach': 'spinach',
    'sweet potatoes': 'sweet_potato',
    'sweet potato': 'sweet_potato',
    'eggs': 'egg_whole',
    'egg': 'egg_whole',
    'carrots': 'carrot',
    'zucchini': 'zucchini',
    'coconut oil': 'coconut_oil',
    'curly parsley': 'parsley',
    'parsley': 'parsley',
    'squash': 'butternut_squash',
    'butternut squash': 'butternut_squash',
    'pumpkin': 'pumpkin',
    'pumpkin puree': 'pumpkin',
    'broccoli': 'broccoli',
    'green beans': 'green_beans',
    'peas': 'peas',
    'kale': 'kale',
    'oats': 'oats',
    'rolled oats': 'oats',
    'quinoa': 'quinoa',
    'barley': 'barley',
    
    // German → English
    'karotte': 'carrot',
    'karotten': 'carrot',
    'möhre': 'carrot',
    'möhren': 'carrot',
    'reis': 'rice',
    'salat': 'lettuce',
    'apfel': 'apple',
    'äpfel': 'apple',
    'bananen': 'banana',
    'spinat': 'spinach',
    'brokkoli': 'broccoli',
    'kürbis': 'pumpkin',
    'gurke': 'cucumber',
    'tomaten': 'tomato',
    'paprika': 'bell_pepper',
    'ei': 'egg_whole',
    'eier': 'egg_whole',
    'huhn': 'chicken',
    'hähnchen': 'chicken',
    'rind': 'beef',
    'rindfleisch': 'beef',
    'pute': 'turkey',
    'fisch': 'fish',
    
    // French → English (banane, tomate shared with German/Spanish)
    'carotte': 'carrot',
    'carottes': 'carrot',
    'riz': 'rice',
    'salade': 'lettuce',
    'laitue': 'lettuce',
    'pomme': 'apple',
    'pommes': 'apple',
    'banane': 'banana',
    'épinard': 'spinach',
    'épinards': 'spinach',
    'brocoli': 'broccoli',
    'citrouille': 'pumpkin',
    'concombre': 'cucumber',
    'tomate': 'tomato',
    'poivron': 'bell_pepper',
    'oeuf': 'egg_whole',
    'oeufs': 'egg_whole',
    'poulet': 'chicken',
    'boeuf': 'beef',
    'dinde': 'turkey',
    'poisson': 'fish',
    
    // Spanish → English
    'zanahoria': 'carrot',
    'zanahorias': 'carrot',
    'arroz': 'rice',
    'lechuga': 'lettuce',
    'manzana': 'apple',
    'manzanas': 'apple',
    'plátano': 'banana',
    'plátanos': 'banana',
    'espinaca': 'spinach',
    'espinacas': 'spinach',
    'brócoli': 'broccoli',
    'calabaza': 'pumpkin',
    'pepino': 'cucumber',
    'tomates': 'tomato',
    'pimiento': 'bell_pepper',
    'huevo': 'egg_whole',
    'huevos': 'egg_whole',
    'pollo': 'chicken',
    'carne': 'beef',
    'res': 'beef',
    'pavo': 'turkey',
    'pescado': 'fish',
  };

  async canonicalizeRecipeFile(inputPath: string, outputPath: string): Promise<void> {
    console.log(`\n📖 Canonicalizing recipes from: ${inputPath}`);
    
    const data = await fs.readFile(inputPath, 'utf-8');
    const scrapedRecipes: ScrapedRecipe[] = JSON.parse(data);
    console.log(`   Found ${scrapedRecipes.length} scraped recipes`);

    const ACCEPT_THRESHOLD = 0.5;
    const canonicalized: CanonicalizedRecipe[] = [];
    const allCanonicalized: CanonicalizedRecipe[] = [];
    const stats = {
      total: scrapedRecipes.length,
      successful: 0,
      partiallyMapped: 0,
      failed: 0,
    };

    for (const recipe of scrapedRecipes) {
      const canonical = this.canonicalizeRecipe(recipe);
      allCanonicalized.push(canonical);
      
      if (canonical.mappingSuccessRate >= ACCEPT_THRESHOLD) {
        canonicalized.push(canonical);
        if (canonical.mappingSuccessRate >= 0.9) {
          stats.successful++;
        } else {
          stats.partiallyMapped++;
        }
      } else {
        stats.failed++;
      }
    }

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    
    // Write accepted recipes
    await fs.writeFile(outputPath, JSON.stringify(canonicalized, null, 2), 'utf-8');
    
    // Write all recipes for debugging
    const allPath = outputPath.replace(/\.json$/i, '-all.json');
    await fs.writeFile(allPath, JSON.stringify(allCanonicalized, null, 2), 'utf-8');
    
    // Write unmapped ingredients for iterative improvement
    const unmappedPath = path.join(path.dirname(outputPath), 'unmapped-ingredients.json');
    const sortedUnmapped = Object.entries(this.unmappedCounts)
      .sort((a, b) => b[1] - a[1])
      .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {});
    await fs.writeFile(unmappedPath, JSON.stringify(sortedUnmapped, null, 2), 'utf-8');

    console.log(`\n✅ Canonicalization complete!`);
    console.log(`   Total recipes: ${stats.total}`);
    console.log(`   Successfully mapped (>90%): ${stats.successful}`);
    console.log(`   Partially mapped (50-90%): ${stats.partiallyMapped}`);
    console.log(`   Failed (<50%): ${stats.failed}`);
    console.log(`   Output (accepted): ${outputPath}`);
    console.log(`   Output (all):      ${allPath}`);
    console.log(`   Unmapped list:     ${unmappedPath}`);
  }

  private canonicalizeRecipe(recipe: ScrapedRecipe): CanonicalizedRecipe {
    const canonicalIngredients: CanonicalizedRecipe['ingredients'] = [];
    const unmapped: string[] = [];

    for (const ing of recipe.ingredients) {
      const canonicalId = this.findCanonicalIngredient(ing.name);
      
      if (canonicalId) {
        canonicalIngredients.push({
          canonicalId,
          originalName: ing.name,
          amount: ing.amount,
          unit: ing.unit,
          gramsEstimate: this.estimateGrams(ing.amount, ing.unit),
        });
      } else {
        unmapped.push(ing.name);
        // Track unmapped ingredients for iterative improvement
        const normalized = this.normalizeIngredientName(ing.name) || ing.name.toLowerCase();
        this.unmappedCounts[normalized] = (this.unmappedCounts[normalized] || 0) + 1;
      }
    }

    const mappingSuccessRate = recipe.ingredients.length > 0
      ? canonicalIngredients.length / recipe.ingredients.length
      : 0;

    return {
      id: recipe.id,
      name: recipe.name,
      species: recipe.species,
      ingredients: canonicalIngredients,
      unmappedIngredients: unmapped,
      mappingSuccessRate,
      instructions: recipe.instructions,
      warnings: recipe.warnings,
      sourceUrl: recipe.sourceUrl,
      sourceName: recipe.sourceName,
      sourceTier: recipe.sourceTier,
      scrapedAt: typeof recipe.scrapedAt === 'string' ? recipe.scrapedAt : recipe.scrapedAt.toISOString(),
      tags: recipe.tags,
      flags: {
        isComplete: this.detectCompleteness(recipe),
        prepStyle: this.detectPrepStyle(recipe),
        mealType: this.detectMealType(recipe),
      },
    };
  }

  private findCanonicalIngredient(name: string): string | null {
    // Check cache first
    if (this.ingredientCache.has(name)) {
      return this.ingredientCache.get(name)!;
    }

    // Normalize the name
    const normalized = this.normalizeIngredientName(name);
    if (!normalized) {
      this.ingredientCache.set(name, null);
      return null;
    }

    // Check if it's a unit/measurement artifact
    const cleaned = normalized.trim().toLowerCase();
    if (cleaned.length <= 2 && ['g','kg','oz','lb','tsp','tbsp','cup','cups'].includes(cleaned)) {
      this.ingredientCache.set(name, null);
      return null;
    }

    // Try alias layer first
    const aliased = this.alias[normalized] ?? normalized;

    // Try exact match using the imported function
    let ingredient = getIngredientByName(aliased);
    if (ingredient) {
      this.ingredientCache.set(name, ingredient.id);
      return ingredient.id;
    }

    // Try common variations
    const variations = this.generateVariations(aliased);
    for (const variation of variations) {
      ingredient = getIngredientByName(variation);
      if (ingredient) {
        this.ingredientCache.set(name, ingredient.id);
        return ingredient.id;
      }
    }

    // Not found
    this.ingredientCache.set(name, null);
    return null;
  }

  private normalizeIngredientName(name: string): string {
    let s = name
      .toLowerCase()
      .replace(/\(.*?\)/g, ' ')          // remove parentheticals
      .replace(/[,\/]/g, ' ')
      .replace(/[^a-z0-9\s_-]/g, ' ')    // drop weird chars
      .replace(/\s+/g, ' ')
      .trim();

    // remove measurement/unit-only artifacts
    if (s.length <= 2 && ['g','kg','oz','lb','tsp','tbsp','cup','cups'].includes(s)) return '';

    // remove common "noise" tokens anywhere in the string
    const dropTokens = new Set([
      'fresh','frozen','dried','organic','free','range','grass','fed','lean',
      'cooked','raw','uncooked','boiled','baked','roasted','steamed','simmered',
      'chopped','diced','minced','sliced','shredded','grated','finely','coarsely',
      'drained','rinsed','boneless','skinless','skin-on','bone-in','skin','on',
      'small','medium','large','baby','whole','halved','quartered',
      'peeled','unpeeled','trimmed','cleaned','washed',
      'about','approximately','roughly',
      'or','to','taste','as','needed','optional'
    ]);

    const tokens = s.split(' ').filter(t => t && !dropTokens.has(t));
    s = tokens.join(' ').trim();

    // normalize common forms
    s = s
      .replace(/\s+/g, ' ')
      .trim();

    return s;
  }

  private generateVariations(name: string): string[] {
    const variations: string[] = [];

    // Singular/plural
    if (name.endsWith('s')) {
      variations.push(name.slice(0, -1));
    } else {
      variations.push(name + 's');
    }

    // Common synonyms
    const synonyms: Record<string, string[]> = {
      'chicken': ['chicken_breast', 'chicken_thigh'],
      'beef': ['beef_ground', 'beef_chuck'],
      'turkey': ['turkey_breast', 'turkey_ground'],
      'fish': ['salmon', 'tuna', 'cod'],
      'liver': ['chicken_liver', 'beef_liver'],
      'egg': ['eggs', 'egg_whole'],
      'rice': ['brown_rice', 'white_rice'],
      'sweet potato': ['sweet_potato', 'sweet_potatoes'],
      'carrot': ['carrots'],
      'pea': ['peas', 'green_peas'],
      'spinach': ['spinach_fresh'],
      'oil': ['olive_oil', 'coconut_oil', 'fish_oil'],
    };

    for (const [key, values] of Object.entries(synonyms)) {
      if (name.includes(key)) {
        variations.push(...values);
      }
    }

    // Underscore vs space
    variations.push(name.replace(/ /g, '_'));
    variations.push(name.replace(/_/g, ' '));

    return variations;
  }

  private estimateGrams(amount?: string, unit?: string): number | undefined {
    if (!amount || !unit) return undefined;

    const numMatch = amount.match(/[\d.]+/);
    if (!numMatch) return undefined;

    const num = parseFloat(numMatch[0]);

    // Common conversions to grams
    const conversions: Record<string, number> = {
      'g': 1,
      'gram': 1,
      'grams': 1,
      'kg': 1000,
      'oz': 28.35,
      'lb': 453.59,
      'lbs': 453.59,
      'pound': 453.59,
      'pounds': 453.59,
      'cup': 240,
      'cups': 240,
      'tbsp': 15,
      'tablespoon': 15,
      'tsp': 5,
      'teaspoon': 5,
    };

    const multiplier = conversions[unit.toLowerCase()];
    return multiplier ? num * multiplier : undefined;
  }

  private detectCompleteness(recipe: ScrapedRecipe): boolean {
    const text = [
      recipe.name,
      ...(recipe.instructions || []),
      ...(recipe.warnings || []),
    ].join(' ').toLowerCase();

    // Incomplete indicators
    const incompleteKeywords = [
      'topper', 'treat', 'snack', 'supplement', 'add to',
      'mix with', 'sprinkle', 'incomplete', 'not balanced',
      'consult vet', 'add calcium', 'needs supplements',
    ];

    return !incompleteKeywords.some(kw => text.includes(kw));
  }

  private detectPrepStyle(recipe: ScrapedRecipe): 'cooked' | 'raw' | 'mixed' | 'unknown' {
    const text = [
      recipe.name,
      ...(recipe.instructions || []),
    ].join(' ').toLowerCase();

    const cookedKeywords = ['cook', 'bake', 'boil', 'steam', 'roast', 'simmer'];
    const rawKeywords = ['raw', 'uncooked', 'fresh'];

    const hasCookedKeywords = cookedKeywords.some(kw => text.includes(kw));
    const hasRawKeywords = rawKeywords.some(kw => text.includes(kw));

    if (hasCookedKeywords && hasRawKeywords) return 'mixed';
    if (hasCookedKeywords) return 'cooked';
    if (hasRawKeywords) return 'raw';
    return 'unknown';
  }

  private detectMealType(recipe: ScrapedRecipe): 'meal' | 'topper' | 'treat' | 'guide' {
    const text = recipe.name.toLowerCase();

    if (text.includes('treat') || text.includes('snack')) return 'treat';
    if (text.includes('topper') || text.includes('mix-in')) return 'topper';
    if (text.includes('guide') || text.includes('feeding')) return 'guide';
    return 'meal';
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: ts-node canonicalize-recipes.ts <input-file> <output-file>');
    console.error('Example: ts-node canonicalize-recipes.ts ../../pet-recipe-scraper/output/blog-recipes-*.json ./output/canonical-recipes.json');
    process.exit(1);
  }

  const [inputPath, outputPath] = args;
  const canonicalizer = new RecipeCanonicalizer();
  
  await canonicalizer.canonicalizeRecipeFile(inputPath, outputPath);
}

// Run if executed directly
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
