import { test as base } from '@playwright/test';

type BookingFixtures = {
  overlayHandler: void;
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
});

export { expect } from '@playwright/test';
