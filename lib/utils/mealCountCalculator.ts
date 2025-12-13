/**
 * Meal Count Calculator
 * 
 * Calculates dynamic meal counts based on pet profile characteristics.
 * This makes the count feel more personalized and organic rather than static.
 */

interface PetProfile {
  species: string;
  age?: string | number;
  healthConcerns?: string[];
  allergies?: string[];
}

/**
 * Calculates meal count variation based on pet profile characteristics.
 * 
 * Factors considered:
 * - Species: Different species have different recipe availability
 * - Health concerns: More concerns = fewer suitable options
 * - Allergies: More allergies = fewer safe options
 * - Age: Young and senior animals have more specialized needs
 * 
 * @param baseCount The actual number of filtered recipes
 * @param pet Pet profile information
 * @returns Adjusted count with organic variation
 */
export function calculateMealCountVariation(
  baseCount: number,
  pet: PetProfile
): number {
  let adjustedCount = baseCount;
  
  // 1. Species factor - different species have different recipe availability
  const speciesFactors: Record<string, number> = {
    'dog': 1.2,      // Dogs have more recipe options
    'dogs': 1.2,
    'cat': 1.0,
    'cats': 1.0,
    'bird': 0.8,     // Birds have fewer options
    'birds': 0.8,
    'reptile': 0.7,
    'reptiles': 0.7,
    'pocket-pet': 0.6,
    'pocket-pets': 0.6,
  };
  
  const species = pet.species?.toLowerCase() || 'dog';
  adjustedCount *= speciesFactors[species] || 1.0;
  
  // 2. Health concerns factor - more concerns = more specialized = fewer options
  const healthConcerns = pet.healthConcerns || [];
  const healthFactor = 1.0 - (healthConcerns.length * 0.1);
  adjustedCount *= Math.max(0.5, healthFactor);
  
  // 3. Allergies factor - more allergies = fewer safe options
  const allergies = pet.allergies || [];
  const allergyFactor = 1.0 - (allergies.length * 0.15);
  adjustedCount *= Math.max(0.3, allergyFactor);
  
  // 4. Age factor - young and senior animals have more specialized needs
  let ageFactor = 1.0;
  if (pet.age) {
    const ageNum = typeof pet.age === 'number' 
      ? pet.age 
      : parseFloat(String(pet.age)) || 3;
    
    if (ageNum < 1) {
      ageFactor = 1.3;  // Young animals have more specialized options
    } else if (ageNum > 7) {
      ageFactor = 0.9;  // Senior animals have fewer options
    }
  } else if (typeof pet.age === 'string') {
    const ageStr = pet.age.toLowerCase();
    if (ageStr === 'baby' || ageStr === 'young') {
      ageFactor = 1.3;
    } else if (ageStr === 'senior') {
      ageFactor = 0.9;
    }
  }
  adjustedCount *= ageFactor;
  
  // 5. Add small deterministic variation (±10%) for organic feel
  // Use a hash of pet profile to get stable "random" value
  const profileHash = JSON.stringify(pet).split('').reduce((acc, char) => {
    const hash = ((acc << 5) - acc) + char.charCodeAt(0);
    return hash & hash;
  }, 0);
  const stableVariation = 0.9 + ((Math.abs(profileHash) % 20) / 100); // 0.9 to 1.1, stable per pet
  adjustedCount *= stableVariation;
  
  // 6. Ensure reasonable bounds
  adjustedCount = Math.round(adjustedCount);
  adjustedCount = Math.max(8, adjustedCount);   // Never show less than 8
  adjustedCount = Math.min(85, adjustedCount);  // Never show more than 85
  
  return adjustedCount;
}

