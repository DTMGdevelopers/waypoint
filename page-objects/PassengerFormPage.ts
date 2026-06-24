import { Page } from '@playwright/test';

export class PassengerFormPage {
  constructor(private readonly page: Page) {}

  async waitForLoad() {
    await this.page.waitForLoadState('domcontentloaded');
    // data-cruiseappy="booking_passengers" is the form submit button — visible only once
    // the passenger form has fully rendered. Fall back to any text/email input for older sites.
    await this.page
      .locator('[data-cruiseappy="booking_passengers"]')
      .or(this.page.locator('input[type="text"], input[type="email"]').first())
      .first()
      .waitFor({ state: 'visible', timeout: 90_000 });
    return this;
  }

  async isLoaded(): Promise<boolean> {
    return this.page.url().includes('/passengers');
  }

  async getFieldCount(): Promise<number> {
    return this.page.locator('input[type="text"], input[type="email"], input[type="tel"], select').count();
  }
}
