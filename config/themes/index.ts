import { ThemeConfig } from './types';
import { visioncruise } from './visioncruise';
import { cll } from './cll';
import { centuryCyprus } from './century-cyprus';
import { automation } from './automation';

const themes: Record<string, ThemeConfig> = {
  automation,
  visioncruise,
  cll,
  'century-cyprus': centuryCyprus,
};

/**
 * Returns the ThemeConfig for the given name (or the THEME env var, or
 * 'visioncruise' as the default).
 *
 * BASE_URL env var overrides the theme's default baseUrl — this lets CI point
 * at staging, dev, or live without changing the theme config itself.
 *
 * @throws if the resolved theme name is not registered.
 */
export function loadTheme(name?: string): ThemeConfig {
  const key = name ?? process.env.THEME ?? 'automation';
  const theme = themes[key];
  if (!theme) {
    const available = Object.keys(themes).join(', ');
    throw new Error(`Unknown theme "${key}". Available themes: ${available}`);
  }
  if (process.env.BASE_URL) {
    return { ...theme, baseUrl: process.env.BASE_URL };
  }
  return theme;
}

export type { ThemeConfig } from './types';
