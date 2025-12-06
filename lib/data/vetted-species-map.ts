// lib/data/vetted-species-map.ts
// Maps vetted ingredient keys (from vetted-products.ts) to safe species.
// Ensures generator only picks safe, vetted items for each animal.

export type SafeSpecies = 'dog' | 'cat' | 'bird' | 'reptile' | 'pocket-pet';

export const VETTED_SPECIES_MAP: Record<string, SafeSpecies[]> = {
  // === PROTEINS ===
  'chicken breast': ['dog', 'cat', 'reptile', 'pocket-pet'], // cooked small amounts for others
  'ground turkey': ['dog', 'cat', 'reptile'],
  'ground beef (lean)': ['dog', 'cat', 'reptile'],
  'salmon (boneless)': ['dog', 'cat'],
  'chicken liver': ['dog', 'cat'],
  'beef liver': ['dog', 'cat'],
  'chicken hearts': ['dog', 'cat'],
  'sardines (canned in water)': ['dog', 'cat'],
  'eggs': ['dog', 'cat', 'reptile', 'bird', 'pocket-pet'], // cooked
  'duck breast': ['dog', 'cat'],
  'rabbit meat': ['dog', 'cat'],
  'venison': ['dog', 'cat'],
  'lamb': ['dog', 'cat'],
  'mealworms': ['bird', 'reptile', 'pocket-pet'],
  'crickets': ['bird', 'reptile', 'pocket-pet'],

  // === VEGETABLES ===
  'sweet potato': ['dog', 'bird', 'pocket-pet'], // cooked
  'pumpkin': ['dog', 'cat', 'bird', 'pocket-pet'],
  'carrots': ['dog', 'bird', 'pocket-pet', 'reptile'],
  'green beans': ['dog', 'cat', 'bird', 'reptile'],
  'peas': ['dog', 'bird', 'pocket-pet', 'reptile'],
  'broccoli': ['dog', 'bird', 'pocket-pet', 'reptile'],
  'spinach': ['dog', 'bird', 'reptile'], // limit for some
  'kale': ['dog', 'bird', 'reptile', 'pocket-pet'],
  'zucchini': ['dog', 'bird', 'reptile', 'pocket-pet'],
  'butternut squash': ['dog', 'bird', 'reptile'],
  'cucumber': ['dog', 'bird', 'pocket-pet', 'reptile'],
  'bell peppers': ['dog', 'bird', 'pocket-pet', 'reptile'],
  'collard greens': ['bird', 'reptile', 'pocket-pet'],
  'dandelion greens': ['bird', 'reptile', 'pocket-pet'],
  'bok choy': ['bird', 'reptile', 'pocket-pet'],

  // === FRUITS ===
  'blueberries': ['dog', 'bird', 'pocket-pet', 'reptile'],
  'apples': ['dog', 'bird', 'pocket-pet', 'reptile'], // no seeds
  'bananas': ['dog', 'bird', 'pocket-pet', 'reptile'],
  'strawberries': ['dog', 'bird', 'pocket-pet', 'reptile'],
  'watermelon': ['dog', 'bird', 'reptile'],
  'mango': ['bird', 'reptile', 'pocket-pet'],
  'papaya': ['bird', 'reptile', 'pocket-pet'],

  // === GRAINS/SEEDS ===
  'brown rice': ['dog', 'bird'],
  'white rice': ['dog', 'bird'],
  'oats': ['dog', 'bird', 'pocket-pet'],
  'quinoa': ['dog', 'bird'],
  'millet': ['bird', 'pocket-pet'],
  'sunflower seeds': ['bird', 'pocket-pet'],
  'pumpkin seeds': ['dog', 'bird', 'pocket-pet'],
  'chia seeds': ['dog', 'bird'],
  'flaxseed': ['dog', 'bird'],

  // === FATS/OILS ===
  'fish oil': ['dog', 'cat'],
  'salmon oil': ['dog', 'cat'],
  'coconut oil': ['dog'],
  'olive oil': ['dog'],

  // === SUPPLEMENTS ===
  'calcium powder': ['bird', 'reptile'],
  'kelp powder': ['dog', 'cat'],
  'bone broth': ['dog', 'cat'],
  'taurine powder': ['cat'],
  'cuttlebone': ['bird', 'reptile', 'pocket-pet'], // calcium source
  'vitamin c drops': ['pocket-pet'], // guinea pigs specifically
};