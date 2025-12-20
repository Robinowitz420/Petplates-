// Debug cats S1 gate failure
import { RecipeBuilder, GenerationConstraints } from '../lib/generator/RecipeBuilder';
import { getIngredientsForSpecies } from '../lib/data/ingredients';

async function debugCats() {
  console.log('='.repeat(80));
  console.log('DEBUGGING CATS S1 GATE FAILURE');
  console.log('='.repeat(80));
  
  // Check available ingredients
  const catsIngredients = getIngredientsForSpecies('cats');
  console.log(`\nTotal ingredients for cats: ${catsIngredients.length}`);
  
  const proteinIngredients = catsIngredients.filter(ing => ing.category === 'protein');
  console.log(`Protein category ingredients: ${proteinIngredients.length}`);
  
  console.log('\nTop 10 protein ingredients:');
  proteinIngredients
    .sort((a, b) => (b.composition.protein || 0) - (a.composition.protein || 0))
    .slice(0, 10)
    .forEach(ing => {
      console.log(`  - ${ing.name}: ${ing.composition.protein}% protein, quality ${ing.qualityScore}`);
    });
  
  // Try to generate recipe
  console.log('\n' + '='.repeat(80));
  console.log('ATTEMPTING RECIPE GENERATION');
  console.log('='.repeat(80));
  
  const constraints: GenerationConstraints = {
    species: 'cats',
    lifeStage: 'adult',
    petWeightKg: 5,
    healthConcerns: [],
    allergies: [],
  };
  
  const builder = new RecipeBuilder(constraints, 'standard', 'medium');
  const recipe = await builder.generate();
  
  if (recipe) {
    console.log('\n✅ SUCCESS!');
    console.log(`Generated recipe with ${recipe.ingredients.length} ingredients:`);
    
    let totalProtein = 0;
    let totalGrams = 0;
    
    for (const portioned of recipe.ingredients) {
      const ing = portioned.ingredient;
      const protein = (ing.composition.protein || 0) * portioned.grams / 100;
      totalProtein += protein;
      totalGrams += portioned.grams;
      
      console.log(`  - ${ing.name} (${ing.category}): ${portioned.grams}g, ${ing.composition.protein}% protein`);
    }
    
    const proteinPercent = (totalProtein / totalGrams) * 100;
    console.log(`\nTotal: ${totalGrams}g, ${proteinPercent.toFixed(1)}% protein`);
    console.log(`Target: 28% protein for cats`);
    
  } else {
    console.log('\n❌ FAILED - No recipe generated');
  }
}

debugCats().catch(console.error);
