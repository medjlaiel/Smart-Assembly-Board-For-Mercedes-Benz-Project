/**
 * BaubrettListScreen.js
 * Displays all Baubrett numbers that have been scanned (from tracking history).
 * Each baubrett has a delete button to remove it from scan history.
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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView as SafeAreaViewContext } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { COLORS, RADIUS, SHADOW, FONT_SIZES } from '../assets/theme';
import { loadTrackingRecords, deleteTrackingEntry } from '../services/trackingService';
import { getBaubrettByNumber } from '../services/databaseService';

export default function BaubrettListScreen({ navigation }) {
  const { t } = useTranslation();
  const [baubretts, setBaubretts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load scanned baubretts from tracking history
  useEffect(() => {
    (async () => {
      try {
        const records = await loadTrackingRecords();
        // Get unique baubrett numbers with their latest scan info
        const map = new Map();
        records.forEach(r => {
          const key = String(r.BB_Nb).trim();
          if (!map.has(key) || new Date(`${r.Date} ${r.Time}`) > new Date(`${map.get(key).Date} ${map.get(key).Time}`)) {
            map.set(key, r);
          }
        });
        const uniqueBaubretts = Array.from(map.values());
        setBaubretts(uniqueBaubretts);
      } catch (error) {
        console.error('Error loading baubretts:', error);
        setBaubretts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = (item) => {
    Alert.alert(
      t('common.delete', 'Delete'),
      `Remove ${item.BB_Nb} from scan history?`,
      [
        { text: t('common.cancel', 'Cancel'), onPress: () => {}, style: 'cancel' },
        {
          text: t('common.delete', 'Delete'),
          onPress: async () => {
            try {
              const success = await deleteTrackingEntry(item);
              if (success) {
                // Remove from list
                setBaubretts(baubretts.filter(b => !(b.BB_Nb === item.BB_Nb && b.Date === item.Date && b.Time === item.Time)));
              } else {
                Alert.alert(t('common.error', 'Error'), t('common.deleteFailed', 'Failed to delete'));
              }
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert(t('common.error', 'Error'), t('common.deleteFailed', 'Failed to delete'));
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  // Render each baubrett number item
  const renderItem = ({ item, index }) => {
    const bbRecord = getBaubrettByNumber(item.BB_Nb);
    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <View style={styles.numberContainer}>
              <MaterialIcons name="confirmation-number" size={20} color={COLORS.primary} />
              <View>
                <Text style={styles.baubrettNumber}>{item.BB_Nb}</Text>
                {bbRecord && <Text style={styles.som}>{bbRecord.SOM}</Text>}
              </View>
            </View>
            <Text style={styles.indexText}>#{index + 1}</Text>
          </View>
          <View style={styles.metaInfo}>
            <Text style={styles.metaText}>Last scanned: {item.Date} at {item.Time}</Text>
            {item.Zone && <Text style={styles.metaText}>Zone: {item.Zone}</Text>}
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialIcons name="delete" size={20} color={COLORS.error || '#EF4444'} />
        </TouchableOpacity>
      </View>
    );
  };

  // Key extractor for FlatList
  const keyExtractor = (item, idx) => `${item.BB_Nb}-${item.Date}-${item.Time}-${idx}`;

  return (
    <SafeAreaViewContext style={styles.safe}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>{t('baubrettList.title', 'Scanned Baubretts')}</Text>
        <Text style={styles.headerSubtitle}>
          {t('baubrettList.subtitle', { count: baubretts.length })} baubretts scanned
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={baubretts}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="inbox" size={64} color={COLORS.text3} />
              <Text style={styles.emptyText}>
                {t('baubrettList.empty', 'No scanned baubretts yet')}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaViewContext>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: 14,
    ...SHADOW.small,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemContent: {
    flex: 1,
    marginRight: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  numberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  baubrettNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    fontFamily: 'monospace',
  },
  som: {
    fontSize: 12,
    color: COLORS.text2,
    marginTop: 2,
  },
  indexText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  metaInfo: {
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.text3,
  },
  deleteBtn: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: COLORS.text2,
    fontStyle: 'italic',
  },
});
    color: COLORS.text3,
    fontWeight: '500',
  },
});