// lib/validation/petSchema.ts
// Data validation schemas using Zod

import { z } from 'zod';

// Pet validation schema
export const PetSchema = z.object({
  id: z.string().min(1),
  names: z.array(z.string().min(1)).min(1, 'At least one name is required'),
  type: z.enum(['dogs', 'cats', 'birds', 'reptiles', 'pocket-pets']),
  breed: z.string().min(1, 'Breed is required'),
  age: z.enum(['baby', 'young', 'adult', 'senior']),
  weight: z.string().optional(),
  weightKg: z.number().positive().optional(),
  healthConcerns: z.array(z.string()).optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  dislikes: z.array(z.string()).optional(),
  savedRecipes: z.array(z.string()).optional(),
  image: z.string().optional(),
});

// Custom meal validation schema
export const CustomMealSchema = z.object({
  id: z.string().min(1),
  petId: z.string().min(1),
  userId: z.string().min(1),
  name: z.string().min(1, 'Meal name is required').max(100),
  createdAt: z.string(),
  updatedAt: z.string(),
  ingredients: z.array(z.object({
    key: z.string().min(1),
    grams: z.number().positive('Grams must be positive'),
  })).min(1, 'At least one ingredient is required'),
  analysis: z.object({
    score: z.number().min(0).max(100),
    nutrients: z.record(z.number()),
    totalRecipeGrams: z.number().positive(),
    recommendedServingGrams: z.number().positive(),
    breakdown: z.object({
      nutrientCoverageScore: z.number(),
      toxicityPenalty: z.number(),
      balanceVarietyScore: z.number(),
    }),
    toxicityWarnings: z.array(z.any()),
    allergyWarnings: z.array(z.any()),
    nutrientWarnings: z.array(z.any()),
    suggestions: z.array(z.any()),
  }),
});

// Validation helpers
export function validatePet(data: unknown) {
  return PetSchema.parse(data);
}

export function validateCustomMeal(data: unknown) {
  return CustomMealSchema.parse(data);
}

export function validatePetPartial(data: unknown) {
  return PetSchema.partial().parse(data);
}

