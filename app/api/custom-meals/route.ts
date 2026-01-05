import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getFirebaseAdminDb } from '@/lib/services/firebaseAdmin';
import type { CustomMeal } from '@/lib/types';
import { validateCustomMeal } from '@/lib/validation/petSchema';
import { jsonError } from '@/lib/utils/apiResponse';
import { getUsageLimitsForPlan } from '@/lib/utils/usageLimits';
import { getUserPlanTier } from '@/lib/utils/userPlan';
import { FieldPath } from 'firebase-admin/firestore';

export const runtime = 'nodejs';

function parseLimit(value: string | null): number {
  const n = value ? Number(value) : NaN;
  if (!Number.isFinite(n) || n <= 0) return 50;
  return Math.min(200, Math.floor(n));
}

function parseCursor(value: string | null): { createdAt: string | null; id: string } | null {
  if (!value) return null;
  const raw = String(value);
  if (!raw.includes('|')) {
    const idOnly = raw.trim();
    return idOnly ? { createdAt: null, id: idOnly } : null;
  }
  const idx = raw.lastIndexOf('|');
  if (idx < 0) return null;
  const createdAt = raw.slice(0, idx);
  const id = raw.slice(idx + 1);
  if (!id) return null;
  return { createdAt: createdAt || null, id };
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminDb = getFirebaseAdminDb();
    const url = new URL(req.url);
    const petIdFilter = url.searchParams.get('petId');
    const limitParam = url.searchParams.get('limit');
    const cursorParam = url.searchParams.get('cursor');
    const cursor = parseCursor(cursorParam);
    const hasPagination = Boolean(limitParam) || Boolean(cursorParam);
    const limit = hasPagination ? parseLimit(limitParam) : 0;

    let query = adminDb
      .collection('users')
      .doc(userId)
      .collection('customMeals') as FirebaseFirestore.Query;

    if (petIdFilter) {
      query = query.where('petId', '==', petIdFilter);
    }

    let snapshot: FirebaseFirestore.QuerySnapshot;
    let nextCursor: string | null = null;

    if (!hasPagination) {
      snapshot = await query.get();
    } else {
      // Prefer stable ordering by createdAt desc, then doc id desc.
      // If Firestore needs an index for this query, fall back to unordered pagination.
      try {
        if (!cursor || cursor.createdAt) {
          query = query.orderBy('createdAt', 'desc').orderBy(FieldPath.documentId(), 'desc');
          if (cursor && cursor.createdAt) {
            query = query.startAfter(cursor.createdAt, cursor.id);
          }
          query = query.limit(limit);
          snapshot = await query.get();
        } else {
          throw new Error('fallback');
        }
      } catch (err) {
        let fallback = adminDb
          .collection('users')
          .doc(userId)
          .collection('customMeals') as FirebaseFirestore.Query;
        if (petIdFilter) {
          fallback = fallback.where('petId', '==', petIdFilter);
        }
        fallback = fallback.orderBy(FieldPath.documentId());
        if (cursor) {
          fallback = fallback.startAfter(cursor.id);
        }
        fallback = fallback.limit(limit);
        snapshot = await fallback.get();
        void err;
      }
    }

    const customMeals: CustomMeal[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      try {
        customMeals.push(validateCustomMeal({ id: doc.id, ...data }) as CustomMeal);
      } catch {
        // skip invalid
      }
    });

    if (hasPagination) {
      const last = snapshot.docs[snapshot.docs.length - 1] || null;
      if (last) {
        const createdAt = String((last.data() as any)?.createdAt || '').trim();
        nextCursor = createdAt ? `${createdAt}|${last.id}` : `${last.id}`;
      }
    }

    return NextResponse.json({ customMeals, nextCursor }, { status: 200 });
  } catch (err) {
    console.error('GET /api/custom-meals failed:', err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'Internal Server Error', message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return jsonError({ code: 'UNAUTHORIZED', message: 'Unauthorized', status: 401 });
    }

    const adminDb = getFirebaseAdminDb();
    const planTier = await getUserPlanTier(adminDb as any, userId);
    const limits = getUsageLimitsForPlan(planTier);
    const body = await req.json().catch(() => null);
    const rawMeal = body?.customMeal ?? body?.meal;
    if (!rawMeal || typeof rawMeal !== 'object') {
      return jsonError({ code: 'INVALID_REQUEST', message: 'Invalid request body', status: 400 });
    }

    const mealId = rawMeal.id || crypto.randomUUID();
    const validatedMeal = validateCustomMeal({ ...rawMeal, id: mealId, userId }) as CustomMeal;

    const mealsCol = adminDb.collection('users').doc(userId).collection('customMeals');
    const mealDoc = mealsCol.doc(mealId);

    await adminDb.runTransaction(async (tx) => {
      const existing = await tx.get(mealDoc);
      const creating = !existing.exists;
      if (creating) {
        const mealsSnap = await tx.get(mealsCol);
        if (mealsSnap.size >= limits.customMeals) {
          const msg =
            planTier === 'pro'
              ? 'You’ve reached the custom meals cap for Pro (fair use).'
              : 'You’ve reached the Free plan custom meals limit. Upgrade to Pro for Unlimited (fair use).';
          const err = new Error(msg) as any;
          err.code = 'LIMIT_REACHED';
          throw err;
        }
      }
      tx.set(mealDoc, JSON.parse(JSON.stringify(validatedMeal)), { merge: true });
    });

    return NextResponse.json({ customMeal: validatedMeal }, { status: 200 });
  } catch (err: any) {
    console.error('POST /api/custom-meals failed:', err);
    if (err?.code === 'LIMIT_REACHED') {
      return jsonError({ code: 'LIMIT_REACHED', message: String(err.message || 'Limit reached'), status: 403 });
    }
    const message = err?.message ? String(err.message) : 'Validation failed';
    const status = message.toLowerCase().includes('invalid') || message.toLowerCase().includes('required') ? 400 : 500;
    const code = status === 400 ? 'INVALID_REQUEST' : 'INTERNAL_ERROR';
    return jsonError({ code, message, status });
  }
}
