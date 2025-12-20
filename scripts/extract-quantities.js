#!/usr/bin/env node

/**
 * Extract product quantities from Amazon product pages
 * Uses ASIN to fetch product details and extract package size information
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const PRODUCT_PRICES_PATH = path.join(__dirname, '../data/product-prices.json');

// Common quantity patterns to look for in product titles and descriptions
const QUANTITY_PATTERNS = [
  /(\d+(?:\.\d+)?)\s*(oz|ounce|fl oz|fluid ounce)/i,
  /(\d+(?:\.\d+)?)\s*(lb|lbs|pound|pounds)/i,
  /(\d+(?:\.\d+)?)\s*(kg|kilogram)/i,
  /(\d+(?:\.\d+)?)\s*(g|gram)/i,
  /(\d+)\s*(pack|count|piece|pieces)/i,
  /(\d+)\s*(can|cans)/i,
  /(\d+)\s*(bottle|bottles)/i,
  /(\d+)\s*(jar|jars)/i,
  /(\d+)\s*(box|boxes)/i,
  /(\d+)\s*(bag|bags)/i,
];

/**
 * Fetch product details from Amazon using ASIN
 * Note: This uses a simple approach - for production, consider using Amazon Product Advertising API
 */
async function fetchProductDetails(asin) {
  return new Promise((resolve) => {
    const url = `https://www.amazon.com/dp/${asin}`;
    
    const options = {
      hostname: 'www.amazon.com',
      path: `/dp/${asin}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 5000
    };

    https.get(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          // Extract quantity from common patterns in the HTML
          const quantity = extractQuantityFromHTML(data);
          resolve(quantity);
        } catch (error) {
          console.error(`Error parsing ASIN ${asin}:`, error.message);
          resolve(null);
        }
      });
    }).on('error', (error) => {
      console.error(`Error fetching ASIN ${asin}:`, error.message);
      resolve(null);
    }).on('timeout', () => {
      console.warn(`Timeout fetching ASIN ${asin}`);
      resolve(null);
    });
  });
}

/**
 * Extract quantity from HTML content
 */
function extractQuantityFromHTML(html) {
  // Look for common quantity indicators in the page
  // This is a simplified approach - real implementation would need more sophisticated parsing
  
  // Try to find quantity in title
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch) {
    const quantity = extractQuantityFromText(titleMatch[1]);
    if (quantity) return quantity;
  }

  // Try to find in product details section
  const detailsMatch = html.match(/About this item[\s\S]{0,2000}?<\/ul>/i);
  if (detailsMatch) {
    const quantity = extractQuantityFromText(detailsMatch[0]);
    if (quantity) return quantity;
  }

  // Try to find in feature bullets
  const bulletsMatch = html.match(/<ul[^>]*class="[^"]*feature[^"]*"[\s\S]{0,3000}?<\/ul>/i);
  if (bulletsMatch) {
    const quantity = extractQuantityFromText(bulletsMatch[0]);
    if (quantity) return quantity;
  }

  return null;
}

/**
 * Extract quantity from text using regex patterns
 */
function extractQuantityFromText(text) {
  // Remove HTML tags
  const cleanText = text.replace(/<[^>]+>/g, ' ');

  for (const pattern of QUANTITY_PATTERNS) {
    const match = cleanText.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }

  return null;
}

/**
 * Main function to process all products
 */
async function processProducts() {
  console.log('Reading product-prices.json...');
  
  const data = fs.readFileSync(PRODUCT_PRICES_PATH, 'utf8');
  const products = JSON.parse(data);

  console.log(`Found ${products.length} products`);
  console.log('Fetching quantities from Amazon (this may take a while)...\n');

  let updated = 0;
  let skipped = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    
    // Skip if already has quantity
    if (product.quantity) {
      console.log(`[${i + 1}/${products.length}] ✓ ${product.ingredient} - Already has quantity: "${product.quantity}"`);
      skipped++;
      continue;
    }

    // Extract ASIN from URL
    const asinMatch = product.url?.match(/\/dp\/([A-Z0-9]{10})/);
    if (!asinMatch) {
      console.log(`[${i + 1}/${products.length}] ✗ ${product.ingredient} - No ASIN found`);
      continue;
    }

    const asin = asinMatch[1];
    console.log(`[${i + 1}/${products.length}] Fetching ${product.ingredient} (${asin})...`);

    const quantity = await fetchProductDetails(asin);
    
    if (quantity) {
      product.quantity = quantity;
      updated++;
      console.log(`  ✓ Found: "${quantity}"\n`);
    } else {
      console.log(`  ⚠ Could not extract quantity\n`);
    }

    // Rate limiting - wait between requests
    if (i < products.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log(`\n✓ Updated ${updated} products with quantities`);
  console.log(`⊘ Skipped ${skipped} products (already had quantities)`);

  // Save updated products
  console.log('\nSaving updated product-prices.json...');
  fs.writeFileSync(PRODUCT_PRICES_PATH, JSON.stringify(products, null, 2));
  console.log('✓ Done!');
}

// Run the script
processProducts().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
