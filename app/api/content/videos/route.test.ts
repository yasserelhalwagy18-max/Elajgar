import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * The paywall is enforced in the API, not in the UI.
 *
 * The premium videos used to come back with their stream URLs to anyone who
 * asked, and the "blur" in the education page was purely visual. A premium
 * URL must never leave the server without an active subscription.
 */

const prismaMock = {
  videoContent: { findMany: vi.fn() },
};

vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

const getSessionUserIdMock = vi.fn(async (): Promise<string | null> => null);
vi.mock('@/lib/session', () => ({
  getSessionUserId: () => getSessionUserIdMock(),
}));

const getActiveSubscriptionMock = vi.fn(async (_userId: string): Promise<unknown> => null);
vi.mock('@/lib/subscription', () => ({
  getActiveSubscription: (userId: string) => getActiveSubscriptionMock(userId),
}));

const { GET } = await import('./route');

const freeVideo = {
  id: 'v_free',
  title: 'Free video',
  url: 'https://cdn.example.com/free.mp4',
  thumbnailUrl: null,
  isPremium: false,
  durationInMinutes: 5,
  exercise: null,
};

const premiumVideo = {
  ...freeVideo,
  id: 'v_premium',
  title: 'Premium video',
  url: 'https://cdn.example.com/premium.mp4',
  isPremium: true,
};

beforeEach(() => {
  vi.clearAllMocks();
  getSessionUserIdMock.mockResolvedValue(null);
  getActiveSubscriptionMock.mockResolvedValue(null);
  prismaMock.videoContent.findMany.mockResolvedValue([freeVideo, premiumVideo]);
});

describe('GET /api/content/videos', () => {
  it('never sends a premium URL to an anonymous caller', async () => {
    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    const premium = body.find((video: { id: string }) => video.id === 'v_premium');
    const free = body.find((video: { id: string }) => video.id === 'v_free');

    expect(premium.url).toBeNull();
    // The blurred card still needs its metadata.
    expect(premium.title).toBe('Premium video');
    expect(premium.durationInMinutes).toBe(5);
    expect(free.url).toBe('https://cdn.example.com/free.mp4');
  });

  it('never sends a premium URL to a signed-in user without a subscription', async () => {
    getSessionUserIdMock.mockResolvedValue('user_1');

    const res = await GET();
    const body = await res.json();

    const premium = body.find((video: { id: string }) => video.id === 'v_premium');
    expect(premium.url).toBeNull();
  });

  it('unlocks the premium URLs for a subscriber', async () => {
    getSessionUserIdMock.mockResolvedValue('user_1');
    getActiveSubscriptionMock.mockResolvedValue({ id: 'sub_1', status: 'ACTIVE' });

    const res = await GET();
    const body = await res.json();

    const premium = body.find((video: { id: string }) => video.id === 'v_premium');
    expect(premium.url).toBe('https://cdn.example.com/premium.mp4');
  });
});
