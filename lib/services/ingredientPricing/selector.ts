import { ensureSellerId } from '@/lib/utils/affiliateLinks';
import type { IngredientPricingCandidate } from './types';
import { computeUnitPriceUsdPerGram, parseWeightToGramsFromText } from './units';

export function candidateFromAmazon(params: {
  asin: string;
  title: string;
  url: string;
  priceUsd: number;
}): IngredientPricingCandidate | null {
  const weightGrams = parseWeightToGramsFromText(params.title);
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

export function chooseCheapestPerGram(candidates: IngredientPricingCandidate[]): IngredientPricingCandidate | null {
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
