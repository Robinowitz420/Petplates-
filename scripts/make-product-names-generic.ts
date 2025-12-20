import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Convert all product names to generic versions like they appear in shopping lists
 */

interface VettedProduct {
  ingredient: string;
  productName: string;
  asin: string;
  amazonLink: string;
  vetNote: string;
  category?: string;
}

interface GenericNameMapping {
  ingredient: string;
  currentProductName: string;
  newProductName: string;
  reason: string;
}

// ============================================================================
// GENERIC NAME MAPPINGS
// ============================================================================

function generateGenericName(ingredient: string, currentProductName: string): string {
  const ingredientLower = ingredient.toLowerCase();

  // Quality indicators to preserve
  const qualityIndicators = [];
  const productLower = currentProductName.toLowerCase();

  if (productLower.includes('organic')) qualityIndicators.push('Organic');
  if (productLower.includes('grass fed') || productLower.includes('grass-fed')) qualityIndicators.push('Grass-Fed');
  if (productLower.includes('free range') || productLower.includes('free-range')) qualityIndicators.push('Free Range');
  if (productLower.includes('wild caught') || productLower.includes('wild-caught')) qualityIndicators.push('Wild Caught');
  if (productLower.includes('human grade') || productLower.includes('human-grade')) qualityIndicators.push('Human Grade');
  if (productLower.includes('freeze dried') || productLower.includes('freeze-dried')) qualityIndicators.push('Freeze Dried');
  if (productLower.includes('grain free') || productLower.includes('grain-free')) qualityIndicators.push('Grain Free');
  if (productLower.includes('raw')) qualityIndicators.push('Raw');

  // Size indicators to preserve
  const sizeIndicators = [];
  if (productLower.includes('bulk')) sizeIndicators.push('Bulk');
  if (productLower.includes('family size') || productLower.includes('family pack')) sizeIndicators.push('Family Size');

  // Start with the ingredient name
  let genericName = ingredient.charAt(0).toUpperCase() + ingredient.slice(1);

  // Add quality indicators
  if (qualityIndicators.length > 0) {
    genericName += ` (${qualityIndicators.join(', ')})`;
  }

  // Add size indicators
  if (sizeIndicators.length > 0) {
    genericName += ` - ${sizeIndicators.join(' ')}`;
  }

  return genericName;
}

// ============================================================================
// PARSE VETTED PRODUCTS
// ============================================================================

function parseVettedProducts(filePath: string): VettedProduct[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const products: VettedProduct[] = [];

  // Match entries like: 'ground beef (lean)': {
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const ingredientMatch = line.match(/'([^']+)':\s*{/);

    if (ingredientMatch) {
      const ingredient = ingredientMatch[1];

      // Extract the object block
      let block = '';
      let braceCount = 1;
      let j = i + 1;

      while (j < lines.length && braceCount > 0) {
        block += lines[j] + '\n';
        braceCount += (lines[j].match(/{/g) || []).length;
        braceCount -= (lines[j].match(/}/g) || []).length;
        j++;
      }

      // Extract fields
      const productNameMatch = block.match(/productName:\s*'([^']+)'/);
      const amazonLinkMatch = block.match(/(amazonLink|asinLink):\s*'([^']+)'/);
      const asinMatch = block.match(/\/dp\/([A-Z0-9]{10})/);
      const vetNoteMatch = block.match(/vetNote:\s*'([^']+)'/);
      const categoryMatch = block.match(/category:\s*'([^']+)'/);

      if (productNameMatch && amazonLinkMatch) {
        products.push({
          ingredient,
          productName: productNameMatch[1],
          asin: asinMatch ? asinMatch[1] : 'UNKNOWN',
          amazonLink: amazonLinkMatch[2],
          vetNote: vetNoteMatch ? vetNoteMatch[1] : '',
          category: categoryMatch ? categoryMatch[1] : undefined
        });
      }
    }
  }

  return products;
}

// ============================================================================
// GENERATE GENERIC NAMES
// ============================================================================

function generateGenericMappings(products: VettedProduct[]): GenericNameMapping[] {
  return products.map(product => ({
    ingredient: product.ingredient,
    currentProductName: product.productName,
    newProductName: generateGenericName(product.ingredient, product.productName),
    reason: 'Converted to generic shopping list format'
  }));
}

// ============================================================================
// APPLY CHANGES TO FILE
// ============================================================================

function applyGenericNames(filePath: string, mappings: GenericNameMapping[]): string {
  let content = fs.readFileSync(filePath, 'utf-8');

  for (const mapping of mappings) {
    // Escape special regex characters
    const escapedCurrent = mapping.currentProductName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedNew = mapping.newProductName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Replace the productName
    const productNameRegex = new RegExp(`productName:\\s*'${escapedCurrent}'`, 'g');
    const escapedNewName = mapping.newProductName.replace(/'/g, "\\'");
    content = content.replace(productNameRegex, `productName: '${escapedNewName}'`);
  }

  return content;
}

// ============================================================================
// GENERATE REPORT
// ============================================================================

function generateReport(mappings: GenericNameMapping[]): string {
  let report = `# Generic Product Names Report
Generated: ${new Date().toLocaleString()}
Total Changes: ${mappings.length}

This report shows the conversion of specific brand/product names to generic shopping list format.

## Changes Made

`;

  mappings.forEach((mapping, i) => {
    report += `### ${i + 1}. ${mapping.ingredient}
**BEFORE:** ${mapping.currentProductName}
**AFTER:** ${mapping.newProductName}
**Reason:** ${mapping.reason}

---
`;
  });

  report += `

## Examples of Generic Names

- "365 By Whole Foods Market, Organic Ground Chicken, Step 3, 16 Ounce" → "Ground Chicken (Organic)"
- "Butterball Fresh All Natural 85%/15% Lean Ground Turkey, 16 oz" → "Ground Turkey"
- "Purina ONE Classic Ground Chicken and Brown Rice Entree Adult Wet Dog Food" → "Ground Chicken"

## Benefits

1. **Consistent Display**: Matches shopping list ingredient names
2. **User-Friendly**: Generic names are easier to read
3. **Brand Neutral**: Focuses on ingredients, not specific brands
4. **Flexible**: Users can still see detailed product info on Amazon
`;

  return report;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const inputFile = path.join(__dirname, '../lib/data/vetted-products.ts');
  const outputFile = path.join(__dirname, '../lib/data/vetted-products-generic.ts');
  const reportFile = path.join(__dirname, '../GENERIC-NAMES-REPORT.md');

  console.log('🔄 GENERIC PRODUCT NAMES CONVERSION');
  console.log('━'.repeat(50));
  console.log(`📁 Input:  ${inputFile}`);
  console.log(`📁 Output: ${outputFile}`);
  console.log(`📁 Report: ${reportFile}`);
  console.log('━'.repeat(50));

  try {
    // Parse products
    console.log('\n📖 Reading vetted-products.txt...');
    const products = parseVettedProducts(inputFile);
    console.log(`✅ Found ${products.length} products`);

    // Generate mappings
    console.log('\n🔄 Generating generic name mappings...');
    const mappings = generateGenericMappings(products);
    console.log(`✅ Created ${mappings.length} mappings`);

    // Show sample changes
    console.log('\n📋 Sample Changes:');
    mappings.slice(0, 5).forEach((m, i) => {
      console.log(`${i + 1}. ${m.ingredient}:`);
      console.log(`   "${m.currentProductName}"`);
      console.log(`   → "${m.newProductName}"`);
      console.log('');
    });

    // Apply changes
    console.log('💾 Applying changes to file...');
    const updatedContent = applyGenericNames(inputFile, mappings);
    fs.writeFileSync(outputFile, updatedContent);

    // Generate report
    console.log('📊 Generating report...');
    const report = generateReport(mappings);
    fs.writeFileSync(reportFile, report);

    console.log('\n✅ SUCCESS!');
    console.log(`📄 Updated file: ${outputFile}`);
    console.log(`📊 Report: ${reportFile}`);
    console.log(`\n🎯 Converted ${mappings.length} product names to generic format`);

  } catch (error: any) {
    console.error('\n❌ ERROR:', error.message);
    process.exit(1);
  }
}

main();
