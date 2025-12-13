// lib/utils/customMealStorage.ts
// Abstracted custom meal storage layer - Migrated to Firestore
// Note: All operations are now ASYNCHRONOUS

import { CustomMeal } from '@/lib/types';
import { MealAnalysis, IngredientSelection } from '@/lib/analyzeCustomMeal';
import * as firestoreService from '@/lib/services/firestoreService';
import { getPets, savePet } from './petStorage';
import { checkAllBadges } from './badgeChecker';

/**
 * Retrieves all custom meals for a given pet.
 * 
 * @param userId - User identifier
 * @param petId - Pet identifier
 * @returns Promise<CustomMeal[]>
 */
export async function getCustomMeals(userId: string, petId: string): Promise<CustomMeal[]> {
  if (!userId || !petId) return [];
  
  // TEMPORARY: Skip Firestore entirely if no Firebase config
  const hasFirebase = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!hasFirebase) {
    console.log('Firebase not configured - loading custom meals from localStorage only');
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`custom_meals_${userId}_${petId}`);
      try {
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }
    return [];
  }
  
  try {
    return await firestoreService.getCustomMeals(userId, petId);
  } catch (e) {
    console.warn('Firestore getCustomMeals failed', e);
    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`custom_meals_${userId}_${petId}`);
      return stored ? JSON.parse(stored) : [];
    }
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
  
  // TEMPORARY: Skip Firestore entirely if no Firebase config
  const hasFirebase = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!hasFirebase) {
    console.log('Firebase not configured - saving custom meal to localStorage only');
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`custom_meals_${userId}_${petId}`);
      const meals = stored ? JSON.parse(stored) : [];
      meals.push(customMeal);
      localStorage.setItem(`custom_meals_${userId}_${petId}`, JSON.stringify(meals));
    }
    
    // Also add the custom meal ID to the pet's savedRecipes array
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
    
    // Dispatch custom event for same-tab updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('customMealsUpdated', { 
        detail: { userId, petId, mealId: customMeal.id } 
      }));
    }
    
    // Check badges (Nutrient Navigator if score is 100)
    // Note: analysis.score might be a different metric, we'll check compatibility score separately
    // For now, we'll check badges when the meal is viewed/scored elsewhere
    // This is a placeholder - actual compatibility scoring happens in MealCompleteView
    
    return customMeal;
  }
  
  // Save to Firestore
  await firestoreService.saveCustomMeal(userId, customMeal);
  
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
  
  // Backup to localStorage for safety
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(`custom_meals_${userId}_${petId}`);
    const meals = stored ? JSON.parse(stored) : [];
    meals.push(customMeal);
    localStorage.setItem(`custom_meals_${userId}_${petId}`, JSON.stringify(meals));
    
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('customMealsUpdated', { 
      detail: { userId, petId, mealId: customMeal.id } 
    }));
  }
  
  return customMeal;
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
  // TEMPORARY: Skip Firestore entirely if no Firebase config
  const hasFirebase = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!hasFirebase) {
    console.log('Firebase not configured - deleting custom meal from localStorage only');
    
    // Delete from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`custom_meals_${userId}_${petId}`);
      if (stored) {
        try {
          const meals: any[] = JSON.parse(stored);
          const filtered = meals.filter(m => m.id !== mealId);
          localStorage.setItem(`custom_meals_${userId}_${petId}`, JSON.stringify(filtered));
        } catch (e) {
          console.error('Error deleting custom meal from localStorage:', e);
        }
      }
    }
    
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
    
    return;
  }
  
  await firestoreService.deleteCustomMeal(userId, mealId);
  
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
  
  // Sync localStorage
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(`custom_meals_${userId}_${petId}`);
    if (stored) {
      const meals: any[] = JSON.parse(stored);
      const filtered = meals.filter(m => m.id !== mealId);
      localStorage.setItem(`custom_meals_${userId}_${petId}`, JSON.stringify(filtered));
    }
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
    await firestoreService.saveCustomMeal(userId, meal);
    
    // Sync localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`custom_meals_${userId}_${petId}`);
      if (stored) {
        const meals: any[] = JSON.parse(stored);
        const localMeal = meals.find(m => m.id === mealId);
        if (localMeal) {
          localMeal.name = newName;
          localMeal.updatedAt = meal.updatedAt;
          localStorage.setItem(`custom_meals_${userId}_${petId}`, JSON.stringify(meals));
        }
      }
    }
  }
}
