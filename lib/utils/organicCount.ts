/**
 * Organic Count Utilities
 * 
 * Makes numeric counts feel more natural and less robotic by:
 * - Avoiding perfect multiples of 10/5
 * - Adding subtle variation
 * - Providing contextual messaging
 */

/**
 * Makes a count look more organic by avoiding "perfect" numbers.
 * Uses deterministic variation based on the count itself to ensure stability.
 * 
 * Examples:
 * - 40 → 42 or 38 (avoids multiples of 10)
 * - 35 → 36 or 34 (sometimes avoids multiples of 5)
 * - Adds subtle variation (±2) to make numbers feel less robotic
 * 
 * @param count The base count to make organic
 * @returns An organic-looking count (stable for the same input)
 */
export function makeCountOrganic(count: number): number {
  let organic = count;
  
  // Use count as seed for deterministic "random" variation
  const seed = count * 17 + 23; // Simple hash function
  
  // Don't show "perfect" multiples of 10
  if (count % 10 === 0) {
    // Convert 40 → 42, 50 → 47, etc. (deterministic based on count)
    organic = count + ((seed % 2 === 0) ? 2 : -3);
  }
  
  // Don't show "perfect" multiples of 5 (sometimes, deterministic)
  if (count % 5 === 0 && (seed % 10) > 2) {
    organic = count + 1;
  }
  
  // Add subtle variation (±2) to make numbers feel less robotic (deterministic)
  const variation = ((seed % 5) - 2); // -2 to +2, stable per count
  organic += variation;
  
  // Ensure it doesn't go below 1
  organic = Math.max(1, organic);
  
  // Round to nearest integer
  organic = Math.round(organic);
  
  return organic;
}

/**
 * Gets a contextual message based on the meal count.
 * 
 * @param count The number of meals found
 * @param species The pet species (optional, for personalization)
 * @returns A contextual message string
 */
export function getCountMessage(count: number, species?: string): string {
  if (count > 60) {
    return `Amazing! We found ${count} perfect meals`;
  }
  if (count > 40) {
    return `Great news! We found ${count} excellent meals`;
  }
  if (count > 25) {
    return `We found ${count} great meal options`;
  }
  if (count > 15) {
    return `We found ${count} good meal options`;
  }
  if (count > 5) {
    return `We found ${count} suitable meals`;
  }
  return `We found ${count} meal option${count !== 1 ? 's' : ''}`;
}

/**
 * Gets subtext based on the meal count.
 * 
 * @param count The number of meals found
 * @param species The pet species (optional, for personalization)
 * @returns A subtext string
 */
export function getSubtext(count: number, species?: string): string {
  const speciesName = species || 'pet';
  
  if (count > 50) {
    return `That's a lot of options! Your ${speciesName} is going to love these.`;
  }
  if (count > 30) {
    return `Plenty of variety for your ${speciesName}.`;
  }
  if (count > 15) {
    return `Good selection for your ${speciesName}'s needs.`;
  }
  if (count > 5) {
    return `Curated selection based on your ${speciesName}'s profile.`;
  }
  return `Limited options due to specific dietary requirements.`;
}

