import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// NOTE: phoneNumber-based identification is temporary scaffolding and must be replaced
// once real OTP/session auth ships. Do not build any additional logic assuming this is secure.

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phoneNumber');

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'phoneNumber is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        phoneNumber,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, ...otherFields } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'phoneNumber is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.upsert({
      where: {
        phoneNumber,
      },
      update: {
        ...otherFields,
      },
      create: {
        phoneNumber,
        ...otherFields,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error saving user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
