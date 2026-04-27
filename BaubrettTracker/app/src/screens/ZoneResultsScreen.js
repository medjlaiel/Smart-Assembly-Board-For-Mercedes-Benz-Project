/**
 * ZoneResultsScreen.js
 * Displays all Baubrett records that have been scanned in a specific zone.
 *
 * DATA FLOW & PERSISTENCE:
 * 1. ConsultScanScreen triggers zone scan → calls getBaubrettsScannedInZone()
 * 2. getBaubrettsScannedInZone() loads the persistent baubrett_tracking.xlsx file
 *    (stored in FileSystem.documentDirectory, survives app restarts)
 * 3. Tracking file contains all scan records: { BB_Nb, Zone, Date, Time, UserName, UserEmail }
 * 4. This screen enriches tracking records by looking up each baubrett in database.json
 * 5. Display shows: Baubrett # + SOM + Last scan date/time + Who scanned
 *
 * IMPORTANT: The data is permanently persisted on device via FileSystem.documentDirectory.
 * Zone scanning will always show the latest scanned baubretts, even after app is closed/reopened.
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getBaubrettByNumber } from '../services/databaseService';
import { deleteTrackingEntry } from '../services/trackingService';
import { COLORS, RADIUS, SHADOW } from '../assets/theme';

export default function ZoneResultsScreen({ route, navigation }) {
  const { zone, scanRecords = [] } = route.params || {};
  const [baubretts, setBaubretts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Enrich scan records with baubrett details from database
        const enriched = await Promise.all(
          scanRecords.map(async (scanRecord) => {
            const bbRecord = getBaubrettByNumber(scanRecord.BB_Nb);
            return {
              ...scanRecord,
              bbRecord,
            };
          })
        );
        setBaubretts(enriched);
      } catch (error) {
        console.error('Error enriching baubretts:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [scanRecords]);

  const handleDelete = (item) => {
    Alert.alert(
      'Delete Scan Record',
      `Remove ${item.BB_Nb} from scan history?`,
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const success = await deleteTrackingEntry(item);
              if (success) {
                // Remove from list
                setBaubretts(baubretts.filter((b, idx) => !(b.BB_Nb === item.BB_Nb && b.Date === item.Date && b.Time === item.Time)));
              } else {
                Alert.alert('Error', 'Failed to delete scan record');
              }
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete scan record');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View>
      <TouchableOpacity
        style={[styles.card, SHADOW.small]}
        onPress={() => item.bbRecord && navigation.navigate('ConsultResult', { record: item.bbRecord })}
        activeOpacity={0.8}
        disabled={!item.bbRecord}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bb}>{item.BB_Nb}</Text>
            {item.bbRecord && <Text style={styles.som}>{item.bbRecord.SOM}</Text>}
          </View>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons name="delete" size={20} color={COLORS.error || '#EF4444'} />
          </TouchableOpacity>
        </View>
        <View style={styles.meta}>
          <Text style={styles.metaText}>Last scanned: {item.Date} at {item.Time}</Text>
          {item.UserName && <Text style={styles.metaText}>By: {item.UserName}</Text>}
        </View>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Zone: {zone}</Text>
        <Text style={styles.subtitle}>{baubretts.length} baubrett(s) scanned</Text>
      </View>

      <FlatList
        data={baubretts}
        renderItem={renderItem}
        keyExtractor={(item, idx) => `${item.BB_Nb}-${item.Date}-${item.Time}-${idx}`}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No baubretts scanned in this zone yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 16, backgroundColor: COLORS.primary, borderBottomLeftRadius: RADIUS.lg, borderBottomRightRadius: RADIUS.lg },
  title: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  subtitle: { fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  list: { padding: 12, paddingBottom: 20 },
  card: { backgroundColor: COLORS.surface, padding: 14, borderRadius: RADIUS.md, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: COLORS.primary },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  deleteBtn: { padding: 6, marginRight: -6, marginTop: -6 },
  bb: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  som: { fontSize: 12, color: COLORS.text2 },
  meta: { gap: 4 },
  metaText: { fontSize: 12, color: COLORS.text3 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, color: COLORS.text2, fontStyle: 'italic' },
});
