import { PortionPlan, Recipe, Species, PetNutritionProfile } from '@/lib/types';
import { healthConcernCalorieAdjustments } from './modifierRules';

const DEFAULT_CALORIES_PER_KG: Record<Species, number> = {
  dogs: 95,
  cats: 75,
};

const AGE_ADJUSTMENTS: Record<string, number> = {
  baby: +15,
  young: +5,
  adult: 0,
  senior: -10,
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const UNIT_TO_GRAMS: Record<string, number> = {
  g: 1,
  gram: 1,
  grams: 1,
  kg: 1000,
  mg: 0.001,
  oz: 28.35,
  ounce: 28.35,
  ounces: 28.35,
  lb: 453.59,
  lbs: 453.59,
  cup: 120,
  cups: 120,
  tbsp: 15,
  tablespoon: 15,
  tablespoons: 15,
  tsp: 5,
  teaspoon: 5,
  teaspoons: 5,
  ml: 1,
  liter: 1000,
};

const parseAmountToGrams = (amount: string | undefined): number => {
  if (!amount) return 0;
  const numericMatch = amount.match(/[\d.]+/);
  if (!numericMatch) return 0;
  const quantity = parseFloat(numericMatch[0]);
  const unit = amount
    .replace(numericMatch[0], '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, '');
  if (!unit) return quantity;
  const conversion = UNIT_TO_GRAMS[unit];
  return conversion ? quantity * conversion : quantity;
};

const parseCalories = (calorieString: string | undefined): number | null => {
  if (!calorieString) return null;
  const numericMatch = calorieString.match(/[\d.]+/);
  if (!numericMatch) return null;
  return parseFloat(numericMatch[0]);
};

export const calculateDailyPortion = (
  weightKg: number,
  caloriesPerKg: number
): number => Math.round(weightKg * caloriesPerKg);

export const getCaloriesPerKg = (
  profile: PetNutritionProfile
): { caloriesPerKg: number; notes: string[] } => {
  if (profile.caloriesPerKgOverride) {
    return {
      caloriesPerKg: profile.caloriesPerKgOverride,
      notes: ['User override applied'],
    };
  }

  const base = DEFAULT_CALORIES_PER_KG[profile.species];
  let caloriesPerKg = base;
  const notes: string[] = [`Base MER ${base} kcal/kg for ${profile.species}`];

  const ageAdj = AGE_ADJUSTMENTS[profile.ageGroup];
  if (typeof ageAdj === 'number' && ageAdj !== 0) {
    caloriesPerKg += ageAdj;
    notes.push(
      `Age adjustment (${profile.ageGroup}): ${
        ageAdj > 0 ? '+' : ''
      }${ageAdj} kcal/kg`
    );
  }

  (profile.healthConcerns || []).forEach((concern) => {
    const adj =
      healthConcernCalorieAdjustments[concern] ??
      healthConcernCalorieAdjustments[concern.replace(/\s+/g, '-').toLowerCase()];
    if (typeof adj === 'number' && adj !== 0) {
      caloriesPerKg += adj;
      notes.push(
        `Health adjustment (${concern}): ${adj > 0 ? '+' : ''}${adj} kcal/kg`
      );
    }
  });

  const clamped = clamp(caloriesPerKg, 55, 140);
  if (clamped !== caloriesPerKg) {
    notes.push('Calorie target clamped to safe bounds (55-140 kcal/kg).');
  }

  return {
    caloriesPerKg: clamped,
    notes,
  };
};

export const getPortionPlan = (
  recipe: Recipe,
  profile: PetNutritionProfile
): PortionPlan => {
  const { caloriesPerKg, notes } = getCaloriesPerKg(profile);
  const dailyCalories = calculateDailyPortion(profile.weightKg, caloriesPerKg);

  const recipeCalories =
    recipe.nutritionalInfo?.calories?.min ||
    recipe.nutritionalInfo?.calories?.max ||
    parseCalories(recipe.nutritionInfo?.calories) ||
    350;

  const baseIngredientWeight = recipe.ingredients.reduce(
    (sum, ingredient) => sum + parseAmountToGrams(ingredient.amount),
    0
  );

  const multiplier = recipeCalories
    ? clamp(dailyCalories / recipeCalories, 0.3, 3)
    : 1;

  const dailyPortionGrams = Math.round(baseIngredientWeight * multiplier);
  const weeklyCalories = dailyCalories * 7;
  const weeklyPortionGrams = dailyPortionGrams * 7;

  return {
    caloriesPerKg,
    dailyCalories,
    weeklyCalories,
    multiplier,
    dailyPortionGrams,
    weeklyPortionGrams,
    notes,
  };
};

export const scaleAmount = (
  amount: string | undefined,
  multiplier: number
): string | undefined => {
  if (!amount) return amount;
  const numericMatch = amount.match(/[\d.]+/);
  if (!numericMatch) return amount;
  const quantity = parseFloat(numericMatch[0]);
  if (Number.isNaN(quantity)) return amount;
  const scaled = (quantity * multiplier).toFixed(1).replace(/\.0$/, '');
  return amount.replace(numericMatch[0], scaled);
};

