import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getFirebaseAdminDb } from '@/lib/services/firebaseAdmin';

export const runtime = 'nodejs';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Missing pet id' }, { status: 400 });
    }

    const adminDb = getFirebaseAdminDb();

    await adminDb
      .collection('users')
      .doc(userId)
      .collection('pets')
      .doc(id)
      .delete();

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error('DELETE /api/pets/[id] failed:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Internal Server Error', message }, { status: 500 });
  }
}
