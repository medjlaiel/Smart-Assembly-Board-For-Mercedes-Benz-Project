/**
 * MeasurementProtocolsScreen.js
 * Displays all measurement protocols grouped by FP-NO in expandable cards.
 */
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, RADIUS, SHADOW } from '../assets/theme';
import { getAllFPNumbers, getProtocolByFPNO } from '../services/mesProtocolsService';

export default function MeasurementProtocolsScreen({ navigation }) {
  const { t } = useTranslation();
  const [expandedFP, setExpandedFP] = useState(null);
  
  const fpNumbers = useMemo(() => getAllFPNumbers().sort(), []);

  const toggleExpanded = (fpNo) => {
    setExpandedFP(expandedFP === fpNo ? null : fpNo);
  };

  const renderProtocolLine = ({ item }) => (
    <View style={styles.lineItem}>
      <View style={styles.lineIndexBadge}>
        <Text style={styles.lineIndexText}>#{item.index}</Text>
      </View>
      <View style={styles.lineContent}>
        <Text style={styles.branche}>{item.branche}</Text>
        <View style={styles.lineDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Exigences:</Text>
            <Text style={styles.detailValue}>{item.exigences || '-'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Déviation:</Text>
            <Text style={styles.detailValue}>{item.deviation || '-'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Faisceau:</Text>
            <Text style={styles.detailValue}>{item.faisceau || '-'}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderFPCard = ({ item: fpNo }) => {
    const protocol = getProtocolByFPNO(fpNo);
    const isExpanded = expandedFP === fpNo;

    return (
      <View style={styles.fpCard}>
        <TouchableOpacity
          style={styles.fpHeader}
          activeOpacity={0.7}
          onPress={() => toggleExpanded(fpNo)}
        >
          <View style={styles.fpHeaderContent}>
            <Text style={styles.fpNumber}>{fpNo}</Text>
            {protocol && (
              <Text style={styles.lineCount}>
                {protocol.lines?.length || 0} lines
              </Text>
            )}
          </View>
          <Icon
            name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
            size={24}
            color={COLORS.primary}
          />
        </TouchableOpacity>

        {isExpanded && protocol?.lines && (
          <FlatList
            data={protocol.lines}
            renderItem={renderProtocolLine}
            keyExtractor={(item) => `${fpNo}-${item.index}`}
            scrollEnabled={false}
            style={styles.linesList}
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>{t('database.title', 'Measurement Protocols')}</Text>
        <Text style={styles.headerSubtitle}>
          {t('database.subtitle', { count: fpNumbers.length })}
        </Text>
      </View>

      {/* FP-NO List */}
      <FlatList
        data={fpNumbers}
        renderItem={renderFPCard}
        keyExtractor={(item) => item}
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
  listContent: {
    padding: 16,
    gap: 12,
  },
  fpCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  fpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.surface,
  },
  fpHeaderContent: {
    flex: 1,
  },
  fpNumber: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.primary,
  },
  lineCount: {
    fontSize: 12,
    color: COLORS.text2,
    marginTop: 2,
  },
  linesList: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  lineItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '40',
  },
  lineIndexBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '18',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  lineIndexText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  lineContent: {
    flex: 1,
  },
  branche: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  lineDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: COLORS.text2,
    fontWeight: '600',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
});
