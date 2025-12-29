const GRAMS_PER_POUND = 453.592;
const GRAMS_PER_OUNCE = 28.3495;

export function parseWeightToGramsFromText(text: string): number {
  if (!text) return 0;
  const t = String(text).toLowerCase();

  const lb = t.match(/(\d+(?:\.\d+)?)\s*(?:lb|lbs|pound|pounds)\b/);
  if (lb) return parseFloat(lb[1]) * GRAMS_PER_POUND;

  const oz = t.match(/(\d+(?:\.\d+)?)\s*(?:oz|ounce|ounces)\b/);
  if (oz) return parseFloat(oz[1]) * GRAMS_PER_OUNCE;

  const kg = t.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilogram|kilograms)\b/);
  if (kg) return parseFloat(kg[1]) * 1000;

  const g = t.match(/(\d+(?:\.\d+)?)\s*(?:g|gram|grams)\b/);
  if (g) return parseFloat(g[1]);

  return 0;
}

export function computeUnitPriceUsdPerGram(priceUsd: number, weightGrams: number): number {
  if (!Number.isFinite(priceUsd) || priceUsd <= 0) return 0;
  if (!Number.isFinite(weightGrams) || weightGrams <= 0) return 0;
  return priceUsd / weightGrams;
}
