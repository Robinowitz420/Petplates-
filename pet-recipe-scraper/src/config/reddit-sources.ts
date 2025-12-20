/**
 * REDDIT SUBREDDIT CONFIGURATION
 * Organized by species with search terms for recipe discovery
 */

export interface RedditSubredditConfig {
  name: string;
  species: string[];
  searchTerms: string[];
}

export const REDDIT_SUBREDDITS: RedditSubredditConfig[] = [
  // ============================================================================
  // REPTILE SUBREDDITS
  // ============================================================================
  {
    name: 'reptiles',
    species: ['reptiles'],
    searchTerms: ['recipe', 'diet', 'feeding', 'food', 'meal', 'nutrition', 'homemade'],
  },
  {
    name: 'ballpython',
    species: ['reptiles'],
    searchTerms: ['diet', 'feeding schedule', 'food', 'nutrition', 'meal prep'],
  },
  {
    name: 'leopardgeckos',
    species: ['reptiles'],
    searchTerms: ['diet', 'feeding', 'food', 'insects', 'meal', 'nutrition'],
  },
  {
    name: 'crestedgecko',
    species: ['reptiles'],
    searchTerms: ['diet', 'feeding', 'food', 'meal', 'nutrition', 'recipe'],
  },
  {
    name: 'turtle',
    species: ['reptiles'],
    searchTerms: ['diet', 'feeding', 'food', 'vegetables', 'greens', 'nutrition', 'recipe'],
  },
  {
    name: 'tortoises',
    species: ['reptiles'],
    searchTerms: ['diet', 'feeding', 'food', 'greens', 'vegetables', 'safe plants', 'recipe'],
  },

  // ============================================================================
  // BIRD SUBREDDITS
  // ============================================================================
  {
    name: 'birding',
    species: ['birds'],
    searchTerms: ['feeding', 'food', 'diet', 'nutrition', 'recipe', 'homemade'],
  },
  {
    name: 'parrots',
    species: ['birds'],
    searchTerms: ['diet', 'feeding', 'food', 'chop', 'recipe', 'nutrition', 'meal prep'],
  },
  {
    name: 'avian',
    species: ['birds'],
    searchTerms: ['diet', 'feeding', 'food', 'nutrition', 'recipe', 'homemade'],
  },
  {
    name: 'birdcare',
    species: ['birds'],
    searchTerms: ['diet', 'feeding', 'food', 'nutrition', 'recipe', 'meal'],
  },
  {
    name: 'budgies',
    species: ['birds'],
    searchTerms: ['diet', 'feeding', 'food', 'nutrition', 'recipe', 'chop'],
  },

  // ============================================================================
  // POCKET PET SUBREDDITS
  // ============================================================================
  {
    name: 'pocketpets',
    species: ['pocket-pets'],
    searchTerms: ['diet', 'feeding', 'food', 'nutrition', 'recipe', 'homemade'],
  },
  {
    name: 'hamsters',
    species: ['pocket-pets'],
    searchTerms: ['diet', 'feeding', 'food', 'nutrition', 'recipe', 'mix'],
  },
  {
    name: 'guineapigs',
    species: ['pocket-pets'],
    searchTerms: ['diet', 'feeding', 'food', 'vegetables', 'vitamin c', 'nutrition', 'recipe'],
  },
  {
    name: 'rats',
    species: ['pocket-pets'],
    searchTerms: ['diet', 'feeding', 'food', 'nutrition', 'recipe', 'homemade', 'mix'],
  },
  {
    name: 'chinchilla',
    species: ['pocket-pets'],
    searchTerms: ['diet', 'feeding', 'food', 'hay', 'nutrition', 'recipe'],
  },
  {
    name: 'ferretcare',
    species: ['pocket-pets'],
    searchTerms: ['diet', 'feeding', 'food', 'raw', 'nutrition', 'recipe', 'meal prep'],
  },

  // ============================================================================
  // CAT & DOG FOOD SUBREDDITS
  // ============================================================================
  {
    name: 'catfood',
    species: ['cats'],
    searchTerms: ['homemade', 'recipe', 'diet', 'nutrition', 'meal', 'raw', 'cooked'],
  },
  {
    name: 'dogs',
    species: ['dogs'],
    searchTerms: ['homemade food', 'recipe', 'diet', 'nutrition', 'meal', 'cooking for dogs'],
  },
  {
    name: 'DogAdvice',
    species: ['dogs'],
    searchTerms: ['homemade diet', 'recipe', 'food', 'nutrition', 'meal', 'cooking'],
  },
  {
    name: 'rawpetfood',
    species: ['cats', 'dogs'],
    searchTerms: ['recipe', 'diet', 'meal prep', 'batch', 'nutrition', 'raw feeding'],
  },
  {
    name: 'RawFeeding',
    species: ['cats', 'dogs'],
    searchTerms: ['recipe', 'diet', 'meal prep', 'batch', 'nutrition', 'raw'],
  },

  // ============================================================================
  // MEAL PREP & BATCH FEEDING SUBREDDITS
  // ============================================================================
  {
    name: 'AnimalBased',
    species: ['cats', 'dogs'],
    searchTerms: ['pet food', 'recipe', 'meal prep', 'diet', 'nutrition', 'homemade'],
  },
  {
    name: 'MealPrepSunday',
    species: ['cats', 'dogs'],
    searchTerms: ['pet food', 'dog food', 'cat food', 'recipe', 'meal prep for pets'],
  },
];

export function getSubredditsBySpecies(species: string): RedditSubredditConfig[] {
  return REDDIT_SUBREDDITS.filter(sub => sub.species.includes(species));
}

export function getAllSubreddits(): RedditSubredditConfig[] {
  return REDDIT_SUBREDDITS;
}
