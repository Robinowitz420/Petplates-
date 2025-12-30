'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Users } from 'lucide-react';
import { Recipe } from '@/lib/types';
import { useAuth } from '@clerk/nextjs';

import { scoreWithSpeciesEngine } from '@/lib/utils/speciesScoringEngines';
import type { Pet } from '@/lib/types';
import RecipeScoreModal from './RecipeScoreModal';
import { normalizePetType } from '@/lib/utils/petType';
import { formatPercent } from '@/lib/utils/formatPercent';
import { savePet as savePersistedPet } from '@/lib/utils/petStorage';

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
  const [isMealAdded, setIsMealAdded] = useState(false);
  const { userId } = useAuth();

  useEffect(() => {
    if (!pet) {
      setIsMealAdded(false);
      return;
    }
    const inSavedRecipes = Array.isArray(pet.savedRecipes) ? pet.savedRecipes.includes(recipe.id) : false;
    setIsMealAdded(inSavedRecipes);
  }, [pet, recipe.id]);

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
        className="group bg-surface rounded-md shadow-sm border border-orange-500/30 hover:border-orange-500/50 hover:shadow-md transition-shadow duration-200 overflow-hidden"
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
            {recipe.name}
          </h3>
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {recipe.description}
          </p>

          {/* Compact compatibility score bar (unified with recipe detail view) */}
          {speciesScore && (
            <div className="mb-4 rounded-lg border border-emerald-500/60 bg-gradient-to-r from-emerald-900/70 via-emerald-800/70 to-emerald-900/70 p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-emerald-200/80">
                    Compatibility Score
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold leading-none text-emerald-50">
                    {formatPercent(speciesScore.overallScore)}
                  </div>
                  <div className="mt-0.5 text-[10px] uppercase tracking-wide text-emerald-100/80">
                    {gradeToCompatibility(speciesScore.grade)} match
                  </div>
                </div>
              </div>

              <div className="w-full bg-black/40 rounded-full h-[3px] mb-2 overflow-hidden">
                <div
                  className={`h-[3px] rounded-full transition-[width] duration-500 ease-out will-change-[width] ${
                    speciesScore.overallScore >= 80
                      ? 'bg-emerald-400'
                      : speciesScore.overallScore >= 60
                      ? 'bg-amber-300'
                      : 'bg-red-400'
                  }`}
                  style={{ width: `${speciesScore.overallScore}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-emerald-100/80">
                <span />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsModalOpen(true);
                  }}
                  className="text-[11px] font-medium underline underline-offset-4 hover:opacity-80"
                >
                  View details
                </button>
              </div>
            </div>
          )}

          {(recipe as any).meta?.estimatedCost && (
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-highlight border border-orange-500/40 text-xs font-semibold text-orange-200">
                <span>Cost per meal:</span>
                <span className="text-white">{String((recipe as any).meta.estimatedCost)}</span>
              </div>
            </div>
          )}

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
                  if (isMealAdded || isAddingMeal) return;

                  setIsAddingMeal(true);
                  try {
                    const nextSavedRecipes = Array.isArray(pet.savedRecipes) ? [...pet.savedRecipes] : [];
                    if (!nextSavedRecipes.includes(recipe.id)) nextSavedRecipes.push(recipe.id);
                    await savePersistedPet(userId, { ...pet, savedRecipes: nextSavedRecipes } as any);
                    setIsMealAdded(true);
                  } catch {
                    // ignore
                  } finally {
                    setIsAddingMeal(false);
                  }
                }}
                disabled={!userId || isAddingMeal || isMealAdded}
                className={`w-full inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-semibold transition-colors shadow-md border ${
                  isMealAdded
                    ? 'bg-green-900/40 text-green-200 border-green-700/50 cursor-default'
                    : 'bg-green-800 text-white border-green-900 hover:bg-green-900 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {isMealAdded ? 'Saved' : isAddingMeal ? 'Saving…' : 'Save Meal'}
              </button>
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