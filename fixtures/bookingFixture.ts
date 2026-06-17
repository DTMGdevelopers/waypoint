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
  overlayHandler: [async ({ page }, use) => {
    // Block data-crypt.com marketing scripts before they load — they inject an f24
    // popup backdrop that intercepts pointer events but has no visible close button.
    // Serving an empty JS response prevents the overlay from ever being created.
    await page.route(/data-crypt\.com/, (route) =>
      route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }),
    );

    // CookieYes consent banner (cookie-law-info plugin) — click Accept All when visible.
    await page.addLocatorHandler(
      page.locator('button[data-cky-tag="accept-all-button"]'),
      async (btn) => { await btn.click(); },
    );

    await use();
  }, { auto: true }],
});

export { expect } from '@playwright/test';
