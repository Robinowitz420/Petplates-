// scripts/test-price-fetch.ts
// Test price fetching on a small subset of products

import * as fs from 'fs';
import * as path from 'path';
import { VETTED_PRODUCTS } from '../lib/data/vetted-products';
import { extractASIN } from '../lib/utils/affiliateLinks';

// Test with just 3 products
const TEST_PRODUCTS = ['ground chicken', 'sweet potato', 'carrots'];

async function testFetch() {
  console.log('🧪 Testing Price Fetching\n');
  
  for (const ingredient of TEST_PRODUCTS) {
    const product = VETTED_PRODUCTS[ingredient];
    if (!product?.asinLink) {
      console.log(`❌ ${ingredient}: No asinLink`);
      continue;
    }
    
    const asin = extractASIN(product.asinLink);
    if (!asin) {
      console.log(`❌ ${ingredient}: Could not extract ASIN`);
      continue;
    }
    
    console.log(`\n📦 ${ingredient}`);
    console.log(`   ASIN: ${asin}`);
    console.log(`   URL: ${product.asinLink}`);
    
    // Try HTTP fetch
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(product.asinLink, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      const html = await response.text();
      
      // Try to extract price
      const pricePatterns = [
        /<span[^>]*class="a-price[^"]*"[^>]*>[\s\S]*?<span[^>]*class="a-offscreen"[^>]*>([^<]+)<\/span>/i,
        /"price":\s*"([\d,]+\.?\d*)"/i,
        /\$([\d,]+\.?\d*)/i,
      ];
      
      let foundPrice = false;
      for (const pattern of pricePatterns) {
        const match = html.match(pattern);
        if (match) {
          const priceText = match[1].replace(/[^0-9.]/g, '');
          const price = parseFloat(priceText);
          if (price > 0 && price < 10000) {
            console.log(`   ✅ Price found: $${price.toFixed(2)}`);
            foundPrice = true;
            break;
          }
        }
      }
      
      if (!foundPrice) {
        console.log(`   ⚠️  Price not found in HTML`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  console.log('\n✅ Test complete\n');
}

testFetch().catch(console.error);

