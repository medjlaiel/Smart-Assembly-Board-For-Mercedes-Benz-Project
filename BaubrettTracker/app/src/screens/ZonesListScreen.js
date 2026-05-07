/**
 * ZonesListScreen.js
 * Displays a list of all available zones.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { COLORS, RADIUS, SHADOW } from '../assets/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getZonesWithBaubrettCount, getBaubrettsByZone } from '../services/databaseService';

export default function ZonesListScreen({ navigation }) {
  const { t } = useTranslation();
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    try {
      setError(null);
      const zonesData = await getZonesWithBaubrettCount();
      setZones(zonesData);
    } catch (err) {
      console.error('Error loading zones:', err);
      setError('Failed to load zones');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadZones();
  };

  const handleZonePress = async (zone) => {
    try {
      // Fetch baubretts for this zone
      const baubretts = await getBaubrettsByZone(zone.key);
      navigation.navigate('ZoneContents', {
        zone: { key: zone.key, label: zone.label },
        baubretts: baubretts,
      });
    } catch (err) {
      console.error('Error loading baubretts for zone:', err);
      // Still navigate but with empty array
      navigation.navigate('ZoneContents', {
        zone: { key: zone.key, label: zone.label },
        baubretts: [],
      });
    }
  };

  const renderZoneItem = ({ item }) => (
    <TouchableOpacity
      style={styles.zoneCard}
      onPress={() => handleZonePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.zoneIconContainer}>
        <Icon name="location-city" size={28} color={COLORS.white} />
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{item.count}</Text>
        </View>
      </View>
      <View style={styles.zoneInfo}>
        <Text style={styles.zoneLabel}>{item.label}</Text>
        <Text style={styles.zoneKey}>{item.key}</Text>
      </View>
      <Icon name="chevron-right" size={24} color={COLORS.text3} />
    </TouchableOpacity>
  );

  const renderLoading = () => (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>{t('common.loading')}</Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.centered}>
      <Icon name="error-outline" size={64} color={COLORS.error} />
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={loadZones}>
        <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.centered}>
      <Icon name="location-off" size={64} color={COLORS.text3} />
      <Text style={styles.emptyTitle}>{t('zones.emptyTitle')}</Text>
      <Text style={styles.emptyText}>{t('zones.emptyText')}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderLoading()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹ {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('zones.title')}</Text>
        <View style={styles.spacer} />
      </View>

      {error ? (
        renderError()
      ) : zones.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          data={zones}
          renderItem={renderZoneItem}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    fontSize: 16,
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
  listContent: {
    padding: 16,
  },
  zoneCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOW.small,
  },
  zoneIconContainer: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  countBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  countText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  zoneInfo: {
    flex: 1,
    marginLeft: 14,
  },
  zoneLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  zoneKey: {
    fontSize: 13,
    color: COLORS.text3,
    fontFamily: 'monospace',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.text3,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.text2,
    textAlign: 'center',
    lineHeight: 22,
  },
});