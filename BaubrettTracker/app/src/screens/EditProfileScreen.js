/**
 * EditProfileScreen.js
 * Editable profile fields: Name, Employee ID, and Role selector.
 * Uses AppContext for theme and translations.
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
import { useApp } from '../contexts/AppContext';

const PROFILE_KEYS = { name: 'user_name', employeeId: 'employee_id', role: 'user_role' };

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function RoleSelector({ value, onSelect, theme }) {
  const roles = ['Operator', 'Admin (PNAV)'];
  return (
    <View style={styles.roleRow}>
      {roles.map((role) => {
        const active = value === role;
        return (
          <TouchableOpacity
            key={role}
            style={[
              styles.rolePill,
              active
                ? { backgroundColor: theme.primary }
                : { backgroundColor: theme.border },
            ]}
            onPress={() => onSelect(role)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.rolePillText,
                { color: active ? '#FFFFFF' : theme.subtext },
              ]}
            >
              {role}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function EditProfileScreen({ navigation }) {
  const { theme, t, language } = useApp();
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
  }, [language]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await Promise.all([
        AsyncStorage.setItem(PROFILE_KEYS.name, name),
        AsyncStorage.setItem(PROFILE_KEYS.employeeId, employeeId),
        AsyncStorage.setItem(PROFILE_KEYS.role, role),
      ]);
      Alert.alert('Success', t('profileSaved'), [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error('Error saving profile:', err);
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }, [name, employeeId, role, navigation, t]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatarCircle, { backgroundColor: theme.primary }]}>
                <Text style={styles.avatarText}>{getInitials(name)}</Text>
              </View>
            </View>
            <Text style={[styles.fieldLabel, { color: theme.subtext }]}>{t('name')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={theme.subtext}
            />
            <Text style={[styles.fieldLabel, { color: theme.subtext }]}>{t('employeeId')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]}
              value={employeeId}
              onChangeText={setEmployeeId}
              placeholder="Enter employee ID"
              placeholderTextColor={theme.subtext}
            />
            <Text style={[styles.fieldLabel, { color: theme.subtext }]}>{t('role')}</Text>
            <RoleSelector value={role} onSelect={setRole} theme={theme} />
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.primary }, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>{t('saveProfile')}</Text>
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
  safe: { flex: 1 },
  flex: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 40 },
  card: { borderRadius: 16, borderWidth: 1, padding: 20 },
  avatarContainer: { alignItems: 'center', marginBottom: 24 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#FFFFFF' },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15 },
  roleRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  rolePill: { flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  rolePillText: { fontSize: 14, fontWeight: '600' },
  saveButton: { borderRadius: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24 },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});