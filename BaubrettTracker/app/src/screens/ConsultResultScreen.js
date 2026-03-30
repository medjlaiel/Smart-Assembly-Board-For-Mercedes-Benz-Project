/**
 * ConsultResultScreen.js  (Consult Flow — Step 2 of 2)
 * Displays the full Baubrett record from the database:
 *   - SOM
 *   - Accessories (scrollable list)
 *   - FP-NO list
 * Also shows the last known location from the tracking file.
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { getHistoryForBaubrett } from '../services/trackingService';
import { COLORS, RADIUS, SHADOW } from '../assets/theme';

export default function ConsultResultScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { record } = route.params;
  const [lastLocation, setLastLocation] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Load last known location from the tracking Excel
  useEffect(() => {
    (async () => {
      const history = await getHistoryForBaubrett(record.BB_Nb);
      if (history.length > 0) {
        setLastLocation(history[history.length - 1]);
      }
      setLoadingHistory(false);
    })();
  }, [record.BB_Nb]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* ── Identity card ──────────────────────────────── */}
        <View style={[styles.idCard, SHADOW.medium]}>
          <View style={styles.idIcon}>
            <Text style={styles.idEmoji}>📦</Text>
          </View>
          <View>
            <Text style={styles.idBB}>{record.BB_Nb}</Text>
            <Text style={styles.idSOM}>{record.SOM}</Text>
          </View>
        </View>

        {/* ── Last location ─────────────────────────────── */}
        <View style={[styles.section, SHADOW.small]}>
          <Text style={styles.sectionTitle}>📍 {t('consultResult.lastLocation')}</Text>
          {loadingHistory ? (
            <ActivityIndicator color={COLORS.primary} style={{ marginTop: 10 }} />
          ) : lastLocation ? (
            <View style={styles.locationRow}>
              <Chip label={lastLocation.Zone} color={COLORS.primary} />
              <Text style={styles.locationMeta}>
                {lastLocation.Date} {t('consultResult.at')} {lastLocation.Time}
              </Text>
            </View>
          ) : (
            <Text style={styles.noData}>{t('consultResult.noLocation')}</Text>
          )}
        </View>

        {/* ── FP-NO ─────────────────────────────────────── */}
        <View style={[styles.section, SHADOW.small]}>
          <Text style={styles.sectionTitle}>🔢 {t('consultResult.fpNo')}</Text>
          {record.FP_NO && record.FP_NO.length > 0 ? (
            record.FP_NO.map((fp, i) => (
              <View key={i} style={styles.listItem}>
                <View style={styles.bullet} />
                <Text style={styles.listText}>{fp}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noData}>{t('consultResult.noFPNO')}</Text>
          )}
        </View>

        {/* ── Accessories ───────────────────────────────── */}
        <View style={[styles.section, SHADOW.small]}>
          <Text style={styles.sectionTitle}>
            🔧 {t('consultResult.accessories')}
            <Text style={styles.countBadge}>
              {record.Accessories ? ` (${record.Accessories.length})` : ''}
            </Text>
          </Text>
          {record.Accessories && record.Accessories.length > 0 ? (
            record.Accessories.map((acc, i) => (
              <View key={i} style={styles.listItem}>
                <View style={styles.bullet} />
                <Text style={styles.listText}>{acc}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noData}>{t('consultResult.noAccessories')}</Text>
          )}
        </View>

        {/* ── Action buttons ────────────────────────────── */}
        <TouchableOpacity
          style={[styles.btn, styles.btnSecondary]}
          onPress={() =>
            navigation.navigate('History', { filterBB: record.BB_Nb })
          }
        >
          <Text style={styles.btnSecondaryText}>📋 {t('consultResult.viewHistory')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.btnGhost]}
          onPress={() => navigation.navigate('ConsultScan')}
        >
          <Text style={styles.btnGhostText}>← {t('consultResult.scanAnother')}</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// Small pill chip component
function Chip({ label, color }) {
  return (
    <View style={[chipStyles.chip, { backgroundColor: color + '18', borderColor: color }]}>
      <Text style={[chipStyles.text, { color }]}>{label}</Text>
    </View>
  );
}
const chipStyles = StyleSheet.create({
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1.5,
    alignSelf: 'flex-start',
  },
  text: { fontWeight: '700', fontSize: 13 },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: 20, paddingBottom: 40 },

  // Identity header card
  idCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  idIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  idEmoji: { fontSize: 30 },
  idBB: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 1,
  },
  idSOM: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 3,
  },

  // Section cards
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 18,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  countBadge: { fontWeight: '400', color: COLORS.text2 },

  // Last location
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  locationMeta: { fontSize: 12, color: COLORS.text2 },

  // List items
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 7,
    marginRight: 10,
    flexShrink: 0,
  },
  listText: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 20,
    flex: 1,
  },
  noData: { fontSize: 13, color: COLORS.text3, fontStyle: 'italic' },

  // Buttons
  btn: {
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnSecondary: { backgroundColor: COLORS.primary + '15', borderWidth: 1.5, borderColor: COLORS.primary },
  btnSecondaryText: { color: COLORS.primary, fontWeight: '700', fontSize: 15 },
  btnGhost: { borderWidth: 1.5, borderColor: COLORS.border },
  btnGhostText: { color: COLORS.text2, fontWeight: '600', fontSize: 15 },
});
