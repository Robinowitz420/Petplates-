import https from 'https';
import http from 'http';

// Quick test of Amazon search functionality
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

// Test Amazon search for one ingredient
async function testAmazonSearch() {
  const ingredient = 'ground chicken';
  console.log(`🔍 Testing Amazon search for: "${ingredient}"`);

  try {
    // Search in pet-supplies department
    const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(ingredient)}&i=pet-supplies`;
    console.log(`URL: ${searchUrl}`);

    const html = await makeRequest(searchUrl);
    console.log(`Response length: ${html.length} characters`);

    // Extract first product ASIN
    const asinMatch = html.match(/data-asin="([A-Z0-9]{10})"/);
    if (asinMatch) {
      const asin = asinMatch[1];
      console.log(`✅ Found ASIN: ${asin}`);

      // Try to extract price
      const priceMatch = html.match(/data-asin="${asin}"[\s\S]{0,1000}?\$([0-9,]+\.[0-9]{2})/);
      if (priceMatch) {
        console.log(`💰 Found price: $${priceMatch[1]}`);
      } else {
        console.log(`⚠️  No price found in search results`);
      }
    } else {
      console.log(`❌ No ASIN found in search results`);
    }

  } catch (error) {
    console.error(`❌ Search failed: ${error.message}`);
  }
}

testAmazonSearch();
