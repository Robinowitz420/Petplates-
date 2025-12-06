'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { HeartOff, ArrowLeft, Utensils, Clock, Trash2 } from 'lucide-react';
import { recipes } from '@/lib/data/recipes-complete';
import Image from '@/components/Image';
import { getCustomMeals } from '@/lib/utils/customMealStorage';
import type { CustomMeal } from '@/lib/types';

// Keep pet types consistent with the rest of the app
type PetCategory = 'dogs' | 'cats' | 'birds' | 'reptiles' | 'pocket-pets';

type AgeGroup = 'baby' | 'young' | 'adult' | 'senior';

interface Pet {
  id: string;
  name?: string; // Legacy - prefer names array
  names?: string[]; // New format
  type: PetCategory;
  breed: string;
  age: AgeGroup;
  healthConcerns: string[];
  // In profile/page.tsx this is string[] of recipe IDs
  savedRecipes: string[];
}

// Same simulated user ID setup as profile/page.tsx
const SIMULATED_USER_ID = 'clerk_simulated_user_id_123';

const getCurrentUserId = () => {
  if (typeof window === 'undefined') return SIMULATED_USER_ID;
  return localStorage.getItem('last_user_id') || SIMULATED_USER_ID;
};

const getPetsFromLocalStorage = (userId: string): Pet[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(`pets_${userId}`);

  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed)
      ? parsed.map((p: any) => ({
          ...p,
          savedRecipes: p.savedRecipes || [],
        }))
      : [];
  } catch (e) {
    // Failed to parse pet data - using fallback
    return [];
  }
};

export default function SavedRecipesPage() {
  const { id: petId } = useParams();
  const router = useRouter();
  const [pet, setPet] = useState<Pet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [customMeals, setCustomMeals] = useState<CustomMeal[]>([]);

  // Load pet and custom meals from localStorage
  useEffect(() => {
    const uid = getCurrentUserId();
    setUserId(uid);

    if (!petId) {
      setIsLoading(false);
      return;
    }

    const pets = getPetsFromLocalStorage(uid);
    const foundPet = pets.find((p) => p.id === petId);
    setPet(foundPet || null);
    
    // Load custom meals for this pet
    const meals = getCustomMeals(uid, Array.isArray(petId) ? petId[0] : petId);
    setCustomMeals(meals);
    
    setIsLoading(false);
  }, [petId]);

  // Map saved recipe IDs and custom meals to display format
  const savedRecipeDetails = useMemo(() => {
    const allMeals: {
      id: string;
      name: string;
      imageUrl: string;
      dateAdded?: number;
      isCustom?: boolean;
    }[] = [];
    
    // Add regular recipes
    if (pet) {
      pet.savedRecipes.forEach((recipeId) => {
        const recipe = recipes.find((r) => r.id === recipeId);
        if (recipe) {
          allMeals.push({
            id: recipe.id,
            name: recipe.name,
            imageUrl: (recipe as any).imageUrl || '',
            dateAdded: undefined,
            isCustom: false,
          });
        }
      });
    }
    
    // Add custom meals
    customMeals.forEach((meal) => {
      allMeals.push({
        id: meal.id,
        name: meal.name,
        imageUrl: '', // Custom meals don't have images yet
        dateAdded: meal.createdAt ? new Date(meal.createdAt).getTime() : undefined,
        isCustom: true,
      });
    });
    
    return allMeals;
  }, [pet, customMeals]);

  const handleRemoveRecipe = (recipeIdToRemove: string, isCustom: boolean = false) => {
    if (!userId || !pet) return;

    if (isCustom) {
      // Remove custom meal
      const { deleteCustomMeal } = require('@/lib/utils/customMealStorage');
      deleteCustomMeal(userId, pet.id, recipeIdToRemove);
      setCustomMeals(prev => prev.filter(m => m.id !== recipeIdToRemove));
    } else {
      // Update the pet's savedRecipes array in localStorage
      const pets = getPetsFromLocalStorage(userId);
      const updatedPets = pets.map((p) =>
        p.id === pet.id
          ? {
              ...p,
              savedRecipes: (p.savedRecipes || []).filter((id: string) => id !== recipeIdToRemove),
            }
          : p
      );

      if (typeof window !== 'undefined') {
        localStorage.setItem(`pets_${userId}`, JSON.stringify(updatedPets));
      }

      const updatedPet = updatedPets.find((p) => p.id === pet.id) || null;
      setPet(updatedPet);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-xl text-primary-600 font-medium">Loading pet profile...</p>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <HeartOff className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pet Not Found</h1>
        <p className="text-gray-600">
          We couldn't find a pet with the ID:{' '}
          <span className="font-mono bg-gray-100 p-1 rounded text-sm">{String(petId)}</span>.
        </p>
        <Link
          href="/profile"
          className="mt-6 inline-flex items-center text-primary-600 hover:text-primary-800 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Pet Profiles
        </Link>
      </div>
    );
  }

  const hasSaved = savedRecipeDetails.length > 0;

  // Get random name from pet's names array
  const petNames = Array.isArray((pet as any).names) ? (pet as any).names.filter((n: string) => n && n.trim() !== '') : [];
  const petDisplayName = petNames.length > 0 
    ? petNames[Math.floor(Math.random() * petNames.length)]
    : (pet.name || 'Your Pet');

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/profile"
          className="inline-flex items-center text-gray-500 hover:text-primary-600 transition-colors mb-3 text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Pet Profiles
        </Link>

        <header className="mb-4 p-3 bg-white rounded-lg shadow border-l-4 border-primary-600">
          <h1 className="text-xl font-bold text-gray-900 flex items-center">
            <Utensils className="w-5 h-5 mr-2 text-primary-600" />
            Saved Meals for {petDisplayName}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            A curated collection for your <span className="capitalize font-medium">{pet.type}</span>, the {pet.breed}.
          </p>
        </header>

        {hasSaved && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <p className="text-sm text-gray-600">
              {savedRecipeDetails.length} meals saved for {petDisplayName}.
            </p>
            <button
              onClick={() => router.push(`/profile/pet/${pet.id}/meal-plan`)}
              disabled={savedRecipeDetails.length < 2}
              className={`px-5 py-3 rounded-lg font-semibold transition-colors ${
                savedRecipeDetails.length < 2
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              Create Meal Plan
            </button>
          </div>
        )}

        <div className="space-y-4">
          {hasSaved ? (
            savedRecipeDetails.map((recipe) => (
              <div
                key={recipe.id}
                className="flex items-center p-4 bg-white rounded-xl shadow hover:shadow-md transition-shadow justify-between"
              >
                <Link
                  href={recipe.isCustom 
                    ? `/profile/pet/${pet.id}/custom-meals`
                    : `/recipe/${recipe.id}?petId=${pet.id}`
                  }
                  className="flex items-center flex-grow group"
                >
                  <Image
                    src={recipe.imageUrl}
                    variant="thumbnail"
                    alt={recipe.name}
                    className="w-16 h-16 object-cover rounded-lg mr-4 shadow-sm"
                    petCategory={recipe.category}
                    fallbackSrc="https://placehold.co/64x64/E0E0E0/888888?text=Food"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
                        {recipe.name}
                      </p>
                      {recipe.isCustom && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                          Custom
                        </span>
                      )}
                    </div>
                    {recipe.dateAdded && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>
                          Saved: {new Date(recipe.dateAdded).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>

                <button
                  onClick={() => handleRemoveRecipe(recipe.id, recipe.isCustom)}
                  className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  aria-label={`Remove ${recipe.name}`}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center p-10 bg-white rounded-xl shadow-inner border border-gray-200">
              <HeartOff className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-xl font-medium text-gray-700">No Saved Meals Yet!</p>
              <p className="text-gray-500 mt-2">
                Start by browsing our catalog to find the perfect meal for {petDisplayName}.
              </p>
              <Link
                href={`/profile/pet/${pet.id}`}
                className="mt-4 inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-md"
              >
                Find Meals
              </Link>
            </div>
          )}
        </div>
      </div>

      <p className="fixed bottom-4 right-4 text-xs text-gray-400">
        Current User ID: {userId || 'Unknown'} (Pet ID: {String(petId)})
      </p>
    </div>
  );
}