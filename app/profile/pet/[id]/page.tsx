'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { recipes } from '@/lib/data/recipes-complete';
import type { ModifiedRecipeResult, Recipe } from '@/lib/types';
import { rateRecipeForPet, type Pet as RatingPet } from '@/lib/utils/petRatingSystem';
import { calculateImprovedCompatibility, type ImprovedPet } from '@/lib/utils/improvedCompatibilityScoring';
import { CompatibilityBadge } from '@/components/CompatibilityBadge';
import { getRandomName } from '@/lib/utils/petUtils';
import EmojiIcon from '@/components/EmojiIcon';

type PetCategory = 'dogs' | 'cats' | 'birds' | 'reptiles' | 'pocket-pets';
type AgeGroup = 'baby' | 'young' | 'adult' | 'senior';

interface Pet {
  id: string;
  name?: string; // Legacy field, prefer names array
  names?: string[]; // Array of names
  type: PetCategory;
  breed: string;
  age: AgeGroup;
  healthConcerns?: string[];
  dietaryRestrictions?: string[];
  savedRecipes?: string[];
  allergies?: string[];
  weightKg?: number;
  weight?: string;
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
          names: p.names || (p.name ? [p.name] : []), // Ensure names array exists
          savedRecipes: p.savedRecipes || [],
          healthConcerns: p.healthConcerns || [],
        }))
      : [];
  } catch (e) {
    // Failed to parse pet data - using fallback
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

  // Get pet display name (use names array if available, fallback to name field) - memoized for stability
  const petDisplayName = useMemo(() => {
    if (!pet) return 'Pet';
    return getRandomName(pet.names || (pet.name ? [pet.name] : ['Unnamed Pet']));
  }, [pet?.id, pet?.names, pet?.name]);

  // Convert pet data to rating system format - memoized to prevent recalculation when only savedRecipes changes
  // Use JSON.stringify for arrays to ensure stable comparison
  const healthConcernsKey = pet ? JSON.stringify(pet.healthConcerns || []) : '';
  const allergiesKey = pet ? JSON.stringify(pet.allergies || []) : '';
  const dislikesKey = pet ? JSON.stringify(pet.dislikes || []) : '';
  
  const ratingPet: RatingPet | null = useMemo(() => {
    if (!pet) return null;
    return {
      id: pet.id,
      name: petDisplayName,
      type: pet.type as RatingPet['type'],
      breed: pet.breed,
      age: pet.age === 'baby' ? 0.5 : pet.age === 'young' ? 2 : pet.age === 'adult' ? 5 : 10,
      weight: pet.weightKg || (pet.type === 'dogs' ? 25 : pet.type === 'cats' ? 10 : 5),
      activityLevel: 'moderate' as const, // Could be improved with pet data
      healthConcerns: pet.healthConcerns || [],
      dietaryRestrictions: pet.allergies || [],
      dislikes: pet.dislikes || []
    };
  }, [pet?.id, pet?.type, pet?.breed, pet?.age, pet?.weightKg, healthConcernsKey, allergiesKey, dislikesKey, petDisplayName]);


  useEffect(() => {
    const userId = getCurrentUserId();
    if (!userId || !petId) return;

    try {
      const pets = getPetsFromLocalStorage(userId);
      const foundPet = pets.find((p) => p.id === petId) || null;
      setPet(foundPet);
    } catch (error) {
      // Handle error gracefully
      console.error('Failed to load pet data:', error);
      setPet(null);
    }
  }, [petId]); // petId is the only dependency needed - userId comes from getCurrentUserId()

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
            petName: petDisplayName,
          },
          limit: 50,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        // API error - using fallback recommendations
        throw new Error(errorData.error || `Engine offline (${response.status})`);
      }

      const data = await response.json();
      if (!isMounted) return;
      
      // Log for debugging
      if (!data?.results || data.results.length === 0) {
        // API returned no results - using fallback
      }
      
      setEngineMeals((data?.results as ModifiedRecipeResult[]) || []);
    } catch (error) {
      if (!isMounted) return;
      // Recommendation API error - using fallback
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

  // Debug logging (as suggested by DeepSeek) - MUST be after all useState hooks, before early returns
  useEffect(() => {
    // Only log state variables, not computed values
    if (pet) {
      const { getRecommendedRecipes } = require('@/lib/utils/recipeRecommendations');
      const tieredRecommendations = getRecommendedRecipes(pet, 20, true);
      const fallbackCount = tieredRecommendations.length;
      
      // Using engine meals or fallback
    }
  }, [engineMeals, pet]);

  // Import subtype matching
  const { normalizeToSubtype } = require('@/lib/utils/ingredientWhitelists');
  
  // Helper to check species/subtype match
  const matchesSpecies = (recipe: Recipe, currentPet: Pet): boolean => {
    if (recipe.category === currentPet.type) return true;
    
    // Subtype matching for exotics
    const subtype = normalizeToSubtype(currentPet.type as any, currentPet.breed);
    
    if (currentPet.type === 'birds') {
      if (recipe.category === 'birds' || recipe.category === 'bird') return true;
      if (recipe.category === subtype) return true;
    }
    
    if (currentPet.type === 'reptiles') {
      if (recipe.category === 'reptiles' || recipe.category === 'reptile') return true;
      if (recipe.category === subtype) return true;
    }
    
    if (currentPet.type === 'pocket-pets') {
      if (recipe.category === 'pocket-pets' || recipe.category === 'pocket-pet') return true;
      if (recipe.category === subtype) return true;
    }
    
    return false;
  };

  // Use tiered recommendation system to ensure we always have results
  // Only depend on properties that affect recommendations, NOT savedRecipes
  // Use JSON.stringify for arrays to ensure stable comparison
  const tieredHealthConcernsKey = pet ? JSON.stringify(pet.healthConcerns || []) : '';
  const tieredAllergiesKey = pet ? JSON.stringify(pet.allergies || []) : '';
  
  const tieredRecommendations = useMemo(() => {
    if (!pet) return [];
    const { getRecommendedRecipes } = require('@/lib/utils/recipeRecommendations');
    return getRecommendedRecipes(pet, 20, true);
  }, [pet?.id, pet?.type, pet?.breed, pet?.age, tieredHealthConcernsKey, pet?.weightKg, tieredAllergiesKey]);
  
  const buildFallbackExplanation = (recipe: Recipe, currentPet: Pet, tierLabel?: string, warning?: string) => {
    if (warning) {
      return warning;
    }
    if (tierLabel && tierLabel !== 'Best Match') {
      return `${recipe.name} - ${tierLabel}`;
    }
    const concern = (currentPet.healthConcerns || [])[0]?.replace(/-/g, ' ') || 'overall wellness';
    const highlight = recipe.tags?.[0] || (recipe.description || '').split('. ')[0] || recipe.name;
    return `${recipe.name} keeps ${currentPet.name || 'pet'}'s ${concern} on track with ${highlight?.toLowerCase()}.`;
  };

  // Convert tiered recommendations to format expected by UI
  // Only depend on properties that affect meal recommendations, NOT savedRecipes
  const fallbackHealthConcernsKey = pet ? JSON.stringify(pet.healthConcerns || []) : '';
  const fallbackPetName = pet?.name || '';
  
  const fallbackMeals = useMemo(() => {
    if (!pet) return [];
    return tieredRecommendations.map((rec: any) => ({
      recipe: rec.recipe,
      explanation: buildFallbackExplanation(rec.recipe, pet, rec.tierLabel, rec.warning),
      _tierLabel: rec.tierLabel,
      _warning: rec.warning,
      _healthMatch: rec.healthConcernMatch,
      _tier: rec.tier
    }));
  }, [pet?.id, pet?.type, pet?.breed, pet?.age, fallbackHealthConcernsKey, fallbackPetName, tieredRecommendations]);

  // Fix: Properly check for empty array - use fallback if engineMeals is null, undefined, or empty
  // Memoize mealsToRender to prevent recalculation when only savedRecipes changes
  const mealsToRender: (ModifiedRecipeResult | { recipe: Recipe; explanation: string })[] = useMemo(() => {
    return (engineMeals && Array.isArray(engineMeals) && engineMeals.length > 0) ? engineMeals : fallbackMeals;
  }, [engineMeals, fallbackMeals]);

  // Store previous order in a ref to maintain stability
  const previousOrderRef = useRef<Map<string, number>>(new Map());
  const previousMealIdsRef = useRef<string[]>([]);

  // Memoize sorted meals to prevent reordering when only savedRecipes changes
  const sortedMealsToRender = useMemo(() => {
    // Get current meal IDs
    const currentMealIds = mealsToRender.map(m => m.recipe?.id || '').filter(Boolean);
    
    // Check if the meal list has actually changed (not just savedRecipes)
    const mealListChanged = 
      currentMealIds.length !== previousMealIdsRef.current.length ||
      currentMealIds.some((id, idx) => id !== previousMealIdsRef.current[idx]);
    
    // If meal list hasn't changed, preserve the previous order
    if (!mealListChanged && previousOrderRef.current.size > 0) {
      const sorted = [...mealsToRender].sort((a, b) => {
        const aId = a.recipe?.id || '';
        const bId = b.recipe?.id || '';
        const aOrder = previousOrderRef.current.get(aId) ?? 0;
        const bOrder = previousOrderRef.current.get(bId) ?? 0;
        return aOrder - bOrder;
      });
      return sorted;
    }
    // Create a stable key for each meal based on recipe ID
    const mealsWithKeys = mealsToRender.map((meal, index) => ({
      meal,
      recipeId: meal.recipe?.id || `unknown-${index}`,
      originalIndex: index
    }));

    // Compute scores (with decimals) for all meals, then apply a gentle percentile spread to reduce ties
    const computeMealScore = (meal: any): number => {
      if ('score' in meal && typeof (meal as ModifiedRecipeResult).score === 'number') {
        return Number((meal as ModifiedRecipeResult).score);
      }
      if (!ratingPet) return 0;
      try {
        const enhancedPet: ImprovedPet = {
          id: ratingPet.id,
          name: ratingPet.name,
          type: ratingPet.type as 'dog' | 'cat' | 'bird' | 'reptile' | 'pocket-pet',
          breed: ratingPet.breed,
          age: typeof ratingPet.age === 'string' ? parseFloat(ratingPet.age) || 1 : ratingPet.age || 1,
          weight: ratingPet.weight || 10,
          activityLevel: ratingPet.activityLevel,
          healthConcerns: ratingPet.healthConcerns || [],
          dietaryRestrictions: ratingPet.dietaryRestrictions || [],
          allergies: ratingPet.allergies || [],
        };
        const improved = calculateImprovedCompatibility(meal.recipe, enhancedPet);
        return Number(improved.overallScore);
      } catch (error) {
        return rateRecipeForPet(meal.recipe, ratingPet).overallScore;
      }
    };

    const mealsWithScores = mealsWithKeys.map((item) => ({
      ...item,
      rawScore: computeMealScore(item.meal),
    }));

    const applyPercentileSpread = (items: typeof mealsWithScores) => {
      const valid = items.filter(i => typeof i.rawScore === 'number');
      if (valid.length < 4) return items;
      // Sort by score first, but preserve recipe ID order for ties
      const sorted = [...valid].sort((a, b) => {
        const scoreDiff = b.rawScore - a.rawScore;
        if (Math.abs(scoreDiff) > 0.01) return scoreDiff;
        return a.recipeId.localeCompare(b.recipeId);
      });
      const n = sorted.length;
      const adjustedMap = new Map<string, number>();
      sorted.forEach((item, idx) => {
        const percentile = 1 - idx / Math.max(1, n - 1);
        let bump = 0;
        if (percentile >= 0.9) bump = 2;
        else if (percentile >= 0.75) bump = 1;
        else if (percentile <= 0.1) bump = -2;
        else if (percentile <= 0.25) bump = -1;
        const adjusted = Math.max(0, Math.min(100, item.rawScore + bump));
        adjustedMap.set(item.recipeId, Number(adjusted.toFixed(1)));
      });
      return items.map(i => ({
        ...i,
        spreadScore: adjustedMap.get(i.recipeId) ?? i.rawScore,
      }));
    };

    const mealsWithSpread = applyPercentileSpread(mealsWithScores);

    // Sort with recipe ID as primary tiebreaker to ensure stability
    const sorted = mealsWithSpread
      .sort((a, b) => {
        // Primary sort: by score (descending)
        const scoreDiff = b.spreadScore - a.spreadScore;
        if (Math.abs(scoreDiff) > 0.5) { // Only reorder if score difference is significant
          return scoreDiff;
        }
        // Secondary sort: by recipe ID (always stable, prevents any reordering)
        return a.recipeId.localeCompare(b.recipeId);
      })
      .map(i => {
        if ('score' in i.meal && typeof (i.meal as ModifiedRecipeResult).score === 'number') {
          return { ...(i.meal as ModifiedRecipeResult), score: i.spreadScore };
        }
        return i.meal;
      });
    
    // Update the refs with the new order
    previousOrderRef.current = new Map(
      sorted.map((meal, index) => [meal.recipe?.id || '', index])
    );
    previousMealIdsRef.current = currentMealIds;
    
    return sorted;
  }, [mealsToRender, ratingPet]);

  // Track saved recipes separately to avoid triggering meal recalculation
  const [savedRecipeIds, setSavedRecipeIds] = useState<Set<string>>(new Set());

  // Initialize savedRecipeIds from pet when pet loads
  useEffect(() => {
    if (pet?.savedRecipes) {
      setSavedRecipeIds(new Set(pet.savedRecipes));
    }
  }, [pet?.id]); // Only update when pet ID changes, not when savedRecipes changes

  const handleSaveRecipe = (recipeId: string, recipeName: string) => {
    const userId = getCurrentUserId();
    if (!userId || !pet) return;

    // Check if already saved (using local state)
    if (savedRecipeIds.has(recipeId)) {
      setCardMessage({ id: recipeId, text: 'Already saved for this pet.' });
      setTimeout(() => setCardMessage(null), 2500);
      return;
    }

    // Update localStorage
    const pets = getPetsFromLocalStorage(userId);
    const updatedPets = pets.map((p) => {
      if (p.id !== pet.id) return p;
      const existing = p.savedRecipes || [];
      return {
        ...p,
        savedRecipes: [...existing, recipeId],
      };
    });
    savePetsToLocalStorage(userId, updatedPets);

    // Update local state only (don't update pet state to avoid recalculation)
    setSavedRecipeIds(new Set([...savedRecipeIds, recipeId]));
    setCardMessage({ id: recipeId, text: `${recipeName} added to ${petDisplayName}'s meals.` });
    setTimeout(() => setCardMessage(null), 2500);
  };

  if (!pet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <p>Loading...</p>
      </div>
    );
  }

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
  
  // Component to render pet emoji as image
  const PetEmojiIcon = ({ type, size = 24 }: { type: PetCategory; size?: number }) => {
    const emoji = getPetEmoji(type);
    return <EmojiIcon emoji={emoji} size={size} />;
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
        className: 'bg-green-900/50 text-green-200 border border-green-700/50',
      };
    if (score >= 0.34)
      return {
        label: 'Good health match',
        className: 'bg-yellow-900/50 text-yellow-200 border border-yellow-700/50',
      };
    if (score > 0)
      return {
        label: 'Some health benefit',
        className: 'bg-blue-900/50 text-blue-200 border border-blue-700/50',
      };
    return null;
  };

  const getStarStates = (rating: number): boolean[] => {
    const fullStars = Math.round(rating); // 0..5
    return Array.from({ length: 5 }, (_, i) => i < fullStars);
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-primary-400 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Profile
        </Link>

        <div className="bg-surface rounded-lg shadow-md border border-surface-highlight p-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="text-4xl"><PetEmojiIcon type={pet.type} size={48} /></div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">
                Personalized Meals for {petDisplayName}
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                {pet.breed} • {pet.age} • {totalMeals} meals ready
              </p>
              {(pet.healthConcerns || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(pet.healthConcerns || []).slice(0, 3).map((concern) => (
                    <span
                      key={concern}
                      className="px-2 py-0.5 bg-orange-900/40 text-orange-200 border border-orange-700/50 text-xs rounded-full"
                    >
                      {concern.replace(/-/g, ' ').substring(0, 20)}
                    </span>
                  ))}
                  {(pet.healthConcerns || []).length > 3 && (
                    <span className="text-xs text-gray-500">+{(pet.healthConcerns || []).length - 3}</span>
                  )}
                </div>
              )}
              {usingEngine && (
                <p className="mt-2 text-xs text-green-400 font-medium">
                  ✅ Engine insights enabled for {petDisplayName}.
                </p>
              )}
              {engineError && (
                <p className="mt-4 text-sm text-amber-200 bg-amber-900/30 border border-amber-700/50 px-3 py-2 rounded-lg">
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
                <div className="bg-surface rounded-lg shadow-md border border-surface-highlight overflow-hidden cursor-pointer hover:shadow-lg hover:border-orange-500/30 transition-all h-full flex flex-col">
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-foreground mb-3">{recipe.name}</h3>
                    <p className="text-gray-300 text-sm mb-4 flex-1">
                      {recipe.description}
                    </p>
                    {explanation && (
                      <p className="text-sm text-gray-300 bg-surface-highlight rounded-lg p-3 mb-3 border border-white/5">
                        {explanation}
                      </p>
                    )}
                    {pet.healthConcerns.length > 0 && (
                      (() => {
                        const score = getHealthMatchScore(recipe, pet);
                        const badge = getHealthMatchBadge(score);
                        return (
                          badge && (
                            <span
                              className={`inline-block px-1.5 py-0.5 mb-1.5 rounded-full text-xs font-semibold ${badge.className}`}
                            >
                              {badge.label}
                            </span>
                          )
                        );
                      })()
                    )}

                    {/* Compatibility Rating */}
                    {ratingPet && (
                      <div className="mb-2">
                        <CompatibilityBadge
                          compatibility={
                            'score' in meal && typeof meal.score === 'number'
                              ? meal.score >= 90 ? 'excellent' 
                              : meal.score >= 75 ? 'good'
                              : meal.score >= 55 ? 'fair'
                              : 'poor'
                              : rateRecipeForPet(recipe, ratingPet).compatibility
                          }
                          score={
                            'score' in meal && typeof meal.score === 'number'
                              ? meal.score
                              : rateRecipeForPet(recipe, ratingPet).overallScore
                          }
                        />
                      </div>
                    )}
                  </div>
                  <div className="px-6 pb-4 pt-2 border-t border-surface-highlight">
                    {(() => {
                      const isSaved = savedRecipeIds.has(recipeId);
                      return (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleSaveRecipe(recipeId, recipe.name);
                          }}
                          disabled={isSaved}
                          className={`w-full px-4 py-2 rounded-md shadow-md transition-colors flex items-center justify-center gap-2 text-sm font-semibold ${
                            isSaved
                              ? 'bg-green-600 text-white cursor-not-allowed'
                              : 'bg-green-800 text-white hover:bg-green-900'
                          }`}
                        >
                          {isSaved ? '✓ Added to Saved Meals' : (
                            <>
                              <Plus className="h-4 w-4" /> Add Meal
                            </>
                          )}
                        </button>
                      );
                    })()}
                  </div>
                </div>
              </Link>
            </div>
          )})}
        </div>
      </div>
    </div>
  );
}