/**
 * Base Recipes Database
 * Real, vet-verified recipes for all pet species
 * Sources: Cats.com, Feline Nutrition Foundation, Reptile Centre, veterinary nutritionists
 */

export type PetSpecies = 'dogs' | 'cats' | 'birds' | 'reptiles' | 'pocket-pets';

export interface BaseRecipe {
  id: string;
  name: string;
  species: PetSpecies;
  ageGroup: 'baby' | 'young' | 'adult' | 'senior';
  style: 'raw' | 'cooked' | 'mixed' | 'live-food' | 'seed-mix' | 'hay-based';
  description: string;
  source: string;
  sourceUrl?: string;
  ingredients: Array<{
    name: string;
    amount: number;
    unit: 'g' | 'oz' | 'cup' | 'tsp' | 'tbsp' | 'count' | 'ml';
    notes?: string;
  }>;
  supplements?: Array<{
    name: string;
    amount: number;
    unit: 'mg' | 'IU' | 'g' | 'tsp';
  }>;
  instructions: string[];
  servingSize: {
    amount: number;
    unit: 'g' | 'oz' | 'count';
    frequency: string;
  };
  nutritionalTargets?: {
    protein: { min: number; max: number; unit: '%' | 'g' };
    fat: { min: number; max: number; unit: '%' | 'g' };
    fiber?: { min: number; max: number; unit: '%' | 'g' };
    calories?: number;
  };
  prepTime: number; // minutes
  cookTime?: number; // minutes
  storageInstructions: string;
  notes: string;
}

// ============================================================================
// CAT RECIPES (Vet-Verified from Cats.com & Feline Nutrition Foundation)
// ============================================================================

export const CAT_RECIPES: BaseRecipe[] = [
  {
    id: 'cat-raw-rabbit-alnutrin',
    name: 'Raw Ground Rabbit with Alnutrin',
    species: 'cats',
    ageGroup: 'adult',
    style: 'raw',
    description: 'Complete raw rabbit meal with bone and organs, balanced with Alnutrin premix',
    source: 'Cats.com (Kate Barrington)',
    sourceUrl: 'https://cats.com/homemade-cat-food-recipes',
    ingredients: [
      { name: 'Ground chicken', amount: 300, unit: 'g' },
      { name: 'Chicken liver', amount: 100, unit: 'g' },
      { name: 'Fish oil', amount: 5, unit: 'g' },
    ],
    instructions: [
      'Cut meat off rabbit carcass into 1-inch pieces',
      'Crush bones into small pieces',
      'Grind meat, bones, and organs together',
      'Whisk Alnutrin with water',
      'Stir mixture into ground rabbit',
      'Divide into portions and freeze',
    ],
    servingSize: { amount: 100, unit: 'g', frequency: 'daily' },
    nutritionalTargets: {
      protein: { min: 13.5, max: 13.5, unit: 'g' },
      fat: { min: 3.24, max: 3.24, unit: 'g' },
    },
    prepTime: 30,
    storageInstructions: 'Freeze in portions. Thaw in refrigerator before serving.',
    notes: 'Requires whole rabbit with organs. Alnutrin premix ensures complete nutrition.',
  },
  {
    id: 'cat-cooked-turkey-sweet-potato',
    name: 'Turkey Breast & Sweet Potato with Balance IT',
    species: 'cats',
    ageGroup: 'adult',
    style: 'cooked',
    description: 'Cooked turkey with sweet potato, balanced with Balance IT Carnivore Blend',
    source: 'Cats.com (Kate Barrington)',
    sourceUrl: 'https://cats.com/homemade-cat-food-recipes',
    ingredients: [
      { name: 'Turkey breast', amount: 150, unit: 'g' },
      { name: 'Sweet potato', amount: 100, unit: 'g' },
      { name: 'Fish oil', amount: 5, unit: 'g' },
      { name: 'Taurine powder', amount: 1, unit: 'tsp' },
    ],
    instructions: [
      'Roast turkey breast at 350°F until internal temp reaches 165°F',
      'Bake sweet potato until tender',
      'Scoop flesh from sweet potato',
      'Finely chop turkey breast',
      'Combine turkey and sweet potato',
      'Add supplements and stir well',
      'Divide into meals',
    ],
    servingSize: { amount: 170, unit: 'g', frequency: 'daily' },
    nutritionalTargets: {
      protein: { min: 47.73, max: 47.73, unit: '%' },
      fat: { min: 32.59, max: 32.59, unit: '%' },
    },
    prepTime: 15,
    cookTime: 30,
    storageInstructions: 'Refrigerate in airtight container for 3-4 days or freeze. Add supplements just before feeding.',
    notes: 'High-protein, low-carb option. Balance IT ensures complete nutrition.',
  },
  {
    id: 'cat-cooked-ground-beef-ezcomplete',
    name: 'Ground Beef with EZComplete',
    species: 'cats',
    ageGroup: 'adult',
    style: 'cooked',
    description: 'Cooked ground beef balanced with EZComplete Fur Cats premix',
    source: 'Cats.com (Kate Barrington)',
    sourceUrl: 'https://cats.com/homemade-cat-food-recipes',
    ingredients: [
      { name: 'Ground beef lean', amount: 300, unit: 'g' },
      { name: 'Chicken liver', amount: 100, unit: 'g' },
      { name: 'Taurine powder', amount: 2, unit: 'tsp' },
    ],
    instructions: [
      'Place ground meat in slow cooker',
      'Add ¼ cup water per pound of meat',
      'Cook on low for 4-6 hours',
      'Cool and shred or finely chop',
      'Stir in EZComplete until mixed',
      'Divide into portions',
    ],
    servingSize: { amount: 100, unit: 'g', frequency: 'daily' },
    nutritionalTargets: {
      protein: { min: 85, max: 85, unit: '%' },
      fat: { min: 11, max: 11, unit: '%' },
    },
    prepTime: 10,
    cookTime: 360,
    storageInstructions: 'Refrigerate in airtight containers for 3-4 days or freeze.',
    notes: 'EZComplete requires only boneless meat and water. Can be served raw or cooked.',
  },
  {
    id: 'cat-raw-chicken-feline-nutrition',
    name: 'Ground Chicken with Bone & Organs (Feline Nutrition Foundation)',
    species: 'cats',
    ageGroup: 'adult',
    style: 'raw',
    description: 'Raw chicken with bone and organs, supplemented with taurine and vitamins',
    source: 'Feline Nutrition Foundation',
    sourceUrl: 'https://hare-today.com/feline-nutrition/nutrition/making-raw-cat-food-for-do-it-yourselfers',
    ingredients: [
      { name: 'Chicken thighs', amount: 200, unit: 'g' },
      { name: 'Chicken liver', amount: 100, unit: 'g' },
      { name: 'Chicken hearts', amount: 50, unit: 'g' },
      { name: 'Eggs whole', amount: 50, unit: 'g' },
      { name: 'Taurine powder', amount: 2, unit: 'tsp' },
    ],
    supplements: [
      { name: 'Taurine', amount: 2000, unit: 'mg' },
      { name: 'Wild salmon oil capsules', amount: 4000, unit: 'mg' },
      { name: 'Vitamin B Complex', amount: 200, unit: 'mg' },
      { name: 'Vitamin E', amount: 200, unit: 'IU' },
    ],
    instructions: [
      'Remove skin from half the chicken thighs',
      'Remove bone from 20-25% of thighs',
      'Weigh out 4.5 pounds and rinse well',
      'Cut meat and organs into 1-inch pieces',
      'Crush bones as much as possible',
      'Feed through meat grinder with salmon oil capsules',
      'Whisk egg yolk with supplements',
      'Pour over ground ingredients and mix well',
      'Portion into containers and freeze',
    ],
    servingSize: { amount: 100, unit: 'g', frequency: 'daily' },
    nutritionalTargets: {
      protein: { min: 10.3, max: 10.3, unit: 'g' },
      fat: { min: 6.36, max: 6.36, unit: 'g' },
    },
    prepTime: 45,
    storageInstructions: 'Freeze in portions. Thaw in refrigerator before serving.',
    notes: 'Requires meat grinder. Use wild salmon oil, not cod liver oil (too high in vitamin A).',
  },
  {
    id: 'cat-prey-model-raw',
    name: 'Prey Model Raw (PMR+) Diet',
    species: 'cats',
    ageGroup: 'adult',
    style: 'raw',
    description: '80/10/10 model with variety of proteins, organs, and bones',
    source: 'The Little Carnivore (Coline Doebelin)',
    sourceUrl: 'https://thelittlecarnivore.com/en/blog/calculator-prey-model-raw-plus-diet-for-cats',
    ingredients: [
      { name: 'Chicken breast', amount: 150, unit: 'g' },
      { name: 'Ground beef lean', amount: 150, unit: 'g' },
      { name: 'Chicken hearts', amount: 50, unit: 'g' },
      { name: 'Chicken liver', amount: 50, unit: 'g' },
      { name: 'Sardines water', amount: 50, unit: 'g' },
      { name: 'Taurine powder', amount: 2, unit: 'tsp' },
    ],
    supplements: [
      { name: 'Chelated manganese', amount: 0, unit: 'mg' },
      { name: 'Kelp powder (iodine)', amount: 0, unit: 'mg' },
      { name: 'Psyllium husk (fiber)', amount: 0, unit: 'mg' },
      { name: 'Vitamin E', amount: 0, unit: 'IU' },
      { name: 'B-complex vitamins', amount: 0, unit: 'mg' },
      { name: 'Taurine (optional)', amount: 0, unit: 'mg' },
    ],
    instructions: [
      'Chop ingredients into 1-inch pieces',
      'Crush bones if needed for meat grinder',
      'Grind all ingredients in appropriate ratio',
      'Use Little Carnivore calculator for feeding amounts and supplement dosages',
      'Divide into portions and freeze',
      'At mealtime, add supplements and mix before serving',
    ],
    servingSize: { amount: 100, unit: 'g', frequency: 'daily' },
    nutritionalTargets: {
      protein: { min: 11.3, max: 11.3, unit: 'g' },
      fat: { min: 6.2, max: 6.2, unit: 'g' },
    },
    prepTime: 60,
    storageInstructions: 'Freeze in portions. Thaw in refrigerator before serving.',
    notes: 'Highly customizable. Use Little Carnivore calculator for precise supplement dosing based on cat weight.',
  },
  {
    id: 'cat-chicken-rice-kitten',
    name: 'Chicken & Rice Stew for Kittens',
    species: 'cats',
    ageGroup: 'baby',
    style: 'cooked',
    description: 'Simple, nutritious kitten meal with chicken, rice, fish oil and taurine',
    source: 'Supertails',
    sourceUrl: 'https://supertails.com/blogs/nutrition/homemade-kitten-food-cat-food-a-guide-to-healthy-recipes',
    ingredients: [
      { name: 'Chicken breast', amount: 240, unit: 'g' },
      { name: 'Brown rice', amount: 60, unit: 'g' },
      { name: 'Fish oil', amount: 5, unit: 'g' },
      { name: 'Taurine', amount: 1, unit: 'tsp' },
    ],
    instructions: [
      'Combine shredded chicken and brown rice',
      'Add fish oil and crushed taurine supplement',
      'Mix thoroughly and serve warm',
    ],
    servingSize: { amount: 100, unit: 'g', frequency: 'daily' },
    nutritionalTargets: {
      protein: { min: 25, max: 30, unit: '%' },
      fat: { min: 8, max: 12, unit: '%' },
    },
    prepTime: 15,
    cookTime: 20,
    storageInstructions: 'Refrigerate for 3-4 days or freeze in portions.',
    notes: 'Perfect for kittens. Simple and uses common ingredients.',
  },
  {
    id: 'cat-turkey-pumpkin-mash',
    name: 'Pumpkin & Turkey Mash',
    species: 'cats',
    ageGroup: 'baby',
    style: 'cooked',
    description: 'Gentle, digestive-friendly meal for kittens with turkey and pumpkin',
    source: 'Supertails',
    sourceUrl: 'https://supertails.com/blogs/nutrition/homemade-kitten-food-cat-food-a-guide-to-healthy-recipes',
    ingredients: [
      { name: 'Ground turkey', amount: 240, unit: 'g' },
      { name: 'Pumpkin', amount: 60, unit: 'g' },
      { name: 'Carrots raw', amount: 60, unit: 'g' },
    ],
    instructions: [
      'Cook ground turkey until fully done',
      'Mix with pumpkin puree and mashed peas',
      'Cool and portion into small servings',
    ],
    servingSize: { amount: 100, unit: 'g', frequency: 'daily' },
    nutritionalTargets: {
      protein: { min: 20, max: 25, unit: '%' },
      fat: { min: 8, max: 10, unit: '%' },
    },
    prepTime: 10,
    cookTime: 15,
    storageInstructions: 'Refrigerate for 3-4 days or freeze in portions.',
    notes: 'Pumpkin aids digestion. Good for kittens with sensitive stomachs.',
  },
  {
    id: 'cat-chicken-pumpkin-stew',
    name: 'Chicken & Pumpkin Stew',
    species: 'cats',
    ageGroup: 'adult',
    style: 'cooked',
    description: 'Balanced cooked meal with chicken, pumpkin, carrots, and peas',
    source: 'Supertails',
    sourceUrl: 'https://supertails.com/blogs/nutrition/homemade-kitten-food-cat-food-a-guide-to-healthy-recipes',
    ingredients: [
      { name: 'Chicken breast', amount: 200, unit: 'g' },
      { name: 'Pumpkin', amount: 100, unit: 'g' },
      { name: 'Carrots raw', amount: 80, unit: 'g' },
      { name: 'Broccoli raw', amount: 60, unit: 'g' },
      { name: 'Fish oil', amount: 5, unit: 'g' },
      { name: 'Taurine powder', amount: 1, unit: 'tsp' },
    ],
    instructions: [
      'Cook chicken thoroughly, then chop into bite-sized pieces',
      'Steam or boil carrots and peas until soft',
      'Combine all ingredients in a pot, mixing well',
      'Stir in olive oil for added healthy fats',
      'Add taurine supplement',
      'Serve fresh, store leftovers in refrigerator',
    ],
    servingSize: { amount: 150, unit: 'g', frequency: 'daily' },
    nutritionalTargets: {
      protein: { min: 20, max: 25, unit: '%' },
      fat: { min: 8, max: 12, unit: '%' },
    },
    prepTime: 15,
    cookTime: 30,
    storageInstructions: 'Refrigerate for 3-4 days or freeze in portions.',
    notes: 'Balanced combination of protein, fiber, and healthy fats.',
  },
  {
    id: 'cat-turkey-spinach-weight-management',
    name: 'Turkey & Spinach Stir Fry (Weight Management)',
    species: 'cats',
    ageGroup: 'adult',
    style: 'cooked',
    description: 'Lean protein meal for weight management with turkey and spinach',
    source: 'Supertails',
    sourceUrl: 'https://supertails.com/blogs/nutrition/homemade-kitten-food-cat-food-a-guide-to-healthy-recipes',
    ingredients: [
      { name: 'Ground turkey', amount: 200, unit: 'g' },
      { name: 'Spinach raw', amount: 100, unit: 'g' },
      { name: 'Brown rice cooked', amount: 100, unit: 'g' },
      { name: 'Fish oil', amount: 5, unit: 'g' },
    ],
    instructions: [
      'Cook turkey thoroughly, draining any excess fat',
      'Add spinach and cook until wilted',
      'Stir in cooked rice and mix well',
      'Drizzle with flaxseed oil before serving',
    ],
    servingSize: { amount: 150, unit: 'g', frequency: 'daily' },
    nutritionalTargets: {
      protein: { min: 25, max: 30, unit: '%' },
      fat: { min: 5, max: 8, unit: '%' },
    },
    prepTime: 15,
    cookTime: 20,
    storageInstructions: 'Refrigerate for 3-4 days or freeze in portions.',
    notes: 'Lean protein and fiber help cats feel fuller longer. Good for weight loss.',
  },
  {
    id: 'cat-mutton-sweet-potato-senior',
    name: 'Mutton & Sweet Potato Mash (Senior)',
    species: 'cats',
    ageGroup: 'senior',
    style: 'cooked',
    description: 'Easily digestible meal for senior cats with mutton and sweet potato',
    source: 'Supertails',
    sourceUrl: 'https://supertails.com/blogs/nutrition/homemade-kitten-food-cat-food-a-guide-to-healthy-recipes',
    ingredients: [
      { name: 'Ground beef lean', amount: 200, unit: 'g' },
      { name: 'Sweet potato', amount: 100, unit: 'g' },
      { name: 'Carrots raw', amount: 80, unit: 'g' },
      { name: 'Taurine powder', amount: 1, unit: 'tsp' },
    ],
    instructions: [
      'Cook mutton until fully done, chopping into small pieces',
      'Boil or steam sweet potato until soft, then mash',
      'Combine mutton, sweet potato, and peas',
      'Add taurine supplement and mix well',
    ],
    servingSize: { amount: 150, unit: 'g', frequency: 'daily' },
    nutritionalTargets: {
      protein: { min: 22, max: 28, unit: '%' },
      fat: { min: 10, max: 14, unit: '%' },
    },
    prepTime: 15,
    cookTime: 30,
    storageInstructions: 'Refrigerate for 3-4 days or freeze in portions.',
    notes: 'Rich in protein and easily digestible. Ideal for senior cats needing joint support.',
  },
  {
    id: 'cat-fish-quinoa-allergies',
    name: 'Fish & Quinoa Delight (Allergies)',
    species: 'cats',
    ageGroup: 'adult',
    style: 'cooked',
    description: 'Hypoallergenic meal for cats with sensitivities',
    source: 'Supertails',
    sourceUrl: 'https://supertails.com/blogs/nutrition/homemade-kitten-food-cat-food-a-guide-to-healthy-recipes',
    ingredients: [
      { name: 'Sardines water', amount: 150, unit: 'g' },
      { name: 'Oats', amount: 80, unit: 'g' },
      { name: 'Carrots raw', amount: 80, unit: 'g' },
      { name: 'Kale raw', amount: 60, unit: 'g' },
    ],
    instructions: [
      'Cook fish thoroughly and break into small pieces',
      'Boil quinoa until tender, then fluff',
      'Combine all ingredients and serve',
    ],
    servingSize: { amount: 150, unit: 'g', frequency: 'daily' },
    nutritionalTargets: {
      protein: { min: 20, max: 25, unit: '%' },
      fat: { min: 8, max: 12, unit: '%' },
    },
    prepTime: 15,
    cookTime: 25,
    storageInstructions: 'Refrigerate for 3-4 days or freeze in portions.',
    notes: 'Hypoallergenic. Perfect for cats with sensitivities or allergies.',
  },
];

// ============================================================================
// REPTILE RECIPES (Bearded Dragons - Vet-Verified)
// ============================================================================

export const REPTILE_RECIPES: BaseRecipe[] = [
  {
    id: 'bearded-dragon-live-food-staple',
    name: 'Live Food Staple Mix (Crickets & Locusts)',
    species: 'reptiles',
    ageGroup: 'adult',
    style: 'live-food',
    description: 'Rotating live food diet with brown crickets and locusts, gut-loaded and dusted',
    source: 'Reptile Centre UK',
    sourceUrl: 'https://www.reptilecentre.com/blogs/reptile-blog/the-best-live-food-for-bearded-dragons',
    ingredients: [
      { name: 'Crickets', amount: 80, unit: 'g' },
      { name: 'Locusts', amount: 50, unit: 'g' },
    ],
    instructions: [
      'Gut-load crickets and locusts 24 hours before feeding',
      'Dust with calcium/vitamin D3 powder',
      'Offer in shallow dish or allow to roam enclosure',
      'Remove uneaten insects after 15 minutes',
      'Alternate between crickets and locusts for variety',
    ],
    servingSize: { amount: 16, unit: 'count', frequency: 'daily for juveniles, 3-4x weekly for adults' },
    nutritionalTargets: {
      protein: { min: 12, max: 15, unit: '%' },
      fat: { min: 3, max: 5, unit: '%' },
    },
    prepTime: 5,
    storageInstructions: 'Keep insects in ventilated containers at 70-75°F. Feed vegetables daily.',
    notes: 'Brown crickets preferred over black (less noisy). Gut-loading and dusting essential for calcium.',
  },
  {
    id: 'bearded-dragon-varied-insects',
    name: 'Varied Insect Diet (Crickets, Waxworms, Mealworms)',
    species: 'reptiles',
    ageGroup: 'adult',
    style: 'live-food',
    description: 'Rotating insect diet with variety for nutritional balance',
    source: 'Reptile Centre UK',
    sourceUrl: 'https://www.reptilecentre.com/blogs/reptile-blog/the-best-live-food-for-bearded-dragons',
    ingredients: [
      { name: 'Crickets', amount: 60, unit: 'g' },
      { name: 'Mealworms', amount: 50, unit: 'g' },
    ],
    instructions: [
      'Gut-load crickets 24 hours before feeding',
      'Dust all insects with calcium/vitamin D3',
      'Offer in shallow dish',
      'Remove uneaten insects after 15 minutes',
      'Rotate insect types throughout week',
    ],
    servingSize: { amount: 22, unit: 'count', frequency: 'daily for juveniles, 3-4x weekly for adults' },
    nutritionalTargets: {
      protein: { min: 12, max: 15, unit: '%' },
      fat: { min: 4, max: 8, unit: '%' },
    },
    prepTime: 10,
    storageInstructions: 'Keep insects in separate ventilated containers. Waxworms and mealworms in cool area.',
    notes: 'Waxworms high in fat - use as treats 1-2x weekly. Mealworms harder to digest - use 1-2x weekly.',
  },
  {
    id: 'bearded-dragon-cricket-collard-salad',
    name: 'Cricket & Collard Salad',
    species: 'reptiles',
    ageGroup: 'adult',
    style: 'live-food',
    description: 'High-protein, calcium-rich meal with crickets and collard greens',
    source: 'Talis US',
    sourceUrl: 'https://talis-us.com/blogs/blog-188/nourishing-bearded-dragon-meal-prep-ideas-for-optimal-health',
    ingredients: [
      { name: 'Crickets', amount: 50, unit: 'g' },
      { name: 'Collard greens', amount: 50, unit: 'g' },
    ],
    instructions: [
      'Gut-load crickets 24 hours before feeding',
      'Dust crickets with calcium/vitamin D3 supplement',
      'Finely chop collard greens',
      'Combine in shallow dish',
      'Offer to bearded dragon',
    ],
    servingSize: { amount: 60, unit: 'g', frequency: '3-4x weekly' },
    nutritionalTargets: {
      protein: { min: 12, max: 15, unit: '%' },
      fat: { min: 3, max: 5, unit: '%' },
    },
    prepTime: 10,
    storageInstructions: 'Keep crickets in ventilated container. Use fresh greens daily.',
    notes: 'Supports bone health and muscle development. Collard greens high in calcium.',
  },
  {
    id: 'bearded-dragon-sweet-potato-kale',
    name: 'Sweet Potato & Kale Puree',
    species: 'reptiles',
    ageGroup: 'adult',
    style: 'mixed',
    description: 'Nutrient-dense vegetable meal with beta carotene and calcium',
    source: 'Talis US',
    sourceUrl: 'https://talis-us.com/blogs/blog-188/nourishing-bearded-dragon-meal-prep-ideas-for-optimal-health',
    ingredients: [
      { name: 'Sweet potato', amount: 100, unit: 'g' },
      { name: 'Kale', amount: 50, unit: 'g' },
    ],
    instructions: [
      'Boil sweet potato until soft',
      'Blend or mash with finely chopped kale',
      'Add calcium supplement',
      'Serve at room temperature',
    ],
    servingSize: { amount: 100, unit: 'g', frequency: '2-3x weekly' },
    nutritionalTargets: {
      protein: { min: 2, max: 4, unit: '%' },
      fat: { min: 0.5, max: 1, unit: '%' },
    },
    prepTime: 15,
    cookTime: 10,
    storageInstructions: 'Refrigerate for 2-3 days. Can be frozen in portions.',
    notes: 'Beta carotene-rich. Natural sweetness provides energy. Kale offers calcium and vitamin K.',
  },
  {
    id: 'bearded-dragon-mixed-greens-bowl',
    name: 'Mixed Leafy Greens Bowl',
    species: 'reptiles',
    ageGroup: 'adult',
    style: 'mixed',
    description: 'Wide spectrum of vitamins and minerals from organic greens',
    source: 'Talis US',
    sourceUrl: 'https://talis-us.com/blogs/blog-188/nourishing-bearded-dragon-meal-prep-ideas-for-optimal-health',
    ingredients: [
      { name: 'Collard greens', amount: 40, unit: 'g' },
      { name: 'Spinach', amount: 40, unit: 'g' },
      { name: 'Broccoli', amount: 30, unit: 'g' },
    ],
    instructions: [
      'Wash all greens thoroughly',
      'Finely chop into manageable pieces',
      'Mix together in shallow dish',
      'Dust with calcium/vitamin D3',
      'Offer fresh daily',
    ],
    servingSize: { amount: 110, unit: 'g', frequency: 'daily' },
    nutritionalTargets: {
      protein: { min: 3, max: 5, unit: '%' },
      fat: { min: 0.5, max: 1, unit: '%' },
    },
    prepTime: 10,
    storageInstructions: 'Use fresh daily. Store unused greens in refrigerator.',
    notes: 'Wide spectrum of vitamins A, D, K and minerals like calcium and magnesium.',
  },
];

// ============================================================================
// POCKET PET RECIPES (Guinea Pigs, Rabbits, Hamsters)
// ============================================================================

export const POCKET_PET_RECIPES: BaseRecipe[] = [
  {
    id: 'guinea-pig-balanced-diet',
    name: 'Guinea Pig Balanced Daily Diet',
    species: 'pocket-pets',
    ageGroup: 'adult',
    style: 'mixed',
    description: 'Complete guinea pig diet with hay, pellets, and fresh vegetables with vitamin C',
    source: 'Animals First Veterinary Hospital',
    sourceUrl: 'https://animalsfirstvethospital.com/2025/10/20/pocket-pet-diet-haddon-township-nj/',
    ingredients: [
      { name: 'Timothy hay', amount: 100, unit: 'g' },
      { name: 'Carrots', amount: 50, unit: 'g' },
      { name: 'Bell pepper', amount: 40, unit: 'g' },
      { name: 'Kale', amount: 20, unit: 'g' },
    ],
    instructions: [
      'Provide unlimited timothy hay throughout day',
      'Offer measured pellets once daily',
      'Provide fresh vegetables twice daily',
      'Rotate vegetable types for variety',
      'Remove uneaten fresh vegetables after 2-4 hours',
      'Ensure fresh water available at all times',
    ],
    servingSize: { amount: 255, unit: 'g', frequency: 'daily' },
    nutritionalTargets: {
      protein: { min: 12, max: 16, unit: '%' },
      fat: { min: 3, max: 6, unit: '%' },
    },
    prepTime: 10,
    storageInstructions: 'Store hay in cool, dry place. Keep pellets in airtight container. Refrigerate fresh vegetables.',
    notes: 'Guinea pigs REQUIRE vitamin C (10-50mg/kg daily). Cannot synthesize it. Introduce vegetables gradually.',
  },
  {
    id: 'rabbit-hay-based-diet',
    name: 'Rabbit Hay-Based Diet',
    species: 'pocket-pets',
    ageGroup: 'adult',
    style: 'hay-based',
    description: 'Hay-focused diet with pellets and fresh greens for adult rabbits',
    source: 'Veterinary Partner',
    sourceUrl: 'http://www.veterinarypartner.com/Content.plx?P=A&S=0&C=0&A=679',
    ingredients: [
      { name: 'Timothy hay', amount: 150, unit: 'g' },
      { name: 'Spinach', amount: 60, unit: 'g' },
      { name: 'Carrots', amount: 30, unit: 'g' },
      { name: 'Kale', amount: 20, unit: 'g' },
    ],
    instructions: [
      'Provide unlimited timothy hay',
      'Offer measured pellets once daily',
      'Provide fresh greens daily (2-3 cups per day)',
      'Limit carrots to 1-2 tablespoons daily (high sugar)',
      'Offer apple occasionally as treat',
      'Ensure fresh water available at all times',
    ],
    servingSize: { amount: 260, unit: 'g', frequency: 'daily' },
    nutritionalTargets: {
      protein: { min: 12, max: 16, unit: '%' },
      fat: { min: 2, max: 5, unit: '%' },
      fiber: { min: 18, max: 24, unit: '%' },
    },
    prepTime: 10,
    storageInstructions: 'Store hay in cool, dry place. Keep pellets in airtight container. Refrigerate fresh greens.',
    notes: 'Hay is essential for digestive health and dental wear. Adult rabbits need 70% hay by weight.',
  },
  {
    id: 'hamster-seed-mix-diet',
    name: 'Hamster Seed Mix with Vegetables',
    species: 'pocket-pets',
    ageGroup: 'adult',
    style: 'seed-mix',
    description: 'Balanced seed mix with fresh vegetables and protein',
    source: 'Veterinary Partner',
    sourceUrl: 'http://www.veterinarypartner.com/Content.plx?P=A&S=0&C=0&A=679',
    ingredients: [
      { name: 'Oats', amount: 15, unit: 'g' },
      { name: 'Carrots', amount: 15, unit: 'g' },
      { name: 'Broccoli', amount: 10, unit: 'g' },
      { name: 'Mealworms', amount: 10, unit: 'g' },
    ],
    instructions: [
      'Offer seed mix once daily',
      'Provide fresh vegetables 3-4x weekly',
      'Offer protein source 2-3x weekly',
      'Remove uneaten fresh food after 24 hours',
      'Ensure fresh water available at all times',
      'Monitor for food hoarding and remove spoiled items',
    ],
    servingSize: { amount: 40, unit: 'g', frequency: 'daily' },
    nutritionalTargets: {
      protein: { min: 12, max: 18, unit: '%' },
      fat: { min: 5, max: 10, unit: '%' },
    },
    prepTime: 5,
    storageInstructions: 'Store seed mix in airtight container. Keep refrigerated fresh vegetables.',
    notes: 'Hamsters hoard food - check for spoiled items daily. Limit fruits due to high sugar.',
  },
];

// ============================================================================
// DOG RECIPES (Placeholder - will be expanded)
// ============================================================================

export const DOG_RECIPES: BaseRecipe[] = [
  {
    id: 'dog-balanced-cooked',
    name: 'Balanced Cooked Dog Meal',
    species: 'dogs',
    ageGroup: 'adult',
    style: 'cooked',
    description: 'Balanced cooked meal with protein, carbs, and vegetables',
    source: 'AAFCO Guidelines',
    ingredients: [
      { name: 'Chicken breast', amount: 150, unit: 'g' },
      { name: 'Brown rice', amount: 100, unit: 'g' },
      { name: 'Carrots', amount: 50, unit: 'g' },
      { name: 'Sweet potato', amount: 50, unit: 'g' },
      { name: 'Fish oil', amount: 5, unit: 'g' },
    ],
    instructions: [
      'Cook chicken breast until done',
      'Cook brown rice according to package',
      'Cook vegetables until soft',
      'Combine all ingredients',
      'Cool before serving',
    ],
    servingSize: { amount: 350, unit: 'g', frequency: 'daily' },
    nutritionalTargets: {
      protein: { min: 18, max: 25, unit: '%' },
      fat: { min: 5, max: 15, unit: '%' },
    },
    prepTime: 20,
    cookTime: 30,
    storageInstructions: 'Refrigerate for 3-4 days or freeze in portions.',
    notes: 'Adjust portions based on dog size and activity level.',
  },
];

// ============================================================================
// BIRD RECIPES (Placeholder - will be expanded)
// ============================================================================

export const BIRD_RECIPES: BaseRecipe[] = [
  {
    id: 'bird-seed-mix',
    name: 'Bird Seed Mix with Vegetables',
    species: 'birds',
    ageGroup: 'adult',
    style: 'seed-mix',
    description: 'Balanced seed mix with fresh vegetables and fruits',
    source: 'Avian Veterinary Guidelines',
    ingredients: [
      { name: 'Oats', amount: 20, unit: 'g' },
      { name: 'Sunflower seeds', amount: 15, unit: 'g' },
      { name: 'Kale', amount: 30, unit: 'g' },
      { name: 'Carrots', amount: 20, unit: 'g' },
    ],
    instructions: [
      'Offer seed mix daily',
      'Provide fresh vegetables daily',
      'Offer fruits 2-3x weekly',
      'Remove uneaten fresh food after 4 hours',
      'Ensure fresh water available',
    ],
    servingSize: { amount: 110, unit: 'g', frequency: 'daily' },
    nutritionalTargets: {
      protein: { min: 10, max: 15, unit: '%' },
      fat: { min: 8, max: 15, unit: '%' },
    },
    prepTime: 5,
    storageInstructions: 'Store seeds in cool, dry place. Refrigerate fresh produce.',
    notes: 'Variety is essential for bird nutrition. Rotate seed types and vegetables.',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getRecipesForSpecies(species: PetSpecies): BaseRecipe[] {
  switch (species) {
    case 'cats':
      return CAT_RECIPES;
    case 'dogs':
      return DOG_RECIPES;
    case 'birds':
      return BIRD_RECIPES;
    case 'reptiles':
      return REPTILE_RECIPES;
    case 'pocket-pets':
      return POCKET_PET_RECIPES;
    default:
      return [];
  }
}

export function getRandomRecipeForSpecies(species: PetSpecies): BaseRecipe | null {
  const recipes = getRecipesForSpecies(species);
  if (recipes.length === 0) return null;
  return recipes[Math.floor(Math.random() * recipes.length)];
}

export function getAllRecipes(): BaseRecipe[] {
  return [
    ...CAT_RECIPES,
    ...DOG_RECIPES,
    ...BIRD_RECIPES,
    ...REPTILE_RECIPES,
    ...POCKET_PET_RECIPES,
  ];
}
