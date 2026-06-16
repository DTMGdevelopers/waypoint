import { Page, Locator } from '@playwright/test';

export class ResultsPage {
  private readonly resultCards = this.page.locator('[data-testid="result-card"]');
  private readonly priceFilter = this.page.getByRole('combobox', { name: /sort by price/i });
  private readonly durationFilter = this.page.getByRole('combobox', { name: /duration/i });
  private readonly categoryFilter = this.page.getByRole('combobox', { name: /category/i });
  private readonly resultsCount = this.page.getByTestId('results-count');

  constructor(private readonly page: Page) {}

  async waitForResults() {
    await this.page.waitForLoadState('networkidle');
    await this.resultCards.first().waitFor({ state: 'visible' });
    return this;
  }

  getResultCards(): Locator {
    return this.resultCards;
  }

  async filterByPrice(order: 'asc' | 'desc') {
    await this.priceFilter.selectOption(order === 'asc' ? 'price-asc' : 'price-desc');
    await this.page.waitForLoadState('networkidle');
    return this;
  }

  async filterByDuration(value: string) {
    await this.durationFilter.selectOption(value);
    await this.page.waitForLoadState('networkidle');
    return this;
  }

  async filterByCategory(value: string) {
    await this.categoryFilter.selectOption(value);
    await this.page.waitForLoadState('networkidle');
    return this;
  }

  async selectFirstResult() {
    await this.resultCards.first().getByRole('link', { name: /view|select|book/i }).click();
    await this.page.waitForURL(/\/(cruise|product|detail)\//);
    return this;
  }

  async getResultCount(): Promise<number> {
    const text = await this.resultsCount.textContent();
    const match = text?.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }
}
