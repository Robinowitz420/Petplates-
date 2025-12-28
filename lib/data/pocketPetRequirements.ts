export interface PocketPetRequirements {
  protein: { min: number; max: number; unit: string };
  fat: { min: number; max: number; unit: string };
  fiber: { min: number; max: number; unit: string; critical: boolean };
  calcium?: { min: number; max?: number; unit: string };
  vitaminC?: { min: number; unit: string; critical: boolean };
  hayPercentage: { min: number; ideal: number };
  treatLimit: { max: number; unit: string };
}

export const POCKET_PET_REQUIREMENTS: Record<string, PocketPetRequirements> = {
  hamster: {
    protein: { min: 16, max: 24, unit: '% DM' },
    fat: { min: 4, max: 10, unit: '% DM' },
    fiber: { min: 8, max: 15, unit: '% DM', critical: true },
    calcium: { min: 0.6, max: 1.0, unit: '% DM' },
    hayPercentage: { min: 30, ideal: 40 },
    treatLimit: { max: 10, unit: '% of diet' },
  },
  gerbil: {
    protein: { min: 14, max: 22, unit: '% DM' },
    fat: { min: 4, max: 9, unit: '% DM' },
    fiber: { min: 6, max: 12, unit: '% DM', critical: true },
    calcium: { min: 0.5, max: 0.9, unit: '% DM' },
    hayPercentage: { min: 25, ideal: 35 },
    treatLimit: { max: 10, unit: '% of diet' },
  },
  mouse: {
    protein: { min: 14, max: 20, unit: '% DM' },
    fat: { min: 4, max: 8, unit: '% DM' },
    fiber: { min: 6, max: 12, unit: '% DM', critical: true },
    calcium: { min: 0.5, max: 0.8, unit: '% DM' },
    hayPercentage: { min: 20, ideal: 30 },
    treatLimit: { max: 10, unit: '% of diet' },
  },
  rat: {
    protein: { min: 14, max: 20, unit: '% DM' },
    fat: { min: 4, max: 8, unit: '% DM' },
    fiber: { min: 6, max: 12, unit: '% DM', critical: true },
    calcium: { min: 0.5, max: 0.8, unit: '% DM' },
    hayPercentage: { min: 20, ideal: 30 },
    treatLimit: { max: 10, unit: '% of diet' },
  },
  rabbit: {
    protein: { min: 14, max: 18, unit: '% DM' },
    fat: { min: 2, max: 5, unit: '% DM' },
    fiber: { min: 18, max: 25, unit: '% DM', critical: true },
    calcium: { min: 0.4, max: 1.0, unit: '% DM' },
    hayPercentage: { min: 80, ideal: 90 },
    treatLimit: { max: 5, unit: '% of diet' },
  },
  guinea_pig: {
    protein: { min: 16, max: 20, unit: '% DM' },
    fat: { min: 3, max: 6, unit: '% DM' },
    fiber: { min: 12, max: 20, unit: '% DM', critical: true },
    vitaminC: { min: 10, unit: 'mg/kg body weight/day', critical: true },
    calcium: { min: 0.4, max: 0.8, unit: '% DM' },
    hayPercentage: { min: 70, ideal: 80 },
    treatLimit: { max: 10, unit: '% of diet' },
  },
  chinchilla: {
    protein: { min: 16, max: 20, unit: '% DM' },
    fat: { min: 2, max: 5, unit: '% DM' },
    fiber: { min: 15, max: 25, unit: '% DM', critical: true },
    calcium: { min: 0.4, max: 0.8, unit: '% DM' },
    hayPercentage: { min: 70, ideal: 80 },
    treatLimit: { max: 5, unit: '% of diet' },
  },
  ferret: {
    protein: { min: 32, max: 38, unit: '% DM' },
    fat: { min: 15, max: 20, unit: '% DM' },
    fiber: { min: 0, max: 3, unit: '% DM', critical: true },
    calcium: { min: 0.8, max: 1.2, unit: '% DM' },
    hayPercentage: { min: 0, ideal: 0 },
    treatLimit: { max: 10, unit: '% of diet' },
  },
  sugar_glider: {
    protein: { min: 20, max: 30, unit: '% DM' },
    fat: { min: 8, max: 15, unit: '% DM' },
    fiber: { min: 2, max: 8, unit: '% DM', critical: true },
    calcium: { min: 0.8, max: 1.5, unit: '% DM' },
    hayPercentage: { min: 0, ideal: 0 },
    treatLimit: { max: 20, unit: '% of diet' },
  },
  hedgehog: {
    protein: { min: 28, max: 35, unit: '% DM' },
    fat: { min: 10, max: 15, unit: '% DM' },
    fiber: { min: 5, max: 15, unit: '% DM', critical: true },
    calcium: { min: 0.6, max: 1.2, unit: '% DM' },
    hayPercentage: { min: 0, ideal: 0 },
    treatLimit: { max: 15, unit: '% of diet' },
  },
};

export const POCKET_PET_TOXIC_FOODS = {
  all: ['chocolate', 'caffeine', 'alcohol', 'onion', 'garlic'],
  rabbits_guinea_pigs: [
    'iceberg lettuce',
    'potato leaves',
    'rhubarb',
    'tomato leaves',
    'avocado',
    'dairy products',
    'bread',
    'cereal',
    'nuts',
    'seeds',
  ],
  rodents: ['citrus fruits', 'raw beans', 'green potatoes', 'almonds', 'apple seeds', 'cherry pits', 'peach pits'],
  ferrets: ['grains', 'vegetables', 'fruits', 'dairy', 'sugar', 'xylitol', 'chocolate', 'caffeine'],
};

export function getPocketPetRequirements(breed: string): PocketPetRequirements {
  const b = String(breed || '').toLowerCase();
  const key = b.replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

  if (POCKET_PET_REQUIREMENTS[key]) return POCKET_PET_REQUIREMENTS[key];

  if (b.includes('rabbit') || b.includes('bunny')) return POCKET_PET_REQUIREMENTS.rabbit;
  if (b.includes('guinea') || b.includes('cavy')) return POCKET_PET_REQUIREMENTS.guinea_pig;
  if (b.includes('hamster')) return POCKET_PET_REQUIREMENTS.hamster;
  if (b.includes('chinchilla')) return POCKET_PET_REQUIREMENTS.chinchilla;
  if (b.includes('ferret')) return POCKET_PET_REQUIREMENTS.ferret;
  if (b.includes('sugar glider') || b.includes('glider')) return POCKET_PET_REQUIREMENTS.sugar_glider;
  if (b.includes('hedgehog')) return POCKET_PET_REQUIREMENTS.hedgehog;
  if (b.includes('gerbil')) return POCKET_PET_REQUIREMENTS.gerbil;
  if (b.includes('mouse')) return POCKET_PET_REQUIREMENTS.mouse;
  if (b.includes('rat')) return POCKET_PET_REQUIREMENTS.rat;

  return POCKET_PET_REQUIREMENTS.hamster;
}

export function checkVitaminCSources(ingredients: string[]): boolean {
  const vitaminCSources = [
    'bell pepper',
    'red pepper',
    'kale',
    'broccoli',
    'brussels sprouts',
    'parsley',
    'mustard greens',
    'collard greens',
    'guinea pig pellet',
    'vitamin c',
    'ascorbic acid',
  ];

  const list = Array.isArray(ingredients) ? ingredients : [];
  return list.some((ingredient) =>
    vitaminCSources.some((source) => String(ingredient || '').toLowerCase().includes(source))
  );
}

export function calculateHayPercentage(recipe: any): number {
  const ingredients = (recipe?.ingredients || []) as any[];

  let hayGrams = 0;
  let totalGrams = 0;

  for (const ing of ingredients) {
    const name = (typeof ing === 'string' ? ing : ing?.name || '').toLowerCase();
    const amount = typeof ing === 'string'
      ? 100
      : (typeof ing?.amount === 'number'
        ? ing.amount
        : (typeof ing?.amount === 'string'
          ? parseFloat(ing.amount.replace(/[^0-9.]/g, ''))
          : 100));

    const amountG = Number.isFinite(amount) ? amount : 100;

    if (name.includes('hay') || name.includes('timothy') || name.includes('orchard grass')) {
      hayGrams += amountG;
    }
    totalGrams += amountG;
  }

  return totalGrams > 0 ? (hayGrams / totalGrams) * 100 : 0;
}
