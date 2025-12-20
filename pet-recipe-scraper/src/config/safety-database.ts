/**
 * INGREDIENT SAFETY DATABASE
 * Comprehensive toxic/safe ingredient lists by species
 * Sources: ASPCA, Pet Poison Helpline, Veterinary toxicology databases
 */

import { IngredientSafety, Species } from '../types';

export const TOXIC_INGREDIENTS: IngredientSafety[] = [
  // UNIVERSAL TOXINS (All Species)
  {
    ingredient: 'chocolate',
    safeFor: [],
    toxicFor: ['cats', 'dogs', 'birds', 'pocket-pets'],
    cautionFor: [],
    notes: 'Contains theobromine - highly toxic to most pets',
  },
  {
    ingredient: 'xylitol',
    safeFor: [],
    toxicFor: ['cats', 'dogs'],
    cautionFor: ['birds', 'pocket-pets'],
    notes: 'Artificial sweetener - causes liver failure and hypoglycemia',
  },
  {
    ingredient: 'caffeine',
    safeFor: [],
    toxicFor: ['cats', 'dogs', 'birds', 'pocket-pets'],
    cautionFor: [],
    notes: 'Stimulant - causes cardiac issues',
  },

  // DOGS & CATS
  {
    ingredient: 'onion',
    safeFor: [],
    toxicFor: ['cats', 'dogs'],
    cautionFor: [],
    notes: 'Causes hemolytic anemia - destroys red blood cells',
  },
  {
    ingredient: 'garlic',
    safeFor: [],
    toxicFor: ['cats', 'dogs'],
    cautionFor: [],
    notes: 'More potent than onion - causes anemia',
  },
  {
    ingredient: 'grapes',
    safeFor: ['birds'],
    toxicFor: ['dogs'],
    cautionFor: ['cats'],
    notes: 'Causes kidney failure in dogs',
  },
  {
    ingredient: 'raisins',
    safeFor: ['birds'],
    toxicFor: ['dogs'],
    cautionFor: ['cats'],
    notes: 'Concentrated grape toxicity - kidney failure',
  },
  {
    ingredient: 'avocado',
    safeFor: [],
    toxicFor: ['birds', 'pocket-pets'],
    cautionFor: ['cats', 'dogs'],
    notes: 'Contains persin - highly toxic to birds',
  },
  {
    ingredient: 'macadamia nuts',
    safeFor: [],
    toxicFor: ['dogs'],
    cautionFor: [],
    notes: 'Causes weakness, tremors, hyperthermia',
  },
  {
    ingredient: 'alcohol',
    safeFor: [],
    toxicFor: ['cats', 'dogs', 'birds', 'pocket-pets'],
    cautionFor: [],
    notes: 'Ethanol toxicity - can be fatal',
  },

  // BIRDS SPECIFIC
  {
    ingredient: 'salt',
    safeFor: ['cats', 'dogs'],
    toxicFor: ['birds'],
    cautionFor: ['pocket-pets'],
    notes: 'Birds extremely sensitive to sodium',
  },
  {
    ingredient: 'apple seeds',
    safeFor: [],
    toxicFor: ['birds', 'pocket-pets'],
    cautionFor: ['cats', 'dogs'],
    notes: 'Contains cyanide compounds',
  },
  {
    ingredient: 'cherry pits',
    safeFor: [],
    toxicFor: ['birds', 'pocket-pets', 'cats', 'dogs'],
    cautionFor: [],
    notes: 'Contains cyanogenic glycosides',
  },

  // POCKET PETS SPECIFIC
  {
    ingredient: 'iceberg lettuce',
    safeFor: ['cats', 'dogs'],
    toxicFor: [],
    cautionFor: ['pocket-pets', 'reptiles'],
    notes: 'Low nutrition, can cause diarrhea in small animals',
  },
  {
    ingredient: 'rhubarb',
    safeFor: [],
    toxicFor: ['pocket-pets', 'cats', 'dogs'],
    cautionFor: [],
    notes: 'Contains oxalic acid - kidney damage',
  },
  {
    ingredient: 'potato (raw)',
    safeFor: [],
    toxicFor: ['pocket-pets', 'birds'],
    cautionFor: ['cats', 'dogs'],
    notes: 'Contains solanine when raw or green',
  },

  // REPTILES SPECIFIC
  {
    ingredient: 'spinach',
    safeFor: ['cats', 'dogs', 'birds'],
    toxicFor: [],
    cautionFor: ['reptiles', 'pocket-pets'],
    notes: 'High oxalates - binds calcium, feed sparingly',
  },
  {
    ingredient: 'kale',
    safeFor: ['cats', 'dogs', 'birds'],
    toxicFor: [],
    cautionFor: ['reptiles'],
    notes: 'Goitrogens - can affect thyroid, feed in moderation',
  },
];

export const SAFE_INGREDIENTS: IngredientSafety[] = [
  // UNIVERSAL SAFE
  {
    ingredient: 'chicken',
    safeFor: ['cats', 'dogs', 'reptiles', 'birds'],
    toxicFor: [],
    cautionFor: [],
    notes: 'Excellent protein source - cook thoroughly for most species',
  },
  {
    ingredient: 'turkey',
    safeFor: ['cats', 'dogs', 'reptiles', 'birds'],
    toxicFor: [],
    cautionFor: [],
    notes: 'Lean protein - remove skin for low-fat diets',
  },
  {
    ingredient: 'salmon',
    safeFor: ['cats', 'dogs'],
    toxicFor: [],
    cautionFor: [],
    notes: 'Rich in omega-3 fatty acids',
  },
  {
    ingredient: 'blueberries',
    safeFor: ['cats', 'dogs', 'birds', 'pocket-pets'],
    toxicFor: [],
    cautionFor: [],
    notes: 'Antioxidant-rich, safe treat',
  },
  {
    ingredient: 'carrots',
    safeFor: ['cats', 'dogs', 'birds', 'pocket-pets', 'reptiles'],
    toxicFor: [],
    cautionFor: [],
    notes: 'High in beta-carotene, good for vision',
  },
  {
    ingredient: 'sweet potato',
    safeFor: ['cats', 'dogs', 'birds', 'pocket-pets'],
    toxicFor: [],
    cautionFor: [],
    notes: 'Complex carbohydrate, high in fiber',
  },
  {
    ingredient: 'pumpkin',
    safeFor: ['cats', 'dogs', 'birds', 'pocket-pets'],
    toxicFor: [],
    cautionFor: [],
    notes: 'Excellent for digestive health',
  },

  // REPTILES SAFE
  {
    ingredient: 'collard greens',
    safeFor: ['reptiles', 'pocket-pets', 'birds'],
    toxicFor: [],
    cautionFor: [],
    notes: 'Excellent Ca:P ratio for herbivorous reptiles',
  },
  {
    ingredient: 'dandelion greens',
    safeFor: ['reptiles', 'pocket-pets', 'birds'],
    toxicFor: [],
    cautionFor: [],
    notes: 'High calcium, safe forage',
  },
  {
    ingredient: 'butternut squash',
    safeFor: ['reptiles', 'pocket-pets', 'birds', 'cats', 'dogs'],
    toxicFor: [],
    cautionFor: [],
    notes: 'Good vitamin A source',
  },

  // BIRDS SAFE
  {
    ingredient: 'millet',
    safeFor: ['birds', 'pocket-pets'],
    toxicFor: [],
    cautionFor: [],
    notes: 'Staple seed for small birds',
  },
  {
    ingredient: 'quinoa',
    safeFor: ['birds', 'pocket-pets', 'cats', 'dogs'],
    toxicFor: [],
    cautionFor: [],
    notes: 'Complete protein, cook before serving',
  },

  // POCKET PETS SAFE
  {
    ingredient: 'timothy hay',
    safeFor: ['pocket-pets'],
    toxicFor: [],
    cautionFor: [],
    notes: 'Essential fiber for rabbits, guinea pigs, chinchillas',
  },
  {
    ingredient: 'bell pepper',
    safeFor: ['pocket-pets', 'birds', 'reptiles', 'cats', 'dogs'],
    toxicFor: [],
    cautionFor: [],
    notes: 'High in vitamin C - essential for guinea pigs',
  },
  {
    ingredient: 'romaine lettuce',
    safeFor: ['pocket-pets', 'reptiles', 'birds'],
    toxicFor: [],
    cautionFor: [],
    notes: 'Better than iceberg - more nutrients',
  },
];

// Helper functions
export function isIngredientSafe(ingredient: string, species: Species): boolean {
  const normalized = ingredient.toLowerCase().trim();
  
  // Check toxic list
  const toxic = TOXIC_INGREDIENTS.find(item => 
    item.ingredient.toLowerCase() === normalized && 
    item.toxicFor.includes(species)
  );
  
  if (toxic) return false;
  
  // Check safe list
  const safe = SAFE_INGREDIENTS.find(item => 
    item.ingredient.toLowerCase() === normalized && 
    item.safeFor.includes(species)
  );
  
  return !!safe;
}

export function getIngredientWarnings(ingredient: string, species: Species): string[] {
  const normalized = ingredient.toLowerCase().trim();
  const warnings: string[] = [];
  
  // Check toxic
  const toxic = TOXIC_INGREDIENTS.find(item => 
    item.ingredient.toLowerCase() === normalized
  );
  
  if (toxic) {
    if (toxic.toxicFor.includes(species)) {
      warnings.push(`⚠️ TOXIC to ${species}: ${toxic.notes}`);
    } else if (toxic.cautionFor.includes(species)) {
      warnings.push(`⚡ CAUTION for ${species}: ${toxic.notes}`);
    }
  }
  
  return warnings;
}

export function validateRecipeIngredients(
  ingredients: string[], 
  species: Species
): { safe: boolean; warnings: string[] } {
  const warnings: string[] = [];
  let safe = true;
  
  for (const ingredient of ingredients) {
    const itemWarnings = getIngredientWarnings(ingredient, species);
    if (itemWarnings.length > 0) {
      warnings.push(...itemWarnings);
      if (itemWarnings.some(w => w.includes('TOXIC'))) {
        safe = false;
      }
    }
  }
  
  return { safe, warnings };
}
