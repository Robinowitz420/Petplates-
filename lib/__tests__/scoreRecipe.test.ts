import { describe, it, expect } from 'vitest';
import { scoreRecipe } from '../scoreRecipe';

describe('scoreRecipe', () => {
  const mockRecipe = {
    id: '1',
    name: 'Test Recipe',
    category: 'dogs',
    ageGroup: ['adult'],
    breed: ['labrador'],
    healthConcerns: ['joint-health'],
    tags: ['low-calorie'],
    ingredients: [
      { id: '1', name: 'Chicken', amount: '100g' },
      { id: '2', name: 'Rice', amount: '50g' },
    ],
    nutritionalInfo: { protein: 25, fat: 10 },
  };

  const mockPet = {
    id: '1',
    name: 'Buddy',
    type: 'dogs',
    breed: 'labrador',
    age: 'adult',
    healthConcerns: ['joint-health'],
    weightKg: 25,
    weightStatus: 'ideal',
  };

  it('should return high score for perfect match', () => {
    const result = scoreRecipe(mockRecipe as any, mockPet as any);
    expect(result.matchScore).toBeGreaterThan(80);
    expect(result.stars).toBe(5);
    expect(result.reasoning.goodMatches).toContain('Age group match');
    expect(result.reasoning.goodMatches).toContain('Breed-specific match');
    expect(result.reasoning.goodMatches).toContain('Supports joint-health');
  });

  it('should return 0 for wrong species', () => {
    const wrongSpeciesPet = { ...mockPet, type: 'cats' };
    const result = scoreRecipe(mockRecipe as any, wrongSpeciesPet as any);
    expect(result.matchScore).toBe(0);
    expect(result.stars).toBe(1);
    expect(result.reasoning.conflicts).toContain('Different species - not suitable');
  });

  it('should penalize for allergies', () => {
    const allergicPet = { ...mockPet, healthConcerns: ['allergies'], allergies: ['chicken'] };
    const result = scoreRecipe(mockRecipe as any, allergicPet as any);
    expect(result.matchScore).toBe(0);
    expect(result.reasoning.conflicts).toContain('Contains potential allergen: chicken');
  });

  it('should boost for low-calorie tag on overweight pet', () => {
    const overweightPet = { ...mockPet, weightStatus: 'overweight' };
    const result = scoreRecipe(mockRecipe as any, overweightPet as any);
    expect(result.reasoning.goodMatches).toContain('Low-calorie fit for weight control');
  });

  it('should handle missing nutrition info', () => {
    const noNutritionRecipe = { ...mockRecipe, nutritionalInfo: undefined };
    const result = scoreRecipe(noNutritionRecipe as any, mockPet as any);
    expect(result.matchScore).toBeLessThan(100);
  });
});