import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const adminDb = getAdminDb();
    await adminDb
      .collection('users')
      .doc(userId)
      .collection('customMeals')
      .doc(id)
      .delete();

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error('DELETE /api/custom-meals/[id] failed:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
