// Very detailed debug - manually walk through the RecipeBuilder process
import { getIngredientsForSpecies } from '../data/ingredients';
import type { Ingredient } from '../data/ingredients';

const species = 'birds';
const healthConcerns = ['digestive_issues'];

console.log('=== DETAILED BIRD INGREDIENT DEBUG ===\n');

// Step 1: Get all bird ingredients
const allBirdIngredients = getIngredientsForSpecies(species);
console.log(`Step 1: Total bird ingredients: ${allBirdIngredients.length}\n`);

// Step 2: Check categories
const byCategory: Record<string, Ingredient[]> = {};
allBirdIngredients.forEach(ing => {
  if (!byCategory[ing.category]) byCategory[ing.category] = [];
  byCategory[ing.category].push(ing);
});

console.log('Step 2: Ingredients by category:');
Object.entries(byCategory).forEach(([cat, ings]) => {
  console.log(`  ${cat}: ${ings.length} ingredients`);
});

// Step 3: Check quality scores for seeds/nuts
console.log('\nStep 3: Quality scores for seeds:');
const seeds = byCategory['seed'] || [];
seeds.slice(0, 10).forEach(s => {
  console.log(`  ${s.name}: quality=${s.qualityScore}, feedingRole=${s.feedingRole}`);
});

console.log('\nStep 3b: Quality scores for nuts:');
const nuts = byCategory['nut'] || [];
nuts.slice(0, 10).forEach(n => {
  console.log(`  ${n.name}: quality=${n.qualityScore}, feedingRole=${n.feedingRole}`);
});

// Step 4: Filter by quality tier (standard = qualityScore >= 5)
const qualityTier = 'standard';
const minQuality = qualityTier === 'premium' ? 7 : qualityTier === 'standard' ? 5 : 0;

console.log(`\nStep 4: Filtering by quality tier '${qualityTier}' (min quality: ${minQuality})`);
const afterQualityFilter = allBirdIngredients.filter(ing => ing.qualityScore >= minQuality);
console.log(`  Remaining after quality filter: ${afterQualityFilter.length}`);

const seedsAfterFilter = afterQualityFilter.filter(ing => ing.category === 'seed');
const nutsAfterFilter = afterQualityFilter.filter(ing => ing.category === 'nut');
const insectsAfterFilter = afterQualityFilter.filter(ing => ing.category === 'insect');

console.log(`  Seeds after filter: ${seedsAfterFilter.length}`);
console.log(`  Nuts after filter: ${nutsAfterFilter.length}`);
console.log(`  Insects after filter: ${insectsAfterFilter.length}`);

if (seedsAfterFilter.length === 0) {
  console.log('\n⚠️  WARNING: No seeds passed quality filter!');
  console.log('Seeds that failed:');
  seeds.forEach(s => {
    if (s.qualityScore < minQuality) {
      console.log(`  ❌ ${s.name}: quality=${s.qualityScore} (needs ${minQuality})`);
    }
  });
}

if (nutsAfterFilter.length === 0) {
  console.log('\n⚠️  WARNING: No nuts passed quality filter!');
  console.log('Nuts that failed:');
  nuts.forEach(n => {
    if (n.qualityScore < minQuality) {
      console.log(`  ❌ ${n.name}: quality=${n.qualityScore} (needs ${minQuality})`);
    }
  });
}

// Step 5: Check what would be selected
console.log('\n=== SELECTION SIMULATION ===');
const requiredCategories = ['seed', 'nut', 'fruit', 'vegetable'];
console.log(`Required categories for birds: ${requiredCategories.join(', ')}\n`);

for (const category of requiredCategories) {
  const inCategory = afterQualityFilter.filter(ing => ing.category === category);
  console.log(`${category}: ${inCategory.length} available`);
  if (inCategory.length > 0) {
    console.log(`  Top 3:`);
    inCategory.slice(0, 3).forEach(ing => {
      console.log(`    - ${ing.name} (quality: ${ing.qualityScore})`);
    });
  } else {
    console.log(`  ⚠️  NONE AVAILABLE - THIS WILL CAUSE ISSUES`);
  }
}
