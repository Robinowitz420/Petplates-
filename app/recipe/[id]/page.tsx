'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
import { getCustomMeal } from '@/lib/utils/customMealStorage';
import { convertCustomMealToRecipe } from '@/lib/utils/convertCustomMealToRecipe';
import { getPets as getPersistedPets, savePet as savePersistedPet } from '@/lib/utils/petStorage';
import {
  getRecommendationsForRecipe,
  type RecommendedSupplement,
} from '@/lib/utils/nutritionalRecommendations';

import { checkAllBadges } from '@/lib/utils/badgeChecker';
import { ensureSellerId } from '@/lib/utils/affiliateLinks';
import { getProductPrice } from '@/lib/data/product-prices';
import { buildAmazonSearchUrl } from '@/lib/utils/purchaseLinks';
import { normalizePetType } from '@/lib/utils/petType';
import { formatPercent } from '@/lib/utils/formatPercent';
import { getPortionPlan } from '@/lib/portionCalc';
import { getProfilePictureForPetType } from '@/lib/utils/emojiMapping';
import PetCompatibilityBlock from '@/components/PetCompatibilityBlock';
import CustomMadeForLine from '@/components/CustomMadeForLine';
import ShoppingListBanner from '@/public/images/Site Banners/ShoppingList.png';
import IngredientsTabImage from '@/public/images/Buttons/ingredients.png';
import SupplementsTabImage from '@/public/images/Buttons/Supplements.jpg';
import CompatibilityRadial from '@/components/CompatibilityRadial';

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
  if (!recipe) return recipe;

  // Derive species from recipe category
  const species = getSpeciesFromRecipeCategory(recipe.category);

  return {
    ...recipe,
    ingredients: recipe.ingredients.map((ing) => {
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
  const [recommendedSupplements, setRecommendedSupplements] = useState<RecommendedSupplement[]>([]);
  const [hopAddedLabel, setHopAddedLabel] = useState<string | null>(null);
  const [modifiedScore, setModifiedScore] = useState<number | null>(null);
  const [animatedScore, setAnimatedScore] = useState<number | null>(null);

  const userId = clerkUserId || '';

  const searchParams = useSearchParams();
  const queryPetId = searchParams?.get('petId') || '';

  const activePetId = selectedPetId || queryPetId;

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

  const scoreForQueryPet = useMemo(() => {
    if (!recipe || !activePetId) return null;
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

      const scored = scoreWithSpeciesEngine(recipe, scoringPet);

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
  }, [recipe, activePetId, pets, userId]);

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
        const vetted = vetRecipeIngredients(sessionRecipe);
        setRecipe(vetted);
        setVettedRecipe(vetted);
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
              const vetted = vetRecipeIngredients(foundRecipe);
              setRecipe(vetted);
              setVettedRecipe(vetted);
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
    if (!selectedPetId || !recipe) {
      setPetWeight('');
      setPetAllergies('');
      setModifierResult(null);
      setModifierError(null);
      setIsMealAdded(false);
      // DON'T set vettedRecipe to null - keep the vetted recipe so ingredients show properly
      // setVettedRecipe(null); // REMOVED - this was causing ingredients to disappear
      return;
    }

    const pet = pets.find((p) => p.id === selectedPetId);
    if (!pet) return;
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
  }, [selectedPetId, pets, recipe]);

  // Score animation function
  const animateScoreChange = useCallback((from: number, to: number) => {
    const duration = 1500; // 1.5 seconds
    const steps = 60;
    const increment = (to - from) / steps;
    let current = from;
    let step = 0;

    const animate = () => {
      step++;
      current = from + (increment * step);
      
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

  // Function to add supplement to recipe
  const handleAddSupplement = useCallback((supplement: RecommendedSupplement) => {

    const baseRecipe: any = modifiedRecipe || vettedRecipe || recipe;
    if (!baseRecipe) return;

    const newRecipe = JSON.parse(JSON.stringify(baseRecipe));

    const ingredientToAdd: any = {
      id: `supplement-${Date.now()}`,
      name: supplement.name,
      productName: supplement.productName || supplement.name,
      amount: supplement.defaultAmount,
      notes: supplement.benefits,
      asinLink: supplement.asinLink || supplement.amazonLink,
      amazonLink: supplement.asinLink || supplement.amazonLink,
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

    // Recalculate score
    if (activePetId && scoreForQueryPet) {
      const pet = pets.find((p) => p.id === activePetId);
      if (pet) {
        const petAge = pet.age === 'baby' ? 0.5 : pet.age === 'young' ? 2 : pet.age === 'adult' ? 5 : 10;
        const petType = normalizePetType(pet.type, 'recipe/[id].recalcScore');
        const scoringPet = {
          id: pet.id,
          name: getRandomName(pet.names),
          type: petType,
          breed: pet.breed,
          age: petAge,
          weight: parseFloat(pet.weight) || (petType === 'dog' ? 25 : petType === 'cat' ? 10 : 5),
          activityLevel: 'moderate' as const,
          healthConcerns: pet.healthConcerns || [],
          dietaryRestrictions: pet.allergies || [],
          allergies: pet.allergies || [],
        } as any;

        try {
          const newScored = scoreWithSpeciesEngine(newRecipe, scoringPet);
          const oldScore = scoreForQueryPet.overallScore;
          const scoreDiff = newScored.overallScore - oldScore;

          if (scoreDiff > 0) {
            // Animate score change
            animateScoreChange(oldScore, newScored.overallScore);
          }

          setModifiedScore(newScored.overallScore);
          setMessage(`${supplement.name} added! Score improved by ${scoreDiff > 0 ? '+' : ''}${scoreDiff.toFixed(0)} points.`);
          setTimeout(() => setMessage(null), 5000);
        } catch (error) {
          console.error('Error recalculating score:', error);
          setMessage(`${supplement.name} added to recipe.`);
          setTimeout(() => setMessage(null), 3000);
        }
      }
    }
  }, [modifiedRecipe, vettedRecipe, recipe, activePetId, pets, scoreForQueryPet, animateScoreChange]);

  const handleAddBuiltInSupplement = useCallback(
    (supplementItem: any) => {
      const baseRecipe: any = modifiedRecipe || vettedRecipe || recipe;
      if (!baseRecipe) return;

      const targetId = typeof supplementItem?.id === 'string' ? supplementItem.id : '';
      const targetName = typeof supplementItem?.name === 'string' ? supplementItem.name : '';

      const newRecipe = JSON.parse(JSON.stringify(baseRecipe));
      const nextId = `supplement-${Date.now()}`;

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
          asinLink: supplementItem?.asinLink || undefined,
          amazonLink: supplementItem?.asinLink || undefined,
          amazonSearchUrl: supplementItem?.amazonSearchUrl || undefined,
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
    [modifiedRecipe, vettedRecipe, recipe]
  );

  useEffect(() => {
    if (!activePet || !scoreForQueryPet) {
      setRecommendedSupplements([]);
      return;
    }

    const petType = normalizePetType(activePet.type, 'recipe/[id].supplementRecommendations');
    const overallScoreRaw = (scoreForQueryPet as any)?.overallScore;
    const overallScore = typeof overallScoreRaw === 'number' && Number.isFinite(overallScoreRaw) ? overallScoreRaw : null;

    if (overallScore == null || overallScore >= 80) {
      setRecommendedSupplements([]);
      return;
    }

    const gaps = Array.isArray((scoreForQueryPet as any)?.nutritionalGaps) ? ((scoreForQueryPet as any).nutritionalGaps as string[]) : [];
    const healthConcerns = Array.isArray((activePet as any)?.healthConcerns) ? ((activePet as any).healthConcerns as string[]) : [];

    const recs = getRecommendationsForRecipe(gaps, petType, healthConcerns).filter((r) => !r.isIngredient);
    setRecommendedSupplements(recs);
  }, [activePet, scoreForQueryPet]);

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

    setIsAddingMeal(true);
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 300));

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
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('petsUpdated', { detail: { userId, petId: currentPetId } }));
    }

    setPets(updatedPets);
    setIsAddingMeal(false);
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
  const { ingredientShoppingItems, supplementShoppingItems, allShoppingItems, mealEstimate } = useMemo(() => {
    const baseRecipe = modifiedRecipe || vettedRecipe || recipe;
    if (!baseRecipe) {
      return { ingredientShoppingItems: [], supplementShoppingItems: [], allShoppingItems: [], mealEstimate: null };
    }

    const allIngredients = Array.isArray((baseRecipe as any).ingredients) ? (baseRecipe as any).ingredients : [];

    const supplementCategories = new Set(['Supplement', 'Oil']);

    const ingredientsEnrichedWithLinks = allIngredients.map((ing: any) => {
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

    const isUserAddedSupplement = (ing: any) => {
      const id = typeof ing?.id === 'string' ? ing.id : '';
      return id.startsWith('supplement-');
    };

    const isSupplementLike = (ing: any) => {
      if (isUserAddedSupplement(ing)) return false;
      const cat = typeof ing?.__productCategory === 'string' ? ing.__productCategory : '';
      return supplementCategories.has(cat);
    };

    const ingredientCandidates = ingredientsEnrichedWithLinks.filter((ing: any) => !isSupplementLike(ing));
    const supplementCandidates = ingredientsEnrichedWithLinks.filter((ing: any) => isSupplementLike(ing));

    const ingredientItems = ingredientCandidates.map((ing: any) => ({
      id: ing.id,
      name: ing.name,
      amount: ing.amount || '',
      asinLink: ing.asinLink || ing.amazonLink ? ensureSellerId(ing.asinLink || ing.amazonLink) : undefined,
      amazonSearchUrl:
        ing.amazonSearchUrl ||
        ensureSellerId(buildAmazonSearchUrl(typeof ing?.name === 'string' ? ing.name : 'ingredient')),
    }));

    const supplementItems = supplementCandidates.map((ing: any) => ({
      id: ing.id,
      name: ing.name,
      amount: ing.amount || '',
      asinLink: ing.asinLink || ing.amazonLink ? ensureSellerId(ing.asinLink || ing.amazonLink) : undefined,
      amazonSearchUrl:
        ing.amazonSearchUrl ||
        ensureSellerId(buildAmazonSearchUrl(typeof ing?.name === 'string' ? ing.name : 'supplement')),
    }));

    const shoppingItems = [...ingredientItems];

    const totalCost = ingredientItems.reduce((sum: number, item: any) => {
      const price = getProductPrice(item.name);
      if (typeof price === 'number') return sum + price;
      return sum;
    }, 0);

    let estimate = null;
    if (ingredientItems.length > 0) {
      try {
        const shoppingListItems = ingredientItems.map((item: any) => {
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
        const servings = Number.isFinite(servingsParsed) && servingsParsed > 0 ? servingsParsed : 1;

        const rawEstimate = calculateMealsFromGroceryList(
          shoppingListItems,
          undefined,
          (baseRecipe as any)?.category,
          true,
          servings
        );

        const roundedTotalCost = Math.round(totalCost * 100) / 100;
        const meals = rawEstimate?.estimatedMeals || 0;
        const costPerMeal = meals > 0 ? Math.round((roundedTotalCost / meals) * 100) / 100 : 0;

        estimate = rawEstimate
          ? {
              ...rawEstimate,
              totalCost: roundedTotalCost,
              costPerMeal,
            }
          : null;
      } catch {
        estimate = null;
      }
    }

    return {
      ingredientShoppingItems: ingredientItems,
      supplementShoppingItems: supplementItems,
      allShoppingItems: shoppingItems,
      mealEstimate: estimate,
    };
  }, [vettedRecipe, recipe, modifiedRecipe]);

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

      <div className="min-h-screen bg-background py-12 font-sans text-foreground">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <Link
            href="/profile"
            className="inline-flex items-center text-gray-400 hover:text-primary-400 mb-6 font-medium transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to My Pets
          </Link>

          {/* Full-width title card with compatibility score + Save Meal */}
          <div className="bg-surface rounded-2xl shadow-xl overflow-hidden mb-8 border border-surface-highlight">
            <div className="p-8 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
              <div className="min-w-0 lg:pr-[260px]">
                <h1 className="text-4xl font-extrabold text-foreground mb-6 tracking-tight leading-tight break-words">
                  <div className="flex items-center gap-3 flex-wrap break-words">
                    <span className="break-words">{recipe.name}</span>
                    {(recipe.needsReview === true || (scoreForQueryPet && 'usesFallbackNutrition' in scoreForQueryPet && (scoreForQueryPet as any).usesFallbackNutrition)) && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-900/40 text-amber-200 border border-amber-700/50">
                        Experimental / Topper Only
                      </span>
                    )}
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

              {scoreForQueryPet && activePet && (
                <PetCompatibilityBlock
                  avatarSrc={getProfilePictureForPetType(activePet.type)}
                  avatarAlt={`${getRandomName(activePet.names)} profile`}
                  spacerClassName="w-16 shrink-0 bg-surface"
                  right={
                    <button
                      type="button"
                      onClick={() => setIsScoreModalOpen(true)}
                      className="rounded-2xl border border-surface-highlight bg-surface-lighter px-6 py-5 hover:border-orange-500/40 transition-colors"
                    >
                      <div className="flex items-center gap-5">
                        <CompatibilityRadial score={scoreForQueryPet.overallScore} size={118} strokeWidth={10} label="" />
                        <div className="text-left">
                          <div className="text-sm font-semibold text-gray-200">Compatibility</div>
                          <div className="text-xs text-gray-400 mt-1">Tap for details</div>
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
                  {supplementShoppingItems.length > 0 ? (
                    <div className="space-y-4">
                      {supplementShoppingItems.map((supplementItem: any) => {
                        const link = supplementItem?.asinLink || supplementItem?.amazonLink || supplementItem?.amazonSearchUrl;
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
                                {link ? (
                                  <a
                                    href={ensureSellerId(link)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold bg-surface border border-orange-500/60 text-orange-200 hover:border-orange-500 hover:text-orange-100 transition-colors"
                                  >
                                    Buy
                                  </a>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}

                  {recommendedSupplements.length > 0 ? (
                    <div className="space-y-4">
                      {recommendedSupplements.map((supplement) => {
                        const link = supplement.asinLink || supplement.amazonLink;
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
                                {link ? (
                                  <a
                                    href={ensureSellerId(link)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold bg-surface border border-orange-500/60 text-orange-200 hover:border-orange-500 hover:text-orange-100 transition-colors"
                                  >
                                    Buy
                                  </a>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : supplementShoppingItems.length === 0 ? (
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
              mealEstimate &&
              mealEstimate.estimatedMeals > 0 &&
              mealEstimate.costPerMeal > 0 && (
                <div className="bg-surface rounded-2xl shadow-lg p-6 mb-8 border border-surface-highlight">
                  <CostComparison
                    costPerMeal={mealEstimate.costPerMeal}
                    totalCost={mealEstimate.totalCost}
                    estimatedMeals={mealEstimate.estimatedMeals}
                    exceedsBudget={mealEstimate.exceedsBudget || false}
                  />
                </div>
              )}
          </main>

          <aside className="lg:col-span-2 space-y-8">
            {/* Health Breakdown Panel */}
            {scoreForQueryPet && (
              <div className="bg-surface rounded-2xl shadow-lg p-6 border-l-4 border-green-500 border border-surface-highlight">
                <h4 className="text-lg font-bold mb-4 flex items-center justify-center text-gray-200">
                  <span className="text-2xl mr-2">🏥</span>
                  Health Analysis
                </h4>
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
                <p className="text-xs text-gray-400 mb-4">
                  Professor Purfessor is here to break it down for you!
                </p>
                <div className="space-y-3">
                  {Object.entries(scoreForQueryPet.breakdown)
                    .filter(([key]) => {
                      const k = String(key || '').toLowerCase();
                      if (k.includes('life') && k.includes('stage') && k.includes('fit')) return false;
                      if (k.includes('activity') && k.includes('fit')) return false;
                      return true;
                    })
                    .filter(([_key, factor]) => {
                      const f = factor as { weight: number; reason?: string; recommendations?: any[] };
                      const weight = typeof f.weight === 'number' && Number.isFinite(f.weight) ? f.weight : 0;
                      if (weight > 0) return true;

                      const hasReason = typeof f.reason === 'string' && f.reason.trim().length > 0;
                      const hasRecs = Array.isArray(f.recommendations) && f.recommendations.length > 0;
                      return hasReason || hasRecs;
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
                          className={`flex items-center justify-between p-3 ${bgColor} rounded-lg border transition-colors`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{icon}</span>
                            <span className={`text-sm font-medium capitalize ${textColor}`}>{factorName}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className={`text-sm font-bold ${textColor}`}>{formatPercent(score)}</span>
                            <span className="text-xs text-gray-400">+{weightedContribution} pts</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            <div className="bg-surface rounded-2xl shadow-lg p-6 border border-surface-highlight">
              <h3 className="text-xl font-bold text-foreground mb-4 border-b border-surface-highlight pb-3">
                🧊 Storage & Serving
              </h3>
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
                className="group relative w-full inline-flex focus:outline-none focus:ring-4 focus:ring-orange-500/40 rounded-2xl transition-transform duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={isMealAdded ? 'Saved' : isAddingMeal ? 'Saving…' : 'Save Meal'}
              >
                <span className="relative h-32 w-full overflow-hidden rounded-2xl">
                  <Image
                    src={isMealAdded ? "/images/Buttons/MealSaved.png" : "/images/Buttons/SaveMeal.png"}
                    alt={isMealAdded ? "Meal Saved" : "Save Meal"}
                    fill
                    sizes="100vw"
                    className="object-contain"
                    priority
                    unoptimized
                  />
                </span>
                <span className="sr-only">{isMealAdded ? 'Saved' : isAddingMeal ? 'Saving…' : 'Save Meal'}</span>
              </button>
              {!userId && <div className="mt-2 text-xs text-gray-400">Sign in to save</div>}
              {userId && !activePetId && <div className="mt-2 text-xs text-gray-400">Select a pet to add</div>}
            </div>

          </aside>
        </div>
        </div>
      </div>

      {/* Recipe Score Modal */}
      {isScoreModalOpen && scoreForQueryPet && (
        <RecipeScoreModal
          recipe={recipe}
          pet={modalPet}
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