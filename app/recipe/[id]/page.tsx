'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Clock,
  User,
  Star,
  ChevronLeft,
  ChevronsRight,
  ClipboardList,
  Info,
  X,
  ShoppingCart,
} from 'lucide-react';

import { recipes as allRecipes } from '@/lib/data/recipes-complete';
import type { Recipe, ModifiedRecipeResult } from '@/lib/types';
import { applyModifiers } from '@/lib/applyModifiers';
import { getVettedProduct, VETTED_PRODUCTS } from '@/lib/data/vetted-products';
import { petSupplements } from '@/lib/data/supplements';
import Tooltip from '@/components/Tooltip';
import { RecipeRatingSection } from '@/components/RecipeRatingSection';
import { RatingBreakdown } from '@/components/RatingBreakdown';
import { rateRecipeForPet, type Pet as RatingPet } from '@/lib/utils/petRatingSystem';
import { calculateEnhancedCompatibility, type Pet as EnhancedPet } from '@/lib/utils/enhancedCompatibilityScoring';
import RecipeScoreModal from '@/components/RecipeScoreModal';
import { getRandomName, type Pet } from '@/lib/utils/petUtils';
import OneClickCheckoutModal from '@/components/OneClickCheckoutModal';
import { ShoppingList } from '@/components/ShoppingList';

// Cook Mode Component
function CookMode({ recipe, onClose }: { recipe: Recipe; onClose: () => void }) {
   const [currentStep, setCurrentStep] = useState(0);
   const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
   const [timers, setTimers] = useState<Map<number, number>>(new Map());
   const [showCompletion, setShowCompletion] = useState(false);

  const toggleStep = (stepIndex: number) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepIndex)) {
      newCompleted.delete(stepIndex);
    } else {
      newCompleted.add(stepIndex);
    }
    setCompletedSteps(newCompleted);
  };

  const startTimer = (stepIndex: number, duration: number) => {
    const interval = setInterval(() => {
      setTimers(prev => {
        const current = prev.get(stepIndex) || duration;
        if (current <= 1) {
          clearInterval(interval);
          // Could add notification here
          return prev;
        }
        return new Map(prev.set(stepIndex, current - 1));
      });
    }, 1000);

    setTimers(prev => new Map(prev.set(stepIndex, duration)));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-surface-highlight">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-surface-highlight">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Cooking: {recipe.name}</h2>
            <p className="text-gray-400">Step {currentStep + 1} of {recipe?.instructions?.length ?? 0}</p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-icon"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-surface-lighter border-b border-surface-highlight">
          <div className="w-full bg-surface-highlight rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${recipe?.instructions?.length ? ((currentStep + 1) / recipe.instructions.length) * 100 : 0}%` }}
            />
          </div>
          <p className="text-sm text-gray-400 mt-2">
            {completedSteps.size} of {recipe?.instructions?.length ?? 0} steps completed
          </p>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-surface">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Current Step */}
            <div>
              <h3 className="text-xl font-bold text-foreground mb-4">Current Step</h3>
              <div className="bg-blue-900/20 border-l-4 border-blue-500 p-6 rounded-r-lg">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {currentStep + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-lg text-gray-200 leading-relaxed">
                      {recipe?.instructions?.[currentStep] ?? ''}
                    </p>
                    <div className="mt-4 flex items-center gap-4">
                      <button
                        onClick={() => toggleStep(currentStep)}
                        className={completedSteps.has(currentStep) ? 'btn btn-success btn-sm' : 'btn btn-secondary btn-sm'}
                      >
                        {completedSteps.has(currentStep) ? '✓ Completed' : 'Mark Complete'}
                      </button>
                      {typeof recipe?.instructions?.[currentStep] === 'string' &&
                        recipe.instructions[currentStep].toLowerCase().includes('minute') && (
                        <button
                          onClick={() => startTimer(currentStep, 300)} // 5 minutes default
                          className="btn btn-warning btn-sm"
                        >
                          Start Timer
                        </button>
                      )}
                    </div>
                    {timers.has(currentStep) && (
                      <div className="mt-2 text-lg font-mono text-orange-400">
                        ⏱️ {formatTime(timers.get(currentStep)!)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* All Steps */}
            <div>
              <h3 className="text-xl font-bold text-foreground mb-4">All Steps</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {recipe?.instructions?.map((step, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      index === currentStep
                        ? 'bg-blue-900/20 border-blue-500/50'
                        : completedSteps.has(index)
                        ? 'bg-green-900/20 border-green-500/50'
                        : 'bg-surface-lighter border-surface-highlight hover:border-gray-500'
                    }`}
                    onClick={() => setCurrentStep(index)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                        completedSteps.has(index)
                          ? 'bg-green-600 text-white'
                          : index === currentStep
                          ? 'bg-blue-600 text-white'
                          : 'bg-surface-highlight text-gray-400'
                      }`}>
                        {completedSteps.has(index) ? '✓' : index + 1}
                      </div>
                      <p className={`text-sm leading-relaxed text-gray-300 ${
                        index === currentStep ? 'font-medium text-white' : ''
                      }`}>
                        {step}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center p-6 border-t border-surface-highlight bg-surface-lighter">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="btn btn-secondary btn-md"
          >
            Previous
          </button>
          <div className="text-sm text-gray-400">
            Step {currentStep + 1} of {recipe?.instructions?.length ?? 0}
          </div>
          <button
            onClick={() => {
              if (recipe?.instructions && completedSteps.size === recipe.instructions.length) {
                setShowCompletion(true);
                setTimeout(() => setShowCompletion(false), 2000);
              } else {
                const len = recipe?.instructions?.length ?? 0;
                if (len === 0) return;
                setCurrentStep(Math.min(len - 1, currentStep + 1));
              }
            }}
            disabled={
              !recipe?.instructions ||
              (recipe.instructions.length > 0 &&
                currentStep === recipe.instructions.length - 1 &&
                completedSteps.size !== recipe.instructions.length)
            }
            className="btn btn-info btn-md"
          >
            {recipe?.instructions && completedSteps.size === recipe.instructions.length ? 'Meal Complete!' : 'Next'}
          </button>
        </div>
      </div>

      {/* Completion Celebration */}
      {showCompletion && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-surface p-8 rounded-lg text-center animate-bounce border border-green-500/50 shadow-2xl shadow-green-500/20">
            <div className="text-6xl mb-4">🎉✨🎊</div>
            <h2 className="text-2xl font-bold mb-2 text-green-400">Good Job!</h2>
            <p className="text-gray-300">You've completed the recipe!</p>
          </div>
        </div>
      )}
    </div>
  );
}

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
  return updatedPets;
};

// For now we use last_user_id the same way as profile page
const getCurrentUserId = () => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('last_user_id') || '';
};

// Helper function to add affiliate tag to Amazon links
const addAffiliateTag = (url: string) => {
  if (!url || !url.includes('amazon.com')) return url;
  return url + (url.includes('?') ? '&' : '?') + 'tag=robinfrench-20';
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

// Helper function to vet recipe ingredients even without a pet selected
const vetRecipeIngredients = (recipe: Recipe): Recipe => {
  if (!recipe) return recipe;
  
  return {
    ...recipe,
    ingredients: recipe.ingredients.map((ing) => {
      // Remove old amazonLink property
      const { amazonLink, ...ingWithoutOldLink } = ing as any;
      
      // If ingredient already has asinLink, keep it (it's already vetted)
      if (ing.asinLink) {
        return ingWithoutOldLink;
      }
      
      // Try to find vetted product using the ingredient name
      // If the name is a product name (from applyModifiers), try to reverse-lookup
      // by checking if there's an id that might be the original name
      const lookupName = (ing as any).id || ing.name;
      
      let vettedProduct = getVettedProduct(lookupName);
      
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
        return {
          ...ingWithoutOldLink,
          name: vettedProduct.productName,
          productName: vettedProduct.productName,
          asinLink: vettedProduct.asinLink,
        };
      }
      // If no vetted product found, keep ingredient but no ASIN link
      return {
        ...ingWithoutOldLink,
        asinLink: undefined,
      };
    }),
    // Also vet supplements if they exist
    supplements: (recipe as any).supplements?.map((supplement: any) => {
      // Remove old amazonLink property
      const { amazonLink, ...supplementWithoutOldLink } = supplement;
      
      const vettedProduct = getVettedProduct(supplement.name);
      if (vettedProduct) {
        return {
          ...supplementWithoutOldLink,
          name: vettedProduct.productName,
          productName: vettedProduct.productName,
          asinLink: vettedProduct.asinLink,
        };
      }
      // Keep supplement but no ASIN link if no vetted product found
      return {
        ...supplementWithoutOldLink,
        asinLink: undefined,
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
  const [isCookMode, setIsCookMode] = useState(false);
  const [isMealAdded, setIsMealAdded] = useState(false);
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [showModifications, setShowModifications] = useState(false);
  const [userModifications, setUserModifications] = useState('');
  const [communityModifications, setCommunityModifications] = useState<any[]>([]);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [vettedRecipe, setVettedRecipe] = useState<Recipe | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const userId = getCurrentUserId();

  const searchParams = useSearchParams();
  const queryPetId = searchParams?.get('petId') || '';

  const scoreForQueryPet = (() => {
    if (!recipe || !queryPetId) return null;
    const pet = getPetsFromLocalStorage(userId).find((p) => p.id === queryPetId);
    if (!pet) return null;

    // Transform pet data to new rating system format
    const ratingPet: RatingPet = {
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

    // Use enhanced scoring
    try {
      const enhancedPet: EnhancedPet = {
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
      const enhanced = calculateEnhancedCompatibility(recipe, enhancedPet);
      const improvedExplain = scoreRecipeImproved(recipe as any, pet as any);
      // Convert to compatible format
      // Generate reason text that includes issues for better keyword matching
      const getReasonWithIssues = (factor: typeof enhanced.factors.ingredientSafety) => {
        if (factor.issues.length > 0) {
          return factor.issues.join('; ') + (factor.reasoning ? ` (${factor.reasoning})` : '');
        }
        return factor.reasoning || '';
      };

      return {
        overallScore: enhanced.overallScore,
        compatibility: enhanced.grade === 'A+' || enhanced.grade === 'A' ? 'excellent' :
                       enhanced.grade === 'B+' || enhanced.grade === 'B' ? 'good' :
                       enhanced.grade === 'C+' || enhanced.grade === 'C' ? 'fair' : 'poor',
        summaryReasoning: improvedExplain?.summaryReasoning,
        explainRecommendations: improvedExplain?.recommendations || [],
        breakdown: {
          petTypeMatch: { 
            score: enhanced.factors.ingredientSafety.score,
            weight: enhanced.factors.ingredientSafety.weight,
            reason: getReasonWithIssues(enhanced.factors.ingredientSafety)
          },
          ageAppropriate: { 
            score: enhanced.factors.lifeStageFit.score,
            weight: enhanced.factors.lifeStageFit.weight,
            reason: getReasonWithIssues(enhanced.factors.lifeStageFit)
          },
          nutritionalFit: { 
            score: enhanced.factors.nutritionalAdequacy.score,
            weight: enhanced.factors.nutritionalAdequacy.weight,
            reason: getReasonWithIssues(enhanced.factors.nutritionalAdequacy)
          },
          healthCompatibility: { 
            score: enhanced.factors.healthAlignment.score,
            weight: enhanced.factors.healthAlignment.weight,
            reason: getReasonWithIssues(enhanced.factors.healthAlignment)
          },
          allergenSafety: { 
            score: enhanced.factors.allergenSafety.score,
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
    return rateRecipeForPet(recipe, ratingPet);
    }
  })();

  const modifierResultForQueryPet = (() => {
    if (!recipe || !queryPetId) return null;
    const pet = getPetsFromLocalStorage(userId).find((p) => p.id === queryPetId);
    if (!pet) return null;
    return applyModifiers(recipe, pet as any);
  })();

  // Load recipe by dynamic route id
  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const found = allRecipes.find((r) => r.id === id) || null;
    if (found) {
      // Always vet the recipe ingredients to ensure all have purchase links
      const vetted = vetRecipeIngredients(found);
      setRecipe(vetted);
      // Always set vettedRecipe so ShoppingList can use vetted products
      setVettedRecipe(vetted);
    } else {
      setRecipe(null);
      setVettedRecipe(null);
    }
    setIsLoading(false);
  }, [id]); // Only reload recipe when the ID changes, not when pet selection changes

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
    // Check if meal is already added for the current pet
    const currentPet = selectedPetId ? pets.find(p => p.id === selectedPetId) : (queryPetId ? pets.find(p => p.id === queryPetId) : null);
    if (currentPet && recipe) {
      setIsMealAdded(currentPet.mealPlan?.includes(recipe.id) || false);
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
    setIsMealAdded(pet.mealPlan?.includes(recipe.id) || false);

    // Apply modifiers, then vet all ingredients to ensure purchase links
    const { modifiedRecipe } = applyModifiers(recipe, pet);
    const vetted = vetRecipeIngredients(modifiedRecipe);
    setVettedRecipe(vetted);
  }, [selectedPetId, pets, recipe]);

  // Load community modifications
  useEffect(() => {
    if (!id) return;
    
    try {
      const stored = localStorage.getItem(`recipe_modifications_${id}`);
      if (stored) {
        const modifications = JSON.parse(stored);
        setCommunityModifications(Array.isArray(modifications) ? modifications : []);
      } else {
        setCommunityModifications([]);
      }
    } catch (error) {
      // Handle parse errors gracefully
      console.error('Failed to load community modifications:', error);
      setCommunityModifications([]);
    }
  }, [id]);

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

    // Check if already added
    if (currentPet.mealPlan?.includes(recipe.id)) {
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

  const guidelines =
    NUTRITION_GUIDELINES[recipe.category as CategoryType] ||
    ({ protein: 'N/A', fat: 'N/A', fiber: 'N/A' } as const);

  // Render Cook Mode
  if (isCookMode && recipe) {
    return <CookMode recipe={recipe} onClose={() => setIsCookMode(false)} />;
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <main className="lg:col-span-2">
            {/* Recipe Info Card */}
            <div className="bg-surface rounded-2xl shadow-xl overflow-hidden mb-8 border border-surface-highlight">
              <div className="p-8">
                <h1 className="text-4xl font-extrabold text-foreground mb-2 tracking-tight">
                  {recipe.name}
                </h1>
                {queryPetId && (
                  <div className="mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-900/40 text-blue-200 border border-blue-700/50">
                      Tailored for {getRandomName(getPetsFromLocalStorage(userId).find((p) => p.id === queryPetId)?.names || []) || 'your pet'}
                    </span>
                  </div>
                )}

                {/* Pet Compatibility Rating - Using NEW system */}
                {scoreForQueryPet && (
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
                        Compatibility: <strong>{scoreForQueryPet.overallScore}%</strong>
                      </div>
                      {scoreForQueryPet.compatibility === 'excellent' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/40 text-green-200 ml-2 border border-green-700/50">
                          🏆 Excellent Match
                        </span>
                      )}
                      {scoreForQueryPet.compatibility === 'good' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900/40 text-blue-200 ml-2 border border-blue-700/50">
                          👍 Good Match
                        </span>
                      )}
                      {scoreForQueryPet.compatibility === 'fair' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-900/40 text-yellow-200 ml-2 border border-yellow-700/50">
                          ⚖️ Fair Match
                        </span>
                      )}
                      {scoreForQueryPet.compatibility === 'poor' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-900/40 text-red-200 ml-2 border border-red-700/50">
                          ⚠️ Poor Match
                        </span>
                      )}
                    </button>
                    <Tooltip
                      content={`Compatibility: ${scoreForQueryPet.compatibility}\n\n${scoreForQueryPet.strengths.length > 0 ? 'Strengths:\n' + scoreForQueryPet.strengths.join('\n') : ''}${scoreForQueryPet.warnings.length > 0 ? '\n\nWarnings:\n' + scoreForQueryPet.warnings.join('\n') : ''}`}
                    >
                      <div className="text-xs text-gray-500 cursor-help hover:text-gray-300">
                        Why
                      </div>
                    </Tooltip>
                  </div>
                )}

                {scoreForQueryPet?.summaryReasoning && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-4">
                    <div className="flex items-start gap-2">
                      <span className="text-lg">ℹ️</span>
                      <p className="text-sm text-blue-900">{scoreForQueryPet.summaryReasoning}</p>
                    </div>
                  </div>
                )}
                {scoreForQueryPet?.explainRecommendations && scoreForQueryPet.explainRecommendations.length > 0 && (
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mb-4">
                    <div className="flex items-start gap-2">
                      <span className="text-lg">💡</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-amber-900 mb-2">Suggestions:</h4>
                        <ul className="text-sm text-amber-800 space-y-1">
                          {scoreForQueryPet.explainRecommendations.map((rec: string, i: number) => (
                            <li key={i}>• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}




                <p className="text-gray-300 mb-8 leading-relaxed text-lg">
                  {recipe.description}
                </p>

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
                    
                    return (
                      <div className="space-y-6">
                        {/* Ingredients with ASIN links - show buy buttons */}
                        {ingredientsWithASINs.length > 0 && (
                          <ShoppingList
                            ingredients={ingredientsWithASINs.map((ing: any) => ({
                              id: ing.id,
                              name: (ing.productName || ing.name),
                              amount: ing.amount || '',
                              asinLink: addAffiliateTag(ing.asinLink)
                            }))}
                            recipeName={recipe.name}
                            userId={userId}
                          />
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
                                    <div className="font-medium text-gray-200">{ing.productName || ing.name}</div>
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
                <div className="relative">
                  {(() => {
                    const supplementsWithASINs = ((recipe as any).supplements || []).filter((s: any) => s.asinLink);
                    if (supplementsWithASINs.length > 0) {
                      return (
                        <ShoppingList
                          ingredients={supplementsWithASINs.map((supplement: any) => ({
                            id: supplement.id || supplement.name,
                            name: supplement.productName || supplement.name,
                            amount: supplement.amount || '',
                            asinLink: addAffiliateTag(supplement.asinLink)
                          }))}
                          recipeName={`${recipe.name} supplements`}
                          userId={userId}
                        />
                      );
                    } else {
                      const recipeSupplements = (recipe as any).supplements || [];
                      if (recipeSupplements.length === 0) {
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
                      } else {
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
                                      <h5 className="font-semibold text-gray-200">{supplement.productName || supplement.name}</h5>
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
                        href={addAffiliateTag(add.amazon)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-black hover:text-black flex items-center font-semibold bg-green-900/30 px-3 py-1 rounded-full hover:shadow-sm transition-all duration-200 border border-green-700/50"
                      >
                        Buy <ChevronsRight className="w-4 h-4 ml-1" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-surface rounded-2xl shadow-lg p-8 border border-surface-highlight">
              <h3 className="text-2xl font-bold text-foreground mb-6 border-b border-surface-highlight pb-4">
                Preparation
              </h3>
              <ol className="space-y-6">
                {recipe.instructions.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-secondary-900/50 border border-secondary-700 text-secondary-200 rounded-full flex items-center justify-center font-bold mr-4 mt-1">
                      {index + 1}
                    </span>
                    <span className="text-gray-300 text-lg leading-relaxed">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

          </main>

          <aside className="lg:col-span-1 space-y-8">
            {/* Health Breakdown Panel */}
            {scoreForQueryPet && (
              <div className="bg-surface rounded-2xl shadow-lg p-6 border-l-4 border-green-500 border border-surface-highlight">
                <h4 className="text-lg font-bold mb-4 flex items-center text-gray-200">
                  <span className="text-2xl mr-2">🏥</span>
                  Health Breakdown
                </h4>
                <div className="space-y-2">
                  {Object.entries(scoreForQueryPet.breakdown).map(([key, factor]) => {
                    const f = factor as { score: number; weight: number; reason?: string };
                    const reasonLower = (f.reason || '').toLowerCase();
                    const score = f.score || 0;
                    const weight = f.weight || 0;

                    // Check reason text for keywords
                    const isLow = ['too low', 'low', 'deficient', 'insufficient', 'lacking', 'below', 'may be too low'].some(term =>
                      reasonLower.includes(term)
                    );
                    const isHigh = ['too high', 'high', 'excess', 'elevated', 'above', 'may be too high'].some(term =>
                      reasonLower.includes(term)
                    );
                    const isHazard = ['toxic', 'unsafe', 'risk', 'hazard', 'problem', 'issue', 'adverse', 'should be avoided', 'avoid', 'not suitable'].some(term =>
                      reasonLower.includes(term)
                    );

                    // Also check score thresholds if reason doesn't have keywords
                    let icon = '';
                    if (isLow || (score < 50 && !isHigh && !isHazard)) {
                      icon = '🔻';
                    } else if (isHigh) {
                      icon = '🔺';
                    } else if (isHazard || score < 30) {
                      icon = '⚠️';
                    }

                    // Only show items with issues (low score or negative keywords)
                    if (!icon || score >= 70) return null;

                    // Format tooltip content with detailed data
                    const factorName = key.replace(/([A-Z])/g, ' $1').toLowerCase();
                    const tooltipContent = `Score: ${score}%\nWeight: ${(weight * 100).toFixed(0)}%\n\n${f.reason || 'No additional details available'}`;

                    return (
                      <Tooltip key={key} content={tooltipContent}>
                        <div className="flex items-center gap-2 p-2 bg-surface-lighter rounded-lg border border-surface-highlight cursor-help hover:bg-surface-highlight transition-colors">
                          <span className="text-sm">{icon}</span>
                          <span className="text-gray-300 text-sm capitalize">
                            {factorName}
                          </span>
                        </div>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recipe Rating Section - Moved to Sidebar */}
            <RecipeRatingSection
              recipeId={id || ''}
              recipeName={recipe.name}
              userId={userId}
            />

            {/* Community Modifications */}
            <div className="bg-surface rounded-2xl shadow-lg p-8 border border-surface-highlight">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-foreground">Community Modifications</h3>
                <button
                  onClick={() => setShowModifications(!showModifications)}
                  className="btn btn-primary btn-md btn-ripple"
                >
                  {showModifications ? 'Hide' : 'Share My Changes'}
                </button>
              </div>

              {/* Share Modifications Form */}
              {showModifications && (
                <div className="border border-surface-highlight rounded-lg p-6 mb-8 bg-surface-lighter">
                  <h4 className="text-lg font-semibold text-foreground mb-4">Share Your Recipe Modifications</h4>
                  <p className="text-gray-400 mb-4">
                    Help other pet parents by sharing how you modified this recipe for your pet's needs.
                  </p>
                  <textarea
                    value={userModifications}
                    onChange={(e) => setUserModifications(e.target.value)}
                    placeholder="e.g., Reduced chicken by 25% and added more sweet potato for better digestion. My cat loved it!"
                    className="w-full px-4 py-3 border border-surface-highlight bg-surface text-foreground rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-4 placeholder-gray-600"
                    rows={4}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        if (userModifications.trim() && userId) {
                          const modification = {
                            userId,
                            userName: 'Anonymous Pet Parent', // In real app, get from user profile
                            modifications: userModifications.trim(),
                            timestamp: new Date().toISOString(),
                            helpful: 0
                          };

                          const existing = JSON.parse(localStorage.getItem(`recipe_modifications_${id}`) || '[]');
                          existing.unshift(modification);
                          localStorage.setItem(`recipe_modifications_${id}`, JSON.stringify(existing));
                          setCommunityModifications(existing);
                          setUserModifications('');
                          setShowModifications(false);
                          setMessage('Thanks for sharing your modifications! 🎉');
                          setTimeout(() => setMessage(null), 3000);
                        }
                      }}
                      className="btn btn-primary btn-md btn-ripple"
                    >
                      Share with Community
                    </button>
                    <button
                      onClick={() => setShowModifications(false)}
                      className="btn btn-secondary btn-md"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Community Modifications List */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-foreground">
                  What Other Pet Parents Changed ({communityModifications.length})
                </h4>

                {communityModifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No modifications shared yet.</p>
                    <p className="text-sm mt-2">Be the first to share how you adapted this recipe!</p>
                  </div>
                ) : (
                  communityModifications.map((mod: any, index: number) => (
                    <div key={index} className="border border-surface-highlight rounded-lg p-4 bg-surface-lighter">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-900/30 rounded-full flex items-center justify-center border border-primary-800">
                            <span className="text-primary-400 font-semibold text-sm">
                              {mod.userName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-200">{mod.userName}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(mod.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <button className="btn btn-ghost btn-icon-sm">
                          <span className="text-sm">👍</span>
                          <span className="text-sm ml-1">{mod.helpful || 0}</span>
                        </button>
                      </div>
                      <p className="text-gray-300 leading-relaxed">{mod.modifications}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-surface rounded-2xl shadow-lg p-6 space-y-4 border border-surface-highlight">
              <button
                onClick={handleAddToMealPlan}
                disabled={isMealAdded || isAddingMeal}
                className={`btn btn-success btn-lg btn-full ${
                  isMealAdded 
                    ? 'opacity-50 cursor-not-allowed' 
                    : isAddingMeal 
                      ? 'btn-loading' 
                      : 'btn-ripple'
                }`}
              >
                {isMealAdded ? 'Meal Added!' : isAddingMeal ? 'Adding...' : '+Add Meal'}
              </button>

              <button
                onClick={() => setIsCookMode(true)}
                className="btn btn-darkgreen btn-lg btn-full btn-ripple"
              >
                👨‍🍳 Start Cooking
              </button>
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
              name: (ing.productName || ing.name),
              asinLink: addAffiliateTag(ing.asinLink),
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