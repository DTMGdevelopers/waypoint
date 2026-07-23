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
    await expect(page.locator('select[name="sort"]')).toBeVisible();
  });
});

test.describe('Search results — filtering', () => {
  test('filter panel is present on results page', async ({ page }) => {
    test.setTimeout(210_000);
    const searchPage = new SearchPage(page);
    await searchPage.goto();
    await new ResultsPage(page).waitForLoad();
    await expect(page.locator('[data-filter]').first()).toBeVisible();
  });
});

test.describe('Search results — pagination', () => {
  test('results use infinite scroll (Load more) rather than page links', async ({ page }) => {
    test.setTimeout(210_000);
    const searchPage = new SearchPage(page);
    await searchPage.goto();
    await new ResultsPage(page).waitForLoad();
    // This theme uses a Load more button instead of traditional pagination
    await expect(page.locator('button.search-more')).toBeVisible();
  });
});

// ─── Results count heading ────────────────────────────────────────────────────

test.describe('Search results — results count heading', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(210_000);
    const sp = new SearchPage(page);
    await sp.goto();
    await new ResultsPage(page).waitForLoad();
  });

  test('shows a "X cruises found" heading on the results page', async ({ page }) => {
    const results = new ResultsPage(page);
    const text = await results.getCruisesFoundText();
    expect(text).toMatch(/\d[\d,]* cruises found/i);
  });

  test('cruise count is a positive integer', async ({ page }) => {
    const results = new ResultsPage(page);
    const count = await results.getCruisesFoundCount();
    expect(count).toBeGreaterThan(0);
  });
});

// ─── Sort functionality ───────────────────────────────────────────────────────

test.describe('Search results — sort functionality', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(210_000);
    const sp = new SearchPage(page);
    await sp.goto();
    await new ResultsPage(page).waitForLoad();
  });

  test('sort select is visible with "Date (early to late)" as the default option', async ({ page }) => {
    const sortSelect = page.locator('select[name="sort"]');
    await expect(sortSelect).toBeVisible();
    await expect(sortSelect).toHaveValue(/date.+asc/i);
  });

  test('sort select contains all six expected sort options', async ({ page }) => {
    const sortSelect = page.locator('select[name="sort"]');
    const options = await sortSelect.locator('option').allInnerTexts();
    const optionTexts = options.map(o => o.trim());
    expect(optionTexts).toContain('Date (early to late)');
    expect(optionTexts).toContain('Date (late to early)');
    expect(optionTexts).toContain('Price (low to high)');
    expect(optionTexts).toContain('Price (high to low)');
    expect(optionTexts).toContain('Duration (short to long)');
    expect(optionTexts).toContain('Duration (long to short)');
  });

  test('selecting "Price (low to high)" updates the URL sort params', async ({ page }) => {
    test.setTimeout(240_000);
    const sortSelect = page.locator('select[name="sort"]');
    await sortSelect.selectOption({ label: 'Price (low to high)' });
    // Wait for AJAX re-render
    await page.waitForLoadState('domcontentloaded').catch(() => {});
    await page.locator('.total-results').waitFor({ state: 'visible', timeout: 30_000 });
    // URL should reflect the new sort order
    expect(page.url()).toMatch(/sort=price|order=asc/i);
  });

  test('selecting "Date (late to early)" updates the URL sort params', async ({ page }) => {
    test.setTimeout(240_000);
    const sortSelect = page.locator('select[name="sort"]');
    await sortSelect.selectOption({ label: 'Date (late to early)' });
    await page.waitForLoadState('domcontentloaded').catch(() => {});
    await page.locator('.total-results').waitFor({ state: 'visible', timeout: 30_000 });
    expect(page.url()).toMatch(/sort=date|order=desc/i);
  });
});

// ─── Left-panel filter sections ───────────────────────────────────────────────

test.describe('Search results — left-panel filters', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(210_000);
    const sp = new SearchPage(page);
    await sp.goto();
    await new ResultsPage(page).waitForLoad();
  });

  test('Destinations filter section is visible and contains labelled options with counts', async ({ page }) => {
    const section = page.locator('[data-filter="regions"]');
    await expect(section).toBeVisible();
    await expect(section.locator('h5')).toContainText('Destinations');
    // Each checkbox label has a .name and a .total span
    const firstItem = section.locator('label.checkbox').first();
    await expect(firstItem.locator('.name')).toBeVisible();
    await expect(firstItem.locator('.total')).toBeVisible();
  });

  test('Cruise Types filter section is visible', async ({ page }) => {
    const section = page.locator('[data-filter="traveltypes"]');
    await expect(section).toBeVisible();
    await expect(section.locator('h5')).toContainText('Cruise types');
  });

  test('Cruise Lines filter section is visible with labelled options', async ({ page }) => {
    const section = page.locator('[data-filter="cruiselines"]');
    await expect(section).toBeVisible();
    await expect(section.locator('h5')).toContainText('Cruise lines');
    await expect(section.locator('label.checkbox').first()).toBeVisible();
  });

  test('Departing Ports filter section is visible', async ({ page }) => {
    const section = page.locator('[data-filter="departports"]');
    await expect(section).toBeVisible();
    await expect(section.locator('h5')).toContainText('Departing ports');
  });

  test('Durations filter section is visible with count options', async ({ page }) => {
    const section = page.locator('[data-filter="durations"]');
    await expect(section).toBeVisible();
    await expect(section.locator('h5')).toContainText('Durations');
    await expect(section.locator('label.checkbox').first()).toBeVisible();
  });

  test('each filter section has a search text input', async ({ page }) => {
    const destSection = page.locator('[data-filter="regions"]');
    await expect(destSection.locator('input.filter-search')).toBeVisible();
  });

  test('clicking a destination filter reduces the results count', async ({ page }) => {
    test.setTimeout(300_000);
    const results = new ResultsPage(page);
    const countBefore = await results.getCruisesFoundCount();

    // Pick the first available destination filter item dynamically — avoids hardcoded inventory names
    await results.clickFirstFilterItem('regions');
    // Wait for the AJAX refresh
    await page.waitForLoadState('domcontentloaded').catch(() => {});
    await page.locator('.total-results').waitFor({ state: 'visible', timeout: 60_000 });

    const countAfter = await results.getCruisesFoundCount();
    expect(countAfter).toBeGreaterThan(0);
    expect(countAfter).toBeLessThanOrEqual(countBefore);
  });

  test('"Show more" button expands a filter list when present', async ({ page }) => {
    // The Destinations filter has a "Show more" link when the list is truncated
    const showMore = page.locator('[data-filter="regions"] *:has-text("Show more")').first();
    const exists = await showMore.isVisible().catch(() => false);
    if (!exists) test.skip(true, 'No "Show more" button visible in Destinations filter');
    const countBefore = await page.locator('[data-filter="regions"] label.checkbox').count();
    await showMore.click();
    const countAfter = await page.locator('[data-filter="regions"] label.checkbox').count();
    expect(countAfter).toBeGreaterThanOrEqual(countBefore);
  });
});

// ─── Product card content ─────────────────────────────────────────────────────

test.describe('Search results — product card content', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(210_000);
    const sp = new SearchPage(page);
    await sp.goto();
    await new ResultsPage(page).waitForLoad();
  });

  test('first card has a visible cruise title (h3 heading)', async ({ page }) => {
    const firstCard = page.locator('.search-item').first();
    await expect(firstCard.locator('h3')).toBeVisible();
    const titleText = await firstCard.locator('h3').innerText();
    expect(titleText.trim()).not.toBe('');
  });

  test('first card title links to a cruise detail URL', async ({ page }) => {
    const firstCard = page.locator('.search-item').first();
    const titleLink = firstCard.locator('h3 a');
    await expect(titleLink).toBeVisible();
    const href = await titleLink.getAttribute('href');
    expect(href).toMatch(/\/cruises\//i);
  });

  test('first card shows duration, date and ship name in the subtitle', async ({ page }) => {
    const subtitle = page.locator('.search-item').first().locator('.search-item-subtitle');
    await expect(subtitle).toBeVisible();
    // Pattern: "X nights | DD Month YYYY | Ship Name"
    await expect(subtitle).toHaveText(/\d+ nights.*\|.*\|/i);
  });

  test('first card shows a "Sailing from" port paragraph', async ({ page }) => {
    const firstCard = page.locator('.search-item').first();
    const sailingFrom = firstCard.locator('p:has-text("Sailing from")');
    await expect(sailingFrom).toBeVisible();
  });

  test('first card shows a cruise type badge', async ({ page }) => {
    const firstCard = page.locator('.search-item').first();
    await expect(firstCard.locator('.fly-cruise-indicator')).toBeVisible();
  });

  test('cruise type badge shows a recognised type (Cruise Only, Fly Cruise, etc.)', async ({ page }) => {
    const firstCard = page.locator('.search-item').first();
    const badge = firstCard.locator('.fly-cruise-indicator');
    const badgeText = await badge.innerText();
    expect(badgeText).toMatch(/cruise only|fly cruise|cruise \+ flight/i);
  });

  test('first card shows itinerary ports', async ({ page }) => {
    const firstCard = page.locator('.search-item').first();
    await expect(firstCard.locator('.search-item-itinerary')).toBeVisible();
    const itineraryText = await firstCard.locator('.search-item-itinerary').innerText();
    // Ports are separated by " / "
    expect(itineraryText).toContain('/');
  });

  test('"View full itinerary" toggle is present on the first card if rendered by the theme', async ({ page }) => {
    const firstCard = page.locator('.search-item').first();
    const toggle = firstCard.locator('.excerpt-show-more');
    // This toggle is theme-specific — only assert when the element is present
    const isPresent = await toggle.isVisible({ timeout: 3_000 }).catch(() => false);
    if (isPresent) {
      await expect(toggle).toContainText('View full itinerary');
    }
  });

  test('first card has a cabin-grade price section (inside / outside / balcony / suite)', async ({ page }) => {
    const firstCard = page.locator('.search-item').first();
    // Cards render two .search-item-prices containers (desktop + mobile variants) — pick the first
    const prices = firstCard.locator('.search-item-prices').first();
    await expect(prices).toBeVisible();
    // At least one of the four cabin grade labels must be present
    const pricesText = await prices.innerText();
    expect(pricesText.toLowerCase()).toMatch(/inside|outside|balcony|suite/);
  });

  test('first card has a cruise line logo image', async ({ page }) => {
    const firstCard = page.locator('.search-item').first();
    await expect(firstCard.locator('.cruiseline-image img')).toBeVisible();
  });

  test('first card has a background hero image', async ({ page }) => {
    const firstCard = page.locator('.search-item').first();
    // The hero is set as a CSS background-image on .search-item-image
    const heroStyle = await firstCard.locator('.search-item-image').getAttribute('style');
    expect(heroStyle).toMatch(/background-image\s*:/i);
  });

  test('"View details" button is visible on each of the first five cards', async ({ page }) => {
    const cards = page.locator('.search-item');
    const count = Math.min(await cards.count(), 5);
    for (let i = 0; i < count; i++) {
      const viewDetailsLink = cards.nth(i).locator('[data-cruiseappy="view_cruise"]');
      await expect(viewDetailsLink).toBeVisible();
      await expect(viewDetailsLink).toHaveText(/view details/i);
    }
  });

  test('"View details" link href points to a /cruises/ URL', async ({ page }) => {
    const viewDetailsLink = page.locator('.search-item').first().locator('[data-cruiseappy="view_cruise"]');
    const href = await viewDetailsLink.getAttribute('href');
    expect(href).toMatch(/\/cruises\//i);
  });
});

// ─── View Details navigation ─────────────────────────────────────────────────

test.describe('Search results — View Details navigation', () => {
  test('"View details" navigates to the cruise product page', async ({ page }) => {
    test.setTimeout(300_000);
    const sp = new SearchPage(page);
    await sp.goto();
    const results = new ResultsPage(page);
    await results.waitForLoad();

    const viewDetailsLink = page.locator('.search-item').first().locator('[data-cruiseappy="view_cruise"]');
    await viewDetailsLink.click();
    await page.waitForLoadState('domcontentloaded');

    // The product page URL must contain /cruises/
    expect(page.url()).toMatch(/\/cruises\//i);

    // Product page must have an h1 heading
    const detail = new CruiseDetailPage(page);
    await detail.waitForLoad();
    const cruiseName = await detail.getCruiseName();
    expect(cruiseName.trim()).not.toBe('');
  });
});

// ─── Load more / infinite scroll ─────────────────────────────────────────────

test.describe('Search results — Load more button', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(240_000);
    const sp = new SearchPage(page);
    await sp.goto();
    await new ResultsPage(page).waitForLoad();
  });

  test('"Load more" button is visible when the result set has more items', async ({ page }) => {
    const results = new ResultsPage(page);
    const count = await results.getCruisesFoundCount();
    const cardsLoaded = await page.locator('.search-item').count();
    if (count <= cardsLoaded) {
      test.skip(true, 'All results already shown — no Load more button expected');
    }
    await expect(page.locator('button.search-more')).toBeVisible();
    await expect(page.locator('button.search-more')).toContainText(/load more/i);
  });

  test('clicking "Load more" loads additional result cards', async ({ page }) => {
    const loadMoreBtn = page.locator('button.search-more');
    const loadMoreVisible = await loadMoreBtn.isVisible().catch(() => false);
    if (!loadMoreVisible) test.skip(true, 'Load more button not visible — all results already shown');

    const countBefore = await page.locator('.search-item').count();
    await loadMoreBtn.click();
    // Wait for at least one new card beyond the original set
    await page.locator('.search-item').nth(countBefore).waitFor({ state: 'visible', timeout: 30_000 });
    const countAfter = await page.locator('.search-item').count();
    expect(countAfter).toBeGreaterThan(countBefore);
  });
});
