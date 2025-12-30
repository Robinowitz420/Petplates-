'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import type { Recipe, CustomMeal } from '@/lib/types';
import { getProductPrice } from '@/lib/data/product-prices';
import { VETTED_PRODUCTS, getVettedProduct, getVettedProductByAnyIdentifier } from '@/lib/data/vetted-products';
import { getCustomMeals } from '@/lib/utils/customMealStorage';
import { getPets } from '@/lib/utils/petStorage'; // Import async storage
import { ensureCartUrlSellerId } from '@/lib/utils/affiliateLinks';

// Format price for display
const formatPrice = (price: number) => {
  return `$${price.toFixed(2)}`;
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface PetProfile {
  id: string;
  name: string;
  savedRecipes: string[];
}

const buildEvenPlan = (meals: Recipe[]) => {
  const totalSlots = DAYS.length * 2;
  const rotation: Recipe[] = [];
  while (rotation.length < totalSlots) {
    rotation.push(...meals);
  }
  return rotation.slice(0, totalSlots);
};

const shuffleMealsNoRepeats = (meals: Recipe[], totalSlots: number) => {
  if (meals.length === 0) return [];
  const poolBase = [...meals];
  const rotation: Recipe[] = [];

  const shuffle = (arr: Recipe[]) => {
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  let pool = shuffle([...poolBase]);

  while (rotation.length < totalSlots) {
    if (pool.length === 0) {
      pool = shuffle([...poolBase]);
    }
    const next = pool.pop() as Recipe;
    // Avoid duplicate within the same day (pair of two)
    if (rotation.length % 2 === 1 && rotation[rotation.length - 1].id === next.id) {
      // Put it back to the front and try another
      pool.unshift(next);
      continue;
    }
    rotation.push(next);
  }

  return rotation;
};

export default function MealPlanPage() {
  const params = useParams();
  const router = useRouter();
  const petId = params.id as string;
  const { userId, isLoaded } = useAuth();

  const [pet, setPet] = useState<PetProfile | null>(null);
  const [savedMeals, setSavedMeals] = useState<Recipe[]>([]);
  const [customMeals, setCustomMeals] = useState<CustomMeal[]>([]);
  const [weeklyPlan, setWeeklyPlan] = useState<{ day: string; meals: Recipe[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [swapTarget, setSwapTarget] = useState<{ dayIdx: number; mealIdx: number } | null>(null);

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
        setSavedMeals([]);
        setCustomMeals([]);
        setWeeklyPlan([]);
        setLoading(false);
        return;
      }
      try {
        const pets = await getPets(userId);
        const foundPet = pets.find((p: any) => p.id === petId) || null;
        
        if (foundPet) {
          // Normalize pet profile
          setPet({
            id: foundPet.id,
            name: foundPet.name || foundPet.names?.[0] || 'Pet',
            savedRecipes: foundPet.savedRecipes || [],
          });

          // Saved recipes are no longer stored statically
          setSavedMeals([]);
          
          // Load custom meals
          const customMealsList = await getCustomMeals(userId, petId);
          setCustomMeals(customMealsList);
        } else {
          setPet(null);
        }
      } catch (error) {
        console.error('Error loading meal plan data:', error);
      }
      setLoading(false);
    };
    loadData();
  }, [isLoaded, petId, userId]);

  const generatePlan = (meals: Recipe[]) => {
    const rotation = buildEvenPlan(meals);
    const plan: { day: string; meals: Recipe[] }[] = [];
    for (let i = 0; i < DAYS.length; i += 1) {
      const breakfastIndex = i * 2;
      const dinnerIndex = breakfastIndex + 1;
      const breakfast = rotation[breakfastIndex];
      let dinner = rotation[dinnerIndex];
      if (dinner.id === breakfast.id) {
        const swapIndex = rotation.findIndex(
          (entry, idx) => idx > dinnerIndex && entry.id !== breakfast.id
        );
        if (swapIndex !== -1) {
          [rotation[dinnerIndex], rotation[swapIndex]] = [
            rotation[swapIndex],
            rotation[dinnerIndex],
          ];
          dinner = rotation[dinnerIndex];
        } else {
          dinner = meals.find((meal) => meal.id !== breakfast.id) || dinner;
        }
      }
      plan.push({ day: DAYS[i], meals: [breakfast, dinner] });
    }
    return plan;
  };

  const allMeals = useMemo<Recipe[]>(() => {
    return [
      ...savedMeals,
      ...customMeals.map(convertCustomMealToRecipe),
    ];
  }, [savedMeals, customMeals]);

  useEffect(() => {
    if (allMeals.length > 0) {
      setWeeklyPlan(generatePlan(allMeals));
    }
  }, [allMeals]);

  const handleRegenerate = () => {
    setWeeklyPlan(generatePlan(allMeals));
  };

  const handleRandomize = () => {
    const totalSlots = DAYS.length * 2;
    const rotation = shuffleMealsNoRepeats(allMeals, totalSlots);
    const plan: { day: string; meals: Recipe[] }[] = [];
    for (let i = 0; i < DAYS.length; i += 1) {
      const breakfastIndex = i * 2;
      const dinnerIndex = breakfastIndex + 1;
      const breakfast = rotation[breakfastIndex];
      const dinner = rotation[dinnerIndex];
      plan.push({ day: DAYS[i], meals: [breakfast, dinner] });
    }
    setWeeklyPlan(plan);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-gray-600">Loading meal plan...</p>
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

  const allMealsCount = savedMeals.length + customMeals.length;
  
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
        <div className="bg-surface rounded-xl shadow p-6 flex flex-col gap-4 border border-surface-highlight">
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
              7-Day Meal Plan for {pet.name}
            </h1>
            <p className="text-gray-600 mt-1">
              Two meals per day. No repeats on the same day. Each saved meal gets equal play.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {weeklyPlan.map((dayPlan, index) => (
            <div key={dayPlan.day} className="bg-surface rounded-lg shadow p-2 border border-surface-highlight">
              <div className="text-center mb-2">
                <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                  {dayPlan.day.slice(0, 3)}
                </p>
              </div>
              <div className="space-y-2">
                {dayPlan.meals.map((meal, mealIndex) => (
                  <div key={meal.id + mealIndex} className="text-center">
                    <Link
                      href={`/recipe/${meal.id}?petId=${petId}`}
                      className="block hover:text-primary-600 transition-colors mb-1"
                    >
                      <p className="font-medium text-gray-900 text-xs leading-tight">
                        {meal.name}
                        {meal.category === 'custom' && (
                          <span className="ml-1 text-xs text-green-800">(Custom)</span>
                        )}
                      </p>
                    </Link>
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          const cartItems = meal.ingredients
                            .map((ing, index) => {
                              const genericName = ing.name.toLowerCase().trim();
                              const vettedProduct = VETTED_PRODUCTS[genericName];
                              const link = vettedProduct ? vettedProduct.purchaseLink : ing.asinLink;
                              if (link) {
                                // Extract ASIN from /dp/ASIN format
                                const asinMatch = link.match(/\/dp\/([A-Z0-9]{10})/);
                                if (asinMatch) {
                                  return `ASIN.${index + 1}=${asinMatch[1]}&Quantity.${index + 1}=1`;
                                }
                              }
                              return null;
                            })
                            .filter(Boolean);

                          if (cartItems.length > 0) {
                            const cartUrl = ensureCartUrlSellerId(`https://www.amazon.com/gp/aws/cart/add.html?${cartItems.join('&')}`);
                            window.open(cartUrl, '_blank');
                          } else {
                            alert('No ingredient links available for this recipe.');
                          }
                        }}
                        className="inline-flex items-center gap-1 text-xs bg-green-600 text-black px-1 py-0.5 rounded hover:bg-green-700 transition-colors"
                        title="Add all vetted ingredients to your Amazon cart"
                      >
                        <ShoppingCart size={8} />
                        Buy
                      </button>
                      {/* Price Display */}
                      {(() => {
                        const mealTotalPrice = meal.ingredients?.reduce((sum, ing) => {
                          const price = getProductPrice(ing.name);
                          if (typeof price === 'number') return sum + price;
                          return sum;
                        }, 0) || 0;
                        return mealTotalPrice > 0 ? (
                          <span className="text-[10px] text-green-700 font-semibold">
                            {formatPrice(mealTotalPrice)}
                          </span>
                        ) : null;
                      })()}
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setSwapTarget({ dayIdx: index, mealIdx: mealIndex });
                      }}
                      className="mt-2 w-full inline-flex items-center justify-center gap-1 text-xs px-2 py-1 rounded border border-primary-500 text-primary-700 bg-surface hover:bg-surface-highlight transition-colors"
                      title="Edit this slot"
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {swapTarget && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
            <div className="bg-surface rounded-xl shadow-2xl max-w-lg w-full p-5 border border-surface-highlight">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900">Swap Meal</h3>
                <button
                  onClick={() => setSwapTarget(null)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close swap dialog"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-3">Choose a saved meal to place into this slot.</p>
              <div className="max-h-72 overflow-y-auto space-y-2">
                {allMeals.map((meal) => (
                  <button
                    key={meal.id}
                    onClick={() => {
                      if (!swapTarget) return;
                      const planCopy = weeklyPlan.map((d) => ({ ...d, meals: [...d.meals] }));
                      planCopy[swapTarget.dayIdx].meals[swapTarget.mealIdx] = meal;
                      setWeeklyPlan(planCopy);
                      setSwapTarget(null);
                    }}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-green-600 hover:bg-green-50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">{meal.name}</span>
                      {meal.category === 'custom' && (
                        <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Custom</span>
                      )}
                    </div>
                  </button>
                ))}
                {allMeals.length === 0 && (
                  <p className="text-sm text-gray-500">No saved meals available.</p>
                )}
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setSwapTarget(null)}
                  className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-surface rounded-xl shadow p-6 border border-surface-highlight">
          <h3 className="text-lg font-bold text-gray-900 mb-2">How rotation works</h3>
          <p className="text-gray-600 text-sm mb-2">
            We loop through every saved meal (recipes and custom meals) equally, then shuffle lightly to keep variety.
            Each day uses two different meals so {pet.name} never sees a repeat on the same day.
          </p>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              <strong>Meals included:</strong> {savedMeals.length} saved recipe{savedMeals.length !== 1 ? 's' : ''} 
              {customMeals.length > 0 && ` + ${customMeals.length} custom meal${customMeals.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={handleRandomize}
            className="btn btn-success btn-sm"
          >
            Randomize Week
          </button>
          <Link
            href={`/pets/${petId}/nutrition`}
            className="btn btn-success btn-sm"
          >
            View Nutrition Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}