'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag, Trash2, X } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import type { Pet, Recipe, CustomMeal } from '@/lib/types';

import { getIngredientDisplayPricing } from '@/lib/data/product-prices';
import { ensureSellerId } from '@/lib/utils/affiliateLinks';
import { buildAmazonSearchUrl } from '@/lib/utils/purchaseLinks';
import { deleteCustomMeal, getCustomMeals } from '@/lib/utils/customMealStorage';
import { getPets, savePet } from '@/lib/utils/petStorage'; // Import async storage
import AlphabetText from '@/components/AlphabetText';

import MealPlanBanner from '@/public/images/Site Banners/MealPlan.png';

// Format price for display
const formatPrice = (price: number) => {
  return `$${price.toFixed(2)}`;
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface PetProfile {
  id: string;
  name: string;
  type?: string;
  savedRecipes: string[];
}

export default function MealPlanPage() {
  const params = useParams();
  const router = useRouter();
  const petId = params.id as string;
  const { userId, isLoaded } = useAuth();

  const [pet, setPet] = useState<PetProfile | null>(null);
  const [petRecord, setPetRecord] = useState<Pet | null>(null);
  const [savedMeals, setSavedMeals] = useState<Recipe[]>([]);
  const [customMeals, setCustomMeals] = useState<CustomMeal[]>([]);
  const [mealPlanSchedule, setMealPlanSchedule] = useState<(string | null)[]>(Array(DAYS.length * 2).fill(null));
  const [loading, setLoading] = useState(true);
  const [dragPayload, setDragPayload] = useState<{ mealId: string; from: 'pool' | 'slot'; fromIndex?: number } | null>(null);
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  const openMealBuySearch = useCallback((meal: Recipe | null) => {
    if (typeof window === 'undefined') return;
    const ingredients = Array.isArray(meal?.ingredients) ? (meal as any).ingredients : [];
    const names = (ingredients as any[])
      .map((ing: any) => String(ing?.name || '').trim())
      .filter(Boolean);
    if (names.length === 0) return;

    for (let i = 0; i < names.length; i++) {
      const url = ensureSellerId(buildAmazonSearchUrl(names[i]));
      if (!url) continue;
      setTimeout(() => {
        window.open(url, '_blank');
      }, i * 350);
    }
  }, []);

  // Convert custom meal to Recipe format for meal plan
  const convertCustomMealToRecipe = (customMeal: CustomMeal): Recipe => {
    return {
      id: customMeal.id,
      name: customMeal.name,
      category: 'custom', // Mark as custom meal
      ageGroup: ['adult'], // Default, could be enhanced
      healthConcerns: [],
      description: `Custom meal created on ${new Date(customMeal.createdAt).toLocaleDateString()}`,
      ingredients: customMeal.ingredients.map((ing, idx) => ({
        id: `${idx + 1}`,
        name: ing.key.replace(/_/g, ' '),
        amount: `${ing.grams}g`,
      })),
      instructions: [
        'Mix all ingredients according to saved recipe',
        'Serve at recommended portion size',
        `Recommended serving: ${customMeal.analysis.recommendedServingGrams}g`,
      ],
      nutritionalInfo: {
        protein: {
          min: (customMeal.analysis.nutrients.protein_g || 0) / (customMeal.analysis.totalRecipeGrams / 100),
          max: (customMeal.analysis.nutrients.protein_g || 0) / (customMeal.analysis.totalRecipeGrams / 100),
          unit: '%',
        },
        fat: {
          min: (customMeal.analysis.nutrients.fat_g || 0) / (customMeal.analysis.totalRecipeGrams / 100),
          max: (customMeal.analysis.nutrients.fat_g || 0) / (customMeal.analysis.totalRecipeGrams / 100),
          unit: '%',
        },
        calories: {
          min: customMeal.analysis.nutrients.kcal || customMeal.analysis.nutrients.calories_kcal || 0,
          max: customMeal.analysis.nutrients.kcal || customMeal.analysis.nutrients.calories_kcal || 0,
          unit: 'kcal',
        },
      },
      rating: 0,
      reviews: 0,
      tags: ['custom', 'user-created'],
    };
  };

  useEffect(() => {
    const loadData = async () => {
      if (!isLoaded) return;
      if (!userId) {
        setPet(null);
        setPetRecord(null);
        setSavedMeals([]);
        setCustomMeals([]);
        setMealPlanSchedule(Array(DAYS.length * 2).fill(null));
        setLoading(false);
        return;
      }
      try {
        const pets = await getPets(userId);
        const foundPet = (pets.find((p: any) => p.id === petId) as Pet | undefined) || null;
        
        if (foundPet) {
          setPetRecord(foundPet);
          // Normalize pet profile
          setPet({
            id: foundPet.id,
            name: foundPet.name || foundPet.names?.[0] || 'Pet',
            type: foundPet.type,
            savedRecipes: foundPet.savedRecipes || [],
          });

          const scheduleRaw = (foundPet as any)?.mealPlanSchedule;
          const schedule = Array.isArray(scheduleRaw)
            ? scheduleRaw.map((x: any) => {
                const s = x === null || x === undefined ? null : String(x || '').trim();
                return s ? s : null;
              })
            : [];
          const normalizedSchedule = Array(DAYS.length * 2)
            .fill(null)
            .map((_, idx) => (idx < schedule.length ? (schedule[idx] as any) : null));
          setMealPlanSchedule(normalizedSchedule);
          
          // Load custom meals
          const customMealsList = await getCustomMeals(userId, petId);
          setCustomMeals(customMealsList);
        } else {
          setPet(null);
          setPetRecord(null);
          setMealPlanSchedule(Array(DAYS.length * 2).fill(null));
        }
      } catch (error) {
        console.error('Error loading meal plan data:', error);
      }
      setLoading(false);
    };
    loadData();
  }, [isLoaded, petId, userId]);

  useEffect(() => {
    const loadSavedRecipes = async () => {
      if (!userId || !petRecord) {
        setSavedMeals([]);
        return;
      }

      const ids = Array.from(new Set((petRecord.savedRecipes || []).map((x) => String(x || '').trim()).filter(Boolean)))
        .filter((id) => !id.startsWith('custom_'));
      if (ids.length === 0) {
        setSavedMeals([]);
        return;
      }

      const results = await Promise.allSettled(
        ids.map(async (id) => {
          const res = await fetch(`/api/recipes/generated/${encodeURIComponent(id)}`);
          if (!res.ok) throw new Error('not-found');
          const data = await res.json();
          if (!data?.recipe) throw new Error('not-found');
          return data.recipe as Recipe;
        })
      );

      const loaded = results.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []));
      setSavedMeals(loaded);
    };

    void loadSavedRecipes();
  }, [userId, petRecord]);

  const poolMeals = useMemo(() => {
    const list: Recipe[] = [];

    const byId = new Map<string, Recipe>();
    savedMeals.forEach((m) => {
      if (m?.id) byId.set(m.id, m);
    });
    customMeals.forEach((m) => {
      const r = convertCustomMealToRecipe(m);
      if (r?.id) byId.set(r.id, r);
    });

    const ids = Array.from(
      new Set(
        (petRecord?.savedRecipes || [])
          .map((x) => String(x || '').trim())
          .filter(Boolean)
      )
    );
    ids.forEach((id) => {
      const recipe = byId.get(id) || null;
      if (recipe) list.push(recipe);
      else list.push({
        id,
        name: id,
        category: 'unknown',
        ageGroup: ['adult'],
        healthConcerns: [],
        ingredients: [],
        instructions: [],
      } as Recipe);
    });

    return list;
  }, [petRecord, savedMeals, customMeals]);

  const mealsById = useMemo(() => {
    const map: Record<string, Recipe> = {};
    poolMeals.forEach((m) => {
      if (m?.id) map[m.id] = m;
    });
    return map;
  }, [poolMeals]);

  const weekSlots = useMemo(() => {
    return DAYS.map((day, dayIdx) => {
      const start = dayIdx * 2;
      return {
        day,
        slots: [
          { label: 'Breakfast', index: start, mealId: mealPlanSchedule[start] || null },
          { label: 'Dinner', index: start + 1, mealId: mealPlanSchedule[start + 1] || null },
        ],
      };
    });
  }, [mealPlanSchedule]);

  const persistSchedule = useCallback(
    async (nextSchedule: (string | null)[]) => {
      if (!userId || !petRecord) return;

      const normalizedSchedule = Array(DAYS.length * 2)
        .fill(null)
        .map((_, idx) => {
          const v = idx < nextSchedule.length ? nextSchedule[idx] : null;
          const s = v === null || v === undefined ? null : String(v || '').trim();
          return s ? s : null;
        });

      const nextMealPlanIds = Array.from(new Set(normalizedSchedule.filter(Boolean) as string[]));
      const updatedPet: any = {
        ...petRecord,
        mealPlanSchedule: normalizedSchedule,
        mealPlan: nextMealPlanIds,
      };

      setIsSavingPlan(true);
      try {
        await savePet(userId, updatedPet as Pet);
        setPetRecord(updatedPet as Pet);
        setMealPlanSchedule(normalizedSchedule);
      } finally {
        setIsSavingPlan(false);
      }
    },
    [userId, petRecord]
  );

  const handleClearSlot = useCallback(
    async (slotIndex: number) => {
      const next = [...mealPlanSchedule];
      next[slotIndex] = null;
      await persistSchedule(next);
    },
    [mealPlanSchedule, persistSchedule]
  );

  const handleDeleteMealFromPool = useCallback(
    async (mealId: string) => {
      if (!userId || !petRecord) return;
      const ok = typeof window !== 'undefined' ? window.confirm('Delete this meal? This also removes it from any day slots.') : false;
      if (!ok) return;

      const nextScheduleRaw = mealPlanSchedule.map((id) => (id === mealId ? null : id));
      const normalizedSchedule = Array(DAYS.length * 2)
        .fill(null)
        .map((_, idx) => {
          const v = idx < nextScheduleRaw.length ? nextScheduleRaw[idx] : null;
          const s = v === null || v === undefined ? null : String(v || '').trim();
          return s ? s : null;
        });

      const nextMealPlanIds = Array.from(new Set(normalizedSchedule.filter(Boolean) as string[]));
      const nextSaved = (petRecord.savedRecipes || []).filter((id) => String(id || '').trim() !== mealId);

      if (mealId.startsWith('custom_')) {
        try {
          await deleteCustomMeal(userId, petRecord.id, mealId);
        } catch {
          // ignore
        }
        setCustomMeals((prev) => prev.filter((m) => m.id !== mealId));
      }

      const updatedPet: any = {
        ...petRecord,
        savedRecipes: nextSaved,
        mealPlanSchedule: normalizedSchedule,
        mealPlan: nextMealPlanIds,
      };

      setIsSavingPlan(true);
      try {
        await savePet(userId, updatedPet as Pet);
        setPetRecord(updatedPet as Pet);
        setPet((prev) => (prev ? { ...prev, savedRecipes: nextSaved } : prev));
        setMealPlanSchedule(normalizedSchedule);
      } finally {
        setIsSavingPlan(false);
      }
    },
    [userId, petRecord, mealPlanSchedule]
  );

  const onDragStartPool = useCallback((mealId: string) => {
    setDragPayload({ mealId, from: 'pool' });
  }, []);

  const onDragStartSlot = useCallback((mealId: string, fromIndex: number) => {
    setDragPayload({ mealId, from: 'slot', fromIndex });
  }, []);

  const onDropToSlot = useCallback(
    async (slotIndex: number) => {
      if (!dragPayload) return;
      const mealId = dragPayload.mealId;
      if (!mealId) return;

      const next = [...mealPlanSchedule];
      const targetExisting = next[slotIndex];

      if (dragPayload.from === 'slot' && typeof dragPayload.fromIndex === 'number') {
        const fromIndex = dragPayload.fromIndex;
        if (fromIndex === slotIndex) return;

        // Swap if dropping onto a filled slot
        next[fromIndex] = targetExisting || null;
        next[slotIndex] = mealId;
      } else {
        next[slotIndex] = mealId;
      }

      setDragPayload(null);
      await persistSchedule(next);
    },
    [dragPayload, mealPlanSchedule, persistSchedule]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-gray-600">Loading meal plan...</p>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-lg bg-surface rounded-xl shadow p-8 text-center space-y-4 border border-surface-highlight">
          <h1 className="text-2xl font-bold text-gray-900">Pet not found</h1>
          <button
            onClick={() => router.push('/profile')}
            className="bg-green-800 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-900 transition-colors"
          >
            Back to pets
          </button>
        </div>
      </div>
    );
  }

  const allMealsCount = poolMeals.length;
  
  if (allMealsCount < 1) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-lg bg-surface rounded-xl shadow p-8 text-center space-y-4 border border-surface-highlight">
          <div className="text-5xl">🍽️</div>
          <h1 className="text-2xl font-bold text-gray-900">Add more meals first</h1>
          <p className="text-gray-600">
            Save at least two meals (recipes or custom meals) for {pet.name} to build a balanced weekly rotation.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => router.push(`/recipes/recommended/${pet.id}`)}
              className="bg-green-800 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-900 transition-colors"
            >
              See Recommended Meals
            </button>
            <button
              onClick={() => router.push(`/profile/pet/${pet.id}/recipe-builder`)}
              className="bg-green-800 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-900 transition-colors"
            >
              Create Custom Meal
            </button>
            <button
              onClick={() => router.push(`/profile/pet/${pet.id}`)}
              className="text-green-800 font-semibold"
            >
              Find More Meals for {pet.name}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-center">
          <Image src={MealPlanBanner} alt="Meal Plan banner" className="h-auto w-full max-w-4xl" priority />
        </div>
        <div className="bg-surface rounded-lg border border-surface-highlight p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3 text-green-800">
            <button
              onClick={() => router.push('/profile')}
              className="inline-flex items-center gap-2 font-semibold"
            >
              <ArrowLeft size={20} />
              Back to pets
            </button>
          </div>
          <div>
            <p className="text-sm uppercase tracking-wide text-gray-500 font-semibold">
              Weekly Meal Prep
            </p>
            <h1 className="text-3xl font-bold text-gray-900">
              <span className="mr-2">7-Day Meal Plan for</span>
              <AlphabetText text={pet.name} size={28} />
            </h1>
            <p className="text-gray-600 mt-1">
              Drag meals from the pool into empty slots.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          <div className="bg-surface rounded-lg border border-surface-highlight p-6">
            <div className="grid grid-cols-7 gap-2">
              {weekSlots.map((dayPlan) => (
                <div
                  key={dayPlan.day}
                  className="bg-surface-lighter rounded-lg p-3 border border-surface-highlight hover:border-gray-500 transition-all duration-200"
                >
                  <div className="text-center mb-2">
                    <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                      <AlphabetText text={dayPlan.day.slice(0, 3)} size={18} />
                    </p>
                  </div>
                  <div className="space-y-2">
                    {dayPlan.slots.map((slot) => {
                      const mealId = slot.mealId;
                      const meal = mealId ? mealsById[mealId] : null;
                      const mealName = meal?.name || (mealId || 'Empty');

                      return (
                        <div
                          key={`${dayPlan.day}-${slot.label}`}
                          onDragOver={(e) => {
                            e.preventDefault();
                          }}
                          onDrop={async (e) => {
                            e.preventDefault();
                            await onDropToSlot(slot.index);
                          }}
                          className="rounded-lg border border-surface-highlight bg-surface p-3 min-h-[74px] hover:border-gray-500 transition-all duration-200"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">
                              {slot.label}
                            </div>
                            {mealId ? (
                              <button
                                type="button"
                                onClick={() => handleClearSlot(slot.index)}
                                className="text-gray-400 hover:text-gray-200"
                                title="Remove from day"
                                aria-label="Remove from day"
                                disabled={isSavingPlan}
                              >
                                <X size={14} />
                              </button>
                            ) : null}
                          </div>

                          {mealId && meal ? (
                            <div
                              draggable
                              onDragStart={() => onDragStartSlot(mealId, slot.index)}
                              className="mt-2 rounded-lg border border-surface-highlight bg-surface-lighter px-2 py-2 hover:border-gray-500 transition-all duration-200"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <Link
                                  href={`/recipe/${mealId}?petId=${petId}`}
                                  className="text-xs font-semibold text-gray-100 hover:text-orange-200 transition-colors px-2 py-1 bg-surface-highlight/50 rounded border border-surface-highlight hover:bg-surface-highlight hover:border-orange-300 transition-all duration-200 block"
                                >
                                  <AlphabetText text={mealName} size={18} />
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => openMealBuySearch(meal as any)}
                                  className="inline-flex items-center gap-1 text-[10px] bg-green-600 text-black px-1.5 py-0.5 rounded hover:bg-green-700 transition-colors"
                                  title="Buy all ingredients for this recipe"
                                >
                                  <ShoppingBag size={10} />
                                  Buy
                                </button>
                              </div>

                              {(() => {
                                const mealTotalPrice = meal.ingredients?.reduce((sum, ing) => {
                                  const pricing = getIngredientDisplayPricing(ing.name);
                                  const price = pricing?.packagePrice;
                                  if (typeof price === 'number' && Number.isFinite(price) && price > 0) return sum + price;
                                  return sum;
                                }, 0) || 0;
                                return mealTotalPrice > 0 ? (
                                  <div className="mt-1 text-[10px] text-green-200 font-semibold">{formatPrice(mealTotalPrice)}</div>
                                ) : null;
                              })()}
                            </div>
                          ) : (
                            <div
                              className="mt-2 text-xs text-gray-500 italic"
                              onDragOver={(e) => {
                                e.preventDefault();
                              }}
                            >
                              Empty
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface rounded-lg border border-surface-highlight p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-bold text-gray-100">Meal Pool</div>
              <div className="text-xs text-gray-400">Drag into slots</div>
            </div>
            <div className="max-h-[640px] overflow-y-auto space-y-2 pr-1">
              {poolMeals.map((meal) => {
                const mealId = meal.id;
                return (
                  <div
                    key={mealId}
                    draggable
                    onDragStart={() => onDragStartPool(mealId)}
                    className="relative flex items-center justify-between gap-3 p-3 bg-surface-lighter rounded-lg border border-surface-highlight hover:border-gray-500 transition-all duration-200"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-100 px-2 py-1 bg-surface-highlight/50 rounded border border-surface-highlight transition-all duration-200">
                        <AlphabetText text={meal.name} size={20} />
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <Link
                          href={`/recipe/${mealId}?petId=${petId}`}
                          className="text-xs text-orange-200 hover:text-orange-100"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => openMealBuySearch(meal as any)}
                          className="text-xs text-green-200 hover:text-green-100"
                        >
                          Buy
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteMealFromPool(mealId)}
                      className="absolute -top-2 -right-2 inline-flex items-center justify-center h-4 w-4 bg-transparent text-red-600 hover:text-red-700 transition-colors duration-200"
                      title="Delete meal"
                      aria-label="Delete meal"
                      disabled={isSavingPlan}
                    >
                      <X size={14} strokeWidth={3} />
                    </button>
                  </div>
                );
              })}
              {poolMeals.length === 0 ? (
                <div className="text-sm text-gray-400">No saved meals yet.</div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-lg border border-surface-highlight p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">How rotation works</h3>
          <p className="text-gray-600 text-sm mb-2">
            Your meal plan is saved per-slot. Drag meals from the pool into the week whenever you want.
          </p>
          <p className="text-xs text-gray-500">
            <strong>Meals included:</strong> {savedMeals.length} saved recipe{savedMeals.length !== 1 ? 's' : ''} 
            {customMeals.length > 0 && ` + ${customMeals.length} custom meal${customMeals.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <Link href={`/pets/${petId}/nutrition`} className="btn btn-success btn-sm btn-ripple hover:scale-105 transition-all duration-200">
          View Nutrition Dashboard
        </Link>
      </div>
    </div>
  );
}