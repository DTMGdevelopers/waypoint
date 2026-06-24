import { Page } from '@playwright/test';

export class CruiseDetailPage {
  // data-cruiseappy="book_cruise" is the stable plugin attribute for the Book Now CTA.
  // Fall back to href*=occupancy for older themes (visioncruise, century-cypress).
  // .first() suppresses strict-mode if multiple stateroom-specific links also match.
  private readonly bookNowLink = this.page
    .locator('[data-cruiseappy="book_cruise"]')
    .or(this.page.locator('main a[href*="occupancy"]'))
    .first();
  private readonly cruiseName = this.page.getByRole('heading', { level: 1 }).first();

  constructor(private readonly page: Page) {}

  async waitForLoad() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.cruiseName.waitFor({ state: 'visible', timeout: 30_000 });
    return this;
  }

  async getCruiseName(): Promise<string> {
    return (await this.cruiseName.textContent()) ?? '';
  }

  // isMobile param kept for backward compatibility with tests that pass it.
  getBookNowCta(_isMobile?: boolean) {
    return this.bookNowLink;
  }

  async bookNow() {
    // On some cruises the CTA is AJAX-rendered after domcontentloaded — wait for
    // it explicitly before getAttribute() (which uses the shorter actionTimeout).
    await this.bookNowLink.waitFor({ state: 'visible', timeout: 30_000 });
    const href = await this.bookNowLink.getAttribute('href');
    if (href) {
      await this.page.goto(href, { waitUntil: 'domcontentloaded' });
    } else {
      await this.bookNowLink.click({ noWaitAfter: true });
    }
    await this.page.waitForURL(/\/occupancy/, { timeout: 90_000 });
    return this;
  }
}
