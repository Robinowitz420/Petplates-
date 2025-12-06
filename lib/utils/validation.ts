// lib/utils/validation.ts
// Input validation and sanitization utilities with Zod schemas

import { z } from 'zod';
import type { Pet } from '../utils/petUtils';
import type { Recipe, Ingredient, PetNutritionProfile, CustomMeal } from '../types';
import type { PurchaseRecord } from './purchaseTracking';

/**
 * Sanitizes user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
    .slice(0, 500); // Limit length
}

/**
 * Validates pet name
 */
export function validatePetName(name: string): { valid: boolean; error?: string } {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Pet name is required' };
  }
  
  const trimmed = name.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'Pet name cannot be empty' };
  }
  
  if (trimmed.length > 50) {
    return { valid: false, error: 'Pet name must be 50 characters or less' };
  }
  
  // Check for potentially dangerous characters
  if (/[<>]/.test(trimmed)) {
    return { valid: false, error: 'Pet name contains invalid characters' };
  }
  
  return { valid: true };
}

/**
 * Validates pet weight
 */
export function validatePetWeight(weight: string): { valid: boolean; error?: string; value?: number } {
  if (!weight || typeof weight !== 'string') {
    return { valid: false, error: 'Weight is required' };
  }
  
  const trimmed = weight.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'Weight cannot be empty' };
  }
  
  // Extract number from string (handles "10 lbs", "10kg", etc.)
  const match = trimmed.match(/(\d+\.?\d*)/);
  if (!match) {
    return { valid: false, error: 'Weight must be a number' };
  }
  
  const numValue = parseFloat(match[1]);
  
  if (isNaN(numValue) || numValue <= 0) {
    return { valid: false, error: 'Weight must be a positive number' };
  }
  
  if (numValue > 1000) {
    return { valid: false, error: 'Weight seems too high. Please check your input.' };
  }
  
  return { valid: true, value: numValue };
}

/**
 * Validates recipe ID format
 */
export function validateRecipeId(recipeId: string): { valid: boolean; error?: string } {
  if (!recipeId || typeof recipeId !== 'string') {
    return { valid: false, error: 'Recipe ID is required' };
  }
  
  // Recipe IDs should match pattern like "dog-01", "cat-11", etc.
  if (!/^[a-z]+-\d+$/.test(recipeId)) {
    return { valid: false, error: 'Invalid recipe ID format' };
  }
  
  return { valid: true };
}

/**
 * Validates user rating (1-5)
 */
export function validateRating(rating: number | string): { valid: boolean; error?: string; value?: number } {
  const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;
  
  if (isNaN(numRating)) {
    return { valid: false, error: 'Rating must be a number' };
  }
  
  if (numRating < 1 || numRating > 5) {
    return { valid: false, error: 'Rating must be between 1 and 5' };
  }
  
  return { valid: true, value: Math.round(numRating) };
}

/**
 * Validates userId
 */
export function validateUserId(userId: string | null | undefined): { valid: boolean; error?: string } {
  if (!userId || typeof userId !== 'string') {
    return { valid: false, error: 'User ID is required' };
  }
  
  if (userId.trim().length === 0) {
    return { valid: false, error: 'User ID cannot be empty' };
  }
  
  return { valid: true };
}

/**
 * Validates array of strings (for health concerns, allergies, etc.)
 */
export function validateStringArray(arr: any, maxLength: number = 20): { valid: boolean; error?: string; value?: string[] } {
  if (!Array.isArray(arr)) {
    return { valid: false, error: 'Must be an array' };
  }
  
  if (arr.length > maxLength) {
    return { valid: false, error: `Maximum ${maxLength} items allowed` };
  }
  
  const validItems = arr
    .filter((item): item is string => typeof item === 'string')
    .map(item => sanitizeInput(item))
    .filter(item => item.length > 0);
  
  return { valid: true, value: validItems };
}

// =================================================================
// ZOD SCHEMAS
// =================================================================

/**
 * Zod schema for Pet validation
 */
export const PetSchema = z.object({
  id: z.string().min(1, 'Pet ID is required'),
  names: z.array(z.string().min(1).max(50)).min(1, 'At least one name is required'),
  type: z.enum(['dogs', 'cats', 'birds', 'reptiles', 'pocket-pets'], {
    errorMap: () => ({ message: 'Invalid pet type' })
  }),
  breed: z.string().min(1, 'Breed is required').max(100),
  weight: z.string().min(1, 'Weight is required').refine(
    (val) => {
      const match = val.trim().match(/(\d+\.?\d*)/);
      if (!match) return false;
      const num = parseFloat(match[1]);
      return !isNaN(num) && num > 0 && num <= 1000;
    },
    { message: 'Weight must be a positive number between 0 and 1000' }
  ),
  age: z.string().min(1, 'Age is required'),
  healthConcerns: z.array(z.string()).max(20, 'Maximum 20 health concerns allowed').default([]),
  mealPlan: z.array(z.string()).default([]),
  savedRecipes: z.array(z.string()).default([]),
  dislikes: z.array(z.string()).max(20).optional(),
  image: z.string().url().optional().or(z.literal('')),
}).refine(
  (data) => {
    // Sanitize names
    return data.names.every(name => !/[<>]/.test(name));
  },
  { message: 'Pet names contain invalid characters', path: ['names'] }
);

/**
 * Zod schema for Ingredient validation
 */
export const IngredientSchema = z.object({
  id: z.string().min(1, 'Ingredient ID is required'),
  name: z.string().min(1, 'Ingredient name is required').max(200),
  amount: z.string().min(1, 'Amount is required').max(100),
  asinLink: z.string().url().optional(),
  productName: z.string().max(200).optional(),
  vetNote: z.string().max(500).optional(),
  isVetted: z.boolean().optional(),
  isGeneric: z.boolean().optional(),
  asin: z.string().regex(/^[A-Z0-9]{10}$/, 'Invalid ASIN format').optional(),
});

/**
 * Zod schema for Recipe validation
 */
export const RecipeSchema = z.object({
  id: z.string().regex(/^[a-z]+-\d+$/, 'Invalid recipe ID format'),
  name: z.string().min(1, 'Recipe name is required').max(200),
  shortName: z.string().max(100).optional(),
  celebrityName: z.string().max(100).optional(),
  celebrityQuote: z.string().max(500).optional(),
  category: z.string().min(1),
  breed: z.union([z.string(), z.array(z.string()), z.null()]).optional(),
  ageGroup: z.array(z.string()).min(1, 'At least one age group is required'),
  healthConcerns: z.array(z.string()).default([]),
  notSuitableFor: z.array(z.string()).optional(),
  description: z.string().max(2000).optional(),
  tags: z.array(z.string()).optional(),
  imageUrl: z.string().url().optional(),
  prepTime: z.string().optional(),
  cookTime: z.string().optional(),
  servings: z.number().int().positive().optional(),
  ingredients: z.array(IngredientSchema).min(1, 'At least one ingredient is required'),
  instructions: z.array(z.string()).min(1, 'At least one instruction is required'),
  supplements: z.array(IngredientSchema).optional(),
  nutritionalInfo: z.object({
    protein: z.object({ min: z.number(), max: z.number(), unit: z.string() }).optional(),
    fat: z.object({ min: z.number(), max: z.number(), unit: z.string() }).optional(),
    fiber: z.object({ min: z.number(), max: z.number(), unit: z.string() }).optional(),
    calories: z.object({ min: z.number(), max: z.number(), unit: z.string() }).optional(),
    phosphorus: z.object({ min: z.number(), max: z.number(), unit: z.string() }).optional(),
    calcium: z.object({ min: z.number(), max: z.number(), unit: z.string() }).optional(),
  }).optional(),
  nutritionInfo: z.object({
    protein: z.string().optional(),
    fat: z.string().optional(),
    fiber: z.string().optional(),
    calories: z.string().optional(),
    calcium: z.string().optional(),
  }).optional(),
  rating: z.number().min(1).max(5).optional(),
  reviews: z.number().int().nonnegative().optional(),
});

/**
 * Zod schema for PurchaseRecord validation
 */
export const PurchaseRecordSchema = z.object({
  ingredientId: z.string().min(1, 'Ingredient ID is required'),
  ingredientName: z.string().max(200).optional(),
  purchaseDate: z.string().datetime({ message: 'Invalid ISO date format' }),
  confirmed: z.boolean(),
  amazonOrderId: z.string().max(100).optional(),
});

/**
 * Zod schema for PetNutritionProfile validation
 */
export const PetNutritionProfileSchema = z.object({
  species: z.string().min(1, 'Species is required'),
  ageGroup: z.string().min(1, 'Age group is required'),
  weightKg: z.number().positive('Weight must be positive').max(1000, 'Weight seems too high'),
  breed: z.string().nullable().optional(),
  healthConcerns: z.array(z.string()).max(20).optional(),
  allergies: z.array(z.string()).max(20).optional(),
  caloriesPerKgOverride: z.number().positive().optional(),
  petName: z.string().max(50).optional(),
});

/**
 * Zod schema for CustomMeal validation
 */
export const CustomMealSchema = z.object({
  id: z.string().min(1, 'Meal ID is required'),
  petId: z.string().min(1, 'Pet ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  name: z.string().min(1, 'Meal name is required').max(200),
  createdAt: z.string().datetime({ message: 'Invalid ISO date format' }),
  updatedAt: z.string().datetime({ message: 'Invalid ISO date format' }),
  ingredients: z.array(z.object({
    key: z.string().min(1),
    grams: z.number().positive('Grams must be positive'),
  })).min(1, 'At least one ingredient is required'),
  analysis: z.object({
    score: z.number().min(0).max(100),
    nutrients: z.record(z.string(), z.number()),
    totalRecipeGrams: z.number().positive(),
    recommendedServingGrams: z.number().positive(),
    breakdown: z.object({
      nutrientCoverageScore: z.number(),
      toxicityPenalty: z.number(),
      balanceVarietyScore: z.number(),
    }),
    toxicityWarnings: z.array(z.object({
      message: z.string(),
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      ingredientKey: z.string().optional(),
      ingredientName: z.string().optional(),
    })),
    allergyWarnings: z.array(z.object({
      message: z.string(),
      severity: z.enum(['low', 'medium', 'high', 'critical']),
    })),
    nutrientWarnings: z.array(z.object({
      message: z.string(),
      severity: z.enum(['low', 'medium', 'high', 'critical']),
    })),
    suggestions: z.array(z.object({
      message: z.string(),
      action: z.string().optional(),
      confidence: z.enum(['low', 'medium', 'high']).optional(),
    })),
  }),
});

// =================================================================
// VALIDATION FUNCTIONS USING ZOD
// =================================================================

/**
 * Validate a Pet object using Zod schema
 */
export function validatePetWithZod(pet: unknown): { valid: boolean; error?: string; data?: Pet } {
  try {
    const validated = PetSchema.parse(pet);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return { 
        valid: false, 
        error: `${firstError.path.join('.')}: ${firstError.message}` 
      };
    }
    return { valid: false, error: 'Validation failed' };
  }
}

/**
 * Validate a Recipe object using Zod schema
 */
export function validateRecipeWithZod(recipe: unknown): { valid: boolean; error?: string; data?: Recipe } {
  try {
    const validated = RecipeSchema.parse(recipe);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return { 
        valid: false, 
        error: `${firstError.path.join('.')}: ${firstError.message}` 
      };
    }
    return { valid: false, error: 'Validation failed' };
  }
}

/**
 * Validate an Ingredient object using Zod schema
 */
export function validateIngredientWithZod(ingredient: unknown): { valid: boolean; error?: string; data?: Ingredient } {
  try {
    const validated = IngredientSchema.parse(ingredient);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return { 
        valid: false, 
        error: `${firstError.path.join('.')}: ${firstError.message}` 
      };
    }
    return { valid: false, error: 'Validation failed' };
  }
}

/**
 * Validate a PurchaseRecord object using Zod schema
 */
export function validatePurchaseRecordWithZod(record: unknown): { valid: boolean; error?: string; data?: PurchaseRecord } {
  try {
    const validated = PurchaseRecordSchema.parse(record);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return { 
        valid: false, 
        error: `${firstError.path.join('.')}: ${firstError.message}` 
      };
    }
    return { valid: false, error: 'Validation failed' };
  }
}

/**
 * Validate a PetNutritionProfile object using Zod schema
 */
export function validatePetNutritionProfileWithZod(profile: unknown): { valid: boolean; error?: string; data?: PetNutritionProfile } {
  try {
    const validated = PetNutritionProfileSchema.parse(profile);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return { 
        valid: false, 
        error: `${firstError.path.join('.')}: ${firstError.message}` 
      };
    }
    return { valid: false, error: 'Validation failed' };
  }
}

/**
 * Validate a CustomMeal object using Zod schema
 */
export function validateCustomMealWithZod(meal: unknown): { valid: boolean; error?: string; data?: CustomMeal } {
  try {
    const validated = CustomMealSchema.parse(meal);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return { 
        valid: false, 
        error: `${firstError.path.join('.')}: ${firstError.message}` 
      };
    }
    return { valid: false, error: 'Validation failed' };
  }
}

/**
 * Safe parse with detailed error information
 */
export function safeParseWithZod<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: z.ZodError['errors'];
} {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error.errors };
}
