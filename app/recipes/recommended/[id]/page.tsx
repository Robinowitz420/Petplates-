'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { recipes } from '@/lib/data/recipes-complete';
import type { Recipe } from '@/lib/types';
import RecipeCard from '@/components/RecipeCard';
import { rateRecipeForPet, type Pet as RatingPet } from '@/lib/utils/petRatingSystem';
import {
  calculateImprovedCompatibility,
  type ImprovedPet,
} from '@/lib/utils/improvedCompatibilityScoring';

const SIMULATED_USER_ID = 'clerk_simulated_user_id_123';

interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: string;
  healthConcerns: string[];
  mealPlan: string[];
  savedRecipes?: string[];
  names?: string[];
  weight?: string | number;
  weightKg?: number;
  dietaryRestrictions?: string[];
  allergies?: string[];
  dislikes?: string[];
}

const getPetsFromLocalStorage = (userId: string): Pet[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(`pets_${userId}`);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function RecommendedRecipesPage() {
  const params = useParams();
  const petId = params.id as string;

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);

  // Convert pet data to rating system format
  const ratingPet: RatingPet | null = pet ? {
    id: pet.id,
    name: pet.name,
    type: pet.type as RatingPet['type'],
    breed: pet.breed,
    age: pet.age === 'baby' ? 0.5 : pet.age === 'young' ? 2 : pet.age === 'adult' ? 5 : 10, // Convert to years
    weight: 25, // Default to 25 lbs since weight isn't stored in this format
    activityLevel: 'moderate' as const, // Default activity level
    healthConcerns: pet.healthConcerns || [],
    dietaryRestrictions: [] // Not available in current pet format
  } : null;

  useEffect(() => {
    if (petId) {
      const userId = SIMULATED_USER_ID;
      const pets = getPetsFromLocalStorage(userId);
      const foundPet = pets.find((p) => p.id === petId) || null;
      setPet(foundPet);
      setLoading(false);
    }
  }, [petId]);

  const scoredRecipes = useMemo(() => {
    if (!pet) return [];

    // Debug logging removed - use logger if needed

    // Calculate match scores for all recipes against this pet using improved scoring
    const scored = recipes.map((recipe) => {
      if (!ratingPet) return { recipe, score: null };
      
      try {
        const improvedPet: ImprovedPet = {
          id: ratingPet.id,
          name: ratingPet.name,
          type: ratingPet.type,
          breed: ratingPet.breed,
          age: typeof ratingPet.age === 'string' ? parseFloat(ratingPet.age) || 1 : ratingPet.age || 1,
          weight: ratingPet.weight || 10,
          activityLevel: ratingPet.activityLevel,
          healthConcerns: ratingPet.healthConcerns || [],
          dietaryRestrictions: ratingPet.dietaryRestrictions || [],
          allergies: ratingPet.allergies || [],
        };
        const improved = calculateImprovedCompatibility(recipe, improvedPet);
        return {
          recipe,
          score: {
            matchScore: improved.overallScore,
            stars: Math.round(improved.overallScore / 20),
            reasoning: {
              goodMatches: improved.reasoning.strengths,
              conflicts: improved.reasoning.warnings,
            },
            enhancedScore: improved, // keep for detail view
          }
        };
      } catch (error) {
        // Fallback to original scoring
        const score = rateRecipeForPet(recipe, ratingPet);
      return {
        recipe,
          score: {
          matchScore: score.overallScore,
          stars: Math.round(score.overallScore / 20),
          reasoning: {
            goodMatches: score.strengths,
            conflicts: score.warnings
          }
          }
      };
      }
    });

    // Debug logging removed - use logger if needed

    // Sort by match score (highest first)
    const sorted = scored.sort((a, b) => {
      if (!a.score || !b.score) return 0;
      return b.score.matchScore - a.score.matchScore;
    });

    // Debug logging removed - use logger if needed

    return sorted;
  }, [pet]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading recommended recipes...</p>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow text-center space-y-4">
          <p className="text-xl font-semibold text-gray-800">Pet not found.</p>
          <Link href="/profile" className="text-primary-600 font-semibold">
            Back to Profiles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={`/profile/pet/${pet.id}/meal-plan`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 font-medium"
          >
            <ArrowLeft size={20} />
            Back to Meal Plan
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Best Matches for {pet.name}
          </h1>
          <p className="text-gray-600 mb-4">
            Recipes ranked by how well they match {pet.name}'s nutritional needs, breed, age, and health concerns.
            Higher match scores indicate better suitability.
          </p>

          {/* Debug Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Debug Info:</h3>
            <p className="text-sm text-yellow-700">
              Pet Type: <strong>{pet.type}</strong> |
              Total Recipes: <strong>{recipes?.length || 0}</strong> |
              Scored Recipes: <strong>{scoredRecipes.length}</strong> |
              Recipes with Score {'>'} 0: <strong>{scoredRecipes.filter(s => s.score?.matchScore && s.score.matchScore > 0).length}</strong>
            </p>
            {scoredRecipes.length > 0 && (
              <p className="text-sm text-yellow-700 mt-1">
                Top Score: <strong>{scoredRecipes[0]?.score?.matchScore || 0}%</strong> |
                Sample Recipe: <strong>{scoredRecipes[0]?.recipe?.name} ({scoredRecipes[0]?.recipe?.category})</strong>
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scoredRecipes.slice(0, 50).map(({ recipe }) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              pet={ratingPet}
            />
          ))}
        </div>

        {scoredRecipes.length > 50 && (
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Showing top 50 best matches. There are {scoredRecipes.length - 50} more recipes available.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}