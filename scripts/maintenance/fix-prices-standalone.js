// fix-prices-standalone.js
// Standalone script to update vetted products with prices and ASINs
// Uses GENERIC ingredient names for Amazon searches
// Run with: node fix-prices-standalone.js

import fs from 'fs';
import https from 'https';
import http from 'http';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  inputFile: './lib/data/vetted-products.txt',  // Your current file
  outputFile: './lib/data/vetted-products-UPDATED.txt',
  reportFile: './PRICE-ASIN-REPORT.md',
  delayBetweenRequests: 3000, // 3 seconds (don't change - rate limiting)
  maxRetries: 2,
};

// ============================================================================
// GENERIC INGREDIENT NAME EXTRACTION
// ============================================================================

/**
 * Extracts the generic ingredient name from the key.
 * Examples:
 *   'ground-chicken' -> 'ground chicken'
 *   'chicken-breast' -> 'chicken breast'
 *   'salmon-(boneless)' -> 'salmon'
 */
function getGenericIngredientName(key) {
  return key
    .replace(/-/g, ' ')           // Replace hyphens with spaces
    .replace(/\(.*?\)/g, '')      // Remove parentheses content
    .replace(/\s+/g, ' ')         // Normalize spaces
    .trim();
}

// ============================================================================
// HTTP REQUEST HELPER
// ============================================================================

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
      },
      timeout: 15000,
    };
    
    protocol.get(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// ============================================================================
// PARSE VETTED PRODUCTS FILE
// ============================================================================

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
      const amazonLinkMatch = block.match(/amazonLink:\s*'([^']+)'/);
      const vetNoteMatch = block.match(/vetNote:\s*'([^']+)'/);
      const categoryMatch = block.match(/category:\s*'([^']+)'/);
      
      products[ingredient] = {
        productName: productNameMatch ? productNameMatch[1] : '',
        amazonLink: amazonLinkMatch ? amazonLinkMatch[1] : '',
        vetNote: vetNoteMatch ? vetNoteMatch[1] : '',
        category: categoryMatch ? categoryMatch[1] : 'other',
      };
    }
  }
  
  console.log(`✅ Found ${Object.keys(products).length} products\n`);
  return products;
}

// ============================================================================
// SEARCH AMAZON USING GENERIC INGREDIENT NAME
// ============================================================================

async function searchAmazonByGenericName(ingredientKey, retryCount = 0) {
  const genericName = getGenericIngredientName(ingredientKey);
  
  try {
    console.log(`  🔍 Searching for: "${genericName}"`);
    
    // Search in pet-supplies category
    const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(genericName)}&i=pet-supplies`;
    const html = await makeRequest(searchUrl);
    
    // Extract first product ASIN and price
    const asinMatch = html.match(/data-asin="([A-Z0-9]{10})"/);
    if (!asinMatch) {
      console.log(`  ❌ No ASIN found`);
      return null;
    }
    
    const asin = asinMatch[1];
    
    // Try to extract price from search results
    const pricePattern = new RegExp(`data-asin="${asin}"[\\s\\S]{0,1000}?\\$([\\d,]+\\.\\d{2})`);
    const priceMatch = html.match(pricePattern);
    
    let price = null;
    if (priceMatch) {
      price = parseFloat(priceMatch[1].replace(/,/g, ''));
    }
    
    // Try to get title
    const titlePattern = new RegExp(`data-asin="${asin}"[\\s\\S]{0,500}?<span class="a-size-[^"]*">([^<]+)</span>`);
    const titleMatch = html.match(titlePattern);
    const title = titleMatch ? titleMatch[1].trim() : 'Unknown Product';
    
    console.log(`  ✅ Found: ${title}`);
    console.log(`  📦 ASIN: ${asin}`);
    
    if (price) {
      console.log(`  💰 Price: $${price.toFixed(2)}`);
    } else {
      console.log(`  ⚠️  No price found in search, will try product page...`);
      price = await getPriceFromProductPage(asin);
      if (price) {
        console.log(`  💰 Price from product page: $${price.toFixed(2)}`);
      }
    }
    
    return {
      asin,
      title,
      price,
      link: `https://www.amazon.com/dp/${asin}?tag=robinfrench-20`,
    };
    
  } catch (error) {
    if (retryCount < CONFIG.maxRetries) {
      console.log(`  ⚠️  Error, retrying (${retryCount + 1}/${CONFIG.maxRetries})...`);
      await sleep(5000);
      return searchAmazonByGenericName(ingredientKey, retryCount + 1);
    }
    console.error(`  ❌ Search failed: ${error.message}`);
    return null;
  }
}

// ============================================================================
// GET PRICE FROM PRODUCT PAGE
// ============================================================================

async function getPriceFromProductPage(asin) {
  try {
    const url = `https://www.amazon.com/dp/${asin}`;
    const html = await makeRequest(url);
    
    // Try multiple price patterns
    const pricePatterns = [
      /<span class="a-price-whole">([\d,]+)<\/span><span class="a-price-fraction">(\d{2})<\/span>/,
      /<span id="priceblock_ourprice"[^>]*>\$([\d,]+\.?\d{2})<\/span>/,
      /<span id="priceblock_dealprice"[^>]*>\$([\d,]+\.?\d{2})<\/span>/,
      /<span class="a-offscreen">\$([\d,]+\.?\d{2})<\/span>/,
    ];
    
    for (const pattern of pricePatterns) {
      const match = html.match(pattern);
      if (match) {
        let priceStr;
        if (match.length === 3) {
          // Whole + fraction pattern
          priceStr = match[1].replace(/,/g, '') + '.' + match[2];
        } else {
          priceStr = match[1].replace(/,/g, '');
        }
        const price = parseFloat(priceStr);
        if (!isNaN(price) && price > 0) {
          return price;
        }
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

// ============================================================================
// PROCESS ALL PRODUCTS
// ============================================================================

async function processAllProducts(products) {
  const results = [];
  const ingredients = Object.keys(products);
  
  console.log(`\n🚀 Processing ${ingredients.length} products...\n`);
  console.log(`⏱️  Estimated time: ${Math.ceil((ingredients.length * CONFIG.delayBetweenRequests) / 60000)} minutes\n`);
  
  for (let i = 0; i < ingredients.length; i++) {
    const ingredient = ingredients[i];
    const product = products[ingredient];
    
    console.log(`\n[${i + 1}/${ingredients.length}] ${ingredient}`);
    console.log(`  Generic name: "${getGenericIngredientName(ingredient)}"`);
    
    // Search using generic ingredient name
    const searchResult = await searchAmazonByGenericName(ingredient);
    
    if (!searchResult) {
      results.push({
        ingredient,
        genericName: getGenericIngredientName(ingredient),
        oldLink: product.amazonLink,
        newASIN: null,
        newLink: null,
        price: null,
        status: 'failed',
        reason: 'No search results found',
      });
      
      // Rate limiting
      await sleep(CONFIG.delayBetweenRequests);
      continue;
    }
    
    results.push({
      ingredient,
      genericName: getGenericIngredientName(ingredient),
      oldLink: product.amazonLink,
      newASIN: searchResult.asin,
      newLink: searchResult.link,
      price: searchResult.price,
      title: searchResult.title,
      status: 'success',
    });
    
    // Rate limiting (IMPORTANT!)
    await sleep(CONFIG.delayBetweenRequests);
  }
  
  return results;
}

// ============================================================================
// GENERATE UPDATED FILE
// ============================================================================

function generateUpdatedFile(originalProducts, results) {
  const updatesMap = new Map();
  results.forEach(r => updatesMap.set(r.ingredient, r));
  
  let output = `// lib/data/vetted-products-UPDATED.txt
// AUTO-GENERATED with prices and correct ASINs
// Generated: ${new Date().toISOString()}
// Searched using GENERIC ingredient names

export const VETTED_PRODUCTS = {\n`;
  
  for (const [ingredient, product] of Object.entries(originalProducts)) {
    const update = updatesMap.get(ingredient);
    
    output += `  '${ingredient}': {\n`;
    output += `    productName: '${product.productName}',\n`;
    
    // Use updated ASIN if available
    if (update && update.status === 'success' && update.newASIN) {
      output += `    amazonLink: '${update.newLink}',\n`;
      output += `    asinLink: '${update.newLink}',\n`;
      
      // Add price if available
      if (update.price !== null) {
        output += `    price: {\n`;
        output += `      amount: ${update.price.toFixed(2)},\n`;
        output += `      currency: 'USD'\n`;
        output += `    },\n`;
      }
    } else {
      output += `    amazonLink: '${product.amazonLink}',\n`;
      output += `    asinLink: '${product.amazonLink}',\n`;
    }
    
    output += `    vetNote: '${product.vetNote.replace(/'/g, "\\'")}',\n`;
    output += `    category: '${product.category}',\n`;
    output += `    commissionRate: 0.03\n`;
    output += `  },\n`;
  }
  
  output += `};\n`;
  
  return output;
}

// ============================================================================
// GENERATE REPORT
// ============================================================================

function generateReport(results) {
  const successful = results.filter(r => r.status === 'success');
  const failed = results.filter(r => r.status === 'failed');
  const withPrice = successful.filter(r => r.price !== null);
  const withoutPrice = successful.filter(r => r.price === null);
  
  let report = `# Price & ASIN Update Report
Generated: ${new Date().toLocaleString()}

## Summary
- Total Products: ${results.length}
- ✅ Successfully Updated: ${successful.length}
- ❌ Failed: ${failed.length}
- 💰 With Prices: ${withPrice.length}
- ⚠️  Without Prices: ${withoutPrice.length}

## Successful Updates (With Prices)

`;

  withPrice.forEach((r, i) => {
    report += `### ${i + 1}. ${r.ingredient}
- **Generic Search:** "${r.genericName}"
- **Found:** ${r.title}
- **ASIN:** ${r.newASIN}
- **Price:** $${r.price.toFixed(2)}
- **Link:** ${r.newLink}

`;
  });
  
  if (withoutPrice.length > 0) {
    report += `\n## Updated (No Price Found)\n\n`;
    withoutPrice.forEach((r, i) => {
      report += `### ${i + 1}. ${r.ingredient}
- **Generic Search:** "${r.genericName}"
- **ASIN:** ${r.newASIN}
- **Link:** ${r.newLink}

`;
    });
  }
  
  if (failed.length > 0) {
    report += `\n## Failed Updates (Need Manual Fix)\n\n`;
    failed.forEach((r, i) => {
      report += `### ${i + 1}. ${r.ingredient}
- **Generic Search:** "${r.genericName}"
- **Reason:** ${r.reason}
- **Old Link:** ${r.oldLink}

`;
    });
  }
  
  return report;
}

// ============================================================================
// HELPERS
// ============================================================================

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('🚀 AUTOMATED PRICE & ASIN UPDATER (Standalone)\n');
  console.log('━'.repeat(60));
  console.log(`📁 Input:  ${CONFIG.inputFile}`);
  console.log(`📁 Output: ${CONFIG.outputFile}`);
  console.log(`📁 Report: ${CONFIG.reportFile}`);
  console.log('━'.repeat(60));
  
  try {
    // Check if input file exists
    if (!fs.existsSync(CONFIG.inputFile)) {
      console.error(`\n❌ ERROR: Input file not found: ${CONFIG.inputFile}`);
      console.error('Please update CONFIG.inputFile with the correct path.\n');
      process.exit(1);
    }
    
    // Step 1: Parse input file
    const products = parseVettedProductsFile(CONFIG.inputFile);
    
    if (Object.keys(products).length === 0) {
      console.log('❌ No products found in file. Check file format.');
      process.exit(1);
    }
    
    // Step 2: Process products
    console.log('🔧 Searching Amazon using GENERIC ingredient names...');
    console.log('⚠️  This uses rate limiting (3s per product) to avoid blocking\n');
    
    const results = await processAllProducts(products);
    
    // Step 3: Generate updated file
    console.log('\n💾 Generating updated file...');
    const updatedContent = generateUpdatedFile(products, results);
    fs.writeFileSync(CONFIG.outputFile, updatedContent);
    console.log(`✅ Saved to: ${CONFIG.outputFile}`);
    
    // Step 4: Generate report
    console.log('\n📊 Generating report...');
    const report = generateReport(results);
    fs.writeFileSync(CONFIG.reportFile, report);
    console.log(`✅ Saved to: ${CONFIG.reportFile}`);
    
    // Summary
    const successful = results.filter(r => r.status === 'success').length;
    const withPrice = results.filter(r => r.status === 'success' && r.price !== null).length;
    
    console.log('\n🎉 DONE!\n');
    console.log('━'.repeat(60));
    console.log(`✅ Successfully updated: ${successful}/${results.length}`);
    console.log(`💰 Found prices for: ${withPrice}/${results.length}`);
    console.log('━'.repeat(60));
    console.log('\n📋 Next steps:');
    console.log('1. Review the report: ' + CONFIG.reportFile);
    console.log('2. Check the updated file: ' + CONFIG.outputFile);
    console.log('3. Manually fix any failed items');
    console.log('4. Replace your old file with the updated one\n');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run it!
main();