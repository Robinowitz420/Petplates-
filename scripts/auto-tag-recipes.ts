// scripts/auto-tag-recipes.ts
// Enhanced auto-tagging script for all health concerns including new ones

import * as fs from 'fs';
import * as path from 'path';
import { recipes } from '../lib/data/recipes-complete';

interface Recipe {
  id: string;
  name: string;
  ingredients: Array<{ name: string; amount?: string }>;
  category?: string;
  healthConcerns?: string[];
  notSuitableFor?: string[];
  [key: string]: any;
}

// Enhanced tagging function with comprehensive health concern detection
function autoTagRecipe(recipe: Recipe): { healthConcerns: string[]; notSuitableFor: string[] } {
  const name = recipe.name.toLowerCase();
  const ingredients = recipe.ingredients
    ?.map((i) => (typeof i === 'string' ? i : i.name || '').toLowerCase())
    .join(' ') || '';
  
  const allText = `${name} ${ingredients}`;
  const category = recipe.category?.toLowerCase() || '';

  const healthConcerns: string[] = [];
  const notSuitableFor: string[] = [];

  // DIGESTIVE ISSUES - Bland, easily digestible
  if (
    (allText.includes('chicken') && allText.includes('rice')) ||
    allText.includes('pumpkin') ||
    allText.includes('bone broth') ||
    name.includes('bland') ||
    name.includes('sensitive') ||
    name.includes('digestive')
  ) {
    healthConcerns.push('digestive-issues');
  }

  // JOINT HEALTH - Omega-3 rich
  if (
    allText.includes('salmon') ||
    allText.includes('fish oil') ||
    allText.includes('omega') ||
    allText.includes('sardine') ||
    allText.includes('mackerel') ||
    name.includes('joint') ||
    name.includes('arthritis')
  ) {
    healthConcerns.push('joint-health');
  }

  // KIDNEY DISEASE - Avoid high phosphorus
  if (
    allText.includes('liver') ||
    allText.includes('kidney') ||
    allText.includes('organ meat') ||
    allText.includes('organ') ||
    (allText.includes('beef') && allText.includes('liver'))
  ) {
    notSuitableFor.push('kidney-disease');
  } else if (
    allText.includes('white fish') ||
    allText.includes('egg white') ||
    allText.includes('low-sodium') ||
    (allText.includes('chicken') && !allText.includes('liver'))
  ) {
    // Good for kidney disease
    healthConcerns.push('kidney-disease');
  }

  // WEIGHT MANAGEMENT / OBESITY - Low calorie, lean
  if (
    allText.includes('lean') ||
    allText.includes('low-fat') ||
    allText.includes('low-calorie') ||
    allText.includes('diet') ||
    name.includes('weight') ||
    name.includes('slim') ||
    name.includes('lean') ||
    (allText.includes('turkey') && allText.includes('lean')) ||
    allText.includes('green beans') ||
    allText.includes('cauliflower')
  ) {
    healthConcerns.push('weight-management');
  }

  // PANCREATITIS - Ultra low fat, easily digestible
  const hasHighFat = 
    allText.includes('salmon') ||
    allText.includes('pork') ||
    allText.includes('lamb') ||
    allText.includes('duck') ||
    allText.includes('fatty') ||
    allText.includes('oil') ||
    allText.includes('beef') && !allText.includes('lean');
  
  if (hasHighFat) {
    notSuitableFor.push('pancreatitis');
  } else if (
    allText.includes('lean') ||
    allText.includes('low-fat') ||
    allText.includes('white fish') ||
    allText.includes('turkey breast') ||
    allText.includes('chicken breast') ||
    (allText.includes('chicken') && !allText.includes('thigh'))
  ) {
    healthConcerns.push('pancreatitis');
  }

  // HEART DISEASE - Low sodium, taurine-rich
  if (
    allText.includes('low-sodium') ||
    allText.includes('taurine') ||
    allText.includes('heart') ||
    name.includes('heart') ||
    (allText.includes('chicken') && allText.includes('breast')) ||
    (allText.includes('turkey') && allText.includes('breast'))
  ) {
    healthConcerns.push('heart-disease');
  } else if (
    allText.includes('high-sodium') ||
    allText.includes('processed') ||
    allText.includes('sodium') && !allText.includes('low-sodium')
  ) {
    notSuitableFor.push('heart-disease');
  }

  // DIABETES - Low glycemic, high protein, complex carbs
  const hasSimpleCarbs = 
    allText.includes('white rice') ||
    allText.includes('corn syrup') ||
    allText.includes('sugar') ||
    allText.includes('honey');
  
  if (hasSimpleCarbs) {
    notSuitableFor.push('diabetes');
  } else if (
    allText.includes('complex') ||
    allText.includes('high-fiber') ||
    allText.includes('low-glycemic') ||
    (allText.includes('sweet potato') && !allText.includes('white rice')) ||
    allText.includes('quinoa') ||
    allText.includes('brown rice') ||
    name.includes('diabetic') ||
    name.includes('diabetes')
  ) {
    healthConcerns.push('diabetes');
  }

  // SKIN CONDITIONS - Omega-3, quality protein, vitamin E
  if (
    allText.includes('salmon') ||
    allText.includes('fish oil') ||
    allText.includes('omega') ||
    allText.includes('sardine') ||
    allText.includes('vitamin e') ||
    allText.includes('zinc') ||
    (allText.includes('quality') && allText.includes('protein')) ||
    name.includes('skin') ||
    name.includes('coat')
  ) {
    healthConcerns.push('skin-conditions');
  } else if (
    allText.includes('artificial') ||
    allText.includes('preservatives') ||
    allText.includes('color')
  ) {
    notSuitableFor.push('skin-conditions');
  }

  // ALLERGIES - Novel proteins
  if (
    allText.includes('rabbit') ||
    allText.includes('duck') ||
    allText.includes('venison') ||
    allText.includes('bison') ||
    allText.includes('kangaroo') ||
    allText.includes('novel') ||
    name.includes('hypoallergenic') ||
    name.includes('allergy')
  ) {
    healthConcerns.push('allergies');
  } else if (
    allText.includes('chicken') && allText.includes('beef') ||
    allText.includes('dairy') ||
    allText.includes('wheat') ||
    allText.includes('corn') ||
    allText.includes('soy')
  ) {
    // Common allergens - mark as not suitable if recipe contains multiple
    const allergenCount = [
      allText.includes('chicken'),
      allText.includes('beef'),
      allText.includes('dairy'),
      allText.includes('wheat'),
      allText.includes('corn'),
      allText.includes('soy')
    ].filter(Boolean).length;
    
    if (allergenCount >= 2) {
      notSuitableFor.push('allergies');
    }
  }

  // DENTAL ISSUES - Soft foods
  if (
    allText.includes('stew') ||
    allText.includes('soft') ||
    allText.includes('wet') ||
    allText.includes('puree') ||
    name.includes('senior') ||
    name.includes('dental') ||
    name.includes('soft')
  ) {
    healthConcerns.push('dental-issues');
  }

  // URINARY HEALTH - High moisture, low phosphorus
  if (
    allText.includes('bone broth') ||
    allText.includes('cranberry') ||
    allText.includes('moisture') ||
    allText.includes('hydration') ||
    name.includes('urinary')
  ) {
    healthConcerns.push('urinary-health');
  }

  // Remove duplicates
  const uniqueHealthConcerns = [...new Set(healthConcerns)];
  const uniqueNotSuitable = [...new Set(notSuitableFor)];

  return {
    healthConcerns: uniqueHealthConcerns,
    notSuitableFor: uniqueNotSuitable
  };
}

// Main function
async function main() {
  console.log('🏷️  Enhanced Auto-Tagging Recipes...\n');

  const recipesPath = path.join(process.cwd(), 'lib', 'data', 'recipes-complete.ts');
  const backupPath = recipesPath.replace('.ts', '.backup.ts');
  
  // Create backup
  if (fs.existsSync(recipesPath)) {
    fs.copyFileSync(recipesPath, backupPath);
    console.log('✅ Backup created:', backupPath);
  }

  console.log('📝 Analyzing and tagging recipes...\n');

  const tagStats: Record<string, number> = {};
  const notSuitableStats: Record<string, number> = {};
  let taggedCount = 0;
  let updatedCount = 0;

  // Process each recipe
  const updatedRecipes = recipes.map((recipe: Recipe) => {
    const tags = autoTagRecipe(recipe);
    
    // Only update if we found tags
    if (tags.healthConcerns.length > 0 || tags.notSuitableFor.length > 0) {
      taggedCount++;
      
      // Merge with existing tags
      const existingHealthConcerns = recipe.healthConcerns || [];
      const existingNotSuitable = recipe.notSuitableFor || [];
      
      const mergedHealthConcerns = [...new Set([...existingHealthConcerns, ...tags.healthConcerns])];
      const mergedNotSuitable = [...new Set([...existingNotSuitable, ...tags.notSuitableFor])];
      
      // Count tags
      tags.healthConcerns.forEach(tag => {
        tagStats[tag] = (tagStats[tag] || 0) + 1;
      });
      tags.notSuitableFor.forEach(tag => {
        notSuitableStats[tag] = (notSuitableStats[tag] || 0) + 1;
      });
      
      // Log if new tags were added
      const hasNewTags = 
        mergedHealthConcerns.length > existingHealthConcerns.length ||
        mergedNotSuitable.length > existingNotSuitable.length;
      
      if (hasNewTags) {
        updatedCount++;
        console.log(`✓ ${recipe.name}`);
        if (tags.healthConcerns.length > 0) {
          console.log(`  + Health: ${tags.healthConcerns.join(', ')}`);
        }
        if (tags.notSuitableFor.length > 0) {
          console.log(`  - Avoid: ${tags.notSuitableFor.join(', ')}`);
        }
        console.log('');
      }
      
      return {
        ...recipe,
        healthConcerns: mergedHealthConcerns,
        notSuitableFor: mergedNotSuitable
      };
    }
    
    return recipe;
  });

  // Write updated recipes to file
  const output = `// lib/data/recipes-complete.ts
// Auto-generated comprehensive recipe database
// Auto-tagged on: ${new Date().toISOString()}
// Total recipes: ${updatedRecipes.length}

import type { Recipe } from '../types';

export const recipes: Recipe[] = ${JSON.stringify(updatedRecipes, null, 2)};
`;

  fs.writeFileSync(recipesPath, output, 'utf8');

  console.log('\n🎉 Tagging Complete!\n');
  console.log(`📊 Statistics:`);
  console.log(`   Total recipes processed: ${recipes.length}`);
  console.log(`   Recipes with tags: ${taggedCount}`);
  console.log(`   Recipes updated: ${updatedCount}`);
  console.log(`\n   Health Concern Tags:`);
  Object.entries(tagStats)
    .sort(([, a], [, b]) => b - a)
    .forEach(([tag, count]) => {
      console.log(`   + ${tag}: ${count} recipes`);
    });
  
  if (Object.keys(notSuitableStats).length > 0) {
    console.log(`\n   Not Suitable For:`);
    Object.entries(notSuitableStats)
      .sort(([, a], [, b]) => b - a)
      .forEach(([tag, count]) => {
        console.log(`   - ${tag}: ${count} recipes`);
      });
  }

  console.log('\n✅ File updated: lib/data/recipes-complete.ts');
  console.log('🔄 Restart your dev server to see changes');
}

main().catch(console.error);
