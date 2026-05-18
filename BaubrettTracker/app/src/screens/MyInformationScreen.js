/**
 * MyInformationScreen.js
 * Read-only display of user profile data loaded from AsyncStorage.
 * Uses AppContext for theme and translations.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';

const PROFILE_KEYS = { name: 'user_name', employeeId: 'employee_id', role: 'user_role' };

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function InfoRow({ label, value, theme }) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: theme.subtext }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: theme.text }]}>{value || '\u2014'}</Text>
    </View>
  );
}

export default function MyInformationScreen({ navigation }) {
  const { currentUser } = useAuth();
  const { theme, t } = useApp();
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
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

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const displayName = name || currentUser?.fullName || '';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatarCircle, { backgroundColor: theme.primary }]}>
              <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
            </View>
          </View>
          <InfoRow label={t('name')} value={displayName} theme={theme} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <InfoRow label={t('employeeId')} value={employeeId} theme={theme} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <InfoRow label={t('role')} value={role || (currentUser?.role === 'admin' ? t('admin') : t('operator'))} theme={theme} />
        </View>
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('EditProfile')}
          activeOpacity={0.8}
        >
          <Ionicons name="create-outline" size={20} color="#FFFFFF" />
          <Text style={styles.editButtonText}>{t('editProfile')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 40 },
  card: { borderRadius: 16, borderWidth: 1, padding: 20 },
  avatarContainer: { alignItems: 'center', marginBottom: 24 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#FFFFFF' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  infoLabel: { fontSize: 14, fontWeight: '600' },
  infoValue: { fontSize: 15, fontWeight: '500', maxWidth: '60%', textAlign: 'right' },
  divider: { height: 1, opacity: 0.5 },
  editButton: { borderRadius: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24 },
  editButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});