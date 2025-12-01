// lib/data/avian-nutrition-standards.ts
// Avian nutrition standards from veterinary and zoological sources
// Based on Association of Zoos & Aquariums (AZA) and Merck Veterinary Manual

export interface NutrientRequirement {
  min?: number;
  max?: number;
  unit: string;
  source?: string;
  critical?: boolean;
  note?: string;
}

export interface AvianNutritionProfile {
  protein: NutrientRequirement;
  fat: NutrientRequirement;
  calcium: NutrientRequirement;
  phosphorus: NutrientRequirement;
  CaP_ratio: NutrientRequirement;
  vitaminA: NutrientRequirement;
  vitaminD3: NutrientRequirement;
  vitaminE?: NutrientRequirement;
  omega3?: NutrientRequirement;
  fiber?: NutrientRequirement;
}

export interface DeficiencyInfo {
  species: string;
  deficiency: string;
  symptoms: string;
  prevention: string;
  severity: 'mild' | 'moderate' | 'severe' | 'life-threatening';
}

export const AVIAN_NUTRITION_STANDARDS = {
  // AZA (Association of Zoos & Aquariums) Standards
  psittacines: {
    protein: { min: 12, max: 18, unit: '% DM', source: "AZA Parrot TAG" },
    fat: { min: 4, max: 10, unit: '% DM', note: "Higher for large parrots" },
    calcium: { min: 0.5, max: 1.2, unit: '% DM', critical: true },
    phosphorus: { min: 0.3, max: 0.7, unit: '% DM' },
    CaP_ratio: { min: 1.5, max: 2.5, unit: 'ratio', critical: true },
    vitaminA: { min: 5000, unit: 'IU/kg', deficiency: "Common in seed-only diets" },
    vitaminD3: { min: 1000, unit: 'IU/kg', note: "Requires UVB or supplementation" },
    vitaminE: { min: 50, unit: 'IU/kg', note: "Antioxidant support" },
    omega3: { min: 0.1, unit: '% DM', note: "For feather and skin health" },
    fiber: { min: 2, max: 8, unit: '% DM', note: "Digestive health" }
  } as AvianNutritionProfile,

  passerines: {
    protein: { min: 14, max: 20, unit: '% DM', source: "AZA Small Bird TAG" },
    fat: { min: 5, max: 12, unit: '% DM' },
    calcium: { min: 0.8, max: 1.5, unit: '% DM', critical: true },
    phosphorus: { min: 0.4, max: 0.8, unit: '% DM' },
    CaP_ratio: { min: 1.2, max: 2.0, unit: 'ratio', critical: true },
    vitaminA: { min: 8000, unit: 'IU/kg' },
    vitaminD3: { min: 1500, unit: 'IU/kg' }
  } as AvianNutritionProfile,

  raptors: {
    protein: { min: 16, max: 22, unit: '% DM', source: "AZA Raptor TAG" },
    fat: { min: 8, max: 15, unit: '% DM', note: "Higher energy requirements" },
    calcium: { min: 0.6, max: 1.0, unit: '% DM', critical: true },
    phosphorus: { min: 0.5, max: 0.9, unit: '% DM' },
    CaP_ratio: { min: 1.0, max: 1.8, unit: 'ratio', critical: true },
    vitaminA: { min: 6000, unit: 'IU/kg' },
    vitaminD3: { min: 1200, unit: 'IU/kg' }
  } as AvianNutritionProfile,

  // Merck Veterinary Manual Guidelines
  commonDeficiencies: [
    {
      species: "African Grey Parrot",
      deficiency: "Hypocalcemia",
      symptoms: "Seizures, weakness, egg binding",
      prevention: "Daily calcium-rich foods, UVB lighting",
      severity: "life-threatening"
    } as DeficiencyInfo,
    {
      species: "Cockatiel",
      deficiency: "Vitamin A",
      symptoms: "Respiratory issues, poor feather quality",
      prevention: "Orange vegetables, leafy greens",
      severity: "severe"
    } as DeficiencyInfo,
    {
      species: "Budgerigar",
      deficiency: "Iodine",
      symptoms: "Goiter, breathing difficulties",
      prevention: "Iodine blocks, varied diet",
      severity: "moderate"
    } as DeficiencyInfo,
    {
      species: "Amazon Parrot",
      deficiency: "Vitamin D3",
      symptoms: "Metabolic bone disease, weakness",
      prevention: "UVB exposure, vitamin D supplements",
      severity: "severe"
    } as DeficiencyInfo,
    {
      species: "Macaw",
      deficiency: "Omega-3 Fatty Acids",
      symptoms: "Poor feather quality, dry skin",
      prevention: "Fish, flaxseed, walnuts",
      severity: "mild"
    } as DeficiencyInfo
  ],

  // Species-Specific Requirements
  speciesRequirements: {
    african_grey: {
      specialNeeds: "High calcium, mental stimulation foods",
      toxicAvoid: "Avocado, chocolate, caffeine",
      recommended: "Walnuts, almonds, leafy greens, peppers",
      calciumRequirement: "1.0-1.2% DM",
      proteinRange: "12-16% DM"
    },
    cockatiel: {
      specialNeeds: "Lower fat than larger parrots",
      toxicAvoid: "Avocado, onions, alcohol",
      recommended: "Millet, sprouted seeds, cooked eggs",
      calciumRequirement: "0.8-1.0% DM",
      proteinRange: "14-18% DM"
    },
    macaw: {
      specialNeeds: "High-fat nuts for energy",
      toxicAvoid: "Avocado, chocolate, salt",
      recommended: "Brazil nuts, walnuts, palm nuts",
      calciumRequirement: "0.7-1.0% DM",
      proteinRange: "13-17% DM"
    },
    amazon: {
      specialNeeds: "Balanced nutrition, prone to obesity",
      toxicAvoid: "Avocado, chocolate, high-fat seeds",
      recommended: "Mixed vegetables, limited nuts",
      calciumRequirement: "0.8-1.1% DM",
      proteinRange: "12-16% DM"
    },
    budgerigar: {
      specialNeeds: "High metabolism, frequent feeding",
      toxicAvoid: "Avocado, chocolate, caffeine",
      recommended: "Millet, canary seed, vegetables",
      calciumRequirement: "0.9-1.2% DM",
      proteinRange: "15-20% DM"
    },
    cockatoo: {
      specialNeeds: "Destructible toys, fatty foods",
      toxicAvoid: "Avocado, chocolate, high-sodium foods",
      recommended: "Nuts, seeds, destructive foraging toys",
      calciumRequirement: "0.8-1.1% DM",
      proteinRange: "12-16% DM"
    }
  },

  // Critical Nutrient Interactions
  nutrientInteractions: {
    calciumPhosphorus: {
      importance: "Most critical ratio in avian nutrition",
      idealRange: "1.5-2.5:1",
      problems: {
        tooHigh: "Phosphorus excess leads to calcium depletion",
        tooLow: "Calcium excess can cause urinary issues"
      }
    },
    vitaminDVitaminA: {
      importance: "Both fat-soluble, work together for bone health",
      interaction: "Vitamin D helps absorb calcium, Vitamin A supports epithelial health"
    },
    iodineThyroid: {
      importance: "Seed-only diets often deficient",
      sources: "Iodine blocks, seaweed supplements"
    }
  },

  // Feeding Guidelines
  feedingGuidelines: {
    frequency: {
      smallBirds: "Feed 3-4 times daily",
      largeParrots: "Feed 2-3 times daily with foraging opportunities",
      note: "Fresh food should be available at all times"
    },
    portionControl: {
      pellets: "50-70% of diet",
      vegetables: "20-30% of diet",
      fruits: "5-10% of diet",
      treats: "5% or less"
    },
    waterRequirements: {
      fresh: "Always provide fresh, clean water",
      supplementation: "Consider vitamin/mineral supplements in water",
      note: "Change water daily to prevent bacterial growth"
    }
  }
};

// Helper functions for avian nutrition calculations
export function getAvianStandards(species: string): AvianNutritionProfile {
  // Map common species names to standard categories
  const speciesMap: Record<string, keyof typeof AVIAN_NUTRITION_STANDARDS> = {
    'african grey': 'psittacines',
    'cockatiel': 'psittacines',
    'budgerigar': 'passerines',
    'canary': 'passerines',
    'finch': 'passerines',
    'macaw': 'psittacines',
    'amazon': 'psittacines',
    'cockatoo': 'psittacines',
    'conure': 'psittacines',
    'lorikeet': 'psittacines',
    'lovebird': 'passerines',
    'parakeet': 'passerines'
  };

  const category = speciesMap[species.toLowerCase()] || 'psittacines';
  return AVIAN_NUTRITION_STANDARDS[category] as AvianNutritionProfile;
}

export function checkAvianDeficiencies(species: string): DeficiencyInfo[] {
  return AVIAN_NUTRITION_STANDARDS.commonDeficiencies.filter(
    def => def.species.toLowerCase().includes(species.toLowerCase().split(' ')[0])
  );
}