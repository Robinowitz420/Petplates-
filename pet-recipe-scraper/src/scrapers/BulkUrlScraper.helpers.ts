/**
 * EXOTIC PET RECIPE DETECTION HELPERS
 * Detects measured lists, chop formulas, ratio patterns, and diet plans
 * Not just structured recipes with instructions
 */

import * as cheerio from 'cheerio';
import type { Species } from '../types';
import type { RecipeIngredient } from '../types';

/**
 * Species confirmation gate: check if page mentions the target species
 */
export function hasSpeciesContext(pageText: string, species: Species[]): boolean {
  const speciesKeywords: Record<string, string[]> = {
    'cats': ['cat', 'feline', 'kitten'],
    'dogs': ['dog', 'canine', 'puppy'],
    'birds': ['bird', 'parrot', 'budgie', 'cockatiel', 'parakeet', 'macaw', 'cockatoo', 'conure', 'lovebird', 'african grey', 'canary', 'finch', 'vogel', 'oiseau', 'pájaro'],
    'reptiles': ['reptile', 'bearded dragon', 'bartagame', 'pogona', 'dragón barbudo', 'leopard gecko', 'gecko', 'iguana', 'chameleon', 'turtle', 'tortoise', 'schildkröte', 'tortue'],
    'pocket-pets': ['hamster', 'gerbil', 'rat', 'mouse', 'guinea pig', 'rabbit', 'chinchilla', 'ferret', 'sugar glider', 'hedgehog', 'meerschweinchen', 'kaninchen', 'lapin']
  };

  for (const sp of species) {
    const keywords = speciesKeywords[sp] || [];
    if (keywords.some(kw => pageText.includes(kw))) {
      return true;
    }
  }

  return false;
}

/**
 * Detect if page has measurements (numbers + units or fractions)
 */
export function hasMeasurements(text: string): boolean {
  const measurementPatterns = [
    /\d+\/\d+/,                    // Fractions: 1/2, 3/4
    /\d+\s*-\s*\d+/,               // Ranges: 1-2, 5-10
    /\d+\s*(tbsp|tsp|cup|oz|g|kg|ml|l|gram|ounce|pound|lb)/i, // Units
    /\d+\s*%/,                     // Percentages: 40%
    /\d+\s*(part|ratio|portion)/i, // Ratios: 2 parts, 1:2 ratio
  ];

  return measurementPatterns.some(pattern => pattern.test(text));
}

/**
 * Detect ratio patterns (chop formulas, mix ratios)
 */
export function hasRatioPattern(text: string): boolean {
  const ratioPatterns = [
    /\d+%\s+\w+/,                  // "40% vegetables"
    /\d+\s*:\s*\d+/,               // "2:1 ratio"
    /(chop|mix|batch|formula|recipe).*\d+/i, // "chop: 40% veg..."
    /\d+\s+parts?\s+\w+/i,         // "2 parts grain"
  ];

  return ratioPatterns.some(pattern => pattern.test(text));
}

/**
 * Extract measured items from paragraphs (for chop/mix formulas)
 */
export function extractMeasuredItems($: cheerio.CheerioAPI): RecipeIngredient[] {
  const ingredients: RecipeIngredient[] = [];
  const measurementRegex = /([\d\/\.\s]+)\s*(tbsp|tsp|cup|cups|oz|g|kg|ml|l|gram|grams|%|part|parts)?\s+([a-zA-Z\s]+)/gi;

  $('p, li').each((_, el) => {
    const text = $(el).text();
    let match;
    
    while ((match = measurementRegex.exec(text)) !== null) {
      const amount = match[1]?.trim();
      const unit = match[2]?.trim();
      const name = match[3]?.trim();

      if (name && name.length > 2 && name.length < 50) {
        // Filter out common non-food words
        const nonFoodWords = ['the', 'and', 'or', 'of', 'to', 'in', 'for', 'with', 'this', 'that', 'your', 'their'];
        if (!nonFoodWords.includes(name.toLowerCase())) {
          ingredients.push({ name, amount, unit });
        }
      }
    }
  });

  return ingredients.slice(0, 20); // Limit to prevent junk
}

/**
 * Extract ingredients from ratio patterns (e.g., "40% vegetables, 30% grains")
 */
export function extractRatioIngredients($: cheerio.CheerioAPI): RecipeIngredient[] {
  const ingredients: RecipeIngredient[] = [];
  const ratioRegex = /(\d+)\s*%\s+([a-zA-Z\s]+)/gi;

  $('p, li').each((_, el) => {
    const text = $(el).text();
    let match;
    
    while ((match = ratioRegex.exec(text)) !== null) {
      const amount = match[1];
      const name = match[2]?.trim();

      if (name && name.length > 2 && name.length < 50) {
        ingredients.push({ 
          name, 
          amount: amount,
          unit: '%'
        });
      }
    }
  });

  return ingredients.slice(0, 15);
}
