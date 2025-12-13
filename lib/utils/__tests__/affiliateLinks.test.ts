// lib/utils/__tests__/affiliateLinks.test.ts
import { describe, it, expect } from 'vitest';
import {
  ensureSellerId,
  ensureCartUrlSellerId,
  hasSellerId,
  extractASIN,
  isValidAmazonUrl,
  isCartUrl,
  addSellerIdIfMissing,
} from '../affiliateLinks';

describe('affiliateLinks utilities', () => {
  describe('ensureSellerId', () => {
    it('should add seller ID to URL without existing tag', () => {
      const url = 'https://www.amazon.com/dp/B01234567';
      const result = ensureSellerId(url);
      expect(result).toContain('tag=robinfrench-20');
      expect(result).toBe('https://www.amazon.com/dp/B01234567?tag=robinfrench-20');
    });

    it('should replace existing tag parameter with our seller ID', () => {
      const url = 'https://www.amazon.com/dp/B01234567?tag=someone-else-20';
      const result = ensureSellerId(url);
      expect(result).toContain('tag=robinfrench-20');
      expect(result).not.toContain('someone-else-20');
    });

    it('should replace AssociateTag with tag parameter', () => {
      const url = 'https://www.amazon.com/dp/B01234567?AssociateTag=other-20';
      const result = ensureSellerId(url);
      expect(result).toContain('tag=robinfrench-20');
      expect(result).not.toContain('AssociateTag');
    });

    it('should handle URL with existing query parameters', () => {
      const url = 'https://www.amazon.com/dp/B01234567?ref=sr_1_1';
      const result = ensureSellerId(url);
      expect(result).toContain('tag=robinfrench-20');
      expect(result).toContain('ref=sr_1_1');
    });

    it('should handle /gp/product/ URL format', () => {
      const url = 'https://www.amazon.com/gp/product/B01234567';
      const result = ensureSellerId(url);
      expect(result).toContain('tag=robinfrench-20');
    });

    it('should return empty string for null/undefined input', () => {
      expect(ensureSellerId(null)).toBe('');
      expect(ensureSellerId(undefined)).toBe('');
      expect(ensureSellerId('')).toBe('');
    });

    it('should handle malformed URLs gracefully', () => {
      const url = 'not-a-url';
      const result = ensureSellerId(url);
      expect(result).toContain('tag=robinfrench-20');
    });

    it('should handle URLs without protocol', () => {
      const url = 'www.amazon.com/dp/B01234567';
      const result = ensureSellerId(url);
      // Should still attempt to add tag (may fail gracefully)
      expect(result).toBeTruthy();
    });
  });

  describe('ensureCartUrlSellerId', () => {
    it('should add AssociateTag to cart URL without existing tag', () => {
      const cartUrl = 'https://www.amazon.com/gp/aws/cart/add.html?ASIN.1=B01234567&Quantity.1=1';
      const result = ensureCartUrlSellerId(cartUrl);
      expect(result).toContain('AssociateTag=robinfrench-20');
      expect(result).toContain('ASIN.1=B01234567');
    });

    it('should replace existing AssociateTag with our seller ID', () => {
      const cartUrl = 'https://www.amazon.com/gp/aws/cart/add.html?ASIN.1=B01234567&AssociateTag=other-20';
      const result = ensureCartUrlSellerId(cartUrl);
      expect(result).toContain('AssociateTag=robinfrench-20');
      expect(result).not.toContain('other-20');
    });

    it('should replace tag parameter with AssociateTag in cart URLs', () => {
      const cartUrl = 'https://www.amazon.com/gp/aws/cart/add.html?ASIN.1=B01234567&tag=other-20';
      const result = ensureCartUrlSellerId(cartUrl);
      expect(result).toContain('AssociateTag=robinfrench-20');
      expect(result).not.toContain('tag=');
    });

    it('should handle multiple ASINs in cart URL', () => {
      const cartUrl = 'https://www.amazon.com/gp/aws/cart/add.html?ASIN.1=B01234567&Quantity.1=1&ASIN.2=B09876543&Quantity.2=1';
      const result = ensureCartUrlSellerId(cartUrl);
      expect(result).toContain('AssociateTag=robinfrench-20');
      expect(result).toContain('ASIN.1=B01234567');
      expect(result).toContain('ASIN.2=B09876543');
    });

    it('should return empty string for null/undefined input', () => {
      expect(ensureCartUrlSellerId(null)).toBe('');
      expect(ensureCartUrlSellerId(undefined)).toBe('');
      expect(ensureCartUrlSellerId('')).toBe('');
    });
  });

  describe('hasSellerId', () => {
    it('should return true for URL with tag parameter', () => {
      expect(hasSellerId('https://www.amazon.com/dp/B01234567?tag=robinfrench-20')).toBe(true);
    });

    it('should return true for URL with AssociateTag parameter', () => {
      expect(hasSellerId('https://www.amazon.com/gp/aws/cart/add.html?AssociateTag=robinfrench-20')).toBe(true);
    });

    it('should return false for URL without seller ID', () => {
      expect(hasSellerId('https://www.amazon.com/dp/B01234567')).toBe(false);
    });

    it('should return false for URL with different tag', () => {
      expect(hasSellerId('https://www.amazon.com/dp/B01234567?tag=other-20')).toBe(false);
    });

    it('should return false for null/undefined/empty input', () => {
      expect(hasSellerId(null)).toBe(false);
      expect(hasSellerId(undefined)).toBe(false);
      expect(hasSellerId('')).toBe(false);
    });
  });

  describe('extractASIN', () => {
    it('should extract ASIN from /dp/ URL format', () => {
      expect(extractASIN('https://www.amazon.com/dp/B012345678')).toBe('B012345678');
      expect(extractASIN('https://www.amazon.com/dp/B012345678?tag=robinfrench-20')).toBe('B012345678');
    });

    it('should extract ASIN from /gp/product/ URL format', () => {
      expect(extractASIN('https://www.amazon.com/gp/product/B012345678')).toBe('B012345678');
    });

    it('should extract ASIN from /product/ URL format', () => {
      expect(extractASIN('https://www.amazon.com/product/B012345678')).toBe('B012345678');
    });

    it('should extract ASIN from ASIN parameter', () => {
      expect(extractASIN('https://www.amazon.com/gp/aws/cart/add.html?ASIN=B012345678')).toBe('B012345678');
    });

    it('should return null for URL without ASIN', () => {
      expect(extractASIN('https://www.amazon.com/s?k=chicken')).toBe(null);
      expect(extractASIN('https://www.amazon.com')).toBe(null);
    });

    it('should return null for invalid ASIN format', () => {
      expect(extractASIN('https://www.amazon.com/dp/B123')).toBe(null);
      expect(extractASIN('https://www.amazon.com/dp/B01234567890')).toBe(null);
      // 9 characters should not match (ASINs are exactly 10)
      expect(extractASIN('https://www.amazon.com/dp/B01234567')).toBe(null);
    });

    it('should return null for null/undefined/empty input', () => {
      expect(extractASIN(null)).toBe(null);
      expect(extractASIN(undefined)).toBe(null);
      expect(extractASIN('')).toBe(null);
    });
  });

  describe('isValidAmazonUrl', () => {
    it('should return true for amazon.com URLs', () => {
      expect(isValidAmazonUrl('https://www.amazon.com/dp/B01234567')).toBe(true);
      expect(isValidAmazonUrl('http://amazon.com/product')).toBe(true);
    });

    it('should return true for amzn. URLs', () => {
      expect(isValidAmazonUrl('https://amzn.to/abc123')).toBe(true);
    });

    it('should return false for non-Amazon URLs', () => {
      expect(isValidAmazonUrl('https://www.google.com')).toBe(false);
      expect(isValidAmazonUrl('https://www.chewy.com')).toBe(false);
    });

    it('should return false for invalid URLs', () => {
      expect(isValidAmazonUrl('not-a-url')).toBe(false);
      expect(isValidAmazonUrl('')).toBe(false);
    });

    it('should return false for null/undefined input', () => {
      expect(isValidAmazonUrl(null)).toBe(false);
      expect(isValidAmazonUrl(undefined)).toBe(false);
    });
  });

  describe('isCartUrl', () => {
    it('should return true for /gp/aws/cart/add.html URLs', () => {
      expect(isCartUrl('https://www.amazon.com/gp/aws/cart/add.html?ASIN.1=B01234567')).toBe(true);
    });

    it('should return true for /gp/cart/view.html URLs', () => {
      expect(isCartUrl('https://www.amazon.com/gp/cart/view.html')).toBe(true);
    });

    it('should return false for product URLs', () => {
      expect(isCartUrl('https://www.amazon.com/dp/B01234567')).toBe(false);
    });

    it('should return false for null/undefined/empty input', () => {
      expect(isCartUrl(null)).toBe(false);
      expect(isCartUrl(undefined)).toBe(false);
      expect(isCartUrl('')).toBe(false);
    });
  });

  describe('addSellerIdIfMissing', () => {
    it('should add seller ID if missing', () => {
      const url = 'https://www.amazon.com/dp/B01234567';
      const result = addSellerIdIfMissing(url);
      expect(result).toContain('tag=robinfrench-20');
    });

    it('should not add seller ID if already present', () => {
      const url = 'https://www.amazon.com/dp/B01234567?tag=robinfrench-20';
      const result = addSellerIdIfMissing(url);
      // Should still ensure it's our seller ID (may normalize)
      expect(result).toContain('robinfrench-20');
    });

    it('should replace other seller IDs with ours', () => {
      const url = 'https://www.amazon.com/dp/B01234567?tag=other-20';
      const result = addSellerIdIfMissing(url);
      expect(result).toContain('tag=robinfrench-20');
      expect(result).not.toContain('other-20');
    });

    it('should handle AssociateTag parameter', () => {
      const url = 'https://www.amazon.com/dp/B01234567?AssociateTag=other-20';
      const result = addSellerIdIfMissing(url);
      expect(result).toContain('robinfrench-20');
    });
  });
});

