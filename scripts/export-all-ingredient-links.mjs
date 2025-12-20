// Export all ingredients with their Amazon links for manual review

import { VETTED_PRODUCTS } from '../lib/data/vetted-products.ts';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('📋 Exporting All Ingredients with Amazon Links\n');
console.log('='.repeat(80));

const ingredients = Object.entries(VETTED_PRODUCTS).map(([name, product]) => ({
  ingredient: name,
  productName: product.productName,
  asinLink: product.asinLink,
  category: product.category,
}));

// Sort alphabetically by ingredient name
ingredients.sort((a, b) => a.ingredient.localeCompare(b.ingredient));

console.log(`\nTotal ingredients: ${ingredients.length}\n`);

// Create markdown report
let markdown = `# All Ingredients with Amazon Links

**Generated:** ${new Date().toISOString()}  
**Total Ingredients:** ${ingredients.length}

---

`;

ingredients.forEach((item, index) => {
  markdown += `## ${index + 1}. ${item.ingredient}\n\n`;
  markdown += `- **Product:** ${item.productName}\n`;
  markdown += `- **Category:** ${item.category}\n`;
  markdown += `- **Link:** ${item.asinLink}\n`;
  
  // Extract ASIN for quick reference
  const asinMatch = item.asinLink.match(/\/dp\/([A-Z0-9]{10})/);
  if (asinMatch) {
    markdown += `- **ASIN:** ${asinMatch[1]}\n`;
  }
  
  markdown += `\n`;
});

// Save to file
const outputPath = path.join(__dirname, '../ALL_INGREDIENT_LINKS.md');
fs.writeFileSync(outputPath, markdown, 'utf8');

console.log(`✅ Report saved to: ALL_INGREDIENT_LINKS.md`);
console.log(`\n📊 Summary by Category:\n`);

// Count by category
const byCategory = ingredients.reduce((acc, item) => {
  acc[item.category] = (acc[item.category] || 0) + 1;
  return acc;
}, {});

Object.entries(byCategory)
  .sort((a, b) => b[1] - a[1])
  .forEach(([category, count]) => {
    console.log(`  ${category}: ${count}`);
  });

console.log('\n' + '='.repeat(80));
