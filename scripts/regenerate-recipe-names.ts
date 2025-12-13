// scripts/regenerate-recipe-names.ts
// Migration script to regenerate all recipe names using the enhanced naming system

import { generateMealName } from '../lib/utils/mealNameGenerator';
import type { Recipe } from '../lib/types';
import * as fs from 'fs';
import * as path from 'path';

// Import recipes dynamically to avoid TypeScript compilation issues
const recipesModule = require('../lib/data/recipes-complete');
const recipes: Recipe[] = recipesModule.recipes;

/**
 * Extract ingredient keys from recipe ingredients
 */
function extractIngredientKeys(recipe: Recipe): string[] {
  return (recipe.ingredients || [])
    .map(ing => {
      // Handle different ingredient formats
      const name = typeof ing === 'string' ? ing : (ing as any).name;
      if (!name) return null;
      
      // Convert display name to key format (snake_case)
      // Try to match common ingredient name patterns
      let key = name
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
      
      // Handle common variations
      if (key.includes('ground')) {
        key = key.replace('ground_', 'ground_');
      }
      
      return key;
    })
    .filter((key): key is string => key !== null && key.length > 0);
}

/**
 * Calculate nutritional profile from recipe (if available)
 */
function getNutritionalProfile(recipe: Recipe): { protein?: number; fat?: number; fiber?: number } | undefined {
  // Try to extract from nutritionalInfo if available
  if ((recipe as any).nutritionalInfo) {
    const info = (recipe as any).nutritionalInfo;
    return {
      protein: info.protein?.min || info.protein?.max || undefined,
      fat: info.fat?.min || info.fat?.max || undefined,
      fiber: info.fiber?.min || info.fiber?.max || undefined,
    };
  }
  return undefined;
}

/**
 * Format recipe as JSON string with proper indentation
 */
function formatRecipe(recipe: Recipe, indent: string = '  '): string {
  return JSON.stringify(recipe, null, indent);
}

/**
 * Main migration function
 */
async function regenerateRecipeNames() {
  console.log('🔄 Starting recipe name regeneration...\n');
  
  // Create backup
  const recipesFilePath = path.join(__dirname, '../lib/data/recipes-complete.ts');
  const backupPath = path.join(__dirname, '../lib/data/recipes-complete.backup.before-name-migration.ts');
  
  console.log('📦 Creating backup...');
  const originalContent = fs.readFileSync(recipesFilePath, 'utf-8');
  fs.writeFileSync(backupPath, originalContent);
  console.log(`✅ Backup created: ${backupPath}\n`);
  
  let updated = 0;
  let skipped = 0;
  const updates: Array<{ id: string; oldName: string; newName: string; oldShortName?: string; newShortName?: string }> = [];
  const updatedRecipes: Recipe[] = [];
  
  // Process each recipe
  for (const recipe of recipes) {
    try {
      const ingredientKeys = extractIngredientKeys(recipe);
      
      if (ingredientKeys.length === 0) {
        console.log(`⚠️  Skipping ${recipe.id}: No ingredients found`);
        skipped++;
        updatedRecipes.push(recipe); // Keep original
        continue;
      }
      
      // Determine pet species from category
      const petSpecies = recipe.category === 'dogs' ? 'dog' :
                         recipe.category === 'cats' ? 'cat' :
                         recipe.category === 'birds' ? 'bird' :
                         recipe.category === 'reptiles' ? 'reptile' :
                         recipe.category === 'pocket-pets' ? 'pocket-pet' : undefined;
      
      // Generate new name
      const nameResult = generateMealName(ingredientKeys, {
        petSpecies,
        healthConcerns: recipe.healthConcerns,
        nutritionalProfile: getNutritionalProfile(recipe),
        mealType: 'complete',
        recipeId: recipe.id,
        recipe: recipe as any,
        isCustomMeal: false,
      });
      
      const oldName = recipe.name;
      const newName = nameResult.fullName;
      const newShortName = nameResult.shortName;
      const oldShortName = (recipe as any).shortName;
      
      // Create updated recipe
      const updatedRecipe: Recipe = {
        ...recipe,
        name: newName,
      };
      
      if (newShortName) {
        (updatedRecipe as any).shortName = newShortName;
      }
      
      updatedRecipes.push(updatedRecipe);
      
      if (oldName !== newName) {
        updated++;
        updates.push({ 
          id: recipe.id, 
          oldName, 
          newName,
          oldShortName,
          newShortName 
        });
        console.log(`✅ ${recipe.id}: "${oldName}" → "${newName}"`);
      } else {
        console.log(`➡️  ${recipe.id}: No change needed`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${recipe.id}:`, error);
      skipped++;
      updatedRecipes.push(recipe); // Keep original on error
    }
  }
  
  // Update file content using string replacement
  console.log('\n💾 Updating recipes file...');
  
  let fileContent = originalContent;
  
  // Replace each recipe name and shortName
  for (const update of updates) {
    // Escape special regex characters in recipe ID
    const escapedId = update.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Replace name field - match: "id": "recipe-id", ... "name": "old-name",
    const namePattern = new RegExp(
      `("id":\\s*"${escapedId}"[\\s\\S]*?"name":\\s*")[^"]*(")`,
      'g'
    );
    fileContent = fileContent.replace(namePattern, `$1${update.newName.replace(/"/g, '\\"')}$2`);
    
    // Replace shortName if it exists
    if (update.newShortName) {
      const shortNamePattern = new RegExp(
        `("id":\\s*"${escapedId}"[\\s\\S]*?"shortName":\\s*")[^"]*(")`,
        'g'
      );
      
      if (shortNamePattern.test(fileContent)) {
        // Update existing shortName
        fileContent = fileContent.replace(shortNamePattern, `$1${update.newShortName.replace(/"/g, '\\"')}$2`);
      } else {
        // Add shortName after name field
        const nameWithShortPattern = new RegExp(
          `("id":\\s*"${escapedId}"[\\s\\S]*?"name":\\s*"[^"]*")`,
          'g'
        );
        fileContent = fileContent.replace(
          nameWithShortPattern,
          `$1,\n    "shortName": "${update.newShortName.replace(/"/g, '\\"')}"`
        );
      }
    }
  }
  
  // Update the auto-tagged timestamp comment
  const timestampPattern = /\/\/ Auto-tagged on: [^\n]+/;
  fileContent = fileContent.replace(
    timestampPattern,
    `// Auto-tagged on: ${new Date().toISOString()}\n// Names regenerated using enhanced naming system`
  );
  
  // Write updated content
  fs.writeFileSync(recipesFilePath, fileContent, 'utf-8');
  console.log('✅ Updated recipes file written\n');
  
  // Summary
  console.log('='.repeat(60));
  console.log('📊 Migration Summary:');
  console.log(`   ✅ Updated: ${updated} recipes`);
  console.log(`   ⏭️  Skipped: ${skipped} recipes`);
  console.log(`   📦 Backup: ${backupPath}`);
  console.log('='.repeat(60));
  
  // Show sample updates
  if (updates.length > 0) {
    console.log('\n📝 Sample Updates:');
    updates.slice(0, 10).forEach(update => {
      console.log(`   ${update.id}:`);
      console.log(`      "${update.oldName}" → "${update.newName}"`);
      if (update.oldShortName && update.newShortName) {
        console.log(`      Short: "${update.oldShortName}" → "${update.newShortName}"`);
      }
    });
    if (updates.length > 10) {
      console.log(`   ... and ${updates.length - 10} more`);
    }
  }
  
  console.log('\n✨ Migration complete!');
}

// Run migration
regenerateRecipeNames().catch(error => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});

