// scripts/diagnose-scoring.ts
// Diagnostic script to identify exact scoring bottlenecks for perfect pets

import { calculateEnhancedCompatibility, type Pet } from '@/lib/utils/enhancedCompatibilityScoring';
import { recipes } from '@/lib/data/recipes-complete';

async function diagnoseScoring() {
  const perfectDog: Pet = {
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
    .filter(r => r.category === 'dogs')
    .map(recipe => {
      try {
        const result = calculateEnhancedCompatibility(recipe, perfectDog);
        return { recipe, result };
      } catch (error) {
        console.error(`Error scoring recipe ${recipe.name}:`, error);
        return null;
      }
    })
    .filter((item): item is { recipe: typeof recipes[0]; result: ReturnType<typeof calculateEnhancedCompatibility> } => item !== null)
    .sort((a, b) => b.result.overallScore - a.result.overallScore);
  
  // Top 10 scores
  console.log('Top 10 Scores:');
  scores.slice(0, 10).forEach(({ recipe, result }, i) => {
    console.log(`\n${i + 1}. ${recipe.name}: ${result.overallScore}%`);
    console.log('   Factors:');
    Object.entries(result.factors).forEach(([key, factor]) => {
      const contribution = factor.score * (factor.weight || 0);
      const status = factor.score < 100 ? '⚠️' : '✅';
      console.log(`     ${status} ${key}: ${factor.score}% (weight: ${((factor.weight || 0) * 100).toFixed(1)}%, contributes: ${contribution.toFixed(1)}%)`);
      if (factor.score < 100 && factor.issues.length > 0) {
        console.log(`        Issues: ${factor.issues.slice(0, 2).join(', ')}`);
      }
    });
  });
  
  const maxScore = scores.length > 0 ? scores[0].result.overallScore : 0;
  console.log(`\n=== MAX SCORE: ${maxScore}% ===`);
  
  if (maxScore < 95) {
    console.error('\n❌ PROBLEM: No recipes can score above 95% for perfect pet!');
    console.log('\nBottlenecks preventing 100%:');
    if (scores.length > 0) {
      const topRecipe = scores[0];
      Object.entries(topRecipe.result.factors).forEach(([key, factor]) => {
        if (factor.score < 100) {
          console.log(`  - ${key}: ${factor.score}% (${factor.reasoning})`);
        }
      });
    }
  } else {
    console.log('\n✅ SUCCESS: Found recipes scoring 95%+ for perfect pet');
  }
}

diagnoseScoring().catch(console.error);

