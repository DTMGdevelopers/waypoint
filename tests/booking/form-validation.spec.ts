import { test, expect } from '../../fixtures/bookingFixture';
import { Page } from '@playwright/test';
import { SearchPage } from '../../page-objects/SearchPage';
import { CruiseDetailPage } from '../../page-objects/CruiseDetailPage';
import { OccupancyPage } from '../../page-objects/OccupancyPage';
import { StateroomsPage } from '../../page-objects/StateroomsPage';
import { CabinsPage } from '../../page-objects/CabinsPage';
import { PassengerFormPage } from '../../page-objects/PassengerFormPage';
import { passengers } from '../../helpers/testData';

/**
 * Passenger form — validation coverage
 *
 * Each test navigates through the full booking journey to reach the passenger
 * form, then exercises a specific validation scenario. Journey navigation is
 * independent per test so each can be run in isolation.
 *
 * Timeout: 600s per test (journey navigation + form interaction).
 */

/** Navigates through the full booking journey and returns a loaded PassengerFormPage. */
async function reachPassengerForm(page: Page) {
  const searchPage = new SearchPage(page);
  await searchPage.goto();
  await searchPage.waitForResults();
  await searchPage.selectFirstResult();

  const detail = new CruiseDetailPage(page);
  await detail.waitForLoad();
  await detail.bookNow();

  const occupancy = new OccupancyPage(page);
  await occupancy.waitForLoad();
  await occupancy.continue();

  const staterooms = new StateroomsPage(page);
  await staterooms.waitForLoad();
  await staterooms.continue();

  const hasCabins = await page
    .locator('[data-cruiseappy="booking_deck_room"]')
    .isVisible()
    .catch(() => false);
  if (hasCabins) {
    const cabins = new CabinsPage(page);
    await cabins.waitForLoad();
    await cabins.selectFirstCabin();
  }

  const form = new PassengerFormPage(page);
  await form.waitForLoad();
  return form;
}

test.describe('Passenger form — required field validation', () => {
  test('submitting empty form shows validation errors', async ({ page }) => {
    test.setTimeout(600_000);
    const form = await reachPassengerForm(page);
    // Submit without filling any fields
    await form.submitForm();
    await form.assertHasErrors();
  });

  test('invalid email format triggers an email error', async ({ page }) => {
    test.setTimeout(600_000);
    const form = await reachPassengerForm(page);
    await form.fillPassenger({ email: passengers.invalid.email });
    await form.submitForm();
    const errors = await form.getErrorMessages();
    const hasEmailError = errors.some((e) =>
      /email|invalid|format/i.test(e),
    );
    expect(hasEmailError, `Expected an email validation error. Got: ${JSON.stringify(errors)}`).toBe(true);
  });

  test('future date of birth triggers a DOB error', async ({ page }) => {
    test.setTimeout(600_000);
    const form = await reachPassengerForm(page);
    await form.fillPassenger({ dob: passengers.invalid.dob });
    await form.submitForm();
    const errors = await form.getErrorMessages();
    const hasDobError = errors.some((e) =>
      /date|birth|dob|age/i.test(e),
    );
    expect(hasDobError, `Expected a DOB validation error. Got: ${JSON.stringify(errors)}`).toBe(true);
  });

  test('passenger form has more than zero input fields', async ({ page }) => {
    test.setTimeout(600_000);
    const form = await reachPassengerForm(page);
    const count = await form.getFieldCount();
    expect(count, 'Expected at least one input field on the passenger form').toBeGreaterThan(0);
  });
});

test.describe('Passenger form — T&Cs', () => {
  test.skip(true, 'booking_tc attribute not yet implemented — see CRUISEAPPY_ATTRIBUTES.md');

  test('proceeding without accepting T&Cs is blocked', async ({ page }) => {
    test.setTimeout(600_000);
    const form = await reachPassengerForm(page);
    await form.submitForm();
    // T&C error should appear before payment
    const errors = await form.getErrorMessages();
    const hasTcError = errors.some((e) => /terms|conditions|accept/i.test(e));
    expect(hasTcError, 'Expected a T&C validation error').toBe(true);
  });
});

test.describe('Passenger form — browser autofill', () => {
  test.skip(true, 'Autofill simulation requires site-specific field name knowledge — implement per theme');
});
