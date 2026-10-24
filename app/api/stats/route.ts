import { NextResponse } from 'next/server';
import { getLandingStats } from '@/lib/stats';

/**
 * The public numbers shown on the landing page.
 *
 * The counts used to be typed into the page by hand, which meant they were
 * wrong: the page claimed there were 24 foods while the database held more
 * than two hundred. They come from the database now.
 */
export async function GET() {
  try {
    return NextResponse.json(await getLandingStats());
  } catch (error) {
    console.error('Error fetching the public stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
