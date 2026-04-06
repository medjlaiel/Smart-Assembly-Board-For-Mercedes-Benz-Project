/**
 * BrandedSpinner.js
 * Custom loading spinner with brand colors and smooth animation
 */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS, RADIUS } from '../assets/theme';

export default function BrandedSpinner({ size = 'medium', color = COLORS.primary }) {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spin = () => {
      spinValue.setValue(0);
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }).start(() => spin());
    };
    spin();
    return () => spinValue.stopAnimation();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getSize = () => {
    switch (size) {
      case 'small': return 24;
      case 'large': return 48;
      default: return 36;
    }
  };

  const spinnerSize = getSize();
  const strokeWidth = Math.max(2, spinnerSize / 8);

  return (
    <View style={[styles.container, { width: spinnerSize, height: spinnerSize }]}>
      <Animated.View
        style={[
          styles.spinner,
          {
            width: spinnerSize,
            height: spinnerSize,
            borderRadius: spinnerSize / 2,
            borderWidth: strokeWidth,
            borderColor: COLORS.border,
            borderTopColor: color,
            transform: [{ rotate: spin }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    // border styles are set dynamically
  },
});