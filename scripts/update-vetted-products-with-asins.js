// scripts/update-vetted-products-with-asins.js
// Updates vetted-products.ts to use direct ASIN links instead of search URLs

const fs = require('fs');
const path = require('path');

const ASINS_FILE = path.join(__dirname, '../asins-extracted.json');
const VETTED_PRODUCTS_FILE = path.join(__dirname, '../lib/data/vetted-products.ts');
const BACKUP_FILE = path.join(__dirname, '../lib/data/vetted-products.ts.backup');

// Normalize ingredient name for matching (lowercase, trim, handle variations)
function normalizeName(name) {
  return name.toLowerCase().trim();
}

// Create ASIN map from extracted data
function loadASINMap() {
  const asinsData = JSON.parse(fs.readFileSync(ASINS_FILE, 'utf8'));
  const asinMap = new Map();
  
  asinsData.forEach(item => {
    if (item.asin) {
      const normalizedName = normalizeName(item.name);
      // Store ASIN with direct product link format
      asinMap.set(normalizedName, {
        asin: item.asin,
        directLink: `https://www.amazon.com/dp/${item.asin}?tag=robinfrench-20`
      });
    }
  });
  
  return asinMap;
}

// Update vetted-products.ts file
function updateVettedProducts() {
  console.log('📖 Loading ASIN data...');
  const asinMap = loadASINMap();
  console.log(`✅ Loaded ${asinMap.size} ASIN mappings\n`);
  
  console.log('📖 Reading vetted-products.ts...');
  let content = fs.readFileSync(VETTED_PRODUCTS_FILE, 'utf8');
  
  // Create backup
  console.log('💾 Creating backup...');
  fs.writeFileSync(BACKUP_FILE, content);
  console.log(`✅ Backup saved to ${BACKUP_FILE}\n`);
  
  console.log('🔄 Updating Amazon links with direct ASIN links...\n');
  
  let updateCount = 0;
  let notFoundCount = 0;
  const notFound = [];
  
  // Match pattern: amazonLink: 'https://www.amazon.com/s?k=...&tag=robinfrench-20'
  // We need to find the ingredient name first, then update its amazonLink
  
  // Extract all ingredient entries and their current links
  const ingredientPattern = /'([^']+)':\s*\{[^}]*amazonLink:\s*'([^']+)'/g;
  const matches = [...content.matchAll(ingredientPattern)];
  
  matches.forEach(match => {
    const ingredientName = match[1];
    const currentLink = match[2];
    const normalizedName = normalizeName(ingredientName);
    
    // Skip if already a direct ASIN link
    if (currentLink.includes('/dp/') || currentLink.includes('/product/')) {
      return;
    }
    
    const asinData = asinMap.get(normalizedName);
    
    if (asinData) {
      // Replace the old search URL with direct ASIN link
      const oldLinkPattern = new RegExp(
        `(amazonLink:\\s*')${currentLink.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`,
        'g'
      );
      
      const newLink = asinData.directLink;
      content = content.replace(oldLinkPattern, `$1${newLink}'`);
      updateCount++;
      console.log(`  ✅ [${updateCount}] ${ingredientName} -> ${asinData.asin}`);
    } else {
      notFoundCount++;
      notFound.push(ingredientName);
      console.log(`  ⚠️  [NOT FOUND] ${ingredientName}`);
    }
  });
  
  // Update the comment at the top
  content = content.replace(
    /\/\/ Each ingredient maps to a specific, high-quality product with Amazon search URL/,
    '// Each ingredient maps to a specific, high-quality product with direct Amazon ASIN link'
  );
  
  // Write updated file
  console.log(`\n💾 Writing updated file...`);
  fs.writeFileSync(VETTED_PRODUCTS_FILE, content);
  
  console.log('\n✨ Update complete!\n');
  console.log('📊 STATISTICS:');
  console.log(`  ✅ Updated: ${updateCount} ingredients`);
  console.log(`  ⚠️  Not found: ${notFoundCount} ingredients`);
  
  if (notFound.length > 0) {
    console.log('\n⚠️  Ingredients without ASIN matches:');
    notFound.forEach(name => console.log(`    - ${name}`));
  }
  
  console.log(`\n💾 Backup saved to: ${BACKUP_FILE}`);
  console.log(`📁 Updated file: ${VETTED_PRODUCTS_FILE}`);
}

// Run it
try {
  updateVettedProducts();
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

