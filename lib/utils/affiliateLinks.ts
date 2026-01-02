// lib/utils/affiliateLinks.ts
// Utility functions to ensure all affiliate links have seller ID

const SELLER_ID = 'robinfrench-20';

/**
 * Ensures an Amazon product link has the seller ID affiliate tag.
 * If the link already has a tag, it replaces it with ours.
 * If the link doesn't have a tag, it adds ours.
 * 
 * @param url The Amazon product URL to ensure has seller ID (format: /dp/ASIN or /gp/product/ASIN)
 * @returns The URL with seller ID guaranteed
 * 
 * @example
 * ensureSellerId('https://www.amazon.com/dp/B01234567') 
 * // Returns: 'https://www.amazon.com/dp/B01234567?tag=robinfrench-20'
 */
export function ensureSellerId(url: string | undefined | null): string {
  if (!url) return '';
  
  try {
    // Remove any existing tag parameters
    const urlObj = new URL(url);
    urlObj.searchParams.delete('tag');
    urlObj.searchParams.delete('AssociateTag');
    
    // Add our seller ID
    urlObj.searchParams.set('tag', SELLER_ID);
    
    return urlObj.toString();
  } catch (_e) {
    // If URL parsing fails, try simple string manipulation as fallback
    if (url.includes('?')) {
      return `${url}&tag=${SELLER_ID}`;
    }
    return `${url}?tag=${SELLER_ID}`;
  }
}

/**
 * Ensures an Amazon cart URL has the seller ID affiliate tag.
 * Cart URLs use AssociateTag parameter instead of tag parameter.
 * 
 * @param cartUrl The Amazon cart URL (format: /gp/aws/cart/add.html?ASIN.1=...)
 * @returns The cart URL with AssociateTag parameter added
 * 
 * @example
 * ensureCartUrlSellerId('https://www.amazon.com/gp/aws/cart/add.html?ASIN.1=B01234567&Quantity.1=1')
 * // Returns: 'https://www.amazon.com/gp/aws/cart/add.html?ASIN.1=B01234567&Quantity.1=1&AssociateTag=robinfrench-20'
 */
export function ensureCartUrlSellerId(cartUrl: string | undefined | null): string {
  if (!cartUrl) return '';
  
  // If it already has AssociateTag, replace it with ours
  if (cartUrl.includes('AssociateTag=')) {
    return cartUrl.replace(/AssociateTag=[^&]+/, `AssociateTag=${SELLER_ID}`);
  }
  
  // If it has tag parameter, replace with AssociateTag
  if (cartUrl.includes('tag=')) {
    return cartUrl.replace(/tag=[^&]+/, `AssociateTag=${SELLER_ID}`);
  }
  
  // Add AssociateTag parameter
  const separator = cartUrl.includes('?') ? '&' : '?';
  return `${cartUrl}${separator}AssociateTag=${SELLER_ID}`;
}

/**
 * Adds seller ID to a link only if it doesn't already have one.
 * @param url The URL to potentially add seller ID to
 * @returns The URL with seller ID if it was missing
 */
export function addSellerIdIfMissing(url: string | undefined | null): string {
  if (!url) return '';
  
  if (url.includes('tag=') || url.includes('AssociateTag=')) {
    // Already has a tag, ensure it's ours
    return ensureSellerId(url);
  }
  
  // Add our seller ID
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}tag=${SELLER_ID}`;
}

/**
 * Extracts ASIN from an Amazon URL.
 * Supports multiple URL formats: /dp/ASIN, /gp/product/ASIN, /product/ASIN
 * 
 * @param url The Amazon URL containing an ASIN
 * @returns The ASIN (10-character alphanumeric code) or null if not found
 * 
 * @example
 * extractASIN('https://www.amazon.com/dp/B01234567?tag=robinfrench-20')
 * // Returns: 'B01234567'
 */
export function extractASIN(url: string | undefined | null): string | null {
  if (!url) return null;
  
  // Try /dp/ASIN pattern (most common) - ASIN is 10 characters, stop at / or ? or end
  const dpMatch = url.match(/\/dp\/([A-Z0-9]{10})(?:\/|$|\?)/);
  if (dpMatch) return dpMatch[1];
  
  // Try /gp/product/ASIN pattern
  const gpMatch = url.match(/\/gp\/product\/([A-Z0-9]{10})(?:\/|$|\?)/);
  if (gpMatch) return gpMatch[1];
  
  // Try /product/ASIN pattern
  const productMatch = url.match(/\/product\/([A-Z0-9]{10})(?:\/|$|\?)/);
  if (productMatch) return productMatch[1];
  
  // Try ASIN parameter
  try {
    const urlObj = new URL(url);
    const asinParam = urlObj.searchParams.get('ASIN');
    if (asinParam && /^[A-Z0-9]{10}$/.test(asinParam)) {
      return asinParam;
    }
  } catch (_e) {
    // Invalid URL, continue
  }
  
  return null;
}

/**
 * Checks if a URL has our seller ID.
 * Works with both product links (tag=) and cart links (AssociateTag=).
 * 
 * @param url The URL to check
 * @returns True if the URL has our seller ID
 * 
 * @example
 * hasSellerId('https://www.amazon.com/dp/B01234567?tag=robinfrench-20')
 * // Returns: true
 */
export function hasSellerId(url: string | undefined | null): boolean {
  if (!url) return false;
  return url.includes(`tag=${SELLER_ID}`) || url.includes(`AssociateTag=${SELLER_ID}`);
}

/**
 * Validates that a URL is a valid Amazon URL.
 * 
 * @param url The URL to validate
 * @returns True if the URL is a valid Amazon URL
 */
export function isValidAmazonUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('amazon.com') || urlObj.hostname.includes('amzn.');
  } catch (_e) {
    return false;
  }
}

/**
 * Validates that a URL is an Amazon cart URL.
 * 
 * @param url The URL to validate
 * @returns True if the URL is an Amazon cart URL
 */
export function isCartUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  return url.includes('/gp/aws/cart/add.html') || url.includes('/gp/cart/view.html');
}

