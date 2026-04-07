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

export default function NotificationCenter({ visible, onClose, badgeCount }) {
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

  // Helper to get missing count
  const getMissingCount = (item) => {
    return UFB_TARGET - (item.current || 0);
  };

  const renderIncompleteUFB = ({ item }) => (
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
          {item.current === 0 && (
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: '0%', backgroundColor: COLORS.text3 }]} />
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
              <Text style={styles.countBadge}>{badgeCount}</Text>
            </View>
          </View>

          {/* Content Area - Wrapped for proper flex layout */}
          <View style={styles.contentArea}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>{t('common.loading')}</Text>
              </View>
            ) : incompleteUFBs.length === 0 ? (
              <ScrollView 
                style={styles.scrollView} 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={true}
              >
                {renderEmpty()}
              </ScrollView>
            ) : (
              <FlatList
                data={incompleteUFBs}
                keyExtractor={(item) => item.key}
                renderItem={renderIncompleteUFB}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={true}
                style={styles.flatList}
                nestedScrollEnabled={true}
              />
            )}
          </View>

          {/* Close Button */}
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onClose}
            activeOpacity={0.8}
          >
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
    width: '95%',
    maxWidth: 600,
    maxHeight: '90%',
    height: '85%',
    flexDirection: 'column',
    ...SHADOW.large,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 22,
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
  contentArea: {
    flex: 1,
    minHeight: 300,
  },
  flatList: {
    flexGrow: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  notificationCard: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
    borderLeftWidth: 5,
    borderLeftColor: COLORS.warning,
    ...SHADOW.small,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  progressCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    marginRight: 16,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  notificationMessage: {
    fontSize: 14,
    color: COLORS.text2,
    lineHeight: 20,
    marginBottom: 10,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.border + '30',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 6,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
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
    paddingVertical: 60,
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
    marginHorizontal: 24,
    marginBottom: 20,
    marginTop: 8,
    borderRadius: RADIUS.lg,
    paddingVertical: 18,
    alignItems: 'center',
    ...SHADOW.medium,
  },
  closeButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});