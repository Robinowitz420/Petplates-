// Check if protein ingredients have proteinRole set
import { getIngredientsForSpecies } from '../lib/data/ingredients';

const dogsIngredients = getIngredientsForSpecies('dogs');
const proteinIngredients = dogsIngredients.filter(ing => ing.category === 'protein');

console.log('CHECKING PROTEIN ROLE FOR DOGS:');
console.log(`Total protein ingredients: ${proteinIngredients.length}`);

const withPrimaryRole = proteinIngredients.filter(ing => ing.proteinRole === 'primary');
const withSecondaryRole = proteinIngredients.filter(ing => ing.proteinRole === 'secondary');
const withNoRole = proteinIngredients.filter(ing => !ing.proteinRole);

console.log(`\nWith proteinRole='primary': ${withPrimaryRole.length}`);
console.log(`With proteinRole='secondary': ${withSecondaryRole.length}`);
console.log(`With NO proteinRole: ${withNoRole.length}`);

console.log('\nTop 10 protein ingredients and their roles:');
proteinIngredients
  .sort((a, b) => (b.composition.protein || 0) - (a.composition.protein || 0))
  .slice(0, 10)
  .forEach(ing => {
    console.log(`  - ${ing.name}: ${ing.composition.protein}% protein, role: ${ing.proteinRole || 'NONE'}`);
  });

if (withPrimaryRole.length > 0) {
  console.log('\n✅ Primary proteins available:');
  withPrimaryRole.slice(0, 5).forEach(ing => {
    console.log(`  - ${ing.name}: ${ing.composition.protein}% protein`);
  });
} else {
  console.log('\n❌ NO PRIMARY PROTEINS FOUND - This is why S1 gate fails!');
}
