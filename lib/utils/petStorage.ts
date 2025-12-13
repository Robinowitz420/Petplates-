// lib/utils/petStorage.ts
// Abstracted pet storage layer - Migrated to Firestore
// Note: All operations are now ASYNCHRONOUS

import { Pet } from '@/lib/types'; // Updated import to use shared type
import * as firestoreService from '@/lib/services/firestoreService';

/**
 * Retrieves all pets for a given user.
 * 
 * @param userId - User identifier
 * @returns Promise<Pet[]>
 */
export async function getPets(userId: string): Promise<Pet[]> {
  if (!userId) return [];
  
  // TEMPORARY: Skip Firestore entirely if no Firebase config
  const hasFirebase = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!hasFirebase) {
    console.log('Firebase not configured - using localStorage only');
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`pets_${userId}`);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return [];
        }
      }
    }
    return [];
  }
  
  // Try Firestore first
  try {
    const pets = await firestoreService.getPets(userId);
    if (pets.length > 0) return pets;
    
    // Auto-migration: If Firestore is empty but localStorage has data, upload it
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`pets_${userId}`);
      if (stored) {
        try {
          const localPets: Pet[] = JSON.parse(stored);
          if (localPets.length > 0) {
            console.log('Migrating local pets to Firestore...');
            // Upload all local pets
            await Promise.all(localPets.map(p => firestoreService.savePet(userId, p)));
            return localPets;
          }
        } catch (e) {
          console.error('Migration failed:', e);
        }
      }
    }
  } catch (e) {
    console.warn('Firestore getPets failed, falling back to localStorage if available', e);
  }

  // Fallback to localStorage for smooth migration/offline (optional)
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(`pets_${userId}`);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
  }
  return [];
}

/**
 * Saves a pet to storage.
 * 
 * @param userId - User identifier
 * @param pet - Pet object to save
 * @returns Promise<void>
 */
export async function savePet(userId: string, pet: Pet): Promise<void> {
  if (!userId) return;
  
  // TEMPORARY: Skip Firestore entirely if no Firebase config
  const hasFirebase = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!hasFirebase) {
    console.log('Firebase not configured - saving to localStorage only');
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`pets_${userId}`);
      let localPets: Pet[] = [];
      try {
        localPets = stored ? JSON.parse(stored) : [];
      } catch {
        localPets = [];
      }
      // Update or add the pet
      const index = localPets.findIndex(p => p.id === pet.id);
      if (index >= 0) {
        localPets[index] = pet;
      } else {
        localPets.push(pet);
      }
      localStorage.setItem(`pets_${userId}`, JSON.stringify(localPets));
      
      // Dispatch custom event for same-tab updates
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('petsUpdated', { detail: { userId, petId: pet.id } }));
      }
    }
    return;
  }
  
  // Save to Firestore
  await firestoreService.savePet(userId, pet);
  
  // Also sync to localStorage for backup/offline compatibility
  if (typeof window !== 'undefined') {
    const pets = await getPets(userId); // Recalculate or just append?
    // Optimization: Just update local array without refetching if possible, but simplest is to fetch-update-save logic
    // Let's mimic old sync logic for localStorage mirror
    const stored = localStorage.getItem(`pets_${userId}`);
    let localPets: Pet[] = stored ? JSON.parse(stored) : [];
    
    const index = localPets.findIndex(p => p.id === pet.id);
    if (index >= 0) {
      localPets[index] = pet;
    } else {
      localPets.push(pet);
    }
    localStorage.setItem(`pets_${userId}`, JSON.stringify(localPets));
    
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('petsUpdated', { detail: { userId, petId: pet.id } }));
  }
}

/**
 * Deletes a pet from storage.
 * 
 * @param userId - User identifier
 * @param petId - Pet ID to delete
 * @returns Promise<void>
 */
export async function deletePet(userId: string, petId: string): Promise<void> {
  if (!userId) return;
  
  // TEMPORARY: Skip Firestore entirely if no Firebase config
  const hasFirebase = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!hasFirebase) {
    console.log('Firebase not configured - deleting from localStorage only');
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`pets_${userId}`);
      if (stored) {
        try {
          const pets: Pet[] = JSON.parse(stored);
          const filtered = pets.filter(p => p.id !== petId);
          localStorage.setItem(`pets_${userId}`, JSON.stringify(filtered));
        } catch (e) {
          console.error('Error deleting pet from localStorage:', e);
        }
      }
    }
    return;
  }
  
  await firestoreService.deletePet(userId, petId);
  
  // Sync localStorage
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(`pets_${userId}`);
    if (stored) {
      const pets: Pet[] = JSON.parse(stored);
      const filtered = pets.filter(p => p.id !== petId);
      localStorage.setItem(`pets_${userId}`, JSON.stringify(filtered));
    }
  }
}

/**
 * Gets a single pet by ID.
 * 
 * @param userId - User identifier
 * @param petId - Pet ID to retrieve
 * @returns Promise<Pet | null>
 */
export async function getPet(userId: string, petId: string): Promise<Pet | null> {
  const pets = await getPets(userId);
  return pets.find(p => p.id === petId) || null;
}
