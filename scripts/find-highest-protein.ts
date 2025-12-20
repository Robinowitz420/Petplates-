import { INGREDIENT_COMPOSITIONS } from '../lib/data/ingredientCompositions';

const entries = Object.entries(INGREDIENT_COMPOSITIONS);
const sorted = entries
  .filter(([_, c]) => c.protein)
  .sort((a, b) => (b[1].protein || 0) - (a[1].protein || 0));

console.log('TOP 20 HIGHEST PROTEIN INGREDIENTS:');
sorted.slice(0, 20).forEach(([name, comp]) => {
  console.log(`${name}: ${comp.protein}% protein`);
});

console.log('\nDOG/CAT PROTEIN SOURCES (protein category):');
const proteinSources = entries.filter(([_, c]) => 
  c.protein && 
  (c.speciesCompatibility?.dog === 'ok' || c.speciesCompatibility?.cat === 'ok')
);
proteinSources.sort((a, b) => (b[1].protein || 0) - (a[1].protein || 0));
proteinSources.slice(0, 15).forEach(([name, comp]) => {
  console.log(`${name}: ${comp.protein}% protein (dog: ${comp.speciesCompatibility?.dog}, cat: ${comp.speciesCompatibility?.cat})`);
});
