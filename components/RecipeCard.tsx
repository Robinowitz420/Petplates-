'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Clock, Users } from 'lucide-react';
import { Recipe } from '@/lib/types';
import { CompatibilityBadge } from './CompatibilityBadge';
import { calculateEnhancedCompatibility, type Pet as EnhancedPet } from '@/lib/utils/enhancedCompatibilityScoring';
import type { Pet } from '@/lib/utils/petRatingSystem';
import RecipeScoreModal from './RecipeScoreModal';


interface RecipeCardProps {
  recipe: Recipe;
  pet?: Pet | null;
}

// Helper to convert grade to compatibility level
function gradeToCompatibility(grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F'): 'excellent' | 'good' | 'fair' | 'poor' {
  if (grade === 'A+' || grade === 'A') return 'excellent';
  if (grade === 'B+' || grade === 'B') return 'good';
  if (grade === 'C+' || grade === 'C') return 'fair';
  return 'poor';
}

export default function RecipeCard({ recipe, pet }: RecipeCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate compatibility rating if pet is provided
  const enhancedScore = pet ? (() => {
    const enhancedPet: EnhancedPet = {
      id: pet.id,
      name: pet.name,
      type: pet.type as 'dog' | 'cat' | 'bird' | 'reptile' | 'pocket-pet',
      breed: pet.breed,
      age: typeof pet.age === 'string' ? parseFloat(pet.age) || 1 : pet.age || 1,
      weight: pet.weight || pet.weightKg || 10,
      activityLevel: pet.activityLevel,
      healthConcerns: pet.healthConcerns || [],
      dietaryRestrictions: pet.dietaryRestrictions || [],
      allergies: pet.allergies || [],
    };
    return calculateEnhancedCompatibility(recipe, enhancedPet);
  })() : null;
  
  const compatibilityRating = enhancedScore ? {
    overallScore: enhancedScore.overallScore,
    compatibility: gradeToCompatibility(enhancedScore.grade),
    breakdown: enhancedScore.factors,
    warnings: enhancedScore.detailedBreakdown.warnings,
    strengths: enhancedScore.detailedBreakdown.healthBenefits,
    recommendations: enhancedScore.detailedBreakdown.recommendations,
  } : null;

  return (
    <>
      <Link
        href={`/recipe/${recipe.id}${pet ? `?petId=${pet.id}` : ''}`}
        className="group bg-surface rounded-lg shadow-md border border-surface-highlight hover:shadow-lg hover:border-orange-500/50 transition-shadow duration-200 overflow-hidden"
      >
        <div className="bg-surface-highlight px-4 py-3 border-b border-surface-highlight flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-xs font-semibold text-foreground uppercase tracking-wide">
              {recipe.category}
            </div>
            {(recipe.needsReview === true || (recipe as any).usesFallbackNutrition) && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-900/40 text-amber-200 border border-amber-700/50">
                ⚠️ Experimental / Topper Only
              </span>
            )}
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

          {/* Explainable scoring */}
          {enhancedScore && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-4">
              <div className="flex items-start gap-2">
                <span className="text-lg">ℹ️</span>
                <p className="text-sm text-blue-900">Compatibility score: {enhancedScore.overallScore}% ({enhancedScore.grade})</p>
              </div>
            </div>
          )}
          {compatibilityRating?.recommendations && compatibilityRating.recommendations.length > 0 && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mb-4">
              <div className="flex items-start gap-2">
                <span className="text-lg">💡</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-amber-900 mb-2">Suggestions:</h4>
                  <ul className="text-sm text-amber-800 space-y-1">
                    {compatibilityRating.recommendations.map((rec, i) => (
                      <li key={i}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}


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