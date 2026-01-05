import { ensureSellerId } from '@/lib/utils/affiliateLinks';
import { INGREDIENTS } from '@/lib/data/ingredients';
import type { IngredientPricingCandidate } from './types';
import { computeUnitPriceUsdPerGram, parseWeightToGrams } from './units';

const MIN_PACKAGE_SIZES_GRAMS: Record<string, number> = {
  oil: 226.8, // 8 fl oz (~8 oz)
  supplement: 113.4, // 4 oz
  herb: 28.35, // 1 oz
  spice: 28.35, // 1 oz
  produce: 453.6, // 1 lb
  meat: 226.8, // 8 oz
  protein: 226.8, // 8 oz
  hay: 453.6, // 1 lb
  pellet: 453.6, // 1 lb
  seed: 113.4, // 4 oz
  default: 113.4, // 4 oz fallback
};

function normalizeCategory(category: string): string {
  const c = String(category || '').toLowerCase().trim();
  const categoryMap: Record<string, string> = {
    oil: 'oil',
    fat: 'oil',
    supplement: 'supplement',
    vitamin: 'supplement',
    mineral: 'supplement',
    herb: 'herb',
    spice: 'spice',
    vegetable: 'produce',
    fruit: 'produce',
    protein: 'meat',
    meat: 'meat',
    carb: 'produce',
    grain: 'produce',
    hay: 'hay',
    pellet: 'pellet',
    seed: 'seed',
    nut: 'seed',
    insect: 'protein',
  };

  return categoryMap[c] || 'default';
}

function getCategoryForIngredient(ingredientKey: string): string {
  const key = String(ingredientKey || '').toLowerCase().trim();
  if (!key) return 'default';

  const ingredient = (INGREDIENTS as any)[key];
  if (ingredient?.category) return normalizeCategory(String(ingredient.category));

  if (key.includes('_oil') || key.endsWith('oil') || key.includes('omega')) return 'oil';
  if (key.includes('powder') || key.includes('supplement')) return 'supplement';
  if (key.includes('herb') || key.includes('spice')) return 'herb';
  if (key.includes('hay')) return 'hay';
  if (key.includes('pellet')) return 'pellet';
  if (key.includes('seed')) return 'seed';
  if (key.includes('meat') || key.includes('liver') || key.includes('heart') || key.includes('breast')) return 'meat';

  return 'default';
}

function filterByMinimumSize(candidates: IngredientPricingCandidate[], ingredientKey: string): IngredientPricingCandidate[] {
  const category = getCategoryForIngredient(ingredientKey);
  const minGrams = MIN_PACKAGE_SIZES_GRAMS[category] || MIN_PACKAGE_SIZES_GRAMS.default;

  const filtered = candidates.filter((candidate) => {
    const grams = parseWeightToGrams(candidate.title, category);
    return grams >= minGrams;
  });

  return filtered.length > 0 ? filtered : candidates;
}

export function candidateFromAmazon(params: {
  asin: string;
  title: string;
  url: string;
  priceUsd: number;
}): IngredientPricingCandidate | null {
  const weightGrams = parseWeightToGrams(params.title);
  const unitPriceUsdPerGram = computeUnitPriceUsdPerGram(params.priceUsd, weightGrams);
  if (!params.asin || !params.title || !params.url) return null;
  if (!Number.isFinite(params.priceUsd) || params.priceUsd <= 0) return null;
  if (!Number.isFinite(weightGrams) || weightGrams <= 0) return null;
  if (!Number.isFinite(unitPriceUsdPerGram) || unitPriceUsdPerGram <= 0) return null;

  return {
    asin: params.asin,
    title: params.title,
    url: ensureSellerId(params.url),
    priceUsd: params.priceUsd,
    weightGrams,
    unitPriceUsdPerGram,
  };
}

export function chooseCheapestPerGram(
  candidates: IngredientPricingCandidate[],
  _opts?: { ingredientKey?: string }
): IngredientPricingCandidate | null {
  const filtered = candidates.filter(
    (c) =>
      c &&
      Number.isFinite(c.unitPriceUsdPerGram) &&
      c.unitPriceUsdPerGram > 0 &&
      Number.isFinite(c.priceUsd) &&
      c.priceUsd > 0 &&
      Number.isFinite(c.weightGrams) &&
      c.weightGrams > 0
  );

  if (filtered.length === 0) return null;
  return filtered.sort((a, b) => a.unitPriceUsdPerGram - b.unitPriceUsdPerGram)[0];
}

export function chooseBestCandidate(
  candidates: IngredientPricingCandidate[],
  ingredientKey: string
): IngredientPricingCandidate | null {
  if (!candidates || candidates.length === 0) return null;
  const filtered = filterByMinimumSize(candidates, ingredientKey);
  return chooseCheapestPerGram(filtered);
}
