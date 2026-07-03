import { test } from '../../fixtures/bookingFixture';

/**
 * Change Stateroom
 *
 * All tests are skipped pending UX clarification on whether this is:
 *   (a) a mid-journey back-navigation (return from passenger form to re-select a stateroom), or
 *   (b) a post-booking modification flow (amend an existing confirmed booking).
 *
 * Confirm the intended flow with the product team, then implement accordingly
 * and remove the test.skip below.
 */

test.describe('Change stateroom', () => {
  test.skip(true, 'Change stateroom flow TBC — confirm whether mid-journey or post-booking');

  test('navigating back from passenger form shows stateroom selection', async ({ page }) => {
    // Placeholder: navigate forward to passenger form, then use browser back or
    // a dedicated "change stateroom" link to return to stateroom selection.
    // Assert the stateroom selection page loads correctly.
  });

  test('selecting a different stateroom updates the price in the summary', async ({ page }) => {
    // Placeholder: select initial stateroom, record price, navigate back,
    // select a different grade, assert the new price differs from the original.
  });

  test('changed stateroom is reflected on the passenger form summary', async ({ page }) => {
    // Placeholder: complete stateroom change, proceed to passenger form,
    // assert the summary panel shows the newly selected stateroom details.
  });
});
