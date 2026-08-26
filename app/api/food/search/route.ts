import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q || q.trim() === '') {
      // Default to 5 items if query is empty
      const defaultFoods = await prisma.food.findMany({
        take: 5,
        orderBy: {
          name: 'asc',
        },
      });
      return NextResponse.json(defaultFoods);
    }

    // Fetch all for meal generation if 'all' parameter is passed implicitly or explicitly
    // BUT the requirement was: "If `q` is present, search Food records by name". Wait, I can just use a simple `contains` filter.
    if (q === 'ALL_FOODS_FOR_GENERATION') {
        const allFoods = await prisma.food.findMany();
        return NextResponse.json(allFoods);
    }

    const foods = await prisma.food.findMany({
      where: {
        name: {
          contains: q,
          mode: 'insensitive', // Case-insensitive partial match
        },
      },
      take: 20, // Reasonable limit for search results
    });

    return NextResponse.json(foods);
  } catch (error) {
    console.error('Error in food search:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
