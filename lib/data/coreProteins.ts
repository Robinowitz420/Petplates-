/**
 * Core Protein Lists - Only Common, Affordable Ingredients
 * 
 * Philosophy: No exotic meats, no expensive specialty items.
 * Only proteins that are widely available, affordable, and nutritionally complete.
 */

import type { Species } from './ingredients';

/**
 * Core proteins for cats and dogs
 * These are all you need for excellent nutrition
 */
export const CORE_PROTEINS_CARNIVORE = [
  // Primary Muscle Meats
  'chicken',
  'chicken breast',
  'ground chicken',
  'turkey',
  'ground turkey',
  'beef',
  'ground beef',
  'ground beef (lean)',
  'pork',
  'ground pork',
  'ground pork (lean)',
  'lamb',
  'ground lamb',
  
  // Organs (Required)
  'chicken liver',
  'chicken heart',
  'beef liver',
  'turkey liver',
  'liver',
  'heart',
  'kidney',
  'gizzard',
  
  // Fish (Secondary)
  'salmon',
  'salmon (boneless)',
  'sardines',
  'sardines (canned in water)',
  'sardines (in water)',
  'mackerel',
  'mackerel (canned)',
  'anchovies',
  'herring',
  'herring (canned)',
  
  // Eggs
  'eggs',
  'egg',
  'egg yolk',
  'egg yolks',
  'whole egg',
  'hard-boiled egg',
  'egg (hard-boiled)',
];

/**
 * Core proteins for seed/plant-forward birds
 */
export const CORE_PROTEINS_BIRD_SEED = [
  // Plant Proteins
  'lentils',
  'chickpeas',
  'mung beans',
  'split peas',
  'quinoa',
  'hemp seeds',
  'pumpkin seeds',
  'sunflower seeds',
  'chia seeds',
  
  // Occasional Animal Protein
  'eggs',
  'egg yolk',
  'hard-boiled egg',
];

/**
 * Core proteins for omnivorous birds
 */
export const CORE_PROTEINS_BIRD_OMNIVORE = [
  // Animal Proteins
  'eggs',
  'chicken',
  'turkey',
  
  // Insects
  'mealworms',
  'crickets',
  'black soldier fly larvae',
  'dubia roaches',
  'silkworms',
];

/**
 * Core proteins for insectivorous birds
 */
export const CORE_PROTEINS_BIRD_INSECTIVORE = [
  'mealworms',
  'crickets',
  'dubia roaches',
  'black soldier fly larvae',
  'silkworms',
  'superworms',
];

/**
 * Core proteins for insectivorous reptiles
 */
export const CORE_PROTEINS_REPTILE_INSECTIVORE = [
  'crickets',
  'dubia roaches',
  'mealworms',
  'superworms',
  'silkworms',
  'black soldier fly larvae',
  'hornworms',
];

/**
 * Core proteins for carnivorous reptiles (whole prey)
 */
export const CORE_PROTEINS_REPTILE_CARNIVORE = [
  'mice',
  'rats',
  'chicks',
  'fish',
];

/**
 * Core proteins for omnivorous reptiles
 */
export const CORE_PROTEINS_REPTILE_OMNIVORE = [
  // Insects
  'crickets',
  'dubia roaches',
  'mealworms',
  'black soldier fly larvae',
  'silkworms',
  
  // Animal Proteins
  'eggs',
  'chicken',
  'turkey',
];

/**
 * Core proteins for herbivorous reptiles
 */
export const CORE_PROTEINS_REPTILE_HERBIVORE = [
  'lentils',
  'split peas',
  // Protein comes mainly from plants
];

/**
 * Core proteins for herbivorous pocket pets
 */
export const CORE_PROTEINS_POCKET_PET_HERBIVORE = [
  'timothy hay',
  'orchard grass hay',
  'meadow hay',
  'alfalfa hay',
  // NO animal protein
];

/**
 * Core proteins for omnivorous pocket pets
 */
export const CORE_PROTEINS_POCKET_PET_OMNIVORE = [
  'eggs',
  'chicken',
  'turkey',
  'lentils',
  'chickpeas',
  'mealworms',
  'crickets',
];

/**
 * Core proteins for insectivorous pocket pets
 */
export const CORE_PROTEINS_POCKET_PET_INSECTIVORE = [
  'mealworms',
  'crickets',
  'black soldier fly larvae',
  'eggs',
  'chicken',
];

/**
 * Exotic/Expensive proteins to EXCLUDE by default
 * These should only be used in advanced/allergy mode
 */
export const EXOTIC_PROTEINS = [
  'quail',
  'venison',
  'goat',
  'elk',
  'bison',
  'ostrich',
  'pheasant',
  'duck',
  'rabbit',
  'kangaroo',
  'alligator',
  'wild boar',
  'emu',
  'reindeer',
  'buffalo',
];

/**
 * Check if an ingredient is a core protein for the given species
 */
export function isCoreProtein(ingredientName: string, species: Species): boolean {
  const normalized = ingredientName.toLowerCase().trim();
  
  // Check if it's an exotic protein (exclude by default)
  if (EXOTIC_PROTEINS.some(exotic => normalized.includes(exotic.toLowerCase()))) {
    return false;
  }
  
  // Check species-specific core proteins
  if (species === 'dogs' || species === 'cats') {
    return CORE_PROTEINS_CARNIVORE.some(core => 
      normalized.includes(core.toLowerCase()) || core.toLowerCase().includes(normalized)
    );
  }
  
  if (species === 'birds') {
    return [
      ...CORE_PROTEINS_BIRD_SEED,
      ...CORE_PROTEINS_BIRD_OMNIVORE,
      ...CORE_PROTEINS_BIRD_INSECTIVORE
    ].some(core => 
      normalized.includes(core.toLowerCase()) || core.toLowerCase().includes(normalized)
    );
  }
  
  if (species === 'reptiles') {
    return [
      ...CORE_PROTEINS_REPTILE_INSECTIVORE,
      ...CORE_PROTEINS_REPTILE_CARNIVORE,
      ...CORE_PROTEINS_REPTILE_OMNIVORE,
      ...CORE_PROTEINS_REPTILE_HERBIVORE
    ].some(core => 
      normalized.includes(core.toLowerCase()) || core.toLowerCase().includes(normalized)
    );
  }
  
  if (species === 'pocket-pets') {
    return [
      ...CORE_PROTEINS_POCKET_PET_HERBIVORE,
      ...CORE_PROTEINS_POCKET_PET_OMNIVORE,
      ...CORE_PROTEINS_POCKET_PET_INSECTIVORE
    ].some(core => 
      normalized.includes(core.toLowerCase()) || core.toLowerCase().includes(normalized)
    );
  }
  
  return false;
}

/**
 * Check if an ingredient is exotic/expensive
 */
export function isExoticProtein(ingredientName: string): boolean {
  const normalized = ingredientName.toLowerCase().trim();
  return EXOTIC_PROTEINS.some(exotic => normalized.includes(exotic.toLowerCase()));
}

/**
 * Get core proteins for a species
 */
export function getCoreProteinsForSpecies(species: Species): string[] {
  if (species === 'dogs' || species === 'cats') {
    return CORE_PROTEINS_CARNIVORE;
  }
  
  if (species === 'birds') {
    return [
      ...CORE_PROTEINS_BIRD_SEED,
      ...CORE_PROTEINS_BIRD_OMNIVORE,
      ...CORE_PROTEINS_BIRD_INSECTIVORE
    ];
  }
  
  if (species === 'reptiles') {
    return [
      ...CORE_PROTEINS_REPTILE_INSECTIVORE,
      ...CORE_PROTEINS_REPTILE_CARNIVORE,
      ...CORE_PROTEINS_REPTILE_OMNIVORE,
      ...CORE_PROTEINS_REPTILE_HERBIVORE
    ];
  }
  
  if (species === 'pocket-pets') {
    return [
      ...CORE_PROTEINS_POCKET_PET_HERBIVORE,
      ...CORE_PROTEINS_POCKET_PET_OMNIVORE,
      ...CORE_PROTEINS_POCKET_PET_INSECTIVORE
    ];
  }
  
  return [];
}
