'use client';

import { calculateMealsFromGroceryList, type MealEstimate, type ShoppingListItem } from '@/lib/utils/mealEstimation';
import { getProductPrice } from '@/lib/data/product-prices';
import { Info } from 'lucide-react';
import { useState, useMemo } from 'react';

interface ShoppingListSummaryProps {
  shoppingList: ShoppingListItem[];
  className?: string;
}

export function ShoppingListSummary({ shoppingList, className = '' }: ShoppingListSummaryProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  
  // Calculate total cost using the same logic as ShoppingList component
  const totalCost = useMemo(() => {
    if (!shoppingList || shoppingList.length === 0) {
      return 0;
    }
    
    return shoppingList.reduce((sum, item) => {
      const price = getProductPrice(item.name);
      if (typeof price === 'number') return sum + price;
      return sum;
    }, 0);
  }, [shoppingList]);

  // Calculate estimate with error handling and memoization
  const estimate = useMemo(() => {
    if (!shoppingList || shoppingList.length === 0) {
      console.log('[ShoppingListSummary] No shopping list provided');
      return null;
    }
    
    console.log('[ShoppingListSummary] Calculating estimate for', shoppingList.length, 'ingredients');
    console.log('[ShoppingListSummary] Shopping list:', shoppingList);
    
    try {
      const result = calculateMealsFromGroceryList(shoppingList);
      console.log('[ShoppingListSummary] Estimate calculated:', result);
      console.log('[ShoppingListSummary] UI totalCost prop (not used):', totalCost);
      return result;
    } catch (error) {
      console.error('[ShoppingListSummary] Error calculating meals:', error);
      return null;
    }
  }, [shoppingList, totalCost]);
  
  // Don't show if no estimate or invalid
  if (!estimate || estimate.estimatedMeals === 0) {
    console.log('[ShoppingListSummary] Showing error fallback - estimate:', estimate, 'estimatedMeals:', estimate?.estimatedMeals);
    // Show fallback message instead of returning null to verify component is being called
    return (
      <div className="bg-red-500 border-2 border-red-700 rounded-xl p-6 text-white">
        <h3 className="text-xl font-bold mb-2">⚠️ Shopping Summary Error</h3>
        <p className="mb-2">Unable to calculate meal estimate</p>
        <details className="text-sm">
          <summary className="cursor-pointer font-semibold mb-2">Debug Info</summary>
          <pre className="bg-red-700 p-2 rounded mt-2 overflow-auto max-h-48 text-xs">
            {JSON.stringify({ 
              estimate, 
              shoppingListLength: shoppingList?.length,
              hasEstimate: !!estimate,
              estimatedMeals: estimate?.estimatedMeals,
              breakdownLength: estimate?.breakdown?.length
            }, null, 2)}
          </pre>
        </details>
        <p className="text-xs mt-2 opacity-90">
          This message indicates the component is rendering but calculation returned {estimate?.estimatedMeals ?? 0} meals.
        </p>
      </div>
    );
  }
  
  return (
    <div className={`bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl p-6 border-2 border-green-700/50 ${className}`}>
      <h3 className="text-2xl font-bold text-green-200 mb-4">Shopping Summary</h3>
      
      <div className="grid md:grid-cols-3 gap-6 mb-4">
        {/* Estimated Meals */}
        <div className="bg-surface rounded-lg p-4 shadow-sm border border-green-700/30">
          <p className="text-sm text-gray-400 mb-1">Estimated Meals</p>
          <p className="text-4xl font-bold text-green-400">{estimate.estimatedMeals}</p>
          <p className="text-xs text-gray-500 mt-1">from these packages</p>
        </div>
        
        {/* Total Cost */}
        <div className="bg-surface rounded-lg p-4 shadow-sm border border-blue-700/30">
          <p className="text-sm text-gray-400 mb-1">Total Cost</p>
          <p className="text-4xl font-bold text-blue-400">${estimate.totalCost.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">one-time purchase</p>
        </div>
        
        {/* Cost Per Meal */}
        <div className="bg-surface rounded-lg p-4 shadow-sm border border-purple-700/30">
          <p className="text-sm text-gray-400 mb-1">Cost Per Meal</p>
          <p className="text-4xl font-bold text-purple-400">${estimate.costPerMeal.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">average</p>
        </div>
      </div>
      
      {/* Notes */}
      {estimate.notes && estimate.notes.length > 0 && (
        <div className="bg-blue-900/30 border-l-4 border-blue-500 p-4 rounded-r-lg mb-4">
          <div className="flex items-start gap-2">
            <Info className="text-blue-400 mt-0.5 flex-shrink-0" size={18} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-300 mb-1">Good to know:</p>
              <ul className="text-sm text-blue-200 space-y-1">
                {estimate.notes.map((note, i) => (
                  <li key={i}>• {note}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Breakdown (collapsible) */}
      <details 
        className="mt-4 cursor-pointer"
        onToggle={(e) => setShowBreakdown((e.target as HTMLDetailsElement).open)}
      >
        <summary className="text-sm font-semibold text-gray-300 hover:text-white transition-colors list-none">
          <span className="flex items-center gap-2">
            <span>{showBreakdown ? '▼' : '▶'}</span>
            <span>View detailed breakdown</span>
          </span>
        </summary>
        <div className="mt-3 space-y-2">
          {estimate.breakdown && estimate.breakdown.length > 0 ? (
            estimate.breakdown.map((item, i) => (
              <div key={i} className="bg-surface rounded-lg p-3 text-sm border border-surface-highlight">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-200">{item.ingredient}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Recipe needs {item.recipeAmount.toFixed(1)}g per meal
                    </p>
                    <p className="text-xs text-gray-500">
                      Package contains {item.packageSize}g ({item.packageSize / 453.592 < 1 ? `${(item.packageSize / 28.3495).toFixed(1)} oz` : `${(item.packageSize / 453.592).toFixed(1)} lb`})
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold text-green-400">
                      ~{Math.round(item.mealsFromPackage)} meals
                    </p>
                    <p className="text-xs text-gray-500">${item.packageCost}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-400 italic">No breakdown available</div>
          )}
        </div>
      </details>
      
      {/* Disclaimer */}
      <p className="text-xs text-gray-500 mt-4 italic">
        * Estimates based on typical package sizes available online. Actual quantities may vary.
      </p>
    </div>
  );
}

