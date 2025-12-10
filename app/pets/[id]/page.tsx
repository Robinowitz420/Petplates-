'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { NutritionDashboard } from '@/components/NutritionDashboard';
import { calculateDailyNutrition, getNutritionTargets } from '@/lib/nutrition/nutritionHistory';
import { recipes } from '@/lib/data/recipes-complete';
import { getCustomMeals } from '@/lib/utils/customMealStorage';
import type { Recipe, CustomMeal } from '@/lib/types';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SIMULATED_USER_ID = 'clerk_simulated_user_id_123';

const getCurrentUserId = () => {
  if (typeof window === 'undefined') return SIMULATED_USER_ID;
  return localStorage.getItem('last_user_id') || SIMULATED_USER_ID;
};

const getPetsFromLocalStorage = (userId: string) => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(`pets_${userId}`);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const convertCustomMealToRecipe = (customMeal: CustomMeal): Recipe => {
  return {
    id: customMeal.id,
    name: customMeal.name,
    category: 'custom',
    ageGroup: ['adult'],
    healthConcerns: [],
    description: `Custom meal created on ${new Date(customMeal.createdAt).toLocaleDateString()}`,
    ingredients: customMeal.ingredients.map((ing, idx) => ({
      id: `${idx + 1}`,
      name: ing.key.replace(/_/g, ' '),
      amount: `${ing.grams}g`,
    })),
    instructions: ['Mix all ingredients according to saved recipe', 'Serve at recommended portion size'],
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

const buildEvenPlan = (meals: Recipe[]) => {
  const totalSlots = DAYS.length * 2;
  const rotation: Recipe[] = [];
  while (rotation.length < totalSlots) {
    rotation.push(...meals);
  }
  return rotation.slice(0, totalSlots);
};

export default function NutritionPage() {
  const params = useParams();
  const router = useRouter();
  const petId = params.id as string;
  const [pet, setPet] = useState<any>(null);
  const [savedMeals, setSavedMeals] = useState<Recipe[]>([]);
  const [customMeals, setCustomMeals] = useState<CustomMeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = getCurrentUserId();
    const pets = getPetsFromLocalStorage(userId);
    const foundPet = pets.find((p: any) => p.id === petId) || null;
    setPet(foundPet);
    if (foundPet) {
      const savedRecipeMeals = (foundPet.savedRecipes || [])
        .map((recipeId: string) => recipes.find((recipe) => recipe.id === recipeId))
        .filter(Boolean) as Recipe[];
      setSavedMeals(savedRecipeMeals);
      const customMealsList = getCustomMeals(userId, petId);
      setCustomMeals(customMealsList);
    }
    setLoading(false);
  }, [petId]);

  const weeklyPlan = useMemo(() => {
    const allMeals = [...savedMeals, ...customMeals.map(convertCustomMealToRecipe)];
    if (allMeals.length === 0) return [];
    const rotation = buildEvenPlan(allMeals);
    const plan: { day: string; meals: Recipe[] }[] = [];
    for (let i = 0; i < DAYS.length; i += 1) {
      const breakfastIndex = i * 2;
      const dinnerIndex = breakfastIndex + 1;
      const breakfast = rotation[breakfastIndex];
      let dinner = rotation[dinnerIndex];
      if (dinner.id === breakfast.id) {
        const swapIndex = rotation.findIndex((entry, idx) => idx > dinnerIndex && entry.id !== breakfast.id);
        if (swapIndex !== -1) {
          [rotation[dinnerIndex], rotation[swapIndex]] = [rotation[swapIndex], rotation[dinnerIndex]];
          dinner = rotation[dinnerIndex];
        } else {
          dinner = allMeals.find((meal) => meal.id !== breakfast.id) || dinner;
        }
      }
      plan.push({ day: DAYS[i], meals: [breakfast, dinner] });
    }
    return plan;
  }, [savedMeals, customMeals]);

  const dailyNutrition = useMemo(() => calculateDailyNutrition(weeklyPlan), [weeklyPlan]);
  const targets = useMemo(() => getNutritionTargets(pet?.type), [pet?.type]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading nutrition data...</p>
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

  if (dailyNutrition.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg bg-white rounded-xl shadow p-8 text-center space-y-4">
          <div className="text-5xl">📊</div>
          <h1 className="text-2xl font-bold text-gray-900">No meal plan data</h1>
          <p className="text-gray-600">
            Save at least one meal for {pet.name || 'your pet'} to view nutrition data.
          </p>
          <Link
            href={`/profile/pet/${petId}/meal-plan`}
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Go to Meal Plan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <Link
          href={`/profile/pet/${petId}/meal-plan`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Meal Plan
        </Link>
        <NutritionDashboard daily={dailyNutrition} targets={targets} petName={pet.name || pet.names?.[0] || 'Your Pet'} />
      </div>
    </div>
  );
}