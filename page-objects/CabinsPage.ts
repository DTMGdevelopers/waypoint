import { Page } from '@playwright/test';

export class CabinsPage {
  private readonly selectButtons = this.page.getByRole('button', { name: 'Select' });
  // data-cruiseappy="booking_deck_room" is a <button type="submit"> in the Latvia theme.
  // Fall back to Continue link/button for older sites.
  private readonly continueBtn = this.page
    .locator('[data-cruiseappy="booking_deck_room"]')
    .or(this.page.getByRole('button', { name: /continue/i }))
    .or(this.page.getByRole('link', { name: /continue/i }))
    .first();

  constructor(private readonly page: Page) {}

  async waitForLoad() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.continueBtn.waitFor({ state: 'visible', timeout: 30_000 });
    return this;
  }

  async selectFirstCabin() {
    const selectCount = await this.selectButtons.count();
    if (selectCount > 0) {
      await this.selectButtons.first().click({ noWaitAfter: true });
    } else {
      await this.continueBtn.scrollIntoViewIfNeeded();
      await this.continueBtn.click({ noWaitAfter: true });
    }
    await this.page.locator('[data-cruiseappy="booking_passengers"]')
      .or(this.page.locator('input[type="text"], input[type="email"]').first())
      .first()
      .waitFor({ state: 'visible', timeout: 90_000 });
    return this;
  }
}
