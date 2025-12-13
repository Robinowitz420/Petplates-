/**
 * Price validation utilities for vetted products
 * Prevents outlier prices from scraping errors (e.g., third-party sellers with inflated prices)
 */

export type ProductCategory = 'Meat' | 'Supplement' | 'Carb' | 'Vegetable' | 'Oil' | 'Seed' | 'Fruit' | 'Insect' | 'Hay' | 'Pellet';

/**
 * Maximum reasonable prices per category (USD)
 * These are conservative limits to catch obvious errors from third-party sellers
 */
const MAX_REASONABLE_PRICES: Record<ProductCategory, number> = {
  Vegetable: 15,      // Bulk vegetables, but $124 for collard greens is clearly wrong
  Meat: 80,           // Bulk frozen meat can be expensive
  Carb: 75,           // Bulk grains/potatoes
  Oil: 40,            // Cooking oils and supplements
  Supplement: 100,    // Supplements can be expensive but have limits
  Fruit: 30,          // Fresh fruits
  Seed: 50,           // Seeds and nuts
  Insect: 50,         // Dried insects for pets
  Hay: 50,            // Hay bales
  Pellet: 80,         // Pellet food
};

/**
 * Check if a price is reasonable for the given category
 */
export function isPriceReasonable(price: number, category?: ProductCategory | string): boolean {
  if (!category) return true; // No category = no validation
  
  const normalizedCategory = category as ProductCategory;
  if (!(normalizedCategory in MAX_REASONABLE_PRICES)) {
    // Unknown category, allow it (might be a new category)
    return true;
  }
  
  const maxPrice = MAX_REASONABLE_PRICES[normalizedCategory];
  return price <= maxPrice;
}

/**
 * Get the maximum reasonable price for a category
 */
export function getMaxReasonablePrice(category?: ProductCategory | string): number | null {
  if (!category) return null;
  
  const normalizedCategory = category as ProductCategory;
  return MAX_REASONABLE_PRICES[normalizedCategory] || null;
}

/**
 * Validate and optionally cap a price
 * Returns the original price if valid, or null if it exceeds the max
 */
export function validatePrice(
  price: number,
  category?: ProductCategory | string
): number | null {
  if (isPriceReasonable(price, category)) {
    return price;
  }
  
  // Price exceeds reasonable limit - return null to mark as invalid/unavailable
  return null;
}

