/**
 * Visual tokens from Stitch "HatchFlow Home Screen"
 * project 6149295583822314063 / screen d962fc32a54f4c1893ba840df190db0b
 */
export const fonts = {
  display: 'Quicksand_700Bold',
  headline: 'Quicksand_600SemiBold',
  label: 'Quicksand_700Bold',
  body: 'BeVietnamPro_400Regular',
  bodyMedium: 'BeVietnamPro_600SemiBold',
} as const;

export const colors = {
  background: '#FCF9F3',
  surface: '#FCF9F3',
  surfaceLow: '#F6F3ED',
  surfaceContainer: '#F0EEE8',
  surfaceHighest: '#E5E2DC',
  ink: '#1C1C18',
  inkMuted: '#4B4736',
  outline: '#7C7764',
  outlineSoft: '#CDC6B0',
  primary: '#6B5F00',
  primaryContainer: '#F9E464',
  onPrimaryContainer: '#726500',
  secondary: '#246A56',
  secondaryContainer: '#ABF1D7',
  onSecondaryContainer: '#2B705C',
  tertiary: '#2C694E',
  tertiaryContainer: '#B1F1CF',
  onTertiaryContainer: '#337054',
  error: '#BA1A1A',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#93000A',
  white: '#FFFFFF',
} as const;

export const radii = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  squircle: 40,
  pill: 999,
} as const;

export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const typography = {
  brand: {
    fontFamily: fonts.headline,
    fontSize: 24,
    lineHeight: 32,
  },
  display: {
    fontFamily: fonts.display,
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: -0.72,
  },
  timer: {
    fontFamily: fonts.display,
    fontSize: 72,
    lineHeight: 72,
    letterSpacing: -1.4,
    fontVariant: ['tabular-nums'] as Array<'tabular-nums'>,
  },
  headline: {
    fontFamily: fonts.headline,
    fontSize: 24,
    lineHeight: 32,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
  },
  bodyLg: {
    fontFamily: fonts.body,
    fontSize: 18,
    lineHeight: 28,
  },
  label: {
    fontFamily: fonts.label,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.7,
  },
  micro: {
    fontFamily: fonts.label,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1.2,
  },
};

/** Stitch `.hard-shadow`: 4px 4px 0 #246a56 */
export const hardShadow = {
  borderWidth: 2,
  borderColor: colors.secondary,
  boxShadow: `4px 4px 0px 0px ${colors.secondary}`,
  elevation: 0,
} as const;

export const hardShadowPressed = {
  boxShadow: 'none',
  transform: [{ translateX: 2 }, { translateY: 2 }],
} as const;

/** Session modes from Stitch home — mapped onto existing duration presets. */
export const SESSION_MODES = [
  { id: 'deep-work', label: 'Deep Work', durationMs: 25 * 60_000 },
  { id: 'study', label: 'Study', durationMs: 45 * 60_000 },
  { id: 'reading', label: 'Reading', durationMs: 15 * 60_000 },
  { id: 'meditation', label: 'Meditation', durationMs: 5 * 60_000 },
] as const;
