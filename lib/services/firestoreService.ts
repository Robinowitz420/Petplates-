import { Pet, CustomMeal } from '@/lib/types';
import { ValidationError } from '@/lib/utils/errorHandler';

async function fetchJsonOrThrow<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) {
    if (res.status === 401) throw new Error('Please sign in');
    throw new Error(text || `Request failed (${res.status})`);
  }
  return text ? (JSON.parse(text) as T) : ({} as T);
}

// --- Pet Operations ---

export async function getPets(userId: string): Promise<Pet[]> {
  if (!userId) {
    throw new ValidationError('User ID is required');
  }

  const res = await fetch('/api/pets', {
    method: 'GET',
    credentials: 'include',
  });

  const data = await fetchJsonOrThrow<{ pets?: Pet[] }>(res);
  return Array.isArray(data.pets) ? data.pets : [];
}

export async function savePet(userId: string, pet: Pet): Promise<void> {
  if (!userId) {
    throw new ValidationError('User ID is required');
  }

  const res = await fetch('/api/pets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ pet }),
  });

  await fetchJsonOrThrow<{ pet?: Pet }>(res);
}

export async function deletePet(userId: string, petId: string): Promise<void> {
  if (!userId) {
    throw new ValidationError('User ID is required');
  }

  const res = await fetch(`/api/pets/${encodeURIComponent(petId)}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  await fetchJsonOrThrow<{ ok?: boolean }>(res);
}

// --- Custom Meal Operations ---

export async function getCustomMeals(userId: string, petId: string): Promise<CustomMeal[]> {
  if (!userId || !petId) {
    throw new ValidationError('User ID and Pet ID are required');
  }

  const res = await fetch(`/api/custom-meals?petId=${encodeURIComponent(petId)}`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await fetchJsonOrThrow<{ customMeals?: CustomMeal[] }>(res);
  return Array.isArray(data.customMeals) ? data.customMeals : [];
}

export async function saveCustomMeal(userId: string, meal: CustomMeal): Promise<void> {
  if (!userId) {
    throw new ValidationError('User ID is required');
  }

  const res = await fetch('/api/custom-meals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ customMeal: meal }),
  });

  await fetchJsonOrThrow<{ customMeal?: CustomMeal }>(res);
}

export async function deleteCustomMeal(userId: string, mealId: string): Promise<void> {
  if (!userId) {
    throw new ValidationError('User ID is required');
  }

  const res = await fetch(`/api/custom-meals/${encodeURIComponent(mealId)}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  await fetchJsonOrThrow<{ ok?: boolean }>(res);
}
