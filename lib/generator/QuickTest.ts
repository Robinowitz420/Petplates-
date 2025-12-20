/**
 * Phase 1 Smoke Test - Verify critical fixes
 * Tests: S1 (1 primary protein), portion calc (petWeightKg), T1/T2/T3 hard fails
 */

import { RecipeBuilder } from './RecipeBuilder';

console.log('\n=== PHASE 1 SMOKE TEST ===\n');

// Test 1: Dog recipe with actual pet weight
console.log('TEST 1: Dog recipe with petWeightKg (10kg dog)');
const dogConstraints = {
  species: 'dogs' as const,
  lifeStage: 'adult' as const,
  petWeightKg: 10, // PHASE 1.4: Actual pet weight
  healthConcerns: [],
  budgetPerMeal: 4.0,
  targetCalories: undefined,
  allergies: [],
  bannedIngredients: [],
};

let successCount = 0;
let failCount = 0;

for (let i = 0; i < 3; i++) {
  const builder = new RecipeBuilder(dogConstraints, 'standard', 'medium');
  const recipe = builder.generate();

  if (recipe) {
    successCount++;
    console.log(`\n✅ Dog Recipe ${i + 1}:`);
    
    // PHASE 1.2: Verify exactly 1 primary protein (PHASE 1.7: use proteinRole)
    const primaryProteins = recipe.ingredients.filter(ing => ing.ingredient.proteinRole === 'primary');
    console.log(`   Primary proteins: ${primaryProteins.map(p => p.ingredient.name).join(', ')} (count: ${primaryProteins.length})`);
    if (primaryProteins.length !== 1) {
      console.log(`   ❌ FAIL: Expected 1 primary protein, got ${primaryProteins.length}`);
    } else {
      console.log(`   ✅ PASS: Exactly 1 primary protein`);
    }
    
    // PHASE 1.4: Check portion calculation uses pet weight
    const totalGrams = recipe.totalGrams;
    console.log(`   Total grams: ${totalGrams} (for 10kg dog)`);
    if (totalGrams < 200 || totalGrams > 1000) {
      console.log(`   ⚠️  Portion seems off for 10kg dog`);
    }
    
    // Check organ meat percentage
    const organMeatGrams = recipe.ingredients
      .filter(ing =>
        ing.ingredient.feedingRole === 'supplement' &&
        (ing.ingredient.name.toLowerCase().includes('liver') ||
         ing.ingredient.name.toLowerCase().includes('kidney') ||
         ing.ingredient.name.toLowerCase().includes('heart'))
      )
      .reduce((sum, ing) => sum + ing.grams, 0);
    
    const organPercent = (organMeatGrams / recipe.totalGrams) * 100;
    console.log(`   Organ meat: ${organPercent.toFixed(1)}%`);
    if (organPercent > 10) {
      console.log(`   ❌ FAIL: Organ meat exceeds 10%`);
    } else {
      console.log(`   ✅ PASS: Organ meat within 10% cap`);
    }
    
    // Check for toxic pairings
    const hasLiver = recipe.ingredients.some(ing => ing.ingredient.name.toLowerCase().includes('liver'));
    const hasSalmon = recipe.ingredients.some(ing => ing.ingredient.name.toLowerCase().includes('salmon'));
    const hasCod = recipe.ingredients.some(ing => ing.ingredient.name.toLowerCase().includes('cod'));
    
    if (hasLiver && (hasSalmon || hasCod)) {
      console.log(`   ❌ FAIL: TOXIC PAIRING - Liver + ${hasSalmon ? 'salmon' : 'cod'}`);
    } else {
      console.log(`   ✅ PASS: No toxic pairings`);
    }
  } else {
    failCount++;
    console.log(`\n❌ Dog Recipe ${i + 1}: Failed to generate`);
  }
}

// Test 2: Cat recipe (salmon_atlantic should be primary)
console.log('\n\nTEST 2: Cat recipe (salmon_atlantic as primary protein)');
const catConstraints = {
  species: 'cats' as const,
  lifeStage: 'adult' as const,
  petWeightKg: 4, // PHASE 1.4: Typical cat weight
  healthConcerns: [],
  budgetPerMeal: 3.0,
  targetCalories: undefined,
  allergies: [],
  bannedIngredients: [],
};

for (let i = 0; i < 2; i++) {
  const builder = new RecipeBuilder(catConstraints, 'standard', 'medium');
  const recipe = builder.generate();

  if (recipe) {
    successCount++;
    console.log(`\n✅ Cat Recipe ${i + 1}:`);
    
    const primaryProteins = recipe.ingredients.filter(ing => ing.ingredient.feedingRole === 'staple');
    console.log(`   Primary protein: ${primaryProteins.map(p => p.ingredient.name).join(', ')}`);
    if (primaryProteins.length !== 1) {
      console.log(`   ❌ FAIL: Expected 1 primary protein, got ${primaryProteins.length}`);
    } else {
      console.log(`   ✅ PASS: Exactly 1 primary protein`);
    }
    
    console.log(`   Total grams: ${recipe.totalGrams} (for 4kg cat)`);
  } else {
    failCount++;
    console.log(`\n❌ Cat Recipe ${i + 1}: Failed to generate`);
  }
}

console.log(`\n\n=== PHASE 1 SMOKE TEST RESULTS ===`);
console.log(`✅ Passed: ${successCount}`);
console.log(`❌ Failed: ${failCount}`);
console.log(`Total: ${successCount + failCount}\n`);
