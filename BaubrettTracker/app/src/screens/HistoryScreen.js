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
import { loadTrackingRecords, exportTrackingFile } from '../services/trackingService';
import { COLORS, RADIUS, SHADOW } from '../assets/theme';

export default function HistoryScreen({ route }) {
  const filterBB = route?.params?.filterBB || null;
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filterBB || '');
  const [isSearchActive, setIsSearchActive] = useState(!!filterBB);

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

  // Filtered records based on search query
  const records = useMemo(() => {
    const query = searchQuery.trim();
    if (!query) return allRecords;
    return allRecords.filter((r) =>
      String(r.BB_Nb).trim().includes(query)
    );
  }, [allRecords, searchQuery]);

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
      Alert.alert('Export Failed', err.message || 'Could not export the file.');
    } finally {
      setExporting(false);
    }
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

  const handleSearch = () => {
    setIsSearchActive(true);
    Keyboard.dismiss();
  };

  // ── Empty state ──────────────────────────────────────────────
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📋</Text>
      <Text style={styles.emptyTitle}>No entries found</Text>
      <Text style={styles.emptyText}>
        {searchQuery.trim()
          ? `No location records found for "${searchQuery.trim()}"`
          : 'Save a Baubrett to start tracking locations.'}
      </Text>
      {searchQuery.trim() ? (
        <TouchableOpacity style={styles.clearFilterBtn} onPress={handleClearSearch}>
          <Text style={styles.clearFilterText}>Show All Entries</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  // ── Row renderer ─────────────────────────────────────────────
  const renderItem = ({ item, index }) => (
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
  );

  return (
    <SafeAreaView style={styles.safe}>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputRow}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search Baubrett number…"
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
              <Text style={styles.clearBtnText}>✕</Text>
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
                <Text style={styles.suggestionIcon}>📦</Text>
                <Text style={styles.suggestionText}>{bb}</Text>
                <Text style={styles.suggestionArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Header bar */}
      <View style={styles.headerBar}>
        <View>
          <Text style={styles.headerTitle}>
            {searchQuery.trim() ? `BB ${searchQuery.trim()}` : 'All Entries'}
          </Text>
          <Text style={styles.headerSub}>
            {loading ? '…' : `${records.length} record${records.length !== 1 ? 's' : ''}`}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.exportBtn, exporting && styles.btnDisabled]}
          onPress={handleExport}
          disabled={exporting || loading}
        >
          {exporting ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Text style={styles.exportText}>⬆ Export</Text>
          )}
        </TouchableOpacity>
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
