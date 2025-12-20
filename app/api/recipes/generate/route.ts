import { NextRequest, NextResponse } from 'next/server';
import { generateRecipesForPet } from '@/lib/recipe-generator-v3';
import type { Pet } from '@/lib/types';

export const runtime = 'nodejs';

interface RecipeRequest {
  species?: string;
  count?: number;
  petProfile?: {
    name?: string;
    weight?: string;
    weightKg?: number;
    age?: string;
    allergies?: string[];
    healthConcerns?: string[];
  };
}

/**
 * Generate recipes dynamically based on pet species
 * POST /api/recipes/generate
 * Body: { species: 'dogs' | 'cats' | 'birds' | 'reptiles' | 'pocket-pets', count?: number, petProfile?: {...} }
 */
export async function POST(request: NextRequest) {
  try {
    const body: RecipeRequest = await request.json();
    const { species = 'dogs', count = 50, petProfile } = body;

    // Create a mock pet for recipe generation
    const mockPet: any = {
      id: `mock-${species}-${Date.now()}`,
      name: petProfile?.name || 'Your Pet',
      type: species,
      breed: 'Mixed',
      age: petProfile?.age || 'adult',
      weight: petProfile?.weight || '10',
      weightKg: petProfile?.weightKg || 10,
      allergies: petProfile?.allergies || [],
      healthConcerns: petProfile?.healthConcerns || [],
    };

    // Generate recipes using pragmatic system
    console.log('[API] Generating recipes for pet:', {
      name: mockPet.name,
      type: mockPet.type,
      healthConcerns: mockPet.healthConcerns,
      allergies: mockPet.allergies,
    });
    
    const recipes = generateRecipesForPet(
      {
        pet: mockPet as Pet,
      },
      count
    );

    console.log('[API] Generated recipes count:', recipes?.length || 0);

    const generatedRecipes = recipes.map((recipe: any, index: number) => ({
      ...recipe,
      id: recipe.id || `generated-${species}-${index}-${Date.now()}`,
      generatedAt: new Date().toISOString(),
    }));

    if (generatedRecipes.length === 0) {
      console.error('[API] No recipes generated - returning 500');
      return NextResponse.json(
        { error: 'Failed to generate any recipes', species, attemptedCount: count, petProfile: mockPet },
        { status: 500 }
      );
    }

    // Sort by overall score (best first)
    generatedRecipes.sort((a: any, b: any) => (b.scores?.overall || 0) - (a.scores?.overall || 0));

    return NextResponse.json({
      success: true,
      recipes: generatedRecipes,
      stats: {
        total: generatedRecipes.length,
        avgScore: (generatedRecipes.reduce((sum: number, r: any) => sum + (r.scores?.overall || 0), 0) / generatedRecipes.length).toFixed(1),
      },
    });
  } catch (error) {
    console.error('Recipe generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recipes', details: String(error) },
      { status: 500 }
    );
  }
}
