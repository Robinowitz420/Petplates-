// Debug cat recipe generation step by step
import { RecipeBuilder } from './lib/generator/RecipeBuilder.ts';
import { getIngredientsForSpecies } from './lib/data/ingredients.ts';

console.log('=== CAT RECIPE GENERATION DEBUG ===\n');

// Step 1: Check available ingredients
const allCatIngredients = getIngredientsForSpecies('cats');
console.log(`Step 1: Total cat ingredients: ${allCatIngredients.length}`);

const byCategory = {};
allCatIngredients.forEach(ing => {
  if (!byCategory[ing.category]) byCategory[ing.category] = [];
  byCategory[ing.category].push(ing);
});

console.log('\nIngredients by category:');
Object.keys(byCategory).sort().forEach(cat => {
  console.log(`  ${cat}: ${byCategory[cat].length}`);
});

// Step 2: Try to generate a recipe
console.log('\n\nStep 2: Attempting recipe generation...');

const constraints = {
  species: 'cats',
  petWeightKg: 4.5,
  allergies: [],
  healthConcerns: [],
  bannedIngredients: []
};

const builder = new RecipeBuilder(constraints);

console.log('\nBuilder created, calling generate()...');
const recipe = builder.generate();

if (recipe) {
  console.log('\n✅ Recipe generated successfully!');
  console.log(`Ingredients: ${recipe.ingredients.length}`);
  recipe.ingredients.forEach(ing => {
    console.log(`  - ${ing.ingredient.name} (${ing.ingredient.category}): ${ing.grams}g`);
  });
} else {
  console.log('\n❌ Recipe generation failed');
}

// Step 3: Check what getCandidateIngredients returns
console.log('\n\nStep 3: Checking candidate ingredients...');
const builder2 = new RecipeBuilder(constraints);
// Access private method via prototype hack for debugging
const candidates = builder2['getCandidateIngredients']();
console.log(`Candidate ingredients: ${candidates.length}`);

const candidatesByCategory = {};
candidates.forEach(ing => {
  if (!candidatesByCategory[ing.category]) candidatesByCategory[ing.category] = [];
  candidatesByCategory[ing.category].push(ing);
});

console.log('\nCandidates by category:');
Object.keys(candidatesByCategory).sort().forEach(cat => {
  console.log(`  ${cat}: ${candidatesByCategory[cat].length}`);
});
