'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Plus } from 'lucide-react';
import type { ModifiedRecipeResult, Recipe } from '@/lib/types';
import { calculateEnhancedCompatibility, type Pet as EnhancedPet, getGrade } from '@/lib/utils/enhancedCompatibilityScoring';
import { CompatibilityBadge } from '@/components/CompatibilityBadge';
import { getRandomName } from '@/lib/utils/petUtils';
import EmojiIcon from '@/components/EmojiIcon';
import { getPets, savePet } from '@/lib/utils/petStorage';
import { useChunkedRecipeScoring } from '@/lib/hooks/useChunkedRecipeScoring';
import ScoringProgress from '@/components/ScoringProgress';
import { getProfilePictureForPetType } from '@/lib/utils/emojiMapping';
import CompatibilityRadial from '@/components/CompatibilityRadial';

type PetCategory = 'dogs' | 'cats' | 'birds' | 'reptiles' | 'pocket-pets';
type AgeGroup = 'baby' | 'young' | 'adult' | 'senior';

interface Pet {
  id: string;
  name?: string;
  names?: string[];
  type: PetCategory;
  breed: string;
  age: AgeGroup;
  healthConcerns?: string[];
  dietaryRestrictions?: string[];
  savedRecipes?: string[];
  allergies?: string[];
  bannedIngredients?: string[];
  weightKg?: number;
  weight?: string;
  dislikes?: string[];
  activityLevel?: 'sedentary' | 'moderate' | 'active' | 'very-active';
}

const SIMULATED_USER_ID = 'clerk_simulated_user_id_123';

const getCurrentUserId = () => {
  if (typeof window === 'undefined') return SIMULATED_USER_ID;
  return localStorage.getItem('last_user_id') || SIMULATED_USER_ID;
};

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
  const searchParams = useSearchParams();
  const [pet, setPet] = useState<Pet | null>(null);
  const [hoveredRecipe, setHoveredRecipe] = useState<string | null>(null);
  const [engineMeals, setEngineMeals] = useState<ModifiedRecipeResult[] | null>(null);
  const [engineError, setEngineError] = useState<string | null>(null);
  const [loadingMeals, setLoadingMeals] = useState(true);
  const [cardMessage, setCardMessage] = useState<{ id: string; text: string } | null>(null);
  const [showQuotaPopup, setShowQuotaPopup] = useState(false);
  const generationInFlightRef = useRef(false);
  const lastGeneratedPetIdRef = useRef<string | null>(null);
  const petId = params.id as string;
  const [regenerateNonce, setRegenerateNonce] = useState(0);

  const mealsCacheKey = useMemo(() => {
    const userId = getCurrentUserId();
    return `generated_meals_v1:${userId}:${petId}`;
  }, [petId]);

  const forceRegenerate = searchParams.get('regenerate') === '1';

  const petDisplayName = useMemo(() => {
    if (!pet) return 'Pet';
    return getRandomName(pet.names || (pet.name ? [pet.name] : ['Unnamed Pet']));
  }, [pet?.id, pet?.names, pet?.name]);

  const healthConcernsKey = pet ? JSON.stringify(pet.healthConcerns || []) : '';
  const allergiesKey = pet ? JSON.stringify(pet.allergies || []) : '';
  const dislikesKey = pet ? JSON.stringify(pet.dislikes || []) : '';

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

    if (typeof window !== 'undefined') {
      localStorage.setItem(`active_pet_id_${userId}`, petId);
      localStorage.setItem('last_active_pet_id', petId);
    }

    const loadPet = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout loading pets')), 5000)
        );

        const pets = await Promise.race([
          getPets(userId),
          timeoutPromise
        ]) as any[];

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
          setLoadingMeals(false);
        }
      } catch (error) {
        console.error('Failed to load pet data:', error);
        setPet(null);
        setLoadingMeals(false);
      }
    };
    loadPet();
  }, [petId]);

  useEffect(() => {
    if (!pet) return;

    if (forceRegenerate && typeof window !== 'undefined') {
      try {
        localStorage.removeItem(mealsCacheKey);
      } catch {
      }
      lastGeneratedPetIdRef.current = null;
      setEngineMeals(null);
    }

    if (typeof window !== 'undefined') {
      try {
        const cachedRaw = localStorage.getItem(mealsCacheKey);
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw);
          if (cached && Array.isArray(cached.engineMeals) && cached.engineMeals.length > 0) {
            setEngineMeals(cached.engineMeals as ModifiedRecipeResult[]);
            setLoadingMeals(false);
            return;
          }
        }
      } catch {
      }
    }

    if (forceRegenerate && typeof window !== 'undefined') {
      try {
        window.history.replaceState(null, '', `/profile/pet/${petId}`);
      } catch {
      }
    }

    if (generationInFlightRef.current) return;
    if (lastGeneratedPetIdRef.current === pet.id && engineMeals && engineMeals.length > 0) return;
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);
    setLoadingMeals(true);
    setEngineError(null);
    setShowQuotaPopup(false);
    generationInFlightRef.current = true;
    lastGeneratedPetIdRef.current = pet.id;

    (async () => {
      try {
        const response = await fetch('/api/recipes/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            species: pet.type,
            count: 9,
            petProfile: {
              name: petDisplayName,
              weight: pet.weight,
              weightKg: pet.weightKg,
              age: pet.age,
              allergies: pet.allergies || [],
              healthConcerns: pet.healthConcerns || [],
              bannedIngredients: pet.bannedIngredients || [],
            },
          }),
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          let details = '';
          try {
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
              const errorJson = await response.json();
              details = JSON.stringify(errorJson);
            } else {
              details = await response.text();
            }
          } catch {
          }

          throw new Error(
            `Recipe generation failed (${response.status})${details ? `: ${details}` : ''}`
          );
        }

        const data = await response.json();
        if (!isMounted) return;

        if (data?.recipes && data.recipes.length > 0) {
          const generatedMeals = data.recipes.map((recipe: any) => ({
            recipe,
            explanation: '',
          }));

          setEngineMeals(generatedMeals as ModifiedRecipeResult[]);

          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(mealsCacheKey, JSON.stringify({
                petId: pet.id,
                createdAt: Date.now(),
                engineMeals: generatedMeals,
              }));
            } catch {
            }
          }
        } else {
          throw new Error('No recipes generated');
        }
      } catch (error) {
        if (!isMounted) return;
        const isAbortError =
          (error as any)?.name === 'AbortError' ||
          (typeof DOMException !== 'undefined' && error instanceof DOMException && error.name === 'AbortError');
        if (!isAbortError) {
          console.error('Recipe generation error:', error);
        }
        if (isAbortError) {
          setEngineError('Meal generation timed out—showing standard matches.');
          setEngineMeals(null);
        }
        const rawMessage = error instanceof Error ? error.message : String(error);
        const isQuotaClosed =
          rawMessage.includes('Gemini quota is not enabled') ||
          rawMessage.includes('RESOURCE_EXHAUSTED') ||
          rawMessage.includes('Quota exceeded') ||
          rawMessage.includes('limit: 0');

        if (isQuotaClosed) {
          setEngineError(
            'The Kitchen is currently closed (Google API Quota). Please check back in a few hours!'
          );
          setShowQuotaPopup(true);
        }

        try {
          const concerns = (pet.healthConcerns || []).filter((concern) => concern !== 'none');
          const allergies = pet.allergies?.filter((allergy) => allergy !== 'none') || [];

          const fallbackController = new AbortController();
          const fallbackTimeoutId = setTimeout(() => fallbackController.abort(), 30000);

          const response = await fetch('/api/recommendations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: fallbackController.signal,
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

          clearTimeout(fallbackTimeoutId);

          if (!response.ok) {
            throw new Error(`Recommendations failed (${response.status})`);
          }

          const data = await response.json();
          if (!isMounted) return;

          setEngineMeals((data?.results as ModifiedRecipeResult[]) || []);
        } catch (fallbackError) {
          if (!isMounted) return;
          const isAbortError =
            (fallbackError as any)?.name === 'AbortError' ||
            (typeof DOMException !== 'undefined' &&
              fallbackError instanceof DOMException &&
              fallbackError.name === 'AbortError');
          if (isAbortError) {
            setEngineMeals(null);
            setEngineError('Meal recommendations timed out—showing standard matches.');
            return;
          }
          if (!isAbortError) {
            console.error('Recommendations error:', fallbackError);
          }
          setEngineMeals(null);
          setEngineError('Unable to load meals—showing standard matches.');
        }
      } finally {
        clearTimeout(timeoutId);
        if (isMounted) {
          setLoadingMeals(false);
        }
        generationInFlightRef.current = false;
      }
    })();

    return () => {
      isMounted = false;
      generationInFlightRef.current = false;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [pet, regenerateNonce, forceRegenerate, mealsCacheKey, petId]);

  const handleRegenerate = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(mealsCacheKey);
      } catch {
      }
    }
    lastGeneratedPetIdRef.current = null;
    setEngineMeals(null);
    setEngineError(null);
    setRegenerateNonce(Date.now());
  };

  const closeQuotaPopup = () => setShowQuotaPopup(false);

  useEffect(() => {
    if (pet) {
      const { getRecommendedRecipes } = require('@/lib/utils/recipeRecommendations');
      const tieredRecommendations = getRecommendedRecipes(pet, 20, true);
      const fallbackCount = tieredRecommendations.length;
    }
  }, [engineMeals, pet]);

  const { normalizeToSubtype } = require('@/lib/utils/ingredientWhitelists');

  const matchesSpecies = (recipe: Recipe, currentPet: Pet): boolean => {
    if (recipe.category === currentPet.type) return true;

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

  const tieredHealthConcernsKey = pet ? JSON.stringify(pet.healthConcerns || []) : '';
  const tieredAllergiesKey = pet ? JSON.stringify(pet.allergies || []) : '';

  const tieredRecommendations = useMemo(() => {
    if (!pet) return [];
    const { getRecommendedRecipes } = require('@/lib/utils/recipeRecommendations');
    const combinedRecipes = getCombinedRecipes();
    return getRecommendedRecipes(pet, 9, true, combinedRecipes);
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

  const mealsToRender: (ModifiedRecipeResult | { recipe: Recipe; explanation: string })[] = useMemo(() => {
    const hasAnyFromAPI = engineMeals && Array.isArray(engineMeals) && engineMeals.length > 0;
    return hasAnyFromAPI ? engineMeals : fallbackMeals;
  }, [engineMeals, fallbackMeals]);

  const { scoredMeals, isLoading: isScoring, progress, totalMeals: totalMealsToScore, scoredCount } = useChunkedRecipeScoring(
    mealsToRender,
    null,
    enhancedPet
  );

  const sortedMealsToRender = useMemo(() => {
    return [...scoredMeals].sort((a: any, b: any) => {
      const aScore = ('score' in a && typeof a.score === 'number') ? a.score : 0;
      const bScore = ('score' in b && typeof b.score === 'number') ? b.score : 0;
      const scoreDiff = bScore - aScore;
      if (Math.abs(scoreDiff) > 0.001) {
        return scoreDiff;
      }
      const aId = a.recipe?.id || '';
      const bId = b.recipe?.id || '';
      return aId.localeCompare(bId);
    });
  }, [scoredMeals]);

  const [savedRecipeIds, setSavedRecipeIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (pet?.savedRecipes) {
      setSavedRecipeIds(new Set(pet.savedRecipes));
    }
  }, [pet?.id]);

  const handleSaveRecipe = async (recipeId: string, recipeName: string) => {
    const userId = getCurrentUserId();
    if (!userId || !pet) return;

    if (savedRecipeIds.has(recipeId)) {
      setCardMessage({ id: recipeId, text: 'Already saved for this pet.' });
      setTimeout(() => setCardMessage(null), 2500);
      return;
    }

    const updatedPet = {
      ...pet,
      savedRecipes: [...(pet.savedRecipes || []), recipeId]
    };

    await savePet(userId, updatedPet);

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

  const PetEmojiIcon = ({ type, size = 24 }: { type: PetCategory; size?: number }) => {
    const emoji = getPetEmoji(type);
    return <EmojiIcon emoji={emoji} size={size} />;
  };

  const getHealthCompatibilityScore = (recipe: any, pet: Pet): number => {
    const concerns = pet.healthConcerns || [];
    if (!concerns.length) return 0;
    const overlaps = concerns.filter((c) => (recipe.healthConcerns || []).includes(c));
    if (!overlaps.length) return 0;
    return overlaps.length / concerns.length;
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
    const fullStars = Math.round(rating);
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

        <div className="bg-surface rounded-lg shadow-md border border-surface-highlight px-6 py-4 mb-3 flex flex-col gap-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="text-2xl font-bold text-foreground flex flex-wrap items-center gap-3">
              Sherlock Shells is detecting meals for
              <span className="inline-flex items-center gap-3">
                <span className="w-14 h-14 rounded-full bg-surface-highlight border border-surface-highlight overflow-hidden inline-flex items-center justify-center align-middle">
                  <Image
                    src={getProfilePictureForPetType(pet.type)}
                    alt={`${petDisplayName} profile`}
                    width={56}
                    height={56}
                    className="w-14 h-14 object-cover"
                    unoptimized
                  />
                </span>
                <span className="font-semibold text-2xl">{petDisplayName}</span>
              </span>
            </div>
            <button
              onClick={handleRegenerate}
              disabled={loadingMeals}
              className="px-6 py-2 rounded-full text-sm font-semibold transition-colors bg-green-800 text-white hover:bg-green-900 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loadingMeals ? 'Regenerating Meals…' : 'Regenerate Meals'}
            </button>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
            <div className="flex-shrink-0 min-w-[220px]">
              <h3 className="text-sm font-semibold text-gray-300 mb-1 pl-4 pb-1 border-b border-surface-highlight">Bio</h3>
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
                {pet.activityLevel && (
                  <div className="flex items-start gap-1.5">
                    <span className="text-orange-400 mt-0.5">•</span>
                    <span><strong className="text-gray-200">Activity Level:</strong> {pet.activityLevel}</span>
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

            <div className="flex-shrink-0 min-w-[180px]">
              <h3 className="text-sm font-semibold text-gray-300 mb-1 pb-1 border-b border-surface-highlight">Health Concerns</h3>
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

            <div className="flex-shrink-0 min-w-[180px]">
              <h3 className="text-sm font-semibold text-gray-300 mb-1 pb-1 border-b border-surface-highlight">Allergies</h3>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...sortedMealsToRender]
            .sort((a: any, b: any) => {
              const aScore = ('score' in a && typeof a.score === 'number') ? a.score : 0;
              const bScore = ('score' in b && typeof b.score === 'number') ? b.score : 0;
              return bScore - aScore;
            })
            .slice(0, 9)
            .map((meal) => {
              const recipe = meal.recipe;
              const explanation = meal.explanation;
              const recipeId = recipe.id;
              return (
                <Link
                  key={recipeId}
                  href={`/recipe/${recipeId}?petId=${petId}`}
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      sessionStorage.setItem(`recipe_${recipeId}`, JSON.stringify(recipe));
                    }
                  }}
                >
                  <div className="relative group">
                    <div className="bg-surface rounded-lg shadow-md border border-surface-highlight overflow-hidden cursor-pointer hover:shadow-xl hover:border-orange-500/30 hover:-translate-y-1 hover:scale-[1.02] transition-all duration-200
ease-out h-full flex flex-col">
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="mb-3">
                          <h3 className="text-xl font-bold text-foreground text-center">
                            {recipe.name}
                          </h3>
                          {enhancedPet && (
                            <div className="mt-4 flex flex-col items-center gap-2">
                              {(() => {
                                const score =
                                  'score' in meal && typeof meal.score === 'number'
                                    ? (meal.score as number)
                                    : calculateEnhancedCompatibility(recipe, enhancedPet).overallScore;
                                return (
                                  <div>
                                    <CompatibilityRadial score={score} size={140} />
                                    <div className="text-xs text-emerald-100/70 text-center">
                                      {score >= 60
                                        ? 'Balanced for your pet'
                                        : 'Needs adjustments for safety'}
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
        </div>
      </div>
    </div>
  );
}