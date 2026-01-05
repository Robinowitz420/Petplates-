import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getFirebaseAdminDb } from '@/lib/services/firebaseAdmin';
import type { NextRequest } from 'next/server';
import { validateCustomMeal } from '@/lib/validation/petSchema';
import { jsonError } from '@/lib/utils/apiResponse';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return jsonError({ code: 'UNAUTHORIZED', message: 'Unauthorized', status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return jsonError({ code: 'INVALID_REQUEST', message: 'Missing custom meal id', status: 400 });
    }

    const adminDb = getFirebaseAdminDb();
    const doc = await adminDb.collection('users').doc(userId).collection('customMeals').doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ customMeal: null }, { status: 404 });
    }

    const data = doc.data();
    const validated = validateCustomMeal({ id: doc.id, ...data }) as any;
    return NextResponse.json({ customMeal: validated }, { status: 200 });
  } catch (err: any) {
    console.error('GET /api/custom-meals/[id] failed:', err);
    const message = err?.message ? String(err.message) : 'Failed to load custom meal';
    const status = message.toLowerCase().includes('invalid') ? 400 : 500;
    const code = status === 400 ? 'INVALID_REQUEST' : 'INTERNAL_ERROR';
    return jsonError({ code, message, status });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const adminDb = getFirebaseAdminDb();
    await adminDb
      .collection('users')
      .doc(userId)
      .collection('customMeals')
      .doc(id)
      .delete();

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error('DELETE /api/custom-meals/[id] failed:', err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'Internal Server Error', message }, { status: 500 });
  }
}
