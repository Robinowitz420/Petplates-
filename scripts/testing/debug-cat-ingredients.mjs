// Quick debug to check cat ingredients
import { getIngredientsForSpecies } from './lib/data/ingredients.ts';

console.log('=== CAT INGREDIENTS DEBUG ===\n');

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

console.log('Ingredients by category:');
Object.keys(byCategory).sort().forEach(cat => {
  console.log(`\n${cat} (${byCategory[cat].length}):`);
  console.log(byCategory[cat].slice(0, 5).join(', '));
  if (byCategory[cat].length > 5) {
    console.log(`  ... and ${byCategory[cat].length - 5} more`);
  }
});

// Check specifically for carb, vegetable, fat
console.log('\n\n=== CRITICAL CATEGORIES ===');
console.log(`carb: ${byCategory['carb']?.length || 0}`);
console.log(`vegetable: ${byCategory['vegetable']?.length || 0}`);
console.log(`fat: ${byCategory['fat']?.length || 0}`);
console.log(`protein: ${byCategory['protein']?.length || 0}`);

// Check a few carb ingredients in detail
if (byCategory['carb'] && byCategory['carb'].length > 0) {
  console.log('\n\n=== SAMPLE CARB INGREDIENTS ===');
  const carbIngs = catIngredients.filter(i => i.category === 'carb').slice(0, 3);
  carbIngs.forEach(ing => {
    console.log(`\n${ing.name}:`);
    console.log(`  ID: ${ing.id}`);
    console.log(`  Category: ${ing.category}`);
    console.log(`  Cat compatibility: ${ing.compatibility.cats}`);
  });
}
