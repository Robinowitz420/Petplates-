// scripts/update-recipe-meal-images.ts
// Update all recipes to use meal images from getMealImageForRecipe

import fs from 'fs';
import path from 'path';
import { recipes } from '../lib/data/recipes-complete';
import { getMealImageForRecipe } from '../lib/utils/mealImageAssignment';

async function main() {
  console.log('🖼️  Updating recipe images to use meal images...\n');
  
  // Create backup
  const recipesPath = path.join(__dirname, '../lib/data/recipes-complete.ts');
  const backupPath = path.join(__dirname, '../lib/data/recipes-complete.meal-images-backup.ts');
  fs.copyFileSync(recipesPath, backupPath);
  console.log('✅ Backup created: recipes-complete.meal-images-backup.ts\n');
  
  // Update all recipes
  const updatedRecipes = recipes.map(recipe => {
    const newImageUrl = getMealImageForRecipe(recipe.id, recipe.category);
    return {
      ...recipe,
      imageUrl: newImageUrl
    };
  });
  
  // Generate the updated file content
  const fileContent = `// lib/data/recipes-complete.ts
// Auto-generated comprehensive recipe database
// Vetted on: ${new Date().toISOString()}
// Total recipes: ${updatedRecipes.length}
// Meal images updated: ${new Date().toISOString()}

import type { Recipe } from '../types';

export const recipes: Recipe[] = ${JSON.stringify(updatedRecipes, null, 2)};
`;
  
  // Write updated file
  fs.writeFileSync(recipesPath, fileContent, 'utf-8');
  
  console.log(`✅ Updated ${updatedRecipes.length} recipes with meal images`);
  console.log(`📁 Updated file: ${recipesPath}`);
  
  // Show sample of updates
  console.log('\n📸 Sample image assignments:');
  const samples = updatedRecipes.slice(0, 5);
  samples.forEach(recipe => {
    console.log(`   ${recipe.id} (${recipe.category}): ${recipe.imageUrl}`);
  });
  
  console.log('\n✅ Done! Recipes now use meal images.');
}

main().catch(console.error);

