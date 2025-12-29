// lib/utils/customMealStorage.ts
// Abstracted custom meal storage layer - Migrated to Firestore
// Note: All operations are now ASYNCHRONOUS

import { CustomMeal } from '@/lib/types';
import { MealAnalysis, IngredientSelection } from '@/lib/analyzeCustomMeal';
import { getPets, savePet } from './petStorage';
import { checkAllBadges } from './badgeChecker';

async function fetchJsonOrThrow<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) {
    if (res.status === 401) throw new Error('Please sign in');
    throw new Error(text || `Request failed (${res.status})`);
  }
  return text ? (JSON.parse(text) as T) : ({} as T);
}

/**
 * Retrieves all custom meals for a given pet.
 * 
 * @param userId - User identifier
 * @param petId - Pet identifier
 * @returns Promise<CustomMeal[]>
 */
export async function getCustomMeals(userId: string, petId: string): Promise<CustomMeal[]> {
  if (!userId || !petId) return [];

  const res = await fetch(`/api/custom-meals?petId=${encodeURIComponent(petId)}`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await fetchJsonOrThrow<{ customMeals?: CustomMeal[] }>(res);
  return Array.isArray(data.customMeals) ? data.customMeals : [];
}

/**
 * Saves a custom meal to storage.
 * 
 * @param userId - User identifier
 * @param petId - Pet identifier
 * @param mealName - Name of the meal
 * @param ingredients - Array of ingredient selections
 * @param analysis - Meal analysis results
 * @returns Promise<CustomMeal>
 */
export async function saveCustomMeal(
  userId: string,
  petId: string,
  mealName: string,
  ingredients: IngredientSelection[],
  analysis: MealAnalysis
): Promise<CustomMeal> {
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
      breakdown: analysis.breakdown,
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

  const res = await fetch('/api/custom-meals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ customMeal }),
  });

  const data = await fetchJsonOrThrow<{ customMeal?: CustomMeal }>(res);
  const saved = data.customMeal || customMeal;
  
  // Also add the custom meal ID to the pet's savedRecipes array
  // We need to fetch the pet, update it, and save it back
  const pets = await getPets(userId);
  const pet = pets.find(p => p.id === petId);
  
  if (pet) {
    const savedRecipes = pet.savedRecipes || [];
    if (!savedRecipes.includes(customMeal.id)) {
      const updatedPet = {
        ...pet,
        savedRecipes: [...savedRecipes, customMeal.id],
      };
      await savePet(userId, updatedPet);
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('customMealsUpdated', {
      detail: { userId, petId, mealId: saved.id },
    }));
  }

  return saved;
}

/**
 * Deletes a custom meal from storage.
 * 
 * @param userId - User identifier
 * @param petId - Pet identifier
 * @param mealId - Meal ID to delete
 * @returns Promise<void>
 */
export async function deleteCustomMeal(userId: string, petId: string, mealId: string): Promise<void> {

  const res = await fetch(`/api/custom-meals/${encodeURIComponent(mealId)}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  await fetchJsonOrThrow<{ ok?: boolean }>(res);
  
  // Also remove from pet's savedRecipes
  const pets = await getPets(userId);
  const pet = pets.find(p => p.id === petId);
  
  if (pet) {
    const savedRecipes = pet.savedRecipes || [];
    const updatedPet = {
      ...pet,
      savedRecipes: savedRecipes.filter(id => id !== mealId),
    };
    await savePet(userId, updatedPet);
  }
}

/**
 * Gets a single custom meal by ID.
 * 
 * @param userId - User identifier
 * @param petId - Pet identifier
 * @param mealId - Meal ID to retrieve
 * @returns Promise<CustomMeal | null>
 */
export async function getCustomMeal(userId: string, petId: string, mealId: string): Promise<CustomMeal | null> {
  const meals = await getCustomMeals(userId, petId);
  return meals.find(m => m.id === mealId) || null;
}

/**
 * Updates a custom meal's name.
 * 
 * @param userId - User identifier
 * @param petId - Pet identifier
 * @param mealId - Meal ID to update
 * @param newName - New name for the meal
 * @returns Promise<void>
 */
export async function updateCustomMealName(
  userId: string,
  petId: string,
  mealId: string,
  newName: string
): Promise<void> {
  const meal = await getCustomMeal(userId, petId, mealId);
  if (meal) {
    meal.name = newName;
    meal.updatedAt = new Date().toISOString();

    const res = await fetch('/api/custom-meals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ customMeal: meal }),
    });

    await fetchJsonOrThrow<{ customMeal?: CustomMeal }>(res);
  }
}
