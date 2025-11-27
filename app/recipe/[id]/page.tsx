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
} from 'lucide-react';

import { recipes as allRecipes } from '@/lib/data/recipes-complete';
import type { Recipe, ModifiedRecipeResult } from '@/lib/types';
import { scoreRecipe } from '@/lib/scoreRecipe';
import { applyModifiers } from '@/lib/applyModifiers';
import { petSupplements } from '@/lib/data/supplements';
import Tooltip from '@/components/Tooltip';
import { RecipeRatingSection } from '@/components/RecipeRatingSection';
import { RatingBreakdown } from '@/components/RatingBreakdown';
import { rateRecipeForPet, type Pet as RatingPet } from '@/lib/utils/petRatingSystem';
import RecipeScoreModal from '@/components/RecipeScoreModal';
import { getRandomName, type Pet } from '@/lib/utils/petUtils';
import ImageComponent from '@/components/Image';

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
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Cooking: {recipe.name}</h2>
            <p className="text-gray-600">Step {currentStep + 1} of {recipe.instructions.length}</p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-icon"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / recipe.instructions.length) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {completedSteps.size} of {recipe.instructions.length} steps completed
          </p>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Current Step */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Current Step</h3>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {currentStep + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-lg text-gray-900 leading-relaxed">
                      {recipe.instructions[currentStep]}
                    </p>
                    <div className="mt-4 flex items-center gap-4">
                      <button
                        onClick={() => toggleStep(currentStep)}
                        className={completedSteps.has(currentStep) ? 'btn btn-success btn-sm' : 'btn btn-secondary btn-sm'}
                      >
                        {completedSteps.has(currentStep) ? '✓ Completed' : 'Mark Complete'}
                      </button>
                      {recipe.instructions[currentStep].toLowerCase().includes('minute') && (
                        <button
                          onClick={() => startTimer(currentStep, 300)} // 5 minutes default
                          className="btn btn-warning btn-sm"
                        >
                          Start Timer
                        </button>
                      )}
                    </div>
                    {timers.has(currentStep) && (
                      <div className="mt-2 text-lg font-mono text-orange-600">
                        ⏱️ {formatTime(timers.get(currentStep)!)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* All Steps */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">All Steps</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recipe.instructions.map((step, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      index === currentStep
                        ? 'bg-blue-50 border-blue-300'
                        : completedSteps.has(index)
                        ? 'bg-green-50 border-green-300'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setCurrentStep(index)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                        completedSteps.has(index)
                          ? 'bg-green-600 text-white'
                          : index === currentStep
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-300 text-gray-700'
                      }`}>
                        {completedSteps.has(index) ? '✓' : index + 1}
                      </div>
                      <p className={`text-sm leading-relaxed ${
                        index === currentStep ? 'font-medium' : ''
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
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="btn btn-secondary btn-md"
          >
            Previous
          </button>
          <div className="text-sm text-gray-600">
            Step {currentStep + 1} of {recipe.instructions.length}
          </div>
          <button
            onClick={() => {
              if (completedSteps.size === recipe.instructions.length) {
                setShowCompletion(true);
                setTimeout(() => setShowCompletion(false), 2000);
              } else {
                setCurrentStep(Math.min(recipe.instructions.length - 1, currentStep + 1));
              }
            }}
            disabled={currentStep === recipe.instructions.length - 1 && completedSteps.size !== recipe.instructions.length}
            className="btn btn-info btn-md"
          >
            {completedSteps.size === recipe.instructions.length ? 'Meal Complete!' : 'Next'}
          </button>
        </div>
      </div>

      {/* Completion Celebration */}
      {showCompletion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg text-center animate-bounce">
            <div className="text-6xl mb-4">🎉✨🎊</div>
            <h2 className="text-2xl font-bold mb-2 text-green-600">Good Job!</h2>
            <p className="text-gray-700">You've completed the recipe!</p>
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
  const key = concern.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
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
  const [showModifications, setShowModifications] = useState(false);
  const [userModifications, setUserModifications] = useState('');
  const [communityModifications, setCommunityModifications] = useState<any[]>([]);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [vettedRecipe, setVettedRecipe] = useState<Recipe | null>(null);

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

    return rateRecipeForPet(recipe, ratingPet);
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
    setRecipe(found);
    setIsLoading(false);
  }, [id]);

  // Load pets & saved state
  useEffect(() => {
    if (!userId || !id) return;

    const loadedPets = getPetsFromLocalStorage(userId);
    setPets(loadedPets);
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
      setVettedRecipe(null);
      return;
    }

    const pet = pets.find((p) => p.id === selectedPetId);
    if (!pet) return;
    setPetWeight(pet.weight || '');
    setPetAllergies(pet.allergies?.join(', ') || '');
    setModifierResult(null);
    setModifierError(null);
    setIsMealAdded(pet.mealPlan?.includes(recipe.id) || false);

    // Apply modifiers to get vetted ingredients
    const { modifiedRecipe } = applyModifiers(recipe, pet);
    setVettedRecipe(modifiedRecipe);
  }, [selectedPetId, pets, recipe]);

  // Load community modifications
  useEffect(() => {
    if (id) {
      const modifications = JSON.parse(localStorage.getItem(`recipe_modifications_${id}`) || '[]');
      setCommunityModifications(modifications);
    }
  }, [id]);

  const handleAddToMealPlan = useCallback(() => {
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
      console.error(error);
      setModifierError('Unable to personalize this meal right now.');
      setModifierResult(null);
    } finally {
      setIsPersonalizing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold text-gray-700">
        Loading meal...
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-gray-50">
        <h1 className="text-3xl font-bold text-red-600">Meal not found</h1>
        <p className="text-gray-600">We couldn't find a meal for this link.</p>
        <Link
          href="/profile"
          className="text-secondary-600 font-semibold"
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
    <div className="min-h-screen bg-gray-50 py-12 font-sans text-gray-900">
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
          className="inline-flex items-center text-gray-600 mb-6 font-medium"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to My Pets
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <main className="lg:col-span-2">
            {/* Hero Image */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
              <div className="relative h-96 w-full">
                <ImageComponent
                  src={recipe.images?.hero}
                  variant="hero"
                  alt={recipe.name}
                  className="w-full h-full object-cover"
                  fallbackSrc={recipe.imageUrl || 'https://placehold.co/800x600?text=Meal+Image'}
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm">
                  {recipe.category.toUpperCase()}
                </div>
              </div>
              <div className="p-8">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
                  {recipe.name}
                </h1>
                {queryPetId && (
                  <div className="mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
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
                            className={`w-5 h-5 ${i < Math.round(scoreForQueryPet.overallScore / 20) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-700 ml-2">
                        Compatibility: <strong>{scoreForQueryPet.overallScore}%</strong>
                      </div>
                      {scoreForQueryPet.compatibility === 'excellent' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                          🏆 Excellent Match
                        </span>
                      )}
                      {scoreForQueryPet.compatibility === 'good' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2">
                          👍 Good Match
                        </span>
                      )}
                      {scoreForQueryPet.compatibility === 'fair' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 ml-2">
                          ⚖️ Fair Match
                        </span>
                      )}
                      {scoreForQueryPet.compatibility === 'poor' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 ml-2">
                          ⚠️ Poor Match
                        </span>
                      )}
                    </button>
                    <Tooltip
                      content={`Compatibility: ${scoreForQueryPet.compatibility}\n\n${scoreForQueryPet.strengths.length > 0 ? 'Strengths:\n' + scoreForQueryPet.strengths.join('\n') : ''}${scoreForQueryPet.warnings.length > 0 ? '\n\nWarnings:\n' + scoreForQueryPet.warnings.join('\n') : ''}`}
                    >
                      <div className="text-xs text-gray-500 cursor-help">
                        Why
                      </div>
                    </Tooltip>
                  </div>
                )}


                {/* Celebrity Quote */}
                {recipe.celebrityQuote && recipe.celebrityName && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 p-6 mb-8 rounded-xl relative">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <img
                          src={`/images/celebrity-pets/${recipe.celebrityName.replace(/ /g, '_')}/${recipe.celebrityName.replace(/ /g, '_')}.png`}
                          alt={recipe.celebrityName}
                          className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                          onError={(e) => {
                            // Fallback to image_1.png if the named image fails to load
                            if (recipe.celebrityName) {
                              (e.target as HTMLImageElement).src = `/images/celebrity-pets/${recipe.celebrityName.replace(/ /g, '_')}/image_1.png`;
                              (e.target as HTMLImageElement).onerror = () => {
                                // Final fallback to a random celebrity pet image
                                // Get appropriate pets for this recipe category
                                const petsByType: Record<string, string[]> = {
                                  dogs: ['Bark_Obama', 'Brad_Pitt_Bull', 'George_Clooney_Dog', 'Pooch_Clooney', 'Corgi_Elizabeth'],
                                  cats: [], // No cat images, will fallback
                                  birds: [], // No bird images, will fallback
                                  reptiles: [], // No reptile images, will fallback
                                  'pocket-pets': [
                                    'Admiral_Ackbar_Hamster', 'Anakin_Skywalker_Gerbil', 'Anderson_Pooper_Hamster',
                                    'Biggs_Darklighter_Chinchilla', 'Boba_Fett_Gerbil', 'Bunny_Shapiro',
                                    'C-3PO_Rabbit', 'Chewbacca_Ferret', 'Chinchilla_Clinton', 'Chris_Cuomo_Chinchilla',
                                    'Conan_O\'Bunny', 'Darth_Vader_Gerbil', 'David_Letterferet',
                                    'Don_Lemon_Guinea', 'Dr._Oz_Hamster', 'Dr._Phil_Ferret', 'Ellen_DeGenerhams',
                                    'Ferret_Fawcett', 'Gerbil_Streep', 'Greedo_Rabbit',
                                    'Guinea_Pig_Pitt', 'Hamela_Anderson', 'Hammy_Kimmel', 'Ham_Solo', 'Han_Solo_Chinchilla',
                                    'Jabba_the_Hutt_Chinchilla', 'Jake_Tapperguinea', 'Jar_Jar_Binks_Hamster',
                                    'Jay_Leno_Chinchilla', 'Jimmy_Ferret-lon', 'Lando_Calrissian_Ferret',
                                    'Luke_Skywalker_Hamster', 'Mace_Windu_Rabbit', 'Mon_Mothma_Ferret', 'Obi-Wan_Kenobi_Ferret',
                                    'Oprah_Winferbun', 'Padmé_Amidala_Chinchilla', 'Poe_Dameron_Rabbit',
                                    'Princess_Leia_Guinea', 'Qui-Gon_Jinn_Guinea', 'R2-D2_Guinea', 'Rachel_Hay_Maddow',
                                    'Stephen_Hambert', 'Wedge_Antilles_Gerbil', 'Wicket_the_Ewok_Guinea', 'Wolf_Blitzhamster',
                                    'Yoda_Hamster'
                                  ]
                                };

                                const petTypeMap: Record<string, keyof typeof petsByType> = {
                                  'dogs': 'dogs',
                                  'cats': 'pocket-pets',
                                  'birds': 'pocket-pets',
                                  'reptiles': 'pocket-pets',
                                  'pocket-pets': 'pocket-pets'
                                };

                                const petType = petTypeMap[recipe.category] || 'pocket-pets';
                                let availablePets = petsByType[petType];

                                if (availablePets.length === 0) {
                                  // Ultimate fallback to any available pet
                                  availablePets = Object.values(petsByType).flat();
                                }

                                const randomFolder = availablePets[Math.floor(Math.random() * availablePets.length)];
                                (e.target as HTMLImageElement).src = `/images/celebrity-pets/${randomFolder}/${randomFolder}.png`;
                                (e.target as HTMLImageElement).onerror = () => {
                                  // Ultimate fallback to default image
                                  (e.target as HTMLImageElement).src = '/images/dog-core-icon-master.png';
                                };
                              };
                            }
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <span className="absolute top-2 left-2 text-4xl text-blue-200">
                          "
                        </span>
                        <p className="italic text-gray-700 text-lg relative z-10 leading-relaxed">
                          {recipe.celebrityQuote}
                        </p>
                        <p className="text-right font-bold text-blue-700 mt-3">
                          - {recipe.celebrityName}
                        </p>
                      </div>
                    </div>
                  </div>
                )}


                <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                  {recipe.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-8">
                  {recipe.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium border border-gray-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

              </div>
            </div>

            {/* Ingredients & Supplements Tabs */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  onClick={() => setActiveTab('ingredients')}
                  className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
                    activeTab === 'ingredients'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Ingredients
                </button>
                <button
                  onClick={() => setActiveTab('supplements')}
                  className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
                    activeTab === 'supplements'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Supplements
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'ingredients' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Ingredients
                    </h3>
                  </div>
                  <ul className="space-y-4">
                    {(vettedRecipe?.ingredients || recipe.ingredients).map((ing) => (
                      <li
                        key={ing.id}
                        className="flex justify-between items-center p-3 rounded-lg"
                      >
                        <div className="flex-1">
                          <span className="text-gray-700 font-medium text-lg">
                            {ing.productName || ing.name}
                          </span>
                          {ing.productName && ing.productName !== ing.name && (
                            <div className="text-sm text-gray-500 mt-1">
                              (Generic: {ing.name})
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-orange-600 font-bold">
                            {ing.amount}
                          </span>
                          {ing.amazonLink ? (
                            <a
                              href={addAffiliateTag(ing.amazonLink)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 flex items-center font-semibold bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100"
                            >
                              Buy <ChevronsRight className="w-4 h-4 ml-1" />
                            </a>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === 'supplements' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Recipe Supplements
                    </h3>
                    {(() => {
                      const supplementsWithLinks = (recipe.supplements || []).filter(s => s.amazonLink);
                      return supplementsWithLinks.length > 0 ? (
                        <button
                          onClick={() => {
                            supplementsWithLinks.forEach(supplement => {
                              if (supplement.amazonLink) {
                                window.open(addAffiliateTag(supplement.amazonLink), '_blank');
                              }
                            });
                          }}
                          className="btn btn-warning btn-md btn-ripple"
                        >
                          Buy All Supplements
                          <ChevronsRight className="w-4 h-4 ml-2" />
                        </button>
                      ) : null;
                    })()}
                  </div>
                  <div className="space-y-6">
                    {(() => {
                      const recipeSupplements = recipe.supplements || [];

                      if (recipeSupplements.length === 0) {
                        return (
                          <div className="text-center py-8 text-gray-500">
                            <p>This recipe doesn't include specific supplements.</p>
                            <p className="text-sm mt-2">Check the ingredients tab for all components.</p>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-4">
                          {recipeSupplements.map((supplement, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h5 className="font-semibold text-gray-900">{supplement.productName || supplement.name}</h5>
                                  {supplement.productName && supplement.productName !== supplement.name && (
                                    <div className="text-sm text-gray-500 mt-1">
                                      (Generic: {supplement.name})
                                    </div>
                                  )}
                                  <p className="text-sm text-gray-600 mt-1">{supplement.notes || 'Health supplement for optimal nutrition'}</p>
                                </div>
                                <div className="flex items-center gap-4 ml-4">
                                  <span className="text-orange-600 font-bold">
                                    {supplement.amount}
                                  </span>
                                  {supplement.amazonLink && (
                                    <a
                                      href={addAffiliateTag(supplement.amazonLink)}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center font-semibold bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100"
                                    >
                                      Buy <ChevronsRight className="w-4 h-4 ml-1" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>

            {modifierResultForQueryPet && modifierResultForQueryPet.addedIngredients.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">
                  Recommended Additions
                </h3>
                <ul className="space-y-4">
                  {modifierResultForQueryPet.addedIngredients.map((add) => (
                    <li
                      key={add.name}
                      className="flex justify-between items-center p-3 bg-green-50 rounded-lg transition-colors"
                    >
                      <div>
                        <span className="text-gray-700 font-medium text-lg">
                          {add.name}
                        </span>
                        <p className="text-sm text-gray-600">{add.benefit}</p>
                        <p className="text-xs text-green-700">Added for {add.forConcern}</p>
                      </div>
                      <a
                        href={addAffiliateTag(add.amazon)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center font-semibold bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
                      >
                        Buy <ChevronsRight className="w-4 h-4 ml-1" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">
                Preparation
              </h3>
              <ol className="space-y-6">
                {recipe.instructions.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-secondary-100 text-secondary-600 rounded-full flex items-center justify-center font-bold mr-4 mt-1">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 text-lg leading-relaxed">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Recipe Rating Section */}
            <RecipeRatingSection
              recipeId={id || ''}
              recipeName={recipe.name}
              userId={userId}
            />

            {/* Community Modifications */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Community Modifications</h3>
                <button
                  onClick={() => setShowModifications(!showModifications)}
                  className="btn btn-primary btn-md btn-ripple"
                >
                  {showModifications ? 'Hide' : 'Share My Changes'}
                </button>
              </div>

              {/* Share Modifications Form */}
              {showModifications && (
                <div className="border border-gray-200 rounded-lg p-6 mb-8 bg-gray-50">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Share Your Recipe Modifications</h4>
                  <p className="text-gray-600 mb-4">
                    Help other pet parents by sharing how you modified this recipe for your pet's needs.
                  </p>
                  <textarea
                    value={userModifications}
                    onChange={(e) => setUserModifications(e.target.value)}
                    placeholder="e.g., Reduced chicken by 25% and added more sweet potato for better digestion. My cat loved it!"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-4"
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
                <h4 className="text-lg font-semibold text-gray-900">
                  What Other Pet Parents Changed ({communityModifications.length})
                </h4>

                {communityModifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No modifications shared yet.</p>
                    <p className="text-sm mt-2">Be the first to share how you adapted this recipe!</p>
                  </div>
                ) : (
                  communityModifications.map((mod: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-semibold text-sm">
                              {mod.userName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{mod.userName}</div>
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
                      <p className="text-gray-700 leading-relaxed">{mod.modifications}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </main>

          <aside className="lg:col-span-1 space-y-8 sticky top-8 h-fit">
            {/* Health Breakdown Panel */}
            {scoreForQueryPet && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
                <h4 className="text-lg font-bold mb-4 flex items-center text-gray-800">
                  <span className="text-2xl mr-2">🏥</span>
                  Health Breakdown
                </h4>
                <div className="space-y-3">
                  {/* Strengths */}
                  {scoreForQueryPet.strengths.map((strength, index) => (
                    <div key={`strength-${index}`} className="flex items-start gap-3">
                      <span className="text-green-600 text-lg">✅</span>
                      <span className="text-gray-700 text-sm">{strength}</span>
                    </div>
                  ))}

                  {/* Warnings */}
                  {scoreForQueryPet.warnings.map((warning, index) => (
                    <div key={`warning-${index}`} className="flex items-start gap-3">
                      <span className="text-amber-600 text-lg">⚠️</span>
                      <span className="text-gray-700 text-sm">{warning}</span>
                    </div>
                  ))}

                  {/* Breakdown Details */}
                  {Object.entries(scoreForQueryPet.breakdown).map(([key, factor]) => {
                    const f = factor as { score: number; weight: number; reason: string };
                    const isPositive = f.score >= 70;
                    const isNeutral = f.score >= 40 && f.score < 70;
                    const isNegative = f.score < 40;

                    return (
                      <Tooltip key={key} content={f.reason}>
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            {isPositive && <span className="text-green-600 text-sm">👍</span>}
                            {isNeutral && <span className="text-yellow-600 text-sm">⚖️</span>}
                            {isNegative && <span className="text-red-600 text-sm">👎</span>}
                            <span className="text-gray-700 text-sm capitalize">
                              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className={`font-semibold text-sm ${isPositive ? 'text-green-600' : isNeutral ? 'text-yellow-600' : 'text-red-600'}`}>
                              {f.score}%
                            </span>
                          </div>
                        </div>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
              <button
                onClick={handleAddToMealPlan}
                disabled={isMealAdded}
                className={`btn btn-success btn-lg btn-full ${isMealAdded ? 'btn-loading' : 'btn-ripple'}`}
              >
                {isMealAdded ? 'Meal Added!' : '➕ Add Meal'}
              </button>

              <button
                onClick={() => setIsCookMode(true)}
                className="btn btn-warning btn-lg btn-full btn-ripple"
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
    </div>
  );
}

