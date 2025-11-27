// Test script to demonstrate scraped data integration
const { loadAndIntegrateScrapedData, generateRecipe, getRecipeTemplates, validateRecipeWithScrapedData } = require('./lib/recipe-generator.ts');

async function testIntegration() {
  console.log('🧪 Testing scraped data integration...\n');

  try {
    // Load and integrate scraped data
    console.log('📊 Loading scraped research data...');
    const { enhancedIngredients, healthInsights, insights } = await loadAndIntegrateScrapedData();

    console.log(`✅ Loaded ${enhancedIngredients.length} enhanced ingredients`);
    console.log(`📈 Found ${Object.keys(insights.commonIngredients).length} common ingredients from research`);
    console.log(`🏥 Identified ${Object.keys(insights.healthFocusAreas).length} health focus areas\n`);

    // Display insights
    console.log('🔍 Research Insights:');
    console.log('Common Ingredients:', insights.commonIngredients);
    console.log('Health Focus Areas:', insights.healthFocusAreas);
    console.log();

    // Generate a recipe using research data
    console.log('👨‍🍳 Generating research-enhanced recipe...');
    const dogTemplate = getRecipeTemplates('dogs', 'cooked')[0];
    const recipe = generateRecipe({ template: dogTemplate });

    console.log(`✅ Generated: ${recipe.name}`);
    console.log(`📝 Description: ${recipe.description}`);
    console.log(`🥦 Ingredients: ${recipe.ingredients.map(i => i.name).join(', ')}`);
    console.log();

    // Validate recipe against research
    console.log('🔬 Validating recipe against veterinary research...');
    const validation = validateRecipeWithScrapedData(recipe, insights, healthInsights, 'dogs');

    console.log(`⭐ Research Validation Score: ${validation.score}/10`);
    console.log('💡 Recommendations:');
    validation.recommendations.forEach(rec => console.log(`   • ${rec}`));

    console.log('\n🎉 Integration test completed successfully!');

  } catch (error) {
    console.error('❌ Integration test failed:', error);
  }
}

testIntegration();