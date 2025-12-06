// lib/utils/petStorage.ts
// Abstracted pet storage layer for easy migration to Firebase/Supabase

import type { Pet } from './petUtils';

/**
 * Data contract for pet storage operations.
 * Currently uses localStorage, but can be swapped to Firebase/Supabase without changing callers.
 */

/**
 * Retrieves all pets for a given user.
 * 
 * @param userId - User identifier (Clerk user ID or localStorage key)
 * @returns Array of Pet objects, or empty array if none found
 * 
 * @contract
 * - Input: userId (string)
 * - Output: Pet[] (always returns array, never null/undefined)
 * - Side effects: Reads from localStorage (will be Firebase in future)
 * - Migration: Change implementation only, signature stays same
 */
export function getPets(userId: string): Pet[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(`pets_${userId}`);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

/**
 * Saves a pet to storage.
 * 
 * @param userId - User identifier
 * @param pet - Pet object to save
 * @returns void
 * 
 * @contract
 * - Input: userId (string), pet (Pet)
 * - Output: void
 * - Side effects: Writes to localStorage (will be Firebase in future)
 * - Migration: Change implementation only, signature stays same
 */
export function savePet(userId: string, pet: Pet): void {
  if (typeof window === 'undefined') return;
  
  const pets = getPets(userId);
  const existingIndex = pets.findIndex(p => p.id === pet.id);
  
  if (existingIndex >= 0) {
    pets[existingIndex] = pet;
  } else {
    pets.push(pet);
  }
  
  localStorage.setItem(`pets_${userId}`, JSON.stringify(pets));
}

/**
 * Deletes a pet from storage.
 * 
 * @param userId - User identifier
 * @param petId - Pet ID to delete
 * @returns void
 * 
 * @contract
 * - Input: userId (string), petId (string)
 * - Output: void
 * - Side effects: Writes to localStorage (will be Firebase in future)
 * - Migration: Change implementation only, signature stays same
 */
export function deletePet(userId: string, petId: string): void {
  if (typeof window === 'undefined') return;
  
  const pets = getPets(userId);
  const filtered = pets.filter(p => p.id !== petId);
  localStorage.setItem(`pets_${userId}`, JSON.stringify(filtered));
}

/**
 * Gets a single pet by ID.
 * 
 * @param userId - User identifier
 * @param petId - Pet ID to retrieve
 * @returns Pet object or null if not found
 * 
 * @contract
 * - Input: userId (string), petId (string)
 * - Output: Pet | null
 * - Side effects: Reads from localStorage (will be Firebase in future)
 * - Migration: Change implementation only, signature stays same
 */
export function getPet(userId: string, petId: string): Pet | null {
  const pets = getPets(userId);
  return pets.find(p => p.id === petId) || null;
}

