import { Page } from '@playwright/test';
import { BookingLocators } from '../locators/booking';
import { resolve } from '../helpers/locatorResolver';

export class StateroomsPage {
  private readonly continueLink = resolve(this.page, BookingLocators.stateroomsContinue)
    .or(this.page.getByRole('link', { name: /continue/i }))
    .first();

  constructor(private readonly page: Page) {}

  async waitForLoad() {
    await this.page.waitForLoadState('domcontentloaded');
    // Dev site has no "Staterooms" section heading — wait for the Continue link which
    // appears only once all cabin options have rendered.
    await this.continueLink.waitFor({ state: 'visible', timeout: 90_000 });
    return this;
  }

  async continue() {
    // Wait for the booking_staterooms href to be JS-populated after grade auto-selection.
    await this.page.waitForFunction(() => {
      const el = document.querySelector('[data-cruiseappy="booking_staterooms"]');
      return !!(el as HTMLAnchorElement)?.href;
    }, { timeout: 30_000 }).catch(() => null);

    // getAttribute() works regardless of visibility — no need to wait for visible here.
    const href = await this.continueLink.getAttribute('href')
      ?? await this.continueLink.getAttribute('data-href');
    if (href) {
      await this.page.goto(href, { waitUntil: 'domcontentloaded' });
    } else {
      // Non-anchor themes use a click handler — wait for visibility before clicking.
      await this.continueLink.waitFor({ state: 'visible', timeout: 30_000 });
      await this.continueLink.click();
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
