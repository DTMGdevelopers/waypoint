import { test as base } from '@playwright/test';
import { SearchPage } from '../page-objects/SearchPage';
import { ResultsPage } from '../page-objects/ResultsPage';
import { SelectionPage } from '../page-objects/SelectionPage';
import { PassengerFormPage } from '../page-objects/PassengerFormPage';
import { ExtrasPage } from '../page-objects/ExtrasPage';
import { ReviewPage } from '../page-objects/ReviewPage';
import { PaymentPage } from '../page-objects/PaymentPage';

type BookingFixtures = {
  searchPage: SearchPage;
  resultsPage: ResultsPage;
  selectionPage: SelectionPage;
  passengerFormPage: PassengerFormPage;
  extrasPage: ExtrasPage;
  reviewPage: ReviewPage;
  paymentPage: PaymentPage;
  overlayHandler: void;
};

export const test = base.extend<BookingFixtures>({
  searchPage: async ({ page }, use) => use(new SearchPage(page)),
  resultsPage: async ({ page }, use) => use(new ResultsPage(page)),
  selectionPage: async ({ page }, use) => use(new SelectionPage(page)),
  passengerFormPage: async ({ page }, use) => use(new PassengerFormPage(page)),
  extrasPage: async ({ page }, use) => use(new ExtrasPage(page)),
  reviewPage: async ({ page }, use) => use(new ReviewPage(page)),
  paymentPage: async ({ page }, use) => use(new PaymentPage(page)),

  // Auto-dismisses overlays that intercept pointer events across all booking tests.
  // addLocatorHandler fires automatically whenever the locator becomes visible,
  // before Playwright attempts any action — no manual calls needed in tests.
  overlayHandler: [async ({ page }, use) => {
    // CookieYes consent banner (cookie-law-info plugin)
    await page.addLocatorHandler(
      page.locator('button[data-cky-tag="accept-all-button"]'),
      async (btn) => { await btn.click(); },
    );

    // f24 marketing overlay (data-crypt.com) — intercepts pointer events as a full-page backdrop.
    // No close button is present; remove it from the DOM so clicks reach the page below.
    await page.addLocatorHandler(
      page.locator('[role="f24-popup"]'),
      async () => {
        await page.evaluate(() => {
          document.querySelectorAll('[role="f24-popup"]').forEach((el) => el.remove());
        });
      },
    );

    await use();
  }, { auto: true }],
});

export { expect } from '@playwright/test';
