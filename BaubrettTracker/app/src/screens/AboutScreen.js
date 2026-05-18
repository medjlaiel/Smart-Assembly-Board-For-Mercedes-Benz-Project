/**
 * AboutScreen.js — Static information screen about the application.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext';

export default function AboutScreen() {
  const { theme, t } = useApp();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* App Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="cube-outline" size={64} color={theme.primary} />
        </View>

        {/* App Name & Version */}
        <Text style={[styles.appName, { color: theme.text }]}>{t('appName')}</Text>
        <Text style={[styles.version, { color: theme.subtext }]}>{t('version')} 1.0.0</Text>

        {/* Description Card */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardText, { color: theme.text }]}>{t('description')}</Text>
        </View>

        {/* Info Rows */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <InfoRow label={t('developer')} value="Aziz Jelaiel" theme={theme} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <InfoRow label={t('university')} value="University of Sfax" theme={theme} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <InfoRow label={t('internshipYear')} value="2024/2025" theme={theme} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <InfoRow label={t('company')} value="Mercedes-Benz" theme={theme} />
        </View>

        {/* Mercedes logo if exists */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.mercedesLabel, { color: theme.subtext }]}>Mercedes-Benz</Text>
          <Text style={[styles.mercedesSub, { color: theme.text }]}>
            Smart Assembly Board Tracking System
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, theme }) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: theme.subtext }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 32, paddingBottom: 40, alignItems: 'center' },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: '#20B2AA20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  appName: { fontSize: 26, fontWeight: '800', marginBottom: 4 },
  version: { fontSize: 15, fontWeight: '500', marginBottom: 28 },
  card: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  cardText: { fontSize: 15, lineHeight: 22, textAlign: 'center' },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: { fontSize: 14, fontWeight: '600' },
  infoValue: { fontSize: 15, fontWeight: '500', maxWidth: '55%', textAlign: 'right' },
  divider: { height: 1, opacity: 0.5 },
  mercedesLabel: { fontSize: 13, fontWeight: '600', textAlign: 'center', marginBottom: 4 },
  mercedesSub: { fontSize: 14, textAlign: 'center', fontWeight: '500' },
});