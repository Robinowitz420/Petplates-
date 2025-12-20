import { ensureSellerId, isValidAmazonUrl } from '@/lib/utils/affiliateLinks';
import { getProductPriceUrl } from '@/lib/data/product-prices';

export function buildAmazonSearchUrl(query: string): string {
  const q = String(query || '').trim();
  if (!q) return '';
  return `https://www.amazon.com/s?k=${encodeURIComponent(q)}`;
}

export function getIngredientPurchaseUrl(
  ingredientName: string,
  existingUrl?: string | null,
  species?: string
): string {
  const baseName = String(ingredientName || '').trim();

  const pricedUrl = getProductPriceUrl(baseName);
  if (pricedUrl) return ensureSellerId(pricedUrl);

  const candidate = String(existingUrl || '').trim();
  if (candidate && isValidAmazonUrl(candidate)) return ensureSellerId(candidate);

  const searchUrl = buildAmazonSearchUrl(baseName);
  return searchUrl ? ensureSellerId(searchUrl) : '';
}
