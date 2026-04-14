/**
 * AuthInput.js — Reusable input component for authentication screens
 * Features: left icon, label, error state, secure text toggle for passwords
 */
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, RADIUS, SHADOW } from '../assets/theme';

export default function AuthInput({
  label,
  iconName,
  iconType = 'material', // 'material' or 'ionic'
  error,
  containerStyle,
  inputStyle,
  showSecureToggle = false,
  rightIcon,
  onRightIconPress,
  secureTextEntry = false,
  ...textInputProps
}) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Determine if text should be secure based on showSecureToggle and visibility
  // If showSecureToggle is false, use the secureTextEntry prop value directly
  const isSecure = showSecureToggle ? !isPasswordVisible : secureTextEntry;

  const handleTogglePassword = () => {
    setIsPasswordVisible(!isPasswordVisible);
    console.log('Password visibility toggled to:', !isPasswordVisible);
  };

  const getIconColor = () => {
    if (error) return COLORS.error;
    if (isFocused) return COLORS.primary;
    return COLORS.text3;
  };

  const renderLeftIcon = () => {
    if (!iconName) return null;

    const IconComponent = iconType === 'ionic' ? Ionicons : MaterialIcons;
    return (
      <View style={styles.iconContainer}>
        <IconComponent
          name={iconName}
          size={18}
          color={getIconColor()}
        />
      </View>
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          error && styles.inputWrapperError,
        ]}
      >
        {renderLeftIcon()}
        <TextInput
          style={[
            styles.input,
            inputStyle,
            iconName && styles.inputWithIcon,
            (rightIcon || showSecureToggle) && styles.inputWithRightIcon,
          ]}
          placeholderTextColor={COLORS.text3}
          secureTextEntry={isSecure}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...textInputProps}
        />
        {showSecureToggle && (
          <TouchableOpacity
            onPress={handleTogglePassword}
            style={styles.rightIconContainer}
            activeOpacity={0.6}
            accessible={true}
            accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
            accessibilityRole="button"
            accessibilityState={{ disabled: false }}
          >
            <MaterialIcons
              name={isPasswordVisible ? 'visibility-off' : 'visibility'}
              size={20}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        )}
        {rightIcon && onRightIconPress && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIconContainer}
            accessibilityRole="button"
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: FONT_SIZES.label,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    ...SHADOW.small,
  },
  inputWrapperFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    ...SHADOW.medium,
  },
  inputWrapperError: {
    borderColor: COLORS.error,
  },
  iconContainer: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
    minHeight: 48,
  },
  inputWithIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  rightIconContainer: {
    padding: 12,
    marginRight: 4,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 6,
    marginLeft: 4,
  },
});
