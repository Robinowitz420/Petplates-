// lib/types/index.ts
// Centralized type definitions - Single source of truth

export type PetCategory = 'dogs' | 'cats' | 'birds' | 'reptiles' | 'pocket-pets';
export type AgeGroup = 'baby' | 'young' | 'adult' | 'senior';
export type ActivityLevel = 'sedentary' | 'moderate' | 'active' | 'very-active';

/**
 * Core Pet interface
 */
export interface Pet {
  id: string;
  names: string[];
  type: PetCategory;
  breed: string;
  age: AgeGroup;
  weight?: string;
  weightKg?: number;
  activityLevel?: ActivityLevel;
  healthConcerns?: string[];
  dietaryRestrictions?: string[];
  allergies?: string[];
  dislikes?: string[];
  savedRecipes?: string[];
  image?: string;
}

/**
 * Ingredient in a recipe or custom meal
 */
export interface Ingredient {
  id?: string;
  key: string;
  name: string;
  amount?: string;
  grams?: number;
  asinLink?: string;
  purchaseLink?: string;
}

/**
 * Ingredient selection for custom meals
 */
export interface IngredientSelection {
  key: string;
  grams: number;
}

/**
 * Meal analysis result
 */
export interface MealAnalysis {
  score: number;
  nutrients: Record<string, number>;
  totalRecipeGrams: number;
  recommendedServingGrams: number;
  caToPratio?: number;
  breakdown: {
    nutrientCoverageScore: number;
    toxicityPenalty: number;
    balanceVarietyScore: number;
  };
  toxicityWarnings: Array<{
    message: string;
    severity: string;
    ingredientKey?: string;
    ingredientName?: string;
  }>;
  allergyWarnings: Array<{
    message: string;
    severity: string;
  } | string>;
  nutrientWarnings: Array<{
    message: string;
    severity: string;
  }>;
  suggestions: Array<{
    message: string;
    action?: string;
    confidence?: string;
  } | string>;
}

/**
 * Custom meal created by user
 */
export interface CustomMeal {
  id: string;
  petId: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  ingredients: IngredientSelection[];
  analysis: MealAnalysis;
}

/**
 * Recipe from the database
 */
export interface Recipe {
  id: string;
  name: string;
  shortName?: string;
  category: string;
  ageGroup: string[];
  healthConcerns?: string[];
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  nutritionalInfo: {
    protein: { min: number; max: number; unit: string };
    fat: { min: number; max: number; unit: string };
    calories: { min: number; max: number; unit: string };
  };
  rating: number;
  reviews: number;
  tags?: string[];
  image?: string;
  mealImage?: string;
}

/**
 * Modified recipe result from recommendation engine
 */
export interface ModifiedRecipeResult {
  recipe: Recipe;
  explanation: string;
  score?: number;
  adjustedIngredients?: Ingredient[];
}

/**
 * Breed information
 */
export interface Breed {
  id: string;
  name: string;
  category: PetCategory;
  traits?: string[];
  commonHealthConcerns?: string[];
}

/**
 * Nutritional requirement
 */
export interface NutritionalRequirement {
  nutrient: string;
  min?: number;
  max?: number;
  unit: string;
  critical?: boolean;
}

/**
 * API Error response
 */
export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  fields?: Record<string, string>;
}

/**
 * Loading state
 */
export interface LoadingState {
  loading: boolean;
  error: string | null;
}

