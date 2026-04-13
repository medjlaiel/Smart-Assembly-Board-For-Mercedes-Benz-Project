/**
 * TechChangesScreen.js
 * Allows users to search for technical changes by entering a Baubrett number.
 * Displays all technical changes in table format (same for all Baubrett numbers).
 */
import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Keyboard,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  getTechChangesByBaubrett,
  isValidBaubrett,
  searchBaubrettNumbers,
} from '../services/techChangesService';
import { COLORS, RADIUS, SHADOW, FONT_SIZES } from '../assets/theme';

const { width } = Dimensions.get('window');

export default function TechChangesScreen() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [selectedBaubrett, setSelectedBaubrett] = useState('');
  const [techChanges, setTechChanges] = useState(null);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Handle input change with debounced suggestions
  const handleQueryChange = useCallback((text) => {
    setQuery(text);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (text.trim().length >= 1) {
      debounceRef.current = setTimeout(() => {
        const filtered = searchBaubrettNumbers(text.trim());
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      }, 150);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, []);

  // Handle search by Baubrett number
  const handleSearch = useCallback(() => {
    if (!query.trim()) {
      Alert.alert(
        t('techChanges.error') || 'Error',
        t('techChanges.enterBaubrett') || 'Please enter a Baubrett number'
      );
      return;
    }

    setSearching(true);
    try {
      const cleanQuery = query.trim();

      // Check if Baubrett is valid
      if (!isValidBaubrett(cleanQuery)) {
        setTechChanges(null);
        setHasSearched(true);
        Alert.alert(
          t('techChanges.invalidBaubrett') || 'Baubrett Not Found',
          `"${cleanQuery}" ${t('techChanges.notInDatabase') || 'is not a valid Baubrett number'}`
        );
        setSearching(false);
        Keyboard.dismiss();
        return;
      }

      // Get all technical changes for this Baubrett
      const changes = getTechChangesByBaubrett(cleanQuery);
      setTechChanges(changes);
      setSelectedBaubrett(cleanQuery);
      setHasSearched(true);
    } catch (error) {
      Alert.alert(t('techChanges.error') || 'Error', error.message);
    } finally {
      setSearching(false);
      Keyboard.dismiss();
      setShowSuggestions(false);
    }
  }, [query, t]);

  // Handle suggestion selection
  const selectSuggestion = useCallback((baubrett) => {
    setQuery(baubrett);
    setShowSuggestions(false);
    setSuggestions([]);
    // Trigger search with the selected Baubrett
    const changes = getTechChangesByBaubrett(baubrett);
    setTechChanges(changes);
    setSelectedBaubrett(baubrett);
    setHasSearched(true);
  }, []);

  // Clear search
  const handleClear = useCallback(() => {
    setQuery('');
    setTechChanges(null);
    setHasSearched(false);
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedBaubrett('');
    inputRef.current?.focus();
  }, []);

  // Focus input on screen load
  useFocusEffect(
    useCallback(() => {
      inputRef.current?.focus();
    }, [])
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* ── Search Input Section (Fixed, Non-Scrolling) ──────────────────────── */}
        <View style={styles.searchSection}>
          <View style={[styles.inputWrapper, SHADOW.small]}>
            <Icon name="search" size={24} color={COLORS.primary} />
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder={t('techChanges.inputPlaceholder') || 'Enter list number or site...'}
              placeholderTextColor={COLORS.gray}
              value={query}
              onChangeText={handleQueryChange}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={handleClear}>
                <Icon name="close" size={20} color={COLORS.gray} />
              </TouchableOpacity>
            )}
          </View>

          {/* ── Search Button ────────────────────────────── */}
          <TouchableOpacity
            style={[
              styles.searchButton,
              searching && styles.searchButtonDisabled,
            ]}
            onPress={handleSearch}
            disabled={searching || !query.trim()}
          >
            {searching ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Icon name="search" size={20} color="#FFFFFF" />
                <Text style={styles.searchButtonText}>
                  {t('techChanges.search') || 'Search'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* ── Suggestions Dropdown ──────────────────────── */}
          {showSuggestions && suggestions.length > 0 && (
            <View style={[styles.suggestionsDropdown, SHADOW.medium]}>
              <ScrollView
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
              >
                {suggestions.map((baubrett, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => {
                      selectSuggestion(baubrett);
                    }}
                  >
                    <Icon name="pin" size={18} color={COLORS.primary} />
                    <Text style={styles.suggestionText}>{baubrett}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* ── Results Section (Scrollable) ─────────────────────────==== */}
        <ScrollView
          style={styles.resultsContainer}
          contentContainerStyle={styles.resultsContent}
          nestedScrollEnabled
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
        >
          {hasSearched && !techChanges && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>❌</Text>
              <Text style={styles.emptyStateTitle}>{t('techChanges.notFound') || 'Not Found'}</Text>
              <Text style={styles.emptyStateSubtitle}>
                {t('techChanges.tryAnotherNumber') || 'Try entering another list number or site name.'}
              </Text>
            </View>
          )}

          {techChanges && Array.isArray(techChanges) && techChanges.length > 0 && (
            <>
              {/* ── Header Card ───────────────────────────────── */}
              <View style={[styles.headerCard, SHADOW.medium]}>
                <View style={styles.headerIcon}>
                  <Text style={styles.headerEmoji}>🔍</Text>
                </View>
                <View style={styles.headerContent}>
                  <Text style={styles.headerLabel}>
                    {t('techChanges.baubrettNumber') || 'Baubrett Number'}
                  </Text>
                  <Text style={styles.headerNumber}>{selectedBaubrett}</Text>
                  <Text style={styles.headerSubtext}>
                    {t('techChanges.maintenanceTable') || 'Maintenance Table'} • {techChanges.length}{' '}
                    {t('techChanges.records') || 'records'}
                  </Text>
                </View>
              </View>

              {/* ── Table Section ───────────────────────────── */}
              <View style={[styles.tableSection, SHADOW.medium]}>
                <Text style={styles.tableTitle}>
                  {t('techChanges.allChanges') || 'All Technical Changes'}
                </Text>

                <View style={styles.tableContainer}>
                  {/* Table Header (Fixed, non-scrolling) */}
                  <View style={[styles.tableRow, styles.tableHeaderRow]}>
                    <Text style={[styles.tableCell, styles.tableCellHeader, styles.columnListNumber]}>
                      List #
                    </Text>
                    <Text style={[styles.tableCell, styles.tableCellHeader, styles.columnStatus]}>
                      Status
                    </Text>
                    <Text style={[styles.tableCell, styles.tableCellHeader, styles.columnIssuer]}>
                      Issuer
                    </Text>
                    <Text style={[styles.tableCell, styles.tableCellHeader, styles.columnDate]}>
                      Print Date
                    </Text>
                    <Text style={[styles.tableCell, styles.tableCellHeader, styles.columnJobDesignation]}>
                      Job
                    </Text>
                    <Text style={[styles.tableCell, styles.tableCellHeader, styles.columnSite]}>
                      Site
                    </Text>
                    <Text style={[styles.tableCell, styles.tableCellHeader, styles.columnInterval]}>
                      Interval
                    </Text>
                    <Text style={[styles.tableCell, styles.tableCellHeader, styles.columnCompleted]}>
                      Completed
                    </Text>
                  </View>

                  {/* Table Rows with Horizontal Scroll */}
                  <ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={true}
                    nestedScrollEnabled
                  >
                    <View>
                      {techChanges.map((record, index) => (
                        <View
                          key={index}
                          style={[
                            styles.tableRow,
                            index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
                          ]}
                        >
                          <Text
                            style={[
                              styles.tableCell,
                              styles.columnListNumber,
                              { color: COLORS.primary },
                            ]}
                          >
                            {record.ListNumber}
                          </Text>
                          <Text style={[styles.tableCell, styles.columnStatus]}>
                            {record.Status}
                          </Text>
                          <Text style={[styles.tableCell, styles.columnIssuer]}>
                            {record.Issuer}
                          </Text>
                          <Text style={[styles.tableCell, styles.columnDate]}>
                            {record.PrintDate}
                          </Text>
                          <Text style={[styles.tableCell, styles.columnJobDesignation]}>
                            {record.JobDesignation}
                          </Text>
                          <Text style={[styles.tableCell, styles.columnSite]}>
                            {record.Site}
                          </Text>
                          <Text style={[styles.tableCell, styles.columnInterval]}>
                            {record.IntervalDescription}
                          </Text>
                          <Text style={[styles.tableCell, styles.columnCompleted]}>
                            {record.CompletedDate}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </View>

              {/* ── New Search Button ────────────────────────── */}
              <TouchableOpacity style={[styles.newSearchButton, SHADOW.small]} onPress={handleClear}>
                <Icon name="refresh" size={20} color={COLORS.primary} />
                <Text style={styles.newSearchButtonText}>
                  {t('techChanges.newSearch') || 'New Search'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // ── Search Section ────────────────────────────────────
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    zIndex: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    height: 48,
    gap: 8,
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    color: '#FFF',
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
  },

  // ── Suggestions Dropdown ──────────────────────────────
  suggestionsDropdown: {
    marginTop: 8,
    backgroundColor: '#FFF',
    borderRadius: RADIUS.md,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 10,
  },
  suggestionText: { fontSize: FONT_SIZES.body, color: COLORS.text, fontWeight: '600' },

  // ── Results Container ──────────────────────────────────
  resultsContainer: {
    flex: 1,
  },
  resultsContent: {
    padding: 16,
    paddingBottom: 100,
  },

  // ── Header Card ────────────────────────────────────────
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 16,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerEmoji: {
    fontSize: 28,
  },
  headerContent: {
    flex: 1,
  },
  headerLabel: {
    fontSize: FONT_SIZES.caption,
    color: COLORS.gray,
    fontWeight: '500',
    marginBottom: 4,
  },
  headerNumber: {
    fontSize: FONT_SIZES.heading,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  headerSubtext: { fontSize: FONT_SIZES.caption, color: COLORS.primary, fontWeight: '600' },

  // ── Table Section ──────────────────────────────────────
  tableSection: {
    backgroundColor: '#FFF',
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 16,
  },
  tableTitle: {
    fontSize: FONT_SIZES.subtitle,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  tableContainer: { borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E8E8E8' },
  tableRowEven: { backgroundColor: '#FAFAFA' },
  tableRowOdd: { backgroundColor: '#FFFFFF' },
  tableHeaderRow: { backgroundColor: COLORS.primary },
  tableCell: { paddingHorizontal: 10, paddingVertical: 12, fontSize: FONT_SIZES.caption, color: COLORS.text },
  tableCellHeader: { fontWeight: '700', color: '#FFFFFF', backgroundColor: COLORS.primary },
  columnListNumber: { width: 80 },
  columnStatus: { width: 100 },
  columnIssuer: { width: 70 },
  columnDate: { width: 110 },
  columnJobDesignation: { width: 140 },
  columnSite: { width: 100 },
  columnInterval: { width: 130 },
  columnCompleted: { width: 130 },

  // ── Empty State ────────────────────────────────────────
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: FONT_SIZES.subtitle,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: FONT_SIZES.body,
    color: COLORS.gray,
    textAlign: 'center',
    paddingHorizontal: 24,
  },

  // ── New Search Button ──────────────────────────────────
  newSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingVertical: 12,
    gap: 8,
    marginTop: 24,
  },
  newSearchButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
  },
});