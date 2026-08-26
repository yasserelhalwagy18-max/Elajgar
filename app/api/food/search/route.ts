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
    const all = searchParams.get('all');

    if (all === 'true') {
      const allFoods = await prisma.food.findMany();
      return NextResponse.json(allFoods);
    }

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
