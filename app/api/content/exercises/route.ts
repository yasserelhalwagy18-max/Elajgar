import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * The published exercises for the gallery.
 *
 * Read-only and public: the exercises are editorial, not user data.
 */
export async function GET() {
  try {
    const exercises = await prisma.exercise.findMany({
      where: { isPublished: true },
      include: { videoContent: true },
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
    });

    return NextResponse.json(exercises);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
