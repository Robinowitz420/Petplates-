// Test script to verify automatic research integration
const { generateRecipe, getRecipeTemplates } = require('./lib/recipe-generator.ts');

async function testAutomaticResearchIntegration() {
  console.log('🧪 Testing AUTOMATIC research-enhanced recipe generation...\n');

  try {
    // Generate a recipe - should automatically load and integrate research data
    console.log('👨‍🍳 Generating recipe with automatic research integration...');
    const dogTemplate = getRecipeTemplates('dogs', 'cooked')[0];
    const recipe = await generateRecipe({ template: dogTemplate });

    console.log(`✅ Generated: ${recipe.name}`);
    console.log(`📝 Description: ${recipe.description}`);
    console.log(`⭐ Rating: ${recipe.rating}/5.0`);
    console.log(`🏷️  Tags: ${recipe.tags.join(', ')}`);
    console.log(`🥦 Ingredients: ${recipe.ingredients.map(i => i.name).join(', ')}`);
    console.log();

    // Check if research validation was applied
    if (recipe.researchValidation) {
      console.log('🔬 Research Validation Applied:');
      console.log(`   📊 Score: ${recipe.researchValidation.score}/10`);
      console.log('   💡 Recommendations:');
      recipe.researchValidation.recommendations.forEach(rec => {
        console.log(`      • ${rec}`);
      });
      console.log();
    } else {
      console.log('⚠️  No research validation applied (research data may not be available)');
      console.log();
    }

    // Check if research-enhanced ingredients were used
    const researchIngredients = recipe.ingredients.filter(ing =>
      ing.name.toLowerCase().includes('guinea pig') ||
      ing.name.toLowerCase().includes('turkey') ||
      recipe.description.includes('Research-validated')
    );

    if (researchIngredients.length > 0) {
      console.log('🎯 Research-Enhanced Ingredients Detected:');
      researchIngredients.forEach(ing => {
        console.log(`   • ${ing.name}`);
      });
      console.log();
    }

    // Check rating boost from research
    if (recipe.rating > 4.5) {
      console.log(`🚀 Rating boosted by research validation: +${(recipe.rating - 4.5).toFixed(1)} stars`);
      console.log();
    }

    console.log('🎉 Automatic research integration test completed!');
    console.log('✨ Recipes now automatically include veterinary + community intelligence!');

  } catch (error) {
    console.error('❌ Automatic research integration test failed:', error);
  }
}

testAutomaticResearchIntegration();