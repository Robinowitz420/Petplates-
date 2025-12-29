export interface BirdNutritionRequirements {
  protein: { min: number; max: number; unit: string };
  fat: { min: number; max: number; unit: string };
  fiber: { min: number; max: number; unit: string };
  calcium: { min: number; max: number; unit: string; critical: boolean };
  vitaminA: { min: number; unit: string; critical: boolean };
  idealCaPRatio: { ideal: number; min: number; max: number };
  pelletPercentage: { min: number; ideal: number };
}

export const BIRD_NUTRITION_STANDARDS: Record<string, BirdNutritionRequirements> = {
  parakeet_budgie: {
    protein: { min: 12, max: 18, unit: '% DM' },
    fat: { min: 3, max: 8, unit: '% DM' },
    fiber: { min: 3, max: 8, unit: '% DM' },
    calcium: { min: 0.3, max: 1.2, unit: '% DM', critical: true },
    vitaminA: { min: 2000, unit: 'IU/kg', critical: true },
    idealCaPRatio: { ideal: 2.0, min: 1.5, max: 2.5 },
    pelletPercentage: { min: 70, ideal: 80 },
  },
  cockatiel: {
    protein: { min: 14, max: 20, unit: '% DM' },
    fat: { min: 4, max: 10, unit: '% DM' },
    fiber: { min: 4, max: 10, unit: '% DM' },
    calcium: { min: 0.4, max: 1.5, unit: '% DM', critical: true },
    vitaminA: { min: 2500, unit: 'IU/kg', critical: true },
    idealCaPRatio: { ideal: 2.0, min: 1.5, max: 2.5 },
    pelletPercentage: { min: 70, ideal: 80 },
  },
  canary_finch: {
    protein: { min: 11, max: 16, unit: '% DM' },
    fat: { min: 3, max: 7, unit: '% DM' },
    fiber: { min: 3, max: 7, unit: '% DM' },
    calcium: { min: 0.3, max: 1.0, unit: '% DM', critical: true },
    vitaminA: { min: 1800, unit: 'IU/kg', critical: true },
    idealCaPRatio: { ideal: 1.8, min: 1.3, max: 2.3 },
    pelletPercentage: { min: 60, ideal: 70 },
  },
  african_grey: {
    protein: { min: 15, max: 22, unit: '% DM' },
    fat: { min: 5, max: 12, unit: '% DM' },
    fiber: { min: 5, max: 12, unit: '% DM' },
    calcium: { min: 0.5, max: 2.0, unit: '% DM', critical: true },
    vitaminA: { min: 5000, unit: 'IU/kg', critical: true },
    idealCaPRatio: { ideal: 2.0, min: 1.5, max: 2.5 },
    pelletPercentage: { min: 75, ideal: 85 },
  },
  macaw: {
    protein: { min: 15, max: 22, unit: '% DM' },
    fat: { min: 5, max: 12, unit: '% DM' },
    fiber: { min: 5, max: 12, unit: '% DM' },
    calcium: { min: 0.6, max: 2.2, unit: '% DM', critical: true },
    vitaminA: { min: 4000, unit: 'IU/kg', critical: true },
    idealCaPRatio: { ideal: 2.2, min: 1.7, max: 2.7 },
    pelletPercentage: { min: 70, ideal: 80 },
  },
  cockatoo: {
    protein: { min: 14, max: 21, unit: '% DM' },
    fat: { min: 4, max: 11, unit: '% DM' },
    fiber: { min: 4, max: 11, unit: '% DM' },
    calcium: { min: 0.5, max: 2.0, unit: '% DM', critical: true },
    vitaminA: { min: 3500, unit: 'IU/kg', critical: true },
    idealCaPRatio: { ideal: 2.0, min: 1.5, max: 2.5 },
    pelletPercentage: { min: 70, ideal: 80 },
  },
  conure: {
    protein: { min: 14, max: 20, unit: '% DM' },
    fat: { min: 4, max: 10, unit: '% DM' },
    fiber: { min: 4, max: 10, unit: '% DM' },
    calcium: { min: 0.4, max: 1.5, unit: '% DM', critical: true },
    vitaminA: { min: 3000, unit: 'IU/kg', critical: true },
    idealCaPRatio: { ideal: 2.0, min: 1.5, max: 2.5 },
    pelletPercentage: { min: 70, ideal: 80 },
  },
  lovebird: {
    protein: { min: 13, max: 19, unit: '% DM' },
    fat: { min: 4, max: 9, unit: '% DM' },
    fiber: { min: 4, max: 9, unit: '% DM' },
    calcium: { min: 0.4, max: 1.5, unit: '% DM', critical: true },
    vitaminA: { min: 2500, unit: 'IU/kg', critical: true },
    idealCaPRatio: { ideal: 2.0, min: 1.5, max: 2.5 },
    pelletPercentage: { min: 70, ideal: 80 },
  },
  quaker_parakeet: {
    protein: { min: 14, max: 20, unit: '% DM' },
    fat: { min: 4, max: 10, unit: '% DM' },
    fiber: { min: 4, max: 10, unit: '% DM' },
    calcium: { min: 0.4, max: 1.5, unit: '% DM', critical: true },
    vitaminA: { min: 3000, unit: 'IU/kg', critical: true },
    idealCaPRatio: { ideal: 2.0, min: 1.5, max: 2.5 },
    pelletPercentage: { min: 70, ideal: 80 },
  },
};

export const BIRD_TOXIC_FOODS: string[] = [
  'avocado',
  'chocolate',
  'caffeine',
  'alcohol',
  'onion',
  'garlic',
  'mushrooms',
  'apple seeds',
  'cherry pits',
  'peach pits',
  'apricot pits',
  'rhubarb',
  'tomato leaves',
  'eggplant leaves',
  'salt',
  'sugar',
  'artificial sweeteners',
  'persimmons',
  'raw beans',
  'moldy foods',
];

export function getBirdStandards(breed: string): BirdNutritionRequirements {
  const b = String(breed || '').toLowerCase();
  const key = b.replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

  if (BIRD_NUTRITION_STANDARDS[key]) return BIRD_NUTRITION_STANDARDS[key];

  if (b.includes('parakeet') || b.includes('budgie')) return BIRD_NUTRITION_STANDARDS.parakeet_budgie;
  if (b.includes('canary') || b.includes('finch')) return BIRD_NUTRITION_STANDARDS.canary_finch;
  if (b.includes('african grey') || b.includes('african-grey') || b.includes('grey')) return BIRD_NUTRITION_STANDARDS.african_grey;
  if (b.includes('macaw')) return BIRD_NUTRITION_STANDARDS.macaw;
  if (b.includes('cockatiel')) return BIRD_NUTRITION_STANDARDS.cockatiel;
  if (b.includes('cockatoo')) return BIRD_NUTRITION_STANDARDS.cockatoo;
  if (b.includes('conure')) return BIRD_NUTRITION_STANDARDS.conure;
  if (b.includes('lovebird')) return BIRD_NUTRITION_STANDARDS.lovebird;
  if (b.includes('quaker')) return BIRD_NUTRITION_STANDARDS.quaker_parakeet;

  return BIRD_NUTRITION_STANDARDS.cockatiel;
}

export function checkBirdToxicIngredients(ingredients: string[]): string[] {
  const found: string[] = [];
  const list = Array.isArray(ingredients) ? ingredients : [];

  for (const ing of list) {
    const lowerIng = String(ing || '').toLowerCase();
    for (const toxic of BIRD_TOXIC_FOODS) {
      if (lowerIng.includes(toxic)) {
        found.push(`${ing} (contains ${toxic})`);
      }
    }
  }

  return found;
}

export function calculatePelletPercentage(recipe: any): number {
  const ingredients = (recipe?.ingredients || []) as any[];

  let pelletGrams = 0;
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

    if (name.includes('pellet') || name.includes('fortified diet')) {
      pelletGrams += amountG;
    }
    totalGrams += amountG;
  }

  return totalGrams > 0 ? (pelletGrams / totalGrams) * 100 : 0;
}
