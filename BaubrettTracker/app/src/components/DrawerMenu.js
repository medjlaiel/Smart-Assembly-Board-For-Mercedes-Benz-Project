/**
 * DrawerMenu.js
 * Left side drawer with elegantly styled menu items
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS, RADIUS, SHADOW, FONT_SIZES } from '../assets/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../contexts/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = 320;

export default function DrawerMenu({ visible, onClose, navigation }) {
  const { t } = useTranslation();
  const { currentUser, logout } = useAuth();
  const translateX = new Animated.Value(-DRAWER_WIDTH);

  // Expanded section state: 'profile' | 'about' | null
  const [expandedSection, setExpandedSection] = useState(null);

  // About sub-items expansion state
  const [expandedAboutItem, setExpandedAboutItem] = useState(null);

  // Animate drawer in/out
  useEffect(() => {
    if (visible) {
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateX, {
        toValue: -DRAWER_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }).start();
      // Reset states when closing
      setExpandedSection(null);
      setExpandedAboutItem(null);
    }
  }, [visible]);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
    // Collapse about sub-items when collapsing profile
    if (section !== 'profile') {
      setExpandedAboutItem(null);
    }
  };

  const toggleAboutItem = (item) => {
    // If navigating to HowToUse, don't toggle, just navigate
    if (item === 'howto') {
      navigation.navigate('HowToUse');
      return;
    }
    setExpandedAboutItem(expandedAboutItem === item ? null : item);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    Alert.alert(
      t('drawer.logoutConfirmTitle', 'Logout'),
      t('drawer.logoutConfirmMessage', 'Are you sure you want to logout?'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.logout'),
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.replace('Login');
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleChangePassword = () => {
    onClose();
    navigation.navigate('ChangePassword');
  };

  const handleBaubrettList = () => {
    onClose();
    navigation.navigate('BaubrettList');
  };

  const handleDatabase = () => {
    onClose();
    navigation.navigate('DatabasePicker');
  };

  const handleAdminDashboard = () => {
    onClose();
    navigation.navigate('AdminDashboard');
  };

  const handleAddUser = () => {
    onClose();
    navigation.navigate('AddUserScreen');
  };

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: visible ? 1 : 0,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.overlayTouchable}
        activeOpacity={1}
        onPress={onClose}
      />
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View
          style={[
            styles.drawerContainer,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── PROFILE SECTION ───────────────────────────────────── */} 
            <View style={styles.sectionContainer}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => toggleSection('profile')}
                activeOpacity={0.7}
              >
                <View style={styles.iconContainer}>
                  <Icon name="account-circle" size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.sectionTitle}>Profile</Text>
                <Icon
                  name={expandedSection === 'profile' ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                  size={20}
                  color={COLORS.text3}
                />
              </TouchableOpacity>

              {expandedSection === 'profile' && (
                <View style={styles.sectionContent}>
                  <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                      <Text style={styles.avatarText}>{getInitials(currentUser?.fullName)}</Text>
                    </View>
                    <View style={styles.profileInfo}>
                      <Text style={styles.userName}>{currentUser?.fullName || t('drawer.unknownUser', 'User')}</Text>
                      <Text style={styles.userEmail}>{currentUser?.email || ''}</Text>
                      <Text style={styles.userId}>ID: {currentUser?.id || ''}</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* ── BAUBRETT SECTION ─────────────────────────────────── */} 
            <View style={styles.sectionContainer}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleBaubrettList}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemIconBox}>
                  <Icon name="inventory" size={22} color={COLORS.primary} />
                </View>
                <Text style={styles.menuItemText}>Baubrett</Text>
                <Icon name="chevron-right" size={20} color={COLORS.text3} />
              </TouchableOpacity>
            </View>

            {/* ── DATABASE SECTION ─────────────────────────────────── */} 
            <View style={styles.sectionContainer}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleDatabase}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemIconBox}>
                  <Icon name="storage" size={22} color={COLORS.primary} />
                </View>
                <Text style={styles.menuItemText}>Database</Text>
                <Icon name="chevron-right" size={20} color={COLORS.text3} />
              </TouchableOpacity>
            </View>

            {/* ── ADMIN DASHBOARD SECTION (ADMIN ONLY) ─────────────── */} 
            {currentUser?.role === 'admin' && (
              <View style={styles.sectionContainer}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleAdminDashboard}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuItemIconBox, styles.adminIconBox]}>
                    <Icon name="admin-panel-settings" size={22} color={COLORS.primary} />
                  </View>
                  <Text style={styles.menuItemText}>Admin Dashboard</Text>
                  <Icon name="chevron-right" size={20} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            )}

            {/* ── ADD USER SECTION (ADMIN ONLY) ────────────────────── */} 
            {currentUser?.role === 'admin' && (
              <View style={styles.sectionContainer}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleAddUser}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuItemIconBox, styles.adminIconBox]}>
                    <Icon name="person-add" size={22} color={COLORS.primary} />
                  </View>
                  <Text style={styles.menuItemText}>
                    {t('admin.addUserAccount', 'Add User Account')}
                  </Text>
                  <Icon name="chevron-right" size={20} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            )}

            {/* ── ABOUT SECTION ────────────────────────────────────── */} 
            <View style={styles.sectionContainer}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => toggleSection('about')}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemIconBox}>
                  <Icon name="info" size={22} color={COLORS.primary} />
                </View>
                <Text style={styles.menuItemText}>About</Text>
                <Icon
                  name={expandedSection === 'about' ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                  size={20}
                  color={COLORS.text3}
                />
              </TouchableOpacity>

              {expandedSection === 'about' && (
                <View style={styles.sectionContent}>
                  {/* App Version */}
                  <TouchableOpacity
                    style={styles.aboutItem}
                    onPress={() => toggleAboutItem('version')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.aboutItemIconBox}>
                      <Icon name="apps" size={18} color={COLORS.text2} />
                    </View>
                    <Text style={styles.aboutItemTitle}>App Version</Text>
                    <Icon
                      name={expandedAboutItem === 'version' ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                      size={18}
                      color={COLORS.text3}
                    />
                  </TouchableOpacity>
                  {expandedAboutItem === 'version' && (
                    <View style={styles.aboutItemContent}>
                      <Text style={styles.aboutText}>v1.0.0</Text>
                      <Text style={styles.aboutSubtext}>Built with React Native</Text>
                      <Text style={[styles.aboutSubtext, styles.disclaimer]}>For internal Mercedes-Benz use only</Text>
                    </View>
                  )}

                  {/* Contact */}
                  <TouchableOpacity
                    style={styles.aboutItem}
                    onPress={() => toggleAboutItem('contact')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.aboutItemIconBox}>
                      <Icon name="email" size={18} color={COLORS.text2} />
                    </View>
                    <Text style={styles.aboutItemTitle}>Contact</Text>
                    <Icon
                      name={expandedAboutItem === 'contact' ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                      size={18}
                      color={COLORS.text3}
                    />
                  </TouchableOpacity>
                  {expandedAboutItem === 'contact' && (
                    <View style={styles.aboutItemContent}>
                      <Text style={styles.aboutText}>support@baubrett-tracker.mercedes-benz.com</Text>
                      <Text style={styles.aboutSubtext}>Mercedes-Benz Assembly — Digital Tools Team</Text>
                    </View>
                  )}

                  {/* How to Use */}
                  <TouchableOpacity
                    style={styles.aboutItem}
                    onPress={() => toggleAboutItem('howto')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.aboutItemIconBox}>
                      <Icon name="help-outline" size={18} color={COLORS.text2} />
                    </View>
                    <Text style={styles.aboutItemTitle}>How to Use</Text>
                    <Icon name="chevron-right" size={18} color={COLORS.text3} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* ── LOGOUT BUTTON ────────────────────────────────────── */} 
            <View style={styles.logoutSection}>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <View style={styles.logoutIconBox}>
                  <Icon name="logout" size={20} color={COLORS.error} />
                </View>
                <Text style={styles.logoutText}>{t('auth.logout', 'Logout')}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
  },
  overlayTouchable: {
    flex: 1,
  },
  keyboardAvoid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-start',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  drawerContainer: {
    width: DRAWER_WIDTH,
    backgroundColor: COLORS.surface,
    height: '100%',
    ...SHADOW.large,
  },
  // Section container
  sectionContainer: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '40',
  },
  // Menu item (consistent for all main items)
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.surface,
    ...SHADOW.small,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  adminIconBox: {
    backgroundColor: COLORS.primary + '20',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
    flex: 1,
  },
  // Section header (for profile and about with expand/collapse)
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.surface,
  },
  sectionContent: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  // Profile section
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 4,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    ...SHADOW.small,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: COLORS.text2,
    marginBottom: 2,
  },
  userId: {
    fontSize: 11,
    color: COLORS.text3,
  },
  // Change password button (inside profile)
  menuItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.primary + '40',
    borderRadius: RADIUS.md,
    gap: 10,
  },

  // About section items
  aboutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '30',
  },
  aboutItemIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  aboutItemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    flex: 1,
  },
  aboutItemContent: {
    paddingBottom: 16,
    paddingLeft: 44,
  },
  aboutText: {
    fontSize: 14,
    color: COLORS.text2,
    marginBottom: 2,
  },
  aboutSubtext: {
    fontSize: 13,
    color: COLORS.text3,
    marginTop: 4,
    lineHeight: 18,
  },
  disclaimer: {
    color: COLORS.error,
    fontStyle: 'italic',
    marginTop: 8,
  },

  // Logout Section
  logoutSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border + '60',
    backgroundColor: COLORS.surface,
    marginTop: 'auto',
  },
  logoutButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.error + '50',
    borderRadius: RADIUS.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.small,
  },
  logoutIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.error + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoutText: {
    fontSize: FONT_SIZES.button,
    fontWeight: '600',
    color: COLORS.error,
  },
});