/**
 * EditProfileScreen.js
 * Editable profile fields: Name, Employee ID, and Role selector.
 * Saves to AsyncStorage and navigates back to MyInformationScreen.
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
import { useAuth } from '../contexts/AuthContext';

const PROFILE_KEYS = {
  name: 'user_name',
  employeeId: 'employee_id',
  role: 'user_role',
};

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

export default function EditProfileScreen({ navigation }) {
  const { currentUser } = useAuth();
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [role, setRole] = useState('Operator');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
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
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await Promise.all([
        AsyncStorage.setItem(PROFILE_KEYS.name, name),
        AsyncStorage.setItem(PROFILE_KEYS.employeeId, employeeId),
        AsyncStorage.setItem(PROFILE_KEYS.role, role),
      ]);
      Alert.alert('Success', 'Profile saved successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error('Error saving profile:', err);
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }, [name, employeeId, role, navigation]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {name
                    ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                    : '?'}
                </Text>
              </View>
            </View>

            {/* Name */}
            <Text style={styles.fieldLabel}>Name</Text>
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

            {/* Role */}
            <Text style={styles.fieldLabel}>Role</Text>
            <RoleSelector value={role} onSelect={setRole} />

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons name="save-outline" size={20} color={COLORS.white} />
                  <Text style={styles.saveButtonText}>Save</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 40 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    ...SHADOW.small,
  },
  avatarContainer: { alignItems: 'center', marginBottom: 24 },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.small,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: COLORS.white },
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
  roleRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  rolePill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.border + '80',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rolePillActive: { backgroundColor: COLORS.primary },
  rolePillText: { fontSize: 14, fontWeight: '600', color: COLORS.text2 },
  rolePillTextActive: { color: COLORS.white },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    ...SHADOW.medium,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.button,
    fontWeight: '700',
  },
  buttonDisabled: { opacity: 0.6 },
});