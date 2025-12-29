// lib/utils/petStorage.ts
// Abstracted pet storage layer - Migrated to Firestore
// Note: All operations are now ASYNCHRONOUS

import { Pet } from '@/lib/types'; // Updated import to use shared type

async function fetchJsonOrThrow<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) {
    if (res.status === 401) throw new Error('Please sign in');
    throw new Error(text || `Request failed (${res.status})`);
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
