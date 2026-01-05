// lib/utils/recipeSnapshotStorage.ts

export type RecipeSnapshotIngredient = {
  name: string;
  asinLink?: string;
  amazonLink?: string;
  amazonSearchUrl?: string;
};

export type RecipeSnapshot = {
  id: string;
  name?: string;
  category?: string;
  ingredients: RecipeSnapshotIngredient[];
  updatedAt: number;
};

function getStorageKey(userId: string, petId: string): string {
  return `recipe_snapshots_${userId}_${petId}`;
}

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function toSnapshot(input: any): RecipeSnapshot | null {
  const id = typeof input?.id === 'string' ? input.id : '';
  if (!id) return null;

  const ingredientsRaw = Array.isArray(input?.ingredients) ? input.ingredients : [];
  const ingredients: RecipeSnapshotIngredient[] = ingredientsRaw
    .map((ing: any) => {
      const name = typeof ing?.name === 'string' ? ing.name : '';
      if (!name) return null;
      return {
        name,
        asinLink: typeof ing?.asinLink === 'string' ? ing.asinLink : undefined,
        amazonLink: typeof ing?.amazonLink === 'string' ? ing.amazonLink : undefined,
        amazonSearchUrl: typeof ing?.amazonSearchUrl === 'string' ? ing.amazonSearchUrl : undefined,
      } as RecipeSnapshotIngredient;
    })
    .filter(Boolean) as RecipeSnapshotIngredient[];

  return {
    id,
    name: typeof input?.name === 'string' ? input.name : undefined,
    category: typeof input?.category === 'string' ? input.category : undefined,
    ingredients,
    updatedAt: Date.now(),
  };
}

export function saveRecipeSnapshotForPet(userId: string, petId: string, recipeLike: any): void {
  if (typeof window === 'undefined') return;
  if (!userId || !petId) return;

  const snapshot = toSnapshot(recipeLike);
  if (!snapshot) return;

  const key = getStorageKey(userId, petId);
  const existing = safeParseJson<Record<string, RecipeSnapshot>>(window.localStorage.getItem(key)) || {};

  const next = {
    ...existing,
    [snapshot.id]: snapshot,
  };

  window.localStorage.setItem(key, JSON.stringify(next));
}

export function getRecipeSnapshotForPet(userId: string, petId: string, recipeId: string): RecipeSnapshot | null {
  if (typeof window === 'undefined') return null;
  if (!userId || !petId || !recipeId) return null;

  const key = getStorageKey(userId, petId);
  const existing = safeParseJson<Record<string, RecipeSnapshot>>(window.localStorage.getItem(key)) || {};
  return existing[recipeId] || null;
}

export function removeRecipeSnapshotForPet(userId: string, petId: string, recipeId: string): void {
  if (typeof window === 'undefined') return;
  if (!userId || !petId || !recipeId) return;

  const key = getStorageKey(userId, petId);
  const existing = safeParseJson<Record<string, RecipeSnapshot>>(window.localStorage.getItem(key)) || {};
  if (!existing[recipeId]) return;

  const next = { ...existing };
  delete next[recipeId];
  window.localStorage.setItem(key, JSON.stringify(next));
}
