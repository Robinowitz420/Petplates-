// lib/types.ts
// Core TypeScript type definitions for PetPlates

export type PetCategory = 'dogs' | 'cats' | 'birds' | 'reptiles' | 'pocket-pets';
export type AgeGroupValue = 'baby' | 'young' | 'adult' | 'senior';

export interface Breed {
  id: string;
  name: string;
  category: PetCategory;
}

export interface AgeGroup {
  value: AgeGroupValue;
  label: string;
}

export interface HealthConcern {
  id: string;
  name: string;
  description: string;
  dietaryAdjustments: string[];
}

export type Species = 'dog' | 'cat' | 'bird' | 'reptile' | 'pocket-pet' | string;

export interface Ingredient {
  id: string;
  name: string;
  amount: string;
  asinLink?: string; // ASIN-based direct product link
  productName?: string; // Vetted product name
  vetNote?: string; // Veterinary note about the product
  isVetted?: boolean; // Whether this ingredient has been vetted
  isGeneric?: boolean; // Whether this is a generic ingredient (produce/staples)
  asin?: string; // Amazon ASIN for cart operations
}

export interface RecipeNutritionInfo {
  protein?: { min: number; max: number; unit: string };
  fat?: { min: number; max: number; unit: string };
  fiber?: { min: number; max: number; unit: string };
  calories?: { min: number; max: number; unit: string };
  phosphorus?: { min: number; max: number; unit: string };
  calcium?: { min: number; max: number; unit: string };
}

export interface Recipe {
  id: string;
  name: string;
  shortName?: string;
  category: string;
  breed?: string | string[] | null;
  ageGroup: string[];
  healthConcerns: string[];
  notSuitableFor?: string[]; // Health concerns this recipe is NOT suitable for
  description?: string;
  tags?: string[];
  imageUrl?: string;
  prepTime?: string;
  cookTime?: string;
  servings?: number;
  ingredients: Ingredient[];
  instructions: string[];
  supplements?: Ingredient[]; // Optional supplements for the recipe
  nutritionalInfo?: RecipeNutritionInfo;
  nutritionInfo?: {
    protein?: string;
    fat?: string;
    fiber?: string;
    calories?: string;
    calcium?: string;
  };
  rating?: number;
  reviews?: number;
  score?: number;
  // Enhanced fields (all optional for backward compatibility)
  needsReview?: boolean; // Flag if recipe uses estimated nutrition data or needs manual review
  validation?: {
    status: 'validated' | 'needs_review' | 'invalid';
    validatedAt?: string;
    method?: 'dry_matter' | 'as_fed' | 'estimated';
    standards?: string[];
    warnings?: string[];
    errors?: string[];
    missingIngredients?: string[];
    estimatedNutritionPercent?: number;
  };
  generationInfo?: {
    version: string;
    attempts?: number;
    confidence?: number;
  };
}

export interface Pet {
  id: string;
  name?: string;
  names?: string[];
  type: string | PetCategory;
  bannedIngredients?: string[]; // Ingredients user never wants to see for this pet
  breed?: string | null;
  age?: string;
  weight?: string;
  weightKg?: number;
  activityLevel?: 'sedentary' | 'moderate' | 'active' | 'very-active';
  mealPlan?: string[];
  savedRecipes?: string[];
  // Wellness and preference fields
  healthConcerns?: string[];
  dietaryRestrictions?: string[];
  allergies?: string[];
  allergiesSeverity?: Record<string, 'low' | 'medium' | 'high'>;
  dislikes?: string[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  customMeals?: CustomMeal[];
  userId?: string;
  image?: string;
  completedMealPlans?: number; // Number of completed meal plans for Planning Volume badge
}

export interface ModifiedRecipeResult {
  recipe: Recipe;
  adjustedIngredients?: Ingredient[];
  appliedRules?: AppliedModifierSummary[];
  modifications?: string[];
  nutritionalChanges?: Record<string, { before: number; after: number }> | Record<string, any>;
  portionPlan?: PortionPlan;
  portionSize?: { grams: number; calories: number };
  shoppingList?: ShoppingListItem[] | Array<{ name: string; amount: string; asinLink?: string }>;
  explanation: string;
  weeklyPlan?: WeeklyPlanEntry[];
  score?: number;
  _tierLabel?: string;
  _warning?: string;
  _healthMatch?: string;
}

// Custom meal created by user
export interface CustomMeal {
  id: string;
  petId: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  ingredients: Array<{
    key: string;
    grams: number;
  }>;
  analysis: {
    score: number;
    nutrients: Record<string, number>;
    totalRecipeGrams: number;
    recommendedServingGrams: number;
    breakdown: {
      nutrientCoverageScore: number;
      toxicityPenalty: number;
      balanceVarietyScore: number;
    };
    toxicityWarnings: Array<{
      message: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      ingredientKey?: string;
      ingredientName?: string;
    }>;
    allergyWarnings: Array<{
      message: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
    }>;
    nutrientWarnings: Array<{
      message: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
    }>;
    suggestions: Array<{
      message: string;
      action?: string;
      confidence?: 'low' | 'medium' | 'high';
    }>;
  };
}

// Pet nutrition profile for recommendation engine
export interface PetNutritionProfile {
  species: string;
  ageGroup: string;
  weightKg: number;
  breed?: string | null;
  healthConcerns?: string[];
  allergies?: string[];
  caloriesPerKgOverride?: number;
  petName?: string;
}

// Portion plan for meal recommendations
export interface PortionPlan {
  dailyGrams: number;
  multiplier: number;
  mealsPerDay: number;
  notes: string[];
  caloriesPerKg?: number;
  dailyCalories?: number;
  weeklyCalories?: number;
  dailyPortionGrams?: number;
  weeklyPortionGrams?: number;
}

// Shopping list item
export interface ShoppingListItem {
  name: string;
  amount: string;
  asinLink?: string; // ASIN-based direct product link
  notes?: string;
  category?: string;
}

// Weekly plan entry
export interface WeeklyPlanEntry {
  day: string;
  meal: string;
  recipeId: string;
}

// Applied modifier summary
export interface AppliedModifierSummary {
  ruleId: string;
  description: string;
  changes: string[];
}

// Image data for recipe images
export interface ImageData {
  url?: string;
  width?: number;
  height?: number;
  alt?: string;
  hero?: string;
  card?: {
    url: string;
    width: number;
    height: number;
    alt: string;
  };
}

// Nutritional requirement for pets
export interface NutritionalRequirement {
  protein: { min: number; max: number; unit: string };
  fat: { min: number; max: number; unit: string };
  fiber?: { min: number; max: number; unit: string };
  calcium?: { min: number; max: number; unit: string };
  phosphorus?: { min: number; max: number; unit: string };
  taurine?: { min: number; max: number; unit: string };
  calories?: { min: number; max: number; unit: string };
  vitamins?: string[];
}

// Modifier rule system
export interface IngredientOption {
  name: string;
  reason?: string;
  amount?: string;
  amountPer10kg?: string;
  amazonLink?: string;
  notes?: string;
}

export interface ModifierRule {
  id: string;
  name?: string;
  species?: Species[];
  healthConcerns?: string[];
  description?: string;
  rationale?: string;
  ruleWeight?: number;
  appliesTo?: {
    species?: Species[];
    healthConcerns?: string[];
    ageGroups?: string[];
  };
  ingredientChanges?: {
    add?: IngredientOption[];
    remove?: string[];
    substitute?: Record<string, string> | Array<{ from: string; to: string }>;
  };
  nutritionalAdjustments?: {
    protein?: { min?: number; max?: number };
    fat?: { min?: number; max?: number };
    phosphorus?: { min?: number; max?: number };
    calories?: { min?: number; max?: number };
  };
  nutritionalTargets?: Record<string, { min?: number; max?: number } | number>;
  portionAdjustments?: {
    multiplier?: number;
    notes?: string[];
  };
}
