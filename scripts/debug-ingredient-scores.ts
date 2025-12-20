// Debug ingredient scoring to see why salmon beats chicken breast
import { getIngredientsForSpecies } from '../lib/data/ingredients';

const species = 'cats';
const ingredients = getIngredientsForSpecies(species);

console.log(`Total ingredients for ${species}: ${ingredients.length}`);
console.log();

// Find chicken breast and salmon
const chickenBreast = ingredients.find(ing => ing.name.toLowerCase().includes('chicken breast'));
const salmon = ingredients.find(ing => ing.name.toLowerCase().includes('salmon atlantic'));

console.log('CHICKEN BREAST:');
if (chickenBreast) {
  console.log(`  Name: ${chickenBreast.name}`);
  console.log(`  Category: ${chickenBreast.category}`);
  console.log(`  Protein: ${chickenBreast.composition.protein}%`);
  console.log(`  Quality Score: ${chickenBreast.qualityScore}`);
  console.log(`  Available: YES`);
} else {
  console.log('  NOT AVAILABLE FOR CATS!');
}

console.log();
console.log('SALMON ATLANTIC:');
if (salmon) {
  console.log(`  Name: ${salmon.name}`);
  console.log(`  Category: ${salmon.category}`);
  console.log(`  Protein: ${salmon.composition.protein}%`);
  console.log(`  Quality Score: ${salmon.qualityScore}`);
  console.log(`  Available: YES`);
} else {
  console.log('  NOT AVAILABLE FOR CATS!');
}

console.log();
console.log('ALL PROTEIN CATEGORY INGREDIENTS FOR CATS:');
const proteinIngredients = ingredients.filter(ing => ing.category === 'protein');
console.log(`Total protein ingredients: ${proteinIngredients.length}`);
proteinIngredients.slice(0, 10).forEach(ing => {
  console.log(`  ${ing.name}: ${ing.composition.protein}% protein, quality ${ing.qualityScore}`);
});
