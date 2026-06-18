import { Page } from '@playwright/test';

export class CruiseDetailPage {
  // Desktop: primary CTA. century-cypress uses .book-now-cta; visioncruise uses .booking-button.
  private readonly desktopBookNow = this.page.locator('a.book-now-cta, a.booking-button').first();
  // Mobile: sticky footer "Book Now" link (capital N — distinguishes it from the
  // stateroom-specific "Book now" links in the page body)
  private readonly mobileBookNow = this.page.getByRole('link', { name: 'Book Now', exact: true });
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

  getBookNowCta(isMobile: boolean) {
    return isMobile ? this.mobileBookNow : this.desktopBookNow;
  }

  async bookNow() {
    const isMobile = (this.page.viewportSize()?.width ?? 1280) < 768;
    const link = this.getBookNowCta(isMobile);
    // Extract href and navigate directly — some sites have card overlays or sticky
    // banners that intercept pointer events on the CTA even when it's visible.
    const href = await link.getAttribute('href');
    if (href) {
      await this.page.goto(href, { waitUntil: 'domcontentloaded' });
    } else {
      await link.click({ noWaitAfter: true });
    }
    await this.page.waitForURL(/\/occupancy/, { timeout: 90_000 });
    return this;
  }
}
