// Fix all small package sizes in product-prices.json
import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./data/product-prices.json', 'utf8'));

console.log('=== FIXING SMALL PACKAGE SIZES ===\n');

const fixes = {
  // Herbs and spices - standard spice jar sizes
  'sage': '2 oz',
  'basil': '2 oz',
  'fennel': '2 oz',
  'ginger (small amounts)': '2 oz',
  'turmeric': '2 oz',
  'rosemary': '2 oz',
  'mint': '2 oz',
  'garlic chives': '2 oz',
  
  // Meats - standard package sizes
  'chicken sausage (no additives)': '12 oz',
  'turkey sausage (no additives)': '12 oz',
  
  // Supplements - standard bottle sizes
  'vitamin d3 drops': '2 oz',
  'cat grass (wheatgrass)': '4 oz'
};

let fixCount = 0;

data.forEach(item => {
  if (fixes[item.ingredient]) {
    const oldQty = item.quantity;
    item.quantity = fixes[item.ingredient];
    console.log(`✓ ${item.ingredient.padEnd(35)} ${oldQty.padEnd(10)} → ${item.quantity}`);
    fixCount++;
  }
});

// Write back to file
fs.writeFileSync('./data/product-prices.json', JSON.stringify(data, null, 2));

console.log(`\n✅ Fixed ${fixCount} package sizes`);
console.log('Updated product-prices.json');
