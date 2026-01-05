import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getFirebaseAdminDb } from '@/lib/services/firebaseAdmin';
import { jsonError } from '@/lib/utils/apiResponse';
import { getUserPlanTier } from '@/lib/utils/userPlan';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return jsonError({ code: 'UNAUTHORIZED', message: 'Unauthorized', status: 401 });
    }

    const db = getFirebaseAdminDb();
    const planTier = await getUserPlanTier(db as any, userId);

    return NextResponse.json({ planTier }, { status: 200 });
  } catch (err: any) {
    console.error('GET /api/plan failed:', err);
    const message = err?.message ? String(err.message) : 'Failed to load plan';
    return jsonError({ code: 'INTERNAL_ERROR', message, status: 500 });
  }
}
