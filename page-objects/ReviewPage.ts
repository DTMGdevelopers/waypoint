import { Page } from '@playwright/test';

export class ReviewPage {
  private readonly passengerSummary = this.page.getByTestId('passenger-summary');
  private readonly priceSummary = this.page.getByTestId('price-summary');
  private readonly totalPrice = this.page.getByTestId('total-price');
  private readonly tcCheckbox = this.page.getByRole('checkbox', { name: /terms/i });
  private readonly proceedButton = this.page.getByRole('button', { name: /proceed to payment/i });

  constructor(private readonly page: Page) {}

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.passengerSummary.waitFor({ state: 'visible' });
    return this;
  }

  async getPassengerSummary(): Promise<string> {
    return (await this.passengerSummary.textContent()) ?? '';
  }

  async getTotalPrice(): Promise<string> {
    return (await this.totalPrice.textContent()) ?? '';
  }

  async acceptTerms() {
    await this.tcCheckbox.check();
    return this;
  }

  async isProceedButtonEnabled(): Promise<boolean> {
    return this.proceedButton.isEnabled();
  }

  async proceedToPayment() {
    await this.proceedButton.click();
    return this;
  }
}
