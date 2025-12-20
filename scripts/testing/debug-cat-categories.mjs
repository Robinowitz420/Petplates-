// Debug: Check what categories cat ingredients actually have
import { getIngredientsForSpecies } from './lib/data/ingredients.js';

console.log('\n=== CAT INGREDIENT CATEGORIES DEBUG ===\n');

const catIngredients = getIngredientsForSpecies('cats');
console.log(`Total cat ingredients: ${catIngredients.length}\n`);

// Group by category
const byCategory = {};
catIngredients.forEach(ing => {
  if (!byCategory[ing.category]) {
    byCategory[ing.category] = [];
  }
  byCategory[ing.category].push(ing.name);
});

console.log('Categories found:');
Object.keys(byCategory).sort().forEach(cat => {
  console.log(`\n${cat.toUpperCase()} (${byCategory[cat].length} items):`);
  byCategory[cat].slice(0, 5).forEach(name => console.log(`  - ${name}`));
  if (byCategory[cat].length > 5) {
    console.log(`  ... and ${byCategory[cat].length - 5} more`);
  }
});

// Check specifically for the categories RecipeBuilder is looking for
console.log('\n\n=== CHECKING REQUIRED CATEGORIES ===');
const required = ['protein', 'carb', 'vegetable', 'fat'];
required.forEach(cat => {
  const count = byCategory[cat]?.length || 0;
  const status = count > 0 ? '✓' : '✗';
  console.log(`${status} ${cat}: ${count} ingredients`);
});
