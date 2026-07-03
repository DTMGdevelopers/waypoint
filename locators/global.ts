/**
 * Stable data-cruiseappy selectors for global chrome elements.
 * Present on every theme regardless of booking step.
 */
export const GlobalLocators = {
  siteLogo:   '[data-cruiseappy="site_logo"]',
  desktopNav: '[data-cruiseappy="desktop_nav"]',
  mobileNav:  '[data-cruiseappy="mobile_nav"]',
  searchForm: '[data-cruiseappy="search_form"]',
  /** CTA whose href is read at runtime to discover the search URL */
  searchCta:  '[data-cruiseappy="search"]',
} as const;

/**
 * CSS fallbacks for themes where the data-cruiseappy attribute is not yet applied
 * (🔴 Needed status in CRUISEAPPY_ATTRIBUTES.md).
 */
export const GlobalFallbacks = {
  siteLogo:   'header [class*="logo"]',
  searchForm: '[class*="search_form"], [class*="search-form"]',
} as const;
