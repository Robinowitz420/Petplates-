// Intent-based buy link validator
// Validates Amazon links point to correct product TYPE using required/forbidden tokens

import { VETTED_PRODUCTS } from '../lib/data/vetted-products.ts';
import { inferValidationRules, validateProductTitle, generateSearchQuery, generateSearchUrl } from '../lib/utils/buyLinkValidation.ts';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Intent-Based Buy Link Validation\n');
console.log('='.repeat(80));

const results = {
  total: 0,
  pass: 0,
  warn: 0,
  fail: 0,
  issues: [],
};

// Process each ingredient
for (const [ingredientName, product] of Object.entries(VETTED_PRODUCTS)) {
  results.total++;
  
  // Infer validation rules from ingredient name and category
  const validation = inferValidationRules(ingredientName, product.category);
  
  // Validate product title against rules
  const report = validateProductTitle(product.productName, validation);
  
  if (report.result === 'PASS') {
    results.pass++;
  } else if (report.result === 'WARN') {
    results.warn++;
    results.issues.push({
      ingredient: ingredientName,
      product: product.productName,
      category: product.category,
      asinLink: product.asinLink,
      severity: 'WARN',
      reason: report.reason,
      suggestions: report.suggestions,
    });
  } else {
    results.fail++;
    results.issues.push({
      ingredient: ingredientName,
      product: product.productName,
      category: product.category,
      asinLink: product.asinLink,
      severity: 'FAIL',
      reason: report.reason,
      foundForbidden: report.foundForbidden,
      suggestions: report.suggestions,
    });
  }
}

// Print summary
console.log('\n📊 VALIDATION SUMMARY\n');
console.log(`Total ingredients: ${results.total}`);
console.log(`✅ PASS: ${results.pass} (${((results.pass / results.total) * 100).toFixed(1)}%)`);
console.log(`⚠️  WARN: ${results.warn} (${((results.warn / results.total) * 100).toFixed(1)}%)`);
console.log(`❌ FAIL: ${results.fail} (${((results.fail / results.total) * 100).toFixed(1)}%)`);

// Print failures (real mismatches)
if (results.fail > 0) {
  console.log('\n' + '='.repeat(80));
  console.log('❌ FAILURES (Real Mismatches - Fix Before Launch)\n');
  
  const failures = results.issues.filter(i => i.severity === 'FAIL');
  failures.forEach((issue, idx) => {
    console.log(`${idx + 1}. ${issue.ingredient}`);
    console.log(`   Product: ${issue.product}`);
    console.log(`   Category: ${issue.category}`);
    console.log(`   Reason: ${issue.reason}`);
    if (issue.foundForbidden) {
      console.log(`   Forbidden terms found: ${issue.foundForbidden.join(', ')}`);
    }
    console.log(`   Link: ${issue.asinLink}`);
    
    // Generate search suggestion
    const validation = inferValidationRules(issue.ingredient, issue.category);
    const searchQuery = generateSearchQuery(issue.ingredient, validation);
    const searchUrl = generateSearchUrl(searchQuery);
    console.log(`   🔍 Search suggestion: ${searchUrl}`);
    console.log();
  });
}

// Print warnings (review recommended)
if (results.warn > 0) {
  console.log('\n' + '='.repeat(80));
  console.log('⚠️  WARNINGS (Review Recommended)\n');
  
  const warnings = results.issues.filter(i => i.severity === 'WARN');
  warnings.slice(0, 10).forEach((issue, idx) => {
    console.log(`${idx + 1}. ${issue.ingredient}`);
    console.log(`   Product: ${issue.product}`);
    console.log(`   Reason: ${issue.reason}`);
    console.log();
  });
  
  if (warnings.length > 10) {
    console.log(`... and ${warnings.length - 10} more warnings\n`);
  }
}

// Generate markdown report
let markdown = `# Buy Link Validation Report (Intent-Based)

**Generated:** ${new Date().toISOString()}  
**Total Ingredients:** ${results.total}

## Summary

- ✅ **PASS:** ${results.pass} (${((results.pass / results.total) * 100).toFixed(1)}%)
- ⚠️ **WARN:** ${results.warn} (${((results.warn / results.total) * 100).toFixed(1)}%)
- ❌ **FAIL:** ${results.fail} (${((results.fail / results.total) * 100).toFixed(1)}%)

---

## ❌ Failures (Fix Before Launch)

These are likely wrong products - forbidden terms found or missing required terms.

`;

const failures = results.issues.filter(i => i.severity === 'FAIL');
failures.forEach((issue, idx) => {
  markdown += `### ${idx + 1}. ${issue.ingredient}\n\n`;
  markdown += `- **Product:** ${issue.product}\n`;
  markdown += `- **Category:** ${issue.category}\n`;
  markdown += `- **Reason:** ${issue.reason}\n`;
  if (issue.foundForbidden) {
    markdown += `- **Forbidden terms:** ${issue.foundForbidden.join(', ')}\n`;
  }
  markdown += `- **Current link:** ${issue.asinLink}\n`;
  
  const validation = inferValidationRules(issue.ingredient, issue.category);
  const searchQuery = generateSearchQuery(issue.ingredient, validation);
  const searchUrl = generateSearchUrl(searchQuery);
  markdown += `- **Search suggestion:** [${searchQuery}](${searchUrl})\n`;
  markdown += `\n`;
});

markdown += `\n---\n\n## ⚠️ Warnings (Review Recommended)\n\n`;

const warnings = results.issues.filter(i => i.severity === 'WARN');
warnings.forEach((issue, idx) => {
  markdown += `### ${idx + 1}. ${issue.ingredient}\n\n`;
  markdown += `- **Product:** ${issue.product}\n`;
  markdown += `- **Reason:** ${issue.reason}\n`;
  markdown += `\n`;
});

// Save report
const reportPath = path.join(__dirname, '../BUY_LINK_VALIDATION_REPORT.md');
fs.writeFileSync(reportPath, markdown, 'utf8');

console.log('\n' + '='.repeat(80));
console.log(`\n💾 Full report saved to: BUY_LINK_VALIDATION_REPORT.md`);
console.log('\n✅ Validation complete!');

// Exit with error code if there are failures
process.exit(results.fail > 0 ? 1 : 0);
