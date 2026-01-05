import type { Firestore } from 'firebase-admin/firestore';
import type { PlanTier } from './usageLimits';

export async function getUserPlanTier(db: Firestore, userId: string): Promise<PlanTier> {
  if (!userId) return 'free';

  try {
    const snap = await db.collection('users').doc(userId).get();
    const data = snap.exists ? (snap.data() as any) : null;
    const raw = (data?.planTier || data?.plan || data?.tier || '').toString().toLowerCase().trim();
    const isPro = data?.isPro === true || raw === 'pro' || raw === 'paid';
    return isPro ? 'pro' : 'free';
  } catch {
    return 'free';
  }
}
