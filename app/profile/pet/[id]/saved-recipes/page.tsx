'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { HeartOff, ArrowLeft, Utensils, Clock, Trash2 } from 'lucide-react';
import { getCustomMeals, deleteCustomMeal } from '@/lib/utils/customMealStorage';
import { getPets, savePet } from '@/lib/utils/petStorage'; // Import async storage
import type { CustomMeal, Pet } from '@/lib/types';

// Same simulated user ID setup as profile/page.tsx
const SIMULATED_USER_ID = 'clerk_simulated_user_id_123';

const getCurrentUserId = () => {
  if (typeof window === 'undefined') return SIMULATED_USER_ID;
  return localStorage.getItem('last_user_id') || SIMULATED_USER_ID;
};

export default function SavedRecipesPage() {
  const { id: petId } = useParams();
  const router = useRouter();
  const [pet, setPet] = useState<Pet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [customMeals, setCustomMeals] = useState<CustomMeal[]>([]);

  // Load pet and custom meals - async function
  const loadData = async () => {
    const uid = getCurrentUserId();
    setUserId(uid);

    if (!petId) {
      setIsLoading(false);
      return;
    }

    const resolvedPetId = Array.isArray(petId) ? petId[0] : petId;
    
    try {
      // Load pets and find the current pet
      const pets = await getPets(uid);
      const foundPet = pets.find((p) => p.id === resolvedPetId);
      setPet(foundPet || null);
      
      // Load custom meals for this pet
      const meals = await getCustomMeals(uid, resolvedPetId);
      setCustomMeals(meals);
    } catch (error) {
      console.error('Error loading pet data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load pet and custom meals from storage
  useEffect(() => {
    loadData();
  }, [petId]);

  // Listen for updates to pets and custom meals
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePetsUpdated = (e: CustomEvent) => {
      // Refresh if pets were updated
      if (e.detail?.userId === getCurrentUserId()) {
        loadData();
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      // Refresh if pets or custom meals storage was modified (cross-tab/window)
      const uid = getCurrentUserId();
      if (e.key === `pets_${uid}` || e.key?.startsWith(`custom_meals_${uid}_`)) {
        loadData();
      }
    };

    window.addEventListener('petsUpdated', handlePetsUpdated as EventListener);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('petsUpdated', handlePetsUpdated as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [petId]);

  // Map saved recipe IDs and custom meals to display format
  const savedRecipeDetails = useMemo(() => {
    const allMeals: {
      id: string;
      name: string;
      dateAdded?: number;
      isCustom?: boolean;
      compatibilityScore?: number;
    }[] = [];
    
    // Add custom meals (with compatibility score)
    customMeals.forEach((meal) => {
      allMeals.push({
        id: meal.id,
        name: meal.name,
        dateAdded: meal.createdAt ? new Date(meal.createdAt).getTime() : undefined,
        isCustom: true,
        compatibilityScore: meal.analysis?.score,
      });
    });
    
    return allMeals;
  }, [pet, customMeals]);

  const handleRemoveRecipe = async (recipeIdToRemove: string, isCustom: boolean = false) => {
    if (!userId || !pet) return;

    if (isCustom) {
      // Remove custom meal
      await deleteCustomMeal(userId, pet.id, recipeIdToRemove);
      setCustomMeals(prev => prev.filter(m => m.id !== recipeIdToRemove));
    } else {
      // Update the pet's savedRecipes array
      const updatedPet: Pet = {
        ...pet,
        savedRecipes: (pet.savedRecipes || []).filter(id => id !== recipeIdToRemove),
      };

      await savePet(userId, updatedPet);
      setPet(updatedPet);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-xl text-green-800 font-medium">Loading pet profile...</p>
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
          className="mt-6 inline-flex items-center text-green-800 hover:text-green-900 transition-colors font-medium"
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
          className="inline-flex items-center text-gray-500 hover:text-green-800 transition-colors mb-3 text-sm"
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
                  : 'bg-green-800 text-white hover:bg-green-900'
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
                  href={`/recipe/${recipe.id}?petId=${pet.id}`}
                  className="flex items-center flex-grow group"
                >
                  <div className="ml-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-lg font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
                        {recipe.name}
                      </p>
                      {recipe.isCustom && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                          Custom
                        </span>
                      )}
                      {recipe.isCustom && recipe.compatibilityScore !== undefined && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-100">
                          <span className="text-xs font-medium text-gray-600">Score:</span>
                          <span className={`text-xs font-bold ${
                            recipe.compatibilityScore >= 80 ? 'text-green-600' :
                            recipe.compatibilityScore >= 60 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {recipe.compatibilityScore}
                          </span>
                        </div>
                      )}
                    </div>
                    {recipe.dateAdded && (
                      <div className="flex items-center text-sm text-gray-500 mt-1">
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
                className="mt-4 inline-block px-6 py-2 bg-green-800 text-white rounded-lg hover:bg-green-900 transition-colors font-medium shadow-md"
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