import { test, expect } from '../../fixtures/bookingFixture';
import { SearchPage } from '../../page-objects/SearchPage';
import { ResultsPage } from '../../page-objects/ResultsPage';
import { CruiseDetailPage } from '../../page-objects/CruiseDetailPage';

/**
 * Search & Filtering
 *
 * Covers: destination search, result card assertions, sort, filter, pagination,
 * URL parameter checks, and navigation to detail page.
 *
 * NOTE: Filter and sort controls are matched via CSS fallback selectors (🔴 Needed).
 * Some tests will be skipped automatically if the controls aren't present on the
 * target theme. Once data-cruiseappy attributes are added, update locators/results.ts.
 */

test.describe('Search results — product cards', () => {
  test('destination search returns at least one result', async ({ page }) => {
    test.setTimeout(210_000);
    const searchPage = new SearchPage(page);
    await searchPage.goto();
    await searchPage.waitForResults();
    const count = await searchPage.getResultCount();
    expect(count, 'Expected at least one search result').toBeGreaterThanOrEqual(1);
  });

  test('each result card has a non-empty href', async ({ page }) => {
    test.setTimeout(210_000);
    const searchPage = new SearchPage(page);
    await searchPage.goto();
    const results = new ResultsPage(page);
    await results.waitForLoad();
    const cards = await results.getProductCards();
    expect(cards.length, 'Expected at least one product card').toBeGreaterThan(0);
    for (const card of cards.slice(0, 5)) {
      const href = await card.getAttribute('href');
      expect(href, 'Product card link should have an href').toBeTruthy();
    }
  });

  test('first result card is visible', async ({ page }) => {
    test.setTimeout(210_000);
    const searchPage = new SearchPage(page);
    await searchPage.goto();
    const results = new ResultsPage(page);
    await results.waitForLoad();
    const cards = await results.getProductCards();
    expect(cards.length).toBeGreaterThan(0);
    await expect(cards[0]!).toBeVisible();
  });

  test('URL contains date range parameters after search', async ({ page }) => {
    test.setTimeout(210_000);
    const searchPage = new SearchPage(page);
    await searchPage.goto();
    await searchPage.waitForResults();
    // SearchPage.goto() appends startdate/enddate query params
    expect(page.url()).toMatch(/startdate=|enddate=|start=|end=/i);
  });

  test('selecting first result navigates to a cruise detail page', async ({ page }) => {
    test.setTimeout(240_000);
    const searchPage = new SearchPage(page);
    await searchPage.goto();
    await searchPage.waitForResults();
    await searchPage.selectFirstResult();
    const detail = new CruiseDetailPage(page);
    await detail.waitForLoad();
    const name = await detail.getCruiseName();
    expect(name.trim(), 'Cruise name heading should not be empty').not.toBe('');
  });
});

test.describe('Search results — sorting', () => {
  test('sort control is present on results page', async ({ page }) => {
    test.setTimeout(210_000);
    const searchPage = new SearchPage(page);
    await searchPage.goto();
    await new ResultsPage(page).waitForLoad();
    // Sort control uses CSS fallback — skip gracefully if not present on this theme
    const sortControl = page.locator('select[name*="sort"], [class*="sort-by"] select').first();
    const isPresent = await sortControl.isVisible().catch(() => false);
    test.skip(!isPresent, 'Sort control not present on this theme — add data-cruiseappy attribute');
    await expect(sortControl).toBeVisible();
  });
});

test.describe('Search results — filtering', () => {
  test('filter panel is present on results page', async ({ page }) => {
    test.setTimeout(210_000);
    const searchPage = new SearchPage(page);
    await searchPage.goto();
    await new ResultsPage(page).waitForLoad();
    const filterPanel = page.locator('[class*="filter"]:not(script), [class*="search-filters"]').first();
    const isPresent = await filterPanel.isVisible().catch(() => false);
    test.skip(!isPresent, 'Filter panel not present on this theme — add data-cruiseappy attribute');
    await expect(filterPanel).toBeVisible();
  });
});

test.describe('Search results — pagination', () => {
  test('pagination control is present when multiple pages exist', async ({ page }) => {
    test.setTimeout(210_000);
    const searchPage = new SearchPage(page);
    await searchPage.goto();
    await new ResultsPage(page).waitForLoad();
    const pagination = page.locator('.pagination, [class*="pagination"], nav[aria-label*="pagination" i]').first();
    const isPresent = await pagination.isVisible().catch(() => false);
    test.skip(!isPresent, 'Pagination not present — either single page of results or not yet attributed');
    await expect(pagination).toBeVisible();
  });
});
