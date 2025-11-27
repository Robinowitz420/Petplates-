import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Star, Users, Heart, ChefHat, Clock, ThumbsUp } from 'lucide-react';
import Image from '@/components/Image';
import { getEmojiGroup } from '@/lib/utils/imageMapping';

export default function CommunityGalleryPage() {
  const [communityRecipes, setCommunityRecipes] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Load all community modifications from localStorage
    const allRecipes = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('recipe_modifications_')) {
        const recipeId = key.replace('recipe_modifications_', '');
        const modifications = JSON.parse(localStorage.getItem(key) || '[]');

        if (modifications.length > 0) {
          // Get original recipe data
          const originalRecipe = JSON.parse(localStorage.getItem('recipes') || '[]').find((r: any) => r.id === recipeId);

          allRecipes.push({
            recipeId,
            originalRecipe,
            modifications,
            totalModifications: modifications.length,
            averageRating: modifications.reduce((sum: number, mod: any) => sum + (mod.rating || 0), 0) / modifications.length,
            lastModified: modifications[0]?.timestamp
          });
        }
      }
    }

    setCommunityRecipes(allRecipes);
  }, []);

  const filteredRecipes = communityRecipes.filter(recipe => {
    if (filter === 'all') return true;
    if (filter === 'highly-rated') return recipe.averageRating >= 4;
    if (filter === 'recent') return new Date(recipe.lastModified) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (filter === 'popular') return recipe.totalModifications >= 3;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Community Recipe Gallery
          </h1>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto">
            Discover creative recipe modifications and improvements shared by our community of pet parents.
            See how others adapted recipes for their pets' unique needs.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <ChefHat className="w-8 h-8 mx-auto mb-3 text-primary-600" />
            <div className="text-2xl font-bold text-gray-900 mb-1">{communityRecipes.length}</div>
            <div className="text-sm text-gray-600">Modified Recipes</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Users className="w-8 h-8 mx-auto mb-3 text-green-600" />
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {communityRecipes.reduce((sum, recipe) => sum + recipe.totalModifications, 0)}
            </div>
            <div className="text-sm text-gray-600">Community Contributions</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Star className="w-8 h-8 mx-auto mb-3 text-yellow-600" />
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {communityRecipes.length > 0
                ? (communityRecipes.reduce((sum, recipe) => sum + recipe.averageRating, 0) / communityRecipes.length).toFixed(1)
                : '0.0'
              }
            </div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Heart className="w-8 h-8 mx-auto mb-3 text-red-600" />
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {communityRecipes.reduce((sum, recipe) => sum + recipe.modifications.reduce((mSum: number, mod: any) => mSum + (mod.helpful || 0), 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Helpful Votes</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Recipes
            </button>
            <button
              onClick={() => setFilter('highly-rated')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === 'highly-rated' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Highly Rated (4+ stars)
            </button>
            <button
              onClick={() => setFilter('recent')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === 'recent' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Recently Modified
            </button>
            <button
              onClick={() => setFilter('popular')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === 'popular' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Most Modified (3+ variations)
            </button>
          </div>
        </div>

        {/* Recipe Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRecipes.map((recipe) => (
            <div key={recipe.recipeId} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* Original Recipe Info */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Modified: {recipe.originalRecipe?.name || 'Unknown Recipe'}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      recipe.originalRecipe?.category === 'dogs' ? 'bg-blue-100 text-blue-800' :
                      recipe.originalRecipe?.category === 'cats' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {recipe.originalRecipe?.category || 'Unknown'}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>{recipe.averageRating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                {/* Community Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{recipe.totalModifications}</div>
                    <div className="text-gray-600">Variations</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">
                      {recipe.modifications.reduce((sum: number, mod: any) => sum + (mod.helpful || 0), 0)}
                    </div>
                    <div className="text-gray-600">Helpful</div>
                  </div>
                </div>

                {/* Latest Modification Preview */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Latest Variation:</h4>
                  <p className="text-gray-700 text-sm line-clamp-3">
                    {recipe.modifications[0]?.modifications || 'No description available'}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span>by {recipe.modifications[0]?.userName || 'Anonymous'}</span>
                    <span>•</span>
                    <span>{new Date(recipe.modifications[0]?.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link
                    href={`/recipe/${recipe.recipeId}`}
                    className="flex-1 text-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    View Recipe
                  </Link>
                  <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRecipes.length === 0 && (
          <div className="text-center py-12">
            <ChefHat className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No recipes found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? "No community modifications have been shared yet. Be the first to modify a recipe and share your improvements!"
                : `No recipes match the "${filter}" filter. Try a different filter.`
              }
            </p>
            <Link
              href="/forum"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
            >
              <ChefHat className="w-5 h-5" />
              Start Modifying Recipes
            </Link>
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-primary-600 text-white rounded-lg p-8 mt-12 text-center">
          <h3 className="text-2xl font-bold mb-4">Share Your Recipe Creations</h3>
          <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
            Have you modified a recipe to better suit your pet's needs? Share your innovations with the community
            and help other pet parents discover new ways to make meals their pets will love.
          </p>
          <Link
            href="/forum"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Share Your Modifications
          </Link>
        </div>
      </div>
    </div>
  );
}