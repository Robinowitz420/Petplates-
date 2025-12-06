// scripts/update-vetted-products-by-link.js
// Updates vetted-products.ts by matching the original Amazon links, not ingredient names

const fs = require('fs');
const path = require('path');

const ASINS_FILE = path.join(__dirname, '../asins-extracted.json');
const VETTED_PRODUCTS_FILE = path.join(__dirname, '../lib/data/vetted-products.ts');
const BACKUP_FILE = path.join(__dirname, '../lib/data/vetted-products.ts.backup');

// Create ASIN map from extracted data - keyed by original Amazon link
function loadASINMap() {
  const asinsData = JSON.parse(fs.readFileSync(ASINS_FILE, 'utf8'));
  const asinMap = new Map();
  
  asinsData.forEach(item => {
    if (item.asin && item.link) {
      // Use the original Amazon link as the key
      // Normalize the link (remove trailing slashes, normalize spaces in URLs)
      const normalizedLink = item.link.trim();
      asinMap.set(normalizedLink, {
        asin: item.asin,
        directLink: `https://www.amazon.com/dp/${item.asin}?tag=robinfrench-20`
      });
    }
  });
  
  return asinMap;
}

// Update vetted-products.ts file by matching links
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
  
  console.log('🔄 Updating Amazon links by matching ingredient names from ASIN data...\n');
  
  let updateCount = 0;
  let alreadyCorrectCount = 0;
  let notFoundCount = 0;
  const notFound = [];
  
  // Strategy: For each entry in asins-extracted.json, find the matching ingredient in vetted-products.ts
  // by ingredient name and replace its amazonLink with the correct ASIN link
  // We update ALL entries to ensure they all have the correct ASINs from the extraction process
  
  const asinsData = JSON.parse(fs.readFileSync(ASINS_FILE, 'utf8'));
  console.log(`📋 Processing ${asinsData.length} ASIN entries...\n`);
  
  asinsData.forEach(item => {
    if (!item.name || !item.asin || !item.link) {
      return;
    }
    
    const ingredientName = item.name;
    const normalizedName = ingredientName.toLowerCase().trim();
    const correctASIN = item.asin;
    const correctLink = `https://www.amazon.com/dp/${correctASIN}?tag=robinfrench-20`;
    
    let updated = false;
    
    // Strategy 1: Try exact ingredient name match
    const escapedName = ingredientName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const exactPattern = new RegExp(
      `('${escapedName}':\\s*\\{[^}]*amazonLink:\\s*')([^']+)'`,
      'g'
    );
    
    const exactMatch = exactPattern.exec(content);
    if (exactMatch) {
      const currentLink = exactMatch[2];
      
      // Always update to ensure we have the correct ASIN (even if it looks correct)
      if (currentLink !== correctLink) {
        content = content.replace(exactPattern, `$1${correctLink}'`);
        updateCount++;
        console.log(`  ✅ [${updateCount}] ${ingredientName} -> ${correctASIN}`);
        updated = true;
      } else {
        alreadyCorrectCount++;
        updated = true; // Mark as found, even if already correct
      }
    }
    
    // Strategy 2: Try normalized name (case-insensitive, handles whitespace)
    if (!updated) {
      const escapedNormalizedName = normalizedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const normalizedPattern = new RegExp(
        `('${escapedNormalizedName}':\\s*\\{[^}]*amazonLink:\\s*')([^']+)'`,
        'gi'
      );
      
      const normalizedMatch = normalizedPattern.exec(content);
      if (normalizedMatch) {
        const currentLink = normalizedMatch[2];
        if (currentLink !== correctLink) {
          content = content.replace(normalizedPattern, `$1${correctLink}'`);
          updateCount++;
          console.log(`  ✅ [${updateCount}] ${ingredientName} (normalized) -> ${correctASIN}`);
          updated = true;
        } else {
          alreadyCorrectCount++;
          updated = true; // Mark as found, even if already correct
        }
      }
    }
    
    // Strategy 3: Try matching by original URL in the file
    if (!updated) {
      const originalSearchUrl = item.link.trim();
      // Escape special regex characters in URL
      const escapedUrl = originalSearchUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const urlPattern = new RegExp(
        `(amazonLink:\\s*')${escapedUrl}'`,
        'g'
      );
      
      if (urlPattern.test(content)) {
        content = content.replace(urlPattern, `$1${correctLink}'`);
        updateCount++;
        console.log(`  ✅ [${updateCount}] ${ingredientName} (by URL match) -> ${correctASIN}`);
        updated = true;
      }
    }
    
    // If still not found, add to not found list
    if (!updated) {
      notFoundCount++;
      notFound.push(ingredientName);
    }
  });
  
  // Update the comment at the top
  content = content.replace(
    /\/\/ Each ingredient maps to a specific, high-quality product with (Amazon search URL|direct Amazon ASIN link)/,
    '// Each ingredient maps to a specific, high-quality product with direct Amazon ASIN link'
  );
  
  // Write updated file
  console.log(`\n💾 Writing updated file...`);
  fs.writeFileSync(VETTED_PRODUCTS_FILE, content);
  
  console.log('\n✨ Update complete!\n');
  console.log('📊 STATISTICS:');
  console.log(`  ✅ Updated: ${updateCount} links`);
  console.log(`  ✓ Already correct: ${alreadyCorrectCount} links`);
  console.log(`  ⚠️  Not found: ${notFoundCount} links`);
  
  if (notFound.length > 0 && notFound.length <= 20) {
    console.log('\n⚠️  Links without ASIN matches:');
    notFound.forEach(link => console.log(`    - ${link.substring(0, 100)}`));
  } else if (notFound.length > 20) {
    console.log(`\n⚠️  ${notFound.length} links without ASIN matches (too many to display)`);
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

