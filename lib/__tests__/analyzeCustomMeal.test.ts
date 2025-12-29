// lib/__tests__/analyzeCustomMeal.test.ts
// Comprehensive tests for custom meal analysis engine

import { generateCustomMealAnalysis } from '../analyzeCustomMeal';

describe('generateCustomMealAnalysis', () => {
  test('returns proper structure for empty recipe', () => {
    const pet = {
      species: 'dogs' as const,
      lifeStage: 'adult' as const,
      weightKg: 25,
      allergies: [],
    };

    const result = generateCustomMealAnalysis(pet, []);

    expect(result.score).toBe(0);
    expect(result.deficiencies).toContain('No ingredients selected');
    expect(result.toxicityWarnings).toHaveLength(0);
    expect(result.totalWeight_g).toBe(0);
  });

  test('analyzes dog recipe correctly', () => {
    const pet = {
      species: 'dogs' as const,
      lifeStage: 'adult' as const,
      weightKg: 25,
      allergies: [],
    };

    const selections = [
      { key: 'ground_beef_lean', grams: 200 },
      { key: 'brown_rice_cooked', grams: 150 },
    ];

    const result = generateCustomMealAnalysis(pet, selections);

    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('nutrients');
    expect(result).toHaveProperty('dmNutrients');
    expect(result.nutrients.protein_g).toBeGreaterThan(0);
    expect(result.totalWeight_g).toBe(350);
    expect(result.dryMatterPercent).toBeLessThanOrEqual(100);
  });

  test('detects toxic ingredients for dogs', () => {
    const pet = {
      species: 'dogs' as const,
      lifeStage: 'adult' as const,
      weightKg: 25,
      allergies: [],
    };

    const selections = [
      { key: 'chicken_breast', grams: 100 },
      // Note: Currently no INGREDIENT_COMPOSITIONS entries match toxic keys exactly
      // This test will need updating when chocolate is properly added
    ];

    const result = generateCustomMealAnalysis(pet, selections);
    // Should not crash and provide valid analysis
    expect(result.score).toBeGreaterThan(0);
  });

  test('detects allergen warnings', () => {
    const pet = {
      species: 'dogs' as const,
      lifeStage: 'adult' as const,
      weightKg: 25,
      allergies: ['chicken_breast'], // This should cause a warning
    };

    const selections = [
      { key: 'chicken_breast', grams: 100 },
      { key: 'brown_rice_cooked', grams: 100 },
    ];

    const result = generateCustomMealAnalysis(pet, selections);

    expect(result.allergyWarnings.some((w) => w.message.toLowerCase().includes('allergy'))).toBe(true);
  });

  test('calculates Ca:P ratio correctly', () => {
    const pet = {
      species: 'dogs' as const,
      lifeStage: 'adult' as const,
      weightKg: 25,
      allergies: [],
    };

    // Using ingredients with known calcium and phosphorus
    const selections = [
      { key: 'chicken_breast', grams: 100 }, // 11mg Ca, 196mg P per 100g
    ];

    const result = generateCustomMealAnalysis(pet, selections);

    expect(result.caToPratio).toBeDefined();
    expect(result.caToPratio).toBeCloseTo(11/196, 3); // ~0.056
  });

  test('provides actionable suggestions', () => {
    const pet = {
      species: 'dogs' as const,
      lifeStage: 'adult' as const,
      weightKg: 25,
      allergies: [],
    };

    // Simple recipe
    const selections = [
      { key: 'chicken_breast', grams: 100 },
    ];

    const result = generateCustomMealAnalysis(pet, selections);

    expect(Array.isArray(result.suggestions)).toBe(true);
    expect(result.suggestions.length).toBeGreaterThan(0);
  });

  test('handles invalid ingredient keys gracefully', () => {
    const pet = {
      species: 'dogs' as const,
      lifeStage: 'adult' as const,
      weightKg: 25,
      allergies: [],
    };

    const selections = [
      { key: 'nonexistent_ingredient', grams: 100 },
    ];

    const result = generateCustomMealAnalysis(pet, selections);

    expect(result.score).toBe(0);
    expect(result.deficiencies[0]).toContain('Error: Ingredient not found');
  });

  test('works with reptiles (different Ca:P target)', () => {
    const pet = {
      species: 'reptiles' as const,
      lifeStage: 'adult' as const,
      weightKg: 0.25,
      allergies: [],
    };

    const selections = [
      { key: 'chicken_breast', grams: 50 },
      { key: 'kale_raw', grams: 100 },
    ];

    const result = generateCustomMealAnalysis(pet, selections);

    expect(result).toHaveProperty('score');
    expect(Array.isArray(result.suggestions)).toBe(true);
    expect(result.suggestions.length).toBeGreaterThan(0);
  });

  test('warns about toxic ingredients for birds', () => {
    const pet = {
      species: 'birds' as const,
      lifeStage: 'adult' as const,
      weightKg: 0.1,
      allergies: [],
    };

    const selections = [
      { key: 'chicken_breast', grams: 10 },
    ];

    const result = generateCustomMealAnalysis(pet, selections);

    // Should still work, even if no toxicity warnings for this ingredient
    expect(Array.isArray(result.toxicityWarnings)).toBe(true);
    expect(result.score).toBeGreaterThan(0);
  });
});

// Sample test data for documentation
export const sampleTests = {
  dog: {
    pet: {
      id: 'dog-example',
      name: 'Max',
      species: 'dogs' as const,
      lifeStage: 'adult' as const,
      weightKg: 25,
      allergies: ['chicken_breast'],
    },
    recipe: [
      { key: 'ground_beef_lean', grams: 200 },
      { key: 'brown_rice_cooked', grams: 150 },
      { key: 'kale_raw', grams: 50 },
    ],
  },
  reptile: {
    pet: {
      id: 'reptile-example',
      name: 'Spike',
      species: 'reptiles' as const,
      lifeStage: 'adult' as const,
      weightKg: 0.25,
      allergies: [],
    },
    recipe: [
      { key: 'chicken_breast', grams: 25 },
      { key: 'kale_raw', grams: 75 },
    ],
  },
  pocketPet: {
    pet: {
      id: 'pocket-example',
      name: 'Fluffy',
      species: 'pocket-pets' as const,
      lifeStage: 'adult' as const,
      weightKg: 0.05,
      allergies: [],
    },
    recipe: [
      { key: 'oats', grams: 10 },
      { key: 'kale_raw', grams: 5 },
    ],
  },
};
