// test-next-nutrition.js (in project root)
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Nutrition Integration in Next.js Project\n');

// Check if nutrition file exists
const nutritionFile = path.join(__dirname, 'lib', 'data', 'IngredientNutrition.txt');
console.log(`1. Nutrition file: ${fs.existsSync(nutritionFile) ? '✅ Exists' : '❌ Missing'}`);

// Check recipe-generator.ts
const recipeFile = path.join(__dirname, 'lib', 'recipe-generator.ts');
if (fs.existsSync(recipeFile)) {
  const content = fs.readFileSync(recipeFile, 'utf-8');
  
  console.log(`2. recipe-generator.ts: ✅ Exists (${content.length} chars)`);
  
  // Check for key markers
  const hasNutritionFunction = content.includes('calculateNutritionalContribution');
  const hasIngredientBreakdown = content.match(/ingredientBreakdown.*map/);
  const hasHardcodedProtein = content.includes('ing.name.toLowerCase().includes(\'chicken\') ? 20 : 2');
  
  console.log(`   Has calculateNutritionalContribution: ${hasNutritionFunction ? '✅' : '❌'}`);
  console.log(`   Has ingredientBreakdown mapping: ${hasIngredientBreakdown ? '✅' : '❌'}`);
  console.log(`   Still has hardcoded protein (20): ${hasHardcodedProtein ? '❌ YES - NOT INTEGRATED' : '✅ NO - GOOD'}`);
  
  // Check the actual lines around ingredientBreakdown
  const lines = content.split('\n');
  const breakdownIndex = lines.findIndex(line => line.includes('ingredientBreakdown'));
  
  if (breakdownIndex !== -1) {
    console.log(`\n3. Checking ingredientBreakdown (lines ${breakdownIndex-5} to ${breakdownIndex+10}):`);
    for (let i = Math.max(0, breakdownIndex-5); i < Math.min(lines.length, breakdownIndex+10); i++) {
      console.log(`   ${i+1}: ${lines[i]}`);
    }
  }
  
} else {
  console.log('❌ recipe-generator.ts not found!');
}

// Try to run a simple TypeScript check
console.log('\n4. Trying to check TypeScript compilation...');
try {
  // Create a minimal test file
  const testCode = `
import { getRecipeTemplates } from './lib/recipe-generator.ts';
console.log('Test passed - can import recipe generator');
`;
  
  fs.writeFileSync('temp-test.ts', testCode);
  
  // Try to compile it
  execSync('npx tsc --noEmit temp-test.ts', { stdio: 'pipe' });
  console.log('✅ TypeScript compilation check passed');
  fs.unlinkSync('temp-test.ts');
} catch (error) {
  console.log('❌ TypeScript compilation error:', error.message);
  try { fs.unlinkSync('temp-test.ts'); } catch {}
}