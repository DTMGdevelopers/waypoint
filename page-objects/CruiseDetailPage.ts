import { Page } from '@playwright/test';
import { BookingLocators, BookingFallbacks } from '../locators/booking';
import { resolve } from '../helpers/locatorResolver';

export class CruiseDetailPage {
  private readonly bookNowLink = resolve(
    this.page,
    BookingLocators.bookCruise,
    BookingFallbacks.bookCruise,
  ).first();
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
    await resolve(this.page, BookingLocators.occupancyContinue)
      .or(this.page.getByRole('link', { name: /continue/i }))
      .first()
      .waitFor({ state: 'visible', timeout: 90_000 });
    return this;
  }
}
