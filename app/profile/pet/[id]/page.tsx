'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Plus } from 'lucide-react';
import type { ModifiedRecipeResult, Recipe } from '@/lib/types';
import { calculateEnhancedCompatibility, type Pet as EnhancedPet, getGrade } from '@/lib/utils/enhancedCompatibilityScoring';
import { CompatibilityBadge } from '@/components/CompatibilityBadge';
import { getRandomName } from '@/lib/utils/petUtils';
import EmojiIcon from '@/components/EmojiIcon';
import { getPets, savePet } from '@/lib/utils/petStorage'; // Import from storage util
import { useChunkedRecipeScoring } from '@/lib/hooks/useChunkedRecipeScoring';
import ScoringProgress from '@/components/ScoringProgress';
import { calculateMealCountVariation } from '@/lib/utils/mealCountCalculator';
import { makeCountOrganic, getCountMessage, getSubtext } from '@/lib/utils/organicCount';
import { useProgressiveMealCount } from '@/hooks/useProgressiveMealCount';


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

// Get custom recipes from localStorage
const getCombinedRecipes = (): Recipe[] => {
  if (typeof window !== 'undefined') {
    try {
      const customRecipes = JSON.parse(localStorage.getItem('custom_recipes') || '[]');
      return customRecipes;
    } catch (error) {
      console.error('Error loading custom recipes:', error);
    }
  }

  return [];
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
  
  // Convert pet data to enhanced compatibility format
  const enhancedPet: EnhancedPet | null = useMemo(() => {
    if (!pet) return null;
    const petAge = pet.age === 'baby' ? 0.5 : pet.age === 'young' ? 2 : pet.age === 'adult' ? 5 : 10;
    return {
      id: pet.id,
      name: petDisplayName,
      type: (pet.type === 'dogs' ? 'dog' : pet.type === 'cats' ? 'cat' : pet.type === 'birds' ? 'bird' : pet.type === 'reptiles' ? 'reptile' : 'pocket-pet') as 'dog' | 'cat' | 'bird' | 'reptile' | 'pocket-pet',
      breed: pet.breed,
      age: petAge,
      weight: pet.weightKg || (pet.type === 'dogs' ? 25 : pet.type === 'cats' ? 10 : 5),
      activityLevel: 'moderate' as const,
      healthConcerns: pet.healthConcerns || [],
      dietaryRestrictions: pet.dietaryRestrictions || [],
      allergies: pet.allergies || [],
    };
  }, [pet?.id, pet?.type, pet?.breed, pet?.age, pet?.weightKg, healthConcernsKey, allergiesKey, petDisplayName, pet?.dietaryRestrictions]);


  useEffect(() => {
    const userId = getCurrentUserId();
    if (!userId || !petId) return;

    const loadPet = async () => {
      try {
        // Add 5 second timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout loading pets')), 5000)
        );
        
        const pets = await Promise.race([
          getPets(userId),
          timeoutPromise
        ]) as any[];
        
        // Normalize names when loading
        const normalizedPets = pets.map((p: any) => ({
          ...p,
          names: p.names || (p.name ? [p.name] : []),
          savedRecipes: p.savedRecipes || [],
          healthConcerns: p.healthConcerns || [],
        }));
        
        const foundPet = normalizedPets.find((p: any) => p.id === petId) || null;
        setPet(foundPet);
        
        if (!foundPet) {
          console.warn('Pet not found with id:', petId);
          setLoadingMeals(false); // Stop loading if pet not found
        }
      } catch (error) {
        console.error('Failed to load pet data:', error);
        setPet(null);
        setLoadingMeals(false); // CRITICAL: Stop loading on error
      }
    };
    loadPet();
  }, [petId]); // petId is the only dependency needed

useEffect(() => {
  if (!pet) return;
  let isMounted = true;
  setLoadingMeals(true);
  setEngineError(null);

  (async () => {
    try {
      // First try the new cost-optimized recipe generation API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('/api/recipes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          species: pet.type,
          count: 50,
          petProfile: {
            name: petDisplayName,
            weight: pet.weight,
            weightKg: pet.weightKg,
            age: pet.age,
            allergies: pet.allergies || [],
            healthConcerns: pet.healthConcerns || [],
          },
        }),
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Recipe generation failed (${response.status})`);
      }

      const data = await response.json();
      if (!isMounted) return;
      
      if (data?.recipes && data.recipes.length > 0) {
        // Convert generated recipes to ModifiedRecipeResult format
        const generatedMeals = data.recipes.map((recipe: any) => ({
          recipe,
          explanation: `Cost-optimized meal: $${recipe.estimatedCostPerMeal?.toFixed(2) || 'N/A'} per meal`,
        }));
        setEngineMeals(generatedMeals as ModifiedRecipeResult[]);
      } else {
        throw new Error('No recipes generated');
      }
    } catch (error) {
      if (!isMounted) return;
      console.error('Recipe generation error:', error);
      // Fall back to recommendations API if generation fails
      try {
        const concerns = (pet.healthConcerns || []).filter((concern) => concern !== 'none');
        const allergies = pet.allergies?.filter((allergy) => allergy !== 'none') || [];
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch('/api/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
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
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Recommendations failed (${response.status})`);
        }

        const data = await response.json();
        if (!isMounted) return;
        
        setEngineMeals((data?.results as ModifiedRecipeResult[]) || []);
      } catch (fallbackError) {
        if (!isMounted) return;
        setEngineMeals(null);
        setEngineError('Unable to load meals—showing standard matches.');
      }
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
    // Pass combined recipes (base + custom) to the recommendation system
    const combinedRecipes = getCombinedRecipes();
    return getRecommendedRecipes(pet, 20, true, combinedRecipes);
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

  // Fix: Properly check for empty array - use fallback if engineMeals is null, undefined, empty, or has too few results
  // Use fallback if API returns fewer than 15 meals (threshold to ensure we get a good selection)
  const MIN_MEALS_THRESHOLD = 15;
  // Memoize mealsToRender to prevent recalculation when only savedRecipes changes
  const mealsToRender: (ModifiedRecipeResult | { recipe: Recipe; explanation: string })[] = useMemo(() => {
    const hasEnoughFromAPI = engineMeals && Array.isArray(engineMeals) && engineMeals.length >= MIN_MEALS_THRESHOLD;
    return hasEnoughFromAPI ? engineMeals : fallbackMeals;
  }, [engineMeals, fallbackMeals]);

  // Use chunked scoring hook for non-blocking performance
  const { scoredMeals, isLoading: isScoring, progress, totalMeals: totalMealsToScore, scoredCount } = useChunkedRecipeScoring(
    mealsToRender,
    null, // ratingPet deprecated - using enhancedPet only
    enhancedPet
  );

  // Store sorted meals (already sorted by the hook, but ensure final sort)
  const sortedMealsToRender = useMemo(() => {
    return [...scoredMeals].sort((a: any, b: any) => {
      const aScore = ('score' in a && typeof a.score === 'number') ? a.score : 0;
      const bScore = ('score' in b && typeof b.score === 'number') ? b.score : 0;
      const scoreDiff = bScore - aScore;
      // If scores differ, sort by score (descending)
      if (Math.abs(scoreDiff) > 0.001) {
        return scoreDiff;
      }
      // If scores are equal, use recipe ID as tiebreaker
      const aId = a.recipe?.id || '';
      const bId = b.recipe?.id || '';
      return aId.localeCompare(bId);
    });
  }, [scoredMeals]);

  // Calculate base meal count (before early returns to ensure hooks are always called)
  const baseTotalMeals = sortedMealsToRender.length;
  
  // Memoize the count calculation - use actual count with minimal organic tweaking
  // Only recalculate when pet profile or base count changes
  const { countMessage, countSubtext, targetDisplayCount } = useMemo(() => {
    // Use the actual count as the base
    const message = getCountMessage(baseTotalMeals, pet?.type);
    const subtext = getSubtext(baseTotalMeals, pet?.type);
    // Use actual count
    const target = baseTotalMeals;
    
    return {
      countMessage: message,
      countSubtext: subtext,
      targetDisplayCount: target,
    };
  }, [baseTotalMeals, pet?.type]);
  
  // Progressive count animation - MUST be called before any early returns
  const { displayCount, isCounting } = useProgressiveMealCount({
    target: targetDisplayCount,
    duration: 1000,
    steps: 20,
  });

  // Track saved recipes separately to avoid triggering meal recalculation
  const [savedRecipeIds, setSavedRecipeIds] = useState<Set<string>>(new Set());

  // Initialize savedRecipeIds from pet when pet loads
  useEffect(() => {
    if (pet?.savedRecipes) {
      setSavedRecipeIds(new Set(pet.savedRecipes));
    }
  }, [pet?.id]); // Only update when pet ID changes, not when savedRecipes changes

  const handleSaveRecipe = async (recipeId: string, recipeName: string) => {
    const userId = getCurrentUserId();
    if (!userId || !pet) return;

    // Check if already saved (using local state)
    if (savedRecipeIds.has(recipeId)) {
      setCardMessage({ id: recipeId, text: 'Already saved for this pet.' });
      setTimeout(() => setCardMessage(null), 2500);
      return;
    }

    // Update via storage util
    const updatedPet = {
      ...pet,
      savedRecipes: [...(pet.savedRecipes || []), recipeId]
    };
    
    await savePet(userId, updatedPet);

    // Update local state to reflect the change immediately
    setPet(updatedPet);
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

  const getHealthCompatibilityScore = (recipe: any, pet: Pet): number => {
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

        <div 
          className="bg-surface rounded-lg shadow-md border border-surface-highlight p-4 mb-3"
        >
          <div className="flex items-start gap-4">
            {/* Left: Turtle Image (twice as large) */}
            <div className="flex-shrink-0">
              <Image
                src="/images/emojis/Mascots/Sherlock Shells/Shell4.jpg"
                alt="Sherlock Shells Detective"
                width={288}
                height={288}
                className="w-72 h-72 object-contain mascot-icon mascot-sherlock-shells"
                unoptimized
              />
            </div>

            {/* Left-Middle: Title and Bio Info in Grid */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-foreground mb-6 mt-8">
                Sherlock Shells is detecting meals...
              </h1>
              
              {/* Three Column Layout: Bio, Health Concerns, Allergies */}
              <div className="flex gap-6 mt-8">
                {/* Bio Column */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Bio</h3>
                  <div className="grid grid-cols-1 gap-y-1 text-sm text-gray-300">
                    {pet.breed && (
                      <div className="flex items-start gap-1.5">
                        <span className="text-orange-400 mt-0.5">•</span>
                        <span><strong className="text-gray-200">Breed:</strong> {pet.breed}</span>
                      </div>
                    )}
                    {pet.age && (
                      <div className="flex items-start gap-1.5">
                        <span className="text-orange-400 mt-0.5">•</span>
                        <span><strong className="text-gray-200">Age:</strong> {pet.age}</span>
                      </div>
                    )}
                    {(pet.weightKg || pet.weight) && (
                      <div className="flex items-start gap-1.5">
                        <span className="text-orange-400 mt-0.5">•</span>
                        <span><strong className="text-gray-200">Weight:</strong> {pet.weightKg ? `${pet.weightKg}kg` : pet.weight}</span>
                      </div>
                    )}
                    {pet.type && (
                      <div className="flex items-start gap-1.5">
                        <span className="text-orange-400 mt-0.5">•</span>
                        <span><strong className="text-gray-200">Type:</strong> {pet.type}</span>
                      </div>
                    )}
                    {pet.savedRecipes && pet.savedRecipes.length > 0 && (
                      <div className="flex items-start gap-1.5">
                        <span className="text-orange-400 mt-0.5">•</span>
                        <span><strong className="text-gray-200">Total Meals:</strong> {pet.savedRecipes.length}</span>
                      </div>
                    )}
                    {(pet.dietaryRestrictions || []).length > 0 && (
                      <div className="flex items-start gap-1.5">
                        <span className="text-orange-400 mt-0.5">•</span>
                        <span><strong className="text-gray-200">Dietary Restrictions:</strong> {(pet.dietaryRestrictions || []).join(', ')}</span>
                      </div>
                    )}
                    {(pet.dislikes || []).length > 0 && (
                      <div className="flex items-start gap-1.5">
                        <span className="text-orange-400 mt-0.5">•</span>
                        <span><strong className="text-gray-200">Dislikes:</strong> {(pet.dislikes || []).join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Health Concerns Column - Always rendered for consistent layout */}
                <div className="flex-shrink-0 min-w-[180px]">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Health Concerns</h3>
                  <div className="flex flex-col gap-1.5">
                    {(pet.healthConcerns || []).length > 0 ? (
                      (pet.healthConcerns || []).map((concern) => (
                        <div
                          key={concern}
                          className="px-2 py-1 bg-orange-900/40 text-orange-200 border border-orange-700/50 text-xs rounded"
                        >
                          {concern.replace(/-/g, ' ')}
                        </div>
                      ))
                    ) : (
                      <div className="px-2 py-1 text-gray-500 text-xs italic">
                        None
                      </div>
                    )}
                  </div>
                </div>

                {/* Allergies Column - Always rendered for consistent layout */}
                <div className="flex-shrink-0 min-w-[180px]">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Allergies</h3>
                  <div className="flex flex-col gap-1.5">
                    {(pet.allergies || []).length > 0 ? (
                      (pet.allergies || []).map((allergy) => (
                        <div
                          key={allergy}
                          className="px-2 py-1 bg-orange-900/40 text-orange-200 border border-orange-700/50 text-xs rounded"
                        >
                          {allergy.replace(/-/g, ' ')}
                        </div>
                      ))
                    ) : (
                      <div className="px-2 py-1 text-gray-500 text-xs italic">
                        None
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {engineError && (
                <p className="mt-4 text-sm text-amber-200 bg-amber-900/30 border border-amber-700/50 px-3 py-2 rounded-lg">
                  {engineError}
                </p>
              )}
            </div>

            {/* Far Right: Number of Meals Found (Larger) */}
            <div className="flex-shrink-0 text-right">
              <div className="text-5xl font-bold text-orange-500">
                {displayCount}{isCounting && <span className="text-3xl">+</span>}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                meals found
                {isCounting && (
                  <span className="text-xs ml-2 text-gray-500">(still searching...)</span>
                )}
              </div>
              {countSubtext && !isCounting && (
                <div className="text-xs text-gray-500 mt-1 max-w-[120px]">
                  {countSubtext}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Show progress indicator while scoring */}
        {isScoring && (
          <ScoringProgress
            progress={progress}
            totalMeals={totalMealsToScore}
            scoredCount={scoredCount}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(() => {
            // FINAL SAFETY CHECK: Sort one more time right before rendering to ensure highest to lowest
            const finalRendered = [...sortedMealsToRender].sort((a: any, b: any) => {
              const aScore = ('score' in a && typeof a.score === 'number') ? a.score : 0;
              const bScore = ('score' in b && typeof b.score === 'number') ? b.score : 0;
              return bScore - aScore; // Descending order (highest first)
            });
            return finalRendered;
          })().map((meal) => {
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
              <Link 
                href={`/recipe/${recipeId}?petId=${petId}`}
                onClick={() => {
                  // Store recipe in session storage for dynamically generated recipes
                  if (typeof window !== 'undefined') {
                    sessionStorage.setItem(`recipe_${recipeId}`, JSON.stringify(recipe));
                  }
                }}
              >
                <div className="bg-surface rounded-lg shadow-md border border-surface-highlight overflow-hidden cursor-pointer hover:shadow-xl hover:border-orange-500/30 hover:-translate-y-1 hover:scale-[1.02] transition-all duration-200 ease-out h-full flex flex-col">
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-foreground text-center">
                        {recipe.name}
                      </h3>
                      {/* Compatibility Rating - Centered under meal name */}
                      {enhancedPet && (
                        <div className="mt-2 flex justify-center">
                          <CompatibilityBadge
                            score={
                              'score' in meal && typeof meal.score === 'number'
                                ? meal.score
                                : (() => {
                                    if (!enhancedPet) return 0;
                                    const enhanced = calculateEnhancedCompatibility(recipe, enhancedPet);
                                    return enhanced.overallScore;
                                  })()
                            }
                          />
                        </div>
                      )}
                    </div>
                    <p className="text-gray-300 text-sm mb-4 flex-1 text-center">
                      {recipe.description}
                    </p>
                    {explanation && (
                      <p className="text-sm text-gray-300 bg-surface-highlight rounded-lg p-3 mb-3 border border-white/5">
                        {explanation}
                      </p>
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