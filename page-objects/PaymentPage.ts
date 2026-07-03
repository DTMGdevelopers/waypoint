import { Page, expect } from '@playwright/test';
import { BookingLocators } from '../locators/booking';

/**
 * Scaffold: booking_payment and booking_tc attributes are planned (🔵) and not
 * yet implemented on any theme. All tests that use this page object must be
 * wrapped with test.skip until the attributes ship.
 *
 * See CRUISEAPPY_ATTRIBUTES.md — "Planned — add before building these steps".
 */
export class PaymentPage {
  private readonly paymentCta  = this.page.locator(BookingLocators.paymentCta);
  private readonly tcCheckbox  = this.page.locator(BookingLocators.tcCheckbox);

  constructor(private readonly page: Page) {}

  async waitForLoad() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.paymentCta.waitFor({ state: 'visible', timeout: 30_000 });
    return this;
  }

  async assertTcCheckboxPresent() {
    await expect(this.tcCheckbox).toBeVisible();
  }

  async acceptTerms() {
    await this.tcCheckbox.check();
    return this;
  }

  async proceedToPayment() {
    await this.acceptTerms();
    await this.paymentCta.click();
    await this.page.waitForLoadState('domcontentloaded');
    return this;
  }

  /**
   * Asserts the payment iframe is visible and, optionally, its src matches
   * the expected provider domain pattern.
   */
  async assertIframePresent(providerPattern?: RegExp) {
    const iframe = this.page.locator('iframe').first();
    await expect(iframe).toBeVisible();
    if (providerPattern) {
      const src = (await iframe.getAttribute('src')) ?? '';
      expect(src).toMatch(providerPattern);
    }
  }

  /**
   * Asserts the browser has redirected to the expected payment provider hostname
   * (used for redirect-style payment integrations).
   */
  async assertRedirect(expectedHostname: string) {
    const url = new URL(this.page.url());
    expect(url.hostname).toBe(expectedHostname);
  }

  /**
   * Asserts the payment provider domain appears in either the iframe src or the
   * current page URL — handles both embedded-iframe and redirect integrations.
   */
  async assertPaymentProvider(domain: string) {
    const hasIframe = (await this.page.locator('iframe').count()) > 0;
    if (hasIframe) {
      const src = (await this.page.locator('iframe').first().getAttribute('src')) ?? '';
      expect(src).toContain(domain);
    } else {
      expect(this.page.url()).toContain(domain);
    }
  }
}
