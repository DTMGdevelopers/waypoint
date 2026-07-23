/**
 * Stable data-cruiseappy selectors for the search page and result cards.
 */
export const SearchLocators = {
  // ── Search URL discovery ─────────────────────────────────────────────────
  /** CTA whose href is read at runtime to discover the per-theme search URL */
  searchCta: '[data-cruiseappy="search"]',

  // ── Search form fields ───────────────────────────────────────────────────
  /** Destination / region dropdown trigger */
  searchDestination: '[data-cruiseappy="search_destination"]',
  /** Cruise line dropdown trigger */
  searchCruiseLine:  '[data-cruiseappy="search_cruise_line"]',
  /** Combined departure date range picker trigger */
  searchDates:       '[data-cruiseappy="search_dates"]',
  /** Duration dropdown trigger */
  searchDuration:    '[data-cruiseappy="search_duration"]',
  /** Departure port dropdown trigger */
  searchPort:        '[data-cruiseappy="search_port"]',
  /** The dropdown panel that opens beneath a search-form-item trigger */
  searchDropdownPanel: '.search-form-dropdown',

  // ── Dropdown internals ───────────────────────────────────────────────────
  /** Text filter input inside an open dropdown panel */
  dropdownSearchInput: 'input.search',

  // ── Calendar ─────────────────────────────────────────────────────────────
  /** Month-picker panel rendered when the dates trigger is clicked */
  calendarPanel:     '.calendar-monthpicker',
  /** Year-group heading rows inside the calendar */
  calendarYearGroup: '.year-group',

  // ── Visible checkbox option labels (AJAX-filtered items excluded) ─────────
  /** Destination / region options that are currently available (not hidden by filter AJAX) */
  destinationOption: 'label:has(input[name="region"]):not(.d-none)',
  /** Cruise line options that are currently available */
  cruiseLineOption:  'label:has(input[name="cruiseline"]):not(.d-none)',
  /** Departure port options that are currently available */
  portOption:        'label:has(input[name="departport"]):not(.d-none)',

  // ── Result cards ─────────────────────────────────────────────────────────
  /** "View details" link on each AJAX-rendered result card */
  viewCruise: '[data-cruiseappy="view_cruise"]',
  /** Present on result card containers when the cruise is fully bookable */
  resultBookable: '[data-cruiseappy="result_bookable"]',
  /** Present on each cabin-grade price element when a real price is shown */
  resultPrice: '[data-cruiseappy="result_price"]',
  /** Loading overlay shown while search results are fetching */
  searchResultsLoading: '[data-cruiseappy="search_results_loading"]',

  // ── Composite helpers ────────────────────────────────────────────────────
  /**
   * Selects the view_cruise link only within cards that are both bookable and
   * priced — guarantees the detail page will show a Book Now CTA.
   */
  bookableWithPrice:
    ':has([data-cruiseappy="result_bookable"]):has([data-cruiseappy="result_price"]) [data-cruiseappy="view_cruise"]',
} as const;

/** Returns the CSS selector for the month label identified by its ISO date (e.g. '2027-01-01'). */
export function calendarMonthLabel(isoDate: string): string {
  return `label[for="sf_date_${isoDate}"]`;
}

/**
 * CSS fallbacks for search / results elements not yet annotated with
 * data-cruiseappy (🔴 Needed in CRUISEAPPY_ATTRIBUTES.md).
 */
export const SearchFallbacks = {
  /** JS-toggled loading overlay class used on legacy sites */
  searchResultsLoading: '#search-loading-overlay.is-visible',
  // ── Search form field fallbacks (id-based — stable in the starter theme) ─
  searchDestination: '#search-form-region',
  searchCruiseLine:  '#search-form-cruiseline',
  searchDates:       '#search-form-departs',
  searchDuration:    '#search-form-duration',
  searchPort:        '#search-form-departport',
} as const;
