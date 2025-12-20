// Runtime Amazon link finalizer - ensures all buy links are safe before display
// This is the ONLY function that should be used to get Amazon links in the UI

import { ensureSellerId, isValidAmazonUrl, extractASIN } from './affiliateLinks';

export type Region = 'US' | 'UK' | 'DE' | 'AU';

export interface BuyLinkResult {
  url: string | null;
  status: 'ok' | 'missing' | 'invalid' | 'region-unavailable';
  asin?: string;
}

/**
 * Runtime finalizer for Amazon buy links.
 * Guarantees:
 * - Affiliate tag is present (tag=robinfrench-20)
 * - URL is valid Amazon URL
 * - ASIN can be extracted (proves it's a product link, not search)
 * 
 * Returns null if link is broken/invalid - UI should handle gracefully.
 * 
 * @param rawUrl The raw Amazon URL from data files
 * @param region User's region (default: US)
 * @returns Finalized URL with affiliate tag, or null if invalid
 */
export function getAmazonBuyLink(
  rawUrl: string | undefined | null,
  region: Region = 'US'
): string | null {
  if (!rawUrl) return null;
  
  // Validate it's an Amazon URL
  if (!isValidAmazonUrl(rawUrl)) return null;
  
  // Extract ASIN to verify it's a product link (not a search)
  const asin = extractASIN(rawUrl);
  if (!asin) {
    // No ASIN means it's a search URL or malformed - reject it
    return null;
  }
  
  // Add affiliate tag
  const withTag = ensureSellerId(rawUrl);
  
  // Re-validate after mutation (defensive)
  if (!isValidAmazonUrl(withTag)) return null;
  
  return withTag;
}

/**
 * Extended version that returns detailed status for debugging.
 * Use this in admin/debug views to see why links are failing.
 */
export function getAmazonBuyLinkWithStatus(
  rawUrl: string | undefined | null,
  region: Region = 'US'
): BuyLinkResult {
  if (!rawUrl) {
    return { url: null, status: 'missing' };
  }
  
  if (!isValidAmazonUrl(rawUrl)) {
    return { url: null, status: 'invalid' };
  }
  
  const asin = extractASIN(rawUrl);
  if (!asin) {
    return { url: null, status: 'invalid' };
  }
  
  // TODO: Add region-specific validation when we support multi-region
  // For now, all links are US-only
  if (region !== 'US') {
    return { url: null, status: 'region-unavailable', asin };
  }
  
  const withTag = ensureSellerId(rawUrl);
  
  if (!isValidAmazonUrl(withTag)) {
    return { url: null, status: 'invalid', asin };
  }
  
  return { url: withTag, status: 'ok', asin };
}

/**
 * Fallback: Generate Amazon search link if no specific product link exists.
 * Only use this if you explicitly decide to allow generic searches (Policy B).
 * 
 * @param query Search query (e.g., ingredient name + brand)
 * @param region User's region
 * @returns Amazon search URL with affiliate tag
 */
export function getFallbackAmazonSearchLink(
  query: string,
  region: Region = 'US'
): string {
  const base = region === 'US' ? 'https://www.amazon.com/s' : 'https://www.amazon.co.uk/s';
  const url = `${base}?k=${encodeURIComponent(query)}`;
  return ensureSellerId(url);
}
