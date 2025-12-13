/**
 * Script to automatically classify all vetted products by cost tier
 * Adds costTier field based on price.amount
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function classifyCostTier(price: number): 'budget' | 'standard' | 'premium' {
  if (price < 15) return 'budget';
  if (price < 30) return 'standard';
  return 'premium';
}

function addCostTiersToVettedProducts(): void {
  console.log('🔍 Classifying vetted products by cost tier...\n');
  
  const vettedProductsPath = path.join(__dirname, '../lib/data/vetted-products.ts');
  let content = fs.readFileSync(vettedProductsPath, 'utf8');
  
  // Find all product entries with price.amount
  const pricePattern = /price:\s*\{\s*amount:\s*([0-9.]+)/g;
  let match;
  let updated = 0;
  let needsTier = 0;
  
  while ((match = pricePattern.exec(content)) !== null) {
    const price = parseFloat(match[1]);
    const tier = classifyCostTier(price);
    
    // Check if costTier already exists before this price
    const matchIndex = match.index;
    const beforeMatch = content.substring(Math.max(0, matchIndex - 200), matchIndex);
    const afterMatch = content.substring(matchIndex, matchIndex + 100);
    
    // Check if costTier is already present (should be before price)
    if (!beforeMatch.includes('costTier:')) {
      needsTier++;
      
      // Find the start of the object (look backwards for the opening brace)
      const objectStart = content.lastIndexOf('  \'', matchIndex);
      if (objectStart === -1) continue;
      
      // Find where to insert (before price, after species or commissionRate)
      // Look for the line before price
      const priceLineStart = content.lastIndexOf('\n', matchIndex);
      const insertPosition = priceLineStart;
      
      // Create the costTier line
      const indent = '    ';
      const costTierLine = `${indent}costTier: '${tier}',\n`;
      
      // Insert costTier before price
      content = content.slice(0, insertPosition) + costTierLine + content.slice(insertPosition);
      updated++;
      
      // Adjust regex position since we inserted text
      pricePattern.lastIndex = matchIndex + costTierLine.length;
    }
  }
  
  console.log(`📊 Classification Results:\n`);
  console.log(`   Products needing costTier: ${needsTier}`);
  console.log(`   Products updated: ${updated}\n`);
  
  if (updated > 0) {
    // Write updated file
    fs.writeFileSync(vettedProductsPath, content, 'utf8');
    console.log(`✅ Updated ${updated} products with costTier classification`);
  } else {
    console.log('✅ All products already have costTier (or no prices found)');
  }
  
  // Generate statistics
  const budgetPattern = /costTier:\s*'budget'/g;
  const standardPattern = /costTier:\s*'standard'/g;
  const premiumPattern = /costTier:\s*'premium'/g;
  
  const budgetCount = (content.match(budgetPattern) || []).length;
  const standardCount = (content.match(standardPattern) || []).length;
  const premiumCount = (content.match(premiumPattern) || []).length;
  
  console.log('\n📈 Cost Tier Distribution:');
  console.log(`   Budget (< $15): ${budgetCount}`);
  console.log(`   Standard ($15-30): ${standardCount}`);
  console.log(`   Premium (> $30): ${premiumCount}`);
}

// Run classification
try {
  addCostTiersToVettedProducts();
} catch (error) {
  console.error('❌ Error classifying products:', error);
  process.exit(1);
}

