// Sample recipe data (expand as needed). Make sure this file exists at lib/data/recipes-complete.ts
export type RecipeType = {
  id: string;
  name: string;
  category: 'dogs' | 'cats' | 'birds' | 'reptiles' | 'pocket-pets';
  ageGroup: Array<'baby' | 'young' | 'adult' | 'senior'>;
  healthConcerns: string[]; // tags
  imageUrl?: string;
  description?: string;
  rating: number;
  reviews: number;
  prepTime?: string;
  ingredients: { name: string; amount: string }[];
  steps: string[];
  nutrition: {
    calories?: number;
    protein_g?: number;
    fat_g?: number;
    carbs_g?: number;
    fiber_g?: number;
    calcium_mg?: number;
    phosphorus_mg?: number;
    vitamins?: Record<string, string>;
  };
  celebrityQuote?: string; // permanently-assigned per recipe
};

export const recipes: RecipeType[] = [
  {
    id: 'r-chicken-rice-dog',
    name: 'Homey Chicken & Rice Bowl',
    category: 'dogs',
    ageGroup: ['young', 'adult', 'senior'],
    healthConcerns: ['sensitive stomach'],
    imageUrl: '/images/chicken-rice.jpg',
    description: 'Gently cooked chicken, white rice and steamed veggies — simple and digestible.',
    rating: 4.8,
    reviews: 127,
    prepTime: '35 min',
    ingredients: [
      { name: 'Boneless skinless chicken breast', amount: '350 g' },
      { name: 'White rice (cooked)', amount: '1.5 cups' },
      { name: 'Carrot, diced', amount: '1/2 cup' },
      { name: 'Peas', amount: '1/4 cup' },
      { name: 'Olive oil', amount: '1 tsp' },
      { name: 'Water or low-sodium chicken broth', amount: '1 cup' },
    ],
    steps: [
      'Dice chicken and sauté lightly in olive oil until cooked through.',
      'Add vegetables and a splash of water / broth; simmer until veggies are tender.',
      'Mix cooked rice into chicken/veggies, cool to room temperature before serving.',
    ],
    nutrition: {
      calories: 320,
      protein_g: 28,
      fat_g: 7,
      carbs_g: 30,
      fiber_g: 3,
      calcium_mg: 30,
      phosphorus_mg: 200,
      vitamins: { A: '15% RDI', C: '6% RDI' },
    },
    celebrityQuote: "Bark Obama: \"My fellow canines, this bowl is a unifier — it brings tails together.\"",
  },
  {
    id: 'r-salmon-delight-cat',
    name: 'Purrfect Salmon Delight',
    category: 'cats',
    ageGroup: ['young', 'adult'],
    healthConcerns: ['allergies'],
    imageUrl: '/images/salmon-delight.jpg',
    description: 'Oven baked salmon mixed with pumpkin and cat-friendly herbs.',
    rating: 4.9,
    reviews: 89,
    prepTime: '25 min',
    ingredients: [
      { name: 'Fresh salmon', amount: '150 g' },
      { name: 'Canned pumpkin (no sugar)', amount: '2 tbsp' },
      { name: 'Catnip (optional)', amount: 'pinch' },
    ],
    steps: [
      'Bake salmon until flaky, remove bones and flake into pieces.',
      'Mix with pumpkin and allow to cool before serving.',
    ],
    nutrition: {
      calories: 220,
      protein_g: 22,
      fat_g: 12,
      carbs_g: 3,
      fiber_g: 1,
      calcium_mg: 20,
      phosphorus_mg: 180,
      vitamins: { B12: '35% RDI', D: '10% RDI' },
    },
    celebrityQuote: "Meowly Cyrus: \"This salmon is a wrecking ball of flavor — I approve.\"",
  },
  // Add more recipes here, each with a unique id and celebrityQuote.
];