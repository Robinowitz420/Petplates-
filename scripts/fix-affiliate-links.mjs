// Auto-fix script for Amazon affiliate links
// Fixes what can be automated:
// 1. Add missing affiliate tags
// 2. Normalize URL format to /dp/ASIN
// 3. Remove tracking junk while keeping ASIN
// Does NOT try to guess ASINs for search URLs (manual work)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SELLER_ID = 'robinfrench-20';

// Files to fix
const FILES = [
  path.join(__dirname, '../lib/data/vetted-products.ts'),
  path.join(__dirname, '../lib/data/vetted-products-generic.ts'),
  path.join(__dirname, '../lib/data/vetted-products-UPDATED.ts'),
];

let totalFixed = 0;
let totalNormalized = 0;

function extractASIN(url) {
  if (!url) return null;
  
  const dpMatch = url.match(/\/dp\/([A-Z0-9]{10})(?:\/|$|\?)/);
  if (dpMatch) return dpMatch[1];
  
  const gpMatch = url.match(/\/gp\/product\/([A-Z0-9]{10})(?:\/|$|\?)/);
  if (gpMatch) return gpMatch[1];
  
  const productMatch = url.match(/\/product\/([A-Z0-9]{10})(?:\/|$|\?)/);
  if (productMatch) return productMatch[1];
  
  return null;
}

function normalizeToDpUrl(url) {
  const asin = extractASIN(url);
  if (!asin) return url; // Can't normalize without ASIN
  
  totalNormalized++;
  return `https://www.amazon.com/dp/${asin}`;
}

function ensureSellerId(url) {
  if (!url) return url;
  
  // Already has our tag?
  if (url.includes(`tag=${SELLER_ID}`)) {
    return url;
  }
  
  totalFixed++;
  
  // Add tag
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}tag=${SELLER_ID}`;
}

function fixAmazonLinks(content) {
  // Match asinLink or amazonLink fields in TypeScript object literals
  // Pattern: asinLink: 'https://...' or amazonLink: 'https://...'
  const linkPattern = /(asinLink|amazonLink):\s*'([^']+)'/g;
  
  return content.replace(linkPattern, (match, fieldName, url) => {
    // Only process Amazon URLs
    if (!url.includes('amazon.com')) {
      return match;
    }
    
    // Step 1: Normalize to /dp/ASIN format
    let fixedUrl = normalizeToDpUrl(url);
    
    // Step 2: Ensure affiliate tag
    fixedUrl = ensureSellerId(fixedUrl);
    
    return `${fieldName}: '${fixedUrl}'`;
  });
}

console.log('🔧 Amazon Affiliate Link Auto-Fix\n');
console.log('='.repeat(60));

FILES.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${path.basename(filePath)} (not found)`);
    return;
  }
  
  console.log(`\n📝 Processing ${path.basename(filePath)}...`);
  
  const originalContent = fs.readFileSync(filePath, 'utf8');
  const fixedContent = fixAmazonLinks(originalContent);
  
  if (originalContent !== fixedContent) {
    fs.writeFileSync(filePath, fixedContent, 'utf8');
    console.log(`✅ Fixed and saved`);
  } else {
    console.log(`✅ No changes needed`);
  }
});

console.log('\n' + '='.repeat(60));
console.log('📊 SUMMARY\n');
console.log(`Affiliate tags added: ${totalFixed}`);
console.log(`URLs normalized: ${totalNormalized}`);
console.log('\n✅ Auto-fix complete!');
console.log('\n💡 Next steps:');
console.log('1. Run audit again: npx tsx lib/generator/AmazonLinkAudit.ts');
console.log('2. Review duplicate ASINs manually (see MANUAL_REVIEW_NEEDED.md)');
console.log('3. Test a few links in browser to verify they work');
