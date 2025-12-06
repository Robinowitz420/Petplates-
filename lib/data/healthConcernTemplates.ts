// lib/data/healthConcernTemplates.ts
// Health concern templates per subtype
// These allow us to provide recommendations even when species-specific recipes don't exist

import type { Subtype } from '@/lib/utils/ingredientWhitelists';

export interface HealthConcernTemplate {
  id: string;
  name: string;
  subtype: Subtype;
  healthConcern: string;
  description: string;
  rules: {
    preferIngredients?: string[];      // Ingredients to prefer
    avoidIngredients?: string[];       // Ingredients to avoid/reduce
    maxInclusion?: Record<string, number>; // Max percentages for specific ingredients
    nutritionalAdjustments?: {
      reduceCalories?: boolean;
      reduceFat?: boolean;
      reducePhosphorus?: boolean;
      increaseFiber?: boolean;
      increaseProtein?: boolean;
    };
    substitutions?: Record<string, string[]>; // Ingredient substitutions
  };
  warning?: string; // Warning to show user
}

/**
 * Health concern templates by subtype
 * These templates can be applied to any species in that subtype
 */
export const HEALTH_CONCERN_TEMPLATES: HealthConcernTemplate[] = [
  // BIRD TEMPLATES
  {
    id: 'weight-management-bird-small',
    name: 'Weight Management - Small Birds',
    subtype: 'bird_small',
    healthConcern: 'weight-management',
    description: 'Lower calorie diet for small birds prone to obesity',
    rules: {
      preferIngredients: ['pellets_fortified', 'vegetables', 'leafy_greens'],
      avoidIngredients: ['sunflower_seeds', 'high_fat_seeds', 'nuts'],
      maxInclusion: {
        'seeds': 0.10, // Max 10% seeds
        'fruits': 0.15  // Max 15% fruits
      },
      nutritionalAdjustments: {
        reduceCalories: true,
        increaseFiber: true
      }
    },
    warning: 'Generic small bird weight management template - confirm with your vet'
  },
  {
    id: 'weight-management-bird-large',
    name: 'Weight Management - Large Birds',
    subtype: 'bird_large',
    healthConcern: 'weight-management',
    description: 'Lower calorie diet for large parrots prone to obesity',
    rules: {
      preferIngredients: ['pellets_fortified', 'vegetables', 'whole_grains'],
      avoidIngredients: ['nuts', 'high_fat_seeds', 'excessive_fruits'],
      maxInclusion: {
        'nuts': 0.05,
        'fruits': 0.20
      },
      nutritionalAdjustments: {
        reduceCalories: true,
        increaseFiber: true
      }
    },
    warning: 'Generic large bird weight management template - confirm with your vet'
  },
  {
    id: 'heart-disease-bird',
    name: 'Heart Disease Support - Birds',
    subtype: 'bird_large', // Applies to both, but large birds more common
    healthConcern: 'heart',
    description: 'Lower fat, heart-healthy diet for birds with cardiac issues',
    rules: {
      preferIngredients: ['pellets_fortified', 'vegetables', 'leafy_greens'],
      avoidIngredients: ['high_fat_seeds', 'nuts', 'sunflower_seeds'],
      maxInclusion: {
        'seeds': 0.10,
        'fats': 0.05
      },
      nutritionalAdjustments: {
        reduceFat: true,
        increaseFiber: true
      },
      substitutions: {
        'sunflower_seeds': ['millet', 'canary_seed'],
        'nuts': ['pellets_fortified']
      }
    },
    warning: 'Generic bird heart health template - confirm with your vet'
  },
  
  // REPTILE TEMPLATES
  {
    id: 'weight-management-reptile-herbivore',
    name: 'Weight Management - Herbivore Reptiles',
    subtype: 'reptile_herbivore',
    healthConcern: 'weight-management',
    description: 'Lower calorie diet for herbivorous reptiles',
    rules: {
      preferIngredients: ['leafy_greens', 'low_calorie_vegetables'],
      avoidIngredients: ['fruits', 'high_sugar_vegetables'],
      maxInclusion: {
        'fruits': 0.10,
        'squash': 0.15
      },
      nutritionalAdjustments: {
        reduceCalories: true,
        increaseFiber: true
      }
    },
    warning: 'Generic herbivore reptile weight management - applies to bearded dragons, iguanas, etc. Confirm with your vet'
  },
  {
    id: 'metabolic-bone-disease-reptile',
    name: 'Metabolic Bone Disease Support - Reptiles',
    subtype: 'reptile_herbivore',
    healthConcern: 'bone-health',
    description: 'High calcium, proper Ca:P ratio for reptiles with MBD',
    rules: {
      preferIngredients: ['collard_greens', 'mustard_greens', 'dandelion_greens', 'calcium_supplement'],
      avoidIngredients: ['spinach', 'beet_greens', 'swiss_chard'], // High oxalates
      maxInclusion: {
        'spinach': 0.05,
        'oxalate_greens': 0.10
      },
      nutritionalAdjustments: {
        increaseFiber: true // For proper Ca:P
      }
    },
    warning: 'Generic reptile bone health template - ensure proper UVB and calcium supplementation'
  },
  
  // POCKET PET TEMPLATES
  {
    id: 'weight-management-pocket-hay',
    name: 'Weight Management - Hay-Based Pets',
    subtype: 'pocket_hay',
    healthConcern: 'weight-management',
    description: 'Unlimited hay, limited pellets and fruits for rabbits/guinea pigs',
    rules: {
      preferIngredients: ['timothy_hay', 'orchard_grass_hay', 'leafy_greens'],
      avoidIngredients: ['alfalfa_hay', 'pellets', 'fruits', 'carrots'],
      maxInclusion: {
        'pellets': 0.05,
        'fruits': 0.02,
        'carrots': 0.05
      },
      nutritionalAdjustments: {
        reduceCalories: true,
        increaseFiber: true
      }
    },
    warning: 'Generic hay-based pet weight management - unlimited hay, minimal treats'
  },
  {
    id: 'urinary-health-pocket-hay',
    name: 'Urinary Health - Hay-Based Pets',
    subtype: 'pocket_hay',
    healthConcern: 'urinary-health',
    description: 'High moisture, low calcium for urinary issues',
    rules: {
      preferIngredients: ['timothy_hay', 'leafy_greens', 'high_moisture_vegetables'],
      avoidIngredients: ['alfalfa_hay', 'high_calcium_greens'],
      maxInclusion: {
        'alfalfa': 0.0,
        'high_calcium_greens': 0.10
      },
      nutritionalAdjustments: {
        increaseFiber: true // For hydration
      }
    },
    warning: 'Generic urinary health template - ensure adequate hydration'
  },
  {
    id: 'diabetes-pocket-varied',
    name: 'Diabetes Support - Small Mammals',
    subtype: 'pocket_varied',
    healthConcern: 'diabetes',
    description: 'Low sugar, high fiber diet for diabetic hamsters/gerbils',
    rules: {
      preferIngredients: ['pellets', 'vegetables', 'protein'],
      avoidIngredients: ['fruits', 'sweet_vegetables', 'grains'],
      maxInclusion: {
        'fruits': 0.0,
        'sweet_vegetables': 0.05
      },
      nutritionalAdjustments: {
        reduceCalories: true,
        increaseFiber: true,
        increaseProtein: true
      }
    },
    warning: 'Generic diabetes template for small mammals - monitor blood sugar'
  }
];

/**
 * Get health concern templates for a subtype
 */
export function getHealthTemplatesForSubtype(subtype: Subtype, healthConcern?: string): HealthConcernTemplate[] {
  let templates = HEALTH_CONCERN_TEMPLATES.filter(t => t.subtype === subtype);
  
  if (healthConcern) {
    templates = templates.filter(t => t.healthConcern === healthConcern);
  }
  
  return templates;
}

/**
 * Get health concern templates that apply to a species
 */
export function getHealthTemplatesForSpecies(species: string, breed?: string, healthConcern?: string): HealthConcernTemplate[] {
  const { normalizeToSubtype } = require('@/lib/utils/ingredientWhitelists');
  const subtype = normalizeToSubtype(species as any, breed);
  
  return getHealthTemplatesForSubtype(subtype, healthConcern);
}

/**
 * Apply a health template to a recipe/ingredient list
 */
export function applyHealthTemplate(
  ingredients: string[],
  template: HealthConcernTemplate
): {
  adjustedIngredients: string[];
  warnings: string[];
  substitutions: Record<string, string>;
} {
  const adjusted: string[] = [];
  const warnings: string[] = [];
  const substitutions: Record<string, string> = {};
  
  ingredients.forEach(ing => {
    const ingLower = ing.toLowerCase();
    
    // Check if should avoid
    const shouldAvoid = template.rules.avoidIngredients?.some(avoid => 
      ingLower.includes(avoid.toLowerCase())
    );
    
    if (shouldAvoid) {
      // Try to substitute
      let substituted = false;
      for (const [original, replacements] of Object.entries(template.rules.substitutions || {})) {
        if (ingLower.includes(original.toLowerCase())) {
          const replacement = replacements[0]; // Use first replacement
          adjusted.push(replacement);
          substitutions[ing] = replacement;
          substituted = true;
          break;
        }
      }
      
      if (!substituted) {
        warnings.push(`Reduced or removed: ${ing} (not ideal for ${template.name})`);
      }
    } else {
      adjusted.push(ing);
    }
  });
  
  // Add preferred ingredients if missing
  template.rules.preferIngredients?.forEach(pref => {
    if (!adjusted.some(ing => ing.toLowerCase().includes(pref.toLowerCase()))) {
      adjusted.push(pref);
    }
  });
  
  return { adjustedIngredients: adjusted, warnings, substitutions };
}

