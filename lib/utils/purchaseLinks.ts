import { ensureSellerId, isValidAmazonUrl } from '@/lib/utils/affiliateLinks';
import { getProductUrl } from '@/lib/data/product-prices';

export function buildAmazonSearchUrl(query: string): string {
  const q = String(query || '')
    .toLowerCase()
    .replace(/freeze[- ]dried/gi, '')
    .replace(/fresh is best/gi, '')
    .replace(/organic/gi, '')
    .replace(/premium/gi, '')
    .replace(/human[- ]grade/gi, '')
    .replace(/cooked/gi, '')
    .replace(/raw/gi, '')
    .replace(/diced/gi, '')
    .replace(/chopped/gi, '')
    .replace(/minced/gi, '')
    .replace(/boneless/gi, 'boneless')
    .replace(/skinless/gi, 'skinless')
    .replace(/\s+/g, ' ')
    .trim();
  if (!q) return '';
  return `https://www.amazon.com/s?k=${encodeURIComponent(q)}`;
}

export function getIngredientPurchaseUrl(
  ingredientName: string,
  existingUrl?: string | null,
  species?: string
): string {
  const baseName = String(ingredientName || '').trim();

  const searchUrl = buildAmazonSearchUrl(baseName);
  if (searchUrl) return ensureSellerId(searchUrl);

  const pricedUrl = getProductUrl(baseName);
  if (pricedUrl) return ensureSellerId(pricedUrl);

  const candidate = String(existingUrl || '').trim();
  if (candidate && isValidAmazonUrl(candidate)) return ensureSellerId(candidate);

  return '';
}
