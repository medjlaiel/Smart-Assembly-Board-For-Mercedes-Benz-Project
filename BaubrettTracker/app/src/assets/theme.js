/**
 * theme.js — Centralised design tokens
 * Import this in every screen / component for consistent styling.
 */
export const COLORS = {
  primary:      '#20B2AA',   // Light sea green — main brand colour
  primaryLight: '#3AC9BC',   // Lighter sea green for hover/focus
  primaryDark:  '#1A9C96',   // Darker sea green for pressed states
  accent:       '#20B2AA',   // Same as primary for consistency
  success:      '#22C55E',   // Green — successful actions
  error:        '#EF4444',   // Red — errors / invalid input
  warning:      '#F59E0B',   // Orange — warnings
  background:   '#F9FAFB',   // Very light gray page background
  surface:      '#FFFFFF',   // Card / panel background
  border:       '#E5E7EB',   // Dividers and borders (light gray)
  text:         '#0F172A',   // Primary text (dark)
  text2:        '#475569',   // Secondary / muted text
  text3:        '#94A3B8',   // Placeholder / disabled text
  white:        '#FFFFFF',
  overlay:      'rgba(0,0,0,0.5)', // Modal overlay
};

export const FONTS = {
  regular:  'System',
  medium:   'System',
  bold:     'System',
};

export const FONT_SIZES = {
  title:    28,
  subtitle: 15,
  body:     15,
  label:    13,
  button:   16,
};

export const RADIUS = {
  sm: 8,
  md: 14,    // Input fields
  lg: 16,    // Buttons
  xl: 24,    // Cards/containers
  xxl: 32,   // Large decorative elements
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
