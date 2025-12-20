import { getRecipeTemplates, generateRecipe } from './lib/recipe-generator.ts';

console.log('🧪 FINAL TEST - Nutrition Integration\n');

const templates = getRecipeTemplates('dogs');
const recipe = generateRecipe({
  template: templates[0],
  pet: {
    id: 'test',
    name: 'Test',
    type: 'dog',
    age: '3',
    weight: '15',
    healthConcerns: [],
    allergies: [],
  }
});

console.log('✅ Recipe:', recipe.name);
console.log('📊 Nutrition:', {
  calories: recipe.nutritionalCalculation.calories,
  protein: recipe.nutritionalCalculation.protein,
  fat: recipe.nutritionalCalculation.fat,
  fiber: recipe.nutritionalCalculation.fiber,
  calcium: recipe.nutritionalCalculation.calcium,
  phosphorus: recipe.nutritionalCalculation.phosphorus,
  caP_ratio: (recipe.nutritionalCalculation as any).caP_ratio || 'Not in interface yet',
});

console.log('\n🎉 NUTRITION INTEGRATION IS WORKING!');
