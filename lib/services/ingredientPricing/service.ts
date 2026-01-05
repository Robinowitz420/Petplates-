import type { IngredientPriceSnapshot } from './types';
import { normalizeIngredientKey, normalizeIngredientQuery } from './normalize';
import { mapWithConcurrency } from './concurrency';
import { searchAmazonItems, getItemPriceUsd, hasAmazonPAApiConfig } from './amazonPAClient';
import { candidateFromAmazon, chooseBestCandidate } from './selector';
import { getSnapshotsByIngredientKeys, upsertSnapshot } from './firestore';

async function fetchFreshSnapshotForIngredientKey(ingredientKey: string): Promise<IngredientPriceSnapshot | null> {
  const query = normalizeIngredientQuery(ingredientKey);
  const items = await searchAmazonItems({ keywords: query, searchIndex: 'GroceryAndGourmetFood', itemCount: 10 });
  const candidates = items
    .map((it) =>
      candidateFromAmazon({
        asin: it.asin,
        title: it.title,
        url: it.url,
        priceUsd: getItemPriceUsd(it),
      })
    )
    .filter(Boolean) as any[];

  const best = chooseBestCandidate(candidates, ingredientKey);
  if (!best) return null;

  const snapshot: IngredientPriceSnapshot = {
    ingredientKey,
    query,
    asin: best.asin,
    title: best.title,
    url: best.url,
    priceUsd: best.priceUsd,
    weightGrams: best.weightGrams,
    unitPriceUsdPerGram: best.unitPriceUsdPerGram,
    capturedAt: new Date().toISOString(),
  };

  await upsertSnapshot(snapshot);
  return snapshot;
}

export async function refreshSnapshotsForIngredients(params: {
  ingredientNames: string[];
  maxConcurrency?: number;
}): Promise<Record<string, IngredientPriceSnapshot>> {
  const ingredientKeys = Array.from(new Set(params.ingredientNames.map(normalizeIngredientKey).filter(Boolean)));
  if (ingredientKeys.length === 0) return {};

  const existing = await getSnapshotsByIngredientKeys(ingredientKeys);

  if (!hasAmazonPAApiConfig()) {
    return existing;
  }

  const refreshed = await mapWithConcurrency(
    ingredientKeys,
    Math.max(1, Math.min(params.maxConcurrency ?? 2, 4)),
    async (ingredientKey) => {
      const fresh = await fetchFreshSnapshotForIngredientKey(ingredientKey);
      return fresh || existing[ingredientKey] || null;
    }
  );

  const out: Record<string, IngredientPriceSnapshot> = { ...existing };
  for (const snap of refreshed) {
    if (snap) out[snap.ingredientKey] = snap;
  }

  return out;
}

export async function getOrCreateSnapshotsForIngredients(params: {
  ingredientNames: string[];
  maxConcurrency?: number;
}): Promise<Record<string, IngredientPriceSnapshot>> {
  const ingredientKeys = Array.from(new Set(params.ingredientNames.map(normalizeIngredientKey).filter(Boolean)));
  if (ingredientKeys.length === 0) return {};

  const existing = await getSnapshotsByIngredientKeys(ingredientKeys);

  const missing = ingredientKeys.filter((k) => !existing[k]);
  if (missing.length === 0) return existing;

  if (!hasAmazonPAApiConfig()) {
    return existing;
  }

  const created = await mapWithConcurrency(
    missing,
    Math.max(1, Math.min(params.maxConcurrency ?? 2, 4)),
    async (ingredientKey) => {
      return await fetchFreshSnapshotForIngredientKey(ingredientKey);
    }
  );

  for (const snap of created) {
    if (snap) existing[snap.ingredientKey] = snap;
  }

  return existing;
}
