// scripts/audit-purchase-links.ts
// Comprehensive audit of all purchase/buy links to ensure:
// 1. Every link has seller ID (robinfrench-20)
// 2. Every link goes to a specific vetted brand (not generic searches)
// 3. All links use vetted products where possible

import * as fs from 'fs';
import * as path from 'path';

const SELLER_ID = 'robinfrench-20';
const VETTED_PRODUCTS_FILE = path.join(__dirname, '../lib/data/vetted-products.ts');
const RECIPES_FILE = path.join(__dirname, '../lib/data/recipes-complete.ts');

interface AuditResult {
  ingredient: string;
  location: string;
  link: string;
  hasSellerId: boolean;
  isGenericSearch: boolean;
  isVettedProduct: boolean;
  brand?: string;
  issues: string[];
}

const results: AuditResult[] = [];
const issues: string[] = [];

// Helper to check if URL has seller ID
function hasSellerId(url: string): boolean {
  if (!url) return false;
  return url.includes(`tag=${SELLER_ID}`) || url.includes(`tag=${SELLER_ID}`) || url.includes(`AssociateTag=${SELLER_ID}`);
}

// Helper to check if URL is a generic search (not specific product)
function isGenericSearch(url: string): boolean {
  if (!url) return false;
  // Check for search URLs (not specific product pages)
  return url.includes('/s?k=') || url.includes('/s?') || url.includes('search/') || (!url.includes('/dp/') && !url.includes('/gp/product/') && !url.includes('/product/'));
}

// Extract brand name from product name
function extractBrand(productName: string): string | undefined {
  // Common brand patterns
  const brandPatterns = [
    /^([^']+?)\s+(Freeze Dried|Freeze-Dried|Organic|Raw|Pet Food)/i,
    /^(Fresh Is Best|Bell & Evans|Vital Essentials|Raw Paws|Evanger's|Bob's Red Mill|NOW Foods|Grizzly|Nutiva|Nordic Naturals|Wild Planet|Whole Life Pet|A Better Treat|Wholesome Beast|Stella & Chewy's|Lafeber's|Nature's Touch|Eden Organic|Viva Naturals|California Olive Ranch|Carlson Labs|La Tourangelle|Jarrow Formulas|Zesty Paws|Cascadian Farm|Healthworks)/i,
  ];
  
  for (const pattern of brandPatterns) {
    const match = productName.match(pattern);
    if (match) return match[1].trim();
  }
  
  return undefined;
}

// Audit vetted-products.ts
function auditVettedProducts() {
  console.log('🔍 Auditing vetted-products.ts...\n');
  
  const content = fs.readFileSync(VETTED_PRODUCTS_FILE, 'utf-8');
  
  // Extract all VETTED_PRODUCTS entries
  const productPattern = /'([^']+)':\s*\{[^}]*asinLink:\s*'([^']+)'[^}]*productName:\s*'([^']+)'/g;
  let match;
  let count = 0;
  
  while ((match = productPattern.exec(content)) !== null) {
    count++;
    const ingredient = match[1];
    const link = match[2];
    const productName = match[3];
    
    const result: AuditResult = {
      ingredient,
      location: 'vetted-products.ts',
      link,
      hasSellerId: hasSellerId(link),
      isGenericSearch: isGenericSearch(link),
      isVettedProduct: true,
      brand: extractBrand(productName),
      issues: [],
    };
    
    if (!result.hasSellerId) {
      result.issues.push('Missing seller ID (robinfrench-20)');
      issues.push(`${ingredient}: Missing seller ID in vetted-products.ts`);
    }
    
    if (result.isGenericSearch) {
      result.issues.push('Generic search URL (not specific product ASIN)');
      issues.push(`${ingredient}: Generic search URL in vetted-products.ts`);
    }
    
    if (!result.brand) {
      result.issues.push('Could not extract brand name');
    }
    
    results.push(result);
  }
  
  console.log(`✅ Audited ${count} entries in vetted-products.ts`);
  return count;
}

// Audit recipes-complete.ts for amazonLink fields
function auditRecipesComplete() {
  console.log('\n🔍 Auditing recipes-complete.ts for amazonLink fields...\n');
  
  const content = fs.readFileSync(RECIPES_FILE, 'utf-8');
  
  // Find all amazonLink entries in ingredients
  const linkPattern = /"amazonLink":\s*"([^"]+)"/g;
  let match;
  let count = 0;
  const seenLinks = new Map<string, number>();
  
  while ((match = linkPattern.exec(content)) !== null) {
    count++;
    const link = match[1];
    const lineNumber = (content.substring(0, match.index).match(/\n/g) || []).length + 1;
    
    const key = `${lineNumber}:${link}`;
    if (seenLinks.has(key)) continue;
    seenLinks.set(key, lineNumber);
    
    const result: AuditResult = {
      ingredient: `Recipe ingredient (line ${lineNumber})`,
      location: 'recipes-complete.ts',
      link,
      hasSellerId: hasSellerId(link),
      isGenericSearch: isGenericSearch(link),
      isVettedProduct: false,
      issues: [],
    };
    
    if (!result.hasSellerId) {
      result.issues.push('Missing seller ID (robinfrench-20)');
      issues.push(`Line ${lineNumber}: Missing seller ID in recipes-complete.ts`);
    }
    
    if (result.isGenericSearch) {
      result.issues.push('Generic search URL - should use vetted product with specific ASIN');
      issues.push(`Line ${lineNumber}: Generic search URL - should be replaced with vetted product`);
    }
    
    results.push(result);
  }
  
  console.log(`✅ Found ${count} amazonLink entries in recipes-complete.ts`);
  return count;
}

// Main audit function
function runAudit() {
  console.log('🔍 Starting Comprehensive Purchase Links Audit\n');
  console.log('='.repeat(60));
  
  const vettedCount = auditVettedProducts();
  const recipesCount = auditRecipesComplete();
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 AUDIT SUMMARY\n');
  
  const withSellerId = results.filter(r => r.hasSellerId).length;
  const withoutSellerId = results.filter(r => !r.hasSellerId).length;
  const genericSearches = results.filter(r => r.isGenericSearch).length;
  const vettedLinks = results.filter(r => r.isVettedProduct).length;
  const recipeLinks = results.filter(r => !r.isVettedProduct).length;
  
  console.log(`Total links audited: ${results.length}`);
  console.log(`  ✓ With seller ID: ${withSellerId}`);
  console.log(`  ✗ Without seller ID: ${withoutSellerId}`);
  console.log(`  ✗ Generic search URLs: ${genericSearches}`);
  console.log(`  ✓ Vetted product links: ${vettedLinks}`);
  console.log(`  ⚠️  Recipe file links (should use vetted products): ${recipeLinks}`);
  
  // Critical issues
  console.log('\n🚨 CRITICAL ISSUES:\n');
  if (withoutSellerId > 0) {
    console.log(`❌ ${withoutSellerId} links missing seller ID (robinfrench-20)`);
  } else {
    console.log('✅ All links have seller ID');
  }
  
  if (genericSearches > 0) {
    console.log(`❌ ${genericSearches} links are generic searches (should be specific ASIN links)`);
  } else {
    console.log('✅ All links point to specific products');
  }
  
  if (recipeLinks > 0) {
    console.log(`⚠️  ${recipeLinks} links in recipes-complete.ts (should migrate to vetted-products.ts)`);
  } else {
    console.log('✅ All links use vetted products');
  }
  
  // Detailed report
  console.log('\n' + '='.repeat(60));
  console.log('📋 DETAILED ISSUES\n');
  
  if (issues.length === 0) {
    console.log('✅ No issues found! All links are properly configured.');
  } else {
    issues.slice(0, 50).forEach((issue, idx) => {
      console.log(`${idx + 1}. ${issue}`);
    });
    
    if (issues.length > 50) {
      console.log(`\n... and ${issues.length - 50} more issues`);
    }
  }
  
  // Recommendations
  console.log('\n' + '='.repeat(60));
  console.log('💡 RECOMMENDATIONS\n');
  
  if (withoutSellerId > 0) {
    console.log('1. Add seller ID to all links missing it:');
    console.log('   - Update vetted-products.ts to ensure all asinLink entries include ?tag=robinfrench-20');
    console.log('   - Update recipes-complete.ts amazonLink entries to include tag=robinfrench-20');
  }
  
  if (genericSearches > 0) {
    console.log('2. Replace generic search URLs with specific ASIN links:');
    console.log('   - Generic searches (s?k=...) should be replaced with /dp/ASIN links');
    console.log('   - Use vetted-products.ts entries which have specific branded products');
  }
  
  if (recipeLinks > 0) {
    console.log('3. Migrate recipe links to vetted products:');
    console.log('   - recipes-complete.ts should use getVettedProduct() instead of hardcoded amazonLink');
    console.log('   - This ensures all links go through the vetted products system');
  }
  
  // Save detailed report
  const reportFile = path.join(__dirname, '../PURCHASE_LINKS_AUDIT_REPORT.md');
  const report = `# Purchase Links Audit Report
Generated: ${new Date().toISOString()}

## Summary
- Total links audited: ${results.length}
- Links with seller ID: ${withSellerId}
- Links without seller ID: ${withoutSellerId}
- Generic search URLs: ${genericSearches}
- Vetted product links: ${vettedLinks}
- Recipe file links: ${recipeLinks}

## Issues Found
${issues.length > 0 ? issues.map((issue, i) => `${i + 1}. ${issue}`).join('\n') : 'No issues found!'}

## Detailed Results
${results.map(r => `
### ${r.ingredient} (${r.location})
- Link: ${r.link}
- Has Seller ID: ${r.hasSellerId ? '✅' : '❌'}
- Generic Search: ${r.isGenericSearch ? '❌' : '✅'}
- Brand: ${r.brand || 'Unknown'}
- Issues: ${r.issues.length > 0 ? r.issues.join(', ') : 'None'}
`).join('\n')}
`;
  
  fs.writeFileSync(reportFile, report);
  console.log(`\n💾 Detailed report saved to: ${reportFile}`);
  
  return {
    total: results.length,
    withSellerId,
    withoutSellerId,
    genericSearches,
    vettedLinks,
    recipeLinks,
    issues: issues.length,
  };
}

// Run the audit
try {
  const summary = runAudit();
  console.log('\n✅ Audit complete!');
  process.exit(summary.withoutSellerId > 0 || summary.genericSearches > 0 ? 1 : 0);
} catch (error) {
  console.error('❌ Error running audit:', error);
  process.exit(1);
}

