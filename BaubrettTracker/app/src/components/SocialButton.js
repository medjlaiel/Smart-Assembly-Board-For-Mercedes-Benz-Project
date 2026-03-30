/**
 * SocialButton.js — Social login button component
 * Outlined style with icon and label, 48px height
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SHADOW } from '../assets/theme';
import { Ionicons } from '@expo/vector-icons';

export default function SocialButton({
  provider,
  onPress,
  style,
  textStyle,
  loading = false,
  disabled = false,
}) {
  const getProviderConfig = () => {
    switch (provider) {
      case 'google':
        return {
          icon: 'logo-google',
          label: 'Google',
          bgColor: COLORS.surface,
          textColor: COLORS.text,
          borderColor: COLORS.border,
        };
      case 'apple':
        return {
          icon: 'logo-apple',
          label: 'Apple',
          bgColor: COLORS.surface,
          textColor: COLORS.text,
          borderColor: COLORS.border,
        };
      default:
        return {
          icon: 'person-circle',
          label: provider,
          bgColor: COLORS.surface,
          textColor: COLORS.text,
          borderColor: COLORS.border,
        };
    }
  };

  const config = getProviderConfig();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: config.bgColor, borderColor: config.borderColor },
        disabled && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Sign in with ${config.label}`}
    >
      {loading ? (
        <ActivityIndicator size="small" color={COLORS.primary} />
      ) : (
        <View style={styles.content}>
          <Ionicons
            name={config.icon}
            size={20}
            color={config.textColor}
          />
          <Text style={[styles.text, { color: config.textColor }, textStyle]}>
            {config.label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    ...SHADOW.small,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: FONT_SIZES.body,
    fontWeight: '500',
    marginLeft: 12,
  },
});
