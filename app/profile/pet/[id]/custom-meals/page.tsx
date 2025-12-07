'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2, Edit, Calendar, ChefHat } from 'lucide-react';
import { getCustomMeals, deleteCustomMeal } from '@/lib/utils/customMealStorage';
import type { CustomMeal } from '@/lib/types';

interface Pet {
  id: string;
  names: string[];
  type: string;
  breed: string;
  age: string;
  weight: string;
  healthConcerns?: string[];
  dietaryRestrictions?: string[];
  allergies?: string[];
  dislikes?: string[];
  savedRecipes?: string[];
  weightKg?: number;
}

const getCurrentUserId = () => {
  if (typeof window === 'undefined') return 'clerk_simulated_user_id_123';
  return localStorage.getItem('last_user_id') || 'clerk_simulated_user_id_123';
};

const getPetsFromLocalStorage = (userId: string): Pet[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(`pets_${userId}`);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export default function CustomMealsHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const petId = params.id as string;
  
  const [pet, setPet] = useState<Pet | null>(null);
  const [customMeals, setCustomMeals] = useState<CustomMeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = getCurrentUserId();
    const pets = getPetsFromLocalStorage(userId);
    const foundPet = pets.find(p => p.id === petId) || null;
    setPet(foundPet);
    
    if (foundPet) {
      const meals = getCustomMeals(userId, petId);
      // Sort by most recent first
      meals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setCustomMeals(meals);
    }
    
    setLoading(false);
  }, [petId]);

  const handleDelete = (mealId: string) => {
    if (!confirm('Are you sure you want to delete this custom meal?')) return;
    
    const userId = getCurrentUserId();
    deleteCustomMeal(userId, petId, mealId);
    
    // Refresh the list
    const meals = getCustomMeals(userId, petId);
    meals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setCustomMeals(meals);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading custom meals...</p>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow text-center space-y-4">
          <p className="text-xl font-semibold text-gray-800">Pet not found.</p>
          <Link href="/profile" className="text-green-800 font-semibold">
            Back to Profiles
          </Link>
        </div>
      </div>
    );
  }

  // Get random name from pet's names array
  const petNames = Array.isArray(pet.names) ? pet.names.filter(n => n && n.trim() !== '') : [];
  const petDisplayName = petNames.length > 0 
    ? petNames[Math.floor(Math.random() * petNames.length)]
    : 'Pet';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href={`/profile/pet/${petId}`}
                className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ArrowLeft size={18} className="text-gray-600" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  Custom Meals for {petDisplayName}
                </h1>
                <p className="text-xs text-gray-600 mt-0.5">
                  {pet.breed} • {pet.age} • {pet.weight}
                </p>
              </div>
            </div>
            <Link
              href={`/profile/pet/${petId}/recipe-builder`}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-800 rounded-md hover:bg-green-900 transition-colors"
            >
              <ChefHat size={16} />
              Create New Meal
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3">
        {customMeals.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <ChefHat size={48} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No custom meals yet</h2>
            <p className="text-gray-600 mb-6">
              Create your first custom meal to get started!
            </p>
            <Link
              href={`/profile/pet/${petId}/recipe-builder`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
            >
              <ChefHat size={16} />
              Create Your First Meal
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customMeals.map((meal) => (
              <div
                key={meal.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                {/* Meal Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {meal.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar size={14} />
                      {formatDate(meal.createdAt)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(meal.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete meal"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Compatibility Score */}
                <div className={`mb-4 p-3 rounded-lg border ${getScoreColor(meal.analysis.score)}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Compatibility Score</span>
                    <span className="text-2xl font-bold">{meal.analysis.score}</span>
                  </div>
                  <div className="w-full bg-white/50 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full ${
                        meal.analysis.score >= 80 ? 'bg-green-600' :
                        meal.analysis.score >= 60 ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${meal.analysis.score}%` }}
                    />
                  </div>
                </div>

                {/* Ingredients Summary */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Ingredients</h4>
                  <div className="space-y-1">
                    {meal.ingredients.slice(0, 3).map((ing, idx) => (
                      <div key={idx} className="text-sm text-gray-600">
                        • {ing.key.replace(/_/g, ' ')} ({ing.grams}g)
                      </div>
                    ))}
                    {meal.ingredients.length > 3 && (
                      <div className="text-sm text-gray-500">
                        + {meal.ingredients.length - 3} more
                      </div>
                    )}
                  </div>
                </div>

                {/* Nutritional Summary */}
                <div className="mb-4 text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Total Weight:</span>
                    <span className="font-medium">{meal.analysis.totalRecipeGrams}g</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Recommended Serving:</span>
                    <span className="font-medium text-green-800">
                      {meal.analysis.recommendedServingGrams}g
                    </span>
                  </div>
                </div>

                {/* Warnings Summary */}
                {meal.analysis.toxicityWarnings.length > 0 && (
                  <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                    ⚠️ {meal.analysis.toxicityWarnings.length} safety warning(s)
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      // TODO: Implement edit functionality (load meal into builder)
                      router.push(`/profile/pet/${petId}/recipe-builder?mealId=${meal.id}`);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Implement view details
                      router.push(`/profile/pet/${petId}/custom-meals/${meal.id}`);
                    }}
                    className="flex-1 px-3 py-2 text-sm font-medium text-green-800 bg-green-900/10 border border-green-800/30 rounded-md hover:bg-green-900/20 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

