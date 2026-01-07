'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Users } from 'lucide-react';
import { Recipe } from '@/lib/types';
import { useAuth } from '@clerk/nextjs';

import { scoreWithSpeciesEngine } from '@/lib/utils/speciesScoringEngines';
import type { Pet } from '@/lib/types';
import RecipeScoreModal from './RecipeScoreModal';
import CompatibilityRadial from '@/components/CompatibilityRadial';
import { normalizePetType } from '@/lib/utils/petType';
import { savePet as savePersistedPet } from '@/lib/utils/petStorage';
import AlphabetText from '@/components/AlphabetText';

interface RecipeCardProps {
  recipe: Recipe;
  pet?: Pet | null;
}

// Helper to convert grade to compatibility level
function gradeToCompatibility(grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F'): 'excellent' | 'good' | 'fair' | 'poor' {
  if (grade === 'A+' || grade === 'A') return 'excellent';
  if (grade === 'B+' || grade === 'B') return 'good';
  if (grade === 'C+' || grade === 'C') return 'fair';
  return 'poor';
}

export default function RecipeCard({ recipe, pet }: RecipeCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [localMealSaved, setLocalMealSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { userId } = useAuth();

  useEffect(() => {
    setLocalMealSaved(false);
    setSaveError(null);
  }, [pet?.id, recipe.id]);

  const isMealSaved =
    localMealSaved ||
    (Array.isArray(pet?.savedRecipes) ? pet!.savedRecipes.includes(recipe.id) : false);

  // Calculate compatibility rating if pet is provided
  const speciesScore = pet
    ? (() => {
        const ageYears = typeof pet.age === 'string' ? parseFloat(pet.age) || 1 : 1;
        const weightNum =
          typeof pet.weightKg === 'number'
            ? pet.weightKg
            : typeof pet.weight === 'string'
              ? parseFloat(pet.weight) || 10
              : 10;

        return scoreWithSpeciesEngine(recipe, {
          id: pet.id,
          name: pet.name || (pet.names?.[0] ?? 'Pet'),
          type: normalizePetType(pet.type, 'RecipeCard'),
          breed: pet.breed || '',
          age: ageYears,
          weight: Number.isFinite(weightNum) ? weightNum : 10,
          activityLevel: pet.activityLevel || 'moderate',
          healthConcerns: pet.healthConcerns || [],
          dietaryRestrictions: pet.dietaryRestrictions || [],
          allergies: pet.allergies || [],
        } as any);
      })()
    : null;

  return (
    <>
      <Link
        href={`/recipe/${recipe.id}${pet ? `?petId=${pet.id}` : ''}`}
        className="group block bg-surface rounded-2xl shadow-md border-2 border-orange-500/40 hover:border-orange-400/80 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-200 ease-out overflow-hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="bg-surface-highlight/90 px-4 py-3 border-b border-surface-highlight flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-xs font-semibold text-foreground uppercase tracking-wide">
              {recipe.category}
            </div>
            {(recipe.needsReview === true || (recipe as any).usesFallbackNutrition) && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-900/40 text-amber-200 border border-amber-700/50">
                ⚠️ Experimental / Topper Only
              </span>
            )}
          </div>
          <div className="text-[11px] text-gray-400">
            {recipe.servings} servings • {recipe.prepTime}
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary-400 transition-colors">
            <AlphabetText text={recipe.name} size={24} />
          </h3>
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {recipe.description}
          </p>

          {speciesScore && (
            <div className="mb-4 flex items-center justify-between rounded-lg border border-surface-highlight bg-surface-highlight/40 p-3">
              <CompatibilityRadial score={speciesScore.overallScore} size={83} strokeWidth={8} label="" />
              <div className="flex flex-col items-end gap-1">
                <div className="text-[10px] uppercase tracking-wide text-gray-400">
                  {gradeToCompatibility(speciesScore.grade)} match
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsModalOpen(true);
                  }}
                  className="text-[11px] font-medium underline underline-offset-4 text-gray-300 hover:opacity-80"
                >
                  View details
                </button>
              </div>
            </div>
          )}

          {(() => {
            const rawCost = (recipe as any).meta?.estimatedCost;
            const numericCost = (() => {
              if (typeof rawCost === 'number') return rawCost;
              if (typeof rawCost === 'string') {
                const cleaned = rawCost.replace(/[^0-9.]/g, '');
                if (cleaned.length === 0) return NaN;
                return Number(cleaned);
              }
              return Number(rawCost);
            })();
            if (!Number.isFinite(numericCost)) return null;
            return (
              <div className="mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-highlight border border-orange-500/40 text-xs font-semibold text-orange-200">
                  <span className="text-white">{`$${numericCost.toFixed(2)} Per Meal`}</span>
                </div>
              </div>
            );
          })()}

          {/* Meta Information */}
          {(recipe as any).meta && (
            <div className="mb-4 space-y-1">
              {(recipe as any).meta.texture && (
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Texture:</span> {(recipe as any).meta.texture}
                </div>
              )}
              {(recipe as any).meta.estimatedCost && (
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Cost:</span> {(recipe as any).meta.estimatedCost}
                </div>
              )}
              {(recipe as any).meta.shelfLife && (
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Storage:</span> {(recipe as any).meta.shelfLife}
                </div>
              )}
              {(recipe as any).meta.season && (recipe as any).meta.season.length > 0 && (
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Season:</span> {(recipe as any).meta.season.join(', ')}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <Clock size={16} />
              <span>{recipe.prepTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={16} />
              <span>{recipe.servings} servings</span>
            </div>
          </div>

          {pet ? (
            <div className="mt-2">
              <button
                type="button"
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  if (!userId) return;
                  if (isMealSaved || isAddingMeal) return;

                  setSaveError(null);
                  setIsAddingMeal(true);
                  try {
                    const nextSavedRecipes = Array.isArray(pet.savedRecipes) ? [...pet.savedRecipes] : [];
                    if (!nextSavedRecipes.includes(recipe.id)) nextSavedRecipes.push(recipe.id);
                    await savePersistedPet(userId, { ...pet, savedRecipes: nextSavedRecipes } as any);
                    setLocalMealSaved(true);
                  } catch (err) {
                    const raw = err instanceof Error ? err.message : String(err || '');
                    const friendly = raw || 'Unable to save this meal.';
                    setSaveError(friendly);
                    setTimeout(() => setSaveError(null), 5000);
                  } finally {
                    setIsAddingMeal(false);
                  }
                }}
                disabled={!userId || isAddingMeal || isMealSaved}
                className="group relative w-full inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-green-800/40 rounded-2xl transition-transform duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={isMealSaved ? 'Meal Harvested' : 'Harvest Meal'}
              >
                <span className="relative h-12 w-full overflow-hidden rounded-2xl">
                  <Image
                    src={isMealSaved ? '/images/Buttons/MealSaved.png' : '/images/Buttons/SaveMeal.png'}
                    alt={isMealSaved ? 'Meal Harvested' : 'Harvest Meal'}
                    fill
                    sizes="100vw"
                    className="object-contain"
                  />
                </span>
                <span className="sr-only">{isMealSaved ? 'Meal Harvested' : 'Harvest Meal'}</span>
              </button>
              {saveError ? (
                <div className="mt-2 text-xs text-red-300">{saveError}</div>
              ) : null}
            </div>
          ) : null}
        </div>
      </Link>

      {isModalOpen && (
        <RecipeScoreModal
          recipe={recipe}
          pet={pet}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}