import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUserId } from '@/lib/session';
import { normalizeText } from '@/lib/utils';

/**
 * How many food rows the search scans.
 *
 * The food table is a fixed reference list of a few hundred rows, so it is
 * cheap to compare in memory - and comparing in memory is the only way to
 * match the Arabic and Persian spellings of the same letter.
 */
const SEARCH_SCAN_LIMIT = 1000;

/** How many results a search returns. */
const SEARCH_RESULT_LIMIT = 20;

export async function GET(request: Request) {
  try {
    // Derive the caller from the session cookie rather than trusting a header:
    // a client-supplied header could otherwise be forged to impersonate a user.
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const all = searchParams.get('all');

    if (all === 'true') {
      const allFoods = await prisma.food.findMany({
        take: 500,
        orderBy: { name: 'asc' },
      });
      return NextResponse.json(allFoods);
    }

    const needle = normalizeText(q ?? '');

    if (needle === '') {
      // Default to 5 items if query is empty
      const defaultFoods = await prisma.food.findMany({
        take: 5,
        orderBy: {
          name: 'asc',
        },
      });
      return NextResponse.json(defaultFoods);
    }

    // The database filter alone is not enough. Persian text reaches the app
    // with the Arabic spelling of a letter in it all the time - from a
    // keyboard, from a message pasted out of a chat - and a plain `LIKE`
    // match silently returns nothing for those.
    //
    //   "کباب" (Persian kaf)  -> 6 results
    //   "كباب" (Arabic kaf)   -> 0 results
    //
    // So the query and the food names are both normalised before they are
    // compared. The table is small and fixed, so the scan is cheap.
    const candidates = await prisma.food.findMany({
      take: SEARCH_SCAN_LIMIT,
      orderBy: { name: 'asc' },
    });

    const foods = candidates
      .filter((food) => normalizeText(food.name).includes(needle))
      .slice(0, SEARCH_RESULT_LIMIT);

    return NextResponse.json(foods);
  } catch (error) {
    console.error('Error in food search:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
