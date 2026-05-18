/**
 * QRLibraryScreen.js
 * Displays scrollable grids of QR codes for Baubretts and Zones.
 * Each card can be tapped to view an enlarged QR code in a modal.
 */
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOW } from '../assets/theme';
import { getAll } from '../services/databaseService';
import ZONES from '../data/zones';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_SIZE = (SCREEN_WIDTH - 16 * 2 - CARD_GAP) / 2; // 2 columns with padding

// ── QR Card Component ──────────────────────────────────────────────
function QrCard({ title, value, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.qrContainer}>
        <QRCode value={value} size={100} backgroundColor="white" />
      </View>
      <Text style={styles.cardTitle} numberOfLines={2}>{title}</Text>
    </TouchableOpacity>
  );
}

// ── Enlarged QR Modal ──────────────────────────────────────────────
function QrModal({ visible, title, value, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close-circle" size={36} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{title}</Text>
          <View style={styles.modalQrWrapper}>
            {value ? (
              <QRCode value={value} size={250} backgroundColor="white" />
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Section Header ─────────────────────────────────────────────────
function SectionHeader({ title, count }) {
  return (
    <View style={styles.sectionHeaderRow}>
      <Text style={styles.sectionHeader}>{title}</Text>
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{count}</Text>
      </View>
    </View>
  );
}

// ── Main Screen ────────────────────────────────────────────────────
export default function QRLibraryScreen() {
  const [baubretts, setBaubretts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Load Baubrett BB_Nb values from database
  const loadBaubretts = useCallback(() => {
    try {
      const records = getAll();
      const bbNbs = records
        .map((r) => String(r.BB_Nb).trim())
        .filter((v) => v.length > 0);
      // Deduplicate while preserving order
      const unique = [...new Set(bbNbs)];
      setBaubretts(unique);
    } catch (err) {
      console.error('Failed to load Baubrett data:', err);
    }
  }, []);

  useEffect(() => {
    loadBaubretts();
    setLoading(false);
  }, [loadBaubretts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadBaubretts();
    setRefreshing(false);
  }, [loadBaubretts]);

  const zones = useMemo(() => ZONES, []);

  const openModal = useCallback((title, value) => {
    setSelectedItem({ title, value });
    setModalVisible(true);
  }, []);

  const handleClose = useCallback(() => {
    setModalVisible(false);
    setTimeout(() => setSelectedItem(null), 300);
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading QR codes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />
        }
      >
        {/* Baubretts Section */}
        <SectionHeader title="Baubretts" count={baubretts.length} />
        <View style={styles.grid}>
          {baubretts.map((bbNb) => (
            <QrCard
              key={bbNb}
              title={bbNb}
              value={bbNb}
              onPress={() => openModal(bbNb, bbNb)}
            />
          ))}
        </View>

        {/* Zones Section */}
        <SectionHeader title="Zones" count={zones.length} />
        <View style={styles.grid}>
          {zones.map((zone) => (
            <QrCard
              key={zone.key}
              title={zone.label}
              value={zone.key}
              onPress={() => openModal(zone.label, zone.key)}
            />
          ))}
        </View>

        <View style={styles.footer} />
      </ScrollView>

      {/* Enlarged QR Modal */}
      <QrModal
        visible={modalVisible}
        title={selectedItem?.title || ''}
        value={selectedItem?.value || ''}
        onClose={handleClose}
      />
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.text3,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  countBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginLeft: 10,
  },
  countText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
    marginBottom: 16,
  },
  card: {
    width: CARD_SIZE,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.small,
  },
  qrContainer: {
    padding: 8,
    backgroundColor: 'white',
    borderRadius: RADIUS.sm,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalQrWrapper: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: RADIUS.lg,
    ...SHADOW.large,
  },
  footer: {
    height: 40,
  },
});