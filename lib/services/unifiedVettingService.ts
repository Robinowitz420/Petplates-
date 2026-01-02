// lib/services/unifiedVettingService.ts
// Unified vetting service combining brand analysis + Amazon scraping

import { BrandBasedVetter } from './brandBasedVetter';
import { getVettedProduct } from '../data/vetted-products';
import fs from 'fs';
import path from 'path';

interface VettingResult {
  ingredient: string;
  status: 'vetted' | 'needs_vetting' | 'generic';
  vettedProduct?: any;
  brandMatches?: any[];
  amazonMatches?: any[];
  confidence?: number;
  recommendation?: string;
}

export class UnifiedVettingService {
  private brandVetter: BrandBasedVetter;
  
  constructor() {
    this.brandVetter = new BrandBasedVetter();
  }
  
  async getIngredientStatus(ingredientName: string): Promise<VettingResult> {
    // Check if already vetted
    const vetted = getVettedProduct(ingredientName);
    if (vetted) {
      return {
        ingredient: ingredientName,
        status: 'vetted',
        vettedProduct: vetted,
        confidence: 1.0
      };
    }
    
    // Check if generic
    if (this.isGenericIngredient(ingredientName)) {
      return {
        ingredient: ingredientName,
        status: 'generic',
        confidence: 1.0
      };
    }
    
    // Get brand matches
    const brandMatches = this.brandVetter.findBrandMatches(ingredientName);
    
    // Get Amazon matches (if available)
    const amazonMatches = await this.getAmazonMatches(ingredientName);
    
    // Calculate overall confidence
    const confidence = this.calculateOverallConfidence(brandMatches, amazonMatches);
    
    // Generate recommendation
    let recommendation = '';
    if (amazonMatches.length > 0 && amazonMatches[0].score >= 0.8) {
      recommendation = `Use Amazon product: ${amazonMatches[0].name} (${(amazonMatches[0].score * 100).toFixed(0)}% match)`;
    } else if (brandMatches.length > 0 && brandMatches[0].confidence >= 0.7) {
      recommendation = `Use brand: ${brandMatches[0].productName} (${(brandMatches[0].confidence * 100).toFixed(0)}% confidence)`;
    } else {
      recommendation = 'Manual review needed';
    }
    
    return {
      ingredient: ingredientName,
      status: 'needs_vetting',
      brandMatches: brandMatches.slice(0, 3),
      amazonMatches: amazonMatches.slice(0, 3),
      confidence,
      recommendation
    };
  }
  
  async getAllIngredientsStatus(ingredients: string[]): Promise<VettingResult[]> {
    const statuses: VettingResult[] = [];
    
    for (const ingredient of ingredients) {
      const status = await this.getIngredientStatus(ingredient);
      statuses.push(status);
    }
    
    return statuses;
  }
  
  generateVettedProductFromBrand(ingredient: string, brandMatch: any): any {
    return this.brandVetter.generateVettedProduct(ingredient, brandMatch);
  }
  
  generateVettedProductFromAmazon(ingredient: string, amazonProduct: any): any {
    return {
      productName: amazonProduct.name,
      amazonLink: amazonProduct.url,
      vetNote: `Amazon-discovered product. Rating: ${amazonProduct.rating}⭐ (${amazonProduct.reviewCount} reviews). Score: ${((amazonProduct.score || 0) * 100).toFixed(0)}%.`,
      category: this.determineCategory(ingredient),
      commissionRate: 0.03,
      confidence: amazonProduct.score || 0.7,
      source: 'amazon_scraper',
      asin: amazonProduct.asin
    };
  }
  
  private async getAmazonMatches(ingredientName: string): Promise<any[]> {
    try {
      // Check for cached Amazon results
      const resultsDir = path.join(__dirname, '../../pet-ingredient-scraper/results');
      const files = fs.readdirSync(resultsDir)
        .filter(f => f.startsWith('amazon-products-') && f.endsWith('.json'))
        .sort()
        .reverse();
      
      if (files.length > 0) {
        const latestFile = path.join(resultsDir, files[0]);
        const results = JSON.parse(fs.readFileSync(latestFile, 'utf-8'));
        return results[ingredientName] || [];
      }
    } catch (_error) {
      // No Amazon results available
    }
    
    return [];
  }
  
  private calculateOverallConfidence(brandMatches: any[], amazonMatches: any[]): number {
    if (amazonMatches.length > 0) {
      return Math.max(...amazonMatches.map(m => m.score || 0));
    }
    
    if (brandMatches.length > 0) {
      return Math.max(...brandMatches.map(m => m.confidence || 0));
    }
    
    return 0;
  }
  
  private isGenericIngredient(name: string): boolean {
    const generics = [
      'water', 'salt', 'eggs', 'carrots', 'celery', 'spinach', 'kale',
      'blueberries', 'apples', 'sweet potato', 'pumpkin', 'broccoli',
      'cauliflower', 'green beans', 'peas', 'rice', 'oats', 'quinoa',
      'brown rice', 'white rice', 'bananas', 'strawberries', 'egg'
    ];
    
    const normalized = name.toLowerCase();
    return generics.some(generic => normalized.includes(generic));
  }
  
  private determineCategory(ingredient: string): 'Meat' | 'Supplement' | 'Carb' | 'Vegetable' | 'Oil' | 'Seed' | 'Fruit' | 'Insect' | 'Hay' | 'Pellet' {
    const normalized = ingredient.toLowerCase();
    
    if (normalized.includes('heart') || normalized.includes('liver') || normalized.includes('kidney')) {
      return 'Meat';
    }
    if (normalized.includes('oil')) {
      return 'Oil';
    }
    if (normalized.includes('powder') || normalized.includes('supplement') || normalized.includes('kelp')) {
      return 'Supplement';
    }
    if (normalized.includes('seed') || normalized.includes('grain') || normalized.includes('buckwheat') || normalized.includes('quinoa')) {
      return 'Carb';
    }
    
    return 'Meat';
  }
}

