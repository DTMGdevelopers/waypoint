import { Page } from '@playwright/test';

export class CabinsPage {
  private readonly selectButtons = this.page.getByRole('button', { name: 'Select' });
  private readonly continueLink = this.page.getByRole('link', { name: 'Continue' }).first();

  constructor(private readonly page: Page) {}

  async waitForLoad() {
    await this.page.waitForURL(/\/cabins\//);
    await this.page.waitForLoadState('domcontentloaded');
    return this;
  }

  async selectFirstCabin() {
    const selectCount = await this.selectButtons.count();
    if (selectCount > 0) {
      await this.selectButtons.first().click({ noWaitAfter: true });
    } else {
      await this.continueLink.scrollIntoViewIfNeeded();
      await this.continueLink.click({ noWaitAfter: true });
    }
    await this.page.waitForURL(/\/passengers\//, { timeout: 90_000 });
    return this;
  }
}
