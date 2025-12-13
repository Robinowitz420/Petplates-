// scripts/update-vetted-products-simple.ts
// Simple script to update vetted-products.ts with price data
// Uses direct string replacement for each product

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

function formatPriceField(price: PriceData['price']): string {
  let field = `    price: {
      amount: ${price.amount},
      currency: '${price.currency}',
      lastUpdated: '${price.lastUpdated}'`;
  
  if (price.unit) {
    field += `,
      unit: '${price.unit}'`;
  }
  
  field += `
    }`;
  
  return field;
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
  
  const validPrices = prices.filter(p => p.price.amount > 0 && !p.error);
  console.log(`📦 Loaded ${validPrices.length} valid price records\n`);
  
  // Read the file
  console.log('📝 Reading vetted-products.ts...\n');
  let content = fs.readFileSync(VETTED_PRODUCTS_FILE, 'utf-8');
  
  // Create backup
  fs.writeFileSync(BACKUP_FILE, content);
  console.log(`💾 Backup created: ${BACKUP_FILE}\n`);
  
  let updateCount = 0;
  
  // Update each product
  for (const priceData of validPrices) {
    const ingredient = priceData.ingredient;
    const escapedIngredient = ingredient.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Skip if already has price
    const productPattern = new RegExp(`'${escapedIngredient}':\\s*\\{[\\s\\S]*?price:[\\s\\S]*?\\}`, 'm');
    if (productPattern.test(content)) {
      console.log(`⏭️  ${ingredient}: Already has price, skipping`);
      continue;
    }
    
    // Find the product entry and add price before closing brace
    // Pattern: find the product entry ending with } (possibly with comma)
    const pattern = new RegExp(
      `('${escapedIngredient}':\\s*\\{)([\\s\\S]*?)(\\n\\s*\\})(,?)`,
      'm'
    );
    
    const match = content.match(pattern);
    
    if (match) {
      const before = match[1];
      const middle = match[2];
      const closing = match[3];
      const comma = match[4];
      
      // Check if middle already has price
      if (middle.includes('price:')) {
        console.log(`⏭️  ${ingredient}: Already has price, skipping`);
        continue;
      }
      
      // Add price field before closing brace
      const priceField = formatPriceField(priceData.price);
      const updated = `${before}${middle},\n${priceField}${closing}${comma}`;
      
      content = content.replace(pattern, updated);
      updateCount++;
      
      if (updateCount % 10 === 0) {
        console.log(`✅ Updated ${updateCount} products...`);
      }
    } else {
      console.log(`⚠️  Could not find entry: ${ingredient}`);
    }
  }
  
  // Write updated content
  fs.writeFileSync(VETTED_PRODUCTS_FILE, content);
  
  console.log(`\n✅ Updated ${updateCount} products with price data`);
  console.log(`📄 Updated file: ${VETTED_PRODUCTS_FILE}\n`);
}

main();

