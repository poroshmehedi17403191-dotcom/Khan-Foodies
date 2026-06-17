import type { SiteContent } from './types';

export type ThemeColors = {
  navy: string;
  peach: string;
  bg: string;
  accent: string;
};

export const DEFAULT_THEME: ThemeColors = {
  navy: '#1a234d',
  peach: '#f5b075',
  bg: '#fef8f2',
  accent: '#f5b075',
};

export function themeFromSiteContent(content: SiteContent | null | undefined): ThemeColors {
  return {
    navy: content?.themeNavy?.trim() || DEFAULT_THEME.navy,
    peach: content?.themePeach?.trim() || DEFAULT_THEME.peach,
    bg: content?.themeBg?.trim() || DEFAULT_THEME.bg,
    accent: content?.themeAccent?.trim() || DEFAULT_THEME.accent,
  };
}

export function buildThemeCss(theme: ThemeColors): string {
  return `:root {
  --kf-navy: ${theme.navy};
  --kf-navy-dark: color-mix(in srgb, ${theme.navy} 85%, black);
  --kf-navy-light: color-mix(in srgb, ${theme.navy} 75%, white);
  --kf-peach: ${theme.peach};
  --kf-peach-light: color-mix(in srgb, ${theme.peach} 35%, white);
  --kf-peach-soft: color-mix(in srgb, ${theme.peach} 18%, white);
  --kf-bg: ${theme.bg};
  --kf-section-bg: color-mix(in srgb, ${theme.peach} 22%, ${theme.bg});
  --kf-primary: ${theme.navy};
  --kf-primary-hover: color-mix(in srgb, ${theme.navy} 85%, black);
  --kf-accent: ${theme.accent};
  --kf-accent-hover: color-mix(in srgb, ${theme.accent} 85%, black);
  --kf-primary-light: color-mix(in srgb, ${theme.peach} 35%, white);
  --kf-primary-border: color-mix(in srgb, ${theme.navy} 28%, #e8dcc8);
  --kf-footer-outer: color-mix(in srgb, ${theme.navy} 85%, black);
  --kf-hero-from: ${theme.navy};
  --kf-hero-via: color-mix(in srgb, ${theme.navy} 70%, ${theme.peach});
  --kf-hero-to: ${theme.peach};
  --kf-surface: ${theme.navy};
}`;
}
