// Generate a verification list for manual Amazon link checking
// Outputs CSV format for easy tracking in Excel/Sheets

import { VETTED_PRODUCTS } from '../data/vetted-products';
import * as fs from 'fs';
import * as path from 'path';

interface VerificationItem {
  ingredient: string;
  productName: string;
  asin: string;
  link: string;
  issue: string;
  priority: 'high' | 'medium' | 'low';
  verified: 'pending' | 'correct' | 'wrong' | 'dead';
  notes: string;
}

const items: VerificationItem[] = [];

// Track duplicate ASINs
const asinMap = new Map<string, string[]>();

for (const [ingredientName, product] of Object.entries(VETTED_PRODUCTS)) {
  const asinLink = product.asinLink;
  const asinMatch = asinLink.match(/\/dp\/([A-Z0-9]{10})/i);
  
  if (asinMatch) {
    const asin = asinMatch[1];
    if (!asinMap.has(asin)) {
      asinMap.set(asin, []);
    }
    asinMap.get(asin)!.push(ingredientName);
  }
}

// Known dead links from HTTP check
const deadLinks = new Set(['B0082C00P8', 'B0006L2XNK']);

// Known suspicious mappings
const suspiciousMapping: Record<string, { ingredients: string[]; issue: string }> = {
  'B07VHR2WNZ': { ingredients: ['ground beef (lean)', 'venison'], issue: 'Beef and venison are different meats' },
  'B0082C00P8': { ingredients: ['ground lamb', 'rabbit meat'], issue: 'Lamb and rabbit are different meats (DEAD LINK)' },
  'B0BXZ3JJL9': { ingredients: ['chicken hearts', 'turkey giblets'], issue: 'Chicken and turkey are different poultry' },
  'B01FUWYO2M': { ingredients: ['sardines (canned in water)', 'herring (canned)', 'sardines (in water)'], issue: 'Sardines and herring are different fish' },
  'B00WM6CHFQ': { ingredients: ['mango', 'chia seed oil'], issue: 'Mango and chia oil are completely different' },
  'B0BWBNT8JX': { ingredients: ['egg (hard-boiled)', 'duck hearts'], issue: 'Eggs and duck hearts are different' },
  'B00027ZVG4': { ingredients: ['canary seed', 'flaxseeds', 'rapeseed', 'sunflower seeds (small amounts)', 'pumpkin seeds', 'cuttlebone'], issue: 'Multiple seed types - verify if seed mix is appropriate' },
  'B086211R4H': { ingredients: ['niger seed', 'oat groats', 'hemp seeds', 'sesame seeds', 'chia seeds', 'pellets (fortified)'], issue: 'Multiple seed types - verify if seed mix is appropriate' },
};

// Generate verification items
for (const [ingredientName, product] of Object.entries(VETTED_PRODUCTS)) {
  const asinLink = product.asinLink;
  const asinMatch = asinLink.match(/\/dp\/([A-Z0-9]{10})/i);
  
  if (!asinMatch) continue;
  
  const asin = asinMatch[1];
  
  // Check if this needs verification
  let needsVerification = false;
  let issue = '';
  let priority: 'high' | 'medium' | 'low' = 'low';
  
  // Dead link
  if (deadLinks.has(asin)) {
    needsVerification = true;
    issue = 'Dead link (HTTP 405) - needs replacement';
    priority = 'high';
  }
  // Suspicious mapping
  else if (suspiciousMapping[asin]) {
    needsVerification = true;
    issue = suspiciousMapping[asin].issue;
    priority = 'high';
  }
  // Duplicate ASIN (but not in suspicious list)
  else if (asinMap.get(asin)!.length > 1) {
    needsVerification = true;
    issue = `Shared with: ${asinMap.get(asin)!.filter(i => i !== ingredientName).join(', ')}`;
    priority = 'medium';
  }
  
  if (needsVerification) {
    items.push({
      ingredient: ingredientName,
      productName: product.productName,
      asin,
      link: asinLink,
      issue,
      priority,
      verified: deadLinks.has(asin) ? 'dead' : 'pending',
      notes: '',
    });
  }
}

// Sort by priority
items.sort((a, b) => {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return priorityOrder[a.priority] - priorityOrder[b.priority];
});

// Generate CSV
const csvHeader = 'Priority,Ingredient,Product Name,ASIN,Issue,Verified,Notes,Link\n';
const csvRows = items.map(item => {
  const escapeCsv = (str: string) => `"${str.replace(/"/g, '""')}"`;
  return [
    item.priority.toUpperCase(),
    escapeCsv(item.ingredient),
    escapeCsv(item.productName),
    item.asin,
    escapeCsv(item.issue),
    item.verified.toUpperCase(),
    '', // Empty notes column for manual entry
    item.link,
  ].join(',');
}).join('\n');

const csv = csvHeader + csvRows;

// Save to file
const outputPath = path.join(process.cwd(), 'AMAZON_LINK_VERIFICATION.csv');
fs.writeFileSync(outputPath, csv, 'utf-8');

console.log('='.repeat(80));
console.log('VERIFICATION LIST GENERATED');
console.log('='.repeat(80));
console.log();
console.log(`Total items needing verification: ${items.length}`);
console.log(`  High priority: ${items.filter(i => i.priority === 'high').length}`);
console.log(`  Medium priority: ${items.filter(i => i.priority === 'medium').length}`);
console.log(`  Low priority: ${items.filter(i => i.priority === 'low').length}`);
console.log();
console.log(`CSV file saved to: ${outputPath}`);
console.log();
console.log('HOW TO USE:');
console.log('1. Open AMAZON_LINK_VERIFICATION.csv in Excel/Google Sheets');
console.log('2. Click each link in the "Link" column');
console.log('3. Verify if the Amazon product matches the ingredient');
console.log('4. Update "Verified" column: CORRECT, WRONG, or DEAD');
console.log('5. Add notes in "Notes" column if needed');
console.log('6. For WRONG/DEAD items, find correct ASIN and add to notes');
console.log();
console.log('='.repeat(80));

// Also generate a markdown table for easy viewing
const mdTable = `# Amazon Link Verification List

Total items: ${items.length}

## High Priority (${items.filter(i => i.priority === 'high').length})

| Ingredient | Product | ASIN | Issue | Link |
|------------|---------|------|-------|------|
${items.filter(i => i.priority === 'high').map(item => 
  `| ${item.ingredient} | ${item.productName} | ${item.asin} | ${item.issue} | [Verify](${item.link}) |`
).join('\n')}

## Medium Priority (${items.filter(i => i.priority === 'medium').length})

| Ingredient | Product | ASIN | Issue | Link |
|------------|---------|------|-------|------|
${items.filter(i => i.priority === 'medium').slice(0, 10).map(item => 
  `| ${item.ingredient} | ${item.productName} | ${item.asin} | ${item.issue} | [Verify](${item.link}) |`
).join('\n')}

${items.filter(i => i.priority === 'medium').length > 10 ? `\n... and ${items.filter(i => i.priority === 'medium').length - 10} more medium priority items (see CSV)\n` : ''}

## Instructions

1. Click each "Verify" link
2. Check if Amazon product matches ingredient name
3. Mark in CSV: CORRECT, WRONG, or DEAD
4. For WRONG/DEAD: Find correct product and note new ASIN
`;

const mdPath = path.join(process.cwd(), 'AMAZON_LINK_VERIFICATION.md');
fs.writeFileSync(mdPath, mdTable, 'utf-8');

console.log(`Markdown file saved to: ${mdPath}`);
console.log();
