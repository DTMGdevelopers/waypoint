import { Page, Locator } from '@playwright/test';
import { futureDateISO } from '../helpers/testData';
import { SearchLocators, SearchFallbacks } from '../locators/search';
import { resolve } from '../helpers/locatorResolver';

export class SearchPage {
  private readonly resultLinks = resolve(this.page, SearchLocators.viewCruise)
    .or(this.page.getByRole('link', { name: /^(view|more) details$/i }));

  constructor(private readonly page: Page) {}

  /**
   * Opens a custom dropdown trigger and clicks the matching checkbox option.
   * The search form uses bespoke <div> dropdowns containing <label>+<input type="checkbox">
   * pairs rather than native <select> elements.
   *
   * Only clicks the trigger if the dropdown is not already open. This handles themes
   * where date and duration share a single combined control — the second call (e.g.
   * selectDuration after selectDates) must not re-click the trigger and inadvertently
   * close the panel before the option is selected.
   *
   * @param trigger  The .search-form-item div that opens the dropdown on click
   * @param inputName  The checkbox name attribute (e.g. 'region', 'cruiseline')
   * @param value  The exact checkbox value to select (must match the API-provided value)
   */
  private async openDropdownAndSelect(trigger: Locator, inputName: string, value: string): Promise<void> {
    const isOpen = await trigger.locator(SearchLocators.searchDropdownPanel).isVisible().catch(() => false);
    if (!isOpen) {
      await trigger.click();
    }
    const option = this.page
      .locator(`label:has(input[name="${inputName}"][value="${value}"])`)
      .first();
    await option.waitFor({ state: 'visible', timeout: 5_000 });
    await option.click();
  }

  async goto() {
    // Discover the search URL from the homepage rather than hardcoding a path.
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
    const searchAnchor = this.page.locator(SearchLocators.searchCta).first();
    const searchHref = await searchAnchor.getAttribute('href').catch(() => null)
      ?? '/search/';

    // Append rolling 3-month date window. searchHref may already carry query params.
    const start = futureDateISO(90);
    const end   = futureDateISO(121);
    const sep = searchHref.includes('?') ? '&' : '?';
    await this.page.goto(`${searchHref}${sep}startdate=${start}&enddate=${end}`, {
      waitUntil: 'domcontentloaded',
    });
    return this;
  }

  async waitForResults() {
    // 180s — the search page is AJAX-rendered on a WordPress stack that can spike
    // well past 120s under server load.
    await this.resultLinks.first().waitFor({ state: 'visible', timeout: 180_000 });
    await resolve(this.page, SearchLocators.searchResultsLoading, SearchFallbacks.searchResultsLoading)
      .waitFor({ state: 'hidden', timeout: 15_000 })
      .catch(() => {});
    return this;
  }

  async selectFirstResult() {
    const bookable = this.page.locator(SearchLocators.bookableWithPrice);
    const target = (await bookable.count() > 0) ? bookable : this.resultLinks;

    const href = await target.first().getAttribute('href').catch(() => null);
    if (href) {
      await this.page.goto(href, { waitUntil: 'domcontentloaded' });
    } else {
      await target.first().click();
      await this.page.waitForLoadState('domcontentloaded');
    }
    return this;
  }

  /** Select a destination / region in the search form. Value must match the API title (e.g. 'Mediterranean'). */
  async selectDestination(value: string): Promise<this> {
    await this.openDropdownAndSelect(
      resolve(this.page, SearchLocators.searchDestination, SearchFallbacks.searchDestination),
      'region',
      value,
    );
    return this;
  }

  /** Select a cruise line in the search form. Value must match the API title (e.g. 'Norwegian Cruise Line'). */
  async selectCruiseLine(value: string): Promise<this> {
    await this.openDropdownAndSelect(
      resolve(this.page, SearchLocators.searchCruiseLine, SearchFallbacks.searchCruiseLine),
      'cruiseline',
      value,
    );
    return this;
  }

  /** Select a duration band in the search form. Value must match the API duration key (e.g. '7-7'). */
  async selectDuration(value: string): Promise<this> {
    await this.openDropdownAndSelect(
      resolve(this.page, SearchLocators.searchDuration, SearchFallbacks.searchDuration),
      'duration',
      value,
    );
    return this;
  }

  /** Select a departure port in the search form. Value must match the API title (e.g. 'Southampton'). */
  async selectPort(value: string): Promise<this> {
    await this.openDropdownAndSelect(
      resolve(this.page, SearchLocators.searchPort, SearchFallbacks.searchPort),
      'departport',
      value,
    );
    return this;
  }

  /** Click the Search CTA to submit the form and wait for the results page to load. */
  async submitSearch(): Promise<this> {
    await resolve(this.page, SearchLocators.searchCta).click();
    await this.page.waitForLoadState('domcontentloaded');
    return this;
  }

  async getResultCount(): Promise<number> {
    return this.resultLinks.count();
  }
}
