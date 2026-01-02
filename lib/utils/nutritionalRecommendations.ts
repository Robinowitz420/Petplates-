// lib/utils/nutritionalRecommendations.ts
// Maps nutritional deficiencies to recommended supplements and ingredients

import { petSupplements, type Supplement } from '@/lib/data/supplements';
import { getVettedProduct } from '@/lib/data/vetted-products';
import { ensureSellerId } from '@/lib/utils/affiliateLinks';

export interface RecommendedSupplement {
  name: string;
  description: string;
  benefits: string;
  addressesDeficiency: string;
  defaultAmount: string;
  amazonLink?: string;
  asinLink?: string;
  isIngredient?: boolean;
  productName?: string;
  vetNote?: string;
}

/**
 * Map nutritional gaps to recommended supplements/ingredients
 */
export function getRecommendationsForDeficiency(
  deficiency: string,
  species: 'dog' | 'cat' | 'bird' | 'reptile' | 'pocket-pet',
  healthConcerns: string[] = []
): RecommendedSupplement[] {
  const recommendations: RecommendedSupplement[] = [];
  const lowerDeficiency = deficiency.toLowerCase();

  const isCodLiverOil = (value: string | undefined | null): boolean =>
    /\bcod\s+liver\s+oil\b/i.test(String(value || ''));

  // Normalize species for supplement lookup
  const supplementSpecies = species === 'pocket-pet' ? 'pocket-pets' : 
                            species === 'reptile' ? 'reptiles' : 
                            species;

  // Map deficiency patterns to supplement categories
  const deficiencyMappings: Record<string, string[]> = {
    'protein': ['allergy-support', 'digestive-health'],
    'calcium': ['joint-mobility', 'digestive-health'],
    'phosphorus': ['joint-mobility'],
    'ca:p': ['joint-mobility'],
    'taurine': ['allergy-support'],
    'fiber': ['digestive-health', 'weight-management'],
    'vitamin': ['skin-coat'],
    'omega': ['skin-coat', 'allergy-support'],
    'fat': ['skin-coat', 'allergy-support'],
  };

  // Find matching supplement categories
  const matchingCategories: string[] = [];
  for (const [pattern, categories] of Object.entries(deficiencyMappings)) {
    if (lowerDeficiency.includes(pattern)) {
      matchingCategories.push(...categories);
    }
  }

  // Get supplements from petSupplements data
  const speciesSupplements = petSupplements[supplementSpecies as keyof typeof petSupplements];
  if (speciesSupplements) {
    for (const category of matchingCategories) {
      const categorySupplements = speciesSupplements[category as keyof typeof speciesSupplements];
      if (Array.isArray(categorySupplements)) {
        for (const supplement of categorySupplements) {
          // Hard safety block: never recommend Cod Liver Oil (vitamin A/D overdose risk)
          if (isCodLiverOil(supplement.name) || isCodLiverOil(supplement.description) || isCodLiverOil(supplement.amazonLink)) {
            continue;
          }

          // Check if vetted product exists
          // Map omega-3 / salmon oil style supplements to the vetted "fish oil" entry
          const lowerName = supplement.name.toLowerCase();
          const lowerDesc = supplement.description.toLowerCase();
          const isFishOilLike =
            lowerName.includes('omega') ||
            lowerName.includes('fish oil') ||
            lowerName.includes('salmon oil') ||
            lowerDesc.includes('omega') ||
            lowerDesc.includes('fish oil') ||
            lowerDesc.includes('salmon') ||
            lowerDesc.includes('sardine') ||
            lowerDesc.includes('anchovy');

          const vettedProduct = isFishOilLike ? getVettedProduct('fish oil') : getVettedProduct(supplement.name);
          const bestLink = ensureSellerId(vettedProduct?.asinLink || supplement.amazonLink);
          
          recommendations.push({
            name: supplement.name,
            description: supplement.description,
            benefits: supplement.benefits,
            addressesDeficiency: deficiency,
            defaultAmount: 'As directed',
            amazonLink: supplement.amazonLink,
            asinLink: bestLink,
            productName: vettedProduct?.productName || supplement.name,
            vetNote: vettedProduct?.vetNote,
          });
        }
      }
    }
  }

  // Species-specific ingredient recommendations
  if (lowerDeficiency.includes('protein') && species === 'cat') {
    recommendations.push({
      name: 'Taurine Supplement',
      description: 'Essential amino acid for cats',
      benefits: 'Prevents taurine deficiency, supports heart and eye health',
      addressesDeficiency: 'Low protein / Taurine deficiency',
      defaultAmount: '250-500mg per day',
      isIngredient: false,
    });
  }

  if (lowerDeficiency.includes('calcium') || lowerDeficiency.includes('ca:p')) {
    if (species === 'reptile' || species === 'bird') {
      recommendations.push({
        name: 'Calcium with Vitamin D3',
        description: 'Essential for bone health',
        benefits: 'Prevents metabolic bone disease, supports proper Ca:P ratio',
        addressesDeficiency: 'Calcium deficiency / Ca:P imbalance',
        defaultAmount: 'Lightly dust food 2-3x per week',
        isIngredient: false,
      });
    } else {
      recommendations.push({
        name: 'Calcium Supplement',
        description: 'Calcium for bone and dental health',
        benefits: 'Supports proper Ca:P ratio, bone strength',
        addressesDeficiency: 'Calcium deficiency / Ca:P imbalance',
        defaultAmount: 'As directed on package',
        isIngredient: false,
      });
    }
  }

  if (lowerDeficiency.includes('fiber')) {
    recommendations.push({
      name: 'Pumpkin Powder',
      description: 'Natural fiber source',
      benefits: 'Promotes digestive regularity and satiety',
      addressesDeficiency: 'Low fiber',
      defaultAmount: '1-2 tsp per meal',
      isIngredient: true,
    });
  }

  // Health concern-based recommendations
  if (healthConcerns.includes('joint-health') || healthConcerns.includes('joint-mobility')) {
    recommendations.push({
      name: 'Glucosamine & Chondroitin',
      description: 'Joint health supplements',
      benefits: 'Supports cartilage health and joint mobility',
      addressesDeficiency: 'Joint support needed',
      defaultAmount: 'As directed on package',
      isIngredient: false,
    });
  }

  // Remove duplicates based on name
  const uniqueRecommendations = recommendations.filter((rec, index, self) =>
    index === self.findIndex(r => r.name === rec.name)
  );

  return uniqueRecommendations;
}

function normalizeHealthConcern(value: string): string {
  const raw = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/\s+/g, '-');

  if (!raw) return '';

  const map: Record<string, string> = {
    'allergy-support': 'allergy-support',
    allergies: 'allergy-support',
    allergy: 'allergy-support',
    'weight-management': 'weight-management',
    obesity: 'weight-management',
    weight: 'weight-management',
    'joint-health': 'joint-mobility',
    'joint-&-mobility': 'joint-mobility',
    arthritis: 'joint-mobility',
    'joint-mobility': 'joint-mobility',
    'digestive-health': 'digestive-health',
    digestive: 'digestive-health',
    'sensitive-stomach': 'digestive-health',
    'skin-coat': 'skin-coat',
    'skin-and-coat': 'skin-coat',
    'skin-&-coat': 'skin-coat',
    'dental-health': 'dental-health',
    dental: 'dental-health',
    'kidney-urinary': 'kidney-urinary',
    kidney: 'kidney-urinary',
    'kidney/urinary-support': 'kidney-urinary',
  };

  return map[raw] || raw;
}

function getCategoryRecommendations(
  categories: string[],
  species: 'dog' | 'cat' | 'bird' | 'reptile' | 'pocket-pet',
  addressesDeficiency: string
): RecommendedSupplement[] {
  const recommendations: RecommendedSupplement[] = [];

  const isCodLiverOil = (value: string | undefined | null): boolean =>
    /\bcod\s+liver\s+oil\b/i.test(String(value || ''));

  const supplementSpecies = species === 'pocket-pet' ? 'pocket-pets' : species === 'reptile' ? 'reptiles' : species;
  const speciesSupplements = petSupplements[supplementSpecies as keyof typeof petSupplements];
  if (!speciesSupplements) return recommendations;

  for (const category of categories) {
    const categorySupplements = speciesSupplements[category as keyof typeof speciesSupplements];
    if (!Array.isArray(categorySupplements)) continue;

    for (const supplement of categorySupplements) {
      if (isCodLiverOil(supplement.name) || isCodLiverOil(supplement.description) || isCodLiverOil(supplement.amazonLink)) {
        continue;
      }

      const lowerName = String(supplement.name || '').toLowerCase();
      const lowerDesc = String(supplement.description || '').toLowerCase();
      const isFishOilLike =
        lowerName.includes('omega') ||
        lowerName.includes('fish oil') ||
        lowerName.includes('salmon oil') ||
        lowerDesc.includes('omega') ||
        lowerDesc.includes('fish oil') ||
        lowerDesc.includes('salmon') ||
        lowerDesc.includes('sardine') ||
        lowerDesc.includes('anchovy');

      const vettedProduct = isFishOilLike ? getVettedProduct('fish oil') : getVettedProduct(supplement.name);
      const bestLink = ensureSellerId(vettedProduct?.asinLink || supplement.amazonLink);

      recommendations.push({
        name: supplement.name,
        description: supplement.description,
        benefits: supplement.benefits,
        addressesDeficiency,
        defaultAmount: 'As directed',
        amazonLink: supplement.amazonLink,
        asinLink: bestLink,
        productName: vettedProduct?.productName || supplement.name,
        vetNote: vettedProduct?.vetNote,
      });
    }
  }

  return recommendations;
}

/**
 * Get all recommendations for a recipe based on nutritional gaps
 */
export function getRecommendationsForRecipe(
  nutritionalGaps: string[],
  species: 'dog' | 'cat' | 'bird' | 'reptile' | 'pocket-pet',
  healthConcerns: string[] = []
): RecommendedSupplement[] {
  const allRecommendations: RecommendedSupplement[] = [];

  const normalizedGaps = Array.isArray(nutritionalGaps)
    ? nutritionalGaps.map((g) => String(g || '').trim()).filter(Boolean)
    : [];

  for (const gap of normalizedGaps) {
    const recommendations = getRecommendationsForDeficiency(gap, species, healthConcerns);
    allRecommendations.push(...recommendations);
  }

  const normalizedConcerns = Array.isArray(healthConcerns)
    ? healthConcerns.map(normalizeHealthConcern).filter(Boolean)
    : [];

  if (normalizedConcerns.length > 0) {
    allRecommendations.push(
      ...getCategoryRecommendations(
        normalizedConcerns,
        species,
        `Health concern support: ${normalizedConcerns.join(', ')}`
      )
    );
  }

  // Remove duplicates
  const uniqueRecommendations = allRecommendations.filter((rec, index, self) =>
    index === self.findIndex(r => r.name === rec.name)
  );

  return uniqueRecommendations;
}

