/**
 * COMMERCIAL PET FOOD SCRAPER
 * Scrapes ingredient panels from Open Pet Food Facts API and brand pages
 * Stores normalized CommercialProduct records
 */

import axios from 'axios';
import * as fs from 'fs/promises';
import * as cheerio from 'cheerio';

interface CommercialProduct {
  source: 'openpetfoodfacts' | 'brand' | 'retail';
  sourceUrl: string;
  brand: string;
  productName: string;
  speciesHint: string[];
  productType: 'wet' | 'dry' | 'pellet' | 'mix' | 'treat' | 'unknown';
  ingredientsRaw: string | string[];
  ingredientsList: Array<{ name: string; position: number }>;
  scrapedAt: string;
  barcode?: string;
}

class CommercialScraper {
  private products: CommercialProduct[] = [];
  private readonly OPFF_BASE = 'https://world.openpetfoodfacts.org';
  private readonly OPFF_SEARCH = `${this.OPFF_BASE}/cgi/search.pl`;
  
  async scrapeOpenPetFoodFacts(): Promise<void> {
    console.log('\n🔍 Scraping Open Pet Food Facts...\n');
    
    const categories = [
      { category: 'dog-foods', species: ['dogs'] },
      { category: 'cat-foods', species: ['cats'] },
      { category: 'bird-foods', species: ['birds'] },
      { category: 'small-pet-foods', species: ['pocket-pets'] },
      { category: 'reptile-foods', species: ['reptiles'] },
    ];

    for (const { category, species } of categories) {
      console.log(`📦 Fetching ${category}...`);
      await this.fetchOPFFCategory(category, species);
      await this.sleep(2000); // Rate limit
    }

    console.log(`\n✅ Scraped ${this.products.length} products from Open Pet Food Facts`);
  }

  private async fetchOPFFCategory(category: string, species: string[]): Promise<void> {
    let page = 1;
    const pageSize = 100;
    let hasMore = true;

    while (hasMore && page <= 10) { // Limit to 10 pages per category
      try {
        const url = `${this.OPFF_SEARCH}?action=process&tagtype_0=categories&tag_contains_0=contains&tag_0=${category}&page_size=${pageSize}&page=${page}&json=1`;
        
        console.log(`   Page ${page}...`);
        const response = await axios.get(url, {
          timeout: 30000,
          headers: { 'User-Agent': 'PetPlates-Research/1.0' }
        });

        const data = response.data;
        
        if (!data.products || data.products.length === 0) {
          hasMore = false;
          break;
        }

        for (const product of data.products) {
          const normalized = this.normalizeOPFFProduct(product, species);
          if (normalized) {
            this.products.push(normalized);
          }
        }

        console.log(`   ✓ Found ${data.products.length} products (total: ${this.products.length})`);

        // Check if there are more pages
        hasMore = data.products.length === pageSize;
        page++;
        
        await this.sleep(1000); // Rate limit between pages
      } catch (error: any) {
        console.error(`   ✗ Error fetching page ${page}: ${error.message}`);
        hasMore = false;
      }
    }
  }

  private normalizeOPFFProduct(product: any, speciesHint: string[]): CommercialProduct | null {
    // Must have ingredients
    if (!product.ingredients_text && !product.ingredients) {
      return null;
    }

    // Parse ingredients list
    const ingredientsRaw = product.ingredients_text || '';
    const ingredientsList = this.parseIngredientsList(ingredientsRaw);

    if (ingredientsList.length === 0) {
      return null;
    }

    // Infer product type from categories or product name
    const productType = this.inferProductType(product);

    return {
      source: 'openpetfoodfacts',
      sourceUrl: `${this.OPFF_BASE}/product/${product.code}`,
      brand: product.brands || 'Unknown',
      productName: product.product_name || 'Unknown Product',
      speciesHint,
      productType,
      ingredientsRaw,
      ingredientsList,
      scrapedAt: new Date().toISOString(),
      barcode: product.code,
    };
  }

  private parseIngredientsList(text: string): Array<{ name: string; position: number }> {
    if (!text || typeof text !== 'string') return [];

    // Split by comma, semicolon, or newline
    const parts = text.split(/[,;\n]+/).map(s => s.trim()).filter(s => s.length > 0);
    
    return parts.map((name, index) => ({
      name: this.cleanIngredientName(name),
      position: index + 1
    }));
  }

  private cleanIngredientName(name: string): string {
    // Remove leading numbers, asterisks, bullets
    let cleaned = name.replace(/^[\d\*\-•\s]+/, '');
    
    // Remove parenthetical notes at the end
    cleaned = cleaned.replace(/\([^)]*\)$/, '');
    
    // Remove percentage indicators
    cleaned = cleaned.replace(/\s*\d+%?\s*$/, '');
    
    return cleaned.trim();
  }

  private inferProductType(product: any): CommercialProduct['productType'] {
    const name = (product.product_name || '').toLowerCase();
    const categories = (product.categories || '').toLowerCase();
    const combined = name + ' ' + categories;

    if (combined.includes('wet') || combined.includes('canned') || combined.includes('pate')) {
      return 'wet';
    }
    if (combined.includes('dry') || combined.includes('kibble')) {
      return 'dry';
    }
    if (combined.includes('pellet')) {
      return 'pellet';
    }
    if (combined.includes('treat') || combined.includes('snack')) {
      return 'treat';
    }
    if (combined.includes('mix') || combined.includes('powder')) {
      return 'mix';
    }

    return 'unknown';
  }

  async scrapeBrandPages(): Promise<void> {
    console.log('\n🔍 Scraping brand pages (exotic pets)...\n');
    
    // Bird brands
    await this.scrapeLafeber();
    
    // Pocket pet brands
    await this.scrapeOxbow();
    
    console.log(`\n✅ Scraped ${this.products.length} total products`);
  }

  private async scrapeLafeber(): Promise<void> {
    console.log('📦 Scraping Lafeber (bird food)...');
    
    try {
      const url = 'https://www.lafeber.com/pet-birds/';
      const response = await axios.get(url, {
        timeout: 30000,
        headers: { 'User-Agent': 'PetPlates-Research/1.0' }
      });

      const $ = cheerio.load(response.data);
      
      // Find product links (adjust selectors based on actual site structure)
      const productLinks: string[] = [];
      $('a[href*="/product/"]').each((_, el) => {
        const href = $(el).attr('href');
        if (href && !productLinks.includes(href)) {
          productLinks.push(href.startsWith('http') ? href : `https://www.lafeber.com${href}`);
        }
      });

      console.log(`   Found ${productLinks.length} product links`);
      
      // For now, just log - full implementation would scrape each product page
      // This is a placeholder for brand page scraping
      
    } catch (error: any) {
      console.error(`   ✗ Error: ${error.message}`);
    }
  }

  private async scrapeOxbow(): Promise<void> {
    console.log('📦 Scraping Oxbow (pocket pets)...');
    
    try {
      const url = 'https://oxbowanimalhealth.com/product-category/essentials-food/';
      const response = await axios.get(url, {
        timeout: 30000,
        headers: { 'User-Agent': 'PetPlates-Research/1.0' }
      });

      const $ = cheerio.load(response.data);
      
      // Find product links (adjust selectors based on actual site structure)
      const productLinks: string[] = [];
      $('a[href*="/product/"]').each((_, el) => {
        const href = $(el).attr('href');
        if (href && !productLinks.includes(href)) {
          productLinks.push(href);
        }
      });

      console.log(`   Found ${productLinks.length} product links`);
      
      // For now, just log - full implementation would scrape each product page
      
    } catch (error: any) {
      console.error(`   ✗ Error: ${error.message}`);
    }
  }

  async saveProducts(outputPath: string): Promise<void> {
    await fs.writeFile(outputPath, JSON.stringify(this.products, null, 2), 'utf-8');
    console.log(`\n💾 Saved ${this.products.length} products to: ${outputPath}`);
  }

  getProducts(): CommercialProduct[] {
    return this.products;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI execution
async function main() {
  const scraper = new CommercialScraper();
  
  // Scrape Open Pet Food Facts (primary source)
  await scraper.scrapeOpenPetFoodFacts();
  
  // Scrape brand pages (exotic pets - placeholder for now)
  // await scraper.scrapeBrandPages();
  
  // Save results
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const outputPath = `./output/commercial-products-${timestamp}.json`;
  await scraper.saveProducts(outputPath);
  
  // Print summary
  const products = scraper.getProducts();
  const bySpecies = products.reduce((acc, p) => {
    const species = p.speciesHint[0] || 'unknown';
    acc[species] = (acc[species] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('\n📊 Summary by species:');
  for (const [species, count] of Object.entries(bySpecies)) {
    console.log(`   ${species}: ${count} products`);
  }
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
