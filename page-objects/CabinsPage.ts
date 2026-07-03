import { Page } from '@playwright/test';
import { BookingLocators, BookingFallbacks } from '../locators/booking';
import { resolve } from '../helpers/locatorResolver';

export class CabinsPage {
  private readonly selectButtons = this.page.getByRole('button', { name: 'Select' });
  private readonly continueBtn = resolve(this.page, BookingLocators.cabinsSubmit)
    .or(this.page.getByRole('button', { name: /continue/i }))
    .or(this.page.getByRole('link', { name: /continue/i }))
    .first();

  constructor(private readonly page: Page) {}

  async waitForLoad() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.continueBtn.waitFor({ state: 'visible', timeout: 30_000 });
    return this;
  }

  async selectFirstCabin() {
    await this.page.locator(BookingFallbacks.cabinsContainer).first()
      .waitFor({ state: 'visible', timeout: 30_000 }).catch(() => null);

    const selectCabin = this.page.locator(BookingFallbacks.cabinSelectSpan).first();
    const selectBtn   = this.page.getByRole('button', { name: /^select$/i }).first();

    if (await selectCabin.count() > 0) {
      await selectCabin.click({ noWaitAfter: true });
    } else if (await selectBtn.count() > 0) {
      await selectBtn.click({ noWaitAfter: true });
    }
    // booking_deck_room form submit: server assigns cabin from the grade
    await this.continueBtn.scrollIntoViewIfNeeded();
    await this.continueBtn.click({ noWaitAfter: true });
    await resolve(this.page, BookingLocators.passengersSubmit, BookingFallbacks.passengersForm)
      .first()
      .waitFor({ state: 'visible', timeout: 90_000 });
    return this;
  }
}
