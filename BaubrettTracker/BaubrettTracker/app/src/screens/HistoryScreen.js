/**
 * HistoryScreen.js
 * Shows all tracking entries from the Excel file.
 * Supports optional filtering by BB_Nb (passed via route params).
 * Includes a search bar to look up a specific Baubrett number.
 * Allows exporting the tracking file via the system share sheet.
 */
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { loadTrackingRecords, exportTrackingFile, deleteTrackingEntry } from '../services/trackingService';
import { COLORS, RADIUS, SHADOW } from '../assets/theme';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { RectButton } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateRangePicker from '../components/DateRangePicker';

export default function HistoryScreen({ route }) {
  const { t } = useTranslation();
  const filterBB = route?.params?.filterBB || null;
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filterBB || '');
  const [isSearchActive, setIsSearchActive] = useState(!!filterBB);
  const [dateRange, setDateRange] = useState(null); // { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }
  const [showDatePicker, setShowDatePicker] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await loadTrackingRecords();
    // Store all records (newest first)
    setAllRecords([...data].reverse());
    setLoading(false);
  }, []);

  // Reload whenever this screen comes into focus
  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Pre-fill search when navigated with filterBB param
  useEffect(() => {
    if (filterBB) {
      setSearchQuery(String(filterBB));
      setIsSearchActive(true);
    }
  }, [filterBB]);

  // Parse date from DD/MM/YYYY format (from Excel) to Date object
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    // DD/MM/YYYY -> Date object (local midnight)
    const [day, month, year] = parts.map(Number);
    return new Date(year, month - 1, day);
  };

  // Parse ISO date (YYYY-MM-DD) from calendar to Date object (local midnight)
  const parseISODate = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;
    const [year, month, day] = parts.map(Number);
    return new Date(year, month - 1, day);
  };

  // Compare two Date objects at day precision (ignore time)
  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  // Check if recordDate is within range [startDate, endDate] inclusive
  const isInRange = (recordDate, startDate, endDate) => {
    if (!recordDate || !startDate || !endDate) return false;
    return recordDate >= startDate && recordDate <= endDate;
  };

  const formatFilterChipDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const options = { day: 'numeric', month: 'short' };
    return date.toLocaleDateString('en-US', options);
  };

  // Filtered records based on search query and date range
  const records = useMemo(() => {
    let filtered = allRecords;

    // Apply BB_Nb search filter
    const query = searchQuery.trim();
    if (query) {
      filtered = filtered.filter((r) =>
        String(r.BB_Nb).trim().includes(query)
      );
    }

    // Apply date range filter
    if (dateRange && dateRange.start && dateRange.end) {
      const startDate = parseISODate(dateRange.start);
      const endDate = parseISODate(dateRange.end);
      // Set endDate to end of day (23:59:59) for inclusive range
      if (endDate) {
        endDate.setHours(23, 59, 59, 999);
      }
      filtered = filtered.filter((r) => {
        const recordDate = parseDate(r.Date);
        if (!recordDate) return false;
        return isInRange(recordDate, startDate, endDate);
      });
    }

    return filtered;
  }, [allRecords, searchQuery, dateRange]);

  // Unique baubrett numbers for suggestions
  const uniqueBBNumbers = useMemo(() => {
    const set = new Set(allRecords.map((r) => String(r.BB_Nb).trim()));
    return [...set].sort();
  }, [allRecords]);

  // Filtered suggestions based on current query
  const suggestions = useMemo(() => {
    const query = searchQuery.trim();
    if (!query || query.length < 2) return [];
    return uniqueBBNumbers.filter((bb) => bb.includes(query)).slice(0, 5);
  }, [uniqueBBNumbers, searchQuery]);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportTrackingFile();
    } catch (err) {
      Alert.alert(t('history.exportFailed'), err.message || t('history.exportFailedMessage'));
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async (item) => {
    Alert.alert(
      t('history.confirmDelete'),
      t('history.confirmDelete'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('history.delete'),
          style: 'destructive',
          onPress: async () => {
            const success = await deleteTrackingEntry(item);
            if (success) {
              await load();
            } else {
              Alert.alert(t('common.error'), 'Failed to delete entry');
            }
          },
        },
      ]
    );
  };

  const handleSelectSuggestion = (bb) => {
    setSearchQuery(bb);
    setIsSearchActive(true);
    Keyboard.dismiss();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearchActive(false);
  };

  const handleOpenDatePicker = () => {
    setShowDatePicker(true);
  };

  const handleCloseDatePicker = () => {
    setShowDatePicker(false);
  };

  const handleApplyDateRange = ({ start, end }) => {
    setDateRange({ start, end });
    setShowDatePicker(false);
  };

  const handleClearDateFilter = () => {
    setDateRange(null);
  };

  const handleSearch = () => {
    setIsSearchActive(true);
    Keyboard.dismiss();
  };

  // ── Empty state ──────────────────────────────────────────────
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📋</Text>
      <Text style={styles.emptyTitle}>{t('history.emptyTitle')}</Text>
      <Text style={styles.emptyText}>
        {searchQuery.trim()
          ? t('history.emptyTextWithSearch', { query: searchQuery.trim() })
          : t('history.emptyTextNoSearch')}
      </Text>
      {searchQuery.trim() ? (
        <TouchableOpacity style={styles.clearFilterBtn} onPress={handleClearSearch}>
          <Text style={styles.clearFilterText}>{t('history.clearFilter')}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  // ── Swipe actions ─────────────────────────────────────────────
  const renderRightActions = (progress, dragX, item) => (
    <View style={styles.swipeActions}>
      <RectButton
        style={[styles.swipeAction, styles.swipeActionDelete]}
        onPress={() => handleDelete(item)}
      >
        <Icon name="delete" size={24} color={COLORS.white} />
        <Text style={styles.swipeActionText}>{t('history.delete')}</Text>
      </RectButton>
    </View>
  );

  // ── Row renderer ─────────────────────────────────────────────
  const renderItem = ({ item, index }) => (
    <Swipeable
      renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
      overshootRight={false}
    >
      <TouchableOpacity
        style={[styles.row, index === 0 && styles.rowFirst]}
        onPress={() => {
          setSearchQuery(String(item.BB_Nb).trim());
          setIsSearchActive(true);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.rowLeft}>
          <Text style={styles.rowBB}>{item.BB_Nb}</Text>
          <Text style={styles.rowMeta}>{item.Date}  ·  {item.Time}</Text>
        </View>
        <View style={styles.zoneBadge}>
          <Text style={styles.zoneText}>{item.Zone}</Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <SafeAreaView style={styles.safe}>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputRow}>
          <Icon name="search" size={16} color={COLORS.text3} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('history.searchPlaceholder')}
            placeholderTextColor={COLORS.text3}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              if (!text.trim()) setIsSearchActive(false);
            }}
            onSubmitEditing={handleSearch}
            keyboardType="number-pad"
            returnKeyType="search"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={handleClearSearch}>
              <Icon name="close" size={14} color={COLORS.text2} />
            </TouchableOpacity>
          )}
        </View>

        {/* Autocomplete suggestions */}
        {suggestions.length > 0 && !isSearchActive && (
          <View style={styles.suggestionsContainer}>
            {suggestions.map((bb) => (
              <TouchableOpacity
                key={bb}
                style={styles.suggestionItem}
                onPress={() => handleSelectSuggestion(bb)}
              >
                <Icon name="inventory" size={14} color={COLORS.text3} />
                <Text style={styles.suggestionText}>{bb}</Text>
                <Text style={styles.suggestionArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Header bar */}
      <View style={styles.headerBar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>
            {searchQuery.trim() ? t('history.headerFiltered', { bb: searchQuery.trim() }) : t('history.headerAllEntries')}
          </Text>
          <Text style={styles.headerSub}>
            {loading ? '…' : t('history.recordCount', { count: records.length })}
          </Text>
          {/* Active date filter chip */}
          {dateRange && (
            <View style={styles.dateFilterChip}>
              <Icon name="event" size={12} color={COLORS.white} />
              <Text style={styles.dateFilterText}>
                {formatFilterChipDate(dateRange.start)} – {formatFilterChipDate(dateRange.end)}
              </Text>
              <TouchableOpacity onPress={handleClearDateFilter} style={styles.dateFilterClose}>
                <Icon name="close" size={14} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.iconBtn, styles.calendarBtn]}
            onPress={handleOpenDatePicker}
          >
            <Icon name="calendar-today" size={22} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.exportBtn, exporting && styles.btnDisabled]}
            onPress={handleExport}
            disabled={exporting || loading}
          >
            {exporting ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={styles.exportText}>⬆ {t('history.export')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color={COLORS.primary} size="large" />
      ) : (
        <FlatList
          data={records}
          keyExtractor={(_, i) => String(i)}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={load}
              tintColor={COLORS.primary}
            />
          }
        />
      )}

      {/* Date Range Picker Modal */}
      <DateRangePicker
        visible={showDatePicker}
        onClose={handleCloseDatePicker}
        onApply={handleApplyDateRange}
        initialStartDate={dateRange?.start || null}
        initialEndDate={dateRange?.end || null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  // Search bar
  searchContainer: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    paddingVertical: 0,
  },
  clearBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.text3 + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  clearBtnText: {
    fontSize: 13,
    color: COLORS.text2,
    fontWeight: '700',
  },

  // Suggestions dropdown
  suggestionsContainer: {
    marginTop: 6,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.small,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '60',
  },
  suggestionIcon: {
    fontSize: 14,
    marginRight: 10,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  suggestionArrow: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Top bar
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOW.small,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  headerSub: { fontSize: 12, color: COLORS.text3, marginTop: 2 },
  dateFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
    alignSelf: 'flex-start',
    gap: 6,
  },
  dateFilterText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.white,
  },
  dateFilterClose: {
    padding: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  calendarBtn: {},
  exportBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: RADIUS.sm,
  },
  exportText: { color: COLORS.white, fontWeight: '700', fontSize: 13 },
  btnDisabled: { opacity: 0.5 },

  // List
  list: { padding: 16, paddingBottom: 40 },

  // Rows
  row: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    ...SHADOW.small,
  },
  rowFirst: { borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  rowLeft: { flex: 1 },
  rowBB: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  rowMeta: { fontSize: 12, color: COLORS.text3, marginTop: 3 },

  // Zone badge
  zoneBadge: {
    backgroundColor: COLORS.primary + '15',
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
    marginLeft: 12,
  },
  zoneText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },

  // Swipe actions
  swipeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  swipeAction: {
    width: 80,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  swipeActionShare: {
    backgroundColor: COLORS.primary,
  },
  swipeActionDelete: {
    backgroundColor: COLORS.error,
  },
  swipeActionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  swipeActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.white,
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyEmoji: { fontSize: 52, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  emptyText: {
    fontSize: 14,
    color: COLORS.text2,
    textAlign: 'center',
    lineHeight: 22,
  },
  clearFilterBtn: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: RADIUS.sm,
  },
  clearFilterText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
});