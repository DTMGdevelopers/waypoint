import { Page } from '@playwright/test';
import { futureDateISO } from '../helpers/testData';
import { SearchLocators, SearchFallbacks } from '../locators/search';
import { resolve } from '../helpers/locatorResolver';

export class SearchPage {
  private readonly resultLinks = resolve(this.page, SearchLocators.viewCruise)
    .or(this.page.getByRole('link', { name: /^(view|more) details$/i }));

  constructor(private readonly page: Page) {}

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

  async getResultCount(): Promise<number> {
    return this.resultLinks.count();
  }
}
