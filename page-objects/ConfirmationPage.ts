import { Page, expect } from '@playwright/test';
import { BookingLocators } from '../locators/booking';

/**
 * Scaffold: booking_reference attribute is planned (🔵) and not yet implemented
 * on any theme. Tests that use this page object must be wrapped with test.skip
 * until the attribute ships.
 *
 * See CRUISEAPPY_ATTRIBUTES.md — "Planned — add before building these steps".
 */
export class ConfirmationPage {
  private readonly bookingRef = this.page.locator(BookingLocators.bookingReference);

  constructor(private readonly page: Page) {}

  async waitForLoad() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.bookingRef.waitFor({ state: 'visible', timeout: 30_000 });
    return this;
  }

  async getBookingReference(): Promise<string> {
    return (await this.bookingRef.textContent()) ?? '';
  }

  async assertBookingVisible() {
    await expect(this.bookingRef).toBeVisible();
    const ref = await this.getBookingReference();
    expect(ref.trim(), 'Booking reference should not be empty').not.toBe('');
  }
}
