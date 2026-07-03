/**
 * Stable data-cruiseappy selectors for all booking journey steps.
 *
 * Steps marked "planned" are not yet implemented on any theme — page objects
 * that reference them should scaffold the functionality as test.skip until the
 * attributes ship.
 */
export const BookingLocators = {
  // ── Cruise detail page ────────────────────────────────────────────────────
  bookCruise:     '[data-cruiseappy="book_cruise"]',
  callCruise:     '[data-cruiseappy="call_cruise"]',
  enquireCruise:  '[data-cruiseappy="enquire_cruise"]',
  generalEnquiry: '[data-cruiseappy="general_enquiry"]',

  // ── Occupancy step ────────────────────────────────────────────────────────
  occupancyAdults:   '[data-cruiseappy="occupancy_adults"]',
  occupancyChildren: '[data-cruiseappy="occupancy_children"]',
  occupancyInfants:  '[data-cruiseappy="occupancy_infants"]',
  occupancyContinue: '[data-cruiseappy="booking_occupancy"]',

  // ── Staterooms step ───────────────────────────────────────────────────────
  rateCodeSelect:     '[data-cruiseappy="booking_ratecodes"]',
  stateroomsContinue: '[data-cruiseappy="booking_staterooms"]',

  // ── Cabins step ───────────────────────────────────────────────────────────
  cabinsSubmit: '[data-cruiseappy="booking_deck_room"]',

  // ── Passenger details step ────────────────────────────────────────────────
  passengersSubmit: '[data-cruiseappy="booking_passengers"]',

  // ── Review & confirm step (planned — not yet on any theme) ────────────────
  tcCheckbox: '[data-cruiseappy="booking_tc"]',
  paymentCta: '[data-cruiseappy="booking_payment"]',

  // ── Post-payment confirmation (planned — not yet on any theme) ────────────
  bookingReference: '[data-cruiseappy="booking_reference"]',

  // ── Extras step (planned — not yet on any theme) ─────────────────────────
  extrasInsurance: '[data-cruiseappy="extras_insurance"]',
  extrasTransfer:  '[data-cruiseappy="extras_transfer"]',
  extrasTotal:     '[data-cruiseappy="extras_total"]',
} as const;

/**
 * CSS fallbacks for booking elements not yet annotated with data-cruiseappy
 * (🔴 Needed in CRUISEAPPY_ATTRIBUTES.md).
 */
export const BookingFallbacks = {
  bookCruise:        'main a[href*="occupancy"]',
  occupancyAdults:   '#field_enquiry_adults, input[name="adults"]',
  occupancyChildren: '#field_enquiry_children, input[name="children"]',
  occupancyInfants:  '#field_enquiry_infants, input[name="infants"]',
  cabinsContainer:   '#cabin-selection .row',
  cabinSelectSpan:   '.select-cabin',
  passengersForm:    'input[type="text"], input[type="email"]',
} as const;
