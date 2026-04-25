/**
 * SearchScreen.js
 * Search the database by SOM, BB_Nb, or FP-NO
 * Displays matching records with their details.
 * Includes typeahead/autocomplete functionality.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { searchDatabase, searchDatabaseFuzzy } from '../services/databaseService';
import { COLORS, RADIUS, SHADOW, FONT_SIZES } from '../assets/theme';

// Constants for suggestions dropdown
const MAX_VISIBLE_SUGGESTIONS = 8;
const SUGGESTION_HEIGHT = 50; // Approximate height per suggestion item
const DEBOUNCE_DELAY = 150; // ms to wait before showing suggestions

export default function SearchScreen({ navigation }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Typeahead state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isNavigatingSuggestions, setIsNavigatingSuggestions] = useState(false);
  
  // Refs
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Debounced query change handler for typeahead
  const handleQueryChange = useCallback((text) => {
    setQuery(text);
    
    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Only trigger typeahead if query has at least 2 characters
    if (text.trim().length >= 2) {
      debounceTimerRef.current = setTimeout(() => {
        const fuzzyResults = searchDatabaseFuzzy(text.trim(), MAX_VISIBLE_SUGGESTIONS);
        setSuggestions(fuzzyResults);
        setShowSuggestions(fuzzyResults.length > 0);
        setSelectedIndex(-1);
        setIsNavigatingSuggestions(false);
      }, DEBOUNCE_DELAY);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  }, []);

  // Handle suggestion selection
  const selectSuggestion = useCallback((suggestion) => {
    const { record, type } = suggestion;
    setQuery(record.BB_Nb);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    
    // Perform full search with the selected record's BB_Nb
    if (record.BB_Nb) {
      setSearching(true);
      setHasSearched(true);
      setTimeout(() => {
        const searchResults = searchDatabase(record.BB_Nb);
        setResults(searchResults);
        setSearching(false);
      }, 300);
    }
  }, []);

  // Render suggestions dropdown
  const renderSuggestionsDropdown = useCallback(() => {
    if (!showSuggestions || suggestions.length === 0) {
      return null;
    }

    return (
      <View style={styles.suggestionsContainer}>
        <ScrollView
          style={styles.suggestionsScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
        >
          {suggestions.map((suggestion, index) => {
            const isSelected = index === selectedIndex;
            const { type, record, displayText } = suggestion;
            const matchLabel = getMatchLabel(type);
            const badgeColor = getBadgeColor(type);

            return (
              <TouchableOpacity
                key={`${record.BB_Nb}-${type}`}
                style={[
                  styles.suggestionItem,
                  isSelected && styles.suggestionItemSelected
                ]}
                onPress={() => selectSuggestion(suggestion)}
                onPressIn={() => {
                  setSelectedIndex(index);
                  setIsNavigatingSuggestions(true);
                }}
              >
                <View style={[styles.suggestionBadge, {
                  borderColor: badgeColor.borderColor,
                  backgroundColor: badgeColor.backgroundColor
                }]}>
                  <Text style={[styles.suggestionBadgeText, { color: badgeColor.textColor }]}>
                    {matchLabel}
                  </Text>
                </View>
                <Text style={[
                  styles.suggestionText,
                  isSelected && styles.suggestionTextSelected
                ]}>
                  {displayText}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  }, [showSuggestions, suggestions, selectedIndex, selectSuggestion]);

  // Handle keyboard navigation (arrow keys, enter, escape)
  const handleKeyPress = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      return;
    }

    const { key } = e.nativeEvent;
    
    if (key === 'ArrowDown') {
      e.preventDefault?.();
      setSelectedIndex(prev =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
      setIsNavigatingSuggestions(true);
    } else if (key === 'ArrowUp') {
      e.preventDefault?.();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
      setIsNavigatingSuggestions(true);
    } else if (key === 'Enter') {
      e.preventDefault?.();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        selectSuggestion(suggestions[selectedIndex]);
      } else if (query.trim()) {
        handleSearch();
      }
    } else if (key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
      setIsNavigatingSuggestions(false);
    }
  };

  // Close suggestions when tapping outside
  const handleDismissKeyboard = () => {
    Keyboard.dismiss();
    // Delay hiding suggestions to allow tap on suggestion
    setTimeout(() => {
      if (!showSuggestions) return;
      setShowSuggestions(false);
    }, 150);
  };

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleSearch = () => {
    if (!query.trim()) {
      Alert.alert(t('search.emptyTitle'), t('search.emptyMessage'));
      return;
    }

    setSearching(true);
    setHasSearched(true);
    setShowSuggestions(false);
    setSuggestions([]);

    // Simulate a small delay for UX (optional)
    setTimeout(() => {
      const searchResults = searchDatabase(query.trim());
      setResults(searchResults);
      setSearching(false);
    }, 300);
  };

  const getMatchLabel = (type) => {
    switch (type) {
      case 'bb_nb':
        return t('search.matchBB');
      case 'som':
        return t('search.matchSOM');
      case 'fp_no':
        return t('search.matchFPNO');
      default:
        return '';
    }
  };

  const renderResultCard = (item, index) => {
    const { type, record } = item;
    const matchLabel = getMatchLabel(type);

    return (
      <View key={index} style={styles.resultCard}>
        <View style={styles.cardHeader}>
          <View style={[styles.matchBadge, getBadgeColor(type)]}>
            <Text style={styles.matchBadgeText}>{matchLabel}</Text>
          </View>
          <Text style={styles.bbNumber}>{record.BB_Nb}</Text>
        </View>

        <View style={styles.cardContent}>
          <Row label={t('search.som')} value={record.SOM} />
          <Row label={t('search.fpNo')} value={record.FP_NO ? record.FP_NO.join(', ') : '-'} />
          <View style={styles.accessoriesSection}>
            <Text style={styles.accessoriesLabel}>{t('search.accessories')}:</Text>
            {record.Accessories && record.Accessories.length > 0 ? (
              <View style={styles.accessoriesList}>
                {record.Accessories.map((acc, i) => (
                  <View key={i} style={styles.accessoryItem}>
                    <View style={styles.bullet} />
                    <Text style={styles.accessoryText}>{acc}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noAccessories}>{t('search.noAccessories')}</Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TouchableWithoutFeedback onPress={handleDismissKeyboard}>
        <View style={styles.container}>
          {/* Search Input */}
          <View style={styles.searchContainer}>
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder={t('search.placeholder')}
              value={query}
              onChangeText={handleQueryChange}
              onKeyPress={handleKeyPress}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              autoFocus={true}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[styles.searchButton, query.trim() ? styles.searchButtonActive : styles.searchButtonDisabled]}
              onPress={handleSearch}
              disabled={!query.trim() || searching}
            >
              {searching ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.searchButtonText}>{t('search.searchButton')}</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Suggestions Dropdown */}
          {renderSuggestionsDropdown()}

          {/* Results */}
          {searching ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={COLORS.primary} size="large" />
            <Text style={styles.loadingText}>{t('search.searching')}</Text>
          </View>
        ) : hasSearched && results.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>{t('search.noResultsTitle')}</Text>
            <Text style={styles.emptyMessage}>{t('search.noResultsMessage')}</Text>
          </View>
        ) : results.length > 0 ? (
          <ScrollView contentContainerStyle={styles.resultsContainer}>
            <Text style={styles.resultsCount}>
              {t('search.resultsCount', { count: results.length })}
            </Text>
            {results.map((item, index) => renderResultCard(item, index))}
          </ScrollView>
        ) : (
          <View style={styles.initialContainer}>
            <Text style={styles.initialIcon}>🔎</Text>
            <Text style={styles.initialTitle}>{t('search.initialTitle')}</Text>
            <Text style={styles.initialMessage}>{t('search.initialMessage')}</Text>
          </View>
        )}
      </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

// Helper component for label/value rows
function Row({ label, value }) {
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={rowStyles.value} numberOfLines={1} ellipsizeMode="middle">
        {value || '-'}
      </Text>
    </View>
  );
}

function getBadgeColor(type) {
  switch (type) {
    case 'bb_nb':
      return { backgroundColor: COLORS.primary + '15', borderColor: COLORS.primary, textColor: COLORS.primary };
    case 'som':
      return { backgroundColor: COLORS.success + '15', borderColor: COLORS.success, textColor: COLORS.success };
    case 'fp_no':
      return { backgroundColor: COLORS.warning + '15', borderColor: COLORS.warning, textColor: COLORS.warning };
    default:
      return { backgroundColor: COLORS.border + '15', borderColor: COLORS.border, textColor: COLORS.text2 };
  }
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  label: { fontSize: 12, color: COLORS.text3, textTransform: 'uppercase', letterSpacing: 0.5, flex: 1 },
  value: { fontSize: 13, color: COLORS.text, flex: 2, textAlign: 'right' },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, padding: 20 },

  // Search input
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchButton: {
    borderRadius: RADIUS.md,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  searchButtonActive: {
    backgroundColor: COLORS.primary,
    ...SHADOW.small,
  },
  searchButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  searchButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 15,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.text2,
  },

  // Empty / initial states
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    color: COLORS.text2,
    textAlign: 'center',
    lineHeight: 20,
  },
  initialContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  initialIcon: { fontSize: 48, marginBottom: 16 },
  initialTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  initialMessage: {
    fontSize: 14,
    color: COLORS.text2,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Results
  resultsContainer: {
    paddingBottom: 20,
  },
  resultsCount: {
    fontSize: 13,
    color: COLORS.text3,
    marginBottom: 12,
    fontWeight: '600',
  },

  // Result card
  resultCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginBottom: 16,
    ...SHADOW.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  matchBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  matchBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  bbNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  cardContent: {
    padding: 14,
  },
  accessoriesSection: {
    marginTop: 4,
  },
  accessoriesLabel: {
    fontSize: 11,
    color: COLORS.text3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  accessoriesList: {
    gap: 6,
  },
  accessoryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.primary,
    marginTop: 6,
    marginRight: 8,
    flexShrink: 0,
  },
  accessoryText: {
    fontSize: 12,
    color: COLORS.text,
    lineHeight: 18,
    flex: 1,
  },
  noAccessories: {
    fontSize: 12,
    color: COLORS.text3,
    fontStyle: 'italic',
  },

  // Suggestions dropdown (typeahead)
  suggestionsContainer: {
    position: 'absolute',
    top: 70, // Below search input (searchContainer height + margin)
    left: 20,
    right: 20,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    ...SHADOW.medium,
    zIndex: 1000,
    maxHeight: MAX_VISIBLE_SUGGESTIONS * SUGGESTION_HEIGHT,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  suggestionsScroll: {
    flex: 1,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  suggestionItemSelected: {
    backgroundColor: COLORS.primary + '10',
  },
  suggestionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 10,
  },
  suggestionBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  suggestionText: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  suggestionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
