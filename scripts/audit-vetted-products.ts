// scripts/audit-vetted-products.ts
// Comprehensive audit of vetted-products.ts to ensure:
// 1. Every asinLink has seller ID (robinfrench-20)
// 2. Every asinLink is a specific ASIN link (not generic search)
// 3. Every entry has a brand/productName

import * as fs from 'fs';
import * as path from 'path';

const SELLER_ID = 'robinfrench-20';
const VETTED_PRODUCTS_FILE = path.join(__dirname, '../lib/data/vetted-products.ts');

interface AuditResult {
  ingredient: string;
  link: string;
  hasSellerId: boolean;
  isSpecificASIN: boolean;
  hasBrand: boolean;
  issues: string[];
  lineNumber: number;
}

const results: AuditResult[] = [];
const issues: string[] = [];

// Helper to check if URL has seller ID
function hasSellerId(url: string): boolean {
  if (!url) return false;
  return url.includes(`tag=${SELLER_ID}`) || url.includes(`AssociateTag=${SELLER_ID}`);
}

// Helper to check if URL is a specific ASIN link (not generic search)
function isSpecificASIN(url: string): boolean {
  if (!url) return false;
  // Must contain /dp/ASIN or /gp/product/ASIN pattern
  return /\/dp\/[A-Z0-9]{10}|\/gp\/product\/[A-Z0-9]{10}/.test(url);
}

// Extract ASIN from URL
function extractASIN(url: string): string | null {
  const match = url.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/);
  return match ? match[1] : null;
}

// Main audit function
function auditVettedProducts() {
  console.log('🔍 Auditing vetted-products.ts...\n');
  
  const content = fs.readFileSync(VETTED_PRODUCTS_FILE, 'utf-8');
  const lines = content.split('\n');
  
  // Find all ingredient entries with their properties
  // Pattern: 'ingredient-name': { ... properties ... }
  let currentIngredient: string | null = null;
  let currentLink: string | null = null;
  let currentProductName: string | null = null;
  let inProductBlock = false;
  let braceDepth = 0;
  let startLine = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    
    // Detect start of ingredient entry
    const ingredientMatch = line.match(/^\s*'([^']+)':\s*\{/);
    if (ingredientMatch) {
      currentIngredient = ingredientMatch[1];
      inProductBlock = true;
      braceDepth = 1;
      startLine = lineNum;
      currentLink = null;
      currentProductName = null;
      continue;
    }
    
    if (inProductBlock) {
      // Track brace depth
      braceDepth += (line.match(/\{/g) || []).length;
      braceDepth -= (line.match(/\}/g) || []).length;
      
      // Extract asinLink
      const asinMatch = line.match(/asinLink:\s*'([^']+)'/);
      if (asinMatch) {
        currentLink = asinMatch[1];
      }
      
      // Extract productName
      const productMatch = line.match(/productName:\s*'([^']+)'/);
      if (productMatch) {
        currentProductName = productMatch[1];
      }
      
      // End of product block
      if (braceDepth === 0) {
        if (currentIngredient && currentLink) {
          const result: AuditResult = {
            ingredient: currentIngredient,
            link: currentLink,
            hasSellerId: hasSellerId(currentLink),
            isSpecificASIN: isSpecificASIN(currentLink),
            hasBrand: !!currentProductName,
            issues: [],
            lineNumber: startLine,
          };
          
          if (!result.hasSellerId) {
            result.issues.push('Missing seller ID (robinfrench-20)');
            issues.push(`${currentIngredient} (line ${startLine}): Missing seller ID`);
          }
          
          if (!result.isSpecificASIN) {
            result.issues.push('Not a specific ASIN link (appears to be generic search)');
            issues.push(`${currentIngredient} (line ${startLine}): Generic search URL, not specific ASIN`);
          }
          
          if (!result.hasBrand) {
            result.issues.push('Missing productName');
          }
          
          results.push(result);
        }
        
        // Reset
        currentIngredient = null;
        currentLink = null;
        currentProductName = null;
        inProductBlock = false;
      }
    }
  }
  
  console.log(`✅ Audited ${results.length} entries in vetted-products.ts\n`);
  return results.length;
}

// Main execution
function runAudit() {
  console.log('🔍 Starting Vetted Products Audit\n');
  console.log('='.repeat(60));
  
  const count = auditVettedProducts();
  
  // Summary
  console.log('='.repeat(60));
  console.log('📊 AUDIT SUMMARY\n');
  
  const withSellerId = results.filter(r => r.hasSellerId).length;
  const withoutSellerId = results.filter(r => !r.hasSellerId).length;
  const specificASINs = results.filter(r => r.isSpecificASIN).length;
  const genericSearches = results.filter(r => !r.isSpecificASIN).length;
  const withBrands = results.filter(r => r.hasBrand).length;
  const withoutBrands = results.filter(r => !r.hasBrand).length;
  
  console.log(`Total entries audited: ${count}`);
  console.log(`  ✓ With seller ID: ${withSellerId}`);
  console.log(`  ✗ Without seller ID: ${withoutSellerId}`);
  console.log(`  ✓ Specific ASIN links: ${specificASINs}`);
  console.log(`  ✗ Generic search URLs: ${genericSearches}`);
  console.log(`  ✓ With productName: ${withBrands}`);
  console.log(`  ✗ Without productName: ${withoutBrands}`);
  
  // Critical issues
  console.log('\n🚨 CRITICAL ISSUES:\n');
  if (withoutSellerId > 0) {
    console.log(`❌ ${withoutSellerId} entries missing seller ID (robinfrench-20)`);
    console.log('\nEntries missing seller ID:');
    results.filter(r => !r.hasSellerId).slice(0, 20).forEach(r => {
      console.log(`  - ${r.ingredient} (line ${r.lineNumber})`);
    });
    if (withoutSellerId > 20) {
      console.log(`  ... and ${withoutSellerId - 20} more`);
    }
  } else {
    console.log('✅ All entries have seller ID');
  }
  
  if (genericSearches > 0) {
    console.log(`\n❌ ${genericSearches} entries use generic search URLs (should be specific ASIN links)`);
    console.log('\nEntries with generic search URLs:');
    results.filter(r => !r.isSpecificASIN).slice(0, 20).forEach(r => {
      console.log(`  - ${r.ingredient} (line ${r.lineNumber}): ${r.link.substring(0, 80)}...`);
    });
    if (genericSearches > 20) {
      console.log(`  ... and ${genericSearches - 20} more`);
    }
  } else {
    console.log('✅ All entries use specific ASIN links');
  }
  
  // Save detailed report
  const reportFile = path.join(__dirname, '../VETTED_PRODUCTS_AUDIT_REPORT.md');
  const report = `# Vetted Products Audit Report
Generated: ${new Date().toISOString()}

## Summary
- Total entries audited: ${count}
- With seller ID: ${withSellerId}
- Without seller ID: ${withoutSellerId}
- Specific ASIN links: ${specificASINs}
- Generic search URLs: ${genericSearches}
- With productName: ${withBrands}
- Without productName: ${withoutBrands}

## Issues Found
${issues.length > 0 ? issues.map((issue, i) => `${i + 1}. ${issue}`).join('\n') : 'No issues found!'}

## Detailed Results

${results.filter(r => r.issues.length > 0).map(r => `
### ${r.ingredient} (line ${r.lineNumber})
- Link: ${r.link}
- Has Seller ID: ${r.hasSellerId ? '✅' : '❌'}
- Specific ASIN: ${r.isSpecificASIN ? '✅' : '❌'}
- Has Brand: ${r.hasBrand ? '✅' : '❌'}
- Issues: ${r.issues.join(', ')}
`).join('\n')}

## All Entries

${results.map(r => `
### ${r.ingredient} (line ${r.lineNumber})
- Link: ${r.link}
- ASIN: ${extractASIN(r.link) || 'N/A'}
- Has Seller ID: ${r.hasSellerId ? '✅' : '❌'}
- Specific ASIN: ${r.isSpecificASIN ? '✅' : '❌'}
- Product Name: ${results.find(res => res.ingredient === r.ingredient)?.hasBrand ? 'Yes' : 'No'}
`).join('\n')}
`;
  
  fs.writeFileSync(reportFile, report);
  console.log(`\n💾 Detailed report saved to: ${reportFile}`);
  
  return {
    total: count,
    withSellerId,
    withoutSellerId,
    specificASINs,
    genericSearches,
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

