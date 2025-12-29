import type { Firestore } from 'firebase-admin/firestore';
import { getFirebaseAdminAppId, getFirebaseAdminDb } from '@/lib/services/firebaseAdmin';
import type { IngredientPriceSnapshot } from './types';

function getSnapshotsCollectionPath(): string {
  const appId = getFirebaseAdminAppId();
  return `artifacts/${appId}/ingredient_price_snapshots`;
}

export function getIngredientPriceSnapshotsCollection(db?: Firestore) {
  const database = db || getFirebaseAdminDb();
  return database.collection(getSnapshotsCollectionPath());
}

export async function getSnapshotByIngredientKey(ingredientKey: string): Promise<IngredientPriceSnapshot | null> {
  const col = getIngredientPriceSnapshotsCollection();
  const doc = await col.doc(ingredientKey).get();
  if (!doc.exists) return null;
  return doc.data() as IngredientPriceSnapshot;
}

export async function getSnapshotsByIngredientKeys(ingredientKeys: string[]): Promise<Record<string, IngredientPriceSnapshot>> {
  const col = getIngredientPriceSnapshotsCollection();
  const chunks: string[][] = [];
  for (let i = 0; i < ingredientKeys.length; i += 10) {
    chunks.push(ingredientKeys.slice(i, i + 10));
  }

  const out: Record<string, IngredientPriceSnapshot> = {};
  for (const chunk of chunks) {
    const refs = chunk.map((k) => col.doc(k));
    const docs = await (col.firestore as any).getAll(...refs);
    for (const doc of docs) {
      if (doc.exists) out[doc.id] = doc.data() as IngredientPriceSnapshot;
    }
  }

  return out;
}

export async function upsertSnapshot(snapshot: IngredientPriceSnapshot): Promise<void> {
  const col = getIngredientPriceSnapshotsCollection();
  await col.doc(snapshot.ingredientKey).set(snapshot, { merge: true });
}
