import { VETTED_PRODUCTS } from '../lib/data/vetted-products';

// Extract all ingredients with their Amazon links
const ingredients = Object.entries(VETTED_PRODUCTS).map(([key, product]) => ({
  ingredientName: key,
  productName: product.productName,
  amazonLink: product.amazonLink,
  category: product.category || 'Other',
  vetNote: product.vetNote
}));

// Sort by category, then by ingredient name
ingredients.sort((a, b) => {
  if (a.category !== b.category) {
    return a.category.localeCompare(b.category);
  }
  return a.ingredientName.localeCompare(b.ingredientName);
});

console.log('=== ALL INGREDIENTS WITH AMAZON LINKS ===\n');
console.log(`Total: ${ingredients.length} ingredients\n`);

// Output in simple format
ingredients.forEach((ing, index) => {
  console.log(`${index + 1}. ${ing.ingredientName}`);
  console.log(`   Product: ${ing.productName}`);
  console.log(`   Link: ${ing.amazonLink}`);
  console.log(`   Category: ${ing.category}`);
  console.log('');
});

// Also output as CSV format
console.log('\n\n=== CSV FORMAT ===');
console.log('Ingredient Name,Product Name,Amazon Link,Category');
ingredients.forEach(ing => {
  const csvLine = `"${ing.ingredientName}","${ing.productName}","${ing.amazonLink}","${ing.category}"`;
  console.log(csvLine);
});

