const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

/**
 * AUTOMATED PRICE & ASIN UPDATER
 *
 * This script will:
 * 1. Read your vetted-products file
 * 2. Search Amazon for each product by name
 * 3. Extract the correct ASIN and price
 * 4. Generate a new file with all prices and proper ASINs
 */

/**
 * @typedef {Object} VettedProduct
 * @property {string} productName
 * @property {string} amazonLink
 * @property {string} [asinLink]
 * @property {string} [chewyLink]
 * @property {Object} [price]
 * @property {number} price.amount
 * @property {string} price.currency
 * @property {string} vetNote
 * @property {string} [category]
 * @property {number} [commissionRate]
 * @property {number} [researchScore]
 */

/**
 * @typedef {Object} ProductSearchResult
 * @property {string} asin
 * @property {string} title
 * @property {number|null} price
 * @property {string} link
 * @property {number} matchScore
 */

/**
 * @typedef {Object} UpdateResult
 * @property {string} ingredient
 * @property {string} oldLink
 * @property {string} newASIN
 * @property {string} newLink
 * @property {number|null} price
 * @property {'success'|'failed'|'skipped'} status
 * @property {string} [reason]
 */

// ============================================================================
// STEP 1: Parse your vetted products file
// ============================================================================

function parseVettedProductsFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Try to extract the exported object
  // Look for pattern: export const VETTED_PRODUCTS = { ... }
  const match = content.match(/export\s+const\s+VETTED_PRODUCTS[\s\S]*?=\s*({[\s\S]+});?\s*$/m);

  if (!match) {
    console.log('No regex match found for VETTED_PRODUCTS export');
    throw new Error('Could not parse vetted products file. Make sure it exports a const object.');
  }
  console.log('Found VETTED_PRODUCTS export, length:', match[1].length);

  // This is a simplified parser - for production, use a proper JS parser
  // For now, we'll manually extract ingredient keys and product data
  const products = {};

  // Match each ingredient entry: 'ingredient-name': { ... }
  const ingredientRegex = /'([^']+)':\s*{([^}]+)}/gs;
  let ingredientMatch;
  let ingredientCount = 0;

  while ((ingredientMatch = ingredientRegex.exec(content)) !== null) {
    const ingredient = ingredientMatch[1];
    const productBlock = ingredientMatch[2];
    ingredientCount++;

    // Extract fields using regex
    const productNameMatch = productBlock.match(/productName:\s*'([^']+)'/);
    const amazonLinkMatch = productBlock.match(/amazonLink:\s*'([^']+)'/);
    const vetNoteMatch = productBlock.match(/vetNote:\s*'([^']+)'/);
    const categoryMatch = productBlock.match(/category:\s*'([^']+)'/);

    products[ingredient] = {
      productName: productNameMatch ? productNameMatch[1] : '',
      amazonLink: amazonLinkMatch ? amazonLinkMatch[1] : '',
      vetNote: vetNoteMatch ? vetNoteMatch[1] : '',
      category: categoryMatch ? categoryMatch[1] : undefined,
    };
  }

  console.log(`Parsed ${ingredientCount} ingredients into products object`);
  return products;
}

// ============================================================================
// STEP 2: Search Amazon for product
// ============================================================================

async function searchAmazonProduct(productName) {
  try {
    console.log(`  🔍 Searching Amazon for: "${productName}"`);

    // Search in pet-supplies department
    const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(productName)}&i=pet-supplies`;

    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);

    // Find the first valid product
    let bestMatch = null;
    let highestScore = 0;

    $('[data-component-type="s-search-result"]').each((i, element) => {
      if (i >= 5) return false; // Only check top 5 results

      const asin = $(element).attr('data-asin');
      if (!asin) return;

      const title = $(element).find('h2 span.a-text-normal').text().trim();
      const priceWhole = $(element).find('.a-price-whole').first().text().trim();
      const priceFraction = $(element).find('.a-price-fraction').first().text().trim();

      if (!title) return;

      // Calculate match score
      const score = calculateMatchScore(productName, title);

      // Parse price
      let price = null;
      if (priceWhole) {
        const priceStr = priceWhole.replace(/[^0-9.]/g, '') + (priceFraction || '');
        price = parseFloat(priceStr) || null;
      }

      const result = {
        asin,
        title,
        price,
        link: `https://www.amazon.com/dp/${asin}?tag=robinfrench-20`,
        matchScore: score
      };

      if (score > highestScore) {
        highestScore = score;
        bestMatch = result;
      }
    });

    if (bestMatch) {
      console.log(`  ✅ Found: ${bestMatch.title} (ASIN: ${bestMatch.asin}, Price: $${bestMatch.price?.toFixed(2) || 'N/A'})`);
      console.log(`  📊 Match score: ${bestMatch.matchScore}/100`);
    } else {
      console.log(`  ❌ No results found`);
    }

    return bestMatch;

  } catch (error) {
    console.error(`  ❌ Search failed: ${error.message}`);
    return null;
  }
}

// ============================================================================
// STEP 3: Get price from product page (fallback if search didn't work)
// ============================================================================

async function getPriceFromProductPage(asin) {
  try {
    const url = `https://www.amazon.com/dp/${asin}`;

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);

    // Try multiple price selectors
    const priceSelectors = [
      '.a-price.a-text-price .a-offscreen',
      '#priceblock_ourprice',
      '#priceblock_dealprice',
      '.a-price .a-offscreen',
      '#price_inside_buybox',
    ];

    for (const selector of priceSelectors) {
      const priceText = $(selector).first().text().trim();
      if (priceText) {
        const priceMatch = priceText.match(/[\d,]+\.?\d*/);
        if (priceMatch) {
          const price = parseFloat(priceMatch[0].replace(/,/g, ''));
          if (!isNaN(price) && price > 0) {
            return price;
          }
        }
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

// ============================================================================
// STEP 4: Calculate match score
// ============================================================================

function calculateMatchScore(productName, searchResultTitle) {
  let score = 0;
  const nameLower = productName.toLowerCase();
  const titleLower = searchResultTitle.toLowerCase();

  // Extract key words from product name
  const keyWords = nameLower
    .replace(/freeze dried|freeze-dried/gi, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !['the', 'for', 'and', 'with'].includes(w));

  // Check if brand name matches (high weight)
  const brandMatch = keyWords[0];
  if (titleLower.includes(brandMatch)) {
    score += 40;
  }

  // Check for all key words
  const matchedWords = keyWords.filter(word => titleLower.includes(word));
  score += (matchedWords.length / keyWords.length) * 40;

  // Bonus for pet-specific
  if (titleLower.includes('dog') || titleLower.includes('cat') || titleLower.includes('pet')) {
    score += 10;
  }

  // Bonus for quality indicators
  if (titleLower.includes('freeze dried') || titleLower.includes('freeze-dried')) score += 5;
  if (titleLower.includes('human grade') || titleLower.includes('human-grade')) score += 3;
  if (titleLower.includes('organic')) score += 2;

  return Math.min(100, Math.round(score));
}

// ============================================================================
// STEP 5: Process all products
// ============================================================================

async function processAllProducts(products) {
  const results = [];
  const ingredients = Object.keys(products);

  console.log(`\n🚀 Processing ${ingredients.length} products...\n`);

  for (let i = 0; i < ingredients.length; i++) {
    const ingredient = ingredients[i];
    const product = products[ingredient];

    console.log(`\n[${i + 1}/${ingredients.length}] ${ingredient}`);
    console.log(`  Current: ${product.productName}`);

    // Search for product
    const searchResult = await searchAmazonProduct(product.productName);

    if (!searchResult) {
      results.push({
        ingredient,
        oldLink: product.amazonLink,
        newASIN: 'NOT_FOUND',
        newLink: product.amazonLink,
        price: null,
        status: 'failed',
        reason: 'No search results found'
      });

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      continue;
    }

    // If search found a result but no price, try scraping product page
    let finalPrice = searchResult.price;
    if (!finalPrice) {
      console.log(`  💰 Fetching price from product page...`);
      finalPrice = await getPriceFromProductPage(searchResult.asin);
      if (finalPrice) {
        console.log(`  ✅ Found price: $${finalPrice.toFixed(2)}`);
      }
    }

    results.push({
      ingredient,
      oldLink: product.amazonLink,
      newASIN: searchResult.asin,
      newLink: searchResult.link,
      price: finalPrice,
      status: 'success',
      reason: `Match score: ${searchResult.matchScore}/100`
    });

    // Rate limiting (important!)
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  return results;
}

// ============================================================================
// STEP 6: Generate updated file
// ============================================================================

function generateUpdatedFile(originalProducts, results) {
  let output = `// lib/data/vetted-products-UPDATED.ts
// AUTO-GENERATED with prices and correct ASINs
// Generated: ${new Date().toISOString()}

export const VETTED_PRODUCTS = {\n`;

  // Create a map of updates
  const updatesMap = new Map();
  results.forEach(r => updatesMap.set(r.ingredient, r));

  for (const [ingredient, product] of Object.entries(originalProducts)) {
    const update = updatesMap.get(ingredient);

    output += `  '${ingredient}': {\n`;
    output += `    productName: '${product.productName}',\n`;

    // Use updated ASIN if available
    if (update && update.status === 'success') {
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

    if (product.chewyLink) {
      output += `    chewyLink: '${product.chewyLink}',\n`;
    }

    output += `    vetNote: '${product.vetNote}',\n`;

    if (product.category) {
      output += `    category: '${product.category}',\n`;
    }

    if (product.commissionRate !== undefined) {
      output += `    commissionRate: ${product.commissionRate},\n`;
    }

    if (product.researchScore !== undefined) {
      output += `    researchScore: ${product.researchScore}\n`;
    }

    output += `  },\n`;
  }

  output += `};\n`;

  return output;
}

// ============================================================================
// STEP 7: Generate report
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

## Successful Updates

`;

  withPrice.forEach((r, i) => {
    report += `### ${i + 1}. ${r.ingredient}
- **ASIN:** ${r.newASIN}
- **Price:** $${r.price?.toFixed(2)}
- **Reason:** ${r.reason}

`;
  });

  if (withoutPrice.length > 0) {
    report += `\n## Updated (No Price Found)\n\n`;
    withoutPrice.forEach((r, i) => {
      report += `### ${i + 1}. ${r.ingredient}
- **ASIN:** ${r.newASIN}
- **Reason:** ${r.reason}

`;
    });
  }

  if (failed.length > 0) {
    report += `\n## Failed Updates\n\n`;
    failed.forEach((r, i) => {
      report += `### ${i + 1}. ${r.ingredient}
- **Reason:** ${r.reason}

`;
    });
  }

  return report;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  const inputFile = 'lib/data/vetted-products.ts';
  const outputFile = 'lib/data/vetted-products-UPDATED.ts';
  const reportFile = 'PRICE-ASIN-UPDATE-REPORT.md';

  console.log('🚀 AUTOMATED PRICE & ASIN UPDATER\n');
  console.log('━'.repeat(60));
  console.log(`📁 Input:  ${inputFile}`);
  console.log(`📁 Output: ${outputFile}`);
  console.log(`📁 Report: ${reportFile}`);
  console.log('━'.repeat(60));

  try {
    // Step 1: Parse input file
    console.log('\n📖 Step 1: Reading vetted-products file...');
    const products = parseVettedProductsFile(inputFile);
    console.log('Products parsed:', typeof products, products === null ? 'null' : 'object');
    const count = Object.keys(products).length;
    console.log(`✅ Found ${count} products\n`);

    if (count === 0) {
      console.log('❌ No products found in file. Check file format.');
      return;
    }

    // Step 2: Process products
    console.log('🔧 Step 2: Searching Amazon and extracting prices...');
    console.log('⚠️  This will take a while (rate limiting: 3s per product)');
    console.log(`⏱️  Estimated time: ${Math.ceil((count * 3) / 60)} minutes\n`);

    const results = await processAllProducts(products);

    // Step 3: Generate updated file
    console.log('\n💾 Step 3: Generating updated file...');
    const updatedContent = generateUpdatedFile(products, results);
    fs.writeFileSync(outputFile, updatedContent);
    console.log(`✅ Saved to: ${outputFile}`);

    // Step 4: Generate report
    console.log('\n📊 Step 4: Generating report...');
    const report = generateReport(results);
    fs.writeFileSync(reportFile, report);
    console.log(`✅ Saved to: ${reportFile}`);

    // Summary
    const successful = results.filter(r => r.status === 'success').length;
    const withPrice = results.filter(r => r.status === 'success' && r.price !== null).length;

    console.log('\n🎉 DONE!\n');
    console.log('━'.repeat(60));
    console.log(`✅ Successfully updated: ${successful}/${count}`);
    console.log(`💰 Found prices for: ${withPrice}/${count}`);
    console.log('━'.repeat(60));

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run it!
main();
