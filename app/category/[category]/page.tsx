'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Filter } from 'lucide-react';
import { breeds, ageGroups, healthConcerns } from '@/lib/data/pets';
import { recipes } from '@/lib/data/recipes-complete';
import { nutritionalGuidelines } from '@/lib/data/nutritional-guidelines';
import RecipeCard from '@/components/RecipeCard';
import { PetCategory, Breed, AgeGroup, HealthConcern } from '@/lib/types';

export default function CategoryPage() {
  const params = useParams();
  const category = params.category as PetCategory;
  
  const [selectedBreed, setSelectedBreed] = useState<string>('');
  const [selectedAge, setSelectedAge] = useState<string>('');
  const [selectedHealth, setSelectedHealth] = useState<string>('');
  const [showFilters, setShowFilters] = useState(true);

  const categoryBreeds = breeds[category] || [];
  const filteredRecipes = recipes.filter(r => r.category === category);

  const categoryNames: Record<PetCategory, string> = {
    dogs: 'Dogs',
    cats: 'Cats',
    birds: 'Birds',
    reptiles: 'Reptiles',
    'pocket-pets': 'Pocket Pets',
  };

  const getNutritionalInfo = () => {
    const guidelines = nutritionalGuidelines[category];
    if (!guidelines) return null;
    
    let ageKey: 'puppy' | 'adult' | 'senior' = 'adult';
    if (selectedAge === 'baby' || selectedAge === 'young') {
      ageKey = 'puppy';
    } else if (selectedAge === 'senior') {
      ageKey = 'senior';
    }
    
    return guidelines[ageKey] || guidelines.adult;
  };

  const nutritionalInfo = getNutritionalInfo();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center gap-2 text-sm mb-4 text-primary-200">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight size={16} />
            <span className="text-white">{categoryNames[category]}</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {categoryNames[category]} Meal Plans
          </h1>
          <p className="text-xl text-primary-100 max-w-3xl">
            Personalized nutrition based on breed, age, and health needs
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Filter size={20} />
                  Filters
                </h2>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden text-primary-600"
                >
                  {showFilters ? 'Hide' : 'Show'}
                </button>
              </div>

              {showFilters && (
                <div className="space-y-6">
                  {/* Breed Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      1. Select Breed/Type
                    </label>
                    <select
                      value={selectedBreed}
                      onChange={(e) => setSelectedBreed(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">All Breeds</option>
                      {categoryBreeds.map((breed) => (
                        <option key={breed.id} value={breed.id}>
                          {breed.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Age Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      2. Select Age Group
                    </label>
                    <select
                      value={selectedAge}
                      onChange={(e) => setSelectedAge(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">All Ages</option>
                      {ageGroups.map((age) => (
                        <option key={age} value={age}>
                          {age}
                        </option>
                      ))}
                    </select>
                    {selectedAge && (
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedAge.charAt(0).toUpperCase() + selectedAge.slice(1)} Adult
                      </p>
                    )}
                  </div>

                  {/* Health Concerns */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      3. Health Concerns
                    </label>
                    <select
                      value={selectedHealth}
                      onChange={(e) => setSelectedHealth(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select Concern</option>
                      {healthConcerns.map((concern) => (
                        <option key={concern.id} value={concern.id}>
                          {concern.name}
                        </option>
                      ))}
                    </select>
                    {selectedHealth && (
                      <div className="mt-2 text-xs text-gray-600">
                        <p className="font-medium">
                          {healthConcerns.find(h => h.id === selectedHealth)?.description}
                        </p>
                        <p className="mt-1 text-gray-500">
                          Focus: {healthConcerns.find(h => h.id === selectedHealth)?.dietaryAdjustments.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Clear Filters */}
                  {(selectedBreed || selectedAge || selectedHealth) && (
                    <button
                      onClick={() => {
                        setSelectedBreed('');
                        setSelectedAge('');
                        setSelectedHealth('');
                      }}
                      className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Nutritional Guidelines */}
            {nutritionalInfo && (
              <div className="bg-primary-50 rounded-lg p-6 mt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Nutritional Guidelines
                </h3>
                <div className="space-y-3 text-sm">
                  {nutritionalInfo.protein && (
                    <div>
                      <span className="font-semibold text-gray-700">Protein:</span>
                      <span className="text-gray-600 ml-2">
                        {nutritionalInfo.protein.min}-{nutritionalInfo.protein.max}{nutritionalInfo.protein.unit}
                      </span>
                    </div>
                  )}
                  {nutritionalInfo.fat && (
                    <div>
                      <span className="font-semibold text-gray-700">Fat:</span>
                      <span className="text-gray-600 ml-2">
                        {nutritionalInfo.fat.min}-{nutritionalInfo.fat.max}{nutritionalInfo.fat.unit}
                      </span>
                    </div>
                  )}
                  {nutritionalInfo.fiber && (
                    <div>
                      <span className="font-semibold text-gray-700">Fiber:</span>
                      <span className="text-gray-600 ml-2">
                        {nutritionalInfo.fiber.min}-{nutritionalInfo.fiber.max}{nutritionalInfo.fiber.unit}
                      </span>
                    </div>
                  )}
                  {nutritionalInfo.calcium && (
                    <div>
                      <span className="font-semibold text-gray-700">Calcium:</span>
                      <span className="text-gray-600 ml-2">
                        {nutritionalInfo.calcium.min}-{nutritionalInfo.calcium.max}{nutritionalInfo.calcium.unit}
                      </span>
                    </div>
                  )}
                  {nutritionalInfo.calories && (
                    <div>
                      <span className="font-semibold text-gray-700">Calories:</span>
                      <span className="text-gray-600 ml-2">
                        {nutritionalInfo.calories.min}-{nutritionalInfo.calories.max} {nutritionalInfo.calories.unit}
                      </span>
                    </div>
                  )}
                  {nutritionalInfo.vitamins && (
                    <div>
                      <span className="font-semibold text-gray-700">Key Vitamins:</span>
                      <span className="text-gray-600 ml-2">
                        {nutritionalInfo.vitamins.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  Based on AAFCO and WSAVA guidelines
                </p>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Recommended Recipes
              </h2>
              <p className="text-gray-600">
                Found {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''} matching your criteria
              </p>
            </div>

            {filteredRecipes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-600 text-lg mb-4">
                  No recipes found matching your filters
                </p>
                <p className="text-gray-500 mb-6">
                  Try adjusting your filters or browse all recipes
                </p>
                <Link
                  href="/profile"
                  className="inline-block px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Go to My Pets
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
