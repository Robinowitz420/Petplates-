'use client';

import { X, ExternalLink } from 'lucide-react';
import { IngredientSelection } from '@/lib/analyzeCustomMeal';
import { getVettedProduct, getVettedProductByAnyIdentifier } from '@/lib/data/vetted-products';
import { ensureSellerId } from '@/lib/utils/affiliateLinks';

// Format price for display
const formatPrice = (price: number) => {
  return `$${price.toFixed(2)}`;
};

interface MealCompositionListProps {
  ingredients: IngredientSelection[];
  onRemove: (key: string) => void;
  getIngredientDisplayName: (key: string) => string;
  getCompatibilityIndicator?: (key: string) => 'safe' | 'warning' | 'blocked' | null;
  recommendedAmounts?: { [key: string]: number }; // Recommended grams per ingredient
}

export default function MealCompositionList({
  ingredients,
  onRemove,
  getIngredientDisplayName,
  getCompatibilityIndicator,
  recommendedAmounts = {}
}: MealCompositionListProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {ingredients.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            No ingredients added yet. Search and select ingredients above.
          </div>
        ) : (
          ingredients.map(ing => {
            const displayName = getIngredientDisplayName(ing.key);
            const indicator = getCompatibilityIndicator?.(ing.key) || null;
            const ingredientName = displayName.toLowerCase();
            // Try multiple lookup methods
            let vettedProduct = getVettedProduct(ingredientName);
            if (!vettedProduct) {
              vettedProduct = getVettedProductByAnyIdentifier(displayName);
            }
            const purchaseLink = vettedProduct?.asinLink || vettedProduct?.purchaseLink;
            const hasPurchaseLink = !!purchaseLink;
            const price = vettedProduct?.price?.amount;
            
            return (
              <div
                key={ing.key}
                className="flex items-center justify-between gap-3 p-3 bg-surface-lighter rounded-lg border border-surface-highlight hover:border-gray-500 transition-all duration-200"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Compatibility Indicator */}
                  {indicator && (
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      indicator === 'safe' ? 'bg-green-500' :
                      indicator === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`} />
                  )}

                  {/* Ingredient Name */}
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="font-medium text-gray-200 truncate">
                      {displayName}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span>Current: {ing.grams}g</span>
                      {recommendedAmounts[ing.key] && recommendedAmounts[ing.key] !== ing.grams && (
                        <span className="text-orange-400 font-medium">
                          Recommended: {recommendedAmounts[ing.key]}g
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price Display */}
                {price && (
                  <div className="text-right mr-3">
                    <div className="text-lg font-bold text-orange-400">{formatPrice(price)}</div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Buy Button */}
                  {hasPurchaseLink && (
                    <a
                      href={ensureSellerId(purchaseLink!)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-[#FF9900] hover:bg-[#E07704] text-black rounded-lg transition-all duration-200 text-sm font-semibold whitespace-nowrap hover:shadow-md"
                    >
                      Buy
                      <ExternalLink size={14} />
                    </a>
                  )}

                  {/* Delete Button */}
                  <button
                    onClick={() => onRemove(ing.key)}
                    className="p-1.5 rounded hover:bg-red-900/30 text-gray-400 hover:text-red-400 transition-colors"
                    title="Remove ingredient"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

