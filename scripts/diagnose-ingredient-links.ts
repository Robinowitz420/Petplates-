// scripts/diagnose-ingredient-links.ts
// Diagnoses which recipe ingredients don't have purchase links

import { readFileSync } from 'fs';
import { join } from 'path';
import { recipes } from '../lib/data/recipes-complete';
import { VETTED_PRODUCTS, getVettedProduct } from '../lib/data/vetted-products';

interface IngredientStats {
  name: string;
  hasASIN: boolean;
  hasSearchURL: boolean;
  hasNoLink: boolean;
  vettedProduct?: any;
}

const stats: IngredientStats[] = [];
const ingredientSet = new Set<string>();

// Collect all unique ingredients from all recipes
recipes.forEach(recipe => {
  recipe.ingredients.forEach(ing => {
    const name = ing.name.toLowerCase().trim();
    if (!ingredientSet.has(name)) {
      ingredientSet.add(name);
      
      const vettedProduct = getVettedProduct(ing.name);
      const hasASIN = vettedProduct?.asinLink?.includes('/dp/') || false;
      const hasSearchURL = vettedProduct?.asinLink?.includes('/s?k=') || false;
      const hasNoLink = !vettedProduct?.asinLink;
      
      stats.push({
        name: ing.name,
        hasASIN,
        hasSearchURL,
        hasNoLink,
        vettedProduct: vettedProduct ? {
          productName: vettedProduct.productName,
          asinLink: vettedProduct.asinLink
        } : undefined
      });
    }
  });
  
  // Also check supplements
  if ((recipe as any).supplements) {
    (recipe as any).supplements.forEach((supp: any) => {
      const name = supp.name.toLowerCase().trim();
      if (!ingredientSet.has(name)) {
        ingredientSet.add(name);
        
        const vettedProduct = getVettedProduct(supp.name);
        const hasASIN = vettedProduct?.asinLink?.includes('/dp/') || false;
        const hasSearchURL = vettedProduct?.asinLink?.includes('/s?k=') || false;
        const hasNoLink = !vettedProduct?.asinLink;
        
        stats.push({
          name: supp.name,
          hasASIN,
          hasSearchURL,
          hasNoLink,
          vettedProduct: vettedProduct ? {
            productName: vettedProduct.productName,
            asinLink: vettedProduct.asinLink
          } : undefined
        });
      }
    });
  }
});

// Calculate statistics
const totalIngredients = stats.length;
const withASIN = stats.filter(s => s.hasASIN).length;
const withSearchURL = stats.filter(s => s.hasSearchURL).length;
const withNoLink = stats.filter(s => s.hasNoLink).length;

console.log('\n📊 INGREDIENT LINK STATISTICS\n');
console.log(`Total unique ingredients in recipes: ${totalIngredients}`);
console.log(`  ✅ With ASIN links (/dp/): ${withASIN} (${Math.round(withASIN/totalIngredients*100)}%)`);
console.log(`  ⚠️  With search URLs (/s?k=): ${withSearchURL} (${Math.round(withSearchURL/totalIngredients*100)}%)`);
console.log(`  ❌ No purchase link: ${withNoLink} (${Math.round(withNoLink/totalIngredients*100)}%)\n`);

// List ingredients without links
if (withNoLink > 0) {
  console.log('❌ INGREDIENTS WITHOUT PURCHASE LINKS:\n');
  stats
    .filter(s => s.hasNoLink)
    .slice(0, 50) // Show first 50
    .forEach(s => {
      console.log(`  - ${s.name}`);
    });
  
  if (withNoLink > 50) {
    console.log(`  ... and ${withNoLink - 50} more\n`);
  }
}

// List ingredients with search URLs (should be converted to ASINs)
if (withSearchURL > 0) {
  console.log('\n⚠️  INGREDIENTS WITH SEARCH URLs (should be ASINs):\n');
  stats
    .filter(s => s.hasSearchURL)
    .slice(0, 20)
    .forEach(s => {
      console.log(`  - ${s.name}: ${s.vettedProduct?.asinLink}`);
    });
  
  if (withSearchURL > 20) {
    console.log(`  ... and ${withSearchURL - 20} more\n`);
  }
}

// Sample of ingredients with ASINs
console.log('\n✅ SAMPLE INGREDIENTS WITH ASIN LINKS:\n');
stats
  .filter(s => s.hasASIN)
  .slice(0, 10)
  .forEach(s => {
    console.log(`  - ${s.name}: ${s.vettedProduct?.asinLink}`);
  });

console.log('\n');

