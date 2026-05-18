/**
 * QRLibraryScreen.js
 * Displays scrollable grids of QR codes for Baubretts and Zones.
 * Features an assisted search bar at the top that suggests
 * baubretts or zones as you type.
 */
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOW } from '../assets/theme';
import { getAll } from '../services/databaseService';
import ZONES from '../data/zones';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_SIZE = (SCREEN_WIDTH - 16 * 2 - CARD_GAP) / 2; // 2 columns

// ── QR Card Component ──────────────────────────────────────────────
function QrCard({ title, value, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.qrContainer}>
        <QRCode value={value} size={100} backgroundColor="white" />
      </View>
      <Text style={styles.cardTitle} numberOfLines={2}>{title}</Text>
    </TouchableOpacity>
  );
}

// ── Enlarged QR Modal ──────────────────────────────────────────────
function QrModal({ visible, title, value, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close-circle" size={36} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{title}</Text>
          <View style={styles.modalQrWrapper}>
            {value ? (
              <QRCode value={value} size={250} backgroundColor="white" />
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Section Header ─────────────────────────────────────────────────
function SectionHeader({ title, count }) {
  return (
    <View style={styles.sectionHeaderRow}>
      <Text style={styles.sectionHeader}>{title}</Text>
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{count}</Text>
      </View>
    </View>
  );
}

// ── Suggestion Item ────────────────────────────────────────────────
function SuggestionItem({ label, type, onPress }) {
  const iconName = type === 'baubrett' ? 'cube-outline' : 'map-outline';
  const typeLabel = type === 'baubrett' ? 'Baubrett' : 'Zone';
  return (
    <TouchableOpacity style={styles.suggestionItem} onPress={onPress} activeOpacity={0.6}>
      <View style={[styles.suggestionIcon, { backgroundColor: type === 'baubrett' ? COLORS.primary + '20' : COLORS.accent + '20' }]}>
        <Ionicons name={iconName} size={18} color={COLORS.primary} />
      </View>
      <View style={styles.suggestionTextWrap}>
        <Text style={styles.suggestionLabel} numberOfLines={1}>{label}</Text>
        <Text style={styles.suggestionType}>{typeLabel}</Text>
      </View>
      <Ionicons name="arrow-forward" size={16} color={COLORS.text3} />
    </TouchableOpacity>
  );
}

// ── Main Screen ────────────────────────────────────────────────────
export default function QRLibraryScreen() {
  const [baubretts, setBaubretts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeFilter, setActiveFilter] = useState(''); // '' = show all, or a search term
  const searchInputRef = useRef(null);

  // Load Baubrett BB_Nb values from database
  const loadBaubretts = useCallback(() => {
    try {
      const records = getAll();
      const bbNbs = records
        .map((r) => String(r.BB_Nb).trim())
        .filter((v) => v.length > 0);
      const unique = [...new Set(bbNbs)];
      setBaubretts(unique);
    } catch (err) {
      console.error('Failed to load Baubrett data:', err);
    }
  }, []);

  useEffect(() => {
    loadBaubretts();
    setLoading(false);
  }, [loadBaubretts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadBaubretts();
    setRefreshing(false);
  }, [loadBaubretts]);

  const zones = useMemo(() => ZONES, []);

  // Build suggestion list based on search query
  const suggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const matchedBaubretts = baubretts
      .filter((bb) => bb.toLowerCase().includes(q))
      .map((bb) => ({ label: bb, type: 'baubrett', value: bb }));

    const matchedZones = zones
      .filter((z) => z.label.toLowerCase().includes(q) || z.key.toLowerCase().includes(q))
      .map((z) => ({ label: `${z.label} (${z.key})`, type: 'zone', value: z.key }));

    // Combine results, show zones first then baubretts, limit to 8
    return [...matchedZones, ...matchedBaubretts].slice(0, 8);
  }, [searchQuery, baubretts, zones]);

  // Filtered data based on active filter
  const filteredBaubretts = useMemo(() => {
    if (!activeFilter) return baubretts;
    const q = activeFilter.toLowerCase();
    return baubretts.filter((bb) => bb.toLowerCase().includes(q));
  }, [activeFilter, baubretts]);

  const filteredZones = useMemo(() => {
    if (!activeFilter) return zones;
    const q = activeFilter.toLowerCase();
    return zones.filter(
      (z) => z.label.toLowerCase().includes(q) || z.key.toLowerCase().includes(q)
    );
  }, [activeFilter, zones]);

  const openModal = useCallback((title, value) => {
    setSelectedItem({ title, value });
    setModalVisible(true);
  }, []);

  const handleClose = useCallback(() => {
    setModalVisible(false);
    setTimeout(() => setSelectedItem(null), 300);
  }, []);

  // When a suggestion is tapped
  const handleSelectSuggestion = useCallback((suggestion) => {
    setSearchQuery(suggestion.label);
    setActiveFilter(suggestion.label);
    setShowSuggestions(false);
    Keyboard.dismiss();
  }, []);

  // Clear search / reset filter
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setActiveFilter('');
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  }, []);

  // When text changes, show suggestions and clear active filter
  const handleSearchChange = useCallback((text) => {
    setSearchQuery(text);
    setActiveFilter('');
    if (text.trim()) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, []);

  // Handle search submit (Enter key)
  const handleSearchSubmit = useCallback(() => {
    if (searchQuery.trim()) {
      setActiveFilter(searchQuery.trim());
    }
    setShowSuggestions(false);
    Keyboard.dismiss();
  }, [searchQuery]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading QR codes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Search Bar ─────────────────────────────── */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.text3} style={styles.searchIcon} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search by Baubrett number or Zone name..."
            placeholderTextColor={COLORS.text3}
            value={searchQuery}
            onChangeText={handleSearchChange}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={COLORS.text3} />
            </TouchableOpacity>
          )}
        </View>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <FlatList
              data={suggestions}
              keyExtractor={(item, index) => `${item.type}-${item.value}-${index}`}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <SuggestionItem
                  label={item.label}
                  type={item.type}
                  onPress={() => handleSelectSuggestion(item)}
                />
              )}
              style={styles.suggestionsList}
            />
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />
        }
      >
        {/* Active filter indicator */}
        {activeFilter !== '' && (
          <View style={styles.activeFilterRow}>
            <Ionicons name="filter" size={16} color={COLORS.primary} />
            <Text style={styles.activeFilterText}>
              Showing results for: <Text style={styles.activeFilterQuery}>"{activeFilter}"</Text>
            </Text>
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearFilterBtn}>
              <Text style={styles.clearFilterText}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Baubretts Section */}
        <SectionHeader title="Baubretts" count={filteredBaubretts.length} />
        {filteredBaubretts.length > 0 ? (
          <View style={styles.grid}>
            {filteredBaubretts.map((bbNb) => (
              <QrCard
                key={bbNb}
                title={bbNb}
                value={bbNb}
                onPress={() => openModal(bbNb, bbNb)}
              />
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No matching Baubretts found</Text>
        )}

        {/* Zones Section */}
        <SectionHeader title="Zones" count={filteredZones.length} />
        {filteredZones.length > 0 ? (
          <View style={styles.grid}>
            {filteredZones.map((zone) => (
              <QrCard
                key={zone.key}
                title={zone.label}
                value={zone.key}
                onPress={() => openModal(zone.label, zone.key)}
              />
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No matching Zones found</Text>
        )}

        <View style={styles.footer} />
      </ScrollView>

      {/* Enlarged QR Modal */}
      <QrModal
        visible={modalVisible}
        title={selectedItem?.title || ''}
        value={selectedItem?.value || ''}
        onClose={handleClose}
      />
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.text3,
  },
  // ── Search Bar ──────────────────────────────────
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    height: 46,
    ...SHADOW.small,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
  // ── Suggestions ─────────────────────────────────
  suggestionsContainer: {
    marginTop: 4,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: 320,
    ...SHADOW.medium,
    overflow: 'hidden',
  },
  suggestionsList: {
    maxHeight: 320,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '60',
  },
  suggestionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  suggestionTextWrap: {
    flex: 1,
  },
  suggestionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  suggestionType: {
    fontSize: 11,
    color: COLORS.text3,
    marginTop: 1,
  },
  // ── Active Filter ──────────────────────────────
  activeFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '12',
    borderRadius: RADIUS.sm,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    marginTop: 4,
  },
  activeFilterText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text2,
    marginLeft: 8,
  },
  activeFilterQuery: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  clearFilterBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  clearFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text2,
  },
  // ── Content ────────────────────────────────────
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  countBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginLeft: 10,
  },
  countText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.text3,
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
    marginBottom: 16,
  },
  card: {
    width: CARD_SIZE,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.small,
  },
  qrContainer: {
    padding: 8,
    backgroundColor: 'white',
    borderRadius: RADIUS.sm,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalQrWrapper: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: RADIUS.lg,
    ...SHADOW.large,
  },
  footer: {
    height: 40,
  },
});
