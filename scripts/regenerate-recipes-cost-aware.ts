#!/usr/bin/env node

/**
 * Regenerate all recipes with cost-aware optimization
 * Uses the updated recipe generator that prioritizes cost efficiency
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import recipe generator and templates
import { generateBestRecipeForPet, TEMPLATE_LIBRARY } from '../lib/recipe-generator.js';
import { getIngredientDisplayPricing } from '../lib/data/product-prices.js';

const SPECIES_LIST = ['dogs', 'cats', 'birds', 'reptiles', 'pocket-pets'];
const RECIPES_PER_SPECIES = 50;

async function regenerateRecipes() {
  console.log('🔄 Regenerating recipes with cost-aware optimization...\n');

  const jsonOutputPath = path.join(__dirname, '../lib/data/recipes-complete.json');
  const backupPath = path.join(__dirname, '../lib/data/recipes-complete.backup.json');

  // Backup existing recipes
  if (fs.existsSync(jsonOutputPath)) {
    console.log('📦 Backing up existing recipes...');
    fs.copyFileSync(jsonOutputPath, backupPath);
    console.log(`   ✓ Backed up to: ${backupPath}\n`);
  }

  const allRecipes: any[] = [];
  const stats = {
    total: 0,
    success: 0,
    failed: 0,
    avgCostPerMeal: 0,
    totalCost: 0,
    costCount: 0,
    underBudget: 0,
    overBudget: 0,
  };

  for (const species of SPECIES_LIST) {
    console.log(`📝 Generating ${RECIPES_PER_SPECIES} recipes for ${species}...`);

    const speciesTemplates = TEMPLATE_LIBRARY.filter(t => t.category === species);
    if (speciesTemplates.length === 0) {
      console.log(`   ⚠️ No templates found for ${species}\n`);
      continue;
    }

    for (let i = 0; i < RECIPES_PER_SPECIES; i++) {
      try {
        // Rotate through templates
        const template = speciesTemplates[i % speciesTemplates.length];
        
        // Generate recipe (cost optimization is built in)
        const recipe = generateBestRecipeForPet([template], undefined, i);
        
        if (recipe) {
          // Calculate estimated cost for this recipe
          let estimatedCost = 0;
          for (const ing of recipe.ingredients) {
            const pricing = getIngredientDisplayPricing(ing.name.toLowerCase());
            const price = pricing?.packagePrice;
            if (typeof price === 'number' && Number.isFinite(price) && price > 0) estimatedCost += price;
          }

          // Add cost info to recipe
          const recipeWithCost = {
            ...recipe,
            estimatedCostPerMeal: estimatedCost,
            exceedsBudget: estimatedCost > 4.50,
          };

          allRecipes.push(recipeWithCost);
          stats.success++;
          stats.totalCost += estimatedCost;
          stats.costCount++;

          if (estimatedCost <= 4.50) {
            stats.underBudget++;
          } else {
            stats.overBudget++;
          }
        } else {
          stats.failed++;
        }
      } catch (error) {
        console.error(`   ❌ Error generating recipe ${i + 1}:`, error);
        stats.failed++;
      }

      stats.total++;

      if ((i + 1) % 10 === 0) {
        console.log(`  ✓ ${i + 1}/${RECIPES_PER_SPECIES} recipes`);
      }
    }

    const avgCost = stats.costCount > 0 ? stats.totalCost / stats.costCount : 0;
    console.log(`  ✅ ${species}: ${stats.success} successful`);
    console.log(`     Average cost: $${avgCost.toFixed(2)}/meal`);
    console.log(`     Under budget: ${stats.underBudget}, Over budget: ${stats.overBudget}\n`);
  }

  // Save recipes
  console.log('💾 Saving recipes to recipes-complete.json...');
  fs.writeFileSync(jsonOutputPath, JSON.stringify(allRecipes, null, 2));
  console.log(`✓ Saved ${allRecipes.length} recipes\n`);

  // Print summary
  const avgCostPerMeal = stats.costCount > 0 ? stats.totalCost / stats.costCount : 0;
  console.log('📊 SUMMARY');
  console.log(`   Total recipes: ${stats.total}`);
  console.log(`   Successful: ${stats.success}`);
  console.log(`   Failed: ${stats.failed}`);
  console.log(`   Average cost per meal: $${avgCostPerMeal.toFixed(2)}`);
  console.log(`   Under $4.50 budget: ${stats.underBudget} (${((stats.underBudget / stats.success) * 100).toFixed(1)}%)`);
  console.log(`   Over $4.50 budget: ${stats.overBudget} (${((stats.overBudget / stats.success) * 100).toFixed(1)}%)\n`);

  console.log('✅ Recipe regeneration complete!');
}

regenerateRecipes().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
