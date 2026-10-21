import { describe, it, expect } from 'vitest';
import { destinationFor, safeNextPath } from './destination';
import { WIZARD_LAST_STEP } from './wizard';

/**
 * Where a signed-in user is sent.
 *
 * Two places need the same answer: the login screen, after a successful
 * sign-in, and the login screen itself, when the visitor is already signed
 * in and lands on it by hand.
 */
describe('safeNextPath', () => {
  it('keeps a path inside the site', () => {
    expect(safeNextPath('/dashboard')).toBe('/dashboard');
    expect(safeNextPath('/dashboard/profile')).toBe('/dashboard/profile');
  });

  it('refuses anything that is not a path', () => {
    expect(safeNextPath('https://example.com')).toBeNull();
    expect(safeNextPath('dashboard')).toBeNull();
    expect(safeNextPath('')).toBeNull();
    expect(safeNextPath(null)).toBeNull();
    expect(safeNextPath(undefined)).toBeNull();
  });

  it('refuses a protocol-relative URL, which would leave the site', () => {
    // `//example.com` starts with a slash, so a naive check would let it
    // through - and the browser would read it as another host.
    expect(safeNextPath('//example.com')).toBeNull();
    expect(safeNextPath('//example.com/steal')).toBeNull();
  });
});

describe('destinationFor', () => {
  it('sends a user who has finished the questionnaire to the dashboard', () => {
    expect(
      destinationFor({ role: 'USER', currentWizardStep: WIZARD_LAST_STEP }),
    ).toBe('/dashboard');
  });

  it('sends a user who is still in the questionnaire to the wizard', () => {
    expect(destinationFor({ role: 'USER', currentWizardStep: 2 })).toBe('/wizard');
    expect(destinationFor({ role: 'USER', currentWizardStep: null })).toBe('/wizard');
  });

  it('sends an admin to the panel', () => {
    expect(destinationFor({ role: 'ADMIN', currentWizardStep: 0 })).toBe('/panel-7x9k4m');
  });

  it('honours the page the user was trying to reach', () => {
    expect(
      destinationFor({ role: 'USER', currentWizardStep: 0, nextPath: '/dashboard/profile' }),
    ).toBe('/dashboard/profile');
  });

  it('does not let a crafted next parameter send the user off the site', () => {
    expect(
      destinationFor({ role: 'USER', currentWizardStep: 0, nextPath: '//example.com' }),
    ).toBe('/wizard');
    expect(
      destinationFor({ role: 'USER', currentWizardStep: 0, nextPath: 'https://example.com' }),
    ).toBe('/wizard');
  });

  it('sends an admin to the panel even without a next parameter', () => {
    // The panel is where an admin belongs, so the questionnaire is skipped.
    expect(destinationFor({ role: 'ADMIN', currentWizardStep: WIZARD_LAST_STEP })).toBe(
      '/panel-7x9k4m',
    );
  });
});
