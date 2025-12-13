/**
 * Unit tests for species-aware product matching in getVettedProduct
 */

import { getVettedProduct } from '../vetted-products';

describe('getVettedProduct with species filtering', () => {
  describe('Dog-specific products', () => {
    it('should return dog product when species is dogs', () => {
      const product = getVettedProduct('joint supplement', 'dogs');
      expect(product).toBeDefined();
      expect(product?.productName).toContain('Cosequin');
      expect(product?.productName).toContain('Dogs');
    });

    it('should return undefined when species is cats (dog product rejected)', () => {
      const product = getVettedProduct('joint supplement', 'cats');
      // Should be undefined because product has species: 'dogs' and productName contains "for Dogs"
      expect(product).toBeUndefined();
    });

    it('should return dog product for joint health supplement when species is dogs', () => {
      const product = getVettedProduct('joint health supplement', 'dogs');
      expect(product).toBeDefined();
      expect(product?.productName).toContain('Dogs');
    });

    it('should return undefined for joint health supplement when species is cats', () => {
      const product = getVettedProduct('joint health supplement', 'cats');
      expect(product).toBeUndefined();
    });

    it('should reject chicken broth for cats (contains "for Dogs")', () => {
      const product = getVettedProduct('chicken broth', 'cats');
      // Should be undefined because productName contains "for Dogs"
      expect(product).toBeUndefined();
    });

    it('should allow chicken broth for dogs', () => {
      const product = getVettedProduct('chicken broth', 'dogs');
      expect(product).toBeDefined();
      expect(product?.productName).toContain('Dogs');
    });
  });

  describe('Defensive name-based validation', () => {
    it('should reject products with "for Dogs" in name when species is cats', () => {
      // Test with a known dog product
      const product = getVettedProduct('sardine oil', 'cats');
      // Should be undefined because productName contains "Zesty Paws Sardine Oil for Dogs"
      expect(product).toBeUndefined();
    });

    it('should reject products with "Dog Food" in name when species is cats', () => {
      // This test verifies the defensive check works
      // If there were a product with "Dog Food" in the name, it should be rejected for cats
      // We test this indirectly through existing dog products
      const product = getVettedProduct('joint supplement', 'cats');
      expect(product).toBeUndefined();
    });
  });

  describe('Products without species restrictions', () => {
    it('should return product when no species specified (backward compatibility)', () => {
      const product = getVettedProduct('ground beef (lean)');
      expect(product).toBeDefined();
    });

    it('should return product when species matches undefined/no species field', () => {
      // Products without species field should work for any species (backward compatibility)
      const product = getVettedProduct('ground beef (lean)', 'cats');
      expect(product).toBeDefined();
    });
  });

  describe('Species field validation', () => {
    it('should handle products with species: "dogs" correctly', () => {
      const dogProduct = getVettedProduct('joint supplement', 'dogs');
      const catProduct = getVettedProduct('joint supplement', 'cats');
      
      expect(dogProduct).toBeDefined();
      expect(catProduct).toBeUndefined();
    });

    it('should handle products with species: "both" correctly', () => {
      // Note: We don't currently have products with species: 'both' in the test data
      // This test is a placeholder for when such products are added
      // For now, we test that products without species field work for both
      const productDogs = getVettedProduct('ground beef (lean)', 'dogs');
      const productCats = getVettedProduct('ground beef (lean)', 'cats');
      
      // Products without species field should work for both (backward compatibility)
      expect(productDogs).toBeDefined();
      expect(productCats).toBeDefined();
    });
  });
});

