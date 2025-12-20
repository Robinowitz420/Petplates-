// Phase 1.5: Enhanced auto-classification with clustering and token equivalence
// Reduces manual review from ~90 items to ~20 items

import { VETTED_PRODUCTS } from '../data/vetted-products';
import { RETAIL_SPECS } from '../validation/retailSpecDefinitions';
import { EnhancedRetailValidator } from '../validation/enhancedRetailValidator';
import { ASINClusterer } from '../validation/asinClusterer';
import * as fs from 'fs';
import * as path from 'path';

interface EnhancedClassificationResult {
  ingredient: string;
  productName: string;
  asin: string;
  link: string;
  status: 'auto-valid' | 'auto-structurally-valid' | 'auto-invalid' | 'needs-review' | 'no-spec';
  confidence: 'high' | 'medium' | 'low';
  issues: string[];
  notes: string;
  aliasGroup?: string;
  reasoning?: string;
}

const validator = new EnhancedRetailValidator();
const clusterer = new ASINClusterer();
const results: EnhancedClassificationResult[] = [];

console.log('='.repeat(80));
console.log('PHASE 1.5: ENHANCED AUTO-CLASSIFICATION');
console.log('With ASIN clustering + token equivalence + 4-state validation');
console.log('='.repeat(80));
console.log();

// Known dead links
const deadLinks = new Set(['B0082C00P8', 'B0006L2XNK']);

// STEP 1: Cluster duplicate ASINs
console.log('Step 1: Clustering duplicate ASINs...');
const productMap = new Map(Object.entries(VETTED_PRODUCTS));
const { aliasGroups, conflicts, singles } = clusterer.clusterByASIN(productMap);

console.log(`  Found ${aliasGroups.length} alias groups`);
console.log(`  Found ${conflicts.length} conflicts (wrong products)`);
console.log(`  Found ${singles.length} single-ASIN ingredients`);
console.log();

// STEP 2: Validate alias groups (once per group)
console.log('Step 2: Validating alias groups...');
const groupValidations = new Map<string, any>();

for (const group of aliasGroups) {
  const product = VETTED_PRODUCTS[group.canonicalName];
  if (!product) continue;
  
  const spec = RETAIL_SPECS[group.canonicalName];
  if (!spec) {
    // No spec for this group - mark as structurally valid by default
    groupValidations.set(group.groupId, {
      status: 'structurally-valid',
      confidence: 'medium',
      notes: 'No spec defined - assumed OK (alias group)',
    });
    continue;
  }
  
  const validationResult = validator.validateProductTitle(
    product.productName,
    spec,
    group.sharedASIN,
    group.canonicalName
  );
  
  groupValidations.set(group.groupId, validationResult);
}

console.log(`  Validated ${groupValidations.size} alias groups`);
console.log();

// STEP 3: Process all ingredients
console.log('Step 3: Classifying all ingredients...');

// Create reverse lookup: ingredient -> alias group
const ingredientToGroup = new Map<string, string>();
for (const group of aliasGroups) {
  for (const alias of group.aliases) {
    ingredientToGroup.set(alias, group.groupId);
  }
}

for (const [ingredientName, product] of Object.entries(VETTED_PRODUCTS)) {
  const asinMatch = product.asinLink.match(/\/dp\/([A-Z0-9]{10})/i);
  if (!asinMatch) continue;
  
  const asin = asinMatch[1];
  const spec = RETAIL_SPECS[ingredientName];
  
  let status: EnhancedClassificationResult['status'];
  let confidence: EnhancedClassificationResult['confidence'];
  let issues: string[] = [];
  let notes = '';
  let reasoning = '';
  let aliasGroup: string | undefined;
  
  // Check if dead link
  if (deadLinks.has(asin)) {
    status = 'auto-invalid';
    confidence = 'high';
    issues.push('Dead link (HTTP 405)');
    notes = '❌ NEEDS REPLACEMENT - Link is dead';
  }
  // Check if part of alias group
  else if (ingredientToGroup.has(ingredientName)) {
    const groupId = ingredientToGroup.get(ingredientName)!;
    const groupValidation = groupValidations.get(groupId);
    aliasGroup = groupId;
    
    if (groupValidation) {
      // Inherit validation from group
      if (groupValidation.status === 'valid') {
        status = 'auto-valid';
        confidence = groupValidation.confidence;
        notes = `✅ Valid (alias group: ${groupId})`;
      } else if (groupValidation.status === 'structurally-valid') {
        status = 'auto-structurally-valid';
        confidence = groupValidation.confidence;
        notes = `✅ Structurally valid (alias group: ${groupId})`;
        if (groupValidation.reasoning?.equivalentTokensUsed?.length > 0) {
          reasoning = `Uses equivalent tokens: ${groupValidation.reasoning.equivalentTokensUsed.map((e: any) => `${e.token}≈${e.synonym}`).join(', ')}`;
        }
      } else if (groupValidation.status === 'ambiguous') {
        status = 'needs-review';
        confidence = groupValidation.confidence;
        notes = `⚠️ Ambiguous (alias group: ${groupId})`;
      } else {
        status = 'auto-invalid';
        confidence = groupValidation.confidence;
        notes = `❌ Invalid (alias group: ${groupId})`;
      }
      
      if (groupValidation.structuralIssues) {
        issues.push(...groupValidation.structuralIssues.map((i: any) => `STRUCTURAL: ${i.message}`));
      }
      if (groupValidation.semanticIssues) {
        issues.push(...groupValidation.semanticIssues.map((i: any) => `SEMANTIC: ${i.message}`));
      }
    } else {
      status = 'no-spec';
      confidence = 'medium';
      notes = `No spec (alias group: ${groupId})`;
    }
  }
  // Check if conflict
  else if (conflicts.some(c => c.ingredients.includes(ingredientName))) {
    const conflict = conflicts.find(c => c.ingredients.includes(ingredientName))!;
    status = 'needs-review';
    confidence = 'low';
    issues.push(`CONFLICT: ${conflict.reason}`);
    notes = `⚠️ Conflict detected - likely wrong product`;
  }
  // Has spec - validate individually
  else if (spec) {
    const validationResult = validator.validateProductTitle(
      product.productName,
      spec,
      asin,
      ingredientName
    );
    
    confidence = validationResult.confidence;
    
    if (validationResult.structuralIssues) {
      issues.push(...validationResult.structuralIssues.map(i => `STRUCTURAL: ${i.message}`));
    }
    if (validationResult.semanticIssues) {
      issues.push(...validationResult.semanticIssues.map(i => `SEMANTIC: ${i.message}`));
    }
    
    if (validationResult.reasoning?.equivalentTokensUsed?.length > 0) {
      reasoning = `Uses equivalent tokens: ${validationResult.reasoning.equivalentTokensUsed.map(e => `${e.token}≈${e.synonym}`).join(', ')}`;
    }
    
    if (validationResult.status === 'valid') {
      status = 'auto-valid';
      notes = '✅ Passes all validation checks';
    } else if (validationResult.status === 'structurally-valid') {
      status = 'auto-structurally-valid';
      notes = '✅ Structurally valid - safe to use';
    } else if (validationResult.status === 'invalid') {
      status = 'auto-invalid';
      notes = '❌ Failed validation - likely wrong product';
    } else {
      status = 'needs-review';
      notes = '⚠️ Ambiguous - manual review needed';
    }
  }
  // No spec - assume OK
  else {
    status = 'no-spec';
    confidence = 'medium';
    notes = 'No validation spec defined - assumed OK';
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
    aliasGroup,
    reasoning,
  });
}

// Generate statistics
const stats = {
  total: results.length,
  autoValid: results.filter(r => r.status === 'auto-valid').length,
  autoStructurallyValid: results.filter(r => r.status === 'auto-structurally-valid').length,
  autoInvalid: results.filter(r => r.status === 'auto-invalid').length,
  needsReview: results.filter(r => r.status === 'needs-review').length,
  noSpec: results.filter(r => r.status === 'no-spec').length,
  inAliasGroups: results.filter(r => r.aliasGroup).length,
};

console.log();
console.log('='.repeat(80));
console.log('PHASE 1.5 RESULTS');
console.log('='.repeat(80));
console.log();
console.log(`Total items: ${stats.total}`);
console.log(`✅ Auto-valid: ${stats.autoValid} (${((stats.autoValid / stats.total) * 100).toFixed(1)}%)`);
console.log(`✅ Auto-structurally-valid: ${stats.autoStructurallyValid} (${((stats.autoStructurallyValid / stats.total) * 100).toFixed(1)}%)`);
console.log(`❌ Auto-invalid: ${stats.autoInvalid} (${((stats.autoInvalid / stats.total) * 100).toFixed(1)}%)`);
console.log(`⚠️  Needs review: ${stats.needsReview} (${((stats.needsReview / stats.total) * 100).toFixed(1)}%)`);
console.log(`📋 No spec: ${stats.noSpec} (${((stats.noSpec / stats.total) * 100).toFixed(1)}%)`);
console.log();
console.log(`🔗 In alias groups: ${stats.inAliasGroups} (${((stats.inAliasGroups / stats.total) * 100).toFixed(1)}%)`);
console.log();

const totalAccepted = stats.autoValid + stats.autoStructurallyValid + stats.noSpec;
const manualReviewNeeded = stats.needsReview + stats.autoInvalid;

console.log(`📊 SUMMARY:`);
console.log(`   Automatically accepted: ${totalAccepted} (${((totalAccepted / stats.total) * 100).toFixed(1)}%)`);
console.log(`   Manual review required: ${manualReviewNeeded} (${((manualReviewNeeded / stats.total) * 100).toFixed(1)}%)`);
console.log();
console.log(`🎯 Manual review reduced from 94 → ${manualReviewNeeded} items`);
console.log(`   (${Math.round((1 - manualReviewNeeded / 94) * 100)}% reduction)`);
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
    if (item.aliasGroup) console.log(`   Alias Group: ${item.aliasGroup}`);
    if (item.issues.length > 0) {
      console.log(`   Issues:`);
      item.issues.forEach(issue => console.log(`     - ${issue}`));
    }
    if (item.reasoning) console.log(`   Reasoning: ${item.reasoning}`);
    console.log(`   Notes: ${item.notes}`);
    console.log(`   Link: ${item.link}`);
    console.log();
  });
}

// Generate CSV for manual review
const csvHeader = 'Status,Ingredient,Product Name,ASIN,Confidence,Alias Group,Issues,Notes,Action Needed,Link\n';
const csvRows = reviewItems.map(item => {
  const escapeCsv = (str: string) => `"${str.replace(/"/g, '""')}"`;
  return [
    item.status.toUpperCase(),
    escapeCsv(item.ingredient),
    escapeCsv(item.productName),
    item.asin,
    item.confidence.toUpperCase(),
    item.aliasGroup || '',
    escapeCsv(item.issues.join('; ')),
    escapeCsv(item.notes),
    item.status === 'auto-invalid' ? 'FIND NEW ASIN' : 'VERIFY',
    item.link,
  ].join(',');
}).join('\n');

const csv = csvHeader + csvRows;
const outputPath = path.join(process.cwd(), 'PHASE_1_5_MANUAL_REVIEW.csv');
fs.writeFileSync(outputPath, csv, 'utf-8');

console.log('='.repeat(80));
console.log('FILES GENERATED');
console.log('='.repeat(80));
console.log();
console.log(`CSV saved to: ${outputPath}`);
console.log();
console.log('='.repeat(80));
