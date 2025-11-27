// scripts/auto-tag-recipes.ts
// Run once to auto-tag all recipes with health benefits

import * as fs from 'fs';
import * as path from 'path';

// Simple rule-based tagging (no AI API needed!)
function autoTagRecipe(recipe: any): any {
  const name = recipe.name.toLowerCase();
  const ingredients = recipe.ingredients
    ?.map((i: any) => (typeof i === 'string' ? i : i.name).toLowerCase())
    .join(' ') || '';

  const allText = `${name} ${ingredients}`;

  const healthConcerns: string[] = [];
  const notSuitableFor: string[] = [];

  // DIGESTIVE HEALTH - Chicken + Rice = gold standard
  if ((allText.includes('chicken') && allText.includes('rice')) ||
      allText.includes('pumpkin') ||
      name.includes('bland') ||
      name.includes('sensitive')) {
    healthConcerns.push('digestive-issues');
  }

  // JOINT HEALTH - Fish/Salmon = omega-3
  if (allText.includes('salmon') ||
      allText.includes('fish oil') ||
      allText.includes('omega')) {
    healthConcerns.push('joint-health');
  }

  // KIDNEY DISEASE - Avoid organ meats (high phosphorus)
  if (allText.includes('liver') ||
      allText.includes('kidney') ||
      allText.includes('organ')) {
    notSuitableFor.push('kidney-disease');
  }

  // WEIGHT MANAGEMENT - Lean proteins, low-fat
  if ((allText.includes('turkey') && allText.includes('lean')) ||
      allText.includes('low-fat') ||
      allText.includes('diet') ||
      name.includes('weight')) {
    healthConcerns.push('obesity');
  }

  // PANCREATITIS - Very low fat only
  if ((allText.includes('lean') || allText.includes('low-fat')) &&
      !allText.includes('salmon') && // Salmon too fatty
      !allText.includes('beef')) {    // Beef often too fatty
    healthConcerns.push('pancreatitis');
  } else if (allText.includes('salmon') ||
             allText.includes('fatty') ||
             allText.includes('oil')) {
    notSuitableFor.push('pancreatitis');
  }

  // ALLERGIES - Novel proteins
  if (allText.includes('rabbit') ||
      allText.includes('duck') ||
      allText.includes('venison') ||
      allText.includes('bison') ||
      name.includes('novel')) {
    healthConcerns.push('allergies');
  }

  // DENTAL - Soft foods
  if (allText.includes('stew') ||
      allText.includes('soft') ||
      name.includes('senior') ||
      name.includes('wet')) {
    healthConcerns.push('dental-issues');
  }

  // HEART DISEASE - Low sodium needed
  if (allText.includes('low-sodium') ||
      name.includes('heart')) {
    healthConcerns.push('heart-disease');
  }

  // SKIN CONDITIONS - Omega-3 rich
  if (allText.includes('salmon') ||
      allText.includes('fish oil')) {
    healthConcerns.push('skin-conditions');
  }

  // Remove duplicates
  const uniqueHealthConcerns = [...new Set(healthConcerns)];
  const uniqueNotSuitable = [...new Set(notSuitableFor)];

  return {
    ...recipe,
    healthConcerns: uniqueHealthConcerns,
    notSuitableFor: uniqueNotSuitable
  };
}

// Main function
async function main() {
  console.log('🏷️  Auto-Tagging Recipes...\n');

  // Read the recipes file
  const recipesPath = path.join(process.cwd(), 'lib', 'data', 'recipes-complete.ts');
  let recipesContent = fs.readFileSync(recipesPath, 'utf8');

  console.log('✅ Found recipes file');
  console.log('📝 Analyzing ingredients and tagging...\n');

  // Count tags added
  let taggedCount = 0;
  const tagStats: Record<string, number> = {};

  // Find recipe objects in the array and add health concerns
  // Look for patterns like: "name": "Recipe Name",
  recipesContent = recipesContent.replace(
    /\{\s*"id":\s*"[^"]+",[\s\S]*?"name":\s*"([^"]+)",([\s\S]*?)\}/g,
    (match, recipeName, recipeContent) => {
      const ingredients = match.toLowerCase();

      const healthConcerns: string[] = [];
      const notSuitableFor: string[] = [];

      // Apply same tagging logic
      if ((ingredients.includes('chicken') && ingredients.includes('rice')) ||
          ingredients.includes('pumpkin')) {
        healthConcerns.push('digestive-issues');
      }

      if (ingredients.includes('salmon') || ingredients.includes('fish oil')) {
        healthConcerns.push('joint-health', 'skin-conditions');
      }

      if (ingredients.includes('liver') || ingredients.includes('kidney')) {
        notSuitableFor.push('kidney-disease');
      }

      if (ingredients.includes('lean') || ingredients.includes('low-fat')) {
        healthConcerns.push('obesity');
      }

      if (ingredients.includes('rabbit') || ingredients.includes('duck')) {
        healthConcerns.push('allergies');
      }

      // Log
      if (healthConcerns.length > 0 || notSuitableFor.length > 0) {
        console.log(`✓ ${recipeName}`);
        if (healthConcerns.length > 0) {
          console.log(`  + Health: ${healthConcerns.join(', ')}`);
          healthConcerns.forEach(tag => {
            tagStats[tag] = (tagStats[tag] || 0) + 1;
          });
        }
        if (notSuitableFor.length > 0) {
          console.log(`  - Avoid: ${notSuitableFor.join(', ')}`);
        }
        console.log('');
        taggedCount++;
      }

      // Add health concerns before the closing brace
      let modifiedMatch = match;
      if (healthConcerns.length > 0 && !match.includes('healthConcerns')) {
        const healthStr = `,\n    "healthConcerns": [${healthConcerns.map(h => `"${h}"`).join(', ')}]`;
        modifiedMatch = modifiedMatch.replace(/(\s*)"rating":\s*\d+,\s*"reviews":\s*\d+\s*\}/, `$1"rating": 0,$1"reviews": 0${healthStr}\n  }`);
      }

      if (notSuitableFor.length > 0 && !match.includes('notSuitableFor')) {
        const notStr = `,\n    "notSuitableFor": [${notSuitableFor.map(n => `"${n}"`).join(', ')}]`;
        modifiedMatch = modifiedMatch.replace(/(\s*)"rating":\s*\d+,\s*"reviews":\s*\d+\s*\}/, `$1"rating": 0,$1"reviews": 0${notStr}\n  }`);
      }

      return modifiedMatch;
    }
  );

  // Write back to file
  fs.writeFileSync(recipesPath, recipesContent, 'utf8');

  console.log('\n🎉 Tagging Complete!\n');
  console.log(`📊 Statistics:`);
  console.log(`   Total recipes tagged: ${taggedCount}`);
  console.log(`\n   Tags added:`);
  Object.entries(tagStats)
    .sort(([, a], [, b]) => b - a)
    .forEach(([tag, count]) => {
      console.log(`   - ${tag}: ${count} recipes`);
    });

  console.log('\n✅ File updated: lib/data/recipes-complete.ts');
  console.log('🔄 Restart your dev server to see changes');
}

main().catch(console.error);