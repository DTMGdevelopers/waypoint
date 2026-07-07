import { test, expect } from '../../fixtures/bookingFixture';
import { SearchPage } from '../../page-objects/SearchPage';
import { CruiseDetailPage } from '../../page-objects/CruiseDetailPage';
import { OccupancyPage } from '../../page-objects/OccupancyPage';
import { StateroomsPage } from '../../page-objects/StateroomsPage';
import { CabinsPage } from '../../page-objects/CabinsPage';
import { PassengerFormPage } from '../../page-objects/PassengerFormPage';
import { PriceJourney, extractPrice } from '../../helpers/priceValidator';

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
  const prices = new PriceJourney();

  // ── Step 1: Search results ───────────────────────────────────────────────
  await test.step('search results load with at least one cruise', async () => {
    await searchPage.goto();
    await searchPage.waitForResults();
    const count = await searchPage.getResultCount();
    expect(count, 'Expected at least one search result').toBeGreaterThanOrEqual(1);

    // Capture price from first bookable result (best-effort — attribute may not be present)
    const firstPrice = page.locator('[data-cruiseappy="result_price"]').first();
    const priceVisible = await firstPrice.isVisible().catch(() => false);
    if (priceVisible) {
      prices.record('search-result', await extractPrice(firstPrice));
    }
  });

  // ── Step 2: Cruise detail ─────────────────────────────────────────────────
  await test.step('navigate to cruise detail page', async () => {
    await searchPage.selectFirstResult();
    // waitForLoad asserts the h1 is visible — that's sufficient proof we're on a
    // cruise detail page. Don't assert the URL pattern here: it's language-specific
    // (e.g. /cruises/ vs /lv/kruizi/) and varies across sites.
    await cruiseDetail.waitForLoad();
  });

  // ── Step 3: Occupancy selection ───────────────────────────────────────────
  await test.step('click Book Now and reach occupancy page', async () => {
    await cruiseDetail.bookNow();
    // bookNow() waits for data-cruiseappy="booking_occupancy" — no URL check needed.
    await occupancyPage.waitForLoad();
  });

  await test.step('continue from occupancy to staterooms', async () => {
    await occupancyPage.continue();
    // continue() waits for data-cruiseappy="booking_staterooms" — no URL check needed.
  });

  // ── Step 4: Stateroom selection ───────────────────────────────────────────
  await test.step('staterooms page loads with a cabin selection available', async () => {
    await stateroomsPage.waitForLoad();
  });

  await test.step('continue from staterooms', async () => {
    await stateroomsPage.continue();
    // continue() waits for data-cruiseappy="booking_deck_room" or "booking_passengers".
  });

  // ── Step 5: Cabin selection (optional) ───────────────────────────────────
  // "Sail Away" guarantee staterooms skip cabins — detect by presence of booking_deck_room.
  const hasCabinStep = await page.locator('[data-cruiseappy="booking_deck_room"]').isVisible().catch(() => false);
  if (hasCabinStep) {
    await test.step('select specific cabin and reach passengers form', async () => {
      await cabinsPage.waitForLoad();
      await cabinsPage.selectFirstCabin();
      // selectFirstCabin() waits for data-cruiseappy="booking_passengers".
    });
  }

  // ── Step 6: Passenger form ────────────────────────────────────────────────
  await test.step('passenger details form loads', async () => {
    await passengerForm.waitForLoad();
    expect(await passengerForm.isLoaded()).toBe(true);
    const fieldCount = await passengerForm.getFieldCount();
    expect(fieldCount, 'Expected passenger form fields').toBeGreaterThan(0);

    // Capture summary panel price (best-effort)
    const summaryPrice = page.locator('[class*="summary"] [class*="price"], [class*="total"]').first();
    const summaryVisible = await summaryPrice.isVisible().catch(() => false);
    if (summaryVisible) {
      prices.record('passenger-summary', await extractPrice(summaryPrice).catch(() => NaN));
    }
  });

  // ── Price consistency check ───────────────────────────────────────────────
  // Asserts that prices captured at each step match within ±£0.01.
  // No-ops if fewer than two prices were captured (e.g. attributes not yet present).
  prices.assertConsistent();

  // ── Step 7: Payment (skipped — booking_payment attribute not yet implemented) ──
  await test.step('payment handoff', async () => {
    test.skip(true, 'booking_payment attribute not yet implemented — see CRUISEAPPY_ATTRIBUTES.md');
  });

  // ── Step 8: Confirmation (skipped — booking_reference attribute not yet implemented) ──
  await test.step('booking confirmation shows reference number', async () => {
    test.skip(true, 'booking_reference attribute not yet implemented — see CRUISEAPPY_ATTRIBUTES.md');
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

  test('each result has a view_cruise link', async ({ page }) => {
    test.setTimeout(210_000);
    const searchPage = new SearchPage(page);
    await searchPage.goto();
    await searchPage.waitForResults();
    // data-cruiseappy="view_cruise" is the stable attribute; fall back to role+text
    // for older sites without it.
    const resultLink = page
      .locator('[data-cruiseappy="view_cruise"]')
      .or(page.getByRole('link', { name: /^(view|more) details$/i }))
      .first();
    await expect(resultLink).toBeVisible();
  });
});

test.describe('Cruise detail page', () => {
  test('Book Now CTA is present', async ({ page, isMobile }) => {
    // Navigate dynamically via data-cruiseappy="view_cruise" — no hardcoded path needed.
    test.setTimeout(240_000);
    const searchPage = new SearchPage(page);
    await searchPage.goto();
    await searchPage.waitForResults();
    await searchPage.selectFirstResult();
    const cruiseDetail = new CruiseDetailPage(page);
    await cruiseDetail.waitForLoad();
    await expect(cruiseDetail.getBookNowCta()).toBeVisible();
  });
});

test.describe('Occupancy page', () => {
  test('adults, children and infants selects are present', async ({ page }) => {
    // Navigate dynamically via data-cruiseappy="book_cruise" — no hardcoded path needed.
    test.setTimeout(360_000);
    const searchPage = new SearchPage(page);
    await searchPage.goto();
    await searchPage.waitForResults();
    await searchPage.selectFirstResult();
    const cruiseDetail = new CruiseDetailPage(page);
    await cruiseDetail.waitForLoad();
    await cruiseDetail.bookNow();
    const occupancy = new OccupancyPage(page);
    await occupancy.waitForLoad();
    // Not all sites expose an infants field — only assert adults and children.
    await expect(occupancy.adults).toBeAttached();
    await expect(occupancy.children).toBeAttached();
    await expect(occupancy.continueButton).toBeVisible();
  });
});
