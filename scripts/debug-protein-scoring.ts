// Debug why salmon beats chicken breast for cats
import { getIngredientsForSpecies } from '../lib/data/ingredients';

const catsIngredients = getIngredientsForSpecies('cats');
const proteinIngredients = catsIngredients.filter(ing => ing.category === 'protein');

const chickenBreast = proteinIngredients.find(ing => ing.name === 'chicken breast');
const salmon = proteinIngredients.find(ing => ing.name.toLowerCase().includes('salmon atlantic'));

if (!chickenBreast || !salmon) {
  console.log('Missing ingredients!');
  process.exit(1);
}

console.log('='.repeat(80));
console.log('PROTEIN SCORING COMPARISON');
console.log('='.repeat(80));

// Simulate scoring (from RecipeBuilder)
function scoreNutritional(protein: number | undefined): number {
  let score = 0;
  if (protein) {
    if (protein >= 30) score += 60;
    else if (protein >= 25) score += 50;
    else if (protein >= 20) score += 35;
    else if (protein >= 15) score += 20;
    else if (protein >= 10) score += 10;
    else if (protein >= 5) score += 5;
  }
  return score;
}

function scoreQuality(qualityScore: number): number {
  return qualityScore * 10;
}

// Protein category special weights
const weights = {
  health: 0.25,
  nutritional: 0.55,
  palatability: 0.15,
  quality: 0.05,
};

console.log('\nCHICKEN BREAST:');
console.log(`  Protein: ${chickenBreast.composition.protein}%`);
console.log(`  Quality Score: ${chickenBreast.qualityScore}`);
const cbNutritional = scoreNutritional(chickenBreast.composition.protein);
const cbQuality = scoreQuality(chickenBreast.qualityScore);
console.log(`  Nutritional Score: ${cbNutritional}/100`);
console.log(`  Quality Score: ${cbQuality}/100`);
const cbTotal = cbNutritional * weights.nutritional + cbQuality * weights.quality;
console.log(`  Weighted Total (nutritional + quality only): ${cbTotal.toFixed(1)}`);

console.log('\nSALMON ATLANTIC:');
console.log(`  Protein: ${salmon.composition.protein}%`);
console.log(`  Quality Score: ${salmon.qualityScore}`);
const salmonNutritional = scoreNutritional(salmon.composition.protein);
const salmonQuality = scoreQuality(salmon.qualityScore);
console.log(`  Nutritional Score: ${salmonNutritional}/100`);
console.log(`  Quality Score: ${salmonQuality}/100`);
const salmonTotal = salmonNutritional * weights.nutritional + salmonQuality * weights.quality;
console.log(`  Weighted Total (nutritional + quality only): ${salmonTotal.toFixed(1)}`);

console.log('\n' + '='.repeat(80));
console.log('WINNER:');
if (cbTotal > salmonTotal) {
  console.log(`✅ Chicken Breast wins by ${(cbTotal - salmonTotal).toFixed(1)} points`);
} else {
  console.log(`❌ Salmon wins by ${(salmonTotal - cbTotal).toFixed(1)} points`);
}
console.log('='.repeat(80));

// Check omega-3 bonus
console.log('\nOMEGA-3 CHECK:');
console.log(`  Chicken Breast omega-3: ${chickenBreast.composition.omega3 || 0}`);
console.log(`  Salmon omega-3: ${salmon.composition.omega3 || 0}`);

if (salmon.composition.omega3 && salmon.composition.omega3 > 1) {
  console.log(`  ⚠️  Salmon gets +20 points for omega-3!`);
  const salmonWithOmega = salmonTotal + (20 * weights.nutritional);
  console.log(`  Salmon new total: ${salmonWithOmega.toFixed(1)}`);
  if (salmonWithOmega > cbTotal) {
    console.log(`  ❌ Salmon NOW wins by ${(salmonWithOmega - cbTotal).toFixed(1)} points`);
  }
}
