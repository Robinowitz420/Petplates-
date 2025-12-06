/**
 * Purchase Tracking System
 * Tracks cumulative ingredient purchases across all pets for village evolution
 * 
 * Combines:
 * - Simple API from guide (loadPurchases, addPurchase, etc.)
 * - Transaction safety from our implementation (prevents race conditions)
 * - Robust error handling and validation
 */

import { safeGetItem, safeSetItem, safeParseJSON, safeStringifyJSON, safeUpdateItem } from './localStorageSafe';
import { logger } from './logger';
import { validateUserId } from './validation';

export interface PurchaseRecord {
  ingredientId: string;
  ingredientName?: string; // Optional for backward compatibility
  purchaseDate: string; // ISO string
  confirmed: boolean;
  amazonOrderId?: string; // For Amazon API integration
}

const PREFIX = 'ingredient_purchases_';

/**
 * Get storage key for user's purchases
 */
export function getStorageKey(userId: string): string {
  return `${PREFIX}${userId}`;
}

// =================================================================
// SIMPLE API (from guide) - Transaction-safe implementation
// =================================================================

/**
 * Load all purchase records for a user
 * Simple API matching guide's interface
 */
export function loadPurchases(userId: string): PurchaseRecord[] {
  const userIdValidation = validateUserId(userId);
  if (!userIdValidation.valid) {
    logger.warn('Invalid userId in loadPurchases', { userId });
    return [];
  }
  
  const key = getStorageKey(userId);
  const raw = safeGetItem(key);
  return safeParseJSON<PurchaseRecord[]>(raw, []);
}

/**
 * Save purchase records for a user
 * Simple API matching guide's interface
 */
export function savePurchases(userId: string, records: PurchaseRecord[]): boolean {
  const userIdValidation = validateUserId(userId);
  if (!userIdValidation.valid) {
    logger.warn('Invalid userId in savePurchases', { userId });
    return false;
  }
  
  const key = getStorageKey(userId);
  const jsonString = safeStringifyJSON(records);
  if (!jsonString) {
    logger.error('Failed to stringify purchase records', undefined, { userId, recordCount: records.length });
    return false;
  }
  
  const result = safeSetItem(key, jsonString);
  if (!result.success) {
    logger.error('Failed to save purchase records', undefined, { userId, error: result.error });
  }
  
  return result.success;
}

/**
 * Add a purchase (transaction-safe)
 * Simple API matching guide's interface
 * @param confirmed - Whether purchase is confirmed (default: false)
 */
export function addPurchase(
  userId: string,
  ingredientId: string,
  confirmed: boolean = false,
  ingredientName?: string
): PurchaseRecord[] {
  const userIdValidation = validateUserId(userId);
  if (!userIdValidation.valid) {
    logger.warn('Invalid userId in addPurchase', { userId });
    return [];
  }
  
  if (!ingredientId) {
    logger.warn('Missing ingredientId in addPurchase', { userId });
    return loadPurchases(userId);
  }
  
  const key = getStorageKey(userId);
  const result = safeUpdateItem<PurchaseRecord[]>(key, (records) => {
    const currentRecords = records || [];
    
    // Add new purchase record
    return [
      ...currentRecords,
      {
        ingredientId,
        ingredientName: ingredientName || ingredientId, // Use ingredientId as fallback
        purchaseDate: new Date().toISOString(),
        confirmed
      }
    ];
  });
  
  if (!result.success) {
    logger.error('Failed to add purchase', undefined, { userId, ingredientId, error: result.error });
    return loadPurchases(userId); // Return current state on failure
  }
  
  return result.data || [];
}

/**
 * Confirm a purchase (mark as confirmed)
 * Simple API matching guide's interface
 * Uses transaction-safe update to prevent race conditions
 */
export function confirmPurchase(userId: string, ingredientId: string): PurchaseRecord[] {
  const userIdValidation = validateUserId(userId);
  if (!userIdValidation.valid) {
    logger.warn('Invalid userId in confirmPurchase', { userId });
    return [];
  }
  
  if (!ingredientId) {
    logger.warn('Missing ingredientId in confirmPurchase', { userId });
    return loadPurchases(userId);
  }
  
  const key = getStorageKey(userId);
  const result = safeUpdateItem<PurchaseRecord[]>(key, (records) => {
    const currentRecords = records || [];
    
    // Find and update existing record
    const idx = currentRecords.findIndex(r => r.ingredientId === ingredientId && !r.confirmed);
    if (idx >= 0) {
      const updated = [...currentRecords];
      updated[idx] = {
        ...updated[idx],
        confirmed: true,
        purchaseDate: new Date().toISOString() // Update timestamp
      };
      return updated;
    }
    
    // If not found, add as confirmed
    return [
      ...currentRecords,
      {
        ingredientId,
        ingredientName: ingredientId,
        purchaseDate: new Date().toISOString(),
        confirmed: true
      }
    ];
  });
  
  if (!result.success) {
    logger.error('Failed to confirm purchase', undefined, { userId, ingredientId, error: result.error });
    return loadPurchases(userId); // Return current state on failure
  }
  
  return result.data || [];
}

/**
 * Get count of confirmed purchases
 * Simple API matching guide's interface
 */
export function getConfirmedCount(userId: string): number {
  const records = loadPurchases(userId);
  return records.filter(r => r.confirmed).length;
}

/**
 * Get total purchased ingredients (alias for getConfirmedCount)
 * Simple API matching guide's interface
 */
export function getTotalPurchasedIngredients(userId: string): number {
  return getConfirmedCount(userId);
}

/**
 * Get village level from purchase count
 * Simple API matching guide's interface
 * Default: +10 per level (0-9 = level 0, 10-19 = level 1, etc.)
 */
export function getVillageLevelFromCount(count: number): number {
  if (count >= 50) return 5;
  return Math.floor(count / 10);
}

// =================================================================
// ENHANCED API (our additions) - More features, same safety
// =================================================================

/**
 * Get all purchase records for a user
 * Enhanced version with validation
 * @deprecated Use loadPurchases() for simpler API
 */
export function getPurchaseRecords(userId: string): PurchaseRecord[] {
  return loadPurchases(userId);
}

/**
 * Add a pending purchase (not yet confirmed)
 * Enhanced version - used when user clicks "Buy" button
 * Uses transaction-safe update to prevent race conditions
 */
export function addPendingPurchase(
  userId: string,
  ingredientId: string,
  ingredientName: string
): { success: boolean; error?: string } {
  const userIdValidation = validateUserId(userId);
  if (!userIdValidation.valid) {
    return { success: false, error: userIdValidation.error };
  }
  
  if (!ingredientId || !ingredientName) {
    return { success: false, error: 'Ingredient ID and name are required' };
  }
  
  const key = getStorageKey(userId);
  const result = safeUpdateItem<PurchaseRecord[]>(key, (records) => {
    const currentRecords = records || [];
    
    // Check if already exists as pending
    const exists = currentRecords.some(
      r => r.ingredientId === ingredientId && !r.confirmed
    );
    
    if (!exists) {
      return [
        ...currentRecords,
        {
          ingredientId,
          ingredientName,
          purchaseDate: new Date().toISOString(),
          confirmed: false
        }
      ];
    }
    
    return currentRecords;
  });
  
  if (!result.success) {
    logger.error('Failed to add pending purchase', undefined, { userId, ingredientId, error: result.error });
  }
  
  return result;
}

/**
 * Confirm a purchase with full details (enhanced version)
 * Enhanced version with ingredientName and amazonOrderId support
 */
export function confirmPurchaseWithDetails(
  userId: string,
  ingredientId: string,
  ingredientName: string,
  amazonOrderId?: string
): { success: boolean; error?: string } {
  const userIdValidation = validateUserId(userId);
  if (!userIdValidation.valid) {
    return { success: false, error: userIdValidation.error };
  }
  
  if (!ingredientId || !ingredientName) {
    return { success: false, error: 'Ingredient ID and name are required' };
  }
  
  const key = getStorageKey(userId);
  const result = safeUpdateItem<PurchaseRecord[]>(key, (records) => {
    const currentRecords = records || [];
    
    // Check if purchase already exists
    const existingIndex = currentRecords.findIndex(
      r => r.ingredientId === ingredientId && !r.confirmed
    );
    
    if (existingIndex >= 0) {
      // Update existing record
      const updated = [...currentRecords];
      updated[existingIndex] = {
        ...updated[existingIndex],
        ingredientName,
        confirmed: true,
        purchaseDate: new Date().toISOString(),
        ...(amazonOrderId && { amazonOrderId })
      };
      return updated;
    } else {
      // Add new purchase record
      return [
        ...currentRecords,
        {
          ingredientId,
          ingredientName,
          purchaseDate: new Date().toISOString(),
          confirmed: true,
          ...(amazonOrderId && { amazonOrderId })
        }
      ];
    }
  });
  
  if (!result.success) {
    logger.error('Failed to confirm purchase with details', undefined, { userId, ingredientId, error: result.error });
  }
  
  return result;
}

/**
 * Get village level based on purchase count
 * Every 10 ingredients = new level
 * @deprecated Use getVillageLevelFromCount() for simpler API
 */
export function getVillageLevel(purchaseCount: number): number {
  return getVillageLevelFromCount(purchaseCount);
}

/**
 * Get progress toward next village level (0-9)
 */
export function getProgressToNextLevel(purchaseCount: number): number {
  return purchaseCount % 10;
}

/**
 * Get purchase statistics for a user
 * Enhanced version with detailed stats
 */
export function getPurchaseStats(userId: string) {
  const records = loadPurchases(userId);
  const confirmed = records.filter(r => r.confirmed);
  const pending = records.filter(r => !r.confirmed);
  const total = confirmed.length;
  const level = getVillageLevelFromCount(total);
  const progress = getProgressToNextLevel(total);
  
  return {
    totalPurchases: total,
    pendingPurchases: pending.length,
    currentLevel: level,
    progressToNextLevel: progress,
    nextLevelThreshold: (level + 1) * 10,
    ingredientsRemaining: (level + 1) * 10 - total
  };
}
