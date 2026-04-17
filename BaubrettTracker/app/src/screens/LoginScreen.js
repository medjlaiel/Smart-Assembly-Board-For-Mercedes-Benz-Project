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
  const [selectedRole, setSelectedRole] = useState('user'); // 'user' or 'admin'
  const [matricule, setMatricule] = useState('');
  const [matriculeError, setMatriculeError] = useState('');

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

    // Matricule validation for admin role
    if (selectedRole === 'admin') {
      if (!matricule.trim()) {
        setMatriculeError('Matricule is required for admin login');
        valid = false;
      } else if (matricule.trim() !== '04048347') {
        setMatriculeError('Invalid matricule.');
        valid = false;
      } else {
        setMatriculeError('');
      }
    } else {
      setMatriculeError('');
    }

    return valid;
  };

   const handleSignIn = async () => {
     if (!validateForm()) return;
   
     setIsLoading(true);
   
     try {
       const result = await signInUser(email, password);
   
       if (result.success) {
         // Add role to user object
         const userWithRole = {
           ...result.user,
           role: selectedRole,
         };
         
         // Set current user in AuthContext
         login(userWithRole);
         const welcomeMessage = `${t('auth.welcome')} ${result.user.fullName}`;
         Alert.alert(welcomeMessage, '', [
           {
             text: t('common.ok'),
             onPress: () => {
               // Navigate to Admin Dashboard if admin, Home if user
               const destination = selectedRole === 'admin' ? 'AdminDashboard' : 'Home';
               navigation.replace(destination);
             },
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

  const handleRoleSwitch = (role) => {
    setSelectedRole(role);
    setMatricule(''); // Clear matricule when switching roles
    setMatriculeError(''); // Clear error
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

        {/* Role Selector */}
        <View style={styles.roleSelector}>
          <TouchableOpacity
            style={[
              styles.roleButton,
              selectedRole === 'user' && styles.roleButtonActive,
            ]}
            onPress={() => handleRoleSwitch('user')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.roleButtonText,
                selectedRole === 'user' && styles.roleButtonTextActive,
              ]}
            >
              User
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleButton,
              selectedRole === 'admin' && styles.roleButtonActive,
            ]}
            onPress={() => handleRoleSwitch('admin')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.roleButtonText,
                selectedRole === 'admin' && styles.roleButtonTextActive,
              ]}
            >
              Admin
            </Text>
          </TouchableOpacity>
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
            secureTextEntry={false}
            showSecureToggle={true}
            autoComplete="current-password"
            importantForAutofill="yes"
          />

          {/* Matricule Field - Only for Admin */}
          {selectedRole === 'admin' && (
            <AuthInput
              label="Matricule"
              iconName="id-card"
              iconType="ionic"
              value={matricule}
              onChangeText={setMatricule}
              error={matriculeError}
              placeholder="Enter the matricule"
              autoCapitalize="none"
              autoComplete="off"
            />
          )}

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
    backgroundColor: COLORS.primary + '0D',
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
  roleSelector: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 12,
    justifyContent: 'center',
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.text2,
    backgroundColor: 'transparent',
  },
  roleButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  roleButtonText: {
    fontSize: FONT_SIZES.label,
    fontWeight: '600',
    color: COLORS.text2,
    textAlign: 'center',
  },
  roleButtonTextActive: {
    color: COLORS.white,
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