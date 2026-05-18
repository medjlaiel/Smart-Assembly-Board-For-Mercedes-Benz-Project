/**
 * SettingsScreen.js
 * User profile editing and change password functionality.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOW, FONT_SIZES } from '../assets/theme';
import { changePassword } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

const PROFILE_KEYS = {
  name: 'user_name',
  employeeId: 'employee_id',
  role: 'user_role',
};

// ── Section Title ─────────────────────────────────────────────────
function SectionTitle({ text }) {
  return (
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionTitleAccent} />
      <Text style={styles.sectionTitleText}>{text}</Text>
    </View>
  );
}

// ── Avatar Circle ──────────────────────────────────────────────────
function AvatarCircle({ name }) {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';
  return (
    <View style={styles.avatarContainer}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );
}

// ── Role Pill Selector ──────────────────────────────────────────────
function RoleSelector({ value, onSelect }) {
  const roles = ['Operator', 'Admin (PNAV)'];
  return (
    <View style={styles.roleRow}>
      {roles.map((role) => {
        const active = value === role;
        return (
          <TouchableOpacity
            key={role}
            style={[styles.rolePill, active && styles.rolePillActive]}
            onPress={() => onSelect(role)}
            activeOpacity={0.7}
          >
            <Text style={[styles.rolePillText, active && styles.rolePillTextActive]}>
              {role}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Password Requirement Item ─────────────────────────────────────
function RequirementItem({ met, text }) {
  return (
    <View style={styles.requirementItem}>
      <Ionicons
        name={met ? 'checkmark-circle' : 'ellipse-outline'}
        size={18}
        color={met ? COLORS.success : COLORS.text3}
      />
      <Text style={[styles.requirementText, met && styles.requirementMet]}>{text}</Text>
    </View>
  );
}

// ── Main Screen ────────────────────────────────────────────────────
export default function SettingsScreen() {
  const { currentUser } = useAuth();

  // Profile state
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [role, setRole] = useState('Operator');
  const [saving, setSaving] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Load profile from AsyncStorage on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [savedName, savedId, savedRole] = await Promise.all([
          AsyncStorage.getItem(PROFILE_KEYS.name),
          AsyncStorage.getItem(PROFILE_KEYS.employeeId),
          AsyncStorage.getItem(PROFILE_KEYS.role),
        ]);
        if (savedName) setName(savedName);
        if (savedId) setEmployeeId(savedId);
        if (savedRole) setRole(savedRole);
      } catch (err) {
        console.error('Error loading profile:', err);
      }
    };
    loadProfile();
  }, []);

  // Save profile
  const handleSaveProfile = useCallback(async () => {
    setSaving(true);
    try {
      await Promise.all([
        AsyncStorage.setItem(PROFILE_KEYS.name, name),
        AsyncStorage.setItem(PROFILE_KEYS.employeeId, employeeId),
        AsyncStorage.setItem(PROFILE_KEYS.role, role),
      ]);
      Alert.alert('Success', 'Profile saved successfully');
    } catch (err) {
      console.error('Error saving profile:', err);
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }, [name, employeeId, role]);

  // Password strength
  const passwordStrength = React.useMemo(() => {
    let strength = 0;
    if (newPassword.length >= 8) strength += 1;
    if (/[a-z]/.test(newPassword)) strength += 1;
    if (/[A-Z]/.test(newPassword)) strength += 1;
    if (/\d/.test(newPassword)) strength += 1;
    if (/[^a-zA-Z0-9]/.test(newPassword) && strength >= 3) strength = 4;
    return Math.min(strength, 4);
  }, [newPassword]);

  const passwordsMatch = confirmPassword && newPassword === confirmPassword;

  const validatePasswordForm = () => {
    if (!currentPassword) {
      Alert.alert('Error', 'Current password is required');
      return false;
    }
    if (!newPassword) {
      Alert.alert('Error', 'New password is required');
      return false;
    }
    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return false;
    }
    if (passwordStrength < 2) {
      Alert.alert('Error', 'Password is too weak');
      return false;
    }
    if (!confirmPassword) {
      Alert.alert('Error', 'Please confirm your password');
      return false;
    }
    if (!passwordsMatch) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    return true;
  };

  const handleChangePassword = useCallback(async () => {
    if (!validatePasswordForm()) return;
    setPasswordLoading(true);
    try {
      const result = await changePassword(currentUser?.id, currentPassword, newPassword);
      if (result.success) {
        Alert.alert('Success', 'Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Error', result.message || 'Failed to change password');
      }
    } catch (err) {
      console.error('Password change error:', err);
      Alert.alert('Error', 'An error occurred');
    } finally {
      setPasswordLoading(false);
    }
  }, [currentPassword, newPassword, confirmPassword, passwordsMatch, passwordStrength, currentUser]);

  const strengthColors = ['#EF4444', '#F59E0B', '#22C55E', '#22C55E', '#20B2AA'];

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ════════════════════════════════════════════════
             SECTION 1 — USER PROFILE
          ════════════════════════════════════════════════ */}
          <SectionTitle text="User Profile" />

          <View style={styles.card}>
            <AvatarCircle name={name || currentUser?.fullName} />

            {/* Operator Name */}
            <Text style={styles.fieldLabel}>Operator Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={COLORS.text3}
            />

            {/* Employee ID */}
            <Text style={styles.fieldLabel}>Employee ID</Text>
            <TextInput
              style={styles.input}
              value={employeeId}
              onChangeText={setEmployeeId}
              placeholder="Enter employee ID"
              placeholderTextColor={COLORS.text3}
            />

            {/* Role Selector */}
            <Text style={styles.fieldLabel}>Role</Text>
            <RoleSelector value={role} onSelect={setRole} />

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.buttonDisabled]}
              onPress={handleSaveProfile}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons name="save-outline" size={20} color={COLORS.white} />
                  <Text style={styles.saveButtonText}>Save Profile</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* ════════════════════════════════════════════════
             SECTION 2 — CHANGE PASSWORD
          ════════════════════════════════════════════════ */}
          <SectionTitle text="Change Password" />

          <View style={styles.card}>
            {/* Current Password */}
            <Text style={styles.fieldLabel}>Current Password</Text>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter current password"
              placeholderTextColor={COLORS.text3}
              secureTextEntry
            />

            {/* New Password */}
            <Text style={styles.fieldLabel}>New Password</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              placeholderTextColor={COLORS.text3}
              secureTextEntry
            />

            {/* Password Strength Bar */}
            {newPassword.length > 0 && (
              <View style={styles.strengthBar}>
                {[1, 2, 3, 4].map((level) => (
                  <View
                    key={level}
                    style={[
                      styles.strengthSegment,
                      { backgroundColor: level <= passwordStrength ? strengthColors[passwordStrength] : COLORS.border },
                    ]}
                  />
                ))}
              </View>
            )}

            {/* Confirm New Password */}
            <Text style={styles.fieldLabel}>Confirm New Password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              placeholderTextColor={COLORS.text3}
              secureTextEntry
            />
            {confirmPassword !== '' && (
              <View style={styles.matchRow}>
                <Ionicons
                  name={passwordsMatch ? 'checkmark-circle' : 'close-circle'}
                  size={18}
                  color={passwordsMatch ? COLORS.success : COLORS.error}
                />
                <Text style={[styles.matchText, { color: passwordsMatch ? COLORS.success : COLORS.error }]}>
                  {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </Text>
              </View>
            )}

            {/* Password Requirements */}
            <View style={styles.requirementsBox}>
              <Text style={styles.requirementsTitle}>Password requirements:</Text>
              <RequirementItem met={newPassword.length >= 8} text="At least 8 characters" />
              <RequirementItem met={/[a-z]/.test(newPassword)} text="Lowercase letter" />
              <RequirementItem met={/[A-Z]/.test(newPassword)} text="Uppercase letter" />
              <RequirementItem met={/\d/.test(newPassword)} text="Number" />
              <RequirementItem met={passwordsMatch && confirmPassword !== ''} text="Passwords match" />
            </View>

            {/* Update Password Button */}
            <TouchableOpacity
              style={[styles.updatePasswordButton, passwordLoading && styles.buttonDisabled]}
              onPress={handleChangePassword}
              disabled={passwordLoading}
              activeOpacity={0.8}
            >
              {passwordLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons name="lock-closed-outline" size={20} color={COLORS.white} />
                  <Text style={styles.saveButtonText}>Update Password</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 16,
  },
  sectionTitleAccent: {
    width: 4,
    height: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    marginRight: 10,
  },
  sectionTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text2,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.small,
  },
  // Avatar
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
    ...SHADOW.small,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.white,
  },
  // Fields
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text2,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  // Role selector
  roleRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  rolePill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.border + '80',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rolePillActive: {
    backgroundColor: COLORS.primary,
  },
  rolePillText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text2,
  },
  rolePillTextActive: {
    color: COLORS.white,
  },
  // Save button
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    ...SHADOW.medium,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.button,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  // Password strength bar
  strengthBar: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 8,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  // Match indicator
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  matchText: {
    fontSize: 13,
    fontWeight: '500',
  },
  // Requirements
  requirementsBox: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: 14,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  requirementsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 10,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 13,
    color: COLORS.text2,
    marginLeft: 8,
  },
  requirementMet: {
    color: COLORS.success,
    fontWeight: '500',
  },
  // Update password button
  updatePasswordButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    ...SHADOW.medium,
  },
  // Footer spacer
  footer: {
    height: 40,
  },
});
