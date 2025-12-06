/**
 * Utility to assign meal images to recipes based on hash of recipe ID
 * Cycles through 25 images per species for consistent assignment
 */

/**
 * Hash a string to a number (deterministic)
 */
function hashStringToNumber(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Get meal image path for a recipe based on its ID and category
 * Returns path like: /images/meals/dogs-meal-01.png
 * 
 * @param recipeId - Unique recipe identifier
 * @param category - Recipe category (dogs, cats, birds, reptiles, pocket-pets)
 * @returns Image path string
 */
export function getMealImageForRecipe(recipeId: string, category: string): string {
  // Normalize category to match image naming
  const categoryMap: Record<string, string> = {
    'dogs': 'dogs',
    'cats': 'cats',
    'birds': 'birds',
    'reptiles': 'reptiles',
    'pocket-pets': 'pocket-pets'
  };
  
  const normalizedCategory = categoryMap[category.toLowerCase()] || 'dogs';
  
  // Hash the recipe ID to get a number between 0-24 (for 25 images)
  const hash = hashStringToNumber(recipeId);
  const imageNumber = (hash % 25) + 1; // 1-25
  
  // Format as 01-25
  const imageNumberStr = imageNumber.toString().padStart(2, '0');
  
  return `/images/meals/${normalizedCategory}-meal-${imageNumberStr}.png`;
}

/**
 * Get all available meal images for a species
 * Useful for checking which images exist
 */
export function getAvailableMealImages(category: string): string[] {
  const categoryMap: Record<string, string> = {
    'dogs': 'dogs',
    'cats': 'cats',
    'birds': 'birds',
    'reptiles': 'reptiles',
    'pocket-pets': 'pocket-pets'
  };
  
  const normalizedCategory = categoryMap[category.toLowerCase()] || 'dogs';
  const images: string[] = [];
  
  for (let i = 1; i <= 25; i++) {
    const imageNumber = i.toString().padStart(2, '0');
    images.push(`/images/meals/${normalizedCategory}-meal-${imageNumber}.png`);
  }
  
  return images;
}

