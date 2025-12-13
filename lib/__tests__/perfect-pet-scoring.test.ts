// lib/__tests__/perfect-pet-scoring.test.ts
// Integration tests for perfect pet scoring

import { calculateEnhancedCompatibility, isGoldStandardForSimplePet, calibrateScoresForPet, type Pet } from '@/lib/utils/enhancedCompatibilityScoring';
import type { Recipe } from '@/lib/types';

describe('Perfect Pet Scoring', () => {
  const perfectDog: Pet = {
    id: 'test-perfect-dog',
    name: 'Test Dog',
    type: 'dog',
    breed: 'golden-retriever',
    age: 3,
    weight: 15,
    activityLevel: 'moderate',
    healthConcerns: [],
    dietaryRestrictions: [],
    allergies: []
  };
  
  const perfectBird: Pet = {
    id: 'test-perfect-bird',
    name: 'Test Bird',
    type: 'bird',
    breed: 'parrot',
    age: 2,
    weight: 0.5,
    activityLevel: 'moderate',
    healthConcerns: [],
    dietaryRestrictions: [],
    allergies: []
  };
  
  const perfectRecipe: Recipe = {
    id: 'perfect-test-recipe',
    name: 'Perfect Test Recipe',
    category: 'dogs',
    ingredients: [
      { id: '1', name: 'chicken_breast', amount: '70%' },
      { id: '2', name: 'sweet_potato', amount: '20%' },
      { id: '3', name: 'carrots', amount: '8%' },
      { id: '4', name: 'fish_oil', amount: '2%' }
    ],
    nutritionalInfo: {
      protein: { min: 25, max: 30, unit: '%' },
      fat: { min: 12, max: 18, unit: '%' },
      fiber: { min: 3, max: 5, unit: '%' },
      calcium: { min: 1.0, max: 1.5, unit: '%' },
      phosphorus: { min: 0.8, max: 1.2, unit: '%' }
    },
    ageGroup: ['adult'],
    healthConcerns: []
  };
  
  test('Perfect dog should get 95-100% for perfect recipe', () => {
    const score = calculateEnhancedCompatibility(perfectRecipe, perfectDog);
    expect(score.overallScore).toBeGreaterThanOrEqual(95);
  });
  
  test('Perfect recipe should be gold-standard for perfect pet', () => {
    const isGold = isGoldStandardForSimplePet(perfectRecipe, perfectDog);
    expect(isGold).toBe(true);
  });
  
  test('Calibration should scale gold-standard recipe to 100%', () => {
    const recipes = [perfectRecipe];
    const calibrated = calibrateScoresForPet(recipes, perfectDog);
    expect(calibrated.get(perfectRecipe.id)).toBeGreaterThanOrEqual(98);
  });
  
  test('Each factor should be identifiable when preventing 100%', () => {
    const score = calculateEnhancedCompatibility(perfectRecipe, perfectDog);
    if (score.overallScore < 100) {
      const lowFactors = Object.entries(score.factors)
        .filter(([_, factor]) => factor.score < 100)
        .map(([key, factor]) => `${key}: ${factor.score}%`);
      console.log('Factors preventing 100%:', lowFactors);
      // This should help identify the bottleneck
    }
  });
  
  test('Health alignment should return 100% for pets with no concerns', () => {
    const score = calculateEnhancedCompatibility(perfectRecipe, perfectDog);
    expect(score.factors.healthAlignment.score).toBe(100);
  });
  
  test('Allergen safety should return 100% for pets with no allergies', () => {
    const score = calculateEnhancedCompatibility(perfectRecipe, perfectDog);
    expect(score.factors.allergenSafety.score).toBe(100);
  });
});

