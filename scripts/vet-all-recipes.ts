// scripts/vet-all-recipes.ts
import fs from 'fs';
import path from 'path';
import { recipes } from '../lib/data/recipes-complete';
import { getVettedProduct } from '../lib/data/vetted-products';

interface VettingStats {
  totalIngredients: number;
  vettedCount: number;
  notVettedCount: number;
  genericCount: number;
  needsVetting: string[];
}

// Ingredients that don't need specific product links (generic produce/staples)
const GENERIC_INGREDIENTS = [
  'water', 'salt', 'eggs', 'carrots', 'celery', 'spinach', 'kale',
  'blueberries', 'apples', 'sweet potato', 'pumpkin', 'broccoli',
  'cauliflower', 'green beans', 'peas', 'rice', 'oats', 'quinoa',
  'brown rice', 'white rice', 'bananas', 'strawberries', 'egg'
];

function isGenericIngredient(name: string): boolean {
  const normalized = name.toLowerCase().trim();
  return GENERIC_INGREDIENTS.some(generic => 
    normalized === generic || 
    normalized.includes(generic) || 
    generic.includes(normalized)
  );
}

// Helper function to convert recipe.category to species string for getVettedProduct
function getSpeciesFromRecipeCategory(category?: string): string | undefined {
  if (!category) return undefined;
  // recipe.category is like 'dogs', 'cats', 'birds', 'reptiles', 'pocket-pets'
  // This matches the species parameter format
  return category;
}

function vetRecipe(recipe: any) {
  // Derive species from recipe category
  const species = getSpeciesFromRecipeCategory(recipe.category);
  
  const updatedIngredients = recipe.ingredients.map((ing: any) => {
    const ingName = ing.name || '';
    
    // Check if it's a generic ingredient (no product link needed)
    if (isGenericIngredient(ingName)) {
      return {
        ...ing,
        amazonLink: undefined, // Remove generic search links
        isGeneric: true
      };
    }

    // Try to get vetted product (pass species for species-aware matching)
    const vetted = getVettedProduct(ingName, species);
    
    if (vetted) {
      return {
        ...ing,
        name: ingName, // Keep original name for recipe
        productName: vetted.productName, // Add product name
        asinLink: vetted.asinLink, // Use vetted link
        vetNote: vetted.vetNote,
        isVetted: true
      };
    }

    // No vetted product found - remove link
    return {
      ...ing,
      amazonLink: undefined, // Remove generic search links
      isVetted: false
    };
  });

  return {
    ...recipe,
    ingredients: updatedIngredients
  };
}

function generateStats(updatedRecipes: any[]): VettingStats {
  const stats: VettingStats = {
    totalIngredients: 0,
    vettedCount: 0,
    notVettedCount: 0,
    genericCount: 0,
    needsVetting: []
  };

  const ingredientSet = new Set<string>();

  updatedRecipes.forEach(recipe => {
    recipe.ingredients.forEach((ing: any) => {
      stats.totalIngredients++;
      const ingName = (ing.name || '').toLowerCase();
      
      if (!ingredientSet.has(ingName)) {
        ingredientSet.add(ingName);
      }

      if (ing.isGeneric) {
        stats.genericCount++;
      } else if (ing.isVetted) {
        stats.vettedCount++;
      } else {
        stats.notVettedCount++;
        if (!stats.needsVetting.includes(ing.name)) {
          stats.needsVetting.push(ing.name);
        }
      }
    });
  });

  return stats;
}

async function main() {
  console.log('🔍 Starting recipe vetting process...\n');

  // Vet all recipes
  const updatedRecipes = recipes.map(recipe => vetRecipe(recipe));

  // Generate stats
  const stats = generateStats(updatedRecipes);

  // Generate updated recipes file
  const output = `// lib/data/recipes-complete.ts
// Auto-generated comprehensive recipe database
// Vetted on: ${new Date().toISOString()}
// Total recipes: ${updatedRecipes.length}

import type { Recipe } from '../types';

export const recipes: Recipe[] = ${JSON.stringify(updatedRecipes, null, 2)};
`;

  // Create data directory if it doesn't exist
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Write to backup first
  const backupPath = path.join(__dirname, '../lib/data/recipes-complete.backup.ts');
  const originalPath = path.join(__dirname, '../lib/data/recipes-complete.ts');
  
  if (fs.existsSync(originalPath)) {
    fs.copyFileSync(originalPath, backupPath);
    console.log('✅ Backup created: recipes-complete.backup.ts');
  }

  // Write updated file (as a separate file first for review)
  const outputPath = path.join(__dirname, '../lib/data/recipes-complete.vetted.ts');
  fs.writeFileSync(outputPath, output);
  console.log('✅ Vetted recipes written to: recipes-complete.vetted.ts\n');

  // Print summary
  console.log('=== VETTING SUMMARY ===');
  console.log(`Total Recipes: ${updatedRecipes.length}`);
  console.log(`Total Ingredients: ${stats.totalIngredients}`);
  console.log(`✅ Vetted: ${stats.vettedCount} (${((stats.vettedCount/stats.totalIngredients)*100).toFixed(1)}%)`);
  console.log(`🌾 Generic (no link needed): ${stats.genericCount} (${((stats.genericCount/stats.totalIngredients)*100).toFixed(1)}%)`);
  console.log(`❌ Needs Vetting: ${stats.notVettedCount} (${((stats.notVettedCount/stats.totalIngredients)*100).toFixed(1)}%)`);
  console.log(`\n📋 Unique Ingredients Needing Vetting: ${stats.needsVetting.length}`);
  
  if (stats.needsVetting.length > 0) {
    console.log('\nTop 30 Ingredients Needing Vetting:');
    stats.needsVetting.slice(0, 30).forEach((ing, i) => {
      console.log(`  ${i + 1}. ${ing}`);
    });
    if (stats.needsVetting.length > 30) {
      console.log(`  ... and ${stats.needsVetting.length - 30} more`);
    }
  }

  // Generate ingredient list for manual vetting
  const ingredientList = stats.needsVetting.map(ing => ({
    name: ing,
    searchQuery: `${ing} for dogs`,
    priority: 'high'
  }));

  const listPath = path.join(__dirname, '../data/ingredients-needing-vetting.json');
  fs.writeFileSync(listPath, JSON.stringify(ingredientList, null, 2));
  console.log('\n✅ Ingredient list saved to: data/ingredients-needing-vetting.json');
  console.log('\n⚠️  Review recipes-complete.vetted.ts before replacing the original file!');
}

main().catch(console.error);

