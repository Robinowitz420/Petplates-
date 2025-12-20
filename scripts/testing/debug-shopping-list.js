import { getVettedProduct, VETTED_PRODUCTS } from './lib/data/vetted-products.ts';

// Test what happens in ShoppingList component
console.log('Testing ShoppingList logic...\n');

// Test data that would come from a recipe
const testIngredients = [
  { id: '1', name: 'Duck Hearts', amount: '200g', asinLink: 'https://www.amazon.com/s?k=Vital%20Essentials%20freeze%20dried%20duck%20hearts&tag=robinfrench-20' },
  { id: '2', name: 'Ground chicken', amount: '200g', asinLink: 'https://www.amazon.com/dp/B0BXZVFN6G?tag=robinfrench-20' },
];

console.log('Available VETTED_PRODUCTS keys (first 5):');
console.log(Object.keys(VETTED_PRODUCTS).slice(0, 5));
console.log();

testIngredients.forEach((ingredient, i) => {
  console.log(`Testing ingredient ${i + 1}: "${ingredient.name}"`);
  console.log(`  asinLink: ${ingredient.asinLink}`);

  // Try the same logic as ShoppingList component
  let product = getVettedProduct(ingredient.name.toLowerCase());
  console.log(`  getVettedProduct("${ingredient.name.toLowerCase()}"):`, product ? 'FOUND' : 'NOT FOUND');

  if (!product) {
    product = getVettedProductByAnyIdentifier(ingredient.name);
    console.log(`  getVettedProductByAnyIdentifier("${ingredient.name}"):`, product ? 'FOUND' : 'NOT FOUND');
  }

  if (!product && ingredient.asinLink) {
    product = getVettedProductByAnyIdentifier(ingredient.asinLink);
    console.log(`  getVettedProductByAnyIdentifier("${ingredient.asinLink}"):`, product ? 'FOUND' : 'NOT FOUND');
  }

  if (product) {
    console.log(`  Product found: "${product.productName}"`);
    console.log(`  Has price:`, !!product.price);
    if (product.price) {
      console.log(`  Price: $${product.price.amount} ${product.price.currency}`);
    }
  } else {
    console.log(`  No product found for this ingredient!`);
  }

  console.log();
});
