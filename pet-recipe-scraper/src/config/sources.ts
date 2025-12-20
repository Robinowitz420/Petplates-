/**
 * SOURCE REGISTRY
 * Comprehensive list of scraping targets organized by tier and species
 */

import { ScraperSource } from '../types';

export const SCRAPER_SOURCES: ScraperSource[] = [
  // ============================================================================
  // TIER 1: VETERINARY & ACADEMIC (Highest Authority)
  // ============================================================================
  {
    id: 'tufts-vet-nutrition',
    name: 'Tufts Veterinary Nutrition',
    baseUrl: 'https://vetnutrition.tufts.edu',
    tier: 'veterinary',
    species: ['cats', 'dogs'],
    active: true,
    respectRobotsTxt: true,
    rateLimit: 2000,
    selectors: {
      recipeList: 'article, .post',
      recipeTitle: 'h1, h2.entry-title',
      ingredients: '.ingredients, ul li',
      instructions: '.instructions, ol li',
      warnings: '.warning, .caution',
    },
  },
  {
    id: 'balance-it',
    name: 'BalanceIT',
    baseUrl: 'https://balanceit.com',
    tier: 'veterinary',
    species: ['cats', 'dogs'],
    active: true,
    respectRobotsTxt: true,
    rateLimit: 3000,
    selectors: {
      recipeList: '.recipe-card, article',
      recipeTitle: 'h1, h2',
      ingredients: '.ingredient-list li',
      nutritionTable: '.nutrition-facts table',
    },
  },
  {
    id: 'petdiets',
    name: 'PetDiets (Dr. Remillard)',
    baseUrl: 'https://petdiets.com',
    tier: 'veterinary',
    species: ['cats', 'dogs'],
    active: true,
    respectRobotsTxt: true,
    rateLimit: 2500,
    selectors: {
      recipeList: '.diet-plan, .recipe',
      recipeTitle: 'h2, h3',
      ingredients: '.ingredients li',
      nutritionTable: 'table.nutrition',
    },
  },

  // ============================================================================
  // TIER 2: SPECIALTY SOURCES (Species-Specific Experts)
  // ============================================================================
  
  // REPTILES
  {
    id: 'tortoise-table',
    name: 'The Tortoise Table',
    baseUrl: 'https://www.thetortoisetable.org.uk',
    tier: 'academic',
    species: ['reptiles'],
    active: true,
    respectRobotsTxt: true,
    rateLimit: 2000,
    startUrls: [
      'https://www.thetortoisetable.org.uk/plant-database/viewplants/a-z/',
      'https://www.thetortoisetable.org.uk/plant-database/how-to-use-the-database/'
    ],
    selectors: {
      recipeList: '.plant-list tr, table tr',
      recipeTitle: '.plant-name, td:first-child',
      ingredients: 'td',
      warnings: '.safety-status',
    },
  },
  {
    id: 'reptifiles',
    name: 'ReptiFiles',
    baseUrl: 'https://reptifiles.com',
    tier: 'academic',
    species: ['reptiles'],
    active: true,
    respectRobotsTxt: true,
    rateLimit: 2000,
    startUrls: [
      'https://reptifiles.com/bearded-dragon-care/bearded-dragon-diet-nutrition/',
      'https://reptifiles.com/blue-tongue-skink-care/blue-tongue-skink-diet-nutrition/',
      'https://reptifiles.com/leopard-gecko-care/leopard-gecko-diet-nutrition/'
    ],
    selectors: {
      recipeList: 'article, .care-guide, .diet-section',
      recipeTitle: 'h1, h2, h3',
      ingredients: '.food-list li, ul li',
      nutritionTable: 'table',
      warnings: '.warning, .caution',
    },
  },
  {
    id: 'tortoise-forum',
    name: 'TortoiseForum.org',
    baseUrl: 'https://www.tortoiseforum.org',
    tier: 'community',
    species: ['reptiles'],
    active: true,
    respectRobotsTxt: true,
    rateLimit: 3000,
    startUrls: [
      'https://www.tortoiseforum.org/forums/diet-and-nutrition.106/'
    ],
    selectors: {
      recipeList: '.thread-title, .post',
      recipeTitle: 'h1.thread-title, h3',
      ingredients: '.post-content ul li, .post-content ol li',
      nutritionTable: 'table',
    },
  },
  {
    id: 'moon-valley-reptiles',
    name: 'Moon Valley Reptiles',
    baseUrl: 'https://moonvalleyreptiles.com',
    tier: 'community',
    species: ['reptiles'],
    active: true,
    respectRobotsTxt: true,
    rateLimit: 2000,
    selectors: {
      recipeList: '.feeding-guide, article',
      nutritionTable: 'table.nutrition',
    },
  },

  // BIRDS
  {
    id: 'cockatiel-cottage',
    name: 'Cockatiel Cottage',
    baseUrl: 'https://www.cockatielcottage.net',
    tier: 'community',
    species: ['birds'],
    active: true,
    respectRobotsTxt: true,
    rateLimit: 2000,
    selectors: {
      recipeList: 'article, .food-guide',
      recipeTitle: 'h2, h3',
      ingredients: 'ul li, .safe-foods li',
      warnings: '.toxic-foods, .warning',
    },
  },
  {
    id: 'avian-avenue',
    name: 'Avian Avenue Forum',
    baseUrl: 'https://www.avianavenue.com',
    tier: 'community',
    species: ['birds'],
    active: true,
    respectRobotsTxt: true,
    rateLimit: 3000,
    startUrls: [
      'https://www.avianavenue.com/forums/feathered-food-court.17/'
    ],
    selectors: {
      recipeList: '.thread-title, .post',
      recipeTitle: 'h1.thread-title, h3',
      ingredients: '.post-content ul li, .post-content ol li',
      warnings: '.warning, .caution',
    },
  },
  {
    id: 'kiwis-bird-rescue',
    name: 'Kiwi\'s New Life Bird Rescue',
    baseUrl: 'https://www.kiwisbirds.com',
    tier: 'community',
    species: ['birds'],
    active: true,
    respectRobotsTxt: true,
    rateLimit: 2000,
    startUrls: [
      'https://www.kiwisbirds.com/chop-recipes'
    ],
    selectors: {
      recipeList: 'article, .recipe-card, .chop-recipe',
      recipeTitle: 'h1, h2, h3',
      ingredients: '.ingredients li, ul li',
      instructions: '.instructions li, ol li',
      warnings: '.warning, .note',
    },
  },

  // POCKET PETS
  {
    id: 'guinea-lynx',
    name: 'Guinea Lynx',
    baseUrl: 'https://www.guinealynx.info',
    tier: 'academic',
    species: ['pocket-pets'],
    active: true,
    respectRobotsTxt: true,
    rateLimit: 2000,
    selectors: {
      recipeList: 'table tr, .veggie-chart tr',
      ingredients: 'td',
      nutritionTable: 'table',
    },
  },
  {
    id: 'rabbit-house',
    name: 'Rabbit House Society',
    baseUrl: 'https://rabbit.org',
    tier: 'community',
    species: ['pocket-pets'],
    active: true,
    respectRobotsTxt: true,
    rateLimit: 2000,
    startUrls: [
      'https://rabbit.org/suggested-vegetables-and-fruits-for-a-rabbit-diet/'
    ],
    selectors: {
      recipeList: 'article, .diet-guide, table tr',
      recipeTitle: 'h2, h3',
      ingredients: 'ul li, td',
      nutritionTable: 'table',
      warnings: '.warning, .caution',
    },
  },
  {
    id: 'is-it-safe-for-my-rat',
    name: 'Is It Safe For My Rat',
    baseUrl: 'https://www.isafeformyrat.com',
    tier: 'community',
    species: ['pocket-pets'],
    active: true,
    respectRobotsTxt: true,
    rateLimit: 2000,
    selectors: {
      recipeList: 'article, .food-entry, table tr',
      recipeTitle: 'h1, h2, td:first-child',
      ingredients: 'td',
      nutritionTable: 'table',
      warnings: '.warning, .toxic, .caution',
    },
  },

  // ============================================================================
  // TIER 2.5: REFERENCE DATA (USDA & Nutrient Databases)
  // ============================================================================
  {
    id: 'usda-fooddata-central',
    name: 'USDA FoodData Central',
    baseUrl: 'https://fdc.nal.usda.gov',
    tier: 'academic',
    species: ['cats', 'dogs', 'birds', 'reptiles', 'pocket-pets'],
    active: true,
    respectRobotsTxt: true,
    rateLimit: 1000,
    selectors: {
      recipeList: '.food-result',
      recipeTitle: '.food-name',
      nutritionTable: 'table.nutrient-table, .nutrition-facts',
    },
  },

  // ============================================================================
  // TIER 3: BRAND SITES (Commercial but Detailed)
  // ============================================================================
  {
    id: 'oxbow-animal-health',
    name: 'Oxbow Animal Health',
    baseUrl: 'https://www.oxbowanimalhealth.com',
    tier: 'brand',
    species: ['pocket-pets', 'reptiles'],
    active: true,
    respectRobotsTxt: true,
    rateLimit: 2000,
    selectors: {
      recipeList: '.product, .feeding-guide',
      recipeTitle: 'h2.product-name',
      ingredients: '.ingredients-list li',
      nutritionTable: '.nutrition-facts table',
    },
  },
  {
    id: 'mazuri',
    name: 'Mazuri Exotic Nutrition',
    baseUrl: 'https://www.mazuri.com',
    tier: 'brand',
    species: ['reptiles', 'birds', 'pocket-pets'],
    active: true,
    respectRobotsTxt: true,
    rateLimit: 2000,
    selectors: {
      recipeList: '.product-card',
      recipeTitle: 'h3.product-title',
      ingredients: '.ingredient-list li',
      nutritionTable: 'table.guaranteed-analysis',
    },
  },
  {
    id: 'royal-canin',
    name: 'Royal Canin',
    baseUrl: 'https://www.royalcanin.com',
    tier: 'brand',
    species: ['cats', 'dogs'],
    active: true,
    respectRobotsTxt: true,
    rateLimit: 2000,
    selectors: {
      recipeList: '.product-card',
      recipeTitle: 'h2.product-name',
      ingredients: '.ingredients li',
      nutritionTable: '.nutritional-info table',
    },
  },
  {
    id: 'hills-pet',
    name: "Hill's Pet Nutrition",
    baseUrl: 'https://www.hillspet.com',
    tier: 'brand',
    species: ['cats', 'dogs'],
    active: true,
    respectRobotsTxt: true,
    rateLimit: 2000,
    selectors: {
      recipeList: '.product',
      recipeTitle: 'h1.product-title',
      ingredients: '.ingredients-list li',
      nutritionTable: 'table.nutrition',
    },
  },

  // ============================================================================
  // TIER 4: AGGREGATORS & RECIPE SITES
  // ============================================================================
  {
    id: 'allrecipes-pets',
    name: 'Allrecipes - Pet Food',
    baseUrl: 'https://www.allrecipes.com',
    tier: 'community',
    species: ['cats', 'dogs'],
    active: true,
    respectRobotsTxt: true,
    rateLimit: 2000,
    selectors: {
      recipeList: '.card--recipe',
      recipeTitle: 'h3.card__title',
      ingredients: '.ingredients-item',
      instructions: '.instructions-section li',
    },
  },
  {
    id: 'chewy-recipes',
    name: 'Chewy - Pet Recipes',
    baseUrl: 'https://be.chewy.com',
    tier: 'community',
    species: ['cats', 'dogs', 'birds', 'reptiles', 'pocket-pets'],
    active: true,
    respectRobotsTxt: true,
    rateLimit: 2000,
    selectors: {
      recipeList: 'article.recipe',
      recipeTitle: 'h1, h2',
      ingredients: '.ingredient-list li',
      instructions: '.directions li',
    },
  },

  // ============================================================================
  // TIER 5: FORUMS & COMMUNITY (Use with caution)
  // ============================================================================
  {
    id: 'reddit-rawpetfood',
    name: 'Reddit - r/rawpetfood',
    baseUrl: 'https://www.reddit.com/r/rawpetfood',
    tier: 'community',
    species: ['cats', 'dogs'],
    active: false, // Use Reddit API instead
    respectRobotsTxt: true,
    rateLimit: 5000,
    selectors: {
      recipeList: '.Post',
      recipeTitle: 'h3',
    },
  },
];

// Helper to get sources by species
export function getSourcesBySpecies(species: string): ScraperSource[] {
  return SCRAPER_SOURCES.filter(
    source => source.active && source.species.includes(species as any)
  );
}

// Helper to get sources by tier
export function getSourcesByTier(tier: string): ScraperSource[] {
  return SCRAPER_SOURCES.filter(
    source => source.active && source.tier === tier
  );
}
