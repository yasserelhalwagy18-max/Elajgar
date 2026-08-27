import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const gyms = await prisma.gym.findMany();
    return NextResponse.json(gyms);
  } catch (error) {
    console.error('Error fetching gyms:', error);
    return NextResponse.json({ error: 'خطا در دریافت اطلاعات باشگاه‌ها' }, { status: 500 });
  }
}
