'use client';

import { Info } from 'lucide-react';

interface SuggestedIngredient {
  name: string;
  reason: string;
  category: string;
}

interface SuggestedIngredientsProps {
  suggestions: SuggestedIngredient[];
  onSelect: (ingredientName: string) => void;
  selectedIngredients: string[];
}

export default function SuggestedIngredients({
  suggestions,
  onSelect,
  selectedIngredients
}: SuggestedIngredientsProps) {
  if (suggestions.length === 0) {
    return null;
  }

  // Filter out already selected ingredients
  const availableSuggestions = suggestions.filter(
    sug => !selectedIngredients.includes(sug.name)
  );

  if (availableSuggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Info size={18} className="text-blue-600" />
        <h3 className="font-semibold text-blue-900 text-lg">Suggested Ingredients</h3>
      </div>
      <p className="text-sm text-blue-800 mb-4">
        These ingredients are recommended for your pet based on their profile:
      </p>
      <div className="space-y-3">
        {availableSuggestions.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(suggestion.name)}
            className="w-full text-left bg-white rounded-lg border border-blue-200 p-4 hover:border-blue-400 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="font-medium text-gray-900 mb-1 group-hover:text-blue-700">
                  {suggestion.name}
                </div>
                <div className="text-xs text-gray-600 leading-relaxed">
                  {suggestion.reason}
                </div>
              </div>
              <div className="flex-shrink-0">
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                  {suggestion.category}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

