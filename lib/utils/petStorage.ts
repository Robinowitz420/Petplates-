// lib/utils/petStorage.ts
// Abstracted pet storage layer - Migrated to Firestore
// Note: All operations are now ASYNCHRONOUS

import { Pet } from '@/lib/types'; // Updated import to use shared type

async function fetchJsonOrThrow<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) {
    if (res.status === 401) throw new Error('Please sign in');
    if (text) {
      const trimmed = String(text).trim();
      if (trimmed.startsWith('<!DOCTYPE html') || trimmed.startsWith('<html')) {
        throw new Error(`Server returned an HTML error page (${res.status}). Check your dev server logs.`);
      }
      try {
        const parsed = JSON.parse(text) as any;
        const message =
          (typeof parsed?.message === 'string' && parsed.message) ||
          (typeof parsed?.error === 'string' && parsed.error) ||
          '';
        const error = new Error(message || text);
        // Don't log expected business logic errors to console
        const isBusinessLogicError = text.includes('LIMIT_REACHED') || text.includes('UNAUTHORIZED');
        if (!isBusinessLogicError) {
          console.error('API Error:', error);
        }
        throw error;
      } catch {
        const textStr = String(text || 'Unknown error');
        const error = new Error(textStr);
        // Don't log expected business logic errors to console
        const isBusinessLogicError = textStr.includes('LIMIT_REACHED') || textStr.includes('UNAUTHORIZED');
        if (!isBusinessLogicError) {
          console.error('API Error:', error);
        }
        throw error;
      }
    }
    throw new Error(`Request failed (${res.status})`);
  }
  return text ? (JSON.parse(text) as T) : ({} as T);
}

/**
 * Retrieves all pets for a given user.
 * 
 * @param userId - User identifier
 * @returns Promise<Pet[]>
 */
export async function getPets(userId: string): Promise<Pet[]> {
  if (!userId) return [];

  const res = await fetch('/api/pets', {
    method: 'GET',
    credentials: 'include',
  });

  if (res.status === 401) return [];

  const data = await fetchJsonOrThrow<{ pets?: Pet[] }>(res);
  return Array.isArray(data.pets) ? data.pets : [];
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

  const res = await fetch('/api/pets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ pet }),
  });

  await fetchJsonOrThrow<{ pet?: Pet }>(res);

  if (typeof window !== 'undefined') {
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

  const res = await fetch(`/api/pets/${encodeURIComponent(petId)}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  await fetchJsonOrThrow<{ ok?: boolean }>(res);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('petsUpdated', { detail: { userId, petId } }));
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
