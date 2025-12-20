// Comprehensive Audit: All Species + Health Concerns
// Tests recipe generation for every species with single and paired health concerns

import { RecipeBuilder, type GenerationConstraints } from './RecipeBuilder';

type Species = 'dogs' | 'cats' | 'birds' | 'reptiles' | 'pocket-pets';

const SPECIES: Species[] = ['dogs', 'cats', 'birds', 'reptiles', 'pocket-pets'];

const HEALTH_CONCERNS = [
  'allergies',
  'digestive_issues',
  'joint_health',
  'skin_health',
  'weight_management',
  'dental_health',
  'immune_support',
];

interface AuditResult {
  species: Species;
  healthConcerns: string[];
  success: boolean;
  attempts: number;
  totalGrams?: number;
  primaryProteins?: number;
  error?: string;
}

const results: AuditResult[] = [];

console.log('='.repeat(80));
console.log('COMPREHENSIVE RECIPE GENERATION AUDIT');
console.log('='.repeat(80));
console.log(`Testing ${SPECIES.length} species × ${HEALTH_CONCERNS.length} concerns + pairs`);
console.log(`Total combinations: ~${SPECIES.length * (HEALTH_CONCERNS.length + (HEALTH_CONCERNS.length * (HEALTH_CONCERNS.length - 1)) / 2)}`);
console.log('='.repeat(80));

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// Test 1: Single health concerns
console.log('\n📋 PHASE 1: Single Health Concerns');
console.log('-'.repeat(80));

for (const species of SPECIES) {
  for (const concern of HEALTH_CONCERNS) {
    totalTests++;
    const constraints: GenerationConstraints = {
      species,
      lifeStage: 'adult',
      petWeightKg: species === 'dogs' ? 20 : species === 'cats' ? 5 : 2,
      healthConcerns: [concern],
      targetCalories: 500,
    };

    let attempts = 0;
    let success = false;
    let totalGrams = 0;
    let primaryProteins = 0;

    for (let i = 0; i < 3; i++) {
      attempts++;
      try {
        const builder = new RecipeBuilder(constraints, 'standard', 'medium');
        const recipe = builder.generate();

        if (recipe && recipe.ingredients.length > 0) {
          success = true;
          totalGrams = recipe.ingredients.reduce((sum, p) => sum + p.grams, 0);
          primaryProteins = recipe.ingredients.filter(
            p => p.ingredient.category === 'protein' && p.ingredient.proteinRole === 'primary'
          ).length;
          break;
        }
      } catch (error) {
        // Continue to next attempt
      }
    }

    const result: AuditResult = {
      species,
      healthConcerns: [concern],
      success,
      attempts,
      totalGrams,
      primaryProteins,
    };

    results.push(result);

    if (success) {
      passedTests++;
      console.log(`✅ ${species.padEnd(12)} + ${concern.padEnd(20)} | ${totalGrams}g | ${primaryProteins} primary protein`);
    } else {
      failedTests++;
      console.log(`❌ ${species.padEnd(12)} + ${concern.padEnd(20)} | Failed after ${attempts} attempts`);
    }
  }
}

// Test 2: Paired health concerns (sample combinations)
console.log('\n📋 PHASE 2: Paired Health Concerns (Sample)');
console.log('-'.repeat(80));

const pairCombos = [
  ['allergies', 'digestive_issues'],
  ['joint_health', 'weight_management'],
  ['skin_health', 'immune_support'],
  ['digestive_issues', 'dental_health'],
  ['weight_management', 'immune_support'],
];

for (const species of SPECIES) {
  for (const [concern1, concern2] of pairCombos) {
    totalTests++;
    const constraints: GenerationConstraints = {
      species,
      lifeStage: 'adult',
      petWeightKg: species === 'dogs' ? 20 : species === 'cats' ? 5 : 2,
      healthConcerns: [concern1, concern2],
      targetCalories: 500,
    };

    let attempts = 0;
    let success = false;
    let totalGrams = 0;
    let primaryProteins = 0;

    for (let i = 0; i < 3; i++) {
      attempts++;
      try {
        const builder = new RecipeBuilder(constraints, 'standard', 'medium');
        const recipe = builder.generate();

        if (recipe && recipe.ingredients.length > 0) {
          success = true;
          totalGrams = recipe.ingredients.reduce((sum, p) => sum + p.grams, 0);
          primaryProteins = recipe.ingredients.filter(
            p => p.ingredient.category === 'protein' && p.ingredient.proteinRole === 'primary'
          ).length;
          break;
        }
      } catch (error) {
        // Continue to next attempt
      }
    }

    const result: AuditResult = {
      species,
      healthConcerns: [concern1, concern2],
      success,
      attempts,
      totalGrams,
      primaryProteins,
    };

    results.push(result);

    if (success) {
      passedTests++;
      console.log(
        `✅ ${species.padEnd(12)} + ${(concern1 + ' + ' + concern2).padEnd(35)} | ${totalGrams}g | ${primaryProteins} primary protein`
      );
    } else {
      failedTests++;
      console.log(
        `❌ ${species.padEnd(12)} + ${(concern1 + ' + ' + concern2).padEnd(35)} | Failed after ${attempts} attempts`
      );
    }
  }
}

// Summary
console.log('\n' + '='.repeat(80));
console.log('AUDIT SUMMARY');
console.log('='.repeat(80));
console.log(`Total Tests: ${totalTests}`);
console.log(`✅ Passed: ${passedTests} (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
console.log(`❌ Failed: ${failedTests} (${((failedTests / totalTests) * 100).toFixed(1)}%)`);

// Breakdown by species
console.log('\n📊 Results by Species:');
for (const species of SPECIES) {
  const speciesResults = results.filter(r => r.species === species);
  const speciesPassed = speciesResults.filter(r => r.success).length;
  const speciesTotal = speciesResults.length;
  console.log(
    `  ${species.padEnd(12)}: ${speciesPassed}/${speciesTotal} (${((speciesPassed / speciesTotal) * 100).toFixed(1)}%)`
  );
}

// Breakdown by health concern
console.log('\n📊 Results by Health Concern (Single):');
for (const concern of HEALTH_CONCERNS) {
  const concernResults = results.filter(r => r.healthConcerns.length === 1 && r.healthConcerns[0] === concern);
  const concernPassed = concernResults.filter(r => r.success).length;
  const concernTotal = concernResults.length;
  console.log(
    `  ${concern.padEnd(20)}: ${concernPassed}/${concernTotal} (${((concernPassed / concernTotal) * 100).toFixed(1)}%)`
  );
}

// Failed combinations
const failedResults = results.filter(r => !r.success);
if (failedResults.length > 0) {
  console.log('\n⚠️  Failed Combinations:');
  for (const result of failedResults.slice(0, 10)) {
    console.log(`  ${result.species} + ${result.healthConcerns.join(', ')}`);
  }
  if (failedResults.length > 10) {
    console.log(`  ... and ${failedResults.length - 10} more`);
  }
}

console.log('\n' + '='.repeat(80));
