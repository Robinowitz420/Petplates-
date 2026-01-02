'use client';

import { useState, useMemo } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Star, ArrowUp } from 'lucide-react';
import { createPortal } from 'react-dom';
import Image, { type StaticImageData } from 'next/image';
import { INGREDIENT_COMPOSITIONS, getIngredientComposition, type IngredientComposition } from '@/lib/data/ingredientCompositions';
import { getFallbackNutrition } from '@/lib/utils/nutritionFallbacks';
import MeatBanner from '@/public/images/Site Banners/Meat.png';
import VegetablesBanner from '@/public/images/Site Banners/Vegetables.png';
import FruitsBanner from '@/public/images/Site Banners/Fruits.png';
import GrainsBanner from '@/public/images/Site Banners/Grains.png';
import SupplementsBanner from '@/public/images/Site Banners/Supplements.png';

interface Category {
  name: string;
  description: string;
  icon: string;
  ingredients: string[];
  required: boolean;
}

interface MealBuilderWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (selections: { [category: string]: string[] }) => void;
  categories: {
    proteins: Category;
    grains: Category;
    greens: Category;
    fruits: Category;
    supplements: Category;
  };
  petName: string;
  petType?: string; // Pet species type (dogs, cats, pocket-pets, etc.)
  recommendedIngredients?: string[]; // List of recommended ingredient names
}

const CATEGORY_ORDER = ['proteins', 'grains', 'greens', 'fruits', 'supplements'] as const;

/**
 * Get the highest nutrient value for an ingredient
 * Returns the nutrient name and a normalized value for comparison
 */
function getTopNutrients(ingredientName: string, count: number = 3): Array<{ name: string; value: number }> {
  // Normalize ingredient name
  const normalized = ingredientName.toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_');
  
  // Try to get composition
  let composition: IngredientComposition | null = INGREDIENT_COMPOSITIONS[normalized] || null;
  if (!composition) {
    composition = getIngredientComposition(ingredientName) || null;
  }
  if (!composition) {
    // Try fallback
    composition = getFallbackNutrition(ingredientName);
  }
  
  if (!composition) return [];
  
  // Define nutrients to check with their display names and normalization factors
  const nutrients = [
    { key: 'protein', name: 'Protein', value: composition.protein || 0, factor: 1 },
    { key: 'fat', name: 'Fat', value: composition.fat || 0, factor: 1 },
    { key: 'fiber', name: 'Fiber', value: composition.fiber || 0, factor: 1 },
    { key: 'calcium', name: 'Calcium', value: (composition.calcium || 0) / 100, factor: 100 }, // Convert mg to g for comparison
    { key: 'omega3', name: 'Omega-3', value: composition.omega3 || 0, factor: 1 },
    { key: 'taurine', name: 'Taurine', value: (composition.taurine || 0) / 100, factor: 100 }, // Convert mg to g
    { key: 'vitaminA', name: 'Vitamin A', value: (composition.vitaminA || 0) / 1000, factor: 1000 }, // Convert IU to thousands
    { key: 'vitaminC', name: 'Vitamin C', value: (composition.vitaminC || 0) / 100, factor: 100 }, // Convert mg to g
  ];
  
  // Calculate normalized values and filter out insignificant ones
  const nutrientsWithNormalized = nutrients
    .map(nutrient => ({
      ...nutrient,
      normalizedValue: nutrient.value * nutrient.factor
    }))
    .filter(nutrient => nutrient.normalizedValue > 0.1); // Only include significant values
  
  // Sort by normalized value (descending) and take top N
  const topNutrients = nutrientsWithNormalized
    .sort((a, b) => b.normalizedValue - a.normalizedValue)
    .slice(0, count)
    .map(nutrient => ({
      name: nutrient.name,
      value: nutrient.value
    }));
  
  return topNutrients;
}

export default function MealBuilderWizard({
  isOpen,
  onClose,
  onComplete,
  categories,
  petName,
  petType,
  recommendedIngredients = []
}: MealBuilderWizardProps) {
  const skipProteins = !categories.proteins.required || categories.proteins.ingredients.length === 0;
  const skipFruits = petType && ['dogs', 'cats', 'dog', 'cat'].includes(petType.toLowerCase());
  const stepOrder = CATEGORY_ORDER.filter((key) => {
    if (skipProteins && key === 'proteins') return false;
    if (skipFruits && key === 'fruits') return false;
    return true;
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<{ [key: string]: string[] }>({
    proteins: [],
    grains: [],
    greens: [],
    fruits: [],
    supplements: []
  });

  if (!isOpen) return null;

  const currentCategoryKey = stepOrder[currentStep];
  const currentCategory = categories[currentCategoryKey];
  const isRequired = currentCategory.required;
  const currentSelections = selections[currentCategoryKey] || [];
  const hasSelection = currentSelections.length > 0;
  const hasIngredients = currentCategory.ingredients.length > 0;
  // Allow proceeding if: not required, OR has selection, OR required but no ingredients available
  const canProceed = !isRequired || hasSelection || !hasIngredients;
  const isLastStep = currentStep === stepOrder.length - 1;

  const handleSelect = (ingredient: string) => {
    setSelections(prev => {
      const current = prev[currentCategoryKey] || [];
      const isSelected = current.includes(ingredient);
      return {
        ...prev,
        [currentCategoryKey]: isSelected 
          ? current.filter(ing => ing !== ingredient)
          : [...current, ingredient]
      };
    });
  };

  const handleNext = () => {
    if (isLastStep) {
      onComplete(selections);
      handleClose();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    setSelections({
      proteins: [],
      grains: [],
      greens: [],
      fruits: [],
      supplements: []
    });
    onClose();
  };

  const CATEGORY_ART: Record<string, StaticImageData> = useMemo(() => ({
    proteins: MeatBanner,
    grains: GrainsBanner,
    greens: VegetablesBanner,
    fruits: FruitsBanner,
    supplements: SupplementsBanner,
  }), []);

  const categoryArt = CATEGORY_ART[currentCategoryKey] || MeatBanner;

  const wizardContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-6xl bg-gradient-to-br from-[#0f291c] via-[#091710] to-[#030704] rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.65)] border border-emerald-700/40 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 p-6 border-b border-emerald-800/40">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-200/60">Chef Mode</p>
            <h2 className="text-3xl font-black text-gray-100 tracking-tight">
              Create Meal for {petName}
            </h2>
            <p className="text-sm text-emerald-200/80">
              Step {currentStep + 1} of {stepOrder.length}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full border border-emerald-600/70 bg-emerald-900/40 hover:bg-emerald-800/70 text-gray-200 transition"
          >
            <X size={20} className="text-gray-200" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b border-emerald-800/40 bg-emerald-950/40">
          <div className="flex flex-wrap gap-3">
            {stepOrder.map((key, index) => {
              const category = categories[key];
              const isActive = index === currentStep;
              const isCompleted = (selections[key] || []).length > 0;
              const isPast = index < currentStep;

              return (
                <div
                  key={key}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide border transition-all ${
                    isActive
                      ? 'border-orange-400/80 bg-orange-400/10 text-orange-100'
                      : isCompleted || isPast
                      ? 'border-emerald-400/70 bg-emerald-400/10 text-emerald-100'
                      : 'border-emerald-800 text-emerald-300/60'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                  {(isCompleted || isPast) && <Check size={14} className="text-emerald-200" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr]">
            <div className="space-y-4 rounded-2xl border border-emerald-800/60 bg-emerald-900/40 p-6 shadow-inner shadow-emerald-900/40">
              <div className="relative w-full h-40 sm:h-48 rounded-2xl overflow-hidden border border-emerald-700/50 shadow-lg">
                <Image
                  src={categoryArt}
                  alt={`${currentCategory.name} inspiration`}
                  fill
                  sizes="400px"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <div className="text-xs uppercase tracking-[0.25em] text-emerald-200/70 mb-1">
                    Ingredient vibe
                  </div>
                  <div className="text-2xl font-black text-white drop-shadow-lg">
                    {currentCategory.name}
                  </div>
                </div>
              </div>
              {currentStep === 0 && (
                <div className="mb-4 flex justify-center">
                  <Image
                    src="/images/emojis/Mascots/PrepPuppy/PrepPuppyKitchen.jpg"
                    alt="Puppy Prepper"
                    width={240}
                    height={240}
                    className="w-[220px] h-[220px] object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.45)]"
                    unoptimized
                  />
                </div>
              )}
              <div className="text-5xl">{currentCategory.icon}</div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-100 mb-2">{currentCategory.name}</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{currentCategory.description}</p>
              </div>
              {isRequired && hasIngredients && (
                <div className="text-xs font-semibold text-orange-200 bg-orange-400/10 border border-orange-300/40 px-3 py-2 rounded-full inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-orange-300 animate-pulse" />
                  Required step
                </div>
              )}
              {isRequired && !hasIngredients && (
                <div className="text-xs font-semibold text-yellow-200 bg-yellow-400/10 border border-yellow-300/40 px-3 py-2 rounded-full inline-flex items-center gap-2">
                  ⚠ No ingredients available - you can skip this step
                </div>
              )}
            </div>

            {/* Ingredient List */}
            <div className="rounded-3xl border border-emerald-800/60 bg-gradient-to-br from-emerald-950/80 via-emerald-950/60 to-black/70 p-4 lg:p-6 shadow-[0_20px_45px_rgba(0,0,0,0.55)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {currentCategory.ingredients.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-gray-400">
                    No ingredients available in this category for this pet.
                  </div>
                ) : (() => {
                  const recommended = currentCategory.ingredients.filter((ing) => recommendedIngredients.includes(ing));
                  const regular = currentCategory.ingredients.filter((ing) => !recommendedIngredients.includes(ing));
                  const sortedIngredients = [...recommended, ...regular];

                  return sortedIngredients.map((ingredient) => {
                    const isSelected = currentSelections.includes(ingredient);
                    const isRecommended = recommendedIngredients.includes(ingredient);
                    const topNutrients = getTopNutrients(ingredient, 3);

                    return (
                      <button
                        key={ingredient}
                        onClick={() => handleSelect(ingredient)}
                        className={`relative p-4 text-left rounded-2xl border transition-all duration-200 bg-gradient-to-br ${
                          isSelected
                            ? 'from-orange-500/20 via-orange-500/10 to-transparent border-orange-300/80 ring-2 ring-orange-400/40 shadow-[0_12px_30px_rgba(249,115,22,0.25)] scale-[1.01]'
                            : isRecommended
                            ? 'from-emerald-700/40 via-emerald-900/30 to-transparent border-emerald-400/60 hover:border-orange-300/70 hover:shadow-[0_10px_25px_rgba(249,115,22,0.15)]'
                            : 'from-emerald-900/30 via-emerald-950/30 to-transparent border-emerald-800/50 hover:border-emerald-500/70 hover:-translate-y-0.5'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {isRecommended && (
                              <span className="inline-flex items-center gap-1 text-amber-200 text-xs font-semibold uppercase tracking-wide">
                                <Star size={14} className="fill-amber-200 text-amber-200" />
                                Pick
                              </span>
                            )}
                            <span className="text-sm font-semibold text-gray-100 truncate">
                              {ingredient}
                            </span>
                          </div>
                          {isSelected && (
                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-200 bg-emerald-500/20 border border-emerald-400/50 px-2 py-0.5 rounded-full">
                              <Check size={14} />
                              Added
                            </span>
                          )}
                        </div>
                        {topNutrients.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {topNutrients.map((nutrient, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-orange-200 bg-orange-400/10 border border-orange-300/30 px-2 py-1 rounded-full"
                              >
                                <ArrowUp size={12} className="text-orange-300" />
                                {nutrient.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between flex-wrap gap-4 p-6 border-t border-emerald-800/40 bg-emerald-950/60">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-emerald-600/70 bg-emerald-800/40 text-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft size={16} />
            Back
          </button>

          <div className="flex gap-3">
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-orange-500 via-emerald-500 to-emerald-600 border border-orange-400/60 shadow-[0_10px_30px_rgba(16,185,129,0.35)] disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {isLastStep ? 'Complete' : 'Next'}
              {!isLastStep && <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Use portal to render modal at root level
  if (typeof window !== 'undefined') {
    return createPortal(wizardContent, document.body);
  }

  return null;
}

