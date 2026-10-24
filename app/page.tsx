import Landing from './landing';
import { getLandingStats } from '@/lib/stats';

/**
 * The landing page.
 *
 * The numbers are read from the database on the server and passed down, so
 * they are on screen at first paint instead of flashing zeros while a client
 * fetch lands. Dynamic, because the counts must be real whenever the page is
 * served - a build machine may not have database access.
 */
export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  // The counts are vanity numbers: a database hiccup must not take the whole
  // landing page down, it just renders zeros.
  const stats = await getLandingStats().catch((error) => {
    console.error('Error fetching the public stats:', error);
    return { gyms: 0, foods: 0, articles: 0, exercises: 0, users: 0, plans: 0, bestDiscount: 0 };
  });

  return <Landing stats={stats} />;
}
