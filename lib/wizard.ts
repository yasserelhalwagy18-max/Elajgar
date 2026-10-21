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
 * Whether the wizard is finished for this user.
 *
 * A user with no saved step is new and has to answer the questions. A user
 * who has reached the last step has answered them.
 */
export function isWizardComplete(step: number | null | undefined): boolean {
  return typeof step === 'number' && step >= WIZARD_LAST_STEP;
}
