'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { recipes } from '@/lib/data/recipes-complete';
import type { ModifiedRecipeResult, Recipe } from '@/lib/types';
import { rateRecipeForPet, type Pet as RatingPet } from '@/lib/utils/petRatingSystem';
import { CompatibilityBadge } from '@/components/CompatibilityBadge';

type PetCategory = 'dogs' | 'cats' | 'birds' | 'reptiles' | 'pocket-pets';
type AgeGroup = 'baby' | 'young' | 'adult' | 'senior';

interface Pet {
  id: string;
  name: string;
  type: PetCategory;
  breed: string;
  age: AgeGroup;
  healthConcerns: string[];
  savedRecipes: string[];
  allergies?: string[];
  weightKg?: number;
  dislikes?: string[];
}

// Same simulated user ID setup as profile and saved-recipes pages
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
            healthConcerns: p.healthConcerns || [],
        }))
      : [];
  } catch (e) {
    console.error('Failed to parse pet data from localStorage', e);
    return [];
  }
};

const savePetsToLocalStorage = (userId: string, pets: Pet[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`pets_${userId}`, JSON.stringify(pets));
  }
};

export default function RecommendedRecipesPage() {
  const params = useParams();
  const [pet, setPet] = useState<Pet | null>(null);
  const [hoveredRecipe, setHoveredRecipe] = useState<string | null>(null);
  const [engineMeals, setEngineMeals] = useState<ModifiedRecipeResult[] | null>(null);
  const [engineError, setEngineError] = useState<string | null>(null);
  const [loadingMeals, setLoadingMeals] = useState(true);
  const [cardMessage, setCardMessage] = useState<{ id: string; text: string } | null>(null);
  const petId = params.id as string;

  // Convert pet data to rating system format
  const ratingPet: RatingPet | null = pet ? {
    id: pet.id,
    name: pet.name,
    type: pet.type as RatingPet['type'],
    breed: pet.breed,
    age: pet.age === 'baby' ? 0.5 : pet.age === 'young' ? 2 : pet.age === 'adult' ? 5 : 10,
    weight: pet.weightKg || (pet.type === 'dogs' ? 25 : pet.type === 'cats' ? 10 : 5),
    activityLevel: 'moderate' as const, // Could be improved with pet data
    healthConcerns: pet.healthConcerns || [],
    dietaryRestrictions: pet.allergies || [],
    dislikes: pet.dislikes || []
  } : null;


  useEffect(() => {
    const userId = getCurrentUserId();
    if (!userId || !petId) return;

    const pets = getPetsFromLocalStorage(userId);
    const foundPet = pets.find((p) => p.id === petId) || null;
    setPet(foundPet);
  }, [petId]);

useEffect(() => {
  if (!pet) return;
  let isMounted = true;
  setLoadingMeals(true);
  setEngineError(null);

  (async () => {
    try {
      const concerns = (pet.healthConcerns || []).filter((concern) => concern !== 'none');
      const allergies = pet.allergies?.filter((allergy) => allergy !== 'none') || [];
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            species: pet.type,
            ageGroup: pet.age,
            breed: pet.breed,
            weightKg: pet.weightKg || 10,
            healthConcerns: concerns,
            allergies,
            petName: pet.name,
          },
          limit: 50,
        }),
      });

      if (!response.ok) {
        throw new Error('Engine offline');
      }

      const data = await response.json();
      if (!isMounted) return;
      setEngineMeals((data?.results as ModifiedRecipeResult[]) || []);
    } catch (error) {
      if (!isMounted) return;
      setEngineMeals(null);
      setEngineError('Personalized explanations unavailable—showing standard matches.');
    } finally {
      if (isMounted) {
        setLoadingMeals(false);
      }
    }
  })();

  return () => {
    isMounted = false;
  };
}, [pet]);

  const handleSaveRecipe = (recipeId: string, recipeName: string) => {
    const userId = getCurrentUserId();
    if (!userId || !pet) return;

    const pets = getPetsFromLocalStorage(userId);
    let didChange = false;

    const updatedPets = pets.map((p) => {
      if (p.id !== pet.id) return p;

      const existing = p.savedRecipes || [];
      if (existing.includes(recipeId)) {
        return p;
      }

      didChange = true;
      return {
        ...p,
        savedRecipes: [...existing, recipeId],
      };
    });

    if (!didChange) {
      setCardMessage({ id: recipeId, text: 'Already saved for this pet.' });
      setTimeout(() => setCardMessage(null), 2500);
      return;
    }

    savePetsToLocalStorage(userId, updatedPets);

    const updatedPet = updatedPets.find((p) => p.id === pet.id) || null;
    setPet(updatedPet);
    setCardMessage({ id: recipeId, text: `${recipeName} added to ${pet.name}'s meals.` });
    setTimeout(() => setCardMessage(null), 2500);
  };

  if (!pet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // First filter by species and age group
  const speciesAndAgeMatches = recipes.filter((recipe) => {
    if (recipe.category !== pet.type) return false;
    if (!recipe.ageGroup.includes(pet.age)) return false;
    return true;
  });

  const buildFallbackExplanation = (recipe: Recipe, currentPet: Pet) => {
    const concern = (currentPet.healthConcerns || [])[0]?.replace(/-/g, ' ') || 'overall wellness';
    const highlight = recipe.tags?.[0] || recipe.description.split('. ')[0];
    return `${recipe.name} keeps ${currentPet.name}'s ${concern} on track with ${highlight?.toLowerCase()}.`;
  };

  // Sort recipes by compatibility score (best to worst)
  const sortedRecipes = speciesAndAgeMatches
    .map(recipe => ({
      recipe,
      score: ratingPet ? rateRecipeForPet(recipe, ratingPet).overallScore : 0
    }))
    .sort((a, b) => b.score - a.score)
    .map(item => item.recipe);

  // Use all species and age matches - scoring will handle health concern preferences
  const recommendedRecipes = sortedRecipes;
  const fallbackMeals = recommendedRecipes.map((recipe) => ({
    recipe,
    explanation: buildFallbackExplanation(recipe, pet),
  }));
  const mealsToRender: (ModifiedRecipeResult | { recipe: Recipe; explanation: string })[] =
    engineMeals && engineMeals.length > 0 ? engineMeals : fallbackMeals;

  // Sort meals by rating (best to worst)
  const sortedMealsToRender = [...mealsToRender].sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // For engine meals, use score property
    if ('score' in a && 'score' in b) {
      scoreA = (a as ModifiedRecipeResult).score || 0;
      scoreB = (b as ModifiedRecipeResult).score || 0;
    }
    // For fallback meals or mixed, calculate rating
    else if (ratingPet) {
      scoreA = rateRecipeForPet(a.recipe, ratingPet).overallScore;
      scoreB = rateRecipeForPet(b.recipe, ratingPet).overallScore;
    }

    // Primary sort: by score descending
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }

    // Secondary sort: by recipe name for stable sorting
    return a.recipe.name.localeCompare(b.recipe.name);
  });

  const totalMeals = sortedMealsToRender.length;
  const usingEngine = Boolean(engineMeals && engineMeals.length > 0);

  const getPetEmoji = (type: PetCategory) => {
    const emojis = {
      dogs: '🐕',
      cats: '🐈',
      birds: '🦜',
      reptiles: '🦎',
      'pocket-pets': '🐰',
    };
    return emojis[type];
  };

  const getHealthMatchScore = (recipe: any, pet: Pet): number => {
    const concerns = pet.healthConcerns || [];
    if (!concerns.length) return 0;
    const overlaps = concerns.filter((c) => (recipe.healthConcerns || []).includes(c));
    if (!overlaps.length) return 0;
    return overlaps.length / concerns.length; // 0..1
  };

  const getHealthMatchBadge = (score: number) => {
    if (score >= 0.67)
      return {
        label: 'Great health match',
        className: 'bg-green-100 text-green-800',
      };
    if (score >= 0.34)
      return {
        label: 'Good health match',
        className: 'bg-yellow-100 text-yellow-800',
      };
    if (score > 0)
      return {
        label: 'Some health benefit',
        className: 'bg-blue-100 text-blue-800',
      };
    return null;
  };

  const getStarStates = (rating: number): boolean[] => {
    const fullStars = Math.round(rating); // 0..5
    return Array.from({ length: 5 }, (_, i) => i < fullStars);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Profile
        </Link>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center gap-4">
            <div className="text-6xl">{getPetEmoji(pet.type)}</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Personalized Meals for {pet.name}
              </h1>
              <p className="text-gray-600 mt-2">
                {pet.breed} • {pet.age} • {totalMeals} meals ready
              </p>
              {(pet.healthConcerns || []).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {(pet.healthConcerns || []).map((concern) => (
                    <span
                      key={concern}
                      className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full"
                    >
                      {concern}
                    </span>
                  ))}
                </div>
              )}
              {usingEngine && (
                <p className="mt-4 text-sm text-green-700 font-medium">
                  ✅ Engine insights enabled for {pet.name}.
                </p>
              )}
              {engineError && (
                <p className="mt-4 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
                  {engineError}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedMealsToRender.map((meal) => {
            const recipe = meal.recipe;
            const explanation = meal.explanation;
            const recipeId = recipe.id;
            return (
            <div
              key={recipeId}
              className="relative group"
              onMouseEnter={() => setHoveredRecipe(recipeId)}
              onMouseLeave={() => setHoveredRecipe(null)}
            >
              <Link href={`/recipe/${recipeId}?petId=${petId}`}>
                <div className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer">
                  <div className="aspect-video relative">
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{recipe.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {recipe.description}
                    </p>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 mb-3">
                      {explanation}
                    </p>
                    {recipe.celebrityQuote && (
                      <p className="italic text-gray-700 text-xs mb-3">
                        "{recipe.celebrityQuote}"
                      </p>
                    )}
                    {pet.healthConcerns.length > 0 && (
                      (() => {
                        const score = getHealthMatchScore(recipe, pet);
                        const badge = getHealthMatchBadge(score);
                        return (
                          badge && (
                            <span
                              className={`inline-block px-2 py-1 mb-2 rounded-full text-xs font-semibold ${badge.className}`}
                            >
                              {badge.label}
                            </span>
                          )
                        );
                      })()
                    )}

                    {/* Compatibility Rating */}
                    {ratingPet && (
                      <div className="mb-3">
                        <CompatibilityBadge
                          compatibility={rateRecipeForPet(recipe, ratingPet).compatibility}
                          score={rateRecipeForPet(recipe, ratingPet).overallScore}
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-end text-sm text-gray-500 mt-1">
                      <span>{recipe.prepTime}</span>
                    </div>
                  </div>
                </div>
              </Link>

              {(() => {
                const isSaved = pet.savedRecipes.includes(recipeId);
                return (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleSaveRecipe(recipeId, recipe.name);
                    }}
                    disabled={isSaved}
                    className={`absolute top-4 right-4 px-3 py-1 rounded-lg shadow-lg transition-colors flex items-center gap-1 ${
                      hoveredRecipe === recipeId || isSaved
                        ? 'opacity-100'
                        : 'opacity-0 group-hover:opacity-100'
                    } transition-opacity ${
                      isSaved
                        ? 'bg-green-600 text-white cursor-not-allowed'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {isSaved ? '✓ Added' : (
                      <>
                        <Plus className="h-4 w-4" /> Add Meal
                      </>
                    )}
                  </button>
                );
              })()}
            </div>
          )})}
        </div>
      </div>
    </div>
  );
}
