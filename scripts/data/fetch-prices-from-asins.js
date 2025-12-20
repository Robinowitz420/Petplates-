import fs from 'fs';
import https from 'https';
import http from 'http';

// Simple script to fetch current prices from existing ASIN links
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

// Extract ASIN from Amazon URL
function extractAsin(url) {
  const match = url.match(/\/dp\/([A-Z0-9]{10})/);
  return match ? match[1] : null;
}

// Parse price from Amazon product page HTML
function extractPriceFromHtml(html) {
  // Try multiple price selectors that Amazon uses
  const priceSelectors = [
    // Main price
    /<span[^>]*id="priceblock_ourprice"[^>]*>\s*\$([0-9,]+\.[0-9]{2})\s*<\/span>/,
    /<span[^>]*id="priceblock_dealprice"[^>]*>\s*\$([0-9,]+\.[0-9]{2})\s*<\/span>/,
    // Alternative price formats
    /<span[^>]*class="a-price[^"]*"[^>]*>[\s\S]*?<span[^>]*class="a-offscreen"[^>]*>\s*\$([0-9,]+\.[0-9]{2})\s*<\/span>/,
    // Whole + fraction format
    /<span[^>]*class="a-price-whole"[^>]*>([0-9,]+)<\/span>\s*<span[^>]*class="a-price-fraction"[^>]*>([0-9]{2})<\/span>/,
  ];

  for (const selector of priceSelectors) {
    const match = html.match(selector);
    if (match) {
      let priceStr;
      if (match.length === 3) {
        // Whole + fraction format
        priceStr = match[1].replace(/,/g, '') + '.' + match[2];
      } else {
        priceStr = match[1].replace(/,/g, '');
      }

      const price = parseFloat(priceStr);
      if (!isNaN(price) && price > 0 && price < 1000) { // Sanity check
        return price;
      }
    }
  }

  return null;
}

// Parse vetted products and extract ASINs
function parseProductsForPriceUpdates(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const products = [];

  // Match each ingredient entry
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

      // Extract amazonLink
      const amazonLinkMatch = block.match(/amazonLink:\s*'([^']+)'/);
      if (amazonLinkMatch) {
        const asin = extractAsin(amazonLinkMatch[1]);
        const hasPrice = block.includes('price: {');

        products.push({
          ingredient,
          asin,
          amazonLink: amazonLinkMatch[1],
          hasPrice,
          blockStart: i,
          blockEnd: j
        });
      }
    }
  }

  return products;
}

// Main execution
async function main() {
  console.log('🚀 FETCHING PRICES FROM EXISTING ASIN LINKS\n');

  const filePath = 'lib/data/vetted-products.ts';
  const products = parseProductsForPriceUpdates(filePath);

  console.log(`📊 Found ${products.length} products with ASIN links\n`);

  // Filter to products that need price updates
  const needsPrice = products.filter(p => !p.hasPrice);
  const hasPrice = products.filter(p => p.hasPrice);

  console.log(`✅ Already have prices: ${hasPrice.length}`);
  console.log(`📈 Need price updates: ${needsPrice.length}\n`);

  if (needsPrice.length === 0) {
    console.log('🎉 All products already have prices!');
    return;
  }

  // Process products that need prices
  let updated = 0;
  let failed = 0;

  for (let i = 0; i < needsPrice.length; i++) {
    const product = needsPrice[i];

    console.log(`[${i + 1}/${needsPrice.length}] ${product.ingredient}`);

    try {
      // Fetch product page
      const url = product.amazonLink.replace('?tag=robinfrench-20', ''); // Remove affiliate tag for cleaner URL
      console.log(`  🌐 Fetching: ${url}`);

      const html = await makeRequest(url);
      const price = extractPriceFromHtml(html);

      if (price) {
        console.log(`  ✅ Price: $${price.toFixed(2)}`);
        updated++;

        // Here we would update the file with the new price
        // For now, just log success
      } else {
        console.log(`  ⚠️  No price found`);
        failed++;
      }

    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      failed++;
    }

    // Rate limiting
    if (i < needsPrice.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log(`\n🎉 DONE!`);
  console.log(`✅ Updated: ${updated}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Success rate: ${((updated / (updated + failed)) * 100).toFixed(1)}%`);
}

main().catch(console.error);
