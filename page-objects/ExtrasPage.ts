import { Page } from '@playwright/test';

export class ExtrasPage {
  private readonly insuranceToggle = this.page.getByRole('checkbox', { name: /insurance/i });
  private readonly transferOptions = this.page.locator('[data-testid="transfer-option"]');
  private readonly totalPrice = this.page.getByTestId('total-price');
  private readonly continueButton = this.page.getByRole('button', { name: /continue|next/i });
  private readonly skipButton = this.page.getByRole('button', { name: /skip|no thanks/i });

  constructor(private readonly page: Page) {}

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
    return this;
  }

  async toggleInsurance() {
    await this.insuranceToggle.click();
    await this.page.waitForLoadState('networkidle');
    return this;
  }

  async isInsuranceSelected(): Promise<boolean> {
    return this.insuranceToggle.isChecked();
  }

  async selectTransfer(label: string) {
    await this.transferOptions.filter({ hasText: label }).getByRole('button', { name: /select/i }).click();
    await this.page.waitForLoadState('networkidle');
    return this;
  }

  async getTotalPrice(): Promise<string> {
    return (await this.totalPrice.textContent()) ?? '';
  }

  async continue() {
    await this.continueButton.click();
    await this.page.waitForURL(/\/review/);
    return this;
  }

  async skipAll() {
    const skipVisible = await this.skipButton.isVisible();
    if (skipVisible) {
      await this.skipButton.click();
    } else {
      await this.continue();
    }
    await this.page.waitForURL(/\/review/);
    return this;
  }
}
