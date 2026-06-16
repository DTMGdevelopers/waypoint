import { test as base } from '@playwright/test';
import { SearchPage } from '../page-objects/SearchPage';
import { ResultsPage } from '../page-objects/ResultsPage';
import { SelectionPage } from '../page-objects/SelectionPage';
import { PassengerFormPage } from '../page-objects/PassengerFormPage';
import { ExtrasPage } from '../page-objects/ExtrasPage';
import { ReviewPage } from '../page-objects/ReviewPage';
import { PaymentPage } from '../page-objects/PaymentPage';

type BookingFixtures = {
  searchPage: SearchPage;
  resultsPage: ResultsPage;
  selectionPage: SelectionPage;
  passengerFormPage: PassengerFormPage;
  extrasPage: ExtrasPage;
  reviewPage: ReviewPage;
  paymentPage: PaymentPage;
};

export const test = base.extend<BookingFixtures>({
  searchPage: async ({ page }, use) => use(new SearchPage(page)),
  resultsPage: async ({ page }, use) => use(new ResultsPage(page)),
  selectionPage: async ({ page }, use) => use(new SelectionPage(page)),
  passengerFormPage: async ({ page }, use) => use(new PassengerFormPage(page)),
  extrasPage: async ({ page }, use) => use(new ExtrasPage(page)),
  reviewPage: async ({ page }, use) => use(new ReviewPage(page)),
  paymentPage: async ({ page }, use) => use(new PaymentPage(page)),
});

export { expect } from '@playwright/test';
