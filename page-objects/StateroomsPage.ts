import { Page } from '@playwright/test';
import { BookingLocators } from '../locators/booking';
import { resolve } from '../helpers/locatorResolver';

export class StateroomsPage {
  private readonly continueLink = resolve(this.page, BookingLocators.stateroomsContinue)
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
    await this.page
      .locator(`${BookingLocators.cabinsSubmit}, ${BookingLocators.passengersSubmit}`)
      .or(this.page.locator('input[type="text"], input[type="email"]').first())
      .first()
      .waitFor({ state: 'visible', timeout: 90_000 });
    return this;
  }
}
