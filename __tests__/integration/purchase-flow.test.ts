// __tests__/integration/purchase-flow.test.ts
// Integration tests for complete purchase flow from recipe to cart

import { describe, it, expect } from 'vitest';
import { getVettedProduct } from '@/lib/data/vetted-products';
import { 
  ensureSellerId, 
  ensureCartUrlSellerId, 
  extractASIN,
  hasSellerId 
} from '@/lib/utils/affiliateLinks';

describe('Purchase Flow Integration', () => {
  const SELLER_ID = 'robinfrench-20';

  describe('Recipe to Vetted Product Flow', () => {
    it('should map recipe ingredient to vetted product with seller ID', () => {
      const ingredientName = 'ground chicken';
      const product = getVettedProduct(ingredientName);
      
      expect(product).toBeDefined();
      expect(product?.productName).toBeDefined();
      expect(product?.asinLink).toBeDefined();
      expect(hasSellerId(product?.asinLink)).toBe(true);
    });

    it('should have seller ID in all vetted product links', () => {
      // Test sample of common ingredients
      const commonIngredients = [
        'ground chicken',
        'ground turkey',
        'salmon (boneless)',
        'sweet potato',
        'carrots',
        'spinach',
      ];

      commonIngredients.forEach(ingredient => {
        const product = getVettedProduct(ingredient);
        if (product?.asinLink) {
          expect(hasSellerId(product.asinLink)).toBe(true);
        }
      });
    });

    it('should use specific ASIN links (not search URLs)', () => {
      const ingredientName = 'ground chicken';
      const product = getVettedProduct(ingredientName);
      
      if (product?.asinLink) {
        expect(product.asinLink).not.toContain('/s?k=');
        expect(product.asinLink).not.toContain('/s?');
        expect(product.asinLink).toMatch(/\/dp\/[A-Z0-9]{10}|\/gp\/product\/[A-Z0-9]{10}/);
      }
    });
  });

  describe('Cart URL Generation Flow', () => {
    it('should generate valid cart URL with seller ID for multiple items', () => {
      const ingredients = ['ground chicken', 'sweet potato', 'carrots'];
      const cartItems: string[] = [];

      ingredients.forEach((name, idx) => {
        const product = getVettedProduct(name);
        if (product?.asinLink) {
          const asin = extractASIN(product.asinLink);
          if (asin) {
            cartItems.push(`ASIN.${idx + 1}=${asin}&Quantity.${idx + 1}=1`);
          }
        }
      });

      expect(cartItems.length).toBeGreaterThan(0);

      const cartUrl = `https://www.amazon.com/gp/aws/cart/add.html?${cartItems.join('&')}`;
      const safeCartUrl = ensureCartUrlSellerId(cartUrl);

      expect(safeCartUrl).toContain('AssociateTag=robinfrench-20');
      expect(safeCartUrl).toContain('gp/aws/cart/add.html');
    });

    it('should extract ASINs correctly from vetted product links', () => {
      const ingredientName = 'ground chicken';
      const product = getVettedProduct(ingredientName);
      
      if (product?.asinLink) {
        const asin = extractASIN(product.asinLink);
        expect(asin).toBeTruthy();
        expect(asin?.length).toBe(10);
        expect(asin).toMatch(/^[A-Z0-9]{10}$/);
      }
    });

    it('should preserve ASINs when generating cart URL', () => {
      const ingredients = ['ground chicken', 'ground turkey'];
      const asins: string[] = [];

      ingredients.forEach(name => {
        const product = getVettedProduct(name);
        if (product?.asinLink) {
          const asin = extractASIN(product.asinLink);
          if (asin) {
            asins.push(asin);
          }
        }
      });

      const cartItems = asins.map((asin, idx) => 
        `ASIN.${idx + 1}=${asin}&Quantity.${idx + 1}=1`
      );
      const cartUrl = `https://www.amazon.com/gp/aws/cart/add.html?${cartItems.join('&')}`;
      const safeCartUrl = ensureCartUrlSellerId(cartUrl);

      // Verify all ASINs are still in the URL
      asins.forEach(asin => {
        expect(safeCartUrl).toContain(asin);
      });
    });
  });

  describe('Seller ID Propagation', () => {
    it('should propagate seller ID through entire flow', () => {
      // Simulate complete flow
      const ingredientName = 'ground chicken';
      
      // Step 1: Get vetted product
      const product = getVettedProduct(ingredientName);
      expect(product).toBeDefined();
      
      // Step 2: Verify vetted product has seller ID
      if (product?.asinLink) {
        expect(hasSellerId(product.asinLink)).toBe(true);
        
        // Step 3: Apply utility function (safety check)
        const safeLink = ensureSellerId(product.asinLink);
        expect(hasSellerId(safeLink)).toBe(true);
        
        // Step 4: Verify link is still valid
        expect(safeLink).toContain('amazon.com');
        expect(safeLink).toContain(SELLER_ID);
      }
    });

    it('should handle missing seller ID gracefully', () => {
      // Test with link that might not have seller ID
      const testLink = 'https://www.amazon.com/dp/B0123456789';
      const safeLink = ensureSellerId(testLink);
      
      expect(hasSellerId(safeLink)).toBe(true);
      expect(safeLink).toContain(SELLER_ID);
    });

    it('should replace wrong seller ID with ours', () => {
      const testLink = 'https://www.amazon.com/dp/B0123456789?tag=wrong-id-20';
      const safeLink = ensureSellerId(testLink);
      
      expect(hasSellerId(safeLink)).toBe(true);
      expect(safeLink).not.toContain('wrong-id-20');
      expect(safeLink).toContain(SELLER_ID);
    });
  });

  describe('Multiple Pet Shopping Flow', () => {
    it('should handle multiple ingredients from different recipes', () => {
      const recipeIngredients = [
        { name: 'ground chicken', recipeId: 'recipe1' },
        { name: 'sweet potato', recipeId: 'recipe1' },
        { name: 'ground turkey', recipeId: 'recipe2' },
        { name: 'carrots', recipeId: 'recipe2' },
      ];

      const allLinks: string[] = [];

      recipeIngredients.forEach(ing => {
        const product = getVettedProduct(ing.name);
        if (product?.asinLink) {
          allLinks.push(ensureSellerId(product.asinLink));
        }
      });

      // Verify all links have seller ID
      allLinks.forEach(link => {
        expect(hasSellerId(link)).toBe(true);
      });

      expect(allLinks.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing vetted products gracefully', () => {
      const product = getVettedProduct('nonexistent-ingredient-xyz');
      expect(product).toBeUndefined();
    });

    it('should handle null/undefined links safely', () => {
      expect(ensureSellerId(null)).toBe('');
      expect(ensureSellerId(undefined)).toBe('');
      expect(ensureCartUrlSellerId(null)).toBe('');
      expect(hasSellerId(null)).toBe(false);
    });

    it('should handle malformed URLs gracefully', () => {
      const malformed = 'not-a-valid-url';
      const result = ensureSellerId(malformed);
      // Should not throw, may add tag anyway
      expect(result).toBeTruthy();
    });
  });

  describe('End-to-End Purchase Flow', () => {
    it('should complete full flow: recipe → vetted product → cart', () => {
      // Simulate complete purchase flow
      const mealIngredients = ['ground chicken', 'sweet potato', 'carrots'];
      const cartItems: string[] = [];

      mealIngredients.forEach((name, idx) => {
        // Get vetted product
        const product = getVettedProduct(name);
        
        if (product?.asinLink) {
          // Verify seller ID
          expect(hasSellerId(product.asinLink)).toBe(true);
          
          // Extract ASIN for cart
          const asin = extractASIN(product.asinLink);
          if (asin) {
            cartItems.push(`ASIN.${idx + 1}=${asin}&Quantity.${idx + 1}=1`);
          }
        }
      });

      expect(cartItems.length).toBe(mealIngredients.length);

      // Generate cart URL
      const cartUrl = `https://www.amazon.com/gp/aws/cart/add.html?${cartItems.join('&')}`;
      const safeCartUrl = ensureCartUrlSellerId(cartUrl);

      // Verify final URL
      expect(safeCartUrl).toContain('AssociateTag=robinfrench-20');
      expect(safeCartUrl).toContain('gp/aws/cart/add.html');
      
      // Verify all ASINs present
      mealIngredients.forEach(name => {
        const product = getVettedProduct(name);
        if (product?.asinLink) {
          const asin = extractASIN(product.asinLink);
          if (asin) {
            expect(safeCartUrl).toContain(asin);
          }
        }
      });
    });
  });
});

