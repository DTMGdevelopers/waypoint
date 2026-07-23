import { ThemeConfig } from './types';

export const haysCruise: ThemeConfig = {
  name: 'hays-cruise',
  baseUrl: 'https://hayscruise.co.uk',
  locatorOverrides: {
    // "Departure Date + Duration" is a single combined control on this theme.
    // Both selectDates() and selectDuration() target the same trigger element.
    // The openDropdownAndSelect "already open" check keeps the panel open between calls.
    searchDuration: '[data-cruiseappy="search_dates"]',
  },
  features: {
    extras: false,
    payment: false,
    changeStateroom: false,
  },
};
