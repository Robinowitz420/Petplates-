// scripts/validate-affiliate-links.ts
// Validates all affiliate links have seller ID and valid ASIN format
// Exit with error code if issues found (for CI/CD)

import * as fs from 'fs';
import * as path from 'path';

const SELLER_ID = 'robinfrench-20';
const VETTED_PRODUCTS_FILE = path.join(__dirname, '../lib/data/vetted-products.ts');

interface ValidationResult {
  ingredient: string;
  hasSellerId: boolean;
  hasValidASIN: boolean;
  isGenericSearch: boolean;
  issues: string[];
}

const results: ValidationResult[] = [];
const errors: string[] = [];
let hasErrors = false;

// Helper to check if URL has seller ID
function hasSellerId(url: string): boolean {
  if (!url) return false;
  return url.includes(`tag=${SELLER_ID}`) || url.includes(`AssociateTag=${SELLER_ID}`);
}

// Helper to check if URL is a specific ASIN link (not generic search)
function isGenericSearch(url: string): boolean {
  if (!url) return false;
  return url.includes('/s?k=') || url.includes('/s?') || url.includes('search/');
}

// Extract ASIN from URL
function extractASIN(url: string): string | null {
  if (!url) return null;
  
  // Try /dp/ASIN pattern
  const dpMatch = url.match(/\/dp\/([A-Z0-9]{10})(?:\/|$|\?)/);
  if (dpMatch) return dpMatch[1];
  
  // Try /gp/product/ASIN pattern
  const gpMatch = url.match(/\/gp\/product\/([A-Z0-9]{10})(?:\/|$|\?)/);
  if (gpMatch) return gpMatch[1];
  
  // Try /product/ASIN pattern
  const productMatch = url.match(/\/product\/([A-Z0-9]{10})(?:\/|$|\?)/);
  if (productMatch) return productMatch[1];
  
  return null;
}

// Validate vetted products
function validateVettedProducts() {
  console.log('🔍 Validating vetted products...\n');
  
  const content = fs.readFileSync(VETTED_PRODUCTS_FILE, 'utf-8');
  const lines = content.split('\n');
  
  let currentIngredient: string | null = null;
  let currentLink: string | null = null;
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
      
      // End of product block
      if (braceDepth === 0) {
        if (currentIngredient && currentLink) {
          const result: ValidationResult = {
            ingredient: currentIngredient,
            hasSellerId: hasSellerId(currentLink),
            hasValidASIN: !!extractASIN(currentLink),
            isGenericSearch: isGenericSearch(currentLink),
            issues: [],
          };
          
          if (!result.hasSellerId) {
            result.issues.push('Missing seller ID');
            errors.push(`${currentIngredient} (line ${startLine}): Missing seller ID`);
            hasErrors = true;
          }
          
          if (!result.hasValidASIN) {
            result.issues.push('Invalid or missing ASIN');
            errors.push(`${currentIngredient} (line ${startLine}): Invalid ASIN format`);
            hasErrors = true;
          }
          
          if (result.isGenericSearch) {
            result.issues.push('Generic search URL (not specific product)');
            errors.push(`${currentIngredient} (line ${startLine}): Generic search URL`);
            hasErrors = true;
          }
          
          results.push(result);
        }
        
        // Reset
        currentIngredient = null;
        currentLink = null;
        inProductBlock = false;
      }
    }
  }
  
  return results.length;
}

// Main execution
function main() {
  console.log('🔍 Affiliate Links Validation\n');
  console.log('='.repeat(60));
  
  const count = validateVettedProducts();
  
  // Summary
  console.log('='.repeat(60));
  console.log('📊 VALIDATION SUMMARY\n');
  
  const valid = results.filter(r => r.issues.length === 0).length;
  const invalid = results.filter(r => r.issues.length > 0).length;
  
  console.log(`Total entries validated: ${count}`);
  console.log(`✅ Valid: ${valid}`);
  console.log(`❌ Invalid: ${invalid}`);
  
  if (hasErrors) {
    console.log('\n❌ VALIDATION FAILED\n');
    console.log('Issues found:');
    errors.forEach((error, idx) => {
      console.log(`${idx + 1}. ${error}`);
    });
    console.log('\n');
    process.exit(1);
  } else {
    console.log('\n✅ All affiliate links are valid!\n');
    process.exit(0);
  }
}

// Run validation
try {
  main();
} catch (error) {
  console.error('❌ Error running validation:', error);
  process.exit(1);
}

