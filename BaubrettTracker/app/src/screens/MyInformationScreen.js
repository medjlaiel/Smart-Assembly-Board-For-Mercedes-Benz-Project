/**
 * MyInformationScreen.js
 * Read-only display of user profile data loaded from AsyncStorage.
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
import { COLORS, RADIUS, SHADOW, FONT_SIZES } from '../assets/theme';
import { useAuth } from '../contexts/AuthContext';

const PROFILE_KEYS = {
  name: 'user_name',
  employeeId: 'employee_id',
  role: 'user_role',
};

function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '—'}</Text>
    </View>
  );
}

export default function MyInformationScreen({ navigation }) {
  const { currentUser } = useAuth();
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [role, setRole] = useState('');
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

  // Refresh data when coming back from EditProfile
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const reload = async () => {
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
          console.error('Error reloading profile:', err);
        }
      };
      reload();
    });
    return unsubscribe;
  }, [navigation]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const displayName = name || currentUser?.fullName || '';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
            </View>
          </View>

          {/* Info rows */}
          <InfoRow label="Name" value={displayName} />
          <View style={styles.divider} />
          <InfoRow label="Employee ID" value={employeeId} />
          <View style={styles.divider} />
          <InfoRow label="Role" value={role || (currentUser?.role === 'admin' ? 'Admin (PNAV)' : 'Operator')} />
        </View>

        {/* Edit Profile Button */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditProfile')}
          activeOpacity={0.8}
        >
          <Ionicons name="create-outline" size={20} color={COLORS.white} />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
    maxWidth: '60%',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border + '60',
  },
  editButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    ...SHADOW.medium,
  },
  editButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.button,
    fontWeight: '700',
  },
});