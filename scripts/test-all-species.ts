// Test recipe generation for all species after category fixes
import { RecipeBuilder, GenerationConstraints } from '../lib/generator/RecipeBuilder';

type Species = 'dogs' | 'cats' | 'birds' | 'reptiles' | 'pocket-pets';

async function testSpecies(species: Species) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`TESTING ${species.toUpperCase()}`);
  console.log('='.repeat(80));
  
  const constraints: GenerationConstraints = {
    species,
    lifeStage: 'adult',
    petWeightKg: species === 'dogs' ? 15 : species === 'cats' ? 5 : species === 'birds' ? 0.5 : species === 'reptiles' ? 0.3 : 1,
    healthConcerns: [],
    allergies: [],
  };
  
  try {
    const builder = new RecipeBuilder(constraints, 'standard', 'medium');
    const recipe = await builder.generate();
    
    if (recipe && recipe.ingredients.length > 0) {
      console.log(`✅ SUCCESS - Generated recipe with ${recipe.ingredients.length} ingredients`);
      
      let totalProtein = 0;
      let totalFat = 0;
      let totalGrams = 0;
      
      console.log('\nIngredients:');
      for (const portioned of recipe.ingredients) {
        const ing = portioned.ingredient;
        const protein = (ing.composition.protein || 0) * portioned.grams / 100;
        const fat = (ing.composition.fat || 0) * portioned.grams / 100;
        
        totalProtein += protein;
        totalFat += fat;
        totalGrams += portioned.grams;
        
        console.log(`  - ${ing.name} (${ing.category}): ${portioned.grams}g`);
      }
      
      const proteinPercent = (totalProtein / totalGrams) * 100;
      const fatPercent = (totalFat / totalGrams) * 100;
      
      console.log(`\nNutrition:`);
      console.log(`  Total: ${totalGrams}g`);
      console.log(`  Protein: ${proteinPercent.toFixed(1)}%`);
      console.log(`  Fat: ${fatPercent.toFixed(1)}%`);
      
      // Check against targets
      const targets: Record<Species, number> = {
        dogs: 18,
        cats: 26,
        birds: 18,
        reptiles: 18,
        'pocket-pets': 18,
      };
      
      const target = targets[species];
      if (proteinPercent >= target) {
        console.log(`  ✅ MEETS PROTEIN TARGET (${target}%+)`);
      } else {
        console.log(`  ⚠️  BELOW TARGET (need ${target}%+, got ${proteinPercent.toFixed(1)}%)`);
      }
      
    } else {
      console.log('❌ FAILED - No recipe generated');
    }
  } catch (error) {
    console.log(`❌ ERROR: ${error}`);
  }
}

async function main() {
  const species: Species[] = ['dogs', 'cats', 'birds', 'reptiles', 'pocket-pets'];
  
  for (const sp of species) {
    await testSpecies(sp);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('TEST COMPLETE');
  console.log('='.repeat(80));
}

main().catch(console.error);
