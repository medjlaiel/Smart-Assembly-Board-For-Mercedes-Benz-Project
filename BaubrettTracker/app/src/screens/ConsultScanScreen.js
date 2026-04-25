/**
 * ConsultScanScreen.js  (Consult Flow — Step 1 of 2)
 * * Scans a Baubrett QR code and looks it up in the local database.
 * If found, navigates to the detail screen.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import QRScannerView from '../components/QRScannerView';
import { getBaubrettByNumber } from '../services/databaseService';
import { COLORS } from '../assets/theme';

export default function ConsultScanScreen({ navigation }) {
  const { t } = useTranslation();
  const [processing, setProcessing] = useState(false);

  const handleScan = (data) => {
    if (processing) return;
    setProcessing(true);

    const trimmed = data.trim().replace(/^'+/, '');
    const record = getBaubrettByNumber(trimmed);

    if (!record) {
      Alert.alert(
        t('consultScan.notFoundTitle'),
        t('consultScan.notFoundMessage', { value: trimmed }),
        [{ text: t('common.ok'), onPress: () => setProcessing(false) }]
      );
      return;
    }

    // Navigate to result screen carrying the full record
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
