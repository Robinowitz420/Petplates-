// lib/__tests__/perfect-pet-scoring.test.ts
// Integration tests for perfect pet scoring

import { scoreWithSpeciesEngine, type SpeciesScoringPet } from '../utils/speciesScoringEngines';
import type { Recipe } from '../types';

describe('Perfect Pet Scoring', () => {
  const perfectDog: SpeciesScoringPet = {
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
  
  const perfectBird: SpeciesScoringPet = {
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
    instructions: ['Mix and serve.'],
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
  
  test('Perfect dog scoring returns a valid score object', () => {
    const score = scoreWithSpeciesEngine(perfectRecipe, perfectDog);
    expect(score.overallScore).toBeGreaterThanOrEqual(0);
    expect(score.overallScore).toBeLessThanOrEqual(100);
    expect(typeof score.grade).toBe('string');
    expect(score.species).toBe('dog');
    expect(score.factors).toBeDefined();
    expect(typeof score.factors.safety).toBe('number');
    expect(typeof score.factors.nutrition).toBe('number');
    expect(typeof score.factors.health).toBe('number');
    expect(typeof score.factors.quality).toBe('number');
  });
  
  test('Perfect bird scoring returns a valid score object', () => {
    const recipeForBird: Recipe = { ...perfectRecipe, category: 'birds' } as any;
    const score = scoreWithSpeciesEngine(recipeForBird, perfectBird);
    expect(score.overallScore).toBeGreaterThanOrEqual(0);
    expect(score.overallScore).toBeLessThanOrEqual(100);
    expect(score.species).toBe('bird');
  });
});

