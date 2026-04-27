/**
 * BaubrettListScreen.js
 * Displays all Baubrett numbers in the database.
 */
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS, RADIUS, SHADOW, FONT_SIZES } from '../assets/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getAllBaubrettNumbers } from '../services/techChangesService';

export default function BaubrettListScreen({ navigation }) {
  const { t } = useTranslation();

  // Get all baubrett numbers from the service
  const baubrettNumbers = useMemo(() => getAllBaubrettNumbers(), []);

  // Render each baubrett number item
  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      activeOpacity={0.7}
      onPress={() => {
        // Optional: Navigate to consult screen with this baubrett pre-filled?
        // For now, just show an alert or do nothing
      }}
    >
      <View style={styles.itemHeader}>
        <View style={styles.numberContainer}>
          <Icon name="confirmation-number" size={20} color={COLORS.primary} />
          <Text style={styles.baubrettNumber}>{item}</Text>
        </View>
        <Text style={styles.indexText}>#{index + 1}</Text>
      </View>
      <View style={styles.divider} />
    </TouchableOpacity>
  );

  // Key extractor for FlatList
  const keyExtractor = (item) => item;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>{t('baubrettList.title', 'All Baubretts')}</Text>
        <Text style={styles.headerSubtitle}>
          {t('baubrettList.subtitle', { count: baubrettNumbers.length })}
        </Text>
      </View>

      <FlatList
        data={baubrettNumbers}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="inbox" size={64} color={COLORS.text3} />
            <Text style={styles.emptyText}>
              {t('baubrettList.empty', 'No baubrett numbers found')}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.text2,
  },
  listContent: {
    padding: 16,
  },
  itemContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 16,
    ...SHADOW.small,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  numberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  baubrettNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    fontFamily: 'monospace',
  },
  indexText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border + '60',
    marginTop: 12,
  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.text3,
    fontWeight: '500',
  },
});