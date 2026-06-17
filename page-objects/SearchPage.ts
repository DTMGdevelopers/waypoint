import { Page } from '@playwright/test';

// Narrowed to a single month to keep the result set small (<300 cruises vs 8000+),
// which makes the AJAX render fast enough for reliable test timing.
// Update dates when sailings in this window sell out.
export const SEARCH_URL =
  '/search/?sort=date&order=asc&startdate=2026-08-01&enddate=2026-08-31&price=0%2C50000%2B';

export class SearchPage {
  // Prod uses "View details"; dev uses "More details" — match both to work across environments.
  private readonly resultLinks = this.page.getByRole('link', { name: /^(view|more) details$/i });

  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto(SEARCH_URL);
    await this.page.waitForLoadState('domcontentloaded');
    return this;
  }

  async waitForResults() {
    // 180s — the search page is AJAX-rendered on a WordPress stack that can spike
    // well past 120s under server load. Raise to 180s to survive those spikes.
    await this.resultLinks.first().waitFor({ state: 'visible', timeout: 180_000 });
    // Some themes show a loading overlay after results render that blocks clicks.
    // Wait for it to disappear before returning control to the caller.
    await this.page
      .locator('#search-loading-overlay.is-visible')
      .waitFor({ state: 'hidden', timeout: 15_000 })
      .catch(() => {});
    return this;
  }

  async selectFirstResult() {
    // Look for any visible link to /cruises/ within the main content area.
    // Specials (/specials/) are excluded — they use a different booking flow.
    // Falls back to the first result link if no cruise link is found.
    const cruiseLink = this.page.locator('main a[href*="/cruises/"]').first();
    const hasCruiseLink = await cruiseLink.isVisible().catch(() => false);
    const link = hasCruiseLink ? cruiseLink : this.resultLinks.first();
    await link.click({ noWaitAfter: true });
    await this.page.waitForURL(/\/cruises\//, { timeout: 90_000 });
    return this;
  }

  async getResultCount(): Promise<number> {
    return this.resultLinks.count();
  }
}
