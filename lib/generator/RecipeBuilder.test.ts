/**
 * RECIPE BUILDER TEST SUITE
 * Tests biological invariants, not scoring hacks
 * 
 * Categories:
 * 1. Golden-Path Tests (system succeeds on perfect inputs)
 * 2. Rejection Tests (safety gates work)
 * 3. Nutrient Ceiling Tests (micronutrient caps enforced)
 * 4. Allergen & Derivative Tests (cross-source safety)
 * 5. Distribution Tests (no clustering/repetition)
 * 6. Regression Tests (never break again)
 * 7. Property-Based Fuzzer (1000 random recipes)
 */

import { RecipeBuilder, type GenerationConstraints } from './RecipeBuilder';
import { validateRecipeComprehensive } from './RecipeConstraintRules';
import type { Ingredient } from '@/lib/data/ingredients';

// ============================================================================
// TEST UTILITIES
// ============================================================================

interface TestResult {
  passed: boolean;
  name: string;
  error?: string;
  details?: Record<string, any>;
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
    return result;
  } catch (error) {
    const result = {
      passed: false,
      name,
      error: error instanceof Error ? error.message : String(error),
    };
    results.push(result);
    return result;
  }
}

function describe(category: string, tests: Array<() => void>) {
  console.log(`\n📋 ${category}`);
  tests.forEach(t => t());
}

// ============================================================================
// 1. GOLDEN-PATH TESTS
// ============================================================================

describe('Golden-Path Tests (System Succeeds)', [
  () => {
    test('Perfect dog: scores ≥95, safe composition', () => {
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
      assert(recipe!.debugInfo?.topScores[0].score >= 95, 'Top score should be ≥95');
      assert(recipe!.debugInfo?.validation?.isValid, 'Recipe should pass validation');

      // Check composition
      const hasProtein = recipe!.ingredients.some(
        ing => ing.ingredient.category === 'protein'
      );
      const hasCarb = recipe!.ingredients.some(ing => ing.ingredient.category === 'carb');
      const hasVeg = recipe!.ingredients.some(ing => ing.ingredient.category === 'vegetable');

      assert(hasProtein && hasCarb && hasVeg, 'Should have protein + carb + veg');
    });
  },

  () => {
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
      const carbCount = recipe!.ingredients.filter(ing => ing.ingredient.category === 'carb')
        .length;

      assert(proteinCount >= 1, 'Should have at least 1 protein');
      assert(carbCount <= 1, 'Cats should have 0-1 carbs');
    });
  },
]);

// ============================================================================
// 2. REJECTION TESTS (Safety Gates)
// ============================================================================

describe('Rejection Tests (Safety Gates Work)', [
  () => {
    test('Organ overdose rejected: salmon + beef liver', () => {
      const constraints: GenerationConstraints = {
        species: 'dogs',
        lifeStage: 'adult',
        healthConcerns: [],
        budgetPerMeal: 4.0,
        targetCalories: 500,
        allergies: [],
        bannedIngredients: [],
      };

      // Simulate selecting salmon + beef liver
      const mockIngredients: Ingredient[] = [
        {
          id: 'salmon',
          name: 'salmon',
          category: 'protein',
          feedingRole: 'staple',
          composition: { protein: 25, fat: 13, kcal: 208, calcium: 12, phosphorus: 200 },
          compatibility: { dogs: 'ok', cats: 'ok', birds: 'limit', reptiles: 'limit', 'pocket-pets': 'avoid' },
          maxInclusionPercent: { dogs: 0.3, cats: 0.3, birds: 0.3, reptiles: 0.3, 'pocket-pets': 0.3 },
          qualityScore: 5,
          pricePerLb: 8.0,
        },
        {
          id: 'beef_liver',
          name: 'beef_liver',
          category: 'protein',
          feedingRole: 'supplement',
          composition: { protein: 20, fat: 3, kcal: 135, calcium: 6, phosphorus: 387, vitaminA: 30000 },
          compatibility: { dogs: 'ok', cats: 'caution', birds: 'limit', reptiles: 'limit', 'pocket-pets': 'avoid' },
          maxInclusionPercent: { dogs: 0.3, cats: 0.3, birds: 0.3, reptiles: 0.3, 'pocket-pets': 0.3 },
          qualityScore: 5,
          pricePerLb: 3.0,
        },
      ];

      const validation = validateRecipeComprehensive(
        mockIngredients,
        'dogs',
        'adult',
        4.0,
        []
      );

      assert(!validation.isValid, 'Should reject organ overdose');
      assert(
        validation.failedRules.includes('T1') || validation.failedRules.includes('S2'),
        'Should fail vitamin A or organ meat rule'
      );
    });
  },

  () => {
    test('Multiple primary proteins rejected', () => {
      const mockIngredients: Ingredient[] = [
        {
          id: 'chicken',
          name: 'chicken_breast',
          category: 'protein',
          feedingRole: 'staple',
          composition: { protein: 31, fat: 3, kcal: 165, calcium: 11, phosphorus: 196 },
          compatibility: { dogs: 'ok', cats: 'ok', birds: 'limit', reptiles: 'limit', 'pocket-pets': 'avoid' },
          maxInclusionPercent: { dogs: 0.3, cats: 0.3, birds: 0.3, reptiles: 0.3, 'pocket-pets': 0.3 },
          qualityScore: 5,
          pricePerLb: 3.0,
        },
        {
          id: 'salmon',
          name: 'salmon',
          category: 'protein',
          feedingRole: 'staple',
          composition: { protein: 25, fat: 13, kcal: 208, calcium: 12, phosphorus: 200 },
          compatibility: { dogs: 'ok', cats: 'ok', birds: 'limit', reptiles: 'limit', 'pocket-pets': 'avoid' },
          maxInclusionPercent: { dogs: 0.3, cats: 0.3, birds: 0.3, reptiles: 0.3, 'pocket-pets': 0.3 },
          qualityScore: 5,
          pricePerLb: 8.0,
        },
      ];

      const validation = validateRecipeComprehensive(
        mockIngredients,
        'dogs',
        'adult',
        4.0,
        []
      );

      assert(!validation.isValid, 'Should reject multiple primary proteins');
      assert(validation.failedRules.includes('S1'), 'Should fail S1 rule');
    });
  },

  () => {
    test('Missing carb for dog rejected', () => {
      const mockIngredients: Ingredient[] = [
        {
          id: 'beef',
          name: 'beef',
          category: 'protein',
          feedingRole: 'staple',
          composition: { protein: 26, fat: 15, kcal: 250, calcium: 10, phosphorus: 180 },
          compatibility: { dogs: 'ok', cats: 'ok', birds: 'limit', reptiles: 'limit', 'pocket-pets': 'avoid' },
          maxInclusionPercent: { dogs: 0.3, cats: 0.3, birds: 0.3, reptiles: 0.3, 'pocket-pets': 0.3 },
          qualityScore: 5,
          pricePerLb: 5.0,
        },
        {
          id: 'carrots',
          name: 'carrots',
          category: 'vegetable',
          feedingRole: 'staple',
          composition: { protein: 0.9, fat: 0.2, kcal: 41, calcium: 33, phosphorus: 35 },
          compatibility: { dogs: 'ok', cats: 'ok', birds: 'ok', reptiles: 'ok', 'pocket-pets': 'ok' },
          maxInclusionPercent: { dogs: 0.3, cats: 0.3, birds: 0.3, reptiles: 0.3, 'pocket-pets': 0.3 },
          qualityScore: 5,
          pricePerLb: 0.5,
        },
        {
          id: 'fish_oil',
          name: 'fish_oil',
          category: 'fat',
          feedingRole: 'supplement',
          composition: { protein: 0, fat: 100, kcal: 902, calcium: 0, phosphorus: 0 },
          compatibility: { dogs: 'ok', cats: 'ok', birds: 'limit', reptiles: 'limit', 'pocket-pets': 'avoid' },
          maxInclusionPercent: { dogs: 0.3, cats: 0.3, birds: 0.3, reptiles: 0.3, 'pocket-pets': 0.3 },
          qualityScore: 5,
          pricePerLb: 15.0,
        },
      ];

      const validation = validateRecipeComprehensive(
        mockIngredients,
        'dogs',
        'adult',
        4.0,
        []
      );

      assert(!validation.isValid, 'Should reject carb-free dog recipe');
      assert(validation.failedRules.includes('S4'), 'Should fail S4 rule');
    });
  },
]);

// ============================================================================
// 3. NUTRIENT CEILING TESTS
// ============================================================================

describe('Nutrient Ceiling Tests', [
  () => {
    test('Vitamin A ceiling enforced (dog)', () => {
      // Liver has ~30,000 IU per 100g
      // Dog ceiling is 5,000 IU
      // 20% liver would exceed ceiling
      const mockIngredients: Ingredient[] = [
        {
          id: 'chicken',
          name: 'chicken_breast',
          category: 'protein',
          feedingRole: 'staple',
          composition: { protein: 31, fat: 3, kcal: 165, calcium: 11, phosphorus: 196, vitaminA: 0 },
          compatibility: { dogs: 'ok', cats: 'ok', birds: 'limit', reptiles: 'limit', 'pocket-pets': 'avoid' },
          maxInclusionPercent: { dogs: 0.3, cats: 0.3, birds: 0.3, reptiles: 0.3, 'pocket-pets': 0.3 },
          qualityScore: 5,
          pricePerLb: 3.0,
        },
        {
          id: 'beef_liver',
          name: 'beef_liver',
          category: 'protein',
          feedingRole: 'supplement',
          composition: { protein: 20, fat: 3, kcal: 135, calcium: 6, phosphorus: 387, vitaminA: 30000 },
          compatibility: { dogs: 'ok', cats: 'caution', birds: 'limit', reptiles: 'limit', 'pocket-pets': 'avoid' },
          maxInclusionPercent: { dogs: 0.3, cats: 0.3, birds: 0.3, reptiles: 0.3, 'pocket-pets': 0.3 },
          qualityScore: 5,
          pricePerLb: 3.0,
        },
        {
          id: 'rice',
          name: 'rice',
          category: 'carb',
          feedingRole: 'staple',
          composition: { protein: 2.7, fat: 0.3, kcal: 130, calcium: 10, phosphorus: 68 },
          compatibility: { dogs: 'ok', cats: 'ok', birds: 'ok', reptiles: 'ok', 'pocket-pets': 'ok' },
          maxInclusionPercent: { dogs: 0.3, cats: 0.3, birds: 0.3, reptiles: 0.3, 'pocket-pets': 0.3 },
          qualityScore: 5,
          pricePerLb: 0.5,
        },
      ];

      const validation = validateRecipeComprehensive(
        mockIngredients,
        'dogs',
        'adult',
        4.0,
        []
      );

      assert(!validation.isValid, 'Should reject vitamin A overload');
      assert(validation.failedRules.includes('T1'), 'Should fail T1 rule');
    });
  },
]);

// ============================================================================
// 4. ALLERGEN & DERIVATIVE TESTS
// ============================================================================

describe('Allergen & Derivative Tests', [
  () => {
    test('Chicken fat rejected for chicken-allergic dog', () => {
      const mockIngredients: Ingredient[] = [
        {
          id: 'beef',
          name: 'beef',
          category: 'protein',
          feedingRole: 'staple',
          composition: { protein: 26, fat: 15, kcal: 250, calcium: 10, phosphorus: 180 },
          compatibility: { dogs: 'ok', cats: 'ok', birds: 'limit', reptiles: 'limit', 'pocket-pets': 'avoid' },
          maxInclusionPercent: { dogs: 0.3, cats: 0.3, birds: 0.3, reptiles: 0.3, 'pocket-pets': 0.3 },
          qualityScore: 5,
          pricePerLb: 5.0,
        },
        {
          id: 'chicken_fat',
          name: 'chicken_fat',
          category: 'fat',
          feedingRole: 'supplement',
          composition: { protein: 0, fat: 100, kcal: 884, calcium: 0, phosphorus: 0 },
          compatibility: { dogs: 'ok', cats: 'ok', birds: 'limit', reptiles: 'limit', 'pocket-pets': 'avoid' },
          maxInclusionPercent: { dogs: 0.3, cats: 0.3, birds: 0.3, reptiles: 0.3, 'pocket-pets': 0.3 },
          qualityScore: 5,
          pricePerLb: 2.0,
        },
      ];

      const validation = validateRecipeComprehensive(
        mockIngredients,
        'dogs',
        'adult',
        4.0,
        ['chicken'] // Pet allergic to chicken
      );

      assert(!validation.isValid, 'Should reject chicken derivative for chicken-allergic pet');
      assert(validation.failedRules.includes('T5'), 'Should fail T5 rule');
    });
  },
]);

// ============================================================================
// 5. DISTRIBUTION TESTS (Catch Clustering)
// ============================================================================

describe('Distribution Tests (No Clustering)', [
  () => {
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
  },
]);

// ============================================================================
// 6. REGRESSION TESTS (Never Break Again)
// ============================================================================

describe('Regression Tests (Biological Invariants)', [
  () => {
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

      for (let i = 0; i < 20; i++) {
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
  },

  () => {
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

      for (let i = 0; i < 20; i++) {
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
  },

  () => {
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

      for (let i = 0; i < 20; i++) {
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
  },
]);

// ============================================================================
// 7. PROPERTY-BASED FUZZER (1000 Random Recipes)
// ============================================================================

describe('Property-Based Fuzzer (1000 Random Recipes)', [
  () => {
    test('No unsafe recipe reaches scoring', () => {
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

      assert(
        unsafeCount === 0,
        `No recipes should fail validation (${unsafeCount} failed out of 1000)`
      );
    });
  },

  () => {
    test('No nutrient ceiling violations survive', () => {
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
  },
]);

// ============================================================================
// TEST SUMMARY
// ============================================================================

export function runAllTests() {
  console.log('\n' + '='.repeat(70));
  console.log('RECIPE BUILDER TEST SUITE');
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
        console.log(`   Error: ${r.error}`);
      });
  }

  return { passed, failed, total: results.length };
}

// Export for testing
export { test, describe, assert };
