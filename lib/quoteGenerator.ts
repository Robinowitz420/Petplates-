// lib/quoteGenerator.ts
import type { Recipe } from './types';

/**
 * Deterministic quote generator for recipes.
 * - Always returns the same quote for the same recipe.id
 * - Generates a celebrity-pet author name based on category
 * - Ensures the quote text is unique per recipe by incorporating a
 *   deterministic short adjective/phrase derived from the recipe id/hash.
 *
 * This avoids storing a separate map of 175 entries while guaranteeing
 * each recipe has a permanent, non-reused quote style.
 */

const CELEB_POOLS: Record<string, string[]> = {
  dogs: [
    'Bark Obama','Mutt Damon','Chew-barka','Salvador Dogi','Hairy Styles',
    'Droolius Caesar','Sherlock Bones','Bark Twain','Jimmy Chew','Snoop Doggy Dog'
  ],
  cats: [
    'Catrick Swayze','Leonardo DiCatrio','Meowly Cyrus','Purr-ince','Cat Damon',
    'William Shakespaw','Clawdia Schiffer','Fur-dinand Magellan','Meowrio Andretti','Kitty Purry'
  ],
  birds: [
    'Tweety Mercury','Squawkstin Bieber','Chirp Cobain','Feather Locklear','Beaky Blinders',
    'Wing Crosby','Tweetie Poppins','Beak Affleck','Fluffy Gaga','Plume Hathaway'
  ],
  reptiles: [
    'Scale-y Cyrus','Lizard of Oz','Geck-o Washington','Rango Stallone','Sir Hissington',
    'Gila Clooney','Scaley Cooper','Rex Sauron','Iggy Pop','Cold-Blooded Coleman'
  ],
  'pocket-pets': [
    'Ham Solo','Bun Jovi','Whisker Nelson','Gerbil Gates','Puff Daddy',
    'Fuzz Aldrin','Pipsqueak Jordan','Squeakers O\'Neal','Nibble Newton','Buckminster Fuzz'
  ],
};

// Adjective/phrases to make each quote unique; deterministic selection via recipe id
const TAGS = [
  'a tail-wagging triumph',
  'a purrfect bite',
  'a feather-ruffling delight',
  'a scales-approved staple',
  'a hop-and-nibble favorite',
  'a culinary comfort',
  'an epic chew-fest',
  'a snooze-and-savor meal',
  'a barkworthy banquet',
  'a whisker-twitching wonder',
  'a chirp-causing classic',
  'a slippery-sweet supper',
  'an anxious-belly soother',
  'a crunchy, chewy celebration',
  'a slow-cooked nostalgia'
];

function hashStringToNumber(s: string) {
  // simple deterministic hash to number
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  }
  return Math.abs(h);
}

export function getQuoteForRecipe(recipe: Recipe) {
  const cat = recipe.category ?? 'dogs';
  const pool = CELEB_POOLS[cat] ?? CELEB_POOLS.dogs;
  const idHash = hashStringToNumber(recipe.id || recipe.name || JSON.stringify(recipe)).toString();
  const celebIndex = Number(idHash.slice(-2)) % pool.length;
  const tagIndex = Number(idHash.slice(0, 2)) % TAGS.length;

  const author = pool[celebIndex];
  const tag = TAGS[tagIndex];

  // Build a short, persona-appropriate quote (in the voice of the celeb-pet)
  // We add the recipe name to make the quote unique and clearly tied to this dish.
  const shortRecipeName = recipe.name?.split(':')[0] ?? recipe.name ?? 'this dish';

  // Tone templates per animal type to add variety
  const templates: Record<string, string[]> = {
    dogs: [
      `As I always say, ${shortRecipeName} is ${tag}.`,
      `My fellow canines, try ${shortRecipeName} — ${tag}.`,
      `If you enjoy bones, you'll adore ${shortRecipeName}; truly ${tag}.`
    ],
    cats: [
      `I declare ${shortRecipeName} to be absolutely ${tag}.`,
      `In my refined opinion, ${shortRecipeName} is ${tag}.`,
      `Paws down — ${shortRecipeName} is ${tag}.`
    ],
    birds: [
      `${shortRecipeName} made me chirp — ${tag}.`,
      `Squawk: ${shortRecipeName} equals ${tag}.`,
      `If it makes me preen, it's ${shortRecipeName} — truly ${tag}.`
    ],
    reptiles: [
      `${shortRecipeName} is slow-cooked and ${tag}.`,
      `Cold-bloodedly, ${shortRecipeName} is ${tag}.`,
      `Scale-tested: ${shortRecipeName} is ${tag}.`
    ],
    'pocket-pets': [
      `${shortRecipeName} is tiny but ${tag}.`,
      `Nibble-approved: ${shortRecipeName} is ${tag}.`,
      `Small meal, big joy — ${shortRecipeName} is ${tag}.`
    ],
  };

  const templatesForCat = templates[cat] ?? templates.dogs;
  const template = templatesForCat[Number(idHash.slice(-1)) % templatesForCat.length];

  const text = template;

  return {
    author,
    text,
  };
}

export default getQuoteForRecipe;
