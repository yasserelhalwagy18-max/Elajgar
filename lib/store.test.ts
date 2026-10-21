import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * Regression tests for the sign-in flow.
 *
 * The persisted store still holds the previous user's profile. The login
 * used to merge the new phone number into it, so a second user signing in on
 * the same device saw - and uploaded - the first user's weight, age and
 * health data.
 */
const { useStore } = await import('./store');

beforeEach(() => {
  useStore.setState({ isAuthenticated: false, userProfile: null });
});

describe('signIn', () => {
  it('starts a session for the phone number', () => {
    useStore.getState().signIn('09120000000');

    const state = useStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.userProfile?.phoneNumber).toBe('09120000000');
  });

  it('drops the previous user\'s profile instead of merging into it', () => {
    useStore.setState({
      isAuthenticated: true,
      userProfile: {
        phoneNumber: '09111111111',
        fullName: 'First User',
        weight: 82,
        height: 190,
        age: 51,
        painZones: [{ zone: 'back', intensity: 8, type: 'مبهم' }],
      },
    });

    useStore.getState().signIn('09120000000');

    const profile = useStore.getState().userProfile;
    expect(profile?.phoneNumber).toBe('09120000000');
    // None of the first user's data may survive.
    expect(profile?.fullName).toBeUndefined();
    expect(profile?.weight).toBeUndefined();
    expect(profile?.height).toBeUndefined();
    expect(profile?.age).toBeUndefined();
    expect(profile?.painZones).toBeUndefined();
  });
});

describe('logout', () => {
  it('clears the profile', async () => {
    useStore.setState({
      isAuthenticated: true,
      userProfile: { phoneNumber: '09120000000', weight: 70 },
    });

    await useStore.getState().logout();

    const state = useStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.userProfile).toBeNull();
  });
});

/**
 * The stored session and the session cookie can get out of step: clearing
 * the site data leaves the cookie behind, and the cookie expires while the
 * stored profile stays. The server is the only one that knows which of the
 * two is telling the truth.
 */
describe('syncSession', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('marks the user signed in when the server knows them', async () => {
    global.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ phoneNumber: '09120000000', role: 'USER' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    ) as unknown as typeof fetch;

    const signedIn = await useStore.getState().syncSession();

    expect(signedIn).toBe(true);
    expect(useStore.getState().isAuthenticated).toBe(true);
    expect(useStore.getState().userProfile?.phoneNumber).toBe('09120000000');
  });

  it('marks the user signed out when the server refuses', async () => {
    global.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }),
    ) as unknown as typeof fetch;

    const signedIn = await useStore.getState().syncSession();

    expect(signedIn).toBe(false);
    expect(useStore.getState().isAuthenticated).toBe(false);
  });

  it('does not sign the user out when the server cannot be reached', async () => {
    global.fetch = vi.fn(async () => {
      throw new Error('network down');
    }) as unknown as typeof fetch;

    const signedIn = await useStore.getState().syncSession();

    // The cookie may still be good, so this must not be read as "signed out".
    expect(signedIn).toBeNull();
  });
});
