/**
 * SaveScanZoneScreen.js  (Save Flow — Step 2 of 3)
 * After the Baubrett is scanned, the user scans a Zone QR code.
 * Validates the zone against the known list, then proceeds to Confirm.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import QRScannerView from '../components/QRScannerView';
import { getZoneByKey } from '../data/zones';
import { COLORS } from '../assets/theme';

export default function SaveScanZoneScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { bbNb } = route.params;
  const [processing, setProcessing] = useState(false);

  const handleScan = (data) => {
    if (processing) return;
    setProcessing(true);

    const trimmed = data.trim();

    // Reject scanning the same Baubrett QR by mistake
    if (/^\d{9}$/.test(trimmed)) {
      Alert.alert(
        t('saveScanZone.wrongQRTitle'),
        t('saveScanZone.wrongQRMessage'),
        [{ text: t('common.ok'), onPress: () => setProcessing(false) }]
      );
      return;
    }

    // Validate against known zones
    const zone = getZoneByKey(trimmed);
    if (!zone) {
      Alert.alert(
        t('saveScanZone.unknownTitle'),
        t('saveScanZone.unknownMessage', { value: trimmed }),
        [{ text: t('common.ok'), onPress: () => setProcessing(false) }]
      );
      return;
    }

    // All good — replace this screen so the CameraView is fully unmounted
    // and the hardware camera is released before showing the confirm screen.
    navigation.replace('SaveConfirm', { bbNb, zone: zone.key, zoneLabel: zone.label });
  };

  return (
    <View style={styles.wrapper}>
      {/* Step indicator */}
      <View style={styles.stepBar}>
        <View style={[styles.step, styles.stepDone]} />
        <View style={styles.stepDivider} />
        <View style={[styles.step, styles.stepActive]} />
        <View style={styles.stepDivider} />
        <View style={styles.step} />
      </View>
      <Text style={styles.stepLabel}>{t('saveScanZone.stepLabel')}</Text>

      {/* Show which Baubrett is already scanned */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoText}>
          ✅ {t('saveConfirm.baubrett')}: <Text style={styles.bold}>{bbNb}</Text>
        </Text>
        <Text style={styles.infoHint}>{t('saveScanZone.infoHint')}</Text>
      </View>

      <QRScannerView
        onScan={handleScan}
        hint={t('saveScanZone.instructions')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#000' },
  stepBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: COLORS.primaryDark,
  },
  step: {
    width: 36,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.30)',
  },
  stepDone: { backgroundColor: COLORS.success },
  stepActive: { backgroundColor: COLORS.white },
  stepDivider: { width: 10 },
  stepLabel: {
    textAlign: 'center',
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    paddingVertical: 8,
    backgroundColor: COLORS.primary,
  },
  infoBanner: {
    backgroundColor: COLORS.primaryDark,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  infoText: { color: COLORS.white, fontSize: 13 },
  infoHint: { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2 },
  bold: { fontWeight: '700' },
});
