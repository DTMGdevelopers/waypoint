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

    // Re-wait for visibility — on CLL the stateroom grid re-renders via AJAX
    // during the href wait, which can temporarily hide the continue element.
    // Note: getAttribute() works regardless of visibility, so we don't need to
    // wait here — visibility is only required if we fall through to click().

    // Try href first (JS-populated with grade params), then data-href (older sites).
    const href = await this.continueLink.getAttribute('href')
      ?? await this.continueLink.getAttribute('data-href');
    if (href) {
      await this.page.goto(href, { waitUntil: 'domcontentloaded' });
    } else {
      // Non-anchor themes (e.g. CLL uses a <span> with a click handler).
      // Only wait for visibility here — clicking requires the element to be interactable.
      await this.continueLink.waitFor({ state: 'visible', timeout: 30_000 });
      // click() handles scroll-into-view automatically.
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
