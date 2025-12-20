// Debug what ingredients are being selected
import { RecipeBuilder, GenerationConstraints } from '../lib/generator/RecipeBuilder';

type Species = 'dogs' | 'cats' | 'birds' | 'reptiles' | 'pocket-pets';

async function debugRecipeSelection(species: Species) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`DEBUGGING ${species.toUpperCase()} RECIPE SELECTION`);
  console.log('='.repeat(80));
  
  const constraints: GenerationConstraints = {
    species,
    lifeStage: 'adult',
    petWeightKg: 15,
    healthConcerns: [],
    allergies: [],
  };
  
  const builder = new RecipeBuilder(constraints, 'standard', 'medium');
  const recipe = await builder.generate();
  
  if (recipe && recipe.ingredients.length > 0) {
    console.log(`\nIngredients selected (${recipe.ingredients.length} total):`);
    
    let totalProtein = 0;
    let totalFat = 0;
    let totalGrams = 0;
    
    // Sort by grams (largest first)
    const sorted = [...recipe.ingredients].sort((a, b) => b.grams - a.grams);
    
    for (const portioned of sorted) {
      const ing = portioned.ingredient;
      const protein = (ing.composition.protein || 0) * portioned.grams / 100;
      const fat = (ing.composition.fat || 0) * portioned.grams / 100;
      
      totalProtein += protein;
      totalFat += fat;
      totalGrams += portioned.grams;
      
      console.log(`  ${ing.name}:`);
      console.log(`    Portion: ${portioned.grams}g (${((portioned.grams / recipe.totalGrams) * 100).toFixed(1)}% of meal)`);
      console.log(`    Protein: ${ing.composition.protein || 0}% → ${protein.toFixed(1)}g`);
      console.log(`    Fat: ${ing.composition.fat || 0}% → ${fat.toFixed(1)}g`);
      console.log(`    Category: ${ing.category}`);
    }
    
    console.log(`\nTotals:`);
    console.log(`  Total grams: ${totalGrams}g`);
    console.log(`  Total protein: ${totalProtein.toFixed(1)}g (${((totalProtein / totalGrams) * 100).toFixed(1)}%)`);
    console.log(`  Total fat: ${totalFat.toFixed(1)}g (${((totalFat / totalGrams) * 100).toFixed(1)}%)`);
    console.log(`\nTarget for ${species}: 20%+ protein`);
  } else {
    console.log('Failed to generate recipe');
  }
}

async function main() {
  await debugRecipeSelection('dogs');
  await debugRecipeSelection('cats');
}

main().catch(console.error);
