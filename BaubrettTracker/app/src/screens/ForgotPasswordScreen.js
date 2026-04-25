/**
 * ForgotPasswordScreen.js
 * Flow: enter email -> send code -> enter code -> reset password
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import AuthInput from '../components/AuthInput';
import { COLORS, RADIUS, SHADOW } from '../assets/theme';
import {
  sendResetCode,
  verifyResetCode,
  resetPasswordWithCode,
} from '../services/authService';

export default function ForgotPasswordScreen({ navigation }) {
  const { t } = useTranslation();
  const [step, setStep] = useState('email'); // email, code, reset
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSendCode = async () => {
    if (!email.trim()) return Alert.alert(t('common.error'), 'Please enter your email');
    const res = await sendResetCode(email.trim().toLowerCase());
    if (!res.success) return Alert.alert(t('common.error'), res.message || 'Unable to send code');
    // For demo we show the code to the user in an alert (console also logs it)
    Alert.alert(t('common.success'), `Reset code sent. Code: ${res.code}`);
    setStep('code');
  };

  const handleVerifyCode = async () => {
    if (!code.trim()) return Alert.alert(t('common.error'), 'Please enter the code');
    const res = await verifyResetCode(email.trim().toLowerCase(), code.trim());
    if (!res.success) return Alert.alert(t('common.error'), res.message || 'Invalid code');
    setStep('reset');
  };

  const handleReset = async () => {
    if (!password || password.length < 8) return Alert.alert(t('common.error'), 'Password must be at least 8 characters');
    if (password !== confirmPassword) return Alert.alert(t('common.error'), 'Passwords do not match');
    const res = await resetPasswordWithCode(email.trim().toLowerCase(), code.trim(), password);
    if (!res.success) return Alert.alert(t('common.error'), res.message || 'Unable to reset password');
    Alert.alert(t('common.success'), 'Password updated. You can now login.', [
      { text: 'OK', onPress: () => navigation.replace('Login') },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{t('forgot.title') || 'Forgot Password'}</Text>

        {step === 'email' && (
          <>
            <AuthInput
              label={t('login.email') || 'Email'}
              iconName="mail-outline"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TouchableOpacity style={[styles.button, SHADOW.small]} onPress={handleSendCode}>
              <Text style={styles.buttonText}>{t('forgot.sendCode') || 'Send Code'}</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 'code' && (
          <>
            <AuthInput
              label={t('forgot.code') || 'Enter Code'}
              iconName="pin"
              value={code}
              onChangeText={setCode}
              keyboardType="numeric"
            />
            <TouchableOpacity style={[styles.button, SHADOW.small]} onPress={handleVerifyCode}>
              <Text style={styles.buttonText}>{t('forgot.verify') || 'Verify Code'}</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 'reset' && (
          <>
            <AuthInput
              label={t('signup.password') || 'New Password'}
              iconName="lock-closed"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
            />
            <AuthInput
              label={t('signup.confirmPassword') || 'Confirm Password'}
              iconName="lock-closed"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={true}
            />
            <TouchableOpacity style={[styles.button, SHADOW.small]} onPress={handleReset}>
              <Text style={styles.buttonText}>{t('forgot.reset') || 'Reset Password'}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', padding: 20 },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 18 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  button: { backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: RADIUS.md, alignItems: 'center', marginTop: 12 },
  buttonText: { color: '#FFF', fontWeight: '700' },
});
