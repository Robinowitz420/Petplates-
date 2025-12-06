// lib/utils/localStorageSafe.ts
// Safe localStorage operations with error handling and transaction support

import { logger } from './logger';

/**
 * Safe localStorage get with error handling
 */
export function safeGetItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    return localStorage.getItem(key);
  } catch (error) {
    logger.error('Failed to read from localStorage', error, { key });
    return null;
  }
}

/**
 * Safe localStorage set with error handling and quota management
 */
export function safeSetItem(key: string, value: string): { success: boolean; error?: string } {
  if (typeof window === 'undefined') {
    return { success: false, error: 'localStorage not available' };
  }
  
  try {
    localStorage.setItem(key, value);
    return { success: true };
  } catch (error: any) {
    // Handle quota exceeded error
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      logger.error('localStorage quota exceeded', error, { key, valueLength: value.length });
      return { success: false, error: 'Storage limit reached. Please clear some data or use a different browser.' };
    }
    
    // Handle other errors
    logger.error('Failed to write to localStorage', error, { key });
    return { success: false, error: 'Failed to save data. Please try again.' };
  }
}

/**
 * Safe JSON parse with error handling
 */
export function safeParseJSON<T>(jsonString: string | null, defaultValue: T): T {
  if (!jsonString) return defaultValue;
  
  try {
    const parsed = JSON.parse(jsonString);
    return parsed as T;
  } catch (error) {
    logger.error('Failed to parse JSON from localStorage', error, { jsonString: jsonString.substring(0, 100) });
    return defaultValue;
  }
}

/**
 * Safe JSON stringify with error handling
 */
export function safeStringifyJSON(data: any): string | null {
  try {
    return JSON.stringify(data);
  } catch (error) {
    logger.error('Failed to stringify JSON', error, { dataType: typeof data });
    return null;
  }
}

/**
 * Transaction-safe localStorage update
 * Reads, modifies, and writes atomically to prevent race conditions
 */
export function safeUpdateItem<T>(
  key: string,
  updateFn: (currentValue: T | null) => T
): { success: boolean; error?: string; data?: T } {
  if (typeof window === 'undefined') {
    return { success: false, error: 'localStorage not available' };
  }
  
  try {
    // Read current value
    const current = safeGetItem(key);
    const currentData = current ? safeParseJSON<T>(current, null as T) : null;
    
    // Update
    const newData = updateFn(currentData);
    
    // Write back
    const jsonString = safeStringifyJSON(newData);
    if (!jsonString) {
      return { success: false, error: 'Failed to serialize data' };
    }
    
    const writeResult = safeSetItem(key, jsonString);
    if (!writeResult.success) {
      return { success: false, error: writeResult.error };
    }
    
    return { success: true, data: newData };
  } catch (error) {
    logger.error('Failed to update localStorage item', error, { key });
    return { success: false, error: 'Failed to update data' };
  }
}

/**
 * Check if localStorage is available and has space
 */
export function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get estimated localStorage usage
 */
export function getLocalStorageUsage(): { used: number; available: boolean } {
  if (typeof window === 'undefined') {
    return { used: 0, available: false };
  }
  
  try {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          total += key.length + value.length;
        }
      }
    }
    return { used: total, available: true };
  } catch {
    return { used: 0, available: false };
  }
}

