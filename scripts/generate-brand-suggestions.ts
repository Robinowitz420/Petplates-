// scripts/generate-brand-suggestions.ts
// Generate brand-based product suggestions for ingredients

import fs from 'fs';
import path from 'path';
import { BrandBasedVetter } from '../lib/services/brandBasedVetter';

async function main() {
  console.log('🔍 Generating brand-based product suggestions...\n');
  
  // Load ingredients needing vetting
  const ingredientsPath = path.join(__dirname, '../data/ingredients-needing-vetting.json');
  
  if (!fs.existsSync(ingredientsPath)) {
    console.error('❌ ingredients-needing-vetting.json not found. Run vet:recipes first.');
    process.exit(1);
  }
  
  const allIngredients = JSON.parse(fs.readFileSync(ingredientsPath, 'utf-8'));
  const ingredientNames = allIngredients.map((item: any) => item.name);
  
  console.log(`Processing ${ingredientNames.length} ingredients...\n`);
  
  const vetter = new BrandBasedVetter();
  const suggestions: any[] = [];
  
  for (const ingredient of ingredientNames) {
    const matches = vetter.findBrandMatches(ingredient);
    
    if (matches.length > 0) {
      const bestMatch = matches[0];
      const vettedProduct = vetter.generateVettedProduct(ingredient, bestMatch);
      
      suggestions.push({
        ingredient,
        ...vettedProduct,
        brand: bestMatch.brand,
        qualityScore: bestMatch.qualityScore,
        priceRange: bestMatch.priceRange
      });
    }
  }
  
  // Group by confidence
  const highConfidence = suggestions.filter(s => s.confidence >= 0.8);
  const mediumConfidence = suggestions.filter(s => s.confidence >= 0.6 && s.confidence < 0.8);
  const lowConfidence = suggestions.filter(s => s.confidence < 0.6);
  
  console.log('=== BRAND SUGGESTIONS ===');
  console.log(`High confidence (≥80%): ${highConfidence.length} products`);
  console.log(`Medium confidence (60-80%): ${mediumConfidence.length} products`);
  console.log(`Low confidence (<60%): ${lowConfidence.length} products\n`);
  
  // Save all suggestions
  const suggestionsPath = path.join(__dirname, '../data/brand-suggestions.json');
  fs.writeFileSync(suggestionsPath, JSON.stringify(suggestions, null, 2));
  console.log(`✅ All suggestions saved to: data/brand-suggestions.json`);
  
  // Generate update script for high-confidence products
  generateUpdateScript(highConfidence, 'high-confidence');
  generateUpdateScript(mediumConfidence, 'medium-confidence');
  
  console.log('\n📝 Review the generated scripts and add products to vetted-products.ts');
}

function generateUpdateScript(products: any[], confidence: string) {
  let script = `// BRAND-BASED VETTED PRODUCTS (${confidence})\n`;
  script += `// Review these products and add to lib/data/vetted-products.ts\n\n`;
  script += `const brandVettedProducts_${confidence.replace('-', '_')} = {\n`;
  
  products.forEach(product => {
    const key = product.ingredient.toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[()]/g, '')
      .replace(/[^a-z0-9_]/g, '');
    
    script += `  '${key}': {\n`;
    script += `    productName: '${product.productName.replace(/'/g, "\\'")}',\n`;
    script += `    amazonLink: '${product.amazonLink}',\n`;
    script += `    vetNote: '${product.vetNote.replace(/'/g, "\\'")}',\n`;
    script += `    category: '${product.category}',\n`;
    script += `    commissionRate: ${product.commissionRate},\n`;
    script += `    confidence: ${product.confidence.toFixed(2)},\n`;
    script += `    source: 'brand_analysis',\n`;
    script += `    brand: '${product.brand}',\n`;
    script += `    qualityScore: ${product.qualityScore}\n`;
    script += `  },\n`;
  });
  
  script += '};\n';
  
  const scriptPath = path.join(__dirname, `../data/brand-vetted-${confidence}.ts`);
  fs.writeFileSync(scriptPath, script);
  console.log(`✅ ${confidence} script generated: data/brand-vetted-${confidence}.ts`);
}

main().catch(console.error);

