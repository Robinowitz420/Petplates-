// Debug script to check what proteins are being filtered
import { getAllIngredients } from './lib/data/unifiedIngredientRegistry.js';

const allIngredients = getAllIngredients();

// Filter for cat-compatible proteins
const catProteins = allIngredients.filter(ing => 
  ing.species.includes('cats') && 
  (ing.category === 'protein' || ing.category === 'meat' || ing.category === 'fish')
);

console.log('\n=== CAT PROTEINS ANALYSIS ===\n');
console.log(`Total cat-compatible protein ingredients: ${catProteins.length}\n`);

// Group by exotic vs core
const EXOTIC_PROTEINS = [
  'quail', 'venison', 'goat', 'elk', 'bison', 'ostrich', 'pheasant',
  'duck', 'rabbit', 'kangaroo', 'alligator', 'wild boar', 'emu', 'reindeer', 'buffalo'
];

const exotic = [];
const core = [];

catProteins.forEach(ing => {
  const isExotic = EXOTIC_PROTEINS.some(ex => ing.name.toLowerCase().includes(ex));
  if (isExotic) {
    exotic.push(ing.name);
  } else {
    core.push(ing.name);
  }
});

console.log('🟢 CORE PROTEINS (will be used):');
console.log('='.repeat(60));
core.forEach(name => console.log(`  ✓ ${name}`));

console.log('\n🔴 EXOTIC PROTEINS (will be filtered out):');
console.log('='.repeat(60));
exotic.forEach(name => console.log(`  ✗ ${name}`));

console.log('\n📊 SUMMARY:');
console.log(`Core proteins: ${core.length}`);
console.log(`Exotic proteins: ${exotic.length}`);
console.log(`Total: ${catProteins.length}`);

if (core.length < 5) {
  console.log('\n⚠️  WARNING: Very few core proteins available!');
  console.log('This could cause recipe generation issues.');
}
