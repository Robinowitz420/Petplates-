// lib/data/product-prices.ts
// SINGLE SOURCE OF TRUTH for all product data

import PRODUCT_PRICES from '../../data/product-prices.json';
import { getAmazonBuyLink } from '@/lib/utils/getAmazonBuyLink';

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
  
  // Validate and finalize Amazon URL through runtime finalizer
  const validatedUrl = getAmazonBuyLink(product.url);
  
  return {
    ...product,
    url: validatedUrl || product.url, // Use validated URL or fallback to original
  } as ProductPrice;
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
  return PRODUCT_PRICES.filter(p => 
    p.ingredient === normalized || 
    p.ingredient.includes(normalized) || 
    normalized.includes(p.ingredient)
  ) as ProductPrice[];
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
