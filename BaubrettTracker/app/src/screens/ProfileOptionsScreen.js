/**
 * ProfileOptionsScreen.js
 * Two options: My Information and Change Password only.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext';

function ProfileRow({ icon, label, theme, onPress }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconBox, { backgroundColor: theme.primary + '18' }]}>
        <Ionicons name={icon} size={22} color={theme.primary} />
      </View>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color={theme.subtext} />
    </TouchableOpacity>
  );
}

export default function ProfileOptionsScreen({ navigation }) {
  const { theme, t } = useApp();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <ProfileRow
            icon="information-circle-outline"
            label={t('myInformation')}
            theme={theme}
            onPress={() => navigation.navigate('MyInformation')}
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ProfileRow
            icon="lock-closed-outline"
            label={t('changePassword')}
            theme={theme}
            onPress={() => navigation.navigate('ChangePassword')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  card: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16 },
  divider: { height: 1, opacity: 0.5, marginHorizontal: 16 },
  iconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  label: { flex: 1, fontSize: 16, fontWeight: '600' },
});