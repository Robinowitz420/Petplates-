// lib/data/ingredientCompositions.ts
// USDA nutrition data for common pet food ingredients
// All values per 100g raw edible portion unless otherwise noted

export type SpeciesCompatibility = 'ok' | 'avoid' | 'limit' | 'caution';
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type FeedingRole = 'staple' | 'treat' | 'supplement' | 'forage';

export interface IngredientComposition {
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
}

export const INGREDIENT_COMPOSITIONS: Record<string, IngredientComposition> = {
  // Poultry
  "chicken_breast": {
    protein: 31.0,
    fat: 3.6,
    calcium: 11,
    phosphorus: 196,
    moisture: 65,
    kcal: 165,
    source: "USDA FDC ID: 171116",
    speciesCompatibility: {
      dog: 'ok',
      cat: 'ok',
      bird: 'limit',
      reptile: 'limit',
      'pocket-pet': 'avoid'
    },
    feedingRole: 'staple',
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
    protein: 28.6,
    fat: 10.4,
    calcium: 14,
    phosphorus: 206,
    kcal: 189,
    source: "USDA FDC ID: 174036",
    speciesCompatibility: {
      dog: 'ok',
      cat: 'ok',
      bird: 'limit',
      reptile: 'limit',
      'pocket-pet': 'avoid'
    },
    feedingRole: 'staple',
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
    protein: 27.0,
    fat: 7.4,
    calcium: 11,
    phosphorus: 190,
    kcal: 172,
    source: "USDA FDC ID: 171116 (estimated from chicken breast)",
    speciesCompatibility: {
      dog: 'ok',
      cat: 'ok',
      bird: 'limit',
      reptile: 'limit',
      'pocket-pet': 'avoid'
    },
    feedingRole: 'staple',
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
    protein: 20.6,
    fat: 14.1,
    calcium: 9,
    phosphorus: 170,
    kcal: 209,
    source: "USDA FDC ID: 171450",
    speciesCompatibility: {
      dog: 'ok',
      cat: 'ok',
      bird: 'limit',
      reptile: 'limit',
      'pocket-pet': 'avoid'
    },
    feedingRole: 'staple',
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
    protein: 30.1,
    fat: 1.0,
    calcium: 6,
    phosphorus: 223,
    moisture: 70,
    kcal: 135,
    source: "USDA FDC ID: 171479",
    speciesCompatibility: {
      dog: 'ok',
      cat: 'ok',
      bird: 'limit',
      reptile: 'limit',
      'pocket-pet': 'avoid'
    },
    feedingRole: 'staple',
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
    feedingRole: 'staple',
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
    feedingRole: 'staple',
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
    protein: 20.4,
    fat: 13.4,
    omega3: 2.26,
    calcium: 12,
    phosphorus: 200,
    kcal: 208,
    source: "USDA FDC ID: 175168",
    speciesCompatibility: {
      dog: 'ok',
      cat: 'ok',
      bird: 'limit',
      reptile: 'limit',
      'pocket-pet': 'avoid'
    },
    feedingRole: 'staple',
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
    protein: 24.6,
    fat: 13.9,
    omega3: 1.48,
    calcium: 382,
    phosphorus: 490,
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
  "tuna_water": {
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
    feedingRole: 'staple',
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
  }
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