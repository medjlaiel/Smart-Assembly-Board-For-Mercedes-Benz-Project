/**
 * ChangePasswordScreen.js — Full screen for changing user password
 * Features: current password verification, new password with strength indicator, confirmation
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS, FONT_SIZES, RADIUS, SHADOW } from '../assets/theme';
import AuthInput from '../components/AuthInput';
import PasswordStrengthBar from '../components/PasswordStrengthBar';
import { changePassword } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function ChangePasswordScreen({ navigation }) {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);

  // Password strength calculation
  const passwordStrength = React.useMemo(() => {
    let strength = 0;
    if (newPassword.length >= 8) strength += 1;
    if (/[a-z]/.test(newPassword)) strength += 1;
    if (/[A-Z]/.test(newPassword)) strength += 1;
    if (/\d/.test(newPassword)) strength += 1;
    if (/[^a-zA-Z0-9]/.test(newPassword) && strength >= 3) strength = 4;
    return Math.min(strength, 4);
  }, [newPassword]);

  // Check if passwords match
  const passwordsMatch = confirmPassword && newPassword === confirmPassword;

  const validateForm = () => {
    let valid = true;

    // Current password validation
    if (!currentPassword) {
      setCurrentPasswordError(t('drawer.currentPasswordRequired', 'Current password is required'));
      valid = false;
    } else {
      setCurrentPasswordError('');
    }

    // New password validation
    if (!newPassword) {
      setNewPasswordError(t('drawer.newPasswordRequired', 'New password is required'));
      valid = false;
    } else if (newPassword.length < 8) {
      setNewPasswordError(t('drawer.passwordMinLength', 'Password must be at least 8 characters'));
      valid = false;
    } else if (passwordStrength < 2) {
      setNewPasswordError(t('drawer.passwordWeak', 'Password is too weak'));
      valid = false;
    } else {
      setNewPasswordError('');
    }

    // Confirm password validation
    if (!confirmPassword) {
      setConfirmPasswordError(t('drawer.confirmPasswordRequired', 'Please confirm your password'));
      valid = false;
    } else if (!passwordsMatch) {
      setConfirmPasswordError(t('drawer.passwordsDoNotMatch', 'Passwords do not match'));
      valid = false;
    } else {
      setConfirmPasswordError('');
    }

    return valid;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      console.log('Changing password for user:', currentUser.id);
      const result = await changePassword(currentUser.id, currentPassword, newPassword);
      console.log('Password change result:', result);

      if (result.success) {
        Alert.alert(
          t('common.success'),
          t('drawer.passwordChangedSuccess', 'Password changed successfully'),
          [
            {
              text: t('common.ok'),
              onPress: () => navigation.goBack(),
            },
          ]
        );
        // Clear form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert(t('common.error'), result.message || t('common.error'));
      }
    } catch (error) {
      console.error('Password change error:', error);
      Alert.alert(t('common.error'), t('drawer.passwordChangeError', 'An error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Info */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Icon name="lock" size={40} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>{t('drawer.changePassword', 'Change Password')}</Text>
          <Text style={styles.subtitle}>
            {t('drawer.changePasswordSubtitle', 'Secure your account with a new password')}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Current Password */}
          <AuthInput
            label={t('drawer.currentPassword', 'Current Password')}
            iconName="lock"
            iconType="material"
            placeholder={t('drawer.enterCurrentPassword', 'Enter current password')}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            error={currentPasswordError}
            showSecureToggle={true}
            editable={!isLoading}
          />

          {/* New Password */}
          <AuthInput
            label={t('drawer.newPassword', 'New Password')}
            iconName="lock-outline"
            iconType="material"
            placeholder={t('drawer.enterNewPassword', 'Enter new password')}
            value={newPassword}
            onChangeText={setNewPassword}
            error={newPasswordError}
            showSecureToggle={true}
            editable={!isLoading}
          />

          {/* Password Strength Indicator */}
          {newPassword.length > 0 && <PasswordStrengthBar password={newPassword} />}

          {/* Confirm Password */}
          <AuthInput
            label={t('drawer.confirmPassword', 'Confirm New Password')}
            iconName="check-circle-outline"
            iconType="material"
            placeholder={t('drawer.confirmNewPassword', 'Confirm new password')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={confirmPasswordError}
            showSecureToggle={true}
            rightIcon={
              confirmPassword ? (
                <View
                  style={[
                    styles.checkIcon,
                    { backgroundColor: passwordsMatch ? COLORS.success : COLORS.error },
                  ]}
                >
                  <Text style={styles.checkIconText}>
                    {passwordsMatch ? '✓' : '✕'}
                  </Text>
                </View>
              ) : undefined
            }
            editable={!isLoading}
          />

          {/* Password Requirements */}
          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsTitle}>Password requirements:</Text>
            <RequirementItem met={newPassword.length >= 8} text="At least 8 characters" />
            <RequirementItem met={/[a-z]/.test(newPassword)} text="Lowercase letter" />
            <RequirementItem met={/[A-Z]/.test(newPassword)} text="Uppercase letter" />
            <RequirementItem met={/\d/.test(newPassword)} text="Number" />
            <RequirementItem met={passwordsMatch && confirmPassword !== ''} text="Passwords match" />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.cancelButton, isLoading && styles.buttonDisabled]}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Icon name="close" size={20} color={COLORS.error} />
            <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.buttonDisabled]}
            onPress={handleChangePassword}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Icon name="check" size={20} color={COLORS.white} />
                <Text style={styles.submitButtonText}>
                  {t('drawer.savePassword', 'Save Password')}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Password Requirement Item Component
function RequirementItem({ met, text }) {
  return (
    <View style={styles.requirementItem}>
      <Icon
        name={met ? 'check-circle' : 'radio-button-unchecked'}
        size={18}
        color={met ? COLORS.success : COLORS.text3}
      />
      <Text style={[styles.requirementText, met && styles.requirementMet]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: FONT_SIZES.title,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.subtitle,
    color: COLORS.text2,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  form: {
    marginBottom: 30,
  },
  requirementsContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 16,
    marginTop: 24,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  requirementsTitle: {
    fontSize: FONT_SIZES.label,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  requirementText: {
    fontSize: 14,
    color: COLORS.text2,
    marginLeft: 10,
  },
  requirementMet: {
    color: COLORS.success,
    fontWeight: '500',
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIconText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.error + '15',
    borderWidth: 2,
    borderColor: COLORS.error,
    borderRadius: RADIUS.lg,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cancelButtonText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.button,
    fontWeight: '700',
  },
  submitButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...SHADOW.medium,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.button,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
