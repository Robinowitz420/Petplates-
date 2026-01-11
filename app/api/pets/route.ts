import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getFirebaseAdminDb } from '@/lib/services/firebaseAdmin';
import type { Pet } from '@/lib/types';
import { validatePet } from '@/lib/validation/petSchema';
import { jsonError } from '@/lib/utils/apiResponse';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminDb = getFirebaseAdminDb();
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

    const body = await req.json().catch(() => null);
    const rawPet = body?.pet;
    if (!rawPet || typeof rawPet !== 'object') {
      return jsonError({ code: 'INVALID_REQUEST', message: 'Invalid request body', status: 400 });
    }

    const petId = rawPet.id || crypto.randomUUID();
    const validatedPet = validatePet({ ...rawPet, id: petId }) as Pet;

    const normalizeIds = (value: unknown): string[] => {
      const arr = Array.isArray(value) ? value : [];
      const out: string[] = [];
      const seen = new Set<string>();
      for (const v of arr) {
        const s = String(v || '').trim();
        if (!s) continue;
        if (seen.has(s)) continue;
        seen.add(s);
        out.push(s);
      }
      return out;
    };

    const savedRecipesNormalized = normalizeIds((validatedPet as any).savedRecipes);
    const savedSet = new Set(savedRecipesNormalized);
    const mealPlanNormalized = normalizeIds((validatedPet as any).mealPlan).filter((id) => savedSet.has(id));

    (validatedPet as any).savedRecipes = savedRecipesNormalized;
    (validatedPet as any).mealPlan = mealPlanNormalized;

    const petsCol = adminDb.collection('users').doc(userId).collection('pets');
    const petDoc = petsCol.doc(petId);

    await adminDb.runTransaction(async (tx) => {
      const existingPet = await tx.get(petDoc);
      const creating = !existingPet.exists;

      const previousSavedThisPet = existingPet.exists
        ? normalizeIds((existingPet.data() as any)?.savedRecipes)
        : [];

      const nextSavedThisPet = normalizeIds((validatedPet as any).savedRecipes);
      void creating;
      void previousSavedThisPet;
      void nextSavedThisPet;

      tx.set(petDoc, JSON.parse(JSON.stringify(validatedPet)), { merge: true });
    });

    return NextResponse.json({ pet: validatedPet }, { status: 200 });
  } catch (err: any) {
    console.error('POST /api/pets failed:', err);
    if (err?.code === 'LIMIT_REACHED') {
      return jsonError({ code: 'LIMIT_REACHED', message: String(err.message || 'Limit reached'), status: 403 });
    }
    const message = err?.message ? String(err.message) : 'Validation failed';
    const status = message.toLowerCase().includes('invalid') || message.toLowerCase().includes('required') ? 400 : 500;
    const code = status === 400 ? 'INVALID_REQUEST' : 'INTERNAL_ERROR';
    return jsonError({ code, message, status });
  }
}
