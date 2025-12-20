// Quick test for bird recipe generation
import { RecipeBuilder, type GenerationConstraints } from './RecipeBuilder';

const constraints: GenerationConstraints = {
  species: 'birds',
  lifeStage: 'adult',
  petWeightKg: 0.5, // Small bird
  healthConcerns: ['digestive_issues'],
  targetCalories: 100,
};

console.log('Testing bird recipe generation...');
console.log('Constraints:', constraints);
console.log('='.repeat(80));

for (let attempt = 1; attempt <= 3; attempt++) {
  console.log(`\nAttempt ${attempt}:`);
  try {
    const builder = new RecipeBuilder(constraints, 'standard', 'medium');
    const recipe = builder.generate();
    
    if (recipe) {
      console.log('✅ SUCCESS!');
      console.log(`Ingredients (${recipe.ingredients.length}):`);
      recipe.ingredients.forEach(p => {
        console.log(`  - ${p.ingredient.name} (${p.ingredient.category}): ${p.grams}g`);
      });
      console.log(`Total: ${recipe.ingredients.reduce((sum, p) => sum + p.grams, 0)}g`);
      break;
    } else {
      console.log('❌ No recipe generated');
    }
  } catch (error: any) {
    console.log('❌ Error:', error.message);
  }
}
