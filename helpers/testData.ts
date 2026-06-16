/**
 * Waypoint — Test Data
 *
 * All test data centralised here. Never hardcode data in spec files.
 * Values marked STAGING_ONLY must never be used against production.
 */

// ─── Passenger Data ──────────────────────────────────────────────────────────

export interface Passenger {
  title: 'Mr' | 'Mrs' | 'Ms' | 'Miss' | 'Dr';
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;          // ISO format: YYYY-MM-DD
  nationality: string;
  passportNumber?: string;
  passportExpiry?: string; // ISO format: YYYY-MM-DD
}

export const passengers = {
  /** Standard lead passenger — used across most booking journey tests */
  lead: {
    title: 'Mr',
    firstName: 'Test',
    lastName: 'Traveller',
    email: 'test.traveller@example.com',
    phone: '07700900000',
    dob: '1985-06-15',
    nationality: 'British',
    passportNumber: 'EX1234567',
    passportExpiry: '2030-12-01',
  } satisfies Passenger,

  /** Second adult passenger */
  secondAdult: {
    title: 'Mrs',
    firstName: 'Jane',
    lastName: 'Traveller',
    email: 'jane.traveller@example.com',
    phone: '07700900001',
    dob: '1987-03-22',
    nationality: 'British',
    passportNumber: 'EX7654321',
    passportExpiry: '2031-05-15',
  } satisfies Passenger,

  /** Child passenger (for tests requiring mixed party) */
  child: {
    title: 'Miss',
    firstName: 'Emily',
    lastName: 'Traveller',
    email: '',
    phone: '',
    dob: '2015-09-10',
    nationality: 'British',
    passportNumber: 'EX1122334',
    passportExpiry: '2029-09-10',
  } satisfies Passenger,

  /** Passenger with invalid data — used for validation tests */
  invalid: {
    title: 'Mr',
    firstName: '',            // Empty — triggers required field error
    lastName: 'X',
    email: 'not-an-email',   // Bad format — triggers email error
    phone: '123',            // Too short — triggers phone error
    dob: '2099-01-01',       // Future DOB — triggers age error
    nationality: '',
  } as Partial<Passenger>,
} as const;

// ─── Search Parameters ───────────────────────────────────────────────────────

export interface SearchParams {
  destination: string;
  departDate: string;   // ISO format: YYYY-MM-DD
  returnDate: string;
  adults: number;
  children?: number;
  infants?: number;
}

export const searches = {
  /** Standard 2-adult search — expected to return results in staging */
  standard: {
    destination: 'Mediterranean',
    departDate: '2025-08-01',
    returnDate: '2025-08-15',
    adults: 2,
    children: 0,
    infants: 0,
  } satisfies SearchParams,

  /** Family search with mixed party */
  family: {
    destination: 'Caribbean',
    departDate: '2025-07-20',
    returnDate: '2025-08-03',
    adults: 2,
    children: 1,
    infants: 0,
  } satisfies SearchParams,

  /** Solo traveller */
  solo: {
    destination: 'Norway',
    departDate: '2025-09-10',
    returnDate: '2025-09-17',
    adults: 1,
    children: 0,
    infants: 0,
  } satisfies SearchParams,
} as const;

// ─── Payment Test Cards (STAGING_ONLY) ──────────────────────────────────────
// These are publicly documented test credentials from each payment provider.
// NEVER use against a production environment.

export interface TestCard {
  number: string;
  expiry: string;
  cvc: string;
  postcode?: string;
  description: string;
}

export const testCards = {
  stripe: {
    success: {
      number: '4242 4242 4242 4242',
      expiry: '12/34',
      cvc: '123',
      postcode: 'SW1A 1AA',
      description: 'Stripe — successful payment',
    } satisfies TestCard,
    declinedCard: {
      number: '4000 0000 0000 0002',
      expiry: '12/34',
      cvc: '123',
      description: 'Stripe — card declined',
    } satisfies TestCard,
    insufficientFunds: {
      number: '4000 0000 0000 9995',
      expiry: '12/34',
      cvc: '123',
      description: 'Stripe — insufficient funds',
    } satisfies TestCard,
    requires3DS: {
      number: '4000 0027 6000 3184',
      expiry: '12/34',
      cvc: '123',
      description: 'Stripe — requires 3DS authentication',
    } satisfies TestCard,
  },
  worldpay: {
    success: {
      number: '4444 3333 2222 1111',
      expiry: '12/34',
      cvc: '123',
      description: 'Worldpay — successful payment',
    } satisfies TestCard,
    declined: {
      number: '4444 3333 2222 1100',
      expiry: '12/34',
      cvc: '123',
      description: 'Worldpay — declined',
    } satisfies TestCard,
  },
  braintree: {
    success: {
      number: '4111 1111 1111 1111',
      expiry: '12/25',
      cvc: '123',
      description: 'Braintree — successful payment',
    } satisfies TestCard,
  },
} as const;

// ─── Promo Codes ─────────────────────────────────────────────────────────────

export const promoCodes = {
  /** Valid code — should apply a discount */
  valid: 'TESTDISCOUNT10',
  /** Expired code — should surface an error */
  expired: 'EXPIRED2023',
  /** Invalid / nonexistent code */
  invalid: 'NOTACODE',
} as const;

// ─── Extras / Add-ons ────────────────────────────────────────────────────────

export const extras = {
  insurance: {
    /** Standard single-trip cover option label as it appears in the UI */
    singleTrip: 'Single Trip Insurance',
    annual: 'Annual Multi-Trip Insurance',
  },
  transfers: {
    return: 'Return Airport Transfer',
    oneWay: 'One-Way Airport Transfer',
  },
} as const;

// ─── Utility: future date helper ─────────────────────────────────────────────

/**
 * Returns an ISO date string N days from today.
 * Useful for generating valid departure dates at runtime.
 */
export function futureDateISO(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}
