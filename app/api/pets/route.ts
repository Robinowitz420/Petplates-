import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { adminDb } from '@/lib/server/firebaseAdmin';
import type { Pet } from '@/lib/types';
import { validatePet } from '@/lib/validation/petSchema';

export const runtime = 'nodejs';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const snapshot = await adminDb
      .collection('users')
      .doc(userId)
      .collection('pets')
      .get();

    const pets: Pet[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      try {
        pets.push(validatePet({ id: doc.id, ...data }) as Pet);
      } catch {
        // skip invalid
      }
    });

    return NextResponse.json({ pets }, { status: 200 });
  } catch (err) {
    console.error('GET /api/pets failed:', err);
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
    const rawPet = body?.pet;
    if (!rawPet || typeof rawPet !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const petId = rawPet.id || crypto.randomUUID();
    const validatedPet = validatePet({ ...rawPet, id: petId }) as Pet;

    await adminDb
      .collection('users')
      .doc(userId)
      .collection('pets')
      .doc(petId)
      .set(JSON.parse(JSON.stringify(validatedPet)), { merge: true });

    return NextResponse.json({ pet: validatedPet }, { status: 200 });
  } catch (err: any) {
    console.error('POST /api/pets failed:', err);
    const message = err?.message ? String(err.message) : 'Validation failed';
    const status = message.toLowerCase().includes('invalid') || message.toLowerCase().includes('required') ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
