/**
 * SaveScanBaubrettScreen.js  (Save Flow — Step 1 of 3)
 * Opens the camera, validates the scanned value against the database,
 * then navigates to the Zone scan step.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import QRScannerView from '../components/QRScannerView';
import { getBaubrettByNumber } from '../services/databaseService';
import { COLORS } from '../assets/theme';

export default function SaveScanBaubrettScreen({ navigation }) {
  const { t } = useTranslation();
  const [processing, setProcessing] = useState(false);

  const handleScan = (data) => {
    if (processing) return;
    setProcessing(true);

    const trimmed = data.trim().replace(/^'+/, '');

    // Validate: the scanned value must exist in our database
    const record = getBaubrettByNumber(trimmed);
    if (!record) {
      Alert.alert(
        t('saveScanBaubrett.unknownTitle'),
        t('saveScanBaubrett.unknownMessage', { value: trimmed }),
        [{ text: t('common.ok'), onPress: () => setProcessing(false) }]
      );
      return;
    }

    // Replace this screen with the Zone scan so the previous CameraView
    // is fully unmounted and releases the hardware camera.
    navigation.replace('SaveScanZone', { bbNb: record.BB_Nb });
  };

  return (
    <View style={styles.wrapper}>
      {/* Step indicator */}
      <View style={styles.stepBar}>
        <View style={[styles.step, styles.stepActive]} />
        <View style={styles.stepDivider} />
        <View style={styles.step} />
        <View style={styles.stepDivider} />
        <View style={styles.step} />
      </View>
      <Text style={styles.stepLabel}>{t('saveScanBaubrett.stepLabel')}</Text>

      <QRScannerView
        onScan={handleScan}
        hint={t('saveScanBaubrett.instructions')}
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
});
