import { NextResponse } from 'next/server';
import { getFirebaseAdminDb, getFirebaseAdminAppId } from '@/lib/services/firebaseAdmin';
import { normalizeIngredientKey } from '@/lib/services/ingredientPricing/normalize';
import { refreshSnapshotsForIngredients } from '@/lib/services/ingredientPricing/service';
import { INGREDIENTS } from '@/lib/data/ingredients';

export const runtime = 'nodejs';

type RequestBody = {
  ingredientKeys?: string[];
  ingredients?: string[];
  scope?: 'snapshots' | 'registry';
  maxConcurrency?: number;
};

function isAuthorized(req: Request): boolean {
  const expected = String(process.env.PRICING_ADMIN_TOKEN || '').trim();
  if (!expected) return false;
  const actual = String(req.headers.get('x-admin-token') || '').trim();
  return actual && actual === expected;
}

async function listAllSnapshotKeys(): Promise<string[]> {
  const appId = getFirebaseAdminAppId();
  const db = getFirebaseAdminDb();
  const col = db.collection(`artifacts/${appId}/ingredient_price_snapshots`);
  const snap = await col.get();
  return snap.docs.map((d) => d.id).filter(Boolean);
}

export async function POST(req: Request): Promise<NextResponse> {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: RequestBody | null = null;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    body = null;
  }

  const rawKeys = (body?.ingredientKeys || body?.ingredients || []).map((x) => String(x || '')).filter(Boolean);

  let ingredientKeys: string[] = [];
  if (rawKeys.length > 0) {
    ingredientKeys = rawKeys.map(normalizeIngredientKey).filter(Boolean);
  } else if (body?.scope === 'registry') {
    ingredientKeys = Object.keys(INGREDIENTS).map(normalizeIngredientKey).filter(Boolean);
  } else {
    ingredientKeys = await listAllSnapshotKeys();
  }

  if (ingredientKeys.length === 0) {
    return NextResponse.json({ refreshed: 0, note: 'No ingredient keys provided and no existing snapshots found.' });
  }

  const maxConcurrency = typeof body?.maxConcurrency === 'number' && body.maxConcurrency > 0 ? body.maxConcurrency : 2;

  const before = Date.now();
  const snapshots = await refreshSnapshotsForIngredients({ ingredientNames: ingredientKeys, maxConcurrency });
  const after = Date.now();

  const refreshed = Object.keys(snapshots).length;
  return NextResponse.json({ refreshed, durationMs: after - before });
}
