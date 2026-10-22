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

describe('daily log sync', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  /** A pull that says the server holds nothing but the given logs. */
  const stubServerLogs = (logs: unknown) => {
    global.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ dailyLogs: logs }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    ) as unknown as typeof fetch;
  };

  it('keeps a device-only row when the server holds other days (offline pull)', async () => {
    // A row created here while offline, plus the row the server has.
    const deviceOnly = { date: '2026-10-21', foods: [], waterIntake: 250 };
    const serverRow = { date: '2026-10-20', foods: [], waterIntake: 100 };

    useStore.setState({
      isAuthenticated: true,
      userProfile: { phoneNumber: '09120000000', dailyLogs: [deviceOnly] },
      unsyncedLogDates: ['2026-10-21'],
    });
    stubServerLogs([serverRow]);

    await useStore.getState().fetchUserFromServer();

    const logs = useStore.getState().userProfile?.dailyLogs ?? [];
    expect(logs.map((log) => log.date)).toEqual(['2026-10-21', '2026-10-20']);
    // What only this device knows stays flagged as waiting to sync.
    expect(useStore.getState().unsyncedLogDates).toContain('2026-10-21');
  });

  it('keeps the local row for a day whose changes have not synced', async () => {
    const staleServerRow = { date: '2026-10-20', foods: [], waterIntake: 0, sleepHours: 4 };
    const pendingLocalRow = { date: '2026-10-20', foods: [], waterIntake: 500, sleepHours: 4 };

    useStore.setState({
      isAuthenticated: true,
      userProfile: { phoneNumber: '09120000000', dailyLogs: [pendingLocalRow] },
      unsyncedLogDates: ['2026-10-20'],
    });
    stubServerLogs([staleServerRow]);

    await useStore.getState().fetchUserFromServer();

    expect(useStore.getState().userProfile?.dailyLogs).toEqual([pendingLocalRow]);
    expect(useStore.getState().unsyncedLogDates).toContain('2026-10-20');
  });

  it('takes the server row for a day nothing local is waiting for', async () => {
    const serverRow = { date: '2026-10-20', foods: [], waterIntake: 0, sleepHours: 8 };
    const staleLocalRow = { date: '2026-10-20', foods: [], waterIntake: 0 };

    useStore.setState({
      isAuthenticated: true,
      userProfile: { phoneNumber: '09120000000', dailyLogs: [staleLocalRow] },
      unsyncedLogDates: [],
    });
    stubServerLogs([serverRow]);

    await useStore.getState().fetchUserFromServer();

    expect(useStore.getState().userProfile?.dailyLogs).toEqual([serverRow]);
    expect(useStore.getState().unsyncedLogDates).toEqual([]);
  });

  it('flags a changed day as pending and clears it once the push lands', async () => {
    global.fetch = vi.fn(async () => new Response(null, { status: 200 })) as unknown as typeof fetch;

    useStore.setState({
      isAuthenticated: true,
      userProfile: { phoneNumber: '09120000000' },
      unsyncedLogDates: [],
    });

    useStore.getState().addWater('2026-10-20', 250);
    expect(useStore.getState().unsyncedLogDates).toEqual(['2026-10-20']);

    // The push acknowledges the whole profile, so the date is cleared.
    await useStore.getState().saveUserToServer();
    expect(useStore.getState().unsyncedLogDates).toEqual([]);
  });

  it('leaves a date pending when its own push has not landed yet', async () => {
    global.fetch = vi.fn(async () => new Response(null, { status: 200 })) as unknown as typeof fetch;

    useStore.setState({
      isAuthenticated: true,
      userProfile: { phoneNumber: '09120000000', dailyLogs: [
        { date: '2026-10-20', foods: [], waterIntake: 100 },
      ] },
      // 10-19 was already pushed; 10-20 changed after that push began.
      unsyncedLogDates: ['2026-10-19', '2026-10-20'],
    });

    await useStore.getState().saveUserToServer({
      phoneNumber: '09120000000',
      dailyLogs: [{ date: '2026-10-20', foods: [], waterIntake: 100 }],
    });

    // Only the dates the payload carried are acknowledged...
    expect(useStore.getState().unsyncedLogDates).toEqual(['2026-10-19']);
  });
});
