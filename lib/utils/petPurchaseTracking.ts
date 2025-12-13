// lib/utils/petPurchaseTracking.ts
// Per-pet purchase tracking (separate from global village purchase tracking)

import { safeGetItem, safeSetItem, safeParseJSON, safeUpdateItem } from './localStorageSafe';
import { logger } from './logger';
import { validateUserId } from './validation';

export interface PetPurchaseRecord {
  ingredientId: string;
  ingredientName?: string;
  recipeId?: string; // Optional: which recipe this purchase was for
  purchaseDate: string; // ISO string
  confirmed: boolean;
  amazonOrderId?: string;
}

const PREFIX = 'pet_purchases_';

/**
 * Get storage key for pet purchases
 */
function getStorageKey(userId: string, petId: string): string {
  return `${PREFIX}${userId}_${petId}`;
}

/**
 * Load purchases for a pet
 */
export function getPetPurchases(userId: string, petId: string): PetPurchaseRecord[] {
  if (!userId || !petId) {
    return [];
  }

  const userIdValidation = validateUserId(userId);
  if (!userIdValidation.valid) {
    logger.warn('Invalid userId in getPetPurchases', { userId, petId });
    return [];
  }

  try {
    const key = getStorageKey(userId, petId);
    const stored = safeGetItem(key);
    
    if (!stored) {
      return [];
    }

    const parsed = safeParseJSON<PetPurchaseRecord[]>(stored, []);
    if (Array.isArray(parsed)) {
      return parsed;
    }

    return [];
  } catch (error) {
    logger.error('Failed to load pet purchases', error as Error, { userId, petId });
    return [];
  }
}

/**
 * Get count of confirmed purchases for a pet
 */
export function getPetPurchaseCount(userId: string, petId: string): number {
  const purchases = getPetPurchases(userId, petId);
  return purchases.filter(p => p.confirmed).length;
}

/**
 * Add a purchase record for a pet
 */
export function addPetPurchase(
  userId: string,
  petId: string,
  ingredientId: string,
  ingredientName?: string,
  recipeId?: string,
  amazonOrderId?: string
): PetPurchaseRecord[] {
  if (!userId || !petId || !ingredientId) {
    logger.warn('Missing required parameters in addPetPurchase', { userId, petId, ingredientId });
    return getPetPurchases(userId, petId);
  }

  const userIdValidation = validateUserId(userId);
  if (!userIdValidation.valid) {
    logger.warn('Invalid userId in addPetPurchase', { userId, petId });
    return getPetPurchases(userId, petId);
  }

  const key = getStorageKey(userId, petId);
  const result = safeUpdateItem<PetPurchaseRecord[]>(key, (records) => {
    const currentRecords = records || [];
    
    // Check if purchase already exists (avoid duplicates)
    const exists = currentRecords.some(
      r => r.ingredientId === ingredientId && r.confirmed
    );
    
    if (exists) {
      return currentRecords; // Already exists
    }

    // Add new purchase record
    const newRecord: PetPurchaseRecord = {
      ingredientId,
      ingredientName,
      recipeId,
      purchaseDate: new Date().toISOString(),
      confirmed: false,
      ...(amazonOrderId && { amazonOrderId }),
    };

    return [...currentRecords, newRecord];
  });

  if (!result.success) {
    logger.error('Failed to add pet purchase', undefined, { userId, petId, ingredientId, error: result.error });
    return getPetPurchases(userId, petId);
  }

  return result.data || [];
}

/**
 * Confirm a purchase for a pet
 */
export function confirmPetPurchase(
  userId: string,
  petId: string,
  ingredientId: string,
  ingredientName?: string,
  recipeId?: string,
  amazonOrderId?: string
): { success: boolean; error?: string } {
  if (!userId || !petId || !ingredientId) {
    return { success: false, error: 'Missing required parameters' };
  }

  const userIdValidation = validateUserId(userId);
  if (!userIdValidation.valid) {
    return { success: false, error: userIdValidation.error };
  }

  const key = getStorageKey(userId, petId);
  const result = safeUpdateItem<PetPurchaseRecord[]>(key, (records) => {
    const currentRecords = records || [];
    
    // Find existing unconfirmed record
    const existingIndex = currentRecords.findIndex(
      r => r.ingredientId === ingredientId && !r.confirmed
    );

    if (existingIndex >= 0) {
      // Update existing record
      const updated = [...currentRecords];
      updated[existingIndex] = {
        ...updated[existingIndex],
        ingredientName: ingredientName || updated[existingIndex].ingredientName,
        recipeId: recipeId || updated[existingIndex].recipeId,
        confirmed: true,
        purchaseDate: new Date().toISOString(),
        ...(amazonOrderId && { amazonOrderId }),
      };
      return updated;
    }

    // Add new confirmed record
    return [
      ...currentRecords,
      {
        ingredientId,
        ingredientName,
        recipeId,
        purchaseDate: new Date().toISOString(),
        confirmed: true,
        ...(amazonOrderId && { amazonOrderId }),
      },
    ];
  });

  if (!result.success) {
    logger.error('Failed to confirm pet purchase', undefined, { userId, petId, ingredientId, error: result.error });
    return { success: false, error: result.error };
  }

  return { success: true };
}

