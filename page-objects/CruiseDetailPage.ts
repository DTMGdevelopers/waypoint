import { Page } from '@playwright/test';

export class CruiseDetailPage {
  // Desktop: primary CTA (hidden on mobile via CSS)
  private readonly bookNowCta = this.page.locator('a.book-now-cta');
  // Mobile: sticky footer "Book Now" link (capital N — distinguishes it from the
  // stateroom-specific "Book now" links in the page body)
  private readonly stickyBookNow = this.page.getByRole('link', { name: 'Book Now', exact: true });
  private readonly cruiseName = this.page.getByRole('heading', { level: 1 });

  constructor(private readonly page: Page) {}

  async waitForLoad() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.cruiseName.waitFor({ state: 'visible', timeout: 30_000 });
    return this;
  }

  async getCruiseName(): Promise<string> {
    return (await this.cruiseName.textContent()) ?? '';
  }

  async bookNow() {
    const isMobile = (this.page.viewportSize()?.width ?? 1280) < 768;
    const link = isMobile ? this.stickyBookNow : this.bookNowCta;
    await link.click({ noWaitAfter: true });
    await this.page.waitForURL(/\/occupancy/, { timeout: 90_000 });
    return this;
  }
}
