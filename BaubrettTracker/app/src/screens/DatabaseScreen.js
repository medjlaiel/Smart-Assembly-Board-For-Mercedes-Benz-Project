/**
 * DatabaseScreen.js
 * Displays all contents of MyDataBase.xlsx in a scrollable table format.
 */
import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { loadDatabaseRecords, getDatabaseHeaders } from '../services/databaseService';
import { COLORS, RADIUS, SHADOW, FONT_SIZES } from '../assets/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function DatabaseScreen({ navigation }) {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setError(null);
      const [records, cols] = await Promise.all([
        loadDatabaseRecords(),
        getDatabaseHeaders(),
      ]);
      setData(records);
      setHeaders(cols);
      setLoading(false);
    } catch (err) {
      console.error('DatabaseScreen load error:', err);
      setError(err.message || 'Failed to load database');
      setLoading(false);
    }
  };

  // Calculate column widths based on header length
  const columnWidths = useMemo(() => {
    if (headers.length === 0) return {};
    const baseWidth = 120;
    return headers.reduce((acc, header) => {
      acc[header] = Math.max(baseWidth, (header.length || 10) * 10);
      return acc;
    }, {});
  }, [headers]);

  // Render table header
  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={[styles.headerCell, styles.indexCell]}>
            <Text style={styles.headerText}>#</Text>
          </View>
          {headers.map((header, index) => (
            <View
              key={`header-${index}`}
              style={[styles.headerCell, { minWidth: columnWidths[header] || 120 }]}
            >
              <Text style={styles.headerText}>{header}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  // Render table row
  const renderTableRow = ({ item, index }) => (
    <View style={[styles.tableRow, index % 2 === 0 && styles.rowEven]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.rowContent}>
          <View style={[styles.dataCell, styles.indexCell]}>
            <Text style={styles.indexNumber}>{index + 1}</Text>
          </View>
          {headers.map((header, colIndex) => (
            <View
              key={`cell-${index}-${colIndex}`}
              style={[styles.dataCell, { minWidth: columnWidths[header] || 120 }]}
            >
              <Text style={styles.cellText} numberOfLines={1}>
                {String(item[header] || '-')}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  // Key extractor - use index as key
  const keyExtractor = (item, index) => `row-${index}-${item.BB_Nb || index}`;

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="storage" size={64} color={COLORS.text3} />
      <Text style={styles.emptyTitle}>{t('database.emptyTitle', 'No Data')}</Text>
      <Text style={styles.emptyText}>
        {error
          ? t('database.errorMessage', { error })
          : t('database.noRecords', 'No records found in database')}
      </Text>
      {error && (
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryText}>{t('common.retry', 'Retry')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>{t('database.title', 'Database')}</Text>
          <TouchableOpacity onPress={loadData} disabled={loading} style={styles.refreshIcon}>
            <Icon name="refresh" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>
          {t('database.subtitle', { count: data.length })}
        </Text>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>
            {t('database.loading', 'Loading database...')}
          </Text>
        </View>
      ) : (
        <View style={styles.tableContainer}>
          {renderTableHeader()}
          <FlatList
            data={data}
            renderItem={renderTableRow}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={renderEmptyState}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={loadData}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: RADIUS.lg,
    borderBottomRightRadius: RADIUS.lg,
    ...SHADOW.medium,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.white,
  },
  refreshIcon: {
    padding: 8,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.text2,
    fontWeight: '500',
  },
  tableContainer: {
    flex: 1,
    marginTop: 16,
  },
  tableHeader: {
    backgroundColor: COLORS.primary + '15',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  headerRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  headerCell: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
    paddingRight: 16,
  },
  indexCell: {
    width: 50,
    alignItems: 'center',
    flex: 0,
  },
  headerText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '40',
  },
  rowEven: {
    backgroundColor: COLORS.background,
  },
  rowContent: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dataCell: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
    paddingRight: 16,
  },
  cellText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  indexNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border + '20',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.text2,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
  },
  retryText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },
});