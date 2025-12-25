// lib/data/product-prices.ts
// SINGLE SOURCE OF TRUTH for all product data

import PRODUCT_PRICES from '../../data/product-prices.json';
import { getAmazonBuyLink } from '@/lib/utils/getAmazonBuyLink';
import { getPackageSize } from '@/lib/data/packageSizes';

export interface ProductPrice {
  ingredient: string;
  asin: string;
  url: string;
  quantity?: string;
  productName?: string;
  brand?: string;
  qualityScore?: number;
  researchScore?: number;
  tier?: 'budget' | 'standard' | 'premium';
  notes?: string;
  price: {
    amount: number;
    currency: string;
    lastUpdated: string;
  };
}

const GRAMS_PER_POUND = 453.592;

type PriceOverride = {
  packagePrice: number;
  pricePerPound?: number;
  quantity?: string;
};

const PRICE_OVERRIDES: Record<string, PriceOverride> = {
  'barley (hulled)': { packagePrice: 2.0, pricePerPound: 2.0, quantity: '1 lb' },
  'barley (cooked, minimal)': { packagePrice: 2.0, pricePerPound: 2.0, quantity: '1 lb' },
  'barley': { packagePrice: 2.0, pricePerPound: 2.0, quantity: '1 lb' },
  'buckwheat (hulled)': { packagePrice: 3.0, pricePerPound: 3.0, quantity: '1 lb' },
  'buckwheat': { packagePrice: 3.0, pricePerPound: 3.0, quantity: '1 lb' },
  'buckwheat (tiny amounts)': { packagePrice: 3.0, pricePerPound: 3.0, quantity: '1 lb' },
  'oats (rolled)': { packagePrice: 2.5, pricePerPound: 2.5, quantity: '1 lb' },
  'bulgur': { packagePrice: 2.5, pricePerPound: 2.5, quantity: '1 lb' },
  'wild rice': { packagePrice: 6.5, pricePerPound: 6.5, quantity: '1 lb' },
  'corn (cracked)': { packagePrice: 0.75, pricePerPound: 0.75, quantity: '1 lb' },
  'millet': { packagePrice: 1.5, pricePerPound: 1.5, quantity: '1 lb' },
  'millet (tiny amounts)': { packagePrice: 1.5, pricePerPound: 1.5, quantity: '1 lb' },
  'quinoa': { packagePrice: 2.99, pricePerPound: 2.99, quantity: '1 lb' },
  'quinoa cooked': { packagePrice: 2.99, pricePerPound: 2.99, quantity: '1 lb' },
  'quinoa (cooked)': { packagePrice: 2.99, pricePerPound: 2.99, quantity: '1 lb' },
  'rapeseed': { packagePrice: 2.0, pricePerPound: 2.0, quantity: '1 lb' },
  'rapeseeds': { packagePrice: 2.0, pricePerPound: 2.0, quantity: '1 lb' },
  'canary seed': { packagePrice: 2.0, pricePerPound: 2.0, quantity: '1 lb' },
  'canary seeds': { packagePrice: 2.0, pricePerPound: 2.0, quantity: '1 lb' },
  'niger seed': { packagePrice: 2.0, pricePerPound: 2.0, quantity: '1 lb' },
  'niger seeds': { packagePrice: 2.0, pricePerPound: 2.0, quantity: '1 lb' },
  'nyjer seeds': { packagePrice: 3.0, pricePerPound: 3.0, quantity: '1 lb' },
  'nyjer seed': { packagePrice: 3.0, pricePerPound: 3.0, quantity: '1 lb' },

  'black beans': { packagePrice: 1.5, pricePerPound: 1.5, quantity: '1 lb' },
  'pinto beans': { packagePrice: 1.5, pricePerPound: 1.5, quantity: '1 lb' },
  'pinto beans (mashed)': { packagePrice: 1.5, pricePerPound: 1.5, quantity: '1 lb' },
  'split peas': { packagePrice: 1.5, pricePerPound: 1.5, quantity: '1 lb' },
  'split peas (mashed)': { packagePrice: 1.5, pricePerPound: 1.5, quantity: '1 lb' },
  'chickpeas': { packagePrice: 1.5, pricePerPound: 1.5, quantity: '1 lb' },
  'peas': { packagePrice: 2.5, pricePerPound: 2.5, quantity: '1 lb' },
  'peas (mashed)': { packagePrice: 2.5, pricePerPound: 2.5, quantity: '1 lb' },

  'celery': { packagePrice: 2.0, quantity: 'bunch' },
  'cilantro': { packagePrice: 1.5, quantity: 'bunch' },
  'sugar snap peas': { packagePrice: 4.0, pricePerPound: 4.0, quantity: '1 lb' },
  'sugar snap peas (mashed)': { packagePrice: 4.0, pricePerPound: 4.0, quantity: '1 lb' },
  'snow peas': { packagePrice: 4.0, pricePerPound: 4.0, quantity: '1 lb' },
  'snow peas (mashed)': { packagePrice: 4.0, pricePerPound: 4.0, quantity: '1 lb' },
  'purslane (small amounts)': { packagePrice: 3.0, quantity: 'bunch' },
  'malabar spinach': { packagePrice: 4.0, pricePerPound: 4.0, quantity: '1 lb' },
  'frisee': { packagePrice: 3.0, quantity: 'head' },
  'romanesco broccoli': { packagePrice: 3.0, pricePerPound: 3.0, quantity: '1 lb' },
  'amaranth leaves': { packagePrice: 3.0, quantity: 'bunch' },
  "miner's lettuce": { packagePrice: 4.0, quantity: 'bunch' },
  'jerusalem artichoke': { packagePrice: 4.0, pricePerPound: 4.0, quantity: '1 lb' },
  'chicory root': { packagePrice: 3.0, pricePerPound: 3.0, quantity: '1 lb' },

  'rosemary': { packagePrice: 2.5, quantity: 'bunch' },
  'turmeric': { packagePrice: 4.0, pricePerPound: 4.0, quantity: '1 lb' },

  'plums (pitted)': { packagePrice: 3.0, pricePerPound: 3.0, quantity: '1 lb' },
  'plum': { packagePrice: 3.0, pricePerPound: 3.0, quantity: '1 lb' },
  'plums': { packagePrice: 3.0, pricePerPound: 3.0, quantity: '1 lb' },
  'figs': { packagePrice: 5.0, pricePerPound: 5.0, quantity: '1 lb' },
  'fig': { packagePrice: 5.0, pricePerPound: 5.0, quantity: '1 lb' },
  'cranberries': { packagePrice: 3.5, pricePerPound: 3.5, quantity: '1 lb' },
  'cranberry': { packagePrice: 3.5, pricePerPound: 3.5, quantity: '1 lb' },
  'mulberries': { packagePrice: 6.5, pricePerPound: 6.5, quantity: '1 lb' },
  'mulberry': { packagePrice: 6.5, pricePerPound: 6.5, quantity: '1 lb' },
  'honey': { packagePrice: 6.5, pricePerPound: 6.5, quantity: '1 lb' },
  'honey (tiny amounts)': { packagePrice: 6.5, pricePerPound: 6.5, quantity: '1 lb' },

  'coconut oil': { packagePrice: 8.0, pricePerPound: 8.0, quantity: '16 oz bottle' },
  'flaxseed oil': { packagePrice: 10.0, pricePerPound: 10.0, quantity: '16 oz bottle' },
  'fish oil': { packagePrice: 14.0, pricePerPound: 14.0, quantity: '16 oz bottle' },
  'salmon oil': { packagePrice: 14.0, pricePerPound: 14.0, quantity: '16 oz bottle' },
  'omega-3 oil': { packagePrice: 14.0, pricePerPound: 14.0, quantity: '16 oz bottle' },
  'almond oil': { packagePrice: 12.5, pricePerPound: 12.5, quantity: '16 oz bottle' },
  'pumpkin seed oil': { packagePrice: 15.0, pricePerPound: 15.0, quantity: '16 oz bottle' },
  'wheat germ oil': { packagePrice: 15.0, pricePerPound: 15.0, quantity: '16 oz bottle' },
  'evening primrose oil': { packagePrice: 20.0, pricePerPound: 20.0, quantity: '16 oz bottle' },
  'borage oil': { packagePrice: 20.0, pricePerPound: 20.0, quantity: '16 oz bottle' },
  'black currant oil': { packagePrice: 20.0, pricePerPound: 20.0, quantity: '16 oz bottle' },
  'anchovy oil': { packagePrice: 16.0, pricePerPound: 16.0, quantity: '16 oz bottle' },
  'mackerel oil': { packagePrice: 16.0, pricePerPound: 16.0, quantity: '16 oz bottle' },
  'sardine oil': { packagePrice: 16.0, pricePerPound: 16.0, quantity: '16 oz bottle' },
  'herring oil': { packagePrice: 20.0, pricePerPound: 20.0, quantity: '16 oz bottle' },
  'krill oil': { packagePrice: 20.0, pricePerPound: 20.0, quantity: '16 oz bottle' },
  'algae oil (dha)': { packagePrice: 25.0, pricePerPound: 25.0, quantity: '16 oz bottle' },

  'ground chicken': { packagePrice: 4.0, pricePerPound: 4.0, quantity: '1 lb' },
  'chicken hearts': { packagePrice: 3.0, pricePerPound: 3.0, quantity: '1 lb' },
  'chicken giblets': { packagePrice: 3.0, pricePerPound: 3.0, quantity: '1 lb' },
  'chicken necks': { packagePrice: 2.5, pricePerPound: 2.5, quantity: '1 lb' },
  'chicken liver': { packagePrice: 3.0, pricePerPound: 3.0, quantity: '1 lb' },
  'ground pork (lean)': { packagePrice: 5.0, pricePerPound: 5.0, quantity: '1 lb' },
  'ground lamb': { packagePrice: 7.0, pricePerPound: 7.0, quantity: '1 lb' },
  'lamb liver': { packagePrice: 4.0, pricePerPound: 4.0, quantity: '1 lb' },
  'ground duck': { packagePrice: 7.5, pricePerPound: 7.5, quantity: '1 lb' },
  'duck breast': { packagePrice: 10.0, pricePerPound: 10.0, quantity: '1 lb' },
  'duck liver': { packagePrice: 8.0, pricePerPound: 8.0, quantity: '1 lb' },
  'turkey giblets': { packagePrice: 3.0, pricePerPound: 3.0, quantity: '1 lb' },
  'venison': { packagePrice: 12.5, pricePerPound: 12.5, quantity: '1 lb' },
  'rabbit meat': { packagePrice: 10.0, pricePerPound: 10.0, quantity: '1 lb' },
  'quail': { packagePrice: 12.5, pricePerPound: 12.5, quantity: '1 lb' },
  'quail eggs': { packagePrice: 8.0, quantity: 'dozen' },
  'ground mackerel': { packagePrice: 6.5, pricePerPound: 6.5, quantity: '1 lb' },
  'salmon (boneless)': { packagePrice: 11.5, pricePerPound: 11.5, quantity: '1 lb' },
  'mackerel (canned)': { packagePrice: 3.0, quantity: 'can' },

  'turkey broth (no salt)': { packagePrice: 4.0, quantity: '32 oz' },
  'fish broth (no salt)': { packagePrice: 4.0, quantity: '32 oz' },

  'timothy hay': { packagePrice: 1.5, pricePerPound: 1.5, quantity: '1 lb' },
  'alfalfa hay': { packagePrice: 1.5, pricePerPound: 1.5, quantity: '1 lb' },
  'orchard grass hay': { packagePrice: 1.5, pricePerPound: 1.5, quantity: '1 lb' },
  'bermuda hay': { packagePrice: 1.5, pricePerPound: 1.5, quantity: '1 lb' },
  'bluegrass hay': { packagePrice: 1.5, pricePerPound: 1.5, quantity: '1 lb' },
  'fescue hay': { packagePrice: 1.5, pricePerPound: 1.5, quantity: '1 lb' },
  'barley hay': { packagePrice: 1.5, pricePerPound: 1.5, quantity: '1 lb' },
  'wheat hay': { packagePrice: 1.5, pricePerPound: 1.5, quantity: '1 lb' },
  'meadow hay': { packagePrice: 1.5, pricePerPound: 1.5, quantity: '1 lb' },
  'straw (wheat/pine)': { packagePrice: 7.5, quantity: 'bale' },

  'dubia roaches': { packagePrice: 22.5, quantity: '100' },
  'small dubia roaches': { packagePrice: 22.5, quantity: '100' },
  'superworms': { packagePrice: 15.0, quantity: '100' },
  'hornworms': { packagePrice: 11.5, quantity: 'dozen' },
  'silkworms': { packagePrice: 15.0, quantity: '50' },
  'pinhead crickets': { packagePrice: 15.0, quantity: '100' },
  'black soldier fly larvae': { packagePrice: 20.0, quantity: 'container' },
  'butterworms': { packagePrice: 11.5, quantity: 'container' },
  'earthworms': { packagePrice: 15.0, pricePerPound: 15.0, quantity: '1 lb' },

  'spirulina powder': { packagePrice: 20.0, pricePerPound: 20.0, quantity: '1 lb' },
  'vitamin e': { packagePrice: 11.5 },
  'vitamin c': { packagePrice: 10.0 },
  'vitamin c (small amounts)': { packagePrice: 10.0 },
  'hyaluronic acid': { packagePrice: 20.0 },
  'curcumin (turmeric extract)': { packagePrice: 20.0 },
  'quercetin': { packagePrice: 17.5 },
  'l-carnitine powder': { packagePrice: 25.0 },
  'amino acid supplement': { packagePrice: 20.0 },
  's-adenosyl methionine (sam-e)': { packagePrice: 27.5 },
  'glucosamine sulfate': { packagePrice: 22.5 },
  'chondroitin sulfate': { packagePrice: 22.5 },
  'joint supplement': { packagePrice: 25.0 },
  'joint health supplement': { packagePrice: 25.0 },
  'joint health powder': { packagePrice: 25.0 },
  'probiotic powder': { packagePrice: 20.0 },
  'digestive enzymes': { packagePrice: 20.0 },
  'beta-glucans': { packagePrice: 25.0 },
  'psyllium husk': { packagePrice: 10.0 },
  'd-mannose': { packagePrice: 20.0 },
  'fructooligosaccharides (fos)': { packagePrice: 14.0 },
  'inulin (prebiotic)': { packagePrice: 14.0 },
  'mannanoligosaccharides (mos)': { packagePrice: 16.0 },

  'cat grass (wheatgrass)': { packagePrice: 4.0, quantity: 'tray' },
  'rabbit pellets (high fiber)': { packagePrice: 20.0, pricePerPound: 2.0, quantity: '10 lb bag' },
  'pellets (fortified)': { packagePrice: 15.0, pricePerPound: 3.0, quantity: '5 lb bag' },
  'wild bird mix': { packagePrice: 12.5, pricePerPound: 1.25, quantity: '10 lb bag' },
  'hairball control paste': { packagePrice: 10.0, quantity: 'tube' },
  'hairball paste': { packagePrice: 10.0, quantity: 'tube' },
};

function normalizeIngredientKey(value: string): string {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ');
}

function getOverrideCandidates(ingredientName: string): string[] {
  const base = normalizeIngredientKey(ingredientName);
  const noHyphen = base.replace(/-/g, ' ');
  const hyphenated = base.replace(/\s+/g, '-');

  const withoutParens = base.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
  const withoutPunct = withoutParens.replace(/[,:]/g, ' ').replace(/\s+/g, ' ').trim();
  const withoutDescriptors = withoutPunct
    .replace(/\b(raw|cooked|fresh|frozen|minimal|mashed|boneless|lean)\b/g, ' ')
    .replace(/\b(tiny|small)\s+amounts\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const candidates = [base, noHyphen, hyphenated, withoutParens, withoutPunct, withoutDescriptors];
  return Array.from(new Set(candidates.filter(Boolean)));
}

function quantityToGramsInternal(quantity: string): number {
  if (!quantity) return 0;
  const q = String(quantity).toLowerCase().trim();

  const lbMatch = q.match(/(\d+(?:\.\d+)?)\s*(?:lb|lbs|pound|pounds)/);
  if (lbMatch) return parseFloat(lbMatch[1]) * 453.592;

  const ozMatch = q.match(/(\d+(?:\.\d+)?)\s*(?:oz|ounce|ounces|fl oz|fluid ounce|fluid ounces)/);
  if (ozMatch) return parseFloat(ozMatch[1]) * 28.3495;

  const kgMatch = q.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilogram|kilograms)/);
  if (kgMatch) return parseFloat(kgMatch[1]) * 1000;

  const gMatch = q.match(/(\d+(?:\.\d+)?)\s*(?:g|gram|grams)/);
  if (gMatch) return parseFloat(gMatch[1]);

  const countMatch = q.match(/(\d+)\s*(?:count|counts)/);
  if (countMatch) return parseInt(countMatch[1]) * 100;

  return 0;
}

function finalizeProductUrl(product: ProductPrice): ProductPrice {
  const validatedUrl = getAmazonBuyLink(product.url);
  return {
    ...product,
    url: validatedUrl || product.url,
  } as ProductPrice;
}

export function getProductPricePerPound(product: ProductPrice): number | null {
  const totalPrice = Number(product?.price?.amount);
  if (!Number.isFinite(totalPrice) || totalPrice <= 0) return null;

  const grams = quantityToGramsInternal(String(product?.quantity || ''));
  if (!Number.isFinite(grams) || grams <= 0) return null;

  const pounds = grams / GRAMS_PER_POUND;
  if (!Number.isFinite(pounds) || pounds <= 0) return null;

  return totalPrice / pounds;
}

/**
 * Get product data by ingredient name
 * Handles fuzzy matching for variations
 * Validates Amazon URLs through runtime finalizer
 */
export function getProductByIngredient(ingredientName: string): ProductPrice | null {
  if (!ingredientName) return null;
  
  const normalized = ingredientName.toLowerCase().trim();
  
  // Try exact match first
  let product = PRODUCT_PRICES.find(p => p.ingredient === normalized);
  
  // Try partial match if exact fails
  if (!product) {
    product = PRODUCT_PRICES.find(p => 
      normalized.includes(p.ingredient) || p.ingredient.includes(normalized)
    );
  }
  
  if (!product) return null;

  return finalizeProductUrl(product as ProductPrice);
}

/**
 * Get purchase URL for an ingredient
 * Returns Amazon link with affiliate tag
 */
export function getProductUrl(ingredientName: string): string | null {
  const product = getProductByIngredient(ingredientName);
  return product?.url || null;
}

/**
 * Get quality score for an ingredient (0-10, higher is better)
 */
export function getProductQualityScore(ingredientName: string): number {
  const product = getProductByIngredient(ingredientName);
  return product?.qualityScore || product?.researchScore || 5; // Default to 5 if no score
}

/**
 * Get all product options for an ingredient (including budget variants)
 */
export function getProductOptions(ingredientName: string): ProductPrice[] {
  const normalized = ingredientName.toLowerCase().trim();
  return (PRODUCT_PRICES.filter(p => 
    p.ingredient === normalized || 
    p.ingredient.includes(normalized) || 
    normalized.includes(p.ingredient)
  ) as ProductPrice[]).map(finalizeProductUrl);
}

/**
 * Get best quality product for an ingredient
 */
export function getBestQualityProduct(ingredientName: string): ProductPrice | null {
  const options = getProductOptions(ingredientName);
  if (options.length === 0) return null;
  
  // Sort by quality score descending, then by research score
  return options.sort((a, b) => {
    const scoreA = (a.qualityScore || a.researchScore || 0);
    const scoreB = (b.qualityScore || b.researchScore || 0);
    return scoreB - scoreA;
  })[0];
}

export function getBestValueProduct(ingredientName: string): ProductPrice | null {
  const options = getProductOptions(ingredientName);
  if (options.length === 0) return null;

  const scored = options
    .map((p) => ({ p, ppp: getProductPricePerPound(p) }))
    .filter((x) => typeof x.ppp === 'number' && Number.isFinite(x.ppp) && (x.ppp as number) > 0) as Array<{
    p: ProductPrice;
    ppp: number;
  }>;

  if (scored.length === 0) {
    const withPrice = options.filter((p) => Number(p?.price?.amount) > 0);
    if (withPrice.length === 0) return options[0];
    return withPrice.sort((a, b) => (Number(a.price.amount) || 0) - (Number(b.price.amount) || 0))[0];
  }

  return scored.sort((a, b) => a.ppp - b.ppp)[0].p;
}

export function getIngredientDisplayPricing(ingredientName: string): {
  product: ProductPrice | null;
  packagePrice: number | null;
  pricePerPound: number | null;
  quantity: string | null;
  priceSource: 'override' | 'package' | 'product' | 'none';
} {
  const candidates = getOverrideCandidates(ingredientName);
  let override: PriceOverride | undefined;
  for (const key of candidates) {
    const found = PRICE_OVERRIDES[key];
    if (found) {
      override = found;
      break;
    }
  }

  if (override) {
    return {
      product: null,
      packagePrice: override.packagePrice,
      pricePerPound: typeof override.pricePerPound === 'number' ? override.pricePerPound : null,
      quantity: override.quantity || null,
      priceSource: 'override',
    };
  }

  const pkg = getPackageSize(ingredientName);
  const estimatedCost = Number(pkg?.estimatedCost);
  const grams = Number(pkg?.typicalSize);
  const hasPackageEstimate = Number.isFinite(estimatedCost) && estimatedCost > 0 && Number.isFinite(grams) && grams > 0;

  if (hasPackageEstimate) {
    const pounds = grams / GRAMS_PER_POUND;
    const pricePerPound = pounds > 0 ? estimatedCost / pounds : null;
    const quantity = pkg?.typicalUnit === 'lb'
      ? `${Number((grams / GRAMS_PER_POUND).toFixed(1))} lb`
      : (pkg?.typicalUnit ? String(pkg.typicalUnit) : `${Math.round(grams)}g`);

    return {
      product: null,
      packagePrice: estimatedCost,
      pricePerPound,
      quantity,
      priceSource: 'package',
    };
  }

  // Backup-only: only consult product-prices.json when we have neither an override nor a package estimate.
  const product = getBestValueProduct(ingredientName);

  if (!product) {
    return { product: null, packagePrice: null, pricePerPound: null, quantity: null, priceSource: 'none' };
  }

  const packagePrice = Number(product?.price?.amount);
  const normalizedPrice = Number.isFinite(packagePrice) && packagePrice > 0 ? packagePrice : null;

  return {
    product,
    packagePrice: normalizedPrice,
    pricePerPound: getProductPricePerPound(product),
    quantity: product.quantity || null,
    priceSource: 'product',
  };
}

/**
 * Get price for an ingredient (normalized to cost per pound)
 */
export function getProductPrice(ingredientName: string): number | null {
  const product = getProductByIngredient(ingredientName);
  if (!product?.price.amount) return null;
  
  // Normalize to cost per pound
  const quantity = product.quantity?.toLowerCase() || '';
  const totalPrice = product.price.amount;
  
  // Extract weight in pounds from quantity string
  let pounds = 1; // default
  
  if (quantity.includes('lb')) {
    const match = quantity.match(/(\d+(?:\.\d+)?)\s*lbs?/);
    if (match) pounds = parseFloat(match[1]);
  } else if (quantity.includes('oz')) {
    const match = quantity.match(/(\d+(?:\.\d+)?)\s*oz/);
    if (match) pounds = parseFloat(match[1]) / 16;
  } else if (quantity.includes('count')) {
    // For items sold by count (eggs, etc), estimate ~2 oz per unit
    const match = quantity.match(/(\d+)\s*count/);
    if (match) pounds = (parseFloat(match[1]) * 2) / 16;
  }
  
  // Return cost per pound
  return pounds > 0 ? totalPrice / pounds : totalPrice;
}

/**
 * Get quantity/package size for an ingredient
 */
export function getProductQuantity(ingredientName: string): string | null {
  const product = getProductByIngredient(ingredientName);
  return product?.quantity || null;
}

/**
 * Get ASIN for an ingredient
 */
export function getProductAsin(ingredientName: string): string | null {
  const product = getProductByIngredient(ingredientName);
  return product?.asin || null;
}

// Export the full list for direct access if needed
export { PRODUCT_PRICES };
export default PRODUCT_PRICES;
