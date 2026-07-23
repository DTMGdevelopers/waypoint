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

  // ── Sort ──────────────────────────────────────────────────────────────────
  /** Primary sort <select> (name="sort") rendered by the automation theme */
  sortSelect:     'select[name="sort"]',

  // ── Results count ─────────────────────────────────────────────────────────
  /** "X cruises found" paragraph */
  totalResults:   '.total-results',

  // ── Product cards ─────────────────────────────────────────────────────────
  /** Outermost card container — one per result */
  productCard:         '.search-item',
  /** H3 cruise title inside a card */
  cardTitle:           '.search-item h3',
  /** "X nights | date | ship" subtitle */
  cardSubtitle:        '.search-item-subtitle',
  /** Cruise type badge container ("Cruise Only", "Fly Cruise", etc.) */
  cardCruiseType:      '.fly-cruise-indicator',
  /** Itinerary port-list container */
  cardItinerary:       '.search-item-itinerary',
  /** "View full itinerary" expand trigger */
  cardViewItinerary:   '.excerpt-show-more',
  /** Cabin-grade price grid */
  cardPrices:          '.search-item-prices',
  /** Cruise line logo link / image container */
  cardCruiselineLogo:  '.cruiseline-image',

  // ── Load more ─────────────────────────────────────────────────────────────
  loadMoreButton:  'button.search-more',

  // ── Left-panel filters ────────────────────────────────────────────────────
  /** Any filter section (scoped by data-filter attribute) */
  filterSection:      '[data-filter]',
  /** Clickable checkbox label inside a filter section */
  filterItem:         '.search-filter label.checkbox',
  /** Name span inside a filter item */
  filterItemName:     '.search-filter label.checkbox .name',
  /** Count/total span inside a filter item */
  filterItemCount:    '.search-filter label.checkbox .total',
  /** A checked/active filter item */
  filterItemChecked:  '.search-filter label.checkbox.checked',

  // ── Filter section internals (relative — use with .locator() on a section) ─
  /** Checkbox label within a filter section */
  filterLabel:     'label.checkbox',
  /** "Show more" expand link inside a filter section */
  filterShowMore:  '*:has-text("Show more")',
  /** Name span inside a filter label */
  filterLabelName: '.name',
  /** Count span inside a filter label */
  filterLabelTotal: '.total',

  // ── Card internal selectors (relative — use with .locator() on a .search-item) ─
  /** H3 title heading */
  cardTitleHeading: 'h3',
  /** Anchor link inside the H3 title */
  cardTitleLink:    'h3 a',
  /** "Sailing from" port paragraph */
  cardSailingFrom:  'p:has-text("Sailing from")',
  /** Cruise line logo image */
  cardCruiselineLogoImg: '.cruiseline-image img',
  /** Hero background image container */
  cardHeroImage:    '.search-item-image',
} as const;

/** Returns the CSS selector for a specific filter section (e.g. filterSectionFor('regions')). */
export function filterSectionFor(dataFilter: string): string {
  return `[data-filter="${dataFilter}"]`;
}

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
