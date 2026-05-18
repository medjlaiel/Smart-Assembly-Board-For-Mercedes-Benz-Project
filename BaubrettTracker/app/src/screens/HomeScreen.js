/**
 * HomeScreen.js
 * Landing screen content - global header is in BottomTabNavigator
 */
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  useColorScheme,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS, RADIUS, SHADOW } from '../assets/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLOR_CARD_WIDTH = 200;
const COLOR_CARD_HEIGHT = 130;
const COLOR_CARD_GAP = 12;
const CAROUSEL_SNAP_INTERVAL = COLOR_CARD_WIDTH + COLOR_CARD_GAP;

function ColoredCarouselCard({ item }) {
  return (
    <TouchableOpacity
      style={[styles.colorCard, { backgroundColor: item.color }]}
      onPress={item.onPress}
      activeOpacity={0.9}
    >
      <Icon name={item.icon} size={28} color="white" />
      <View style={styles.colorCardBottom}>
        <View>
          <Text style={styles.colorCardTitle} numberOfLines={1}>{item.title}</Text>
          {item.badge && <Text style={styles.colorCardSubtitle}>{item.badge}</Text>}
        </View>
        <Icon name="chevron-right" size={20} color="white" />
      </View>
    </TouchableOpacity>
  );
}

function BentoWideCard({ item, borderColor, iconBgColor }) {
  return (
    <TouchableOpacity
      style={[styles.bentoCard, styles.bentoWide, { borderColor }]}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.bentoIconBox, { backgroundColor: iconBgColor }, styles.bentoWideIcon]}>
        <Icon name={item.icon} size={28} color={item.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.bentoTitle} numberOfLines={1}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );
}

function BentoSmallCard({ item, borderColor, iconBgColor }) {
  return (
    <TouchableOpacity
      style={[styles.bentoCard, styles.bentoSmall, { borderColor }]}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.bentoIconBox, { backgroundColor: iconBgColor }, styles.bentoSmallIcon]}>
        <Icon name={item.icon} size={28} color={item.color} />
      </View>
      <View style={{ alignItems: 'center' }}>
        <Text style={[styles.bentoTitle, { textAlign: 'center' }]} numberOfLines={2}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const allActions = useMemo(() => [
    {
      id: 'save', icon: 'save-alt', title: t('home.saveBaubrett.title'),
      color: COLORS.primary, onPress: () => navigation.navigate('SaveScanBaubrett'), badge: 'NEW',
    },
    {
      id: 'consult', icon: 'search', title: t('home.consult.title', 'Consult'),
      color: COLORS.accent, onPress: () => navigation.navigate('ConsultScan'),
    },
    {
      id: 'search', icon: 'find-in-page', title: t('home.search.title'),
      color: COLORS.success, onPress: () => navigation.navigate('Search'),
    },
    {
      id: 'history', icon: 'history', title: t('home.history.title'),
      color: COLORS.warning, onPress: () => navigation.navigate('History'),
    },
    {
      id: 'approval', icon: 'build', title: 'Approval Status',
      color: COLORS.info || '#2196F3', onPress: () => navigation.navigate('TechChanges'),
    },
    {
      id: 'zones', icon: 'location-city', title: t('home.zones.title'),
      color: COLORS.success, onPress: () => navigation.navigate('ZonesList'),
    },
    {
      id: 'protocols', icon: 'description', title: 'Measurement Protocols',
      color: COLORS.primaryDark, onPress: () => navigation.navigate('MeasurementProtocols'),
    },
    {
      id: 'statistics', icon: 'bar-chart', title: t('statistics.title'),
      color: COLORS.primaryDark, onPress: () => navigation.navigate('Statistics'),
    },
    {
      id: 'upload', icon: 'file-upload', title: 'Upload Documents',
      color: COLORS.secondary || '#FF9800', onPress: () => navigation.navigate('UploadXlsx'),
    },
  ], [t, navigation]);

  const carouselActions = useMemo(() => {
    const colors = ['#1D9E75', '#534AB7', '#D85A30', '#BA7517'];
    return allActions.slice(0, 4).map((item, idx) => ({ ...item, color: colors[idx] }));
  }, [allActions]);

  const bentoActions = useMemo(() => allActions.slice(4), [allActions]);

  const bentoBorderColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';
  const iconBgColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.07)';

  const [bentoWide1, bentoSmall1, bentoSmall2, bentoWide2, bentoWide3] = bentoActions;

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Quick Actions</Text>
      </View>

      <View style={styles.carouselContainer}>
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          snapToInterval={CAROUSEL_SNAP_INTERVAL}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {carouselActions.map((item) => (
            <ColoredCarouselCard key={item.id} item={item} />
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Explore</Text>
      </View>

      <View style={styles.bentoGrid}>
        {bentoWide1 && (
          <View style={styles.bentoRow}>
            <BentoWideCard item={bentoWide1} borderColor={bentoBorderColor} iconBgColor={iconBgColor} />
          </View>
        )}
        {bentoSmall1 && bentoSmall2 && (
          <View style={styles.bentoRow}>
            <BentoSmallCard item={bentoSmall1} borderColor={bentoBorderColor} iconBgColor={iconBgColor} />
            <BentoSmallCard item={bentoSmall2} borderColor={bentoBorderColor} iconBgColor={iconBgColor} />
          </View>
        )}
        {bentoWide2 && (
          <View style={styles.bentoRow}>
            <BentoWideCard item={bentoWide2} borderColor={bentoBorderColor} iconBgColor={iconBgColor} />
          </View>
        )}
        {bentoWide3 && (
          <View style={styles.bentoRow}>
            <BentoWideCard item={bentoWide3} borderColor={bentoBorderColor} iconBgColor={iconBgColor} />
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 Baubrett Tracker</Text>
        <Text style={styles.footerVersion}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 40, paddingTop: 8 },
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionHeader: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  carouselContainer: { marginVertical: 10 },
  colorCard: {
    width: COLOR_CARD_WIDTH, height: COLOR_CARD_HEIGHT, borderRadius: 20,
    padding: 12, justifyContent: 'space-between', alignItems: 'flex-start',
    marginRight: COLOR_CARD_GAP, ...SHADOW.small,
  },
  colorCardBottom: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-end', width: '100%',
  },
  colorCardTitle: { color: 'white', fontWeight: 'bold', fontSize: 16, flexShrink: 1 },
  colorCardSubtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 },
  bentoGrid: { paddingHorizontal: 16, marginTop: 8, marginBottom: 20 },
  bentoRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  bentoCard: { borderWidth: 1, borderRadius: 18, backgroundColor: COLORS.surface, overflow: 'hidden' },
  bentoWide: {
    flex: 1, height: 90, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10,
  },
  bentoSmall: {
    flex: 1, height: 100, flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: 12,
  },
  bentoIconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  bentoWideIcon: { marginRight: 12 },
  bentoSmallIcon: { marginBottom: 8 },
  bentoTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  footer: { alignItems: 'center', marginTop: 32, paddingTop: 20, borderTopWidth: 1, borderTopColor: COLORS.border + '60' },
  footerText: { fontSize: 12, color: COLORS.text3, marginBottom: 4 },
  footerVersion: { fontSize: 11, color: COLORS.text3, opacity: 0.7 },
});