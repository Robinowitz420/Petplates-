'use client';

import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Star } from 'lucide-react';
import { createPortal } from 'react-dom';

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
  onComplete: (selections: { [category: string]: string | null }) => void;
  categories: {
    proteins: Category;
    grains: Category;
    greens: Category;
    fruits: Category;
    supplements: Category;
  };
  petName: string;
  recommendedIngredients?: string[]; // List of recommended ingredient names
}

const CATEGORY_ORDER = ['proteins', 'grains', 'greens', 'fruits', 'supplements'] as const;

export default function MealBuilderWizard({
  isOpen,
  onClose,
  onComplete,
  categories,
  petName,
  recommendedIngredients = []
}: MealBuilderWizardProps) {
  const skipProteins = !categories.proteins.required || categories.proteins.ingredients.length === 0;
  const stepOrder = CATEGORY_ORDER.filter((key) => !(skipProteins && key === 'proteins'));

  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<{ [key: string]: string | null }>({
    proteins: null,
    grains: null,
    greens: null,
    fruits: null,
    supplements: null
  });

  if (!isOpen) return null;

  const currentCategoryKey = stepOrder[currentStep];
  const currentCategory = categories[currentCategoryKey];
  const isRequired = currentCategory.required;
  const hasSelection = selections[currentCategoryKey] !== null;
  const hasIngredients = currentCategory.ingredients.length > 0;
  // Allow proceeding if: not required, OR has selection, OR required but no ingredients available
  const canProceed = !isRequired || hasSelection || !hasIngredients;
  const isLastStep = currentStep === stepOrder.length - 1;

  const handleSelect = (ingredient: string) => {
    setSelections(prev => ({
      ...prev,
      [currentCategoryKey]: prev[currentCategoryKey] === ingredient ? null : ingredient
    }));
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
      proteins: null,
      grains: null,
      greens: null,
      fruits: null,
      supplements: null
    });
    onClose();
  };

  const wizardContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Create Meal for {petName}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Step {currentStep + 1} of {stepOrder.length}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex gap-2">
            {stepOrder.map((key, index) => {
              const category = categories[key];
              const isActive = index === currentStep;
              const isCompleted = selections[key] !== null;
              const isPast = index < currentStep;

              return (
                <div key={key} className="flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex-1 h-2 rounded-full transition-colors ${
                        isActive
                          ? 'bg-primary-600'
                          : isCompleted || isPast
                          ? 'bg-green-500'
                          : 'bg-gray-200'
                      }`}
                    />
                    {isCompleted && !isActive && (
                      <Check size={16} className="text-green-600 flex-shrink-0" />
                    )}
                  </div>
                  <div className="text-xs text-gray-600 mt-1 truncate">
                    {category.icon} {category.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">{currentCategory.icon}</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              {currentCategory.name}
            </h3>
            <p className="text-sm text-gray-600">{currentCategory.description}</p>
            {isRequired && hasIngredients && (
              <p className="text-xs text-red-600 mt-2">* Required</p>
            )}
            {isRequired && !hasIngredients && (
              <p className="text-xs text-yellow-600 mt-2">⚠ No ingredients available - you can skip this step</p>
            )}
          </div>

          {/* Ingredient List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentCategory.ingredients.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-gray-400">
                No ingredients available in this category for this pet.
              </div>
            ) : (() => {
              // Separate recommended and regular ingredients
              const recommended = currentCategory.ingredients.filter(ing => 
                recommendedIngredients.includes(ing)
              );
              const regular = currentCategory.ingredients.filter(ing => 
                !recommendedIngredients.includes(ing)
              );
              
              // Sort: recommended first, then regular
              const sortedIngredients = [...recommended, ...regular];
              
              return sortedIngredients.map(ingredient => {
                const isSelected = selections[currentCategoryKey] === ingredient;
                const isRecommended = recommendedIngredients.includes(ingredient);
                
                return (
                  <button
                    key={ingredient}
                    onClick={() => handleSelect(ingredient)}
                    className={`p-4 rounded-lg border-2 text-left transition-all relative ${
                      isSelected
                        ? 'border-primary-600 bg-primary-50'
                        : isRecommended
                        ? 'border-yellow-400 bg-yellow-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {isRecommended && (
                          <Star size={16} className="text-yellow-500 fill-yellow-500 flex-shrink-0" />
                        )}
                        <span className={`text-sm font-medium truncate ${
                          isRecommended ? 'text-gray-900' : 'text-gray-900'
                        }`}>
                          {ingredient}
                        </span>
                      </div>
                      {isSelected && (
                        <Check size={18} className="text-primary-600 flex-shrink-0 ml-2" />
                      )}
                    </div>
                    {isRecommended && (
                      <div className="text-xs text-yellow-700 mt-1">
                        Recommended
                      </div>
                    )}
                  </button>
                );
              });
            })()}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
            Back
          </button>

          <div className="flex gap-3">
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

