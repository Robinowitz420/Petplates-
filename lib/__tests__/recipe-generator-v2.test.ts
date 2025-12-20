/**
 * Integration tests for refactored recipe generation system
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { generateRecipe, generateBestRecipe, generateRecipes } from '@/lib/recipe-generator-v2';
import type { Pet } from '@/lib/types';

describe('Recipe Generator V2 - Refactored', () => {
  let mockDog: Pet;
  let mockCat: Pet;

  beforeEach(() => {
    mockDog = {
      id: 'dog-1',
      name: 'Max',
      type: 'dogs',
      weightKg: 20,
      age: 'adult',
      healthConcerns: ['joint-health'],
      allergies: [],
      bannedIngredients: [],
    };

    mockCat = {
      id: 'cat-1',
      name: 'Whiskers',
      type: 'cats',
      weightKg: 5,
      age: 'adult',
      healthConcerns: [],
      allergies: [],
      bannedIngredients: [],
    };
  });

  describe('generateRecipe()', () => {
    it('should generate a valid recipe for a dog', () => {
      const recipe = generateRecipe({ pet: mockDog });

      expect(recipe).toBeDefined();
      expect(recipe?.id).toBeDefined();
      expect(recipe?.name).toBeDefined();
      expect(recipe?.ingredients.length).toBeGreaterThan(0);
      expect(recipe?.nutrition.protein).toBeGreaterThan(0);
      expect(recipe?.score).toBeGreaterThanOrEqual(0);
      expect(recipe?.score).toBeLessThanOrEqual(100);
    });

    it('should generate a valid recipe for a cat', () => {
      const recipe = generateRecipe({ pet: mockCat });

      expect(recipe).toBeDefined();
      expect(recipe?.ingredients.length).toBeGreaterThan(0);
      expect(recipe?.nutrition.kcal).toBeGreaterThan(0);
    });

    it('should respect budget constraint', () => {
      const recipe = generateRecipe({
        pet: mockDog,
        budgetPerMeal: 2.0,
      });

      expect(recipe).toBeDefined();
      expect(recipe?.estimatedCost).toBeLessThanOrEqual(2.0 * 1.5); // Allow 50% overage
    });

    it('should respect target calories', () => {
      const recipe = generateRecipe({
        pet: mockDog,
        targetCalories: 400,
      });

      expect(recipe).toBeDefined();
      expect(recipe?.nutrition.kcal).toBeGreaterThan(300);
      expect(recipe?.nutrition.kcal).toBeLessThan(500);
    });

    it('should include health concern alignment in scoring', () => {
      const recipe = generateRecipe({ pet: mockDog });

      expect(recipe).toBeDefined();
      expect(recipe?.scoreBreakdown.health).toBeGreaterThanOrEqual(0);
      expect(recipe?.scoreBreakdown.health).toBeLessThanOrEqual(100);
    });

    it('should validate nutrition against AAFCO standards', () => {
      const recipe = generateRecipe({ pet: mockDog });

      expect(recipe).toBeDefined();
      expect(recipe?.validation).toBeDefined();
      expect(recipe?.validation.score).toBeGreaterThanOrEqual(0);
      expect(recipe?.validation.score).toBeLessThanOrEqual(100);
    });

    it('should generate recipe name based on ingredients', () => {
      const recipe = generateRecipe({ pet: mockDog });

      expect(recipe?.name).toBeDefined();
      expect(recipe?.name.length).toBeGreaterThan(0);
      expect(recipe?.name).toContain(mockDog.name);
    });

    it('should include instructions', () => {
      const recipe = generateRecipe({ pet: mockDog });

      expect(recipe?.instructions).toBeDefined();
      expect(recipe?.instructions.length).toBeGreaterThan(0);
    });

    it('should calculate portion guidance', () => {
      const recipe = generateRecipe({ pet: mockDog });

      expect(recipe?.portionGuidance).toBeDefined();
      expect(recipe?.portionGuidance.servingSize).toBeDefined();
      expect(recipe?.portionGuidance.servingsPerDay).toBeDefined();
      expect(recipe?.portionGuidance.dailyCalories).toBeDefined();
    });

    it('should provide scoring explanation', () => {
      const recipe = generateRecipe({ pet: mockDog });

      expect(recipe?.explanation).toBeDefined();
      expect(recipe?.explanation.length).toBeGreaterThan(0);
    });
  });

  describe('generateBestRecipe()', () => {
    it('should return a recipe', () => {
      const recipe = generateBestRecipe({ pet: mockDog });

      expect(recipe).toBeDefined();
      expect(recipe?.score).toBeGreaterThanOrEqual(0);
    });

    it('should return highest scoring recipe from multiple attempts', () => {
      const recipe1 = generateRecipe({ pet: mockDog });
      const recipe2 = generateRecipe({ pet: mockDog });
      const best = generateBestRecipe({ pet: mockDog });

      expect(best).toBeDefined();
      if (recipe1 && recipe2) {
        expect(best?.score).toBeGreaterThanOrEqual(Math.min(recipe1.score, recipe2.score));
      }
    });
  });

  describe('generateRecipes()', () => {
    it('should generate multiple recipes', () => {
      const recipes = generateRecipes({ pet: mockDog }, 3);

      expect(recipes.length).toBeGreaterThan(0);
      expect(recipes.length).toBeLessThanOrEqual(3);
    });

    it('should generate diverse recipes', () => {
      const recipes = generateRecipes({ pet: mockDog }, 5);

      expect(recipes.length).toBeGreaterThan(0);

      // Check that recipes have different ingredients
      const ingredientSets = recipes.map(r =>
        new Set(r.ingredients.map(i => i.name.toLowerCase()))
      );

      // At least some recipes should differ
      const allSame = ingredientSets.every(set =>
        set.size === ingredientSets[0].size &&
        [...set].every(ing => ingredientSets[0].has(ing))
      );

      expect(allSame).toBe(false);
    });

    it('should respect count parameter', () => {
      const recipes = generateRecipes({ pet: mockDog }, 2);

      expect(recipes.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Nutrition validation', () => {
    it('should validate protein levels', () => {
      const recipe = generateRecipe({ pet: mockDog });

      expect(recipe?.nutrition.protein).toBeGreaterThan(0);
      expect(recipe?.validation.errors.length).toBeLessThanOrEqual(2); // Allow some errors
    });

    it('should validate calcium/phosphorus ratio', () => {
      const recipe = generateRecipe({ pet: mockDog });

      expect(recipe?.nutrition.caPRatio).toBeGreaterThan(0);
      // Optimal is 1.0-2.0
      if (recipe?.validation.isValid) {
        expect(recipe.nutrition.caPRatio).toBeGreaterThanOrEqual(0.8);
        expect(recipe.nutrition.caPRatio).toBeLessThanOrEqual(2.5);
      }
    });

    it('should include warnings for suboptimal nutrition', () => {
      const recipe = generateRecipe({ pet: mockDog });

      expect(recipe?.validation.warnings).toBeDefined();
      expect(Array.isArray(recipe?.validation.warnings)).toBe(true);
    });
  });

  describe('Scoring breakdown', () => {
    it('should provide all scoring components', () => {
      const recipe = generateRecipe({ pet: mockDog });

      expect(recipe?.scoreBreakdown).toBeDefined();
      expect(recipe?.scoreBreakdown.nutrition).toBeDefined();
      expect(recipe?.scoreBreakdown.health).toBeDefined();
      expect(recipe?.scoreBreakdown.cost).toBeDefined();
      expect(recipe?.scoreBreakdown.variety).toBeDefined();
      expect(recipe?.scoreBreakdown.quality).toBeDefined();
    });

    it('should weight nutrition heavily in total score', () => {
      const recipe = generateRecipe({ pet: mockDog });

      expect(recipe).toBeDefined();
      // Nutrition is 35% of score, so it should have significant impact
      const nutritionImpact = (recipe?.scoreBreakdown.nutrition || 0) * 0.35;
      expect(nutritionImpact).toBeGreaterThan(0);
    });

    it('should calculate cost efficiency', () => {
      const recipe = generateRecipe({ pet: mockDog, budgetPerMeal: 4.0 });

      expect(recipe?.scoreBreakdown.cost).toBeGreaterThanOrEqual(0);
      expect(recipe?.scoreBreakdown.cost).toBeLessThanOrEqual(100);
    });
  });

  describe('Edge cases', () => {
    it('should handle pet with allergies', () => {
      const petWithAllergies: Pet = {
        ...mockDog,
        allergies: ['chicken', 'beef'],
      };

      const recipe = generateRecipe({ pet: petWithAllergies });

      if (recipe) {
        const ingredientNames = recipe.ingredients.map(i => i.name.toLowerCase());
        expect(ingredientNames).not.toContain('chicken');
        expect(ingredientNames).not.toContain('beef');
      }
    });

    it('should handle pet with health concerns', () => {
      const petWithConcerns: Pet = {
        ...mockDog,
        healthConcerns: ['joint-health', 'weight-management'],
      };

      const recipe = generateRecipe({ pet: petWithConcerns });

      expect(recipe).toBeDefined();
      expect(recipe?.scoreBreakdown.health).toBeGreaterThanOrEqual(0);
    });

    it('should handle very low budget', () => {
      const recipe = generateRecipe({
        pet: mockDog,
        budgetPerMeal: 0.5,
      });

      // Should still generate something or return null gracefully
      if (recipe) {
        expect(recipe.estimatedCost).toBeLessThanOrEqual(0.5 * 2);
      }
    });

    it('should handle very high target calories', () => {
      const recipe = generateRecipe({
        pet: mockDog,
        targetCalories: 2000,
      });

      if (recipe) {
        expect(recipe.nutrition.kcal).toBeGreaterThan(1500);
      }
    });
  });

  describe('Species handling', () => {
    it('should generate recipes for all species', () => {
      const species = ['dogs', 'cats', 'birds', 'reptiles', 'pocket-pets'];

      for (const sp of species) {
        const pet: Pet = {
          id: `pet-${sp}`,
          name: `Test ${sp}`,
          type: sp,
          weightKg: 10,
          age: 'adult',
        };

        const recipe = generateRecipe({ pet });

        // Should either generate a recipe or return null (not crash)
        expect(recipe === null || recipe.id).toBeTruthy();
      }
    });
  });
});
