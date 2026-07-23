import { test, expect } from '@playwright/test';
import { GlobalLocators, GlobalFallbacks } from '../../locators/global';
import { SearchLocators } from '../../locators/search';

/**
 * Homepage smoke checks.
 *
 * These tests run on every deploy across all five browser projects.
 * They are intentionally fast — no login, no data setup, no multi-step flows.
 * Each test is independent and asserts exactly one concern.
 */

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  // ── Page load ─────────────────────────────────────────────────────────────

  test('page returns a successful response', async ({ page }) => {
    await test.step('make a GET request to the homepage URL', async () => {
      const response = await page.request.get(page.url());
      expect(response.status(), 'Homepage should return HTTP 200').toBe(200);
    });
  });

  test('page title is set', async ({ page }) => {
    await test.step('check the browser tab title exists', async () => {
      await expect(page, 'Page should have a <title> element').toHaveTitle(/.+/);
    });
  });

  test('page title is not blank', async ({ page }) => {
    await test.step('check the title contains visible text', async () => {
      const title = await page.title();
      expect(title.trim().length, 'Page title should not be empty or whitespace').toBeGreaterThan(0);
    });
  });

  // ── Global chrome ─────────────────────────────────────────────────────────

  test('site logo is visible in the header', async ({ page }) => {
    await test.step('find the logo in the page header', async () => {
      const logo = page.locator(GlobalLocators.siteLogo)
        .or(page.getByRole('img', { name: /waypoint|logo/i }))
        .or(page.locator('header').locator('a[href="/"] img'))
        .or(page.locator(GlobalFallbacks.siteLogo))
        .first();

      await expect(logo, 'A logo image or element should be visible in the header').toBeVisible();
    });
  });

  test('primary navigation is visible', async ({ page, isMobile }) => {
    if (isMobile) {
      await test.step('check mobile navigation chrome is present', async () => {
        const mobileNavAttr = page.locator(GlobalLocators.mobileNav);
        const nav          = page.getByRole('navigation');
        const toggle       = page
          .getByRole('button', { name: /menu|nav|toggle/i })
          .or(page.locator('[class*="navbar-toggler"], [class*="hamburger"], [class*="menu-toggle"]'))
          .first();
        const header = page.locator('header');

        const hasMobileNavAttr = await mobileNavAttr.isVisible().catch(() => false);
        const hasNav           = await nav.isVisible().catch(() => false);
        const hasToggle        = await toggle.isVisible().catch(() => false);
        const hasHeader        = await header.isVisible().catch(() => false);

        expect(
          hasMobileNavAttr || hasNav || hasToggle || hasHeader,
          'Mobile view should have a navigation landmark, hamburger toggle, or header element',
        ).toBe(true);
      });
    } else {
      await test.step('check desktop navigation landmark is visible', async () => {
        await expect(
          page.getByRole('navigation').first(),
          'A <nav> landmark should be visible on desktop',
        ).toBeVisible();
      });
    }
  });

  test('footer is visible', async ({ page }) => {
    await test.step('check the page footer is rendered', async () => {
      await expect(
        page.locator('footer'),
        'A <footer> element should be present and visible',
      ).toBeVisible();
    });
  });

  // ── Search widget ─────────────────────────────────────────────────────────

  test('search widget filters are present', async ({ page }) => {
    await test.step('find the search widget on the homepage', async () => {
      const searchWidget = page
        .locator(GlobalLocators.searchForm)
        .or(page.locator('[class*="search-form"]'))
        .first();

      await expect(
        searchWidget,
        'A search widget / filter form should be visible on the homepage',
      ).toBeVisible();
    });
  });

  test('search CTA is present and has an href', async ({ page }) => {
    await test.step('find the search submit button or link', async () => {
      const searchLink = page
        .locator(GlobalLocators.searchCta)
        .or(page.getByRole('link', { name: /^search$/i }))
        .first();

      await expect(searchLink, 'Search CTA should be visible').toBeVisible();
    });

    await test.step('confirm the search CTA links somewhere', async () => {
      const searchLink = page
        .locator(GlobalLocators.searchCta)
        .or(page.getByRole('link', { name: /^search$/i }))
        .first();

      await expect(
        searchLink,
        'Search CTA href should not be empty — it is used to discover the search URL at runtime',
      ).toHaveAttribute('href', /.+/);
    });
  });

  // ── Accessibility minimums ────────────────────────────────────────────────

  test('page has exactly one main landmark', async ({ page }) => {
    await test.step('count <main> landmark elements on the page', async () => {
      await expect(
        page.getByRole('main'),
        'There should be exactly one <main> landmark for screen reader navigation',
      ).toHaveCount(1);
    });
  });

  test('page has at least one heading', async ({ page }) => {
    await test.step('check headings are present in the document', async () => {
      const count = await page.getByRole('heading').count();
      expect(count, 'Page should have at least one heading element (h1–h6)').toBeGreaterThanOrEqual(1);
    });
  });

  // ── JavaScript errors ─────────────────────────────────────────────────────

  test('no uncaught JavaScript errors on load', async ({ page }) => {
    const errors: string[] = [];

    await test.step('listen for JS errors while the page loads', async () => {
      page.on('pageerror', (err) => errors.push(err.message));
      await page.reload({ waitUntil: 'domcontentloaded' });
    });

    await test.step('confirm no critical JS errors were thrown', async () => {
      const critical = errors.filter(
        (e) =>
          !e.includes('access control') &&
          !e.includes('Cross-Origin') &&
          !e.includes('CORS') &&
          !e.includes('getComputedStyle') &&
          !e.includes('t.meta.current_page'),
      );
      expect(
        critical,
        `Unexpected JS errors on load: ${critical.join('; ')}`,
      ).toHaveLength(0);
    });
  });

  // ── Network ───────────────────────────────────────────────────────────────

  test('no failed network requests on load', async ({ page }) => {
    const failures: string[] = [];

    await test.step('listen for failed requests while the page loads', async () => {
      page.on('requestfailed', (req) => failures.push(`${req.method()} ${req.url()}`));
      await page.reload({ waitUntil: 'domcontentloaded' });
    });

    await test.step('confirm no blocking requests failed', async () => {
      const critical = failures.filter(
        (url) =>
          !url.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|woff2?|ttf|eot|mp4|webm|ogv)(\?.*)?$/i) &&
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
          !url.includes('google.co.uk/ads') &&
          !url.startsWith('GET blob:') &&
          !(url.startsWith('POST ') && url.includes('/api/')),
      );
      expect(
        critical,
        `These requests failed and may break the page: ${critical.join(', ')}`,
      ).toHaveLength(0);
    });
  });

  // ── Mobile-specific ───────────────────────────────────────────────────────

  test('viewport meta tag is present for mobile scaling', async ({ page }) => {
    await test.step('check for a viewport meta tag in the <head>', async () => {
      const viewport = await page.$('meta[name="viewport"]');
      expect(viewport, 'A <meta name="viewport"> tag should exist').not.toBeNull();

      const content = await viewport?.getAttribute('content');
      expect(
        content,
        'Viewport meta should include width=device-width to prevent mobile zoom issues',
      ).toMatch(/width=device-width/i);
    });
  });

});
