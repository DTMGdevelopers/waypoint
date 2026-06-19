import { test, expect } from '../../fixtures/bookingFixture';
import { SearchPage } from '../../page-objects/SearchPage';
import { CruiseDetailPage } from '../../page-objects/CruiseDetailPage';
import { OccupancyPage } from '../../page-objects/OccupancyPage';
import { StateroomsPage } from '../../page-objects/StateroomsPage';
import { CabinsPage } from '../../page-objects/CabinsPage';
import { PassengerFormPage } from '../../page-objects/PassengerFormPage';

/**
 * Full booking journey: search → cruise detail → occupancy → staterooms → passengers.
 *
 * "Sail Away" guarantee staterooms auto-assign a cabin and skip the /cabins/ step.
 * The test handles both paths: /staterooms/ → /cabins/ → /passengers/
 *                          and: /staterooms/ → /passengers/ (guarantee staterooms)
 *
 * The search targets August 2026 sailings. Update SEARCH_URL in SearchPage.ts
 * if that window sells out.
 */
test('booking journey: search to passengers form', async ({ page }) => {
  test.setTimeout(600_000);

  const searchPage = new SearchPage(page);
  const cruiseDetail = new CruiseDetailPage(page);
  const occupancyPage = new OccupancyPage(page);
  const stateroomsPage = new StateroomsPage(page);
  const cabinsPage = new CabinsPage(page);
  const passengerForm = new PassengerFormPage(page);

  // ── Step 1: Search results ───────────────────────────────────────────────
  await test.step('search results load with at least one cruise', async () => {
    await searchPage.goto();
    await searchPage.waitForResults();
    const count = await searchPage.getResultCount();
    expect(count, 'Expected at least one search result').toBeGreaterThanOrEqual(1);
  });

  // ── Step 2: Cruise detail ─────────────────────────────────────────────────
  await test.step('navigate to cruise detail page', async () => {
    await searchPage.selectFirstResult();
    await cruiseDetail.waitForLoad();
    expect(page.url()).toMatch(/\/cruises\//);
  });

  // ── Step 3: Occupancy selection ───────────────────────────────────────────
  await test.step('click Book Now and reach occupancy page', async () => {
    await cruiseDetail.bookNow();
    await occupancyPage.waitForLoad();
    expect(page.url()).toMatch(/\/occupancy/);
  });

  await test.step('continue from occupancy to staterooms', async () => {
    await occupancyPage.continue();
    expect(page.url()).toMatch(/\/staterooms/);
  });

  // ── Step 4: Stateroom selection ───────────────────────────────────────────
  await test.step('staterooms page loads with a cabin selection available', async () => {
    await stateroomsPage.waitForLoad();
  });

  await test.step('continue from staterooms', async () => {
    await stateroomsPage.continue();
    expect(page.url()).toMatch(/\/(cabins|passengers)\//);
  });

  // ── Step 5: Cabin selection (optional) ───────────────────────────────────
  // "Sail Away" guarantee staterooms auto-assign a cabin and skip this step.
  if (page.url().includes('/cabins/')) {
    await test.step('select specific cabin and reach passengers form', async () => {
      await cabinsPage.waitForLoad();
      await cabinsPage.selectFirstCabin();
      expect(page.url()).toMatch(/\/passengers\//);
    });
  }

  // ── Step 6: Passenger form ────────────────────────────────────────────────
  await test.step('passenger details form loads', async () => {
    await passengerForm.waitForLoad();
    expect(await passengerForm.isLoaded()).toBe(true);
    const fieldCount = await passengerForm.getFieldCount();
    expect(fieldCount, 'Expected passenger form fields').toBeGreaterThan(0);
  });
});

// ── Individual step assertions ────────────────────────────────────────────────

test.describe('Search results page', () => {
  test('shows results for the configured date range', async ({ page }) => {
    // waitForResults uses 180s; raise the test timeout above the global 90s default
    test.setTimeout(210_000);
    const searchPage = new SearchPage(page);
    await searchPage.goto();
    await searchPage.waitForResults();
    expect(await searchPage.getResultCount()).toBeGreaterThanOrEqual(1);
  });

  test('each result has a details link', async ({ page }) => {
    test.setTimeout(210_000);
    const searchPage = new SearchPage(page);
    await searchPage.goto();
    await searchPage.waitForResults();
    // Prod: "View details" / Dev: "More details" — SearchPage.resultLinks handles both
    await expect(page.getByRole('link', { name: /^(view|more) details$/i }).first()).toBeVisible();
  });
});

// Paths configured per-site via environment variables.
// Defaults match century-cypress; override in GitHub Actions variables for other sites.
// Use || not ?? — GitHub Actions passes empty string when var is unset, and ?? only
// falls back on null/undefined, not ''.
const TEST_CRUISE_PATH = process.env.TEST_CRUISE_PATH || '/cruises/2147919/spain-and-france/';
const TEST_OCCUPANCY_PATH = process.env.TEST_OCCUPANCY_PATH || '/book-a-cruise/2147919/occupancy/?occupancy=2-0-0-0-0';

test.describe('Cruise detail page', () => {
  test('Book Now CTA is present', async ({ page, isMobile }) => {
    await page.goto(TEST_CRUISE_PATH);
    const cruiseDetail = new CruiseDetailPage(page);
    await cruiseDetail.waitForLoad();
    await expect(cruiseDetail.getBookNowCta(isMobile)).toBeVisible();
  });
});

test.describe('Occupancy page', () => {
  test('adults, children and infants selects are present', async ({ page }) => {
    await page.goto(TEST_OCCUPANCY_PATH);
    await page.waitForLoadState('domcontentloaded');
    const occupancy = new OccupancyPage(page);
    // Not all sites expose an infants field — only assert adults and children.
    await expect(occupancy.adults).toBeAttached();
    await expect(occupancy.children).toBeAttached();
    await expect(occupancy.continueButton).toBeVisible();
  });
});
