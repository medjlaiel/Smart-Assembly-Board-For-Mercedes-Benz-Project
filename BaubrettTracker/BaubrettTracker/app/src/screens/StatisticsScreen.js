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
  Modal,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { loadTrackingRecords } from '../services/trackingService';
import { getAll } from '../services/databaseService';
import { COLORS, RADIUS, SHADOW, FONT_SIZES } from '../assets/theme';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';

export default function StatisticsScreen({ navigation }) {
  const { t } = useTranslation();
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUnscannedSheet, setShowUnscannedSheet] = useState(false);

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

  // Get total number of Baubretts from database
  const totalBaubretts = useMemo(() => {
    const allBaubretts = getAll();
    return allBaubretts.length;
  }, []);

  // Calculate unscanned Baubretts count
  const unscannedCount = useMemo(() => {
    if (allRecords.length === 0) return totalBaubretts;
    
    const scannedBBs = new Set();
    allRecords.forEach((record) => {
      scannedBBs.add(String(record.BB_Nb).trim());
    });
    
    return totalBaubretts - scannedBBs.size;
  }, [allRecords, totalBaubretts]);

  // Get list of unscanned Baubretts
  const unscannedBaubretts = useMemo(() => {
    const allBaubretts = getAll();
    const scannedBBs = new Set();
    allRecords.forEach((record) => {
      scannedBBs.add(String(record.BB_Nb).trim());
    });

    // Filter to get only unscanned Baubretts, sorted by BB_Nb
    return allBaubretts
      .filter((record) => !scannedBBs.has(String(record.BB_Nb).trim()))
      .map((record) => String(record.BB_Nb).trim())
      .sort();
  }, [allRecords]);

  // Color palette for pie chart slices
  const getColorForIndex = (index) => {
    const colors = [
      COLORS.primary,
      '#4CAF50', // Green
      '#2196F3', // Blue
      '#FF9800', // Orange
      '#9C27B0', // Purple
    ];
    return colors[index % colors.length];
  };

  // Prepare data for pie chart (top 5 + "Others")
  const pieChartData = useMemo(() => {
    if (statistics.length === 0) return [];
    
    const top5 = statistics.slice(0, 5);
    const othersCount = statistics.slice(5).reduce((sum, stat) => sum + stat.count, 0);
    
    const data = top5.map((stat, index) => ({
      ...stat,
      color: getColorForIndex(index),
      startAngle: 0, // will be calculated
      endAngle: 0,   // will be calculated
    }));

    // Calculate angles
    let currentAngle = 0;
    const total = allRecords.length;
    data.forEach((item) => {
      const angle = (item.count / total) * 360;
      item.startAngle = currentAngle;
      item.endAngle = currentAngle + angle;
      currentAngle += angle;
    });

    // Add "Others" if exists
    if (othersCount > 0) {
      const othersAngle = (othersCount / total) * 360;
      data.push({
        bb_Nb: t('statistics.others'),
        count: othersCount,
        percentage: (othersCount / total) * 100,
        color: COLORS.text3,
        startAngle: currentAngle,
        endAngle: currentAngle + othersAngle,
      });
    }

    return data;
  }, [statistics, allRecords.length, t]);

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
      <TouchableOpacity
        style={[styles.summaryCard, SHADOW.small]}
        onPress={() => setShowUnscannedSheet(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.summaryLabel}>{t('statistics.unscannedBaubretts')}</Text>
        <Text style={[styles.summaryValue, { color: COLORS.warning }]}>{unscannedCount}</Text>
      </TouchableOpacity>
    </View>
  );

  // Render a pie slice as an SVG path
  const renderPieSlice = (item, index) => {
    const { startAngle, endAngle, color, bb_Nb, percentage } = item;
    const radius = 80;
    const centerX = 100;
    const centerY = 100;
    
    // Convert angles to radians (start from -90 degrees, i.e., top)
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;
    
    // Calculate coordinates
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);
    
    // Determine if the arc is more than 180 degrees
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    // Create SVG path for the slice
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');
    
    return (
      <G key={index}>
        <Path d={pathData} fill={color} stroke="#fff" strokeWidth={2}>
          <SvgText
            x={centerX + (radius * 0.6) * Math.cos(((startAngle + endAngle) / 2 - 90) * Math.PI / 180)}
            y={centerY + (radius * 0.6) * Math.sin(((startAngle + endAngle) / 2 - 90) * Math.PI / 180)}
            fill="#fff"
            fontSize="10"
            fontWeight="bold"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {percentage.toFixed(1)}%
          </SvgText>
        </Path>
      </G>
    );
  };

  const renderPieChart = () => {
    if (pieChartData.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🥧</Text>
          <Text style={styles.emptyTitle}>{t('statistics.emptyTitle')}</Text>
          <Text style={styles.emptyText}>{t('statistics.emptyText')}</Text>
        </View>
      );
    }

    return (
      <View style={styles.pieChartContainer}>
        <Svg width="200" height="200" viewBox="0 0 200 200">
          {pieChartData.map((item, index) => renderPieSlice(item, index))}
          {/* Inner circle for donut effect */}
          <Circle cx="100" cy="100" r="50" fill={COLORS.surface} />
          {/* Center text showing total */}
          <SvgText
            x="100"
            y="95"
            fill={COLORS.text}
            fontSize="16"
            fontWeight="bold"
            textAnchor="middle"
          >
            {totalScans}
          </SvgText>
          <SvgText
            x="100"
            y="115"
            fill={COLORS.text2}
            fontSize="10"
            textAnchor="middle"
          >
            {t('statistics.totalScans')}
          </SvgText>
        </Svg>
        
        {/* Legend */}
        <View style={styles.legendContainer}>
          {pieChartData.slice(0, 5).map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <Text style={styles.legendText} numberOfLines={1}>
                {item.bb_Nb} ({item.count})
              </Text>
            </View>
          ))}
          {pieChartData.length > 5 && (
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: COLORS.text3 }]} />
              <Text style={styles.legendText}>
                {t('statistics.others')} ({pieChartData.slice(5).reduce((sum, item) => sum + item.count, 0)})
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderBottomSheet = () => (
    <Modal
      visible={showUnscannedSheet}
      animationType="slide"
      transparent
      onRequestClose={() => setShowUnscannedSheet(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowUnscannedSheet(false)}
      >
        <TouchableOpacity
          style={styles.bottomSheetContainerTouchable}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <SafeAreaView style={styles.bottomSheetContainer}>
            <View style={styles.bottomSheetHandle} />
            <View style={styles.bottomSheetContent}>
              <Text style={styles.bottomSheetTitle}>
                {t('statistics.unscannedBaubretts')} ({unscannedBaubretts.length})
              </Text>
              {unscannedBaubretts.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyEmoji}>✅</Text>
                  <Text style={styles.emptyTitle}>{t('statistics.allScannedTitle')}</Text>
                  <Text style={styles.emptyText}>{t('statistics.allScannedMessage')}</Text>
                </View>
              ) : (
                <FlatList
                  data={unscannedBaubretts}
                  keyExtractor={(item) => item}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.bottomSheetList}
                  renderItem={({ item, index }) => (
                    <View style={[styles.bottomSheetItem, index % 2 === 0 && styles.bottomSheetItemEven]}>
                      <Text style={styles.bottomSheetItemNumber}>{index + 1}.</Text>
                      <Text style={styles.bottomSheetItemText}>{item}</Text>
                    </View>
                  )}
                />
              )}
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowUnscannedSheet(false)}
            >
              <Text style={styles.closeButtonText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadData}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('statistics.title')}</Text>
          <Text style={styles.headerSub}>{t('statistics.subtitle')}</Text>
        </View>

        {renderSummary()}

        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>🥧 {t('statistics.chartTitle')} ({t('statistics.others')} {t('statistics.uniqueBaubretts')})</Text>
          {loading ? (
            <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.primary} size="large" />
          ) : (
            renderPieChart()
          )}
        </View>

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
      {renderBottomSheet()}
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

  // Pie chart
  pieChartContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  legendContainer: {
    marginTop: 20,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 3,
    marginRight: 10,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.text,
    flex: 1,
  },

  // Bottom Sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainerTouchable: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    height: '80%',
    paddingBottom: 20,
  },
  bottomSheetHandle: {
    width: 60,
    height: 4,
    backgroundColor: COLORS.text3,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  bottomSheetList: {
    paddingBottom: 20,
  },
  bottomSheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: RADIUS.md,
    marginBottom: 8,
  },
  bottomSheetItemEven: {
    backgroundColor: COLORS.surface,
  },
  bottomSheetItemNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text3,
    marginRight: 12,
    minWidth: 30,
  },
  bottomSheetItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    fontFamily: 'monospace',
  },
  closeButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    marginTop: 12,
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