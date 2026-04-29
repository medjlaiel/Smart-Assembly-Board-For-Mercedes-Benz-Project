/**
 * DrawerMenu.js
 * Left side drawer with accordion/expandable sections: Profile, Baubrett, Assistant, Database, About, Logout
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

  // Expanded section state: 'profile' | 'about' | null (only one expanded at a time)
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
    onClose(); // Close drawer
    navigation.navigate('ChangePassword');
  };

  const handleBaubrettList = () => {
    onClose(); // Close drawer
    navigation.navigate('BaubrettList');
  };

  const handleChatbot = () => {
    onClose(); // Close drawer
    navigation.navigate('Chatbot');
  };

  const handleDatabase = () => {
    onClose(); // Close drawer
    navigation.navigate('DatabasePicker');
  };

  const handleAdminDashboard = () => {
    onClose(); // Close drawer
    navigation.navigate('AdminDashboard');
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
                <Text style={styles.sectionTitle}>Profile</Text>
                <Icon
                  name={expandedSection === 'profile' ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                  size={24}
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
                  <TouchableOpacity style={styles.changePasswordBtn} onPress={handleChangePassword} activeOpacity={0.7}>
                    <Icon name="lock" size={18} color={COLORS.primary} />
                    <Text style={styles.changePasswordText}>{t('drawer.changePassword', 'Change Password')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* ── BAUBRETT SECTION ─────────────────────────────────── */} 
            <View style={styles.sectionContainer}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={handleBaubrettList}
                activeOpacity={0.7}
              >
                <Text style={styles.sectionTitle}>Baubrett</Text>
                <Icon name="chevron-right" size={20} color={COLORS.text3} />
              </TouchableOpacity>
            </View>

            {/* ── ASSISTANT SECTION ─────────────────────────────────── */} 
            <View style={styles.sectionContainer}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={handleChatbot}
                activeOpacity={0.7}
              >
                <Icon name="smart-toy" size={20} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>Assistant</Text>
                <Icon name="chevron-right" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            {/* ── DATABASE SECTION ─────────────────────────────────── */} 
            <View style={styles.sectionContainer}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={handleDatabase}
                activeOpacity={0.7}
              >
                <Text style={styles.sectionTitle}>Database</Text>
                <Icon name="storage" size={20} color={COLORS.text3} />
              </TouchableOpacity>
            </View>

            {/* ── ADMIN DASHBOARD SECTION (ADMIN ONLY) ─────────────── */} 
            {currentUser?.role === 'admin' && (
              <View style={styles.sectionContainer}>
                <TouchableOpacity
                  style={[styles.sectionHeader, styles.adminSection]}
                  onPress={handleAdminDashboard}
                  activeOpacity={0.7}
                >
                  <Icon name="admin-panel-settings" size={20} color={COLORS.primary} />
                  <Text style={[styles.sectionTitle, styles.adminSectionTitle]}>Admin Dashboard</Text>
                  <Icon name="chevron-right" size={20} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            )}

            {/* ── ABOUT SECTION ────────────────────────────────────── */} 
            <View style={styles.sectionContainer}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => toggleSection('about')}
                activeOpacity={0.7}
              >
                <Text style={styles.sectionTitle}>About</Text>
                <Icon
                  name={expandedSection === 'about' ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                  size={24}
                  color={COLORS.text3}
                />
              </TouchableOpacity>

              {expandedSection === 'about' && (
                <View style={[styles.sectionContent, styles.aboutContent]}>
                  {/* App Version - expandable */} 
                  <TouchableOpacity
                    style={styles.aboutItemHeader}
                    onPress={() => toggleAboutItem('version')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.aboutItemTitle}>App Version</Text>
                    <Icon
                      name={expandedAboutItem === 'version' ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                      size={20}
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

                  {/* Contact - expandable */} 
                  <TouchableOpacity
                    style={styles.aboutItemHeader}
                    onPress={() => toggleAboutItem('contact')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.aboutItemTitle}>Contact</Text>
                    <Icon
                      name={expandedAboutItem === 'contact' ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                      size={20}
                      color={COLORS.text3}
                    />
                  </TouchableOpacity>
                  {expandedAboutItem === 'contact' && (
                    <View style={styles.aboutItemContent}>
                      <Text style={styles.aboutText}>support@baubrett-tracker.mercedes-benz.com</Text>
                      <Text style={styles.aboutSubtext}>Mercedes-Benz Assembly — Digital Tools Team</Text>
                    </View>
                  )}

                  {/* How to Use - navigates to separate screen */} 
                  <TouchableOpacity
                    style={styles.aboutItemHeader}
                    onPress={() => toggleAboutItem('howto')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.aboutItemTitle}>How to Use</Text>
                    <Icon
                      name="chevron-right"
                      size={20}
                      color={COLORS.text3}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* ── LOGOUT BUTTON ────────────────────────────────────── */} 
            <View style={styles.logoutSection}>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Icon name="logout" size={20} color={COLORS.error} />
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
  // Section (accordion) styles
  sectionContainer: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: COLORS.surface,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  sectionContent: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  aboutContent: {
    paddingBottom: 8,
  },
  // Profile section
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.white,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 17,
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
  changePasswordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.md,
    gap: 8,
  },
  changePasswordText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // About section items
  aboutItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  aboutItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  aboutItemContent: {
    paddingBottom: 16,
    paddingLeft: 4,
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
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: 8,
    width: 20,
  },
  stepText: {
    fontSize: 12,
    color: COLORS.text2,
    flex: 1,
    lineHeight: 18,
  },

  // Logout Section
  logoutSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  logoutButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.error + '40',
    borderRadius: RADIUS.md,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.small,
  },
  logoutText: {
    fontSize: FONT_SIZES.button,
    fontWeight: '600',
    color: COLORS.error,
    marginLeft: 10,
  },
  // Admin section styles
  adminSection: {
    backgroundColor: COLORS.primary + '10',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    gap: 12,
  },
  adminSectionTitle: {
    color: COLORS.primary,
    fontWeight: '700',
    flex: 1,
  },
});