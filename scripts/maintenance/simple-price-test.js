import https from 'https';

// Test fetching price from a single known ASIN
async function testSinglePrice() {
  const asin = 'B0BXZVFN6G'; // Fresh Is Best Freeze Dried Chicken Breast
  const url = `https://www.amazon.com/dp/${asin}`;

  console.log(`Testing price fetch for ASIN: ${asin}`);
  console.log(`URL: ${url}`);

  try {
    const html = await new Promise((resolve, reject) => {
      https.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        timeout: 15000,
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve(data));
      }).on('error', reject);
    });

    console.log(`Response received, length: ${html.length}`);

    // Look for price patterns
    const pricePatterns = [
      /id="priceblock_ourprice"[^>]*>\s*\$([0-9,]+\.[0-9]{2})\s*</,
      /id="priceblock_dealprice"[^>]*>\s*\$([0-9,]+\.[0-9]{2})\s*</,
      /class="a-price[^"]*"[^>]*>[\s\S]*?class="a-offscreen"[^>]*>\s*\$([0-9,]+\.[0-9]{2})\s*</,
    ];

    for (let i = 0; i < pricePatterns.length; i++) {
      const match = html.match(pricePatterns[i]);
      if (match) {
        console.log(`✅ Pattern ${i + 1} found: $${match[1]}`);
        return;
      }
    }

    // Look for any dollar amounts as fallback
    const dollarMatches = html.match(/\$([0-9,]+\.[0-9]{2})/g);
    if (dollarMatches) {
      console.log(`💰 Found dollar amounts: ${dollarMatches.slice(0, 3).join(', ')}`);
    } else {
      console.log(`❌ No dollar amounts found in HTML`);
    }

    // Check if it's a product page
    if (html.includes('priceblock')) {
      console.log(`📦 This appears to be a product page (found priceblock)`);
    } else {
      console.log(`❓ This might not be a product page (no priceblock found)`);
    }

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

testSinglePrice();
