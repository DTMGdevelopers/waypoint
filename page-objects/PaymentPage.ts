import { Page } from '@playwright/test';

export class PaymentPage {
  private readonly pageHeading = this.page.getByRole('heading').first();

  constructor(private readonly page: Page) {}

  async waitForLoad() {
    await this.page.waitForLoadState('domcontentloaded');
    return this;
  }

  async isLoaded(): Promise<boolean> {
    return this.page.url().includes('/payment');
  }

  async getPageUrl(): Promise<string> {
    return this.page.url();
  }
}
