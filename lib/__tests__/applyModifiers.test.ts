import { describe, it, expect } from 'vitest';
import { applyModifiers } from '../applyModifiers';
import { getVettedProduct } from '../data/vetted-products';

describe('applyModifiers', () => {
  const mockRecipe = {
    id: '1',
    name: 'Test Recipe',
    category: 'dogs',
    ageGroup: ['adult'],
    breed: ['labrador'],
    healthConcerns: ['joint-health', 'allergies'],
    ingredients: [
      { id: '1', name: 'Chicken', amount: '100g' },
      { id: '2', name: 'Rice', amount: '50g' },
    ],
  };

  const mockPetAllergies = {
    id: '1',
    name: 'Buddy',
    type: 'dogs',
    breed: 'labrador',
    age: 'adult',
    healthConcerns: ['allergies'],
  };

  const mockPetJoint = {
    id: '2',
    name: 'Max',
    type: 'dogs',
    breed: 'golden',
    age: 'senior',
    healthConcerns: ['joint-health'],
  };

  const mockPetNone = {
    id: '3',
    name: 'Bella',
    type: 'cats',
    breed: 'persian',
    age: 'adult',
    healthConcerns: [],
  };

  it('should add allergy-related ingredients for pet with allergies', () => {
    const result = applyModifiers(mockRecipe as any, mockPetAllergies as any);
    expect(result.addedIngredients.length).toBeGreaterThan(0);
    expect(result.addedIngredients.some((add) => add.forConcern === 'allergies')).toBe(true);
    expect(result.modifiedRecipe.ingredients.length).toBe(mockRecipe.ingredients.length);
  });

  it('should add joint-related ingredients for pet with joint issues', () => {
    const result = applyModifiers(mockRecipe as any, mockPetJoint as any);
    expect(result.addedIngredients.length).toBeGreaterThan(0);
    expect(result.addedIngredients.some((add) => add.forConcern === 'joint-health')).toBe(true);
  });

  it('should not add ingredients for non-dog pets', () => {
    const result = applyModifiers(mockRecipe as any, mockPetNone as any);
    expect(result.addedIngredients.length).toBe(0);
  });

  it('should not add ingredients if recipe does not support the concern', () => {
    const recipeNoSupport = { ...mockRecipe, healthConcerns: [] };
    const result = applyModifiers(recipeNoSupport as any, mockPetJoint as any);
    expect(result.addedIngredients.length).toBe(0);
  });
});

describe('getVettedProduct', () => {
  it('should find vetted products for normalized ingredient names', () => {
    // Test exact matches
    expect(getVettedProduct('chicken breast')).toBeDefined();
    expect(getVettedProduct('ground turkey')).toBeDefined();

    // Test normalized matches
    expect(getVettedProduct('Boneless skinless chicken breast')).toBeDefined();
    expect(getVettedProduct('White rice (cooked)')).toBeDefined();
    expect(getVettedProduct('Carrot, diced')).toBeDefined();
    expect(getVettedProduct('Canned pumpkin (no sugar)')).toBeDefined();
    expect(getVettedProduct('Fresh salmon')).toBeDefined();
  });

  it('should return undefined for unknown ingredients', () => {
    expect(getVettedProduct('unknown ingredient')).toBeUndefined();
    expect(getVettedProduct('random food')).toBeUndefined();
  });
});