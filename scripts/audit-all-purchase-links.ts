// scripts/audit-all-purchase-links.ts
// Comprehensive audit combining vetted products + runtime code checks
// Generates detailed report for all purchase links

import * as fs from 'fs';
import * as path from 'path';

const SELLER_ID = 'robinfrench-20';
const VETTED_PRODUCTS_FILE = path.join(__dirname, '../lib/data/vetted-products.ts');
const COMPONENTS_TO_CHECK = [
  'components/ShoppingList.tsx',
  'components/OneClickCheckoutModal.tsx',
  'components/MultiPetShoppingModal.tsx',
  'components/QuickPreviewModal.tsx',
  'components/MealCompleteView.tsx',
  'components/MealCompositionList.tsx',
  'app/recipe/[id]/page.tsx',
  'app/profile/page.tsx',
  'app/profile/pet/[id]/meal-plan/page.tsx',
];

interface AuditResult {
  type: 'vetted-product' | 'runtime-code';
  location: string;
  issue: string;
  severity: 'error' | 'warning';
  fix?: string;
}

const results: AuditResult[] = [];

// Helper functions
function hasSellerId(url: string): boolean {
  if (!url) return false;
  return url.includes(`tag=${SELLER_ID}`) || url.includes(`AssociateTag=${SELLER_ID}`);
}

function extractASIN(url: string): string | null {
  if (!url) return null;
  const dpMatch = url.match(/\/dp\/([A-Z0-9]{10})(?:\/|$|\?)/);
  if (dpMatch) return dpMatch[1];
  const gpMatch = url.match(/\/gp\/product\/([A-Z0-9]{10})(?:\/|$|\?)/);
  if (gpMatch) return gpMatch[1];
  return null;
}

function isGenericSearch(url: string): boolean {
  if (!url) return false;
  return url.includes('/s?k=') || url.includes('/s?') || url.includes('search/');
}

// Audit vetted products
function auditVettedProducts() {
  console.log('📋 Auditing vetted products...');
  
  const content = fs.readFileSync(VETTED_PRODUCTS_FILE, 'utf-8');
  const lines = content.split('\n');
  
  let currentIngredient: string | null = null;
  let currentLink: string | null = null;
  let inProductBlock = false;
  let braceDepth = 0;
  let lineNum = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    lineNum = i + 1;
    
    const ingredientMatch = line.match(/^\s*'([^']+)':\s*\{/);
    if (ingredientMatch) {
      currentIngredient = ingredientMatch[1];
      inProductBlock = true;
      braceDepth = 1;
      currentLink = null;
      continue;
    }
    
    if (inProductBlock) {
      braceDepth += (line.match(/\{/g) || []).length;
      braceDepth -= (line.match(/\}/g) || []).length;
      
      const asinMatch = line.match(/asinLink:\s*'([^']+)'/);
      if (asinMatch) {
        currentLink = asinMatch[1];
      }
      
      if (braceDepth === 0) {
        if (currentIngredient && currentLink) {
          const location = `${VETTED_PRODUCTS_FILE}:${lineNum}`;
          let foundIssues = false;
          
          if (!hasSellerId(currentLink)) {
            results.push({
              type: 'vetted-product',
              location,
              issue: `Missing seller ID: ${currentIngredient}`,
              severity: 'error',
              fix: `Add ?tag=${SELLER_ID} to asinLink`,
            });
            foundIssues = true;
          }
          
          if (!extractASIN(currentLink)) {
            results.push({
              type: 'vetted-product',
              location,
              issue: `Invalid ASIN format: ${currentIngredient}`,
              severity: 'error',
              fix: 'Use /dp/ASIN or /gp/product/ASIN format',
            });
            foundIssues = true;
          }
          
          if (isGenericSearch(currentLink)) {
            results.push({
              type: 'vetted-product',
              location,
              issue: `Generic search URL: ${currentIngredient}`,
              severity: 'error',
              fix: 'Replace with specific product ASIN link',
            });
            foundIssues = true;
          }
        }
        
        currentIngredient = null;
        currentLink = null;
        inProductBlock = false;
      }
    }
  }
  
  const vettedProductCount = results.filter(r => r.type === 'vetted-product').length;
  console.log(`  ✅ Checked vetted products (found ${vettedProductCount} issues)`);
}

// Audit runtime code
function auditRuntimeCode() {
  console.log('📋 Auditing runtime code...');
  
  COMPONENTS_TO_CHECK.forEach(componentPath => {
    const fullPath = path.join(__dirname, '../', componentPath);
    
    if (!fs.existsSync(fullPath)) {
      results.push({
        type: 'runtime-code',
        location: componentPath,
        issue: 'File not found',
        severity: 'warning',
      });
      return;
    }
    
    const content = fs.readFileSync(fullPath, 'utf-8');
    const lines = content.split('\n');
    
    // Check for window.open with asinLink without ensureSellerId
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      
      // Check for window.open with asinLink that doesn't use ensureSellerId or ensureCartUrlSellerId
      if (line.includes('window.open') && line.includes('asinLink')) {
        if (!line.includes('ensureSellerId') && !line.includes('ensureCartUrlSellerId')) {
          results.push({
            type: 'runtime-code',
            location: `${componentPath}:${lineNum}`,
            issue: 'window.open with asinLink missing ensureSellerId wrapper',
            severity: 'error',
            fix: 'Wrap asinLink with ensureSellerId() or ensureCartUrlSellerId()',
          });
        }
      }
      
      // Check for href with asinLink without ensureSellerId
      if (line.includes('href=') && line.includes('asinLink') && !line.includes('ensureSellerId')) {
        results.push({
          type: 'runtime-code',
          location: `${componentPath}:${lineNum}`,
          issue: 'href with asinLink missing ensureSellerId wrapper',
          severity: 'error',
          fix: 'Wrap asinLink with ensureSellerId()',
        });
      }
      
      // Check for cart URL construction without ensureCartUrlSellerId or hardcoded seller ID
      if (line.includes('gp/aws/cart/add.html') && 
          !line.includes('ensureCartUrlSellerId') && 
          !line.includes(`tag=${SELLER_ID}`) && 
          !line.includes(`AssociateTag=${SELLER_ID}`)) {
        results.push({
          type: 'runtime-code',
          location: `${componentPath}:${lineNum}`,
          issue: 'Cart URL construction missing seller ID',
          severity: 'error',
          fix: 'Add tag=robinfrench-20 or use ensureCartUrlSellerId()',
        });
      }
    });
  });
  
  console.log(`  ✅ Checked ${COMPONENTS_TO_CHECK.length} component files`);
}

// Generate report
function generateReport() {
  const reportPath = path.join(__dirname, '../AFFILIATE_LINKS_AUDIT_REPORT.md');
  
  const errors = results.filter(r => r.severity === 'error');
  const warnings = results.filter(r => r.severity === 'warning');
  
  const report = `# Affiliate Links Comprehensive Audit Report
Generated: ${new Date().toISOString()}

## Summary
- Total issues found: ${results.length}
- Errors: ${errors.length}
- Warnings: ${warnings.length}

## Status
${errors.length === 0 ? '✅ **PASS** - All checks passed!' : '❌ **FAIL** - Errors found'}

## Issues by Type

### Vetted Products
${results.filter(r => r.type === 'vetted-product').map(r => `
- **${r.severity.toUpperCase()}**: ${r.issue}
  - Location: ${r.location}
  - Fix: ${r.fix || 'N/A'}
`).join('\n') || '✅ No issues found'}

### Runtime Code
${results.filter(r => r.type === 'runtime-code').map(r => `
- **${r.severity.toUpperCase()}**: ${r.issue}
  - Location: ${r.location}
  - Fix: ${r.fix || 'N/A'}
`).join('\n') || '✅ No issues found'}

## All Issues

${results.map((r, idx) => `${idx + 1}. [${r.severity.toUpperCase()}] ${r.issue}
   - Type: ${r.type}
   - Location: ${r.location}
   ${r.fix ? `   - Fix: ${r.fix}` : ''}`).join('\n\n') || 'No issues found.'}

## Recommendations

1. **Run validation**: \`npm run validate:links\`
2. **Fix errors**: Address all ERROR-level issues
3. **Review warnings**: Check WARNING-level issues
4. **Run tests**: Execute test suite to verify fixes

---

*Report generated by audit-all-purchase-links.ts*
`;

  fs.writeFileSync(reportPath, report);
  console.log(`\n💾 Report saved to: ${reportPath}`);
  
  return { errors, warnings };
}

// Main execution
function main() {
  console.log('🔍 Comprehensive Purchase Links Audit\n');
  console.log('='.repeat(60));
  
  auditVettedProducts();
  auditRuntimeCode();
  
  const { errors, warnings } = generateReport();
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 AUDIT SUMMARY\n');
  console.log(`Total issues: ${results.length}`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Warnings: ${warnings.length}`);
  
  if (errors.length === 0) {
    console.log('\n✅ All checks passed!\n');
    process.exit(0);
  } else {
    console.log('\n❌ Errors found. See report for details.\n');
    process.exit(1);
  }
}

try {
  main();
} catch (error) {
  console.error('❌ Error running audit:', error);
  process.exit(1);
}

