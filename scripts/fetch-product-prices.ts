// scripts/fetch-product-prices.ts
// Fetch current prices from Amazon for all vetted products

import * as fs from 'fs';
import * as path from 'path';
import { VETTED_PRODUCTS } from '../lib/data/vetted-products';
import { extractASIN } from '../lib/utils/affiliateLinks';

interface PriceData {
  ingredient: string;
  asin: string;
  url: string;
  price: {
    amount: number;
    currency: string;
    lastUpdated: string;
    unit?: string;
  };
  error?: string;
}

interface ProgressData {
  lastIndex: number;
  results: PriceData[];
  startTime: string;
}

const PROGRESS_FILE = path.join(__dirname, '../data/price-fetch-progress.json');
const RESULTS_FILE = path.join(__dirname, '../data/product-prices-UPDATED.json');
const UPDATE_CODE_FILE = path.join(__dirname, '../data/vetted-products-price-updates.ts');

// Delay between requests (milliseconds)
const REQUEST_DELAY = 3000; // 3 seconds to respect rate limits (reduce if needed)
const BATCH_SIZE = 10; // Save progress every N products

// Extract ASIN and URL from vetted products
function extractProductsToFetch(): Array<{ ingredient: string; asin: string; url: string }> {
  const products: Array<{ ingredient: string; asin: string; url: string }> = [];
  
  Object.entries(VETTED_PRODUCTS).forEach(([ingredient, product]) => {
    if (product.asinLink) {
      const asin = extractASIN(product.asinLink);
      if (asin) {
        products.push({
          ingredient,
          asin,
          url: product.asinLink,
        });
      }
    }
  });
  
  return products;
}

// Fetch price using lightweight HTTP request (faster than Puppeteer)
async function fetchPriceWithHTTP(url: string): Promise<{ price: number; unit?: string } | null> {
  try {
    // Use Node's built-in fetch (available in Node 18+)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return null;
    }
    
    const html = await response.text();
    
    // Try multiple price selectors
    const pricePatterns = [
      /<span[^>]*class="a-price[^"]*"[^>]*>[\s\S]*?<span[^>]*class="a-offscreen"[^>]*>([^<]+)<\/span>/i,
      /id="priceblock_[^"]*"[^>]*>[\s\S]*?([\d,]+\.?\d*)/i,
      /"price":\s*"([\d,]+\.?\d*)"/i,
      /data-a-color="price"[^>]*>[\s\S]*?\$([\d,]+\.?\d*)/i,
    ];
    
    for (const pattern of pricePatterns) {
      const match = html.match(pattern);
      if (match) {
        const priceText = match[1].replace(/[^0-9.]/g, '');
        const price = parseFloat(priceText);
        if (price > 0 && price < 10000) { // Sanity check
          return { price };
        }
      }
    }
    
    return null;
  } catch (error) {
    // HTTP request failed, return null to try Puppeteer
    return null;
  }
}

// Fetch price using Puppeteer (more reliable but slower)
async function fetchPriceWithPuppeteer(url: string): Promise<{ price: number; unit?: string } | null> {
  try {
    const scraperDir = path.join(__dirname, '../pet-ingredient-scraper');
    const distPath = path.resolve(scraperDir, 'dist/scrapers/AmazonScraper.js');
    
    // Check if scraper exists
    if (!fs.existsSync(distPath)) {
      console.log('  ⚠️  AmazonScraper not found, skipping Puppeteer fallback');
      return null;
    }
    
    // Import AmazonScraper from compiled dist
    const scraperModule = await import(`file://${distPath.replace(/\\/g, '/')}`);
    const AmazonScraper = scraperModule.AmazonScraper;
    const scraper = new AmazonScraper({ headless: true });
    
    try {
      // Use the getProductDetails method if available
      if (scraper.getProductDetails) {
        const result = await scraper.getProductDetails(url);
        if (result.details && result.details.price > 0) {
          await scraper.close();
          return {
            price: result.details.price,
            unit: undefined, // Can be extracted from details if needed
          };
        }
      }
      
      // Fallback: manual extraction
      await scraper.initializeBrowser();
      const page = (scraper as any).page;
      if (!page) {
        await scraper.close();
        return null;
      }
      
      const success = await (scraper as any).safeNavigate(url);
      if (!success) {
        await scraper.close();
        return null;
      }
      
      // Wait for product details to load
      await page.waitForSelector('#productTitle, .a-price', { timeout: 10000 }).catch(() => null);
      
      const result = await page.evaluate(() => {
        // Try multiple price selectors
        const priceSelectors = [
          '.a-price .a-offscreen',
          '#priceblock_ourprice',
          '#priceblock_dealprice',
          '.a-price-whole',
          '[data-a-color="price"] .a-offscreen',
        ];
        
        for (const selector of priceSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            const priceText = element.textContent || '';
            const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
            if (price > 0 && price < 10000) {
              // Try to find unit information
              const unitText = document.querySelector('.a-size-base.a-color-secondary')?.textContent || '';
              const unitMatch = unitText.match(/(per\s+[a-z]+|per\s+[a-z]+\s+[a-z]+)/i);
              
              return {
                price,
                unit: unitMatch ? unitMatch[1] : undefined,
              };
            }
          }
        }
        
        return null;
      });
      
      await scraper.close();
      return result;
    } catch (error) {
      await scraper.close().catch(() => {});
      return null;
    }
  } catch (error) {
    return null;
  }
}

// Fetch price for a single product (tries HTTP first, falls back to Puppeteer)
async function fetchProductPrice(
  ingredient: string,
  asin: string,
  url: string,
  index: number,
  total: number
): Promise<PriceData> {
  console.log(`[${index + 1}/${total}] Fetching price for: ${ingredient} (${asin})`);
  
    // Try HTTP first (faster)
    let priceData = await fetchPriceWithHTTP(url);
    
    // If HTTP failed, try Puppeteer (but warn it's slow)
    if (!priceData) {
      console.log(`  ⚠️  HTTP failed, trying Puppeteer (this will be slower)...`);
      priceData = await fetchPriceWithPuppeteer(url);
    }
  
  if (priceData && priceData.price > 0) {
    console.log(`  ✅ Price: $${priceData.price.toFixed(2)}${priceData.unit ? ` ${priceData.unit}` : ''}`);
    return {
      ingredient,
      asin,
      url,
      price: {
        amount: priceData.price,
        currency: 'USD',
        lastUpdated: new Date().toISOString(),
        unit: priceData.unit,
      },
    };
  } else {
    console.log(`  ❌ Could not fetch price`);
    return {
      ingredient,
      asin,
      url,
      price: {
        amount: 0,
        currency: 'USD',
        lastUpdated: new Date().toISOString(),
      },
      error: 'Price not found',
    };
  }
}

// Load progress if exists
function loadProgress(): ProgressData | null {
  if (fs.existsSync(PROGRESS_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
      return data;
    } catch (error) {
      return null;
    }
  }
  return null;
}

// Save progress
function saveProgress(progress: ProgressData) {
  const dir = path.dirname(PROGRESS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// Generate TypeScript code for updating vetted-products.ts
function generateUpdateCode(results: PriceData[]): string {
  const updates: string[] = [];
  
  results.forEach(result => {
    if (result.price.amount > 0 && !result.error) {
      const priceCode = `price: {
      amount: ${result.price.amount},
      currency: '${result.price.currency}',
      lastUpdated: '${result.price.lastUpdated}'${result.price.unit ? `,
      unit: '${result.price.unit}'` : ''}
    }`;
      updates.push(`'${result.ingredient}': { price: ... }`);
    }
  });
  
  // Generate a more useful update format
  let code = `// Price updates for vetted-products.ts
// Generated: ${new Date().toISOString()}
// Total products with prices: ${results.filter(r => r.price.amount > 0).length}

export const PRICE_UPDATES: Record<string, any> = {
`;
  
  results.forEach(result => {
    if (result.price.amount > 0 && !result.error) {
      code += `  '${result.ingredient}': {\n`;
      code += `    price: {\n`;
      code += `      amount: ${result.price.amount},\n`;
      code += `      currency: '${result.price.currency}',\n`;
      code += `      lastUpdated: '${result.price.lastUpdated}'${result.price.unit ? `,\n      unit: '${result.price.unit}'` : ''}\n`;
      code += `    }\n`;
      code += `  },\n`;
    }
  });
  
  code += `};\n`;
  
  return code;
}

// Main execution
async function main() {
  console.log('💰 Fetching Product Prices\n');
  console.log('='.repeat(60));
  
  const products = extractProductsToFetch();
  console.log(`\n📋 Found ${products.length} products to fetch prices for\n`);
  
  // Load progress if exists
  let progress = loadProgress();
  let startIndex = 0;
  const results: PriceData[] = [];
  
  if (progress) {
    console.log(`📂 Found existing progress (${progress.results.length} products already fetched)`);
    console.log(`🔄 Resuming from index ${progress.lastIndex + 1}\n`);
    startIndex = progress.lastIndex + 1;
    results.push(...progress.results);
  } else {
    progress = {
      lastIndex: -1,
      results: [],
      startTime: new Date().toISOString(),
    };
  }
  
  // Fetch prices
  for (let i = startIndex; i < products.length; i++) {
    const product = products[i];
    
    try {
      const priceData = await fetchProductPrice(
        product.ingredient,
        product.asin,
        product.url,
        i,
        products.length
      );
      
      results.push(priceData);
      
      // Update progress
      progress.lastIndex = i;
      progress.results = results;
      saveProgress(progress);
      
      // Save results periodically
      if ((i + 1) % BATCH_SIZE === 0) {
        fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
        const elapsed = Math.round((Date.now() - new Date(progress.startTime).getTime()) / 1000 / 60);
        const remaining = Math.round((elapsed / (i + 1)) * (products.length - i - 1));
        console.log(`  💾 Progress saved (${i + 1}/${products.length}) | Elapsed: ${elapsed}m | Est. remaining: ${remaining}m\n`);
      }
      
      // Delay between requests
      if (i < products.length - 1) {
        await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY));
      }
    } catch (error) {
      console.error(`  ❌ Error: ${error}`);
      results.push({
        ingredient: product.ingredient,
        asin: product.asin,
        url: product.url,
        price: {
          amount: 0,
          currency: 'USD',
          lastUpdated: new Date().toISOString(),
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      // Continue with next product
      progress.lastIndex = i;
      progress.results = results;
      saveProgress(progress);
      
      // Delay before retry
      await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY));
    }
  }
  
  // Save final results
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
  
  // Generate update code
  const updateCode = generateUpdateCode(results);
  fs.writeFileSync(UPDATE_CODE_FILE, updateCode);
  
  // Clean up progress file
  if (fs.existsSync(PROGRESS_FILE)) {
    fs.unlinkSync(PROGRESS_FILE);
  }
  
  // Summary
  const successful = results.filter(r => r.price.amount > 0 && !r.error).length;
  const failed = results.filter(r => r.price.amount === 0 || r.error).length;
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY\n');
  console.log(`Total products: ${results.length}`);
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`\n📄 Results saved to: ${RESULTS_FILE}`);
  console.log(`📄 Update code saved to: ${UPDATE_CODE_FILE}`);
  console.log('\n✅ Price fetching complete!\n');
}

// Run
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

