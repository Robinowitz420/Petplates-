'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Trash2, Edit, Calendar, ChefHat, Loader2 } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { getCustomMealsPaged, deleteCustomMeal } from '@/lib/utils/customMealStorage';
import { getPets } from '@/lib/utils/petStorage'; // Import async storage
import type { CustomMeal, Pet } from '@/lib/types';
import CompatibilityRadial from '@/components/CompatibilityRadial';
import AlphabetText from '@/components/AlphabetText';
import { normalizePetType } from '@/lib/utils/petType';

export default function CustomMealsHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const petId = params.id as string;
  const { userId, isLoaded } = useAuth();
  
  const [pet, setPet] = useState<Pet | null>(null);
  const [customMeals, setCustomMeals] = useState<CustomMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const [saasScoresByMealId, setSaasScoresByMealId] = useState<Record<string, number>>({});
  const [saasLoadingByMealId, setSaasLoadingByMealId] = useState<Record<string, boolean>>({});
  const saasScoreCacheRef = useRef<Map<string, { ts: number; score: number }>>(new Map());

  const loadPage = async (mode: 'initial' | 'more') => {
    if (!isLoaded) return;
    if (!userId) return;
    if (!petId) return;

    if (mode === 'initial') {
      setLoading(true);
      setNextCursor(null);
      setHasMore(false);
    } else {
      setLoadingMore(true);
    }

    try {
      const result = await getCustomMealsPaged(userId, petId, {
        limit: 30,
        cursor: mode === 'more' ? nextCursor : null,
      });
      const meals = result.customMeals || [];
      const merged = mode === 'more' ? [...customMeals, ...meals] : meals;
      merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setCustomMeals(merged);
      setNextCursor(result.nextCursor);
      setHasMore(Boolean(result.nextCursor) && meals.length > 0);
    } catch (error) {
      console.error('Error loading custom meals:', error);
      if (mode === 'initial') setCustomMeals([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!isLoaded) return;
      if (!userId) {
        setPet(null);
        setCustomMeals([]);
        setLoading(false);
        return;
      }
      try {
        const pets = await getPets(userId);
        const foundPet = pets.find(p => p.id === petId) || null;
        setPet(foundPet);
        if (foundPet) {
          await loadPage('initial');
        }
      } catch (error) {
        console.error('Error loading custom meals:', error);
      }
      setLoading(false);
    };
    loadData();
  }, [isLoaded, petId, userId]);

  useEffect(() => {
    if (!userId || !pet) {
      setSaasScoresByMealId({});
      setSaasLoadingByMealId({});
      saasScoreCacheRef.current.clear();
      return;
    }

    let isCancelled = false;
    const TTL_MS = 30 * 60 * 1000;
    const visibleMeals = customMeals.slice(0, 30);

    const run = async () => {
      for (const meal of visibleMeals) {
        if (isCancelled) return;
        const mealId = String(meal?.id || '');
        if (!mealId) continue;

        const ingredients = Array.isArray(meal.ingredients) ? meal.ingredients : [];
        const ingredientsKey = ingredients
          .map((ing) => `${String((ing as any)?.key || '')}:${String((ing as any)?.grams ?? '')}`)
          .join('|');

        const petKey = [
          String(pet.id || ''),
          String(pet.type || ''),
          Array.isArray((pet as any).healthConcerns) ? (pet as any).healthConcerns.join('|') : '',
          Array.isArray((pet as any).allergies) ? (pet as any).allergies.join('|') : '',
          Array.isArray((pet as any).dietaryRestrictions) ? (pet as any).dietaryRestrictions.join('|') : '',
        ].join('::');

        const cacheKey = `${userId}::${petKey}::customMeal::${mealId}::${ingredientsKey}`;
        const cached = saasScoreCacheRef.current.get(cacheKey);
        if (cached && Date.now() - cached.ts < TTL_MS) {
          setSaasScoresByMealId((prev) => (prev[mealId] === cached.score ? prev : { ...prev, [mealId]: cached.score }));
          continue;
        }

        setSaasLoadingByMealId((prev) => ({ ...prev, [mealId]: true }));

        try {
          const recipePayload = {
            id: mealId,
            name: meal.name,
            category: 'custom',
            ingredients: ingredients
              .map((ing: any, idx: number) => {
                const key = typeof ing?.key === 'string' ? ing.key : '';
                const grams = typeof ing?.grams === 'number' ? ing.grams : Number(ing?.grams);
                if (!key || !Number.isFinite(grams) || grams <= 0) return null;
                return {
                  id: `${mealId}:${key}:${idx}`,
                  name: key.replace(/_/g, ' '),
                  amount: `${grams}g`,
                };
              })
              .filter(Boolean),
          };

          const response = await fetch('/api/compatibility/score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipe: recipePayload,
              pet: {
                id: pet.id,
                name: pet.name || (Array.isArray(pet.names) && pet.names.length > 0 ? pet.names[0] : 'Pet'),
                type: normalizePetType((pet as any).type, 'CustomMealsHistoryPage'),
                breed: (pet as any).breed,
                age: (pet as any).age,
                weight: (pet as any).weightKg || (pet as any).weight,
                activityLevel: (pet as any).activityLevel,
                healthConcerns: (pet as any).healthConcerns || [],
                dietaryRestrictions: (pet as any).dietaryRestrictions || [],
                allergies: (pet as any).allergies || [],
              },
            }),
          });

          if (!response.ok) continue;
          const data = await response.json();
          const score = typeof data?.overallScore === 'number' && Number.isFinite(data.overallScore) ? data.overallScore : null;
          if (score === null) continue;

          saasScoreCacheRef.current.set(cacheKey, { ts: Date.now(), score });
          setSaasScoresByMealId((prev) => (prev[mealId] === score ? prev : { ...prev, [mealId]: score }));
        } catch {
          // ignore - fall back to stored local score
        } finally {
          setSaasLoadingByMealId((prev) => ({ ...prev, [mealId]: false }));
        }
      }
    };

    run();

    return () => {
      isCancelled = true;
    };
  }, [customMeals, pet, userId]);

  const handleDelete = async (mealId: string) => {
    if (!confirm('Are you sure you want to delete this custom meal?')) return;

    if (!isLoaded || !userId) return;

    await deleteCustomMeal(userId, petId, mealId);
    await loadPage('initial');
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-gray-600">Loading custom meals...</p>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bg-surface p-8 rounded-xl shadow text-center space-y-4 border border-surface-highlight">
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
  const petDisplayName = (() => {
    if (petNames.length === 0) return 'Pet';
    const seed = String(petId ?? '');
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
      hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    }
    const idx = hash % petNames.length;
    return petNames[idx] ?? 'Pet';
  })();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-surface-highlight sticky top-0 z-10">
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
                  <span className="mr-2">Custom Meals for</span>
                  <AlphabetText text={petDisplayName} size={22} />
                </h1>
                <p className="text-xs text-gray-600 mt-0.5">
                  {pet.breed} • {pet.age} • {pet.weight}
                </p>
              </div>
            </div>
            <Link
              href={`/profile/pet/${petId}/recipe-builder`}
              className="group relative top-[2px] inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-green-800/40 rounded-2xl"
              aria-label="Create Meal"
            >
              <span className="relative h-[45px] w-[252px] sm:w-[291px] overflow-hidden rounded-2xl">
                <Image
                  src="/images/Buttons/CreateMealUnclicked.png"
                  alt=""
                  fill
                  sizes="300px"
                  className="object-contain transition-opacity duration-75 group-active:opacity-0"
                  priority
                />
                <Image
                  src="/images/Buttons/CreateMealClicked.png"
                  alt=""
                  fill
                  sizes="300px"
                  className="object-contain opacity-0 transition-opacity duration-75 group-active:opacity-100"
                  priority
                />
              </span>
              <span className="sr-only">Create Meal</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3">
        {customMeals.length === 0 ? (
          <div className="bg-surface rounded-lg border border-surface-highlight p-12 text-center">
            <ChefHat size={48} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No custom meals yet</h2>
            <p className="text-gray-600 mb-6">
              Create your first custom meal to get started!
            </p>
            <Link
              href={`/profile/pet/${petId}/recipe-builder`}
              className="group relative top-[2px] inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-green-800/40 rounded-2xl"
              aria-label="Create Meal"
            >
              <span className="relative h-[45px] w-[252px] sm:w-[291px] overflow-hidden rounded-2xl">
                <Image
                  src="/images/Buttons/CreateMealUnclicked.png"
                  alt=""
                  fill
                  sizes="300px"
                  className="object-contain transition-opacity duration-75 group-active:opacity-0"
                  priority
                />
                <Image
                  src="/images/Buttons/CreateMealClicked.png"
                  alt=""
                  fill
                  sizes="300px"
                  className="object-contain opacity-0 transition-opacity duration-75 group-active:opacity-100"
                  priority
                />
              </span>
              <span className="sr-only">Create Meal</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customMeals.map((meal) => (
              <div
                key={meal.id}
                className="bg-surface rounded-lg border border-surface-highlight p-6 hover:shadow-lg transition-shadow"
              >
                {/* Meal Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      <AlphabetText text={meal.name} size={22} />
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
                {(() => {
                  const mealId = String(meal?.id || '');
                  const localScore = typeof meal?.analysis?.score === 'number' ? meal.analysis.score : 0;
                  const saasScore = typeof saasScoresByMealId[mealId] === 'number' ? saasScoresByMealId[mealId] : null;
                  const effectiveScore = saasScore === null ? localScore : saasScore;
                  const isSaasLoading = Boolean(saasLoadingByMealId[mealId]);

                  return (
                    <div className={`mb-4 p-3 rounded-lg border ${getScoreColor(effectiveScore)}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Compatibility Score</span>
                      </div>
                      <div className="mt-3 flex justify-center">
                        <div className="relative">
                          <CompatibilityRadial score={effectiveScore} size={91} strokeWidth={8} label="" />
                          {isSaasLoading ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })()}

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
                      router.push(`/recipe/${meal.id}?petId=${petId}`);
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

        {hasMore && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => loadPage('more')}
              disabled={loadingMore}
              className="px-5 py-3 rounded-lg font-semibold bg-surface border border-surface-highlight hover:bg-surface-highlight transition-colors disabled:opacity-50"
            >
              {loadingMore ? 'Loading…' : 'Load more'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

