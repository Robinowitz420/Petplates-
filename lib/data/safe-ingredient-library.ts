// lib/data/safe-ingredient-library.ts
// Curated, species-safe ingredient pools and toxic lists to drive deterministic recipe generation.

export type SpeciesKey = 'dogs' | 'cats' | 'birds' | 'reptiles' | 'pocket-pets';

export interface SafePool {
  proteins?: string[];
  fish?: string[];
  organMeats?: string[];
  vegetables?: string[];
  fruits?: string[];
  grains?: string[];
  fats?: string[];
  seeds?: string[];
  supplements?: string[];
  hay?: string[];
  legumes?: string[];
}

export const SAFE_INGREDIENT_LIBRARY: Record<string, SafePool> = {
  dog: {
    proteins: [
      'chicken breast', 'chicken thighs', 'turkey', 'beef', 'lamb', 
      'salmon', 'whitefish', 'duck', 'venison', 'bison', 'pork',
      'eggs', 'cottage cheese', 'greek yogurt', 'sardines', 'mackerel',
      'quail', 'rabbit', 'turkey liver', 'chicken liver', 'beef liver',
      'chicken hearts', 'beef kidney'
    ],
    vegetables: [
      'sweet potato', 'pumpkin', 'carrots', 'green beans', 'peas',
      'broccoli', 'spinach', 'kale', 'zucchini', 'butternut squash',
      'brussels sprouts', 'cauliflower', 'celery', 'cucumber',
      'asparagus', 'beets', 'bok choy', 'cabbage', 'collard greens',
      'parsley', 'cilantro', 'basil'
    ],
    fruits: [
      'blueberries', 'strawberries', 'apples', 'bananas', 'watermelon',
      'cantaloupe', 'cranberries', 'raspberries', 'blackberries',
      'pears', 'mangoes', 'peaches', 'pineapple'
    ],
    grains: [
      'brown rice', 'white rice', 'oats', 'quinoa', 'barley',
      'sweet potato', 'regular potato', 'buckwheat', 'millet'
    ],
    fats: [
      'olive oil', 'coconut oil', 'fish oil', 'flaxseed oil',
      'sunflower oil', 'salmon oil'
    ],
    supplements: [
      'bone broth', 'kelp powder', 'turmeric', 'spirulina',
      'eggshells (crushed)', 'chia seeds', 'pumpkin seeds'
    ]
  },
  
  cat: {
    proteins: [ // Cats need MORE protein, less carbs
      'chicken breast', 'chicken thighs', 'turkey', 'duck',
      'salmon', 'tuna', 'sardines', 'mackerel', 'whitefish',
      'beef', 'lamb', 'rabbit', 'quail', 'venison',
      'chicken liver', 'chicken hearts', 'turkey liver',
      'eggs', 'cottage cheese'
    ],
    vegetables: [ // Cats need VERY LITTLE, but safe options:
      'pumpkin', 'carrots', 'green beans', 'peas',
      'spinach', 'zucchini', 'broccoli (small amounts)'
    ],
    fruits: [ // Minimal for cats
      'blueberries (small amounts)', 'cranberries (small amounts)'
    ],
    grains: [ // Optional, cats are obligate carnivores
      'brown rice (small amounts)', 'oats (small amounts)'
    ],
    fats: [
      'fish oil', 'salmon oil', 'chicken fat', 'olive oil (small amounts)'
    ],
    supplements: [
      'taurine powder', 'bone broth', 'kelp powder',
      'eggshells (crushed)', 'fish oil'
    ]
  },
  
  bird: {
    seeds: [
      'millet', 'canary seed', 'oats', 'quinoa', 'buckwheat',
      'flax seeds', 'chia seeds', 'hemp seeds', 'sunflower seeds (limited)',
      'pumpkin seeds', 'sesame seeds'
    ],
    vegetables: [
      'leafy greens', 'kale', 'collard greens', 'mustard greens',
      'dandelion greens', 'carrots', 'sweet potato', 'squash',
      'bell peppers', 'broccoli', 'cauliflower', 'peas',
      'green beans', 'corn', 'beets', 'cucumber'
    ],
    fruits: [
      'apples', 'berries', 'melons', 'papaya', 'mango',
      'grapes (limited)', 'pomegranate', 'oranges', 'bananas',
      'cherries (no pits)', 'peaches', 'pears'
    ],
    proteins: [
      'cooked eggs', 'cooked chicken (small amounts)',
      'cooked fish (small amounts)', 'mealworms', 'crickets'
    ],
    legumes: [
      'lentils (cooked)', 'chickpeas (cooked)', 'black beans (cooked)',
      'kidney beans (cooked)'
    ],
    supplements: [
      'cuttlebone', 'mineral block', 'calcium powder',
      'spirulina', 'bee pollen'
    ]
  },
  
  reptile: {
    // Note: Reptiles are split by type in the generator, but we define pools here
    vegetables: [
      'collard greens', 'mustard greens', 'turnip greens',
      'dandelion greens', 'kale', 'bok choy', 'endive',
      'escarole', 'butternut squash', 'acorn squash',
      'bell peppers', 'green beans', 'snap peas'
    ],
    fruits: [
      'papaya', 'mango', 'berries', 'figs', 'melon',
      'prickly pear', 'hibiscus flowers'
    ],
    proteins: [
        'crickets', 'dubia roaches', 'mealworms', 'superworms',
        'silkworms', 'hornworms', 'cooked chicken (small amounts)',
        'cooked eggs', 'whole prey (mice, rats)', 'ground turkey', 'beef heart'
    ],
    supplements: [
      'calcium powder', 'vitamin D3', 'cuttlebone'
    ]
  },
  
  'pocket-pet': {
      proteins: [
        'mealworms', 'crickets', 'cooked chicken (small amounts)',
        'cooked eggs', 'tofu (small amounts)'
      ],
      vegetables: [
        'carrots', 'broccoli', 'cucumber', 'bell peppers',
        'spinach', 'cauliflower', 'peas', 'corn', 'kale', 'parsley',
        'romaine lettuce', 'cilantro', 'green beans', 'arugula', 'bok choy', 'mint'
      ],
      fruits: [
        'apples', 'bananas', 'berries', 'melon', 'grapes (limited)', 
        'oranges', 'strawberries', 'kiwi', 'papaya'
      ],
      grains: [
        'oats', 'barley', 'wheat', 'millet', 'brown rice'
      ],
      seeds: [
        'sunflower seeds', 'pumpkin seeds', 'flax seeds'
      ],
      hay: [
        'timothy hay', 'orchard grass', 'meadow hay', 'oat hay'
      ],
      supplements: [
        'vitamin C drops'
      ]
  }
};

// Add TOXIC ingredients to AVOID
export const TOXIC_INGREDIENTS: Record<string, string[]> = {
  dog: [
    'chocolate', 'grapes', 'raisins', 'onions', 'garlic', 'xylitol',
    'avocado', 'macadamia nuts', 'alcohol', 'caffeine', 'raw yeast dough',
    'hops', 'moldy food', 'nutmeg', 'chives', 'leeks'
  ],
  cat: [
    'chocolate', 'grapes', 'raisins', 'onions', 'garlic', 'xylitol',
    'alcohol', 'caffeine', 'raw dough', 'chives', 'leeks',
    'lilies (plants)', 'raw fish (large amounts)', 'milk (adult cats)'
  ],
  bird: [
    'avocado', 'chocolate', 'salt', 'caffeine', 'alcohol',
    'onions', 'garlic', 'apple seeds', 'stone fruit pits',
    'raw beans', 'mushrooms'
  ],
  reptile: [
    'avocado', 'rhubarb', 'spinach (large amounts)', 'iceberg lettuce',
    'fireflies', 'wild-caught insects'
  ],
  'pocket-pet': [
    'chocolate', 'onions', 'garlic', 'raw beans', 'potato leaves',
    'rhubarb', 'avocado', 'apple seeds'
  ]
};