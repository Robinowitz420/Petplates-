const fs = require('fs');

let content = fs.readFileSync('lib/data/vetted-products.ts', 'utf-8');

// Fix all productName entries with apostrophes
content = content.replace(/productName: '([^']*')([^']*)'/g, (match, before, after) => {
  // Extract the ingredient name from context (this is a simple approach)
  const lines = match.split('\n');
  // For now, just remove the apostrophe and make it generic
  const cleaned = before.replace(/'/g, '') + after;
  return `productName: '${cleaned}'`;
});

// More targeted fixes for known patterns
const replacements = [
  ["Canary seed's Parrot Food Flax Seed", "Flax seed"],
  ["Canary seed's Parrot Food Sesame Seed", "Sesame seed"],
  ["Canary seed's Parrot Food Chia Seed", "Chia seed"],
  ["Canary seed's Parrot Food Cooked Quinoa", "Quinoa (Cooked)"],
  ["Canary seed's Parrot Food Rapeseed", "Rapeseed"],
  ["Canary seed's Parrot Food Sunflower Seed", "Sunflower seed"],
  ["Canary seed's Parrot Food Pumpkin Seed", "Pumpkin seed"],
  ["Strawberries's Organic Blueberries", "Blueberries (Organic)"],
  ["Strawberries's Organic Strawberries", "Strawberries (Organic)"],
  ["Canary seed's Parrot Food Pellets", "Bird pellets"],
  ["Canary seed's Parrot Food Cuttlebone", "Cuttlebone"],
  ["Superworms's Frogs Live Dubia Roaches", "Dubia roaches (Live)"],
  ["Mealworms's Live Crickets", "Crickets (Live)"],
];

replacements.forEach(([old, new_]) => {
  content = content.replace(new RegExp(`productName: '${old.replace(/'/g, "\\'")}'`, 'g'), `productName: '${new_}'`);
});

fs.writeFileSync('lib/data/vetted-products.ts', content);
console.log('Fixed all apostrophes in product names');
