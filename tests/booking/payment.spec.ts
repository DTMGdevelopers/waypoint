import { test, expect } from '../../fixtures/bookingFixture';
import { PaymentPage } from '../../page-objects/PaymentPage';
import { ConfirmationPage } from '../../page-objects/ConfirmationPage';
import { testCards } from '../../helpers/testData';

/**
 * Payment handoff & booking confirmation
 *
 * All tests in this file are skipped until the booking_payment and
 * booking_reference data-cruiseappy attributes are implemented on the target
 * theme (currently 🔵 Planned in CRUISEAPPY_ATTRIBUTES.md).
 *
 * When implementing:
 *  1. Remove the top-level test.skip below.
 *  2. Replace the placeholder selectors in PaymentPage / ConfirmationPage.
 *  3. Confirm the payment provider for the target theme and uncomment the
 *     relevant provider assertion.
 *  4. NEVER run payment tests against a production environment.
 */

test.describe('Payment handoff', () => {
  test.skip(true, 'booking_payment attribute not yet implemented — see CRUISEAPPY_ATTRIBUTES.md');

  test('payment CTA is present on review page after accepting T&Cs', async ({ page }) => {
    const payment = new PaymentPage(page);
    await payment.waitForLoad();
    await payment.assertTcCheckboxPresent();
    await payment.acceptTerms();
    await expect(page.locator('[data-cruiseappy="booking_payment"]')).toBeEnabled();
  });

  test('payment gateway loads after proceeding to payment', async ({ page }) => {
    const payment = new PaymentPage(page);
    await payment.waitForLoad();
    await payment.proceedToPayment();
    const provider = process.env.PAYMENT_PROVIDER ?? 'stripe';
    const providerDomains: Record<string, string> = {
      stripe:     'stripe.com',
      worldpay:   'worldpay.com',
      braintree:  'braintreegateway.com',
    };
    const domain = providerDomains[provider] ?? provider;
    await payment.assertPaymentProvider(domain);
  });

  test('payment iframe is present for embedded provider integrations', async ({ page }) => {
    const payment = new PaymentPage(page);
    await payment.waitForLoad();
    await payment.proceedToPayment();
    await payment.assertIframePresent();
  });

  test('redirect-style integration arrives at provider hostname', async ({ page }) => {
    const payment = new PaymentPage(page);
    await payment.waitForLoad();
    await payment.proceedToPayment();
    const provider = process.env.PAYMENT_PROVIDER ?? 'stripe';
    const providerHostnames: Record<string, string> = {
      stripe:    'checkout.stripe.com',
      worldpay:  'secure.worldpay.com',
      braintree: 'api.braintreegateway.com',
    };
    const hostname = providerHostnames[provider] ?? provider;
    await payment.assertRedirect(hostname);
  });
});

test.describe('Booking confirmation', () => {
  test.skip(true, 'booking_reference attribute not yet implemented — see CRUISEAPPY_ATTRIBUTES.md');

  test('confirmation page shows a non-empty booking reference', async ({ page }) => {
    const confirmation = new ConfirmationPage(page);
    await confirmation.waitForLoad();
    await confirmation.assertBookingVisible();
  });

  test('booking reference is alphanumeric', async ({ page }) => {
    const confirmation = new ConfirmationPage(page);
    await confirmation.waitForLoad();
    const ref = await confirmation.getBookingReference();
    expect(ref.trim()).toMatch(/^[A-Z0-9\-]+$/i);
  });
});
