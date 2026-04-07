import { createTheme, createBox, createText, useTheme as useRestyleTheme } from '@shopify/restyle';

const palette = {
  // Neutrals
  black: '#000000',
  white: '#ffffff',
  grey100: '#f2f2f7',
  grey200: '#e5e5ea',
  grey300: '#d4d4d2',
  grey400: '#a5a5a5',
  grey500: '#888888',
  grey600: '#666666',
  grey700: '#333333',
  grey800: '#1c1c1e',

  // Accent (default — overridden at runtime via accentColor setting)
  accent: '#ff9f0a',
  danger: '#ff3b30',
} as const;

const baseTheme = {
  spacing: {
    xs: 4,
    s: 8,
    m: 12,
    l: 16,
    xl: 24,
    xxl: 32,
  },
  borderRadii: {
    s: 6,
    m: 8,
    l: 12,
    full: 9999,
  },
  breakpoints: {
    phone: 0,
    tablet: 768,
  },
  textVariants: {
    current: {
      fontSize: 80,
      fontWeight: '200' as const,
    },
    currentLandscape: {
      fontSize: 38,
      lineHeight: 38,
      fontWeight: '200' as const,
    },
    expression: {
      fontSize: 24,
    },
    expressionLandscape: {
      fontSize: 17,
    },
    indicator: {
      fontSize: 13,
      fontWeight: '500' as const,
    },
    indicatorLandscape: {
      fontSize: 11,
      fontWeight: '500' as const,
    },
    buttonLabel: {
      fontWeight: '400' as const,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '600' as const,
      letterSpacing: 0.5,
    },
    rowLabel: {
      fontSize: 16,
    },
    historyResult: {
      fontSize: 26,
      fontWeight: '300' as const,
    },
    equation: {
      fontSize: 14,
    },
    date: {
      fontSize: 13,
    },
    clearBtn: {
      fontSize: 14,
      color: 'danger',
    },
    emptyText: {
      fontSize: 15,
    },
    segmentText: {
      fontSize: 13,
    },
    defaults: {},
  },
} as const;

export const darkTheme = createTheme({
  ...baseTheme,
  colors: {
    ...palette,
    background: palette.black,
    display: palette.black,
    currentText: palette.white,
    expressionText: palette.grey500,
    numberBtn: palette.grey700,
    operatorBtn: palette.accent,
    functionBtn: palette.grey400,
    numberText: palette.white,
    operatorText: palette.white,
    functionText: palette.black,
    scientificBtn: palette.grey800,
    scientificText: palette.white,
    historyBg: palette.grey800,
    historyText: palette.white,
    historySubText: palette.grey500,
    separator: palette.grey700,
    danger: palette.danger,
  },
});

export const lightTheme = createTheme({
  ...baseTheme,
  colors: {
    ...palette,
    background: palette.grey100,
    display: palette.grey100,
    currentText: palette.black,
    expressionText: palette.grey600,
    numberBtn: palette.white,
    operatorBtn: palette.accent,
    functionBtn: palette.grey300,
    numberText: palette.black,
    operatorText: palette.white,
    functionText: palette.black,
    scientificBtn: palette.grey200,
    scientificText: palette.black,
    historyBg: palette.white,
    historyText: palette.black,
    historySubText: palette.grey600,
    separator: palette.grey300,
    danger: palette.danger,
  },
});

export type AppTheme = typeof darkTheme;

export const Box = createBox<AppTheme>();
export const ThemedText = createText<AppTheme>();
export const useTheme = () => useRestyleTheme<AppTheme>();