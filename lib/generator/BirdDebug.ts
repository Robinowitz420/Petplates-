// Detailed debug for bird recipe generation
import { RecipeBuilder, type GenerationConstraints } from './RecipeBuilder';
import { getIngredientsForSpecies } from '../data/ingredients';

const constraints: GenerationConstraints = {
  species: 'birds',
  lifeStage: 'adult',
  petWeightKg: 0.5,
  healthConcerns: ['digestive_issues'],
  targetCalories: 100,
};

console.log('=== BIRD RECIPE DEBUG ===\n');

// Check available ingredients
const allBirdIngredients = getIngredientsForSpecies('birds');
console.log(`Total bird ingredients available: ${allBirdIngredients.length}`);

const seeds = allBirdIngredients.filter(ing => ing.category === 'seed');
const nuts = allBirdIngredients.filter(ing => ing.category === 'nut');
const insects = allBirdIngredients.filter(ing => ing.category === 'insect');
const fruits = allBirdIngredients.filter(ing => ing.category === 'fruit');
const vegetables = allBirdIngredients.filter(ing => ing.category === 'vegetable');

console.log(`\nBy category:`);
console.log(`  Seeds: ${seeds.length}`);
console.log(`  Nuts: ${nuts.length}`);
console.log(`  Insects: ${insects.length}`);
console.log(`  Fruits: ${fruits.length}`);
console.log(`  Vegetables: ${vegetables.length}`);

console.log(`\nSample seeds:`);
seeds.slice(0, 5).forEach(s => console.log(`  - ${s.name} (id: ${s.id})`));

console.log(`\nSample nuts:`);
nuts.slice(0, 5).forEach(n => console.log(`  - ${n.name} (id: ${n.id})`));

console.log(`\n${'='.repeat(80)}`);
console.log('Attempting recipe generation...\n');

// Attempt generation with internal logging
const builder = new RecipeBuilder(constraints, 'standard', 'medium');

// Access private method via any cast to see what's happening
const builderAny = builder as any;

// Try to generate and see what happens
try {
  const recipe = builder.generate();
  
  if (recipe) {
    console.log('✅ Recipe generated successfully!');
    console.log(`\nIngredients (${recipe.ingredients.length}):`);
    recipe.ingredients.forEach(p => {
      console.log(`  - ${p.ingredient.name} (${p.ingredient.category}): ${p.grams}g`);
    });
  } else {
    console.log('❌ Recipe generation returned null');
  }
} catch (error: any) {
  console.log('❌ Error during generation:', error.message);
  console.log(error.stack);
}
