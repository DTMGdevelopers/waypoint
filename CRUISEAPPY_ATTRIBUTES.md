# `data-cruiseappy` Attribute Reference

These attributes are the stable test hooks used by the Waypoint regression suite.
Add them to the matching elements in each theme.

**Do not rely on CSS classes or text content as test targets** — both change across
themes and languages. These attributes are the contract between the plugin and the
test suite. Treat their values like API endpoint names: changing one silently breaks
tests on every site.

---

## Status key

| | Meaning |
|---|---|
| ✅ Implemented | Present in the CLL theme; tests use it now |
| 🔴 Needed | Falling back to fragile CSS / form-field selectors — add these next |
| 🔵 Planned | Not yet tested; add before those booking steps are built |

---

## Global chrome

| Attribute | Element | Status | Notes |
|---|---|---|---|
| `data-cruiseappy="site_logo"` | The `<a>` wrapping the header logo `<img>` | 🔴 Needed | Currently matched by `header [class*="logo"]` |
| `data-cruiseappy="desktop_nav"` | The `<nav>` (or wrapper) visible on desktop | ✅ Implemented | |
| `data-cruiseappy="mobile_nav"` | The element serving as mobile nav — toggle, off-canvas panel, or `<header>` if no separate mobile pattern exists | ✅ Implemented | |
| `data-cruiseappy="search_form"` | The search widget container on the homepage | 🔴 Needed | Currently matched by `[class*="search_form"]` |
| `data-cruiseappy="search"` | The search submit link / CTA | ✅ Implemented | Used to discover the search URL on multilingual sites — the `href` is read at runtime so no URL path is hardcoded in the tests |

---

## Booking journey

Attributes follow the booking steps in order. Each step has a primary CTA that
advances the journey; tests wait for that CTA to be visible before interacting.

### Results page

| Attribute | Element | Status | Notes |
|---|---|---|---|
| `data-cruiseappy="view_cruise"` | Each "View details" link in AJAX-rendered result cards | ✅ Implemented | Set in `js/search.js` |
| `data-cruiseappy="result_price"` | Each cabin-grade price element within a result card (inside, outside, balcony, suite) — **only when a real price is shown** | 🔴 Needed | Omit the attribute when the element shows "call for price". Up to four per card. Tests use `:has([data-cruiseappy="result_price"])` to skip unpriced/enquiry-only cruises and select the first card with at least one real price. |
| `data-cruiseappy="search_results_loading"` | The loading overlay shown while results are fetching | 🔴 Needed | Currently matched by `#search-loading-overlay.is-visible`; the selector depends on a JS-toggled CSS class |

### Cruise detail page

| Attribute | Element | Status | Notes |
|---|---|---|---|
| `data-cruiseappy="book_cruise"` | The "Book Now" CTA — an `<a href="...occupancy...">` | ✅ Implemented | |
| `data-cruiseappy="call_cruise"` | The "Call us" CTA | ✅ Implemented | |
| `data-cruiseappy="enquire_cruise"` | The "Enquire" button | ✅ Implemented | |
| `data-cruiseappy="general_enquiry"` | The header general-enquiry button | ✅ Implemented | |

### Occupancy page

| Attribute | Element | Status | Notes |
|---|---|---|---|
| `data-cruiseappy="occupancy_adults"` | The adults `<select>` or `<input>` | 🔴 Needed | Currently matched by `#field_enquiry_adults, input[name="adults"]` — WordPress form field IDs are fragile |
| `data-cruiseappy="occupancy_children"` | The children `<select>` or `<input>` | 🔴 Needed | Currently matched by `#field_enquiry_children, input[name="children"]` |
| `data-cruiseappy="occupancy_infants"` | The infants `<select>` or `<input>` (if the site supports it) | 🔴 Needed | Currently matched by `#field_enquiry_infants, input[name="infants"]` |
| `data-cruiseappy="booking_occupancy"` | The "Continue" CTA link (`href` pointing to the staterooms step) | ✅ Implemented | |

### Staterooms page

| Attribute | Element | Status | Notes |
|---|---|---|---|
| `data-cruiseappy="booking_ratecodes"` | Each rate-code / stateroom-type select button | ✅ Implemented | Rendered by `js/booking.js` after AJAX |
| `data-cruiseappy="booking_staterooms"` | The "Continue" CTA — an `<a>` with `data-href` (JS sets `href` after auto-selecting a grade) | ✅ Implemented | **Important:** use `data-href` as the attribute, not `href`. JS populates `href` ~100ms after the AJAX response; tests wait for it before navigating |

### Cabin / deck & room page

| Attribute | Element | Status | Notes |
|---|---|---|---|
| `data-cruiseappy="booking_deck_room"` | The `<button type="submit">` that advances to the passengers step | ✅ Implemented | |

### Passenger details form

| Attribute | Element | Status | Notes |
|---|---|---|---|
| `data-cruiseappy="booking_passengers"` | The `<button type="submit">` on the passenger form | ✅ Implemented | Tests wait for this to be visible as confirmation the form has rendered |

---

## Planned — add before building these steps

These steps are in the test plan but page objects don't exist yet.
Add these attributes now so the selectors are ready when we get there.

| Attribute | Element | Step |
|---|---|---|
| `data-cruiseappy="extras_insurance"` | Insurance on/off toggle | Extras / add-ons |
| `data-cruiseappy="extras_transfer"` | Transfer selection control | Extras / add-ons |
| `data-cruiseappy="extras_total"` | Running total price panel | Extras / add-ons |
| `data-cruiseappy="booking_tc"` | T&Cs checkbox | Review & confirm |
| `data-cruiseappy="booking_payment"` | "Proceed to Payment" CTA | Review & confirm |
| `data-cruiseappy="booking_reference"` | Booking reference number on the confirmation page | Post-payment confirmation |

---

## Rules

1. **Put the attribute on the interactive element itself** — the `<a>`, `<button>`,
   `<input>`, or `<select>` — not a wrapper `<div>`.

2. **One attribute per meaningful action or landmark.** Don't tag decorative wrappers.

3. **The value is a contract.** All values use underscores (`book_cruise`, not `book-cruise`).
   Changing any value breaks tests silently across every site. Treat these like REST endpoint paths.

4. **One set of attributes across all themes.** The same attribute must work
   identically on CLL, visioncruise, and century-cypress. If a site skips a step
   (e.g. no cabin selection), simply omit the attribute for that step — the tests
   handle absent steps gracefully.

5. **Don't add the attribute to elements that are conditionally hidden.**
   If the element is hidden on mobile (e.g. `d-none d-lg-block`), the test will
   see it as not visible. Use `mobile_nav` / `desktop_nav` as the pattern:
   separate attributes for separate visible instances.
