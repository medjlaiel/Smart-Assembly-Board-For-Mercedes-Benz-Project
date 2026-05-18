/**
 * AnimatedTabBar.js
 * Custom animated bottom tab bar with smooth press feedback
 * and soft visual transitions between tabs.
 */
import React, { useRef, useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Platform,
} from 'react-native';
import { useApp } from '../contexts/AppContext';

const TAB_BAR_HEIGHT = 68;
const INDICATOR_WIDTH = 44;
const INDICATOR_HEIGHT = 36;
const ICON_SIZE = 24;

export default function AnimatedTabBar({ state, descriptors, navigation }) {
  const { theme } = useApp();
  const [tabLayouts, setTabLayouts] = useState({});

  // Store animated values for each tab's scale
  const scaleAnims = useRef(
    state.routes.map(() => new Animated.Value(1))
  ).current;

  // Animated value for the active indicator position (horizontal translation)
  const indicatorTranslate = useRef(new Animated.Value(0)).current;

  // Measure tab positions on layout
  const handleTabLayout = useCallback((index, event) => {
    const { x, width } = event.nativeEvent.layout;
    setTabLayouts((prev) => ({
      ...prev,
      [index]: { x, width },
    }));
  }, []);

  // Update indicator position when active tab changes
  useEffect(() => {
    const activeIndex = state.index;
    const layout = tabLayouts[activeIndex];

    if (!layout) return;

    // Center the indicator on the active tab
    const targetX = layout.x + (layout.width - INDICATOR_WIDTH) / 2;

    // Animate indicator to new position with spring for a soft feel
    Animated.spring(indicatorTranslate, {
      toValue: targetX,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  }, [state.index, tabLayouts, indicatorTranslate]);

  const handlePressIn = useCallback(
    (index) => {
      Animated.spring(scaleAnims[index], {
        toValue: 0.85,
        useNativeDriver: true,
        tension: 150,
        friction: 5,
      }).start();
    },
    [scaleAnims]
  );

  const handlePressOut = useCallback(
    (index) => {
      Animated.spring(scaleAnims[index], {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    },
    [scaleAnims]
  );

  const handleTabPress = useCallback(
    (route, index) => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!event.defaultPrevented) {
        navigation.navigate(route.name, { merge: true });
      }
    },
    [navigation]
  );

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.border,
          shadowColor: theme.text,
        },
      ]}
    >
      {/* Active indicator */}
      <Animated.View
        style={[
          styles.indicator,
          {
            backgroundColor: theme.primary + '18',
            transform: [{ translateX: indicatorTranslate }],
          },
        ]}
      />

      {/* Tab buttons */}
      <View style={styles.tabsRow}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const iconColor = isFocused ? theme.tabBarActive : theme.subtext;
          const scale = scaleAnims[index];

          return (
            <TouchableOpacity
              key={route.key}
              activeOpacity={1}
              onPress={() => handleTabPress(route, index)}
              onPressIn={() => handlePressIn(index)}
              onPressOut={() => handlePressOut(index)}
              onLayout={(e) => handleTabLayout(index, e)}
              style={styles.tabButton}
            >
              <Animated.View
                style={[
                  styles.tabInner,
                  { transform: [{ scale }] },
                ]}
              >
                {options.tabBarIcon
                  ? options.tabBarIcon({
                      focused: isFocused,
                      color: iconColor,
                      size: ICON_SIZE,
                    })
                  : null}
                <Text
                  style={[
                    styles.label,
                    {
                      color: iconColor,
                      fontWeight: isFocused ? '700' : '500',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {label}
                </Text>

                {/* Small dot indicator for active tab */}
                {isFocused && (
                  <View
                    style={[
                      styles.activeDot,
                      { backgroundColor: theme.tabBarActive },
                    ]}
                  />
                )}
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: TAB_BAR_HEIGHT,
    borderTopWidth: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 8 : 4,
    paddingTop: 6,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  indicator: {
    position: 'absolute',
    bottom: 26,
    width: INDICATOR_WIDTH,
    height: INDICATOR_HEIGHT,
    borderRadius: 12,
  },
  tabsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    zIndex: 1,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingVertical: 4,
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    position: 'absolute',
    bottom: -8,
  },
});