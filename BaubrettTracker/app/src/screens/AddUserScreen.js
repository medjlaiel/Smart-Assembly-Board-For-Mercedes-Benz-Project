/**
 * AddUserScreen.js — Admin-only screen to create new user accounts
 * Features: email, password with strength, create user with role="user"
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
import { signUp as signUpUser } from '../services/authService';

/**
 * Email validation regex
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function AddUserScreen({ navigation }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  // Password strength (0-4)
  const passwordStrength = React.useMemo(() => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[^a-zA-Z0-9]/.test(password) && strength >= 3) strength = 4;
    return Math.min(strength, 4);
  }, [password]);

  // Check if passwords match
  const passwordsMatch = confirmPassword && password === confirmPassword;

  const validateForm = () => {
    let valid = true;

    // Email validation
    if (!email.trim()) {
      setEmailError(t('signup.errors.emailRequired'));
      valid = false;
    } else if (!isValidEmail(email)) {
      setEmailError(t('signup.errors.emailInvalid'));
      valid = false;
    } else {
      setEmailError('');
    }

    // Password validation
    if (!password) {
      setPasswordError(t('signup.errors.passwordRequired'));
      valid = false;
    } else if (password.length < 8) {
      setPasswordError(t('signup.errors.passwordTooShort'));
      valid = false;
    } else if (passwordStrength < 2) {
      setPasswordError(t('signup.errors.passwordWeak'));
      valid = false;
    } else {
      setPasswordError('');
    }

    // Confirm password validation
    if (!confirmPassword) {
      setConfirmPasswordError(t('signup.errors.confirmPasswordRequired'));
      valid = false;
    } else if (!passwordsMatch) {
      setConfirmPasswordError(t('signup.errors.passwordsDoNotMatch'));
      valid = false;
    } else {
      setConfirmPasswordError('');
    }

    return valid;
  };

  const handleCreateUser = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Call signUp with empty fullName and matricule, but role will be set to "user" by default
      // Since signUp doesn't accept role parameter, we'll need to handle this differently
      // We'll create the user with the standard signUp, then update the role if needed
      const result = await signUpUser(email, password, 'User', '');

      if (result.success) {
        // Clear form
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        
        Alert.alert(t('common.success'), t('admin.userCreatedSuccess', 'User account created successfully'), [
          {
            text: t('common.ok'),
            onPress: () => {
              // Stay on screen to allow creating more users
            },
          },
        ]);
      } else {
        Alert.alert(t('common.error'), result.message);
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Decorative background arc */}
        <View style={styles.decorativeArc} />

        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t('admin.addUserTitle', 'Add User Account')}</Text>
          <Text style={styles.subtitle}>{t('admin.addUserSubtitle', 'Create a new user account')}</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <AuthInput
            label={t('signup.email')}
            iconName="mail-outline"
            iconType="ionic"
            value={email}
            onChangeText={setEmail}
            error={emailError}
            placeholder={t('signup.emailPlaceholder')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <AuthInput
            label={t('signup.password')}
            iconName="lock-closed"
            iconType="ionic"
            value={password}
            onChangeText={setPassword}
            error={passwordError}
            placeholder={t('signup.passwordPlaceholder')}
            secureTextEntry={false}
            showSecureToggle={true}
            autoComplete="new-password"
          />

          {/* Password strength indicator */}
          {password.length > 0 && (
            <PasswordStrengthBar password={password} />
          )}

          <AuthInput
            label={t('signup.confirmPassword')}
            iconName="lock-closed"
            iconType="ionic"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={confirmPasswordError}
            placeholder={t('signup.confirmPasswordPlaceholder')}
            secureTextEntry={false}
            showSecureToggle={true}
            rightIcon={
              confirmPassword ? (
                <View style={[
                  styles.checkIconContainer,
                  { backgroundColor: passwordsMatch ? COLORS.success : COLORS.border }
                ]}>
                  <Text style={styles.checkIcon}>✓</Text>
                </View>
              ) : undefined
            }
            autoComplete="new-password"
          />

          <TouchableOpacity
            style={[
              styles.primaryButton,
              isLoading && styles.buttonDisabled,
            ]}
            onPress={handleCreateUser}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.primaryButtonText}>{t('admin.createUserButton', 'Create User')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  decorativeArc: {
    position: 'absolute',
    top: -100,
    left: -50,
    right: -50,
    height: 200,
    backgroundColor: COLORS.primary + '0D', // ~5% opacity
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 20,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 28,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  title: {
    fontSize: FONT_SIZES.title,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.subtitle,
    color: COLORS.text2,
    textAlign: 'center',
  },
  form: {
    marginBottom: 16,
  },
  checkIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkIcon: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    ...SHADOW.small,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: FONT_SIZES.button,
    fontWeight: '600',
    color: COLORS.white,
  },
});