// Recipe Nutritional Accuracy Audit - Verify portion calculations and nutritional totals
// Tests if recipes meet species-specific requirements and calculations are correct

import { RecipeBuilder, GenerationConstraints } from '../generator/RecipeBuilder';
import type { Species } from '@/lib/data/ingredients';
import { getNutritionalStandard } from '@/lib/data/aafco-standards';
import * as fs from 'fs';
import * as path from 'path';

interface NutritionalAccuracyMetrics {
  species: Species;
  recipesGenerated: number;
  recipesValid: number;
  avgTotalGrams: number;
  avgProteinPercent: number;
  avgFatPercent: number;
  avgCarbsPercent: number;
  avgCalories: number;
  portionSizeIssues: number;
  nutritionalBalanceIssues: number;
  calculationErrors: number;
}

export class RecipeNutritionalAudit {
  private results: Map<Species, NutritionalAccuracyMetrics> = new Map();
  
  async runAudit(): Promise<void> {
    console.log('='.repeat(80));
    console.log('RECIPE NUTRITIONAL ACCURACY AUDIT');
    console.log('='.repeat(80));
    console.log();
    
    const species: Species[] = ['dogs', 'cats', 'birds', 'reptiles', 'pocket-pets'];
    
    for (const sp of species) {
      console.log(`Testing ${sp}...`);
      await this.testSpeciesNutrition(sp);
    }
    
    this.generateReport();
  }
  
  private async testSpeciesNutrition(species: Species): Promise<void> {
    const testCases = [
      { weight: 2, label: 'very small' },
      { weight: 5, label: 'small' },
      { weight: 15, label: 'medium' },
      { weight: 30, label: 'large' },
      { weight: 50, label: 'very large' },
    ];
    
    let recipesGenerated = 0;
    let recipesValid = 0;
    let totalGrams = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;
    let totalCalories = 0;
    let portionSizeIssues = 0;
    let nutritionalBalanceIssues = 0;
    let calculationErrors = 0;
    
    for (const testCase of testCases) {
      for (let i = 0; i < 5; i++) {
        const constraints: GenerationConstraints = {
          species,
          lifeStage: 'adult',
          petWeightKg: testCase.weight,
          healthConcerns: [],
          allergies: [],
        };
        
        try {
          const builder = new RecipeBuilder(constraints, 'standard', 'medium');
          const recipe = await builder.generate();
          
          if (recipe && recipe.ingredients.length > 0) {
            recipesGenerated++;
            
            // Calculate nutritional totals
            let recipeProtein = 0;
            let recipeFat = 0;
            let recipeCarbs = 0;
            let recipeCalories = 0;
            let calculatedTotalGrams = 0;
            
            for (const portioned of recipe.ingredients) {
              const grams = portioned.grams;
              calculatedTotalGrams += grams;
              
              const comp = portioned.ingredient.composition;
              recipeProtein += (comp.protein || 0) * grams / 100;
              recipeFat += (comp.fat || 0) * grams / 100;
              recipeCarbs += (comp.carbs || 0) * grams / 100;
              recipeCalories += (comp.kcal || 0) * grams / 100;
            }
            
            // Verify total grams matches
            if (Math.abs(calculatedTotalGrams - recipe.totalGrams) > 0.1) {
              calculationErrors++;
              console.warn(`  Calculation error: ${calculatedTotalGrams.toFixed(1)}g calculated vs ${recipe.totalGrams}g reported`);
            }
            
            // Check portion size appropriateness
            const expectedGramsPerKg = this.getExpectedGramsPerKg(species);
            const expectedTotal = testCase.weight * expectedGramsPerKg;
            const portionDifference = Math.abs(recipe.totalGrams - expectedTotal) / expectedTotal;
            
            if (portionDifference > 0.3) {
              portionSizeIssues++;
            }
            
            // Check nutritional balance
            const proteinPercent = (recipeProtein / recipe.totalGrams) * 100;
            const fatPercent = (recipeFat / recipe.totalGrams) * 100;
            const carbsPercent = (recipeCarbs / recipe.totalGrams) * 100;
            
            const standard = getNutritionalStandard(species, 'adult');
            
            if (standard.protein && (proteinPercent < standard.protein.min || proteinPercent > (standard.protein.max || 100))) {
              nutritionalBalanceIssues++;
            }
            
            if (standard.fat && (fatPercent < standard.fat.min || fatPercent > (standard.fat.max || 100))) {
              nutritionalBalanceIssues++;
            }
            
            recipesValid++;
            totalGrams += recipe.totalGrams;
            totalProtein += proteinPercent;
            totalFat += fatPercent;
            totalCarbs += carbsPercent;
            totalCalories += recipeCalories;
          }
        } catch (error) {
          // Skip failed recipes
        }
      }
    }
    
    this.results.set(species, {
      species,
      recipesGenerated,
      recipesValid,
      avgTotalGrams: recipesValid > 0 ? totalGrams / recipesValid : 0,
      avgProteinPercent: recipesValid > 0 ? totalProtein / recipesValid : 0,
      avgFatPercent: recipesValid > 0 ? totalFat / recipesValid : 0,
      avgCarbsPercent: recipesValid > 0 ? totalCarbs / recipesValid : 0,
      avgCalories: recipesValid > 0 ? totalCalories / recipesValid : 0,
      portionSizeIssues,
      nutritionalBalanceIssues,
      calculationErrors,
    });
  }
  
  private getExpectedGramsPerKg(species: Species): number {
    switch (species) {
      case 'dogs': return 60;
      case 'cats': return 70;
      case 'birds': return 80;
      case 'reptiles': return 50;
      case 'pocket-pets': return 100;
      default: return 60;
    }
  }
  
  private generateReport(): void {
    console.log();
    console.log('='.repeat(80));
    console.log('NUTRITIONAL ACCURACY RESULTS');
    console.log('='.repeat(80));
    console.log();
    
    for (const [species, metrics] of this.results) {
      console.log(`${species.toUpperCase()}`);
      console.log('-'.repeat(80));
      console.log(`Recipes generated: ${metrics.recipesGenerated}`);
      console.log(`Recipes valid: ${metrics.recipesValid}`);
      console.log();
      
      console.log('Average nutritional composition:');
      console.log(`  Total grams: ${metrics.avgTotalGrams.toFixed(1)}g`);
      console.log(`  Protein: ${metrics.avgProteinPercent.toFixed(1)}%`);
      console.log(`  Fat: ${metrics.avgFatPercent.toFixed(1)}%`);
      console.log(`  Carbs: ${metrics.avgCarbsPercent.toFixed(1)}%`);
      console.log(`  Calories: ${metrics.avgCalories.toFixed(0)} kcal`);
      console.log();
      
      // Check against standards
      const standard = getNutritionalStandard(species, 'adult');
      
      console.log('Compliance with standards:');
      if (standard.protein) {
        const proteinOk = metrics.avgProteinPercent >= standard.protein.min && 
                         metrics.avgProteinPercent <= (standard.protein.max || 100);
        console.log(`  Protein: ${proteinOk ? '✅' : '❌'} ${metrics.avgProteinPercent.toFixed(1)}% (target: ${standard.protein.min}-${standard.protein.max || '∞'}%)`);
      }
      
      if (standard.fat) {
        const fatOk = metrics.avgFatPercent >= standard.fat.min && 
                     metrics.avgFatPercent <= (standard.fat.max || 100);
        console.log(`  Fat: ${fatOk ? '✅' : '❌'} ${metrics.avgFatPercent.toFixed(1)}% (target: ${standard.fat.min}-${standard.fat.max || '∞'}%)`);
      }
      
      console.log();
      
      console.log('Issues detected:');
      console.log(`  Portion size issues: ${metrics.portionSizeIssues}`);
      console.log(`  Nutritional balance issues: ${metrics.nutritionalBalanceIssues}`);
      console.log(`  Calculation errors: ${metrics.calculationErrors}`);
      console.log();
      
      if (metrics.calculationErrors > 0) {
        console.log('⚠️  Calculation errors detected - portion totals may be incorrect');
      }
      
      if (metrics.portionSizeIssues > metrics.recipesValid * 0.2) {
        console.log('⚠️  Many portion sizes outside expected range - review multipliers');
      }
      
      if (metrics.nutritionalBalanceIssues > 0) {
        console.log('⚠️  Some recipes outside nutritional standards - review ingredient selection');
      }
      
      console.log();
    }
    
    this.generateRecommendations();
    this.saveDetailedReport();
  }
  
  private generateRecommendations(): void {
    console.log('='.repeat(80));
    console.log('RECOMMENDATIONS');
    console.log('='.repeat(80));
    console.log();
    
    for (const [species, metrics] of this.results) {
      const issues: string[] = [];
      
      if (metrics.calculationErrors > 0) {
        issues.push('Fix calculation errors in portion totaling');
      }
      
      if (metrics.portionSizeIssues > metrics.recipesValid * 0.2) {
        issues.push('Adjust portion multipliers for better sizing');
      }
      
      if (metrics.nutritionalBalanceIssues > metrics.recipesValid * 0.1) {
        issues.push('Review ingredient selection to meet nutritional standards');
      }
      
      const standard = getNutritionalStandard(species, 'adult');
      if (standard.protein && metrics.avgProteinPercent < standard.protein.min) {
        issues.push(`Increase protein content (currently ${metrics.avgProteinPercent.toFixed(1)}%, need ${standard.protein.min}%+)`);
      }
      
      if (standard.fat && metrics.avgFatPercent < standard.fat.min) {
        issues.push(`Increase fat content (currently ${metrics.avgFatPercent.toFixed(1)}%, need ${standard.fat.min}%+)`);
      }
      
      if (issues.length > 0) {
        console.log(`${species}:`);
        issues.forEach(issue => console.log(`  - ${issue}`));
        console.log();
      }
    }
  }
  
  private saveDetailedReport(): void {
    const report = {
      timestamp: new Date().toISOString(),
      results: Array.from(this.results.entries()).map(([species, metrics]) => ({
        species,
        ...metrics,
      })),
    };
    
    const outputPath = path.join(process.cwd(), 'RECIPE_NUTRITIONAL_AUDIT.json');
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');
    
    console.log(`Detailed report saved to: ${outputPath}`);
    console.log();
  }
}

// Run the audit
const audit = new RecipeNutritionalAudit();
audit.runAudit().catch(console.error);
