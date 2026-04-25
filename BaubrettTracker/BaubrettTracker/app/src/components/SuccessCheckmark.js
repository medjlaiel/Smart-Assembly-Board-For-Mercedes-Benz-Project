/**
 * SuccessCheckmark.js
 * Animated checkmark for success states
 */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import { COLORS, RADIUS, SHADOW } from '../assets/theme';

export default function SuccessCheckmark({ size = 80, onComplete }) {
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const circleScale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Reset
    circleScale.setValue(0);
    checkmarkScale.setValue(0);
    opacity.setValue(0);

    // Circle pop-in with spring
    Animated.spring(circleScale, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Checkmark draw after circle appears
    const timeout1 = setTimeout(() => {
      Animated.timing(checkmarkScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Fade out after delay
      const timeout2 = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => {
          if (onComplete) onComplete();
        });
      }, 1500);

      return () => clearTimeout(timeout2);
    }, 300);

    return () => {
      clearTimeout(timeout1);
      circleScale.stopAnimation();
      checkmarkScale.stopAnimation();
      opacity.stopAnimation();
    };
  }, [onComplete]);

  return (
    <Animated.View style={[styles.container, { opacity: opacity }]}>
      <Animated.View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }, { transform: [{ scale: circleScale }] }]}>
        <Animated.View style={{ transform: [{ scale: checkmarkScale }] }}>
          <Text style={[styles.checkmark, { fontSize: size * 0.6 }]}>✓</Text>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.medium,
  },
  checkmark: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
});