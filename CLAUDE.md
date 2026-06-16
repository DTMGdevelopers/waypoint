# Regression Testing Suite — Claude Code Instructions

## Project Overview

This project is a **Playwright-based regression testing suite** for a travel/booking website.
It covers cross-browser desktop, mobile emulation, and a full booking journey up to the payment handoff.

---

## Tech Stack

- **Test framework:** Playwright (TypeScript)
- **Node version:** 20+
- **Package manager:** npm
- **Reporting:** Playwright HTML report + optional Allure
- **CI target:** GitHub Actions

---

## Project Structure

```
/
├── CLAUDE.md
├── playwright.config.ts        # Browser projects, base URL, timeouts
├── package.json
├── tsconfig.json
├── .env.example                # BASE_URL, TEST_USER_EMAIL, TEST_USER_PASSWORD, etc.
├── tests/
│   ├── smoke/
│   │   └── homepage.spec.ts    # Fast smoke checks — run on every deploy
│   ├── booking/
│   │   ├── search.spec.ts      # Search form, results page
│   │   ├── selection.spec.ts   # Selecting a product/cabin/room
│   │   ├── passengers.spec.ts  # Passenger details form
│   │   ├── extras.spec.ts      # Add-ons, insurance, transfers
│   │   ├── review.spec.ts      # Order summary / review step
│   │   └── payment.spec.ts     # Payment handoff assertion (no real cards)
│   ├── visual/
│   │   └── snapshots.spec.ts   # Visual regression screenshots
│   └── accessibility/
│       └── a11y.spec.ts        # axe-core accessibility checks
├── fixtures/
│   └── bookingFixture.ts       # Shared page objects and test data factories
├── page-objects/
│   ├── SearchPage.ts
│   ├── ResultsPage.ts
│   ├── SelectionPage.ts
│   ├── PassengerFormPage.ts
│   ├── ExtrasPage.ts
│   ├── ReviewPage.ts
│   └── PaymentPage.ts
├── helpers/
│   ├── testData.ts             # Test passenger data, promo codes, card numbers
│   └── auth.ts                 # Login helper / stored auth state
└── .github/
    └── workflows/
        └── regression.yml      # CI pipeline definition
```

---

## Browser Matrix

Defined in `playwright.config.ts` as named projects:

| Project name     | Engine   | Form factor     |
|------------------|----------|-----------------|
| `chromium`       | Chromium | Desktop 1280px  |
| `firefox`        | Firefox  | Desktop 1280px  |
| `webkit`         | WebKit   | Desktop 1280px  |
| `mobile-chrome`  | Chromium | Pixel 5 (Android emulation) |
| `mobile-safari`  | WebKit   | iPhone 14 (iOS emulation)   |

Smoke tests run on all five. The full regression suite runs on `chromium`, `webkit`, and `mobile-safari` by default to keep runtime reasonable.

---

## Booking Journey Test Coverage

Each step must be independently testable. Use page objects — never inline selectors in test files.

### Steps and assertions

1. **Search** (`search.spec.ts`)
   - Fill destination, departure date, return date, passenger count
   - Assert results page loads with at least one result
   - Assert URL reflects search parameters

2. **Results** (`selection.spec.ts`)
   - Filter by price / duration / category
   - Assert filtered results update
   - Select first available result
   - Assert navigation to product detail page

3. **Product / Cabin Selection** (`selection.spec.ts`)
   - Assert pricing breakdown visible
   - Select a cabin/room type
   - Assert "Continue" or "Book Now" CTA is enabled
   - Assert availability warnings surface correctly (e.g. last 2 remaining)

4. **Passenger Details Form** (`passengers.spec.ts`)
   - Fill lead passenger: title, first name, last name, DOB, email, phone
   - Fill additional passengers if applicable
   - Validate required field errors (submit empty, assert error messages)
   - Validate email format, DOB range, passport expiry
   - Assert progression to next step on valid submission

5. **Extras / Add-ons** (`extras.spec.ts`)
   - Toggle insurance on/off — assert price updates
   - Select transfer option — assert price updates
   - Assert total running price in summary panel updates correctly
   - Test skipping all extras (continue without adding)

6. **Review & Confirm** (`review.spec.ts`)
   - Assert all previously entered data is summarised correctly
   - Assert correct total price (including any extras)
   - Assert T&Cs checkbox present and required
   - Assert "Proceed to Payment" CTA is present and enabled after T&Cs accepted

7. **Payment Handoff** (`payment.spec.ts`)
   - Assert redirect to payment gateway OR payment iframe loads within page
   - If iframe: assert iframe src matches expected payment provider domain
   - If redirect: assert new URL hostname matches payment provider
   - **Do not enter card details against production**
   - In staging: use provider test card numbers (defined in `helpers/testData.ts`)
   - Assert post-payment confirmation page loads with booking reference visible

---

## Page Object Conventions

- One class per page/step
- All selectors defined as private `readonly` properties at the top of the class
- Methods return `this` for chaining where appropriate
- Navigation methods (`goto()`) handle waiting for page load
- No `page.waitForTimeout()` — use `waitForSelector`, `waitForURL`, or `waitForLoadState`

```typescript
// Example pattern
export class SearchPage {
  private readonly destinationInput = this.page.getByLabel('Destination');
  private readonly searchButton = this.page.getByRole('button', { name: 'Search' });

  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/search');
    await this.page.waitForLoadState('networkidle');
    return this;
  }

  async search(destination: string, departDate: string, returnDate: string) {
    await this.destinationInput.fill(destination);
    // ... etc
    await this.searchButton.click();
    await this.page.waitForURL(/\/results/);
    return this;
  }
}
```

---

## Test Data Rules

- All test data lives in `helpers/testData.ts` — never hardcoded in test files
- Use realistic but fake passenger data (do not use real names or real emails)
- Payment test cards live here too, clearly commented with provider name
- Environment-specific values (base URL, credentials) come from `.env` via `process.env`
- Never commit `.env` — only commit `.env.example` with placeholder values

```typescript
// helpers/testData.ts example shape
export const passengers = {
  lead: {
    title: 'Mr',
    firstName: 'Test',
    lastName: 'Traveller',
    email: 'test.traveller@example.com',
    phone: '07700900000',
    dob: '1985-06-15',
  }
};

export const testCards = {
  stripe: { number: '4242424242424242', expiry: '12/34', cvc: '123' },
  worldpay: { number: '4444333322221111', expiry: '12/34', cvc: '123' },
};
```

---

## Environment Configuration

```bash
# .env.example
BASE_URL=https://staging.yoursite.com
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=supersecret
PAYMENT_PROVIDER=stripe     # stripe | worldpay | braintree
HEADLESS=true
```

Load in `playwright.config.ts` via `dotenv`:
```typescript
import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();
```

---

## Commands

```bash
# Install
npm install
npx playwright install

# Run all tests (all browser projects)
npx playwright test

# Run smoke tests only
npx playwright test tests/smoke/

# Run booking journey only
npx playwright test tests/booking/

# Run on a specific browser project
npx playwright test --project=webkit

# Run mobile only
npx playwright test --project=mobile-chrome --project=mobile-safari

# Run headed (visible browser window) for debugging
npx playwright test --headed

# Debug a specific test interactively
npx playwright test tests/booking/passengers.spec.ts --debug

# Open last HTML report
npx playwright show-report

# Update visual regression snapshots
npx playwright test tests/visual/ --update-snapshots
```

---

## CI Pipeline (GitHub Actions)

The workflow file at `.github/workflows/regression.yml` should:

1. Trigger on: `push` to `main`, `pull_request` to `main`, and `schedule` (nightly)
2. Install Node 20
3. Install dependencies and Playwright browsers
4. Run smoke tests first — fail fast
5. Run full regression suite with sharding (4 shards) for speed
6. Upload HTML report as an artifact
7. Post a Slack/Teams notification on failure (optional)

Key config for sharding:
```yaml
strategy:
  matrix:
    shard: [1, 2, 3, 4]
steps:
  - run: npx playwright test --shard=${{ matrix.shard }}/4
```

---

## What NOT to Do

- ❌ Never use `page.waitForTimeout()` — use proper async waits
- ❌ Never hardcode selectors in test files — use page objects
- ❌ Never commit `.env` files or real credentials
- ❌ Never run payment tests against the production environment
- ❌ Never use `test.only` in committed code
- ❌ Never depend on test execution order — each test must be independently runnable
- ❌ Never assert on text that is likely to change (prices, copy) without a data-driven source

---

## Definition of Done for Each Test

- [ ] Passes on all configured browser projects
- [ ] Passes in headless and headed mode
- [ ] No hardcoded selectors or test data
- [ ] Descriptive test name that reads as a user story
- [ ] Assertions are specific (not just `toBeTruthy`)
- [ ] Test is isolated — does not depend on another test's state
