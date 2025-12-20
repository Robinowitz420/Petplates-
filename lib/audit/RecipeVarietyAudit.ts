// Recipe Variety Audit - Analyze diversity mechanisms across all species
// Tests if recipes actually vary between generations and ingredient rotation

import { RecipeBuilder, GenerationConstraints } from '../generator/RecipeBuilder';
import type { Species } from '@/lib/data/ingredients';
import * as fs from 'fs';
import * as path from 'path';

interface VarietyMetrics {
  species: Species;
  totalRecipes: number;
  uniqueIngredients: Set<string>;
  ingredientFrequency: Map<string, number>;
  uniqueRecipes: number;
  duplicateRecipes: number;
  averageIngredientsPerRecipe: number;
  ingredientRotation: number; // 0-1, higher = better rotation
  diversityScore: number; // 0-100, higher = better variety
}

interface RecipeSignature {
  ingredients: string[];
  hash: string;
}

export class RecipeVarietyAudit {
  private results: Map<Species, VarietyMetrics> = new Map();
  
  async runAudit(): Promise<void> {
    console.log('='.repeat(80));
    console.log('RECIPE VARIETY AUDIT');
    console.log('='.repeat(80));
    console.log();
    
    const species: Species[] = ['dogs', 'cats', 'birds', 'reptiles', 'pocket-pets'];
    const recipesPerSpecies = 50; // Generate 50 recipes per species
    
    for (const sp of species) {
      console.log(`Testing ${sp}...`);
      await this.testSpeciesVariety(sp, recipesPerSpecies);
    }
    
    this.generateReport();
  }
  
  private async testSpeciesVariety(species: Species, count: number): Promise<void> {
    const recipes: RecipeSignature[] = [];
    const ingredientFrequency = new Map<string, number>();
    const uniqueIngredients = new Set<string>();
    let totalIngredients = 0;
    
    // Generate recipes with different diversity modes
    const diversityModes = ['high', 'medium', 'low', 'none'] as const;
    const recipesPerMode = Math.floor(count / diversityModes.length);
    
    for (const mode of diversityModes) {
      for (let i = 0; i < recipesPerMode; i++) {
        const constraints: GenerationConstraints = {
          species,
          lifeStage: 'adult',
          petWeightKg: this.getTypicalWeight(species),
          healthConcerns: [],
          allergies: [],
        };
        
        try {
          const builder = new RecipeBuilder(constraints, 'standard', mode);
          const recipe = await builder.generate();
          
          if (recipe && recipe.ingredients.length > 0) {
            // Track ingredients
            const ingredientNames = recipe.ingredients.map(ing => ing.ingredient.name).sort();
            const hash = this.hashIngredients(ingredientNames);
            
            recipes.push({ ingredients: ingredientNames, hash });
            totalIngredients += ingredientNames.length;
            
            ingredientNames.forEach(name => {
              uniqueIngredients.add(name);
              ingredientFrequency.set(name, (ingredientFrequency.get(name) || 0) + 1);
            });
          }
        } catch (error) {
          console.error(`  Failed to generate recipe: ${error}`);
        }
      }
    }
    
    // Calculate metrics
    const uniqueHashes = new Set(recipes.map(r => r.hash));
    const uniqueRecipes = uniqueHashes.size;
    const duplicateRecipes = recipes.length - uniqueRecipes;
    const averageIngredientsPerRecipe = totalIngredients / recipes.length;
    
    // Calculate ingredient rotation score
    const rotationScore = this.calculateRotationScore(ingredientFrequency, recipes.length);
    
    // Calculate diversity score
    const diversityScore = this.calculateDiversityScore(
      uniqueRecipes,
      recipes.length,
      uniqueIngredients.size,
      rotationScore
    );
    
    this.results.set(species, {
      species,
      totalRecipes: recipes.length,
      uniqueIngredients,
      ingredientFrequency,
      uniqueRecipes,
      duplicateRecipes,
      averageIngredientsPerRecipe,
      ingredientRotation: rotationScore,
      diversityScore,
    });
  }
  
  private getTypicalWeight(species: Species): number {
    switch (species) {
      case 'dogs': return 15;
      case 'cats': return 5;
      case 'birds': return 0.5;
      case 'reptiles': return 0.3;
      case 'pocket-pets': return 1;
      default: return 10;
    }
  }
  
  private hashIngredients(ingredients: string[]): string {
    return ingredients.join('|');
  }
  
  private calculateRotationScore(
    frequency: Map<string, number>,
    totalRecipes: number
  ): number {
    // Perfect rotation = each ingredient used equally
    // Score 0-1, where 1 = perfect rotation
    
    const frequencies = Array.from(frequency.values());
    const avgFrequency = frequencies.reduce((a, b) => a + b, 0) / frequencies.length;
    
    // Calculate variance
    const variance = frequencies.reduce((sum, freq) => {
      return sum + Math.pow(freq - avgFrequency, 2);
    }, 0) / frequencies.length;
    
    // Lower variance = better rotation
    // Normalize to 0-1 scale
    const maxVariance = Math.pow(totalRecipes, 2);
    const normalizedVariance = Math.min(variance / maxVariance, 1);
    
    return 1 - normalizedVariance;
  }
  
  private calculateDiversityScore(
    uniqueRecipes: number,
    totalRecipes: number,
    uniqueIngredients: number,
    rotationScore: number
  ): number {
    // Weighted score:
    // 40% - Recipe uniqueness
    // 30% - Ingredient variety
    // 30% - Ingredient rotation
    
    const recipeUniqueness = (uniqueRecipes / totalRecipes) * 40;
    const ingredientVariety = Math.min(uniqueIngredients / 20, 1) * 30; // 20+ ingredients = max
    const rotation = rotationScore * 30;
    
    return recipeUniqueness + ingredientVariety + rotation;
  }
  
  private generateReport(): void {
    console.log();
    console.log('='.repeat(80));
    console.log('VARIETY AUDIT RESULTS');
    console.log('='.repeat(80));
    console.log();
    
    let totalScore = 0;
    let count = 0;
    
    for (const [species, metrics] of this.results) {
      console.log(`${species.toUpperCase()}`);
      console.log('-'.repeat(80));
      console.log(`Total recipes generated: ${metrics.totalRecipes}`);
      console.log(`Unique recipes: ${metrics.uniqueRecipes} (${((metrics.uniqueRecipes / metrics.totalRecipes) * 100).toFixed(1)}%)`);
      console.log(`Duplicate recipes: ${metrics.duplicateRecipes}`);
      console.log(`Unique ingredients used: ${metrics.uniqueIngredients.size}`);
      console.log(`Avg ingredients per recipe: ${metrics.averageIngredientsPerRecipe.toFixed(1)}`);
      console.log(`Ingredient rotation score: ${(metrics.ingredientRotation * 100).toFixed(1)}%`);
      console.log(`Overall diversity score: ${metrics.diversityScore.toFixed(1)}/100`);
      
      // Show most/least used ingredients
      const sorted = Array.from(metrics.ingredientFrequency.entries())
        .sort((a, b) => b[1] - a[1]);
      
      console.log();
      console.log(`Most used ingredients:`);
      sorted.slice(0, 5).forEach(([ing, count]) => {
        console.log(`  - ${ing}: ${count} times (${((count / metrics.totalRecipes) * 100).toFixed(1)}%)`);
      });
      
      console.log();
      console.log(`Least used ingredients:`);
      sorted.slice(-5).reverse().forEach(([ing, count]) => {
        console.log(`  - ${ing}: ${count} times (${((count / metrics.totalRecipes) * 100).toFixed(1)}%)`);
      });
      
      console.log();
      
      totalScore += metrics.diversityScore;
      count++;
    }
    
    const avgScore = totalScore / count;
    
    console.log('='.repeat(80));
    console.log('OVERALL ASSESSMENT');
    console.log('='.repeat(80));
    console.log();
    console.log(`Average diversity score: ${avgScore.toFixed(1)}/100`);
    console.log();
    
    if (avgScore >= 80) {
      console.log('✅ EXCELLENT - Recipes show high variety and good rotation');
    } else if (avgScore >= 60) {
      console.log('⚠️  GOOD - Recipes have decent variety but could be improved');
    } else if (avgScore >= 40) {
      console.log('⚠️  FAIR - Recipes show some repetition, needs improvement');
    } else {
      console.log('❌ POOR - Recipes are too repetitive, major improvements needed');
    }
    
    console.log();
    this.generateRecommendations(avgScore);
    
    // Save detailed report
    this.saveDetailedReport();
  }
  
  private generateRecommendations(avgScore: number): void {
    console.log('RECOMMENDATIONS:');
    console.log('-'.repeat(80));
    
    for (const [species, metrics] of this.results) {
      if (metrics.diversityScore < 60) {
        console.log(`\n${species}:`);
        
        if (metrics.uniqueRecipes / metrics.totalRecipes < 0.7) {
          console.log('  - Too many duplicate recipes - increase randomization');
        }
        
        if (metrics.uniqueIngredients.size < 15) {
          console.log('  - Limited ingredient pool - expand available ingredients');
        }
        
        if (metrics.ingredientRotation < 0.5) {
          console.log('  - Poor ingredient rotation - some ingredients overused');
          
          // Find overused ingredients
          const sorted = Array.from(metrics.ingredientFrequency.entries())
            .sort((a, b) => b[1] - a[1]);
          
          const overused = sorted.filter(([_, count]) => 
            count / metrics.totalRecipes > 0.5
          );
          
          if (overused.length > 0) {
            console.log(`    Overused: ${overused.map(([ing]) => ing).join(', ')}`);
          }
        }
      }
    }
    
    console.log();
  }
  
  private saveDetailedReport(): void {
    const report = {
      timestamp: new Date().toISOString(),
      results: Array.from(this.results.entries()).map(([species, metrics]) => ({
        species,
        totalRecipes: metrics.totalRecipes,
        uniqueRecipes: metrics.uniqueRecipes,
        duplicateRecipes: metrics.duplicateRecipes,
        uniqueIngredients: metrics.uniqueIngredients.size,
        averageIngredientsPerRecipe: metrics.averageIngredientsPerRecipe,
        ingredientRotation: metrics.ingredientRotation,
        diversityScore: metrics.diversityScore,
        ingredientFrequency: Array.from(metrics.ingredientFrequency.entries()),
      })),
    };
    
    const outputPath = path.join(process.cwd(), 'RECIPE_VARIETY_AUDIT.json');
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');
    
    console.log(`Detailed report saved to: ${outputPath}`);
  }
}

// Run the audit
const audit = new RecipeVarietyAudit();
audit.runAudit().catch(console.error);
