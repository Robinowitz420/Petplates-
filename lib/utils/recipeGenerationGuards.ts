import type { Firestore } from 'firebase-admin/firestore';

export type RateLimitResult =
  | { ok: true }
  | { ok: false; code: 'RATE_LIMITED'; message: string; status: number };

export type MonthlyLimitResult =
  | { ok: true; used: number; limit: number }
  | { ok: false; code: 'LIMIT_REACHED'; message: string; status: number };

function getMonthKey(nowMs: number): string {
  const d = new Date(nowMs);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${yyyy}-${mm}`;
}

export async function enforceRecipeGenerationRateLimit(db: Firestore, userId: string, nowMs: number): Promise<RateLimitResult> {
  const docRef = db.collection('users').doc(userId).collection('rateLimits').doc('recipeGeneration');

  try {
    const result = await db.runTransaction(async (tx) => {
      const snap = await tx.get(docRef);
      const data = snap.exists ? (snap.data() as any) : {};

      const tenSecStart = typeof data.tenSecStart === 'number' ? data.tenSecStart : 0;
      const tenSecCount = typeof data.tenSecCount === 'number' ? data.tenSecCount : 0;

      const minStart = typeof data.minStart === 'number' ? data.minStart : 0;
      const minCount = typeof data.minCount === 'number' ? data.minCount : 0;

      const tenSecWindowMs = 10_000;
      const minWindowMs = 60_000;

      const nextTenSecStart = nowMs - tenSecStart >= tenSecWindowMs ? nowMs : tenSecStart || nowMs;
      const nextTenSecCount = nowMs - tenSecStart >= tenSecWindowMs ? 0 : tenSecCount;

      const nextMinStart = nowMs - minStart >= minWindowMs ? nowMs : minStart || nowMs;
      const nextMinCount = nowMs - minStart >= minWindowMs ? 0 : minCount;

      const wouldTenSec = nextTenSecCount + 1;
      const wouldMin = nextMinCount + 1;

      if (wouldTenSec > 3 || wouldMin > 10) {
        return { allowed: false, wouldTenSec, wouldMin };
      }

      tx.set(
        docRef,
        {
          tenSecStart: nextTenSecStart,
          tenSecCount: wouldTenSec,
          minStart: nextMinStart,
          minCount: wouldMin,
          updatedAt: nowMs,
        },
        { merge: true }
      );

      return { allowed: true, wouldTenSec, wouldMin };
    });

    if (!result.allowed) {
      return {
        ok: false,
        code: 'RATE_LIMITED',
        status: 429,
        message: 'Slow down a bit — too many meal generations in a short time. Please try again in a few seconds.',
      };
    }

    return { ok: true };
  } catch {
    // Fail-open on rate-limit storage errors to avoid blocking normal usage.
    return { ok: true };
  }
}

export async function enforceAndIncrementRecipeGenerationMonthly(
  db: Firestore,
  userId: string,
  nowMs: number,
  monthlyLimit: number
): Promise<MonthlyLimitResult> {
  const monthKey = getMonthKey(nowMs);
  const docId = `recipeGeneration_${monthKey}`;
  const docRef = db.collection('users').doc(userId).collection('usage').doc(docId);

  try {
    const result = await db.runTransaction(async (tx) => {
      const snap = await tx.get(docRef);
      const data = snap.exists ? (snap.data() as any) : {};
      const current = typeof data.count === 'number' ? data.count : 0;
      const next = current + 1;
      if (next > monthlyLimit) {
        return { ok: false as const, used: current };
      }

      tx.set(
        docRef,
        {
          monthKey,
          count: next,
          updatedAt: nowMs,
        },
        { merge: true }
      );

      return { ok: true as const, used: next };
    });

    if (!result.ok) {
      return {
        ok: false,
        code: 'LIMIT_REACHED',
        status: 403,
        message: 'You’ve reached your monthly meal generation limit. Please try again next month or upgrade your plan.',
      };
    }

    return { ok: true, used: result.used, limit: monthlyLimit };
  } catch {
    // Fail-open on usage counter errors to avoid blocking normal usage.
    return { ok: true, used: 0, limit: monthlyLimit };
  }
}
