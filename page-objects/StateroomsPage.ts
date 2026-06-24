import { Page } from '@playwright/test';

export class StateroomsPage {
  // data-cruiseappy="booking_staterooms" is the stable plugin attribute for the Continue CTA.
  // Note: the Latvia theme sets data-href (not href) on this element — continue() handles both.
  private readonly continueLink = this.page
    .locator('[data-cruiseappy="booking_staterooms"]')
    .or(this.page.getByRole('link', { name: /continue/i }))
    .first();
  private readonly selectButtons = this.page.getByRole('button', { name: 'Select' });

  constructor(private readonly page: Page) {}

  async waitForLoad() {
    await this.page.waitForLoadState('domcontentloaded');
    // Dev site has no "Staterooms" section heading — wait for the Continue link which
    // appears only once all cabin options have rendered.
    await this.continueLink.waitFor({ state: 'visible', timeout: 90_000 });
    return this;
  }

  async getCabinCount(): Promise<number> {
    return this.selectButtons.count();
  }

  async continue() {
    // Try href first, then data-href (Latvia theme stores the URL in data-href, not href).
    const href = await this.continueLink.getAttribute('href')
      ?? await this.continueLink.getAttribute('data-href');
    if (href) {
      await this.page.goto(href, { waitUntil: 'domcontentloaded' });
    } else {
      await this.continueLink.scrollIntoViewIfNeeded();
      await this.continueLink.click({ noWaitAfter: true });
    }
    // "Sail Away" guarantee staterooms skip /cabins/ and go straight to /passengers/.
    await this.page.waitForURL(/\/(cabins|passengers)\//, { timeout: 90_000 });
    return this;
  }
}
