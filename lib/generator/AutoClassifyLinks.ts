// Auto-classify all 94 items using spec-based validation
// Reduces manual review from 94 → ~15-20 items

import { VETTED_PRODUCTS } from '../data/vetted-products';
import { RETAIL_SPECS } from '../validation/retailSpecDefinitions';
import { RetailValidator } from '../validation/retailValidator';
import * as fs from 'fs';
import * as path from 'path';

interface ClassificationResult {
  ingredient: string;
  productName: string;
  asin: string;
  link: string;
  status: 'auto-valid' | 'auto-invalid' | 'needs-review' | 'no-spec';
  confidence: 'high' | 'medium' | 'low';
  issues: string[];
  notes: string;
}

const validator = new RetailValidator();
const results: ClassificationResult[] = [];

console.log('='.repeat(80));
console.log('AUTO-CLASSIFYING AMAZON LINKS');
console.log('='.repeat(80));
console.log();

// Track duplicate ASINs
const asinMap = new Map<string, string[]>();
for (const [ingredientName, product] of Object.entries(VETTED_PRODUCTS)) {
  const asinMatch = product.asinLink.match(/\/dp\/([A-Z0-9]{10})/i);
  if (asinMatch) {
    const asin = asinMatch[1];
    if (!asinMap.has(asin)) {
      asinMap.set(asin, []);
    }
    asinMap.get(asin)!.push(ingredientName);
  }
}

// Known dead links
const deadLinks = new Set(['B0082C00P8', 'B0006L2XNK']);

// Process each ingredient
for (const [ingredientName, product] of Object.entries(VETTED_PRODUCTS)) {
  const asinMatch = product.asinLink.match(/\/dp\/([A-Z0-9]{10})/i);
  if (!asinMatch) continue;
  
  const asin = asinMatch[1];
  const spec = RETAIL_SPECS[ingredientName];
  
  let status: ClassificationResult['status'];
  let confidence: ClassificationResult['confidence'];
  let issues: string[] = [];
  let notes = '';
  
  // Dead link check
  if (deadLinks.has(asin)) {
    status = 'auto-invalid';
    confidence = 'high';
    issues.push('Dead link (HTTP 405)');
    notes = 'NEEDS REPLACEMENT - Link is dead';
  }
  // Has spec - validate it
  else if (spec) {
    const validationResult = validator.validateProductTitle(
      product.productName,
      spec,
      asin
    );
    
    confidence = validationResult.confidence;
    issues = validationResult.issues.map(i => `${i.severity.toUpperCase()}: ${i.message}`);
    
    if (validationResult.status === 'valid') {
      status = 'auto-valid';
      notes = '✅ Passes all validation checks';
    } else if (validationResult.status === 'invalid') {
      status = 'auto-invalid';
      notes = '❌ Failed validation - likely wrong product';
    } else {
      status = 'needs-review';
      notes = '⚠️ Ambiguous - manual review needed';
    }
  }
  // No spec - check if duplicate ASIN
  else {
    const duplicates = asinMap.get(asin) || [];
    if (duplicates.length > 1) {
      status = 'needs-review';
      confidence = 'medium';
      issues.push(`Duplicate ASIN shared with: ${duplicates.filter(d => d !== ingredientName).join(', ')}`);
      notes = '⚠️ Duplicate ASIN - verify if appropriate';
    } else {
      status = 'no-spec';
      confidence = 'medium';
      notes = 'No validation spec defined - assumed OK';
    }
  }
  
  results.push({
    ingredient: ingredientName,
    productName: product.productName,
    asin,
    link: product.asinLink,
    status,
    confidence,
    issues,
    notes,
  });
}

// Generate statistics
const stats = {
  total: results.length,
  autoValid: results.filter(r => r.status === 'auto-valid').length,
  autoInvalid: results.filter(r => r.status === 'auto-invalid').length,
  needsReview: results.filter(r => r.status === 'needs-review').length,
  noSpec: results.filter(r => r.status === 'no-spec').length,
};

console.log('CLASSIFICATION RESULTS');
console.log('-'.repeat(80));
console.log(`Total items: ${stats.total}`);
console.log(`✅ Auto-valid: ${stats.autoValid} (${((stats.autoValid / stats.total) * 100).toFixed(1)}%)`);
console.log(`❌ Auto-invalid: ${stats.autoInvalid} (${((stats.autoInvalid / stats.total) * 100).toFixed(1)}%)`);
console.log(`⚠️  Needs review: ${stats.needsReview} (${((stats.needsReview / stats.total) * 100).toFixed(1)}%)`);
console.log(`📋 No spec: ${stats.noSpec} (${((stats.noSpec / stats.total) * 100).toFixed(1)}%)`);
console.log();
console.log(`Manual review reduced from 94 → ${stats.needsReview + stats.autoInvalid} items`);
console.log();

// Show items needing review
const reviewItems = results.filter(r => r.status === 'needs-review' || r.status === 'auto-invalid');

if (reviewItems.length > 0) {
  console.log('='.repeat(80));
  console.log(`ITEMS REQUIRING MANUAL REVIEW (${reviewItems.length})`);
  console.log('='.repeat(80));
  console.log();
  
  reviewItems.forEach((item, idx) => {
    console.log(`${idx + 1}. ${item.ingredient}`);
    console.log(`   Product: ${item.productName}`);
    console.log(`   ASIN: ${item.asin}`);
    console.log(`   Status: ${item.status.toUpperCase()}`);
    console.log(`   Confidence: ${item.confidence.toUpperCase()}`);
    if (item.issues.length > 0) {
      console.log(`   Issues:`);
      item.issues.forEach(issue => console.log(`     - ${issue}`));
    }
    console.log(`   Notes: ${item.notes}`);
    console.log(`   Link: ${item.link}`);
    console.log();
  });
}

// Generate CSV for manual review
const csvHeader = 'Status,Ingredient,Product Name,ASIN,Confidence,Issues,Notes,Action Needed,Link\n';
const csvRows = reviewItems.map(item => {
  const escapeCsv = (str: string) => `"${str.replace(/"/g, '""')}"`;
  return [
    item.status.toUpperCase(),
    escapeCsv(item.ingredient),
    escapeCsv(item.productName),
    item.asin,
    item.confidence.toUpperCase(),
    escapeCsv(item.issues.join('; ')),
    escapeCsv(item.notes),
    item.status === 'auto-invalid' ? 'FIND NEW ASIN' : 'VERIFY',
    item.link,
  ].join(',');
}).join('\n');

const csv = csvHeader + csvRows;
const outputPath = path.join(process.cwd(), 'MANUAL_REVIEW_REQUIRED.csv');
fs.writeFileSync(outputPath, csv, 'utf-8');

console.log('='.repeat(80));
console.log('NEXT STEPS');
console.log('='.repeat(80));
console.log();
console.log(`1. Open MANUAL_REVIEW_REQUIRED.csv (${reviewItems.length} items)`);
console.log('2. Click each link and verify product matches ingredient');
console.log('3. For AUTO-INVALID items: Find replacement ASIN');
console.log('4. For NEEDS-REVIEW items: Confirm if product is correct');
console.log();
console.log(`CSV saved to: ${outputPath}`);
console.log();

// Generate summary report
const report = `# Auto-Classification Report

## Summary

**Total items processed:** ${stats.total}

- ✅ **Auto-valid:** ${stats.autoValid} (${((stats.autoValid / stats.total) * 100).toFixed(1)}%)
- ❌ **Auto-invalid:** ${stats.autoInvalid} (${((stats.autoInvalid / stats.total) * 100).toFixed(1)}%)
- ⚠️ **Needs review:** ${stats.needsReview} (${((stats.needsReview / stats.total) * 100).toFixed(1)}%)
- 📋 **No spec:** ${stats.noSpec} (${((stats.noSpec / stats.total) * 100).toFixed(1)}%)

**Manual review reduced:** 94 → ${stats.needsReview + stats.autoInvalid} items (${Math.round((1 - (stats.needsReview + stats.autoInvalid) / 94) * 100)}% reduction)

---

## Auto-Invalid Items (${stats.autoInvalid})

These items failed validation and need replacement ASINs:

${results.filter(r => r.status === 'auto-invalid').map(item => 
  `### ${item.ingredient}
- **Product:** ${item.productName}
- **ASIN:** ${item.asin}
- **Issues:** ${item.issues.join(', ')}
- **Action:** Find correct product on Amazon
- **Link:** ${item.link}
`).join('\n')}

---

## Needs Review (${stats.needsReview})

These items are ambiguous and need human verification:

${results.filter(r => r.status === 'needs-review').slice(0, 10).map(item =>
  `### ${item.ingredient}
- **Product:** ${item.productName}
- **ASIN:** ${item.asin}
- **Issues:** ${item.issues.join(', ')}
- **Action:** Verify if product is correct
- **Link:** ${item.link}
`).join('\n')}

${stats.needsReview > 10 ? `\n... and ${stats.needsReview - 10} more (see CSV)\n` : ''}

---

## Auto-Valid Items (${stats.autoValid})

These items passed all validation checks and are assumed correct.

---

## Next Steps

1. **Review the ${reviewItems.length} flagged items** in MANUAL_REVIEW_REQUIRED.csv
2. **Find replacement ASINs** for auto-invalid items
3. **Verify ambiguous items** by clicking links
4. **Update vetted-products.ts** with corrections

---

## Phase 2: PA-API Integration

After manual review is complete, we'll implement:
- Automated metadata fetching from Amazon PA-API
- Price and availability tracking
- Automatic re-validation of stale links
- Confidence scoring and caching
`;

const reportPath = path.join(process.cwd(), 'AUTO_CLASSIFICATION_REPORT.md');
fs.writeFileSync(reportPath, report, 'utf-8');

console.log(`Report saved to: ${reportPath}`);
console.log();
console.log('='.repeat(80));
