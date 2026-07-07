import { Page } from '@playwright/test';
import { BookingLocators, BookingFallbacks } from '../locators/booking';
import { resolve } from '../helpers/locatorResolver';

export class CabinsPage {
  private readonly continueBtn = resolve(this.page, BookingLocators.cabinsSubmit)
    .or(this.page.getByRole('button', { name: /continue/i }))
    .or(this.page.getByRole('link', { name: /continue/i }))
    .first();

  // Select button text varies by theme language — English "Select", Latvian "Izvēlies", etc.
  private readonly selectBtn = this.page
    .locator(BookingFallbacks.cabinSelectSpan)
    .or(this.page.getByRole('button', { name: /^(select|izvēlies)$/i }))
    .first();

  constructor(private readonly page: Page) {}

  async waitForLoad() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.continueBtn.waitFor({ state: 'visible', timeout: 30_000 });
    return this;
  }

  async selectFirstCabin() {
    await this.page.locator(BookingFallbacks.cabinsContainer).first()
      .waitFor({ state: 'visible', timeout: 30_000 })
      .catch(() => null);

    if (await this.selectBtn.count() > 0) {
      await this.selectBtn.click();
    }

    await this.continueBtn.click();

    await resolve(this.page, BookingLocators.passengersSubmit, BookingFallbacks.passengersForm)
      .first()
      .waitFor({ state: 'visible', timeout: 90_000 });

    return this;
  }
}