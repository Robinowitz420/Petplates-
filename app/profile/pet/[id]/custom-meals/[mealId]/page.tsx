'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, ChefHat, Flame, Heart, Utensils } from 'lucide-react';
import { getCustomMeals } from '@/lib/utils/customMealStorage';
import type { CustomMeal } from '@/lib/types';

const SIMULATED_USER_ID = 'clerk_simulated_user_id_123';

const getCurrentUserId = () => {
  if (typeof window === 'undefined') return SIMULATED_USER_ID;
  return localStorage.getItem('last_user_id') || SIMULATED_USER_ID;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Unknown date';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function CustomMealDetailPage() {
  const params = useParams();
  const petId = params.id as string;
  const mealId = params.mealId as string;

  const [meal, setMeal] = useState<CustomMeal | null>(null);

  useEffect(() => {
    const userId = getCurrentUserId();
    const meals = getCustomMeals(userId, petId);
    const found = meals.find((m) => m.id === mealId) || null;
    setMeal(found);
  }, [petId, mealId]);

  const totalIngredients = meal?.ingredients?.length || 0;

  const macros = useMemo(() => {
    if (!meal?.analysis?.nutrients) return null;
    const n = meal.analysis.nutrients;
    return {
      protein: n.protein || n.protein_g || n.protein_pct,
      fat: n.fat || n.fat_g || n.fat_pct,
      carbs: n.carbs || n.carbohydrates || n.carbs_g,
    };
  }, [meal]);

  if (!meal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow">
          <p className="text-lg font-semibold text-gray-800 mb-2">Custom meal not found</p>
          <Link
            href={`/profile/pet/${petId}/custom-meals`}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-800 rounded-md hover:bg-green-900 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Custom Meals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative bg-gradient-to-r from-primary-800 via-primary-700 to-emerald-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center gap-4">
          <Link
            href={`/profile/pet/${petId}/custom-meals`}
            className="inline-flex items-center gap-2 text-white/90 hover:text-white"
          >
            <ArrowLeft size={18} />
            Back
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 rounded-full p-2">
              <ChefHat size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-white/70">Custom Meal</p>
              <h1 className="text-2xl font-bold leading-tight">{meal.name}</h1>
              <p className="text-sm text-white/80 flex items-center gap-2 mt-1">
                <Calendar size={12} /> {formatDate(meal.createdAt)}
              </p>
            </div>
          </div>
          <div className="ml-auto hidden md:flex items-center gap-3 bg-white/10 rounded-full px-3 py-1">
            <span className="text-xs text-white/80">Compatibility</span>
            <span className="text-lg font-bold">{meal.analysis.score}%</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ingredients */}
          <div className="bg-surface rounded-xl border border-surface-highlight shadow-md p-5">
            <h2 className="text-lg font-semibold text-foreground mb-4">Ingredients</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-200">
              {meal.ingredients.map((ing, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-surface-highlight/60 pb-2">
                  <span className="font-medium text-foreground">{ing.key.replace(/_/g, ' ')}</span>
                  <span className="text-gray-400">{ing.grams} g</span>
                </div>
              ))}
            </div>
          </div>

          {/* Safety & Nutrient Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-surface rounded-xl border border-surface-highlight shadow-md p-5">
              <h3 className="text-md font-semibold text-foreground mb-3 flex items-center gap-2">
                <Heart size={16} className="text-red-500" />
                Safety & Warnings
              </h3>
              {meal.analysis.toxicityWarnings.length === 0 ? (
                <p className="text-sm text-gray-300">No toxicity warnings for this meal.</p>
              ) : (
                <ul className="list-disc list-inside text-sm text-red-300 space-y-1">
                  {meal.analysis.toxicityWarnings.map((w, i) => (
                    <li key={i}>{w.message || w}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-surface rounded-xl border border-surface-highlight shadow-md p-5">
              <h3 className="text-md font-semibold text-foreground mb-3">Nutrient Notes</h3>
              <div className="text-sm text-gray-300 space-y-2">
                <div className="flex justify-between">
                  <span>Total recipe weight</span>
                  <span>{meal.analysis.totalRecipeGrams} g</span>
                </div>
                <div className="flex justify-between">
                  <span>Recommended serving</span>
                  <span>{meal.analysis.recommendedServingGrams} g</span>
                </div>
                {Array.isArray(meal.analysis.nutrientWarnings) && meal.analysis.nutrientWarnings.length > 0 && (
                  <div className="mt-2 text-xs text-amber-300">
                    ⚠️ {meal.analysis.nutrientWarnings.length} nutrient warning(s)
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-surface rounded-xl border border-surface-highlight shadow-md p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-300">Compatibility Score</span>
              <span className="text-3xl font-bold text-green-300">{meal.analysis.score}</span>
            </div>
            <div className="w-full bg-surface-highlight rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  meal.analysis.score >= 80 ? 'bg-green-500' : meal.analysis.score >= 60 ? 'bg-amber-400' : 'bg-red-500'
                }`}
                style={{ width: `${meal.analysis.score}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">Generated by your custom meal analysis.</p>
          </div>

          <div className="bg-surface rounded-xl border border-surface-highlight shadow-md p-5 space-y-2 text-sm text-gray-200">
            <div className="flex items-center gap-2">
              <Utensils size={14} className="text-primary-300" />
              <span>Total ingredients: {totalIngredients}</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame size={14} className="text-orange-400" />
              <span>Recommended serving: {meal.analysis.recommendedServingGrams} g</span>
            </div>
            {macros && (
              <div className="text-xs text-gray-300 pt-2 border-t border-surface-highlight">
                <div>Protein: {macros.protein ?? 'n/a'}</div>
                <div>Fat: {macros.fat ?? 'n/a'}</div>
                {macros.carbs !== undefined && <div>Carbs: {macros.carbs}</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
