/**
 * BaubrettListScreen.js
 * Displays all Baubrett numbers in the database.
 * Allows permanent deletion of Baubrett entries with confirmation.
 */
import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS, RADIUS, SHADOW, FONT_SIZES } from '../assets/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getAllBaubrettNumbers } from '../services/techChangesService';
import { getDeletedBaubretts, deleteBaubrett as markDeleted } from '../services/deletedBaubrettService';

export default function BaubrettListScreen({ navigation }) {
  const { t } = useTranslation();
  const [deletedBaubretts, setDeletedBaubretts] = useState(new Set());
  const [refreshing, setRefreshing] = useState(false);

  // Load deleted baubretts on mount
  useEffect(() => {
    loadDeletedBaubretts();
  }, []);

  const loadDeletedBaubretts = async () => {
    const deleted = await getDeletedBaubretts();
    setDeletedBaubretts(deleted);
  };

  // Get all baubrett numbers and filter out deleted ones
  const baubrettNumbers = useMemo(() => {
    const all = getAllBaubrettNumbers();
    return all.filter((bb) => !deletedBaubretts.has(String(bb).trim()));
  }, [deletedBaubretts]);

  // Handle delete with confirmation
  const handleDelete = (bbNb) => {
    Alert.alert(
      t('baubrettList.deleteConfirmTitle', 'Remove Baubrett'),
      t('baubrettList.deleteConfirmMessage', { bbNb }),
      [
        {
          text: t('common.cancel', 'Cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete', 'Delete'),
          style: 'destructive',
          onPress: async () => {
            const success = await markDeleted(bbNb);
            if (success) {
              // Update local state to reflect deletion
              setDeletedBaubretts((prev) => {
                const newSet = new Set(prev);
                newSet.add(bbNb);
                return newSet;
              });
            } else {
              Alert.alert(
                t('common.error', 'Error'),
                t('baubrettList.deleteError', 'Failed to delete Baubrett')
              );
            }
          },
        },
      ]
    );
  };

  // Refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await loadDeletedBaubretts();
    setRefreshing(false);
  };

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
        <View style={styles.rightContainer}>
          <Text style={styles.indexText}>#{index + 1}</Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="delete" size={22} color={COLORS.error} />
          </TouchableOpacity>
        </View>
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
        refreshing={refreshing}
        onRefresh={onRefresh}
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
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteButton: {
    padding: 4,
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