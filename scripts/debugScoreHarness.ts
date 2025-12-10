/**
 * Debug Score Harness for Recipe Generator
 */

console.log('Debug harness file loaded');

import { scoreRecipeImproved } from '../lib/scoreRecipe';
import { computeFinalGenerationScore, generateRecipe, getRecipeTemplates, type GeneratedRecipe } from '../lib/recipe-generator';
import { getRecentIngredients } from '../lib/utils/diversityTracker';
import type { Pet, Recipe } from '../lib/types';

function divider(label: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${label}`);
  console.log('='.repeat(60));
}

function colorLog(message: string, color: 'green' | 'yellow' | 'red' | 'blue' | 'cyan' = 'cyan') {
  const colors = {
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
  };
  console.log(`${colors[color]}${message}${colors.reset}`);
}

export function debugRecipeScore(pet: Pet, recipe: Recipe | GeneratedRecipe) {
  divider('Score Debug');

  // Convert recipe to proper format
  const recipeForScoring: Recipe = {
    ...recipe,
    id: recipe.id || (recipe as GeneratedRecipe).templateId || 'debug-recipe',
  };

  colorLog(`Recipe: ${recipe.name}`, 'cyan');
  const ingredientNames = (recipe.ingredients || []).map(i => i.name || String(i)).join(', ');
  colorLog(`Ingredients: ${ingredientNames || 'None'}`, 'blue');

  // Get UI score (what users see)
  const uiScoreResult = scoreRecipeImproved(recipeForScoring, pet);
  const uiScore = uiScoreResult.matchScore;

  // Get Generator score (what generator uses for ranking)
  const recentIngredients = pet.id ? getRecentIngredients(pet.id, 7) : [];
  
  // Ensure recipe has required GeneratedRecipe properties
  const generatedRecipe: GeneratedRecipe = {
    ...recipe,
    templateId: (recipe as GeneratedRecipe).templateId || recipe.id || 'debug-recipe',
    generationTimestamp: (recipe as GeneratedRecipe).generationTimestamp || new Date(),
    nutritionalCalculation: (recipe as GeneratedRecipe).nutritionalCalculation || {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      fiber: 0,
      moisture: 0,
    },
    ingredientBreakdown: (recipe as GeneratedRecipe).ingredientBreakdown || [],
    ingredients: recipe.ingredients || [],
  };
  
  const genResult = computeFinalGenerationScore(
    generatedRecipe,
    pet,
    recentIngredients
  );
  const generatorScore = genResult.score;

  const difference = generatorScore - uiScore;
  const isConsistent = Math.abs(difference) <= 15;

  divider('Score Comparison');

  colorLog(`UI Compatibility Score: ${uiScore.toFixed(1)}`, uiScore >= 80 ? 'green' : uiScore >= 60 ? 'yellow' : 'red');
  colorLog(`Generator Final Score: ${generatorScore.toFixed(1)}`, generatorScore >= 80 ? 'green' : generatorScore >= 60 ? 'yellow' : 'red');
  
  if (Math.abs(difference) > 15) {
    colorLog(`Difference: ${difference > 0 ? '+' : ''}${difference.toFixed(1)} ⚠️ LARGE DRIFT`, 'red');
  } else if (Math.abs(difference) > 10) {
    colorLog(`Difference: ${difference > 0 ? '+' : ''}${difference.toFixed(1)} ⚠️ Moderate drift`, 'yellow');
  } else {
    colorLog(`Difference: ${difference > 0 ? '+' : ''}${difference.toFixed(1)} ✓ Within tolerance`, 'green');
  }

  divider('Modifier Breakdown');

  // Parse explain array to extract modifier values
  const modifiers = {
    synergyBonus: 0,
    conditionBias: 0,
    nutrientAdjustment: 0,
    diversityPenalty: 0,
  };

  genResult.explain.forEach(explanation => {
    if (explanation.includes('Synergy bonus')) {
      const match = explanation.match(/\+?([\d.]+)/);
      if (match) modifiers.synergyBonus = parseFloat(match[1]);
    } else if (explanation.includes('Condition bias')) {
      const match = explanation.match(/([+-]?[\d.]+)/);
      if (match) modifiers.conditionBias = parseFloat(match[1]);
    } else if (explanation.includes('Nutrient adjustment')) {
      const match = explanation.match(/([+-]?[\d.]+)/);
      if (match) modifiers.nutrientAdjustment = parseFloat(match[1]);
    } else if (explanation.includes('Diversity overlap')) {
      const match = explanation.match(/([\d.]+)/);
      if (match) modifiers.diversityPenalty = parseFloat(match[1]);
    }
  });

  colorLog(`Synergy Bonus: ${modifiers.synergyBonus > 0 ? '+' : ''}${modifiers.synergyBonus.toFixed(1)}`, modifiers.synergyBonus > 0 ? 'green' : 'cyan');
  colorLog(`Condition Bias: ${modifiers.conditionBias > 0 ? '+' : ''}${modifiers.conditionBias.toFixed(1)}`, modifiers.conditionBias > 0 ? 'green' : modifiers.conditionBias < 0 ? 'yellow' : 'cyan');
  colorLog(`Nutrient Adjustment: ${modifiers.nutrientAdjustment > 0 ? '+' : ''}${modifiers.nutrientAdjustment.toFixed(1)}`, modifiers.nutrientAdjustment > 0 ? 'green' : modifiers.nutrientAdjustment < 0 ? 'yellow' : 'cyan');
  colorLog(`Diversity Penalty: -${modifiers.diversityPenalty.toFixed(1)}`, modifiers.diversityPenalty > 0 ? 'yellow' : 'cyan');

  divider('UI Score Details');

  colorLog(`Stars: ${uiScoreResult.stars}`, 'cyan');
  colorLog(`Good Matches: ${uiScoreResult.reasoning.goodMatches.length}`, 'green');
  colorLog(`Conflicts: ${uiScoreResult.reasoning.conflicts.length}`, uiScoreResult.reasoning.conflicts.length > 0 ? 'yellow' : 'green');
  
  if (uiScoreResult.reasoning.goodMatches.length > 0) {
    console.log('\n  Good Matches:');
    uiScoreResult.reasoning.goodMatches.forEach(match => {
      colorLog(`    ✓ ${match}`, 'green');
    });
  }
  
  if (uiScoreResult.reasoning.conflicts.length > 0) {
    console.log('\n  Conflicts:');
    uiScoreResult.reasoning.conflicts.forEach(conflict => {
      colorLog(`    ⚠ ${conflict}`, 'yellow');
    });
  }

  divider('Pet Context');

  console.log(`Pet: ${pet.name || 'Unnamed'}`);
  console.log(`Species: ${pet.type}`);
  console.log(`Breed: ${pet.breed || 'Unknown'}`);
  console.log(`Age: ${pet.age || 'Unknown'}`);
  console.log(`Health Concerns: ${(pet.healthConcerns || []).join(', ') || 'None'}`);
  console.log(`Allergies: ${(pet.allergies || []).join(', ') || 'None'}`);
  console.log(`Recent Ingredients (last 7 days): ${recentIngredients.length > 0 ? recentIngredients.join(', ') : 'None'}`);

  divider('Summary');

  if (isConsistent) {
    colorLog('✅ SCORES ARE CONSISTENT', 'green');
    colorLog('Generator and UI scoring are aligned within acceptable tolerance.', 'green');
  } else {
    colorLog('❌ SCORE DRIFT DETECTED', 'red');
    colorLog('Generator and UI scoring show significant divergence.', 'red');
    colorLog('This may indicate:', 'yellow');
    colorLog('  - Modifiers are too large', 'yellow');
    colorLog('  - Base score calculation differs', 'yellow');
    colorLog('  - Missing normalization', 'yellow');
  }

  return {
    recipeName: recipe.name,
    uiScore,
    generatorScore,
    difference,
    modifiers,
    explain: genResult.explain,
    isConsistent,
  };
}

// Run when executed directly
(async () => {
  try {
    console.log('Starting debug harness...');
    
    const testPet: Pet = {
      id: 'test-pet-1',
      name: 'Buddy',
      type: 'dogs',
      breed: 'Golden Retriever',
      age: '5',
      weightKg: 30,
      healthConcerns: ['joint-health', 'weight-management'],
      allergies: [],
      activityLevel: 'moderate',
      names: ['Buddy'],
    };

    const templates = getRecipeTemplates('dogs');
    console.log(`Templates available: ${templates.length}`);
    
    // Generate a test recipe
    const template = templates[0];
    if (template) {
      console.log(`Found template: ${template.name}\n`);
      const generatedRecipe = generateRecipe({ template, pet: testPet });
      debugRecipeScore(testPet, generatedRecipe);
    } else {
      console.error('No dog template found for testing');
    }
  } catch (error) {
    console.error('Error running debug harness:', error);
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
})();