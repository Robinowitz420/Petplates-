/**
 * Validation script to check all recipes for species mismatches
 * Ensures no "for Dogs" products appear in cat recipes, etc.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { recipes } from '../lib/data/recipes-complete';
import { applyModifiers } from '../lib/applyModifiers';
import type { Recipe } from '../lib/types';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Violation {
  recipeId: string;
  recipeName: string;
  recipeCategory: string;
  species: string;
  ingredientName: string;
  productName: string;
  violationType: 'for-dogs-in-cats' | 'for-cats-in-dogs' | 'dog-food-in-cats' | 'cat-food-in-dogs';
}

interface ValidationReport {
  scanDate: string;
  totalRecipes: number;
  violationsFound: number;
  violations: Violation[];
  summaryByCategory: Record<string, number>;
}

function getSpeciesFromRecipeCategory(category?: string): string | undefined {
  if (!category) return undefined;
  return category; // recipe.category is already in plural form (dogs, cats, etc.)
}

function validateRecipes(): ValidationReport {
  console.log('🔍 Validating recipes for species mismatches...\n');
  
  const violations: Violation[] = [];
  const summaryByCategory: Record<string, number> = {};
  
  recipes.forEach((recipe: Recipe) => {
    const species = getSpeciesFromRecipeCategory(recipe.category);
    if (!species) {
      // Skip recipes without category
      return;
    }
    
    // Create mock pet object for this species
    const mockPet = {
      id: 'validation-pet',
      type: species, // Already in plural form
      name: 'Validation Pet',
      breed: 'Mixed',
      age: 'adult',
      healthConcerns: [],
      allergies: [],
      weightKg: 10,
    };
    
    // Apply modifiers to get final ingredient/product names
    const modifiedResult = applyModifiers(recipe, mockPet as any);
    const modifiedRecipe = modifiedResult.modifiedRecipe;
    
    // Check all ingredients
    (modifiedRecipe.ingredients || []).forEach((ing: any) => {
      const productName = ing.productName || ing.name || '';
      const ingredientName = ing.name || '';
      
      if (!productName) return;
      
      const productNameLower = productName.toLowerCase();
      
      // Check for violations
      if (species === 'cats') {
        if (productNameLower.includes('for dogs') || 
            productNameLower.includes('for dog') ||
            (productNameLower.includes('dog food') && !productNameLower.includes('cat'))) {
          violations.push({
            recipeId: recipe.id,
            recipeName: recipe.name,
            recipeCategory: recipe.category || 'unknown',
            species,
            ingredientName,
            productName,
            violationType: productNameLower.includes('dog food') ? 'dog-food-in-cats' : 'for-dogs-in-cats',
          });
          
          if (!summaryByCategory[recipe.category || 'unknown']) {
            summaryByCategory[recipe.category || 'unknown'] = 0;
          }
          summaryByCategory[recipe.category || 'unknown']++;
        }
      }
      
      if (species === 'dogs') {
        if (productNameLower.includes('for cats') || 
            productNameLower.includes('for cat') ||
            (productNameLower.includes('cat food') && !productNameLower.includes('dog'))) {
          violations.push({
            recipeId: recipe.id,
            recipeName: recipe.name,
            recipeCategory: recipe.category || 'unknown',
            species,
            ingredientName,
            productName,
            violationType: productNameLower.includes('cat food') ? 'cat-food-in-dogs' : 'for-cats-in-dogs',
          });
          
          if (!summaryByCategory[recipe.category || 'unknown']) {
            summaryByCategory[recipe.category || 'unknown'] = 0;
          }
          summaryByCategory[recipe.category || 'unknown']++;
        }
      }
    });
    
    // Check supplements too
    if ((modifiedRecipe as any).supplements) {
      ((modifiedRecipe as any).supplements || []).forEach((supplement: any) => {
        const productName = supplement.productName || supplement.name || '';
        const supplementName = supplement.name || '';
        
        if (!productName) return;
        
        const productNameLower = productName.toLowerCase();
        
        if (species === 'cats') {
          if (productNameLower.includes('for dogs') || 
              productNameLower.includes('for dog') ||
              (productNameLower.includes('dog food') && !productNameLower.includes('cat'))) {
            violations.push({
              recipeId: recipe.id,
              recipeName: recipe.name,
              recipeCategory: recipe.category || 'unknown',
              species,
              ingredientName: supplementName,
              productName,
              violationType: productNameLower.includes('dog food') ? 'dog-food-in-cats' : 'for-dogs-in-cats',
            });
            
            if (!summaryByCategory[recipe.category || 'unknown']) {
              summaryByCategory[recipe.category || 'unknown'] = 0;
            }
            summaryByCategory[recipe.category || 'unknown']++;
          }
        }
        
        if (species === 'dogs') {
          if (productNameLower.includes('for cats') || 
              productNameLower.includes('for cat') ||
              (productNameLower.includes('cat food') && !productNameLower.includes('dog'))) {
            violations.push({
              recipeId: recipe.id,
              recipeName: recipe.name,
              recipeCategory: recipe.category || 'unknown',
              species,
              ingredientName: supplementName,
              productName,
              violationType: productNameLower.includes('cat food') ? 'cat-food-in-dogs' : 'for-cats-in-dogs',
            });
            
            if (!summaryByCategory[recipe.category || 'unknown']) {
              summaryByCategory[recipe.category || 'unknown'] = 0;
            }
            summaryByCategory[recipe.category || 'unknown']++;
          }
        }
      });
    }
  });
  
  const report: ValidationReport = {
    scanDate: new Date().toISOString(),
    totalRecipes: recipes.length,
    violationsFound: violations.length,
    violations,
    summaryByCategory,
  };
  
  return report;
}

// Run validation
try {
  const report = validateRecipes();
  
  console.log(`📊 Validation Results:\n`);
  console.log(`   Total recipes scanned: ${report.totalRecipes}`);
  console.log(`   Violations found: ${report.violationsFound}\n`);
  
  if (report.violationsFound > 0) {
    console.log('❌ SPECIES MISMATCH VIOLATIONS:\n');
    
    // Group by violation type
    const byType: Record<string, Violation[]> = {
      'for-dogs-in-cats': [],
      'for-cats-in-dogs': [],
      'dog-food-in-cats': [],
      'cat-food-in-dogs': [],
    };
    
    report.violations.forEach(v => {
      byType[v.violationType].push(v);
    });
    
    Object.entries(byType).forEach(([type, violations]) => {
      if (violations.length === 0) return;
      
      console.log(`\n${type.toUpperCase().replace(/-/g, ' ')} (${violations.length}):`);
      violations.forEach((v, index) => {
        console.log(`  ${index + 1}. Recipe: "${v.recipeName}" (${v.recipeId})`);
        console.log(`     Category: ${v.recipeCategory}`);
        console.log(`     Species: ${v.species}`);
        console.log(`     Ingredient: ${v.ingredientName}`);
        console.log(`     Product: ${v.productName}`);
      });
    });
    
    // Save report
    const reportPath = path.join(__dirname, 'species-validation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    
    process.exit(1); // Exit with error
  } else {
    console.log('✅ No violations found! All products match their recipe species.\n');
    
    // Save report anyway
    const reportPath = path.join(__dirname, 'species-validation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Report saved to: ${reportPath}`);
    
    process.exit(0);
  }
} catch (error) {
  console.error('❌ Error during validation:', error);
  process.exit(1);
}

