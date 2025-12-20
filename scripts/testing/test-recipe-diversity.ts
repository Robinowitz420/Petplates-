// Test script to verify recipe diversity
import { GoalOrientedGenerator } from '@/lib/utils/constraintRecipeGenerator';

async function testRecipeDiversity() {
  console.log('=== Testing Recipe Diversity ===\n');
  
  const generator = new GoalOrientedGenerator('dogs', 'adult', [], 500, 4.00);
  
  const recipes: string[] = [];
  const ingredientSets: Set<string>[] = [];
  
  console.log('Generating 10 recipes for a dog...\n');
  
  for (let i = 0; i < 10; i++) {
    const recipe = generator.generate();
    
    if (recipe && recipe.ingredients) {
      const ingredientList = recipe.ingredients
        .map(ing => `${ing.name} (${ing.amount.toFixed(1)}g)`)
        .join(', ');
      
      console.log(`Recipe ${i + 1}:`);
      console.log(`  Ingredients: ${ingredientList}`);
      console.log(`  Calories: ${recipe.nutritionalInfo.totalCalories.toFixed(0)}`);
      console.log(`  Protein: ${recipe.nutritionalInfo.protein.toFixed(1)}g`);
      console.log(`  Validation: ${recipe.validation.isValid ? '✓ PASS' : '✗ FAIL'}`);
      console.log('');
      
      recipes.push(ingredientList);
      
      // Track unique ingredient combinations
      const ingSet = new Set(recipe.ingredients.map(ing => ing.name));
      ingredientSets.push(ingSet);
    } else {
      console.log(`Recipe ${i + 1}: FAILED TO GENERATE\n`);
    }
  }
  
  // Analyze diversity
  console.log('=== Diversity Analysis ===\n');
  
  const uniqueRecipes = new Set(recipes).size;
  console.log(`Unique recipe combinations: ${uniqueRecipes}/10`);
  
  // Check for ingredient variation
  let totalUniqueIngredients = 0;
  const ingredientFrequency: Record<string, number> = {};
  
  for (const ingSet of ingredientSets) {
    for (const ing of ingSet) {
      ingredientFrequency[ing] = (ingredientFrequency[ing] || 0) + 1;
      totalUniqueIngredients++;
    }
  }
  
  console.log(`Total unique ingredients used: ${Object.keys(ingredientFrequency).length}`);
  console.log(`Average ingredients per recipe: ${(totalUniqueIngredients / 10).toFixed(1)}`);
  
  // Show most and least used ingredients
  const sorted = Object.entries(ingredientFrequency).sort((a, b) => b[1] - a[1]);
  console.log('\nMost used ingredients:');
  sorted.slice(0, 5).forEach(([ing, count]) => {
    console.log(`  ${ing}: ${count}/10 recipes`);
  });
  
  console.log('\nLeast used ingredients:');
  sorted.slice(-5).forEach(([ing, count]) => {
    console.log(`  ${ing}: ${count}/10 recipes`);
  });
  
  // Verdict
  console.log('\n=== Verdict ===');
  if (uniqueRecipes >= 7) {
    console.log('✓ EXCELLENT: High diversity in recipe generation');
  } else if (uniqueRecipes >= 5) {
    console.log('✓ GOOD: Decent diversity in recipe generation');
  } else if (uniqueRecipes >= 3) {
    console.log('⚠ FAIR: Some repetition detected');
  } else {
    console.log('✗ POOR: Low diversity - recipes are too similar');
  }
}

testRecipeDiversity().catch(console.error);
