/**
 * StatisticsScreen.js
 * Shows statistics about Baubrett scans with a bar chart.
 * Displays percentage of scans for each Baubrett based on tracking data.
 */
import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { loadTrackingRecords } from '../services/trackingService';
import { COLORS, RADIUS, SHADOW, FONT_SIZES } from '../assets/theme';

export default function StatisticsScreen({ navigation }) {
  const { t } = useTranslation();
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await loadTrackingRecords();
    setAllRecords(data);
    setLoading(false);
  };

  // Calculate statistics: count scans per BB_Nb
  const statistics = useMemo(() => {
    if (allRecords.length === 0) return [];

    const counts = {};
    allRecords.forEach((record) => {
      const bb = String(record.BB_Nb).trim();
      counts[bb] = (counts[bb] || 0) + 1;
    });

    // Convert to array and sort by count descending
    const stats = Object.entries(counts)
      .map(([bb_Nb, count]) => ({
        bb_Nb,
        count,
        percentage: (count / allRecords.length) * 100,
      }))
      .sort((a, b) => b.count - a.count);

    return stats;
  }, [allRecords]);

  const totalScans = allRecords.length;

  // Find max count for scaling chart
  const maxCount = useMemo(() => {
    if (statistics.length === 0) return 1;
    return statistics[0].count;
  }, [statistics]);

  const renderChart = () => {
    if (statistics.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📊</Text>
          <Text style={styles.emptyTitle}>{t('statistics.emptyTitle')}</Text>
          <Text style={styles.emptyText}>{t('statistics.emptyText')}</Text>
        </View>
      );
    }

    return (
      <View style={styles.chartContainer}>
        {statistics.map((stat, index) => {
          const barWidth = (stat.count / maxCount) * 250; // Max width 250
          const isFirst = index === 0;
          return (
            <View key={stat.bb_Nb} style={styles.chartRow}>
              <View style={styles.chartLabelContainer}>
                <Text style={styles.chartBB}>{stat.bb_Nb}</Text>
                <Text style={styles.chartCount}>
                  {stat.count} ({stat.percentage.toFixed(1)}%)
                </Text>
              </View>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      width: barWidth,
                      backgroundColor: isFirst ? COLORS.primary : COLORS.primary + 'AA',
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderSummary = () => (
    <View style={styles.summaryContainer}>
      <View style={[styles.summaryCard, SHADOW.small]}>
        <Text style={styles.summaryLabel}>{t('statistics.totalScans')}</Text>
        <Text style={styles.summaryValue}>{totalScans}</Text>
      </View>
      <View style={[styles.summaryCard, SHADOW.small]}>
        <Text style={styles.summaryLabel}>{t('statistics.uniqueBaubretts')}</Text>
        <Text style={styles.summaryValue}>{statistics.length}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('statistics.title')}</Text>
          <Text style={styles.headerSub}>{t('statistics.subtitle')}</Text>
        </View>

        {renderSummary()}

        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>{t('statistics.chartTitle')}</Text>
          {loading ? (
            <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.primary} size="large" />
          ) : (
            renderChart()
          )}
        </View>

        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={loadData}
          disabled={loading}
        >
          <Text style={styles.refreshText}>
            {loading ? '⏳' : '🔄'} {t('statistics.refresh')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: 20, paddingBottom: 40 },

  // Header
  header: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    ...SHADOW.medium,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
  },

  // Summary cards
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 6,
    ...SHADOW.small,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text3,
    textAlign: 'center',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary,
  },

  // Chart section
  chartSection: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 20,
    ...SHADOW.medium,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContainer: {
    marginTop: 8,
  },
  chartRow: {
    marginBottom: 16,
  },
  chartLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  chartBB: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    minWidth: 100,
  },
  chartCount: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text2,
  },
  barContainer: {
    height: 28,
    backgroundColor: COLORS.border + '30',
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: RADIUS.sm,
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  emptyEmoji: { fontSize: 52, marginBottom: 16 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.text2,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Refresh button
  refreshBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.small,
  },
  refreshText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
});
