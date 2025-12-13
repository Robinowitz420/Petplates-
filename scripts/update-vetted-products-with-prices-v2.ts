// scripts/update-vetted-products-with-prices-v2.ts
// Update vetted-products.ts with fetched price data (improved version)

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
  let code = `    price: {
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
  
  const content = fs.readFileSync(VETTED_PRODUCTS_FILE, 'utf-8');
  const lines = content.split('\n');
  
  // Create backup
  fs.writeFileSync(BACKUP_FILE, content);
  console.log(`💾 Backup created: ${BACKUP_FILE}\n`);
  
  // Create price map
  const priceMap = new Map<string, PriceData>();
  prices
    .filter(p => p.price.amount > 0 && !p.error)
    .forEach(p => priceMap.set(p.ingredient, p));
  
  console.log(`📊 Found ${priceMap.size} products with valid prices\n`);
  
  // Process lines
  const newLines: string[] = [];
  let currentIngredient: string | null = null;
  let inProductBlock = false;
  let productStartLine = -1;
  let braceDepth = 0;
  let hasPrice = false;
  let lastFieldLine = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect start of product entry: 'ingredient-name': {
    const productMatch = line.match(/^\s*'([^']+)':\s*\{/);
    if (productMatch && !inProductBlock) {
      currentIngredient = productMatch[1];
      inProductBlock = true;
      productStartLine = i;
      braceDepth = 1;
      hasPrice = false;
      lastFieldLine = -1;
      newLines.push(line);
      continue;
    }
    
    // Track brace depth
    if (inProductBlock) {
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      braceDepth += openBraces - closeBraces;
      
      // Check if this line has a price field
      if (line.includes('price:')) {
        hasPrice = true;
      }
      
      // Track last field line (before closing brace)
      if (braceDepth === 1 && (line.includes(':') || line.trim() === '}')) {
        lastFieldLine = i;
      }
      
      // Check if we're closing the product block
      if (braceDepth === 0 && inProductBlock) {
        // We've reached the end of this product block
        if (currentIngredient && priceMap.has(currentIngredient) && !hasPrice) {
          // Insert price before closing brace
          const priceData = priceMap.get(currentIngredient)!;
          const priceCode = formatPriceData(priceData.price);
          
          // Find where to insert (before the last closing brace)
          // Insert at lastFieldLine + 1
          if (lastFieldLine >= 0 && lastFieldLine < i) {
            // Insert after the last field
            newLines.push(priceCode);
            newLines.push(line);
          } else {
            // Insert before the closing brace
            newLines.push(priceCode);
            newLines.push(line);
          }
        } else {
          newLines.push(line);
        }
        
        currentIngredient = null;
        inProductBlock = false;
        continue;
      }
    }
    
    newLines.push(line);
  }
  
  // Write updated content
  const updatedContent = newLines.join('\n');
  fs.writeFileSync(VETTED_PRODUCTS_FILE, updatedContent);
  
  const updatedCount = priceMap.size - Array.from(priceMap.keys()).filter(
    ing => !updatedContent.includes(`'${ing}':`) || !updatedContent.includes('price:')
  ).length;
  
  console.log(`✅ Updated products with price data`);
  console.log(`📄 Updated file: ${VETTED_PRODUCTS_FILE}\n`);
}

function main() {
  console.log('🔄 Updating Vetted Products with Price Data (v2)\n');
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

