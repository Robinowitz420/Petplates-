'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, ShoppingCart } from 'lucide-react';
import { recipes } from '@/lib/data/recipes-complete';
import type { Recipe } from '@/lib/types';
import { VETTED_PRODUCTS } from '@/lib/data/vetted-products';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SIMULATED_USER_ID = 'clerk_simulated_user_id_123';

interface PetProfile {
  id: string;
  name: string;
  savedRecipes: string[];
}

const getCurrentUserId = () => {
  if (typeof window === 'undefined') return SIMULATED_USER_ID;
  return localStorage.getItem('last_user_id') || SIMULATED_USER_ID;
};

const getPetsFromLocalStorage = (userId: string): PetProfile[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(`pets_${userId}`);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed)
      ? parsed.map((pet: any) => ({
          id: pet.id,
          name: pet.name,
          savedRecipes: pet.savedRecipes || [],
        }))
      : [];
  } catch {
    return [];
  }
};

const buildEvenPlan = (meals: Recipe[]) => {
  const totalSlots = DAYS.length * 2;
  const rotation: Recipe[] = [];
  while (rotation.length < totalSlots) {
    rotation.push(...meals);
  }
  const trimmed = rotation.slice(0, totalSlots);
  for (let i = trimmed.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [trimmed[i], trimmed[j]] = [trimmed[j], trimmed[i]];
  }
  return trimmed;
};

export default function MealPlanPage() {
  const params = useParams();
  const router = useRouter();
  const petId = params.id as string;

  const [pet, setPet] = useState<PetProfile | null>(null);
  const [savedMeals, setSavedMeals] = useState<Recipe[]>([]);
  const [weeklyPlan, setWeeklyPlan] = useState<{ day: string; meals: Recipe[] }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = getCurrentUserId();
    const pets = getPetsFromLocalStorage(userId);
    const foundPet = pets.find((p) => p.id === petId) || null;
    setPet(foundPet);
    if (foundPet) {
      const meals = (foundPet.savedRecipes || [])
        .map((recipeId) => recipes.find((recipe) => recipe.id === recipeId))
        .filter(Boolean) as Recipe[];
      setSavedMeals(meals);
    }
    setLoading(false);
  }, [petId]);

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

  useEffect(() => {
    if (savedMeals.length >= 2) {
      setWeeklyPlan(generatePlan(savedMeals));
    }
  }, [savedMeals]);

  const handleRegenerate = () => {
    setWeeklyPlan(generatePlan(savedMeals));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading meal plan...</p>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow text-center space-y-4">
          <p className="text-xl font-semibold text-gray-800">Pet not found.</p>
          <Link href="/profile" className="text-primary-600 font-semibold">
            Back to Profiles
          </Link>
        </div>
      </div>
    );
  }

  if (savedMeals.length < 2) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg bg-white rounded-xl shadow p-8 text-center space-y-4">
          <div className="text-5xl">🍽️</div>
          <h1 className="text-2xl font-bold text-gray-900">Add more meals first</h1>
          <p className="text-gray-600">
            Save at least two meals for {pet.name} to build a balanced weekly rotation.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => router.push(`/recipes/recommended/${pet.id}`)}
              className="bg-primary-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              See Recommended Meals
            </button>
            <button
              onClick={() => router.push(`/profile/pet/${pet.id}`)}
              className="text-primary-600 font-semibold"
            >
              Find More Meals for {pet.name}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3 text-primary-600">
            <button
              onClick={() => router.push('/profile')}
              className="inline-flex items-center gap-2 font-semibold"
            >
              <ArrowLeft size={20} />
              Back to pets
            </button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
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
            <button
              onClick={handleRegenerate}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700"
            >
              <RefreshCw size={18} />
              Regenerate Plan
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weeklyPlan.map((dayPlan, index) => (
            <div key={dayPlan.day} className="bg-white rounded-lg shadow p-2">
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
                      <p className="font-medium text-gray-900 text-xs leading-tight">{meal.name}</p>
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        const cartItems = meal.ingredients
                          .map((ing, index) => {
                            const genericName = ing.name.toLowerCase().trim();
                            const vettedProduct = VETTED_PRODUCTS[genericName];
                            const link = vettedProduct ? vettedProduct.purchaseLink : ing.amazonLink;
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
                          const cartUrl = `https://www.amazon.com/gp/aws/cart/add.html?${cartItems.join('&')}`;
                          window.open(cartUrl, '_blank');
                        } else {
                          alert('No ingredient links available for this recipe.');
                        }
                      }}
                      className="inline-flex items-center gap-1 text-xs bg-green-600 text-white px-1 py-0.5 rounded hover:bg-green-700 transition-colors"
                      title="Add all vetted ingredients to your Amazon cart"
                    >
                      <ShoppingCart size={8} />
                      Buy
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">How rotation works</h3>
          <p className="text-gray-600 text-sm">
            We loop through every saved meal equally, then shuffle lightly to keep variety.
            Each day uses two different meals so {pet.name} never sees a repeat on the same day.
          </p>
        </div>
      </div>
    </div>
  );
}