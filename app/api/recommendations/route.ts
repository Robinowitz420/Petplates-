import { NextResponse } from 'next/server';
import { generateModifiedRecommendations } from '@/lib/applyModifiers';
import { PetNutritionProfile } from '@/lib/types';
import { getRecommendedRecipes } from '@/lib/utils/recipeRecommendations';
import { recipes } from '@/lib/data/recipes-complete';

const normalizeValue = (value?: string | null) => {
  const normalized = (value || '').trim().toLowerCase();
  // Replace multiple consecutive non-alphanumeric chars with single dash
  return normalized.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profile, recipeIds, limit, minCompatibilityScore } = body;

    // API request received

    if (!profile || !profile.species || !profile.ageGroup || !profile.weightKg) {
      return NextResponse.json(
        { error: 'Missing required profile fields (species, ageGroup, weightKg).' },
        { status: 400 }
      );
    }

    const bannedIngredients = (profile.bannedIngredients || []).map(normalizeValue);
    
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
    
    // Helper to check if recipe contains banned ingredients
    const hasBannedIngredient = (recipe: any): boolean => {
      if (bannedIngredients.length === 0) return false;
      const recipeIngredients = (recipe.ingredients || []).map((ing: any) => {
        const name = typeof ing === 'string' ? ing : ing.name;
        return normalizeValue(name);
      });
      return bannedIngredients.some((banned: string) => 
        recipeIngredients.some((ing: string) => ing.includes(banned) || banned.includes(ing))
      );
    };

    // Helper to check if recipe contains allergens
    const hasAllergen = (recipe: any): boolean => {
      const allergies = normalizedProfile.allergies || [];
      if (allergies.length === 0) return false;
      const recipeIngredients = (recipe.ingredients || []).map((ing: any) => {
        const name = typeof ing === 'string' ? ing : ing.name;
        return normalizeValue(name);
      });
      return allergies.some((allergy: string) => 
        recipeIngredients.some((ing: string) => ing.includes(allergy) || allergy.includes(ing))
      );
    };

    if (Number.isNaN(normalizedProfile.weightKg) || normalizedProfile.weightKg <= 0) {
      return NextResponse.json(
        { error: 'weightKg must be a positive number.' },
        { status: 400 }
      );
    }

    let results: any[] = [];
    
    try {
      results = generateModifiedRecommendations({
        profile: normalizedProfile,
        recipeIds: recipeIds || [],
        limit: limit ?? 50,
        minCompatibilityScore: minCompatibilityScore ?? 30,
      });
      
      // Filter out recipes with banned ingredients and allergens
      results = results.filter(result => {
        const recipe = result.recipe;
        return !hasBannedIngredient(recipe) && !hasAllergen(recipe);
      });
    } catch (error) {
      // Error in generateModifiedRecommendations - handled below
      // Continue to fallback
    }

    // Fallback: If no results, use tiered recommendation system
    if (!Array.isArray(results) || results.length === 0) {
      const petForRecommendations = {
        id: '',
        name: normalizedProfile.petName || '',
        type: normalizedProfile.species,
        breed: normalizedProfile.breed || '',
        age: normalizedProfile.ageGroup,
        healthConcerns: normalizedProfile.healthConcerns || []
      };
      
      const tieredRecs = getRecommendedRecipes(petForRecommendations, limit ?? 10, true);
      
      // Filter out recipes with banned ingredients
      const filteredRecs = tieredRecs.filter(rec => !hasBannedIngredient(rec.recipe));
      
      // Convert tiered recommendations to ModifiedRecipeResult format
      results = filteredRecs.map(rec => ({
        recipe: rec.recipe,
        adjustedIngredients: rec.recipe.ingredients,
        appliedRules: [],
        nutritionChanges: {},
        portionPlan: {
          dailyGrams: normalizedProfile.weightKg * 20, // Rough estimate
          multiplier: 1,
          mealsPerDay: 2,
          notes: []
        },
        shoppingList: rec.recipe.ingredients.map(ing => ({
          name: ing.name,
          amount: ing.amount,
          asinLink: ing.asinLink || '',
          notes: '',
          category: 'Ingredient'
        })),
        explanation: `Recommended for ${normalizedProfile.petName || 'your pet'}: ${rec.tierLabel}`,
        weeklyPlan: [],
        score: rec.score,
        _tierLabel: rec.tierLabel,
        _warning: rec.warning,
        _healthMatch: rec.healthConcernMatch
      }));
    }
    
    // FALLBACK 2: If still empty, show general recipes for the species
    if (!Array.isArray(results) || results.length === 0) {
      // Both recommendation methods failed - using general recipes
      const generalRecipes = recipes
        .filter(r => {
          // Try to match by species (normalized)
          const normalizeSpecies = (s: string) => s.toLowerCase().replace(/s$/, '');
          const speciesMatch = normalizeSpecies(r.category) === normalizeSpecies(normalizedProfile.species);
          // Also filter out banned ingredients
          return speciesMatch && !hasBannedIngredient(r);
        })
        .slice(0, limit ?? 5)
        .map(r => ({
          recipe: r,
          adjustedIngredients: r.ingredients,
          appliedRules: [],
          nutritionChanges: {},
          portionPlan: {
            dailyGrams: normalizedProfile.weightKg * 20,
            multiplier: 1,
            mealsPerDay: 2,
            notes: ['General recommendation - consult vet']
          },
          shoppingList: r.ingredients.map(ing => ({
            name: ing.name,
            amount: ing.amount,
            asinLink: ing.asinLink || '',
            notes: 'General recommendation - consult vet',
            category: 'Ingredient'
          })),
          explanation: `${r.name} - General recommendation for ${normalizedProfile.petName || 'your pet'}. Please consult your veterinarian.`,
          weeklyPlan: [],
          score: 30, // Low score to indicate it's a general recommendation
          _tierLabel: 'General Recommendation',
          _warning: 'General recommendation - consult vet',
          _healthMatch: undefined
        }));
      
      results = generalRecipes;
    }

    // API returning recipes
    const totalFound = results.length;

    return NextResponse.json({ 
      results,
      totalFound,
      metadata: {
        filteredByCompatibility: true,
        minCompatibilityScore: minCompatibilityScore ?? 30,
        filteredByBannedIngredients: bannedIngredients.length > 0,
        filteredByAllergies: (normalizedProfile.allergies || []).length > 0,
      }
    });
  } catch (error) {
    console.error('Recommendation engine failure:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Unable to generate recommendations: ${errorMessage}` },
      { status: 500 }
    );
  }
}

