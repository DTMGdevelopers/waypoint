import { test as base } from '@playwright/test';
import { SearchPage } from '../page-objects/SearchPage';
import { CruiseDetailPage } from '../page-objects/CruiseDetailPage';
import { OccupancyPage } from '../page-objects/OccupancyPage';
import { StateroomsPage } from '../page-objects/StateroomsPage';
import { CabinsPage } from '../page-objects/CabinsPage';
import { PassengerFormPage } from '../page-objects/PassengerFormPage';
import { ResultsPage } from '../page-objects/ResultsPage';
import { PaymentPage } from '../page-objects/PaymentPage';
import { ConfirmationPage } from '../page-objects/ConfirmationPage';
import { loadTheme, ThemeConfig } from '../config/themes';

type BookingFixtures = {
  overlayHandler: void;
  themeConfig: ThemeConfig;
  searchPage: SearchPage;
  cruiseDetailPage: CruiseDetailPage;
  occupancyPage: OccupancyPage;
  stateroomsPage: StateroomsPage;
  cabinsPage: CabinsPage;
  passengerFormPage: PassengerFormPage;
  resultsPage: ResultsPage;
  paymentPage: PaymentPage;
  confirmationPage: ConfirmationPage;
};

export const test = base.extend<BookingFixtures>({
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

  themeConfig: async ({}, use) => {
    await use(loadTheme());
  },

  searchPage: async ({ page }, use) => {
    await use(new SearchPage(page));
  },

  cruiseDetailPage: async ({ page }, use) => {
    await use(new CruiseDetailPage(page));
  },

  occupancyPage: async ({ page }, use) => {
    await use(new OccupancyPage(page));
  },

  stateroomsPage: async ({ page }, use) => {
    await use(new StateroomsPage(page));
  },

  cabinsPage: async ({ page }, use) => {
    await use(new CabinsPage(page));
  },

  passengerFormPage: async ({ page }, use) => {
    await use(new PassengerFormPage(page));
  },

  resultsPage: async ({ page }, use) => {
    await use(new ResultsPage(page));
  },

  paymentPage: async ({ page }, use) => {
    await use(new PaymentPage(page));
  },

  confirmationPage: async ({ page }, use) => {
    await use(new ConfirmationPage(page));
  },
});

export { expect } from '@playwright/test';
