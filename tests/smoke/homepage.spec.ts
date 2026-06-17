import { test, expect } from '@playwright/test';

/**
 * Homepage smoke checks.
 *
 * These tests run on every deploy across all five browser projects.
 * They are intentionally fast — no login, no data setup, no multi-step flows.
 * Each test is independent and asserts exactly one concern.
 *
 * Selectors use ARIA roles and labels so they survive copy changes.
 * Update the `name` / `label` matchers if the site uses different wording.
 */

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    // domcontentloaded is reliable on this site; 'load' can exceed the test timeout
    // due to slow third-party scripts, so we never wait for the 'load' event.
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  // ── Page load ────────────────────────────────────────────────────────────

  test('page returns a successful response', async ({ page }) => {
    const response = await page.request.get(page.url());
    expect(response.status()).toBe(200);
  });

  test('page title is set', async ({ page }) => {
    await expect(page).toHaveTitle(/.+/);
  });

  // ── Chrome omits cached navigations from PerformanceObserver so we check
  // the title length as a proxy for a non-blank document.
  test('page title is not blank', async ({ page }) => {
    const title = await page.title();
    expect(title.trim().length).toBeGreaterThan(0);
  });

  // ── Global chrome ─────────────────────────────────────────────────────────

  test('site logo is visible in the header', async ({ page }) => {
    // Matches: <a href="/"><img alt="...logo..."></a> or role=img with brand name
    const logo =
      page.getByRole('img', { name: /waypoint|logo/i })
        .or(page.locator('header').locator('a[href="/"] img'))
        .or(page.locator('header [class*="logo"]'))
        .first();
    await expect(logo).toBeVisible();
  });

  test('primary navigation is visible', async ({ page, isMobile }) => {
    if (isMobile) {
      // On mobile the nav collapses; check for a toggle button or nav landmark
      const nav = page.getByRole('navigation');
      const toggle = page.getByRole('button', { name: /menu|nav|toggle/i }).first();
      const hasNav = await nav.isVisible();
      const hasToggle = await toggle.isVisible();
      expect(hasNav || hasToggle, 'Expected a nav landmark or menu toggle on mobile').toBe(true);
    } else {
      await expect(page.getByRole('navigation').first()).toBeVisible();
    }
  });

  test('footer is visible', async ({ page }) => {
    await expect(page.locator('footer')).toBeVisible();
  });

  // ── Search widget ─────────────────────────────────────────────────────────
  // Sites use a custom filter widget rather than a standard <form>. Label text
  // varies per theme so we check for the widget container rather than specific copy.

  test('search widget filters are present', async ({ page }) => {
    // Each site's search widget uses elements with "search-form" in the class name.
    // This is intentionally broad so it works across different theme label variations.
    const searchWidget = page.locator('[class*="search-form"]').first();
    await expect(searchWidget).toBeVisible();
  });

  test('Search link is present and points to /search/', async ({ page }) => {
    const searchLink = page.getByRole('link', { name: /^search$/i });
    await expect(searchLink).toBeVisible();
    await expect(searchLink).toHaveAttribute('href', /\/search\//);
  });

  // ── Accessibility minimums ────────────────────────────────────────────────

  test('page has exactly one main landmark', async ({ page }) => {
    await expect(page.getByRole('main')).toHaveCount(1);
  });

  test('page has at least one heading', async ({ page }) => {
    const headings = page.getByRole('heading');
    const count = await headings.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  // ── JavaScript errors ─────────────────────────────────────────────────────

  test('no uncaught JavaScript errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.reload({ waitUntil: 'domcontentloaded' });

    // WebKit/Safari surfaces CORS access-control rejections from third-party API
    // calls as pageerrors; Chromium silently ignores them. Filter these out since
    // they are site-level CORS configuration issues, not page-breaking JS errors.
    const critical = errors.filter(
      (e) => !e.includes('access control') && !e.includes('Cross-Origin') && !e.includes('CORS'),
    );
    expect(critical, `Uncaught JS errors: ${critical.join('; ')}`).toHaveLength(0);
  });

  // ── Network ───────────────────────────────────────────────────────────────

  test('no failed network requests on load', async ({ page }) => {
    const failures: string[] = [];
    page.on('requestfailed', (req) => failures.push(`${req.method()} ${req.url()}`));

    await page.reload({ waitUntil: 'domcontentloaded' });

    // Only flag JS/CSS/document failures. Images, fonts, and third-party marketing/
    // analytics/monitoring resources are excluded — they fail intermittently across
    // sites and are not blocking to the user experience.
    const critical = failures.filter(
      (url) =>
        !url.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|woff2?|ttf|eot)(\?.*)?$/i) &&
        !url.includes('analytics') &&
        !url.includes('tracking') &&
        !url.includes('hotjar') &&
        !url.includes('gstatic.com') &&
        !url.includes('googletagmanager') &&
        !url.includes('doubleclick') &&
        !url.includes('cdn-cgi') &&
        !url.includes('pingdom.net') &&
        !url.includes('contentsquare.net') &&
        !url.includes('data-crypt.com') &&
        !url.includes('feefo.com') &&
        !url.includes('google.com/rmkt') &&
        !url.includes('google.com/pagead') &&
        !url.startsWith('GET blob:') &&
        !(url.startsWith('POST ') && url.includes('/api/')),
    );
    expect(critical, `Failed requests: ${critical.join(', ')}`).toHaveLength(0);
  });

  // ── Mobile-specific ───────────────────────────────────────────────────────

  test('viewport meta tag is present for mobile scaling', async ({ page }) => {
    const viewport = await page.$('meta[name="viewport"]');
    expect(viewport).not.toBeNull();
    const content = await viewport?.getAttribute('content');
    expect(content).toMatch(/width=device-width/i);
  });
});
