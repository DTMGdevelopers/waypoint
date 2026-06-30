# `data-cruiseappy` Implementation Guide

This document covers every attribute the Waypoint regression suite needs.
The CLL theme is the reference implementation — if in doubt, check how it is
done there.

**Rules:**
- Values use **underscores**, never hyphens (`book_cruise` not `book-cruise`)
- Put the attribute on the **interactive element itself** — the `<a>`, `<button>`,
  `<input>`, or `<select>` — not a wrapper `<div>` (except where noted below)
- One consistent set of attributes across all themes — the tests are shared

---

## 1. Global chrome

### Header logo
Put on the `<a>` that wraps the logo `<img>`.

```html
<a href="/" data-cruiseappy="site_logo">
  <img src="logo.png" alt="Site name">
</a>
```

### Desktop navigation
Put on the `<nav>` (or its closest wrapper) that is visible on desktop.

```html
<nav data-cruiseappy="desktop_nav">...</nav>
```

### Mobile navigation
Put on whatever element acts as the mobile nav — the hamburger toggle, the
off-canvas panel, or `<header>` if the site has no separate mobile pattern.

```html
<button data-cruiseappy="mobile_nav" class="navbar-toggler">...</button>
```

### General enquiry button
Put on the header-level enquiry `<button>` or `<a>`.

```html
<button data-cruiseappy="general_enquiry">General Enquiry</button>
```

---

## 2. Search form

### Search widget container
Put on the outermost `<form>` or container `<div>` of the search widget.

```html
<form data-cruiseappy="search_form" ...>...</form>
```

### Search submit link
Put on the `<a>` that submits the search and navigates to the results page.
The test reads the `href` from this element to discover the search URL, so
the `href` must be present even before the form is submitted.

```html
<a href="/search/?traveltype=ocean" data-cruiseappy="search" class="btn btn-primary">
  Search
</a>
```

---

## 3. Search results page

These attributes are set inside the AJAX result-rendering JavaScript
(equivalent of `js/search.js` in CLL).

### Result card container
Put `data-cruiseappy` on the outer `<div>` of each result card.
Set to `result_bookable` when the cruise is bookable **and** has a real price
(`bookable === true && prices.cheapest > 0`). Set to `result_enquiry`
otherwise. The test uses this to skip enquiry-only results.

```javascript
// In your AJAX result-rendering JS:
const bookable = item.bookable === true && prices.cheapest > 0;
html += `<div data-cruiseappy="${bookable ? 'result_bookable' : 'result_enquiry'}" class="result-card">`;
```

### Price element
Put on each cabin-grade price `<span>` **only when showing a real price**.
Omit it when the element shows "call for price". Up to four per card
(inside, outside, balcony, suite).

```javascript
if (prices[type] > 0) {
  html += `<span data-cruiseappy="result_price">${formatMoney(prices[type])}</span>`;
}
```

### View details link
Put on the "View details" / "More details" `<a>` in each result card.

```javascript
html += `<a href="${cruise.link}" data-cruiseappy="view_cruise">View details</a>`;
```

### Loading overlay
Put on the overlay element shown while results are fetching.

```html
<div id="search-loading-overlay" data-cruiseappy="search_results_loading">...</div>
```

---

## 4. Cruise detail page

### Book Now CTA
Put on the `<a>` that starts the booking journey. **Only render this element
when the cruise is actually bookable** (i.e. has availability and a price).
The test looks for this to confirm the cruise can be booked.

```html
<a href="/booking/occupancy/?cruise=123" data-cruiseappy="book_cruise" class="btn btn-primary">
  Book Now
</a>
```

### Call us CTA

```html
<a href="tel:+441234567890" data-cruiseappy="call_cruise">Call us</a>
```

### Enquire CTA

```html
<button data-cruiseappy="enquire_cruise">Enquire</button>
```

---

## 5. Occupancy page

```html
<!-- Adults -->
<select name="adults" data-cruiseappy="occupancy_adults">...</select>

<!-- Children -->
<select name="children" data-cruiseappy="occupancy_children">...</select>

<!-- Infants (omit if the site does not support infants) -->
<select name="infants" data-cruiseappy="occupancy_infants">...</select>

<!-- Continue CTA -->
<a href="/booking/staterooms/..." data-cruiseappy="booking_occupancy">Continue</a>
```

---

## 6. Staterooms page

### Rate code / grade select buttons
Put on each `<button>` that selects a cabin grade.

```html
<button data-cruiseappy="booking_ratecodes">Inside from £499pp</button>
```

### Continue CTA — ⚠️ important
The Continue link starts with only `data-href` set. JavaScript populates
`href` ~100ms after the AJAX grade-selection fires. Use `data-href` as the
attribute, **not** `href`.

```html
<a data-href="/booking/cabins/?grade=inside&..." data-cruiseappy="booking_staterooms">
  Continue
</a>
```

The test waits for `href` to be populated before navigating, so the JS that
sets `href` must run as normal — no changes needed there.

---

## 7. Cabin / deck & room page

Put on the `<button type="submit">` that advances to the passengers step.

```html
<button type="submit" data-cruiseappy="booking_deck_room">Continue</button>
```

---

## 8. Passenger details form

Put on the `<button type="submit">` of the passenger form. The test waits
for this to be visible as confirmation the form has rendered.

```html
<button type="submit" data-cruiseappy="booking_passengers">Continue</button>
```

---

## Summary table

| Attribute | Element | Page |
|---|---|---|
| `data-cruiseappy="site_logo"` | `<a>` wrapping header logo | All pages |
| `data-cruiseappy="desktop_nav"` | `<nav>` visible on desktop | All pages |
| `data-cruiseappy="mobile_nav"` | Mobile nav toggle or panel | All pages |
| `data-cruiseappy="general_enquiry"` | Header enquiry button | All pages |
| `data-cruiseappy="search_form"` | Search widget container | Homepage / search |
| `data-cruiseappy="search"` | Search submit `<a>` with `href` | Homepage / search |
| `data-cruiseappy="result_bookable"` | Result card `<div>` when bookable + priced | Search results |
| `data-cruiseappy="result_enquiry"` | Result card `<div>` when not bookable | Search results |
| `data-cruiseappy="result_price"` | Price `<span>` when showing real price | Search results |
| `data-cruiseappy="view_cruise"` | "View details" `<a>` in result card | Search results |
| `data-cruiseappy="search_results_loading"` | Loading overlay | Search results |
| `data-cruiseappy="book_cruise"` | Book Now `<a>` (only when bookable) | Cruise detail |
| `data-cruiseappy="call_cruise"` | Call us `<a>` | Cruise detail |
| `data-cruiseappy="enquire_cruise"` | Enquire `<button>` | Cruise detail |
| `data-cruiseappy="occupancy_adults"` | Adults `<select>` | Occupancy |
| `data-cruiseappy="occupancy_children"` | Children `<select>` | Occupancy |
| `data-cruiseappy="occupancy_infants"` | Infants `<select>` | Occupancy |
| `data-cruiseappy="booking_occupancy"` | Continue `<a>` | Occupancy |
| `data-cruiseappy="booking_ratecodes"` | Grade select `<button>` (one per grade) | Staterooms |
| `data-cruiseappy="booking_staterooms"` | Continue `<a>` — use `data-href` not `href` | Staterooms |
| `data-cruiseappy="booking_deck_room"` | `<button type="submit">` | Cabins |
| `data-cruiseappy="booking_passengers"` | `<button type="submit">` | Passengers |
