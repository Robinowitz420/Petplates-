// lib/utils/ingredientWhitelists.ts
// Species-specific ingredient whitelists for safe meal building
// This provides a curated "safe" list per species to prevent dangerous combinations
// Now uses global ingredient pool + subtype-based normalization

import { getIngredientComposition, INGREDIENT_COMPOSITIONS, type SpeciesCompatibility } from '@/lib/data/ingredientCompositions';
import { ALL_INGREDIENTS } from './allIngredients';
import type { GlobalIngredient } from '@/lib/data/globalIngredients';

// Import global ingredients from JSON
const GLOBAL_INGREDIENTS: Record<string, GlobalIngredient> = require('@/lib/data/globalIngredients.json');

export type Species = 'dog' | 'cat' | 'bird' | 'reptile' | 'pocket-pet';
export type ReptileType = 'herbivore' | 'insectivore' | 'omnivore';
export type PocketPetType = 'rabbit' | 'guinea-pig' | 'hamster' | 'gerbil';
export type Subtype = 
  | 'bird_small' | 'bird_large'
  | 'reptile_herbivore' | 'reptile_insectivore' | 'reptile_omnivore' | 'reptile_carnivore'
  | 'pocket_hay' | 'pocket_varied' | 'pocket_carnivore' | 'pocket_insectivore'
  | 'dog' | 'cat';

/**
 * Normalize species + breed to subtype
 */
export function normalizeToSubtype(species: Species, breed?: string): Subtype {
  if (species === 'bird') {
    const largeBirds = ['parrot', 'cockatoo', 'african grey', 'macaw', 'conure', 'quaker'];
    const breedLower = breed?.toLowerCase() || '';
    return largeBirds.some(lb => breedLower.includes(lb)) ? 'bird_large' : 'bird_small';
  }
  
  if (species === 'reptile') {
    const herbivores = ['bearded dragon', 'iguana', 'slider', 'tortoise', 'uromastyx'];
    const carnivores = ['python', 'snake', 'monitor', 'chameleon', 'corn snake', 'ball python'];
    const insectivores = ['leopard gecko', 'crested gecko', 'gecko'];
    const breedLower = breed?.toLowerCase() || '';
    
    if (herbivores.some(h => breedLower.includes(h))) return 'reptile_herbivore';
    if (carnivores.some(c => breedLower.includes(c))) return 'reptile_carnivore';
    if (insectivores.some(i => breedLower.includes(i))) return 'reptile_insectivore';
    return 'reptile_omnivore'; // Default for mixed/unknown
  }
  
  if (species === 'pocket-pet') {
    const breedLower = breed?.toLowerCase() || '';
    if (breedLower.includes('rabbit') || breedLower.includes('guinea') || breedLower.includes('chinchilla')) {
      return 'pocket_hay';
    }
    if (breedLower.includes('ferret')) {
      return 'pocket_carnivore';
    }
    if (breedLower.includes('hedgehog')) {
      return 'pocket_insectivore';
    }
    return 'pocket_varied'; // Hamster, gerbil, rat, mouse
  }
  
  return species; // dog, cat
}

/**
 * Base whitelists by subtype - these ensure we always have something to show
 */
export const BASE_WHITELISTS: Record<Subtype, string[]> = {
  bird_small: [
    'millet', 'canary_seed', 'niger_seed', 'oat_groats',
    'carrot_grated', 'broccoli', 'spinach', 'kale',
    'apple_no_seeds', 'blueberries', 'strawberries',
    'egg_hard_boiled', 'pellets_fortified', 'cuttlebone'
  ],
  bird_large: [
    // All bird_small plus:
    'quinoa_cooked', 'brown_rice_cooked', 'oats',
    'bell_peppers', 'sweet_potato_cooked', 'mango', 'papaya',
    'parrot_pellets', 'nuts_unsalted', 'pumpkin', 'carrots'
  ],
  reptile_herbivore: [
    'collard_greens', 'mustard_greens', 'turnip_greens', 'dandelion_greens',
    'butternut_squash', 'bell_peppers', 'carrot_grated', 'zucchini',
    'blueberries', 'mango', 'papaya', 'strawberries',
    'calcium_carbonate', 'vitamin_d3', 'kale', 'spinach'
  ],
  reptile_insectivore: [
    'dubia_roaches', 'crickets', 'mealworms', 'superworms',
    'black_soldier_fly_larvae', 'hornworms', 'calcium_carbonate', 'waxworms'
  ],
  reptile_omnivore: [
    // Combination of herbivore + insectivore
    'collard_greens', 'mustard_greens', 'dandelion_greens',
    'crickets', 'dubia_roaches', 'mealworms',
    'blueberries', 'mango', 'calcium_carbonate'
  ],
  reptile_carnivore: [
    // Placeholder - whole prey items (will need special handling)
    'whole_prey_rodent', 'whole_prey_bird', 'protein_block',
    'chicken_breast', 'ground_turkey'
  ],
  pocket_hay: [
    'timothy_hay', 'orchard_grass_hay', 'alfalfa_hay',
    'romaine_lettuce', 'bell_peppers', 'carrots', 'cucumber',
    'parsley', 'cilantro', 'guinea_pig_pellets', 'rabbit_pellets',
    'vitamin_c_supplement', 'kale', 'spinach'
  ],
  pocket_varied: [
    'hamster_pellets', 'gerbil_pellets', 'oats', 'quinoa_cooked',
    'carrots', 'broccoli', 'apple_no_seeds', 'blueberries',
    'mealworms_freeze_dried', 'sunflower_seeds_unsalted', 'pumpkin_seeds'
  ],
  pocket_carnivore: [
    'chicken_breast', 'ground_turkey', 'salmon', 'egg_whole',
    'organ_meat', 'taurine_supplement', 'heart', 'liver'
  ],
  pocket_insectivore: [
    'mealworms', 'crickets', 'waxworms', 'egg_whole',
    'insectivore_diet_powder', 'superworms'
  ],
  dog: [], // Will be populated from global pool
  cat: []  // Will be populated from global pool
};

/**
 * Get whitelist of safe ingredients for a species
 * Returns ingredient display names that are marked as 'ok' or 'limit' (not 'avoid')
 * Now uses global pool + base whitelists
 */
export function getWhitelistForSpecies(species: Species, breed?: string, subtype?: ReptileType | PocketPetType): string[] {
  const normalizedSubtype = normalizeToSubtype(species, breed);
  const whitelist: Set<string> = new Set();
  
  // 1. Add base whitelist for this subtype (ensures we always have something)
  const baseList = BASE_WHITELISTS[normalizedSubtype] || [];
  baseList.forEach(ing => whitelist.add(ing));
  
  // 2. Add from existing ALL_INGREDIENTS (backward compatibility)
  // Map species to ALL_INGREDIENTS key format
  const speciesKey = species === 'dog' ? 'dogs' : 
                     species === 'cat' ? 'cats' :
                     species === 'bird' ? 'birds' :
                     species === 'reptile' ? 'reptiles' :
                     species === 'pocket-pet' ? 'pocket-pets' : species;
  
  const speciesData = ALL_INGREDIENTS[speciesKey as keyof typeof ALL_INGREDIENTS];
  if (speciesData) {
    Object.values(speciesData).forEach(category => {
      if (Array.isArray(category)) {
        category.forEach(ingName => whitelist.add(ingName));
      }
    });
  }
  
  // 3. Add from global ingredient pool (new approach)
  Object.values(GLOBAL_INGREDIENTS).forEach(globalIng => {
    // Try to find composition data
    const compositionKey = globalIng.compositionKey || globalIng.id;
    const composition = getIngredientComposition(compositionKey);
    
    if (composition?.speciesCompatibility) {
      const compat = composition.speciesCompatibility[species];
      if (compat === 'ok' || compat === 'limit' || compat === 'caution') {
        whitelist.add(globalIng.displayName);
      }
    } else {
      // If no compatibility data but it's in global pool, include it with low confidence
      // This allows discovery of new ingredients
      if (globalIng.confidenceLevel === 'high' || globalIng.confidenceLevel === 'medium') {
        whitelist.add(globalIng.displayName);
      }
    }
  });
  
  // 4. Filter by compatibility from INGREDIENT_COMPOSITIONS
  const filtered: string[] = [];
  whitelist.forEach(ingName => {
    // Try multiple key formats
    const keys = [
      ingName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
      ingName.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      ingName.toLowerCase()
    ];
    
    let found = false;
    let shouldInclude = true;
    
    for (const key of keys) {
      const composition = getIngredientComposition(key);
      if (composition?.speciesCompatibility) {
        const compat = composition.speciesCompatibility[species];
        if (compat === 'ok' || compat === 'limit' || compat === 'caution') {
          shouldInclude = true;
          found = true;
          break;
        } else if (compat === 'avoid') {
          shouldInclude = false; // Explicitly avoid, don't add
          found = true;
          break;
        }
      }
    }
    
    // If no composition data found, include it anyway (allows ingredients from ALL_INGREDIENTS)
    // This is important because ALL_INGREDIENTS already contains species-specific safe ingredients
    if (!found || shouldInclude) {
      filtered.push(ingName);
    }
  });
  
  // 5. Apply subtype-specific filters
  if (species === 'reptile' && subtype) {
    const reptileTypes: ReptileType[] = ['herbivore', 'insectivore', 'omnivore'];
    if (reptileTypes.includes(subtype as ReptileType)) {
      return filterByReptileType(filtered, subtype as ReptileType);
    }
  }
  
  if (species === 'pocket-pet' && subtype) {
    const pocketPetTypes: PocketPetType[] = ['rabbit', 'guinea-pig', 'hamster', 'gerbil'];
    if (pocketPetTypes.includes(subtype as PocketPetType)) {
      return filterByPocketPetType(filtered, subtype as PocketPetType);
    }
  }
  
  return filtered;
}

/**
 * Filter ingredients by reptile type
 */
function filterByReptileType(ingredients: string[], type: ReptileType): string[] {
  // Herbivores: no meat, focus on greens/veggies
  if (type === 'herbivore') {
    return ingredients.filter(ing => {
      const lower = ing.toLowerCase();
      return !lower.includes('chicken') && !lower.includes('beef') && 
             !lower.includes('turkey') && !lower.includes('meat') &&
             !lower.includes('salmon') && !lower.includes('fish');
    });
  }
  
  // Insectivores: no plant matter, focus on proteins
  if (type === 'insectivore') {
    return ingredients.filter(ing => {
      const lower = ing.toLowerCase();
      return lower.includes('insect') || lower.includes('cricket') || 
             lower.includes('mealworm') || lower.includes('protein');
    });
  }
  
  // Omnivores: allow both
  return ingredients;
}

/**
 * Filter ingredients by pocket pet type
 */
function filterByPocketPetType(ingredients: string[], type: PocketPetType): string[] {
  // Rabbits and guinea pigs: hay-based, limit fruits
  if (type === 'rabbit' || type === 'guinea-pig') {
    return ingredients.filter(ing => {
      const lower = ing.toLowerCase();
      // Prioritize hay, greens, limit high-sugar fruits
      return lower.includes('hay') || lower.includes('green') || 
             lower.includes('kale') || lower.includes('carrot') ||
             (lower.includes('fruit') && !lower.includes('banana') && !lower.includes('grape'));
    });
  }
  
  // Hamsters and gerbils: more variety, can handle more fruits/grains
  return ingredients;
}

/**
 * Check if an ingredient is in the whitelist for a species
 * Also checks if ingredient is in ALL_INGREDIENTS for that species (even without composition data)
 */
export function isWhitelisted(ingredientName: string, species: Species, subtype?: ReptileType | PocketPetType): boolean {
  // First check the whitelist
  const whitelist = getWhitelistForSpecies(species, subtype);
  const inWhitelist = whitelist.some(ing => 
    ing.toLowerCase() === ingredientName.toLowerCase() ||
    ing.toLowerCase().includes(ingredientName.toLowerCase()) ||
    ingredientName.toLowerCase().includes(ing.toLowerCase())
  );
  
  if (inWhitelist) return true;
  
  // Also check if ingredient is in ALL_INGREDIENTS for this species
  // This ensures ingredients from ALL_INGREDIENTS are included even without composition data
  const speciesKey = species === 'dog' ? 'dogs' : 
                     species === 'cat' ? 'cats' :
                     species === 'bird' ? 'birds' :
                     species === 'reptile' ? 'reptiles' :
                     species === 'pocket-pet' ? 'pocket-pets' : species;
  
  const speciesData = ALL_INGREDIENTS[speciesKey as keyof typeof ALL_INGREDIENTS];
  if (speciesData) {
    for (const category of Object.values(speciesData)) {
      if (Array.isArray(category)) {
        const found = category.some(ing => 
          ing.toLowerCase() === ingredientName.toLowerCase() ||
          ing.toLowerCase().includes(ingredientName.toLowerCase()) ||
          ingredientName.toLowerCase().includes(ing.toLowerCase())
        );
        if (found) return true;
      }
    }
  }
  
  return false;
}

/**
 * Get "do not use" list for a species (ingredients marked as 'avoid')
 */
export function getBlacklistForSpecies(species: Species): string[] {
  const blacklist: string[] = [];
  
  // Check all ingredients in composition database
  const allCompositions = Object.keys(INGREDIENT_COMPOSITIONS);
  
  for (const key of allCompositions) {
    const composition = getIngredientComposition(key);
    if (composition?.speciesCompatibility) {
      const compat = composition.speciesCompatibility[species];
      if (compat === 'avoid') {
        blacklist.push(key.replace(/_/g, ' ')); // Convert to display name
      }
    }
  }
  
  return blacklist;
}

/**
 * Get confidence level for species ingredient coverage
 * 'full' = comprehensive data, 'beta' = partial data, 'limited' = minimal data
 */
export function getSpeciesCoverageLevel(species: Species): 'full' | 'beta' | 'limited' {
  const coverage: Record<Species, 'full' | 'beta' | 'limited'> = {
    'dog': 'full',
    'cat': 'full',
    'bird': 'beta',
    'reptile': 'beta',
    'pocket-pet': 'beta'
  };
  
  return coverage[species] || 'limited';
}

