// lib/utils/allIngredients.ts
// Extract all ingredients from generate-recipes.js INGREDIENTS object
// This contains all the scraped AAFCO and research-based ingredients
// Also includes auto-generated ingredients from scraped data

import { GENERATED_INGREDIENTS } from '@/lib/data/generatedIngredients';

export interface SpeciesIngredients {
  [category: string]: string[];
}

export interface AllIngredients {
  dogs: {
    proteins: string[];
    carbs: string[];
    vegetables: string[];
    fats: string[];
  };
  cats: {
    proteins: string[];
    carbs: string[];
    vegetables: string[];
    fats: string[];
    fiber_supplements: string[];
    supplements: string[];
  };
  birds: {
    seeds: string[];
    nuts: string[]; // Added for large parrots
    vegetables: string[];
    fruits: string[];
    supplements: string[];
  };
  reptiles: {
    insects: string[];
    whole_prey: string[]; // Added for snakes
    vegetables: string[];
    fruits: string[];
  };
  'pocket-pets': {
    hay: string[];
    vegetables: string[];
    pellets: string[];
    fruits: string[];
    hamster_additions: string[];
    sugar_glider_special: string[]; // Added for gliders
  };
}

// This is the complete ingredient list from generate-recipes.js
// Contains all scraped AAFCO and research-based ingredients
export const ALL_INGREDIENTS: AllIngredients = {
  dogs: {
    proteins: [
      'Ground Chicken', 'Ground Turkey', 'Ground Beef (lean)', 'Ground Lamb', 'Salmon (boneless)',
      'Chicken Breast', 'Chicken Thighs', 'Turkey Breast', 'Beef Liver', 'Chicken Liver',
      'Chicken Hearts', 'Sardines (canned in water)', 'Eggs', 'Turkey Giblets', 'Chicken Giblets',
      'Duck Breast', 'Venison', 'Rabbit Meat', 'Quail', 'Ground Pork (lean)', 'Turkey Necks',
      'Ground Duck', 'Turkey Thighs', 'Chicken Necks', 'Ground Venison', 'Ground Rabbit',
      'Lamb Liver', 'Turkey Liver', 'Duck Hearts', 'Quail Eggs', 'Ground Quail'
    ],
    carbs: [
      'Brown Rice', 'White Rice', 'Quinoa', 'Sweet Potato', 'Regular Potato',
      'Oats (rolled)', 'Barley', 'Pumpkin Puree', 'Butternut Squash', 'Lentils',
      'Chickpeas (mashed)', 'Black Beans (mashed)', 'Green Peas', 'Wild Rice',
      'Amaranth', 'Buckwheat', 'Millet', 'Sorghum', 'Farro', 'Bulgur',
      'Split Peas', 'Kidney Beans (mashed)', 'Pinto Beans (mashed)', 'Navy Beans (mashed)',
      'Acorn Squash', 'Spaghetti Squash', 'Delicata Squash', 'Kabocha Squash'
    ],
    vegetables: [
      'Carrots', 'Green Beans', 'Peas', 'Spinach', 'Broccoli', 'Zucchini',
      'Kale', 'Celery', 'Bell Peppers (red/green)', 'Brussels Sprouts', 'Asparagus', 'Parsley',
      'Cucumber (peeled)', 'Lettuce (romaine)', 'Arugula', 'Endive', 'Escarole', 'Dandelion Greens',
      'Collard Greens', 'Mustard Greens', 'Turnip Greens', 'Beet Greens', 'Radish Greens',
      'Swiss Chard', 'Bok Choi', 'Napa Cabbage', 'Red Cabbage', 'Green Cabbage',
      'Cauliflower', 'Romanesco Broccoli', 'Snow Peas', 'Sugar Snap Peas',
      'Fennel', 'Leeks', 'Shallots', 'Garlic (small amounts)', 'Ginger (small amounts)',
      'Artichokes', 'Eggplant', 'Tomatoes (small amounts)', 'Yellow Squash', 'Pattypan Squash',
      'Radicchio', 'Frisee', 'Mache', 'Watercress', 'Purslane', 'Miner\'s Lettuce',
      'Lamb\'s Quarters', 'Amaranth Leaves', 'Malabar Spinach', 'New Zealand Spinach'
    ],
    fats: [
      'Coconut Oil', 'Olive Oil', 'Salmon Oil', 'Flaxseed (ground)', 'Hemp Seeds',
      'Eggshells (crushed)', 'Kelp Powder', 'Turmeric', 'Fish Oil', 'Avocado Oil',
      'Sunflower Oil', 'Sesame Oil', 'Pumpkin Seed Oil', 'Walnut Oil', 'Almond Oil',
      'Cod Liver Oil', 'Herring Oil', 'Mackerel Oil', 'Sardine Oil', 'Anchovy Oil',
      'Evening Primrose Oil', 'Borage Oil', 'Black Currant Oil', 'Chia Seed Oil'
    ]
  },
  cats: {
    proteins: [
      'Ground Chicken', 'Ground Turkey', 'Ground Beef (lean)', 'Chicken Thighs (boneless)',
      'Turkey Thighs', 'Salmon Fillet', 'Tuna (canned in water)', 'Chicken Liver',
      'Turkey Liver', 'Sardines (in water)', 'Eggs', 'Ground Duck', 'Rabbit Meat',
      'Venison', 'Quail', 'Ground Lamb (lean)', 'Turkey Giblets', 'Chicken Giblets',
      'Ground Venison', 'Ground Rabbit', 'Duck Liver', 'Quail Meat', 'Ground Quail',
      'Turkey Necks', 'Chicken Necks', 'Duck Hearts', 'Turkey Hearts', 'Mackerel (canned)',
      'Herring (canned)', 'Anchovies (canned)', 'Ground Mackerel', 'Ground Herring',
      'Lamb Liver', 'Beef Liver (small amounts)', 'Ground Pork (lean, small amounts)',
      'Turkey Sausage (no additives)', 'Chicken Sausage (no additives)'
    ],
    carbs: [
      'Pumpkin Puree (small amounts)', 'Brown Rice (occasional)', 'Oatmeal (cooked, small amounts)',
      'Sweet Potato (cooked, minimal)', 'Quinoa (tiny amounts)', 'Barley (cooked, minimal)',
      'Butternut Squash (mashed, minimal)', 'Acorn Squash (mashed, minimal)', 'Canned Pumpkin (plain)',
      'Oat Bran (small amounts)', 'Rice Bran (small amounts)', 'Millet (tiny amounts)',
      'Amaranth (tiny amounts)', 'Buckwheat (tiny amounts)', 'Lentils (mashed, tiny amounts)',
      'Chickpeas (mashed, tiny amounts)', 'Green Peas (mashed)', 'Split Peas (mashed)',
      'Black Beans (mashed, tiny amounts)', 'Kidney Beans (mashed, tiny amounts)'
    ],
    vegetables: [
      'Carrots (grated)', 'Peas (mashed)', 'Zucchini (grated)', 'Spinach (cooked)',
      'Broccoli (tiny amounts)', 'Green Beans (cooked)', 'Asparagus (tips only)',
      'Celery (small amounts)', 'Parsley (fresh)', 'Cucumber (peeled)', 'Lettuce (romaine, small amounts)',
      'Kale (cooked, tiny amounts)', 'Collard Greens (cooked, tiny amounts)', 'Mustard Greens (cooked, tiny amounts)',
      'Dandelion Greens (fresh, small amounts)', 'Endive (small amounts)', 'Arugula (small amounts)',
      'Bok Choi (small amounts)', 'Napa Cabbage (small amounts)', 'Green Beans (mashed)',
      'Snow Peas (mashed)', 'Sugar Snap Peas (mashed)', 'Fennel (small amounts)',
      'Swiss Chard (cooked, tiny amounts)', 'Beet Greens (cooked, tiny amounts)', 'Turnip Greens (cooked, tiny amounts)',
      'Radish Greens (cooked, tiny amounts)', 'Watercress (small amounts)', 'Purslane (small amounts)',
      'Cat Grass (wheatgrass)', 'Barley Grass', 'Alfalfa Sprouts (small amounts)'
    ],
    fats: [
      'Salmon Oil', 'Fish Oil', 'Cod Liver Oil', 'Herring Oil', 'Sardine Oil',
      'Mackerel Oil', 'Anchovy Oil', 'Krill Oil', 'Algae Oil (DHA)', 'Evening Primrose Oil',
      'Borage Oil', 'Black Currant Oil', 'Chia Seed Oil', 'Hemp Seed Oil', 'Flaxseed Oil',
      'Coconut Oil', 'Olive Oil (small amounts)', 'Avocado Oil (tiny amounts)', 'Wheat Germ Oil'
    ],
    fiber_supplements: [
      'Hairball Control Paste', 'Psyllium Husk', 'Probiotic Powder', 'Digestive Enzymes',
      'Brewer\'s Yeast', 'Spirulina Powder', 'Kelp Powder', 'Wheat Germ', 'Oat Bran',
      'Rice Bran', 'Inulin (prebiotic)', 'Fructooligosaccharides (FOS)', 'Mannanoligosaccharides (MOS)',
      'Beta-glucans', 'Pectin (from apples)', 'Chicory Root', 'Jerusalem Artichoke'
    ],
    supplements: [
      'Taurine Powder', 'L-Carnitine Powder', 'Lysine Powder', 'Vitamin E Oil',
      'Vitamin C (small amounts)', 'Vitamin B Complex', 'Niacinamide', 'Biotin',
      'Egg Yolks', 'Eggshells (crushed)', 'Chicken Broth (no salt)', 'Turkey Broth (no salt)',
      'Fish Broth (no salt)', 'Bone Broth (low sodium)', 'Cranberry Extract', 'D-Mannose',
      'Ursodeoxycholic Acid (UDCA)', 'S-Adenosyl methionine (SAM-e)', 'Milk Thistle',
      'Curcumin (turmeric extract)', 'Quercetin', 'Omega-3 Capsules', 'Joint Health Supplement',
      'Glucosamine Sulfate', 'Chondroitin Sulfate', 'MSM (methylsulfonylmethane)', 'Hyaluronic Acid'
    ]
  },
  birds: {
    seeds: [
      'Millet (white/red)', 'Canary Seed', 'Niger Seed', 'Oat Groats', 'Hemp Seeds',
      'Flaxseeds', 'Sesame Seeds', 'Chia Seeds', 'Quinoa (cooked)', 'Rapeseed',
      'Sunflower Seeds (small amounts)', 'Pumpkin Seeds', 'Safflower Seeds', 'Nyjer Seeds',
      'Amaranth Seeds', 'Buckwheat (hulled)', 'Barley (hulled)', 'Wheat (hulled)',
      'Rice (hulled)', 'Corn (cracked)', 'Poppy Seeds', 'Teff Seeds', 'Wild Bird Mix'
    ],
    nuts: [
      'Walnuts (in shell)', 'Almonds', 'Brazil Nuts', 'Pecans', 'Macadamia Nuts', 
      'Hazelnuts', 'Pine Nuts', 'Cashews', 'Pistachios', 'Peanuts (unsalted, roasted)'
    ],
    vegetables: [
      'Carrots (grated)', 'Broccoli', 'Spinach', 'Kale', 'Bell Peppers', 'Zucchini',
      'Sweet Potato (cooked)', 'Peas', 'Corn (fresh)', 'Lettuce (romaine)', 'Endive',
      'Escarole', 'Arugula', 'Dandelion Greens', 'Collard Greens', 'Mustard Greens',
      'Turnip Greens', 'Beet Greens', 'Swiss Chard', 'Bok Choi', 'Napa Cabbage',
      'Cauliflower', 'Romanesco Broccoli', 'Snow Peas', 'Sugar Snap Peas', 'Asparagus',
      'Celery', 'Fennel', 'Parsley', 'Cilantro', 'Basil', 'Mint', 'Thyme'
    ],
    fruits: [
      'Apples (no seeds)', 'Blueberries', 'Strawberries', 'Mango', 'Banana',
      'Grapes (chopped)', 'Papaya', 'Melon', 'Pineapple (small amounts)', 'Kiwi',
      'Raspberries', 'Blackberries', 'Cranberries', 'Cherries (pitted)', 'Pears (no seeds)',
      'Peaches (pitted)', 'Plums (pitted)', 'Apricots (pitted)', 'Figs', 'Dates (pitted)',
      'Raisins (unsweetened)', 'Currants', 'Goji Berries', 'Mulberries'
    ],
    supplements: [
      'Egg (hard-boiled)', 'Pellets (fortified)', 'Cuttlebone', 'Honey (tiny amounts)',
      'Peanut Butter (unsalted, tiny amounts)', 'Brewer\'s Yeast', 'Spirulina Powder',
      'Kelp Powder', 'Probiotic Powder', 'Vitamin D3 Drops', 'Calcium Supplement',
      'Electrolyte Powder', 'Amino Acid Supplement', 'Omega-3 Oil', 'Joint Health Powder'
    ]
  },
  reptiles: {
    insects: [
      'Dubia Roaches', 'Crickets', 'Mealworms', 'Superworms', 'Black Soldier Fly Larvae', 'Hornworms',
      'Silkworms', 'Waxworms', 'Butterworms', 'Phoenix Worms', 'Earthworms', 'Grasshoppers',
      'Locusts', 'Mantids', 'Fruit Flies', 'Pinhead Crickets', 'Small Dubia Roaches'
    ],
    whole_prey: [
      'Pinkie Mice (frozen/thawed)', 'Fuzzy Mice', 'Hopper Mice', 'Adult Mice',
      'Rat Pups', 'Adult Rats', 'Day-Old Chicks', 'Quail', 'Feeder Fish (Guppies)', 'Silversides'
    ],
    vegetables: [
      'Collard Greens', 'Mustard Greens', 'Turnip Greens', 'Dandelion Greens', 'Butternut Squash',
      'Bell Peppers', 'Carrots (grated)', 'Zucchini', 'Green Beans', 'Snap Peas',
      'Acorn Squash', 'Endive', 'Escarole', 'Arugula', 'Kale', 'Swiss Chard', 'Bok Choi',
      'Napa Cabbage', 'Romaine Lettuce', 'Iceberg Lettuce', 'Red Leaf Lettuce', 'Butter Lettuce',
      'Cauliflower', 'Broccoli', 'Romanesco Broccoli', 'Asparagus', 'Celery', 'Fennel',
      'Parsley', 'Cilantro', 'Basil', 'Mint', 'Thyme', 'Oregano', 'Sage', 'Rosemary',
      'Sweet Potato (cooked)', 'Pumpkin (cooked)', 'Squash (various)', 'Cucumber', 'Eggplant'
    ],
    fruits: [
      'Blueberries', 'Mango', 'Papaya', 'Strawberries', 'Figs', 'Apples (no seeds)',
      'Pears (no seeds)', 'Bananas', 'Melon', 'Cantaloupe', 'Honeydew', 'Watermelon',
      'Pineapple', 'Kiwi', 'Raspberries', 'Blackberries', 'Cranberries', 'Cherries (pitted)',
      'Peaches (pitted)', 'Plums (pitted)', 'Apricots (pitted)', 'Grapes (seedless)',
      'Raisins (unsweetened)', 'Dates (pitted)', 'Prunes', 'Goji Berries', 'Mulberries'
    ]
  },
  'pocket-pets': {
    hay: [
      'Timothy Hay', 'Meadow Hay', 'Orchard Grass Hay', 'Alfalfa Hay (babies/pregnant only)',
      'Bermuda Hay', 'Bluegrass Hay', 'Fescue Hay', 'Ryegrass Hay', 'Wheat Hay',
      'Oat Hay', 'Barley Hay', 'Straw (wheat/pine)', 'Dried Grass'
    ],
    vegetables: [
      'Romaine Lettuce', 'Bell Peppers (high vitamin C)', 'Carrots', 'Cucumber', 'Zucchini',
      'Celery', 'Parsley', 'Cilantro', 'Kale (limited)', 'Spinach (limited)', 'Broccoli',
      'Arugula', 'Endive', 'Basil', 'Mint', 'Collard Greens', 'Mustard Greens', 'Turnip Greens',
      'Dandelion Greens', 'Swiss Chard', 'Bok Choi', 'Napa Cabbage', 'Red Cabbage',
      'Green Cabbage', 'Cauliflower', 'Asparagus', 'Fennel', 'Leeks', 'Shallots',
      'Garlic Chives', 'Radicchio', 'Frisee', 'Mache', 'Watercress', 'Purslane',
      'Miner\'s Lettuce', 'Lamb\'s Quarters', 'Amaranth Leaves', 'Malabar Spinach',
      'New Zealand Spinach', 'Sweet Potato (cooked)', 'Pumpkin (cooked)', 'Squash (cooked)'
    ],
    pellets: [
      'Guinea Pig Pellets (with vitamin C)', 'Rabbit Pellets (high fiber)', 'Hamster Pellets (higher protein)',
      'Gerbil Pellets', 'Mouse/Rat Pellets', 'Chinchilla Pellets', 'Degus Pellets',
      'Fortified Pellets (vitamin C)', 'Timothy-Based Pellets', 'Alfalfa-Based Pellets'
    ],
    fruits: [
      'Apples (no seeds)', 'Strawberries', 'Blueberries', 'Banana', 'Melon', 'Grapes', 'Papaya',
      'Pears (no seeds)', 'Peaches (pitted)', 'Plums (pitted)', 'Apricots (pitted)', 'Cherries (pitted)',
      'Raspberries', 'Blackberries', 'Cranberries', 'Kiwi', 'Pineapple (small amounts)',
      'Mango (small amounts)', 'Papaya (small amounts)', 'Figs', 'Dates (pitted)', 'Raisins (unsweetened)',
      'Goji Berries', 'Mulberries', 'Currants', 'Elderberries'
    ],
    hamster_additions: [
      'Mealworms (freeze-dried)', 'Eggs (hard-boiled, tiny amounts)', 'Whole Grain Cheerios',
      'Sunflower Seeds (unsalted)', 'Pumpkin Seeds (unsalted)', 'Flaxseeds', 'Chia Seeds',
      'Hemp Seeds', 'Sesame Seeds', 'Popcorn (plain)', 'Whole Wheat Pasta (cooked)',
      'Brown Rice (cooked)', 'Quinoa (cooked)', 'Amaranth (cooked)', 'Buckwheat (cooked)',
      'Millet (cooked)', 'Barley (cooked)', 'Oats (cooked)', 'Corn (cooked)', 'Peas (cooked)'
    ],
    sugar_glider_special: [
      'Nectar Mix (commercial)', 'Gum Arabic', 'Eucalyptus Leaves', 'Acacia Gum', 
      'Bee Pollen', 'Manuka Honey', 'Calcium Carbonate (Glider-safe)'
    ]
  }
};

/**
 * Get all ingredients for a specific species
 * Now includes generated ingredients from scraped data
 */
export function getIngredientsForSpecies(species: string): string[] {
  const speciesData = ALL_INGREDIENTS[species as keyof AllIngredients];
  const all: string[] = [];
  
  // Add from manual ALL_INGREDIENTS
  if (speciesData) {
    Object.values(speciesData).forEach(category => {
      if (Array.isArray(category)) {
        all.push(...category);
      }
    });
  }
  
  // Add from generated ingredients based on subtype tags
  const normalizedSpecies = species === 'dog' ? 'dog' : 
                           species === 'cat' ? 'cat' :
                           species === 'bird' || species === 'birds' ? 'bird' :
                           species === 'reptile' || species === 'reptiles' ? 'reptile' :
                           species === 'pocket-pet' || species === 'pocket-pets' ? 'pocket-pet' : species;
  
  // Map species to potential subtypes
  const possibleSubtypes: string[] = [];
  if (normalizedSpecies === 'bird') {
    possibleSubtypes.push('bird_small', 'bird_large');
  } else if (normalizedSpecies === 'reptile') {
    possibleSubtypes.push('reptile_herbivore', 'reptile_insectivore', 'reptile_omnivore', 'reptile_carnivore');
  } else if (normalizedSpecies === 'pocket-pet') {
    possibleSubtypes.push('pocket_hay', 'pocket_varied', 'pocket_carnivore', 'pocket_insectivore');
    // For pocket pets (herbivores/omnivores like hamsters, guinea pigs, rabbits),
    // avoid auto-adding generated ingredients that may include meats (e.g., rabbit).
    // Return only the curated list above.
    return [...new Set(all)];
  }
  
  // Add generated ingredients that match any of the possible subtypes
  GENERATED_INGREDIENTS.forEach(ing => {
    if (possibleSubtypes.length === 0 || possibleSubtypes.some(subtype => ing.subtypeTags.includes(subtype))) {
      all.push(ing.name);
    }
  });
  
  return [...new Set(all)]; // Remove duplicates
}

/**
 * Map ingredient name to ingredient composition key
 */
export function mapIngredientToCompositionKey(ingredientName: string): string | null {
  const normalized = ingredientName
    .toLowerCase()
    .trim()
    .replace(/\s*\([^)]*\)/g, '') // Remove parentheses
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
  
  // Import composition keys dynamically
  const { INGREDIENT_COMPOSITIONS } = require('@/lib/data/ingredientCompositions');
  
  // Direct lookup
  if (INGREDIENT_COMPOSITIONS[normalized]) {
    return normalized;
  }
  
  // Common mappings (only for variants/aliases, not fallbacks)
  const mappings: Record<string, string> = {
    'chicken_breast': 'chicken_breast',
    'chicken_liver': 'chicken_liver',
    'chicken_hearts': 'chicken_hearts',
    'beef_liver': 'beef_liver',
    'ground_beef': 'ground_beef_lean',
    'ground_turkey': 'ground_turkey',
    'ground_chicken': 'ground_chicken', // Now has its own entry
    'turkey_breast': 'turkey_breast',
    'salmon': 'salmon_atlantic',
    'tuna': 'tuna_water',
    'sardines': 'sardines_water',
    'white_rice': 'white_rice_cooked', // Now has its own entry
    'brown_rice': 'brown_rice_cooked',
    'quinoa': 'quinoa_cooked',
    'sweet_potato': 'sweet_potato',
    'pumpkin': 'pumpkin', // Now has its own entry
    'carrots': 'carrots_raw',
    'green_beans': 'green_beans_raw', // Now has its own entry
    'bok_choy': 'bok_choy', // Key uses standard spelling, but display is "Bok Choi"
    'bok_choi': 'bok_choy', // User prefers "bok choi" spelling
    'broccoli': 'broccoli_raw',
    'spinach': 'spinach_raw',
    'kale': 'kale_raw',
    'celery': 'celery_raw',
    'blueberries': 'blueberries_raw',
    'bananas': 'bananas_raw',
    'eggs': 'eggs_whole',
    'fish_oil': 'fish_oil',
    'salmon_oil': 'fish_oil', // Similar enough to use fish_oil
    'herring_oil': 'fish_oil', // Similar enough to use fish_oil
    'mackerel_oil': 'fish_oil', // Similar enough to use fish_oil
    'sardine_oil': 'fish_oil', // Similar enough to use fish_oil
    'cod_liver_oil': 'fish_oil', // Similar enough to use fish_oil
    'olive_oil': 'fish_oil', // Different but acceptable fallback
    'coconut_oil': 'fish_oil', // Different but acceptable fallback
    'avocado_oil': 'fish_oil', // Different but acceptable fallback
    'sunflower_oil': 'fish_oil', // Different but acceptable fallback
    'sesame_oil': 'fish_oil', // Different but acceptable fallback
    'oats': 'oats',
    'taurine': 'taurine_powder',
    'calcium': 'calcium_carbonate',
  };
  
  if (mappings[normalized]) {
    return mappings[normalized];
  }
  
  // Try partial matches
  for (const key in INGREDIENT_COMPOSITIONS) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return key;
    }
  }
  
  return null;
}

/**
 * Get all available ingredients for recipe builder (all species combined)
 */
export function getAllAvailableIngredients(): string[] {
  const all = new Set<string>();
  
  Object.keys(ALL_INGREDIENTS).forEach(species => {
    getIngredientsForSpecies(species).forEach(ing => all.add(ing));
  });
  
  return Array.from(all).sort();
}

/**
 * Get display name for an ingredient composition key
 * Maps back to the original scraped ingredient name if available
 */
export function getIngredientDisplayName(compositionKey: string, species?: string): string {
  // If we have a species, try to find the original name from scraped data
  if (species) {
    const speciesData = ALL_INGREDIENTS[species as keyof AllIngredients];
    if (speciesData) {
      // Search through all categories for this species
      for (const category of Object.values(speciesData)) {
        if (Array.isArray(category)) {
          for (const ingName of category) {
            const mappedKey = mapIngredientToCompositionKey(ingName);
            if (mappedKey === compositionKey) {
              return ingName; // Return the original scraped name
            }
          }
        }
      }
    }
  }
  
  // Fallback: convert composition key to readable name
  return compositionKey
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}