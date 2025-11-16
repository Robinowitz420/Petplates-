export type PetCategory = 'dogs' | 'cats' | 'birds' | 'reptiles' | 'pocket-pets';

export interface NutritionalRequirement {
  protein: { min: number; max: number; unit: string };
  fat: { min: number; max: number; unit: string };
  fiber: { min: number; max: number; unit: string };
  calcium: { min: number; max: number; unit: string };
  phosphorus: { min: number; max: number; unit: string };
  vitamins: string[];
  calories: { min: number; max: number; unit: string };
}

export interface Breed {
  id: string;
  name: string;
  category: PetCategory;
}

export interface AgeGroup {
  id: string;
  name: string;
  description: string;
}

export interface HealthConcern {
  id: string;
  name: string;
  description: string;
  dietaryAdjustments: string[];
}

export interface Ingredient {
  id: string;
  name: string;
  amount: string;
  nutrition: {
    protein: number;
    fat: number;
    fiber: number;
    calories: number;
  };
  amazonLink?: string;
}

export interface Recipe {
  id: string;
  name: string;
  category: PetCategory;
  breed?: string[];
  ageGroup: string[];
  healthConcerns: string[];
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  nutritionalInfo: NutritionalRequirement;
  prepTime: string;
  servings: number;
  rating: number;
  reviews: number;
  imageUrl: string;
  tags: string[];
}

export interface MealPlan {
  id: string;
  name: string;
  type: 'one-time' | 'weekly';
  recipes: Recipe[];
  totalPrice: number;
}
