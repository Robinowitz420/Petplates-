import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getFirebaseAdminDb } from '@/lib/services/firebaseAdmin';
import { jsonError } from '@/lib/utils/apiResponse';
import { getUserPlanTier } from '@/lib/utils/userPlan';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return jsonError({ code: 'UNAUTHORIZED', message: 'Unauthorized', status: 401 });
    }

    const petId = request.nextUrl.searchParams.get('petId') || '';
    if (!petId) {
      return jsonError({ code: 'INVALID_REQUEST', message: 'petId is required', status: 400 });
    }

    const db = getFirebaseAdminDb();
    const planTier = await getUserPlanTier(db as any, userId);

    // Free plan is limited to 3 generations per pet; Pro is unlimited.
    const limit = planTier === 'free' ? 3 : null;

    let used = 0;
    if (planTier === 'free') {
      try {
        const snap = await db
          .collection('users')
          .doc(userId)
          .collection('findMealsUsage')
          .doc(petId)
          .get();

        const data = snap.exists ? (snap.data() as any) : null;
        used = typeof data?.count === 'number' ? data.count : 0;
      } catch {
        used = 0;
      }
    }

    const remaining = limit === null ? null : Math.max(0, limit - used);

    return NextResponse.json(
      {
        planTier,
        limit,
        used,
        remaining,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('GET /api/find-meals/remaining failed:', err);
    const message = err?.message ? String(err.message) : 'Failed to load remaining Find Meals quota';
    return jsonError({ code: 'INTERNAL_ERROR', message, status: 500 });
  }
}
