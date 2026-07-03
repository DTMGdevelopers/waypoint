export interface ThemeConfig {
  /** Short identifier — used in CI artifact names and log output */
  name: string;
  /** Default target URL — overridden by the BASE_URL env var when set */
  baseUrl: string;
  /**
   * Non-standard search path for multilingual or custom-routed sites.
   * When set, the search page is reached via this path rather than by following
   * the data-cruiseappy="search" href from the homepage.
   * Example: CLL uses '/lv/meklesana/?traveltype=ocean'.
   */
  searchPath?: string;
  /**
   * Per-theme selector overrides — use only when a theme cannot add the standard
   * data-cruiseappy attribute and requires a different CSS selector for a specific
   * locator key.
   */
  locatorOverrides?: Record<string, string>;
  /** Feature flags — set to false to skip test steps that don't apply to this theme */
  features: {
    /** Extras / add-ons step (insurance, transfers) */
    extras: boolean;
    /** Payment handoff and confirmation steps */
    payment: boolean;
    /** Change stateroom mid-journey flow */
    changeStateroom: boolean;
  };
}
