import { Page } from '@playwright/test';

export class OccupancyPage {
  // century-cypress has both a visible select (#field_enquiry_*) AND a hidden
  // input (name="adults") — the compound selector matches both. Use .first() to
  // suppress strict-mode violations; either element confirms the page loaded.
  // visioncruise only has the hidden input, so .first() is a no-op there.
  private readonly adultsSelect = this.page.locator('#field_enquiry_adults, input[name="adults"]').first();
  private readonly childrenSelect = this.page.locator('#field_enquiry_children, input[name="children"]').first();
  private readonly infantsSelect = this.page.locator('#field_enquiry_infants, input[name="infants"]').first();
  // "Continue" is rendered as a <a> link, not a <button>.
  private readonly continueLink = this.page.getByRole('link', { name: 'Continue' }).first();

  constructor(private readonly page: Page) {}

  get adults()   { return this.adultsSelect; }
  get children() { return this.childrenSelect; }
  get continueButton() { return this.continueLink; }

  async waitForLoad() {
    await this.page.waitForURL(/\/occupancy/);
    await this.page.waitForLoadState('domcontentloaded');
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
      await this.continueLink.scrollIntoViewIfNeeded();
      await this.continueLink.click({ noWaitAfter: true });
    }
    await this.page.waitForURL(/\/staterooms/, { timeout: 90_000 });
    return this;
  }
}
