/**
 * Script to automatically detect and add species fields to VETTED_PRODUCTS
 * Based on productName patterns like "for Dogs", "for Cats", etc.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface VettedProduct {
  productName: string;
  asinLink: string;
  vetNote: string;
  category?: string;
  species?: 'dogs' | 'cats' | 'birds' | 'reptiles' | 'pocket-pets' | 'both' | string[];
  [key: string]: any;
}

interface ProductEntry {
  key: string;
  product: VettedProduct;
  detectedSpecies?: string | string[];
  needsUpdate: boolean;
}

function detectSpeciesFromProductName(productName: string): 'dogs' | 'cats' | 'birds' | 'reptiles' | 'pocket-pets' | 'both' | string[] | undefined {
  const nameLower = productName.toLowerCase();
  
  const hasForDogs = nameLower.includes('for dogs') || nameLower.includes('for dog');
  const hasForCats = nameLower.includes('for cats') || nameLower.includes('for cat');
  const hasForBirds = nameLower.includes('for birds') || nameLower.includes('for bird');
  const hasForReptiles = nameLower.includes('for reptiles') || nameLower.includes('for reptile');
  const hasForPocketPets = nameLower.includes('for pocket') || nameLower.includes('for rabbits') || 
                           nameLower.includes('for guinea') || nameLower.includes('for hamster');
  
  // Check for explicit "dog food" patterns (more strict than just "dog")
  const hasDogFood = nameLower.includes('dog food') && !nameLower.includes('cat');
  const hasCatFood = nameLower.includes('cat food') && !nameLower.includes('dog');
  
  // Multiple species mentioned
  const speciesCount = [hasForDogs, hasForCats, hasForBirds, hasForReptiles, hasForPocketPets].filter(Boolean).length;
  
  if (speciesCount > 1) {
    const species: string[] = [];
    if (hasForDogs) species.push('dogs');
    if (hasForCats) species.push('cats');
    if (hasForBirds) species.push('birds');
    if (hasForReptiles) species.push('reptiles');
    if (hasForPocketPets) species.push('pocket-pets');
    return species;
  }
  
  // Single species
  if (hasForDogs || hasDogFood) return 'dogs';
  if (hasForCats || hasCatFood) return 'cats';
  if (hasForBirds) return 'birds';
  if (hasForReptiles) return 'reptiles';
  if (hasForPocketPets) return 'pocket-pets';
  
  // No explicit species found
  return undefined;
}

function scanVettedProducts(): void {
  console.log('🔍 Scanning VETTED_PRODUCTS for species patterns...\n');
  
  const vettedProductsPath = path.join(__dirname, '../lib/data/vetted-products.ts');
  const content = fs.readFileSync(vettedProductsPath, 'utf8');
  
  // Extract VETTED_PRODUCTS object content
  const productsMatch = content.match(/export\s+const\s+VETTED_PRODUCTS[^=]*=\s*\{([\s\S]*)\}\s*;/);
  
  if (!productsMatch) {
    console.error('❌ Could not find VETTED_PRODUCTS in vetted-products.ts');
    process.exit(1);
  }
  
  const productsContent = productsMatch[1];
  
  // Parse entries - look for 'ingredient-name': { productName: '...', ... }
  const entryPattern = /'([^']+)':\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/g;
  const entries: ProductEntry[] = [];
  
  let match;
  while ((match = entryPattern.exec(productsContent)) !== null) {
    const key = match[1];
    const entryContent = match[2];
    
    // Extract productName
    const productNameMatch = entryContent.match(/productName:\s*'([^']*(?:\\'[^']*)*)'/);
    if (!productNameMatch) continue;
    
    const productName = productNameMatch[1].replace(/\\'/g, "'");
    
    // Check if species field already exists
    const hasSpeciesField = /species:\s*['"]/m.test(entryContent);
    
    // Detect species from product name
    const detectedSpecies = detectSpeciesFromProductName(productName);
    
    entries.push({
      key,
      product: { productName } as VettedProduct,
      detectedSpecies,
      needsUpdate: !hasSpeciesField && detectedSpecies !== undefined,
    });
  }
  
  // Generate report
  console.log(`📊 Scan Results:\n`);
  console.log(`   Total products scanned: ${entries.length}`);
  
  const needsUpdate = entries.filter(e => e.needsUpdate);
  const alreadyHasSpecies = entries.filter(e => e.product.species !== undefined || !e.needsUpdate && e.detectedSpecies);
  const noSpeciesFound = entries.filter(e => !e.needsUpdate && !e.detectedSpecies);
  
  console.log(`   Products needing species field: ${needsUpdate.length}`);
  console.log(`   Products already have species: ${alreadyHasSpecies.length}`);
  console.log(`   Products with no species pattern: ${noSpeciesFound.length}\n`);
  
  if (needsUpdate.length > 0) {
    console.log('⚠️  PRODUCTS NEEDING SPECIES FIELD:\n');
    
    const bySpecies: Record<string, ProductEntry[]> = {
      'dogs': [],
      'cats': [],
      'birds': [],
      'reptiles': [],
      'pocket-pets': [],
      'both': [],
      'multiple': [],
    };
    
    needsUpdate.forEach(entry => {
      const species = entry.detectedSpecies;
      if (Array.isArray(species)) {
        bySpecies['multiple'].push(entry);
      } else if (species && typeof species === 'string' && species in bySpecies) {
        bySpecies[species].push(entry);
      }
    });
    
    Object.entries(bySpecies).forEach(([species, entries]) => {
      if (entries.length === 0) return;
      
      console.log(`\n${species.toUpperCase()} (${entries.length}):`);
      entries.forEach((entry, index) => {
        console.log(`  ${index + 1}. "${entry.key}"`);
        console.log(`     Product: ${entry.product.productName}`);
        console.log(`     Add: species: '${Array.isArray(entry.detectedSpecies) ? entry.detectedSpecies.join("', '") : entry.detectedSpecies}'`);
      });
    });
    
    // Generate TypeScript code snippets for manual insertion
    console.log('\n\n📝 TYPESCRIPT CODE SNIPPETS (copy-paste these into vetted-products.ts):\n');
    console.log('// Add species fields to the following entries:\n');
    
    needsUpdate.forEach(entry => {
      const speciesValue = Array.isArray(entry.detectedSpecies)
        ? `['${entry.detectedSpecies.join("', '")}']`
        : `'${entry.detectedSpecies}'`;
      
      console.log(`  // In '${entry.key}':`);
      console.log(`  // Add: species: ${speciesValue},`);
    });
  }
  
  // Save detailed report
  const reportPath = path.join(__dirname, 'species-detection-report.json');
  const report = {
    scanDate: new Date().toISOString(),
    totalProducts: entries.length,
    needsUpdate: needsUpdate.map(e => ({
      key: e.key,
      productName: e.product.productName,
      detectedSpecies: e.detectedSpecies,
    })),
    alreadyHasSpecies: alreadyHasSpecies.map(e => ({
      key: e.key,
      productName: e.product.productName,
    })),
    noSpeciesFound: noSpeciesFound.map(e => ({
      key: e.key,
      productName: e.product.productName,
    })),
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  if (needsUpdate.length > 0) {
    console.log('\n✅ Next steps:');
    console.log('   1. Review the detected species assignments');
    console.log('   2. Manually add species fields to the entries listed above');
    console.log('   3. Run validate-species-products.ts to verify');
  }
}

// Run the scan
try {
  scanVettedProducts();
} catch (error) {
  console.error('❌ Error scanning products:', error);
  process.exit(1);
}

