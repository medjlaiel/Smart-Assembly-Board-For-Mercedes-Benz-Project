/**
 * ConsultScanScreen.js  (Consult Flow — Step 1 of 2)
 * Scans a Baubrett QR code and looks it up in the local database.
 * If found, navigates to the detail screen.
 * Also supports zone scanning to show all baubretts scanned in that zone.
 *
 * DATA PERSISTENCE:
 * - Baubrett lookups: Use database.json (static data)
 * - Zone scanning: Queries baubrett_tracking.xlsx (persisted via FileSystem.documentDirectory)
 *   The tracking file is updated whenever a baubrett is scanned in HistoryScreen.
 *   All zone queries automatically use the latest tracking history stored on device.
 *   This means zone scanning will always show the current scanned baubretts, even
 *   after app is closed and reopened.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import QRScannerView from '../components/QRScannerView';
import { getBaubrettByNumber } from '../services/databaseService';
import { getBaubrettsScannedInZone } from '../services/trackingService';
import zoneAssignments from '../data/zoneAssignments.json';
import { COLORS } from '../assets/theme';

export default function ConsultScanScreen({ navigation }) {
  const { t } = useTranslation();
  const [processing, setProcessing] = useState(false);

  const handleScan = async (data) => {
    if (processing) return;
    setProcessing(true);
    const trimmed = String(data || '').trim();

    // If scanned value matches a zone key, show all baubretts scanned in that zone
    const key = trimmed.toUpperCase();
    if (zoneAssignments && Object.prototype.hasOwnProperty.call(zoneAssignments, key)) {
      try {
        const scannedBaubretts = await getBaubrettsScannedInZone(key);
        if (scannedBaubretts.length === 0) {
          Alert.alert(
            t('consultScan.noBaubrettsTitle') || 'No Scans',
            t('consultScan.noBaubrettsMessage') || `No baubretts have been scanned in zone ${key}`,
            [{ text: t('common.ok'), onPress: () => setProcessing(false) }]
          );
          return;
        }
        navigation.navigate('ZoneResults', { zone: key, scanRecords: scannedBaubretts });
        return;
      } catch (error) {
        Alert.alert(t('common.error'), 'Failed to load zone data', [{ text: t('common.ok'), onPress: () => setProcessing(false) }]);
        return;
      }
    }

    // Otherwise treat as Baubrett number lookup
    const cleaned = trimmed.replace(/^'+/, '');
    const record = getBaubrettByNumber(cleaned);

    if (!record) {
      Alert.alert(
        t('consultScan.notFoundTitle'),
        t('consultScan.notFoundMessage', { value: cleaned }),
        [{ text: t('common.ok'), onPress: () => setProcessing(false) }]
      );
      return;
    }

    navigation.navigate('ConsultResult', { record });
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.topBanner}>
        <Text style={styles.bannerText}>🔍  {t('consultScan.bannerText')}</Text>
      </View>
      <QRScannerView
        onScan={handleScan}
        hint={t('consultScan.instructions')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#000' },
  topBanner: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    alignItems: 'center',
  },
  bannerText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },
});
