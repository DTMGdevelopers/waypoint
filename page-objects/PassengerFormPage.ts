import { Page } from '@playwright/test';

export class PassengerFormPage {
  private readonly firstNameInput = this.page.getByRole('textbox', { name: /first name/i });

  constructor(private readonly page: Page) {}

  async waitForLoad() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.firstNameInput.first().waitFor({ state: 'visible', timeout: 30_000 });
    return this;
  }

  async isLoaded(): Promise<boolean> {
    return this.page.url().includes('/passengers');
  }

  async getFieldCount(): Promise<number> {
    return this.page.locator('input[type="text"], input[type="email"], input[type="tel"], select').count();
  }
}
