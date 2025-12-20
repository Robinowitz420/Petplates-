'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Clock,
  User,
  Star,
  ChevronLeft,
  X,
  ShoppingCart,
} from 'lucide-react';

import { loadRecipeById, loadAllRecipes } from '@/lib/data/recipes-index';
import type { Recipe, ModifiedRecipeResult } from '@/lib/types';
import { applyModifiers } from '@/lib/applyModifiers';
import { getVettedProduct, getVettedProductByAnyIdentifier, VETTED_PRODUCTS, getGenericIngredientName } from '@/lib/data/vetted-products';
import { petSupplements } from '@/lib/data/supplements';
import Tooltip from '@/components/Tooltip';
import { RecipeRatingSection } from '@/components/RecipeRatingSection';
import { calculateEnhancedCompatibility, type Pet as EnhancedPet } from '@/lib/utils/enhancedCompatibilityScoring';
import RecipeScoreModal from '@/components/RecipeScoreModal';
import { getRandomName, type Pet } from '@/lib/utils/petUtils';
import OneClickCheckoutModal from '@/components/OneClickCheckoutModal';
import { ShoppingList } from '@/components/ShoppingList';
import { CostComparison } from '@/components/CostComparison';
import { calculateMealsFromGroceryList } from '@/lib/utils/mealEstimation';
import { getCustomMeal } from '@/lib/utils/customMealStorage';
import { convertCustomMealToRecipe } from '@/lib/utils/convertCustomMealToRecipe';
import { getRecommendationsForRecipe, type RecommendedSupplement } from '@/lib/utils/nutritionalRecommendations';
import { checkAllBadges } from '@/lib/utils/badgeChecker';
import { ensureSellerId } from '@/lib/utils/affiliateLinks';
import { getProductPrice } from '@/lib/data/product-prices';

// =================================================================
// 1. CONSTANTS
// =================================================================

type CategoryType = 'dogs' | 'cats' | 'birds' | 'reptiles' | 'pocket-pets';

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

const getPetsFromLocalStorage = (userId: string): RecipeDetailPet[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(`pets_${userId}`);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed)
      ? parsed.map((p: any) => ({
          ...p,
          names: p.names || (p.name ? [p.name] : []),
          savedRecipes: p.savedRecipes || [],
          mealPlan: p.mealPlan || [],
          healthConcerns: p.healthConcerns || [],
        }))
      : [];
  } catch {
    return [];
  }
};

const savePetsToLocalStorage = (userId: string, pets: RecipeDetailPet[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`pets_${userId}`, JSON.stringify(pets));
  }
};

const getSavedRecipes = (userId: string): string[] => {
  const pets = getPetsFromLocalStorage(userId);
  return [...new Set(pets.flatMap((p) => p.savedRecipes || []))];
};

const getStarStates = (rating: number): boolean[] => {
  const fullStars = Math.round(rating);
  return Array.from({ length: 5 }, (_, i) => i < fullStars);
};

const setRecipeSavedState = (
  userId: string,
  recipeId: string,
  isSaving: boolean
): RecipeDetailPet[] => {
  const pets = getPetsFromLocalStorage(userId);
  const updatedPets = pets.map((pet) => {
    if (!pet.savedRecipes) pet.savedRecipes = [];
    if (isSaving && !pet.savedRecipes.includes(recipeId)) {
      pet.savedRecipes.push(recipeId);
    } else if (!isSaving && pet.savedRecipes.includes(recipeId)) {
      pet.savedRecipes = pet.savedRecipes.filter((id) => id !== recipeId);
    }
    return pet;
  });

  savePetsToLocalStorage(userId, updatedPets);
  
  // Check badges after saving/removing recipe
  if (isSaving) {
    updatedPets.forEach(async (pet) => {
      if (pet.savedRecipes.includes(recipeId)) {
        // Get meal plan count and weekly plan completion status
        // Note: We'll need to check this from the profile page context
        // For now, just check saved recipes count
        const savedRecipesCount = pet.savedRecipes.length;
        
        checkAllBadges(userId, pet.id, {
          action: 'recipe_saved',
          savedRecipesCount,
          mealPlanCount: 0, // Will be updated from profile page
          weeklyPlanCompleted: false,
        }).catch(err => {
          console.error('Failed to check badges:', err);
        });
      }
    });
  }
  
  return updatedPets;
};

// For now we use last_user_id the same way as profile page
const getCurrentUserId = () => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('last_user_id') || '';
};


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
        const matchingKey = Object.keys(VETTED_PRODUCTS).find(key => 
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
        };
      }
      // If no vetted product found, keep ingredient but no ASIN link
      return {
        ...ingWithoutOldLink,
        name: displayName,
        asinLink: existingLink ? ensureSellerId(existingLink) : undefined,
      };
    }),
    // Also vet supplements if they exist
    supplements: (recipe as any).supplements?.map((supplement: any) => {
      // Remove old amazonLink property
      const { amazonLink, ...supplementWithoutOldLink } = supplement;

      const existingLink = supplement.asinLink || amazonLink;

      const genericKey = getGenericIngredientName(supplement.productName || supplement.name);
      const displayName = genericKey ? formatIngredientNameForDisplay(genericKey) : supplement.name;
      
      // Derive species from recipe category (re-derive here since we're in map scope)
      const species = getSpeciesFromRecipeCategory(recipe.category);
      // Pass species for species-aware product matching
      const lookupName = genericKey || supplement.name;
      const vettedProduct = getVettedProduct(lookupName, species);
      if (vettedProduct) {
        const vettedLink = (vettedProduct.asinLink || vettedProduct.purchaseLink);
        return {
          ...supplementWithoutOldLink,
          productName: vettedProduct.productName,
          name: displayName,
          asinLink: ensureSellerId(vettedLink), // Prefer vetted product link over existing link
        };
      }
      // Keep supplement but no ASIN link if no vetted product found
      return {
        ...supplementWithoutOldLink,
        name: displayName,
        asinLink: existingLink ? ensureSellerId(existingLink) : undefined,
      };
    }),
  };
};

// =================================================================
// 3. MAIN COMPONENT
// =================================================================

export default function RecipeDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;

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
  const [modifiedScore, setModifiedScore] = useState<number | null>(null);
  const [animatedScore, setAnimatedScore] = useState<number | null>(null);

  const userId = getCurrentUserId();

  const searchParams = useSearchParams();
  const queryPetId = searchParams?.get('petId') || '';

  const scoreForQueryPet = useMemo(() => {
    if (!recipe || !queryPetId) return null;
    const pet = getPetsFromLocalStorage(userId).find((p) => p.id === queryPetId);
    if (!pet) return null;

    // Use enhanced scoring
    try {
      const petAge = pet.age === 'baby' ? 0.5 : pet.age === 'young' ? 2 : pet.age === 'adult' ? 5 : 10;
      const enhancedPet: EnhancedPet = {
        id: pet.id,
        name: getRandomName(pet.names),
        type: pet.type as 'dog' | 'cat' | 'bird' | 'reptile' | 'pocket-pet',
        breed: pet.breed,
        age: petAge,
        weight: parseFloat(pet.weight) || (pet.type === 'dogs' ? 25 : pet.type === 'cats' ? 10 : 5),
        activityLevel: 'moderate' as const,
        healthConcerns: pet.healthConcerns || [],
        dietaryRestrictions: pet.allergies || [],
        allergies: pet.allergies || [],
      };
      const enhanced = calculateEnhancedCompatibility(recipe, enhancedPet);
      // Convert to compatible format
      // Generate reason text that includes issues for better keyword matching
      const getReasonWithIssues = (factor: typeof enhanced.factors.ingredientSafety) => {
        if (factor.issues.length > 0) {
          return factor.issues.join('; ') + (factor.reasoning ? ` (${factor.reasoning})` : '');
        }
        return factor.reasoning || '';
      };

      // Get recommendations for nutritional gaps
      const supplementRecommendations = getRecommendationsForRecipe(
        enhanced.detailedBreakdown.nutritionalGaps,
        pet.type as 'dog' | 'cat' | 'bird' | 'reptile' | 'pocket-pet',
        pet.healthConcerns || []
      );

      // Check badges if score is 100% (Nutrient Navigator)
      if (enhanced.overallScore === 100 && queryPetId && userId) {
        checkAllBadges(userId, queryPetId, {
          action: 'recipe_viewed',
          compatibilityScore: enhanced.overallScore,
        }).catch(err => {
          console.error('Failed to check badges:', err);
        });
      }

      // Generate summary reasoning from enhanced breakdown
      const summaryReasoning = enhanced.detailedBreakdown.recommendations.length > 0
        ? enhanced.detailedBreakdown.recommendations.join('. ')
        : enhanced.detailedBreakdown.healthBenefits.length > 0
        ? enhanced.detailedBreakdown.healthBenefits.join('. ')
        : 'Recipe evaluated for compatibility with your pet.';

      return {
        overallScore: enhanced.overallScore,
        compatibility: enhanced.grade === 'A+' || enhanced.grade === 'A' ? 'excellent' :
                       enhanced.grade === 'B+' || enhanced.grade === 'B' ? 'good' :
                       enhanced.grade === 'C+' || enhanced.grade === 'C' ? 'fair' : 'poor',
        summaryReasoning: summaryReasoning,
        explainRecommendations: enhanced.detailedBreakdown.recommendations || [],
        nutritionalGaps: enhanced.detailedBreakdown.nutritionalGaps,
        supplementRecommendations: supplementRecommendations,
        breakdown: {
          petTypeMatch: { 
            score: enhanced.factors.ingredientSafety.score,
            weightedContribution: Math.round(enhanced.factors.ingredientSafety.score * enhanced.factors.ingredientSafety.weight),
            weight: enhanced.factors.ingredientSafety.weight,
            reason: getReasonWithIssues(enhanced.factors.ingredientSafety)
          },
          ageAppropriate: { 
            score: enhanced.factors.lifeStageFit.score,
            weightedContribution: Math.round(enhanced.factors.lifeStageFit.score * enhanced.factors.lifeStageFit.weight),
            weight: enhanced.factors.lifeStageFit.weight,
            reason: getReasonWithIssues(enhanced.factors.lifeStageFit)
          },
          nutritionalFit: { 
            score: enhanced.factors.nutritionalAdequacy.score,
            weightedContribution: Math.round(enhanced.factors.nutritionalAdequacy.score * enhanced.factors.nutritionalAdequacy.weight),
            weight: enhanced.factors.nutritionalAdequacy.weight,
            reason: getReasonWithIssues(enhanced.factors.nutritionalAdequacy),
            recommendations: supplementRecommendations // Add recommendations to nutritional fit
          } as any, // Type assertion needed because recommendations is added dynamically
          healthCompatibility: { 
            score: enhanced.factors.healthAlignment.score,
            weightedContribution: Math.round(enhanced.factors.healthAlignment.score * enhanced.factors.healthAlignment.weight),
            weight: enhanced.factors.healthAlignment.weight,
            reason: getReasonWithIssues(enhanced.factors.healthAlignment)
          },
          activityFit: {
            score: enhanced.factors.activityFit.score,
            weightedContribution: Math.round(enhanced.factors.activityFit.score * enhanced.factors.activityFit.weight),
            weight: enhanced.factors.activityFit.weight,
            reason: getReasonWithIssues(enhanced.factors.activityFit)
          },
          allergenSafety: { 
            score: enhanced.factors.allergenSafety.score,
            weightedContribution: Math.round(enhanced.factors.allergenSafety.score * enhanced.factors.allergenSafety.weight),
            weight: enhanced.factors.allergenSafety.weight,
            reason: getReasonWithIssues(enhanced.factors.allergenSafety)
          },
        },
        warnings: enhanced.detailedBreakdown.warnings,
        strengths: enhanced.detailedBreakdown.healthBenefits,
        recommendations: enhanced.detailedBreakdown.recommendations,
      };
    } catch (error) {
      // Fallback to original scoring
    console.error('Error calculating compatibility:', error);
    return null;
    }
  }, [recipe, queryPetId, userId]);

  const modifierResultForQueryPet = (() => {
    if (!recipe || !queryPetId) return null;
    const pet = getPetsFromLocalStorage(userId).find((p) => p.id === queryPetId);
    if (!pet) return null;
    return applyModifiers(recipe, pet as any);
  })();

  // Load recipe by dynamic route id (handles custom meals, generated recipes, and regular recipes)
  useEffect(() => {
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
        // Try to load from static recipes (fallback)
        loadRecipeById(id)
          .then((foundRecipe) => {
            if (foundRecipe) {
              // Always vet the recipe ingredients to ensure all have purchase links
              const vetted = vetRecipeIngredients(foundRecipe);
              setRecipe(vetted);
              // Always set vettedRecipe so ShoppingList can use vetted products
              setVettedRecipe(vetted);
            } else {
              // Recipe not found
              setRecipe(null);
              setVettedRecipe(null);
            }
            setIsLoading(false);
          })
          .catch((error) => {
            console.error('Error loading recipe:', error);
            setRecipe(null);
            setVettedRecipe(null);
            setIsLoading(false);
          });
      }
    }
  }, [id, queryPetId, userId]); // Reload when ID, petId, or userId changes

  // Update recommendations when score changes
  useEffect(() => {
    if (scoreForQueryPet && 'supplementRecommendations' in scoreForQueryPet) {
      const recs = (scoreForQueryPet as any).supplementRecommendations || [];
      setRecommendedSupplements(recs);
    } else {
      setRecommendedSupplements([]);
    }
  }, [scoreForQueryPet]);

  // Initialize modified recipe
  useEffect(() => {
    if (recipe && !modifiedRecipe) {
      setModifiedRecipe(JSON.parse(JSON.stringify(recipe)));
    }
  }, [recipe, modifiedRecipe]);

  // Load pets & saved state
  useEffect(() => {
    if (!userId || !id) return;

    try {
      const loadedPets = getPetsFromLocalStorage(userId);
      setPets(loadedPets);
    } catch (error) {
      // Handle error gracefully - show empty pets array
      console.error('Failed to load pets:', error);
      setPets([]);
    }
  }, [userId, id]);

  useEffect(() => {
    // Auto-select pet from URL parameter if available
    if (queryPetId && pets.length > 0 && !selectedPetId) {
      setSelectedPetId(queryPetId);
    }
  }, [queryPetId, pets, selectedPetId]);

  useEffect(() => {
    // Check if meal is already added for the current pet (check both mealPlan and savedRecipes)
    const currentPet = selectedPetId ? pets.find(p => p.id === selectedPetId) : (queryPetId ? pets.find(p => p.id === queryPetId) : null);
    if (currentPet && recipe) {
      const inMealPlan = currentPet.mealPlan?.includes(recipe.id) || false;
      const inSavedRecipes = currentPet.savedRecipes?.includes(recipe.id) || false;
      setIsMealAdded(inMealPlan || inSavedRecipes);
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
    const inMealPlan = pet.mealPlan?.includes(recipe.id) || false;
    const inSavedRecipes = pet.savedRecipes?.includes(recipe.id) || false;
    setIsMealAdded(inMealPlan || inSavedRecipes);

    // Apply modifiers, then vet all ingredients to ensure purchase links
    const { modifiedRecipe } = applyModifiers(recipe, pet);
    const vetted = vetRecipeIngredients(modifiedRecipe);
    setVettedRecipe(vetted);
  }, [selectedPetId, pets, recipe]);

  // Function to add supplement to recipe
  const handleAddSupplement = useCallback((supplement: RecommendedSupplement) => {
    if (!modifiedRecipe) return;

    const newRecipe = JSON.parse(JSON.stringify(modifiedRecipe));
    
    // Initialize supplements array if it doesn't exist
    if (!newRecipe.supplements) {
      newRecipe.supplements = [];
    }

    // Check if supplement already exists
    const exists = newRecipe.supplements.some((s: any) => 
      s.name === supplement.name || s.productName === supplement.productName
    );

    if (exists) {
      setMessage('This supplement is already in the recipe');
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    // Add supplement
    const supplementToAdd: any = {
      id: `supplement-${Date.now()}`,
      name: supplement.name,
      productName: supplement.productName || supplement.name,
      amount: supplement.defaultAmount,
      notes: supplement.benefits,
      asinLink: supplement.asinLink || supplement.amazonLink,
    };

    newRecipe.supplements.push(supplementToAdd);
    setModifiedRecipe(newRecipe);

    // Recalculate score
    if (queryPetId && scoreForQueryPet) {
      const pet = getPetsFromLocalStorage(userId).find((p) => p.id === queryPetId);
      if (pet) {
        const petAge = pet.age === 'baby' ? 0.5 : pet.age === 'young' ? 2 : pet.age === 'adult' ? 5 : 10;
        const enhancedPet: EnhancedPet = {
          id: pet.id,
          name: getRandomName(pet.names),
          type: pet.type as 'dog' | 'cat' | 'bird' | 'reptile' | 'pocket-pet',
          breed: pet.breed,
          age: petAge,
          weight: parseFloat(pet.weight) || (pet.type === 'dogs' ? 25 : pet.type === 'cats' ? 10 : 5),
          activityLevel: 'moderate' as const,
          healthConcerns: pet.healthConcerns || [],
          dietaryRestrictions: pet.allergies || [],
          allergies: pet.allergies || [],
        };

        try {
          const newScore = calculateEnhancedCompatibility(newRecipe, enhancedPet);
          const oldScore = scoreForQueryPet.overallScore;
          const scoreDiff = newScore.overallScore - oldScore;

          if (scoreDiff > 0) {
            // Animate score change
            animateScoreChange(oldScore, newScore.overallScore);
          }

          setModifiedScore(newScore.overallScore);
          setMessage(`${supplement.name} added! Score improved by ${scoreDiff > 0 ? '+' : ''}${scoreDiff.toFixed(0)} points.`);
          setTimeout(() => setMessage(null), 5000);
        } catch (error) {
          console.error('Error recalculating score:', error);
          setMessage(`${supplement.name} added to recipe.`);
          setTimeout(() => setMessage(null), 3000);
        }
      }
    }
  }, [modifiedRecipe, queryPetId, scoreForQueryPet, userId]);

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

    animate();
  }, []);

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

    // Check if already added (check both mealPlan and savedRecipes)
    if (currentPet.mealPlan?.includes(recipe.id) || currentPet.savedRecipes?.includes(recipe.id)) {
      setIsMealAdded(true);
      return;
    }

    setIsAddingMeal(true);
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 300));

    const updatedPets = pets.map((pet) => {
      if (pet.id === currentPetId) {
        if (!pet.mealPlan) pet.mealPlan = [];
        if (!pet.mealPlan.includes(recipe.id)) {
          pet.mealPlan.push(recipe.id);
          setIsMealAdded(true);
        }
      }
      return pet;
    });

    savePetsToLocalStorage(userId, updatedPets);
    setPets(updatedPets);
    setIsAddingMeal(false);
  }, [recipe, selectedPetId, queryPetId, pets, userId]);

  const selectedPet = selectedPetId
    ? pets.find((pet) => pet.id === selectedPetId)
    : null;

  const handlePersonalizeRecipe = async () => {
    if (!recipe) return;

    const currentPet = selectedPet || (queryPetId ? pets.find(p => p.id === queryPetId) : null);
    if (!currentPet) {
      setModifierError('Select a pet profile first.');
      return;
    }

    const parsedWeight = parseFloat(petWeight);
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
  const { allShoppingItems, mealEstimate } = useMemo(() => {
    const sourceRecipe = vettedRecipe || recipe;
    if (!sourceRecipe) {
      return { allShoppingItems: [], mealEstimate: null };
    }

    const allIngredients = sourceRecipe.ingredients || [];

    const ingredientsEnrichedWithLinks = allIngredients.map((ing: any) => {
      const existingLink = ing?.asinLink || ing?.amazonLink;
      if (existingLink) return ing;

      const lookupName = getGenericIngredientName(ing?.productName || ing?.name) || ing?.name;
      if (!lookupName) return ing;

      const product = getVettedProduct(lookupName, sourceRecipe.category);
      const productLink = product?.asinLink || product?.purchaseLink;
      if (!productLink) return ing;

      const enrichedLink = ensureSellerId(productLink);
      return {
        ...ing,
        productName: ing?.productName || product.productName,
        amazonLink: enrichedLink,
        asinLink: enrichedLink
      };
    });

    const ingredientsWithASINs = ingredientsEnrichedWithLinks.filter((ing: any) => ing.asinLink || ing.amazonLink);
    const supplementsWithASINs = (modifiedRecipe as any)?.supplements?.filter((s: any) => s.asinLink || s.amazonLink) || [];

    const shoppingItems = [
      ...ingredientsWithASINs.map((ing: any) => ({
        id: ing.id,
        name: ing.name,
        amount: ing.amount || '',
        asinLink: ensureSellerId(ing.asinLink || ing.amazonLink)
      })),
      ...supplementsWithASINs.map((supplement: any) => ({
        id: supplement.id || supplement.name,
        name: supplement.name,
        amount: supplement.amount || supplement.defaultAmount || '',
        asinLink: ensureSellerId(supplement.asinLink || supplement.amazonLink)
      }))
    ];

    const totalCost = shoppingItems.reduce((sum: number, item: any) => {
      const price = getProductPrice(item.name);
      if (typeof price === 'number') return sum + price;
      return sum;
    }, 0);

    let estimate = null;
    if (shoppingItems.length > 0) {
      try {
        const shoppingListItems = shoppingItems.map((item: any) => {
          const genericName = getGenericIngredientName(item.name) || item.name.toLowerCase();
          const vettedProduct = getVettedProduct(genericName, sourceRecipe.category);
          return {
            id: item.id,
            name: item.name,
            amount: item.amount,
            category: vettedProduct?.category || 'other'
          };
        });

        estimate = calculateMealsFromGroceryList(shoppingListItems, undefined, sourceRecipe.category);
      } catch (error) {
        estimate = null;
      }
    }

    return { allShoppingItems: shoppingItems, mealEstimate: estimate };
  }, [vettedRecipe, recipe, modifiedRecipe]);

  const guidelines =
    NUTRITION_GUIDELINES[recipe?.category as CategoryType] ||
    ({ protein: 'N/A', fat: 'N/A', fiber: 'N/A' } as const);

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
    <div className="min-h-screen bg-background py-12 font-sans text-foreground">
      {/* Message Toast */}
      {message && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Link
          href="/profile"
          className="inline-flex items-center text-gray-400 hover:text-primary-400 mb-6 font-medium transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to My Pets
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <main className="lg:col-span-3">
            {/* Recipe Info Card */}
            <div className="bg-surface rounded-2xl shadow-xl overflow-hidden mb-8 border border-surface-highlight">
              <div className="p-8">
                <h1 className="text-4xl font-extrabold text-foreground mb-2 tracking-tight">
                  <div className="flex items-center gap-3">
                    <span>{recipe.name}</span>
                    {(recipe.needsReview === true || (scoreForQueryPet && 'usesFallbackNutrition' in scoreForQueryPet && (scoreForQueryPet as any).usesFallbackNutrition)) && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-900/40 text-amber-200 border border-amber-700/50">
                        ⚠️ Experimental / Topper Only
                      </span>
                    )}
                  </div>
                </h1>
                {/* Pet Compatibility Rating - Using NEW system */}
                
                {queryPetId && scoreForQueryPet && (
                  <div className="mb-4 flex items-center gap-3">
                    <button
                      onClick={() => setIsScoreModalOpen(true)}
                      className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${i < Math.round(scoreForQueryPet.overallScore / 20) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-300 ml-2">
                        Compatibility Score: <strong>{scoreForQueryPet.overallScore}%</strong>
                        <span className="text-xs text-gray-400 ml-2">(weighted average)</span>
                      </div>
                    </button>
                    <Tooltip
                      content={`Compatibility: ${scoreForQueryPet.compatibility}\n\n${scoreForQueryPet.strengths.length > 0 ? 'Strengths:\n• ' + scoreForQueryPet.strengths.join('\n• ') + '\n' : ''}${scoreForQueryPet.warnings.length > 0 ? '\nWarnings:\n• ' + scoreForQueryPet.warnings.join('\n• ') : ''}`}
                    >
                      <div className="text-xs text-gray-500 cursor-help hover:text-gray-300">
                        Why
                      </div>
                    </Tooltip>
                  </div>
                )}

                {scoreForQueryPet && 'explainRecommendations' in scoreForQueryPet && (scoreForQueryPet as any).explainRecommendations && (scoreForQueryPet as any).explainRecommendations.length > 0 && (
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mb-4">
                    <div className="flex items-start gap-2">
                      <span className="text-lg">💡</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-amber-900 mb-2">Suggestions:</h4>
                        <ul className="text-sm text-amber-800 space-y-1">
                          {(scoreForQueryPet as any).explainRecommendations.map((rec: string, i: number) => (
                            <li key={i}>• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pet Reviews - Positioned directly under meal title */}
                <div className="mb-6">
                  <RecipeRatingSection
                    recipeId={id || ''}
                    recipeName={recipe.name}
                    userId={userId}
                  />
                </div>

                <div className="mb-8">
                  <p className="text-gray-300 leading-relaxed text-lg">
                    {recipe.description}
                  </p>
                  {(recipe.needsReview === true || (scoreForQueryPet && 'usesFallbackNutrition' in scoreForQueryPet && (scoreForQueryPet as any).usesFallbackNutrition)) && (
                    <div className="mt-3 p-3 bg-amber-900/20 border border-amber-700/50 rounded-lg">
                      <p className="text-sm text-amber-200">
                        <strong>⚠️ Note:</strong> This recipe uses estimated nutrition data. Consult your veterinarian before feeding as a complete meal.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                  {recipe.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="bg-surface-highlight text-gray-300 px-3 py-1 rounded-full text-sm font-medium border border-surface-highlight"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

              </div>
            </div>

            {/* Ingredients & Supplements Tabs */}
            <div className="bg-surface rounded-2xl shadow-lg p-8 mb-8 border border-surface-highlight">
              {/* Tab Navigation */}
              <div className="flex border-b border-surface-highlight mb-6">
                <button
                  onClick={() => setActiveTab('ingredients')}
                  className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
                    activeTab === 'ingredients'
                      ? 'border-orange-500 text-orange-400'
                      : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}
                >
                  Ingredients
                </button>
                <button
                  onClick={() => setActiveTab('supplements')}
                  className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
                    activeTab === 'supplements'
                      ? 'border-orange-500 text-orange-400'
                      : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}
                >
                  Supplements
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'ingredients' && (
                <div className="relative">
                  {(() => {
                    const allIngredients = vettedRecipe?.ingredients || recipe.ingredients || [];
                    
                    const ingredientsWithASINs = allIngredients.filter((ing: any) => ing.asinLink);
                    // Filter out ingredients with old amazonLink - only show truly missing ASINs
                    const ingredientsWithoutASINs = allIngredients.filter((ing: any) => !ing.asinLink && !ing.amazonLink);
                    
                    // Get recommended ingredients (from recommendations where isIngredient === true)
                    const recommendedIngredients = recommendedSupplements.filter((rec: any) => rec.isIngredient === true);
                    
                    return (
                      <div className="space-y-6">
                        {/* Recommended Ingredients Section */}
                        {recommendedIngredients.length > 0 && (
                          <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-orange-200 mb-4 flex items-center gap-2">
                              <span>✨</span>
                              Recommended Ingredients
                            </h3>
                            <p className="text-sm text-gray-400 mb-4">
                              These ingredients can help address nutritional deficiencies in this recipe:
                            </p>
                            <div className="space-y-3">
                              {recommendedIngredients.map((ingredient: any, index: number) => (
                                <div key={index} className="bg-surface rounded-lg p-4 border border-orange-700/30">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                      <h5 className="font-semibold text-gray-200">{ingredient.name}</h5>
                                      <p className="text-sm text-gray-400 mt-1">{ingredient.description}</p>
                                      <p className="text-xs text-orange-300 mt-2">
                                        Addresses: {ingredient.addressesDeficiency}
                                      </p>
                                      <p className="text-sm text-gray-300 mt-2">
                                        <strong>Benefits:</strong> {ingredient.benefits}
                                      </p>
                                      <p className="text-sm text-gray-400 mt-1">
                                        <strong>Suggested Amount:</strong> {ingredient.defaultAmount}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Ingredients with ASIN links - show buy buttons */}
                        {allShoppingItems.length > 0 && (
                          <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-foreground mb-4">
                              Recipe Ingredients & Supplements
                            </h3>
                            <ShoppingList
                              ingredients={allShoppingItems}
                              recipeName={recipe.name}
                              userId={userId}
                            />
                          </div>
                        )}
                        
                        {/* Ingredients without ASIN links - just display them */}
                        {ingredientsWithoutASINs.length > 0 && (
                          <div className="bg-surface-lighter rounded-lg border border-surface-highlight p-6">
                            <h3 className="text-lg font-semibold text-foreground mb-4">
                              Additional Ingredients
                            </h3>
                            <div className="space-y-2">
                              {ingredientsWithoutASINs.map((ing: any, index: number) => (
                                <div
                                  key={ing.id || index}
                                  className="flex items-center justify-between p-3 bg-surface rounded-lg border border-surface-highlight"
                                >
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-200">{ing.name}</div>
                                    {ing.amount && (
                                      <div className="text-sm text-gray-400">{ing.amount}</div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {activeTab === 'supplements' && (
                <div className="relative space-y-6">
                  {/* Recommended Supplements Section */}
                  {(() => {
                    // Filter out ingredients - only show supplements
                    const recommendedSupplementsOnly = recommendedSupplements.filter((rec: any) => !rec.isIngredient);
                    
                    if (recommendedSupplementsOnly.length === 0) return null;
                    
                    return (
                      <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-orange-200 mb-4 flex items-center gap-2">
                          <span>💊</span>
                          Recommended Supplements
                        </h3>
                        <p className="text-sm text-gray-400 mb-4">
                          These supplements can help address nutritional deficiencies in this recipe:
                        </p>
                        <div className="space-y-3">
                          {recommendedSupplementsOnly.map((supplement, index) => {
                            const isAlreadyAdded = ((modifiedRecipe || recipe) as any)?.supplements?.some((s: any) => 
                              s.name === supplement.name || s.productName === supplement.productName
                            ) || false;
                            
                            return (
                              <div key={index} className="bg-surface rounded-lg p-4 border border-orange-700/30">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <h5 className="font-semibold text-gray-200">{supplement.name}</h5>
                                    <p className="text-sm text-gray-400 mt-1">{supplement.description}</p>
                                    <p className="text-xs text-orange-300 mt-2">
                                      Addresses: {supplement.addressesDeficiency}
                                    </p>
                                    <p className="text-sm text-gray-300 mt-2">
                                      <strong>Benefits:</strong> {supplement.benefits}
                                    </p>
                                    <p className="text-sm text-gray-400 mt-1">
                                      <strong>Amount:</strong> {supplement.defaultAmount}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => handleAddSupplement(supplement)}
                                    disabled={isAlreadyAdded}
                                    className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors whitespace-nowrap ${
                                      isAlreadyAdded
                                        ? 'bg-green-600 text-white cursor-not-allowed opacity-50'
                                        : 'bg-orange-600 text-white hover:bg-orange-700'
                                    }`}
                                  >
                                    {isAlreadyAdded ? '✓ Added' : '+ Add to Recipe'}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Existing Recipe Supplements */}
                  {(() => {
                    const supplementsWithASINs = ((modifiedRecipe || recipe) as any)?.supplements?.filter((s: any) => s.asinLink) || [];
                    if (supplementsWithASINs.length > 0) {
                      return (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-200 mb-4">
                            Recipe Supplements
                          </h3>
                          <ShoppingList
                            ingredients={supplementsWithASINs.map((supplement: any) => ({
                              id: supplement.id || supplement.name,
                              name: supplement.name,
                              amount: supplement.amount || '',
                              asinLink: ensureSellerId(supplement.asinLink)
                            }))}
                            recipeName={`${recipe.name} supplements`}
                            userId={userId}
                          />
                        </div>
                      );
                    } else {
                      const recipeSupplements = ((modifiedRecipe || recipe) as any)?.supplements || [];
                      if (recipeSupplements.length === 0 && recommendedSupplements.length === 0) {
                        return (
                          <div>
                            <h3 className="text-2xl font-bold text-foreground mb-6">
                              Recipe Supplements
                            </h3>
                            <div className="text-center py-8 text-gray-500">
                              <p>This recipe doesn't include specific supplements.</p>
                              <p className="text-sm mt-2">Check the ingredients tab for all components.</p>
                            </div>
                          </div>
                        );
                      } else if (recipeSupplements.length > 0) {
                        return (
                          <div>
                            <h3 className="text-2xl font-bold text-foreground mb-6">
                              Recipe Supplements
                            </h3>
                            <div className="space-y-4">
                              {recipeSupplements.map((supplement: any, index: number) => (
                                <div key={index} className="bg-surface-lighter rounded-lg p-4 border border-surface-highlight">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <h5 className="font-semibold text-gray-200">{supplement.name}</h5>
                                      {supplement.productName && supplement.productName !== supplement.name && (
                                        <div className="text-sm text-gray-400 mt-1">
                                          (Generic: {supplement.name})
                                        </div>
                                      )}
                                      <p className="text-sm text-gray-400 mt-1">{supplement.notes || 'Health supplement for optimal nutrition'}</p>
                                    </div>
                                    <div className="flex items-center gap-4 ml-4">
                                      {supplement.amount && (
                                        <span className="text-orange-400 font-bold">
                                          {supplement.amount}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                    }
                  })()}
                </div>
              )}
            </div>

            {modifierResultForQueryPet && modifierResultForQueryPet.addedIngredients.length > 0 && (
              <div className="bg-surface rounded-2xl shadow-lg p-8 mb-8 border border-surface-highlight">
                <h3 className="text-2xl font-bold text-foreground mb-6 border-b border-surface-highlight pb-4">
                  Recommended Additions
                </h3>
                <ul className="space-y-4">
                  {modifierResultForQueryPet.addedIngredients.map((add) => (
                    <li
                      key={add.name}
                      className="flex justify-between items-center p-3 bg-green-900/20 rounded-lg transition-colors border border-green-800/30"
                    >
                      <div>
                        <span className="text-gray-200 font-medium text-lg">
                          {add.name}
                        </span>
                        <p className="text-sm text-gray-400">{add.benefit}</p>
                        <p className="text-xs text-green-400">Added for {add.forConcern}</p>
                      </div>
                      <a
                        href={ensureSellerId(add.amazon)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF9900] hover:bg-[#E07704] text-black rounded-lg transition-all duration-200 text-sm font-semibold whitespace-nowrap hover:shadow-md"
                      >
                        <ShoppingCart size={16} />
                        Buy
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </main>

          <aside className="lg:col-span-2 space-y-8">
            {/* Health Breakdown Panel - Moved to top */}
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
                  Proffessor Purfessor has found these individual factors that contribute to the overall compatibility score
                </p>
                <div className="space-y-3">
                  {Object.entries(scoreForQueryPet.breakdown).map(([key, factor]) => {
                    const f = factor as { score: number; weightedContribution?: number; weight: number; reason?: string };
                    const score = f.score || 0;
                    const weightedContribution = f.weightedContribution ?? Math.round(score * (f.weight || 0));
                    const weight = f.weight || 0;

                    // Always show all health factors with appropriate colors
                    let bgColor = 'bg-green-900/20 border-green-700/50';
                    let icon = '✅';
                    let textColor = 'text-green-200';

                    if (score < 70) {
                      bgColor = 'bg-yellow-900/20 border-yellow-700/50';
                      icon = '⚠️';
                      textColor = 'text-yellow-200';
                    }
                    if (score < 40) {
                      bgColor = 'bg-red-900/20 border-red-700/50';
                      icon = '❌';
                      textColor = 'text-red-200';
                    }

                    // Format factor name
                    const factorName = key.replace(/([A-Z])/g, ' $1').toLowerCase();
                    // Format tooltip content with better structure and spacing
                    const formattedFactorName = factorName.charAt(0).toUpperCase() + factorName.slice(1);
                    
                    // Get recommendations for this factor
                    let recommendationText = '';
                    const factorWithRecommendations = f as typeof f & { recommendations?: any[] };
                    if (key === 'nutritionalFit' && factorWithRecommendations.recommendations && factorWithRecommendations.recommendations.length > 0) {
                      recommendationText += '\n\n─────────────────────\n\n💊 Recommendations:\n';
                      const supplements = factorWithRecommendations.recommendations.filter((r: any) => !r.isIngredient);
                      const ingredients = factorWithRecommendations.recommendations.filter((r: any) => r.isIngredient);
                      
                      if (supplements.length > 0) {
                        recommendationText += `\nCheck Supplements tab for: ${supplements.map((r: any) => r.productName || r.name).join(', ')}`;
                      }
                      if (ingredients.length > 0) {
                        recommendationText += `\nCheck Ingredients tab for: ${ingredients.map((r: any) => r.name).join(', ')}`;
                      }
                    }
                    
                    const tooltipContent = `📊 ${formattedFactorName}\n\n─────────────────────\n\nRaw Score: ${score}%\nWeight: ${(weight * 100).toFixed(0)}%\nContribution: ${weightedContribution} points\n\n─────────────────────\n\n${f.reason ? `💡 ${f.reason}` : 'No additional details available'}${recommendationText}`;

                    return (
                      <Tooltip key={key} content={tooltipContent} wide={key === 'nutritionalFit'}>
                        <div className={`flex items-center justify-between p-3 ${bgColor} rounded-lg border cursor-help hover:opacity-80 transition-colors`}>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{icon}</span>
                            <span className={`text-sm font-medium capitalize ${textColor}`}>
                              {factorName}
                            </span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className={`text-sm font-bold ${textColor}`}>
                              {score}%
                            </span>
                            <span className="text-xs text-gray-400">
                              +{weightedContribution} pts
                            </span>
                          </div>
                        </div>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cost Comparison */}
            {allShoppingItems.length > 0 && mealEstimate && mealEstimate.estimatedMeals > 0 && mealEstimate.costPerMeal > 0 && (
              <CostComparison 
                costPerMeal={mealEstimate.costPerMeal}
                totalCost={mealEstimate.totalCost}
                estimatedMeals={mealEstimate.estimatedMeals}
                exceedsBudget={mealEstimate.exceedsBudget || false}
              />
            )}



            {/* Action Buttons */}
            {!isMealAdded && (
              <div className="bg-surface rounded-2xl shadow-lg p-6 space-y-4 border border-surface-highlight">
                <button
                  onClick={handleAddToMealPlan}
                  disabled={isAddingMeal}
                  className={`btn btn-success btn-lg btn-full ${
                    isAddingMeal 
                      ? 'btn-loading' 
                      : 'btn-ripple'
                  }`}
                >
                  {isAddingMeal ? 'Adding...' : '+Add Meal'}
                </button>
              </div>
            )}

            {/* Preparation Instructions */}
            <div className="bg-surface rounded-2xl shadow-lg p-6 border border-surface-highlight">
              <h3 className="text-xl font-bold text-foreground mb-4 border-b border-surface-highlight pb-3">
                👨‍🍳 Preparation
              </h3>
              <ol className="space-y-4">
                {recipe.instructions?.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-secondary-900/50 border border-secondary-700 text-secondary-200 rounded-full flex items-center justify-center font-bold mr-3 mt-1 text-sm">
                      {index + 1}
                    </span>
                    <span className="text-gray-300 text-base leading-relaxed">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </div>

      {/* Recipe Score Modal */}
      {isScoreModalOpen && scoreForQueryPet && (
        <RecipeScoreModal
          recipe={recipe}
          pet={(() => {
            const pet = getPetsFromLocalStorage(userId).find((p) => p.id === queryPetId);
            if (!pet) return null;
            return {
              id: pet.id,
              name: getRandomName(pet.names),
              type: pet.type as 'dog' | 'cat' | 'bird' | 'reptile' | 'pocket-pet',
              breed: pet.breed,
              age: pet.age === 'baby' ? 0.5 : pet.age === 'young' ? 2 : pet.age === 'adult' ? 5 : 10,
              weight: parseFloat(pet.weight) || (pet.type === 'dogs' ? 25 : pet.type === 'cats' ? 10 : 5),
              activityLevel: 'moderate' as const,
              healthConcerns: pet.healthConcerns || [],
              dietaryRestrictions: pet.allergies || []
            };
          })()}
          onClose={() => setIsScoreModalOpen(false)}
        />
      )}

      {/* One-Click Checkout Modal */}
      {recipe && (
        <OneClickCheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          items={(vettedRecipe?.ingredients || recipe.ingredients || [])
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
    </div>
  );
}