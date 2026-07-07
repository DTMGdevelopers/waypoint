import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { loadTheme } from './config/themes';

dotenv.config();

// Treat only the exact string 'true' as CI — prevents CI=false in .env being
// read as truthy (all non-empty strings are truthy in JS).
const isCI = process.env.CI === 'true';
const theme = loadTheme();

/**
 * Waypoint — Playwright Regression Suite
 * Cross-browser, cross-device booking journey testing
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  // 1 worker locally — the production booking site cannot handle concurrent browser
  // requests to the search page; sequential execution keeps each request isolated.
  // CI uses 4 workers with sharding so each shard still runs at low concurrency.
  workers: isCI ? 4 : 1,

  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
    ...(process.env.CI ? [['github'] as ['github']] : []),
  ],

  use: {
    baseURL: theme.baseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    actionTimeout: 15_000,
    navigationTimeout: 90_000,
  },

  projects: [
    // ─── Desktop browsers ──────────────────────────────────────────────────
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 800 },
      },
    },

    // ─── Mobile emulation ──────────────────────────────────────────────────
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 14'] },
    },

    // ─── Smoke-only project (no auth dependency, runs fast) ────────────────
    {
      name: 'smoke',
      testMatch: /smoke\/.*/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    // ─── Booking journey — always records video ───────────────────────────
    {
      name: 'booking',
      testMatch: /booking\/journey\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
        video: 'on',
      },
    },
  ],

  // Global timeout per test — kept generous because the staging site is slow.
  timeout: 90_000,

  // Output dirs
  outputDir: 'test-results/',

  // Snapshot settings for visual regression
  snapshotPathTemplate: '{testDir}/visual/__snapshots__/{projectName}/{testFilePath}/{arg}{ext}',
  expect: {
    toHaveScreenshot: {
      // Allow minor anti-aliasing differences across OS
      maxDiffPixelRatio: 0.02,
    },
  },
});
