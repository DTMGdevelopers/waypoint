import { Page, Locator } from '@playwright/test';

/**
 * Resolves a primary data-cruiseappy selector with an optional CSS fallback,
 * returning a combined Playwright Locator. Centralises the `.or(page.locator(fallback))`
 * pattern that would otherwise be repeated in every page object.
 *
 * @example
 *   const btn = resolve(page, BookingLocators.passengersSubmit, BookingFallbacks.passengersForm);
 */
export function resolve(page: Page, primary: string, fallback?: string): Locator {
  const loc = page.locator(primary);
  return fallback ? loc.or(page.locator(fallback)) : loc;
}

/**
 * Thin wrapper for role-based locators — keeps page object call sites uniform
 * alongside attribute-based resolve() calls.
 *
 * @example
 *   const btn = resolveRole(page, 'button', { name: /continue/i });
 */
export function resolveRole(
  page: Page,
  role: Parameters<Page['getByRole']>[0],
  options?: Parameters<Page['getByRole']>[1],
): Locator {
  return page.getByRole(role, options);
}
