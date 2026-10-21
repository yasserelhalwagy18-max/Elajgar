import { NextResponse } from 'next/server';
import { getActivePlans } from '@/lib/subscription';

/**
 * The subscription tiers that can be bought.
 *
 * Public: the premium modal needs the prices before the user is signed in,
 * and the data is a price list, not anything private.
 */
export async function GET() {
  try {
    const plans = await getActivePlans();

    return NextResponse.json(
      plans.map((plan) => ({
        id: plan.id,
        key: plan.key,
        title: plan.title,
        price: plan.price,
        description: plan.description,
        features: Array.isArray(plan.features) ? plan.features : [],
        isFeatured: plan.isFeatured,
        durationDays: plan.durationDays,
      })),
    );
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
