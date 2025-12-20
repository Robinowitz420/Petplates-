import fs from 'fs';

// Quick test to count ingredients and test parsing
function parseVettedProductsFile(filePath) {
  console.log(`📖 Reading file: ${filePath}`);

  const content = fs.readFileSync(filePath, 'utf-8');
  const products = {};

  // Match entries like: 'ingredient-name': { ... }
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
      const asinLinkMatch = block.match(/asinLink:\s*'([^']+)'/);

      products[ingredient] = {
        productName: productNameMatch ? productNameMatch[1] : '',
        asinLink: asinLinkMatch ? asinLinkMatch[1] : '',
      };
    }
  }

  return products;
}

// Test parsing
console.log('Testing ingredient parsing...\n');

const products = parseVettedProductsFile('lib/data/vetted-products.txt');
const count = Object.keys(products).length;

console.log(`✅ Found ${count} ingredients\n`);

console.log('First 5 ingredients:');
Object.keys(products).slice(0, 5).forEach((key, i) => {
  console.log(`${i + 1}. ${key} -> "${products[key].productName}"`);
});

console.log('\nSample ASIN extractions:');
Object.keys(products).slice(0, 3).forEach(key => {
  const link = products[key].asinLink;
  const asinMatch = link.match(/\/dp\/([A-Z0-9]{10})/);
  const asin = asinMatch ? asinMatch[1] : 'NOT FOUND';
  console.log(`${key}: ${asin} (${link ? 'HAS LINK' : 'NO LINK'})`);
});
