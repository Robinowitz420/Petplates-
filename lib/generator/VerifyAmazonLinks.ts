// Verify Amazon Links - Check if links are live and accessible
// Note: This checks HTTP status, but can't verify product details without scraping

import { VETTED_PRODUCTS } from '../data/vetted-products';

interface VerificationResult {
  ingredient: string;
  productName: string;
  asinLink: string;
  asin: string;
  status: 'checking' | 'live' | 'dead' | 'redirect' | 'error';
  httpStatus?: number;
  error?: string;
}

const results: VerificationResult[] = [];

console.log('='.repeat(80));
console.log('AMAZON LINK VERIFICATION - HTTP Status Check');
console.log('='.repeat(80));
console.log();
console.log('⚠️  Note: This checks if links are accessible, but cannot verify');
console.log('    if the product matches the ingredient without manual review.');
console.log();
console.log('Checking links...');
console.log();

// Sample a subset of links to check (checking all 292 would take too long)
const entries = Object.entries(VETTED_PRODUCTS);
const sampleSize = 50; // Check first 50 products
const sampled = entries.slice(0, sampleSize);

async function checkLink(url: string): Promise<{ status: number; ok: boolean }> {
  try {
    const response = await fetch(url, {
      method: 'HEAD', // Just check headers, don't download content
      redirect: 'follow',
    });
    return { status: response.status, ok: response.ok };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function verifyLinks() {
  let checked = 0;
  let live = 0;
  let dead = 0;
  let errors = 0;

  for (const [ingredientName, product] of sampled) {
    const asinLink = product.asinLink;
    const asinMatch = asinLink.match(/\/dp\/([A-Z0-9]{10})/i);
    const asin = asinMatch ? asinMatch[1] : 'unknown';

    const result: VerificationResult = {
      ingredient: ingredientName,
      productName: product.productName,
      asinLink,
      asin,
      status: 'checking',
    };

    try {
      const { status, ok } = await checkLink(asinLink);
      result.httpStatus = status;
      
      if (ok && status === 200) {
        result.status = 'live';
        live++;
      } else if (status >= 300 && status < 400) {
        result.status = 'redirect';
        live++; // Redirects are usually fine
      } else {
        result.status = 'dead';
        dead++;
      }
    } catch (error: any) {
      result.status = 'error';
      result.error = error.message;
      errors++;
    }

    results.push(result);
    checked++;

    // Progress indicator
    if (checked % 10 === 0) {
      console.log(`Checked ${checked}/${sampleSize}...`);
    }
  }

  console.log();
  console.log('='.repeat(80));
  console.log('VERIFICATION RESULTS');
  console.log('='.repeat(80));
  console.log();
  console.log(`Sample size: ${sampleSize} products (out of ${entries.length} total)`);
  console.log(`Live links: ${live} (${((live / checked) * 100).toFixed(1)}%)`);
  console.log(`Dead links: ${dead} (${((dead / checked) * 100).toFixed(1)}%)`);
  console.log(`Errors: ${errors} (${((errors / checked) * 100).toFixed(1)}%)`);
  console.log();

  // Show dead links
  const deadLinks = results.filter(r => r.status === 'dead');
  if (deadLinks.length > 0) {
    console.log('DEAD LINKS FOUND:');
    console.log('-'.repeat(80));
    deadLinks.forEach(r => {
      console.log(`❌ ${r.ingredient}`);
      console.log(`   Product: ${r.productName}`);
      console.log(`   ASIN: ${r.asin}`);
      console.log(`   Status: ${r.httpStatus}`);
      console.log(`   Link: ${r.asinLink}`);
      console.log();
    });
  }

  // Show errors
  const errorLinks = results.filter(r => r.status === 'error');
  if (errorLinks.length > 0) {
    console.log('ERRORS ENCOUNTERED:');
    console.log('-'.repeat(80));
    errorLinks.forEach(r => {
      console.log(`⚠️  ${r.ingredient}`);
      console.log(`   Product: ${r.productName}`);
      console.log(`   Error: ${r.error}`);
      console.log(`   Link: ${r.asinLink}`);
      console.log();
    });
  }

  console.log('='.repeat(80));
  console.log('IMPORTANT NOTES');
  console.log('='.repeat(80));
  console.log();
  console.log('1. This script only checks if links are accessible (HTTP 200)');
  console.log('2. It CANNOT verify if the product actually matches the ingredient');
  console.log('3. Manual review is needed to confirm product accuracy');
  console.log();
  console.log('RECOMMENDED MANUAL CHECKS:');
  console.log('- Verify "venison" ASIN actually links to venison (not beef)');
  console.log('- Verify "rabbit meat" ASIN actually links to rabbit (not lamb)');
  console.log('- Verify "turkey giblets" ASIN actually links to turkey (not chicken)');
  console.log('- Verify seed products link to correct seed types');
  console.log();
  console.log('To manually verify, visit the links and check product titles/descriptions.');
  console.log('='.repeat(80));
}

// Run verification
verifyLinks().catch(console.error);
