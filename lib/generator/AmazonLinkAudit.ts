// Amazon Affiliate Link Audit
// Checks all asinLink values in vetted-products for issues

import { VETTED_PRODUCTS } from '../data/vetted-products';

interface LinkIssue {
  ingredient: string;
  issue: string;
  asinLink?: string;
  productName?: string;
}

const issues: LinkIssue[] = [];
const stats = {
  total: 0,
  withLinks: 0,
  withoutLinks: 0,
  invalidFormat: 0,
  missingAsin: 0,
  suspiciousLinks: 0,
  duplicateAsins: new Map<string, string[]>(),
};

console.log('='.repeat(80));
console.log('AMAZON AFFILIATE LINK AUDIT');
console.log('='.repeat(80));
console.log();

// Check each product
for (const [ingredientName, product] of Object.entries(VETTED_PRODUCTS)) {
  stats.total++;
  
  const asinLink = product.asinLink;
  
  // Issue 1: Missing asinLink
  if (!asinLink || asinLink === '') {
    stats.withoutLinks++;
    issues.push({
      ingredient: ingredientName,
      issue: 'Missing asinLink',
      productName: product.productName,
    });
    continue;
  }
  
  stats.withLinks++;
  
  // Issue 2: Invalid format (should be Amazon URL)
  if (!asinLink.includes('amazon.com')) {
    stats.invalidFormat++;
    issues.push({
      ingredient: ingredientName,
      issue: 'Not an Amazon link',
      asinLink,
      productName: product.productName,
    });
    continue;
  }
  
  // Issue 3: Missing ASIN in URL
  const asinMatch = asinLink.match(/\/dp\/([A-Z0-9]{10})/i);
  if (!asinMatch) {
    stats.missingAsin++;
    issues.push({
      ingredient: ingredientName,
      issue: 'No valid ASIN found in URL',
      asinLink,
      productName: product.productName,
    });
    continue;
  }
  
  const asin = asinMatch[1];
  
  // Issue 4: Missing affiliate tag
  if (!asinLink.includes('tag=robinfrench-20')) {
    stats.suspiciousLinks++;
    issues.push({
      ingredient: ingredientName,
      issue: 'Missing affiliate tag (tag=robinfrench-20)',
      asinLink,
      productName: product.productName,
    });
  }
  
  // Track duplicate ASINs
  if (!stats.duplicateAsins.has(asin)) {
    stats.duplicateAsins.set(asin, []);
  }
  stats.duplicateAsins.get(asin)!.push(ingredientName);
}

// Find actual duplicates (same ASIN used for multiple ingredients)
const duplicates = Array.from(stats.duplicateAsins.entries())
  .filter(([_, ingredients]) => ingredients.length > 1);

// Print Summary
console.log('SUMMARY');
console.log('-'.repeat(80));
console.log(`Total products: ${stats.total}`);
console.log(`With links: ${stats.withLinks} (${((stats.withLinks / stats.total) * 100).toFixed(1)}%)`);
console.log(`Without links: ${stats.withoutLinks} (${((stats.withoutLinks / stats.total) * 100).toFixed(1)}%)`);
console.log();
console.log(`Issues found: ${issues.length}`);
console.log(`  - Invalid format: ${stats.invalidFormat}`);
console.log(`  - Missing ASIN: ${stats.missingAsin}`);
console.log(`  - Missing affiliate tag: ${stats.suspiciousLinks}`);
console.log(`  - Duplicate ASINs: ${duplicates.length} ASINs used for multiple ingredients`);
console.log();

// Print Issues
if (issues.length > 0) {
  console.log('='.repeat(80));
  console.log('ISSUES FOUND');
  console.log('='.repeat(80));
  console.log();
  
  // Group by issue type
  const byType = issues.reduce((acc, issue) => {
    if (!acc[issue.issue]) acc[issue.issue] = [];
    acc[issue.issue].push(issue);
    return acc;
  }, {} as Record<string, LinkIssue[]>);
  
  for (const [issueType, issueList] of Object.entries(byType)) {
    console.log(`${issueType} (${issueList.length}):`);
    console.log('-'.repeat(80));
    
    issueList.slice(0, 10).forEach(issue => {
      console.log(`  Ingredient: ${issue.ingredient}`);
      if (issue.productName) console.log(`  Product: ${issue.productName}`);
      if (issue.asinLink) console.log(`  Link: ${issue.asinLink}`);
      console.log();
    });
    
    if (issueList.length > 10) {
      console.log(`  ... and ${issueList.length - 10} more`);
      console.log();
    }
  }
}

// Print Duplicate ASINs
if (duplicates.length > 0) {
  console.log('='.repeat(80));
  console.log('DUPLICATE ASINs');
  console.log('='.repeat(80));
  console.log();
  console.log('Same ASIN used for multiple ingredients (may indicate incorrect mappings):');
  console.log();
  
  duplicates.slice(0, 20).forEach(([asin, ingredients]) => {
    console.log(`ASIN ${asin} used for ${ingredients.length} ingredients:`);
    ingredients.forEach(ing => console.log(`  - ${ing}`));
    console.log();
  });
  
  if (duplicates.length > 20) {
    console.log(`... and ${duplicates.length - 20} more duplicate ASINs`);
  }
}

// Print recommendations
console.log('='.repeat(80));
console.log('RECOMMENDATIONS');
console.log('='.repeat(80));
console.log();

if (stats.withoutLinks > 0) {
  console.log(`1. Add asinLink for ${stats.withoutLinks} products without links`);
}

if (stats.invalidFormat > 0) {
  console.log(`2. Fix ${stats.invalidFormat} products with invalid link format`);
}

if (stats.missingAsin > 0) {
  console.log(`3. Fix ${stats.missingAsin} products with missing/invalid ASIN`);
}

if (stats.suspiciousLinks > 0) {
  console.log(`4. Add affiliate tag to ${stats.suspiciousLinks} products`);
}

if (duplicates.length > 0) {
  console.log(`5. Review ${duplicates.length} duplicate ASINs - may indicate wrong products`);
}

if (issues.length === 0 && duplicates.length === 0) {
  console.log('✅ All links look good! No issues found.');
}

console.log();
console.log('='.repeat(80));
