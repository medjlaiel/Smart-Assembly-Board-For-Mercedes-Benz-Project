/**
 * SignUpScreen.js — User registration/sign up screen
 * Features: name, email, password with strength, confirm password, terms, social login
 */
import React, { useState, useEffect } from 'react';
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
import { COLORS, FONT_SIZES, RADIUS, SHADOW } from '../assets/theme';
import AuthInput from '../components/AuthInput';
import SocialButton from '../components/SocialButton';
import PasswordStrengthBar from '../components/PasswordStrengthBar';
import { signUp as signUpUser } from '../services/authService';

/**
 * Email validation regex
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function SignUpScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [termsError, setTermsError] = useState('');

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

    // Name validation
    if (!fullName.trim()) {
      setNameError('Full name is required');
      valid = false;
    } else if (fullName.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      valid = false;
    } else {
      setNameError('');
    }

    // Email validation
    if (!email.trim()) {
      setEmailError('Email is required');
      valid = false;
    } else if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      valid = false;
    } else {
      setEmailError('');
    }

    // Password validation
    if (!password) {
      setPasswordError('Password is required');
      valid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      valid = false;
    } else if (passwordStrength < 2) {
      setPasswordError('Please create a stronger password');
      valid = false;
    } else {
      setPasswordError('');
    }

    // Confirm password validation
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      valid = false;
    } else if (!passwordsMatch) {
      setConfirmPasswordError('Passwords do not match');
      valid = false;
    } else {
      setConfirmPasswordError('');
    }

    // Terms validation
    if (!agreeToTerms) {
      setTermsError('You must agree to the terms');
      valid = false;
    } else {
      setTermsError('');
    }

    return valid;
  };

  const handleCreateAccount = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const result = await signUpUser(email, password, fullName);

      if (result.success) {
        Alert.alert('Success', result.message, [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]);
      } else {
        // Show error message (including duplicate username warning)
        Alert.alert('Sign Up Failed', result.message);
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  const handleSocialLogin = (provider) => {
    Alert.alert('Social Login', `${provider} login not implemented in demo`);
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
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Join us today, it's free</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <AuthInput
            label="Full Name"
            iconName="person-outline"
            iconType="ionic"
            value={fullName}
            onChangeText={setFullName}
            error={nameError}
            placeholder="Enter your full name"
            autoCapitalize="words"
            autoComplete="name"
          />

          <AuthInput
            label="Email"
            iconName="mail-outline"
            iconType="ionic"
            value={email}
            onChangeText={setEmail}
            error={emailError}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <AuthInput
            label="Password"
            iconName="lock-closed"
            iconType="ionic"
            value={password}
            onChangeText={setPassword}
            error={passwordError}
            placeholder="Create a password"
            secureTextEntry={false}
            showSecureToggle={true}
            autoComplete="new-password"
          />

          {/* Password strength indicator */}
          {password.length > 0 && (
            <PasswordStrengthBar password={password} />
          )}

          <AuthInput
            label="Confirm Password"
            iconName="lock-closed"
            iconType="ionic"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={confirmPasswordError}
            placeholder="Confirm your password"
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

          {/* Terms checkbox */}
          <TouchableOpacity
            style={styles.customCheckboxContainer}
            onPress={() => setAgreeToTerms(!agreeToTerms)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.customCheckbox,
              agreeToTerms && styles.customCheckboxChecked,
              { borderColor: agreeToTerms ? COLORS.primary : COLORS.border }
            ]}>
              {agreeToTerms && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>
          {termsError ? (
            <Text style={styles.termsError}>{termsError}</Text>
          ) : null}

          <TouchableOpacity
            style={[
              styles.primaryButton,
              (!agreeToTerms || isLoading) && styles.buttonDisabled,
            ]}
            onPress={handleCreateAccount}
            disabled={!agreeToTerms || isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.primaryButtonText}>Create account</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or sign up with</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Login */}
        <View style={styles.socialContainer}>
          <SocialButton
            provider="google"
            onPress={() => handleSocialLogin('Google')}
          />
          <SocialButton
            provider="apple"
            onPress={() => handleSocialLogin('Apple')}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Sign in</Text>
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
  customCheckboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    marginBottom: 8,
  },
  customCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  customCheckboxChecked: {
    backgroundColor: COLORS.primary,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  termsText: {
    fontSize: 13,
    color: COLORS.text2,
    flex: 1,
    lineHeight: 18,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  termsError: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
    marginLeft: 0,
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 13,
    color: COLORS.text3,
    marginHorizontal: 16,
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.text2,
  },
  footerLink: {
    fontSize: FONT_SIZES.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
});
