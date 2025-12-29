import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { adminDb } from '@/lib/server/firebaseAdmin';
import type { CustomMeal } from '@/lib/types';
import { validateCustomMeal } from '@/lib/validation/petSchema';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const petIdFilter = url.searchParams.get('petId');

    let query = adminDb
      .collection('users')
      .doc(userId)
      .collection('customMeals') as FirebaseFirestore.Query;

    if (petIdFilter) {
      query = query.where('petId', '==', petIdFilter);
    }

    const snapshot = await query.get();

    const customMeals: CustomMeal[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      try {
        customMeals.push(validateCustomMeal({ id: doc.id, ...data }) as CustomMeal);
      } catch {
        // skip invalid
      }
    });

    return NextResponse.json({ customMeals }, { status: 200 });
  } catch (err) {
    console.error('GET /api/custom-meals failed:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => null);
    const rawMeal = body?.customMeal ?? body?.meal;
    if (!rawMeal || typeof rawMeal !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const mealId = rawMeal.id || crypto.randomUUID();
    const validatedMeal = validateCustomMeal({ ...rawMeal, id: mealId, userId }) as CustomMeal;

    await adminDb
      .collection('users')
      .doc(userId)
      .collection('customMeals')
      .doc(mealId)
      .set(JSON.parse(JSON.stringify(validatedMeal)), { merge: true });

    return NextResponse.json({ customMeal: validatedMeal }, { status: 200 });
  } catch (err: any) {
    console.error('POST /api/custom-meals failed:', err);
    const message = err?.message ? String(err.message) : 'Validation failed';
    const status = message.toLowerCase().includes('invalid') || message.toLowerCase().includes('required') ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
