/**
 * Stable data-cruiseappy selectors for the search results / listing page.
 *
 * NOTE: Filter, sort, and pagination controls are not yet attributed (🔴 Needed).
 * ResultsFallbacks provides CSS selectors until those attributes are added to themes.
 */
export const ResultsLocators = {
  viewCruise:     '[data-cruiseappy="view_cruise"]',
  resultBookable: '[data-cruiseappy="result_bookable"]',
  resultPrice:    '[data-cruiseappy="result_price"]',
  loadingOverlay: '[data-cruiseappy="search_results_loading"]',
} as const;

/**
 * CSS fallbacks for results-page elements not yet annotated with data-cruiseappy.
 * Update each entry to use an attribute selector once the theme is patched.
 */
export const ResultsFallbacks = {
  loadingOverlay: '#search-loading-overlay.is-visible',
  filterPanel:    '[class*="filter"]:not(script), [class*="search-filters"]',
  sortControl:    'select[name*="sort"], [class*="sort-by"] select',
  pagination:     '.pagination, [class*="pagination"], nav[aria-label*="pagination" i]',
  priceFilter:    '[class*="price-filter"], [class*="price-range"]',
  durationFilter: '[class*="duration-filter"]',
  categoryFilter: '[class*="category-filter"], [class*="cruise-type"]',
} as const;
