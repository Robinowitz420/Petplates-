'use client';

import { X, Plus, Minus } from 'lucide-react';
import { IngredientSelection } from '@/lib/analyzeCustomMeal';

interface MealCompositionListProps {
  ingredients: IngredientSelection[];
  onRemove: (key: string) => void;
  onUpdateAmount: (key: string, grams: number) => void;
  getIngredientDisplayName: (key: string) => string;
  getCompatibilityIndicator?: (key: string) => 'safe' | 'warning' | 'blocked' | null;
  recommendedAmounts?: { [key: string]: number }; // Recommended grams per ingredient
}

export default function MealCompositionList({
  ingredients,
  onRemove,
  onUpdateAmount,
  getIngredientDisplayName,
  getCompatibilityIndicator,
  recommendedAmounts = {}
}: MealCompositionListProps) {
  const quickAdjust = (key: string, delta: number) => {
    const current = ingredients.find(i => i.key === key);
    if (current) {
      const newAmount = Math.max(0, current.grams + delta);
      onUpdateAmount(key, newAmount);
    }
  };

  const hasRecommendedAmounts = Object.keys(recommendedAmounts).length > 0;
  const totalRecommended = Object.values(recommendedAmounts).reduce((sum, val) => sum + val, 0);

  return (
    <div className="space-y-4">
      {/* Recommended Serving Info (no button) */}
      {hasRecommendedAmounts && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm font-medium text-blue-900">Recommended Serving: {totalRecommended}g total</div>
          <div className="text-xs text-blue-700 mt-1">
            Based on your pet's weight and nutritional needs (automatically applied)
          </div>
        </div>
      )}

      <div className="space-y-2">
        {ingredients.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            No ingredients added yet. Search and select ingredients above.
          </div>
        ) : (
          ingredients.map(ing => {
            const displayName = getIngredientDisplayName(ing.key);
            const indicator = getCompatibilityIndicator?.(ing.key) || null;
            const recommended = recommendedAmounts[ing.key];
            const isAtRecommended = recommended && Math.abs(ing.grams - recommended) < 5;
            
            return (
              <div
                key={ing.key}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-3">
                  {/* Compatibility Indicator */}
                  {indicator && (
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      indicator === 'safe' ? 'bg-green-500' :
                      indicator === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`} />
                  )}

                  {/* Ingredient Name and Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {displayName}
                      </div>
                      {recommended && !isAtRecommended && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          Target: {recommended}g
                        </span>
                      )}
                      {isAtRecommended && (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
                          ✓ At target
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Current: {ing.grams}g
                      {recommended && (() => {
                        // Use consistent thresholds for both color and text
                        const tolerance = 0.1; // 10% tolerance
                        const lowerBound = recommended * (1 - tolerance);
                        const upperBound = recommended * (1 + tolerance);
                        
                        let status: 'below' | 'above' | 'on';
                        let color: string;
                        
                        if (ing.grams < lowerBound) {
                          status = 'below';
                          color = 'text-orange-600';
                        } else if (ing.grams > upperBound) {
                          status = 'above';
                          color = 'text-yellow-600';
                        } else {
                          status = 'on';
                          color = 'text-green-600';
                        }
                        
                        return (
                          <span className={`ml-2 ${color}`}>
                            {status === 'below' ? '↓ Below target' :
                             status === 'above' ? '↑ Above target' :
                             '✓ On target'}
                          </span>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Amount Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => quickAdjust(ing.key, -10)}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-600 transition-colors"
                      title="Decrease by 10g"
                    >
                      <Minus size={16} />
                    </button>
                    
                    <div className="flex flex-col items-center">
                      <input
                        type="number"
                        value={ing.grams}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          onUpdateAmount(ing.key, Math.max(0, val));
                        }}
                        className="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
                        min="0"
                        step="5"
                      />
                      {recommended && (
                        <button
                          onClick={() => onUpdateAmount(ing.key, recommended)}
                          className="text-xs text-blue-600 hover:text-blue-700 mt-1"
                          title="Set to recommended amount"
                        >
                          Use {recommended}g
                        </button>
                      )}
                    </div>
                    
                    <button
                      onClick={() => quickAdjust(ing.key, 10)}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-600 transition-colors"
                      title="Increase by 10g"
                    >
                      <Plus size={16} />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => onRemove(ing.key)}
                      className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 ml-2 transition-colors"
                      title="Remove ingredient"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

