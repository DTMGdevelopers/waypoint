import { Page } from '@playwright/test';
import { SearchLocators, SearchFallbacks } from '../locators/search';
import { ResultsLocators, ResultsFallbacks } from '../locators/results';
import { resolve } from '../helpers/locatorResolver';

export class ResultsPage {
  private readonly resultLinks = resolve(this.page, SearchLocators.viewCruise)
    .or(this.page.getByRole('link', { name: /^(view|more) details$/i }));

  private readonly loadingOverlay = resolve(
    this.page,
    SearchLocators.searchResultsLoading,
    SearchFallbacks.searchResultsLoading,
  );

  constructor(private readonly page: Page) {}

  async waitForLoad(timeout = 180_000) {
    await this.resultLinks.first().waitFor({ state: 'visible', timeout });
    await this.loadingOverlay
      .waitFor({ state: 'hidden', timeout: 15_000 })
      .catch(() => {});
    return this;
  }

  async getResultCount(): Promise<number> {
    return this.resultLinks.count();
  }

  /** Returns all visible result card links. */
  async getProductCards() {
    return this.resultLinks.all();
  }

  async selectFirstResult() {
    const bookable = this.page.locator(SearchLocators.bookableWithPrice);
    const target = (await bookable.count() > 0) ? bookable : this.resultLinks;
    const href = await target.first().getAttribute('href').catch(() => null);
    if (href) {
      await this.page.goto(href, { waitUntil: 'domcontentloaded' });
    } else {
      await target.first().click({ noWaitAfter: true });
      await this.page.waitForLoadState('domcontentloaded');
    }
    return this;
  }

  /**
   * Applies a filter of the given type.
   * NOTE: data-cruiseappy attributes for filter controls are not yet implemented
   * (🔴 Needed). CSS fallbacks are used until themes are updated.
   */
  async filterBy(type: 'price' | 'duration' | 'category', value: string) {
    const fallback =
      type === 'price'    ? ResultsFallbacks.priceFilter :
      type === 'duration' ? ResultsFallbacks.durationFilter :
                            ResultsFallbacks.categoryFilter;
    const control = this.page.locator(fallback).first();
    if (type === 'category') {
      await control.getByText(value, { exact: false }).first().click();
    } else {
      await control.click().catch(() => {});
    }
    return this;
  }

  /**
   * Selects a sort option.
   * Handles both <select> and clickable button/link sort controls.
   */
  async sortBy(option: string) {
    const sortControl = this.page.locator(ResultsFallbacks.sortControl).first();
    const tag = await sortControl
      .evaluate((el) => el.tagName.toLowerCase())
      .catch(() => 'div');
    if (tag === 'select') {
      await sortControl.selectOption(option, { force: true });
    } else {
      await sortControl.getByText(option, { exact: false }).first().click();
    }
    return this;
  }

  /** Navigates to page n of results and waits for the new set to load. */
  async goToPage(n: number) {
    const paginator = this.page.locator(ResultsFallbacks.pagination);
    await paginator.getByText(String(n), { exact: true }).first().click();
    await this.waitForLoad();
    return this;
  }

  /** Returns the full "X cruises found" string from the results heading. */
  async getCruisesFoundText(): Promise<string> {
    const el = this.page.locator(ResultsLocators.totalResults).first();
    await el.waitFor({ state: 'visible', timeout: 15_000 });
    return (await el.innerText()).trim();
  }

  /** Parses and returns the numeric cruise count from "X cruises found". */
  async getCruisesFoundCount(): Promise<number> {
    const text = await this.getCruisesFoundText();
    const match = text.match(/([\d,]+)\s+cruises/i);
    return match ? parseInt(match[1]!.replace(/,/g, ''), 10) : 0;
  }

  /** Returns all product card container elements (.search-item). */
  async getCardContainers() {
    return this.page.locator(ResultsLocators.productCard).all();
  }

  /** Returns true if the "Load more" / infinite-scroll button is visible. */
  async isLoadMoreVisible(): Promise<boolean> {
    return this.page.locator(ResultsLocators.loadMoreButton).isVisible().catch(() => false);
  }

  /**
   * Clicks "Load more" and waits for at least one additional card to appear.
   * Resolves once the card at index `countBefore` becomes visible.
   */
  async clickLoadMore() {
    const countBefore = await this.page.locator(ResultsLocators.productCard).count();
    await this.page.locator(ResultsLocators.loadMoreButton).click();
    await this.page.locator(ResultsLocators.productCard)
      .nth(countBefore)
      .waitFor({ state: 'visible', timeout: 30_000 });
    return this;
  }

  /**
   * Clicks a filter item in the left-hand filter panel and waits for results to refresh.
   * @param dataFilter  The section's data-filter value (e.g. 'regions', 'cruiselines', 'durations')
   * @param labelText   Visible text of the option to click (e.g. 'Mediterranean', 'MSC Cruises')
   */
  async clickFilterItem(dataFilter: string, labelText: string) {
    const section = this.page.locator(`[data-filter="${dataFilter}"]`);
    await section.getByText(labelText, { exact: true }).first().click();
    // Brief grace period for the AJAX filter response
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});
    return this;
  }
}
