/**
 * Cost Analysis Script
 * Analyzes ingredient costs by pet type and identifies expensive ingredients
 * Outputs recommendations for cheaper alternatives to meet $4.50 per meal target
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
// Use require for TypeScript module compatibility
const recipesModule = require('../lib/data/recipes-complete');
const { recipes } = recipesModule;
import { VETTED_PRODUCTS } from '../lib/data/vetted-products';
import { getPackageSize } from '../lib/data/packageSizes';
import { parseAmountToGrams } from '../lib/utils/mealEstimation';
import { applyModifiers } from '../lib/applyModifiers';
import { calculateMealsFromGroceryList } from '../lib/utils/mealEstimation';
import type { Recipe } from '../lib/types';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface IngredientCostAnalysis {
  ingredientName: string;
  species: string[];
  averagePrice: number;
  usageCount: number;
  costTier: 'budget' | 'standard' | 'premium';
  needsBudgetAlternative: boolean;
}

interface RecipeCostAnalysis {
  recipeId: string;
  recipeName: string;
  category: string;
  costPerMeal: number;
  totalCost: number;
  estimatedMeals: number;
  exceedsBudget: boolean;
  expensiveIngredients: string[];
}

interface CostReport {
  scanDate: string;
  maxCostPerMeal: number;
  recipesAnalyzed: number;
  recipesExceedingBudget: number;
  averageCostPerMealBySpecies: Record<string, number>;
  expensiveIngredients: IngredientCostAnalysis[];
  recipeCosts: RecipeCostAnalysis[];
  recommendations: string[];
}

function getSpeciesFromRecipeCategory(category?: string): string | undefined {
  if (!category) return undefined;
  return category;
}

function analyzeIngredientCosts(): IngredientCostAnalysis[] {
  const ingredientMap = new Map<string, {
    species: Set<string>;
    prices: number[];
    usageCount: number;
  }>();

  // Analyze all recipes
  recipes.forEach((recipe: Recipe) => {
    const species = getSpeciesFromRecipeCategory(recipe.category);
    if (!species) return;

    // Create mock pet for applyModifiers
    const mockPet = {
      id: 'analysis-pet',
      type: species,
      name: 'Analysis Pet',
      breed: 'Mixed',
      age: 'adult',
      healthConcerns: [],
      allergies: [],
      weightKg: 10,
    };

    try {
      const modifiedResult = applyModifiers(recipe, mockPet as any);
      const modifiedRecipe = modifiedResult.modifiedRecipe;

      // Analyze ingredients
      (modifiedRecipe.ingredients || []).forEach((ing: any) => {
        const ingName = (ing.productName || ing.name || '').toLowerCase().trim();
        if (!ingName) return;

        const vettedProduct = VETTED_PRODUCTS[ingName] || 
          Object.values(VETTED_PRODUCTS).find(p => 
            p.productName.toLowerCase() === ingName
          );

        if (vettedProduct && vettedProduct.price?.amount) {
          if (!ingredientMap.has(ingName)) {
            ingredientMap.set(ingName, {
              species: new Set(),
              prices: [],
              usageCount: 0,
            });
          }

          const data = ingredientMap.get(ingName)!;
          data.species.add(species);
          data.prices.push(vettedProduct.price.amount);
          data.usageCount++;
        }
      });

      // Analyze supplements
      if ((modifiedRecipe as any).supplements) {
        ((modifiedRecipe as any).supplements || []).forEach((supplement: any) => {
          const suppName = (supplement.productName || supplement.name || '').toLowerCase().trim();
          if (!suppName) return;

          const vettedProduct = VETTED_PRODUCTS[suppName] ||
            Object.values(VETTED_PRODUCTS).find(p =>
              p.productName.toLowerCase() === suppName
            );

          if (vettedProduct && vettedProduct.price?.amount) {
            if (!ingredientMap.has(suppName)) {
              ingredientMap.set(suppName, {
                species: new Set(),
                prices: [],
                usageCount: 0,
              });
            }

            const data = ingredientMap.get(suppName)!;
            data.species.add(species);
            data.prices.push(vettedProduct.price.amount);
            data.usageCount++;
          }
        });
      }
    } catch (error) {
      console.warn(`Error analyzing recipe ${recipe.id}:`, error);
    }
  });

  // Convert to analysis array
  const analysis: IngredientCostAnalysis[] = [];

  ingredientMap.forEach((data, ingredientName) => {
    const avgPrice = data.prices.reduce((a, b) => a + b, 0) / data.prices.length;
    const costTier: 'budget' | 'standard' | 'premium' = 
      avgPrice < 15 ? 'budget' :
      avgPrice < 30 ? 'standard' : 'premium';

    analysis.push({
      ingredientName,
      species: Array.from(data.species),
      averagePrice: avgPrice,
      usageCount: data.usageCount,
      costTier,
      needsBudgetAlternative: avgPrice > 30 || (avgPrice > 15 && data.usageCount > 5),
    });
  });

  return analysis.sort((a, b) => b.averagePrice - a.averagePrice);
}

function analyzeRecipeCosts(): RecipeCostAnalysis[] {
  const recipeCosts: RecipeCostAnalysis[] = [];

  recipes.forEach((recipe: Recipe) => {
    const species = getSpeciesFromRecipeCategory(recipe.category);
    if (!species) return;

    // Create mock pet
    const mockPet = {
      id: 'analysis-pet',
      type: species,
      name: 'Analysis Pet',
      breed: 'Mixed',
      age: 'adult',
      healthConcerns: [],
      allergies: [],
      weightKg: 10,
    };

    try {
      const modifiedResult = applyModifiers(recipe, mockPet as any);
      const modifiedRecipe = modifiedResult.modifiedRecipe;

      // Build shopping list items
      const allIngredients = modifiedRecipe.ingredients || [];
      const allSupplements = (modifiedRecipe as any).supplements || [];
      
      const shoppingItems = [
        ...allIngredients.filter((ing: any) => ing.asinLink).map((ing: any) => ({
          id: ing.id || ing.name,
          name: ing.productName || ing.name,
          amount: ing.amount || '100g',
          category: (VETTED_PRODUCTS[(ing.productName || ing.name).toLowerCase()] ||
            Object.values(VETTED_PRODUCTS).find(p => 
              p.productName.toLowerCase() === (ing.productName || ing.name).toLowerCase()
            ))?.category || 'other',
        })),
        ...allSupplements.filter((supp: any) => supp.asinLink).map((supp: any) => ({
          id: supp.id || supp.name,
          name: supp.productName || supp.name,
          amount: supp.amount || supp.defaultAmount || '1 serving',
          category: 'Supplement',
        })),
      ];

      if (shoppingItems.length === 0) return;

      // Calculate meal estimate
      const estimate = calculateMealsFromGroceryList(shoppingItems);
      
      if (estimate) {
        const exceedsBudget = estimate.costPerMeal > 4.50;
        
        // Find expensive ingredients
        const expensiveIngredients: string[] = [];
        estimate.breakdown.forEach(item => {
          if (item.packageCost > 30) {
            expensiveIngredients.push(item.ingredient);
          }
        });

        recipeCosts.push({
          recipeId: recipe.id,
          recipeName: recipe.name,
          category: recipe.category || 'unknown',
          costPerMeal: estimate.costPerMeal,
          totalCost: estimate.totalCost,
          estimatedMeals: estimate.estimatedMeals,
          exceedsBudget,
          expensiveIngredients,
        });
      }
    } catch (error) {
      console.warn(`Error analyzing recipe ${recipe.id}:`, error);
    }
  });

  return recipeCosts.sort((a, b) => b.costPerMeal - a.costPerMeal);
}

function generateRecommendations(
  ingredientAnalysis: IngredientCostAnalysis[],
  recipeAnalysis: RecipeCostAnalysis[]
): string[] {
  const recommendations: string[] = [];

  // Top expensive ingredients
  const topExpensive = ingredientAnalysis
    .filter(ing => ing.needsBudgetAlternative)
    .slice(0, 20);

  if (topExpensive.length > 0) {
    recommendations.push('TOP PRIORITY: Add budget alternatives for these expensive ingredients:');
    topExpensive.forEach((ing, index) => {
      recommendations.push(`  ${index + 1}. ${ing.ingredientName} - $${ing.averagePrice.toFixed(2)} (used in ${ing.species.join(', ')})`);
    });
  }

  // Recipes exceeding budget
  const exceedingRecipes = recipeAnalysis.filter(r => r.exceedsBudget);
  if (exceedingRecipes.length > 0) {
    recommendations.push(`\n${exceedingRecipes.length} recipes exceed $4.50 per meal target:`);
    exceedingRecipes.slice(0, 10).forEach(recipe => {
      recommendations.push(`  - ${recipe.recipeName} (${recipe.category}): $${recipe.costPerMeal.toFixed(2)}/meal`);
    });
  }

  // Species-specific recommendations
  const bySpecies = recipeAnalysis.reduce((acc, recipe) => {
    if (!acc[recipe.category]) {
      acc[recipe.category] = { total: 0, sum: 0, exceeding: 0 };
    }
    acc[recipe.category].total++;
    acc[recipe.category].sum += recipe.costPerMeal;
    if (recipe.exceedsBudget) acc[recipe.category].exceeding++;
    return acc;
  }, {} as Record<string, { total: number; sum: number; exceeding: number }>);

  Object.entries(bySpecies).forEach(([species, data]) => {
    const avg = data.sum / data.total;
    if (avg > 4.50 || data.exceeding > 0) {
      recommendations.push(`\n${species.toUpperCase()}: Average cost $${avg.toFixed(2)}/meal, ${data.exceeding} recipes exceed budget`);
      if (species === 'cats') {
        recommendations.push('  Priority: Add budget-friendly heart meats (beef heart, turkey hearts) for taurine');
      }
      if (species === 'dogs') {
        recommendations.push('  Priority: Add budget organ meats and cheaper fish alternatives');
      }
    }
  });

  return recommendations;
}

function main() {
  console.log('🔍 Starting ingredient cost analysis...\n');

  // Analyze ingredients
  console.log('Analyzing ingredient costs...');
  const ingredientAnalysis = analyzeIngredientCosts();

  // Analyze recipes
  console.log('Analyzing recipe costs...');
  const recipeAnalysis = analyzeRecipeCosts();

  // Calculate averages by species
  const avgBySpecies: Record<string, number> = {};
  const speciesGroups = recipeAnalysis.reduce((acc, recipe) => {
    if (!acc[recipe.category]) acc[recipe.category] = [];
    acc[recipe.category].push(recipe.costPerMeal);
    return acc;
  }, {} as Record<string, number[]>);

  Object.entries(speciesGroups).forEach(([species, costs]) => {
    avgBySpecies[species] = costs.reduce((a, b) => a + b, 0) / costs.length;
  });

  // Generate recommendations
  const recommendations = generateRecommendations(ingredientAnalysis, recipeAnalysis);

  // Create report
  const report: CostReport = {
    scanDate: new Date().toISOString(),
    maxCostPerMeal: 4.50,
    recipesAnalyzed: recipeAnalysis.length,
    recipesExceedingBudget: recipeAnalysis.filter(r => r.exceedsBudget).length,
    averageCostPerMealBySpecies: avgBySpecies,
    expensiveIngredients: ingredientAnalysis.filter(ing => ing.needsBudgetAlternative).slice(0, 30),
    recipeCosts: recipeAnalysis,
    recommendations,
  };

  // Save report
  const reportPath = path.join(__dirname, 'cost-analysis-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Print summary
  console.log('\n📊 COST ANALYSIS SUMMARY\n');
  console.log(`Total recipes analyzed: ${report.recipesAnalyzed}`);
  console.log(`Recipes exceeding $4.50: ${report.recipesExceedingBudget} (${((report.recipesExceedingBudget / report.recipesAnalyzed) * 100).toFixed(1)}%)\n`);

  console.log('Average cost per meal by species:');
  Object.entries(avgBySpecies).forEach(([species, avg]) => {
    const status = avg > 4.50 ? '❌' : '✅';
    console.log(`  ${status} ${species}: $${avg.toFixed(2)}`);
  });

  console.log('\n📋 TOP EXPENSIVE INGREDIENTS NEEDING BUDGET ALTERNATIVES:\n');
  ingredientAnalysis.filter(ing => ing.needsBudgetAlternative).slice(0, 15).forEach((ing, index) => {
    console.log(`${index + 1}. ${ing.ingredientName}`);
    console.log(`   Average price: $${ing.averagePrice.toFixed(2)} | Tier: ${ing.costTier} | Used in: ${ing.species.join(', ')}`);
  });

  console.log('\n📄 Detailed report saved to:', reportPath);
  console.log('\n💡 RECOMMENDATIONS:\n');
  recommendations.forEach(rec => console.log(rec));
}

main().catch(console.error);

