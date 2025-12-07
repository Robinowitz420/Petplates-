'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Clock, Users } from 'lucide-react';
import { Recipe } from '@/lib/types';
import { CompatibilityBadge } from './CompatibilityBadge';
import { rateRecipeForPet, type Pet } from '@/lib/utils/petRatingSystem';
import RecipeScoreModal from './RecipeScoreModal';


interface RecipeCardProps {
  recipe: Recipe;
  pet?: Pet | null;
}

export default function RecipeCard({ recipe, pet }: RecipeCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate compatibility rating if pet is provided
  const compatibilityRating = pet ? rateRecipeForPet(recipe, pet as Pet) : null;

  return (
    <>
      <Link
        href={`/recipe/${recipe.id}${pet ? `?petId=${pet.id}` : ''}`}
        className="group bg-surface rounded-lg shadow-md border border-surface-highlight hover:shadow-xl hover:border-orange-500/50 transition-all overflow-hidden"
      >
        <div className="bg-surface-highlight px-4 py-3 border-b border-surface-highlight flex items-center justify-between">
          <div className="text-xs font-semibold text-foreground uppercase tracking-wide">
            {recipe.category}
          </div>
          <div className="text-[11px] text-gray-400">
            {recipe.servings} servings • {recipe.prepTime}
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary-400 transition-colors">
            {recipe.name}
          </h3>
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {recipe.description}
          </p>


          {/* Meta Information */}
          {(recipe as any).meta && (
            <div className="mb-4 space-y-1">
              {(recipe as any).meta.texture && (
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Texture:</span> {(recipe as any).meta.texture}
                </div>
              )}
              {(recipe as any).meta.estimatedCost && (
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Cost:</span> {(recipe as any).meta.estimatedCost}
                </div>
              )}
              {(recipe as any).meta.shelfLife && (
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Storage:</span> {(recipe as any).meta.shelfLife}
                </div>
              )}
              {(recipe as any).meta.season && (recipe as any).meta.season.length > 0 && (
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Season:</span> {(recipe as any).meta.season.join(', ')}
                </div>
              )}
            </div>
          )}
  
          {/* Compatibility Rating Display */}
          {compatibilityRating && (
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsModalOpen(true);
                }}
                className="cursor-pointer"
              >
                <CompatibilityBadge
                  compatibility={compatibilityRating.compatibility}
                  score={compatibilityRating.overallScore}
                />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <Clock size={16} />
              <span>{recipe.prepTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={16} />
              <span>{recipe.servings} servings</span>
            </div>
          </div>
        </div>
      </Link>

      {isModalOpen && (
        <RecipeScoreModal
          recipe={recipe}
          pet={pet}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}