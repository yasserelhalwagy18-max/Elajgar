import { NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/session';
import { getSubscription } from '@/lib/subscription';

/**
 * The signed-in user's subscription.
 *
 * The client uses it to decide whether the premium content is unlocked.
 */
export async function GET() {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await getSubscription(userId);

    if (!subscription) {
      return NextResponse.json({ subscription: null, isActive: false });
    }

    return NextResponse.json({
      isActive: subscription.isActive,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        startedAt: subscription.startedAt,
        expiresAt: subscription.expiresAt,
        plan: {
          key: subscription.plan.key,
          title: subscription.plan.title,
          price: subscription.plan.price,
          description: subscription.plan.description,
          features: Array.isArray(subscription.plan.features) ? subscription.plan.features : [],
        },
      },
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
