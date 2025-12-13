import { VETTED_PRODUCTS, getVettedProduct } from '../lib/data/vetted-products';

const total = Object.keys(VETTED_PRODUCTS).length;
const withPrices = Object.entries(VETTED_PRODUCTS).filter(([k, v]) => v.price?.amount).length;
const withoutPrices = total - withPrices;

console.log(`Total vetted products: ${total}`);
console.log(`Products with prices: ${withPrices}`);
console.log(`Products without prices: ${withoutPrices}`);

const noPrices = Object.entries(VETTED_PRODUCTS)
  .filter(([k, v]) => !v.price?.amount)
  .slice(0, 20)
  .map(([k]) => k);

console.log(`\nExamples without prices (first 20):`);
console.log(noPrices.join(', '));

// Test some common ingredient names
console.log(`\nTesting common ingredient name lookups:`);
const testNames = ['chicken breast', 'ground beef', 'salmon', 'sweet potato', 'carrots', 'brown rice'];
testNames.forEach(name => {
  const product = getVettedProduct(name);
  const hasPrice = product?.price?.amount ? `$${product.price.amount.toFixed(2)}` : 'NO PRICE';
  console.log(`  "${name}" -> ${hasPrice}`);
});

