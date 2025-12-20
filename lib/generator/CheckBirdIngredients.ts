// Check what bird ingredients are available
import { getIngredientsForSpecies } from '../data/ingredients';

console.log('Checking bird ingredients...\n');

const birdIngredients = getIngredientsForSpecies('birds');
console.log(`Total bird ingredients: ${birdIngredients.length}\n`);

// Group by category
const byCategory: Record<string, number> = {};
birdIngredients.forEach(ing => {
  byCategory[ing.category] = (byCategory[ing.category] || 0) + 1;
});

console.log('By category:');
Object.entries(byCategory).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
  console.log(`  ${cat}: ${count}`);
});

console.log('\n=== Seeds ===');
birdIngredients.filter(ing => ing.category === 'seed').slice(0, 10).forEach(ing => {
  console.log(`  - ${ing.name} (${ing.id})`);
});

console.log('\n=== Nuts ===');
birdIngredients.filter(ing => ing.category === 'nut').slice(0, 10).forEach(ing => {
  console.log(`  - ${ing.name} (${ing.id})`);
});

console.log('\n=== Insects ===');
birdIngredients.filter(ing => ing.category === 'insect').slice(0, 10).forEach(ing => {
  console.log(`  - ${ing.name} (${ing.id})`);
});

console.log('\n=== Fruits ===');
birdIngredients.filter(ing => ing.category === 'fruit').slice(0, 10).forEach(ing => {
  console.log(`  - ${ing.name} (${ing.id})`);
});

console.log('\n=== Vegetables ===');
birdIngredients.filter(ing => ing.category === 'vegetable').slice(0, 10).forEach(ing => {
  console.log(`  - ${ing.name} (${ing.id})`);
});
