/**
 * AnimatedButton.js
 * A button component with press-scale animation and loading state
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { COLORS, RADIUS, FONT_SIZES } from '../assets/theme';

export default function AnimatedButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  style,
  ...props
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
      opacity.value = withTiming(0.8, { duration: 100 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    opacity.value = withTiming(1, { duration: 100 });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const getBackgroundColor = () => {
    if (disabled || loading) return COLORS.text3;
    switch (variant) {
      case 'primary': return COLORS.primary;
      case 'success': return COLORS.success;
      case 'error': return COLORS.error;
      case 'outline': return 'transparent';
      default: return COLORS.primary;
    }
  };

  const getTextColor = () => {
    if (variant === 'outline') return COLORS.primary;
    return COLORS.white;
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 10, paddingHorizontal: 16 };
      case 'large':
        return { paddingVertical: 18, paddingHorizontal: 28 };
      default:
        return { paddingVertical: 14, paddingHorizontal: 24 };
    }
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={1}
        style={[
          styles.button,
          getSizeStyle(),
          {
            backgroundColor: getBackgroundColor(),
            borderColor: variant === 'outline' ? COLORS.primary : 'transparent',
            borderWidth: variant === 'outline' ? 2 : 0,
          },
          (disabled || loading) && styles.disabled,
        ]}
        {...props}
      >
        {loading ? (
          <ActivityIndicator color={getTextColor()} size="small" />
        ) : (
          <>
            {icon && <Text style={styles.icon}>{icon}</Text>}
            <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.small,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontSize: FONT_SIZES.button,
    fontWeight: '600',
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
});