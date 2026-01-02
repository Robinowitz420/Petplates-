// lib/services/brandBasedVetter.ts
// Brand-based product suggestions using analyze-brands.js data

interface BrandMatch {
  ingredient: string;
  brand: string;
  qualityScore: number;
  productName: string;
  confidence: number;
  category: string;
  specialties: string[];
  priceRange: string;
}

interface BrandData {
  category: string;
  qualityScore: number;
  vetRecommended: boolean;
  specialties: string[];
  priceRange: string;
  affiliateLink?: string;
}

// Brand database from analyze-brands.js
const BRAND_DATABASE: Record<string, BrandData> = {
  'Fresh Is Best': {
    category: 'freeze-dried',
    qualityScore: 9.2,
    vetRecommended: true,
    specialties: ['single-ingredient', 'human-grade', 'raw alternative'],
    priceRange: '$$',
    affiliateLink: 'https://www.freshisbest.com/'
  },
  'Vital Essentials': {
    category: 'freeze-dried',
    qualityScore: 9.0,
    vetRecommended: true,
    specialties: ['organ meats', 'grain-free', 'natural supplements'],
    priceRange: '$$',
    affiliateLink: 'https://www.vitalessentialsraw.com/'
  },
  'US Wellness Meats': {
    category: 'raw',
    qualityScore: 9.1,
    vetRecommended: true,
    specialties: ['grass-fed', 'organic', 'human-grade'],
    priceRange: '$$',
    affiliateLink: 'https://grasslandbeef.com/'
  },
  'Raw Paws': {
    category: 'raw',
    qualityScore: 8.9,
    vetRecommended: true,
    specialties: ['novel proteins', 'limited ingredients', 'digestive health'],
    priceRange: '$$',
    affiliateLink: 'https://www.rawpaws.pet/'
  },
  'Grizzly Salmon Oil': {
    category: 'supplement',
    qualityScore: 9.3,
    vetRecommended: true,
    specialties: ['wild-caught salmon', 'omega-3 concentrate', 'skin/coat health'],
    priceRange: '$',
    affiliateLink: 'https://www.grizzlys.com/'
  },
  'Primal': {
    category: 'raw',
    qualityScore: 8.7,
    vetRecommended: true,
    specialties: ['freeze-dried', 'complete nutrition', 'grain-free'],
    priceRange: '$$',
    affiliateLink: 'https://www.primalpetfoods.com/'
  },
  'Stella & Chewy\'s': {
    category: 'freeze-dried',
    qualityScore: 8.8,
    vetRecommended: true,
    specialties: ['raw-coated', 'grain-free', 'probiotics'],
    priceRange: '$$',
    affiliateLink: 'https://www.stellaandchewys.com/'
  },
  'Northwest Naturals': {
    category: 'freeze-dried',
    qualityScore: 8.8,
    vetRecommended: true,
    specialties: ['regional ingredients', 'sustainable', 'limited ingredients'],
    priceRange: '$$',
    affiliateLink: 'https://www.nwnaturals.com/'
  }
};

// Ingredient to brand mapping based on specialties
const INGREDIENT_BRAND_MAP: Record<string, string[]> = {
  // Proteins
  'chicken': ['Fresh Is Best', 'US Wellness Meats', 'Vital Essentials'],
  'chicken breast': ['Fresh Is Best', 'US Wellness Meats'],
  'ground chicken': ['US Wellness Meats', 'Raw Paws'],
  'turkey': ['US Wellness Meats', 'Raw Paws'],
  'ground turkey': ['US Wellness Meats', 'Raw Paws'],
  'beef': ['US Wellness Meats', 'Primal'],
  'ground beef': ['US Wellness Meats', 'Primal'],
  'lamb': ['Raw Paws', 'US Wellness Meats'],
  'ground lamb': ['Raw Paws', 'US Wellness Meats'],
  'duck': ['Raw Paws', 'Vital Essentials'],
  'venison': ['US Wellness Meats', 'Primal'],
  'rabbit': ['Raw Paws', 'US Wellness Meats'],
  'salmon': ['Vital Essentials', 'Fresh Is Best'],
  'fish': ['Vital Essentials', 'Fresh Is Best'],
  
  // Organs
  'heart': ['Vital Essentials', 'US Wellness Meats', 'Raw Paws'],
  'duck hearts': ['Vital Essentials', 'Raw Paws'],
  'chicken hearts': ['Vital Essentials', 'US Wellness Meats'],
  'liver': ['Vital Essentials', 'US Wellness Meats', 'Raw Paws'],
  'chicken liver': ['Vital Essentials', 'US Wellness Meats'],
  'lamb liver': ['Raw Paws', 'US Wellness Meats'],
  'kidney': ['Vital Essentials', 'US Wellness Meats'],
  'organ': ['Vital Essentials', 'US Wellness Meats'],
  
  // Oils & Supplements
  'salmon oil': ['Grizzly Salmon Oil'],
  'fish oil': ['Grizzly Salmon Oil'],
  'omega-3': ['Grizzly Salmon Oil'],
  'coconut oil': ['US Wellness Meats'],
  'flaxseed oil': ['US Wellness Meats'],
  'kelp powder': ['Vital Essentials', 'Northwest Naturals'],
  'supplement': ['Vital Essentials', 'Northwest Naturals']
};

export class BrandBasedVetter {
  findBrandMatches(ingredient: string): BrandMatch[] {
    const matches: BrandMatch[] = [];
    const normalizedIngredient = this.normalizeIngredientName(ingredient);
    
    // Check direct ingredient mapping
    const mappedBrands = INGREDIENT_BRAND_MAP[normalizedIngredient] || 
                        this.findBrandsByKeyword(normalizedIngredient);
    
    if (mappedBrands.length > 0) {
      mappedBrands.forEach(brandName => {
        const brandData = BRAND_DATABASE[brandName];
        if (brandData) {
          matches.push({
            ingredient,
            brand: brandName,
            qualityScore: brandData.qualityScore,
            productName: this.generateProductName(brandName, ingredient),
            confidence: this.calculateConfidence(ingredient, brandData, normalizedIngredient),
            category: brandData.category,
            specialties: brandData.specialties,
            priceRange: brandData.priceRange
          });
        }
      });
    }
    
    return matches.sort((a, b) => b.confidence - a.confidence);
  }
  
  private findBrandsByKeyword(ingredient: string): string[] {
    const brands: string[] = [];
    const keywords = ingredient.split(' ');
    
    Object.entries(BRAND_DATABASE).forEach(([brandName, brandData]) => {
      // Check if brand specialties match ingredient
      const matchesSpecialty = brandData.specialties.some(specialty =>
        keywords.some(keyword => specialty.toLowerCase().includes(keyword.toLowerCase()))
      );
      
      if (matchesSpecialty) {
        brands.push(brandName);
      }
    });
    
    return brands;
  }
  
  private generateProductName(brand: string, ingredient: string): string {
    // Clean ingredient name
    const cleanIngredient = ingredient
      .replace(/\(.*?\)/g, '')
      .trim();
    
    return `${brand} ${cleanIngredient}`;
  }
  
  private calculateConfidence(ingredient: string, brandData: BrandData, normalizedIngredient: string): number {
    let confidence = 0.5;
    
    // Higher confidence for higher quality scores
    if (brandData.qualityScore >= 9.0) confidence += 0.2;
    if (brandData.qualityScore >= 8.5) confidence += 0.1;
    
    // Higher confidence for vet recommended
    if (brandData.vetRecommended) confidence += 0.1;
    
    // Higher confidence for direct ingredient matches
    if (INGREDIENT_BRAND_MAP[normalizedIngredient]) {
      confidence += 0.1;
    }
    
    // Higher confidence for organ meats (brand-specific)
    if (normalizedIngredient.includes('heart') || 
        normalizedIngredient.includes('liver') || 
        normalizedIngredient.includes('kidney')) {
      confidence += 0.1;
    }
    
    // Higher confidence if brand specialty matches ingredient
    const ingredientKeywords = normalizedIngredient.split(' ');
    const specialtyMatch = brandData.specialties.some(specialty =>
      ingredientKeywords.some(keyword => 
        specialty.toLowerCase().includes(keyword.toLowerCase())
      )
    );
    if (specialtyMatch) confidence += 0.1;
    
    return Math.min(0.95, confidence);
  }
  
  private normalizeIngredientName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\(.*?\)/g, '') // Remove parentheses
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  generateVettedProduct(ingredient: string, brandMatch: BrandMatch): any {
    const amazonLink = brandMatch.brand === 'Grizzly Salmon Oil'
      ? 'https://www.amazon.com/s?k=Grizzly+Salmon+Plus+Omega-3+Oil&tag=robinfrench-20'
      : `https://www.amazon.com/s?k=${encodeURIComponent(brandMatch.productName)}&tag=robinfrench-20`;
    
    return {
      productName: brandMatch.productName,
      amazonLink,
      vetNote: `${brandMatch.brand} (${brandMatch.qualityScore}/10 quality score). ${brandMatch.specialties.slice(0, 2).join(', ')}. Veterinary recommended brand.`,
      category: this.getCategory(ingredient),
      commissionRate: 0.03,
      confidence: brandMatch.confidence,
      source: 'brand_analysis'
    };
  }
  
  private getCategory(ingredient: string): 'Meat' | 'Supplement' | 'Carb' | 'Vegetable' | 'Oil' | 'Seed' | 'Fruit' | 'Insect' | 'Hay' | 'Pellet' {
    const normalized = ingredient.toLowerCase();
    
    if (normalized.includes('heart') || normalized.includes('liver') || normalized.includes('kidney') || normalized.includes('organ')) {
      return 'Meat';
    }
    if (normalized.includes('oil') || normalized.includes('fat')) {
      return 'Oil';
    }
    if (normalized.includes('supplement') || normalized.includes('powder') || normalized.includes('capsule') || normalized.includes('kelp')) {
      return 'Supplement';
    }
    if (normalized.includes('seed') || normalized.includes('grain') || normalized.includes('flour') || normalized.includes('buckwheat') || normalized.includes('quinoa')) {
      return 'Carb';
    }
    
    return 'Meat'; // Default for proteins
  }
}

