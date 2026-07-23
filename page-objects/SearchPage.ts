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
    const option = this.page
      .locator(`label:has(input[name="${inputName}"][value="${value}"])`)
      .first();
    // Check whether the target option is already visible (dropdown may already be open).
    // We test the option directly rather than the panel — the panel can have a non-zero
    // bounding box even when closed (border/padding), causing isVisible() to return true
    // when the items are still hidden inside an animating inner container.
    const isOptionVisible = await option.isVisible().catch(() => false);
    if (!isOptionVisible) {
      await trigger.click();
      await option.waitFor({ state: 'visible', timeout: 10_000 });
    }
    await option.click();
  }

  /**
   * Opens a custom dropdown and selects the Nth visible checkbox option, returning its value.
   * Used for data-driven tests that avoid hardcoding inventory-specific values.
   *
   * @param trigger   The .search-form-item div that opens the dropdown on click
   * @param inputName The checkbox name attribute (e.g. 'region', 'cruiseline')
   * @param index     0-based index of the option to select (default: 0 = first)
   */
  private async openDropdownAndSelectNth(trigger: Locator, inputName: string, index = 0): Promise<string> {
    // Exclude items hidden by the AJAX cross-filter (Bootstrap d-none class) so we always
    // resolve to an option that is actually available when the dropdown opens.
    const options = this.page.locator(`label:has(input[name="${inputName}"]):not(.d-none)`);
    const isFirstVisible = await options.first().isVisible().catch(() => false);
    if (!isFirstVisible) {
      await trigger.click();
      // If another dropdown was active, the first click may only close it without
      // opening this one. Wait briefly and click again if options are still hidden.
      const nowVisible = await options.first()
        .waitFor({ state: 'visible', timeout: 1_000 })
        .then(() => true)
        .catch(() => false);
      if (!nowVisible) {
        await trigger.click();
      }
      await options.first().waitFor({ state: 'visible', timeout: 10_000 });
    }
    const option = options.nth(index);
    const value = (await option.locator(`input[name="${inputName}"]`).getAttribute('value')) ?? '';
    await option.click();
    return value;
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

  /** Opens the Destination dropdown and selects the first available option. Returns the selected value. */
  async selectFirstDestination(): Promise<string> {
    return this.openDropdownAndSelectNth(
      resolve(this.page, SearchLocators.searchDestination, SearchFallbacks.searchDestination),
      'region',
    );
  }

  /** Opens the Destination dropdown and selects the second available option. Returns the selected value. */
  async selectSecondDestination(): Promise<string> {
    return this.openDropdownAndSelectNth(
      resolve(this.page, SearchLocators.searchDestination, SearchFallbacks.searchDestination),
      'region',
      1,
    );
  }

  /** Opens the Cruise Line dropdown and selects the first available option. Returns the selected value. */
  async selectFirstCruiseLine(): Promise<string> {
    return this.openDropdownAndSelectNth(
      resolve(this.page, SearchLocators.searchCruiseLine, SearchFallbacks.searchCruiseLine),
      'cruiseline',
    );
  }

  /** Opens the Departure Port dropdown and selects the first available option. Returns the selected value. */
  async selectFirstPort(): Promise<string> {
    return this.openDropdownAndSelectNth(
      resolve(this.page, SearchLocators.searchPort, SearchFallbacks.searchPort),
      'departport',
    );
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

  /** Navigate to the homepage where the search form is visible. */
  async gotoHome(): Promise<this> {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
    return this;
  }

  /** Returns the visible text of the search CTA (e.g. "Search" or "10,272 cruises"). */
  async getSearchButtonText(): Promise<string> {
    return (await resolve(this.page, SearchLocators.searchCta).first().innerText()).trim();
  }

  /** Returns the href attribute of the search CTA. */
  async getSearchButtonHref(): Promise<string | null> {
    return resolve(this.page, SearchLocators.searchCta).first().getAttribute('href');
  }

  /**
   * Opens the Departure Date calendar and clicks a month label by its ISO start date.
   * Past months are rendered as disabled labels without a checkbox — this method only
   * targets future (enabled) months.
   *
   * @param isoDate  First day of the target month, e.g. '2027-01-01'
   */
  async selectMonth(isoDate: string): Promise<this> {
    const trigger = resolve(this.page, SearchLocators.searchDates, SearchFallbacks.searchDates);
    const monthLabel = this.page.locator(`label[for="sf_date_${isoDate}"]`);
    // Check whether the target month is already visible (calendar may already be open).
    // Checking the month label directly is more reliable than checking the calendar panel
    // because the panel's bounding box may be non-zero even when its content is still
    // hidden inside an animating container.
    const isMonthVisible = await monthLabel.isVisible().catch(() => false);
    if (!isMonthVisible) {
      await trigger.click();
      await monthLabel.waitFor({ state: 'visible', timeout: 10_000 });
    }
    await monthLabel.click();
    return this;
  }
}
