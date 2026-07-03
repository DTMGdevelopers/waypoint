import { Page, expect } from '@playwright/test';
import { BookingLocators, BookingFallbacks } from '../locators/booking';
import { resolve } from '../helpers/locatorResolver';
import type { Passenger } from '../helpers/testData';

export class PassengerFormPage {
  private readonly submitButton = resolve(
    this.page,
    BookingLocators.passengersSubmit,
    BookingFallbacks.passengersForm,
  ).first();

  constructor(private readonly page: Page) {}

  async waitForLoad() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.submitButton.waitFor({ state: 'visible', timeout: 90_000 });
    return this;
  }

  async isLoaded(): Promise<boolean> {
    return this.submitButton.isVisible();
  }

  async getFieldCount(): Promise<number> {
    return this.page.locator('input[type="text"], input[type="email"], input[type="tel"], select').count();
  }

  /**
   * Fills a single passenger's fields. index=0 targets the lead passenger.
   * Skips any field whose value is undefined in the provided object.
   */
  async fillPassenger(passenger: Partial<Passenger>, index = 0): Promise<this> {
    const n = index + 1;
    const s = (base: string) =>
      `[name*="${base}_${n}"], [name*="${base}${n}"], [id*="${base}_${n}"], [id*="${base}${n}"]`;

    if (passenger.title) {
      const titleSel = index === 0
        ? 'select[name*="title"], select[id*="title"], select[name*="salutation"]'
        : `${s('title')}, select[name*="title_${n}"]`;
      await this.page.locator(titleSel).first()
        .selectOption(passenger.title, { force: true }).catch(() => {});
    }
    if (passenger.firstName !== undefined) {
      const firstSel = index === 0
        ? 'input[name*="first"], input[id*="first"], input[name*="firstname"]'
        : s('first');
      await this.page.locator(firstSel).first().fill(passenger.firstName);
    }
    if (passenger.lastName !== undefined) {
      const lastSel = index === 0
        ? 'input[name*="last"], input[id*="last"], input[name*="surname"]'
        : s('last');
      await this.page.locator(lastSel).first().fill(passenger.lastName);
    }
    if (passenger.email !== undefined) {
      await this.page.locator('input[type="email"]').first().fill(passenger.email);
    }
    if (passenger.phone !== undefined) {
      await this.page.locator('input[type="tel"], input[name*="phone"]').first()
        .fill(passenger.phone).catch(() => {});
    }
    return this;
  }

  async submitForm(): Promise<this> {
    await this.submitButton.scrollIntoViewIfNeeded();
    await this.submitButton.click();
    return this;
  }

  /**
   * Returns the text of all visible inline error messages.
   * Covers Bootstrap's .invalid-feedback, WP help-block, and generic [role=alert].
   */
  async getErrorMessages(): Promise<string[]> {
    const errors = await this.page
      .locator(
        '.invalid-feedback:visible, .help-block:visible, ' +
        '[class*="error-message"]:visible, [role="alert"]:visible, ' +
        '.wpcf7-not-valid-tip:visible',
      )
      .allTextContents();
    return errors.map((t) => t.trim()).filter(Boolean);
  }

  async assertHasErrors(): Promise<void> {
    const errors = await this.getErrorMessages();
    expect(errors.length, 'Expected validation errors to be present after invalid submission').toBeGreaterThan(0);
  }
}
