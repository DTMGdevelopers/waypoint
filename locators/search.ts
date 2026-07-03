/**
 * Stable data-cruiseappy selectors for the search page and result cards.
 */
export const SearchLocators = {
  // ── Search URL discovery ─────────────────────────────────────────────────
  /** CTA whose href is read at runtime to discover the per-theme search URL */
  searchCta: '[data-cruiseappy="search"]',

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

/**
 * CSS fallbacks for search / results elements not yet annotated with
 * data-cruiseappy (🔴 Needed in CRUISEAPPY_ATTRIBUTES.md).
 */
export const SearchFallbacks = {
  /** JS-toggled loading overlay class used on legacy sites */
  searchResultsLoading: '#search-loading-overlay.is-visible',
} as const;
