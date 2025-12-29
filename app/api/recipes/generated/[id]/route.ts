import { NextResponse } from 'next/server';
import { getFirebaseAdminDb, getGeneratedRecipesCollectionPath } from '@/lib/services/firebaseAdmin';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const recipeId = String(id || '').trim();

    if (!recipeId) {
      return NextResponse.json({ error: 'Missing recipe id' }, { status: 400 });
    }

    const db = getFirebaseAdminDb();
    const docRef = db.collection(getGeneratedRecipesCollectionPath()).doc(recipeId);
    const snap = await docRef.get();

    if (!snap.exists) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    const data = snap.data() as any;
    const recipe = data?.recipe ?? null;

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    const createdAt = data?.createdAt?.toMillis ? data.createdAt.toMillis() : data?.createdAt ?? null;
    const userId = data?.userId ?? null;

    return NextResponse.json({ recipeId: snap.id, recipe, createdAt, userId });
  } catch (error) {
    console.error('Failed to fetch generated recipe:', error);
    return NextResponse.json(
      { error: 'Failed to fetch generated recipe' },
      { status: 500 }
    );
  }
}
