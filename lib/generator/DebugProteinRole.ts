// Quick debug to check proteinRole population
import { getIngredientsForSpecies } from '../data/ingredients';

const dogs = getIngredientsForSpecies('dogs');
const proteins = dogs.filter(i => i.category === 'protein').slice(0, 10);

console.log('=== Dog Proteins ===');
proteins.forEach(p => {
  console.log(`${p.name}: proteinRole=${p.proteinRole || 'undefined'}`);
});
