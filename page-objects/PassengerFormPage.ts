import { Page } from '@playwright/test';

export class PassengerFormPage {
  constructor(private readonly page: Page) {}

  async waitForLoad() {
    await this.page.waitForLoadState('domcontentloaded');
    // Label wording varies by site/theme (First Name, Forename, Given Name…).
    // Wait for ANY visible text/email input instead of a specific label.
    // 90s matches the AJAX-heavy booking flow on slower WordPress stacks.
    await this.page
      .locator('input[type="text"], input[type="email"]')
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
