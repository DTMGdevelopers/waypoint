import { Page } from '@playwright/test';
import { BookingLocators, BookingFallbacks } from '../locators/booking';
import { resolve } from '../helpers/locatorResolver';

export class OccupancyPage {
  private readonly adultsSelect = resolve(
    this.page, BookingLocators.occupancyAdults, BookingFallbacks.occupancyAdults,
  ).first();
  private readonly childrenSelect = resolve(
    this.page, BookingLocators.occupancyChildren, BookingFallbacks.occupancyChildren,
  ).first();
  private readonly infantsSelect = resolve(
    this.page, BookingLocators.occupancyInfants, BookingFallbacks.occupancyInfants,
  ).first();
  private readonly continueLink = resolve(this.page, BookingLocators.occupancyContinue)
    .or(this.page.getByRole('link', { name: /continue/i }))
    .first();

  constructor(private readonly page: Page) {}

  get adults()   { return this.adultsSelect; }
  get children() { return this.childrenSelect; }
  get continueButton() { return this.continueLink; }

  async waitForLoad() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.continueLink.waitFor({ state: 'visible', timeout: 30_000 });
    return this;
  }

  async setOccupancy(adults: number, children = 0, infants = 0) {
    await this.adultsSelect.selectOption(String(adults), { force: true });

    if (children > 0) {
      await this.childrenSelect.selectOption(String(children), { force: true });
      for (let i = 1; i <= children; i++) {
        await this.page.locator(`select[name="child_${i}_dob[day]"]`).selectOption('15', { force: true });
        await this.page.locator(`select[name="child_${i}_dob[month]"]`).selectOption('6', { force: true });
        await this.page.locator(`select[name="child_${i}_dob[year]"]`).selectOption('2015', { force: true });
      }
    }

    if (infants > 0) {
      await this.infantsSelect.selectOption(String(infants), { force: true });
    }

    return this;
  }

  async continue() {
    const href = await this.continueLink.getAttribute('href');
    if (href) {
      await this.page.goto(href, { waitUntil: 'domcontentloaded' });
    } else {
      await this.continueLink.click();
    }
    await resolve(this.page, BookingLocators.stateroomsContinue)
      .or(this.page.getByRole('link', { name: /continue/i }))
      .first()
      .waitFor({ state: 'visible', timeout: 90_000 });
    return this;
  }
}
