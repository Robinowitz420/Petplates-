'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Recipe } from '@/lib/types';
import { recipes } from '@/lib/data/recipes-complete';
import RecipeCard from '@/components/RecipeCard';
import {
  calculateEnhancedCompatibility,
  type Pet as EnhancedPet,
} from '@/lib/utils/enhancedCompatibilityScoring';
import type { Pet as RatingPet } from '@/lib/utils/petRatingSystem';
import { normalizePetType } from '@/lib/utils/petType';

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
  activityLevel?: 'sedentary' | 'moderate' | 'active' | 'very-active';
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

  const ratingPet: RatingPet | null = useMemo(() => {
    if (!pet) return null;

    const ageYears = pet.age === 'baby' ? 0.5 : pet.age === 'young' ? 2 : pet.age === 'adult' ? 5 : 10;
    const weightNum =
      typeof pet.weightKg === 'number'
        ? pet.weightKg
        : typeof pet.weight === 'number'
          ? pet.weight
          : typeof pet.weight === 'string'
            ? parseFloat(pet.weight)
            : 25;

    return {
      id: pet.id,
      name: pet.name,
      type: normalizePetType(pet.type, 'recipes/recommended/[id]') as RatingPet['type'],
      breed: pet.breed,
      age: ageYears,
      weight: Number.isFinite(weightNum) ? weightNum : 25,
      activityLevel: pet.activityLevel || 'moderate',
      healthConcerns: pet.healthConcerns || [],
      dietaryRestrictions: pet.dietaryRestrictions || [],
      allergies: pet.allergies || [],
      dislikes: pet.dislikes || [],
      savedRecipes: pet.savedRecipes || [],
      names: pet.names,
      weightKg: pet.weightKg,
    };
  }, [pet]);

  // Convert pet data to enhanced compatibility format
  const enhancedPet: EnhancedPet | null = ratingPet
    ? {
        id: ratingPet.id,
        name: ratingPet.name,
        type: ratingPet.type,
        breed: ratingPet.breed,
        age: ratingPet.age,
        weight: ratingPet.weight || ratingPet.weightKg || 25,
        activityLevel: (ratingPet.activityLevel || 'moderate') as EnhancedPet['activityLevel'],
        healthConcerns: ratingPet.healthConcerns || [],
        dietaryRestrictions: ratingPet.dietaryRestrictions || [],
        allergies: ratingPet.allergies || [],
      }
    : null;

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

    // Calculate compatibility scores for all recipes against this pet using enhanced scoring
    const scored = recipes.map((recipe) => {
      if (!enhancedPet) return { recipe, score: null };

      try {
        const enhanced = calculateEnhancedCompatibility(recipe, enhancedPet);
        return {
          recipe,
          score: {
            compatibilityScore: enhanced.overallScore,
            stars: Math.round(enhanced.overallScore / 20),
            reasoning: {
              goodMatches: enhanced.detailedBreakdown.healthBenefits,
              conflicts: enhanced.detailedBreakdown.warnings,
            },
            enhancedScore: enhanced, // keep for detail view
          },
        };
      } catch (error) {
        console.error('Error calculating compatibility:', error);
        return { recipe, score: null };
      }
    });

    // Sort by compatibility score (highest first)
    const sorted = scored.sort((a, b) => {
      if (!a.score || !b.score) return 0;
      return b.score.compatibilityScore - a.score.compatibilityScore;
    });

    return sorted;
  }, [pet]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-gray-400">Loading recommended recipes...</p>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bg-surface p-8 rounded-xl shadow text-center space-y-4 border border-surface-highlight">
          <p className="text-xl font-semibold text-gray-200">Pet not found.</p>
          <Link href="/profile" className="text-primary-600 font-semibold">
            Back to Profiles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={`/profile/pet/${pet.id}/meal-plan`}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-primary-400 font-medium"
          >
            <ArrowLeft size={20} />
            Back to Meal Plan
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-100 mb-2">
            Best Matches for {pet.name}
          </h1>
          <p className="text-gray-400 mb-4">
            Recipes ranked by how well they match {pet.name}'s nutritional needs, breed, age, and health concerns.
            Higher compatibility scores indicate better suitability.
          </p>

          {/* Debug Info */}
          <div className="bg-surface border border-surface-highlight rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-gray-200 mb-2">Debug Info:</h3>
            <p className="text-sm text-gray-400">
              Pet Type: <strong>{pet.type}</strong> |
              Total Recipes: <strong>{recipes?.length || 0}</strong> |
              Scored Recipes: <strong>{scoredRecipes.length}</strong> |
              Recipes with Score {'>'} 0: <strong>{scoredRecipes.filter((s) => s.score?.compatibilityScore && s.score.compatibilityScore > 0).length}</strong>
            </p>
            {scoredRecipes.length > 0 && (
              <p className="text-sm text-gray-400 mt-1">
                Top Score: <strong>{scoredRecipes[0]?.score?.compatibilityScore || 0}%</strong> |
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
            <p className="text-gray-400">
              Showing top 50 best compatibility matches. There are {scoredRecipes.length - 50} more recipes available.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}