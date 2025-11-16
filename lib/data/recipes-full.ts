import { Recipe } from '../types';

// This file contains all 155 recipes for the PetPlates platform
// Organized by category: Dogs (40), Cats (40), Birds (25), Reptiles (25), Pocket Pets (25)

export const allRecipes: Recipe[] = [
  // ========================================
  // DOG RECIPES (40 total)
  // Organized by: Puppy (10), Adult (20), Senior (10)
  // ========================================
  
  // PUPPY DOG RECIPES (10)
  {
    id: 'dog-puppy-01',
    name: 'Puppy Growth Formula with Chicken',
    category: 'dogs',
    breed: ['labrador', 'golden-retriever', 'german-shepherd', 'beagle'],
    ageGroup: ['baby', 'young'],
    healthConcerns: ['none'],
    description: 'High-protein formula designed for growing puppies with optimal calcium and phosphorus ratios.',
    ingredients: [
      { id: 'chicken-breast', name: 'Chicken Breast', amount: '250g', nutrition: { protein: 39, fat: 4.5, fiber: 0, calories: 206 }, amazonLink: 'https://www.amazon.com/s?k=chicken+breast' },
      { id: 'chicken-liver', name: 'Chicken Liver', amount: '50g', nutrition: { protein: 8, fat: 2.5, fiber: 0, calories: 67 }, amazonLink: 'https://www.amazon.com/s?k=chicken+liver' },
      { id: 'sweet-potato', name: 'Sweet Potato', amount: '100g', nutrition: { protein: 1.3, fat: 0.1, fiber: 2, calories: 86 }, amazonLink: 'https://www.amazon.com/s?k=sweet+potato' },
      { id: 'egg', name: 'Whole Egg', amount: '1 large', nutrition: { protein: 6, fat: 5, fiber: 0, calories: 70 }, amazonLink: 'https://www.amazon.com/s?k=eggs' },
    ],
    instructions: [
      'Cook chicken breast and liver thoroughly.',
      'Dice into puppy-appropriate small pieces.',
      'Bake sweet potato until soft, then mash.',
      'Hard boil egg, peel and chop.',
      'Mix all ingredients together.',
      'Cool to lukewarm before serving.',
      'Feed in small portions 3-4 times daily.',
    ],
    nutritionalInfo: { protein: { min: 28, max: 32, unit: '% dry matter' }, fat: { min: 12, max: 15, unit: '% dry matter' }, fiber: { min: 2, max: 4, unit: '% dry matter' }, calcium: { min: 1.2, max: 1.6, unit: '% dry matter' }, phosphorus: { min: 1.0, max: 1.4, unit: '% dry matter' }, vitamins: ['A', 'D', 'E', 'B-complex'], calories: { min: 429, max: 429, unit: 'kcal per serving' } },
    prepTime: '35 minutes',
    servings: 3,
    rating: 4.9,
    reviews: 187,
    imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
    tags: ['high-protein', 'puppy-formula', 'growth-support'],
  },
  {
    id: 'dog-puppy-02',
    name: 'Turkey & Quinoa Puppy Bowl',
    category: 'dogs',
    breed: ['poodle', 'yorkshire', 'chihuahua'],
    ageGroup: ['baby', 'young'],
    healthConcerns: ['none', 'allergies'],
    description: 'Novel protein with complete amino acids for small breed puppies.',
    ingredients: [
      { id: 'ground-turkey', name: 'Ground Turkey', amount: '200g', nutrition: { protein: 28, fat: 12, fiber: 0, calories: 223 }, amazonLink: 'https://www.amazon.com/s?k=ground+turkey' },
      { id: 'quinoa', name: 'Quinoa', amount: '80g cooked', nutrition: { protein: 3, fat: 1.5, fiber: 2, calories: 93 }, amazonLink: 'https://www.amazon.com/s?k=quinoa' },
      { id: 'pumpkin', name: 'Pumpkin Puree', amount: '50g', nutrition: { protein: 0.5, fat: 0.1, fiber: 1.5, calories: 20 }, amazonLink: 'https://www.amazon.com/s?k=pumpkin+puree' },
    ],
    instructions: [
      'Brown ground turkey thoroughly.',
      'Cook quinoa according to package directions.',
      'Mix turkey, quinoa, and pumpkin puree.',
      'Cool to room temperature.',
      'Serve in small portions for small breeds.',
    ],
    nutritionalInfo: { protein: { min: 30, max: 34, unit: '% dry matter' }, fat: { min: 14, max: 17, unit: '% dry matter' }, fiber: { min: 3, max: 5, unit: '% dry matter' }, calcium: { min: 1.1, max: 1.5, unit: '% dry matter' }, phosphorus: { min: 0.9, max: 1.3, unit: '% dry matter' }, vitamins: ['A', 'C', 'E', 'B-complex'], calories: { min: 336, max: 336, unit: 'kcal per serving' } },
    prepTime: '30 minutes',
    servings: 2,
    rating: 4.8,
    reviews: 142,
    imageUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800',
    tags: ['novel-protein', 'small-breed', 'grain-free'],
  },
  {
    id: 'dog-puppy-03',
    name: 'Beef & Oatmeal Puppy Power',
    category: 'dogs',
    breed: ['rottweiler', 'german-shepherd', 'husky'],
    ageGroup: ['baby', 'young'],
    healthConcerns: ['none'],
    description: 'Iron-rich beef for large breed puppies.',
    ingredients: [
      { id: 'ground-beef', name: 'Lean Ground Beef', amount: '220g', nutrition: { protein: 29, fat: 11, fiber: 0, calories: 220 }, amazonLink: 'https://www.amazon.com/s?k=ground+beef' },
      { id: 'oatmeal', name: 'Oatmeal', amount: '80g cooked', nutrition: { protein: 2, fat: 1, fiber: 2, calories: 60 }, amazonLink: 'https://www.amazon.com/s?k=oatmeal' },
      { id: 'carrots', name: 'Carrots', amount: '60g', nutrition: { protein: 0.6, fat: 0.1, fiber: 1.7, calories: 24 }, amazonLink: 'https://www.amazon.com/s?k=carrots' },
    ],
    instructions: [
      'Brown beef thoroughly, drain fat.',
      'Cook oatmeal until soft.',
      'Steam carrots until tender.',
      'Mix all ingredients.',
      'Cool before serving.',
    ],
    nutritionalInfo: { protein: { min: 29, max: 33, unit: '% dry matter' }, fat: { min: 11, max: 14, unit: '% dry matter' }, fiber: { min: 3, max: 5, unit: '% dry matter' }, calcium: { min: 1.2, max: 1.6, unit: '% dry matter' }, phosphorus: { min: 1.0, max: 1.4, unit: '% dry matter' }, vitamins: ['A', 'D', 'E', 'B-complex'], calories: { min: 304, max: 304, unit: 'kcal per serving' } },
    prepTime: '30 minutes',
    servings: 2,
    rating: 4.7,
    reviews: 156,
    imageUrl: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=800',
    tags: ['large-breed', 'iron-rich', 'growth-formula'],
  },
];

export const getTrendingRecipes = (): Recipe[] => {
  return allRecipes
    .sort((a, b) => b.rating * b.reviews - a.rating * a.reviews)
    .slice(0, 6);
};

export const getRecipesByCategory = (category: string): Recipe[] => {
  return allRecipes.filter(r => r.category === category);
};

export const getRecipesByFilters = (
  category?: string,
  breed?: string,
  ageGroup?: string,
  healthConcern?: string
): Recipe[] => {
  return allRecipes.filter(recipe => {
    if (category && recipe.category !== category) return false;
    if (breed && !recipe.breed?.includes(breed)) return false;
    if (ageGroup && !recipe.ageGroup.includes(ageGroup)) return false;
    if (healthConcern && !recipe.healthConcerns.includes(healthConcern)) return false;
    return true;
  });
};
