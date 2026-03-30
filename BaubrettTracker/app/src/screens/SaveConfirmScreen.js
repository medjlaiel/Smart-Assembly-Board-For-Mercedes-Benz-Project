/**
 * SaveConfirmScreen.js  (Save Flow — Step 3 of 3)
 * Displays a summary of the scanned Baubrett + Zone,
 * then writes the entry to the tracking Excel file on confirm.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { saveTrackingEntry } from '../services/trackingService';
import { COLORS, RADIUS, SHADOW } from '../assets/theme';

export default function SaveConfirmScreen({ route, navigation }) {
  const { bbNb, zone, zoneLabel } = route.params;
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR');
  const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const handleSave = async () => {
    setSaving(true);
    const success = await saveTrackingEntry(bbNb, zone);
    setSaving(false);

    if (success) {
      setSaved(true);
    } else {
      Alert.alert('Save Failed', 'Could not write to the tracking file. Please try again.');
    }
  };

  // ── Success state ────────────────────────────────────────────
  if (saved) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Text style={styles.successEmoji}>✅</Text>
          </View>
          <Text style={styles.successTitle}>Saved Successfully!</Text>
          <Text style={styles.successSub}>
            Baubrett <Text style={styles.bold}>{bbNb}</Text> has been recorded in{' '}
            <Text style={styles.bold}>{zoneLabel}</Text>.
          </Text>

          {/* Action buttons */}
          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary]}
            onPress={() => navigation.navigate('SaveScanBaubrett')}
          >
            <Text style={styles.btnPrimaryText}>Scan Another Baubrett</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.btnGhost]}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.btnGhostText}>Back to Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.btnGhost]}
            onPress={() => navigation.navigate('History')}
          >
            <Text style={styles.btnGhostText}>View History</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Confirm state ────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Step indicator */}
        <View style={styles.stepBar}>
          <View style={[styles.step, styles.stepDone]} />
          <View style={styles.stepDivider} />
          <View style={[styles.step, styles.stepDone]} />
          <View style={styles.stepDivider} />
          <View style={[styles.step, styles.stepActive]} />
        </View>
        <Text style={styles.stepLabel}>Step 3 of 3 — Confirm &amp; Save</Text>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>Entry to Record</Text>

          <Row label="📦 Baubrett" value={bbNb} />
          <Row label="📍 Zone" value={zoneLabel} />
          <Row label="📅 Date" value={dateStr} />
          <Row label="🕐 Time" value={timeStr} />
        </View>

        <Text style={styles.hint}>
          This entry will be saved to{' '}
          <Text style={styles.mono}>baubrett_tracking.xlsx</Text> on your device.
        </Text>

        <TouchableOpacity
          style={[styles.btn, styles.btnPrimary, saving && styles.btnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.btnPrimaryText}>💾  Confirm &amp; Save</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.btnGhost]}
          onPress={() => navigation.goBack()}
          disabled={saving}
        >
          <Text style={styles.btnGhostText}>← Re-scan Zone</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

// ── Helper row component ────────────────────────────────────────
function Row({ label, value }) {
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={rowStyles.value}>{value}</Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  label: { fontSize: 13, color: COLORS.text2, flex: 1 },
  value: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    textAlign: 'right',
  },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, padding: 20 },

  // Step progress bar
  stepBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginBottom: 8,
    ...SHADOW.small,
  },
  step: {
    width: 36,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
  },
  stepDone: { backgroundColor: COLORS.success },
  stepActive: { backgroundColor: COLORS.primary },
  stepDivider: { width: 10 },
  stepLabel: {
    textAlign: 'center',
    color: COLORS.text2,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 20,
    marginTop: 4,
  },

  // Card
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 20,
    ...SHADOW.medium,
    marginBottom: 16,
  },
  cardHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },

  // Hint
  hint: {
    fontSize: 12,
    color: COLORS.text3,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  mono: { fontFamily: 'Courier', color: COLORS.text2 },

  // Buttons
  btn: {
    borderRadius: RADIUS.md,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnPrimary: { backgroundColor: COLORS.primary, ...SHADOW.small },
  btnPrimaryText: { color: COLORS.white, fontWeight: '700', fontSize: 16 },
  btnGhost: { borderWidth: 1.5, borderColor: COLORS.border },
  btnGhostText: { color: COLORS.text2, fontWeight: '600', fontSize: 15 },
  btnDisabled: { opacity: 0.6 },

  // Success state
  successContainer: {
    flex: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.success + '18',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successEmoji: { fontSize: 52 },
  successTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.success,
    marginBottom: 12,
  },
  successSub: {
    fontSize: 15,
    color: COLORS.text2,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  bold: { fontWeight: '700', color: COLORS.text },
});
