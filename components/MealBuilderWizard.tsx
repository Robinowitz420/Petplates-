'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Star } from 'lucide-react';
import { createPortal } from 'react-dom';

interface Category {
  name: string;
  description: string;
  icon: string;
  ingredients: string[];
  required: boolean;
}

const FALLBACK_CATEGORY: Category = {
  name: '',
  description: '',
  icon: '',
  ingredients: [],
  required: false,
};

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

const MAX_INGREDIENTS_PER_CATEGORY = 36;

type IngredientTileProps = {
  ingredient: string;
  isSelected: boolean;
  isRecommended: boolean;
  onToggle: (ingredient: string) => void;
};

const IngredientTile = memo(function IngredientTile({
  ingredient,
  isSelected,
  isRecommended,
  onToggle,
}: IngredientTileProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(ingredient)}
      className={`relative p-4 text-left rounded-2xl border bg-gradient-to-br [content-visibility:auto] [contain-intrinsic-size:180px] ${
        isSelected
          ? 'from-orange-500/20 via-orange-500/10 to-transparent border-orange-300/80 shadow-md'
          : isRecommended
          ? 'from-emerald-700/40 via-emerald-900/30 to-transparent border-emerald-400/60 hover:border-orange-300/70'
          : 'from-emerald-900/30 via-emerald-950/30 to-transparent border-emerald-800/50 hover:border-emerald-500/70'
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
          <span className="text-sm font-semibold text-gray-100 truncate">{ingredient}</span>
        </div>
        {isSelected && (
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-200 bg-emerald-500/20 border border-emerald-400/50 px-2 py-0.5 rounded-full">
            <Check size={14} />
            Added
          </span>
        )}
      </div>
    </button>
  );
});

export default function MealBuilderWizard({
  isOpen,
  onClose,
  onComplete,
  categories,
  petName,
  petType,
  recommendedIngredients = []
}: MealBuilderWizardProps) {
  const skipProteins = categories.proteins.ingredients.length === 0;
  const skipGrains = categories.grains.ingredients.length === 0;
  const skipGreens = categories.greens.ingredients.length === 0;
  const skipFruits = petType && ['dogs', 'cats', 'dog', 'cat'].includes(petType.toLowerCase()) || categories.fruits.ingredients.length === 0;
  const skipSupplements = categories.supplements.ingredients.length === 0;
  const stepOrder = CATEGORY_ORDER.filter((key) => {
    if (skipProteins && key === 'proteins') return false;
    if (skipGrains && key === 'grains') return false;
    if (skipGreens && key === 'greens') return false;
    if (skipFruits && key === 'fruits') return false;
    if (skipSupplements && key === 'supplements') return false;
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

  const recommendedSet = useMemo(() => new Set(recommendedIngredients), [recommendedIngredients]);

  const currentCategoryKey = (stepOrder[currentStep] || stepOrder[0] || 'proteins') as keyof typeof categories;
  const currentCategory = categories[currentCategoryKey] || FALLBACK_CATEGORY;
  const sortedIngredients = useMemo(() => {
    if (!currentCategory) return [] as string[];
    const recommended: string[] = [];
    const regular: string[] = [];
    currentCategory.ingredients.forEach((ingredient) => {
      if (recommendedSet.has(ingredient)) {
        recommended.push(ingredient);
      } else {
        regular.push(ingredient);
      }
    });
    const combined = [...recommended, ...regular];
    if (combined.length <= MAX_INGREDIENTS_PER_CATEGORY) return combined;
    return combined.slice(0, MAX_INGREDIENTS_PER_CATEGORY);
  }, [currentCategory, recommendedSet]);

  const isRequired = currentCategory.required;
  const currentSelections = selections[currentCategoryKey] || [];
  const currentSelectionSet = useMemo(() => new Set(currentSelections), [currentSelections]);
  const hasSelection = currentSelections.length > 0;
  const hasIngredients = currentCategory.ingredients.length > 0;
  // Allow proceeding if: not required, OR has selection, OR required but no ingredients available
  const canProceed = !isRequired || hasSelection || !hasIngredients;
  const isLastStep = stepOrder.length === 0 || currentStep === stepOrder.length - 1;

  const handleSelect = useCallback((ingredient: string) => {
    setSelections((prev) => {
      const current = prev[currentCategoryKey] || [];
      const isSelected = current.includes(ingredient);
      const newSelections = {
        ...prev,
        [currentCategoryKey]: isSelected ? current.filter((ing) => ing !== ingredient) : [...current, ingredient],
      };
      return newSelections;
    });
  }, [currentCategoryKey]);

  if (!isOpen) return null;

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


  const wizardContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="w-full max-w-6xl bg-gradient-to-br from-[#0f291c] via-[#091710] to-[#030704] rounded-3xl shadow-xl border border-emerald-700/40 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 p-6 border-b border-emerald-800/40">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-200/60">Chef Mode</p>
            <h2 className="text-3xl font-black text-gray-100 tracking-tight">
              <span className="mr-2">Create Meal for</span>
              <span className="font-extrabold">{petName}</span>
            </h2>
            <p className="text-sm text-emerald-200/80">
              Step {currentStep + 1} of {stepOrder.length}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full border border-emerald-600/70 bg-emerald-900/40 hover:bg-emerald-800/70 text-gray-200 transition-colors"
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
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide border transition-colors ${
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
          <div className="space-y-6">
            {/* Show required step info at the top if needed */}
            <div className="flex justify-center">
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
            <div className="rounded-3xl border border-emerald-800/60 bg-gradient-to-br from-emerald-950/80 via-emerald-950/60 to-black/70 p-4 lg:p-6 shadow-lg">
              {currentCategory.ingredients.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  No ingredients available in this category for this pet.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {sortedIngredients.map((ingredient) => (
                      <IngredientTile
                        key={ingredient}
                        ingredient={ingredient}
                        isSelected={currentSelectionSet.has(ingredient)}
                        isRecommended={recommendedSet.has(ingredient)}
                        onToggle={handleSelect}
                      />
                    ))}
                  </div>
                </>
              )}
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

