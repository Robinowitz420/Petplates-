// lib/validation/petSchema.ts
// Data validation schemas using Zod

import { z } from 'zod';

const normalizePetType = (value: unknown) => {
  const s = String(value || '').toLowerCase().trim();
  if (!s) return s;
  if (s === 'dog' || s === 'dogs') return 'dogs';
  if (s === 'cat' || s === 'cats') return 'cats';
  if (s === 'bird' || s === 'birds') return 'birds';
  if (s === 'reptile' || s === 'reptiles') return 'reptiles';
  if (
    s === 'pocket-pet' ||
    s === 'pocket pet' ||
    s === 'pocketpets' ||
    s === 'pocket-pets' ||
    s === 'pocket pets'
  ) {
    return 'pocket-pets';
  }
  return s;
};

const normalizeAge = (value: unknown) => {
  const s = String(value || '').toLowerCase().trim();
  if (!s) return 'adult';
  if (s === 'baby' || s === 'kitten' || s === 'puppy') return 'baby';
  if (s === 'young' || s === 'juvenile') return 'young';
  if (s === 'adult') return 'adult';
  if (s === 'senior' || s === 'old') return 'senior';
  return 'adult';
};

const normalizeOptionalString = (value: unknown) => {
  if (value === null || value === undefined) return undefined;
  const s = String(value).trim();
  return s ? s : undefined;
};

const normalizeOptionalStringArray = (value: unknown) => {
  if (value === null || value === undefined) return undefined;
  return Array.isArray(value) ? value.map((x) => String(x)) : undefined;
};

// Pet validation schema
const BasePetSchema = z.object({
  id: z.string().min(1),
  names: z.array(z.string().min(1)).min(1, 'At least one name is required').optional(),
  name: z.string().optional(),
  type: z.preprocess(normalizePetType, z.enum(['dogs', 'cats', 'birds', 'reptiles', 'pocket-pets'])),
  breed: z.preprocess((v) => normalizeOptionalString(v) ?? 'Unknown', z.string().min(1)),
  age: z.preprocess(normalizeAge, z.enum(['baby', 'young', 'adult', 'senior'])),
  weight: z.preprocess(normalizeOptionalString, z.string().optional()),
  weightKg: z.number().positive().optional(),
  healthConcerns: z.preprocess(normalizeOptionalStringArray, z.array(z.string()).optional()),
  dietaryRestrictions: z.preprocess(normalizeOptionalStringArray, z.array(z.string()).optional()),
  allergies: z.preprocess(normalizeOptionalStringArray, z.array(z.string()).optional()),
  dislikes: z.preprocess(normalizeOptionalStringArray, z.array(z.string()).optional()),
  savedRecipes: z.preprocess(normalizeOptionalStringArray, z.array(z.string()).optional()),
  image: z.preprocess(normalizeOptionalString, z.string().optional()),
}).passthrough();

export const PetSchema = BasePetSchema.transform((pet) => {
  const names = Array.isArray((pet as any).names) && (pet as any).names.length > 0
    ? (pet as any).names
    : normalizeOptionalString((pet as any).name)
      ? [String((pet as any).name).trim()]
      : ['Unnamed Pet'];

  return {
    ...pet,
    names,
    name: undefined,
  };
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
  return BasePetSchema.partial().parse(data);
}

