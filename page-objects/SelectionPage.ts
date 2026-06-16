import { Page } from '@playwright/test';

export class SelectionPage {
  private readonly pricingBreakdown = this.page.getByTestId('pricing-breakdown');
  private readonly cabinCards = this.page.locator('[data-testid="cabin-card"]');
  private readonly continueButton = this.page.getByRole('button', { name: /continue|book now/i });
  private readonly availabilityWarning = this.page.getByTestId('availability-warning');

  constructor(private readonly page: Page) {}

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.pricingBreakdown.waitFor({ state: 'visible' });
    return this;
  }

  async selectCabin(index = 0) {
    await this.cabinCards.nth(index).getByRole('button', { name: /select/i }).click();
    return this;
  }

  async selectFirstAvailableCabin() {
    const cards = this.cabinCards;
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const isSoldOut = await card.locator('[data-testid="sold-out"]').isVisible();
      if (!isSoldOut) {
        await card.getByRole('button', { name: /select/i }).click();
        return this;
      }
    }
    throw new Error('No available cabins found on SelectionPage');
  }

  async continue() {
    await this.continueButton.click();
    await this.page.waitForURL(/\/passengers/);
    return this;
  }

  async hasAvailabilityWarning(): Promise<boolean> {
    return this.availabilityWarning.isVisible();
  }

  async getPricingBreakdown() {
    return this.pricingBreakdown.textContent();
  }
}
