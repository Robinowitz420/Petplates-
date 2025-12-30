'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import type { Recipe, Pet as AppPet } from '@/lib/types';
import { recipes } from '@/lib/data/recipes-complete';
import RecipeCard from '@/components/RecipeCard';
import { scoreWithSpeciesEngine } from '@/lib/utils/speciesScoringEngines';
import { normalizePetType } from '@/lib/utils/petType';
import { getPets } from '@/lib/utils/petStorage';

export default function RecommendedRecipesPage() {
  const params = useParams();
  const petId = params.id as string;
  const { userId, isLoaded } = useAuth();

  const [pet, setPet] = useState<AppPet | null>(null);
  const [loading, setLoading] = useState(true);

  const scoringPet = useMemo(() => {
    if (!pet) return null;

    const petDisplayName =
      pet.name || (Array.isArray(pet.names) && pet.names.length > 0 ? pet.names[0] : 'Pet');

    const petType = normalizePetType(String(pet.type || 'dog'), 'recipes/recommended/[id]');
    const breed = typeof pet.breed === 'string' ? pet.breed : '';
    const ageRaw = String((pet as any).age || 'adult');
    const ageYears = ageRaw === 'baby' ? 0.5 : ageRaw === 'young' ? 2 : ageRaw === 'adult' ? 5 : 10;

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
      name: petDisplayName,
      type: petType,
      breed,
      age: ageYears,
      weight: Number.isFinite(weightNum) ? weightNum : 25,
      activityLevel: pet.activityLevel || 'moderate',
      healthConcerns: pet.healthConcerns || [],
      dietaryRestrictions: pet.dietaryRestrictions || [],
      allergies: pet.allergies || [],
    } as any;
  }, [pet]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!petId) return;
    if (!userId) {
      setPet(null);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const pets = await getPets(userId);
        const foundPet = (pets as any[]).find((p: any) => p.id === petId) || null;
        setPet(foundPet as AppPet | null);
      } catch (error) {
        console.error('Failed to load pet:', error);
        setPet(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [isLoaded, petId, userId]);

  const scoredRecipes = useMemo(() => {
    if (!pet) return [];

    const scored = recipes.map((recipe) => {
      if (!scoringPet) return { recipe, score: null };

      try {
        const speciesScore = scoreWithSpeciesEngine(recipe, scoringPet);
        return {
          recipe,
          score: {
            compatibilityScore: speciesScore.overallScore,
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
  }, [pet, scoringPet]);

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

  const petDisplayName =
    pet.name || (Array.isArray(pet.names) && pet.names.length > 0 ? pet.names[0] : 'Pet');

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
            Best Matches for {petDisplayName}
          </h1>
          <p className="text-gray-400 mb-4">
            Recipes ranked by how well they match {petDisplayName}'s nutritional needs, breed, age, and health concerns.
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
              pet={pet as any}
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