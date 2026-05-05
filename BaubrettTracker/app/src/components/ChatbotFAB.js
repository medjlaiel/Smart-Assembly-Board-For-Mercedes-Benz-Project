/**
 * ChatbotFAB.js
 * Floating Action Button for chatbot with robot icon
 * Positioned at bottom-right, stays visible on scroll
 */
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Circle, Rect, Path, Text as SvgText } from 'react-native-svg';
import { SHADOW } from '../assets/theme';

export default function ChatbotFAB({ onPress }) {
  return (
    <TouchableOpacity
      style={[styles.fab, SHADOW.medium]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Svg width={60} height={60} viewBox="0 0 60 60">
        {/* Outer circle outline */}
        <Circle
          cx="30"
          cy="30"
          r="29"
          fill="#66CDAA"
          stroke="none"
        />

        {/* Robot head box */}
        <Rect
          x="15"
          y="16"
          width="30"
          height="24"
          rx="3"
          fill="white"
        />

        {/* Left eye */}
        <Circle cx="20" cy="22" r="2.5" fill="#66CDAA" />

        {/* Right eye */}
        <Circle cx="40" cy="22" r="2.5" fill="#66CDAA" />

        {/* Left antenna */}
        <Path
          d="M 18 12 Q 16 6 18 4"
          stroke="#66CDAA"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Right antenna */}
        <Path
          d="M 42 12 Q 44 6 42 4"
          stroke="#66CDAA"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Mouth (simple curved line) */}
        <Path
          d="M 22 30 Q 30 33 38 30"
          stroke="#66CDAA"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Chat bubble tail at bottom-left */}
        <Path
          d="M 12 42 L 18 40 L 16 46 Z"
          fill="#66CDAA"
        />
      </Svg>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#66CDAA',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    elevation: 8,
  },
});
