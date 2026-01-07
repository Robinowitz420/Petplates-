import type { Firestore } from 'firebase-admin/firestore';

export async function enforceFindMealsPerPet(
  db: Firestore,
  userId: string,
  petId: string,
  freePlanLimit: number
): Promise<
  | { ok: true; used: number; limit: number }
  | { ok: false; code: 'LIMIT_REACHED'; status: number; message: string; used: number; limit: number }
> {
  if (!userId || !petId) {
    return { ok: true, used: 0, limit: freePlanLimit };
  }

  const docRef = db
    .collection('users')
    .doc(userId)
    .collection('findMealsUsage')
    .doc(petId);

  try {
    const result = await db.runTransaction(async (tx) => {
      const snap = await tx.get(docRef);
      const data = snap.exists ? (snap.data() as any) : {};
      const current = typeof data.count === 'number' ? data.count : 0;
      const next = current + 1;
      if (next > freePlanLimit) {
        return { allowed: false as const, current };
      }
      tx.set(docRef, { count: next, updatedAt: Date.now() }, { merge: true });
      return { allowed: true as const, current: next };
    });

    if (!result.allowed) {
      return {
        ok: false,
        code: 'LIMIT_REACHED',
        status: 403,
        message: `Free plan limit reached: Only ${freePlanLimit} Find Meals generations per pet.`,
        used: result.current,
        limit: freePlanLimit,
      };
    }

    return { ok: true, used: result.current, limit: freePlanLimit };
  } catch {
    // fail-open
    return { ok: true, used: 0, limit: freePlanLimit };
  }
}
