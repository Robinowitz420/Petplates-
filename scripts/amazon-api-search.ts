// scripts/amazon-api-search.ts
// Real Amazon Product Advertising API integration for ASIN verification

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Amazon PA-API Configuration
const AMAZON_CONFIG = {
  accessKey: process.env.AMAZON_ACCESS_KEY || '',
  secretKey: process.env.AMAZON_SECRET_KEY || '',
  associateTag: 'robinfrench-20',
  region: 'us-east-1',
  host: 'webservices.amazon.com',
  service: 'ProductAdvertisingAPI'
};

interface AmazonSearchResult {
  ASIN: string;
  Title: string;
  ProductGroup: string;
  ItemInfo: {
    ByLineInfo?: {
      Brand?: {
        DisplayValue: string;
      };
    };
  };
  Offers?: {
    Listings?: Array<{
      Price: {
        DisplayAmount: string;
      };
    }>;
  };
  CustomerReviews?: {
    Count: number;
    StarRating: {
      DisplayValue: number;
    };
  };
}

// Generate AWS signature for PA-API v5
function generateSignature(stringToSign: string, secretKey: string): string {
  const dateKey = crypto.createHmac('sha256', 'AWS4' + secretKey)
    .update(new Date().toISOString().slice(0, 8))
    .digest();

  const dateRegionKey = crypto.createHmac('sha256', dateKey)
    .update(AMAZON_CONFIG.region)
    .digest();

  const dateRegionServiceKey = crypto.createHmac('sha256', dateRegionKey)
    .update(AMAZON_CONFIG.service)
    .digest();

  const signingKey = crypto.createHmac('sha256', dateRegionServiceKey)
    .update('aws4_request')
    .digest();

  return crypto.createHmac('sha256', signingKey)
    .update(stringToSign)
    .digest('hex');
}

// Search Amazon using Product Advertising API
async function searchAmazonPAAPI(searchTerm: string): Promise<AmazonSearchResult[]> {
  const timestamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');

  const payload = JSON.stringify({
    Keywords: `${searchTerm} dog food`,
    SearchIndex: 'PetSupplies',
    ItemCount: 5,
    Resources: [
      'ItemInfo.Title',
      'ItemInfo.ByLineInfo',
      'Offers.Listings.Price',
      'CustomerReviews.Count',
      'CustomerReviews.StarRating'
    ]
  });

  const canonicalUri = '/paapi5/searchitems';
  const canonicalQuerystring = `AMZNSignature=${encodeURIComponent('')}`;
  const canonicalHeaders = `host:${AMAZON_CONFIG.host}\n` +
    `x-amz-date:${timestamp}\n`;

  const signedHeaders = 'host;x-amz-date';
  const payloadHash = crypto.createHash('sha256').update(payload).digest('hex');

  const canonicalRequest = `POST\n` +
    `${canonicalUri}\n` +
    `${canonicalQuerystring}\n` +
    `${canonicalHeaders}\n` +
    `${signedHeaders}\n` +
    `${payloadHash}`;

  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${new Date().toISOString().slice(0, 8)}/${AMAZON_CONFIG.region}/${AMAZON_CONFIG.service}/aws4_request`;
  const stringToSign = `${algorithm}\n${timestamp}\n${credentialScope}\n` +
    crypto.createHash('sha256').update(canonicalRequest).digest('hex');

  const signature = generateSignature(stringToSign, AMAZON_CONFIG.secretKey);

  const authHeader = `${algorithm} Credential=${AMAZON_CONFIG.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const options = {
    hostname: AMAZON_CONFIG.host,
    path: canonicalUri,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Amz-Date': timestamp,
      'Authorization': authHeader,
      'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const response = JSON.parse(data);
            resolve(response.SearchResult?.Items || []);
          } else {
            console.log(`Amazon API Error ${res.statusCode}:`, data);
            resolve([]); // Return empty array on error
          }
        } catch (error) {
          console.error('Error parsing Amazon response:', error);
          resolve([]);
        }
      });
    });

    req.on('error', (error) => {
      console.error('Amazon API request failed:', error);
      resolve([]);
    });

    req.write(payload);
    req.end();
  });
}

// Fallback: Simple web scraping approach (use responsibly!)
async function searchAmazonScraping(searchTerm: string): Promise<AmazonSearchResult[]> {
  console.log('  🌐 Using web scraping fallback...');

  const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(searchTerm + ' dog food')}&i=pet-supplies`;

  return new Promise((resolve) => {
    const req = https.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        // Very basic title extraction (you'd want to use cheerio or puppeteer for real parsing)
        const titleMatches = data.match(/<span[^>]*class="[^"]*a-text-normal[^"]*"[^>]*>([^<]+)<\/span>/g) || [];
        const asinMatches = data.match(/\/dp\/([A-Z0-9]{10})/g) || [];

        const results: AmazonSearchResult[] = [];
        for (let i = 0; i < Math.min(titleMatches.length, asinMatches.length, 3); i++) {
          const titleMatch = titleMatches[i]?.match(/<span[^>]*>([^<]+)<\/span>/);
          const asinMatch = asinMatches[i]?.match(/\/dp\/([A-Z0-9]{10})/);

          if (titleMatch && asinMatch) {
            results.push({
              ASIN: asinMatch[1],
              Title: titleMatch[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"'),
              ProductGroup: 'PetSupplies',
              ItemInfo: {},
              CustomerReviews: {
                Count: 0,
                StarRating: { DisplayValue: 0 }
              }
            });
          }
        }

        resolve(results);
      });
    });

    req.on('error', () => {
      resolve([]);
    });

    req.setTimeout(10000, () => {
      req.abort();
      resolve([]);
    });
  });
}

// Main search function with fallback
export async function searchAmazonForProduct(searchTerm: string): Promise<any[]> {
  console.log(`  🔍 Searching Amazon for: "${searchTerm}"`);

  // Try PA-API first
  if (AMAZON_CONFIG.accessKey && AMAZON_CONFIG.secretKey) {
    console.log('  📡 Using Amazon PA-API...');
    const results = await searchAmazonPAAPI(searchTerm);
    if (results.length > 0) {
      return results;
    }
  }

  // Fallback to scraping
  console.log('  🌐 Falling back to web scraping...');
  return await searchAmazonScraping(searchTerm);
}

// Test the search functionality
async function testSearch() {
  const results = await searchAmazonForProduct('ground chicken');

  console.log('\n📦 Search Results:');
  results.forEach((result, i) => {
    console.log(`${i + 1}. ${result.Title} (ASIN: ${result.ASIN})`);
  });

  if (results.length === 0) {
    console.log('❌ No results found. Check your API keys or network connection.');
  }
}

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testSearch();
}
