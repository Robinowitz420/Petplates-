'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@clerk/nextjs';

import {
  Clock,
  User,
  Star,
  ChevronLeft,
  X,
  ShoppingCart,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

import type { Recipe, ModifiedRecipeResult } from '@/lib/types';
import { applyModifiers } from '@/lib/applyModifiers';
import {
  getVettedProduct,
  getVettedProductByAnyIdentifier,
  VETTED_PRODUCTS,
  getGenericIngredientName,
} from '@/lib/data/vetted-products';

import { scoreWithSpeciesEngine } from '@/lib/utils/speciesScoringEngines';
import RecipeScoreModal from '@/components/RecipeScoreModal';
import { getRandomName, type Pet } from '@/lib/utils/petUtils';
import OneClickCheckoutModal from '@/components/OneClickCheckoutModal';

import { ShoppingList } from '@/components/ShoppingList';
import { CostComparison } from '@/components/CostComparison';
import { calculateMealsFromGroceryList } from '@/lib/utils/mealEstimation';
import { useRecipePricing } from '@/lib/hooks/useRecipePricing';
import { getCustomMeal } from '@/lib/utils/customMealStorage';
import { convertCustomMealToRecipe } from '@/lib/utils/convertCustomMealToRecipe';
import { getPets as getPersistedPets, savePet as savePersistedPet } from '@/lib/utils/petStorage';
import AlphabetText from '@/components/AlphabetText';
import {
  getRecommendationsForRecipe,
  type RecommendedSupplement,
} from '@/lib/utils/nutritionalRecommendations';

import { checkAllBadges } from '@/lib/utils/badgeChecker';
import { ensureSellerId } from '@/lib/utils/affiliateLinks';
import { buildAmazonSearchUrl } from '@/lib/utils/purchaseLinks';
import { saveRecipeSnapshotForPet } from '@/lib/utils/recipeSnapshotStorage';
import { normalizePetType } from '@/lib/utils/petType';
import { formatPercent } from '@/lib/utils/formatPercent';
import { getPortionPlan } from '@/lib/portionCalc';
import { getProfilePictureForPetType } from '@/lib/utils/emojiMapping';
import PetCompatibilityBlock from '@/components/PetCompatibilityBlock';
import CustomMadeForLine from '@/components/CustomMadeForLine';
import { getIngredientDisplayPricing } from '@/lib/data/product-prices';
import { getPackageSize } from '@/lib/data/packageSizes';
import ShoppingListBanner from '@/public/images/Site Banners/ShoppingList.png';
import IngredientsTabImage from '@/public/images/Buttons/ingredients.png';
import SupplementsTabImage from '@/public/images/Buttons/Supplements.png';
import CompatibilityRadial from '@/components/CompatibilityRadial';
import HealthAnalysisBanner from '@/public/images/Site Banners/HealthAnalysis.png';
import StorageServingBanner from '@/public/images/Site Banners/unnamed.jpg';
import CostComparisonBanner from '@/public/images/Site Banners/CostComparison.png';
import { readCachedCompatibilityScore, writeCachedCompatibilityScore } from '@/lib/utils/compatibilityScoreCache';

const getIngredientKey = (ingredient: any): string => {
  if (!ingredient) return '';
  const rawId = ingredient.id ?? ingredient.ingredientId ?? '';
  if (rawId) return String(rawId);
  const rawName = typeof ingredient.name === 'string' ? ingredient.name : ingredient.productName;
  return rawName ? String(rawName).trim().toLowerCase() : '';
};

const normalizeToScoringIngredientId = (value: string): string => {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

// =================================================================
// 1. CONSTANTS
// =================================================================

type CategoryType = 'dogs' | 'cats' | 'birds' | 'reptiles' | 'pocket-pets';

function extractSafetyFlags(ingredients: Array<{ name?: string } | string>): string[] {
  const items = Array.isArray(ingredients) ? ingredients : [];
  const names = items
    .map((i) => (typeof i === 'string' ? i : i?.name || ''))
    .join(' | ')
    .toLowerCase();

  const flags: Array<{ key: string; text: string }> = [
    { key: 'onion', text: 'Contains onion — may be unsafe for some pets.' },
    { key: 'garlic', text: 'Contains garlic — may be unsafe for some pets.' },
    { key: 'chive', text: 'Contains chives — may be unsafe for some pets.' },
    { key: 'grape', text: 'Contains grapes — may be unsafe for some pets.' },
    { key: 'raisin', text: 'Contains raisins — may be unsafe for some pets.' },
    { key: 'chocolate', text: 'Contains chocolate/cocoa — may be unsafe for some pets.' },
    { key: 'cocoa', text: 'Contains chocolate/cocoa — may be unsafe for some pets.' },
    { key: 'xylitol', text: 'Contains xylitol — may be unsafe for some pets.' },
    { key: 'macadamia', text: 'Contains macadamia — may be unsafe for some pets.' },
    { key: 'alcohol', text: 'Contains alcohol — may be unsafe for some pets.' },
    { key: 'caffeine', text: 'Contains caffeine/coffee/tea — may be unsafe for some pets.' },
    { key: 'coffee', text: 'Contains caffeine/coffee/tea — may be unsafe for some pets.' },
    { key: 'tea', text: 'Contains caffeine/coffee/tea — may be unsafe for some pets.' },
  ];

  const found = new Map<string, string>();
  for (const f of flags) {
    if (names.includes(f.key)) {
      found.set(f.key, f.text);
    }
  }

  return Array.from(found.values());
}

const NUTRITION_GUIDELINES: Record<
  CategoryType,
  { protein: string; fat: string; fiber: string }  
> = {
  dogs: { protein: '25-35%', fat: '10-20%', fiber: '2-5%' },
  cats: { protein: '40-50%', fat: '25-35%', fiber: '1-3%' },
  birds: { protein: '15-20%', fat: '5-10%', fiber: '3-8%' },
  reptiles: { protein: '20-40%', fat: '5-15%', fiber: '5-10%' },
  'pocket-pets': { protein: '12-18%', fat: '3-6%', fiber: '15-25%' },
};

const HEALTH_CONCERN_MAP: Record<string, string> = {
  'allergy-support': 'allergies',
  allergies: 'allergies',
  'weight-management': 'weight-management',
  obesity: 'weight-management',
  'joint-&-mobility': 'joint-health',
  'joint-health': 'joint-health',
  arthritis: 'joint-health',
  'digestive-health': 'digestive',
  digestive: 'digestive',
  'sensitive-stomach': 'digestive',
  'kidney/urinary-support': 'kidney',
  kidney: 'kidney',
  'urinary-health': 'urinary-health',
  'skin-&-coat': 'skin-coat',
  diabetes: 'diabetes',
  hyperthyroidism: 'hyperthyroidism',
  pancreatitis: 'pancreatitis',
  'hairball-issues': 'hairball',
  hairball: 'hairball',
};

const normalizeConcern = (concern: string) => {
  const key = (concern || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
  return HEALTH_CONCERN_MAP[key] || key;
};

const formatIngredientNameForDisplay = (value: string): string => {
  return String(value)
    .trim()
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

// =================================================================
// 2. TYPES & LOCAL STORAGE HELPERS
// =================================================================

interface RecipeDetailPet {
  id: string;
  names: string[];
  type: string;
  breed: string;
  age: string;
  healthConcerns: string[];
  allergies?: string[];
  weight: string;
  mealPlan: string[];
  savedRecipes: string[];
}

const toRecipeDetailPet = (pet: any): RecipeDetailPet => ({
  id: String(pet?.id || ''),
  names: Array.isArray(pet?.names) && pet.names.length > 0 ? pet.names : pet?.name ? [pet.name] : ['Unnamed Pet'],
  type: String(pet?.type || 'dog'),
  breed: String(pet?.breed || ''),
  age: String(pet?.age || ''),
  healthConcerns: Array.isArray(pet?.healthConcerns) ? pet.healthConcerns : [],
  allergies: Array.isArray(pet?.allergies) ? pet.allergies : [],
  weight: String(pet?.weight || ''),
  mealPlan: Array.isArray(pet?.mealPlan) ? pet.mealPlan : [],
  savedRecipes: Array.isArray(pet?.savedRecipes) ? pet.savedRecipes : [],
});

// Removed getPetsFromLocalStorage and savePetsToLocalStorage

// Helper function to extract ASIN from Amazon URL
const extractASIN = (url: string): string | undefined => {
  if (!url) return undefined;
  // Try /dp/ASIN pattern
  const dpMatch = url.match(/\/dp\/([A-Z0-9]{10})/);
  if (dpMatch) return dpMatch[1];

  // Try /gp/product/ASIN pattern
  const gpMatch = url.match(/\/gp\/product\/([A-Z0-9]{10})/);
  if (gpMatch) return gpMatch[1];

  // Try ASIN parameter
  try {
    const urlObj = new URL(url);
    const asinParam = urlObj.searchParams.get('ASIN');
    if (asinParam) return asinParam;
  } catch (e) {
    // Invalid URL, try regex
  }

  return undefined;
};

// Helper function to derive species from recipe category
const getSpeciesFromRecipeCategory = (category?: string): string | undefined => {
  if (!category) return undefined;
  // recipe.category is like 'dogs', 'cats', 'birds', 'reptiles', 'pocket-pets'
  // This matches the species parameter format
  return category;
};

// Helper function to vet recipe ingredients even without a pet selected
const vetRecipeIngredients = (recipe: Recipe): Recipe => {
  if (!recipe) {
    console.error('vetRecipeIngredients: recipe is null/undefined');
    return recipe;
  }

  if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) {
    console.error('vetRecipeIngredients: recipe.ingredients is invalid:', recipe.ingredients);
    return recipe;
  }

  // Derive species from recipe category
  const species = getSpeciesFromRecipeCategory(recipe.category);

  return {
    ...recipe,
    ingredients: recipe.ingredients.map((ing) => {
      try {
        // Defensive check for ingredient object
        if (!ing || typeof ing !== 'object') {
          console.error('vetRecipeIngredients: invalid ingredient object:', ing);
          return ing; // Return as-is to prevent crash
        }

        // Remove old amazonLink property
        const { amazonLink, ...ingWithoutOldLink } = ing as any;

        const existingLink = ing.asinLink || amazonLink;

        const genericKey = getGenericIngredientName((ing as any).productName || ing.name);
        const displayName = genericKey ? formatIngredientNameForDisplay(genericKey) : ing.name;

      // Try to find vetted product using the ingredient name
      // If the name is a product name (from applyModifiers), try to reverse-lookup
      // by checking if there's an id that might be the original name
      const lookupName = genericKey || ing.name;

      // Pass species for species-aware product matching
      let vettedProduct = getVettedProduct(lookupName, species);

      // If lookup by name/id failed and we have a productName, the ingredient was already vetted
      // Try to find the original generic name by searching VETTED_PRODUCTS for matching productName
      if (!vettedProduct && (ing as any).productName) {
        // Search VETTED_PRODUCTS for an entry with matching productName
        const matchingKey = Object.keys(VETTED_PRODUCTS).find((key) =>
          VETTED_PRODUCTS[key].productName === (ing as any).productName
        );
        if (matchingKey) {
          vettedProduct = VETTED_PRODUCTS[matchingKey];
        }
      }

      if (vettedProduct) {
        const vettedLink = (vettedProduct.asinLink || vettedProduct.purchaseLink);
        return {
          ...ingWithoutOldLink,
          productName: vettedProduct.productName,
          name: displayName,
          asinLink: ensureSellerId(vettedLink), // Prefer vetted product link over existing link
          amazonSearchUrl: ensureSellerId(buildAmazonSearchUrl(displayName)),
        };
      }
      // If no vetted product found, keep ingredient but no ASIN link
      return {
        ...ingWithoutOldLink,
        name: displayName,
        asinLink: existingLink ? ensureSellerId(existingLink) : undefined,
        amazonSearchUrl: ensureSellerId(buildAmazonSearchUrl(displayName)),
      };
      } catch (error) {
        console.error('vetRecipeIngredients: error processing ingredient:', ing, error);
        return ing; // Return original ingredient to prevent crash
      }
    }),
  };
};

// 3. MAIN COMPONENT
// =================================================================

export default function RecipeDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;

  const { userId: clerkUserId, isLoaded } = useAuth();

  const ingredientsTopRef = useRef<HTMLDivElement | null>(null);

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [pets, setPets] = useState<RecipeDetailPet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [petWeight, setPetWeight] = useState('');
  const [petAllergies, setPetAllergies] = useState('');
  const [isPersonalizing, setIsPersonalizing] = useState(false);
  const [modifierError, setModifierError] = useState<string | null>(null);
  const [modifierResult, setModifierResult] = useState<ModifiedRecipeResult | null>(null);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'supplements'>('ingredients');
  const [isMealAdded, setIsMealAdded] = useState(false);
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [vettedRecipe, setVettedRecipe] = useState<Recipe | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [modifiedRecipe, setModifiedRecipe] = useState<Recipe | null>(null);
  const [removedIngredientKeys, setRemovedIngredientKeys] = useState<Set<string>>(new Set());
  const [recommendedSupplements, setRecommendedSupplements] = useState<RecommendedSupplement[]>([]);
  const [hopAddedLabel, setHopAddedLabel] = useState<string | null>(null);

  const getSupplementDedupKey = useCallback((value: any) => {
    const nameRaw =
      (typeof value?.productName === 'string' && value.productName) ||
      (typeof value?.name === 'string' && value.name) ||
      '';
    const base = String(nameRaw || '').trim();
    const generic = base ? getGenericIngredientName(base) || base : '';
    return String(generic || '').trim().toLowerCase();
  }, []);

  const addedSupplementKeys = useMemo(() => {
    const baseRecipe: any = modifiedRecipe || vettedRecipe || recipe;
    const ingredients = Array.isArray(baseRecipe?.ingredients) ? baseRecipe.ingredients : [];
    const keys = new Set<string>();

    for (const ing of ingredients) {
      const id = typeof ing?.id === 'string' ? ing.id : '';
      if (!id || !id.startsWith('supplement-')) continue;
      const key = getSupplementDedupKey(ing);
      if (key) keys.add(key);
    }

    return keys;
  }, [getSupplementDedupKey, modifiedRecipe, recipe, vettedRecipe]);

  const visibleRecommendedSupplements = useMemo(() => {
    if (!Array.isArray(recommendedSupplements) || recommendedSupplements.length === 0) return [];
    if (!addedSupplementKeys || addedSupplementKeys.size === 0) return recommendedSupplements;
    return recommendedSupplements.filter((supplement) => {
      const key = getSupplementDedupKey(supplement);
      if (!key) return true;
      return !addedSupplementKeys.has(key);
    });
  }, [addedSupplementKeys, getSupplementDedupKey, recommendedSupplements]);

  type RecipeScoreSummary = {
    overallScore: number;
    compatibility: string;
    summaryReasoning: string;
    explainRecommendations: any[];
    nutritionalGaps: string[];
    supplementRecommendations: any[];
    breakdown: Record<string, { score: number; weightedContribution?: number; weight: number; reason?: string; recommendations?: any[] }>;
    warnings: string[];
    strengths: string[];
    recommendations: any[];
    usesFallbackNutrition: boolean;
  };

  type CachedCompatibilityScore = NonNullable<ReturnType<typeof readCachedCompatibilityScore>>;

  const normalizeCachedScoreToSummary = useCallback(
    (cached: CachedCompatibilityScore): RecipeScoreSummary => {
      return {
        overallScore: cached.overallScore,
        compatibility: typeof (cached as any)?.compatibility === 'string' ? (cached as any).compatibility : 'unknown',
        summaryReasoning: typeof (cached as any)?.summaryReasoning === 'string' ? (cached as any).summaryReasoning : '',
        explainRecommendations: [],
        nutritionalGaps: Array.isArray((cached as any)?.nutritionalGaps) ? (cached as any).nutritionalGaps : [],
        supplementRecommendations: Array.isArray((cached as any)?.supplementRecommendations)
          ? (cached as any).supplementRecommendations
          : [],
        breakdown: (cached as any)?.breakdown && typeof (cached as any).breakdown === 'object' ? (cached as any).breakdown : {},
        warnings: Array.isArray((cached as any)?.warnings) ? (cached as any).warnings : [],
        strengths: Array.isArray((cached as any)?.strengths) ? (cached as any).strengths : [],
        recommendations: [],
        usesFallbackNutrition: false,
      };
    },
    []
  );

  type EffectiveScore = ReturnType<typeof scoreWithSpeciesEngine> | RecipeScoreSummary;

  const [currentScore, setCurrentScore] = useState<EffectiveScore | null>(null);
  const [animatedScore, setAnimatedScore] = useState<number | null>(null);

  const userId = clerkUserId || '';

  const searchParams = useSearchParams();
  const queryPetId = searchParams?.get('petId') || '';

  const activePetId = selectedPetId || queryPetId;

  const hasLocalEdits = removedIngredientKeys.size > 0 || Boolean(modifiedRecipe);

  const activePet = useMemo(() => {
    if (!activePetId) return null;
    return pets.find((p) => p.id === activePetId) || null;
  }, [pets, activePetId]);

  const modalPet = useMemo(() => {
    const pet = pets.find((p) => p.id === activePetId);
    if (!pet) return null;

    const petType = normalizePetType(pet.type, 'recipe/[id].RecipeScoreModal');

    return {
      id: pet.id,
      name: Array.isArray(pet.names) && pet.names.length > 0 ? pet.names[0] : 'Pet',
      type: petType,
      breed: pet.breed,
      age: pet.age === 'baby' ? 0.5 : pet.age === 'young' ? 2 : pet.age === 'adult' ? 5 : 10,
      weight: parseFloat(pet.weight) || (petType === 'dog' ? 25 : petType === 'cat' ? 10 : 5),
      activityLevel: 'moderate' as const,
      healthConcerns: pet.healthConcerns || [],
      dietaryRestrictions: pet.allergies || [],
    };
  }, [pets, activePetId]);

  const portionPlan = useMemo(() => {
    if (!recipe || !activePet) return null;

    const petType = normalizePetType(activePet.type, 'recipe/[id].portionPlan');
    if (petType !== 'dog' && petType !== 'cat') return null;

    const weightKg = parseFloat(String(activePet.weight || '')) || 0;
    if (!Number.isFinite(weightKg) || weightKg <= 0) return null;

    const profile = {
      species: petType === 'dog' ? 'dogs' : 'cats',
      ageGroup: (activePet as any).age || 'adult',
      weightKg,
      breed: activePet.breed || null,
      healthConcerns: (activePet.healthConcerns || []).map(normalizeConcern),
      allergies: activePet.allergies || [],
      petName: getRandomName(activePet.names),
    };

    try {
      return getPortionPlan(recipe, profile as any);
    } catch {
      return null;
    }
  }, [recipe, activePet]);

  const recipeForScoring = useMemo(() => {
    const baseRecipe = modifiedRecipe || vettedRecipe || recipe;
    if (!baseRecipe) return null;

    const allIngredients = Array.isArray((baseRecipe as any).ingredients) ? (baseRecipe as any).ingredients : [];
    const filteredIngredients = allIngredients.filter((ing: any) => {
      const key = getIngredientKey(ing);
      if (!key) return true;
      return !removedIngredientKeys.has(key);
    });

    const scoringIngredients = filteredIngredients.map((ing: any) => {
      const id = typeof ing?.id === 'string' ? ing.id : '';
      if (!id.startsWith('supplement-')) return ing;

      const nameRaw =
        (typeof ing?.productName === 'string' && ing.productName) ||
        (typeof ing?.name === 'string' && ing.name) ||
        '';
      const genericKey = getGenericIngredientName(nameRaw) || nameRaw;
      const normalizedId = normalizeToScoringIngredientId(genericKey);

      if (!normalizedId) return ing;
      return {
        ...ing,
        id: normalizedId,
        ingredientId: normalizedId,
        category: 'supplement',
      };
    });

    return {
      ...baseRecipe,
      ingredients: scoringIngredients,
    } as any;
  }, [modifiedRecipe, recipe, removedIngredientKeys, vettedRecipe]);

  const localScoreForQueryPet = useMemo(() => {
    if (!recipeForScoring || !activePetId) return null;
    const pet = pets.find((p) => p.id === activePetId);
    if (!pet) return null;

    try {
      const petAge = pet.age === 'baby' ? 0.5 : pet.age === 'young' ? 2 : pet.age === 'adult' ? 5 : 10;
      const petType = normalizePetType(pet.type, 'recipe/[id].scoreForQueryPet');
      const scoringPet = {
        id: pet.id,
        name: getRandomName(pet.names),
        type: petType,
        breed: pet.breed,
        age: petAge,
        weight: parseFloat(pet.weight) || (petType === 'dog' ? 25 : petType === 'cat' ? 10 : 5),
        activityLevel: 'moderate' as const,
        healthConcerns: pet.healthConcerns || [],
        allergies: pet.allergies || [],
      } as any;

      const scored = scoreWithSpeciesEngine(recipeForScoring as any, scoringPet);

      // Check badges if score is 100% (Perfect Match)
      if (scored.overallScore === 100 && activePetId && userId) {
        checkAllBadges(userId, activePetId, {
          action: 'recipe_viewed',
          compatibilityScore: scored.overallScore,
        }).catch((err) => {
          console.error('Failed to check badges:', err);
        });
      }

      const summaryReasoning = scored.warnings.length > 0
        ? scored.warnings.slice(0, 3).join('. ')
        : scored.strengths.length > 0
        ? scored.strengths.slice(0, 3).join('. ')
        : 'Recipe evaluated for compatibility with your pet.';

      const breakdown = Object.entries(scored.raw.factors).reduce(
        (acc, [key, factor]) => {
          const f = factor as { score: number; weight: number; reasoning: string; issues: string[]; strengths: string[] };
          acc[key] = {
            score: f.score,
            weightedContribution: Math.round(f.score * (f.weight || 0)),
            weight: f.weight,
            reason: f.reasoning || (f.issues.length > 0 ? f.issues.join('; ') : f.strengths.join('; ')),
            recommendations: key === 'nutrition' ? scored.raw.detailedBreakdown.recommendations : undefined,
          };
          return acc;
        },
        {} as Record<string, { score: number; weightedContribution?: number; weight: number; reason?: string; recommendations?: any[] }>
      );

      return {
        overallScore: scored.overallScore,
        compatibility: scored.grade === 'A+' || scored.grade === 'A' ? 'excellent' :
                       scored.grade === 'B+' || scored.grade === 'B' ? 'good' :
                       scored.grade === 'C+' || scored.grade === 'C' ? 'fair' : 'poor',
        summaryReasoning: summaryReasoning,
        explainRecommendations: [],
        nutritionalGaps: scored.raw.detailedBreakdown?.nutritionalGaps || [],
        supplementRecommendations: scored.raw.detailedBreakdown?.recommendations || [],
        breakdown,
        warnings: scored.warnings,
        strengths: scored.strengths,
        recommendations: [],
        usesFallbackNutrition: scored.raw.detailedBreakdown?.nutritionalGaps?.includes('fallback-nutrition') || false,
      };
    } catch (error) {
      // Fallback to original scoring
      console.error('Error calculating compatibility:', error);
      return null;
    }
  }, [recipeForScoring, activePetId, pets, userId]);

  const cachedCardScoreForQueryPet = useMemo(() => {
    if (!userId || !recipeForScoring) return null;
    const recipeId = String((recipeForScoring as any)?.id || id || '');
    if (!recipeId) return null;

    // First try to read cache for the active pet
    if (activePetId) {
      const fromSession = readCachedCompatibilityScore({ userId, petId: activePetId, recipeId, ttlMs: 30 * 60 * 1000 });
      if (fromSession) return normalizeCachedScoreToSummary(fromSession); // normalize cached score into full summary shape
    }

    // Then try to read cache for the query pet (from URL)
    if (queryPetId && queryPetId !== activePetId) {
      const fromSession = readCachedCompatibilityScore({ userId, petId: queryPetId, recipeId, ttlMs: 30 * 60 * 1000 });
      if (fromSession) return normalizeCachedScoreToSummary(fromSession); // normalize cached score into full summary shape
    }

    return null;
  }, [activePetId, id, normalizeCachedScoreToSummary, queryPetId, recipeForScoring, userId]);

  const scoreForQueryPet = cachedCardScoreForQueryPet;

  // Calculate compatibility score if we don't have cached data
  useEffect(() => {
    if (!userId || !activePetId || !recipeForScoring || cachedCardScoreForQueryPet || pets.length === 0) {
      return; // Already have cached data or missing requirements
    }

    const calculateScore = async () => {
      try {
        const pet = pets.find(p => p.id === activePetId);
        if (!pet) return;

        const response = await fetch('/api/compatibility/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipe: recipeForScoring,
            pet: {
              id: pet.id,
              name: pet.name,
              type: pet.type,
              breed: pet.breed,
              age: pet.age,
              weightKg: pet.weightKg,
              activityLevel: pet.activityLevel,
              healthConcerns: pet.healthConcerns,
              dietaryRestrictions: pet.dietaryRestrictions,
              allergies: pet.allergies,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data?.score) {
            // Cache the result
            writeCachedCompatibilityScore({
              userId,
              petId: activePetId,
              recipeId: String((recipeForScoring as any)?.id || id || ''),
              overallScore: data.score.overallScore,
              breakdown: data.score.breakdown,
              warnings: data.score.warnings,
              strengths: data.score.strengths,
              nutritionalGaps: data.score.nutritionalGaps,
              supplementRecommendations: data.score.supplementRecommendations,
              compatibility: data.score.compatibility,
              summaryReasoning: data.score.summaryReasoning,
            });

            // Update local state
            setCurrentScore(data.score);
          }
        }
      } catch (error) {
        console.error('Error calculating compatibility score:', error);
      }
    };

    calculateScore();
  }, [userId, activePetId, recipeForScoring, cachedCardScoreForQueryPet, pets, id]);

  const lastAnimatedTargetRef = useRef<number | null>(null);

  // Score animation function
  const animateScoreChange = useCallback((from: number, to: number) => {
    const duration = 1500; // 1.5 seconds
    const steps = 60;
    const increment = (to - from) / steps;
    let current = from;
    let step = 0;

    const animate = () => {
      step++;
      current = from + increment * step;

      if (step < steps) {
        setAnimatedScore(Math.round(current));
        requestAnimationFrame(animate);
      } else {
        setAnimatedScore(to);
      }
    };

    void duration;
    animate();
  }, []);

  useEffect(() => {
    const nextScore = scoreForQueryPet?.overallScore;
    if (typeof nextScore !== 'number' || !Number.isFinite(nextScore)) {
      lastAnimatedTargetRef.current = null;
      setAnimatedScore(null);
      setCurrentScore(null);
      return;
    }

    if (lastAnimatedTargetRef.current === nextScore) {
      return;
    }

    const from = typeof animatedScore === 'number' && Number.isFinite(animatedScore) ? animatedScore : nextScore;
    lastAnimatedTargetRef.current = nextScore;
    animateScoreChange(from, nextScore);
    setCurrentScore(scoreForQueryPet);
  }, [animateScoreChange, animatedScore, scoreForQueryPet]);

  const effectiveScore: EffectiveScore | null = currentScore || scoreForQueryPet;

  const effectiveBreakdown = useMemo(() => {
    if (!effectiveScore) return {};

    // First try to use the cached breakdown from Sherlock Shells
    const cachedBreakdown = (effectiveScore as any)?.breakdown;
    if (cachedBreakdown && typeof cachedBreakdown === 'object') return cachedBreakdown;

    const explicit = (effectiveScore as any)?.breakdown;
    if (explicit && typeof explicit === 'object') return explicit;

    const rawFactors = (effectiveScore as any)?.raw?.factors;
    const detailed = (effectiveScore as any)?.raw?.detailedBreakdown;
    if (!rawFactors || typeof rawFactors !== 'object') return {};

    return Object.entries(rawFactors).reduce(
      (acc, [key, factor]) => {
        const f = factor as { score?: number; weight?: number; reasoning?: string; issues?: string[]; strengths?: string[] };
        const score = typeof f.score === 'number' && Number.isFinite(f.score) ? f.score : 0;
        const weight = typeof f.weight === 'number' && Number.isFinite(f.weight) ? f.weight : 0;
        const issues = Array.isArray(f.issues) ? f.issues : [];
        const strengths = Array.isArray(f.strengths) ? f.strengths : [];
        const reason = f.reasoning || (issues.length > 0 ? issues.join('; ') : strengths.join('; '));

        acc[key] = {
          score,
          weightedContribution: Math.round(score * weight),
          weight,
          reason,
          recommendations: key === 'nutrition' ? (detailed?.recommendations as any[] | undefined) : undefined,
        };

        return acc;
      },
      {} as Record<string, { score: number; weightedContribution?: number; weight: number; reason?: string; recommendations?: any[] }>
    );
  }, [effectiveScore]);
  const compatibilityScoreValue =
    typeof animatedScore === 'number'
      ? animatedScore
      : effectiveScore?.overallScore ?? null;

  useEffect(() => {
    if (!isLoaded) return;
    if (!id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Check if this is a custom meal (starts with "custom_")
    const isCustomMeal = id.startsWith('custom_');

    if (isCustomMeal && queryPetId) {
      // Load custom meal
      getCustomMeal(userId, queryPetId, id)
        .then((customMeal) => {
          if (customMeal) {
            const recipe = convertCustomMealToRecipe(customMeal);
            // Always vet the recipe ingredients to ensure all have purchase links
            const vetted = vetRecipeIngredients(recipe);
            setRecipe(vetted);
            setVettedRecipe(vetted);
          } else {
            setRecipe(null);
            setVettedRecipe(null);
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error loading custom meal:', error);
          setRecipe(null);
          setVettedRecipe(null);
          setIsLoading(false);
        });
    } else {
      // Try to load from session storage first (for dynamically generated recipes)
      let sessionRecipe = null;
      if (typeof window !== 'undefined') {
        const sessionData = sessionStorage.getItem(`recipe_${id}`);
        if (sessionData) {
          try {
            sessionRecipe = JSON.parse(sessionData);
          } catch (e) {
            console.warn('Failed to parse session recipe:', e);
          }
        }
      }

      if (sessionRecipe) {
        // Use recipe from session storage
        try {
          const vetted = vetRecipeIngredients(sessionRecipe);
          setRecipe(vetted);
          setVettedRecipe(vetted);
        } catch (error) {
          console.error('Error vetting session recipe:', error);
          // Set recipe without vetting to prevent crash
          setRecipe(sessionRecipe);
          setVettedRecipe(sessionRecipe);
        }
        setIsLoading(false);
      } else {
        // Load persisted generated recipe from Firestore (via API)
        fetch(`/api/recipes/generated/${encodeURIComponent(id)}`)
          .then(async (res) => {
            if (!res.ok) return null;
            const data = await res.json();
            return data?.recipe || null;
          })
          .then((foundRecipe) => {
            if (foundRecipe) {
              try {
                const vetted = vetRecipeIngredients(foundRecipe);
                setRecipe(vetted);
                setVettedRecipe(vetted);
              } catch (error) {
                console.error('Error vetting loaded recipe:', error);
                // Set recipe without vetting to prevent crash
                setRecipe(foundRecipe);
                setVettedRecipe(foundRecipe);
              }
            } else {
              setRecipe(null);
              setVettedRecipe(null);
            }
            setIsLoading(false);
          })
          .catch((error) => {
            console.error('Error loading generated recipe:', error);
            setRecipe(null);
            setVettedRecipe(null);
            setIsLoading(false);
          });
      }
    }
  }, [id, isLoaded, queryPetId, userId]); // Reload when ID, petId, or userId changes

  // Load pets & saved state
  useEffect(() => {
    if (!isLoaded) return;
    if (!userId || !id) return;

    getPersistedPets(userId)
      .then((loadedPets) => {
        const normalized: RecipeDetailPet[] = (Array.isArray(loadedPets) ? loadedPets : []).map(toRecipeDetailPet);
        setPets(normalized);
      })
      .catch((error) => {
        console.error('Failed to load pets:', error);
        setPets([]);
      });
  }, [isLoaded, userId, id]);

  useEffect(() => {
    // Auto-select pet from URL parameter if available
    if (queryPetId && pets.length > 0 && !selectedPetId) {
      setSelectedPetId(queryPetId);
    }
  }, [queryPetId, pets, selectedPetId]);

  // Add event listener for cross-component state synchronization
  useEffect(() => {
    const handlePetsUpdated = () => {
      if (userId) {
        getPersistedPets(userId)
          .then((loadedPets) => {
            const normalized: RecipeDetailPet[] = (Array.isArray(loadedPets) ? loadedPets : []).map(toRecipeDetailPet);
            setPets(normalized);
          })
          .catch(console.error);
      }
    };

    window.addEventListener('petsUpdated', handlePetsUpdated);
    return () => {
      window.removeEventListener('petsUpdated', handlePetsUpdated);
    };
  }, [userId]);

  useEffect(() => {
    // Check if meal is already added for the current pet (saved only)
    const currentPet = selectedPetId ? pets.find(p => p.id === selectedPetId) : (queryPetId ? pets.find(p => p.id === queryPetId) : null);
    if (currentPet && recipe) {
      const inSavedRecipes = currentPet.savedRecipes?.includes(recipe.id) || false;
      setIsMealAdded(inSavedRecipes);
    } else {
      setIsMealAdded(false);
    }
  }, [selectedPetId, queryPetId, pets, recipe]);

    useEffect(() => {
    const currentPetId = selectedPetId || queryPetId;
    if (!currentPetId || !recipe) {
      setPetWeight('');
      setPetAllergies('');
      setModifierResult(null);
      setModifierError(null);
      setIsMealAdded(false);
      // DON'T set vettedRecipe to null - keep the vetted recipe so ingredients show properly
      // setVettedRecipe(null); // REMOVED - this was causing ingredients to disappear
      return;
    }

    const pet = pets.find((p) => p.id === currentPetId);
    if (!pet) {
      setIsMealAdded(false);
      return;
    }
    setPetWeight(pet.weight || '');
    setPetAllergies(pet.allergies?.join(', ') || '');
    setModifierResult(null);
    setModifierError(null);
    const inSavedRecipes = pet.savedRecipes?.includes(recipe.id) || false;
    setIsMealAdded(inSavedRecipes);

    // Apply modifiers, then vet all ingredients to ensure purchase links
    const { modifiedRecipe } = applyModifiers(recipe, pet);
    const vetted = vetRecipeIngredients(modifiedRecipe);
    setVettedRecipe(vetted);
  }, [selectedPetId, queryPetId, pets, recipe]);

  const handleRemoveIngredient = useCallback((ingredientId: string) => {
    const key = String(ingredientId || '').trim();
    if (!key) return;
    setRemovedIngredientKeys((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, []);

  const handleResetLocalEdits = useCallback(() => {
    setRemovedIngredientKeys(new Set());
    setModifiedRecipe(null);
  }, []);

  // Function to add supplement to recipe
  const handleAddSupplement = useCallback((supplement: RecommendedSupplement) => {

    const baseRecipe: any = modifiedRecipe || vettedRecipe || recipe;
    if (!baseRecipe) return;

    const newRecipe = JSON.parse(JSON.stringify(baseRecipe));
    if (!Array.isArray(newRecipe.ingredients)) newRecipe.ingredients = [];

    const supplementKey = getSupplementDedupKey(supplement);
    if (supplementKey) {
      const alreadyAdded = newRecipe.ingredients.some((ing: any) => {
        const ingId = typeof ing?.id === 'string' ? ing.id : '';
        if (!ingId.startsWith('supplement-')) return false;
        return getSupplementDedupKey(ing) === supplementKey;
      });

      if (alreadyAdded) {
        setMessage('That supplement is already added.');
        setTimeout(() => setMessage(null), 2500);
        setActiveTab('ingredients');
        return;
      }
    }

    const searchUrl = ensureSellerId(
      buildAmazonSearchUrl(supplement.productName || supplement.name || 'pet supplement')
    );

    const ingredientToAdd: any = {
      id: `supplement-${Date.now()}`,
      name: supplement.name,
      productName: supplement.productName || supplement.name,
      amount: supplement.defaultAmount,
      notes: supplement.benefits,
      category: 'supplement',
      amazonSearchUrl: searchUrl,
    };

    newRecipe.ingredients.unshift(ingredientToAdd);
    const vettedAdded = vetRecipeIngredients(newRecipe);
    setModifiedRecipe(vettedAdded);
    setActiveTab('ingredients');
    setHopAddedLabel(ingredientToAdd.name);
    setTimeout(() => setHopAddedLabel(null), 700);
    try {
      ingredientsTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch {
      // ignore
    }

  }, [getSupplementDedupKey, modifiedRecipe, vettedRecipe, recipe]);

  const handleAddBuiltInSupplement = useCallback(
    (supplementItem: any) => {
      const baseRecipe: any = modifiedRecipe || vettedRecipe || recipe;
      if (!baseRecipe) return;

      const targetId = typeof supplementItem?.id === 'string' ? supplementItem.id : '';
      const targetName = typeof supplementItem?.name === 'string' ? supplementItem.name : '';

      const searchUrl = ensureSellerId(
        buildAmazonSearchUrl(targetName || 'pet supplement')
      );

      const newRecipe = JSON.parse(JSON.stringify(baseRecipe));
      const nextId = `supplement-${Date.now()}`;

      const builtInKey = getSupplementDedupKey({
        name: targetName,
        productName: supplementItem?.productName,
      });
      if (builtInKey) {
        const alreadyAdded = Array.isArray(newRecipe.ingredients)
          ? newRecipe.ingredients.some((ing: any) => {
              const ingId = typeof ing?.id === 'string' ? ing.id : '';
              if (!ingId.startsWith('supplement-')) return false;
              return getSupplementDedupKey(ing) === builtInKey;
            })
          : false;

        if (alreadyAdded) {
          setMessage('That supplement is already added.');
          setTimeout(() => setMessage(null), 2500);
          setActiveTab('ingredients');
          return;
        }
      }

      let promoted = false;
      if (Array.isArray(newRecipe.ingredients)) {
        newRecipe.ingredients = newRecipe.ingredients.map((ing: any) => {
          const ingId = typeof ing?.id === 'string' ? ing.id : '';
          const ingName = typeof ing?.name === 'string' ? ing.name : '';
          const shouldPromote = (targetId && ingId === targetId) || (!targetId && targetName && ingName === targetName);
          if (!shouldPromote) return ing;
          promoted = true;
          return {
            ...ing,
            id: nextId,
          };
        });
      }

      if (!promoted) {
        const ingredientToAdd: any = {
          id: nextId,
          name: targetName || 'Supplement',
          amount: supplementItem?.amount || '',
          category: 'supplement',
          amazonSearchUrl: supplementItem?.amazonSearchUrl || searchUrl,
        };
        if (!Array.isArray(newRecipe.ingredients)) newRecipe.ingredients = [];
        newRecipe.ingredients.unshift(ingredientToAdd);
      }

      const vettedAdded = vetRecipeIngredients(newRecipe);
      setModifiedRecipe(vettedAdded);
      setActiveTab('ingredients');
      setHopAddedLabel(targetName || 'Supplement');
      setTimeout(() => setHopAddedLabel(null), 700);
      try {
        ingredientsTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch {
        // ignore
      }
    },
    [getSupplementDedupKey, modifiedRecipe, vettedRecipe, recipe]
  );

  useEffect(() => {
    if (!activePet || !effectiveScore) {
      setRecommendedSupplements([]);
      return;
    }

    const petType = normalizePetType(activePet.type, 'recipe/[id].supplementRecommendations');
    const overallScoreRaw = effectiveScore?.overallScore;
    const overallScore = typeof overallScoreRaw === 'number' && Number.isFinite(overallScoreRaw) ? overallScoreRaw : null;

    if (overallScore == null || overallScore >= 85) {
      setRecommendedSupplements([]);
      return;
    }

    const gaps = Array.isArray((effectiveScore as any)?.nutritionalGaps)
      ? ((effectiveScore as any).nutritionalGaps as string[])
      : [];
    const healthConcerns = Array.isArray((activePet as any)?.healthConcerns) ? ((activePet as any).healthConcerns as string[]) : [];

    const recs = getRecommendationsForRecipe(gaps, petType, healthConcerns).filter((r) => !r.isIngredient);
    setRecommendedSupplements(recs);
  }, [activePet, effectiveScore]);

  const handleAddToMealPlan = useCallback(async () => {
    if (!recipe || !userId) {
      setMessage('Please select a pet.');
      setTimeout(() => setMessage(null), 2500);
      return;
    }

    const currentPetId = selectedPetId || queryPetId;
    if (!currentPetId) {
      setMessage('Please select a pet.');
      setTimeout(() => setMessage(null), 2500);
      return;
    }

    const currentPet = pets.find(p => p.id === currentPetId);
    if (!currentPet) {
      setMessage('Pet not found.');
      setTimeout(() => setMessage(null), 2500);
      return;
    }

    // Check if already saved
    if (currentPet.savedRecipes?.includes(recipe.id)) {
      setIsMealAdded(true);
      return;
    }

    try {
      const recipeToSnapshot: any = modifiedRecipe || vettedRecipe || recipe;
      saveRecipeSnapshotForPet(userId, currentPetId, recipeToSnapshot);
    } catch {
      // ignore
    }

    setIsAddingMeal(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const updatedPets = pets.map((pet) => {
        if (pet.id !== currentPetId) return pet;
        const nextSavedRecipes = Array.isArray(pet.savedRecipes) ? [...pet.savedRecipes] : [];
        if (!nextSavedRecipes.includes(recipe.id)) nextSavedRecipes.push(recipe.id);
        return { ...pet, savedRecipes: nextSavedRecipes };
      });

      const updatedPet = updatedPets.find((p) => p.id === currentPetId) || null;
      if (updatedPet) {
        await savePersistedPet(userId, updatedPet as any);
        setIsMealAdded(true);
        window.dispatchEvent(new CustomEvent('petsUpdated', { detail: { userId, petId: currentPetId } }));
      }

      setPets(updatedPets);
    } catch (err: any) {
      let friendly = 'Unable to save this meal.';
      const raw = err instanceof Error ? err.message : String(err);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object' && typeof parsed.message === 'string') {
            friendly = parsed.message;
          } else {
            friendly = raw;
          }
        } catch {
          friendly = raw;
        }
      }
      setMessage(friendly);
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setIsAddingMeal(false);
    }
  }, [recipe, selectedPetId, queryPetId, pets, userId]);

  const handlePersonalizeRecipe = async () => {
    if (!recipe) return;

    const currentPet = selectedPetId ? pets.find(p => p.id === selectedPetId) : (queryPetId ? pets.find(p => p.id === queryPetId) : null);
    if (!currentPet) {
      setModifierError('Select a pet profile first.');
      return;
    }

    const parsedWeight = parseFloat(String(petWeight));
    if (!parsedWeight || parsedWeight <= 0) {
      setModifierError('Enter a valid weight in kilograms.');
      return;
    }

    setIsPersonalizing(true);
    setModifierError(null);

    const healthConcerns = (currentPet.healthConcerns || [])
      .filter((concern) => concern && concern !== 'none')
      .map(normalizeConcern);

    const allergiesArray = petAllergies
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            species: currentPet.type,
            ageGroup: currentPet.age,
            breed: currentPet.breed,
            weightKg: parsedWeight,
            healthConcerns,
            allergies: allergiesArray,
          },
          recipeIds: [recipe.id],
          limit: 1,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to personalize recipe.');
      }

      const data = await response.json();
      const result = data.results?.[0] || null;
      setModifierResult(result);
      if (!result) {
        setModifierError('No modifier rules matched for this profile.');
      }
    } catch (error) {
      // Error handled by error state
      setModifierError('Unable to personalize this meal right now.');
      setModifierResult(null);
    } finally {
      setIsPersonalizing(false);
    }
  };

  // Calculate all shopping items and meal estimate for sidebar (MUST be before early returns)
  const {
    ingredientShoppingItems,
    supplementShoppingItems,
    allShoppingItems,
    pricingIngredients,
    mealEstimate,
  } = useMemo(() => {
    const baseRecipe = modifiedRecipe || vettedRecipe || recipe;
    if (!baseRecipe) {
      return {
        ingredientShoppingItems: [],
        supplementShoppingItems: [],
        allShoppingItems: [],
        pricingIngredients: [],
        mealEstimate: null,
      };
    }

    const allIngredients = Array.isArray((baseRecipe as any).ingredients) ? (baseRecipe as any).ingredients : [];
    const filteredIngredients = allIngredients.filter((ing: any) => {
      const key = getIngredientKey(ing);
      if (!key) return true;
      return !removedIngredientKeys.has(key);
    });

    const supplementCategories = new Set(['Supplement']);

    const ingredientsEnrichedWithLinks = filteredIngredients.map((ing: any) => {
      const existingLink = ing?.asinLink || ing?.amazonLink;
      const rawName = typeof ing?.name === 'string' ? ing.name : '';

      const genericKey = getGenericIngredientName((ing as any)?.productName || rawName);
      const displayName = genericKey ? formatIngredientNameForDisplay(genericKey) : rawName;

      const product = genericKey ? getVettedProduct(genericKey, (baseRecipe as any)?.category) : undefined;
      const productLink = product?.asinLink || product?.purchaseLink;
      const enrichedLink = productLink
        ? ensureSellerId(productLink)
        : existingLink
          ? ensureSellerId(existingLink)
          : undefined;

      const productCategory = typeof product?.category === 'string' ? product.category : undefined;

      return {
        ...ing,
        name: displayName,
        ...(product?.productName ? { productName: (ing as any)?.productName || product.productName } : {}),
        ...(enrichedLink ? { amazonLink: enrichedLink, asinLink: enrichedLink } : {}),
        amazonSearchUrl: ensureSellerId(buildAmazonSearchUrl(displayName || rawName || 'ingredient')),
        __productCategory: productCategory,
      };
    });

    const isSupplementLike = (ing: any) => {
      const id = typeof ing?.id === 'string' ? ing.id : getIngredientKey(ing);
      if (id.startsWith('supplement-')) {
        return true;
      }
      const cat = typeof ing?.__productCategory === 'string' ? ing.__productCategory : '';
      return supplementCategories.has(cat);
    };

    const ingredientCandidates = ingredientsEnrichedWithLinks;
    const supplementCandidates = ingredientsEnrichedWithLinks.filter((ing: any) => isSupplementLike(ing));
    const pricingCandidates = ingredientsEnrichedWithLinks.filter((ing: any) => !isSupplementLike(ing));
    const estimateCandidates = pricingCandidates;

    const ingredientItems = ingredientCandidates.map((ing: any, index: number) => ({
      id: getIngredientKey(ing) || `ingredient-${index}`,
      name: ing.name,
      amount: ing.amount || '',
      asinLink: ing.asinLink || ing.amazonLink ? ensureSellerId(ing.asinLink || ing.amazonLink) : undefined,
      amazonSearchUrl:
        ing.amazonSearchUrl ||
        ensureSellerId(buildAmazonSearchUrl(typeof ing?.name === 'string' ? ing.name : 'ingredient')),
    }));

    const estimateItems = estimateCandidates.map((ing: any, index: number) => ({
      id: getIngredientKey(ing) || `estimate-${index}`,
      name: ing.name,
      amount: ing.amount || '',
      asinLink: ing.asinLink || ing.amazonLink ? ensureSellerId(ing.asinLink || ing.amazonLink) : undefined,
      amazonSearchUrl:
        ing.amazonSearchUrl ||
        ensureSellerId(buildAmazonSearchUrl(typeof ing?.name === 'string' ? ing.name : 'ingredient')),
    }));

    const supplementItems = supplementCandidates.map((ing: any, index: number) => ({
      id: getIngredientKey(ing) || `supplement-${index}`,
      name: ing.name,
      amount: ing.amount || '',
      asinLink: ing.asinLink || ing.amazonLink ? ensureSellerId(ing.asinLink || ing.amazonLink) : undefined,
      amazonSearchUrl:
        ing.amazonSearchUrl ||
        ensureSellerId(buildAmazonSearchUrl(typeof ing?.name === 'string' ? ing.name : 'supplement')),
    }));

    const shoppingItems = ingredientItems;

    let estimate = null;
    if (estimateItems.length > 0) {
      try {
        const shoppingListItems = estimateItems.map((item: any) => {
          const itemName = typeof item?.name === 'string' ? item.name : '';
          const genericName = itemName ? getGenericIngredientName(itemName) || itemName.toLowerCase() : '';
          const vettedProduct = genericName ? getVettedProduct(genericName, (baseRecipe as any)?.category) : undefined;

          return {
            id: item.id,
            name: itemName,
            amount: item.amount,
            category: vettedProduct?.category || 'other',
          };
        });

        const servingsRaw = (baseRecipe as any)?.servings;
        const servingsParsed =
          typeof servingsRaw === 'number'
            ? servingsRaw
            : typeof servingsRaw === 'string'
              ? parseFloat(servingsRaw)
              : NaN;
        const recipeServings = Number.isFinite(servingsParsed) && servingsParsed > 0 ? servingsParsed : 1;

        const rawEstimate = calculateMealsFromGroceryList(
          shoppingListItems,
          undefined,
          (baseRecipe as any)?.category,
          true,
          recipeServings
        );

        if (rawEstimate) {
          const roundedTotalCost = Math.round((rawEstimate.totalCost ?? 0) * 100) / 100;
          const roundedCostPerMeal = Math.round((rawEstimate.costPerMeal ?? 0) * 100) / 100;

          estimate = {
            ...rawEstimate,
            totalCost: roundedTotalCost,
            costPerMeal: roundedCostPerMeal,
          };
        } else {
          estimate = null;
        }
      } catch {
        estimate = null;
      }
    }

    return {
      ingredientShoppingItems: ingredientItems,
      supplementShoppingItems: supplementItems,
      allShoppingItems: shoppingItems,
      pricingIngredients: pricingCandidates.map((ing: any, index: number) => ({
        id: getIngredientKey(ing) || `pricing-${index}`,
        name: ing.name,
        amount: ing.amount || '',
        category: typeof ing?.__productCategory === 'string' ? ing.__productCategory : undefined,
      })),
      mealEstimate: estimate,
    };
  }, [vettedRecipe, recipe, modifiedRecipe, removedIngredientKeys]);

  const availableSupplementShoppingItems = useMemo(() => {
    if (!Array.isArray(supplementShoppingItems) || supplementShoppingItems.length === 0) return [];
    return supplementShoppingItems.filter((item: any) => {
      const id = typeof item?.id === 'string' ? item.id : '';
      return !id.startsWith('supplement-');
    });
  }, [supplementShoppingItems]);

  const supplementTotalCost = useMemo(() => {
    if (!Array.isArray(supplementShoppingItems) || supplementShoppingItems.length === 0) return 0;

    return supplementShoppingItems.reduce((sum, item: any) => {
      const rawName = typeof item?.name === 'string' ? item.name : '';
      if (!rawName) return sum;

      const lookupName = getGenericIngredientName(rawName) || rawName;
      const pricing = getIngredientDisplayPricing(lookupName);
      const packageEstimate = getPackageSize(lookupName);

      const estimatedPrice = Number(packageEstimate?.estimatedCost) || 0;
      const isEstimatedPrice =
        pricing?.priceSource === 'none' ||
        pricing?.priceSource === 'package' ||
        !(pricing?.packagePrice && pricing.packagePrice > 0);
      const bestPackagePrice = isEstimatedPrice ? estimatedPrice : (pricing.packagePrice as number);

      return sum + (Number.isFinite(bestPackagePrice) ? bestPackagePrice : 0);
    }, 0);
  }, [supplementShoppingItems]);

  const costComparisonEstimate = useMemo(() => {
    if (!mealEstimate || mealEstimate.estimatedMeals <= 0) return null;
    const totalCost = mealEstimate.totalCost || 0;
    const estimatedMeals = mealEstimate.estimatedMeals;
    const costPerMeal = estimatedMeals > 0 ? totalCost / estimatedMeals : 0;

    if (!Number.isFinite(costPerMeal) || costPerMeal <= 0) return null;

    return {
      costPerMeal,
      totalCost,
      estimatedMeals,
      exceedsBudget: mealEstimate.exceedsBudget || false,
    };
  }, [mealEstimate, supplementTotalCost]);

  const costComparisonCacheKey = useMemo(() => {
    const recipeId = String((recipe as any)?.id || id || '');
    if (!recipeId) return null;
    const petId = String(activePetId || 'none');
    return `pet:${petId}:recipe:${recipeId}`;
  }, [activePetId, id, recipe]);

  const shouldPersistCostComparisonCache = true;

  const costComparisonStorageKey = useMemo(() => {
    if (!costComparisonCacheKey) return null;
    return `costComparison:${costComparisonCacheKey}`;
  }, [costComparisonCacheKey]);

  const originalCostComparisonCacheRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!costComparisonStorageKey) return;

    if (!shouldPersistCostComparisonCache) {
      try {
        originalCostComparisonCacheRef.current = window.sessionStorage.getItem(costComparisonStorageKey);
      } catch {
        originalCostComparisonCacheRef.current = null;
      }

      return () => {
        try {
          const raw = originalCostComparisonCacheRef.current;
          if (raw == null) {
            window.sessionStorage.removeItem(costComparisonStorageKey);
          } else {
            window.sessionStorage.setItem(costComparisonStorageKey, raw);
          }
        } catch {
          // ignore
        }
      };
    }
  }, [costComparisonStorageKey]);

  const recipeForPricing = useMemo(() => {
    const baseRecipe = modifiedRecipe || vettedRecipe || recipe;
    if (!baseRecipe) return null;

    const servingsRaw = (baseRecipe as any)?.servings;
    const servingsParsed =
      typeof servingsRaw === 'number'
        ? servingsRaw
        : typeof servingsRaw === 'string'
          ? parseFloat(servingsRaw)
          : NaN;
    const servings = Number.isFinite(servingsParsed) && servingsParsed > 0 ? servingsParsed : 1;

    return {
      ...baseRecipe,
      ingredients: pricingIngredients,
      servings,
    } as any;
  }, [modifiedRecipe, pricingIngredients, recipe, vettedRecipe]);

  const { pricingByRecipeId: apiPricingById } = useRecipePricing(recipeForPricing ? [recipeForPricing as any] : null);
  const apiPricing = recipeForPricing ? apiPricingById?.[String((recipeForPricing as any)?.id || '')] : null;
  const apiCostPerMeal = apiPricing?.costPerMealUsd ?? null;
  const canonicalCostPerMeal =
    typeof apiCostPerMeal === 'number' && Number.isFinite(apiCostPerMeal) && apiCostPerMeal > 0 ? apiCostPerMeal : null;

  const shouldUsePackageEstimateForCostComparison = true;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold text-gray-400 bg-background">
        Loading meal...
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-background">
        <h1 className="text-3xl font-bold text-red-500">Meal not found</h1>
        <p className="text-gray-400">We couldn't find a meal for this link.</p>
        <Link
          href="/profile"
          className="text-secondary-400 font-semibold hover:text-secondary-300"
        >
          Go to My Pets
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Message Toast */}
      {message && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {message}
        </div>
      )}

      <div className="min-h-screen bg-background py-[24px] font-sans text-foreground">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <Link
            href="/profile"
            className="inline-flex items-center text-gray-400 hover:text-primary-400 mb-6 font-medium transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to My Pets
          </Link>

          {/* Pet Selector - only show if no pet is selected */}
          {!activePet && pets.length > 0 && (
            <div className="bg-surface rounded-2xl shadow-lg p-6 mb-8 border border-surface-highlight">
              <h2 className="text-xl font-bold text-foreground mb-4">Select a Pet for Compatibility Analysis</h2>
              <p className="text-gray-600 mb-4">Choose a pet to see detailed health analysis and compatibility scores for this recipe.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pets.map((pet) => (
                  <button
                    key={pet.id}
                    onClick={() => setSelectedPetId(pet.id)}
                    className="bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-lg p-4 text-left transition-colors"
                  >
                    <div className="font-semibold text-primary-800">{pet.name}</div>
                    <div className="text-sm text-primary-600 capitalize">{pet.type}{pet.breed ? ` • ${pet.breed}` : ''}</div>
                    <div className="text-xs text-primary-500 mt-1">{pet.age} years old</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Full-width title card with compatibility score + Save Meal */}
          <div className="bg-surface rounded-2xl shadow-xl overflow-hidden mb-8 border border-surface-highlight">
            <div className="px-8 py-4 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
              <div className="min-w-0 lg:pr-[260px] mt-[35px]">
                <h1 className="text-4xl font-extrabold text-foreground mb-6 tracking-tight leading-tight break-words">
                  <div className="flex items-center justify-center gap-3 flex-wrap break-words">
                    <AlphabetText text={recipe.name} size={53} />
                  </div>
                </h1>

                {activePet ? (
                  <div className="ml-5 mt-[15px]">
                    <CustomMadeForLine petName={getRandomName(activePet.names)} />
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  {recipe.tags?.filter((tag) => tag !== 'Generated').map((tag) => (
                    <span
                      key={tag}
                      className="bg-surface-highlight text-gray-300 px-3 py-1 rounded-full text-sm font-medium border border-surface-highlight"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {effectiveScore && activePet && (
                <PetCompatibilityBlock
                  avatarSrc={getProfilePictureForPetType(activePet.type)}
                  avatarAlt={`${getRandomName(activePet.names)} profile`}
                  spacerClassName="w-16 shrink-0 bg-surface"
                  right={
                    <button
                      type="button"
                      onClick={() => {
                        if (userId && activePetId) {
                          checkAllBadges(userId, activePetId, { action: 'score_details_viewed' }).catch(() => {
                            // ignore
                          });
                        }
                        setIsScoreModalOpen(true);
                      }}
                      className="group w-full rounded-2xl border-2 border-orange-500/40 px-[14px] pt-5 pb-[25px] shadow-md hover:border-orange-400/80 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-200 ease-out cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background group-hover:shadow-orange-500/40 group-hover:ring-2 group-hover:ring-orange-400/80 group-hover:ring-offset-2 group-hover:ring-offset-background"
                      style={{ background: 'linear-gradient(to bottom, rgb(10, 30, 20), rgb(15, 35, 25))' }}
                    >
                      <div className="flex items-center justify-center relative">
                        <div className="relative">
                          <CompatibilityRadial
                            score={compatibilityScoreValue ?? effectiveScore.overallScore}
                            size={118}
                            strokeWidth={10}
                            label=""
                          />
                          <div className="absolute bottom-[-23px] left-1/2 transform -translate-x-1/2 inline-flex items-center px-2 py-1 text-xs font-bold text-orange-200 bg-orange-500/20 border border-orange-400/50 rounded-full animate-pulse whitespace-nowrap">
                            Tap for details!
                          </div>
                        </div>
                      </div>
                    </button>
                  }
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <main className="lg:col-span-3">
            {/* Ingredients & Supplements Tabs */}
            <div className="bg-surface rounded-2xl shadow-lg p-8 mb-8 border border-surface-highlight">
              <h3 className="text-xl font-bold text-foreground mb-4 border-b border-surface-highlight pb-3 flex items-center justify-center">
                <Image
                  src={ShoppingListBanner}
                  alt="Shopping List"
                  className="h-auto w-full max-w-md border-[2px] border-orange-500/60 rounded-lg"
                />
              </h3>
              {/* Tab Navigation */}
              <div className="flex border-b border-surface-highlight mb-6">
                <button
                  onClick={() => setActiveTab('ingredients')}
                  className={`group px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
                    activeTab === 'ingredients'
                      ? 'border-orange-500 text-orange-400'
                      : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <span className="sr-only">Ingredients</span>
                  <Image
                    src={IngredientsTabImage}
                    alt="Ingredients"
                    className={`h-8 w-auto ${activeTab === 'ingredients' ? '' : 'opacity-70 group-hover:opacity-100'}`}
                    unoptimized
                  />
                </button>
                <button
                  onClick={() => setActiveTab('supplements')}
                  className={`group px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
                    activeTab === 'supplements'
                      ? 'border-orange-500 text-orange-400'
                      : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <span className="sr-only">Supplements</span>
                  <Image
                    src={SupplementsTabImage}
                    alt="Supplements"
                    className={`h-8 w-auto ${activeTab === 'supplements' ? '' : 'opacity-70 group-hover:opacity-100'}`}
                    unoptimized
                  />
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'ingredients' && (
                <div className="relative space-y-6">
                  <div ref={ingredientsTopRef} />
                  {hasLocalEdits ? (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={handleResetLocalEdits}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold bg-surface-highlight text-gray-200 border border-surface-highlight hover:border-orange-500/60 hover:text-orange-200 transition-colors"
                      >
                        Reset changes
                      </button>
                    </div>
                  ) : null}
                  {hopAddedLabel && (
                    <div className="pointer-events-none relative">
                      <div className="hop-toast">
                        <span className="hop-pill">+ {hopAddedLabel} added</span>
                      </div>
                      <style jsx>{`
                        @keyframes hopIn {
                          0% { transform: translateY(16px) scale(0.96); opacity: 0; }
                          35% { transform: translateY(-10px) scale(1.02); opacity: 1; }
                          65% { transform: translateY(2px) scale(1); opacity: 1; }
                          100% { transform: translateY(0) scale(1); opacity: 0; }
                        }
                        .hop-toast {
                          position: sticky;
                          top: 0;
                          z-index: 10;
                          display: flex;
                          justify-content: flex-start;
                        }
                        .hop-pill {
                          animation: hopIn 700ms ease-out forwards;
                          display: inline-flex;
                          align-items: center;
                          gap: 8px;
                          padding: 8px 12px;
                          border-radius: 9999px;
                          border: 1px solid rgba(249, 115, 22, 0.35);
                          background: rgba(249, 115, 22, 0.14);
                          color: rgb(253, 186, 116);
                          font-weight: 700;
                          font-size: 12px;
                          box-shadow: 0 10px 25px rgba(0,0,0,0.25);
                        }
                      `}</style>
                    </div>
                  )}

                  {ingredientShoppingItems.length > 0 ? (
                    <>
                      <ShoppingList
                        ingredients={ingredientShoppingItems}
                        recipeName={recipe.name}
                        userId={userId}
                        showHeader={false}
                        onRemoveIngredient={handleRemoveIngredient}
                      />
                    </>
                  ) : (
                    <div className="text-center py-12 text-gray-400 border border-dashed border-surface-highlight rounded-xl">
                      No ingredients available for this recipe.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'supplements' && (
                <div className="space-y-4">
                  {availableSupplementShoppingItems.length > 0 ? (
                    <div className="space-y-4">
                      {availableSupplementShoppingItems.map((supplementItem: any) => {
                        return (
                          <div
                            key={supplementItem.id || supplementItem.name}
                            className="rounded-xl border border-surface-highlight bg-surface-lighter p-5"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                              <div className="min-w-0">
                                <div className="text-lg font-bold text-gray-100">{supplementItem.name}</div>
                                {supplementItem.amount ? (
                                  <div className="mt-2 text-xs text-gray-400">Suggested: {supplementItem.amount}</div>
                                ) : null}
                              </div>
                              <div className="flex flex-col gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleAddBuiltInSupplement(supplementItem)}
                                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold bg-green-800 text-white border border-green-900 hover:bg-green-900 transition-colors"
                                >
                                  Add to meal
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}

                  {visibleRecommendedSupplements.length > 0 ? (
                    <div className="space-y-4">
                      {visibleRecommendedSupplements.map((supplement) => {
                        return (
                          <div
                            key={`${supplement.name}-${supplement.addressesDeficiency}`}
                            className="rounded-xl border border-surface-highlight bg-surface-lighter p-5"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                              <div className="min-w-0">
                                <div className="text-lg font-bold text-gray-100">{supplement.name}</div>
                                <div className="mt-1 text-sm text-gray-300">{supplement.benefits}</div>
                                {supplement.defaultAmount ? (
                                  <div className="mt-2 text-xs text-gray-400">Suggested: {supplement.defaultAmount}</div>
                                ) : null}
                              </div>
                              <div className="flex flex-col gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleAddSupplement(supplement)}
                                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold bg-green-800 text-white border border-green-900 hover:bg-green-900 transition-colors"
                                >
                                  Add to meal
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : availableSupplementShoppingItems.length === 0 ? (
                    <div className="py-10 flex justify-center">
                      <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-900/40 text-green-200 border border-green-700/50 text-sm font-semibold">
                        Meal is Complete!
                      </span>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Cost Comparison */}
            {allShoppingItems.length > 0 &&
              (canonicalCostPerMeal || (costComparisonEstimate && costComparisonEstimate.costPerMeal > 0)) && (
                <div className="bg-surface rounded-2xl shadow-lg p-6 mb-8 border border-surface-highlight">
                  <div className="mb-4 flex justify-center">
                    <Image
                      src={CostComparisonBanner}
                      alt="Cost comparison"
                      className="h-auto w-full max-w-md border border-surface-highlight rounded-lg"
                      unoptimized
                    />
                  </div>
                  {shouldUsePackageEstimateForCostComparison && costComparisonEstimate ? (
                    <CostComparison
                      costPerMeal={costComparisonEstimate.costPerMeal}
                      totalCost={costComparisonEstimate.totalCost}
                      estimatedMeals={costComparisonEstimate.estimatedMeals}
                      exceedsBudget={costComparisonEstimate.exceedsBudget}
                      cacheKey={shouldPersistCostComparisonCache ? (costComparisonCacheKey || undefined) : undefined}
                    />
                  ) : canonicalCostPerMeal ? (
                    <CostComparison
                      costPerMeal={canonicalCostPerMeal}
                      totalCost={costComparisonEstimate?.totalCost}
                      estimatedMeals={costComparisonEstimate?.estimatedMeals}
                      pricingSource={apiPricing?.pricingSource}
                      asOf={apiPricing?.asOf}
                      missingIngredientCount={
                        Array.isArray(apiPricing?.missingIngredientKeys) ? apiPricing?.missingIngredientKeys.length : 0
                      }
                      isComplete={apiPricing?.isComplete}
                      cacheKey={shouldPersistCostComparisonCache ? (costComparisonCacheKey || undefined) : undefined}
                    />
                  ) : costComparisonEstimate ? (
                    <CostComparison
                      costPerMeal={costComparisonEstimate.costPerMeal}
                      totalCost={costComparisonEstimate.totalCost}
                      estimatedMeals={costComparisonEstimate.estimatedMeals}
                      exceedsBudget={costComparisonEstimate.exceedsBudget}
                      cacheKey={shouldPersistCostComparisonCache ? (costComparisonCacheKey || undefined) : undefined}
                    />
                  ) : null}
                </div>
              )}
          </main>

          <aside className="lg:col-span-2 space-y-8">


            {/* Health Breakdown Panel */}
            {effectiveScore && (
              <div className="bg-surface rounded-2xl shadow-lg p-6 border-l-4 border-green-500 border border-surface-highlight">
                <div className="mb-4 flex justify-center">
                  <Image
                    src={HealthAnalysisBanner}
                    alt="Health analysis"
                    className="h-auto w-full max-w-xs border border-surface-highlight rounded-lg"
                    unoptimized
                  />
                </div>
                <span className="sr-only">Health Analysis</span>
                <div className="mb-4 flex justify-center">
                  <Image
                    src="/images/emojis/Mascots/Proffessor Purfessor/PUrfessorDesk.jpg"
                    alt="Professor Purfessor"
                    width={280}
                    height={210}
                    className="rounded-lg object-contain"
                    unoptimized
                  />
                </div>
                <div className="space-y-3">
                  {Object.entries(effectiveBreakdown)
                    .filter(([key]) => {
                      const k = String(key || '').toLowerCase();
                      if (k.includes('life') && k.includes('stage') && k.includes('fit')) return false;
                      if (k.includes('activity') && k.includes('fit')) return false;
                      return true;
                    })
                    .filter(([_key, factor]) => {
                      // Show all factors that exist in the breakdown
                      return true;
                    })
                    .map(([key, factor]) => {
                      const f = factor as {
                        score: number;
                        weightedContribution?: number;
                        weight: number;
                        reason?: string;
                        recommendations?: any[];
                      };

                      const rawScore = typeof f.score === 'number' && Number.isFinite(f.score) ? f.score : 0;
                      const score = Math.round(rawScore);
                      const weightedContribution = f.weightedContribution ?? Math.round(rawScore * (f.weight || 0));

                      let bgColor = 'bg-green-900/20 border-green-700/50';
                      let icon = '✅';
                      let textColor = 'text-green-200';

                      if (score < 40) {
                        bgColor = 'bg-red-900/20 border-red-700/50';
                        icon = '❌';
                        textColor = 'text-red-200';
                      } else if (score < 70) {
                        bgColor = 'bg-yellow-900/20 border-yellow-700/50';
                        icon = '⚠️';
                        textColor = 'text-yellow-200';
                      }

                      const factorNameMap: Record<string, string> = {
                        safety: 'ingredient safety',
                        nutrition: 'nutritional adequacy',
                        health: 'health alignment',
                        quality: 'ingredient quality',
                      };
                      const factorName = factorNameMap[key] || key.replace(/([A-Z])/g, ' $1').toLowerCase();

                      return (
                        <div
                          key={key}
                          className="flex items-center justify-between py-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{icon}</span>
                            <span className="text-sm font-medium capitalize text-foreground">{factorName}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-bold text-foreground">{formatPercent(score)}</span>
                            <span className="text-xs text-gray-400">+{weightedContribution} pts</span>
                          </div>
                        </div>
                      );
                    })}
                  {Object.entries(effectiveBreakdown)
                    .filter(([key]) => {
                      const k = String(key || '').toLowerCase();
                      if (k.includes('life') && k.includes('stage') && k.includes('fit')) return false;
                      if (k.includes('activity') && k.includes('fit')) return false;
                      return true;
                    })
                    .filter(([_key, factor]) => {
                      // Show all factors that exist in the breakdown
                      return true;
                    }).length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      No detailed health factors available for this recipe.
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-surface rounded-2xl shadow-lg p-6 border border-surface-highlight">
              <div className="mb-4 flex justify-center">
                <Image
                  src={StorageServingBanner}
                  alt="Storage and serving"
                  className="h-auto w-full max-w-md border border-surface-highlight rounded-lg"
                  unoptimized
                />
              </div>
              <span className="sr-only">Storage and Serving</span>
              <div className="space-y-4 text-sm text-gray-300">
                <div>
                  <div className="font-semibold text-gray-200">Storage</div>
                  <ul className="mt-2 space-y-1">
                    {portionPlan ? (
                      <li className="flex items-start gap-2 text-gray-300">
                        <span className="text-orange-400 mt-0.5">•</span>
                        <span>
                          Suggested serving size: {portionPlan.dailyGrams}g per day ({portionPlan.mealsPerDay} meals/day)
                        </span>
                      </li>
                    ) : null}
                    <li className="flex items-start gap-2 text-gray-300">
                      <span className="text-orange-400 mt-0.5">•</span>
                      <span>Fridge: Store in airtight container up to 3 days</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-300">
                      <span className="text-orange-400 mt-0.5">•</span>
                      <span>Freezer: Freeze portions up to 2 months</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-300">
                      <span className="text-orange-400 mt-0.5">•</span>
                      <span>Thawing: Thaw overnight in fridge</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <div className="font-semibold text-gray-200">Serving temperature</div>
                  <ul className="mt-2 space-y-1">
                    <li className="flex items-start gap-2 text-gray-300">
                      <span className="text-orange-400 mt-0.5">•</span>
                      <span>Serve at room temp or gently warmed</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-300">
                      <span className="text-orange-400 mt-0.5">•</span>
                      <span>Avoid overheating; stir well and test temperature before serving</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <div className="font-semibold text-gray-200">Batch prep tip</div>
                  <ul className="mt-2 space-y-1">
                    <li className="flex items-start gap-2 text-gray-300">
                      <span className="text-orange-400 mt-0.5">•</span>
                      <span>Cool fully before portioning; portion into daily containers</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-2xl shadow-lg p-6 border border-surface-highlight">
              <button
                type="button"
                onClick={handleAddToMealPlan}
                disabled={!userId || !activePetId || isAddingMeal || isMealAdded}
                className="group relative w-full inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-green-800/40 rounded-2xl transition-transform duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={isMealAdded ? 'Meal Harvested' : 'Harvest Meal'}
              >
                <span className="relative h-32 w-full overflow-hidden rounded-2xl">
                  <Image
                    src={isMealAdded ? "/images/Buttons/MealSaved.png" : "/images/Buttons/SaveMeal.png"}
                    alt={isMealAdded ? "Meal Harvested" : "Harvest Meal"}
                    fill
                    sizes="100vw"
                    className="object-contain"
                    priority
                    unoptimized
                  />
                </span>
                <span className="sr-only">{isMealAdded ? 'Meal Harvested' : 'Harvest Meal'}</span>
              </button>
              {!userId && <div className="mt-2 text-xs text-gray-400">Sign in to save</div>}
              {userId && !activePetId && <div className="mt-2 text-xs text-gray-400">Select a pet to add</div>}
            </div>

          </aside>
        </div>
        </div>
      </div>

      {/* Recipe Score Modal */}
      {isScoreModalOpen && effectiveScore && (
        <RecipeScoreModal
          recipe={((recipeForScoring as any) || recipe) as any}
          pet={modalPet}
          score={{
            overallScore: (scoreForQueryPet as any)?.overallScore,
            warnings: Array.isArray((scoreForQueryPet as any)?.warnings) ? (scoreForQueryPet as any).warnings : undefined,
            strengths: Array.isArray((scoreForQueryPet as any)?.strengths) ? (scoreForQueryPet as any).strengths : undefined,
          }}
          onClose={() => setIsScoreModalOpen(false)}
        />
      )}

      {/* One-Click Checkout Modal */}
      {recipe && (
        <OneClickCheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          items={allShoppingItems
            .filter((ing: any) => ing.asinLink)
            .map((ing: any) => ({
              id: ing.id,
              name: ing.name,
              asinLink: ensureSellerId(ing.asinLink),
              amount: ing.amount,
              asin: extractASIN(ing.asinLink)
            }))}
          recipeName={recipe.name}
          userId={userId}
        />
      )}
    </>
  );
}