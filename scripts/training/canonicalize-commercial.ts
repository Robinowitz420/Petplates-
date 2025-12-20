/**
 * COMMERCIAL PRODUCT CANONICALIZER
 * Maps commercial ingredient fragments to unified ingredient registry
 * Aggressive cleaning for ingredient panel text
 */

import * as fs from 'fs/promises';
import { getIngredientByName } from '../../lib/data/unifiedIngredientRegistry';

interface CommercialProduct {
  source: string;
  sourceUrl: string;
  brand: string;
  productName: string;
  speciesHint: string[];
  productType: string;
  ingredientsRaw: string | string[];
  ingredientsList: Array<{ name: string; position: number }>;
  scrapedAt: string;
  barcode?: string;
}

interface CanonicalizedProduct extends CommercialProduct {
  ingredients: Array<{
    canonicalId: string;
    originalName: string;
    position: number;
    confidence: number;
  }>;
  unmappedIngredients: string[];
  mappingSuccessRate: number;
}

class CommercialCanonicalizer {
  private alias: Record<string, string> = {
    // Meat/Protein variations (English)
    'chicken meal': 'chicken',
    'chicken by-product meal': 'chicken',
    'chicken fat': 'chicken_fat',
    'poultry fat': 'chicken_fat',
    'poultry meal': 'chicken',
    'turkey meal': 'turkey',
    'beef meal': 'beef',
    'lamb meal': 'lamb',
    'fish meal': 'fish',
    'salmon meal': 'salmon',
    'ocean fish': 'fish',
    'whitefish': 'fish',
    'menhaden fish meal': 'fish',
    'meat and animal by-products': 'meat',
    'animal by-products': 'meat',
    
    // Meat/Protein (French)
    'viandes': 'meat',
    'viande': 'meat',
    'poulet': 'chicken',
    'boeuf': 'beef',
    'agneau': 'lamb',
    'canard': 'duck',
    'poisson': 'fish',
    'saumon': 'salmon',
    'viandes déshydratées': 'meat',
    'graisse de canard': 'duck_fat',
    'sous-produits animaux': 'meat',
    'viandes et sous-produits animaux': 'meat',
    
    // Meat/Protein (Italian)
    'carni': 'meat',
    'carne': 'meat',
    'pollo': 'chicken',
    'manzo': 'beef',
    'agnello': 'lamb',
    'pesce': 'fish',
    'carni e derivati': 'meat',
    
    // Meat/Protein (German)
    'fleisch': 'meat',
    'huhn': 'chicken',
    'rind': 'beef',
    'lamm': 'lamb',
    'fisch': 'fish',
    
    // Grains (English)
    'corn meal': 'corn',
    'ground corn': 'corn',
    'whole grain corn': 'corn',
    'brewers rice': 'rice',
    'ground rice': 'rice',
    'rice flour': 'rice',
    'oat groats': 'oats',
    'ground oats': 'oats',
    'wheat flour': 'wheat',
    'whole wheat': 'wheat',
    
    // Grains (French)
    'céréales': 'grain',
    'blé': 'wheat',
    'maïs': 'corn',
    'riz': 'rice',
    'avoine': 'oats',
    'gluten de maïs': 'corn',
    
    // Grains (Italian)
    'cereali': 'grain',
    'grano': 'wheat',
    'mais': 'corn',
    'riso': 'rice',
    
    // Grains (German)
    'getreide': 'grain',
    'weizen': 'wheat',
    'reis': 'rice',
    'hafer': 'oats',
    
    // Vegetables (French)
    'légumes': 'vegetable',
    'carottes': 'carrot',
    'petits pois': 'peas',
    'pommes de terre': 'potato',
    'patates douces': 'sweet_potato',
    'pulpe de betterave': 'beet',
    'sous-produits d\'origine végétale': 'vegetable',
    
    // Vegetables (Italian)
    'verdure': 'vegetable',
    'carote': 'carrot',
    'piselli': 'peas',
    'patate': 'potato',
    'sottoprodotti di origine vegetale': 'vegetable',
    
    // Vegetables (German)
    'gemüse': 'vegetable',
    'karotten': 'carrot',
    'erbsen': 'peas',
    'kartoffeln': 'potato',
    
    // Fats/Oils (English)
    'fish oil': 'fish_oil',
    'salmon oil': 'salmon_oil',
    'vegetable oil': 'vegetable_oil',
    'sunflower oil': 'sunflower_oil',
    'canola oil': 'canola_oil',
    'soybean oil': 'soybean_oil',
    
    // Fats/Oils (French)
    'huiles': 'oil',
    'huile': 'oil',
    'graisses': 'fat',
    'graisse': 'fat',
    'huile de poisson': 'fish_oil',
    'huile de tournesol': 'sunflower_oil',
    'oli e grassi': 'oil',
    
    // Fats/Oils (Italian)
    'oli': 'oil',
    'olio': 'oil',
    'grassi': 'fat',
    'grasso': 'fat',
    
    // Other (French)
    'poudre d\'oeuf': 'egg',
    'oeuf': 'egg',
    'levures': 'yeast',
    'substances minérales': 'minerals',
    
    // Other (Italian)
    'uova': 'egg',
    'lievito': 'yeast',
    'sostanze minerali': 'minerals',
    
    // Vegetable variations (English)
    'dried carrots': 'carrot',
    'dehydrated carrots': 'carrot',
    'carrot pomace': 'carrot',
    'pea protein': 'peas',
    'dried peas': 'peas',
    'sweet potato': 'sweet_potato',
    'dried sweet potato': 'sweet_potato',
    
    // Common additives to ignore
    'water': 'water',
    'natural flavors': 'natural_flavors',
    'artificial flavors': 'artificial_flavors',
    'vitamins': 'vitamins',
    'minerals': 'minerals',
    'preservatives': 'preservatives',
  };

  // Ingredients to ignore (not counted for pairing)
  private ignoreList = new Set([
    'water',
    'natural_flavors',
    'artificial_flavors',
    'vitamins',
    'minerals',
    'preservatives',
    'salt',
    'calcium carbonate',
    'dicalcium phosphate',
    'potassium chloride',
    'choline chloride',
    'taurine',
    'dl-methionine',
    'l-lysine',
    'vitamin e supplement',
    'vitamin a supplement',
    'vitamin d3 supplement',
    'vitamin b12 supplement',
    'riboflavin supplement',
    'niacin supplement',
    'thiamine mononitrate',
    'pyridoxine hydrochloride',
    'folic acid',
    'biotin',
    'zinc sulfate',
    'ferrous sulfate',
    'copper sulfate',
    'manganese sulfate',
    'sodium selenite',
    'calcium iodate',
  ]);

  async canonicalize(inputPath: string, outputDir: string): Promise<void> {
    console.log(`\n📊 Canonicalizing commercial products from: ${inputPath}`);
    
    const fileContent = await fs.readFile(inputPath, 'utf-8');
    const products: CommercialProduct[] = JSON.parse(fileContent);
    console.log(`   Found ${products.length} products`);

    const canonicalized: CanonicalizedProduct[] = [];
    const canonicalizedAll: CanonicalizedProduct[] = [];
    const unmappedSet = new Set<string>();

    for (const product of products) {
      const result = this.canonicalizeProduct(product);
      
      canonicalizedAll.push(result);
      
      // Only include products with >= 50% mapping success
      if (result.mappingSuccessRate >= 0.50) {
        canonicalized.push(result);
      }
      
      // Track unmapped ingredients
      result.unmappedIngredients.forEach(ing => unmappedSet.add(ing));
    }

    console.log(`   ✅ Canonicalized ${canonicalized.length}/${products.length} products (>= 50% mapping)`);
    console.log(`   📝 Found ${unmappedSet.size} unique unmapped ingredients`);

    // Save outputs
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    await fs.writeFile(
      `${outputDir}/canonical-commercial-${timestamp}.json`,
      JSON.stringify(canonicalized, null, 2),
      'utf-8'
    );
    await fs.writeFile(
      `${outputDir}/canonical-commercial-all-${timestamp}.json`,
      JSON.stringify(canonicalizedAll, null, 2),
      'utf-8'
    );
    await fs.writeFile(
      `${outputDir}/unmapped-commercial-${timestamp}.json`,
      JSON.stringify(Array.from(unmappedSet).sort(), null, 2),
      'utf-8'
    );

    console.log(`\n💾 Saved outputs to ${outputDir}/`);
    this.printSummary(canonicalized, unmappedSet);
  }

  private canonicalizeProduct(product: CommercialProduct): CanonicalizedProduct {
    const ingredients: CanonicalizedProduct['ingredients'] = [];
    const unmappedIngredients: string[] = [];

    for (const item of product.ingredientsList) {
      const normalized = this.normalizeIngredientName(item.name);
      
      if (this.ignoreList.has(normalized.toLowerCase())) {
        // Skip ignored ingredients (vitamins, minerals, etc.)
        continue;
      }

      const canonical = getIngredientByName(normalized);
      
      if (canonical) {
        ingredients.push({
          canonicalId: canonical.id,
          originalName: item.name,
          position: item.position,
          confidence: 0.8, // High confidence for registry matches
        });
      } else {
        unmappedIngredients.push(item.name);
      }
    }

    const totalIngredients = product.ingredientsList.length;
    const mappedCount = ingredients.length;
    const mappingSuccessRate = totalIngredients > 0 ? mappedCount / totalIngredients : 0;

    return {
      ...product,
      ingredients,
      unmappedIngredients,
      mappingSuccessRate: Math.round(mappingSuccessRate * 100) / 100,
    };
  }

  private normalizeIngredientName(name: string): string {
    let normalized = name.toLowerCase().trim();

    // Check alias map first
    if (this.alias[normalized]) {
      return this.alias[normalized];
    }

    // Aggressive cleaning for ingredient fragments
    
    // Remove preparation methods
    normalized = normalized.replace(/\b(minced|chopped|diced|ground|dehydrated|dried|cooked|raw|fresh|frozen)\b/g, '');
    
    // Remove forms
    normalized = normalized.replace(/\b(meal|powder|extract|concentrate|flavoring|flavor|oil|fat)\b/g, '');
    
    // Remove "and derivatives"
    normalized = normalized.replace(/\band derivatives\b/g, '');
    
    // Remove parenthetical content
    normalized = normalized.replace(/\([^)]*\)/g, '');
    
    // Remove extra whitespace
    normalized = normalized.replace(/\s+/g, ' ').trim();

    // Handle common patterns
    if (normalized.includes('chicken')) return 'chicken';
    if (normalized.includes('turkey')) return 'turkey';
    if (normalized.includes('beef')) return 'beef';
    if (normalized.includes('lamb')) return 'lamb';
    if (normalized.includes('salmon')) return 'salmon';
    if (normalized.includes('fish')) return 'fish';
    if (normalized.includes('rice')) return 'rice';
    if (normalized.includes('corn')) return 'corn';
    if (normalized.includes('wheat')) return 'wheat';
    if (normalized.includes('oat')) return 'oats';
    if (normalized.includes('carrot')) return 'carrot';
    if (normalized.includes('pea')) return 'peas';
    if (normalized.includes('sweet potato')) return 'sweet_potato';
    if (normalized.includes('potato')) return 'potato';
    if (normalized.includes('spinach')) return 'spinach';
    if (normalized.includes('broccoli')) return 'broccoli';

    return normalized;
  }

  private printSummary(products: CanonicalizedProduct[], unmappedSet: Set<string>): void {
    console.log('\n📈 Canonicalization Summary:');
    
    // By species
    const bySpecies = products.reduce((acc, p) => {
      const species = p.speciesHint[0] || 'unknown';
      acc[species] = (acc[species] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('\n   Products by species:');
    for (const [species, count] of Object.entries(bySpecies)) {
      console.log(`   ${species}: ${count}`);
    }

    // Mapping success rate
    const avgMappingRate = products.reduce((sum, p) => sum + p.mappingSuccessRate, 0) / products.length;
    console.log(`\n   Average mapping success rate: ${(avgMappingRate * 100).toFixed(1)}%`);

    // Top unmapped ingredients
    console.log(`\n   Top 20 unmapped ingredients:`);
    const unmappedArray = Array.from(unmappedSet).slice(0, 20);
    unmappedArray.forEach(ing => console.log(`   - ${ing}`));
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Usage: tsx canonicalize-commercial.ts <input-file> [output-dir]');
    console.error('Example: tsx canonicalize-commercial.ts ./output/commercial-products-2025-12-19.json ./output');
    process.exit(1);
  }

  const inputPath = args[0];
  const outputDir = args[1] || './output';
  
  const canonicalizer = new CommercialCanonicalizer();
  await canonicalizer.canonicalize(inputPath, outputDir);
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
