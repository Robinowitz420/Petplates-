/**
 * COMMERCIAL PATTERN EXTRACTOR
 * Computes statistical priors from commercial pet food ingredient panels
 * Uses PMI for pair scoring and detects rare/never-seen pairs
 */

import * as fs from 'fs/promises';

interface CanonicalizedProduct {
  source: string;
  brand: string;
  productName: string;
  speciesHint: string[];
  productType: string;
  ingredients: Array<{
    canonicalId: string;
    originalName: string;
    position: number;
    confidence: number;
  }>;
  mappingSuccessRate: number;
}

interface CommercialPriors {
  version: string;
  generatedAt: string;
  metadata: {
    numProductsUsed: number;
    bySource: Record<string, number>;
    bySpecies: Record<string, number>;
    lastUpdated: string;
  };
  
  // Per species (and optionally per type)
  commercial: {
    [speciesKey: string]: {
      coOccurrencePairs: Record<string, number>;
      coOccurrenceTriples: Record<string, number>;
      ingredientFrequency: Record<string, number>;
      pairPMI: Record<string, number>;
      rarePairs: Record<string, number>; // Negative PMI pairs
      categoryRatios: {
        protein: { min: number; max: number; median: number };
        vegetable: { min: number; max: number; median: number };
        fat: { min: number; max: number; median: number };
        carbohydrate: { min: number; max: number; median: number };
      };
      ingredientCount: { min: number; max: number; median: number };
    };
  };
}

class CommercialPatternExtractor {
  private readonly SMOOTHING = 0.5;
  private readonly RARE_PAIR_THRESHOLD = -1.0; // PMI threshold for "rare" pairs

  async extractPatterns(inputPath: string, outputPath: string): Promise<void> {
    console.log(`\n📊 Extracting commercial patterns from: ${inputPath}`);
    
    const fileContent = await fs.readFile(inputPath, 'utf-8');
    const products: CanonicalizedProduct[] = JSON.parse(fileContent);
    console.log(`   Found ${products.length} canonicalized products`);

    // Group by species
    const bySpecies = this.groupBySpecies(products);

    const priors: CommercialPriors = {
      version: '2.0.0',
      generatedAt: new Date().toISOString(),
      metadata: {
        numProductsUsed: products.length,
        bySource: this.countByField(products, 'source'),
        bySpecies: this.countByField(products, p => p.speciesHint[0] || 'unknown'),
        lastUpdated: new Date().toISOString(),
      },
      commercial: {},
    };

    // Extract patterns for each species
    for (const [species, speciesProducts] of Object.entries(bySpecies)) {
      console.log(`\n   Processing ${species} (${speciesProducts.length} products)...`);
      priors.commercial[species] = this.extractSpeciesPatterns(speciesProducts);
    }

    // Merge with existing recipePriors.json if it exists
    await this.mergeWithExistingPriors(priors, outputPath);

    console.log(`\n✅ Pattern extraction complete!`);
    this.printSummary(priors);
  }

  private groupBySpecies(products: CanonicalizedProduct[]): Record<string, CanonicalizedProduct[]> {
    const grouped: Record<string, CanonicalizedProduct[]> = {};
    
    for (const product of products) {
      const species = product.speciesHint[0] || 'unknown';
      if (!grouped[species]) {
        grouped[species] = [];
      }
      grouped[species].push(product);
    }
    
    return grouped;
  }

  private extractSpeciesPatterns(products: CanonicalizedProduct[]): CommercialPriors['commercial'][string] {
    const pairs = new Map<string, number>();
    const triples = new Map<string, number>();
    const ingredientFreq = new Map<string, number>();
    const totalProducts = products.length;

    // Count ingredient frequencies and pairs
    for (const product of products) {
      const ingredients = product.ingredients
        .sort((a, b) => a.position - b.position)
        .map(i => i.canonicalId);
      
      const uniqueIngredients = new Set(ingredients);

      // Count individual ingredients
      for (const ing of uniqueIngredients) {
        ingredientFreq.set(ing, (ingredientFreq.get(ing) || 0) + 1);
      }

      // Count pairs (sliding window)
      for (let i = 0; i < ingredients.length; i++) {
        for (let j = i + 1; j < ingredients.length; j++) {
          const pair = [ingredients[i], ingredients[j]].sort().join('|');
          pairs.set(pair, (pairs.get(pair) || 0) + 1);
        }
      }

      // Count triples (sliding window)
      for (let i = 0; i < ingredients.length; i++) {
        for (let j = i + 1; j < ingredients.length; j++) {
          for (let k = j + 1; k < ingredients.length; k++) {
            const triple = [ingredients[i], ingredients[j], ingredients[k]].sort().join('|');
            triples.set(triple, (triples.get(triple) || 0) + 1);
          }
        }
      }
    }

    // Compute PMI scores
    const pairPMI: Record<string, number> = {};
    const rarePairs: Record<string, number> = {};

    for (const [pair, pairCount] of pairs.entries()) {
      const [ing1, ing2] = pair.split('|');
      const count1 = ingredientFreq.get(ing1) || 0;
      const count2 = ingredientFreq.get(ing2) || 0;

      // Smoothed PMI
      const pXY = (pairCount + this.SMOOTHING) / (totalProducts + this.SMOOTHING);
      const pX = (count1 + this.SMOOTHING) / (totalProducts + this.SMOOTHING);
      const pY = (count2 + this.SMOOTHING) / (totalProducts + this.SMOOTHING);
      const pmi = Math.log2(pXY / (pX * pY));

      if (pmi > 0 && pairCount >= 2) {
        pairPMI[pair] = Math.round(pmi * 100) / 100;
      }

      // Rare pairs (negative PMI)
      if (pmi < this.RARE_PAIR_THRESHOLD && count1 >= 5 && count2 >= 5) {
        rarePairs[pair] = Math.round(pmi * 100) / 100;
      }
    }

    // Detect never-seen pairs (common ingredients that never co-occur)
    const commonIngredients = Array.from(ingredientFreq.entries())
      .filter(([_, count]) => count >= 5)
      .map(([ing, _]) => ing);

    for (let i = 0; i < commonIngredients.length; i++) {
      for (let j = i + 1; j < commonIngredients.length; j++) {
        const pair = [commonIngredients[i], commonIngredients[j]].sort().join('|');
        
        if (!pairs.has(pair)) {
          // Both common, but never paired
          const count1 = ingredientFreq.get(commonIngredients[i])!;
          const count2 = ingredientFreq.get(commonIngredients[j])!;
          const pX = (count1 + this.SMOOTHING) / (totalProducts + this.SMOOTHING);
          const pY = (count2 + this.SMOOTHING) / (totalProducts + this.SMOOTHING);
          const pXY = this.SMOOTHING / (totalProducts + this.SMOOTHING);
          const pmi = Math.log2(pXY / (pX * pY));
          
          if (pmi < -1.5) { // Strong negative association
            rarePairs[pair] = Math.round(pmi * 100) / 100;
          }
        }
      }
    }

    // Convert to objects
    const coOccurrencePairs: Record<string, number> = {};
    for (const [pair, count] of pairs.entries()) {
      if (count >= 2) {
        coOccurrencePairs[pair] = count;
      }
    }

    const coOccurrenceTriples: Record<string, number> = {};
    for (const [triple, count] of triples.entries()) {
      if (count >= 2) {
        coOccurrenceTriples[triple] = count;
      }
    }

    const ingredientFrequency: Record<string, number> = {};
    for (const [ing, count] of ingredientFreq.entries()) {
      ingredientFrequency[ing] = count;
    }

    // Compute ingredient count stats
    const ingredientCounts = products.map(p => p.ingredients.length);
    ingredientCounts.sort((a, b) => a - b);

    return {
      coOccurrencePairs,
      coOccurrenceTriples,
      ingredientFrequency,
      pairPMI,
      rarePairs,
      categoryRatios: {
        protein: { min: 0, max: 0, median: 0 }, // TODO: compute from categorized ingredients
        vegetable: { min: 0, max: 0, median: 0 },
        fat: { min: 0, max: 0, median: 0 },
        carbohydrate: { min: 0, max: 0, median: 0 },
      },
      ingredientCount: {
        min: ingredientCounts[0] || 0,
        max: ingredientCounts[ingredientCounts.length - 1] || 0,
        median: ingredientCounts[Math.floor(ingredientCounts.length / 2)] || 0,
      },
    };
  }

  private async mergeWithExistingPriors(newPriors: CommercialPriors, outputPath: string): Promise<void> {
    try {
      const existingContent = await fs.readFile(outputPath, 'utf-8');
      const existing = JSON.parse(existingContent);

      // Merge commercial priors into existing structure
      existing.commercial = newPriors.commercial;
      existing.commercialMetadata = newPriors.metadata;
      existing.version = newPriors.version;
      existing.generatedAt = newPriors.generatedAt;

      await fs.writeFile(outputPath, JSON.stringify(existing, null, 2), 'utf-8');
      console.log(`\n💾 Merged commercial priors into: ${outputPath}`);
    } catch (error) {
      // File doesn't exist, create new
      await fs.writeFile(outputPath, JSON.stringify(newPriors, null, 2), 'utf-8');
      console.log(`\n💾 Created new priors file: ${outputPath}`);
    }
  }

  private countByField(products: CanonicalizedProduct[], field: string | ((p: CanonicalizedProduct) => string)): Record<string, number> {
    const counts: Record<string, number> = {};
    
    for (const product of products) {
      const value = typeof field === 'function' ? field(product) : (product as any)[field];
      counts[value] = (counts[value] || 0) + 1;
    }
    
    return counts;
  }

  private printSummary(priors: CommercialPriors): void {
    console.log('\n📈 Commercial Pattern Summary:');
    console.log(`   Total products: ${priors.metadata.numProductsUsed}`);
    
    console.log('\n   By species:');
    for (const [species, count] of Object.entries(priors.metadata.bySpecies)) {
      const patterns = priors.commercial[species];
      const pairCount = Object.keys(patterns.coOccurrencePairs).length;
      const rarePairCount = Object.keys(patterns.rarePairs).length;
      console.log(`   ${species}: ${count} products, ${pairCount} pairs, ${rarePairCount} rare pairs`);
    }

    // Show top pairs for dogs (example)
    if (priors.commercial.dogs) {
      console.log('\n   Top 10 dog food pairs (by PMI):');
      const dogPairs = Object.entries(priors.commercial.dogs.pairPMI)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      
      for (const [pair, pmi] of dogPairs) {
        const count = priors.commercial.dogs.coOccurrencePairs[pair] || 0;
        console.log(`   ${pair.replace('|', ' + ')}: PMI=${pmi.toFixed(2)}, count=${count}`);
      }

      // Show rare pairs
      console.log('\n   Top 10 rare/never-seen dog pairs (negative PMI):');
      const rarePairs = Object.entries(priors.commercial.dogs.rarePairs)
        .sort((a, b) => a[1] - b[1])
        .slice(0, 10);
      
      for (const [pair, pmi] of rarePairs) {
        console.log(`   ${pair.replace('|', ' + ')}: PMI=${pmi.toFixed(2)} (RARE)`);
      }
    }
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: tsx extract-commercial-patterns.ts <input-file> <output-file>');
    console.error('Example: tsx extract-commercial-patterns.ts ./output/canonical-commercial-2025-12-19.json ../../lib/data/recipePriors.json');
    process.exit(1);
  }

  const [inputPath, outputPath] = args;
  const extractor = new CommercialPatternExtractor();
  
  await extractor.extractPatterns(inputPath, outputPath);
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
