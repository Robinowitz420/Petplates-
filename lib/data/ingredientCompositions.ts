// lib/data/ingredientCompositions.ts
// USDA nutrition data for common pet food ingredients
// All values per 100g raw edible portion unless otherwise noted

export type SpeciesCompatibility = 'ok' | 'avoid' | 'limit' | 'caution';
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type FeedingRole = 'staple' | 'secondary' | 'treat' | 'supplement' | 'forage';

export interface IngredientComposition {
  // Basic info
  name?: string;        // Human-readable name

  // Protein hierarchy (only for protein category)
  proteinRole?: 'primary' | 'secondary';  // PHASE 1.7: Explicit protein role

  // Nutritional data
  protein?: number;     // g per 100g (optional for supplements)
  fat?: number;         // g per 100g (optional for supplements)
  calcium?: number;     // mg per 100g
  phosphorus?: number;  // mg per 100g
  moisture?: number;    // g per 100g
  kcal?: number;        // calories per 100g
  omega3?: number;      // g EPA+DHA per 100g
  CaP_ratio?: number;   // calcium to phosphorus ratio
  vitaminA?: number;    // IU per 100g
  
  // PHASE 2: Micronutrient toxicity tracking
  copper_mg_per_100g?: number;  // mg per 100g
  iodine_mcg_per_100g?: number; // mcg per 100g
  micronutrientConfidence?: 'measured' | 'estimated' | 'assumed_high' | 'assumed_low';
  vitaminC?: number;    // mg per 100g
  taurine?: number;     // mg per 100g (critical for cats)
  fiber?: number;       // g per 100g
  carbs?: number;       // g per 100g
  source?: string;      // data source citation
  
  // Species compatibility (NEW - for multi-species support)
  speciesCompatibility?: {
    dog?: SpeciesCompatibility;
    cat?: SpeciesCompatibility;
    bird?: SpeciesCompatibility;
    reptile?: SpeciesCompatibility;
    'pocket-pet'?: SpeciesCompatibility;
  };
  
  // Data confidence (NEW - communicates evidence strength)
  confidenceBySpecies?: {
    dog?: ConfidenceLevel;
    cat?: ConfidenceLevel;
    bird?: ConfidenceLevel;
    reptile?: ConfidenceLevel;
    'pocket-pet'?: ConfidenceLevel;
  };
  
  // Feeding role (NEW - how this ingredient should be used)
  feedingRole?: FeedingRole;
  
  // Maximum inclusion percentage by species (NEW - prevents overfeeding)
  maxInclusionPercentBySpecies?: {
    dog?: number;       // e.g., 0.30 = max 30% of total meal
    cat?: number;
    bird?: number;
    reptile?: number;
    'pocket-pet'?: number;
  };
  
  // Species-specific notes (NEW - important warnings/guidance)
  notesBySpecies?: {
    dog?: string;
    cat?: string;
    bird?: string;
    reptile?: string;
    'pocket-pet'?: string;
  };
  
  // Legacy flags (keep for backward compatibility)
  allergen?: boolean;
  toxic?: boolean;
  toxicFor?: string[];  // Which species this is toxic for
  needsReview?: boolean; // Flag if nutritional data needs manual review
}

export const INGREDIENT_COMPOSITIONS: Record<string, IngredientComposition> = {
  // Poultry
  "chicken_breast": {
    proteinRole: 'primary', // PRIMARY PROTEIN FOR DOGS
    protein: 31.0,
    fat: 3.6,
    calcium: 11,
    phosphorus: 196,
    moisture: 65,
    vitaminA: 0, // Muscle meat has negligible vitamin A
    copper_mg_per_100g: 0.1, // PHASE 2: Class default for muscle meat
    iodine_mcg_per_100g: 5,   // PHASE 2: Class default for muscle meat
    micronutrientConfidence: 'assumed_high',
    kcal: 165,
    source: "USDA FDC ID: 171116",
    speciesCompatibility: {
      dog: 'ok',
      cat: 'ok',
      bird: 'limit',
      reptile: 'limit',
      'pocket-pet': 'avoid'
    },
    feedingRole: 'staple', // PRIMARY PROTEIN FOR DOGS
    maxInclusionPercentBySpecies: {
      dog: 0.50,
      cat: 0.60,
      bird: 0.10,
      reptile: 0.20,
      'pocket-pet': 0
    },
    notesBySpecies: {
      bird: 'Only for carnivorous birds (raptors, corvids). Not suitable for seed-eating birds.',
      reptile: 'Only for omnivorous/carnivorous reptiles. Not for herbivorous species.',
      'pocket-pet': 'Not suitable for herbivorous pocket pets (rabbits, guinea pigs). Avoid for omnivorous hamsters/gerbils except under vet direction.'
    },
    confidenceBySpecies: {
      dog: 'high',
      cat: 'high',
      bird: 'medium',
      reptile: 'medium',
      'pocket-pet': 'high'
    }
  },
  "ground_turkey": {
    proteinRole: 'secondary',
    protein: 28.6,
    fat: 10.4,
    calcium: 14,
    phosphorus: 206,
    vitaminA: 0, // Muscle meat has negligible vitamin A
    kcal: 189,
    source: "USDA FDC ID: 174036",
    speciesCompatibility: {
      dog: 'ok',
      cat: 'ok',
      bird: 'limit',
      reptile: 'limit',
      'pocket-pet': 'avoid'
    },
    feedingRole: 'secondary', // Secondary protein for dogs
    maxInclusionPercentBySpecies: {
      dog: 0.50,
      cat: 0.60,
      bird: 0.10,
      reptile: 0.20,
      'pocket-pet': 0
    },
    notesBySpecies: {
      bird: 'Only for carnivorous birds (raptors, corvids). Not suitable for seed-eating birds.',
      reptile: 'Only for omnivorous/carnivorous reptiles. Not for herbivorous species.',
      'pocket-pet': 'Not suitable for herbivorous pocket pets (rabbits, guinea pigs). Avoid for omnivorous hamsters/gerbils except under vet direction.'
    },
    confidenceBySpecies: {
      dog: 'high',
      cat: 'high',
      bird: 'medium',
      reptile: 'medium',
      'pocket-pet': 'high'
    }
  },
  "ground_chicken": {
    proteinRole: 'secondary',
    protein: 27.0,
    fat: 7.4,
    calcium: 11,
    phosphorus: 190,
    vitaminA: 0, // Muscle meat has negligible vitamin A
    kcal: 172,
    source: "USDA FDC ID: 171116 (estimated from chicken breast)",
    speciesCompatibility: {
      dog: 'ok',
      cat: 'ok',
      bird: 'limit',
      reptile: 'limit',
      'pocket-pet': 'avoid'
    },
    feedingRole: 'secondary', // Secondary protein for dogs
    maxInclusionPercentBySpecies: {
      dog: 0.50,
      cat: 0.60,
      bird: 0.10,
      reptile: 0.20,
      'pocket-pet': 0
    },
    notesBySpecies: {
      bird: 'Only for carnivorous birds (raptors, corvids). Not suitable for seed-eating birds.',
      reptile: 'Only for omnivorous/carnivorous reptiles. Not for herbivorous species.',
      'pocket-pet': 'Not suitable for herbivorous pocket pets (rabbits, guinea pigs). Avoid for omnivorous hamsters/gerbils except under vet direction.'
    },
    confidenceBySpecies: {
      dog: 'high',
      cat: 'high',
      bird: 'medium',
      reptile: 'medium',
      'pocket-pet': 'high'
    }
  },
  "chicken_thighs": {
    proteinRole: 'secondary',
    protein: 20.6,
    fat: 14.1,
    calcium: 9,
    phosphorus: 170,
    vitaminA: 0, // Muscle meat has negligible vitamin A
    kcal: 209,
    source: "USDA FDC ID: 171450",
    speciesCompatibility: {
      dog: 'ok',
      cat: 'ok',
      bird: 'limit',
      reptile: 'limit',
      'pocket-pet': 'avoid'
    },
    feedingRole: 'secondary', // Secondary protein for dogs
    maxInclusionPercentBySpecies: {
      dog: 0.50,
      cat: 0.60,
      bird: 0.10,
      reptile: 0.20,
      'pocket-pet': 0
    },
    notesBySpecies: {
      bird: 'Only for carnivorous birds (raptors, corvids). Not suitable for seed-eating birds.',
      reptile: 'Only for omnivorous/carnivorous reptiles. Not for herbivorous species.',
      'pocket-pet': 'Not suitable for herbivorous pocket pets (rabbits, guinea pigs). Avoid for omnivorous hamsters/gerbils except under vet direction.'
    },
    confidenceBySpecies: {
      dog: 'high',
      cat: 'high',
      bird: 'medium',
      reptile: 'medium',
      'pocket-pet': 'high'
    }
  },
  "turkey_breast": {
    proteinRole: 'secondary',
    protein: 30.1,
    fat: 1.0,
    calcium: 6,
    phosphorus: 223,
    moisture: 70,
    vitaminA: 0, // Muscle meat has negligible vitamin A
    kcal: 135,
    source: "USDA FDC ID: 171479",
    speciesCompatibility: {
      dog: 'ok',
      cat: 'ok',
      bird: 'limit',
      reptile: 'limit',
      'pocket-pet': 'avoid'
    },
    feedingRole: 'secondary', // Secondary protein for dogs
    maxInclusionPercentBySpecies: {
      dog: 0.50,
      cat: 0.60,
      bird: 0.10,
      reptile: 0.20,
      'pocket-pet': 0
    },
    notesBySpecies: {
      bird: 'Only for carnivorous birds (raptors, corvids). Not suitable for seed-eating birds.',
      reptile: 'Only for omnivorous/carnivorous reptiles. Not for herbivorous species.',
      'pocket-pet': 'Not suitable for herbivorous pocket pets (rabbits, guinea pigs). Avoid for omnivorous hamsters/gerbils except under vet direction.'
    },
    confidenceBySpecies: {
      dog: 'high',
      cat: 'high',
      bird: 'medium',
      reptile: 'medium',
      'pocket-pet': 'high'
    }
  },
  "chicken_liver": {
    protein: 16.9,
    fat: 4.8,
    calcium: 8,
    phosphorus: 241,
    kcal: 119,
    source: "USDA FDC ID: 171060",
    speciesCompatibility: {
      dog: 'ok',
      cat: 'ok',
      bird: 'limit',
      reptile: 'limit',
      'pocket-pet': 'avoid'
    },
    feedingRole: 'supplement',
    maxInclusionPercentBySpecies: {
      dog: 0.10,
      cat: 0.15,
      bird: 0.05,
      reptile: 0.10,
      'pocket-pet': 0
    },
    notesBySpecies: {
      dog: 'High in vitamin A - limit to prevent hypervitaminosis A.',
      cat: 'Excellent source of taurine and vitamin A. Limit to prevent toxicity.',
      bird: 'Only for carnivorous birds. Very high in vitamin A.',
      reptile: 'Only for carnivorous reptiles. High vitamin A content.',
      'pocket-pet': 'Not suitable for herbivorous pocket pets (rabbits, guinea pigs). Avoid for omnivorous hamsters/gerbils; vitamin A levels are excessive.'
    },
    confidenceBySpecies: {
      dog: 'high',
      cat: 'high',
      bird: 'medium',
      reptile: 'medium',
      'pocket-pet': 'high'
    }
  },
  "chicken_hearts": {
    protein: 15.9,
    fat: 9.3,
    calcium: 7,
    phosphorus: 204,
    kcal: 153,
    source: "USDA FDC ID: 171059",
    speciesCompatibility: {
      dog: 'ok',
      cat: 'ok',
      bird: 'limit',
      reptile: 'limit',
      'pocket-pet': 'avoid'
    },
    feedingRole: 'supplement',
    maxInclusionPercentBySpecies: {
      dog: 0.15,
      cat: 0.20,
      bird: 0.05,
      reptile: 0.10,
      'pocket-pet': 0
    },
    notesBySpecies: {
      cat: 'Excellent source of taurine for cats.',
      'pocket-pet': 'Not suitable for herbivorous pocket pets (rabbits, guinea pigs). Avoid for omnivorous hamsters/gerbils; excessive animal protein.'
    },
    confidenceBySpecies: {
      dog: 'high',
      cat: 'high',
      bird: 'medium',
      reptile: 'medium',
      'pocket-pet': 'high'
    }
  },

  // Fish
  "salmon_atlantic": {
    proteinRole: 'primary', // PRIMARY PROTEIN FOR CATS
    protein: 20.4,
    fat: 13.4,
    omega3: 2.26,
    calcium: 12,
    phosphorus: 200,
    vitaminA: 30, // Fish has low vitamin A (USDA FDC ID: 175168)
    kcal: 208,
    source: "USDA FDC ID: 175168",
    speciesCompatibility: {
      dog: 'ok',
      cat: 'ok',
      bird: 'limit',
      reptile: 'limit',
      'pocket-pet': 'avoid'
    },
    feedingRole: 'staple', // PRIMARY PROTEIN FOR CATS
    maxInclusionPercentBySpecies: {
      dog: 0.40,
      cat: 0.50,
      bird: 0.10,
      reptile: 0.15,
      'pocket-pet': 0
    },
    notesBySpecies: {
      bird: 'Only for carnivorous birds. High fat content - limit frequency.',
      reptile: 'Only for carnivorous reptiles. Ensure proper Ca:P ratio with supplementation.',
      'pocket-pet': 'Not suitable for herbivorous pocket pets (rabbits, guinea pigs). Avoid for omnivorous hamsters/gerbils due to fat and protein load.'
    },
    confidenceBySpecies: {
      dog: 'high',
      cat: 'high',
      bird: 'medium',
      reptile: 'medium',
      'pocket-pet': 'high'
    }
  },
  "sardines_water": {
    proteinRole: 'secondary',
    protein: 24.6,
    fat: 13.9,
    omega3: 1.48,
    calcium: 382,
    phosphorus: 490,
    vitaminA: 40, // Fish has low vitamin A
    kcal: 208,
    source: "USDA FDC ID: 175139",
    speciesCompatibility: {
      dog: 'ok',
      cat: 'ok',
      bird: 'limit',
      reptile: 'limit',
      'pocket-pet': 'avoid'
    },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: {
      dog: 0.30,
      cat: 0.40,
      bird: 0.10,
      reptile: 0.15,
      'pocket-pet': 0
    },
    notesBySpecies: {
      dog: 'Excellent source of omega-3 and calcium. High phosphorus - balance with calcium.',
      cat: 'Great source of omega-3 and taurine. High calcium content.',
      bird: 'Only for carnivorous birds. High fat content.',
      reptile: 'Only for carnivorous reptiles. High calcium but also high phosphorus.',
      'pocket-pet': 'Not suitable for herbivorous pocket pets. Avoid for omnivorous hamsters/gerbils; excessive fat and calcium.'
    },
    confidenceBySpecies: {
      dog: 'high',
      cat: 'high',
      bird: 'medium',
      reptile: 'medium',
      'pocket-pet': 'high'
    }
  },
  "tuna_in_water": {
    protein: 25.5,
    fat: 1.0,
    calcium: 11,
    phosphorus: 208,
    kcal: 86,
    source: "USDA FDC ID: 175160",
    speciesCompatibility: {
      dog: 'ok',
      cat: 'ok',
      bird: 'limit',
      reptile: 'limit',
      'pocket-pet': 'avoid'
    },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: {
      dog: 0.30,
      cat: 0.40,
      bird: 0.10,
      reptile: 0.15,
      'pocket-pet': 0
    },
    notesBySpecies: {
      cat: 'Good source of protein. Limit frequency due to mercury concerns.',
      bird: 'Only for carnivorous birds. Limit due to mercury.',
      reptile: 'Only for carnivorous reptiles. Low fat option.',
      'pocket-pet': 'Not suitable for herbivorous pocket pets. Avoid for omnivorous hamsters/gerbils; mercury risk and protein load.'
    },
    confidenceBySpecies: {
      dog: 'high',
      cat: 'high',
      bird: 'medium',
      reptile: 'medium',
      'pocket-pet': 'high'
    }
  },

  // Beef
  "ground_beef_lean": {
    protein: 25.6,
    fat: 16.0,
    calcium: 6,
    phosphorus: 179,
    kcal: 230,
    source: "USDA FDC ID: 23547",
    speciesCompatibility: {
      dog: 'ok',
      cat: 'caution',
      bird: 'limit',
      reptile: 'limit',
      'pocket-pet': 'avoid'
    },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: {
      dog: 0.50,
      cat: 0.30,
      bird: 0.10,
      reptile: 0.20,
      'pocket-pet': 0
    },
    notesBySpecies: {
      cat: 'Some cats are allergic or intolerant to beef. Monitor for reactions.',
      bird: 'Only for carnivorous birds.',
      reptile: 'Only for carnivorous reptiles.',
      'pocket-pet': 'Not suitable for herbivorous pocket pets. Avoid for omnivorous hamsters/gerbils due to high fat/protein.'
    },
    confidenceBySpecies: {
      dog: 'high',
      cat: 'medium',
      bird: 'medium',
      reptile: 'medium',
      'pocket-pet': 'high'
    }
  },
  "beef_liver": {
    protein: 20.4,
    fat: 3.6,
    calcium: 6,
    phosphorus: 387,
    kcal: 135,
    source: "USDA FDC ID: 169451",
    speciesCompatibility: {
      dog: 'ok',
      cat: 'caution',
      bird: 'limit',
      reptile: 'limit',
      'pocket-pet': 'avoid'
    },
    feedingRole: 'supplement',
    maxInclusionPercentBySpecies: {
      dog: 0.10,
      cat: 0.10,
      bird: 0.05,
      reptile: 0.10,
      'pocket-pet': 0
    },
    notesBySpecies: {
      dog: 'Very high in vitamin A - limit to prevent hypervitaminosis A.',
      cat: 'Some cats allergic to beef. High vitamin A - limit to prevent toxicity.',
      bird: 'Only for carnivorous birds. Extremely high in vitamin A.',
      reptile: 'Only for carnivorous reptiles. Very high vitamin A content.',
      'pocket-pet': 'Not suitable for herbivorous pocket pets. Avoid for omnivorous hamsters/gerbils; vitamin A content is excessive.'
    },
    confidenceBySpecies: {
      dog: 'high',
      cat: 'medium',
      bird: 'medium',
      reptile: 'medium',
      'pocket-pet': 'high'
    }
  },

  // Eggs
  "eggs_whole": {
    protein: 12.6,
    fat: 9.5,
    calcium: 56,
    phosphorus: 198,
    kcal: 143,
    source: "USDA FDC ID: 173424",
    speciesCompatibility: {
      dog: 'ok',
      cat: 'ok',
      bird: 'ok',
      reptile: 'ok',
      'pocket-pet': 'ok'
    },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: {
      dog: 0.20,
      cat: 0.25,
      bird: 0.15,
      reptile: 0.20,
      'pocket-pet': 0.10
    },
    notesBySpecies: {
      dog: 'Excellent protein source. Cook to reduce biotin binding.',
      cat: 'Great source of protein and taurine. Cook thoroughly.',
      bird: 'Excellent for all birds. Cook thoroughly to prevent salmonella.',
      reptile: 'Good protein source for omnivorous reptiles. Cook thoroughly.',
      'pocket-pet': 'Good for hamsters and gerbils. Limit for rabbits and guinea pigs.'
    },
    confidenceBySpecies: {
      dog: 'high',
      cat: 'high',
      bird: 'medium',
      reptile: 'medium',
      'pocket-pet': 'medium'
    }
  },

  // Vegetables for Herbivores
  "kale_raw": {
    protein: 2.9,
    fat: 0.4,
    calcium: 254,
    phosphorus: 55,
    CaP_ratio: 4.6,
    vitaminA: 9990,
    vitaminC: 93.4,
    kcal: 35,
    source: "USDA FDC ID: 168421",
    speciesCompatibility: {
      dog: 'ok',
      cat: 'limit',
      bird: 'ok',
      reptile: 'ok',
      'pocket-pet': 'ok'
    },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: {
      dog: 0.15,
      cat: 0.10,
      bird: 0.20,
      reptile: 0.30,
      'pocket-pet': 0.25
    },
    notesBySpecies: {
      cat: 'High calcium - good for bone health but limit due to oxalates.',
      bird: 'Excellent for parrots. High in vitamin A and calcium.',
      reptile: 'Excellent for herbivorous lizards. High Ca:P ratio is ideal.',
      'pocket-pet': 'Great for rabbits and guinea pigs. High calcium content.'
    },
    confidenceBySpecies: {
      dog: 'medium',
      cat: 'medium',
      bird: 'high',
      reptile: 'high',
      'pocket-pet': 'high'
    }
  },
  "spinach_raw": {
    protein: 2.9,
    fat: 0.4,
    calcium: 99,
    phosphorus: 49,
    vitaminA: 9377,
    vitaminC: 28.1,
    kcal: 23,
    source: "USDA FDC ID: 168462",
    speciesCompatibility: {
      dog: 'ok',
      cat: 'limit',
      bird: 'ok',
      reptile: 'ok',
      'pocket-pet': 'ok'
    },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: {
      dog: 0.10,
      cat: 0.05,
      bird: 0.15,
      reptile: 0.25,
      'pocket-pet': 0.20
    },
    notesBySpecies: {
      cat: 'High in oxalates - limit to prevent urinary issues.',
      bird: 'Excellent for parrots. High in vitamin A and calcium.',
      reptile: 'Great for herbivorous lizards. Good Ca:P ratio.',
      'pocket-pet': 'Excellent for rabbits and guinea pigs. High calcium.'
    },
    confidenceBySpecies: {
      dog: 'medium',
      cat: 'medium',
      bird: 'high',
      reptile: 'high',
      'pocket-pet': 'high'
    }
  },
  "carrots_raw": {
    protein: 0.9,
    fat: 0.2,
    calcium: 33,
    phosphorus: 35,
    vitaminA: 16706,
    vitaminC: 5.9,
    kcal: 41,
    source: "USDA FDC ID: 170393",
    speciesCompatibility: {
      dog: 'ok',
      cat: 'limit',
      bird: 'ok',
      reptile: 'ok',
      'pocket-pet': 'ok'
    },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: {
      dog: 0.15,
      cat: 0.10,
      bird: 0.20,
      reptile: 0.20,
      'pocket-pet': 0.15
    },
    notesBySpecies: {
      cat: 'High in beta-carotene. Limit as cats are obligate carnivores.',
      bird: 'Excellent for all birds. High in vitamin A.',
      reptile: 'Good for herbivorous reptiles. High vitamin A content.',
      'pocket-pet': 'Great for all pocket pets. High in vitamin A.'
    },
    confidenceBySpecies: {
      dog: 'medium',
      cat: 'medium',
      bird: 'high',
      reptile: 'high',
      'pocket-pet': 'high'
    }
  },
  "sweet_potato": {
    protein: 1.6,
    fat: 0.1,
    calcium: 30,
    phosphorus: 47,
    vitaminA: 14187,
    vitaminC: 2.4,
    kcal: 86,
    source: "USDA FDC ID: 168482",
    speciesCompatibility: {
      dog: 'ok',
      cat: 'limit',
      bird: 'ok',
      reptile: 'ok',
      'pocket-pet': 'ok'
    },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: {
      dog: 0.20,
      cat: 0.10,
      bird: 0.15,
      reptile: 0.25,
      'pocket-pet': 0.20
    },
    notesBySpecies: {
      cat: 'High in carbs - limit as cats are obligate carnivores.',
      bird: 'Good for larger parrots. Cook before feeding.',
      reptile: 'Excellent for herbivorous reptiles. Cook before feeding.',
      'pocket-pet': 'Good for all pocket pets. Cook before feeding.'
    },
    confidenceBySpecies: {
      dog: 'medium',
      cat: 'medium',
      bird: 'high',
      reptile: 'high',
      'pocket-pet': 'high'
    }
  },
  "pumpkin": {
    protein: 1.0,
    fat: 0.1,
    calcium: 21,
    phosphorus: 44,
    vitaminA: 7384,
    vitaminC: 9.0,
    fiber: 1.5,
    kcal: 26,
    source: "USDA FDC ID: 168448",
    speciesCompatibility: {
      dog: 'ok',
      cat: 'ok',
      bird: 'ok',
      reptile: 'ok',
      'pocket-pet': 'ok'
    },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: {
      dog: 0.15,
      cat: 0.10,
      bird: 0.15,
      reptile: 0.20,
      'pocket-pet': 0.15
    },
    notesBySpecies: {
      cat: 'Good for digestive health. Lower in carbs than sweet potato.',
      bird: 'Good for all birds. High in beta-carotene.',
      reptile: 'Excellent for herbivorous reptiles. High in beta-carotene.',
      'pocket-pet': 'Good for all pocket pets. High in beta-carotene.'
    },
    confidenceBySpecies: {
      dog: 'medium',
      cat: 'medium',
      bird: 'high',
      reptile: 'high',
      'pocket-pet': 'high'
    }
  },
  "broccoli_raw": {
    protein: 2.8,
    fat: 0.4,
    calcium: 47,
    phosphorus: 66,
    vitaminA: 623,
    vitaminC: 89.2,
    kcal: 34,
    source: "USDA FDC ID: 170379",
    speciesCompatibility: {
      dog: 'ok',
      cat: 'limit',
      bird: 'ok',
      reptile: 'ok',
      'pocket-pet': 'ok'
    },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: {
      dog: 0.10,
      cat: 0.05,
      bird: 0.15,
      reptile: 0.20,
      'pocket-pet': 0.15
    },
    notesBySpecies: {
      cat: 'High in fiber - limit as cats are obligate carnivores.',
      bird: 'Excellent for parrots. High in vitamin C.',
      reptile: 'Good for herbivorous reptiles. High in vitamin C.',
      'pocket-pet': 'Great for rabbits and guinea pigs. High in vitamin C.'
    },
    confidenceBySpecies: {
      dog: 'medium',
      cat: 'medium',
      bird: 'high',
      reptile: 'high',
      'pocket-pet': 'high'
    }
  },
  "green_beans_raw": {
    protein: 1.8,
    fat: 0.1,
    calcium: 37,
    phosphorus: 38,
    vitaminA: 690,
    vitaminC: 12.2,
    fiber: 2.7,
    kcal: 31,
    source: "USDA FDC ID: 168390",
    speciesCompatibility: {
      dog: 'ok',
      cat: 'limit',
      bird: 'ok',
      reptile: 'ok',
      'pocket-pet': 'ok'
    },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: {
      dog: 0.15,
      cat: 0.05,
      bird: 0.20,
      reptile: 0.25,
      'pocket-pet': 0.20
    },
    notesBySpecies: {
      cat: 'Low in phosphorus - good for kidney support, but limit as cats are obligate carnivores.',
      bird: 'Excellent for all birds. Low phosphorus makes it good for kidney health.',
      reptile: 'Excellent for herbivorous reptiles. Low phosphorus, good Ca:P ratio.',
      'pocket-pet': 'Great for rabbits and guinea pigs. Low phosphorus is beneficial.'
    },
    confidenceBySpecies: {
      dog: 'medium',
      cat: 'medium',
      bird: 'high',
      reptile: 'high',
      'pocket-pet': 'high'
    }
  },
  "celery_raw": {
    protein: 0.7,
    fat: 0.2,
    calcium: 40,
    phosphorus: 24,
    vitaminA: 449,
    vitaminC: 3.1,
    kcal: 16,
    source: "USDA FDC ID: 169988",
    speciesCompatibility: {
      dog: 'ok',
      cat: 'limit',
      bird: 'ok',
      reptile: 'ok',
      'pocket-pet': 'ok'
    },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: {
      dog: 0.10,
      cat: 0.05,
      bird: 0.15,
      reptile: 0.20,
      'pocket-pet': 0.15
    },
    notesBySpecies: {
      cat: 'Low nutritional value for cats. Limit as cats are obligate carnivores.',
      bird: 'Good for all birds. High water content.',
      reptile: 'Excellent for herbivorous reptiles. Good Ca:P ratio.',
      'pocket-pet': 'Great for rabbits and guinea pigs. High water content.'
    },
    confidenceBySpecies: {
      dog: 'medium',
      cat: 'medium',
      bird: 'high',
      reptile: 'high',
      'pocket-pet': 'high'
    }
  },
  "bok_choy": {
    protein: 1.5,
    fat: 0.2,
    calcium: 105,
    phosphorus: 37,
    CaP_ratio: 2.8,
    vitaminA: 4468,
    vitaminC: 45.0,
    fiber: 1.0,
    kcal: 13,
    source: "USDA FDC ID: 170386",
    speciesCompatibility: {
      dog: 'ok',
      cat: 'ok',
      bird: 'ok',
      reptile: 'ok',
      'pocket-pet': 'ok'
    },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: {
      dog: 0.15,
      cat: 0.10,
      bird: 0.20,
      reptile: 0.25,
      'pocket-pet': 0.20
    },
    notesBySpecies: {
      cat: 'Low in oxalates compared to kale - safer for cats. Good source of calcium.',
      bird: 'Excellent for all birds. Low oxalates, high calcium.',
      reptile: 'Excellent for herbivorous reptiles. Low oxalates, excellent Ca:P ratio.',
      'pocket-pet': 'Great for rabbits and guinea pigs. Low oxalates make it safer than kale.'
    },
    confidenceBySpecies: {
      dog: 'medium',
      cat: 'medium',
      bird: 'high',
      reptile: 'high',
      'pocket-pet': 'high'
    }
  },

  // Fruits
  "blueberries_raw": {
    protein: 0.7,
    fat: 0.3,
    calcium: 6,
    phosphorus: 12,
    vitaminA: 54,
    vitaminC: 9.7,
    kcal: 57,
    source: "USDA FDC ID: 171711",
    speciesCompatibility: {
      dog: 'ok',
      cat: 'limit',
      bird: 'ok',
      reptile: 'ok',
      'pocket-pet': 'ok'
    },
    feedingRole: 'treat',
    maxInclusionPercentBySpecies: {
      dog: 0.10,
      cat: 0.05,
      bird: 0.15,
      reptile: 0.15,
      'pocket-pet': 0.10
    },
    notesBySpecies: {
      cat: 'High in sugar - limit as cats are obligate carnivores.',
      bird: 'Excellent for all birds. High in antioxidants.',
      reptile: 'Good for omnivorous reptiles. High in antioxidants.',
      'pocket-pet': 'Great treat for all pocket pets. High in antioxidants.'
    },
    confidenceBySpecies: {
      dog: 'medium',
      cat: 'medium',
      bird: 'high',
      reptile: 'medium',
      'pocket-pet': 'high'
    }
  },
  "bananas_raw": {
    protein: 1.1,
    fat: 0.3,
    calcium: 5,
    phosphorus: 22,
    vitaminA: 64,
    vitaminC: 8.7,
    kcal: 89,
    source: "USDA FDC ID: 173944",
    speciesCompatibility: {
      dog: 'ok',
      cat: 'limit',
      bird: 'ok',
      reptile: 'ok',
      'pocket-pet': 'ok'
    },
    feedingRole: 'treat',
    maxInclusionPercentBySpecies: {
      dog: 0.10,
      cat: 0.05,
      bird: 0.15,
      reptile: 0.15,
      'pocket-pet': 0.10
    },
    notesBySpecies: {
      cat: 'High in sugar - limit as cats are obligate carnivores.',
      bird: 'Excellent for all birds. High in potassium.',
      reptile: 'Good for omnivorous reptiles. High in potassium.',
      'pocket-pet': 'Great treat for all pocket pets. High in potassium.'
    },
    confidenceBySpecies: {
      dog: 'medium',
      cat: 'medium',
      bird: 'high',
      reptile: 'medium',
      'pocket-pet': 'high'
    }
  },

  // Grains/Carbs
  "brown_rice_cooked": {
    protein: 2.7,
    fat: 0.9,
    calcium: 10,
    phosphorus: 83,
    kcal: 123,
    source: "USDA FDC ID: 20040",
    speciesCompatibility: {
      dog: 'ok',
      cat: 'limit',
      bird: 'ok',
      reptile: 'limit',
      'pocket-pet': 'ok'
    },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: {
      dog: 0.30,
      cat: 0.10,
      bird: 0.25,
      reptile: 0.15,
      'pocket-pet': 0.20
    },
    notesBySpecies: {
      cat: 'Cats are obligate carnivores - grains should be minimal.',
      bird: 'Good for larger parrots. Smaller birds may prefer whole grains.',
      reptile: 'Only for omnivorous species. Not suitable for strict herbivores or carnivores.',
      'pocket-pet': 'Suitable for hamsters, gerbils. Limit for rabbits and guinea pigs.'
    },
    confidenceBySpecies: {
      dog: 'medium',
      cat: 'medium',
      bird: 'medium',
      reptile: 'medium',
      'pocket-pet': 'medium'
    }
  },
  "white_rice_cooked": {
    protein: 2.7,
    fat: 0.3,
    calcium: 3,
    phosphorus: 8,
    kcal: 130,
    source: "USDA FDC ID: 20036",
    speciesCompatibility: {
      dog: 'ok',
      cat: 'limit',
      bird: 'ok',
      reptile: 'limit',
      'pocket-pet': 'ok'
    },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: {
      dog: 0.30,
      cat: 0.10,
      bird: 0.25,
      reptile: 0.15,
      'pocket-pet': 0.20
    },
    notesBySpecies: {
      cat: 'Cats are obligate carnivores - grains should be minimal. White rice is lower in nutrients than brown rice.',
      bird: 'Good for larger parrots. Lower in fiber than brown rice.',
      reptile: 'Only for omnivorous species. Lower in nutrients than brown rice.',
      'pocket-pet': 'Suitable for hamsters, gerbils. Lower in nutrients than brown rice.'
    },
    confidenceBySpecies: {
      dog: 'medium',
      cat: 'medium',
      bird: 'medium',
      reptile: 'medium',
      'pocket-pet': 'medium'
    }
  },
  "oats": {
    protein: 16.9,
    fat: 6.9,
    calcium: 54,
    phosphorus: 523,
    kcal: 379,
    source: "USDA FDC ID: 169705",
    speciesCompatibility: {
      dog: 'ok',
      cat: 'limit',
      bird: 'ok',
      reptile: 'limit',
      'pocket-pet': 'ok'
    },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: {
      dog: 0.25,
      cat: 0.10,
      bird: 0.20,
      reptile: 0.15,
      'pocket-pet': 0.20
    },
    notesBySpecies: {
      cat: 'Cats are obligate carnivores - grains should be minimal.',
      bird: 'Good for larger parrots. Smaller birds prefer whole grains.',
      reptile: 'Only for omnivorous species. Not suitable for strict herbivores or carnivores.',
      'pocket-pet': 'Suitable for hamsters, gerbils. Limit for rabbits and guinea pigs.'
    },
    confidenceBySpecies: {
      dog: 'medium',
      cat: 'medium',
      bird: 'medium',
      reptile: 'medium',
      'pocket-pet': 'medium'
    }
  },
  "quinoa_cooked": {
    protein: 4.4,
    fat: 1.9,
    calcium: 17,
    phosphorus: 152,
    kcal: 120,
    source: "USDA FDC ID: 20137",
    speciesCompatibility: {
      dog: 'ok',
      cat: 'limit',
      bird: 'ok',
      reptile: 'limit',
      'pocket-pet': 'ok'
    },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: {
      dog: 0.25,
      cat: 0.10,
      bird: 0.20,
      reptile: 0.15,
      'pocket-pet': 0.20
    },
    notesBySpecies: {
      cat: 'Cats are obligate carnivores - grains should be minimal.',
      bird: 'Good for larger parrots. High protein for a grain.',
      reptile: 'Only for omnivorous species. Not suitable for strict herbivores or carnivores.',
      'pocket-pet': 'Suitable for hamsters, gerbils. Limit for rabbits and guinea pigs.'
    },
    confidenceBySpecies: {
      dog: 'medium',
      cat: 'medium',
      bird: 'medium',
      reptile: 'medium',
      'pocket-pet': 'medium'
    }
  },

  // Supplements
  "calcium_carbonate": {
    calcium: 40000, // 40% calcium by weight
    phosphorus: 0,
    CaP_ratio: 999, // effectively infinite
    source: "Supplement standard",
    speciesCompatibility: {
      dog: 'ok',
      cat: 'ok',
      bird: 'ok',
      reptile: 'ok',
      'pocket-pet': 'ok'
    },
    feedingRole: 'supplement',
    maxInclusionPercentBySpecies: {
      dog: 0.02,
      cat: 0.02,
      bird: 0.03,
      reptile: 0.05,
      'pocket-pet': 0.03
    },
    notesBySpecies: {
      dog: 'Essential for bone health. Use to balance Ca:P ratio.',
      cat: 'Important for bone health. Ensure proper Ca:P balance.',
      bird: 'Critical for egg-laying females. Prevents egg binding.',
      reptile: 'Essential for herbivorous species. Prevents metabolic bone disease.',
      'pocket-pet': 'Critical for rabbits and guinea pigs. Prevents dental issues.'
    },
    confidenceBySpecies: {
      dog: 'high',
      cat: 'high',
      bird: 'high',
      reptile: 'high',
      'pocket-pet': 'high'
    }
  },
  "fish_oil": {
    protein: 0,
    fat: 100,
    omega3: 30, // concentrated EPA+DHA
    kcal: 902,
    source: "Supplement standard",
    speciesCompatibility: {
      dog: 'ok',
      cat: 'ok',
      bird: 'limit',
      reptile: 'limit',
      'pocket-pet': 'avoid'
    },
    feedingRole: 'supplement',
    maxInclusionPercentBySpecies: {
      dog: 0.05,
      cat: 0.05,
      bird: 0.02,
      reptile: 0.02,
      'pocket-pet': 0
    },
    notesBySpecies: {
      dog: 'Excellent source of omega-3. Supports skin, coat, and joint health.',
      cat: 'Essential for cats. Supports heart and eye health.',
      bird: 'Only for carnivorous birds. Not needed for seed-eating species.',
      reptile: 'Only for carnivorous reptiles. Not for herbivorous species.',
      'pocket-pet': 'Avoid for rabbits and guinea pigs; fat load and fish proteins are inappropriate for herbivorous pocket pets.'
    },
    confidenceBySpecies: {
      dog: 'high',
      cat: 'high',
      bird: 'medium',
      reptile: 'medium',
      'pocket-pet': 'high'
    }
  },
  "taurine_powder": {
    protein: 0, // pure amino acid
    source: "Supplement standard",
    speciesCompatibility: {
      dog: 'ok',
      cat: 'ok',
      bird: 'avoid',
      reptile: 'avoid',
      'pocket-pet': 'avoid'
    },
    feedingRole: 'supplement',
    maxInclusionPercentBySpecies: {
      dog: 0.01,
      cat: 0.02,
      bird: 0,
      reptile: 0,
      'pocket-pet': 0
    },
    notesBySpecies: {
      dog: 'Dogs can synthesize taurine but supplementation can be beneficial.',
      cat: 'CRITICAL for cats. Cats cannot synthesize taurine - deficiency causes blindness and heart failure.',
      bird: 'Avoid for seed-eating birds; unnecessary and unstudied.',
      reptile: 'Avoid for herbivorous reptiles; unnecessary for carnivores when diet is balanced.',
      'pocket-pet': 'Avoid for rabbits and guinea pigs; not part of herbivore requirement.'
    },
    confidenceBySpecies: {
      dog: 'high',
      cat: 'high',
      bird: 'medium',
      reptile: 'medium',
      'pocket-pet': 'high'
    }
  },

  // Additional Proteins
  "ground_lamb": {
    proteinRole: 'secondary',
    protein: 25.0,
    fat: 17.0,
    calcium: 15,
    phosphorus: 180,
    kcal: 250,
    source: "USDA FDC ID: 23195",
    speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'avoid' },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: { dog: 0.50, cat: 0.30, bird: 0.10, reptile: 0.20, 'pocket-pet': 0 }
  },
  "duck_breast": {
    proteinRole: 'secondary',
    protein: 23.5,
    fat: 9.2,
    calcium: 12,
    phosphorus: 210,
    kcal: 201,
    source: "USDA FDC ID: 171082",
    speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'avoid' },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: { dog: 0.40, cat: 0.30, bird: 0.10, reptile: 0.15, 'pocket-pet': 0 }
  },
  "venison": {
    proteinRole: 'secondary',
    protein: 26.0,
    fat: 3.2,
    calcium: 10,
    phosphorus: 200,
    kcal: 158,
    source: "USDA FDC ID: 23671",
    speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'avoid' },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: { dog: 0.50, cat: 0.40, bird: 0.10, reptile: 0.20, 'pocket-pet': 0 }
  },
  "rabbit_meat": {
    proteinRole: 'secondary',
    protein: 21.0,
    fat: 8.0,
    calcium: 18,
    phosphorus: 180,
    kcal: 173,
    source: "USDA FDC ID: 23672",
    speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'avoid' },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: { dog: 0.40, cat: 0.40, bird: 0.10, reptile: 0.15, 'pocket-pet': 0 }
  },
  "quail": {
    proteinRole: 'primary', // PRIMARY PROTEIN FOR REPTILES
    protein: 25.0,
    fat: 11.0,
    calcium: 14,
    phosphorus: 220,
    vitaminA: 0, // Muscle meat has negligible vitamin A
    kcal: 226,
    source: "USDA FDC ID: 171125",
    speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'ok', 'pocket-pet': 'avoid' },
    feedingRole: 'staple', // PRIMARY PROTEIN FOR REPTILES
    maxInclusionPercentBySpecies: { dog: 0.30, cat: 0.30, bird: 0.10, reptile: 0.30, 'pocket-pet': 0 }
  },
  "lamb_liver": {
    proteinRole: 'secondary',
    protein: 20.0,
    fat: 6.0,
    calcium: 8,
    phosphorus: 350,
    vitaminA: 36000, // Organ meat: high vitamin A (USDA)
    kcal: 137,
    source: "USDA FDC ID: 23195",
    speciesCompatibility: { dog: 'ok', cat: 'caution', bird: 'limit', reptile: 'limit', 'pocket-pet': 'avoid' },
    feedingRole: 'supplement', // Organ meat - not staple
    maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.10, bird: 0.05, reptile: 0.10, 'pocket-pet': 0 }
  },
  "turkey_liver": {
    proteinRole: 'secondary',
    protein: 18.0,
    fat: 5.0,
    calcium: 10,
    phosphorus: 280,
    kcal: 140,
    source: "USDA estimate",
    speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'avoid' },
    feedingRole: 'supplement',
    maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.10, bird: 0.05, reptile: 0.10, 'pocket-pet': 0 }
  },
  "duck_hearts": {
    proteinRole: 'secondary',
    protein: 16.0,
    fat: 10.0,
    calcium: 8,
    phosphorus: 200,
    kcal: 160,
    source: "USDA estimate",
    speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'avoid' },
    feedingRole: 'supplement',
    maxInclusionPercentBySpecies: { dog: 0.15, cat: 0.15, bird: 0.05, reptile: 0.10, 'pocket-pet': 0 }
  },
  "mackerel_canned": {
    proteinRole: 'secondary',
    protein: 20.0,
    fat: 13.9,
    omega3: 2.0,
    calcium: 300,
    phosphorus: 250,
    vitaminA: 50, // Fish has low vitamin A
    kcal: 205,
    source: "USDA FDC ID: 175142",
    speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'avoid' },
    feedingRole: 'secondary', // Secondary protein for dogs/cats
    maxInclusionPercentBySpecies: { dog: 0.30, cat: 0.40, bird: 0.10, reptile: 0.15, 'pocket-pet': 0 }
  },
  "herring_canned": {
    proteinRole: 'secondary',
    protein: 18.0,
    fat: 12.0,
    omega3: 1.8,
    calcium: 280,
    phosphorus: 240,
    vitaminA: 50, // Fish has low vitamin A
    kcal: 195,
    source: "USDA estimate",
    speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'avoid' },
    feedingRole: 'secondary', // Secondary protein for dogs/cats
    maxInclusionPercentBySpecies: { dog: 0.30, cat: 0.40, bird: 0.10, reptile: 0.15, 'pocket-pet': 0 }
  },
  "anchovies_canned": {
    proteinRole: 'secondary',
    protein: 20.0,
    fat: 11.0,
    omega3: 2.4,
    calcium: 380,
    phosphorus: 280,
    vitaminA: 60, // Fish has low vitamin A
    kcal: 210,
    source: "USDA FDC ID: 175134",
    speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'avoid' },
    feedingRole: 'secondary', // Secondary protein for dogs/cats
    maxInclusionPercentBySpecies: { dog: 0.20, cat: 0.30, bird: 0.10, reptile: 0.15, 'pocket-pet': 0 }
  },

  // Additional Vegetables
  "collard_greens": {
    protein: 3.6,
    fat: 0.6,
    calcium: 232,
    phosphorus: 58,
    vitaminA: 10260,
    vitaminC: 35.3,
    kcal: 33,
    source: "USDA FDC ID: 169998",
    speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: { dog: 0.15, cat: 0.10, bird: 0.20, reptile: 0.30, 'pocket-pet': 0.25 }
  },
  "mustard_greens": {
    protein: 2.7,
    fat: 0.4,
    calcium: 103,
    phosphorus: 44,
    vitaminA: 5560,
    vitaminC: 65.0,
    kcal: 27,
    source: "USDA FDC ID: 169434",
    speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: { dog: 0.15, cat: 0.10, bird: 0.20, reptile: 0.30, 'pocket-pet': 0.25 }
  },
  "turnip_greens": {
    protein: 1.6,
    fat: 0.3,
    calcium: 190,
    phosphorus: 42,
    vitaminA: 6270,
    vitaminC: 60.0,
    kcal: 32,
    source: "USDA FDC ID: 169512",
    speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: { dog: 0.15, cat: 0.10, bird: 0.20, reptile: 0.30, 'pocket-pet': 0.25 }
  },
  "dandelion_greens": {
    protein: 2.7,
    fat: 0.7,
    calcium: 187,
    phosphorus: 66,
    vitaminA: 10161,
    vitaminC: 35.0,
    kcal: 45,
    source: "USDA FDC ID: 170416",
    speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: { dog: 0.15, cat: 0.10, bird: 0.20, reptile: 0.30, 'pocket-pet': 0.25 }
  },
  "swiss_chard": {
    protein: 1.8,
    fat: 0.2,
    calcium: 51,
    phosphorus: 46,
    vitaminA: 4431,
    vitaminC: 30.0,
    kcal: 19,
    source: "USDA FDC ID: 169500",
    speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: { dog: 0.15, cat: 0.10, bird: 0.20, reptile: 0.25, 'pocket-pet': 0.20 }
  },
  "butternut_squash": {
    protein: 1.0,
    fat: 0.1,
    calcium: 40,
    phosphorus: 33,
    vitaminA: 9040,
    vitaminC: 15.0,
    kcal: 45,
    source: "USDA FDC ID: 168485",
    speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: { dog: 0.15, cat: 0.10, bird: 0.15, reptile: 0.25, 'pocket-pet': 0.20 }
  },
  "acorn_squash": {
    protein: 1.1,
    fat: 0.1,
    calcium: 45,
    phosphorus: 44,
    vitaminA: 961,
    vitaminC: 11.0,
    kcal: 56,
    source: "USDA FDC ID: 169486",
    speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: { dog: 0.15, cat: 0.10, bird: 0.15, reptile: 0.25, 'pocket-pet': 0.20 }
  },
  "zucchini": {
    protein: 1.2,
    fat: 0.4,
    calcium: 19,
    phosphorus: 38,
    vitaminA: 393,
    vitaminC: 20.0,
    kcal: 21,
    source: "USDA FDC ID: 169291",
    speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: { dog: 0.15, cat: 0.10, bird: 0.15, reptile: 0.20, 'pocket-pet': 0.15 }
  },
  "asparagus": {
    protein: 2.2,
    fat: 0.1,
    calcium: 24,
    phosphorus: 52,
    vitaminA: 756,
    vitaminC: 5.6,
    kcal: 20,
    source: "USDA FDC ID: 169174",
    speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.20, 'pocket-pet': 0.15 }
  },
  "cauliflower": {
    protein: 1.9,
    fat: 0.4,
    calcium: 22,
    phosphorus: 44,
    vitaminA: 0,
    vitaminC: 46.4,
    kcal: 25,
    source: "USDA FDC ID: 169987",
    speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.20, 'pocket-pet': 0.15 }
  },
  "bell_pepper": {
    protein: 0.9,
    fat: 0.3,
    calcium: 10,
    phosphorus: 24,
    vitaminA: 3131,
    vitaminC: 80.4,
    kcal: 31,
    source: "USDA FDC ID: 169686",
    speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.20, 'pocket-pet': 0.15 }
  },
  "cucumber": {
    protein: 0.7,
    fat: 0.2,
    calcium: 16,
    phosphorus: 24,
    vitaminA: 105,
    vitaminC: 2.8,
    kcal: 16,
    source: "USDA FDC ID: 170591",
    speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.10, reptile: 0.15, 'pocket-pet': 0.10 }
  },
  "lettuce_romaine": {
    protein: 1.2,
    fat: 0.3,
    calcium: 33,
    phosphorus: 30,
    vitaminA: 7371,
    vitaminC: 3.6,
    kcal: 15,
    source: "USDA FDC ID: 170432",
    speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.20, 'pocket-pet': 0.15 }
  },
  "arugula": {
    protein: 2.6,
    fat: 0.7,
    calcium: 160,
    phosphorus: 44,
    vitaminA: 2373,
    vitaminC: 15.0,
    kcal: 25,
    source: "USDA FDC ID: 169975",
    speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.20, 'pocket-pet': 0.15 }
  },

  // Additional Carbs
  "lentils": {
    protein: 9.0,
    fat: 0.4,
    calcium: 38,
    phosphorus: 281,
    kcal: 116,
    source: "USDA FDC ID: 170567",
    speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'limit', 'pocket-pet': 'ok' },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: { dog: 0.20, cat: 0.05, bird: 0.15, reptile: 0.10, 'pocket-pet': 0.15 }
  },
  "chickpeas": {
    protein: 8.9,
    fat: 2.6,
    calcium: 49,
    phosphorus: 168,
    kcal: 119,
    source: "USDA FDC ID: 170562",
    speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'limit', 'pocket-pet': 'ok' },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: { dog: 0.20, cat: 0.05, bird: 0.15, reptile: 0.10, 'pocket-pet': 0.15 }
  },
  "black_beans": {
    protein: 8.9,
    fat: 0.5,
    calcium: 83,
    phosphorus: 140,
    kcal: 132,
    source: "USDA FDC ID: 170561",
    speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'limit', 'pocket-pet': 'ok' },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: { dog: 0.20, cat: 0.05, bird: 0.15, reptile: 0.10, 'pocket-pet': 0.15 }
  },
  "green_peas": {
    protein: 5.4,
    fat: 0.4,
    calcium: 25,
    phosphorus: 108,
    kcal: 81,
    source: "USDA FDC ID: 170572",
    speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'limit', 'pocket-pet': 'ok' },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: { dog: 0.15, cat: 0.05, bird: 0.15, reptile: 0.10, 'pocket-pet': 0.15 }
  },
  "barley": {
    protein: 3.6,
    fat: 0.7,
    calcium: 33,
    phosphorus: 264,
    kcal: 354,
    source: "USDA FDC ID: 170284",
    speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'limit', 'pocket-pet': 'ok' },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: { dog: 0.25, cat: 0.05, bird: 0.20, reptile: 0.10, 'pocket-pet': 0.15 }
  },
  "millet": {
    protein: 3.7,
    fat: 1.3,
    calcium: 8,
    phosphorus: 285,
    kcal: 378,
    source: "USDA FDC ID: 170591",
    speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'limit', 'pocket-pet': 'ok' },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: { dog: 0.20, cat: 0.05, bird: 0.25, reptile: 0.10, 'pocket-pet': 0.15 }
  },
  "wild_rice": {
    protein: 3.3,
    fat: 0.3,
    calcium: 5,
    phosphorus: 243,
    kcal: 101,
    source: "USDA FDC ID: 20044",
    speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'limit', 'pocket-pet': 'ok' },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: { dog: 0.25, cat: 0.05, bird: 0.20, reptile: 0.10, 'pocket-pet': 0.15 }
  },

  // Additional Fruits
  "apple": {
    protein: 0.3,
    fat: 0.2,
    calcium: 6,
    phosphorus: 11,
    vitaminA: 54,
    vitaminC: 4.6,
    kcal: 52,
    source: "USDA FDC ID: 168097",
    speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' },
    feedingRole: 'treat',
    maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.15, 'pocket-pet': 0.10 }
  },
  "strawberry": {
    protein: 0.8,
    fat: 0.3,
    calcium: 16,
    phosphorus: 24,
    vitaminA: 12,
    vitaminC: 58.8,
    kcal: 32,
    source: "USDA FDC ID: 168156",
    speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' },
    feedingRole: 'treat',
    maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.15, 'pocket-pet': 0.10 }
  },
  "mango": {
    protein: 0.8,
    fat: 0.3,
    calcium: 11,
    phosphorus: 14,
    vitaminA: 3894,
    vitaminC: 36.4,
    kcal: 60,
    source: "USDA FDC ID: 168329",
    speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' },
    feedingRole: 'treat',
    maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.15, 'pocket-pet': 0.10 }
  },
  "papaya": {
    protein: 0.6,
    fat: 0.1,
    calcium: 20,
    phosphorus: 10,
    vitaminA: 950,
    vitaminC: 60.9,
    kcal: 43,
    source: "USDA FDC ID: 168355",
    speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' },
    feedingRole: 'treat',
    maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.15, 'pocket-pet': 0.10 }
  },
  "melon": {
    protein: 0.8,
    fat: 0.2,
    calcium: 9,
    phosphorus: 11,
    vitaminA: 3382,
    vitaminC: 36.7,
    kcal: 34,
    source: "USDA FDC ID: 168168",
    speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' },
    feedingRole: 'treat',
    maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.15, 'pocket-pet': 0.10 }
  },
  "pear": {
    protein: 0.4,
    fat: 0.1,
    calcium: 9,
    phosphorus: 11,
    vitaminA: 24,
    vitaminC: 4.3,
    kcal: 57,
    source: "USDA FDC ID: 168348",
    speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' },
    feedingRole: 'treat',
    maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.15, 'pocket-pet': 0.10 }
  },
  "peach": {
    protein: 0.9,
    fat: 0.3,
    calcium: 6,
    phosphorus: 20,
    vitaminA: 326,
    vitaminC: 6.6,
    kcal: 39,
    source: "USDA FDC ID: 168346",
    speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' },
    feedingRole: 'treat',
    maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.15, 'pocket-pet': 0.10 }
  },
  "raspberry": {
    protein: 1.2,
    fat: 0.7,
    calcium: 25,
    phosphorus: 29,
    vitaminA: 12,
    vitaminC: 26.2,
    kcal: 52,
    source: "USDA FDC ID: 168151",
    speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' },
    feedingRole: 'treat',
    maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.15, 'pocket-pet': 0.10 }
  },
  "watermelon": {
    protein: 0.6,
    fat: 0.2,
    calcium: 7,
    phosphorus: 11,
    vitaminA: 303,
    vitaminC: 8.1,
    kcal: 30,
    source: "USDA FDC ID: 168175",
    speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' },
    feedingRole: 'treat',
    maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.15, 'pocket-pet': 0.10 }
  },

  // Additional Fats/Oils
  "coconut_oil": {
    protein: 0,
    fat: 100,
    kcal: 892,
    source: "Supplement standard",
    speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'avoid' },
    feedingRole: 'supplement',
    maxInclusionPercentBySpecies: { dog: 0.05, cat: 0.05, bird: 0.02, reptile: 0.02, 'pocket-pet': 0 }
  },
  "olive_oil": {
    protein: 0,
    fat: 100,
    kcal: 884,
    source: "Supplement standard",
    speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'avoid' },
    feedingRole: 'supplement',
    maxInclusionPercentBySpecies: { dog: 0.05, cat: 0.05, bird: 0.02, reptile: 0.02, 'pocket-pet': 0 }
  },
  "flaxseed_ground": {
    protein: 18.3,
    fat: 42.2,
    omega3: 22.8,
    calcium: 255,
    phosphorus: 642,
    kcal: 534,
    source: "USDA FDC ID: 170554",
    speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'ok' },
    feedingRole: 'supplement',
    maxInclusionPercentBySpecies: { dog: 0.05, cat: 0.05, bird: 0.02, reptile: 0.02, 'pocket-pet': 0.05 }
  },
  "hemp_seeds": {
    protein: 10.3,
    fat: 48.3,
    omega3: 8.7,
    calcium: 70,
    phosphorus: 1160,
    kcal: 553,
    source: "USDA FDC ID: 170557",
    speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'ok' },
    feedingRole: 'supplement',
    maxInclusionPercentBySpecies: { dog: 0.05, cat: 0.05, bird: 0.02, reptile: 0.02, 'pocket-pet': 0.05 }
  },

  // Insects for Reptiles
  "crickets": {
    protein: 12.9,
    fat: 5.5,
    calcium: 75,
    phosphorus: 185,
    kcal: 121,
    source: "USDA estimate",
    speciesCompatibility: { dog: 'avoid', cat: 'avoid', bird: 'limit', reptile: 'ok', 'pocket-pet': 'avoid' },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: { dog: 0, cat: 0, bird: 0.10, reptile: 0.80, 'pocket-pet': 0 }
  },
  "mealworms": {
    protein: 20.1,
    fat: 5.5,
    calcium: 8,
    phosphorus: 205,
    kcal: 206,
    source: "USDA estimate",
    speciesCompatibility: { dog: 'avoid', cat: 'avoid', bird: 'limit', reptile: 'ok', 'pocket-pet': 'limit' },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: { dog: 0, cat: 0, bird: 0.10, reptile: 0.60, 'pocket-pet': 0.10 }
  },
  "dubia_roaches": {
    protein: 18.0,
    fat: 8.0,
    calcium: 80,
    phosphorus: 150,
    kcal: 180,
    source: "USDA estimate",
    speciesCompatibility: { dog: 'avoid', cat: 'avoid', bird: 'limit', reptile: 'ok', 'pocket-pet': 'avoid' },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: { dog: 0, cat: 0, bird: 0.10, reptile: 0.80, 'pocket-pet': 0 }
  },
  "locusts": {
    protein: 14.0,
    fat: 6.0,
    calcium: 90,
    phosphorus: 170,
    kcal: 140,
    source: "USDA estimate",
    speciesCompatibility: { dog: 'avoid', cat: 'avoid', bird: 'limit', reptile: 'ok', 'pocket-pet': 'avoid' },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: { dog: 0, cat: 0, bird: 0.10, reptile: 0.80, 'pocket-pet': 0 }
  },

  // Hay for Pocket Pets
  "timothy_hay": {
    protein: 7.0,
    fat: 2.0,
    calcium: 3500,
    phosphorus: 2200,
    fiber: 35.0,
    kcal: 245,
    source: "USDA estimate",
    speciesCompatibility: { dog: 'avoid', cat: 'avoid', bird: 'limit', reptile: 'avoid', 'pocket-pet': 'ok' },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: { dog: 0, cat: 0, bird: 0.10, reptile: 0, 'pocket-pet': 0.80 }
  },
  "alfalfa_hay": {
    protein: 15.0,
    fat: 2.5,
    calcium: 13000,
    phosphorus: 2200,
    fiber: 32.0,
    kcal: 213,
    source: "USDA estimate",
    speciesCompatibility: { dog: 'avoid', cat: 'avoid', bird: 'limit', reptile: 'avoid', 'pocket-pet': 'ok' },
    feedingRole: 'staple',
    maxInclusionPercentBySpecies: { dog: 0, cat: 0, bird: 0.10, reptile: 0, 'pocket-pet': 0.50 }
  },

  // Additional Proteins
  "ground_pork_lean": { protein: 27.0, fat: 9.0, calcium: 10, phosphorus: 190, kcal: 242, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'avoid' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.40, cat: 0.30, bird: 0.10, reptile: 0.15, 'pocket-pet': 0 } },
  "turkey_giblets": { protein: 16.0, fat: 8.0, calcium: 12, phosphorus: 200, kcal: 160, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'avoid' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.15, cat: 0.15, bird: 0.05, reptile: 0.10, 'pocket-pet': 0 } },
  "chicken_giblets": { protein: 15.0, fat: 7.0, calcium: 10, phosphorus: 180, kcal: 150, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'avoid' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.15, cat: 0.15, bird: 0.05, reptile: 0.10, 'pocket-pet': 0 } },
  "ground_duck": { protein: 22.0, fat: 11.0, calcium: 12, phosphorus: 200, kcal: 210, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'avoid' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.40, cat: 0.30, bird: 0.10, reptile: 0.15, 'pocket-pet': 0 } },
  "turkey_thighs": { protein: 19.0, fat: 11.0, calcium: 12, phosphorus: 170, kcal: 190, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'avoid' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.50, cat: 0.40, bird: 0.10, reptile: 0.20, 'pocket-pet': 0 } },
  "chicken_necks": { protein: 14.0, fat: 8.0, calcium: 100, phosphorus: 150, kcal: 140, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'avoid' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.15, cat: 0.15, bird: 0.05, reptile: 0.10, 'pocket-pet': 0 } },
  "turkey_necks": { protein: 15.0, fat: 9.0, calcium: 120, phosphorus: 160, kcal: 160, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'avoid' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.15, cat: 0.15, bird: 0.05, reptile: 0.10, 'pocket-pet': 0 } },
  "ground_venison": { protein: 26.0, fat: 3.0, calcium: 10, phosphorus: 200, kcal: 155, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'avoid' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.50, cat: 0.40, bird: 0.10, reptile: 0.20, 'pocket-pet': 0 } },
  "ground_rabbit": { protein: 21.0, fat: 8.0, calcium: 18, phosphorus: 180, kcal: 170, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'avoid' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.40, cat: 0.40, bird: 0.10, reptile: 0.15, 'pocket-pet': 0 } },
  "duck_liver": { protein: 18.0, fat: 8.0, calcium: 10, phosphorus: 300, kcal: 150, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'avoid' }, feedingRole: 'supplement', maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.10, bird: 0.05, reptile: 0.10, 'pocket-pet': 0 } },
  "quail_eggs": { protein: 13.0, fat: 11.0, calcium: 76, phosphorus: 226, kcal: 158, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.10, bird: 0.10, reptile: 0.10, 'pocket-pet': 0.05 } },
  "ground_quail": { protein: 25.0, fat: 11.0, calcium: 14, phosphorus: 220, kcal: 226, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'ok', 'pocket-pet': 'avoid' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.30, cat: 0.30, bird: 0.10, reptile: 0.30, 'pocket-pet': 0 } },
  "tuna": { protein: 25.5, fat: 1.0, calcium: 11, phosphorus: 208, kcal: 86, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'avoid' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.30, cat: 0.40, bird: 0.10, reptile: 0.15, 'pocket-pet': 0 } },
  "ground_mackerel": { protein: 20.0, fat: 13.0, omega3: 2.0, calcium: 280, phosphorus: 240, kcal: 200, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'avoid' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.30, cat: 0.40, bird: 0.10, reptile: 0.15, 'pocket-pet': 0 } },
  "ground_herring": { protein: 18.0, fat: 12.0, omega3: 1.8, calcium: 260, phosphorus: 220, kcal: 190, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'avoid' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.30, cat: 0.40, bird: 0.10, reptile: 0.15, 'pocket-pet': 0 } },
  "turkey_hearts": { protein: 16.0, fat: 9.0, calcium: 8, phosphorus: 190, kcal: 155, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'avoid' }, feedingRole: 'supplement', maxInclusionPercentBySpecies: { dog: 0.15, cat: 0.15, bird: 0.05, reptile: 0.10, 'pocket-pet': 0 } },
  "quail_meat": { protein: 25.0, fat: 11.0, calcium: 14, phosphorus: 220, kcal: 226, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'ok', 'pocket-pet': 'avoid' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.30, cat: 0.30, bird: 0.10, reptile: 0.30, 'pocket-pet': 0 } },
  "salmon_boneless": { protein: 20.4, fat: 13.4, omega3: 2.26, calcium: 12, phosphorus: 200, kcal: 208, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'avoid' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.40, cat: 0.50, bird: 0.10, reptile: 0.15, 'pocket-pet': 0 } },

  // Vegetables
  "brussels_sprouts": { protein: 3.4, fat: 0.4, calcium: 42, phosphorus: 66, vitaminC: 85.0, kcal: 43, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.20, 'pocket-pet': 0.15 } },
  "parsley": { protein: 3.0, fat: 0.8, calcium: 138, phosphorus: 58, vitaminA: 8424, vitaminC: 133.0, kcal: 36, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.05, cat: 0.02, bird: 0.10, reptile: 0.15, 'pocket-pet': 0.10 } },
  "endive": { protein: 1.3, fat: 0.2, calcium: 36, phosphorus: 28, vitaminA: 1080, vitaminC: 6.5, kcal: 17, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.20, 'pocket-pet': 0.15 } },
  "escarole": { protein: 1.3, fat: 0.2, calcium: 52, phosphorus: 28, vitaminA: 3360, vitaminC: 6.5, kcal: 15, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.20, 'pocket-pet': 0.15 } },
  "beet_greens": { protein: 2.2, fat: 0.2, calcium: 117, phosphorus: 40, vitaminA: 6320, vitaminC: 30.0, kcal: 23, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.20, 'pocket-pet': 0.15 } },
  "radish_greens": { protein: 2.4, fat: 0.2, calcium: 224, phosphorus: 61, vitaminA: 2560, vitaminC: 24.0, kcal: 32, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.20, 'pocket-pet': 0.15 } },
  "napa_cabbage": { protein: 1.2, fat: 0.1, calcium: 23, phosphorus: 29, vitaminA: 68, vitaminC: 27.0, kcal: 13, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.20, 'pocket-pet': 0.15 } },
  "red_cabbage": { protein: 1.4, fat: 0.2, calcium: 42, phosphorus: 30, vitaminA: 20, vitaminC: 57.0, kcal: 31, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.20, 'pocket-pet': 0.15 } },
  "green_cabbage": { protein: 1.3, fat: 0.1, calcium: 40, phosphorus: 26, vitaminA: 3, vitaminC: 36.6, kcal: 25, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.20, 'pocket-pet': 0.15 } },
  "romanesco_broccoli": { protein: 3.7, fat: 0.4, calcium: 54, phosphorus: 66, vitaminC: 110.0, kcal: 34, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.20, 'pocket-pet': 0.15 } },
  "snow_peas": { protein: 3.4, fat: 0.2, calcium: 43, phosphorus: 48, vitaminC: 60.0, kcal: 42, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.20, 'pocket-pet': 0.15 } },
  "sugar_snap_peas": { protein: 2.8, fat: 0.2, calcium: 42, phosphorus: 48, vitaminC: 60.0, kcal: 42, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.20, 'pocket-pet': 0.15 } },
  "fennel": { protein: 1.2, fat: 0.2, calcium: 49, phosphorus: 50, vitaminC: 12.0, kcal: 31, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.20, 'pocket-pet': 0.15 } },
  "leeks": { protein: 1.5, fat: 0.3, calcium: 59, phosphorus: 35, vitaminA: 1000, vitaminC: 12.0, kcal: 31, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.05, cat: 0.02, bird: 0.10, reptile: 0.15, 'pocket-pet': 0.10 } },
  "shallots": { protein: 1.7, fat: 0.1, calcium: 37, phosphorus: 60, vitaminC: 8.0, kcal: 72, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.05, cat: 0.02, bird: 0.10, reptile: 0.15, 'pocket-pet': 0.10 } },
  "artichokes": { protein: 3.3, fat: 0.2, calcium: 53, phosphorus: 90, vitaminC: 11.7, kcal: 47, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.20, 'pocket-pet': 0.15 } },
  "eggplant": { protein: 1.1, fat: 0.2, calcium: 9, phosphorus: 25, vitaminC: 3.5, kcal: 25, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.20, 'pocket-pet': 0.15 } },
  "tomatoes": { protein: 0.9, fat: 0.2, calcium: 12, phosphorus: 24, vitaminA: 833, vitaminC: 13.7, kcal: 18, source: "USDA estimate", speciesCompatibility: { dog: 'limit', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.05, cat: 0.02, bird: 0.10, reptile: 0.15, 'pocket-pet': 0.10 } },
  "yellow_squash": { protein: 1.2, fat: 0.4, calcium: 19, phosphorus: 38, vitaminA: 393, vitaminC: 20.0, kcal: 21, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.15, cat: 0.10, bird: 0.15, reptile: 0.20, 'pocket-pet': 0.15 } },
  "pattypan_squash": { protein: 1.1, fat: 0.3, calcium: 18, phosphorus: 35, vitaminA: 300, vitaminC: 18.0, kcal: 19, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.15, cat: 0.10, bird: 0.15, reptile: 0.20, 'pocket-pet': 0.15 } },
  "radicchio": { protein: 1.2, fat: 0.1, calcium: 36, phosphorus: 40, vitaminA: 100, vitaminC: 8.0, kcal: 23, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.20, 'pocket-pet': 0.15 } },
  "frisee": { protein: 1.2, fat: 0.3, calcium: 100, phosphorus: 40, vitaminA: 3360, vitaminC: 8.0, kcal: 15, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.20, 'pocket-pet': 0.15 } },
  "mache": { protein: 2.3, fat: 0.4, calcium: 38, phosphorus: 34, vitaminA: 4700, vitaminC: 8.0, kcal: 17, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.20, 'pocket-pet': 0.15 } },
  "watercress": { protein: 2.3, fat: 0.1, calcium: 120, phosphorus: 60, vitaminA: 4740, vitaminC: 43.0, kcal: 11, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.20, 'pocket-pet': 0.15 } },
  "purslane": { protein: 1.9, fat: 0.4, calcium: 65, phosphorus: 44, vitaminA: 2000, vitaminC: 21.0, kcal: 20, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.20, 'pocket-pet': 0.15 } },
  "cat_grass": { protein: 2.0, fat: 0.4, calcium: 50, phosphorus: 40, vitaminA: 1000, vitaminC: 10.0, kcal: 25, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.05, cat: 0.10, bird: 0.10, reptile: 0.15, 'pocket-pet': 0.10 } },
  "barley_grass": { protein: 2.0, fat: 0.4, calcium: 50, phosphorus: 40, vitaminA: 1000, vitaminC: 10.0, kcal: 25, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.05, cat: 0.10, bird: 0.10, reptile: 0.15, 'pocket-pet': 0.10 } },
  "alfalfa_sprouts": { protein: 2.1, fat: 0.2, calcium: 32, phosphorus: 70, vitaminA: 60, vitaminC: 8.4, kcal: 23, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.20, 'pocket-pet': 0.15 } },

  // Carbs
  "regular_potato": { protein: 2.0, fat: 0.1, calcium: 12, phosphorus: 57, kcal: 77, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'limit', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.15, cat: 0.05, bird: 0.15, reptile: 0.10, 'pocket-pet': 0.15 } },
  "amaranth": { protein: 9.3, fat: 5.3, calcium: 159, phosphorus: 557, kcal: 371, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'limit', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.15, cat: 0.05, bird: 0.15, reptile: 0.10, 'pocket-pet': 0.15 } },
  "buckwheat": { protein: 3.4, fat: 1.0, calcium: 18, phosphorus: 282, kcal: 343, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'limit', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.15, cat: 0.05, bird: 0.15, reptile: 0.10, 'pocket-pet': 0.15 } },
  "sorghum": { protein: 3.3, fat: 3.3, calcium: 28, phosphorus: 287, kcal: 329, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'limit', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.15, cat: 0.05, bird: 0.15, reptile: 0.10, 'pocket-pet': 0.15 } },
  "farro": { protein: 3.6, fat: 0.7, calcium: 21, phosphorus: 317, kcal: 335, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'limit', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.15, cat: 0.05, bird: 0.15, reptile: 0.10, 'pocket-pet': 0.15 } },
  "bulgur": { protein: 3.3, fat: 0.4, calcium: 24, phosphorus: 260, kcal: 342, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'limit', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.15, cat: 0.05, bird: 0.15, reptile: 0.10, 'pocket-pet': 0.15 } },
  "split_peas": { protein: 8.0, fat: 0.4, calcium: 27, phosphorus: 200, kcal: 118, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'limit', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.15, cat: 0.05, bird: 0.15, reptile: 0.10, 'pocket-pet': 0.15 } },
  "kidney_beans": { protein: 8.7, fat: 0.5, calcium: 35, phosphorus: 140, kcal: 127, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'limit', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.15, cat: 0.05, bird: 0.15, reptile: 0.10, 'pocket-pet': 0.15 } },
  "pinto_beans": { protein: 8.4, fat: 0.4, calcium: 44, phosphorus: 140, kcal: 122, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'limit', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.15, cat: 0.05, bird: 0.15, reptile: 0.10, 'pocket-pet': 0.15 } },
  "navy_beans": { protein: 8.1, fat: 0.4, calcium: 60, phosphorus: 140, kcal: 127, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'limit', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.15, cat: 0.05, bird: 0.15, reptile: 0.10, 'pocket-pet': 0.15 } },
  "spaghetti_squash": { protein: 0.8, fat: 0.4, calcium: 16, phosphorus: 20, kcal: 31, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.15, cat: 0.10, bird: 0.15, reptile: 0.25, 'pocket-pet': 0.20 } },
  "delicata_squash": { protein: 1.1, fat: 0.1, calcium: 20, phosphorus: 30, kcal: 35, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.15, cat: 0.10, bird: 0.15, reptile: 0.25, 'pocket-pet': 0.20 } },
  "kabocha_squash": { protein: 1.1, fat: 0.1, calcium: 21, phosphorus: 33, kcal: 34, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.15, cat: 0.10, bird: 0.15, reptile: 0.25, 'pocket-pet': 0.20 } },

  // Fruits
  "pineapple": { protein: 0.5, fat: 0.1, calcium: 13, phosphorus: 8, vitaminA: 35, vitaminC: 47.8, kcal: 50, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'treat', maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.15, 'pocket-pet': 0.10 } },
  "kiwi": { protein: 1.1, fat: 0.5, calcium: 34, phosphorus: 34, vitaminA: 87, vitaminC: 92.7, kcal: 61, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'treat', maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.15, 'pocket-pet': 0.10 } },
  "blackberry": { protein: 1.4, fat: 0.5, calcium: 29, phosphorus: 22, vitaminA: 12, vitaminC: 21.0, kcal: 43, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'treat', maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.15, 'pocket-pet': 0.10 } },
  "cranberry": { protein: 0.4, fat: 0.1, calcium: 8, phosphorus: 13, vitaminA: 60, vitaminC: 13.3, kcal: 46, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'treat', maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.15, 'pocket-pet': 0.10 } },
  "cherry": { protein: 1.1, fat: 0.3, calcium: 13, phosphorus: 21, vitaminA: 64, vitaminC: 7.0, kcal: 63, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'treat', maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.15, 'pocket-pet': 0.10 } },
  "plum": { protein: 0.7, fat: 0.3, calcium: 6, phosphorus: 16, vitaminA: 345, vitaminC: 9.5, kcal: 46, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'treat', maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.15, 'pocket-pet': 0.10 } },
  "apricot": { protein: 1.4, fat: 0.4, calcium: 13, phosphorus: 23, vitaminA: 1926, vitaminC: 3.6, kcal: 48, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'treat', maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.15, 'pocket-pet': 0.10 } },
  "fig": { protein: 0.8, fat: 0.3, calcium: 35, phosphorus: 14, vitaminA: 7, vitaminC: 1.2, kcal: 74, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'treat', maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.15, 'pocket-pet': 0.10 } },
  "date": { protein: 1.7, fat: 0.2, calcium: 66, phosphorus: 62, vitaminA: 15, vitaminC: 0.0, kcal: 282, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'treat', maxInclusionPercentBySpecies: { dog: 0.05, cat: 0.02, bird: 0.10, reptile: 0.10, 'pocket-pet': 0.05 } },
  "raisin": { protein: 3.1, fat: 0.5, calcium: 50, phosphorus: 101, vitaminA: 0, vitaminC: 2.3, kcal: 299, source: "USDA estimate", speciesCompatibility: { dog: 'avoid', cat: 'avoid', bird: 'ok', reptile: 'ok', 'pocket-pet': 'avoid' }, feedingRole: 'treat', maxInclusionPercentBySpecies: { dog: 0, cat: 0, bird: 0.10, reptile: 0.10, 'pocket-pet': 0 } },
  "currant": { protein: 1.4, fat: 0.3, calcium: 62, phosphorus: 38, vitaminA: 0, vitaminC: 181.0, kcal: 71, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'treat', maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.15, 'pocket-pet': 0.10 } },
  "goji_berry": { protein: 14.3, fat: 1.5, calcium: 112, phosphorus: 100, vitaminA: 26822, vitaminC: 48.4, kcal: 349, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'treat', maxInclusionPercentBySpecies: { dog: 0.05, cat: 0.02, bird: 0.10, reptile: 0.10, 'pocket-pet': 0.05 } },
  "mulberry": { protein: 1.4, fat: 0.4, calcium: 39, phosphorus: 38, vitaminA: 25, vitaminC: 36.4, kcal: 43, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'treat', maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.15, 'pocket-pet': 0.10 } },
  "cantaloupe": { protein: 0.8, fat: 0.2, calcium: 9, phosphorus: 12, vitaminA: 3382, vitaminC: 36.7, kcal: 34, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'treat', maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.15, 'pocket-pet': 0.10 } },
  "honeydew": { protein: 0.8, fat: 0.1, calcium: 6, phosphorus: 11, vitaminA: 0, vitaminC: 36.7, kcal: 36, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'treat', maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.15, 'pocket-pet': 0.10 } },
  "grape": { protein: 0.7, fat: 0.2, calcium: 10, phosphorus: 20, vitaminA: 66, vitaminC: 3.2, kcal: 67, source: "USDA estimate", speciesCompatibility: { dog: 'avoid', cat: 'avoid', bird: 'ok', reptile: 'ok', 'pocket-pet': 'avoid' }, feedingRole: 'treat', maxInclusionPercentBySpecies: { dog: 0, cat: 0, bird: 0.10, reptile: 0.10, 'pocket-pet': 0 } },
  "prune": { protein: 2.2, fat: 0.4, calcium: 43, phosphorus: 69, vitaminA: 781, vitaminC: 0.6, kcal: 240, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'treat', maxInclusionPercentBySpecies: { dog: 0.05, cat: 0.02, bird: 0.10, reptile: 0.10, 'pocket-pet': 0.05 } },
  "elderberry": { protein: 0.7, fat: 0.5, calcium: 38, phosphorus: 56, vitaminA: 600, vitaminC: 36.0, kcal: 73, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'treat', maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.15, reptile: 0.15, 'pocket-pet': 0.10 } },

  // Seeds & Nuts
  "sunflower_seeds": { protein: 20.0, fat: 51.5, calcium: 78, phosphorus: 660, kcal: 584, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'ok', reptile: 'limit', 'pocket-pet': 'ok' }, feedingRole: 'supplement', maxInclusionPercentBySpecies: { dog: 0.05, cat: 0.05, bird: 0.15, reptile: 0.05, 'pocket-pet': 0.10 } },
  "pumpkin_seeds": { protein: 19.0, fat: 49.0, calcium: 55, phosphorus: 1144, kcal: 541, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'ok', reptile: 'limit', 'pocket-pet': 'ok' }, feedingRole: 'supplement', maxInclusionPercentBySpecies: { dog: 0.05, cat: 0.05, bird: 0.15, reptile: 0.05, 'pocket-pet': 0.10 } },
  "sesame_seeds": { protein: 17.7, fat: 50.0, calcium: 975, phosphorus: 629, kcal: 565, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'ok', reptile: 'limit', 'pocket-pet': 'ok' }, feedingRole: 'supplement', maxInclusionPercentBySpecies: { dog: 0.05, cat: 0.05, bird: 0.15, reptile: 0.05, 'pocket-pet': 0.10 } },
  "chia_seeds": { protein: 16.5, fat: 30.7, omega3: 17.8, calcium: 631, phosphorus: 860, kcal: 486, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'ok', reptile: 'limit', 'pocket-pet': 'ok' }, feedingRole: 'supplement', maxInclusionPercentBySpecies: { dog: 0.05, cat: 0.05, bird: 0.15, reptile: 0.05, 'pocket-pet': 0.10 } },
  "walnut": { protein: 8.7, fat: 65.2, omega3: 9.1, calcium: 98, phosphorus: 346, kcal: 654, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'ok' }, feedingRole: 'supplement', maxInclusionPercentBySpecies: { dog: 0.05, cat: 0.05, bird: 0.05, reptile: 0.02, 'pocket-pet': 0.05 } },
  "almond": { protein: 21.2, fat: 49.9, calcium: 264, phosphorus: 441, kcal: 579, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'ok' }, feedingRole: 'supplement', maxInclusionPercentBySpecies: { dog: 0.05, cat: 0.05, bird: 0.05, reptile: 0.02, 'pocket-pet': 0.05 } },
  "brazil_nut": { protein: 14.3, fat: 66.4, calcium: 160, phosphorus: 725, kcal: 656, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'ok' }, feedingRole: 'supplement', maxInclusionPercentBySpecies: { dog: 0.05, cat: 0.05, bird: 0.05, reptile: 0.02, 'pocket-pet': 0.05 } },
  "pecan": { protein: 9.2, fat: 71.9, calcium: 70, phosphorus: 277, kcal: 691, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'ok' }, feedingRole: 'supplement', maxInclusionPercentBySpecies: { dog: 0.05, cat: 0.05, bird: 0.05, reptile: 0.02, 'pocket-pet': 0.05 } },
  "macadamia_nut": { protein: 7.9, fat: 75.8, calcium: 85, phosphorus: 188, kcal: 718, source: "USDA estimate", speciesCompatibility: { dog: 'avoid', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'ok' }, feedingRole: 'supplement', maxInclusionPercentBySpecies: { dog: 0, cat: 0.05, bird: 0.05, reptile: 0.02, 'pocket-pet': 0.05 } },
  "hazelnut": { protein: 14.0, fat: 60.8, calcium: 114, phosphorus: 290, kcal: 628, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'ok' }, feedingRole: 'supplement', maxInclusionPercentBySpecies: { dog: 0.05, cat: 0.05, bird: 0.05, reptile: 0.02, 'pocket-pet': 0.05 } },
  "pine_nut": { protein: 13.7, fat: 68.4, calcium: 16, phosphorus: 575, kcal: 673, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'ok' }, feedingRole: 'supplement', maxInclusionPercentBySpecies: { dog: 0.05, cat: 0.05, bird: 0.05, reptile: 0.02, 'pocket-pet': 0.05 } },
  "cashew": { protein: 18.2, fat: 43.9, calcium: 37, phosphorus: 593, kcal: 553, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'ok' }, feedingRole: 'supplement', maxInclusionPercentBySpecies: { dog: 0.05, cat: 0.05, bird: 0.05, reptile: 0.02, 'pocket-pet': 0.05 } },
  "pistachio": { protein: 20.3, fat: 45.4, calcium: 107, phosphorus: 490, kcal: 557, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'ok' }, feedingRole: 'supplement', maxInclusionPercentBySpecies: { dog: 0.05, cat: 0.05, bird: 0.05, reptile: 0.02, 'pocket-pet': 0.05 } },
  "peanut": { protein: 25.8, fat: 49.2, calcium: 92, phosphorus: 376, kcal: 567, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'ok' }, feedingRole: 'supplement', maxInclusionPercentBySpecies: { dog: 0.05, cat: 0.05, bird: 0.05, reptile: 0.02, 'pocket-pet': 0.05 } },
  "millet_seed": { protein: 3.7, fat: 1.3, calcium: 8, phosphorus: 285, kcal: 378, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'limit', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.20, cat: 0.05, bird: 0.25, reptile: 0.10, 'pocket-pet': 0.15 } },
  "canary_seed": { protein: 15.5, fat: 5.0, calcium: 42, phosphorus: 440, kcal: 360, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'limit', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.10, cat: 0.05, bird: 0.25, reptile: 0.10, 'pocket-pet': 0.10 } },
  "niger_seed": { protein: 19.3, fat: 68.0, calcium: 200, phosphorus: 600, kcal: 680, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'limit', 'pocket-pet': 'ok' }, feedingRole: 'supplement', maxInclusionPercentBySpecies: { dog: 0.05, cat: 0.02, bird: 0.15, reptile: 0.05, 'pocket-pet': 0.05 } },
  "oat_groats": { protein: 16.9, fat: 6.9, calcium: 54, phosphorus: 523, kcal: 379, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'limit', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.25, cat: 0.10, bird: 0.20, reptile: 0.15, 'pocket-pet': 0.20 } },
  "rapeseed": { protein: 20.3, fat: 42.2, calcium: 240, phosphorus: 700, kcal: 495, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'limit', 'pocket-pet': 'ok' }, feedingRole: 'supplement', maxInclusionPercentBySpecies: { dog: 0.05, cat: 0.02, bird: 0.10, reptile: 0.05, 'pocket-pet': 0.05 } },
  "safflower_seeds": { protein: 16.0, fat: 50.0, calcium: 111, phosphorus: 660, kcal: 541, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'ok', reptile: 'limit', 'pocket-pet': 'ok' }, feedingRole: 'supplement', maxInclusionPercentBySpecies: { dog: 0.05, cat: 0.05, bird: 0.15, reptile: 0.05, 'pocket-pet': 0.10 } },
  "nyjer_seeds": { protein: 19.3, fat: 68.0, calcium: 200, phosphorus: 600, kcal: 680, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'limit', 'pocket-pet': 'ok' }, feedingRole: 'supplement', maxInclusionPercentBySpecies: { dog: 0.05, cat: 0.02, bird: 0.15, reptile: 0.05, 'pocket-pet': 0.05 } },
  "poppy_seeds": { protein: 20.0, fat: 41.6, calcium: 1438, phosphorus: 870, kcal: 525, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'ok', reptile: 'limit', 'pocket-pet': 'ok' }, feedingRole: 'supplement', maxInclusionPercentBySpecies: { dog: 0.05, cat: 0.05, bird: 0.10, reptile: 0.05, 'pocket-pet': 0.05 } },
  "teff_seeds": { protein: 13.3, fat: 2.4, calcium: 180, phosphorus: 429, kcal: 367, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'limit', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.15, cat: 0.05, bird: 0.20, reptile: 0.10, 'pocket-pet': 0.15 } },
  "amaranth_seeds": { protein: 9.3, fat: 5.3, calcium: 159, phosphorus: 557, kcal: 371, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'limit', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.15, cat: 0.05, bird: 0.15, reptile: 0.10, 'pocket-pet': 0.15 } },
  "buckwheat_hulled": { protein: 3.4, fat: 1.0, calcium: 18, phosphorus: 282, kcal: 343, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'limit', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.15, cat: 0.05, bird: 0.15, reptile: 0.10, 'pocket-pet': 0.15 } },
  "barley_hulled": { protein: 3.6, fat: 0.7, calcium: 33, phosphorus: 264, kcal: 354, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'limit', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.25, cat: 0.05, bird: 0.20, reptile: 0.10, 'pocket-pet': 0.15 } },
  "wheat_hulled": { protein: 10.0, fat: 2.0, calcium: 30, phosphorus: 288, kcal: 340, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'limit', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.20, cat: 0.05, bird: 0.20, reptile: 0.10, 'pocket-pet': 0.15 } },
  "rice_hulled": { protein: 2.7, fat: 0.3, calcium: 3, phosphorus: 8, kcal: 130, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'limit', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.30, cat: 0.10, bird: 0.25, reptile: 0.15, 'pocket-pet': 0.20 } },
  "corn_cracked": { protein: 3.3, fat: 1.2, calcium: 2, phosphorus: 89, kcal: 86, source: "USDA estimate", speciesCompatibility: { dog: 'ok', cat: 'limit', bird: 'ok', reptile: 'limit', 'pocket-pet': 'ok' }, feedingRole: 'staple', maxInclusionPercentBySpecies: { dog: 0.20, cat: 0.05, bird: 0.20, reptile: 0.10, 'pocket-pet': 0.15 } },

  // Oils & Fats
  "avocado_oil": { protein: 0, fat: 100, kcal: 884, source: "Supplement standard", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'avoid' }, feedingRole: 'supplement', maxInclusionPercentBySpecies: { dog: 0.05, cat: 0.05, bird: 0.02, reptile: 0.02, 'pocket-pet': 0 } },
  "sunflower_oil": { protein: 0, fat: 100, kcal: 884, source: "Supplement standard", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'avoid' }, feedingRole: 'supplement', maxInclusionPercentBySpecies: { dog: 0.05, cat: 0.05, bird: 0.02, reptile: 0.02, 'pocket-pet': 0 } },
  "sesame_oil": { protein: 0, fat: 100, kcal: 884, source: "Supplement standard", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'avoid' }, feedingRole: 'supplement', maxInclusionPercentBySpecies: { dog: 0.05, cat: 0.05, bird: 0.02, reptile: 0.02, 'pocket-pet': 0 } },
  "pumpkin_seed_oil": { protein: 0, fat: 100, kcal: 884, source: "Supplement standard", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'avoid' }, feedingRole: 'supplement', maxInclusionPercentBySpecies: { dog: 0.05, cat: 0.05, bird: 0.02, reptile: 0.02, 'pocket-pet': 0 } },
  "walnut_oil": { protein: 0, fat: 100, omega3: 10.4, kcal: 884, source: "Supplement standard", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'avoid' }, feedingRole: 'supplement', maxInclusionPercentBySpecies: { dog: 0.05, cat: 0.05, bird: 0.02, reptile: 0.02, 'pocket-pet': 0 } },
  "almond_oil": { protein: 0, fat: 100, kcal: 884, source: "Supplement standard", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'avoid' }, feedingRole: 'supplement', maxInclusionPercentBySpecies: { dog: 0.05, cat: 0.05, bird: 0.02, reptile: 0.02, 'pocket-pet': 0 } },
  "cod_liver_oil": { protein: 0, fat: 100, omega3: 18.0, kcal: 902, source: "Supplement standard", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'avoid' }, feedingRole: 'supplement', maxInclusionPercentBySpecies: { dog: 0.05, cat: 0.05, bird: 0.02, reptile: 0.02, 'pocket-pet': 0 } },
  "herring_oil": { protein: 0, fat: 100, omega3: 20.0, kcal: 902, source: "Supplement standard", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'avoid' }, feedingRole: 'supplement', maxInclusionPercentBySpecies: { dog: 0.05, cat: 0.05, bird: 0.02, reptile: 0.02, 'pocket-pet': 0 } },
  "mackerel_oil": { protein: 0, fat: 100, omega3: 20.0, kcal: 902, source: "Supplement standard", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'avoid' }, feedingRole: 'supplement', maxInclusionPercentBySpecies: { dog: 0.05, cat: 0.05, bird: 0.02, reptile: 0.02, 'pocket-pet': 0 } },
  "sardine_oil": { protein: 0, fat: 100, omega3: 20.0, kcal: 902, source: "Supplement standard", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'avoid' }, feedingRole: 'supplement', maxInclusionPercentBySpecies: { dog: 0.05, cat: 0.05, bird: 0.02, reptile: 0.02, 'pocket-pet': 0 } },
  "anchovy_oil": { protein: 0, fat: 100, omega3: 20.0, kcal: 902, source: "Supplement standard", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'limit', 'pocket-pet': 'avoid' }, feedingRole: 'supplement', maxInclusionPercentBySpecies: { dog: 0.05, cat: 0.05, bird: 0.02, reptile: 0.02, 'pocket-pet': 0 } },
  // Calcium supplements (Phase 2 fix: enable Ca:P balancing)
  "eggshell_powder": { protein: 0, fat: 0, calcium: 3800, phosphorus: 20, kcal: 0, source: "Natural supplement", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'supplement', maxInclusionPercentBySpecies: { dog: 0.02, cat: 0.02, bird: 0.02, reptile: 0.02, 'pocket-pet': 0.02 }, confidenceBySpecies: { dog: 'high', cat: 'high', bird: 'high', reptile: 'high', 'pocket-pet': 'high' } },
  "bone_meal": { protein: 15, fat: 0, calcium: 3000, phosphorus: 1400, kcal: 60, source: "Natural supplement", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'limit', reptile: 'ok', 'pocket-pet': 'limit' }, feedingRole: 'supplement', maxInclusionPercentBySpecies: { dog: 0.03, cat: 0.02, bird: 0.01, reptile: 0.02, 'pocket-pet': 0.01 }, confidenceBySpecies: { dog: 'high', cat: 'high', bird: 'medium', reptile: 'high', 'pocket-pet': 'medium' } },
  "calcium_carbonate": { protein: 0, fat: 0, calcium: 4000, phosphorus: 0, kcal: 0, source: "Mineral supplement", speciesCompatibility: { dog: 'ok', cat: 'ok', bird: 'ok', reptile: 'ok', 'pocket-pet': 'ok' }, feedingRole: 'supplement', maxInclusionPercentBySpecies: { dog: 0.02, cat: 0.02, bird: 0.02, reptile: 0.02, 'pocket-pet': 0.02 }, confidenceBySpecies: { dog: 'high', cat: 'high', bird: 'high', reptile: 'high', 'pocket-pet': 'high' } }
};

/**
 * Get nutritional composition for an ingredient
 * @param ingredientName - The ingredient name (normalized)
 * @returns IngredientComposition or undefined if not found
 */

export function getIngredientComposition(ingredientName: string): IngredientComposition | undefined {
  // Normalize the name for lookup
  const normalized = ingredientName.toLowerCase().trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');

  return INGREDIENT_COMPOSITIONS[normalized];
}

/**
 * Calculate calcium to phosphorus ratio
 * @param calcium - calcium amount
 * @param phosphorus - phosphorus amount
 * @returns Ca:P ratio or undefined if phosphorus is 0
 */
export function calculateCaPRatio(calcium: number, phosphorus: number): number | undefined {
  return phosphorus > 0 ? calcium / phosphorus : undefined;
}