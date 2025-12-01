// lib/data/reptile-nutrition.ts
// Reptile nutrition standards based on veterinary and herpetological research

export interface ReptileNutrientRequirements {
  protein: {
    min: number;
    max: number;
    unit: string;
    source: string;
  };
  fat: {
    min: number;
    max: number;
    unit: string;
  };
  calcium: {
    min: number;
    max?: number;
    unit: string;
    critical: boolean;
  };
  phosphorus: {
    min: number;
    max?: number;
    unit: string;
  };
  CaP_ratio: {
    ideal: number;
    min: number;
    max: number;
    critical: boolean;
  };
  vitaminD3?: {
    min: number;
    unit: string;
  };
  vitaminA?: {
    min: number;
    unit: string;
  };
}

export const REPTILE_NUTRITION_STANDARDS = {
  bearded_dragon: {
    protein: { min: 15, max: 25, unit: '% DM', source: 'Herpetological Nutrition' },
    fat: { min: 3, max: 8, unit: '% DM' },
    calcium: { min: 1.0, max: 1.5, unit: '% DM', critical: true },
    phosphorus: { min: 0.4, max: 0.8, unit: '% DM' },
    CaP_ratio: { ideal: 2.5, min: 2.0, max: 3.0, critical: true },
    vitaminD3: { min: 800, unit: 'IU/kg' },
    vitaminA: { min: 10000, unit: 'IU/kg' }
  } as ReptileNutrientRequirements,

  leopard_gecko: {
    protein: { min: 20, max: 30, unit: '% DM', source: 'Leopard Gecko Care Guidelines' },
    fat: { min: 8, max: 15, unit: '% DM' },
    calcium: { min: 1.2, max: 2.0, unit: '% DM', critical: true },
    phosphorus: { min: 0.5, max: 1.0, unit: '% DM' },
    CaP_ratio: { ideal: 2.0, min: 1.5, max: 2.5, critical: true },
    vitaminD3: { min: 1000, unit: 'IU/kg' },
    vitaminA: { min: 8000, unit: 'IU/kg' }
  } as ReptileNutrientRequirements,

  ball_python: {
    protein: { min: 18, max: 28, unit: '% DM', source: 'Snake Nutrition Research' },
    fat: { min: 5, max: 12, unit: '% DM' },
    calcium: { min: 0.8, max: 1.2, unit: '% DM', critical: true },
    phosphorus: { min: 0.4, max: 0.7, unit: '% DM' },
    CaP_ratio: { ideal: 2.0, min: 1.5, max: 2.5, critical: true },
    vitaminD3: { min: 600, unit: 'IU/kg' },
    vitaminA: { min: 5000, unit: 'IU/kg' }
  } as ReptileNutrientRequirements,

  red_eared_slider: {
    protein: { min: 25, max: 35, unit: '% DM', source: 'Chelonian Nutrition Guidelines' },
    fat: { min: 4, max: 10, unit: '% DM' },
    calcium: { min: 1.5, max: 2.5, unit: '% DM', critical: true },
    phosphorus: { min: 0.6, max: 1.0, unit: '% DM' },
    CaP_ratio: { ideal: 3.0, min: 2.5, max: 4.0, critical: true },
    vitaminD3: { min: 1200, unit: 'IU/kg' },
    vitaminA: { min: 15000, unit: 'IU/kg' }
  } as ReptileNutrientRequirements,

  corn_snake: {
    protein: { min: 20, max: 30, unit: '% DM', source: 'Colubrid Snake Nutrition' },
    fat: { min: 6, max: 12, unit: '% DM' },
    calcium: { min: 0.9, max: 1.4, unit: '% DM', critical: true },
    phosphorus: { min: 0.4, max: 0.8, unit: '% DM' },
    CaP_ratio: { ideal: 2.2, min: 1.8, max: 2.8, critical: true },
    vitaminD3: { min: 700, unit: 'IU/kg' },
    vitaminA: { min: 6000, unit: 'IU/kg' }
  } as ReptileNutrientRequirements,

  green_iguana: {
    protein: { min: 15, max: 25, unit: '% DM', source: 'Iguana Care Guidelines' },
    fat: { min: 2, max: 6, unit: '% DM' },
    calcium: { min: 1.8, max: 3.0, unit: '% DM', critical: true },
    phosphorus: { min: 0.5, max: 0.9, unit: '% DM' },
    CaP_ratio: { ideal: 4.0, min: 3.0, max: 5.0, critical: true },
    vitaminD3: { min: 1500, unit: 'IU/kg' },
    vitaminA: { min: 12000, unit: 'IU/kg' }
  } as ReptileNutrientRequirements,

  chameleon: {
    protein: { min: 18, max: 28, unit: '% DM', source: 'Chameleon Nutrition Research' },
    fat: { min: 3, max: 8, unit: '% DM' },
    calcium: { min: 1.2, max: 2.0, unit: '% DM', critical: true },
    phosphorus: { min: 0.4, max: 0.8, unit: '% DM' },
    CaP_ratio: { ideal: 3.0, min: 2.5, max: 4.0, critical: true },
    vitaminD3: { min: 1000, unit: 'IU/kg' },
    vitaminA: { min: 10000, unit: 'IU/kg' }
  } as ReptileNutrientRequirements
};

// Common reptile deficiencies and their symptoms
export const REPTILE_DEFICIENCIES = {
  metabolic_bone_disease: {
    cause: "Calcium deficiency or improper Ca:P ratio",
    symptoms: ["Soft bones", "Swollen limbs", "Lethargy", "Difficulty walking"],
    prevention: "Proper calcium supplementation, UVB lighting",
    severity: "life-threatening"
  },

  secondary_nutritional_hyperparathyroidism: {
    cause: "Excess phosphorus relative to calcium",
    symptoms: ["Bone deformities", "Muscle weakness", "Fractures"],
    prevention: "Balanced Ca:P ratio (2:1 to 4:1 depending on species)",
    severity: "severe"
  },

  vitamin_a_deficiency: {
    cause: "Insufficient vitamin A in diet",
    symptoms: ["Eye problems", "Skin issues", "Respiratory infections"],
    prevention: "Beta-carotene rich foods, vitamin A supplements",
    severity: "moderate"
  },

  vitamin_d3_deficiency: {
    cause: "Lack of UVB exposure or vitamin D3",
    symptoms: ["Metabolic bone disease", "Weakness"],
    prevention: "UVB lighting or vitamin D3 supplementation",
    severity: "severe"
  }
};

// Feeding guidelines by species type
export const REPTILE_FEEDING_GUIDELINES = {
  insectivores: {
    diet: "70% insects, 20% vegetables, 10% fruits",
    insects: ["Crickets", "Mealworms", "Dubia roaches", "Waxworms"],
    vegetables: ["Collard greens", "Kale", "Squash", "Carrots"],
    calcium: "Dust insects 3x per week",
    frequency: "Daily feeding for juveniles, every other day for adults"
  },

  herbivores: {
    diet: "80% vegetables, 10% fruits, 10% protein",
    vegetables: ["Collard greens", "Kale", "Mustard greens", "Dandelion greens"],
    fruits: ["Figs", "Melons", "Berries"],
    protein: ["Occasional insects or tofu"],
    calcium: "Calcium supplement daily",
    frequency: "Daily fresh greens"
  },

  carnivores: {
    diet: "90% animal protein, 10% vegetables",
    protein: ["Mice", "Fish", "Insects", "Eggs"],
    vegetables: ["Limited leafy greens"],
    calcium: "Bone-in feeding or supplementation",
    frequency: "1-2 meals per week depending on size"
  },

  omnivores: {
    diet: "50% insects/plants, 30% vegetables, 20% fruits",
    protein: ["Insects", "Small mice"],
    vegetables: ["Mixed greens", "Squash", "Carrots"],
    fruits: ["Berries", "Melons"],
    calcium: "Dust insects, supplement as needed",
    frequency: "Daily feeding"
  }
};

// Helper functions
export function getReptileStandards(species: string): ReptileNutrientRequirements | undefined {
  const speciesKey = species.toLowerCase().replace(/\s+/g, '_');
  return REPTILE_NUTRITION_STANDARDS[speciesKey as keyof typeof REPTILE_NUTRITION_STANDARDS];
}

export function calculateReptileCaPRatio(calcium: number, phosphorus: number): number {
  return phosphorus > 0 ? calcium / phosphorus : 0;
}

export function validateReptileNutrition(
  recipe: any,
  species: string
): {
  isValid: boolean;
  violations: string[];
  warnings: string[];
} {
  const standards = getReptileStandards(species);
  if (!standards) {
    return {
      isValid: false,
      violations: [`No nutritional standards found for ${species}`],
      warnings: []
    };
  }

  const violations: string[] = [];
  const warnings: string[] = [];

  // Check calcium
  if (recipe.calcium < standards.calcium.min) {
    violations.push(`Calcium too low: ${recipe.calcium}% vs minimum ${standards.calcium.min}%`);
  }
  if (standards.calcium.max && recipe.calcium > standards.calcium.max) {
    violations.push(`Calcium too high: ${recipe.calcium}% vs maximum ${standards.calcium.max}%`);
  }

  // Check phosphorus
  if (recipe.phosphorus < standards.phosphorus.min) {
    violations.push(`Phosphorus too low: ${recipe.phosphorus}% vs minimum ${standards.phosphorus.min}%`);
  }
  if (standards.phosphorus.max && recipe.phosphorus > standards.phosphorus.max) {
    violations.push(`Phosphorus too high: ${recipe.phosphorus}% vs maximum ${standards.phosphorus.max}%`);
  }

  // Check Ca:P ratio
  const caPRatio = calculateReptileCaPRatio(recipe.calcium, recipe.phosphorus);
  if (caPRatio < standards.CaP_ratio.min || caPRatio > standards.CaP_ratio.max) {
    violations.push(`Ca:P ratio out of range: ${caPRatio.toFixed(2)} vs ${standards.CaP_ratio.min}-${standards.CaP_ratio.max}`);
  }

  // Check protein
  if (recipe.protein < standards.protein.min) {
    violations.push(`Protein too low: ${recipe.protein}% vs minimum ${standards.protein.min}%`);
  }
  if (recipe.protein > standards.protein.max) {
    warnings.push(`Protein may be too high: ${recipe.protein}% vs maximum ${standards.protein.max}%`);
  }

  return {
    isValid: violations.length === 0,
    violations,
    warnings
  };
}