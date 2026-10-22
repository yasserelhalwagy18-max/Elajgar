/**
 * The profile wizard.
 *
 * The wizard has six steps. The count lives here so that the login screen -
 * which sends a user who has finished it to the dashboard - and the wizard
 * itself cannot drift apart.
 */

/** The last step of the wizard. A user who has reached it is done. */
export const WIZARD_LAST_STEP = 6;

/**
 * The title of each wizard step.
 *
 * It feeds the hidden heading every step change moves focus to, so a screen
 * reader hears what step was arrived on - the progressbar announces nothing
 * by itself.
 */
export const WIZARD_STEP_TITLES: Record<number, string> = {
  1: 'نام و مشخصات پایه',
  2: 'قد، وزن و فعالیت روزانه',
  3: 'بیماری‌های زمینه‌ای و داروها',
  4: 'هشدار پزشکی',
  5: 'نقشه درد',
  6: 'پرسشنامه سبک زندگی',
};

/**
 * Whether the wizard is finished for this user.
 *
 * A user with no saved step is new and has to answer the questions. A user
 * who has reached the last step has answered them.
 */
export function isWizardComplete(step: number | null | undefined): boolean {
  return typeof step === 'number' && step >= WIZARD_LAST_STEP;
}
