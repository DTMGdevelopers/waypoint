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
    // Block data-crypt.com marketing scripts — they inject an f24 backdrop that
    // intercepts pointer events. Empty JS response prevents it loading at all.
    await page.route(/data-crypt\.com/, (route) =>
      route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }),
    );

    // CookieYes consent banner (cookie-law-info plugin).
    await page.addLocatorHandler(
      page.locator('button[data-cky-tag="accept-all-button"]'),
      async (btn) => { await btn.click(); },
    );

    // visioncruise search loading overlay — stays visible after AJAX results render
    // and blocks all clicks until dismissed.
    await page.addLocatorHandler(
      page.locator('#search-loading-overlay.is-visible'),
      async () => {
        await page.evaluate(() => {
          document.querySelector('#search-loading-overlay')?.classList.remove('is-visible');
        });
      },
    );

    await use();
  }, { auto: true }],
});

export { expect } from '@playwright/test';
