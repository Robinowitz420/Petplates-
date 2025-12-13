// scripts/fetch-product-prices-batch.ts
// Fetch prices for first 5 products as a test

import * as fs from 'fs';
import * as path from 'path';
import { VETTED_PRODUCTS } from '../lib/data/vetted-products';
import { extractASIN } from '../lib/utils/affiliateLinks';

interface PriceData {
  ingredient: string;
  asin: string;
  url: string;
  price: {
    amount: number;
    currency: string;
    lastUpdated: string;
    unit?: string;
  };
  error?: string;
}

const REQUEST_DELAY = 3000;
const BATCH_LIMIT = 5; // Only test first 5

async function fetchPriceWithHTTP(url: string): Promise<{ price: number; unit?: string } | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return null;
    }
    
    const html = await response.text();
    
    const pricePatterns = [
      /<span[^>]*class="a-price[^"]*"[^>]*>[\s\S]*?<span[^>]*class="a-offscreen"[^>]*>([^<]+)<\/span>/i,
      /id="priceblock_[^"]*"[^>]*>[\s\S]*?([\d,]+\.?\d*)/i,
      /"price":\s*"([\d,]+\.?\d*)"/i,
      /data-a-color="price"[^>]*>[\s\S]*?\$([\d,]+\.?\d*)/i,
    ];
    
    for (const pattern of pricePatterns) {
      const match = html.match(pattern);
      if (match) {
        const priceText = match[1].replace(/[^0-9.]/g, '');
        const price = parseFloat(priceText);
        if (price > 0 && price < 10000) {
          return { price };
        }
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

async function main() {
  console.log('🧪 Testing Price Fetching (First 5 Products)\n');
  
  const products = Object.entries(VETTED_PRODUCTS)
    .filter(([_, product]) => product.asinLink)
    .slice(0, BATCH_LIMIT)
    .map(([ingredient, product]) => ({
      ingredient,
      asin: extractASIN(product.asinLink) || '',
      url: product.asinLink,
    }));
  
  const results: PriceData[] = [];
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    console.log(`[${i + 1}/${products.length}] ${product.ingredient} (${product.asin})`);
    
    const priceData = await fetchPriceWithHTTP(product.url);
    
    if (priceData && priceData.price > 0) {
      console.log(`  ✅ $${priceData.price.toFixed(2)}\n`);
      results.push({
        ingredient: product.ingredient,
        asin: product.asin,
        url: product.url,
        price: {
          amount: priceData.price,
          currency: 'USD',
          lastUpdated: new Date().toISOString(),
          unit: priceData.unit,
        },
      });
    } else {
      console.log(`  ❌ Failed\n`);
      results.push({
        ingredient: product.ingredient,
        asin: product.asin,
        url: product.url,
        price: {
          amount: 0,
          currency: 'USD',
          lastUpdated: new Date().toISOString(),
        },
        error: 'Price not found',
      });
    }
    
    if (i < products.length - 1) {
      await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY));
    }
  }
  
  console.log(`\n✅ Test complete: ${results.filter(r => r.price.amount > 0).length}/${results.length} successful\n`);
}

main().catch(console.error);

