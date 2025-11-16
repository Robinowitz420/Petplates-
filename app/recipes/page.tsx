'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Filter } from 'lucide-react';
import { recipes } from '@/lib/data/recipes-complete';
import RecipeCard from '@/components/RecipeCard';
import { PetCategory } from '@/lib/types';

export default function RecipesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PetCategory | ''>('');
  const [selectedTag, setSelectedTag] = useState('');

  const allTags = Array.from(
    new Set(recipes.flatMap(r => r.tags))
  ).sort();

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || recipe.category === selectedCategory;
    const matchesTag = !selectedTag || recipe.tags.includes(selectedTag);
    return matchesSearch && matchesCategory && matchesTag;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            All Recipes
          </h1>
          <p className="text-xl text-primary-100">
            Browse our complete collection of nutritionally balanced pet meals
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Recipes
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Pet Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as PetCategory | '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Categories</option>
                <option value="dogs">Dogs</option>
                <option value="cats">Cats</option>
                <option value="birds">Birds</option>
                <option value="reptiles">Reptiles</option>
                <option value="pocket-pets">Pocket Pets</option>
              </select>
            </div>

            {/* Tag Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filter by Tag
              </label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Tags</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {(searchQuery || selectedCategory || selectedTag) && (
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchQuery && (
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                  Search: "{searchQuery}"
                </span>
              )}
              {selectedCategory && (
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                  Category: {selectedCategory}
                </span>
              )}
              {selectedTag && (
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                  Tag: {selectedTag}
                </span>
              )}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                  setSelectedTag('');
                }}
                className="text-sm text-primary-600 hover:underline ml-2"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {filteredRecipes.length} Recipe{filteredRecipes.length !== 1 ? 's' : ''}
          </h2>
        </div>

        {filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">
              No recipes found matching your criteria
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
                setSelectedTag('');
              }}
              className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
