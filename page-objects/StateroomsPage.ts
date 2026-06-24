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
    // The booking_staterooms link starts with only data-href; the page JS sets href
    // after its AJAX response + 100ms setTimeout auto-selects a stateroom grade.
    // Navigating before that fires means we get the bare base URL (no resultno/gradeno),
    // and the server rejects the booking. Wait up to 30s for href to appear.
    await this.page.waitForFunction(() => {
      const el = document.querySelector('[data-cruiseappy="booking_staterooms"]');
      return !!(el as HTMLAnchorElement)?.href;
    }, { timeout: 30_000 }).catch(() => null);

    // Try href first (JS-populated with grade params), then data-href (older sites).
    const href = await this.continueLink.getAttribute('href')
      ?? await this.continueLink.getAttribute('data-href');
    if (href) {
      await this.page.goto(href, { waitUntil: 'domcontentloaded' });
    } else {
      await this.continueLink.scrollIntoViewIfNeeded();
      await this.continueLink.click({ noWaitAfter: true });
    }
    // booking_deck_room = cabins step; booking_passengers = "Sail Away" skips cabins.
    await this.page.locator('[data-cruiseappy="booking_deck_room"], [data-cruiseappy="booking_passengers"]')
      .or(this.page.locator('input[type="text"], input[type="email"]').first())
      .first()
      .waitFor({ state: 'visible', timeout: 90_000 });
    return this;
  }
}
