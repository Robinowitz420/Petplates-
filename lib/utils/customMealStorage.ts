// lib/utils/customMealStorage.ts
// Abstracted custom meal storage layer - Migrated to Firestore
// Note: All operations are now ASYNCHRONOUS

import { CustomMeal } from '@/lib/types';
import { MealAnalysis, IngredientSelection } from '@/lib/analyzeCustomMeal';
import { getPets, savePet } from './petStorage';
import { checkAllBadges } from './badgeChecker';
import { saveRecipeSnapshotForPet } from './recipeSnapshotStorage';

async function fetchJsonOrThrow<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) {
    // Check if the response is HTML (indicating a redirect to sign-in page)
    if (text.trim().startsWith('<!DOCTYPE html>') || text.includes('<html')) {
      if (res.status === 404) {
        throw new Error('Please sign in to access your custom meals');
      }
      throw new Error('Authentication required. Please sign in.');
    }

    if (res.status === 401) throw new Error('Please sign in');
    if (text) {
      try {
        const parsed = JSON.parse(text) as any;
        const message =
          (typeof parsed?.message === 'string' && parsed.message) ||
          (typeof parsed?.error === 'string' && parsed.error) ||
          '';
        const error = new Error(message || text);
        // Don't log auth errors to console
        if (!message.includes('Please sign in') && !message.includes('Authentication required')) {
          console.error('API Error:', error);
        }
        throw error;
      } catch {
        const error = new Error(text);
        // Don't log auth errors to console
        if (!text.includes('Please sign in') && !text.includes('Authentication required')) {
          console.error('API Error:', error);
        }
        throw error;
      }
    }
    throw new Error(`Request failed (${res.status})`);
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

  let res: Response;
  try {
    res = await fetch(`/api/custom-meals?petId=${encodeURIComponent(petId)}`, {
      method: 'GET',
      credentials: 'include',
    });
  } catch (networkError) {
    // Only log actual network errors, not auth errors
    if (!networkError?.message?.includes('Please sign in') && !networkError?.message?.includes('Authentication required')) {
      console.error('Network error:', networkError);
    }
    throw new Error('Network error: Unable to connect to server. Please check your connection.');
  }

  const data = await fetchJsonOrThrow<{ customMeals?: CustomMeal[] }>(res);
  return Array.isArray(data.customMeals) ? data.customMeals : [];
}

export async function getCustomMealsPaged(
  userId: string,
  petId: string,
  options?: { limit?: number; cursor?: string | null }
): Promise<{ customMeals: CustomMeal[]; nextCursor: string | null }> {
  if (!userId || !petId) return { customMeals: [], nextCursor: null };

  const limit = typeof options?.limit === 'number' && options.limit > 0 ? Math.floor(options.limit) : 50;
  const cursor = options?.cursor ? String(options.cursor) : '';

  const params = new URLSearchParams();
  params.set('petId', petId);
  params.set('limit', String(limit));
  if (cursor) params.set('cursor', cursor);

  let res: Response;
  try {
    res = await fetch(`/api/custom-meals?${params.toString()}`, {
      method: 'GET',
      credentials: 'include',
    });
  } catch (networkError) {
    // Only log actual network errors, not auth errors
    if (!networkError?.message?.includes('Please sign in') && !networkError?.message?.includes('Authentication required')) {
      console.error('Network error:', networkError);
    }
    throw new Error('Network error: Unable to connect to server. Please check your connection.');
  }

  const data = await fetchJsonOrThrow<{ customMeals?: CustomMeal[]; nextCursor?: string | null }>(res);
  return {
    customMeals: Array.isArray(data.customMeals) ? data.customMeals : [],
    nextCursor: typeof data.nextCursor === 'string' ? data.nextCursor : null,
  };
}

export async function getCustomMealById(userId: string, mealId: string): Promise<CustomMeal | null> {
  if (!userId || !mealId) return null;

  let res: Response;
  try {
    res = await fetch(`/api/custom-meals/${encodeURIComponent(mealId)}`, {
      method: 'GET',
      credentials: 'include',
    });
  } catch (networkError) {
    // Only log network errors, not auth errors
    if (!networkError?.message?.includes('Please sign in')) {
      console.error('Network error fetching custom meal:', networkError);
    }
    throw new Error('Network error: Unable to connect to server. Please check your connection.');
  }

  if (!res.ok) return null;
  const data = await fetchJsonOrThrow<{ customMeal?: CustomMeal | null }>(res);
  return (data?.customMeal as any) || null;
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
  const normalizedRecommendedServingGrams =
    typeof analysis.recommendedServingGrams === 'number' && analysis.recommendedServingGrams > 0
      ? analysis.recommendedServingGrams
      : analysis.totalRecipeGrams && analysis.totalRecipeGrams > 0
        ? analysis.totalRecipeGrams
        : 1; // Fallback to a minimal positive value to satisfy backend validation
  
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
      recommendedServingGrams: normalizedRecommendedServingGrams,
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

  let res: Response;
  try {
    res = await fetch('/api/custom-meals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ customMeal }),
    });
  } catch (networkError) {
    // Only log network errors, not auth errors
    if (!networkError?.message?.includes('Please sign in')) {
      console.error('Network error saving custom meal:', networkError);
    }
    throw new Error('Network error: Unable to connect to server. Please check your connection.');
  }

  const data = await fetchJsonOrThrow<{ customMeal?: CustomMeal }>(res);
  const saved = data.customMeal || customMeal;

  try {
    saveRecipeSnapshotForPet(userId, petId, {
      id: saved.id,
      name: saved.name,
      category: 'custom',
      ingredients: (ingredients || []).map((ing) => ({
        name: String(ing.key || ''),
      })),
    });
  } catch {
    // ignore
  }
  
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

  try {
    const allCustomMeals = await getCustomMeals(userId, petId);
    await checkAllBadges(userId, petId, {
      action: 'custom_meal_saved',
      customMealCount: allCustomMeals.length,
    });
  } catch {
    // ignore
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

  let res: Response;
  try {
    res = await fetch(`/api/custom-meals/${encodeURIComponent(mealId)}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  } catch (networkError) {
    // Only log network errors, not auth errors
    if (!networkError?.message?.includes('Please sign in')) {
      console.error('Network error deleting custom meal:', networkError);
    }
    throw new Error('Network error: Unable to connect to server. Please check your connection.');
  }
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

    let res: Response;
    try {
      res = await fetch('/api/custom-meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ customMeal: meal }),
      });
    } catch (networkError) {
      // Only log network errors, not auth errors
      if (!networkError?.message?.includes('Please sign in')) {
        console.error('Network error updating custom meal:', networkError);
      }
      throw new Error('Network error: Unable to connect to server. Please check your connection.');
    }

    await fetchJsonOrThrow<{ customMeal?: CustomMeal }>(res);
  }
}
