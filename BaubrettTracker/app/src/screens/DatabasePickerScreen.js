/**
 * DatabasePickerScreen.js
 * Shows 3 database options: MES Protocols, MyDataBase, and Tech Changes.
 * User picks one to view its contents.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { COLORS, RADIUS, SHADOW } from '../assets/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

const databases = [
  {
    key: 'MyDataBase',
    title: 'MyDataBase',
    subtitle: 'Baubrett parts & accessories',
    icon: 'inventory-2',
    color: '#20B2AA',
    screen: 'Database',
  },
  {
    key: 'MESProtocols',
    title: 'MES Protocols',
    subtitle: 'Measurement protocols by FP-NO',
    icon: 'straighten',
    color: '#6366F1',
    screen: 'MeasurementProtocols',
  },
  {
    key: 'TechChanges',
    title: 'Tech Changes',
    subtitle: 'Technical changes & modifications',
    icon: 'engineering',
    color: '#F59E0B',
    screen: 'TechChanges',
  },
];

export default function DatabasePickerScreen({ navigation }) {
  const { t } = useTranslation();

  const handleSelect = (db) => {
    navigation.navigate(db.screen);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>
          {t('database.title', 'Database')}
        </Text>
        <Text style={styles.headerSubtitle}>
          {t('database.pickOne', 'Select a database to browse')}
        </Text>
      </View>

      {/* Database Cards */}
      <View style={styles.cardsContainer}>
        {databases.map((db) => (
          <TouchableOpacity
            key={db.key}
            style={styles.card}
            activeOpacity={0.75}
            onPress={() => handleSelect(db)}
          >
            <View style={[styles.iconCircle, { backgroundColor: db.color + '18' }]}>
              <Icon name={db.icon} size={32} color={db.color} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{db.title}</Text>
              <Text style={styles.cardSubtitle}>{db.subtitle}</Text>
            </View>
            <Icon name="chevron-right" size={24} color={COLORS.text3} />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: RADIUS.lg,
    borderBottomRightRadius: RADIUS.lg,
    ...SHADOW.medium,
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
  cardsContainer: {
    padding: 20,
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: 20,
    ...SHADOW.medium,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.text2,
    marginTop: 2,
  },
});
