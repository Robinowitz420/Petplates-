'use client';

import { useState, useMemo } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Star, ArrowUp } from 'lucide-react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { INGREDIENT_COMPOSITIONS, getIngredientComposition, type IngredientComposition } from '@/lib/data/ingredientCompositions';
import { getFallbackNutrition } from '@/lib/utils/nutritionFallbacks';

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

  const wizardContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: '#0f2c0f' }}>
      <div className="rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col" style={{ backgroundColor: '#143424' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#2d5a47' }}>
          <div>
            <h2 className="text-2xl font-bold text-gray-100">
              Create Meal for {petName}
            </h2>
            <p className="text-sm text-gray-300 mt-1">
              Step {currentStep + 1} of {stepOrder.length}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:opacity-80 rounded-full transition-colors"
            style={{ backgroundColor: '#2d5a47' }}
          >
            <X size={20} className="text-gray-200" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b" style={{ backgroundColor: '#143424', borderColor: '#2d5a47' }}>
          <div className="flex gap-2">
            {stepOrder.map((key, index) => {
              const category = categories[key];
              const isActive = index === currentStep;
              const isCompleted = (selections[key] || []).length > 0;
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
                      <Check size={16} className="text-green-400 flex-shrink-0" />
                    )}
                  </div>
                  <div className="text-xs text-gray-300 mt-1 truncate">
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
            {currentStep === 0 && (
              <div className="mb-4 flex justify-center">
                <Image
                  src="/images/emojis/Mascots/PrepPuppy/PrepPuppyKitchen.jpg"
                  alt="Puppy Prepper"
                  width={240}
                  height={240}
                  className="w-[240px] h-[240px] object-contain"
                  unoptimized
                />
              </div>
            )}
            <div className="text-4xl mb-2">{currentCategory.icon}</div>
            <h3 className="text-xl font-semibold text-gray-100 mb-1">
              {currentCategory.name}
            </h3>
            <p className="text-sm text-gray-300">{currentCategory.description}</p>
            {isRequired && hasIngredients && (
              <p className="text-xs text-red-400 mt-2">* Required</p>
            )}
            {isRequired && !hasIngredients && (
              <p className="text-xs text-yellow-400 mt-2">⚠ No ingredients available - you can skip this step</p>
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
                const isSelected = currentSelections.includes(ingredient);
                const isRecommended = recommendedIngredients.includes(ingredient);
                const topNutrients = getTopNutrients(ingredient, 3);
                
                return (
                  <button
                    key={ingredient}
                    onClick={() => handleSelect(ingredient)}
                    className="p-4 rounded-lg text-left transition-colors duration-200 relative"
                    style={{
                      border: isSelected ? '3px solid #f97316' : isRecommended ? '3px solid #fb923c' : '3px solid rgba(249, 115, 22, 0.5)',
                      backgroundColor: isSelected ? '#2d5a47' : isRecommended ? '#3d4a2e' : '#143424',
                      color: '#e5e7eb'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {isRecommended && (
                          <Star size={16} className="text-yellow-400 fill-yellow-400 flex-shrink-0" />
                        )}
                        <span className="text-sm font-medium truncate text-gray-100">
                          {ingredient}
                        </span>
                      </div>
                      {isSelected && (
                        <Check size={18} className="text-green-400 flex-shrink-0 ml-2" />
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                      {isRecommended && (
                        <div className="text-xs text-yellow-300">
                          Recommended
                        </div>
                      )}
                      {topNutrients.length > 0 && (
                        <div className="flex items-center gap-2 ml-auto flex-wrap">
                          {topNutrients.map((nutrient, idx) => (
                            <div key={idx} className="flex items-center gap-1 text-xs text-orange-300">
                              <ArrowUp size={12} className="text-orange-400" />
                              <span>{nutrient.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                );
              });
            })()}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t" style={{ borderColor: '#2d5a47', backgroundColor: '#143424' }}>
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{
              backgroundColor: '#2d5a47',
              border: '3px solid #f97316',
              color: '#e5e7eb'
            }}
          >
            <ChevronLeft size={16} />
            Back
          </button>

          <div className="flex gap-3">
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{
                backgroundColor: '#16a34a',
                border: '3px solid #f97316'
              }}
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

