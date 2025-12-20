// Quick test to verify the functions work
import { getGenericIngredientName, getVettedProductByAnyIdentifier, VETTED_PRODUCTS } from './lib/data/vetted-products.ts';

console.log('Testing getGenericIngredientName...');
const result1 = getGenericIngredientName('Ground chicken (Freeze Dried)');
console.log('Result:', result1);

console.log('Testing getVettedProductByAnyIdentifier...');
const result2 = getVettedProductByAnyIdentifier('ground chicken');
console.log('Result:', result2 ? result2.productName : 'Not found');

console.log('VETTED_PRODUCTS has', Object.keys(VETTED_PRODUCTS).length, 'entries');
