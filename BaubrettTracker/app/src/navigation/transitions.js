/**
 * transitions.js
 * Custom screen transition animations for React Navigation
 */
import { interpolate, Extrapolate } from 'react-native-reanimated';

// Slide from right (default iOS style)
export const slideFromRight = {
  gestureDirection: 'horizontal',
  cardStyleInterpolator: ({ current, layouts }) => {
    return {
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
            }),
          },
        ],
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.5],
        }),
      },
    };
  },
};

// Fade transition
export const fade = {
  gestureDirection: 'horizontal',
  cardStyleInterpolator: ({ current }) => {
    return {
      cardStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
          extrapolate: Extrapolate.CLAMP,
        }),
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.5],
        }),
      },
    };
  },
};

// Scale from center (modal-like)
export const scaleFromCenter = {
  gestureDirection: 'vertical',
  cardStyleInterpolator: ({ current, layouts }) => {
    return {
      cardStyle: {
        transform: [
          {
            scale: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0.9, 1],
              extrapolate: Extrapolate.CLAMP,
            }),
          },
          {
            translateY: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.height / 2, 0],
            }),
          },
        ],
        opacity: current.progress,
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.5],
        }),
      },
    };
  },
};

// Default config
export const defaultTransition = {
  ...slideFromRight,
};