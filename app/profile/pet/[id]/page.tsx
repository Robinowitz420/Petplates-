'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Plus } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import type { ModifiedRecipeResult, Recipe } from '@/lib/types';
import { applyModifiers } from '@/lib/applyModifiers';
import { getRandomName } from '@/lib/utils/petUtils';
import EmojiIcon from '@/components/EmojiIcon';

import { getPets, savePet } from '@/lib/utils/petStorage';
import { useChunkedRecipeScoring } from '@/lib/hooks/useChunkedRecipeScoring';
import { useRecipePricing } from '@/lib/hooks/useRecipePricing';
import { calculateMealsFromGroceryList, type ShoppingListItem } from '@/lib/utils/mealEstimation';

import ScoringProgress from '@/components/ScoringProgress';

import AlphabetText from '@/components/AlphabetText';
import CompatibilityRadial from '@/components/CompatibilityRadial';
import { getProfilePictureForPetType } from '@/lib/utils/emojiMapping';
import { normalizePetType } from '@/lib/utils/petType';
import { scoreWithSpeciesEngine } from '@/lib/utils/speciesScoringEngines';
import { getPetBadges } from '@/lib/utils/badgeStorage';

import { checkAllBadges } from '@/lib/utils/badgeChecker';
import UserAgreementModal from '@/components/UserAgreementModal';
import { USER_AGREEMENT_STORAGE_KEY } from '@/lib/userAgreementDisclaimer';
import MealGenerationScene, { type SceneStatus } from '@/components/MealGenerationScene';

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
  allergiesSeverity?: Record<string, 'low' | 'medium' | 'high'>;
  bannedIngredients?: string[];
  weightKg?: number;
  weight?: string;
  dislikes?: string[];
  activityLevel?: 'sedentary' | 'moderate' | 'active' | 'very-active';
  notes?: string;
}

export default function RecommendedRecipesPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { userId, isLoaded } = useAuth();
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
  const [sortBy, setSortBy] = useState<'compatibility' | 'cheapest'>('compatibility');
  const [hasAgreedToDisclaimer, setHasAgreedToDisclaimer] = useState(false);
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);

  const formatActivityLevel = (level?: Pet['activityLevel']) => {
    if (!level) return '';
    const spaced = level.replace(/-/g, ' ');
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  };

  const sceneStatus: SceneStatus = useMemo(() => {
    if (engineError) return 'error';
    if (loadingMeals) return 'loading';
    if (engineMeals && engineMeals.length > 0) return 'ready';
    return 'idle';
  }, [engineError, engineMeals, loadingMeals]);

  const mealsCacheKey = useMemo(() => {
    return `generated_meals_v3:${userId || 'anon'}:${petId}:count18`;
  }, [petId, userId]);

  const forceRegenerate = searchParams.get('regenerate') === '1';

  const petDisplayName = useMemo(() => {
    if (!pet) return 'Pet';
    return getRandomName(pet.names || (pet.name ? [pet.name] : ['Unnamed Pet']));
  }, [pet?.id, pet?.names, pet?.name]);

  const healthConcernsKey = pet ? JSON.stringify(pet.healthConcerns || []) : '';
  const allergiesKey = pet ? JSON.stringify(pet.allergies || []) : '';
  const dislikesKey = pet ? JSON.stringify(pet.dislikes || []) : '';

  const scoringPet = useMemo(() => {
    if (!pet) return null;
    const petAge = pet.age === 'baby' ? 0.5 : pet.age === 'young' ? 2 : pet.age === 'adult' ? 5 : 10;
    const petType = normalizePetType(pet.type, 'profile/pet/[id].enhancedPet');
    return {
      id: pet.id,
      name: petDisplayName,
      type: petType,
      breed: pet.breed,
      age: petAge,
      weight: pet.weightKg || (petType === 'dog' ? 25 : petType === 'cat' ? 10 : 5),
      activityLevel: 'moderate' as const,
      healthConcerns: pet.healthConcerns || [],
      dietaryRestrictions: pet.dietaryRestrictions || [],
      allergies: pet.allergies || [],
    } as any;
  }, [pet?.id, pet?.type, pet?.breed, pet?.age, pet?.weightKg, healthConcernsKey, allergiesKey, petDisplayName, pet?.dietaryRestrictions]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId || !petId) return;

    try {
      const raw = localStorage.getItem(USER_AGREEMENT_STORAGE_KEY);
      setHasAgreedToDisclaimer(raw === 'true');
    } catch {
      setHasAgreedToDisclaimer(false);
    } finally {
      setDisclaimerChecked(true);
    }

    checkAllBadges(userId, petId, {
      action: 'search_discovery',
    }).catch((err) => {
      console.error('Failed to check badges:', err);
    });

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
  }, [isLoaded, petId, userId]);

  useEffect(() => {
    if (!pet) return;

    if (!disclaimerChecked) return;
    if (!hasAgreedToDisclaimer) {
      setLoadingMeals(false);
      return;
    }

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
            petId: pet.id,
            species: pet.type,
            count: 18,
            petProfile: {
              name: petDisplayName,
              breed: pet.breed || undefined,
              weight: pet.weight || undefined,
              weightKg: pet.weightKg,
              age: pet.age,
              activityLevel: pet.activityLevel,
              allergies: pet.allergies || [],
              dietaryRestrictions: pet.dietaryRestrictions || [],
              dislikes: pet.dislikes || [],
              notes: pet.notes || undefined,
              allergiesSeverity: pet.allergiesSeverity,
              healthConcerns: pet.healthConcerns || [],
              bannedIngredients: pet.bannedIngredients || [],
            },
          }),
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          let friendly = '';
          let errorCode = '';
          try {
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
              const errorJson = await response.json();
              const code = typeof errorJson?.code === 'string' ? errorJson.code : '';
              const message = typeof errorJson?.message === 'string' ? errorJson.message : '';
              const details = typeof errorJson?.details === 'string' ? errorJson.details : '';
              const errorText = typeof errorJson?.error === 'string' ? errorJson.error : '';

              const core = message || details || errorText;
              errorCode = code;
              friendly = core ? `${code ? `${code}: ` : ''}${core}` : '';
            } else {
              friendly = await response.text();
            }
          } catch {
          }

          if (errorCode === 'LIMIT_REACHED' || friendly.includes('LIMIT_REACHED')) {
            if (isMounted) {
              setEngineError(friendly || 'Free plan limit reached.');
              setEngineMeals(null);
            }
            await refreshFindMealsRemaining(pet.id);
            return;
          }

          throw new Error(
            friendly || `Recipe generation failed (${response.status})`
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
        const rawMessage = error instanceof Error ? error.message : String(error);
        const isExpectedError = rawMessage.includes('LIMIT_REACHED');
        if (!isAbortError && !isExpectedError) {
          console.error('Recipe generation error:', error);
        }
        if (isAbortError) {
          setEngineError('Meal generation timed out.');
          setEngineMeals(null);
        }
        const isQuotaClosed =
          rawMessage.includes('Gemini quota is not enabled') ||
          rawMessage.includes('RESOURCE_EXHAUSTED') ||
          rawMessage.includes('Quota exceeded') ||
          rawMessage.includes('limit: 0');

        if (!isQuotaClosed && !isAbortError) {
          setEngineError(rawMessage || 'Meal generation failed.');
          setEngineMeals(null);
        }

        if (isQuotaClosed) {
          setEngineError(
            'The Kitchen is currently closed (Google API Quota). Please check back in a few hours!'
          );
          setShowQuotaPopup(true);
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

  const mealsToRender: (ModifiedRecipeResult | { recipe: Recipe; explanation: string })[] = useMemo(() => {
    const hasAnyFromAPI = engineMeals && Array.isArray(engineMeals) && engineMeals.length > 0;
    return hasAnyFromAPI ? engineMeals : [];
  }, [engineMeals]);

  const recipesForPricing = useMemo(() => {
    return mealsToRender
      .map((m: any) => {
        const recipe = m?.recipe;
        if (!recipe) return null;

        const servingsRaw = (recipe as any)?.servings;
        const servingsParsed =
          typeof servingsRaw === 'number'
            ? servingsRaw
            : typeof servingsRaw === 'string'
              ? parseFloat(servingsRaw)
              : NaN;
        const servings = Number.isFinite(servingsParsed) && servingsParsed > 0 ? servingsParsed : 1;

        const normalized = {
          ...recipe,
          servings,
        } as any;

        const modified = pet ? applyModifiers(normalized as any, pet as any).modifiedRecipe : normalized;

        return {
          ...modified,
          servings,
        } as any;
      })
      .filter(Boolean) as Recipe[];
  }, [mealsToRender, pet]);

  const { pricingByRecipeId: apiPricingById } = useRecipePricing(recipesForPricing.length > 0 ? recipesForPricing : null);

  const packageEstimateByRecipeId = useMemo(() => {
    if (!Array.isArray(mealsToRender) || mealsToRender.length === 0) return {};

    const map: Record<
      string,
      {
        costPerMeal: number;
        totalCost: number;
        estimatedMeals: number;
      }
    > = {};

    for (const meal of mealsToRender) {
      const recipe = (meal as any)?.recipe;
      const recipeId = recipe?.id;
      if (!recipeId) continue;

      const shoppingListRaw = Array.isArray((meal as any)?.shoppingList) ? ((meal as any)?.shoppingList as ShoppingListItem[]) : null;

      const itemsSource =
        shoppingListRaw && shoppingListRaw.length > 0
          ? shoppingListRaw
          : Array.isArray(recipe?.ingredients)
            ? (recipe?.ingredients as any[])
            : [];

      const isSupplementLike = (item: any) => {
        const id = typeof item?.id === 'string' ? item.id : '';
        if (id.startsWith('supplement-')) return true;
        const category = typeof item?.category === 'string' ? item.category : '';
        return category.toLowerCase() === 'supplement';
      };

      const normalizedItems = itemsSource
        .map((item: any, idx: number) => {
          const name = typeof item?.name === 'string' ? item.name : '';
          const amount = typeof item?.amount === 'string' ? item.amount : '';
          if (!name || !amount) return null;
          return {
            id: String(item?.id || `${recipeId}-item-${idx}`),
            name,
            amount,
            category: typeof item?.category === 'string' ? item.category : undefined,
          };
        })
        .filter(Boolean)
        .filter((item: any) => !isSupplementLike(item)) as ShoppingListItem[];

      if (normalizedItems.length === 0) continue;

      try {
        const estimate = calculateMealsFromGroceryList(
          normalizedItems,
          undefined,
          recipe?.category,
          true
        );
        if (estimate && Number.isFinite(estimate.costPerMeal) && estimate.costPerMeal > 0) {
          map[recipeId] = {
            costPerMeal: estimate.costPerMeal,
            totalCost: estimate.totalCost,
            estimatedMeals: estimate.estimatedMeals,
          };
        }
      } catch (error) {
        console.error('[profile/pet/[id]] Failed to compute package estimate for recipe', recipeId, error);
      }
    }

    return map;
  }, [mealsToRender]);

  const costComparisonCachedByRecipeId = useMemo(() => {
    if (typeof window === 'undefined') return {} as Record<string, number>;

    const map: Record<string, number> = {};
    const petKey = String(petId || 'none');

    for (const meal of mealsToRender) {
      const recipe = (meal as any)?.recipe;
      const recipeId = recipe?.id;
      if (!recipeId) continue;

      const cacheKey = `costComparison:pet:${petKey}:recipe:${String(recipeId)}`;

      try {
        const raw = window.sessionStorage.getItem(cacheKey);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        const cost = typeof parsed?.costPerMeal === 'number' ? parsed.costPerMeal : NaN;
        if (Number.isFinite(cost) && cost > 0) {
          map[String(recipeId)] = cost;
        }
      } catch {
        // ignore invalid cache
      }
    }

    return map;
  }, [mealsToRender, petId]);

  const handleRegenerate = () => {
    if (!hasAgreedToDisclaimer) return;
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(mealsCacheKey);
      } catch {
      }

      lastGeneratedPetIdRef.current = null;
      setEngineMeals(null);
    }
    setEngineError(null);
    setRegenerateNonce(Date.now());
  };

  const closeQuotaPopup = () => setShowQuotaPopup(false);

  const handleAgreeToDisclaimer = () => {
    try {
      localStorage.setItem(USER_AGREEMENT_STORAGE_KEY, 'true');
    } catch {
    }
    setHasAgreedToDisclaimer(true);
    setRegenerateNonce(Date.now());
  };

  const { scoredMeals, isLoading: isScoring, progress, totalMeals: totalMealsToScore, scoredCount } = useChunkedRecipeScoring(
    mealsToRender,
    null,
    scoringPet
  );

  const sortedMealsToRender = useMemo(() => {
    const list = [...scoredMeals];

    const getScore = (item: any) => {
      const raw = 'score' in item && typeof item.score === 'number' ? (item.score as number) : 0;
      return Number.isFinite(raw) ? raw : 0;
    };

    const getResolvedCost = (item: any) => {
      const recipeId = String(item?.recipe?.id || '');
      if (!recipeId) return null;

      const cached = costComparisonCachedByRecipeId[recipeId];
      if (typeof cached === 'number' && Number.isFinite(cached) && cached > 0) return cached;

      const pkg = packageEstimateByRecipeId[recipeId];
      const pkgCost = pkg?.costPerMeal;
      if (typeof pkgCost === 'number' && Number.isFinite(pkgCost) && pkgCost > 0) return pkgCost;

      const api = apiPricingById?.[recipeId];
      const apiCost = api?.costPerMealUsd;
      if (typeof apiCost === 'number' && Number.isFinite(apiCost) && apiCost > 0) return apiCost;

      return null;
    };

    list.sort((a: any, b: any) => {
      const aId = String(a?.recipe?.id || '');
      const bId = String(b?.recipe?.id || '');

      if (sortBy === 'cheapest') {
        const aCost = getResolvedCost(a);
        const bCost = getResolvedCost(b);

        const aHas = typeof aCost === 'number' && Number.isFinite(aCost) && aCost > 0;
        const bHas = typeof bCost === 'number' && Number.isFinite(bCost) && bCost > 0;

        if (aHas && bHas) {
          const diff = (aCost as number) - (bCost as number);
          if (Math.abs(diff) > 0.0001) return diff;

          const scoreDiff = getScore(b) - getScore(a);
          if (Math.abs(scoreDiff) > 0.001) return scoreDiff;

          return aId.localeCompare(bId);
        }

        if (aHas && !bHas) return -1;
        if (!aHas && bHas) return 1;

        const scoreDiff = getScore(b) - getScore(a);
        if (Math.abs(scoreDiff) > 0.001) return scoreDiff;
        return aId.localeCompare(bId);
      }

      const scoreDiff = getScore(b) - getScore(a);
      if (Math.abs(scoreDiff) > 0.001) return scoreDiff;
      return aId.localeCompare(bId);
    });

    return list;
  }, [apiPricingById, costComparisonCachedByRecipeId, packageEstimateByRecipeId, scoredMeals, sortBy]);

  const [savedRecipeIds, setSavedRecipeIds] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState<string | null>(null);

  useEffect(() => {
    if (pet?.savedRecipes) {
      setSavedRecipeIds(new Set(pet.savedRecipes));
    }
  }, [pet?.id]);

  const handleSaveRecipe = async (recipeId: string, recipeName: string) => {
    if (!isLoaded || !userId || !pet || isSaving) return;

    if (savedRecipeIds.has(recipeId)) {
      setCardMessage({ id: recipeId, text: 'Already saved for this pet.' });
      setTimeout(() => setCardMessage(null), 2500);
      return;
    }

    setIsSaving(recipeId);

    try {
      const updatedPet = {
        ...pet,
        savedRecipes: [...(pet.savedRecipes || []), recipeId]
      };
      await savePet(userId, updatedPet);

      setPet(updatedPet);
      setSavedRecipeIds(new Set(updatedPet.savedRecipes));
      setCardMessage({ id: recipeId, text: `${recipeName} added to ${petDisplayName}'s meals.` });
      setTimeout(() => setCardMessage(null), 2500);
    } catch (error) {
      const raw = error instanceof Error ? error.message : String(error || '');
      let friendly = raw || 'Unable to save this meal.';
      let isExpectedError = false;

      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object' && typeof (parsed as any).message === 'string') {
            friendly = String((parsed as any).message);
            isExpectedError = parsed.code === 'LIMIT_REACHED';
          }
        } catch {
          // Check for expected errors in raw text
          isExpectedError = raw.includes('LIMIT_REACHED') || raw.includes('limit');
        }
      }

      setCardMessage({ id: recipeId, text: friendly });
      setTimeout(() => setCardMessage(null), 5000);

      // Only log unexpected errors to console
      if (!isExpectedError) {
        console.error('Failed to save recipe:', error);
      }
    } finally {
      setIsSaving(null);
    }
  };

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

  if (!pet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-4">
      {disclaimerChecked && !hasAgreedToDisclaimer ? (
        <UserAgreementModal isOpen={true} onAgree={handleAgreeToDisclaimer} />
      ) : null}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-primary-400 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Profile
        </Link>

        <div className="bg-surface rounded-lg shadow-md border border-surface-highlight px-6 py-4 mb-3 flex gap-6 relative">
          <span className="flex-shrink-0 self-stretch rounded-lg bg-surface-highlight border border-surface-highlight p-1">
            <span className="relative block w-40 md:w-48 lg:w-56 h-full overflow-hidden rounded-md">
              <MealGenerationScene
                status={sceneStatus}
                idleImageSrc="/images/emojis/Mascots/Sherlock Shells/Shell4.jpg"
                loadingVideoMp4Src="/images/emojis/Mascots/Sherlock Shells/ShellsLoading.mp4"
                readyImageSrc="/images/emojis/Mascots/Sherlock Shells/ShellsMealsFound.png"
                errorImageSrc="/images/emojis/Mascots/Sherlock Shells/Shell4.jpg"
                alt="Sherlock Shells"
                width={640}
                height={540}
                respectReducedMotion={false}
                className="w-full h-full"
              />
            </span>
          </span>
          <div className="flex-1 flex flex-col gap-6 min-w-0">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div
                className="text-2xl font-bold text-foreground flex flex-wrap items-center gap-3 min-w-0 md:translate-x-[300px]"
                style={{ paddingLeft: 25 }}
              >
                <AlphabetText text="Sherlock Shells is detecting meals for" size={36} />
                <span className="inline-flex items-center gap-0 relative" style={{ top: '11px' }}>
                  <AlphabetText text="-" size={36} />
                  <span style={{ marginLeft: 10 }}>
                    <AlphabetText text={petDisplayName} size={36} />
                  </span>
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
              <div className="flex flex-col items-center flex-shrink-0 gap-0" style={{ marginLeft: '-60px' }}>
                <span className="w-48 h-48 rounded-full bg-surface-highlight border-2 border-green-800 overflow-hidden inline-flex items-center justify-center align-middle -translate-y-[40px]">
                  <Image
                    src={getProfilePictureForPetType(pet.type)}
                    alt={`${petDisplayName} profile`}
                    width={192}
                    height={192}
                    className="w-48 h-48 object-cover"
                    unoptimized
                  />
                </span>

                <button
                  onClick={handleRegenerate}
                  disabled={loadingMeals}
                  className="group relative inline-flex focus:outline-none focus-visible:outline-none focus-visible:ring-0 rounded-2xl transition-transform duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ outline: 'none', boxShadow: 'none' }}
                  aria-label={loadingMeals ? 'Finding a new Batch…' : 'Find a new Batch!'}
                >
                  <span className="relative h-16 w-[360px] sm:w-[420px] max-w-full overflow-hidden rounded-2xl">
                    <Image
                      src="/images/Buttons/FindNewBatch.png"
                      alt=""
                      fill
                      sizes="420px"
                      className="object-contain"
                      priority
                    />
                  </span>
                  <span className="sr-only">{loadingMeals ? 'Finding a new Batch…' : 'Find a new Batch!'}</span>
                </button>
              </div>

              <div
                className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-start lg:justify-center lg:flex-1 lg:-translate-y-[60px] pb-10"
                style={{ marginLeft: '-115px' }}
              >

                <div className="flex-shrink-0 min-w-[200px]">
                  <h3 className="text-sm font-semibold text-gray-300 mb-1 pl-4 pb-1 border-b border-surface-highlight">
                    <AlphabetText text="Bio" size={30} />
                  </h3>
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
                        <span>
                          <strong className="text-gray-200">Activity Level:</strong> {formatActivityLevel(pet.activityLevel)}
                        </span>
                      </div>
                    )}
                    {(pet.dietaryRestrictions || []).length > 0 && (
                      <div className="flex items-start gap-1.5">
                        <span className="text-orange-400 mt-0.5">•</span>
                        <span>
                          <strong className="text-gray-200">Dietary Restrictions:</strong> {(pet.dietaryRestrictions || []).join(', ')}
                        </span>
                      </div>
                    )}
                    {(pet.dislikes || []).length > 0 && (
                      <div className="flex items-start gap-1.5">
                        <span className="text-orange-400 mt-0.5">•</span>
                        <span>
                          <strong className="text-gray-200">Dislikes:</strong> {(pet.dislikes || []).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0 min-w-[160px]">
                  <h3 className="text-sm font-semibold text-gray-300 mb-1 pb-1 border-b border-surface-highlight">
                    <AlphabetText text="Health concerns" size={30} />
                  </h3>
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
                      <div className="px-2 py-1 text-gray-500 text-xs italic">None</div>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0 min-w-[160px]">
                  <h3 className="text-sm font-semibold text-gray-300 mb-1 pb-1 border-b border-surface-highlight">
                    <AlphabetText text="Allergies" size={30} />
                  </h3>
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
                      <div className="px-2 py-1 text-gray-500 text-xs italic">None</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden md:flex absolute bottom-3 right-4 pointer-events-none select-none">
            <div className="max-w-[420px]">
              <AlphabetText text="Click on Meal Cards for Details" size={26} className="justify-end" />
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
          <AlphabetText text="Sort" size={30} className="text-orange-300 drop-shadow-sm" />
          <div className="inline-flex rounded-2xl border border-surface-highlight bg-surface-highlight/40 p-1">
            {([
              { value: 'compatibility', label: 'Compatibility' },
              { value: 'cheapest', label: 'Cheapest' },
            ] as const).map((option) => {
              const isActive = sortBy === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSortBy(option.value)}
                  className={`group inline-flex items-center rounded-2xl px-4 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/70 transition ${
                    isActive
                      ? 'bg-orange-500/20 border border-orange-400 text-orange-200 shadow-[0_0_15px_rgba(251,146,60,0.45)]'
                      : 'border border-transparent text-gray-400 hover:text-orange-200'
                  }`}
                  aria-pressed={isActive}
                >
                  <AlphabetText text={option.label} size={22} />
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedMealsToRender.slice(0, 18).map((meal) => {
            const recipe = (meal as any).recipe;
            const recipeId = recipe?.id;
            if (!recipeId) return null;

            const pricing = apiPricingById?.[recipeId];
            const packageEstimate = packageEstimateByRecipeId[recipeId];
            const cachedCostPerMeal = costComparisonCachedByRecipeId[recipeId];

            const resolvedCostPerMeal =
              typeof cachedCostPerMeal === 'number' && Number.isFinite(cachedCostPerMeal) && cachedCostPerMeal > 0
                ? cachedCostPerMeal
                : packageEstimate
                  ? packageEstimate.costPerMeal
                  : typeof pricing?.costPerMealUsd === 'number' && Number.isFinite(pricing.costPerMealUsd)
                    ? pricing.costPerMealUsd
                    : null;

            const costText = resolvedCostPerMeal ? `$${resolvedCostPerMeal.toFixed(2)} Per Meal` : null;
            const mealsText = packageEstimate ? String(packageEstimate.estimatedMeals) : null;

            const provenanceLabel = (() => {
              if (typeof cachedCostPerMeal === 'number' && Number.isFinite(cachedCostPerMeal) && cachedCostPerMeal > 0) {
                return 'Recipe';
              }
              if (packageEstimate) {
                return 'Package';
              }
              const source = pricing?.pricingSource;
              if (!source || source === 'none') return null;
              if (source === 'snapshot') return 'Snapshot';
              if (source === 'estimate') return null;
              return 'Mixed';
            })();

            return (
              <Link
                key={recipeId}
                href={`/recipe/${recipeId}?petId=${petId}`}
                className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-2xl"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    sessionStorage.setItem(`recipe_${recipeId}`, JSON.stringify(recipe));
                  }
                }}
              >
                <div className="relative">
                  <div
                    className="bg-surface rounded-2xl shadow-md border-2 border-orange-500/40 overflow-hidden cursor-pointer hover:shadow-xl hover:border-orange-400/80 hover:-translate-y-1 hover:scale-[1.02] transition-all duration-200 ease-out h-full flex flex-col group-hover:shadow-orange-500/40 group-hover:ring-2 group-hover:ring-orange-400/80 group-hover:ring-offset-2 group-hover:ring-offset-background"
                  >
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="mb-3">
                        <h3 className="text-xl font-bold text-foreground text-center">
                          <AlphabetText text={recipe.name} size={28} />
                        </h3>
                        <div className="mt-3 flex justify-center">
                          {costText ? (
                            <div
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-highlight border border-orange-500/40 text-xs font-semibold text-orange-200"
                            >
                              <span className="text-white">{costText}</span>
                              {provenanceLabel ? (
                                <span className="text-gray-300">• {provenanceLabel}</span>
                              ) : null}
                              {mealsText ? (
                                <span className="text-gray-300">• Est. meals: {mealsText}</span>
                              ) : null}
                            </div>
                          ) : (
                            <div
                              className="inline-flex items-center px-3 py-1.5 rounded-full bg-surface-highlight border border-white/10 text-xs font-semibold text-gray-300"
                            >
                              Pricing unavailable
                            </div>
                          )}
                        </div>

                        {scoringPet && (
                          <div className="mt-4 flex flex-col items-center gap-2">
                            {(() => {
                              const score =
                                'score' in (meal as any) && typeof (meal as any).score === 'number'
                                  ? ((meal as any).score as number)
                                  : scoreWithSpeciesEngine(recipe, scoringPet as any).overallScore;

                              return (
                                <div className="flex flex-col items-center">
                                  <CompatibilityRadial score={score} size={135} />
                                  <div className="mt-2">
                                    <Image
                                      src="/images/Buttons/CompatabilityScore.png"
                                      alt="Compatibility Score"
                                      width={160}
                                      height={24}
                                      className="h-11 w-auto"
                                      unoptimized
                                    />
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>

                      <div className="mt-auto pt-4">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSaveRecipe(recipeId, recipe.name);
                          }}
                          disabled={savedRecipeIds.has(recipeId) || isSaving === recipeId}
                          className="group relative w-full inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-green-800/40 rounded-2xl transition-transform duration-150 active:scale-95 disabled:cursor-not-allowed"
                          aria-label={savedRecipeIds.has(recipeId) ? 'Meal Harvested' : 'Harvest Meal'}
                        >
                          <span className="relative h-[60px] w-full overflow-hidden rounded-2xl">
                            <Image
                              src={
                                savedRecipeIds.has(recipeId)
                                  ? '/images/Buttons/MealSaved.png'
                                  : '/images/Buttons/SaveMeal.png'
                              }
                              alt={
                                savedRecipeIds.has(recipeId)
                                  ? 'Meal Harvested'
                                  : 'Harvest Meal'
                              }
                              fill
                              sizes="100vw"
                              className="object-contain"
                              unoptimized
                            />
                          </span>
                          <span className="sr-only">
                            {savedRecipeIds.has(recipeId) ? 'Meal Harvested' : 'Harvest Meal'}
                          </span>
                        </button>
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