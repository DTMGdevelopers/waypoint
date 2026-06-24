import { Page } from '@playwright/test';
import { futureDateISO } from '../helpers/testData';

export class SearchPage {
  // data-cruiseappy="view_cruise" is set on AJAX-rendered result card links (Latvia theme and newer).
  // Fall back to role+text for older sites (visioncruise, century-cypress) where the attribute is absent.
  private readonly resultLinks = this.page
    .locator('[data-cruiseappy="view_cruise"]')
    .or(this.page.getByRole('link', { name: /^(view|more) details$/i }));

  constructor(private readonly page: Page) {}

  async goto() {
    // Discover the search URL from the homepage rather than hardcoding a path.
    // data-cruiseappy="search" is present on every site's search CTA regardless
    // of language or URL structure (e.g. /search/ vs /lv/meklesana/).
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
    const searchAnchor = this.page.locator('[data-cruiseappy="search"]').first();
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
    // well past 120s under server load. Raise to 180s to survive those spikes.
    await this.resultLinks.first().waitFor({ state: 'visible', timeout: 180_000 });
    // Some themes show a loading overlay after results render that blocks clicks.
    // data-cruiseappy="search_results_loading" is the stable hook; fall back to
    // the CSS-class selector for sites not yet updated.
    await this.page
      .locator('[data-cruiseappy="search_results_loading"], #search-loading-overlay.is-visible')
      .waitFor({ state: 'hidden', timeout: 15_000 })
      .catch(() => {});
    return this;
  }

  async selectFirstResult() {
    // Read the href directly from the result link — data-cruiseappy="view_cruise"
    // always carries the correct URL regardless of language or URL structure
    // (e.g. /lv/kruizi/ vs /cruises/). Navigating by href avoids click-interception
    // issues from full-card overlays on some themes.
    const href = await this.resultLinks.first().getAttribute('href').catch(() => null);
    if (href) {
      await this.page.goto(href, { waitUntil: 'domcontentloaded' });
    } else {
      await this.resultLinks.first().click({ noWaitAfter: true });
      await this.page.waitForLoadState('domcontentloaded');
    }
    return this;
  }

  async getResultCount(): Promise<number> {
    return this.resultLinks.count();
  }
}
