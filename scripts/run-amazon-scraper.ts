// scripts/run-amazon-scraper.ts
// Amazon scraper runner for product discovery

import fs from 'fs';
import path from 'path';

interface AmazonProduct {
  name: string;
  url: string;
  price: number;
  rating: number;
  reviewCount: number;
  imageUrl?: string;
  asin?: string;
}

interface ScrapedResults {
  [ingredient: string]: AmazonProduct[];
}

class AmazonProductDiscovery {
  private resultsDir: string;
  private partialResultsPath: string;
  
  constructor() {
    this.resultsDir = path.join(__dirname, '../pet-ingredient-scraper/results');
    this.partialResultsPath = path.join(this.resultsDir, 'amazon-partial.json');
    
    // Ensure results directory exists
    if (!fs.existsSync(this.resultsDir)) {
      fs.mkdirSync(this.resultsDir, { recursive: true });
    }
  }
  
  async searchProductsForIngredient(ingredient: string): Promise<AmazonProduct[]> {
    console.log(`\n🔍 Searching Amazon for: ${ingredient}`);
    
    try {
      // Use compiled JavaScript files from dist (use file:// protocol for Windows)
      const scraperDir = path.join(__dirname, '../pet-ingredient-scraper');
      const distPath = path.resolve(scraperDir, 'dist/scrapers/AmazonScraper.js');
      
      // Import AmazonScraper from compiled dist
      const scraperModule = await import(`file://${distPath.replace(/\\/g, '/')}`);
      const AmazonScraper = scraperModule.AmazonScraper;
      const scraper = new AmazonScraper({ headless: true });
      
      // Try multiple search queries
      const searchQueries = [
        `${ingredient} for dogs`,
        `${ingredient} pet food`,
        `${ingredient} freeze dried dog`
      ];
      
      const allProducts: AmazonProduct[] = [];
      
      for (const query of searchQueries) {
        try {
          console.log(`  Searching: "${query}"`);
          const products = await scraper.search(query);
          
          // Filter and score products
          const scoredProducts = products
            .map((product: any) => ({
              ...product,
              score: this.calculateProductScore(product, ingredient)
            }))
            .filter((product: any) => product.score >= 0.5) // Minimum threshold
            .sort((a: any, b: any) => (b.score || 0) - (a.score || 0));
          
          allProducts.push(...scoredProducts);
          
          // Avoid rate limiting
          await this.delay(3000);
          
        } catch (error) {
          console.error(`  Error searching "${query}":`, error);
        }
      }
      
      // Close scraper
      await scraper.close();
      
      // Deduplicate by URL
      const uniqueProducts = this.deduplicateProducts(allProducts);
      
      // Extract ASIN from URL if possible
      uniqueProducts.forEach(product => {
        const asinMatch = product.url.match(/\/dp\/([A-Z0-9]{10})/);
        if (asinMatch) {
          product.asin = asinMatch[1];
        }
      });
      
      console.log(`  ✅ Found ${uniqueProducts.length} products`);
      
      return uniqueProducts.slice(0, 10); // Top 10
      
    } catch (error) {
      console.error(`❌ Failed to scrape ${ingredient}:`, error);
      return [];
    }
  }
  
  private calculateProductScore(product: AmazonProduct, targetIngredient: string): number {
    let score = 0;
    
    const title = product.name.toLowerCase();
    const ingredient = targetIngredient.toLowerCase();
    
    // Title relevance (40%)
    if (title.includes(ingredient)) {
      score += 0.4;
    } else {
      // Fuzzy match
      const ingredientWords = ingredient.split(' ');
      const matchCount = ingredientWords.filter(word => 
        word.length > 3 && title.includes(word)
      ).length;
      if (matchCount > 0) {
        score += (matchCount / ingredientWords.length) * 0.3;
      }
    }
    
    // Rating (30%)
    if (product.rating >= 4.5) score += 0.3;
    else if (product.rating >= 4.0) score += 0.2;
    else if (product.rating >= 3.5) score += 0.1;
    
    // Reviews (20%)
    if (product.reviewCount >= 1000) score += 0.2;
    else if (product.reviewCount >= 500) score += 0.15;
    else if (product.reviewCount >= 100) score += 0.1;
    else if (product.reviewCount >= 50) score += 0.05;
    
    // Pet-specific (10%)
    if (title.includes('dog') || title.includes('pet') || title.includes('puppy') || title.includes('canine')) {
      score += 0.1;
    }
    
    // Penalties
    if (title.includes('toy') || title.includes('accessory') || title.includes('bed') || title.includes('collar')) {
      score -= 0.3; // Not food
    }
    
    return Math.max(0, Math.min(1, score));
  }
  
  private deduplicateProducts(products: AmazonProduct[]): AmazonProduct[] {
    const seen = new Set<string>();
    return products.filter(product => {
      const key = product.url || product.name;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  savePartialResults(results: ScrapedResults) {
    fs.writeFileSync(
      this.partialResultsPath,
      JSON.stringify(results, null, 2)
    );
  }
  
  analyzeAndVetProducts(results: ScrapedResults): any[] {
    const vettedProducts: any[] = [];
    
    Object.entries(results).forEach(([ingredient, products]) => {
      if (products.length === 0) return;
      
      // Get best product
      const bestProduct = products
        .sort((a, b) => ((b as any).score || 0) - ((a as any).score || 0))[0];
      
      if ((bestProduct as any).score >= 0.7) {
        vettedProducts.push({
          ingredient,
          productName: bestProduct.name,
          asin: bestProduct.asin,
          amazonLink: bestProduct.url,
          price: bestProduct.price,
          rating: bestProduct.rating,
          reviewCount: bestProduct.reviewCount,
          score: (bestProduct as any).score,
          confidence: (bestProduct as any).score,
          source: 'amazon_scraper',
          lastUpdated: new Date().toISOString()
        });
      }
    });
    
    return vettedProducts;
  }
}

async function main() {
  // Load ingredients needing vetting
  const ingredientsPath = path.join(__dirname, '../data/ingredients-needing-vetting.json');
  
  if (!fs.existsSync(ingredientsPath)) {
    console.error('❌ ingredients-needing-vetting.json not found. Run vet:recipes first.');
    process.exit(1);
  }
  
  const allIngredients = JSON.parse(fs.readFileSync(ingredientsPath, 'utf-8'));
  
  // Process ALL ingredients - prioritize organs/oils/supplements first, then rest
  const allIngredientNames = allIngredients.map((item: any) => item.name);
  
  // Separate priority and regular ingredients
  const priorityIngredients = allIngredientNames.filter((name: string) => {
    const normalized = name.toLowerCase();
    return normalized.includes('heart') || 
           normalized.includes('liver') || 
           normalized.includes('organ') ||
           normalized.includes('oil') ||
           normalized.includes('supplement') ||
           normalized.includes('powder') ||
           normalized.includes('kelp');
  });
  
  const regularIngredients = allIngredientNames.filter((name: string) => {
    const normalized = name.toLowerCase();
    return !normalized.includes('heart') && 
           !normalized.includes('liver') && 
           !normalized.includes('organ') &&
           !normalized.includes('oil') &&
           !normalized.includes('supplement') &&
           !normalized.includes('powder') &&
           !normalized.includes('kelp');
  });
  
  // Process priority first, then regular
  const ingredientsToProcess = [...priorityIngredients, ...regularIngredients];
  
  console.log(`🚀 Running Amazon scraper for ${ingredientsToProcess.length} ingredients...\n`);
  console.log(`   Priority (organs/oils/supplements): ${priorityIngredients.length}`);
  console.log(`   Regular ingredients: ${regularIngredients.length}\n`);
  
  const discoverer = new AmazonProductDiscovery();
  const results: ScrapedResults = {};
  
  for (let i = 0; i < ingredientsToProcess.length; i++) {
    const ingredient = ingredientsToProcess[i];
    console.log(`[${i + 1}/${priorityIngredients.length}] Processing: ${ingredient}`);
    
    const products = await discoverer.searchProductsForIngredient(ingredient);
    results[ingredient] = products;
    
    // Save partial results after each ingredient
    discoverer.savePartialResults(results);
    
    // Delay between ingredients to avoid rate limiting
    if (i < ingredientsToProcess.length - 1) {
      const delayTime = i < priorityIngredients.length ? 5000 : 3000; // Longer delay for priority
      console.log(`  ⏳ Waiting ${delayTime/1000} seconds before next ingredient...\n`);
      await new Promise(resolve => setTimeout(resolve, delayTime));
    }
  }
  
  // Save full results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fullResultsPath = path.join(__dirname, '../pet-ingredient-scraper/results', `amazon-products-${timestamp}.json`);
  fs.writeFileSync(fullResultsPath, JSON.stringify(results, null, 2));
  console.log(`\n✅ Full results saved to: amazon-products-${timestamp}.json`);
  
  // Analyze and create vetted products
  const vettedProducts = discoverer.analyzeAndVetProducts(results);
  
  console.log('\n=== AMAZON SCRAPING RESULTS ===');
  console.log(`Ingredients processed: ${Object.keys(results).length}`);
  console.log(`Total products found: ${Object.values(results).flat().length}`);
  console.log(`High-quality products (≥70% score): ${vettedProducts.length}`);
  
  // Save vetted products
  const vettedPath = path.join(__dirname, '../data/amazon-vetted-products.json');
  fs.writeFileSync(vettedPath, JSON.stringify(vettedProducts, null, 2));
  console.log(`✅ Vetted products saved to: data/amazon-vetted-products.json`);
  
  // Generate update script
  generateAmazonUpdateScript(vettedProducts);
}

function generateAmazonUpdateScript(products: any[]) {
  let script = '// AMAZON-DISCOVERED VETTED PRODUCTS\n';
  script += '// Review these products and add to lib/data/vetted-products.ts\n\n';
  script += 'const amazonVettedProducts = {\n';
  
  products.forEach(product => {
    const key = product.ingredient.toLowerCase().replace(/\s+/g, '_').replace(/[()]/g, '');
    script += `  '${key}': {\n`;
    script += `    productName: '${product.productName.replace(/'/g, "\\'")}',\n`;
    if (product.asin) {
      script += `    amazonLink: 'https://www.amazon.com/dp/${product.asin}?tag=robinfrench-20',\n`;
    } else {
      script += `    amazonLink: '${product.amazonLink}',\n`;
    }
    script += `    vetNote: 'Amazon-discovered product. Rating: ${product.rating}⭐ (${product.reviewCount} reviews). Score: ${(product.score * 100).toFixed(0)}%.',\n`;
    script += `    category: 'auto_detected',\n`;
    script += `    confidence: ${product.confidence.toFixed(2)},\n`;
    script += `    source: 'amazon_scraper',\n`;
    script += `    lastUpdated: '${product.lastUpdated}'\n`;
    script += `  },\n`;
  });
  
  script += '};\n';
  
  const scriptPath = path.join(__dirname, '../data/amazon-vetted-script.ts');
  fs.writeFileSync(scriptPath, script);
  console.log(`✅ Update script generated: data/amazon-vetted-script.ts`);
  console.log(`\n📝 Review the script and merge high-confidence products into vetted-products.ts`);
}

main().catch(console.error);

