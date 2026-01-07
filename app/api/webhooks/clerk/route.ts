import { NextRequest } from 'next/server';
import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { getFirebaseAdminDb } from '@/lib/services/firebaseAdmin';

export const runtime = 'nodejs';

type PlanTier = 'free' | 'pro';

async function setUserPlanTier(params: {
  userId: string;
  planTier: PlanTier;
  billing?: Record<string, unknown>;
}) {
  const { userId, planTier, billing } = params;
  const db = getFirebaseAdminDb();

  await db
    .collection('users')
    .doc(userId)
    .set(
      {
        planTier,
        isPro: planTier === 'pro',
        billing: billing || null,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
}

function normalizeUserIdFromPayload(payload: any): string {
  const direct = typeof payload?.payer?.user_id === 'string' ? payload.payer.user_id : '';
  return direct || '';
}

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);
    const eventType = evt.type;
    const data = evt.data as any;

    // We only sync per-user billing into Firestore.
    const userId = normalizeUserIdFromPayload(data);
    const plan = data?.plan ?? null;
    const status = typeof data?.status === 'string' ? data.status : '';
    const isDefaultPlan = Boolean(plan?.is_default);

    if (!userId) {
      return new Response('OK', { status: 200 });
    }

    if (eventType.startsWith('subscriptionItem.')) {
      if (isDefaultPlan) {
        return new Response('OK', { status: 200 });
      }

      const planTierForPaid: PlanTier = isDefaultPlan ? 'free' : 'pro';

      if (eventType === 'subscriptionItem.active') {
        await setUserPlanTier({
          userId,
          planTier: planTierForPaid,
          billing: {
            source: 'clerk',
            eventType,
            status,
            planId: typeof data?.plan_id === 'string' ? data.plan_id : null,
            planSlug: typeof plan?.slug === 'string' ? plan.slug : null,
            isDefaultPlan,
            periodEnd: typeof data?.period_end === 'number' ? data.period_end : null,
            updatedAt: Date.now(),
          },
        });
      }

      // `canceled` retains access until period end; we keep pro until `ended`.
      if (eventType === 'subscriptionItem.canceled') {
        await setUserPlanTier({
          userId,
          planTier: planTierForPaid,
          billing: {
            source: 'clerk',
            eventType,
            status,
            planId: typeof data?.plan_id === 'string' ? data.plan_id : null,
            planSlug: typeof plan?.slug === 'string' ? plan.slug : null,
            isDefaultPlan,
            periodEnd: typeof data?.period_end === 'number' ? data.period_end : null,
            updatedAt: Date.now(),
          },
        });
      }

      if (eventType === 'subscriptionItem.ended' || eventType === 'subscriptionItem.abandoned') {
        if (!isDefaultPlan) {
          await setUserPlanTier({
            userId,
            planTier: 'free',
            billing: {
              source: 'clerk',
              eventType,
              status,
              planId: typeof data?.plan_id === 'string' ? data.plan_id : null,
              planSlug: typeof plan?.slug === 'string' ? plan.slug : null,
              isDefaultPlan,
              periodEnd: typeof data?.period_end === 'number' ? data.period_end : null,
              updatedAt: Date.now(),
            },
          });
        }
      }

      if (eventType === 'subscriptionItem.pastDue' || eventType === 'subscriptionItem.incomplete') {
        if (!isDefaultPlan) {
          await setUserPlanTier({
            userId,
            planTier: 'free',
            billing: {
              source: 'clerk',
              eventType,
              status,
              planId: typeof data?.plan_id === 'string' ? data.plan_id : null,
              planSlug: typeof plan?.slug === 'string' ? plan.slug : null,
              isDefaultPlan,
              periodEnd: typeof data?.period_end === 'number' ? data.period_end : null,
              updatedAt: Date.now(),
            },
          });
        }
      }

      return new Response('OK', { status: 200 });
    }

    // Ignore other event types for now.
    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('Clerk webhook failed:', err);
    return new Response('Webhook verification failed', { status: 400 });
  }
}
