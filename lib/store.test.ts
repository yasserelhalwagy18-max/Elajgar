import { describe, it, expect, beforeEach } from 'vitest';

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
  it('clears the profile', () => {
    useStore.setState({
      isAuthenticated: true,
      userProfile: { phoneNumber: '09120000000', weight: 70 },
    });

    useStore.getState().logout();

    const state = useStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.userProfile).toBeNull();
  });
});
