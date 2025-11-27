// lib/types.ts

export type PetCategory = 'dogs' | 'cats' | 'birds' | 'reptiles' | 'pocket-pets';
export type Species = Extract<PetCategory, 'dogs' | 'cats'>;
export type Breed = string;
export type AgeGroup = 'baby' | 'young' | 'adult' | 'senior';
export type HealthConcern = string;

export interface NutritionalRequirement {
  caloriesPerKg?: number;
  protein?: { min: number; max?: number; unit: string };
  fat?: { min: number; max?: number; unit: string };
  fiber?: { min: number; max?: number; unit: string };
  calcium?: { min: number; max?: number; unit: string };
  phosphorus?: { min: number; max?: number; unit: string };
  notes?: string[];
}

export interface IngredientNutrition {
  protein?: number;
  fat?: number;
  fiber?: number;
  moisture?: number;
  calories?: number;
  phosphorus?: number;
  carbs?: number;
}

export interface Ingredient {
  id: string;
  name: string;
  amount: string;
  amazonLink?: string;
  category?: string;
  notes?: string;
  nutrition?: IngredientNutrition;
  productName?: string; // Specific branded product name for Amazon search
}

export interface IngredientOption {
  name: string;
  amount?: string;
  amountPer10kg?: string;
  amazonLink?: string;
  notes?: string;
  nutrition?: IngredientNutrition;
}

export interface RecipeNutritionRange {
  min: number;
  max?: number;
  unit: string;
}

export interface RecipeNutritionInfo {
  protein?: RecipeNutritionRange;
  fat?: RecipeNutritionRange;
  fiber?: RecipeNutritionRange;
  calcium?: RecipeNutritionRange;
  phosphorus?: RecipeNutritionRange;
  vitamins?: string[];
  calories?: RecipeNutritionRange;
}

export interface FeedingGuideEntry {
  weight: string;
  dailyAmount: string;
}

export interface ImageData {
  url: string;
  width: number;
  height: number;
  alt?: string;
}

export interface Recipe {
  id: string;
  name: string;
  shortName?: string;
  celebrityName?: string;
  celebrityQuote?: string;
  category: PetCategory;
  breed?: string[] | null;
  ageGroup: string[];
  healthConcerns: string[];
  description: string;
  tags?: string[];
  image?: string;
  imageUrl?: string;
  imagePrompt?: string;
  images?: {
    thumbnail?: ImageData;
    card?: ImageData;
    hero?: ImageData;
    icon?: ImageData;
    banner?: ImageData;
  };
  prepTime?: string;
  cookTime?: string;
  servings?: number;
  ingredients: Ingredient[];
  supplements?: Ingredient[];
  instructions: string[];
  nutritionalInfo?: RecipeNutritionInfo;
  nutritionInfo?: {
    protein: string;
    fat: string;
    fiber: string;
    moisture?: string;
    calories: string;
    calcium?: string;
  };
  feedingGuide?: FeedingGuideEntry[];
  meta?: {
    texture?: string;
    estimatedCost?: string;
    shelfLife?: string;
    season?: string[];
    benefits?: string[];
  };
  rating: number;
  reviews: number;
}

export interface ModifierRule {
  id: string;
  appliesTo: {
    species?: Species[];
    healthConcerns?: string[];
    breeds?: string[];
    ageGroups?: string[];
    allergies?: string[];
  };
  ingredientChanges: {
    add?: IngredientOption[];
    remove?: string[];
    substitute?: { from: string; to: string; notes?: string }[];
  };
  nutritionalTargets?: {
    proteinMin?: number;
    fatMax?: number;
    phosphorusMax?: number;
    caloriesAdjust?: number;
  };
  rationale: string;
  ruleWeight?: number;
}

export interface PetNutritionProfile {
  species: Species;
  weightKg: number;
  ageGroup: string;
  breed?: string | null;
  healthConcerns?: string[];
  allergies?: string[];
  caloriesPerKgOverride?: number;
  petName?: string;
}

export interface AppliedModifierSummary {
  ruleId: string;
  title?: string;
  rationale: string;
  adjustments: string[];
}

export interface NutritionAdjustment {
  protein?: string;
  fat?: string;
  phosphorus?: string;
  calories?: string;
}

export interface PortionPlan {
  caloriesPerKg: number;
  dailyCalories: number;
  weeklyCalories: number;
  multiplier: number;
  dailyPortionGrams: number;
  weeklyPortionGrams: number;
  notes: string[];
}

export interface ShoppingListItem {
  name: string;
  amount: string;
  amazonLink?: string;
  notes?: string;
  category?: string;
}

export interface WeeklyPlanEntry {
  day: string;
  meals: { label: string; amount: string }[];
}

export interface ModifiedRecipeResult {
  recipe: Recipe;
  adjustedIngredients: Ingredient[];
  appliedRules: AppliedModifierSummary[];
  nutritionChanges: NutritionAdjustment;
  portionPlan: PortionPlan;
  shoppingList: ShoppingListItem[];
  explanation: string;
  weeklyPlan: WeeklyPlanEntry[];
  score: number;
}