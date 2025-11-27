import { NextResponse } from 'next/server';
import { generateModifiedRecommendations } from '@/lib/applyModifiers';
import { PetNutritionProfile } from '@/lib/types';

const normalizeValue = (value?: string | null) =>
  (value || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '-');

export async function POST(request: Request) {
  try {
    const { profile, recipeIds, limit } = await request.json();

    if (!profile || !profile.species || !profile.ageGroup || !profile.weightKg) {
      return NextResponse.json(
        { error: 'Missing required profile fields (species, ageGroup, weightKg).' },
        { status: 400 }
      );
    }

    const normalizedProfile: PetNutritionProfile = {
      species: profile.species,
      ageGroup: normalizeValue(profile.ageGroup),
      weightKg: Number(profile.weightKg),
      breed: profile.breed || null,
      healthConcerns: (profile.healthConcerns || []).map(normalizeValue),
      allergies: (profile.allergies || []).map(normalizeValue),
      caloriesPerKgOverride: profile.caloriesPerKgOverride
        ? Number(profile.caloriesPerKgOverride)
        : undefined,
      petName: profile.petName,
    };

    if (Number.isNaN(normalizedProfile.weightKg) || normalizedProfile.weightKg <= 0) {
      return NextResponse.json(
        { error: 'weightKg must be a positive number.' },
        { status: 400 }
      );
    }

    const results = generateModifiedRecommendations({
      profile: normalizedProfile,
      recipeIds,
      limit: limit ?? 10,
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Recommendation engine failure:', error);
    return NextResponse.json(
      { error: 'Unable to generate recommendations.' },
      { status: 500 }
    );
  }
}

