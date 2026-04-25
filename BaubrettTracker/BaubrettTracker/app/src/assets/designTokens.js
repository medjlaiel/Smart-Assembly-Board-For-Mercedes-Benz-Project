/**
 * designTokens.js — Static design tokens that don't change with theme
 */
export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

export const FONT_SIZES = {
  title: 28,
  subtitle: 15,
  body: 15,
  label: 13,
  button: 16,
};

export const RADIUS = {
  sm: 8,
  md: 14,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const SHADOW = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
};
