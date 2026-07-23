import { test, expect } from '../../fixtures/bookingFixture';
import { SearchPage } from '../../page-objects/SearchPage';
import { SearchLocators, calendarMonthLabel } from '../../locators/search';
import { ResultsLocators } from '../../locators/results';

/**
 * Search Box Functionality
 *
 * Covers the five search-form controls on the homepage:
 *   1. Destination dropdown — options, search input, label update, CTA count
 *   2. Cruise Line dropdown — options, search input, label update, CTA count
 *   3. Departure Date calendar — opens, single/multi month selection, CTA count
 *   4. Departure Port dropdown — options, search input, label update, CTA count
 *   5. Search button — default state, count update, URL params, navigation
 */

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns the ISO start-date string for the first day of the month that is
 * `monthsAhead` months from today.  Used to pick always-future calendar months.
 */
function calendarMonth(monthsAhead: number): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + monthsAhead);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

/**
 * Formats an ISO start-of-month string into the label shown by the search form
 * trigger, e.g. '2027-01-01' → 'Jan 2027'.
 */
function formatMonthLabel(isoDate: string): string {
  const [year, month] = isoDate.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(month!, 10) - 1]} ${year}`;
}

// ─── Destination Dropdown ────────────────────────────────────────────────────

test.describe('Search box — Destination dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('opens when the Destination trigger is clicked', async ({ page }) => {
    await page.locator(SearchLocators.searchDestination).click();
    await expect(
      page.locator(SearchLocators.searchDestination).locator(SearchLocators.searchDropdownPanel),
    ).toBeVisible();
  });

  test('shows at least 5 destination options in the dropdown list', async ({ page }) => {
    await page.locator(SearchLocators.searchDestination).click();
    const options = page.locator(SearchLocators.destinationOption);
    await options.first().waitFor({ state: 'visible', timeout: 10_000 });
    const count = await options.count();
    expect(count, 'Expected at least 5 destination options').toBeGreaterThanOrEqual(5);
  });

  test('contains a search text input inside the dropdown', async ({ page }) => {
    await page.locator(SearchLocators.searchDestination).click();
    await expect(
      page.locator(SearchLocators.searchDestination).locator(SearchLocators.dropdownSearchInput),
    ).toBeVisible();
  });

  test('selecting a destination updates the trigger label', async ({ page }) => {
    const sp = new SearchPage(page);
    const selected = await sp.selectFirstDestination();
    await expect(page.locator(SearchLocators.searchDestination)).toContainText(selected);
  });

  test('selecting a destination updates the search button to show a cruise count', async ({ page }) => {
    const sp = new SearchPage(page);
    await sp.selectFirstDestination();
    await expect(page.locator(SearchLocators.searchCta)).toHaveText(/[\d,]+ cruises/i);
  });

  test('search button href contains the region parameter after destination selection', async ({ page }) => {
    const sp = new SearchPage(page);
    await sp.selectFirstDestination();
    // Wait for AJAX to update the button href — check that any region param is set
    await expect(page.locator(SearchLocators.searchCta)).toHaveAttribute('href', /[?&]region=/, { timeout: 10_000 });
  });

  test('selecting a second destination increases the cruise count', async ({ page }) => {
    const sp = new SearchPage(page);
    const btn = page.locator(SearchLocators.searchCta);
    await sp.selectFirstDestination();
    // Wait for AJAX to update the count before reading it
    await expect(btn).toHaveText(/[\d,]+ cruises/i, { timeout: 10_000 });
    const countAfterFirst = parseInt((await btn.innerText()).replace(/[^\d]/g, ''), 10);
    await sp.selectSecondDestination();
    await expect(btn).toHaveText(/[\d,]+ cruises/i, { timeout: 10_000 });
    const countAfterSecond = parseInt((await btn.innerText()).replace(/[^\d]/g, ''), 10);
    expect(countAfterSecond).toBeGreaterThan(countAfterFirst);
  });
});

// ─── Cruise Line Dropdown ────────────────────────────────────────────────────

test.describe('Search box — Cruise Line dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('opens when the Cruise Line trigger is clicked', async ({ page }) => {
    await page.locator(SearchLocators.searchCruiseLine).click();
    await expect(
      page.locator(SearchLocators.searchCruiseLine).locator(SearchLocators.searchDropdownPanel),
    ).toBeVisible();
  });

  test('shows at least 5 cruise line options in the dropdown list', async ({ page }) => {
    await page.locator(SearchLocators.searchCruiseLine).click();
    const options = page.locator(SearchLocators.cruiseLineOption);
    await options.first().waitFor({ state: 'visible', timeout: 10_000 });
    const count = await options.count();
    expect(count, 'Expected at least 5 cruise line options').toBeGreaterThanOrEqual(5);
  });

  test('contains a search text input inside the dropdown', async ({ page }) => {
    await page.locator(SearchLocators.searchCruiseLine).click();
    await expect(
      page.locator(SearchLocators.searchCruiseLine).locator(SearchLocators.dropdownSearchInput),
    ).toBeVisible();
  });

  test('selecting a cruise line updates the trigger label', async ({ page }) => {
    const sp = new SearchPage(page);
    const selected = await sp.selectFirstCruiseLine();
    await expect(page.locator(SearchLocators.searchCruiseLine)).toContainText(selected);
  });

  test('selecting a cruise line updates the search button count', async ({ page }) => {
    const sp = new SearchPage(page);
    await sp.selectFirstCruiseLine();
    await expect(page.locator(SearchLocators.searchCta)).toHaveText(/[\d,]+ cruises/i);
  });

  test('combining destination + cruise line produces a narrower count', async ({ page }) => {
    const sp = new SearchPage(page);
    const btn = page.locator(SearchLocators.searchCta);
    await sp.selectFirstDestination();
    await expect(btn).toHaveText(/[\d,]+ cruises/i, { timeout: 10_000 });
    const afterDest = parseInt((await btn.innerText()).replace(/[^\d]/g, ''), 10);
    await sp.selectFirstCruiseLine();
    await expect(btn).toHaveText(/[\d,]+ cruises/i, { timeout: 10_000 });
    const afterBoth = parseInt((await btn.innerText()).replace(/[^\d]/g, ''), 10);
    expect(afterBoth).toBeLessThanOrEqual(afterDest);
  });
});

// ─── Departure Date Calendar ─────────────────────────────────────────────────

test.describe('Search box — Departure Date calendar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('opens when the Departure Date trigger is clicked', async ({ page }) => {
    await page.locator(SearchLocators.searchDates).click();
    await expect(page.locator(SearchLocators.calendarPanel)).toBeVisible();
  });

  test('shows year headings for at least two future years', async ({ page }) => {
    await page.locator(SearchLocators.searchDates).click();
    const calendar = page.locator(SearchLocators.calendarPanel);
    await expect(calendar).toBeVisible();
    const groupCount = await calendar.locator(SearchLocators.calendarYearGroup).count();
    expect(groupCount).toBeGreaterThanOrEqual(2);
  });

  test('shows selectable (non-disabled) months for upcoming months', async ({ page }) => {
    await page.locator(SearchLocators.searchDates).click();
    const month2 = calendarMonth(2); // 2 months from now — always selectable
    const enabledLabel = page.locator(calendarMonthLabel(month2));
    await expect(enabledLabel).toBeVisible({ timeout: 10_000 });
    // Enabled months must NOT carry the disabled class
    await expect(enabledLabel).not.toHaveClass(/disabled/);
  });

  test('selecting a single month updates the trigger label', async ({ page }) => {
    const month1 = calendarMonth(2);
    const sp = new SearchPage(page);
    await sp.selectMonth(month1);
    await expect(page.locator(SearchLocators.searchDates)).toContainText(formatMonthLabel(month1));
  });

  test('selecting two months shows a date range in the trigger', async ({ page }) => {
    const month1 = calendarMonth(2);
    const month2 = calendarMonth(3);
    const sp = new SearchPage(page);
    await sp.selectMonth(month1);
    await sp.selectMonth(month2);
    const trigger = page.locator(SearchLocators.searchDates);
    await expect(trigger).toContainText(formatMonthLabel(month1));
    await expect(trigger).toContainText(formatMonthLabel(month2));
  });

  test('date selection updates the search button count', async ({ page }) => {
    const month1 = calendarMonth(2);
    const sp = new SearchPage(page);
    await sp.selectMonth(month1);
    await expect(page.locator(SearchLocators.searchCta)).toHaveText(/[\d,]+ cruises/i);
  });

  test('search button href contains startdate and enddate params after month selection', async ({ page }) => {
    const month1 = calendarMonth(2);
    const sp = new SearchPage(page);
    await sp.selectMonth(month1);
    // Wait for AJAX to update the href before asserting
    await expect(page.locator(SearchLocators.searchCta)).toHaveAttribute('href', /startdate=/, { timeout: 10_000 });
    await expect(page.locator(SearchLocators.searchCta)).toHaveAttribute('href', /enddate=/);
  });

  test('past months are rendered as disabled and cannot be selected', async ({ page }) => {
    await page.locator(SearchLocators.searchDates).click();
    // Jan 2026 is always in the past as of the project baseline (July 2026)
    const pastLabel = page.locator(calendarMonthLabel('2026-01-01'));
    if (await pastLabel.isVisible().catch(() => false)) {
      await expect(pastLabel).toHaveClass(/disabled/);
    }
  });
});

// ─── Departure Port Dropdown ─────────────────────────────────────────────────

test.describe('Search box — Departure Port dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('opens when the Departure Port trigger is clicked', async ({ page }) => {
    await page.locator(SearchLocators.searchPort).click();
    await expect(
      page.locator(SearchLocators.searchPort).locator(SearchLocators.searchDropdownPanel),
    ).toBeVisible();
  });

  test('shows at least 2 departure port options in the dropdown', async ({ page }) => {
    await page.locator(SearchLocators.searchPort).click();
    const options = page.locator(SearchLocators.portOption);
    await options.first().waitFor({ state: 'visible', timeout: 10_000 });
    const count = await options.count();
    expect(count, 'Expected at least 2 departure port options').toBeGreaterThanOrEqual(2);
  });

  test('contains a search text input inside the dropdown', async ({ page }) => {
    await page.locator(SearchLocators.searchPort).click();
    await expect(
      page.locator(SearchLocators.searchPort).locator(SearchLocators.dropdownSearchInput),
    ).toBeVisible();
  });

  test('selecting a port updates the trigger label', async ({ page }) => {
    const sp = new SearchPage(page);
    const selected = await sp.selectFirstPort();
    await expect(page.locator(SearchLocators.searchPort)).toContainText(selected);
  });

  test('selecting a single port updates the search button count', async ({ page }) => {
    const sp = new SearchPage(page);
    await sp.selectFirstPort();
    await expect(page.locator(SearchLocators.searchCta)).toHaveText(/[\d,]+ cruises/i);
  });
});

// ─── Search Button Behaviour ─────────────────────────────────────────────────

test.describe('Search box — Search button', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('shows "Search" by default when no filters are selected', async ({ page }) => {
    // Use innerText() — it reflects CSS text-transform and avoids the whitespace in textContent
    const btnText = (await page.locator(SearchLocators.searchCta).innerText()).trim();
    expect(btnText).toMatch(/^search$/i);
  });

  test('href points to the /search/ path by default', async ({ page }) => {
    const href = await page.locator(SearchLocators.searchCta).getAttribute('href');
    expect(href).toContain('/search/');
  });

  test('button text changes to a cruise count after selecting a destination', async ({ page }) => {
    const sp = new SearchPage(page);
    const btn = page.locator(SearchLocators.searchCta);
    // Default state: "Search" (no count)
    const defaultText = (await btn.innerText()).trim();
    expect(defaultText).toMatch(/^search$/i);
    await sp.selectFirstDestination();
    // Should now show a count
    await expect(btn).toHaveText(/[\d,]+ cruises/i, { timeout: 10_000 });
  });

  test('button text changes further when cruise line is also selected', async ({ page }) => {
    const sp = new SearchPage(page);
    const btn = page.locator(SearchLocators.searchCta);
    await sp.selectFirstDestination();
    await expect(btn).toHaveText(/[\d,]+ cruises/i, { timeout: 10_000 });
    const countDestOnly = parseInt((await btn.innerText()).replace(/[^\d]/g, ''), 10);
    await sp.selectFirstCruiseLine();
    await expect(btn).toHaveText(/[\d,]+ cruises/i, { timeout: 10_000 });
    const countBoth = parseInt((await btn.innerText()).replace(/[^\d]/g, ''), 10);
    expect(countBoth).toBeLessThan(countDestOnly);
  });

  test('clicking the search button navigates to the results page with correct URL params', async ({ page }) => {
    const sp = new SearchPage(page);
    await sp.selectFirstDestination();
    await page.locator(SearchLocators.searchCta).click();
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toContain('/search/');
    expect(page.url()).toMatch(/[?&]region=/);
  });

  test('results page loads with a cruise count after clicking Search', async ({ page }) => {
    test.setTimeout(90_000);
    const sp = new SearchPage(page);
    await sp.selectFirstDestination();
    await page.locator(SearchLocators.searchCta).click();
    await page.waitForLoadState('domcontentloaded');
    // Wait for the count heading and assert it contains a number
    await page.locator(ResultsLocators.totalResults).waitFor({ state: 'visible', timeout: 60_000 });
    const countText = await page.locator(ResultsLocators.totalResults).innerText();
    expect(countText).toMatch(/\d+ cruises found/i);
  });
});
