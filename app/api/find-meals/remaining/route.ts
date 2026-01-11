import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { jsonError } from '@/lib/utils/apiResponse';

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

    const planTier = 'free' as const;
    const limit = null;
    const used = null;
    const remaining = null;

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
