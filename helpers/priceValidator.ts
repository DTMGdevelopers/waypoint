import { Locator, expect } from '@playwright/test';

/**
 * Parses a price string from the UI into a plain number.
 * Handles common formatting variants:
 *   £1,234.56 · €1.234,56 · $1234 · "1,234.00 GBP"
 */
export function parsePrice(text: string): number {
  // Strip everything except digits, dots, and commas
  const cleaned = text.replace(/[^0-9.,]/g, '');

  // European format: 1.234,56 — groups by dot, decimal by comma
  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(cleaned)) {
    return parseFloat(cleaned.replace(/\./g, '').replace(',', '.'));
  }

  // UK/US format: 1,234.56 — groups by comma, decimal by dot
  return parseFloat(cleaned.replace(/,/g, ''));
}

/**
 * Reads the text content of a Playwright Locator and returns the parsed price.
 * Throws if the element has no visible text or the text cannot be parsed.
 */
export async function extractPrice(locator: Locator): Promise<number> {
  const text = (await locator.textContent()) ?? '';
  const price = parsePrice(text);
  if (isNaN(price)) {
    throw new Error(`Could not parse a price from text: "${text}"`);
  }
  return price;
}

/**
 * Asserts that two prices match within the given tolerance (default ±£0.01).
 * Throws a descriptive error on mismatch.
 */
export function assertPricesMatch(
  a: number,
  b: number,
  label = '',
  tolerance = 0.01,
): void {
  const diff = Math.abs(a - b);
  if (diff > tolerance) {
    throw new Error(
      `Price mismatch${label ? ` (${label})` : ''}: ${a} vs ${b} — diff ${diff.toFixed(2)} exceeds tolerance ${tolerance}`,
    );
  }
}

/**
 * Tracks prices captured at named booking journey steps and asserts they remain
 * consistent (within tolerance) when assertConsistent() is called.
 *
 * Prices before extras are added should be recorded as one checkpoint group;
 * prices after extras as another — call assertConsistent() for each group separately.
 *
 * @example
 *   const prices = new PriceJourney();
 *   prices.record('search-result', 899.00);
 *   prices.record('cruise-detail', 899.00);
 *   prices.record('passenger-summary', 899.00);
 *   prices.assertConsistent(); // passes — all within ±£0.01 of the first entry
 */
export class PriceJourney {
  private readonly entries: Array<{ step: string; price: number }> = [];

  /** Record a price observed at the named step. */
  record(step: string, price: number): void {
    this.entries.push({ step, price });
  }

  /**
   * Asserts all recorded prices match the first recorded price within tolerance.
   * No-ops if fewer than two entries have been recorded.
   */
  assertConsistent(tolerance = 0.01): void {
    if (this.entries.length < 2) return;
    const [baseline, ...rest] = this.entries;
    for (const entry of rest) {
      assertPricesMatch(
        baseline!.price,
        entry.price,
        `${baseline!.step} → ${entry.step}`,
        tolerance,
      );
    }
  }

  /** Returns all recorded entries — useful for debugging failing assertions. */
  getSummary(): ReadonlyArray<{ step: string; price: number }> {
    return [...this.entries];
  }
}
