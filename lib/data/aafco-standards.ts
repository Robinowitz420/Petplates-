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

// Critical nutrient validation
export function validateCriticalNutrients(recipe: any, species: 'dog' | 'cat', lifeStage: 'adult' | 'growth' = 'adult'): {
  isValid: boolean;
  violations: string[];
  warnings: string[];
} {
  const standards = getAAFCOStandards(species, lifeStage);
  const violations: string[] = [];
  const warnings: string[] = [];

  // Check critical nutrients
  if (recipe.protein < (standards.protein.min || 0)) {
    violations.push(`Protein too low: ${recipe.protein}% vs minimum ${standards.protein.min}%`);
  }

  if (recipe.calcium < (standards.calcium.min || 0)) {
    violations.push(`Calcium too low: ${recipe.calcium}% vs minimum ${standards.calcium.min}%`);
  }

  if (recipe.calcium > (standards.calcium.max || 999)) {
    violations.push(`Calcium too high: ${recipe.calcium}% vs maximum ${standards.calcium.max}%`);
  }

  if (recipe.phosphorus < (standards.phosphorus.min || 0)) {
    violations.push(`Phosphorus too low: ${recipe.phosphorus}% vs minimum ${standards.phosphorus.min}%`);
  }

  // Check Ca:P ratio
  const caPRatio = recipe.calcium / recipe.phosphorus;
  const caPStandard = standards.CaP_ratio;
  if (caPStandard) {
    if (caPRatio < (caPStandard.min || 0) || caPRatio > (caPStandard.max || 999)) {
      violations.push(`Ca:P ratio out of range: ${caPRatio.toFixed(2)} vs ${caPStandard.min}-${caPStandard.max}`);
    }
  }

  // Species-specific checks
  if (species === 'cat' && recipe.taurine < (standards.taurine?.min || 0)) {
    violations.push(`Taurine too low: ${recipe.taurine}% vs minimum ${standards.taurine?.min}%`);
  }

  return {
    isValid: violations.length === 0,
    violations,
    warnings
  };
}