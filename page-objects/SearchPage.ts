import { Page } from '@playwright/test';
import { futureDateISO } from '../helpers/testData';

// Rolling 31-day window starting 3 months from today — always bookable,
// never needs manual updating as dates pass.
function searchUrl(): string {
  const start = futureDateISO(90);
  const end   = futureDateISO(121);
  return `/search/?sort=date&order=asc&startdate=${start}&enddate=${end}&price=0%2C50000%2B`;
}

export class SearchPage {
  // Prod uses "View details"; dev uses "More details" — match both to work across environments.
  private readonly resultLinks = this.page.getByRole('link', { name: /^(view|more) details$/i });

  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto(searchUrl());
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
    // Navigate directly to the first cruise detail page rather than clicking a link.
    // Some sites wrap result cards in a full-card overlay that intercepts pointer events
    // on child elements, making clicks unreliable. Extracting the href is equivalent.
    const cruiseLink = this.page.locator('main a[href*="/cruises/"]').first();
    const hasCruiseLink = await cruiseLink.isVisible().catch(() => false);

    if (hasCruiseLink) {
      const href = await cruiseLink.getAttribute('href');
      await this.page.goto(href!, { waitUntil: 'domcontentloaded' });
    } else {
      await this.resultLinks.first().click({ noWaitAfter: true });
      await this.page.waitForURL(/\/cruises\//, { timeout: 90_000 });
    }
    return this;
  }

  async getResultCount(): Promise<number> {
    return this.resultLinks.count();
  }
}
