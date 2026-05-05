/**
 * HomeScreen.js
 * Modernized landing screen with improved design and organization
 */
import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { COLORS, RADIUS, SHADOW } from '../assets/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NotificationCenter from '../components/NotificationCenter';
import DrawerMenu from '../components/DrawerMenu';
import { loadTrackingRecords } from '../services/trackingService';
import { getValidZoneKeys } from '../data/zones';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Colored Carousel constants
const COLOR_CARD_WIDTH = 200;
const COLOR_CARD_HEIGHT = 130;
const COLOR_CARD_GAP = 12;
const CAROUSEL_SNAP_INTERVAL = COLOR_CARD_WIDTH + COLOR_CARD_GAP;

// ── Animated Header Component ──────────────────────────────────────
function Header({ scrollY }) {
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.95],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
      <View style={styles.headerContent}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Icon name="inventory" size={32} color={COLORS.white} />
          </View>
          <View>
            <Text style={styles.appName}>Baubrett Tracker</Text>
            <Text style={styles.appVersion}>v1.0.0</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

// ── Colored Carousel Card ──────────────────────────────────────────
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
          <Text style={styles.colorCardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          {item.badge && (
            <Text style={styles.colorCardSubtitle}>{item.badge}</Text>
          )}
        </View>
        <Icon name="chevron-right" size={20} color="white" />
      </View>
    </TouchableOpacity>
  );
}

// ── Bento Wide Card ─────────────────────────────────────────────────
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
        <Text style={styles.bentoTitle} numberOfLines={1}>
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ── Bento Small Card ────────────────────────────────────────────────
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
        <Text style={[styles.bentoTitle, { textAlign: 'center' }]} numberOfLines={2}>
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ── Main Component ────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const scrollY = useRef(new Animated.Value(0)).current;
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [allRecords, setAllRecords] = useState([]);

  // All action items for carousel
  const allActions = useMemo(() => [
    {
      id: 'save',
      icon: 'save-alt',
      title: t('home.saveBaubrett.title'),
      color: COLORS.primary,
      onPress: () => navigation.navigate('SaveScanBaubrett'),
      badge: 'NEW',
    },
    {
      id: 'consult',
      icon: 'search',
      title: t('home.consult.title', 'Consult'),
      color: COLORS.accent,
      onPress: () => navigation.navigate('ConsultScan'),
    },
    {
      id: 'search',
      icon: 'find-in-page',
      title: t('home.search.title'),
      color: COLORS.success,
      onPress: () => navigation.navigate('Search'),
    },
    {
      id: 'history',
      icon: 'history',
      title: t('home.history.title'),
      color: COLORS.warning,
      onPress: () => navigation.navigate('History'),
    },
    {
      id: 'approval',
      icon: 'build',
      title: 'Approval Status',
      color: COLORS.info || '#2196F3',
      onPress: () => navigation.navigate('TechChanges'),
    },
    {
      id: 'protocols',
      icon: 'description',
      title: 'Measurement Protocols',
      color: COLORS.primaryDark,
      onPress: () => navigation.navigate('MeasurementProtocols'),
    },
    {
      id: 'statistics',
      icon: 'bar-chart',
      title: t('statistics.title'),
      color: COLORS.primaryDark,
      onPress: () => navigation.navigate('Statistics'),
    },
    {
      id: 'upload',
      icon: 'file-upload',
      title: 'Upload Documents',
      color: COLORS.secondary || '#FF9800',
      onPress: () => navigation.navigate('UploadXlsx'),
    },
  ], [t, navigation]);

  // Split actions: first 4 for colored carousel, rest for bento grid
  const carouselActions = useMemo(() => {
    const colors = ['#1D9E75', '#534AB7', '#D85A30', '#BA7517'];
    return allActions.slice(0, 4).map((item, idx) => ({ ...item, color: colors[idx] }));
  }, [allActions]);

  const bentoActions = useMemo(() => allActions.slice(4), [allActions]);

  // Dynamic colors for bento cards based on theme
  const bentoBorderColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';
  const iconBgColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.07)';

  // Load tracking records for notification count
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const data = await loadTrackingRecords();
      setAllRecords(data);
    } catch (err) {
      console.error('Failed to load tracking records:', err);
    }
  };

  // Calculate incomplete UFB count for badge
  const incompleteUFBCount = useMemo(() => {
    const ufbKeys = getValidZoneKeys().filter((key) => key.startsWith('UFB'));
    const ufbStats = {};

    ufbKeys.forEach((key) => {
      ufbStats[key] = 0;
    });

    allRecords.forEach((record) => {
      const zone = String(record.Zone).trim();
      if (ufbKeys.includes(zone)) {
        ufbStats[zone] = (ufbStats[zone] || 0) + 1;
      }
    });

    const incomplete = ufbKeys.filter((key) => (ufbStats[key] || 0) < 8).length;
    return incomplete;
  }, [allRecords]);

  // Set header options
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity style={styles.headerActionBtn} onPress={() => setShowDrawer(true)}>
          <Icon name="menu" size={24} color={COLORS.white} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View style={styles.headerActionsContainer}>
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() => setShowNotifications(true)}
          >
            <Icon name="notifications" size={24} color={COLORS.white} />
            {incompleteUFBCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{incompleteUFBCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() => navigation.navigate('Statistics')}
          >
            <Icon name="bar-chart" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, incompleteUFBCount]);

  // Prepare bento items for layout
  const bentoWide1 = bentoActions[0];
  const bentoSmall1 = bentoActions[1];
  const bentoSmall2 = bentoActions[2];
  const bentoWide2 = bentoActions[3];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Animated.ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          <Header scrollY={scrollY} />

          {/* Section 1: Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Quick Actions</Text>
          </View>

          {/* Colored Carousel */}
          <View style={styles.carouselContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={CAROUSEL_SNAP_INTERVAL}
              decelerationRate="fast"
              contentContainerStyle={{ paddingHorizontal: 16 }}
            >
              {carouselActions.map((item) => (
                <ColoredCarouselCard key={item.id} item={item} />
              ))}
            </ScrollView>
          </View>

          {/* Section 2: Explore */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Explore</Text>
          </View>

          {/* Bento Grid */}
          <View style={styles.bentoGrid}>
            {bentoWide1 && (
              <View style={styles.bentoRow}>
                <BentoWideCard
                  item={bentoWide1}
                  borderColor={bentoBorderColor}
                  iconBgColor={iconBgColor}
                />
              </View>
            )}
            {bentoSmall1 && bentoSmall2 && (
              <View style={styles.bentoRow}>
                <BentoSmallCard
                  item={bentoSmall1}
                  borderColor={bentoBorderColor}
                  iconBgColor={iconBgColor}
                />
                <BentoSmallCard
                  item={bentoSmall2}
                  borderColor={bentoBorderColor}
                  iconBgColor={iconBgColor}
                />
              </View>
            )}
            {bentoWide2 && (
              <View style={styles.bentoRow}>
                <BentoWideCard
                  item={bentoWide2}
                  borderColor={bentoBorderColor}
                  iconBgColor={iconBgColor}
                />
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2025 Baubrett Tracker</Text>
            <Text style={styles.footerVersion}>Version 1.0.0</Text>
          </View>
        </Animated.ScrollView>

        {/* Floating Chatbot Button */}
        <ChatbotFAB onPress={() => navigation.navigate('Chatbot')} />
      </View>

      {/* Notification Center Modal */}
      <NotificationCenter
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        badgeCount={incompleteUFBCount}
      />

      {/* Drawer Menu */}
      <DrawerMenu
        visible={showDrawer}
        onClose={() => setShowDrawer(false)}
        navigation={navigation}
      />
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, position: 'relative' },
  scrollContent: { paddingBottom: 40 },

  // Header
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
    ...SHADOW.medium,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    position: 'relative',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  appName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.3,
  },
  appVersion: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },

  // Section
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },

  // Colored Carousel
  carouselContainer: {
    marginVertical: 10,
  },
  colorCard: {
    width: COLOR_CARD_WIDTH,
    height: COLOR_CARD_HEIGHT,
    borderRadius: 20,
    padding: 12,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginRight: COLOR_CARD_GAP,
    ...SHADOW.small,
  },
  colorCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%',
  },
  colorCardTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    flexShrink: 1,
  },
  colorCardSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 2,
  },

  // Bento Grid
  bentoGrid: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  bentoCard: {
    borderWidth: 1,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  },
  bentoWide: {
    flex: 1,
    height: 90,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  bentoSmall: {
    flex: 1,
    height: 100,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  bentoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bentoWideIcon: {
    marginRight: 12,
  },
  bentoSmallIcon: {
    marginBottom: 8,
  },
  bentoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },

  // Notification Badge
  notifBadge: {
    position: 'absolute',
    top: -2,
    right: 0,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notifBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },

  // Footer
  footer: {
    alignItems: 'center',
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border + '60',
  },
  footerText: {
    fontSize: 12,
    color: COLORS.text3,
    marginBottom: 4,
  },
  footerVersion: {
    fontSize: 11,
    color: COLORS.text3,
    opacity: 0.7,
  },
});