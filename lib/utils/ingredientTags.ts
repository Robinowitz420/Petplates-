import { normalizeIngredientKey } from '@/lib/utils/enhancedCompatibilityScoring';
import { checkBirdToxicIngredients, calculatePelletPercentage } from '@/lib/data/birdNutritionRules';
import { calculateHayPercentage, checkVitaminCSources } from '@/lib/data/pocketPetRequirements';

export type IngredientLike = string | { name?: string; amount?: string | number };

function parseAmountToGrams(amount: unknown, fallback = 100): number {
  if (typeof amount === 'number' && Number.isFinite(amount)) return amount;
  if (typeof amount === 'string') {
    const parsed = parseFloat(amount.replace(/[^0-9.]/g, ''));
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

export function extractIngredientNames(ingredients: IngredientLike[]): string[] {
  return (ingredients || []).map((ing) => (typeof ing === 'string' ? ing : (ing?.name || ''))).filter(Boolean);
}

export function extractNormalizedIngredientKeys(ingredients: IngredientLike[]): string[] {
  return extractIngredientNames(ingredients).map((n) => normalizeIngredientKey(n));
}

export function isPelletIngredient(name: string): boolean {
  const n = String(name || '').toLowerCase();
  return n.includes('pellet') || n.includes('kibble') || n.includes('fortified diet');
}

export function isHayIngredient(name: string): boolean {
  const n = String(name || '').toLowerCase();
  return n.includes('hay') || n.includes('timothy') || n.includes('orchard grass');
}

export function isCalciumSupportIngredient(name: string): boolean {
  const k = normalizeIngredientKey(name);
  const n = String(name || '').toLowerCase();
  return (
    k.includes('calcium') ||
    n.includes('cuttlebone') ||
    n.includes('mineral block') ||
    n.includes('egg shell') ||
    n.includes('eggshell')
  );
}

export function calculateIngredientPercentage(
  recipe: { ingredients?: IngredientLike[] },
  predicate: (name: string, key: string) => boolean
): number {
  const ingredients = (recipe?.ingredients || []) as IngredientLike[];
  let matchGrams = 0;
  let totalGrams = 0;

  for (const ing of ingredients) {
    const name = typeof ing === 'string' ? ing : (ing?.name || '');
    const grams = typeof ing === 'string' ? 100 : parseAmountToGrams((ing as any)?.amount);
    const key = normalizeIngredientKey(name);

    totalGrams += grams;
    if (predicate(name, key)) {
      matchGrams += grams;
    }
  }

  return totalGrams > 0 ? (matchGrams / totalGrams) * 100 : 0;
}

export function getPelletPercentage(recipe: any): number {
  return calculatePelletPercentage(recipe);
}

export function getHayPercentage(recipe: any): number {
  return calculateHayPercentage(recipe);
}

export function hasVitaminCSource(recipe: any): boolean {
  const names = extractIngredientNames((recipe?.ingredients || []) as IngredientLike[]);
  return checkVitaminCSources(names);
}

export function findBirdToxicIngredients(recipe: any): string[] {
  const names = extractIngredientNames((recipe?.ingredients || []) as IngredientLike[]);
  return checkBirdToxicIngredients(names);
}
