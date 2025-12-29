// lib/utils/petStorage.ts
// Abstracted pet storage layer - Migrated to Firestore
// Note: All operations are now ASYNCHRONOUS

import { Pet } from '@/lib/types'; // Updated import to use shared type
import * as firestoreService from '@/lib/services/firestoreService';
import { ensureFirebaseAuth, isFirebaseAvailable } from '@/lib/utils/firebaseConfig';

/**
 * Retrieves all pets for a given user.
 * 
 * @param userId - User identifier
 * @returns Promise<Pet[]>
 */
export async function getPets(userId: string): Promise<Pet[]> {
  if (!userId) return [];

  // Use localStorage only when Firebase is not configured/available.
  if (!isFirebaseAvailable()) {
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
  
  // Firestore is authoritative when configured. Use the authenticated uid.
  const uid = await ensureFirebaseAuth();
  return firestoreService.getPets(uid);
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

  // Use localStorage only when Firebase is not configured/available.
  if (!isFirebaseAvailable()) {
    console.log('Firebase not configured - saving to localStorage only');
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`pets_${userId}`);
      let localPets: Pet[] = [];
      try {
        localPets = stored ? JSON.parse(stored) : [];
      } catch {
        localPets = [];
      }
      const index = localPets.findIndex((p) => p.id === pet.id);
      if (index >= 0) {
        localPets[index] = pet;
      } else {
        localPets.push(pet);
      }
      localStorage.setItem(`pets_${userId}`, JSON.stringify(localPets));
      window.dispatchEvent(new CustomEvent('petsUpdated', { detail: { userId, petId: pet.id } }));
    }
    return;
  }

  const uid = await ensureFirebaseAuth();
  // Firestore is authoritative when configured. If this throws, the UI should surface it.
  await firestoreService.savePet(uid, pet);

  // Optional: mirror to localStorage for same-tab UX (not a fallback source of truth)
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(`pets_${uid}`);
      let localPets: Pet[] = [];
      try {
        localPets = stored ? JSON.parse(stored) : [];
      } catch {
        localPets = [];
      }
      const index = localPets.findIndex((p) => p.id === pet.id);
      if (index >= 0) {
        localPets[index] = pet;
      } else {
        localPets.push(pet);
      }
      localStorage.setItem(`pets_${uid}`, JSON.stringify(localPets));
    } catch {
      // ignore local mirror errors
    }
    window.dispatchEvent(new CustomEvent('petsUpdated', { detail: { userId: uid, petId: pet.id } }));
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

  // Use localStorage only when Firebase is not configured/available.
  if (!isFirebaseAvailable()) {
    console.log('Firebase not configured - deleting from localStorage only');
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`pets_${userId}`);
      if (stored) {
        try {
          const pets: Pet[] = JSON.parse(stored);
          const filtered = pets.filter((p) => p.id !== petId);
          localStorage.setItem(`pets_${userId}`, JSON.stringify(filtered));
          window.dispatchEvent(new CustomEvent('petsUpdated', { detail: { userId, petId } }));
        } catch (e) {
          console.error('Error deleting pet from localStorage:', e);
        }
      }
    }
    return;
  }

  const uid = await ensureFirebaseAuth();
  await firestoreService.deletePet(uid, petId);

  // Optional: mirror delete to localStorage
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(`pets_${uid}`);
      if (stored) {
        const pets: Pet[] = JSON.parse(stored);
        const filtered = pets.filter((p) => p.id !== petId);
        localStorage.setItem(`pets_${uid}`, JSON.stringify(filtered));
      }
    } catch {
      // ignore local mirror errors
    }
    window.dispatchEvent(new CustomEvent('petsUpdated', { detail: { userId: uid, petId } }));
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
