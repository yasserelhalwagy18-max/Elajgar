import { NextResponse } from 'next/server';
import { getProgramSteps } from '@/lib/settings';

/**
 * The daily corrective program.
 *
 * Public: the program is shown to every signed-in user, and an admin edits
 * it from the settings panel.
 */
export async function GET() {
  try {
    const steps = await getProgramSteps();

    return NextResponse.json(
      steps.map((step) => ({
        offset: step.offset,
        text: step.text,
        status: step.status,
      })),
    );
  } catch (error) {
    console.error('Error fetching the program:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
