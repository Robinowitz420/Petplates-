'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Users, Loader2 } from 'lucide-react';
import { Recipe } from '@/lib/types';
import { useAuth } from '@clerk/nextjs';

import { scoreWithSpeciesEngine } from '@/lib/utils/speciesScoringEngines';
import type { Pet } from '@/lib/types';
import RecipeScoreModal from './RecipeScoreModal';
import CompatibilityRadial from '@/components/CompatibilityRadial';
import { normalizePetType } from '@/lib/utils/petType';
import { savePet as savePersistedPet } from '@/lib/utils/petStorage';
import AlphabetText from '@/components/AlphabetText';
import { writeCachedCompatibilityScore } from '@/lib/utils/compatibilityScoreCache';
import { calculateMealsFromGroceryList } from '@/lib/utils/mealEstimation';

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
  const [saasScore, setSaasScore] = useState<number | null>(null);
  const [isSaasLoading, setIsSaasLoading] = useState(false);
  const [saasScoreFailed, setSaasScoreFailed] = useState(false);
  const saasScoreCache = useRef<Map<string, { score: number; timestamp: number }>>(new Map());
  const { userId, isLoaded } = useAuth();

  useEffect(() => {
    setLocalMealSaved(false);
    setSaveError(null);
  }, [pet?.id, recipe.id]);

  const isMealSaved =
    localMealSaved ||
    (Array.isArray(pet?.savedRecipes) ? pet!.savedRecipes.includes(recipe.id) : false);

  // Get local score for fallback
  const getLocalScore = useCallback(() => {
    if (!pet) return null;
    
    const ageYears =
      typeof pet.age === 'number'
        ? (Number.isFinite(pet.age) && pet.age > 0 ? pet.age : 1)
        : typeof pet.age === 'string'
          ? parseFloat(pet.age) || 1
          : 1;
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
  }, [pet, recipe]);

  // Calculate compatibility rating if pet is provided
  const localScore = pet ? getLocalScore() : null;

  const mealEstimateForBadge = (() => {
    try {
      const ingredients = Array.isArray((recipe as any)?.ingredients) ? ((recipe as any).ingredients as any[]) : [];
      if (ingredients.length === 0) return null;

      const shoppingListItems = ingredients
        .map((ing: any, idx: number) => {
          const name = typeof ing?.name === 'string' ? ing.name : '';
          const amount = typeof ing?.amount === 'string' || typeof ing?.amount === 'number' ? ing.amount : '';
          if (!name) return null;
          return {
            id: String(ing?.id || idx),
            name,
            amount,
            category: typeof ing?.category === 'string' ? ing.category : undefined,
          };
        })
        .filter(Boolean) as any[];

      if (shoppingListItems.length === 0) return null;

      const servingsRaw = (recipe as any)?.servings;
      const servingsParsed =
        typeof servingsRaw === 'number'
          ? servingsRaw
          : typeof servingsRaw === 'string'
            ? parseFloat(servingsRaw)
            : NaN;
      const recipeServings = Number.isFinite(servingsParsed) && servingsParsed > 0 ? servingsParsed : 1;

      return calculateMealsFromGroceryList(shoppingListItems as any, undefined, (recipe as any)?.category, true, recipeServings);
    } catch {
      return null;
    }
  })();

  const badgeCostPerMeal = (() => {
    const fromEstimate = mealEstimateForBadge?.costPerMeal;
    if (typeof fromEstimate === 'number' && Number.isFinite(fromEstimate) && fromEstimate > 0) return fromEstimate;

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
    return Number.isFinite(numericCost) && numericCost > 0 ? numericCost : null;
  })();

  const badgeMealsTotal = (() => {
    const meals = mealEstimateForBadge?.estimatedMeals;
    if (typeof meals === 'number' && Number.isFinite(meals) && meals > 0) return meals;
    return null;
  })();

  // Fetch SaaS score when pet or recipe changes
  useEffect(() => {
    console.log('[RecipeCard saasScore]', {
      isLoaded,
      hasUserId: Boolean(userId),
      hasPet: Boolean(pet),
      petId: (pet as any)?.id,
      recipeId: (recipe as any)?.id,
    });

    if (!isLoaded || !pet || !userId) {
      console.log('[RecipeCard saasScore] skip', {
        reason: !isLoaded ? 'auth_not_loaded' : !pet ? 'missing_pet' : 'missing_userId',
      });
      setSaasScore(null);
      setSaasScoreFailed(false);
      return;
    }

    const cacheKey = `${userId}:${pet.id}:${recipe.id}`;
    const cached = saasScoreCache.current.get(cacheKey);
    
    // Use cached score if it's less than 30 minutes old
    if (cached && Date.now() - cached.timestamp < 30 * 60 * 1000) {
      setSaasScore(cached.score);
      setSaasScoreFailed(false);
      return;
    }

    const fetchSaasScore = async () => {
      try {
        setIsSaasLoading(true);
        setSaasScoreFailed(false);

        console.log('[RecipeCard saasScore] fetch /api/compatibility/score', {
          userId,
          petId: (pet as any)?.id,
          recipeId: (recipe as any)?.id,
        });

        const response = await fetch('/api/compatibility/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipe,
            pet: {
              id: pet.id,
              name: pet.name || 'Pet',
              type: normalizePetType(pet.type, 'RecipeCard'),
              breed: pet.breed,
              age: typeof pet.age === 'string' ? parseFloat(pet.age) || 1 : (pet.age || 1),
              weight: (pet as any).weightKg || pet.weight || 10,
              activityLevel: (pet as any).activityLevel,
              healthConcerns: (pet as any).healthConcerns || [],
              dietaryRestrictions: (pet as any).dietaryRestrictions || [],
              allergies: (pet as any).allergies || [],
            },
          }),
        });

        if (!response.ok) {
          let body = '';
          try {
            body = await response.text();
          } catch {
          }
          console.error('[/api/compatibility/score] failed', response.status, body);
          throw new Error('Failed to fetch score');
        }
        
        const data = await response.json();
        const score = typeof data.overallScore === 'number' ? data.overallScore : null;
        
        if (score !== null) {
          saasScoreCache.current.set(cacheKey, { score, timestamp: Date.now() });
          setSaasScore(score);
          setSaasScoreFailed(false);
          writeCachedCompatibilityScore({ userId, petId: pet.id, recipeId: recipe.id, overallScore: score });
        } else {
          setSaasScore(null);
          setSaasScoreFailed(true);
        }
      } catch (error) {
        console.error('Error fetching SaaS score:', error);
        setSaasScore(null);
        setSaasScoreFailed(true);
      } finally {
        setIsSaasLoading(false);
      }
    };

    fetchSaasScore();
  }, [isLoaded, pet, recipe, userId]);

  const hasSaasScore = typeof saasScore === 'number' && Number.isFinite(saasScore);

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

          {hasSaasScore ? (
            <div className="mb-4 flex items-center justify-between rounded-lg border border-surface-highlight bg-surface-highlight/40 p-3">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <CompatibilityRadial 
                    score={saasScore as number} 
                    size={83} 
                    strokeWidth={8} 
                    label="" 
                  />
                  {isSaasLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
                    </div>
                  )}
                </div>
                {badgeCostPerMeal !== null && badgeMealsTotal !== null && (
                  <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-highlight border border-orange-500/40 text-[11px] font-semibold text-orange-200 whitespace-nowrap">
                    <AlphabetText
                      text={`$${badgeCostPerMeal.toFixed(2)}/Meal - ${badgeMealsTotal} Meals`}
                      size={18}
                      gapPx={1}
                      forceSingleLine
                    />
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="text-[10px] uppercase tracking-wide text-gray-400">Compatibility</div>
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
          ) : saasScoreFailed && !isSaasLoading ? (
            <div className="mb-4 rounded-lg border border-surface-highlight bg-surface-highlight/30 p-3">
              <div className="text-xs text-gray-300">Score not available</div>
            </div>
          ) : null}

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
                  
                  if (!pet || !userId) return;
                  if (isMealSaved || isAddingMeal) return;

                  setSaveError(null);
                  setIsAddingMeal(true);
                  try {
                    const currentSavedRecipes = Array.isArray(pet.savedRecipes) ? pet.savedRecipes : [];
                    const updatedPet: Pet = {
                      ...pet,
                      savedRecipes: [...currentSavedRecipes, recipe.id],
                    };

                    if (saasScore !== null) {
                      (updatedPet as any).savedRecipeScores = {
                        ...(typeof (pet as any).savedRecipeScores === 'object' && (pet as any).savedRecipeScores ? (pet as any).savedRecipeScores : {}),
                        [recipe.id]: {
                          overallScore: saasScore,
                          ts: Date.now(),
                        },
                      };
                    }
                    
                    await savePersistedPet(userId, updatedPet);
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
          score={{
            overallScore: hasSaasScore ? (saasScore as number) : null,
            warnings: undefined,
            strengths: undefined
          }}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}