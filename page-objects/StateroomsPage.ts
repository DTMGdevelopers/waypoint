import { Page } from '@playwright/test';

export class StateroomsPage {
  // "Continue" is an <a> link (not a button) already carrying the selected cabin code.
  private readonly continueLink = this.page.getByRole('link', { name: 'Continue' }).first();
  private readonly selectButtons = this.page.getByRole('button', { name: 'Select' });

  constructor(private readonly page: Page) {}

  async waitForLoad() {
    await this.page.waitForLoadState('domcontentloaded');
    // Dev site has no "Staterooms" section heading — wait for the Continue link which
    // appears only once all cabin options have rendered.
    await this.continueLink.waitFor({ state: 'visible', timeout: 90_000 });
    return this;
  }

  async getCabinCount(): Promise<number> {
    return this.selectButtons.count();
  }

  async continue() {
    const href = await this.continueLink.getAttribute('href');
    if (href) {
      await this.page.goto(href, { waitUntil: 'domcontentloaded' });
    } else {
      await this.continueLink.scrollIntoViewIfNeeded();
      await this.continueLink.click({ noWaitAfter: true });
    }
    // "Sail Away" guarantee staterooms skip /cabins/ and go straight to /passengers/.
    await this.page.waitForURL(/\/(cabins|passengers)\//, { timeout: 90_000 });
    return this;
  }
}
