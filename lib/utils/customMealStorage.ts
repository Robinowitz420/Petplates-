// lib/utils/customMealStorage.ts
// Abstracted custom meal storage layer for easy migration to Firebase/Supabase

import type { CustomMeal } from '@/lib/types';
import type { MealAnalysis, IngredientSelection } from '@/lib/analyzeCustomMeal';

/**
 * Data contract for custom meal storage operations.
 * Currently uses localStorage, but can be swapped to Firebase/Supabase without changing callers.
 */

/**
 * Retrieves all custom meals for a given pet.
 * 
 * @param userId - User identifier (Clerk user ID or localStorage key)
 * @param petId - Pet identifier
 * @returns Array of CustomMeal objects, or empty array if none found
 * 
 * @contract
 * - Input: userId (string), petId (string)
 * - Output: CustomMeal[] (always returns array, never null/undefined)
 * - Side effects: Reads from localStorage (will be Firebase in future)
 * - Migration: Change implementation only, signature stays same
 */
export function getCustomMeals(userId: string, petId: string): CustomMeal[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(`custom_meals_${userId}_${petId}`);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

/**
 * Saves a custom meal to storage.
 * 
 * @param userId - User identifier
 * @param petId - Pet identifier
 * @param mealName - Name of the meal
 * @param ingredients - Array of ingredient selections
 * @param analysis - Meal analysis results
 * @returns The saved CustomMeal object with generated ID
 * 
 * @contract
 * - Input: userId, petId, mealName, ingredients, analysis
 * - Output: CustomMeal (with generated id, createdAt, updatedAt)
 * - Side effects: Writes to localStorage (will be Firebase in future)
 * - Migration: Change implementation only, signature stays same
 */
export function saveCustomMeal(
  userId: string,
  petId: string,
  mealName: string,
  ingredients: IngredientSelection[],
  analysis: MealAnalysis
): CustomMeal {
  if (typeof window === 'undefined') {
    throw new Error('Cannot save meal on server side');
  }
  
  const meals = getCustomMeals(userId, petId);
  const now = new Date().toISOString();
  
  const customMeal: CustomMeal = {
    id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    petId,
    userId,
    name: mealName,
    createdAt: now,
    updatedAt: now,
    ingredients: ingredients.map(ing => ({
      key: ing.key,
      grams: ing.grams
    })),
    analysis: {
      score: analysis.score,
      nutrients: analysis.nutrients,
      totalRecipeGrams: analysis.totalRecipeGrams,
      recommendedServingGrams: analysis.recommendedServingGrams,
      breakdown: {
        nutrientCoverageScore: analysis.breakdown.nutrientCoverageScore,
        toxicityPenalty: analysis.breakdown.toxicityPenalty,
        balanceVarietyScore: analysis.breakdown.balanceVarietyScore,
      },
      toxicityWarnings: analysis.toxicityWarnings.map(w => ({
        message: w.message,
        severity: w.severity,
        ingredientKey: w.ingredientKey,
        ingredientName: w.ingredientName,
      })),
      allergyWarnings: analysis.allergyWarnings.map(w => ({
        message: typeof w === 'string' ? w : w.message,
        severity: typeof w === 'string' ? 'medium' : w.severity,
      })),
      nutrientWarnings: analysis.nutrientWarnings.map(w => ({
        message: w.message,
        severity: w.severity,
      })),
      suggestions: analysis.suggestions.map(s => ({
        message: typeof s === 'string' ? s : s.message,
        action: typeof s === 'string' ? undefined : s.action,
        confidence: typeof s === 'string' ? undefined : s.confidence,
      })),
    },
  };
  
  meals.push(customMeal);
  localStorage.setItem(`custom_meals_${userId}_${petId}`, JSON.stringify(meals));
  
  return customMeal;
}

/**
 * Deletes a custom meal from storage.
 * 
 * @param userId - User identifier
 * @param petId - Pet identifier
 * @param mealId - Meal ID to delete
 * @returns void
 * 
 * @contract
 * - Input: userId (string), petId (string), mealId (string)
 * - Output: void
 * - Side effects: Writes to localStorage (will be Firebase in future)
 * - Migration: Change implementation only, signature stays same
 */
export function deleteCustomMeal(userId: string, petId: string, mealId: string): void {
  if (typeof window === 'undefined') return;
  
  const meals = getCustomMeals(userId, petId);
  const filtered = meals.filter(m => m.id !== mealId);
  localStorage.setItem(`custom_meals_${userId}_${petId}`, JSON.stringify(filtered));
}

/**
 * Gets a single custom meal by ID.
 * 
 * @param userId - User identifier
 * @param petId - Pet identifier
 * @param mealId - Meal ID to retrieve
 * @returns CustomMeal object or null if not found
 * 
 * @contract
 * - Input: userId (string), petId (string), mealId (string)
 * - Output: CustomMeal | null
 * - Side effects: Reads from localStorage (will be Firebase in future)
 * - Migration: Change implementation only, signature stays same
 */
export function getCustomMeal(userId: string, petId: string, mealId: string): CustomMeal | null {
  const meals = getCustomMeals(userId, petId);
  return meals.find(m => m.id === mealId) || null;
}

/**
 * Updates a custom meal's name.
 * 
 * @param userId - User identifier
 * @param petId - Pet identifier
 * @param mealId - Meal ID to update
 * @param newName - New name for the meal
 * @returns void
 */
export function updateCustomMealName(
  userId: string,
  petId: string,
  mealId: string,
  newName: string
): void {
  if (typeof window === 'undefined') return;
  
  const meals = getCustomMeals(userId, petId);
  const meal = meals.find(m => m.id === mealId);
  if (meal) {
    meal.name = newName;
    meal.updatedAt = new Date().toISOString();
    localStorage.setItem(`custom_meals_${userId}_${petId}`, JSON.stringify(meals));
  }
}

