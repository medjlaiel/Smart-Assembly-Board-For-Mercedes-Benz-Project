/**
 * TechChangesScreen.js
 * Displays all technical changes in table format.
 */
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import techChanges from '../data/tech_changes.json';
import { COLORS, RADIUS, SHADOW, FONT_SIZES } from '../assets/theme';

const { width } = Dimensions.get('window');
const COLUMN_WIDTHS = {
  ListNumber: 70,
  Status: 80,
  Issuer: 90,
  PrintDate: 110,
  JobDesignation: 100,
  Site: 80,
  Interval: 80,
  Completed: 80,
};

export default function TechChangesScreen() {
  const { t } = useTranslation();
  
  const allChanges = useMemo(() => techChanges || [], []);

  const renderTableRow = ({ item, index }) => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      nestedScrollEnabled
      style={[
        styles.tableRow,
        index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
      ]}
    >
      <Text
        style={[
          styles.tableCell,
          { width: COLUMN_WIDTHS.ListNumber, color: COLORS.primary },
        ]}
      >
        {item.ListNumber || '-'}
      </Text>
      <Text
        style={[styles.tableCell, { width: COLUMN_WIDTHS.Status }]}
      >
        {item.Status || '-'}
      </Text>
      <Text
        style={[styles.tableCell, { width: COLUMN_WIDTHS.Issuer }]}
      >
        {item.Issuer || '-'}
      </Text>
      <Text
        style={[styles.tableCell, { width: COLUMN_WIDTHS.PrintDate }]}
      >
        {item.PrintDate || '-'}
      </Text>
      <Text
        style={[styles.tableCell, { width: COLUMN_WIDTHS.JobDesignation }]}
      >
        {item.JobDesignation || '-'}
      </Text>
      <Text
        style={[styles.tableCell, { width: COLUMN_WIDTHS.Site }]}
      >
        {item.Site || '-'}
      </Text>
      <Text
        style={[styles.tableCell, { width: COLUMN_WIDTHS.Interval }]}
      >
        {item.Interval || '-'}
      </Text>
      <Text
        style={[styles.tableCell, { width: COLUMN_WIDTHS.Completed }]}
      >
        {item.Completed || '-'}
      </Text>
    </ScrollView>
  );
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>{t('database.title', 'Technical Changes')}</Text>
        <Text style={styles.headerSubtitle}>
          {t('database.subtitle', { count: allChanges.length })}
        </Text>
      </View>

      {/* Table Header (Fixed, non-scrolling) */}
      <View style={styles.tableHeaderContainer}>
        <Text
          style={[styles.tableCell, styles.tableCellHeader, { width: COLUMN_WIDTHS.ListNumber }]}
        >
          List #
        </Text>
        <Text
          style={[styles.tableCell, styles.tableCellHeader, { width: COLUMN_WIDTHS.Status }]}
        >
          Status
        </Text>
        <Text
          style={[styles.tableCell, styles.tableCellHeader, { width: COLUMN_WIDTHS.Issuer }]}
        >
          Issuer
        </Text>
        <Text
          style={[styles.tableCell, styles.tableCellHeader, { width: COLUMN_WIDTHS.PrintDate }]}
        >
          Print Date
        </Text>
        <Text
          style={[styles.tableCell, styles.tableCellHeader, { width: COLUMN_WIDTHS.JobDesignation }]}
        >
          Job
        </Text>
        <Text
          style={[styles.tableCell, styles.tableCellHeader, { width: COLUMN_WIDTHS.Site }]}
        >
          Site
        </Text>
        <Text
          style={[styles.tableCell, styles.tableCellHeader, { width: COLUMN_WIDTHS.Interval }]}
        >
          Interval
        </Text>
        <Text
          style={[styles.tableCell, styles.tableCellHeader, { width: COLUMN_WIDTHS.Completed }]}
        >
          Completed
        </Text>
      </View>

      {/* Table Data Rows */}
      <FlatList
        data={allChanges}
        renderItem={renderTableRow}
        keyExtractor={(item, index) => `${item.ListNumber}-${index}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: RADIUS.lg,
    borderBottomRightRadius: RADIUS.lg,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  tableHeaderContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tableCell: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    fontSize: 12,
    color: COLORS.text,
  },
  tableCellHeader: {
    fontWeight: '700',
    color: COLORS.white,
    backgroundColor: COLORS.primary,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  tableRowEven: {
    backgroundColor: '#f9f9f9',
  },
  tableRowOdd: {
    backgroundColor: COLORS.white,
  },
  listContent: {
    paddingHorizontal: 0,
  },
});
