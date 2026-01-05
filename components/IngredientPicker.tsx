'use client';

import { useState, useEffect, memo } from 'react';
import { Search, X } from 'lucide-react';

interface Ingredient {
  name: string;
  category: string;
}

interface IngredientPickerProps {
  ingredients: Ingredient[];
  categories: {
    [key: string]: {
      name: string;
      icon: string;
      ingredients: string[];
    };
  };
  onSelect: (ingredientName: string) => void;
  disabled?: boolean;
}

export default memo(function IngredientPicker({
  ingredients,
  categories,
  onSelect,
  disabled = false
}: IngredientPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Filter ingredients by search and category
  const filteredIngredients = ingredients.filter(ing => {
    const matchesSearch = ing.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory ||
      categories[selectedCategory]?.ingredients.includes(ing.name);
    return matchesSearch && matchesCategory;
  });

  const categoryKeys = Object.keys(categories);

  return (
    <div className="relative">
      {/* Search Input & Dropdown Toggle */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search ingredients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          disabled={disabled}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Category Filters */}
      {isOpen && (
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === null
                ? 'bg-primary-100 text-primary-700 border border-primary-300'
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categoryKeys.map(catKey => (
            <button
              key={catKey}
              onClick={() => setSelectedCategory(catKey)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
                selectedCategory === catKey
                  ? 'bg-primary-100 text-primary-700 border border-primary-300'
                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              <span>{categories[catKey].icon}</span>
              {categories[catKey].name}
            </button>
          ))}
        </div>
      )}

      {/* Dropdown Results */}
      {isOpen && filteredIngredients.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {filteredIngredients.map((ing, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSelect(ing.name);
                setSearchQuery('');
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-900">{ing.name}</span>
                <span className="text-xs text-gray-500">{ing.category}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
});

