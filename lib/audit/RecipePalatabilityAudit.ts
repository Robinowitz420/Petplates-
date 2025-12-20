// Recipe Palatability Audit - Analyze palatability scoring system
// Verifies scores make sense and high-palatability ingredients are preferred

import { getIngredientsForSpecies, type Ingredient, type Species } from '@/lib/data/ingredients';
import { RecipeBuilder, GenerationConstraints } from '../generator/RecipeBuilder';
import * as fs from 'fs';
import * as path from 'path';

interface PalatabilityMetrics {
  species: Species;
  totalIngredients: number;
  avgPalatability: number;
  palatabilityDistribution: {
    veryHigh: number; // 9-10
    high: number;     // 7-8
    medium: number;   // 5-6
    low: number;      // 3-4
    veryLow: number;  // 0-2
  };
  topIngredients: Array<{ name: string; score: number }>;
  bottomIngredients: Array<{ name: string; score: number }>;
  recipePalatabilityScores: number[];
  avgRecipePalatability: number;
}

export class RecipePalatabilityAudit {
  private results: Map<Species, PalatabilityMetrics> = new Map();
  
  async runAudit(): Promise<void> {
    console.log('='.repeat(80));
    console.log('RECIPE PALATABILITY AUDIT');
    console.log('='.repeat(80));
    console.log();
    
    const species: Species[] = ['dogs', 'cats', 'birds', 'reptiles', 'pocket-pets'];
    
    for (const sp of species) {
      console.log(`Analyzing ${sp}...`);
      await this.analyzeSpeciesPalatability(sp);
    }
    
    this.generateReport();
  }
  
  private async analyzeSpeciesPalatability(species: Species): Promise<void> {
    // Get all ingredients for this species
    const ingredients = getIngredientsForSpecies(species);
    
    // Analyze palatability scores
    const palatabilityScores = ingredients
      .map(ing => ing.palatability?.[species] || 0)
      .filter(score => score > 0);
    
    const avgPalatability = palatabilityScores.reduce((a, b) => a + b, 0) / palatabilityScores.length;
    
    // Distribution
    const distribution = {
      veryHigh: palatabilityScores.filter(s => s >= 9).length,
      high: palatabilityScores.filter(s => s >= 7 && s < 9).length,
      medium: palatabilityScores.filter(s => s >= 5 && s < 7).length,
      low: palatabilityScores.filter(s => s >= 3 && s < 5).length,
      veryLow: palatabilityScores.filter(s => s < 3).length,
    };
    
    // Top and bottom ingredients
    const sorted = ingredients
      .map(ing => ({ name: ing.name, score: ing.palatability?.[species] || 0 }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);
    
    const topIngredients = sorted.slice(0, 10);
    const bottomIngredients = sorted.slice(-10).reverse();
    
    // Generate recipes and check their palatability
    const recipePalatabilityScores = await this.generateAndScoreRecipes(species, 20);
    const avgRecipePalatability = recipePalatabilityScores.reduce((a, b) => a + b, 0) / recipePalatabilityScores.length;
    
    this.results.set(species, {
      species,
      totalIngredients: ingredients.length,
      avgPalatability,
      palatabilityDistribution: distribution,
      topIngredients,
      bottomIngredients,
      recipePalatabilityScores,
      avgRecipePalatability,
    });
  }
  
  private async generateAndScoreRecipes(species: Species, count: number): Promise<number[]> {
    const scores: number[] = [];
    
    for (let i = 0; i < count; i++) {
      const constraints: GenerationConstraints = {
        species,
        lifeStage: 'adult',
        petWeightKg: this.getTypicalWeight(species),
        healthConcerns: [],
        allergies: [],
      };
      
      try {
        const builder = new RecipeBuilder(constraints, 'standard', 'medium');
        const recipe = await builder.generate();
        
        if (recipe && recipe.ingredients.length > 0) {
          // Calculate recipe palatability (weighted average)
          let totalPalatability = 0;
          let totalWeight = 0;
          
          for (const portioned of recipe.ingredients) {
            const palatability = portioned.ingredient.palatability?.[species] || 5;
            totalPalatability += palatability * portioned.grams;
            totalWeight += portioned.grams;
          }
          
          const avgPalatability = totalWeight > 0 ? totalPalatability / totalWeight : 5;
          scores.push(avgPalatability);
        }
      } catch (error) {
        // Skip failed recipes
      }
    }
    
    return scores;
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
  
  private generateReport(): void {
    console.log();
    console.log('='.repeat(80));
    console.log('PALATABILITY AUDIT RESULTS');
    console.log('='.repeat(80));
    console.log();
    
    for (const [species, metrics] of this.results) {
      console.log(`${species.toUpperCase()}`);
      console.log('-'.repeat(80));
      console.log(`Total ingredients: ${metrics.totalIngredients}`);
      console.log(`Average palatability: ${metrics.avgPalatability.toFixed(2)}/10`);
      console.log();
      
      console.log('Palatability distribution:');
      console.log(`  Very High (9-10): ${metrics.palatabilityDistribution.veryHigh} (${((metrics.palatabilityDistribution.veryHigh / metrics.totalIngredients) * 100).toFixed(1)}%)`);
      console.log(`  High (7-8):       ${metrics.palatabilityDistribution.high} (${((metrics.palatabilityDistribution.high / metrics.totalIngredients) * 100).toFixed(1)}%)`);
      console.log(`  Medium (5-6):     ${metrics.palatabilityDistribution.medium} (${((metrics.palatabilityDistribution.medium / metrics.totalIngredients) * 100).toFixed(1)}%)`);
      console.log(`  Low (3-4):        ${metrics.palatabilityDistribution.low} (${((metrics.palatabilityDistribution.low / metrics.totalIngredients) * 100).toFixed(1)}%)`);
      console.log(`  Very Low (0-2):   ${metrics.palatabilityDistribution.veryLow} (${((metrics.palatabilityDistribution.veryLow / metrics.totalIngredients) * 100).toFixed(1)}%)`);
      console.log();
      
      console.log('Top 10 most palatable ingredients:');
      metrics.topIngredients.forEach((ing, idx) => {
        console.log(`  ${idx + 1}. ${ing.name}: ${ing.score}/10`);
      });
      console.log();
      
      console.log('Bottom 10 least palatable ingredients:');
      metrics.bottomIngredients.forEach((ing, idx) => {
        console.log(`  ${idx + 1}. ${ing.name}: ${ing.score}/10`);
      });
      console.log();
      
      console.log(`Recipe palatability (${metrics.recipePalatabilityScores.length} recipes tested):`);
      console.log(`  Average: ${metrics.avgRecipePalatability.toFixed(2)}/10`);
      console.log(`  Min: ${Math.min(...metrics.recipePalatabilityScores).toFixed(2)}/10`);
      console.log(`  Max: ${Math.max(...metrics.recipePalatabilityScores).toFixed(2)}/10`);
      console.log();
      
      // Check if recipes favor high-palatability ingredients
      const ingredientAvg = metrics.avgPalatability;
      const recipeAvg = metrics.avgRecipePalatability;
      const difference = recipeAvg - ingredientAvg;
      
      if (difference > 0.5) {
        console.log(`✅ Recipes favor high-palatability ingredients (+${difference.toFixed(2)} vs ingredient avg)`);
      } else if (difference < -0.5) {
        console.log(`⚠️  Recipes may not prioritize palatability enough (${difference.toFixed(2)} vs ingredient avg)`);
      } else {
        console.log(`✓ Recipes have balanced palatability (${difference > 0 ? '+' : ''}${difference.toFixed(2)} vs ingredient avg)`);
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
      
      // Check if palatability scores are well-distributed
      const veryHighPct = metrics.palatabilityDistribution.veryHigh / metrics.totalIngredients;
      const veryLowPct = metrics.palatabilityDistribution.veryLow / metrics.totalIngredients;
      
      if (veryHighPct < 0.1) {
        issues.push('Too few very high palatability ingredients - consider adding more treats/favorites');
      }
      
      if (veryLowPct > 0.3) {
        issues.push('Too many low palatability ingredients - may affect recipe appeal');
      }
      
      // Check if recipes prioritize palatability
      const difference = metrics.avgRecipePalatability - metrics.avgPalatability;
      if (difference < 0) {
        issues.push('Recipes not prioritizing high-palatability ingredients - increase palatability weight in scoring');
      }
      
      // Check palatability range
      if (metrics.avgPalatability < 5) {
        issues.push('Overall palatability too low - review ingredient scores');
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
        totalIngredients: metrics.totalIngredients,
        avgPalatability: metrics.avgPalatability,
        palatabilityDistribution: metrics.palatabilityDistribution,
        topIngredients: metrics.topIngredients,
        bottomIngredients: metrics.bottomIngredients,
        avgRecipePalatability: metrics.avgRecipePalatability,
        recipePalatabilityScores: metrics.recipePalatabilityScores,
      })),
    };
    
    const outputPath = path.join(process.cwd(), 'RECIPE_PALATABILITY_AUDIT.json');
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');
    
    console.log(`Detailed report saved to: ${outputPath}`);
    console.log();
  }
}

// Run the audit
const audit = new RecipePalatabilityAudit();
audit.runAudit().catch(console.error);
