// scripts/diagnose-scoring.ts
// Diagnostic script to identify exact scoring bottlenecks for perfect pets

import type { Recipe } from '../lib/types';
import { scoreWithSpeciesEngine, type SpeciesScoringPet } from '../lib/utils/speciesScoringEngines';
import { recipes } from '../lib/data/recipes-complete';

async function diagnoseScoring() {
  const perfectDog: SpeciesScoringPet = {
    id: 'test-perfect-dog',
    name: 'Test Dog',
    type: 'dog',
    breed: 'golden-retriever',
    age: 3,
    weight: 15,
    activityLevel: 'moderate',
    healthConcerns: [],
    dietaryRestrictions: [],
    allergies: []
  };
  
  console.log('=== SCORING DIAGNOSIS ===\n');
  
  const scores = recipes
    .filter((r: Recipe) => r.category === 'dogs')
    .map((recipe: Recipe) => {
      try {
        const result = scoreWithSpeciesEngine(recipe, perfectDog);
        return { recipe, result };
      } catch (error) {
        console.error(`Error scoring recipe ${recipe.name}:`, error);
        return null;
      }
    })
    .filter((item): item is { recipe: Recipe; result: ReturnType<typeof scoreWithSpeciesEngine> } => item !== null)
    .sort((a, b) => b.result.overallScore - a.result.overallScore);
  
  // Top 10 scores
  console.log('Top 10 Scores:');
  scores.slice(0, 10).forEach(({ recipe, result }, i: number) => {
    console.log(`\n${i + 1}. ${recipe.name}: ${result.overallScore}%`);
    console.log('   Factors:');
    Object.entries(result.factors).forEach(([key, score]) => {
      const s = typeof score === 'number' ? score : 0;
      const status = s < 100 ? '⚠️' : '✅';
      console.log(`     ${status} ${key}: ${s}%`);
    });

    if (result.warnings.length > 0) {
      console.log(`   Warnings: ${result.warnings.slice(0, 3).join(' | ')}`);
    }
  });
  
  const maxScore = scores.length > 0 ? scores[0].result.overallScore : 0;
  console.log(`\n=== MAX SCORE: ${maxScore}% ===`);
  
  if (maxScore < 95) {
    console.error('\n❌ PROBLEM: No recipes can score above 95% for perfect pet!');
    console.log('\nBottlenecks preventing 100%:');
    if (scores.length > 0) {
      const topRecipe = scores[0];
      Object.entries(topRecipe.result.factors).forEach(([key, score]) => {
        const s = typeof score === 'number' ? score : 0;
        if (s < 100) {
          console.log(`  - ${key}: ${s}%`);
        }
      });

      if (topRecipe.result.warnings.length > 0) {
        console.log(`\nWarnings: ${topRecipe.result.warnings.join(' | ')}`);
      }
    }
  } else {
    console.log('\n✅ SUCCESS: Found recipes scoring 95%+ for perfect pet');
  }
}

diagnoseScoring().catch(console.error);

