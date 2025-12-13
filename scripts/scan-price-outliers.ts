/**
 * Scan vetted products for outlier prices
 * Detects prices that exceed reasonable limits for their category
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Price validation constants (inline to avoid import issues)
type ProductCategory = 'Meat' | 'Supplement' | 'Carb' | 'Vegetable' | 'Oil' | 'Seed' | 'Fruit' | 'Insect' | 'Hay' | 'Pellet';

const MAX_REASONABLE_PRICES: Record<ProductCategory, number> = {
  Vegetable: 15,
  Meat: 80,
  Carb: 75,
  Oil: 40,
  Supplement: 100,
  Fruit: 30,
  Seed: 50,
  Insect: 50,
  Hay: 50,
  Pellet: 80,
};

function isPriceReasonable(price: number, category?: string): boolean {
  if (!category) return true;
  const normalizedCategory = category as ProductCategory;
  if (!(normalizedCategory in MAX_REASONABLE_PRICES)) return true;
  const maxPrice = MAX_REASONABLE_PRICES[normalizedCategory];
  return price <= maxPrice;
}

function getMaxReasonablePrice(category?: string): number | null {
  if (!category) return null;
  const normalizedCategory = category as ProductCategory;
  return MAX_REASONABLE_PRICES[normalizedCategory] || null;
}

interface OutlierReport {
  ingredientName: string;
  currentPrice: number;
  category: string;
  maxReasonablePrice: number | null;
  asinLink: string;
  productName: string;
  lastUpdated: string;
}

interface VettedProduct {
  productName: string;
  asinLink: string;
  vetNote: string;
  category?: ProductCategory;
  price?: {
    amount: number;
    currency: string;
    lastUpdated: string;
  };
}

function scanPriceOutliers(): void {
  console.log('🔍 Scanning vetted products for price outliers...\n');
  
  const vettedProductsPath = path.join(__dirname, '../lib/data/vetted-products.ts');
  const content = fs.readFileSync(vettedProductsPath, 'utf8');
  
  // Extract the VETTED_PRODUCTS object
  // Look for the export const VETTED_PRODUCTS pattern
  const productsMatch = content.match(/export\s+const\s+VETTED_PRODUCTS[^=]*=\s*\{([\s\S]*)\}\s*;/);
  
  if (!productsMatch) {
    console.error('❌ Could not find VETTED_PRODUCTS in vetted-products.ts');
    process.exit(1);
  }
  
  // Parse products using regex to extract each entry
  const productEntries: Array<{ key: string; value: Partial<VettedProduct> }> = [];
  
  // Match pattern: 'ingredient-name': { ... }
  const entryPattern = /'([^']+)':\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/g;
  let match;
  
  // More robust parsing: look for entries with price information
  const pricePattern = /price:\s*\{\s*amount:\s*([0-9.]+)/g;
  const entries = content.matchAll(/'([^']+)':\s*\{[\s\S]*?price:\s*\{[\s\S]*?amount:\s*([0-9.]+)[\s\S]*?\}/g);
  
  const outliers: OutlierReport[] = [];
  let totalProducts = 0;
  let productsWithPrices = 0;
  
  // Use a simpler approach: extract all ingredient entries with their prices
  const ingredientKeyPattern = /'([^']+)':/g;
  let keyMatch;
  const seenKeys = new Set<string>();
  
  // More targeted approach: look for price blocks and work backwards
  const priceBlockPattern = /price:\s*\{\s*amount:\s*([0-9.]+),\s*currency:\s*'([^']+)',\s*lastUpdated:\s*'([^']+)'/g;
  let priceMatch;
  
  // Find all price entries and extract context
  const allPriceMatches: Array<{
    amount: number;
    currency: string;
    lastUpdated: string;
    context: string;
    startIndex: number;
  }> = [];
  
  let searchContent = content;
  while ((priceMatch = priceBlockPattern.exec(content)) !== null) {
    const startIndex = priceMatch.index;
    const amount = parseFloat(priceMatch[1]);
    const currency = priceMatch[2];
    const lastUpdated = priceMatch[3];
    
    // Extract context around this price (look backwards for ingredient name and forwards for category)
    const contextStart = Math.max(0, startIndex - 500);
    const contextEnd = Math.min(content.length, startIndex + 500);
    const context = content.substring(contextStart, contextEnd);
    
    allPriceMatches.push({
      amount,
      currency,
      lastUpdated,
      context,
      startIndex,
    });
  }
  
  // For each price, extract the ingredient name and category
  for (const priceData of allPriceMatches) {
    productsWithPrices++;
    
    // Extract ingredient name (look for 'ingredient-name': pattern before the price)
    const beforeContext = priceData.context.substring(0, priceData.context.indexOf('price:'));
    const keyMatch = beforeContext.match(/'([^']+)':\s*\{/);
    if (!keyMatch) continue;
    
    const ingredientName = keyMatch[1];
    if (seenKeys.has(ingredientName)) continue; // Skip duplicates
    seenKeys.add(ingredientName);
    
    // Extract category
    const categoryMatch = priceData.context.match(/category:\s*'([^']+)'/);
    const category = categoryMatch ? categoryMatch[1] : undefined;
    
    // Extract productName and asinLink
    const productNameMatch = priceData.context.match(/productName:\s*'([^']+)'/);
    const productName = productNameMatch ? productNameMatch[1] : 'Unknown';
    
    const asinLinkMatch = priceData.context.match(/asinLink:\s*'([^']+)'/);
    const asinLink = asinLinkMatch ? asinLinkMatch[1] : '';
    
    // Check if price is reasonable
    const maxPrice = getMaxReasonablePrice(category);
    const isReasonable = isPriceReasonable(priceData.amount, category);
    
    if (!isReasonable && maxPrice !== null) {
      outliers.push({
        ingredientName,
        currentPrice: priceData.amount,
        category: category || 'Unknown',
        maxReasonablePrice: maxPrice,
        asinLink,
        productName,
        lastUpdated: priceData.lastUpdated,
      });
    }
    
    totalProducts++;
  }
  
  // Generate report
  console.log(`📊 Scan Results:\n`);
  console.log(`   Total products scanned: ${productsWithPrices}`);
  console.log(`   Outliers found: ${outliers.length}\n`);
  
  if (outliers.length > 0) {
    console.log('⚠️  PRICE OUTLIERS DETECTED:\n');
    outliers.forEach((outlier, index) => {
      console.log(`${index + 1}. ${outlier.ingredientName} (${outlier.productName})`);
      console.log(`   Category: ${outlier.category}`);
      console.log(`   Current Price: $${outlier.currentPrice.toFixed(2)}`);
      console.log(`   Max Reasonable: $${outlier.maxReasonablePrice?.toFixed(2) || 'N/A'}`);
      console.log(`   Exceeds by: $${(outlier.currentPrice - (outlier.maxReasonablePrice || 0)).toFixed(2)}`);
      console.log(`   ASIN Link: ${outlier.asinLink}`);
      console.log(`   Last Updated: ${outlier.lastUpdated}`);
      console.log('');
    });
  } else {
    console.log('✅ No price outliers detected!\n');
  }
  
  // Save report to JSON file
  const reportPath = path.join(__dirname, 'price-outliers-report.json');
  const report = {
    scanDate: new Date().toISOString(),
    totalProductsScanned: productsWithPrices,
    outliersFound: outliers.length,
    outliers: outliers,
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Report saved to: ${reportPath}`);
  
  if (outliers.length > 0) {
    process.exit(1); // Exit with error code to indicate outliers were found
  }
}

// Run the scan
try {
  scanPriceOutliers();
} catch (error) {
  console.error('❌ Error scanning price outliers:', error);
  process.exit(1);
}

