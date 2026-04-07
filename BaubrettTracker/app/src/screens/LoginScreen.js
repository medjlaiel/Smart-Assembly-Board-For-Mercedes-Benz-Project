/**
 * LoginScreen.js — User authentication login screen
 * Features: email/password login, social login, navigation to sign up
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
import LanguageSelector from '../components/LanguageSelector';
import { signIn as signInUser } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

// Simple logo placeholder component
const LogoPlaceholder = () => (
  <View style={styles.logoContainer}>
    <View style={styles.logoCircle}>
      <Text style={styles.logoText}>D</Text>
    </View>
  </View>
);

/**
 * Email validation regex
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function LoginScreen({ navigation }) {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    } else {
      setPasswordError('');
    }

    return valid;
  };

   const handleSignIn = async () => {
     if (!validateForm()) return;
  
     setIsLoading(true);
  
     try {
       const result = await signInUser(email, password);
  
       if (result.success) {
         // Set current user in AuthContext
         login(result.user);
         const welcomeMessage = `${t('auth.welcome')} ${result.user.fullName}`;
         Alert.alert(welcomeMessage, '', [
           {
             text: t('common.ok'),
             onPress: () => navigation.replace('Home'),
           },
         ]);
       } else {
         Alert.alert(t('common.error'), result.message);
         setIsLoading(false);
       }
     } catch (error) {
       setIsLoading(false);
       Alert.alert(t('common.error'), t('common.error'));
     }
    };

  const handleForgotPassword = () => {
    Alert.alert('Forgot Password', 'Password reset functionality would go here');
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

        {/* Logo */}
        <LogoPlaceholder />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('login.title')}</Text>
          <Text style={styles.subtitle}>{t('login.subtitle')}</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <AuthInput
            label={t('login.email')}
            iconName="mail-outline"
            iconType="ionic"
            value={email}
            onChangeText={setEmail}
            error={emailError}
            placeholder={t('login.emailPlaceholder')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            importantForAutofill="yes"
          />

          <AuthInput
            label={t('login.password')}
            iconName="lock-closed"
            iconType="ionic"
            value={password}
            onChangeText={setPassword}
            error={passwordError}
            placeholder={t('login.passwordPlaceholder')}
            secureTextEntry={false} // We handle toggle internally via showSecureToggle
            showSecureToggle={true}
            autoComplete="current-password"
            importantForAutofill="yes"
          />

          <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordButton}>
            <Text style={styles.forgotPasswordText}>{t('login.forgotPassword')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.primaryButtonText}>{t('login.loginButton')}</Text>
            )}
          </TouchableOpacity>
         </View>

          {/* Footer */}
         <View style={styles.footer}>
           <Text style={styles.footerText}>{t('login.noAccount')}</Text>
           <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
             <Text style={styles.footerLink}>{t('login.signUpLink')}</Text>
           </TouchableOpacity>
         </View>

         {/* Language Selector - Bottom */}
         <LanguageSelector />
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
    paddingTop: 60,
    paddingBottom: 40,
  },
  decorativeArc: {
    position: 'absolute',
    top: -100,
    left: -50,
    right: -50,
    height: 200,
    backgroundColor: COLORS.primary + '0D', // 8% opacity (0x0D / 0xFF ≈ 5%, using 0D for subtle)
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW.medium,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
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
    marginBottom: 24,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    padding: 4,
  },
  forgotPasswordText: {
    fontSize: FONT_SIZES.label,
    color: COLORS.primary,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW.small,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
   primaryButtonText: {
     fontSize: FONT_SIZES.button,
     fontWeight: '600',
     color: COLORS.white,
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
