// lib/data/aafco-standards.ts
// AAFCO (Association of American Feed Control Officials) nutritional standards
// for dog and cat food - based on 2023 guidelines
// Also includes research-based standards for birds, reptiles, and pocket-pets

export interface NutritionalStandard {
  protein: { min: number; max: number }; // % on dry matter basis
  fat: { min: number; max: number }; // % on dry matter basis
  calcium: { min: number; max: number }; // mg per 1000 kcal
  phosphorus: { min: number; max: number }; // mg per 1000 kcal
  caPRatio: { min: number; max: number }; // calcium to phosphorus ratio
  fiber: { min: number; max: number }; // % on dry matter basis
  omega6: { min: number }; // % on dry matter basis
  omega3?: { min: number }; // % on dry matter basis (optional for dogs)
}

export const AAFCO_STANDARDS: {
  dogs: {
    puppy: NutritionalStandard;
    adult: NutritionalStandard;
    senior: NutritionalStandard;
  };
  cats: {
    puppy: NutritionalStandard; // kitten
    adult: NutritionalStandard;
    senior: NutritionalStandard;
  };
} = {
  // Dog Standards
  dogs: {
    // Growth and Reproduction (Puppies, Pregnant/Lactating)
    puppy: {
      protein: { min: 22.5, max: 35 }, // Higher for growth
      fat: { min: 8.5, max: 20 },
      calcium: { min: 1000, max: 2500 }, // mg per 1000 kcal (1.0% - 2.5% DM)
      phosphorus: { min: 800, max: 1600 }, // mg per 1000 kcal (0.8% - 1.6% DM)
      caPRatio: { min: 1.0, max: 2.0 },
      fiber: { min: 0, max: 5 },
      omega6: { min: 1.3 },
      omega3: { min: 0.13 },
    },
    
    // Adult Maintenance
    adult: {
      protein: { min: 18, max: 32 },
      fat: { min: 5.5, max: 18 },
      calcium: { min: 500, max: 2500 }, // mg per 1000 kcal (0.5% - 2.5% DM)
      phosphorus: { min: 400, max: 1600 }, // mg per 1000 kcal (0.4% - 1.6% DM)
      caPRatio: { min: 1.0, max: 2.0 },
      fiber: { min: 0, max: 5 },
      omega6: { min: 1.1 },
    },
    
    // Senior (same as adult but often lower protein/phosphorus recommended)
    senior: {
      protein: { min: 18, max: 28 }, // Slightly lower max
      fat: { min: 5.5, max: 15 },
      calcium: { min: 500, max: 1800 }, // Lower max for kidney health
      phosphorus: { min: 400, max: 1200 }, // Lower max for kidney health
      caPRatio: { min: 1.0, max: 2.0 },
      fiber: { min: 0, max: 5 },
      omega6: { min: 1.1 },
    },
  },

  // Cat Standards
  cats: {
    // Growth and Reproduction (Kittens, Pregnant/Lactating)
    puppy: { // Using 'puppy' key for kittens to match the interface
      protein: { min: 30, max: 45 }, // Cats are obligate carnivores - higher protein
      fat: { min: 9, max: 25 },
      calcium: { min: 1000, max: 2500 }, // mg per 1000 kcal
      phosphorus: { min: 800, max: 1600 }, // mg per 1000 kcal
      caPRatio: { min: 1.0, max: 2.0 },
      fiber: { min: 0, max: 5 },
      omega6: { min: 0.6 },
    },
    
    // Adult Maintenance
    adult: {
      protein: { min: 26, max: 40 }, // Higher than dogs
      fat: { min: 9, max: 22 },
      calcium: { min: 600, max: 2500 }, // mg per 1000 kcal
      phosphorus: { min: 500, max: 1600 }, // mg per 1000 kcal
      caPRatio: { min: 1.0, max: 2.0 },
      fiber: { min: 0, max: 5 },
      omega6: { min: 0.6 },
    },
    
    // Senior (lower phosphorus for kidney health)
    senior: {
      protein: { min: 26, max: 35 },
      fat: { min: 9, max: 20 },
      calcium: { min: 600, max: 1800 },
      phosphorus: { min: 500, max: 1200 }, // Lower max for kidney health
      caPRatio: { min: 1.0, max: 2.0 },
      fiber: { min: 0, max: 5 },
      omega6: { min: 0.6 },
    },
  },
};

// Species-specific nutritional guidelines (non-AAFCO, research-based)
export const SPECIES_NUTRITIONAL_GUIDELINES = {
  birds: {
    // Based on avian nutrition research
    small: { // Parakeets, canaries, finches
      protein: { min: 12, max: 18 },
      fat: { min: 3, max: 8 },
      fiber: { min: 3, max: 8 },
      calcium: { min: 0.3, max: 1.2 }, // % of diet
    },
    medium: { // Cockatiels, conures
      protein: { min: 14, max: 20 },
      fat: { min: 4, max: 10 },
      fiber: { min: 4, max: 10 },
      calcium: { min: 0.4, max: 1.5 },
    },
    large: { // Macaws, cockatoos, African greys
      protein: { min: 15, max: 22 },
      fat: { min: 5, max: 12 },
      fiber: { min: 5, max: 12 },
      calcium: { min: 0.5, max: 2.0 },
    },
  },

  reptiles: {
    // Based on herpetological nutrition research
    herbivore: { // Iguanas, tortoises
      protein: { min: 15, max: 25 },
      fiber: { min: 20, max: 35 },
      caPRatio: { min: 1.5, max: 2.5 }, // Critical for bone health
      calcium: { min: 0.8, max: 2.0 }, // % of diet
    },
    carnivore: { // Monitors, snakes
      protein: { min: 30, max: 50 },
      fat: { min: 10, max: 25 },
      caPRatio: { min: 1.2, max: 2.0 },
      calcium: { min: 0.6, max: 1.5 },
    },
    omnivore: { // Bearded dragons, blue-tongue skinks
      protein: { min: 20, max: 35 },
      fiber: { min: 10, max: 25 },
      caPRatio: { min: 1.5, max: 2.5 },
      calcium: { min: 0.8, max: 2.0 },
    },
  },

  'pocket-pets': {
    // Based on small mammal nutrition research
    hamster: {
      protein: { min: 16, max: 24 },
      fat: { min: 4, max: 10 },
      fiber: { min: 8, max: 15 },
      caPRatio: { min: 1.5, max: 2.0 },
    },
    'guinea-pig': {
      protein: { min: 16, max: 20 },
      fat: { min: 3, max: 6 },
      fiber: { min: 12, max: 20 }, // High fiber requirement
      caPRatio: { min: 1.5, max: 2.0 },
      vitaminC: { min: 10 }, // mg per kg body weight per day - guinea pigs can't synthesize vitamin C
    },
    rabbit: {
      protein: { min: 14, max: 18 },
      fat: { min: 2, max: 5 },
      fiber: { min: 18, max: 25 }, // Very high fiber requirement
      caPRatio: { min: 1.5, max: 2.0 },
    },
    ferret: {
      protein: { min: 32, max: 38 }, // Obligate carnivores like cats
      fat: { min: 15, max: 20 },
      fiber: { min: 0, max: 3 }, // Low fiber tolerance
      caPRatio: { min: 1.0, max: 2.0 },
    },
  },
};

/**
 * Get the appropriate nutritional standard for a given species and life stage
 */
export function getNutritionalStandard(
  species: string,
  lifeStage: 'puppy' | 'adult' | 'senior' = 'adult',
  subtype?: string // for birds (small/medium/large) or reptiles (herbivore/carnivore/omnivore)
): NutritionalStandard | any {
  if (species === 'dogs' || species === 'cats') {
    return AAFCO_STANDARDS[species][lifeStage];
  }

  if (species === 'birds' && subtype) {
    return SPECIES_NUTRITIONAL_GUIDELINES.birds[subtype as keyof typeof SPECIES_NUTRITIONAL_GUIDELINES.birds];
  }

  if (species === 'reptiles' && subtype) {
    return SPECIES_NUTRITIONAL_GUIDELINES.reptiles[subtype as keyof typeof SPECIES_NUTRITIONAL_GUIDELINES.reptiles];
  }

  if (species === 'pocket-pets' && subtype) {
    return SPECIES_NUTRITIONAL_GUIDELINES['pocket-pets'][subtype as keyof typeof SPECIES_NUTRITIONAL_GUIDELINES['pocket-pets']];
  }

  // Default fallback
  return AAFCO_STANDARDS.dogs.adult;
}

// Legacy exports for backward compatibility
export interface NutrientRange {
  min?: number;
  max?: number;
  unit: string;
  critical?: boolean;
  note?: string;
}

export interface NutrientProfile {
  protein: NutrientRange;
  fat: NutrientRange;
  calcium: NutrientRange;
  phosphorus: NutrientRange;
  CaP_ratio?: NutrientRange;
  linoleic_acid?: NutrientRange;
  arachidonic_acid?: NutrientRange;
  taurine?: NutrientRange;
  omega3?: NutrientRange;
  vitaminE?: NutrientRange;
  vitaminA?: NutrientRange;
  vitaminD?: NutrientRange;
  source: string;
}

export const AAFCO_NUTRIENT_PROFILES = {
  dog: {
    adultMaintenance: {
      protein: { min: 18.0, unit: '% DM', critical: true },
      fat: { min: 5.5, unit: '% DM' },
      calcium: { min: 0.6, max: 2.5, unit: '% DM', critical: true },
      phosphorus: { min: 0.5, unit: '% DM', critical: true },
      CaP_ratio: { min: 1.0, max: 2.0, unit: 'ratio', critical: true },
      linoleic_acid: { min: 1.0, unit: '% DM' },
      vitaminE: { min: 50, unit: 'IU/kg' },
      vitaminA: { min: 5000, unit: 'IU/kg' },
      vitaminD: { min: 500, unit: 'IU/kg' },
      source: "AAFCO 2023 Dog Food Nutrient Profiles"
    } as NutrientProfile,

    growthReproduction: {
      protein: { min: 22.0, unit: '% DM', critical: true },
      fat: { min: 8.0, unit: '% DM' },
      calcium: { min: 1.0, max: 1.8, unit: '% DM', critical: true },
      phosphorus: { min: 0.8, unit: '% DM', critical: true },
      CaP_ratio: { min: 1.0, max: 2.0, unit: 'ratio', critical: true },
      linoleic_acid: { min: 1.0, unit: '% DM' },
      vitaminE: { min: 50, unit: 'IU/kg' },
      vitaminA: { min: 5000, unit: 'IU/kg' },
      vitaminD: { min: 500, unit: 'IU/kg' },
      source: "AAFCO 2023 Dog Food Nutrient Profiles"
    } as NutrientProfile,

    allLifeStages: {
      protein: { min: 20.0, unit: '% DM', critical: true },
      fat: { min: 8.0, unit: '% DM' },
      calcium: { min: 1.0, max: 1.8, unit: '% DM', critical: true },
      phosphorus: { min: 0.8, unit: '% DM', critical: true },
      CaP_ratio: { min: 1.0, max: 2.0, unit: 'ratio', critical: true },
      linoleic_acid: { min: 1.0, unit: '% DM' },
      vitaminE: { min: 50, unit: 'IU/kg' },
      vitaminA: { min: 5000, unit: 'IU/kg' },
      vitaminD: { min: 500, unit: 'IU/kg' },
      source: "AAFCO 2023 Dog Food Nutrient Profiles"
    } as NutrientProfile
  },

  cat: {
    adultMaintenance: {
      protein: { min: 26.0, unit: '% DM', critical: true },
      fat: { min: 9.0, unit: '% DM' },
      calcium: { min: 0.6, unit: '% DM', critical: true },
      phosphorus: { min: 0.5, unit: '% DM', critical: true },
      CaP_ratio: { min: 1.0, max: 2.5, unit: 'ratio', critical: true },
      taurine: { min: 0.10, unit: '% DM', critical: true, note: "Essential amino acid" },
      arachidonic_acid: { min: 0.02, unit: '% DM' },
      linoleic_acid: { min: 0.5, unit: '% DM' },
      vitaminE: { min: 30, unit: 'IU/kg' },
      vitaminA: { min: 3333, unit: 'IU/kg' },
      vitaminD: { min: 333, unit: 'IU/kg' },
      source: "AAFCO 2023 Cat Food Nutrient Profiles"
    } as NutrientProfile,

    growthReproduction: {
      protein: { min: 30.0, unit: '% DM', critical: true },
      fat: { min: 9.0, unit: '% DM' },
      calcium: { min: 1.0, unit: '% DM', critical: true },
      phosphorus: { min: 0.8, unit: '% DM', critical: true },
      CaP_ratio: { min: 1.0, max: 2.0, unit: 'ratio', critical: true },
      taurine: { min: 0.10, unit: '% DM', critical: true },
      arachidonic_acid: { min: 0.02, unit: '% DM' },
      linoleic_acid: { min: 0.5, unit: '% DM' },
      vitaminE: { min: 30, unit: 'IU/kg' },
      vitaminA: { min: 3333, unit: 'IU/kg' },
      vitaminD: { min: 333, unit: 'IU/kg' },
      source: "AAFCO 2023 Cat Food Nutrient Profiles"
    } as NutrientProfile,

    allLifeStages: {
      protein: { min: 30.0, unit: '% DM', critical: true },
      fat: { min: 9.0, unit: '% DM' },
      calcium: { min: 1.0, unit: '% DM', critical: true },
      phosphorus: { min: 0.8, unit: '% DM', critical: true },
      CaP_ratio: { min: 1.0, max: 2.0, unit: 'ratio', critical: true },
      taurine: { min: 0.10, unit: '% DM', critical: true },
      arachidonic_acid: { min: 0.02, unit: '% DM' },
      linoleic_acid: { min: 0.5, unit: '% DM' },
      vitaminE: { min: 30, unit: 'IU/kg' },
      vitaminA: { min: 3333, unit: 'IU/kg' },
      vitaminD: { min: 333, unit: 'IU/kg' },
      source: "AAFCO 2023 Cat Food Nutrient Profiles"
    } as NutrientProfile
  }
};

export function getAAFCOStandards(species: 'dog' | 'cat', lifeStage: 'adult' | 'growth' | 'all' = 'adult'): NutrientProfile {
  const speciesData = AAFCO_NUTRIENT_PROFILES[species];

  switch (lifeStage) {
    case 'adult':
      return speciesData.adultMaintenance;
    case 'growth':
      return speciesData.growthReproduction;
    case 'all':
      return speciesData.allLifeStages;
    default:
      return speciesData.adultMaintenance;
  }
}

export function validateCriticalNutrients(recipe: any, species: 'dog' | 'cat', lifeStage: 'adult' | 'growth' = 'adult'): {
  isValid: boolean;
  violations: string[];
  warnings: string[];
} {
  const standards = getAAFCOStandards(species, lifeStage);
  const violations: string[] = [];
  const warnings: string[] = [];

  const getNutrientValue = (nutrient: any): number => {
    if (typeof nutrient === 'number') return nutrient;
    if (nutrient?.min) return nutrient.min;
    if (nutrient?.max) return nutrient.max;
    if (nutrient?.value) return nutrient.value;
    return 0;
  };

  const protein = getNutrientValue(recipe.protein);
  const calcium = getNutrientValue(recipe.calcium);
  const phosphorus = getNutrientValue(recipe.phosphorus);
  const fat = getNutrientValue(recipe.fat);
  const fiber = getNutrientValue(recipe.fiber);
  const taurine = getNutrientValue(recipe.taurine);

  if (protein < (standards.protein.min || 0)) {
    violations.push(`Protein too low: ${protein.toFixed(1)}% vs minimum ${standards.protein.min}% (AAFCO requirement)`);
  } else if (protein > (standards.protein.max || 100)) {
    warnings.push(`Protein may be high: ${protein.toFixed(1)}% vs maximum ${standards.protein.max}%`);
  }

  if (fat < (standards.fat?.min || 0)) {
    violations.push(`Fat too low: ${fat.toFixed(1)}% vs minimum ${standards.fat.min}% (AAFCO requirement)`);
  } else if (fat > (standards.fat?.max || 100)) {
    warnings.push(`Fat may be high: ${fat.toFixed(1)}% vs maximum ${standards.fat.max}%`);
  }

  if (calcium < (standards.calcium.min || 0)) {
    violations.push(`Calcium too low: ${calcium.toFixed(1)}% vs minimum ${standards.calcium.min}% (AAFCO requirement)`);
  } else if (calcium > (standards.calcium.max || 999)) {
    violations.push(`Calcium too high: ${calcium.toFixed(1)}% vs maximum ${standards.calcium.max}% (may cause skeletal issues)`);
  }

  if (phosphorus < (standards.phosphorus.min || 0)) {
    violations.push(`Phosphorus too low: ${phosphorus.toFixed(1)}% vs minimum ${standards.phosphorus.min}% (AAFCO requirement)`);
  } else if (phosphorus > (standards.phosphorus.max || 999)) {
    warnings.push(`Phosphorus may be high: ${phosphorus.toFixed(1)}% vs maximum ${standards.phosphorus.max}%`);
  }

  if (phosphorus > 0) {
    const caPRatio = calcium / phosphorus;
    const caPStandard = standards.CaP_ratio;
    if (caPStandard) {
      if (caPRatio < (caPStandard.min || 0)) {
        violations.push(`Ca:P ratio too low: ${caPRatio.toFixed(2)} vs minimum ${caPStandard.min} (may cause bone issues)`);
      } else if (caPRatio > (caPStandard.max || 999)) {
        warnings.push(`Ca:P ratio high: ${caPRatio.toFixed(2)} vs maximum ${caPStandard.max}`);
      }
    }
  }

  if (fiber > 0 && (standards as any).fiber) {
    const fiberStandard = (standards as any).fiber;
    if (fiber < (fiberStandard.min || 0)) {
      warnings.push(`Fiber may be low: ${fiber.toFixed(1)}% vs recommended ${fiberStandard.min}%`);
    } else if (fiber > (fiberStandard.max || 100)) {
      warnings.push(`Fiber may be high: ${fiber.toFixed(1)}% vs maximum ${fiberStandard.max}%`);
    }
  }

  if (species === 'cat' && standards.taurine) {
    const taurineMin = standards.taurine.min || 0;
    if (taurine < taurineMin) {
      violations.push(`Taurine too low: ${taurine.toFixed(3)}% vs minimum ${taurineMin}% (CRITICAL for cats - can cause heart/eye issues)`);
    }
  }

  return {
    isValid: violations.length === 0,
    violations,
    warnings
  };
}
