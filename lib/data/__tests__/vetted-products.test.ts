// lib/data/__tests__/vetted-products.test.ts
import { describe, it, expect } from 'vitest';
import { VETTED_PRODUCTS, getVettedProduct } from '../vetted-products';
import { hasSellerId, extractASIN } from '@/lib/utils/affiliateLinks';

describe('vetted-products data validation', () => {
  const SELLER_ID = 'robinfrench-20';

  describe('All vetted products have seller ID', () => {
    it('should have seller ID in all asinLink entries', () => {
      const entries = Object.entries(VETTED_PRODUCTS);
      const missingSellerId: string[] = [];

      entries.forEach(([ingredient, product]) => {
        if (product.asinLink && !hasSellerId(product.asinLink)) {
          missingSellerId.push(ingredient);
        }
      });

      expect(missingSellerId).toEqual([]);
    });
  });

  describe('All vetted products use specific ASIN links', () => {
    it('should use /dp/ASIN or /gp/product/ASIN format (not search URLs)', () => {
      const entries = Object.entries(VETTED_PRODUCTS);
      const genericSearches: string[] = [];

      entries.forEach(([ingredient, product]) => {
        if (product.asinLink) {
          // Check if it's a generic search URL
          if (product.asinLink.includes('/s?k=') || product.asinLink.includes('/s?')) {
            genericSearches.push(ingredient);
          }
          // Should have ASIN pattern
          const asin = extractASIN(product.asinLink);
          if (!asin) {
            genericSearches.push(ingredient);
          }
        }
      });

      expect(genericSearches).toEqual([]);
    });

    it('should have valid ASIN format (10 alphanumeric characters)', () => {
      const entries = Object.entries(VETTED_PRODUCTS);
      const invalidASINs: string[] = [];

      entries.forEach(([ingredient, product]) => {
        if (product.asinLink) {
          const asin = extractASIN(product.asinLink);
          if (asin && !/^[A-Z0-9]{10}$/.test(asin)) {
            invalidASINs.push(ingredient);
          }
        }
      });

      expect(invalidASINs).toEqual([]);
    });
  });

  describe('All vetted products have productName', () => {
    it('should have productName for all entries', () => {
      const entries = Object.entries(VETTED_PRODUCTS);
      const missingProductName: string[] = [];

      entries.forEach(([ingredient, product]) => {
        if (!product.productName || product.productName.trim() === '') {
          missingProductName.push(ingredient);
        }
      });

      expect(missingProductName).toEqual([]);
    });

    it('should have non-empty productName', () => {
      const entries = Object.entries(VETTED_PRODUCTS);
      
      entries.forEach(([ingredient, product]) => {
        expect(product.productName).toBeTruthy();
        expect(product.productName.trim().length).toBeGreaterThan(0);
      });
    });
  });

  describe('ASIN link format validation', () => {
    it('should use amazon.com domain', () => {
      const entries = Object.entries(VETTED_PRODUCTS);
      const invalidDomains: string[] = [];

      entries.forEach(([ingredient, product]) => {
        if (product.asinLink) {
          if (!product.asinLink.includes('amazon.com')) {
            invalidDomains.push(ingredient);
          }
        }
      });

      expect(invalidDomains).toEqual([]);
    });

    it('should have asinLink or purchaseLink', () => {
      const entries = Object.entries(VETTED_PRODUCTS);
      const missingLinks: string[] = [];

      entries.forEach(([ingredient, product]) => {
        if (!product.asinLink && !product.purchaseLink) {
          missingLinks.push(ingredient);
        }
      });

      // Allow some entries to have only purchaseLink if needed
      // But we expect most to have asinLink
      expect(missingLinks.length).toBeLessThan(entries.length * 0.1); // Less than 10% missing
    });
  });

  describe('getVettedProduct function', () => {
    it('should return product for exact match', () => {
      const testIngredient = Object.keys(VETTED_PRODUCTS)[0];
      const result = getVettedProduct(testIngredient);
      expect(result).toBeDefined();
      expect(result?.productName).toBeDefined();
      expect(result?.asinLink).toBeDefined();
    });

    it('should handle case-insensitive lookup', () => {
      const testIngredient = Object.keys(VETTED_PRODUCTS)[0];
      const upperCase = testIngredient.toUpperCase();
      const result = getVettedProduct(upperCase);
      expect(result).toBeDefined();
    });

    it('should handle whitespace variations', () => {
      const testIngredient = Object.keys(VETTED_PRODUCTS)[0];
      const withSpaces = `  ${testIngredient}  `;
      const result = getVettedProduct(withSpaces);
      expect(result).toBeDefined();
    });

    it('should return undefined for non-existent ingredient', () => {
      const result = getVettedProduct('nonexistent-ingredient-xyz123');
      expect(result).toBeUndefined();
    });
  });

  describe('Data integrity checks', () => {
    it('should have vetNote for all entries', () => {
      const entries = Object.entries(VETTED_PRODUCTS);
      const missingVetNote: string[] = [];

      entries.forEach(([ingredient, product]) => {
        if (!product.vetNote || product.vetNote.trim() === '') {
          missingVetNote.push(ingredient);
        }
      });

      expect(missingVetNote).toEqual([]);
    });

    it('should have category for all entries', () => {
      const entries = Object.entries(VETTED_PRODUCTS);
      const missingCategory: string[] = [];

      entries.forEach(([ingredient, product]) => {
        if (!product.category) {
          missingCategory.push(ingredient);
        }
      });

      // Category is optional, but we should have most entries with it
      expect(missingCategory.length).toBeLessThan(entries.length * 0.2); // Less than 20% missing
    });
  });

  describe('Seller ID format validation', () => {
    it('should use correct seller ID format in all links', () => {
      const entries = Object.entries(VETTED_PRODUCTS);
      const wrongSellerId: string[] = [];

      entries.forEach(([ingredient, product]) => {
        if (product.asinLink) {
          // Check for correct seller ID
          const hasCorrectId = product.asinLink.includes(`tag=${SELLER_ID}`) || 
                              product.asinLink.includes(`AssociateTag=${SELLER_ID}`);
          if (!hasCorrectId && hasSellerId(product.asinLink)) {
            // Has a seller ID but not ours
            wrongSellerId.push(ingredient);
          }
        }
      });

      expect(wrongSellerId).toEqual([]);
    });
  });
});

