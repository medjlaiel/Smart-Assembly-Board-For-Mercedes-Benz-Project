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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { COLORS, RADIUS, SHADOW, FONT_SIZES } from '../assets/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NotificationCenter from '../components/NotificationCenter';
import { loadTrackingRecords } from '../services/trackingService';
import { getValidZoneKeys } from '../data/zones';

const { width } = Dimensions.get('window');

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

// ── Action Card Component ──────────────────────────────────────────
function ActionCard({ icon, title, subtitle, color, onPress, badge }) {
  return (
    <TouchableOpacity
      style={[styles.actionCard, { borderLeftColor: color }, SHADOW.small]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.actionIconContainer, { backgroundColor: color + '15' }]}>
        <Icon name={icon} size={28} color={color} />
      </View>
      <View style={styles.actionContent}>
        <View style={styles.actionHeader}>
          <Text style={styles.actionTitle}>{title}</Text>
          {badge && <View style={[styles.actionBadge, { backgroundColor: color }]}>
            <Text style={styles.actionBadgeText}>{badge}</Text>
          </View>}
        </View>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <Icon name="chevron-right" size={24} color={COLORS.text3} />
    </TouchableOpacity>
  );
}

// ── Main Component ────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const { t } = useTranslation();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [showNotifications, setShowNotifications] = useState(false);
  const [allRecords, setAllRecords] = useState([]);

  // Load tracking records for notification count
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
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

  // Set header options with notification bell and statistics icon
  useEffect(() => {
    navigation.setOptions({
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

  return (
    <SafeAreaView style={styles.safe}>
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

        {/* Main Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('home.primaryActions')}</Text>
          
          <ActionCard
            icon="save-alt"
            title={t('home.saveBaubrett.title')}
            subtitle={t('home.saveBaubrett.subtitle')}
            color={COLORS.primary}
            onPress={() => navigation.navigate('SaveScanBaubrett')}
            badge="NEW"
          />

          <ActionCard
            icon="search"
            title={t('home.consultBaubrett.title')}
            subtitle={t('home.consultBaubrett.subtitle')}
            color={COLORS.accent}
            onPress={() => navigation.navigate('ConsultScan')}
          />

          <ActionCard
            icon="find-in-page"
            title={t('home.search.title')}
            subtitle={t('home.search.subtitle')}
            color={COLORS.success}
            onPress={() => navigation.navigate('Search')}
          />
        </View>

        {/* Records Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('home.records')}</Text>

          <ActionCard
            icon="history"
            title={t('home.history.title')}
            subtitle={t('home.history.subtitle')}
            color={COLORS.warning}
            onPress={() => navigation.navigate('History')}
          />

          <ActionCard
            icon="bar-chart"
            title={t('home.statistics.title')}
            subtitle={t('home.statistics.subtitle')}
            color={COLORS.primaryDark}
            onPress={() => navigation.navigate('Statistics')}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => navigation.replace('Login')}
          activeOpacity={0.8}
        >
          <Icon name="logout" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>{t('home.logout')}</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 Baubrett Tracker</Text>
          <Text style={styles.footerVersion}>Version 1.0.0</Text>
        </View>
      </Animated.ScrollView>

      {/* Notification Center Modal */}
      <NotificationCenter
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        badgeCount={incompleteUFBCount}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  
  scrollContent: {
    paddingBottom: 40,
  },

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
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text3,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginLeft: 4,
  },

  // Action Cards
  actionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderLeftWidth: 4,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    ...SHADOW.small,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginRight: 8,
  },
  actionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  actionBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  actionSubtitle: {
    fontSize: 13,
    color: COLORS.text2,
    lineHeight: 18,
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

  // Logout Button
  logoutButton: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 32,
    borderWidth: 1.5,
    borderColor: COLORS.error + '40',
    ...SHADOW.small,
  },
  logoutText: {
    fontSize: FONT_SIZES.button,
    fontWeight: '600',
    color: COLORS.error,
    marginLeft: 10,
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