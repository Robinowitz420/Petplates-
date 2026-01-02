'use client';

interface CostComparisonProps {
  costPerMeal: number;
  totalCost?: number;
  estimatedMeals?: number;
  className?: string;
  exceedsBudget?: boolean; // True if costPerMeal > 4.50
}

export function CostComparison({ costPerMeal, totalCost, estimatedMeals, className = '', exceedsBudget: _exceedsBudget = false }: CostComparisonProps) {
  const commercialCost = 4.50; // Average commercial pet food per meal
  const savings = commercialCost - costPerMeal;
  const savingsPercent = savings > 0 ? Math.round((savings / commercialCost) * 100) : 0;
  
  // Don't render if invalid data
  if (!costPerMeal || costPerMeal <= 0) {
    return null;
  }
  
  return (
    <div className={`bg-gradient-to-r from-green-700/35 to-emerald-700/35 rounded-xl p-6 border-2 border-green-500/65 ${className}`}>
      <h4 className="font-bold text-lg text-green-200 mb-4">💰 Cost Comparison</h4>
      
      <div className="grid md:grid-cols-2 gap-4">
        {/* Homemade */}
        <div className="bg-surface rounded-lg p-4 border border-green-700/30 text-center">
          <p className="text-sm text-gray-400 mb-2">Homemade (Your Cost)</p>
          <p className="text-3xl font-bold text-green-400">${costPerMeal.toFixed(2)}/meal</p>
          <div className="mt-2 space-y-1 inline-block text-left">
            <p className="text-xs text-green-300">✓ Fresh ingredients</p>
            <p className="text-xs text-green-300">✓ Full control</p>
            <p className="text-xs text-green-300">✓ Custom nutrition</p>
          </div>
        </div>
        
        {/* Commercial */}
        <div className="bg-surface rounded-lg p-4 border border-gray-700/30 text-center">
          <p className="text-sm text-gray-400 mb-2">Commercial Pet Food</p>
          <p className="text-3xl font-bold text-gray-400">${commercialCost.toFixed(2)}/meal</p>
          <p className="text-xs text-gray-500 mt-2">Typical premium brand</p>
        </div>
      </div>
      
      {savings > 0 && (
        <div className="mt-4 bg-green-900/40 border-2 border-green-500/50 rounded-lg p-4 text-center">
          <p className="text-lg font-bold text-green-300">
            You save ${savings.toFixed(2)} per meal ({savingsPercent}%)
          </p>
          <p className="text-sm text-green-200 mt-1">
            That's ${(savings * 30).toFixed(2)} per month!
          </p>
          {estimatedMeals && (
            <p className="text-xs text-green-300 mt-1">
              Total savings from this shopping trip: ${(savings * estimatedMeals).toFixed(2)}
            </p>
          )}
        </div>
      )}
      
      {savings < 0 && (
        <div className="mt-4 bg-yellow-900/40 border-2 border-yellow-500/50 rounded-lg p-4 text-center">
          <p className="text-sm text-yellow-200">
            Your homemade meals cost ${Math.abs(savings).toFixed(2)} more per meal, but you get fresh, customized nutrition!
          </p>
        </div>
      )}
      
      {/* Monthly Projection / Value Breakdown */}
      {totalCost && estimatedMeals && (
        <div className="mt-4 bg-surface rounded-lg p-4 border border-surface-highlight">
          <p className="text-xs font-semibold text-gray-300 mb-3">📊 Value Breakdown:</p>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="text-center">
              <p className="text-gray-400 mb-1">Estimated Meals</p>
              <p className="font-bold text-lg text-green-400">{estimatedMeals}</p>
              <p className="text-gray-500 text-[10px] mt-0.5">from these packages</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 mb-1">Total Cost</p>
              <p className="font-bold text-lg text-blue-400">${totalCost.toFixed(2)}</p>
              <p className="text-gray-500 text-[10px] mt-0.5">one-time purchase</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 mb-1">Cost Per Meal</p>
              <p className="font-bold text-lg text-green-400">${costPerMeal.toFixed(2)}</p>
              <p className="text-gray-500 text-[10px] mt-0.5">average</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

