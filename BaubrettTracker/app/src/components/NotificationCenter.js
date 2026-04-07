/**
 * NotificationCenter.js
 * Shows incomplete UFBs (those with fewer than 8 Baubrett scans)
 */
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS, RADIUS, SHADOW, FONT_SIZES } from '../assets/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { loadTrackingRecords } from '../services/trackingService';
import { getValidZoneKeys } from '../data/zones';

const UFB_TARGET = 8; // Required scans per UFB to be considered complete

export default function NotificationCenter({ visible, onClose }) {
  const { t } = useTranslation();
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible]);

  const loadData = async () => {
    setLoading(true);
    const data = await loadTrackingRecords();
    setAllRecords(data);
    setLoading(false);
  };

  // Get only UFB zone keys
  const ufbKeys = useMemo(() => {
    const allZones = getValidZoneKeys();
    return allZones.filter((key) => key.startsWith('UFB'));
  }, []);

  // Calculate scan counts for each UFB
  const ufbStats = useMemo(() => {
    const stats = {};
    ufbKeys.forEach((key) => {
      stats[key] = 0;
    });

    allRecords.forEach((record) => {
      const zone = String(record.Zone).trim();
      if (ufbKeys.includes(zone)) {
        stats[zone] = (stats[zone] || 0) + 1;
      }
    });

    return stats;
  }, [allRecords, ufbKeys]);

  // Filter incomplete UFBs (less than 8 scans)
  const incompleteUFBs = useMemo(() => {
    return ufbKeys
      .filter((key) => (ufbStats[key] || 0) < UFB_TARGET)
      .map((key) => ({
        key,
        label: key,
        current: ufbStats[key] || 0,
        remaining: UFB_TARGET - (ufbStats[key] || 0),
      }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [ufbKeys, ufbStats]);

  const getProgressColor = (current) => {
    if (current === 0) return COLORS.text3;
    if (current < UFB_TARGET / 2) return COLORS.warning;
    return COLORS.primary;
  };

  const renderIncompleteUFB = ({ item, index }) => (
    <View style={styles.notificationCard}>
      <View style={styles.notificationHeader}>
        <View style={[styles.progressCircle, { backgroundColor: getProgressColor(item.current) + '20', borderColor: getProgressColor(item.current) }]}>
          <Text style={[styles.progressText, { color: getProgressColor(item.current) }]}>
            {item.current}/{UFB_TARGET}
          </Text>
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.label}</Text>
          <Text style={styles.notificationMessage}>
            {t('notifications.message', { current: item.current, target: UFB_TARGET, remaining: item.remaining })}
          </Text>
          {item.current > 0 && (
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${(item.current / UFB_TARGET) * 100}%`,
                    backgroundColor: getProgressColor(item.current),
                  },
                ]}
              />
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="check-circle" size={64} color={COLORS.success} />
      <Text style={styles.emptyTitle}>{t('notifications.allCompleteTitle')}</Text>
      <Text style={styles.emptyText}>{t('notifications.allCompleteMessage')}</Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t('notifications.title')}</Text>
            <View style={styles.headerRight}>
              <Text style={styles.countBadge}>{incompleteUFBs.length}</Text>
            </View>
          </View>

          {/* Content */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>{t('common.loading')}</Text>
            </View>
          ) : incompleteUFBs.length === 0 ? (
            <ScrollView style={styles.content}>
              {renderEmpty()}
            </ScrollView>
          ) : (
            <FlatList
              data={incompleteUFBs}
              keyExtractor={(item) => item.key}
              renderItem={renderIncompleteUFB}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>{t('common.close')}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    ...SHADOW.large,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONT_SIZES.title,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countBadge: {
    backgroundColor: COLORS.error,
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    minWidth: 24,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 20,
  },
  notificationCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
    ...SHADOW.small,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  progressCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginRight: 14,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 13,
    color: COLORS.text2,
    lineHeight: 18,
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: COLORS.border + '30',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.text3,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.success,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.text2,
    textAlign: 'center',
    lineHeight: 22,
  },
  closeButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: RADIUS.md,
    padding: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});