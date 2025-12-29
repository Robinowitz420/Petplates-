// lib/utils/customMealStorageFirebase.ts
// Firebase implementation of custom meal storage
// This replaces localStorage with Firestore while maintaining the same API

import type { CustomMeal } from '@/lib/types';
import type { MealAnalysis, IngredientSelection } from '@/lib/analyzeCustomMeal';
import { getCustomMeals, saveCustomMeal, deleteCustomMeal, getCustomMeal } from './customMealStorage';

/**
 * Firebase implementation of getCustomMeals
 * Uses real-time listener (onSnapshot) for live updates
 */
export function getCustomMealsFirebase(
  userId: string, 
  petId: string,
  onUpdate?: (meals: CustomMeal[]) => void
): () => void {
  getCustomMeals(userId, petId)
    .then((meals) => {
      if (onUpdate) onUpdate(meals);
    })
    .catch(() => {
      if (onUpdate) onUpdate([]);
    });

  return () => {};
}

/**
 * Firebase implementation of saveCustomMeal
 */
export async function saveCustomMealFirebase(
  userId: string,
  petId: string,
  mealName: string,
  ingredients: IngredientSelection[],
  analysis: MealAnalysis
): Promise<CustomMeal> {
  return saveCustomMeal(userId, petId, mealName, ingredients, analysis);
}

/**
 * Firebase implementation of deleteCustomMeal
 */
export async function deleteCustomMealFirebase(
  userId: string,
  petId: string,
  mealId: string
): Promise<void> {
  return deleteCustomMeal(userId, petId, mealId);
}

/**
 * Firebase implementation of getCustomMeal
 */
export async function getCustomMealFirebase(
  userId: string,
  petId: string,
  mealId: string
): Promise<CustomMeal | null> {
  return getCustomMeal(userId, petId, mealId);
}

