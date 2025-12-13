// scripts/update-vetted-products-with-prices.ts
// Update vetted-products.ts with fetched price data

import * as fs from 'fs';
import * as path from 'path';

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

const PRICES_FILE = path.join(__dirname, '../data/product-prices.json');
const VETTED_PRODUCTS_FILE = path.join(__dirname, '../lib/data/vetted-products.ts');
const BACKUP_FILE = path.join(__dirname, '../lib/data/vetted-products.ts.backup-prices');

function formatPriceData(price: PriceData['price']): string {
  let code = `price: {
      amount: ${price.amount},
      currency: '${price.currency}',
      lastUpdated: '${price.lastUpdated}'`;
  
  if (price.unit) {
    code += `,
      unit: '${price.unit}'`;
  }
  
  code += `
    }`;
  
  return code;
}

function updateVettedProductsFile(prices: PriceData[]) {
  console.log('📝 Reading vetted-products.ts...\n');
  
  let content = fs.readFileSync(VETTED_PRODUCTS_FILE, 'utf-8');
  
  // Create backup
  fs.writeFileSync(BACKUP_FILE, content);
  console.log(`💾 Backup created: ${BACKUP_FILE}\n`);
  
  // Filter to only products with valid prices
  const validPrices = prices.filter(p => p.price.amount > 0 && !p.error);
  console.log(`📊 Found ${validPrices.length} products with valid prices\n`);
  
  // Sort by ingredient name to match file order
  validPrices.sort((a, b) => a.ingredient.localeCompare(b.ingredient));
  
  // Update each product entry
  let updateCount = 0;
  
  for (const priceData of validPrices) {
    const ingredient = priceData.ingredient;
    const escapedIngredient = ingredient.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const priceCode = formatPriceData(priceData.price);
    
    // Try multiple patterns to find the product entry
    // Pattern 1: Has commissionRate at the end
    let pattern = new RegExp(
      `('${escapedIngredient}':\\s*\\{[\\s\\S]*?)(commissionRate\\s*:[^,}]+[,\\s]*\\n\\s*\\})`,
      'm'
    );
    
    let match = content.match(pattern);
    
    if (match) {
      // Replace the closing brace with price + closing brace
      const replacement = match[0].replace(/\}\s*$/, `,\n    ${priceCode}\n  }`);
      content = content.replace(pattern, replacement);
      updateCount++;
      continue;
    }
    
    // Pattern 2: Has category at the end
    pattern = new RegExp(
      `('${escapedIngredient}':\\s*\\{[\\s\\S]*?)(category\\s*:[^,}]+[,\\s]*\\n\\s*\\})`,
      'm'
    );
    
    match = content.match(pattern);
    
    if (match) {
      const replacement = match[0].replace(/\}\s*$/, `,\n    ${priceCode}\n  }`);
      content = content.replace(pattern, replacement);
      updateCount++;
      continue;
    }
    
    // Pattern 3: Has vetNote at the end (no optional fields)
    pattern = new RegExp(
      `('${escapedIngredient}':\\s*\\{[\\s\\S]*?)(vetNote\\s*:[^,}]+[,\\s]*\\n\\s*\\})`,
      'm'
    );
    
    match = content.match(pattern);
    
    if (match) {
      const replacement = match[0].replace(/\}\s*$/, `,\n    ${priceCode}\n  }`);
      content = content.replace(pattern, replacement);
      updateCount++;
      continue;
    }
    
    // Pattern 4: Find any entry and add before closing brace
    pattern = new RegExp(
      `('${escapedIngredient}':\\s*\\{)([\\s\\S]*?)(\\n\\s*\\})`,
      'm'
    );
    
    match = content.match(pattern);
    
    if (match && !match[2].includes('price:')) {
      const replacement = `${match[1]}${match[2]},\n    ${priceCode}${match[3]}`;
      content = content.replace(pattern, replacement);
      updateCount++;
    } else {
      console.log(`⚠️  Could not find or already has price: ${ingredient}`);
    }
  }
  
  // Write updated content
  fs.writeFileSync(VETTED_PRODUCTS_FILE, content);
  
  console.log(`\n✅ Updated ${updateCount} products with price data`);
  console.log(`📄 Updated file: ${VETTED_PRODUCTS_FILE}\n`);
}

function main() {
  console.log('🔄 Updating Vetted Products with Price Data\n');
  console.log('='.repeat(60));
  
  if (!fs.existsSync(PRICES_FILE)) {
    console.error(`❌ Price data file not found: ${PRICES_FILE}`);
    console.error('   Please run fetch-product-prices.ts first\n');
    process.exit(1);
  }
  
  const pricesJson = fs.readFileSync(PRICES_FILE, 'utf-8');
  const prices: PriceData[] = JSON.parse(pricesJson);
  
  console.log(`📦 Loaded ${prices.length} price records\n`);
  
  updateVettedProductsFile(prices);
  
  console.log('✅ Update complete!\n');
}

main();

