/**
 * PasswordStrengthBar.js — Visual password strength indicator
 * Shows 4 segments: red → orange → yellow → green
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../assets/theme';

/**
 * Calculate password strength (0-4)
 */
const calculatePasswordStrength = (password) => {
  if (!password) return 0;

  let strength = 0;

  // Length check (min 8)
  if (password.length >= 8) strength += 1;

  // Contains lowercase
  if (/[a-z]/.test(password)) strength += 1;

  // Contains uppercase
  if (/[A-Z]/.test(password)) strength += 1;

  // Contains numbers
  if (/\d/.test(password)) strength += 1;

  // Contains special characters (bonus for 4th segment if already met other criteria)
  if (/[^a-zA-Z0-9]/.test(password) && strength >= 3) strength = 4;

  // Cap at 4
  return Math.min(strength, 4);
};

/**
 * Get color for a segment based on strength level
 */
const getSegmentColor = (segmentIndex, strength) => {
  if (segmentIndex < strength) {
    // Active segment colors based on strength level
    switch (strength) {
      case 1:
        return COLORS.error; // Red
      case 2:
        return '#F97316'; // Orange
      case 3:
        return '#EAB308'; // Yellow
      case 4:
        return COLORS.success; // Green
      default:
        return COLORS.border;
    }
  }
  return COLORS.border; // Inactive color
};

export default function PasswordStrengthBar({
  password,
  style,
}) {
  const strength = calculatePasswordStrength(password);

  return (
    <View style={[styles.container, style]}>
      {[0, 1, 2, 3].map((index) => (
        <View
          key={index}
          style={[
            styles.segment,
            {
              backgroundColor: getSegmentColor(index, strength),
              // Active segments get a subtle glow
              ...(index < strength && styles.activeSegment),
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    marginBottom: 4,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
  },
  activeSegment: {
    // Subtle glow for active segments
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
  },
});
