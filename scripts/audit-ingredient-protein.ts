// Quick audit of ingredient protein data
import { INGREDIENT_COMPOSITIONS } from '../lib/data/ingredientCompositions';

const entries = Object.entries(INGREDIENT_COMPOSITIONS);

console.log('='.repeat(80));
console.log('INGREDIENT PROTEIN DATA AUDIT');
console.log('='.repeat(80));
console.log();

// High protein ingredients (15%+)
const highProtein = entries.filter(([_, comp]) => (comp.protein || 0) >= 15);
console.log(`HIGH PROTEIN INGREDIENTS (15%+): ${highProtein.length}`);
highProtein.slice(0, 15).forEach(([name, comp]) => {
  console.log(`  ${name}: ${comp.protein}% protein, ${comp.fat || 0}% fat`);
});
console.log();

// Medium protein (8-15%)
const medProtein = entries.filter(([_, comp]) => {
  const p = comp.protein || 0;
  return p >= 8 && p < 15;
});
console.log(`MEDIUM PROTEIN INGREDIENTS (8-15%): ${medProtein.length}`);
medProtein.slice(0, 10).forEach(([name, comp]) => {
  console.log(`  ${name}: ${comp.protein}% protein`);
});
console.log();

// Low protein (<8%)
const lowProtein = entries.filter(([_, comp]) => (comp.protein || 0) < 8);
console.log(`LOW PROTEIN INGREDIENTS (<8%): ${lowProtein.length}`);
lowProtein.slice(0, 10).forEach(([name, comp]) => {
  console.log(`  ${name}: ${comp.protein || 0}% protein`);
});
console.log();

// Missing protein data
const missingProtein = entries.filter(([_, comp]) => comp.protein === undefined);
console.log(`MISSING PROTEIN DATA: ${missingProtein.length}`);
missingProtein.slice(0, 10).forEach(([name]) => {
  console.log(`  ${name}: NO DATA`);
});
console.log();

console.log('='.repeat(80));
console.log('SUMMARY');
console.log('='.repeat(80));
console.log(`Total ingredients: ${entries.length}`);
console.log(`High protein (15%+): ${highProtein.length} (${((highProtein.length / entries.length) * 100).toFixed(1)}%)`);
console.log(`Medium protein (8-15%): ${medProtein.length} (${((medProtein.length / entries.length) * 100).toFixed(1)}%)`);
console.log(`Low protein (<8%): ${lowProtein.length} (${((lowProtein.length / entries.length) * 100).toFixed(1)}%)`);
console.log(`Missing data: ${missingProtein.length} (${((missingProtein.length / entries.length) * 100).toFixed(1)}%)`);
