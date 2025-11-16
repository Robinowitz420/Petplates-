import { NutritionalRequirement, PetCategory } from '../types';

// Based on AAFCO and WSAVA guidelines
export const nutritionalGuidelines: Record<PetCategory, {
  puppy?: NutritionalRequirement;
  adult: NutritionalRequirement;
  senior?: NutritionalRequirement;
}> = {
  dogs: {
    puppy: {
      protein: { min: 22.5, max: 35, unit: '% dry matter' },
      fat: { min: 8.5, max: 20, unit: '% dry matter' },
      fiber: { min: 2, max: 5, unit: '% dry matter' },
      calcium: { min: 1.0, max: 1.8, unit: '% dry matter' },
      phosphorus: { min: 0.8, max: 1.6, unit: '% dry matter' },
      vitamins: ['A', 'D', 'E', 'B-complex'],
      calories: { min: 95, max: 110, unit: 'kcal per kg body weight' },
    },
    adult: {
      protein: { min: 18, max: 30, unit: '% dry matter' },
      fat: { min: 5.5, max: 15, unit: '% dry matter' },
      fiber: { min: 2, max: 5, unit: '% dry matter' },
      calcium: { min: 0.5, max: 1.2, unit: '% dry matter' },
      phosphorus: { min: 0.4, max: 1.0, unit: '% dry matter' },
      vitamins: ['A', 'D', 'E', 'B-complex'],
      calories: { min: 70, max: 90, unit: 'kcal per kg body weight' },
    },
    senior: {
      protein: { min: 18, max: 25, unit: '% dry matter' },
      fat: { min: 5, max: 12, unit: '% dry matter' },
      fiber: { min: 3, max: 7, unit: '% dry matter' },
      calcium: { min: 0.5, max: 1.0, unit: '% dry matter' },
      phosphorus: { min: 0.4, max: 0.8, unit: '% dry matter' },
      vitamins: ['A', 'D', 'E', 'B-complex', 'Joint support'],
      calories: { min: 60, max: 75, unit: 'kcal per kg body weight' },
    },
  },
  cats: {
    puppy: {
      protein: { min: 30, max: 45, unit: '% dry matter' },
      fat: { min: 9, max: 20, unit: '% dry matter' },
      fiber: { min: 1, max: 4, unit: '% dry matter' },
      calcium: { min: 1.0, max: 1.5, unit: '% dry matter' },
      phosphorus: { min: 0.8, max: 1.2, unit: '% dry matter' },
      vitamins: ['A', 'D', 'E', 'B-complex', 'Taurine'],
      calories: { min: 200, max: 250, unit: 'kcal per kg body weight' },
    },
    adult: {
      protein: { min: 26, max: 40, unit: '% dry matter' },
      fat: { min: 9, max: 18, unit: '% dry matter' },
      fiber: { min: 1, max: 4, unit: '% dry matter' },
      calcium: { min: 0.6, max: 1.2, unit: '% dry matter' },
      phosphorus: { min: 0.5, max: 1.0, unit: '% dry matter' },
      vitamins: ['A', 'D', 'E', 'B-complex', 'Taurine'],
      calories: { min: 60, max: 80, unit: 'kcal per kg body weight' },
    },
    senior: {
      protein: { min: 26, max: 35, unit: '% dry matter' },
      fat: { min: 9, max: 15, unit: '% dry matter' },
      fiber: { min: 2, max: 5, unit: '% dry matter' },
      calcium: { min: 0.6, max: 1.0, unit: '% dry matter' },
      phosphorus: { min: 0.5, max: 0.8, unit: '% dry matter' },
      vitamins: ['A', 'D', 'E', 'B-complex', 'Taurine', 'Joint support'],
      calories: { min: 50, max: 70, unit: 'kcal per kg body weight' },
    },
  },
  birds: {
    adult: {
      protein: { min: 12, max: 18, unit: '% dry matter' },
      fat: { min: 3, max: 8, unit: '% dry matter' },
      fiber: { min: 2, max: 5, unit: '% dry matter' },
      calcium: { min: 0.8, max: 1.5, unit: '% dry matter' },
      phosphorus: { min: 0.5, max: 0.8, unit: '% dry matter' },
      vitamins: ['A', 'D3', 'E', 'B-complex'],
      calories: { min: 15, max: 25, unit: 'kcal per 100g body weight' },
    },
  },
  reptiles: {
    adult: {
      protein: { min: 20, max: 40, unit: '% dry matter' },
      fat: { min: 3, max: 10, unit: '% dry matter' },
      fiber: { min: 5, max: 15, unit: '% dry matter' },
      calcium: { min: 1.0, max: 2.0, unit: '% dry matter' },
      phosphorus: { min: 0.5, max: 1.0, unit: '% dry matter' },
      vitamins: ['A', 'D3', 'E', 'B-complex'],
      calories: { min: 10, max: 20, unit: 'kcal per 100g body weight' },
    },
  },
  'pocket-pets': {
    adult: {
      protein: { min: 14, max: 20, unit: '% dry matter' },
      fat: { min: 4, max: 8, unit: '% dry matter' },
      fiber: { min: 10, max: 20, unit: '% dry matter' },
      calcium: { min: 0.6, max: 1.2, unit: '% dry matter' },
      phosphorus: { min: 0.4, max: 0.8, unit: '% dry matter' },
      vitamins: ['A', 'D', 'E', 'B-complex', 'C'],
      calories: { min: 60, max: 80, unit: 'kcal per kg body weight' },
    },
  },
};
