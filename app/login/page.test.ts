import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * The login screen sends an already signed-in user onward.
 *
 * The page used to be a client component that only knew about the browser's
 * local storage, so a user who was signed in and opened `/login` was shown
 * the login form again and had to sign in a second time. The page is a
 * server component now, and the session cookie is what decides.
 */

const prismaMock = {
  user: {
    findUnique: vi.fn(),
  },
};

vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

const sessionUserId = vi.fn(async (): Promise<string | null> => 'user_1');
vi.mock('@/lib/session', () => ({
  getSessionUserId: () => sessionUserId(),
}));

// `redirect` throws in Next.js, and the thrown value is what the router
// turns into a navigation.
const redirectMock = vi.fn((path: string) => {
  throw new Error(`NEXT_REDIRECT:${path}`);
});
vi.mock('next/navigation', () => ({ redirect: redirectMock }));

// The form itself is a client component and is not what is under test here.
vi.mock('./login-form', () => ({ default: () => null }));

const { default: LoginPage } = await import('./page');

const callPage = (next?: string) =>
  (LoginPage({
    searchParams: Promise.resolve(next ? { next } : {}),
  }) as Promise<unknown>);

beforeEach(() => {
  vi.clearAllMocks();
  sessionUserId.mockResolvedValue('user_1');
  prismaMock.user.findUnique.mockResolvedValue({
    role: 'USER',
    currentWizardStep: 6,
  });
});

describe('the login page', () => {
  it('sends a signed-in user to the dashboard instead of showing the form', async () => {
    await expect(callPage()).rejects.toThrow('NEXT_REDIRECT:/dashboard');
  });

  it('sends a signed-in admin to the panel', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      role: 'ADMIN',
      currentWizardStep: 0,
    });

    await expect(callPage()).rejects.toThrow('NEXT_REDIRECT:/panel-7x9k4m');
  });

  it('sends a signed-in user to the page they were trying to reach', async () => {
    await expect(callPage('/dashboard/profile')).rejects.toThrow(
      'NEXT_REDIRECT:/dashboard/profile',
    );
  });

  it('does not let a crafted next parameter send the user off the site', async () => {
    await expect(callPage('//example.com')).rejects.toThrow('NEXT_REDIRECT:/dashboard');
  });

  it('sends a signed-in user who is still in the questionnaire to the wizard', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      role: 'USER',
      currentWizardStep: 2,
    });

    await expect(callPage()).rejects.toThrow('NEXT_REDIRECT:/wizard');
  });

  it('shows the form to a visitor who is not signed in', async () => {
    sessionUserId.mockResolvedValue(null);

    await expect(callPage()).resolves.toBeDefined();
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
