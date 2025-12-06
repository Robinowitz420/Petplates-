// lib/utils/customMealStorageFirebase.ts
// Firebase implementation of custom meal storage
// This replaces localStorage with Firestore while maintaining the same API

import type { CustomMeal } from '@/lib/types';
import type { MealAnalysis, IngredientSelection } from '@/lib/analyzeCustomMeal';
import { getFirebaseServices, getAppId } from './firebaseConfig';
import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  deleteDoc, 
  updateDoc,
  onSnapshot,
  query,
  where,
  type Firestore
} from 'firebase/firestore';

/**
 * Firebase implementation of getCustomMeals
 * Uses real-time listener (onSnapshot) for live updates
 */
export function getCustomMealsFirebase(
  userId: string, 
  petId: string,
  onUpdate?: (meals: CustomMeal[]) => void
): () => void {
  const services = getFirebaseServices();
  if (!services) {
    // Fallback to localStorage if Firebase not available
    const { getCustomMeals } = require('./customMealStorage');
    const meals = getCustomMeals(userId, petId);
    if (onUpdate) onUpdate(meals);
    return () => {}; // No-op unsubscribe
  }
  
  const { db } = services;
  const appId = getAppId();
  const recipesRef = collection(db, `artifacts/${appId}/users/${userId}/recipes`);
  
  // Query for recipes for this pet
  const q = query(recipesRef, where('petId', '==', petId));
  
  // Set up real-time listener
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const meals: CustomMeal[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      meals.push({
        id: docSnap.id,
        ...data
      } as CustomMeal);
    });
    
    // Sort by most recent first
    meals.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    if (onUpdate) {
      onUpdate(meals);
    }
  }, (error) => {
    console.error('Error listening to custom meals:', error);
    // Fallback to localStorage on error
    const { getCustomMeals } = require('./customMealStorage');
    const meals = getCustomMeals(userId, petId);
    if (onUpdate) onUpdate(meals);
  });
  
  return unsubscribe;
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
  const services = getFirebaseServices();
  if (!services) {
    // Fallback to localStorage
    const { saveCustomMeal } = require('./customMealStorage');
    return saveCustomMeal(userId, petId, mealName, ingredients, analysis);
  }
  
  const { db } = services;
  const appId = getAppId();
  const recipesRef = collection(db, `artifacts/${appId}/users/${userId}/recipes`);
  
  const now = new Date().toISOString();
  
  const customMealData = {
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
  
  try {
    const docRef = await addDoc(recipesRef, customMealData);
    return {
      id: docRef.id,
      ...customMealData
    } as CustomMeal;
  } catch (error) {
    console.error('Error saving custom meal to Firestore:', error);
    // Fallback to localStorage
    const { saveCustomMeal } = require('./customMealStorage');
    return saveCustomMeal(userId, petId, mealName, ingredients, analysis);
  }
}

/**
 * Firebase implementation of deleteCustomMeal
 */
export async function deleteCustomMealFirebase(
  userId: string,
  petId: string,
  mealId: string
): Promise<void> {
  const services = getFirebaseServices();
  if (!services) {
    // Fallback to localStorage
    const { deleteCustomMeal } = require('./customMealStorage');
    return deleteCustomMeal(userId, petId, mealId);
  }
  
  const { db } = services;
  const appId = getAppId();
  const mealRef = doc(db, `artifacts/${appId}/users/${userId}/recipes/${mealId}`);
  
  try {
    await deleteDoc(mealRef);
  } catch (error) {
    console.error('Error deleting custom meal from Firestore:', error);
    // Fallback to localStorage
    const { deleteCustomMeal } = require('./customMealStorage');
    return deleteCustomMeal(userId, petId, mealId);
  }
}

/**
 * Firebase implementation of getCustomMeal
 */
export async function getCustomMealFirebase(
  userId: string,
  petId: string,
  mealId: string
): Promise<CustomMeal | null> {
  const services = getFirebaseServices();
  if (!services) {
    // Fallback to localStorage
    const { getCustomMeal } = require('./customMealStorage');
    return getCustomMeal(userId, petId, mealId);
  }
  
  const { db } = services;
  const appId = getAppId();
  const mealRef = doc(db, `artifacts/${appId}/users/${userId}/recipes/${mealId}`);
  
  try {
    const docSnap = await getDoc(mealRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as CustomMeal;
    }
    return null;
  } catch (error) {
    console.error('Error getting custom meal from Firestore:', error);
    // Fallback to localStorage
    const { getCustomMeal } = require('./customMealStorage');
    return getCustomMeal(userId, petId, mealId);
  }
}

