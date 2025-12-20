// Quick test of the research-backed product links
const { getBestAffiliateLink, getResearchBackedProduct } = require('./lib/data/vetted-products-new.js');

console.log('Testing ingredient key matching:');
console.log('Ground Chicken ->', getResearchBackedProduct('Ground Chicken'));
console.log('Ground Turkey ->', getResearchBackedProduct('Ground Turkey'));
console.log('Sweet Potato ->', getResearchBackedProduct('Sweet Potato'));

console.log('\nTesting affiliate links:');
console.log('Ground Chicken ->', getBestAffiliateLink('Ground Chicken'));
console.log('Ground Turkey ->', getBestAffiliateLink('Ground Turkey'));
console.log('Sweet Potato ->', getBestAffiliateLink('Sweet Potato'));