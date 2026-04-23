/**
 * ZoneContentsScreen.js
 * Displays all baubretts contained in a zone after scanning a zone QR code.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../assets/theme';

export default function ZoneContentsScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { zone, baubretts } = route.params;

  const handleBaubrettSelect = (baubrett) => {
    // Navigate to the detail view for the selected baubrett
    navigation.navigate('ConsultResult', { record: baubrett });
  };

  const renderBaubrettItem = ({ item }) => (
    <TouchableOpacity
      style={styles.baubrettCard}
      onPress={() => handleBaubrettSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <Text style={styles.bbNumber}>{item.BB_Nb}</Text>
      </View>
      <Text style={styles.arrowText}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹ {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{zone.label}</Text>
        <View style={styles.spacer} />
      </View>

      {/* Zone Info Banner */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoText}>
          {t('zoneContents.title', { count: baubretts.length })}
        </Text>
      </View>

      {/* List of Baubretts */}
      {baubretts && baubretts.length > 0 ? (
        <FlatList
          data={baubretts}
          renderItem={renderBaubrettItem}
          keyExtractor={(item) => item.BB_Nb}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t('zoneContents.empty')}</Text>
        </View>
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
  infoBanner: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  baubrettCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginVertical: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
  },
  bbNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  somText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  fpText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  arrowText: {
    fontSize: 20,
    color: COLORS.primary,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});