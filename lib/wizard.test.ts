import { describe, it, expect } from 'vitest';
import { isWizardComplete, WIZARD_LAST_STEP } from './wizard';

/**
 * The wizard is six steps long. The login screen uses this to decide where
 * to send a user: someone who has answered the questionnaire belongs on the
 * dashboard, not back in the wizard.
 */
describe('isWizardComplete', () => {
  it('is not complete for a user who has not started', () => {
    expect(isWizardComplete(null)).toBe(false);
    expect(isWizardComplete(undefined)).toBe(false);
    expect(isWizardComplete(0)).toBe(false);
  });

  it('is not complete while the user is still in the middle', () => {
    for (const step of [1, 2, 3, 4, 5]) {
      expect(isWizardComplete(step)).toBe(false);
    }
  });

  it('is complete once the last step is reached', () => {
    expect(isWizardComplete(WIZARD_LAST_STEP)).toBe(true);
  });

  it('is complete for a step past the last one', () => {
    // The step is stored as a number, so a value above the last one should
    // not send the user back to the wizard.
    expect(isWizardComplete(WIZARD_LAST_STEP + 1)).toBe(true);
  });
});
