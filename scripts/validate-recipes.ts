// scripts/validate-recipes.ts
// Pre-deploy quality gate for recipe validation
// Checks toxicity, data coverage, allergy safety, and ingredient consistency

import { recipes } from '../lib/data/recipes-complete';
import { shouldAvoid, normalizeSpecies } from '../lib/utils/ingredientCompatibility';
import { getIngredientComposition } from '../lib/data/ingredientCompositions';
import { getFallbackNutrition } from '../lib/utils/nutritionFallbacks';
import type { Recipe } from '../lib/types';
import fs from 'fs';
import path from 'path';

interface ValidationError {
  type: 'toxicity' | 'data_coverage' | 'allergy_safety' | 'ingredient_missing' | 'nutrition_incomplete';
  recipeId: string;
  recipeName: string;
  message: string;
  severity: 'error' | 'warning';
}

interface ValidationReport {
  totalRecipes: number;
  errors: ValidationError[];
  warnings: ValidationError[];
  stats: {
    toxicIngredients: number;
    missingData: number;
    allergyMismatches: number;
    missingIngredients: number;
    incompleteNutrition: number;
  };
  passed: boolean;
}

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Normalize ingredient name to key format for lookup
 */
function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_');
}

/**
 * Check if recipe contains toxic ingredients for its target species
 */
function checkToxicity(recipe: Recipe): ValidationError[] {
  const errors: ValidationError[] = [];
  const normalizedCategory = normalizeSpecies(recipe.category);
  
  if (normalizedCategory === 'unknown') {
    return errors; // Skip if species unknown
  }
  
  recipe.ingredients.forEach(ingredient => {
    const ingName = typeof ingredient === 'string' ? ingredient : ingredient.name;
    if (!ingName) return;
    
    const normalizedKey = normalizeIngredientName(ingName);
    const shouldAvoidIng = shouldAvoid(normalizedKey, normalizedCategory);
    
    if (shouldAvoidIng) {
      errors.push({
        type: 'toxicity',
        recipeId: recipe.id,
        recipeName: recipe.name,
        message: `Contains toxic ingredient "${ingName}" for ${normalizedCategory}`,
        severity: 'error',
      });
    }
  });
  
  return errors;
}

/**
 * Check data coverage - recipes with needsReview or missing critical nutrition
 */
function checkDataCoverage(recipe: Recipe): ValidationError[] {
  const errors: ValidationError[] = [];
  
  const hasNeedsReview = recipe.needsReview === true;
  const hasNutritionalInfo = !!recipe.nutritionalInfo;
  const hasNutritionCalculation = !!(recipe as any).nutritionalCalculation;
  const hasNutritionInfo = !!recipe.nutritionInfo;
  
  const missingCriticalData = !hasNutritionalInfo && !hasNutritionCalculation && !hasNutritionInfo;
  
  if (hasNeedsReview || missingCriticalData) {
    errors.push({
      type: 'data_coverage',
      recipeId: recipe.id,
      recipeName: recipe.name,
      message: hasNeedsReview 
        ? 'Recipe marked as needsReview'
        : 'Missing critical nutrition data (nutritionalInfo, nutritionCalculation, or nutritionInfo)',
      severity: 'warning',
    });
  }
  
  return errors;
}

/**
 * Check allergy safety - recipes tagged for health concerns shouldn't contain contraindicated ingredients
 */
function checkAllergySafety(recipe: Recipe): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Check if recipe has notSuitableFor field
  if (recipe.notSuitableFor && recipe.notSuitableFor.length > 0) {
    // Verify that ingredients don't conflict with notSuitableFor
    // This is a basic check - more sophisticated logic could be added
    recipe.notSuitableFor.forEach(concern => {
      const concernLower = concern.toLowerCase();
      recipe.ingredients.forEach(ingredient => {
        const ingName = typeof ingredient === 'string' ? ingredient : ingredient.name;
        if (!ingName) return;
        
        const ingLower = ingName.toLowerCase();
        // Check for common allergen patterns
        if (concernLower.includes('allerg') && (
          ingLower.includes('chicken') && concernLower.includes('chicken') ||
          ingLower.includes('beef') && concernLower.includes('beef') ||
          ingLower.includes('dairy') && concernLower.includes('dairy') ||
          ingLower.includes('wheat') && concernLower.includes('wheat')
        )) {
          errors.push({
            type: 'allergy_safety',
            recipeId: recipe.id,
            recipeName: recipe.name,
            message: `Recipe marked as notSuitableFor "${concern}" but contains potential allergen "${ingName}"`,
            severity: 'error',
          });
        }
      });
    });
  }
  
  return errors;
}

/**
 * Check ingredient name consistency - all ingredients should exist in compositions or have fallback
 */
function checkIngredientConsistency(recipe: Recipe): ValidationError[] {
  const errors: ValidationError[] = [];
  
  recipe.ingredients.forEach(ingredient => {
    const ingName = typeof ingredient === 'string' ? ingredient : ingredient.name;
    if (!ingName) return;
    
    const normalizedKey = normalizeIngredientName(ingName);
    const composition = getIngredientComposition(normalizedKey);
    const fallback = getFallbackNutrition(ingName);
    
    if (!composition && !fallback) {
      errors.push({
        type: 'ingredient_missing',
        recipeId: recipe.id,
        recipeName: recipe.name,
        message: `Ingredient "${ingName}" not found in compositions or fallbacks`,
        severity: 'warning',
      });
    }
  });
  
  return errors;
}

/**
 * Check nutritional completeness
 */
function checkNutritionalCompleteness(recipe: Recipe): ValidationError[] {
  const errors: ValidationError[] = [];
  
  const hasNutritionalInfo = !!recipe.nutritionalInfo;
  const hasNutritionCalculation = !!(recipe as any).nutritionalCalculation;
  const hasNutritionInfo = !!recipe.nutritionInfo;
  
  // At least one nutrition source should exist
  if (!hasNutritionalInfo && !hasNutritionCalculation && !hasNutritionInfo) {
    errors.push({
      type: 'nutrition_incomplete',
      recipeId: recipe.id,
      recipeName: recipe.name,
      message: 'Recipe missing all nutrition data sources',
      severity: 'error',
    });
  }
  
  return errors;
}

/**
 * Main validation function
 */
function validateRecipes(): ValidationReport {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  
  log('\n🔍 Starting Recipe Validation...\n', 'cyan');
  log(`Total recipes to validate: ${recipes.length}\n`, 'blue');
  
  recipes.forEach(recipe => {
    // Toxicity check
    const toxicityErrors = checkToxicity(recipe);
    errors.push(...toxicityErrors.filter(e => e.severity === 'error'));
    warnings.push(...toxicityErrors.filter(e => e.severity === 'warning'));
    
    // Data coverage check
    const coverageErrors = checkDataCoverage(recipe);
    warnings.push(...coverageErrors);
    
    // Allergy safety check
    const allergyErrors = checkAllergySafety(recipe);
    errors.push(...allergyErrors);
    
    // Ingredient consistency check
    const consistencyErrors = checkIngredientConsistency(recipe);
    warnings.push(...consistencyErrors);
    
    // Nutritional completeness check
    const nutritionErrors = checkNutritionalCompleteness(recipe);
    errors.push(...nutritionErrors);
  });
  
  // Calculate statistics
  const toxicCount = errors.filter(e => e.type === 'toxicity').length;
  const missingDataCount = warnings.filter(e => e.type === 'data_coverage').length;
  const allergyMismatchCount = errors.filter(e => e.type === 'allergy_safety').length;
  const missingIngredientCount = warnings.filter(e => e.type === 'ingredient_missing').length;
  const incompleteNutritionCount = errors.filter(e => e.type === 'nutrition_incomplete').length;
  
  // Calculate percentages
  const missingDataPercent = (missingDataCount / recipes.length) * 100;
  
  // Determine if validation passed
  const hasToxicIngredients = toxicCount > 0;
  const exceedsDataThreshold = missingDataPercent > 5;
  const hasAllergyMismatches = allergyMismatchCount > 0;
  const hasIncompleteNutrition = incompleteNutritionCount > 0;
  
  const passed = !hasToxicIngredients && !exceedsDataThreshold && !hasAllergyMismatches && !hasIncompleteNutrition;
  
  const report: ValidationReport = {
    totalRecipes: recipes.length,
    errors,
    warnings,
    stats: {
      toxicIngredients: toxicCount,
      missingData: missingDataCount,
      allergyMismatches: allergyMismatchCount,
      missingIngredients: missingIngredientCount,
      incompleteNutrition: incompleteNutritionCount,
    },
    passed,
  };
  
  return report;
}

/**
 * Print validation results
 */
function printResults(report: ValidationReport): void {
  log('\n' + '='.repeat(60), 'cyan');
  log('VALIDATION RESULTS', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');
  
  // Statistics
  log('Statistics:', 'blue');
  log(`  Total Recipes: ${report.totalRecipes}`, 'reset');
  log(`  Toxic Ingredients Found: ${report.stats.toxicIngredients}`, report.stats.toxicIngredients > 0 ? 'red' : 'green');
  log(`  Missing Data: ${report.stats.missingData} (${((report.stats.missingData / report.totalRecipes) * 100).toFixed(1)}%)`, 
    report.stats.missingData / report.totalRecipes > 0.05 ? 'red' : 'yellow');
  log(`  Allergy Mismatches: ${report.stats.allergyMismatches}`, report.stats.allergyMismatches > 0 ? 'red' : 'green');
  log(`  Missing Ingredients: ${report.stats.missingIngredients}`, 'yellow');
  log(`  Incomplete Nutrition: ${report.stats.incompleteNutrition}`, report.stats.incompleteNutrition > 0 ? 'red' : 'green');
  
  // Errors
  if (report.errors.length > 0) {
    log(`\n❌ ERRORS (${report.errors.length}):`, 'red');
    report.errors.slice(0, 20).forEach((error, idx) => {
      log(`  ${idx + 1}. [${error.type}] ${error.recipeId}: ${error.message}`, 'red');
    });
    if (report.errors.length > 20) {
      log(`  ... and ${report.errors.length - 20} more errors`, 'red');
    }
  }
  
  // Warnings
  if (report.warnings.length > 0) {
    log(`\n⚠️  WARNINGS (${report.warnings.length}):`, 'yellow');
    report.warnings.slice(0, 10).forEach((warning, idx) => {
      log(`  ${idx + 1}. [${warning.type}] ${warning.recipeId}: ${warning.message}`, 'yellow');
    });
    if (report.warnings.length > 10) {
      log(`  ... and ${report.warnings.length - 10} more warnings`, 'yellow');
    }
  }
  
  // Final result
  log('\n' + '='.repeat(60), 'cyan');
  if (report.passed) {
    log('✅ VALIDATION PASSED', 'green');
  } else {
    log('❌ VALIDATION FAILED', 'red');
    log('\nReasons:', 'red');
    if (report.stats.toxicIngredients > 0) {
      log(`  - Found ${report.stats.toxicIngredients} recipes with toxic ingredients`, 'red');
    }
    if ((report.stats.missingData / report.totalRecipes) > 0.05) {
      log(`  - ${((report.stats.missingData / report.totalRecipes) * 100).toFixed(1)}% of recipes have missing data (threshold: 5%)`, 'red');
    }
    if (report.stats.allergyMismatches > 0) {
      log(`  - Found ${report.stats.allergyMismatches} allergy safety mismatches`, 'red');
    }
    if (report.stats.incompleteNutrition > 0) {
      log(`  - Found ${report.stats.incompleteNutrition} recipes with incomplete nutrition`, 'red');
    }
  }
  log('='.repeat(60) + '\n', 'cyan');
}

/**
 * Save report to JSON file
 */
function saveReport(report: ValidationReport): void {
  const reportPath = path.join(process.cwd(), 'validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`📄 Report saved to: ${reportPath}`, 'blue');
}

// Main execution
function main() {
  try {
    const report = validateRecipes();
    printResults(report);
    saveReport(report);
    
    // Exit with appropriate code
    process.exit(report.passed ? 0 : 1);
  } catch (error) {
    log(`\n❌ Validation script failed: ${error}`, 'red');
    if (error instanceof Error) {
      log(`   ${error.stack}`, 'red');
    }
    process.exit(1);
  }
}

main();

