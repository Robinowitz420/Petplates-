import { recipes } from '../lib/data/recipes-complete';
import { getVettedProduct } from '../lib/data/vetted-products';

// Extract all unique ingredient names from recipes
const allIngredientNames = new Set<string>();

recipes.forEach(recipe => {
  recipe.ingredients.forEach(ing => {
    allIngredientNames.add(ing.name);
  });
  
  // Also check supplements if they exist
  if ((recipe as any).supplements) {
    (recipe as any).supplements.forEach((supp: any) => {
      allIngredientNames.add(supp.name);
    });
  }
});

// Check which ingredients have vetted products
const missingIngredients: string[] = [];
const hasVettedProduct: string[] = [];

allIngredientNames.forEach(ingredientName => {
  const vetted = getVettedProduct(ingredientName);
  if (!vetted || !vetted.asinLink) {
    missingIngredients.push(ingredientName);
  } else {
    hasVettedProduct.push(ingredientName);
  }
});

console.log('=== INGREDIENT ANALYSIS ===\n');
console.log(`Total unique ingredients: ${allIngredientNames.size}`);
console.log(`Ingredients WITH vetted products: ${hasVettedProduct.length}`);
console.log(`Ingredients MISSING vetted products: ${missingIngredients.length}\n`);

console.log('=== MISSING INGREDIENTS (need vetted product entries) ===');
missingIngredients.sort().forEach((ing, index) => {
  console.log(`${index + 1}. ${ing}`);
});

console.log('\n=== SAMPLE: First 10 ingredients WITH vetted products ===');
hasVettedProduct.sort().slice(0, 10).forEach((ing, index) => {
  console.log(`${index + 1}. ${ing}`);
});

