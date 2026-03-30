/**
 * HomeScreen.js
 * Landing screen with two primary actions:
 *   1. Save a Baubrett (scan + link to zone + write Excel)
 *   2. Consult a Baubrett (scan + show DB details)
 * Plus a shortcut to the tracking History screen.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { COLORS, RADIUS, SHADOW, FONT_SIZES } from '../assets/theme';

// ── Action card component ──────────────────────────────────────
function ActionCard({ emoji, title, subtitle, color, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: color }, SHADOW.medium]}
      onPress={onPress}
      activeOpacity={0.82}
    >
      <View style={[styles.cardIcon, { backgroundColor: color + '20' }]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <View style={styles.cardText}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>
      <Text style={[styles.arrow, { color }]}>›</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const { t } = useTranslation();
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* ── Hero banner ─────────────────────────────────── */}
        <View style={[styles.hero, SHADOW.medium]}>
          <Text style={styles.heroEmoji}>📦</Text>
          <Text style={styles.heroTitle}>{t('home.title')}</Text>
          <Text style={styles.heroSub}>
            {t('home.subtitle')}
          </Text>
        </View>

        {/* ── Section label ───────────────────────────────── */}
        <Text style={styles.sectionLabel}>{t('home.actions')}</Text>

        {/* ── Primary action cards ─────────────────────────── */}
        <ActionCard
          emoji="💾"
          title={t('home.saveBaubrett.title')}
          subtitle={t('home.saveBaubrett.subtitle')}
          color={COLORS.primary}
          onPress={() => navigation.navigate('SaveScanBaubrett')}
        />

        <ActionCard
          emoji="🔍"
          title={t('home.consultBaubrett.title')}
          subtitle={t('home.consultBaubrett.subtitle')}
          color={COLORS.primary}
          onPress={() => navigation.navigate('ConsultScan')}
        />

        {/* ── Divider ─────────────────────────────────────── */}
        <View style={styles.divider} />
        <Text style={styles.sectionLabel}>{t('home.records')}</Text>

        {/* ── History card ─────────────────────────────────── */}
        <ActionCard
          emoji="📋"
          title={t('home.history.title')}
          subtitle={t('home.history.subtitle')}
          color={COLORS.success}
          onPress={() => navigation.navigate('History')}
        />

        {/* ── Logout button ────────────────────────────────── */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => navigation.replace('Login')}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>{t('home.logout')}</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: 20, paddingBottom: 40 },

  // Hero
  hero: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: 28,
    alignItems: 'center',
    marginBottom: 28,
  },
  heroEmoji: { fontSize: 48, marginBottom: 10 },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  heroSub: {
    marginTop: 6,
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Section labels
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text3,
    letterSpacing: 1.2,
    marginBottom: 12,
    marginLeft: 4,
  },

  // Cards
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderLeftWidth: 4,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  emoji: { fontSize: 26 },
  cardText: { flex: 1 },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 3,
  },
  cardSubtitle: {
    fontSize: 12,
    color: COLORS.text2,
    lineHeight: 18,
  },
  arrow: {
    fontSize: 28,
    fontWeight: '300',
    marginLeft: 8,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 20,
  },

  // Logout button
  logoutButton: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.error,
    ...SHADOW.small,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  logoutText: {
    fontSize: FONT_SIZES.button,
    fontWeight: '600',
    color: COLORS.error,
  },
});
