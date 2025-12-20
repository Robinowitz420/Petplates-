/**
 * RECIPE BUILDER INTEGRATION TESTS
 * Tests biological invariants using real recipe generation
 * 
 * Run with: npm test -- RecipeBuilder.integration.test.ts
 */

import { RecipeBuilder, type GenerationConstraints } from './RecipeBuilder';

// ============================================================================
// TEST UTILITIES
// ============================================================================

interface TestResult {
  passed: boolean;
  name: string;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function test(name: string, fn: () => void): TestResult {
  try {
    fn();
    const result = { passed: true, name };
    results.push(result);
    console.log(`  ✅ ${name}`);
    return result;
  } catch (error) {
    const result = {
      passed: false,
      name,
      error: error instanceof Error ? error.message : String(error),
    };
    results.push(result);
    console.log(`  ❌ ${name}: ${result.error}`);
    return result;
  }
}

// ============================================================================
// 1. GOLDEN-PATH TESTS
// ============================================================================

console.log('\n📋 Golden-Path Tests (System Succeeds)');

test('Perfect dog: generates recipe with good composition', () => {
  const constraints: GenerationConstraints = {
    species: 'dogs',
    lifeStage: 'adult',
    healthConcerns: [],
    budgetPerMeal: 4.0,
    targetCalories: 500,
    allergies: [],
    bannedIngredients: [],
  };

  const builder = new RecipeBuilder(constraints, 'standard', 'medium');
  const recipe = builder.generate();

  assert(recipe !== null, 'Recipe should be generated');
  assert(recipe!.debugInfo?.topScores[0].score >= 60, 'Top score should be ≥60');

  // Check composition (most important)
  const hasProtein = recipe!.ingredients.some(ing => ing.ingredient.category === 'protein');
  const hasCarb = recipe!.ingredients.some(ing => ing.ingredient.category === 'carb');
  const hasVeg = recipe!.ingredients.some(ing => ing.ingredient.category === 'vegetable');

  assert(hasProtein && hasCarb && hasVeg, 'Should have protein + carb + veg');
});

test('Perfect cat: high protein, low carb, ≥90 score', () => {
  const constraints: GenerationConstraints = {
    species: 'cats',
    lifeStage: 'adult',
    healthConcerns: [],
    budgetPerMeal: 5.0,
    targetCalories: 400,
    allergies: [],
    bannedIngredients: [],
  };

  const builder = new RecipeBuilder(constraints, 'standard', 'medium');
  const recipe = builder.generate();

  assert(recipe !== null, 'Recipe should be generated');
  assert(recipe!.debugInfo?.topScores[0].score >= 90, 'Top score should be ≥90');

  // Cats should have high protein, low/no carb
  const proteinCount = recipe!.ingredients.filter(
    ing => ing.ingredient.category === 'protein'
  ).length;
  const carbCount = recipe!.ingredients.filter(ing => ing.ingredient.category === 'carb').length;

  assert(proteinCount >= 1, 'Should have at least 1 protein');
  assert(carbCount <= 1, 'Cats should have 0-1 carbs');
});

// ============================================================================
// 2. REJECTION TESTS (Safety Gates)
// ============================================================================

console.log('\n📋 Rejection Tests (Safety Gates Work)');

test('Multiple primary proteins rejected (S1 rule)', () => {
  const constraints: GenerationConstraints = {
    species: 'dogs',
    lifeStage: 'adult',
    healthConcerns: [],
    budgetPerMeal: 4.0,
    targetCalories: 500,
    allergies: [],
    bannedIngredients: [],
  };

  // Generate 20 recipes and verify none have multiple primary proteins
  for (let i = 0; i < 20; i++) {
    const builder = new RecipeBuilder(constraints, 'standard', 'medium');
    const recipe = builder.generate();

    if (recipe) {
      const primaryProteins = recipe.ingredients.filter(
        ing => ing.ingredient.feedingRole === 'staple' && ing.ingredient.category === 'protein'
      );
      assert(primaryProteins.length === 1, `Recipe ${i}: should have exactly 1 primary protein`);
    }
  }
});

test('Missing carb for dog rejected (S4 rule)', () => {
  const constraints: GenerationConstraints = {
    species: 'dogs',
    lifeStage: 'adult',
    healthConcerns: [],
    budgetPerMeal: 4.0,
    targetCalories: 500,
    allergies: [],
    bannedIngredients: [],
  };

  // Generate 20 recipes and verify all have carbs
  for (let i = 0; i < 20; i++) {
    const builder = new RecipeBuilder(constraints, 'standard', 'medium');
    const recipe = builder.generate();

    if (recipe) {
      const hasCarb = recipe.ingredients.some(ing => ing.ingredient.category === 'carb');
      assert(hasCarb, `Recipe ${i}: dogs require carbs`);
    }
  }
});

// ============================================================================
// 3. NUTRIENT CEILING TESTS
// ============================================================================

console.log('\n📋 Nutrient Ceiling Tests');

test('Vitamin A ceiling enforced (T1 rule)', () => {
  const constraints: GenerationConstraints = {
    species: 'dogs',
    lifeStage: 'adult',
    healthConcerns: [],
    budgetPerMeal: 4.0,
    targetCalories: 500,
    allergies: [],
    bannedIngredients: [],
  };

  // Generate 20 recipes and verify vitamin A doesn't exceed ceiling (5000 IU for dogs)
  for (let i = 0; i < 20; i++) {
    const builder = new RecipeBuilder(constraints, 'standard', 'medium');
    const recipe = builder.generate();

    if (recipe) {
      const totalVitaminA = recipe.ingredients.reduce(
        (sum, ing) => sum + (ing.ingredient.composition.vitaminA || 0),
        0
      );
      assert(
        totalVitaminA <= 5000,
        `Recipe ${i}: vitamin A ${totalVitaminA} exceeds dog ceiling of 5000 IU`
      );
    }
  }
});

test('Calcium-phosphorus ratio in range (T6 rule)', () => {
  const constraints: GenerationConstraints = {
    species: 'dogs',
    lifeStage: 'adult',
    healthConcerns: [],
    budgetPerMeal: 4.0,
    targetCalories: 500,
    allergies: [],
    bannedIngredients: [],
  };

  // Dog Ca:P range is 1.2-2.0
  for (let i = 0; i < 20; i++) {
    const builder = new RecipeBuilder(constraints, 'standard', 'medium');
    const recipe = builder.generate();

    if (recipe) {
      const totalCalcium = recipe.ingredients.reduce(
        (sum, ing) => sum + (ing.ingredient.composition.calcium || 0),
        0
      );
      const totalPhosphorus = recipe.ingredients.reduce(
        (sum, ing) => sum + (ing.ingredient.composition.phosphorus || 0),
        0
      );

      if (totalPhosphorus > 0) {
        const ratio = totalCalcium / totalPhosphorus;
        assert(
          ratio >= 1.2 && ratio <= 2.0,
          `Recipe ${i}: Ca:P ratio ${ratio.toFixed(2)} outside dog range 1.2-2.0`
        );
      }
    }
  }
});

// ============================================================================
// 4. ALLERGEN & DERIVATIVE TESTS
// ============================================================================

console.log('\n📋 Allergen & Derivative Tests');

test('Allergen derivatives rejected (T5 rule)', () => {
  const constraints: GenerationConstraints = {
    species: 'dogs',
    lifeStage: 'adult',
    healthConcerns: [],
    budgetPerMeal: 4.0,
    targetCalories: 500,
    allergies: ['chicken'],
    bannedIngredients: [],
  };

  // Generate 20 recipes and verify no chicken or chicken derivatives
  for (let i = 0; i < 20; i++) {
    const builder = new RecipeBuilder(constraints, 'standard', 'medium');
    const recipe = builder.generate();

    if (recipe) {
      const hasChickenDerivative = recipe.ingredients.some(ing =>
        ing.ingredient.id.toLowerCase().includes('chicken') ||
        ing.ingredient.name.toLowerCase().includes('chicken')
      );
      assert(!hasChickenDerivative, `Recipe ${i}: should not contain chicken derivatives`);
    }
  }
});

// ============================================================================
// 5. DISTRIBUTION TESTS (Catch Clustering)
// ============================================================================

console.log('\n📋 Distribution Tests (No Clustering)');

test('Score spread: 50 recipes have variance', () => {
  const constraints: GenerationConstraints = {
    species: 'dogs',
    lifeStage: 'adult',
    healthConcerns: [],
    budgetPerMeal: 4.0,
    targetCalories: 500,
    allergies: [],
    bannedIngredients: [],
  };

  const scores: number[] = [];
  for (let i = 0; i < 50; i++) {
    const builder = new RecipeBuilder(constraints, 'standard', 'medium');
    const recipe = builder.generate();
    if (recipe?.debugInfo?.topScores[0]) {
      scores.push(recipe.debugInfo.topScores[0].score);
    }
  }

  assert(scores.length >= 40, 'Should generate at least 40 recipes');

  const max = Math.max(...scores);
  const min = Math.min(...scores);
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);

  assert(max >= 95, `Max score should be ≥95 (got ${max})`);
  assert(min >= 60, `Min score should be ≥60 (got ${min})`);
  assert(stdDev > 6, `Std dev should be >6 (got ${stdDev.toFixed(2)})`);

  // Check for clustering (no more than 20% identical scores)
  const scoreFreq = new Map<number, number>();
  scores.forEach(s => scoreFreq.set(s, (scoreFreq.get(s) || 0) + 1));
  const maxFreq = Math.max(...scoreFreq.values());
  const clusterPercent = (maxFreq / scores.length) * 100;

  assert(
    clusterPercent <= 20,
    `No single score should appear >20% (got ${clusterPercent.toFixed(1)}%)`
  );
});

// ============================================================================
// 6. REGRESSION TESTS (Never Break Again)
// ============================================================================

console.log('\n📋 Regression Tests (Biological Invariants)');

test('Salmon + liver never appears', () => {
  const constraints: GenerationConstraints = {
    species: 'dogs',
    lifeStage: 'adult',
    healthConcerns: [],
    budgetPerMeal: 4.0,
    targetCalories: 500,
    allergies: [],
    bannedIngredients: [],
  };

  for (let i = 0; i < 50; i++) {
    const builder = new RecipeBuilder(constraints, 'standard', 'medium');
    const recipe = builder.generate();

    if (recipe) {
      const ingredients = recipe.ingredients.map(ing => ing.ingredient.name.toLowerCase());
      const hasSalmon = ingredients.some(ing => ing.includes('salmon'));
      const hasLiver = ingredients.some(ing => ing.includes('liver'));

      assert(
        !(hasSalmon && hasLiver),
        `Salmon + liver should never appear together (found in recipe ${i})`
      );
    }
  }
});

test('Organ meat never exceeds 10%', () => {
  const constraints: GenerationConstraints = {
    species: 'dogs',
    lifeStage: 'adult',
    healthConcerns: [],
    budgetPerMeal: 4.0,
    targetCalories: 500,
    allergies: [],
    bannedIngredients: [],
  };

  for (let i = 0; i < 50; i++) {
    const builder = new RecipeBuilder(constraints, 'standard', 'medium');
    const recipe = builder.generate();

    if (recipe) {
      const organMeatGrams = recipe.ingredients
        .filter(ing =>
          ing.ingredient.name.toLowerCase().includes('liver') ||
          ing.ingredient.name.toLowerCase().includes('kidney') ||
          ing.ingredient.name.toLowerCase().includes('heart')
        )
        .reduce((sum, ing) => sum + ing.grams, 0);

      const organPercent = (organMeatGrams / recipe.totalGrams) * 100;
      assert(organPercent <= 10, `Organ meat should be ≤10% (got ${organPercent.toFixed(1)}%)`);
    }
  }
});

test('Exactly one primary protein per recipe', () => {
  const constraints: GenerationConstraints = {
    species: 'dogs',
    lifeStage: 'adult',
    healthConcerns: [],
    budgetPerMeal: 4.0,
    targetCalories: 500,
    allergies: [],
    bannedIngredients: [],
  };

  for (let i = 0; i < 50; i++) {
    const builder = new RecipeBuilder(constraints, 'standard', 'medium');
    const recipe = builder.generate();

    if (recipe) {
      const primaryProteins = recipe.ingredients.filter(
        ing => ing.ingredient.feedingRole === 'staple' && ing.ingredient.category === 'protein'
      );

      assert(
        primaryProteins.length === 1,
        `Should have exactly 1 primary protein (got ${primaryProteins.length})`
      );
    }
  }
});

// ============================================================================
// 7. PROPERTY-BASED FUZZER (1000 Random Recipes)
// ============================================================================

console.log('\n📋 Property-Based Fuzzer (1000 Random Recipes)');

test('No unsafe recipe reaches scoring (all 1000 pass validation)', () => {
  const constraints: GenerationConstraints = {
    species: 'dogs',
    lifeStage: 'adult',
    healthConcerns: [],
    budgetPerMeal: 4.0,
    targetCalories: 500,
    allergies: [],
    bannedIngredients: [],
  };

  let unsafeCount = 0;
  for (let i = 0; i < 1000; i++) {
    const builder = new RecipeBuilder(constraints, 'standard', 'medium');
    const recipe = builder.generate();

    if (recipe?.debugInfo?.validation && !recipe.debugInfo.validation.isValid) {
      unsafeCount++;
    }
  }

  assert(unsafeCount === 0, `No recipes should fail validation (${unsafeCount} failed out of 1000)`);
});

test('No nutrient ceiling violations survive (all 1000 pass T rules)', () => {
  const constraints: GenerationConstraints = {
    species: 'dogs',
    lifeStage: 'adult',
    healthConcerns: [],
    budgetPerMeal: 4.0,
    targetCalories: 500,
    allergies: [],
    bannedIngredients: [],
  };

  let violationCount = 0;
  for (let i = 0; i < 1000; i++) {
    const builder = new RecipeBuilder(constraints, 'standard', 'medium');
    const recipe = builder.generate();

    if (recipe?.debugInfo?.validation?.failedRules.some(r => r.startsWith('T'))) {
      violationCount++;
    }
  }

  assert(
    violationCount === 0,
    `No nutrient ceiling violations should survive (${violationCount} found out of 1000)`
  );
});

// ============================================================================
// TEST SUMMARY
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('TEST SUMMARY');
console.log('='.repeat(70));

const passed = results.filter(r => r.passed).length;
const failed = results.filter(r => !r.passed).length;

console.log(`\n✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📊 Total: ${results.length}`);

if (failed > 0) {
  console.log('\n' + '='.repeat(70));
  console.log('FAILURES');
  console.log('='.repeat(70));
  results
    .filter(r => !r.passed)
    .forEach(r => {
      console.log(`\n❌ ${r.name}`);
      console.log(`   ${r.error}`);
    });
  process.exit(1);
} else {
  console.log('\n🎉 All tests passed!');
  process.exit(0);
}
