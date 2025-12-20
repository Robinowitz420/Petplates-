// Check all package sizes in product-prices.json for unrealistic values
import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./data/product-prices.json', 'utf8'));

console.log('=== CHECKING PACKAGE SIZES ===\n');

// Convert quantity to grams for comparison
function quantityToGrams(quantity) {
  if (!quantity) return null;
  
  const match = quantity.match(/(\d+(?:\.\d+)?)\s*(\w+)/);
  if (!match) return null;
  
  const amount = parseFloat(match[1]);
  const unit = match[2].toLowerCase();
  
  if (unit === 'oz' || unit === 'ounce' || unit === 'ounces') {
    return amount * 28.3495;
  }
  if (unit === 'lb' || unit === 'pound' || unit === 'pounds') {
    return amount * 453.592;
  }
  if (unit === 'g' || unit === 'gram' || unit === 'grams') {
    return amount;
  }
  if (unit === 'kg' || unit === 'kilogram' || unit === 'kilograms') {
    return amount * 1000;
  }
  
  // For non-weight units (head, bunch, etc.), return a flag
  return -1;
}

// Group by size categories
const verySmall = []; // < 50g
const small = []; // 50-200g
const medium = []; // 200-500g
const large = []; // > 500g
const nonWeight = []; // head, bunch, etc.

data.forEach(item => {
  const grams = quantityToGrams(item.quantity);
  
  if (grams === null) {
    console.log(`⚠️  ${item.ingredient}: No quantity specified`);
  } else if (grams === -1) {
    nonWeight.push({ ingredient: item.ingredient, quantity: item.quantity });
  } else if (grams < 50) {
    verySmall.push({ ingredient: item.ingredient, quantity: item.quantity, grams });
  } else if (grams < 200) {
    small.push({ ingredient: item.ingredient, quantity: item.quantity, grams });
  } else if (grams < 500) {
    medium.push({ ingredient: item.ingredient, quantity: item.quantity, grams });
  } else {
    large.push({ ingredient: item.ingredient, quantity: item.quantity, grams });
  }
});

console.log('\n🔴 VERY SMALL PACKAGES (< 50g) - LIKELY ISSUES:');
console.log('='.repeat(60));
verySmall.sort((a, b) => a.grams - b.grams).forEach(item => {
  console.log(`  ${item.ingredient.padEnd(30)} ${item.quantity.padEnd(15)} (${item.grams.toFixed(1)}g)`);
});

console.log('\n🟡 SMALL PACKAGES (50-200g) - CHECK THESE:');
console.log('='.repeat(60));
small.sort((a, b) => a.grams - b.grams).forEach(item => {
  console.log(`  ${item.ingredient.padEnd(30)} ${item.quantity.padEnd(15)} (${item.grams.toFixed(1)}g)`);
});

console.log('\n🟢 MEDIUM PACKAGES (200-500g):');
console.log('='.repeat(60));
console.log(`  ${medium.length} items`);

console.log('\n✅ LARGE PACKAGES (> 500g):');
console.log('='.repeat(60));
console.log(`  ${large.length} items`);

console.log('\n📦 NON-WEIGHT UNITS (head, bunch, etc.):');
console.log('='.repeat(60));
nonWeight.forEach(item => {
  console.log(`  ${item.ingredient.padEnd(30)} ${item.quantity}`);
});

console.log('\n\n=== SUMMARY ===');
console.log(`Total items: ${data.length}`);
console.log(`Very small (< 50g): ${verySmall.length} ⚠️`);
console.log(`Small (50-200g): ${small.length}`);
console.log(`Medium (200-500g): ${medium.length}`);
console.log(`Large (> 500g): ${large.length}`);
console.log(`Non-weight units: ${nonWeight.length}`);

if (verySmall.length > 0) {
  console.log('\n⚠️  WARNING: Found very small packages that may cause meal estimation issues!');
}
