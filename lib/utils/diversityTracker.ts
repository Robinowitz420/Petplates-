import type { Ingredient } from '@/lib/types';

export interface MealHistoryEntry {
  petId: string;
  recipeId: string;
  recipeName: string;
  ingredients: string[];
  fedAt: Date;
}

const HISTORY_KEY = (petId: string) => `mealHistory_${petId}`;

function readHistory(petId: string): MealHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY(petId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MealHistoryEntry[];
    return parsed.map((e) => ({ ...e, fedAt: new Date(e.fedAt) }));
  } catch {
    return [];
  }
}

function writeHistory(petId: string, entries: MealHistoryEntry[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(HISTORY_KEY(petId), JSON.stringify(entries));
}

// Log a meal fed to a pet
export function logMealFed(entry: MealHistoryEntry): void {
  if (typeof window === 'undefined') return;
  const existing = readHistory(entry.petId);
  const withDate = { ...entry, fedAt: new Date(entry.fedAt) };
  existing.unshift(withDate);
  // Cap history to avoid unbounded growth
  writeHistory(entry.petId, existing.slice(0, 200));
}

// Get meal history for a pet, optionally limited by days
export function getMealHistory(petId: string, days?: number): MealHistoryEntry[] {
  const history = readHistory(petId);
  if (!days) return history.sort((a, b) => b.fedAt.getTime() - a.fedAt.getTime());
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return history
    .filter((h) => h.fedAt.getTime() >= cutoff)
    .sort((a, b) => b.fedAt.getTime() - a.fedAt.getTime());
}

// Get unique ingredient names used in the past N days
export function getRecentIngredients(petId: string, days: number = 7): string[] {
  const recent = getMealHistory(petId, days);
  const set = new Set<string>();
  recent.forEach((m) => m.ingredients.forEach((ing) => set.add(ing.toLowerCase().trim())));
  return Array.from(set);
}

// Calculate overlap-based diversity penalty
export function calculateDiversityPenalty(
  recipeIngredients: string[],
  recentIngredients: string[]
): { overlap: number; penalty: number } {
  const normRecent = recentIngredients.map((r) => r.toLowerCase());
  const overlap = recipeIngredients.filter((ing) => normRecent.includes(ing.toLowerCase())).length;
  return { overlap, penalty: overlap * 5 };
}

// Normalize ingredient names from Recipe ingredient objects or strings
export function normalizeIngredientNames(ings: (string | Ingredient)[]): string[] {
  return ings.map((ing) => (typeof ing === 'string' ? ing : ing.name || ing.id)).map((n) => n.toLowerCase().trim());
}