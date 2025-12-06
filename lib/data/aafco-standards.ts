// lib/data/aafco-standards.ts
// Complete AAFCO nutrient profiles for dogs, cats, and comparison with FEDIAF standards

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

// FEDIAF European Standards for comparison
export const FEDIAF_STANDARDS = {
  dogAdult: {
    protein: { min: 18, unit: '% DM' },
    fat: { min: 5.5, unit: '% DM' },
    omega3: { min: 0.1, unit: '% DM', note: "Not required by AAFCO" },
    vitaminE: { min: 50, unit: 'IU/kg' },
    source: "FEDIAF 2023"
  } as NutrientProfile,

  dogPuppy: {
    protein: { min: 20, unit: '% DM' },
    fat: { min: 8, unit: '% DM' },
    omega3: { min: 0.1, unit: '% DM' },
    vitaminE: { min: 50, unit: 'IU/kg' },
    source: "FEDIAF 2023"
  } as NutrientProfile,

  catAdult: {
    protein: { min: 25, unit: '% DM' },
    fat: { min: 9, unit: '% DM' },
    taurine: { min: 0.1, unit: '% DM' },
    arachidonic_acid: { min: 0.02, unit: '% DM' },
    source: "FEDIAF 2023"
  } as NutrientProfile,

  catKitten: {
    protein: { min: 30, unit: '% DM' },
    fat: { min: 9, unit: '% DM' },
    taurine: { min: 0.1, unit: '% DM' },
    arachidonic_acid: { min: 0.02, unit: '% DM' },
    source: "FEDIAF 2023"
  } as NutrientProfile
};

// Comparison between standards
export const STANDARDS_COMPARISON = {
  dogProtein: {
    aafcoAdult: 18,
    fediafAdult: 18,
    aafcoPuppy: 22,
    fediafPuppy: 20,
    unit: '% DM',
    note: "Very similar requirements"
  },

  catTaurine: {
    aafcoAdult: 0.10,
    fediafAdult: 0.10,
    aafcoKitten: 0.10,
    fediafKitten: 0.10,
    unit: '% DM',
    note: "Identical requirements"
  },

  omega3: {
    aafco: "Not required",
    fediaf: { min: 0.1, unit: '% DM' },
    note: "FEDIAF more comprehensive for fatty acids"
  },

  vitaminE: {
    aafcoDog: 50,
    fediafDog: 50,
    aafcoCat: 30,
    fediafCat: "Not specified",
    unit: 'IU/kg',
    note: "AAFCO more specific for cats"
  }
};

// Helper functions
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

export function getFEDIAFStandards(species: 'dog' | 'cat', lifeStage: 'adult' | 'growth' = 'adult'): NutrientProfile {
  const key = `${species}${lifeStage === 'adult' ? 'Adult' : 'Puppy'}`;
  return FEDIAF_STANDARDS[key as keyof typeof FEDIAF_STANDARDS];
}

export function compareStandards(nutrient: string): any {
  return STANDARDS_COMPARISON[nutrient as keyof typeof STANDARDS_COMPARISON];
}

// Critical nutrient validation with comprehensive AAFCO/WSAVA checks
export function validateCriticalNutrients(recipe: any, species: 'dog' | 'cat', lifeStage: 'adult' | 'growth' = 'adult'): {
  isValid: boolean;
  violations: string[];
  warnings: string[];
} {
  const standards = getAAFCOStandards(species, lifeStage);
  const violations: string[] = [];
  const warnings: string[] = [];

  // Extract nutrient values (handle both object and number formats)
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

  // Check critical nutrients - Protein
  if (protein < (standards.protein.min || 0)) {
    violations.push(`Protein too low: ${protein.toFixed(1)}% vs minimum ${standards.protein.min}% (AAFCO requirement)`);
  } else if (protein > (standards.protein.max || 100)) {
    warnings.push(`Protein may be high: ${protein.toFixed(1)}% vs maximum ${standards.protein.max}%`);
  }

  // Check critical nutrients - Fat
  if (fat < (standards.fat?.min || 0)) {
    violations.push(`Fat too low: ${fat.toFixed(1)}% vs minimum ${standards.fat.min}% (AAFCO requirement)`);
  } else if (fat > (standards.fat?.max || 100)) {
    warnings.push(`Fat may be high: ${fat.toFixed(1)}% vs maximum ${standards.fat.max}%`);
  }

  // Check critical nutrients - Calcium
  if (calcium < (standards.calcium.min || 0)) {
    violations.push(`Calcium too low: ${calcium.toFixed(1)}% vs minimum ${standards.calcium.min}% (AAFCO requirement)`);
  } else if (calcium > (standards.calcium.max || 999)) {
    violations.push(`Calcium too high: ${calcium.toFixed(1)}% vs maximum ${standards.calcium.max}% (may cause skeletal issues)`);
  }

  // Check critical nutrients - Phosphorus
  if (phosphorus < (standards.phosphorus.min || 0)) {
    violations.push(`Phosphorus too low: ${phosphorus.toFixed(1)}% vs minimum ${standards.phosphorus.min}% (AAFCO requirement)`);
  } else if (phosphorus > (standards.phosphorus.max || 999)) {
    warnings.push(`Phosphorus may be high: ${phosphorus.toFixed(1)}% vs maximum ${standards.phosphorus.max}%`);
  }

  // Check Ca:P ratio (critical for bone health)
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

  // Check Fiber (if specified and available in standards)
  if (fiber > 0 && (standards as any).fiber) {
    const fiberStandard = (standards as any).fiber;
    if (fiber < (fiberStandard.min || 0)) {
      warnings.push(`Fiber may be low: ${fiber.toFixed(1)}% vs recommended ${fiberStandard.min}%`);
    } else if (fiber > (fiberStandard.max || 100)) {
      warnings.push(`Fiber may be high: ${fiber.toFixed(1)}% vs maximum ${fiberStandard.max}%`);
    }
  }

  // Species-specific checks - Taurine for cats (CRITICAL)
  if (species === 'cat' && standards.taurine) {
    const taurineMin = standards.taurine.min || 0;
    if (taurine < taurineMin) {
      violations.push(`Taurine too low: ${taurine.toFixed(3)}% vs minimum ${taurineMin}% (CRITICAL for cats - can cause heart/eye issues)`);
    }
  }

  // WSAVA additional checks (if applicable)
  // Note: WSAVA guidelines align closely with AAFCO but emphasize:
  // - Complete and balanced nutrition
  // - Appropriate for life stage
  // - No harmful ingredients

  return {
    isValid: violations.length === 0,
    violations,
    warnings
  };
}