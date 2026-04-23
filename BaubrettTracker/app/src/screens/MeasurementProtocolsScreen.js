/**
 * MeasurementProtocolsScreen.js
 * Search and view measurement protocols by FP-NO.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../assets/theme';
import { searchFPNumbers, getProtocolByFPNO } from '../services/mesProtocolsService';

export default function MeasurementProtocolsScreen({ navigation }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedFP, setSelectedFP] = useState(null);
  const [protocol, setProtocol] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = (text) => {
    setQuery(text);
    if (text.length > 0) {
      const results = searchFPNumbers(text);
      setSuggestions(results);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedFP(null);
      setProtocol(null);
    }
  };

  const selectSuggestion = (fpNo) => {
    setQuery(fpNo);
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedFP(fpNo);
    const protocolData = getProtocolByFPNO(fpNo);
    if (protocolData) {
      setProtocol(protocolData);
    } else {
      Alert.alert(
        t('protocols.notFound') || 'Not Found',
        t('protocols.noProtocolForFP', { fpNo }) || `No protocol found for FP-NO: ${fpNo}`,
        [{ text: t('common.ok') }]
      );
    }
  };

  const renderProtocolLine = ({ item, index }) => (
    <View style={styles.lineCard}>
      <View style={styles.lineHeader}>
        <Text style={styles.lineIndex}>#{item.index}</Text>
        <Text style={styles.branche}>{item.branche}</Text>
      </View>
      <View style={styles.lineDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Exigences:</Text>
          <Text style={styles.detailValue}>{item.exigences || '-'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Déviation:</Text>
          <Text style={styles.detailValue}>{item.deviation || '-'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Faisceau:</Text>
          <Text style={styles.detailValue}>{item.faisceau || '-'}</Text>
        </View>
      </View>
    </View>
  );

  const renderSuggestionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => selectSuggestion(item)}
    >
      <Text style={styles.suggestionText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>‹ {t('common.back')}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('protocols.title') || 'Measurement Protocols'}</Text>
          <View style={styles.spacer} />
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <TextInput
            style={styles.searchInput}
            placeholder={t('protocols.searchPlaceholder') || 'Enter FP-NO to search...'}
            placeholderTextColor={COLORS.text3}
            value={query}
            onChangeText={handleSearch}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          
          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <FlatList
                data={suggestions}
                renderItem={renderSuggestionItem}
                keyExtractor={(item) => item}
                keyboardShouldPersistTaps="always"
                style={styles.suggestionsList}
              />
            </View>
          )}
        </View>

        {/* Results */}
        {selectedFP && protocol ? (
          <View style={styles.resultsContainer}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>
                {t('protocols.protocolFor', { fpNo: selectedFP }) || `Protocol for ${selectedFP}`}
              </Text>
              <Text style={styles.lineCount}>
                {t('protocols.totalLines', { count: protocol.totalLines }) || `${protocol.totalLines} lines`}
              </Text>
            </View>
            
            <FlatList
              data={protocol.lines}
              renderItem={renderProtocolLine}
              keyExtractor={(item) => `${item.index}-${item.branche}`}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={true}
            />
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>
              {t('protocols.searchPrompt') || 'Search for an FP-NO to view its measurement protocol'}
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  spacer: {
    width: 40,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: COLORS.background,
    color: COLORS.text,
  },
  suggestionsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    marginTop: 4,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  suggestionText: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.primaryLight,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  lineCount: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  lineCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginBottom: 12,
    padding: 16,
    ... Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  lineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  lineIndex: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: 12,
    minWidth: 35,
  },
  branche: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  lineDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text3,
    flex: 1,
  },
  detailValue: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});